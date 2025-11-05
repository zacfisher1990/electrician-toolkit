import { db, auth } from '../../firebase/firebase';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  serverTimestamp
} from 'firebase/firestore';

/**
 * Job Calendar Assignments Service
 * Manages which jobs are scheduled for which dates
 * Allows jobs to be assigned to multiple dates
 */

// ============================================
// GET JOB ASSIGNMENTS FOR A DATE
// ============================================

/**
 * Get all job assignments for a specific date
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {Array} Array of job assignment objects
 */
export const getJobAssignmentsForDate = async (date) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const assignmentsRef = collection(db, 'users', userId, 'jobCalendarAssignments');
    const q = query(assignmentsRef, where('date', '==', date));
    const querySnapshot = await getDocs(q);
    
    const assignments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return assignments;
  } catch (error) {
    console.error('Error fetching job assignments:', error);
    throw error;
  }
};

/**
 * Get all job assignments for the current user
 * @returns {Array} Array of all job assignment objects
 */
export const getAllJobAssignments = async () => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const assignmentsRef = collection(db, 'users', userId, 'jobCalendarAssignments');
    const querySnapshot = await getDocs(assignmentsRef);
    
    const assignments = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return assignments;
  } catch (error) {
    console.error('Error fetching all job assignments:', error);
    throw error;
  }
};

// ============================================
// CREATE JOB ASSIGNMENT
// ============================================

/**
 * Assign a job to a specific date
 * @param {string} jobId - The job ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {object} jobData - Optional job data for display (title, client, status)
 * @returns {string} Assignment ID
 */
export const assignJobToDate = async (jobId, date, jobData = {}) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    // Check if this job is already assigned to this date
    const existingAssignments = await getJobAssignmentsForDate(date);
    const alreadyAssigned = existingAssignments.some(a => a.jobId === jobId);
    
    if (alreadyAssigned) {
      console.log('Job already assigned to this date');
      return null;
    }

    const assignmentsRef = collection(db, 'users', userId, 'jobCalendarAssignments');
    const assignmentData = {
      jobId,
      date,
      // Store denormalized job data for quick display
      jobTitle: jobData.title || jobData.name || '',
      jobClient: jobData.client || '',
      jobStatus: jobData.status || 'scheduled',
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(assignmentsRef, assignmentData);
    console.log('✅ Job assigned to date:', date);
    return docRef.id;
  } catch (error) {
    console.error('Error assigning job to date:', error);
    throw error;
  }
};

// ============================================
// DELETE JOB ASSIGNMENT
// ============================================

/**
 * Remove a job assignment from a specific date
 * @param {string} assignmentId - The assignment ID to remove
 */
export const removeJobAssignment = async (assignmentId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const assignmentRef = doc(db, 'users', userId, 'jobCalendarAssignments', assignmentId);
    await deleteDoc(assignmentRef);
    
    console.log('✅ Job assignment removed');
  } catch (error) {
    console.error('Error removing job assignment:', error);
    throw error;
  }
};

/**
 * Remove all assignments for a specific job on a specific date
 * @param {string} jobId - The job ID
 * @param {string} date - Date in YYYY-MM-DD format
 */
export const removeJobFromDate = async (jobId, date) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const assignmentsRef = collection(db, 'users', userId, 'jobCalendarAssignments');
    const q = query(
      assignmentsRef, 
      where('jobId', '==', jobId),
      where('date', '==', date)
    );
    const querySnapshot = await getDocs(q);
    
    // Delete all matching assignments
    const deletePromises = querySnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    await Promise.all(deletePromises);
    
    console.log('✅ Job removed from date');
  } catch (error) {
    console.error('Error removing job from date:', error);
    throw error;
  }
};

/**
 * Get all dates a job is assigned to
 * @param {string} jobId - The job ID
 * @returns {Array} Array of dates (YYYY-MM-DD format)
 */
export const getJobAssignedDates = async (jobId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const assignmentsRef = collection(db, 'users', userId, 'jobCalendarAssignments');
    const q = query(assignmentsRef, where('jobId', '==', jobId));
    const querySnapshot = await getDocs(q);
    
    const dates = querySnapshot.docs.map(doc => doc.data().date);
    return dates;
  } catch (error) {
    console.error('Error fetching job assigned dates:', error);
    throw error;
  }
};