// src/features/estimates/estimatesService.js
import { auth, db } from '../../firebase/firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs,
  getDoc,
  query, 
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';

const ESTIMATES_COLLECTION = 'estimates';

/**
 * Get all estimates for the current user
 */
export const getUserEstimates = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const estimatesRef = collection(db, ESTIMATES_COLLECTION);
    const q = query(
      estimatesRef, 
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const estimates = [];
    querySnapshot.forEach((doc) => {
      estimates.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return estimates;
  } catch (error) {
    console.error('Error getting estimates:', error);
    throw error;
  }
};

/**
 * Create a new estimate
 */
export const createEstimate = async (estimateData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const docRef = await addDoc(collection(db, ESTIMATES_COLLECTION), {
      userId: user.uid,
      ...estimateData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    return docRef.id;
  } catch (error) {
    console.error('Error creating estimate:', error);
    throw error;
  }
};

/**
 * Update an existing estimate
 */
export const updateEstimate = async (estimateId, estimateData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const estimateRef = doc(db, ESTIMATES_COLLECTION, estimateId);
    await updateDoc(estimateRef, {
      ...estimateData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating estimate:', error);
    throw error;
  }
};

/**
 * Delete an estimate
 */
export const deleteEstimate = async (estimateId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    await deleteDoc(doc(db, ESTIMATES_COLLECTION, estimateId));
  } catch (error) {
    console.error('Error deleting estimate:', error);
    throw error;
  }
};

/**
 * Get the next estimate number
 */
export const getNextEstimateNumber = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const estimates = await getUserEstimates();
    
    if (estimates.length === 0) {
      return 'EST-001';
    }

    // Extract numbers from existing estimate numbers
    const numbers = estimates
      .map(est => {
        const match = est.estimateNumber?.match(/EST-(\d+)/);
        return match ? parseInt(match[1]) : 0;
      })
      .filter(num => num > 0);

    if (numbers.length === 0) {
      return 'EST-001';
    }

    const maxNumber = Math.max(...numbers);
    const nextNumber = maxNumber + 1;
    return `EST-${String(nextNumber).padStart(3, '0')}`;
  } catch (error) {
    console.error('Error getting next estimate number:', error);
    return 'EST-001';
  }
};

/**
 * Update estimate status
 */
export const updateEstimateStatus = async (estimateId, status) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const estimateRef = doc(db, ESTIMATES_COLLECTION, estimateId);
    await updateDoc(estimateRef, {
      status: status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating estimate status:', error);
    throw error;
  }
};

/**
 * Record that an estimate was sent via email
 */
export const recordEstimateSent = async (estimateId, recipientEmail) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const estimateRef = doc(db, ESTIMATES_COLLECTION, estimateId);
    const estimateDoc = await getDoc(estimateRef);
    const currentSentCount = estimateDoc.data()?.sentCount || 0;

    await updateDoc(estimateRef, {
      lastSentAt: serverTimestamp(),
      lastSentTo: recipientEmail,
      sentCount: currentSentCount + 1,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error recording estimate sent:', error);
    throw error;
  }
};