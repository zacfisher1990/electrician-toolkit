import { db, auth } from './firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore';

// Get all estimates for the current user
export const getUserEstimates = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }

    const estimatesRef = collection(db, 'estimates');
    const q = query(estimatesRef, where('userId', '==', user.uid));
    const querySnapshot = await getDocs(q);
    
    const estimates = [];
    querySnapshot.forEach((doc) => {
      estimates.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      });
    });
    
    return estimates;
  } catch (error) {
    console.error('Error getting estimates:', error);
    throw error;
  }
};

// Create a new estimate
export const createEstimate = async (estimateData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }

    const estimatesRef = collection(db, 'estimates');
    const docRef = await addDoc(estimatesRef, {
      ...estimateData,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating estimate:', error);
    throw error;
  }
};

// Update an existing estimate
export const updateEstimate = async (estimateId, estimateData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }

    const estimateRef = doc(db, 'estimates', estimateId);
    await updateDoc(estimateRef, {
      ...estimateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating estimate:', error);
    throw error;
  }
};

// Delete an estimate
export const deleteEstimate = async (estimateId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No user logged in');
    }

    const estimateRef = doc(db, 'estimates', estimateId);
    await deleteDoc(estimateRef);
  } catch (error) {
    console.error('Error deleting estimate:', error);
    throw error;
  }
};