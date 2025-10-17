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
  orderBy
} from 'firebase/firestore';

// Get all jobs for current user
export const getUserJobs = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const jobsRef = collection(db, 'users', userId, 'jobs');
    const q = query(jobsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching jobs:', error);
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
    return docRef.id;
  } catch (error) {
    console.error('Error adding calculation:', error);
    throw error;
  }
};

// Create a new job
export const createJob = async (jobData) => {
  try {
    console.log('🔍 Starting createJob...');
    console.log('auth:', auth);
    console.log('auth.currentUser:', auth.currentUser);
    
    const userId = auth.currentUser?.uid;
    console.log('userId extracted:', userId);
    
    if (!userId) {
      console.error('❌ No userId - auth.currentUser is:', auth.currentUser);
      throw new Error('User not authenticated');
    }

    console.log('✅ User authenticated with ID:', userId);
    
    const jobsRef = collection(db, 'users', userId, 'jobs');
    const jobWithTimestamp = {
      ...jobData,
      createdAt: serverTimestamp(),
      status: jobData.status || 'active'
    };

    console.log('📝 Attempting to save job:', jobWithTimestamp);
    const docRef = await addDoc(jobsRef, jobWithTimestamp);
    console.log('✅ Job created with ID:', docRef.id);
    
    return docRef.id;
  } catch (error) {
    console.error('❌ Error in createJob:', error);
    throw error;
  }
};

export const deleteJob = async (jobId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const jobRef = doc(db, 'users', userId, 'jobs', jobId);
    await deleteDoc(jobRef);
  } catch (error) {
    console.error('Error deleting job:', error);
    throw error;
  }
};

export const updateJob = async (jobId, jobData) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const jobRef = doc(db, 'users', userId, 'jobs', jobId);
    await updateDoc(jobRef, {
      ...jobData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating job:', error);
    throw error;
  }
};