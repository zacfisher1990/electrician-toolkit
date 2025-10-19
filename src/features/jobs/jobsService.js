import { db, auth } from '../../firebase/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  serverTimestamp,
  orderBy,
  onSnapshot,
  enableIndexedDbPersistence,
  enableNetwork,
  disableNetwork
} from 'firebase/firestore';

// ============================================
// FIREBASE PERSISTENCE
// ============================================
// Firebase persistence is now initialized in firebase.js
// This keeps the codebase clean and avoids circular dependencies

// ============================================
// LOCALSTORAGE CACHE MANAGEMENT
// ============================================

const CACHE_KEY = 'jobs_cache_v1';
const CACHE_TIMESTAMP_KEY = 'jobs_cache_timestamp_v1';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Save jobs to localStorage (for instant initial load)
const cacheJobs = (jobs, userId) => {
  try {
    const cacheData = {
      userId,
      jobs,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.warn('Failed to cache jobs:', error);
  }
};

// Load jobs from localStorage (instant load)
const loadCachedJobs = (userId) => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const cacheData = JSON.parse(cached);
    
    // Verify cache is for current user
    if (cacheData.userId !== userId) {
      clearJobsCache();
      return null;
    }

    // Check if cache is still valid
    const timestamp = parseInt(localStorage.getItem(CACHE_TIMESTAMP_KEY) || '0');
    const now = Date.now();
    
    if (now - timestamp > CACHE_DURATION) {
      clearJobsCache();
      return null;
    }

    return cacheData.jobs;
  } catch (error) {
    console.warn('Failed to load cached jobs:', error);
    return null;
  }
};

// Clear cache
const clearJobsCache = () => {
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  } catch (error) {
    console.warn('Failed to clear cache:', error);
  }
};

// ============================================
// OPTIMIZED JOB FETCHING (3-TIER APPROACH)
// ============================================

/**
 * TIER 1: Instant load from localStorage cache
 * TIER 2: Load from Firebase's IndexedDB cache (offline support)
 * TIER 3: Fetch from Firebase servers (real-time updates)
 */
export const getUserJobs = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    // TIER 1: Try loading from localStorage first (instant!)
    const cachedJobs = loadCachedJobs(userId);
    if (cachedJobs) {
      console.log('⚡ Loaded jobs from localStorage cache (instant)');
      
      // Fetch fresh data in background and update cache
      fetchAndCacheJobs(userId);
      
      return cachedJobs;
    }

    // TIER 2 & 3: No localStorage cache - fetch from Firebase
    // (Firebase will use its IndexedDB cache if available, or fetch from server)
    console.log('🔄 Fetching jobs from Firebase...');
    return await fetchAndCacheJobs(userId);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
};

// Internal function to fetch and cache
const fetchAndCacheJobs = async (userId) => {
  const jobsRef = collection(db, 'users', userId, 'jobs');
  const q = query(jobsRef, orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  const jobs = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  // Update localStorage cache for next instant load
  cacheJobs(jobs, userId);
  
  return jobs;
};

// ============================================
// REAL-TIME LISTENER (Auto-sync)
// ============================================

/**
 * Subscribe to real-time updates
 * Firebase persistence + real-time listener = automatic offline/online sync
 */
export const subscribeToJobs = (userId, callback) => {
  if (!userId) throw new Error('User not authenticated');

  const jobsRef = collection(db, 'users', userId, 'jobs');
  const q = query(jobsRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const jobs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`📡 Real-time update: ${jobs.length} jobs (from ${snapshot.metadata.fromCache ? 'cache' : 'server'})`);
      
      // Update localStorage cache
      cacheJobs(jobs, userId);
      
      // Call callback with fresh data
      callback(jobs);
    },
    (error) => {
      console.error('Error in real-time listener:', error);
    }
  );
};

// ============================================
// JOB CRUD OPERATIONS
// ============================================

// Create a new job
export const createJob = async (jobData) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const jobsRef = collection(db, 'users', userId, 'jobs');
    const jobWithTimestamp = {
      ...jobData,
      createdAt: serverTimestamp(),
      status: jobData.status || 'active'
    };

    const docRef = await addDoc(jobsRef, jobWithTimestamp);
    
    // Invalidate localStorage cache (real-time listener will update it)
    clearJobsCache();
    
    console.log('✅ Job created:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error creating job:', error);
    throw error;
  }
};

// Update job
export const updateJob = async (jobId, jobData) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const jobRef = doc(db, 'users', userId, 'jobs', jobId);
    await updateDoc(jobRef, {
      ...jobData,
      updatedAt: serverTimestamp()
    });
    
    // Invalidate localStorage cache
    clearJobsCache();
    
    console.log('✅ Job updated:', jobId);
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
};

// Delete job
export const deleteJob = async (jobId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const jobRef = doc(db, 'users', userId, 'jobs', jobId);
    await deleteDoc(jobRef);
    
    // Invalidate localStorage cache
    clearJobsCache();
    
    console.log('✅ Job deleted:', jobId);
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};

// Add calculation to a job
export const addCalculationToJob = async (jobId, calculationData) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const jobRef = doc(db, 'users', userId, 'jobs', jobId);
    const calculationsRef = collection(jobRef, 'calculations');
    
    const calcWithTimestamp = {
      ...calculationData,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(calculationsRef, calcWithTimestamp);
    console.log('✅ Calculation added:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding calculation:', error);
    throw error;
  }
};

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Clear cache manually (useful for logout)
export const clearCache = () => {
  clearJobsCache();
  console.log('🗑️ Cache cleared');
};

// Force network refresh (bypass all caches)
export const forceRefresh = async () => {
  try {
    clearJobsCache();
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');
    
    // Temporarily disable network, then re-enable to force fresh fetch
    await disableNetwork(db);
    await enableNetwork(db);
    
    return await fetchAndCacheJobs(userId);
  } catch (error) {
    console.error('Error forcing refresh:', error);
    throw error;
  }
};