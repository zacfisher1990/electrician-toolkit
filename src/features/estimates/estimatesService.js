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
  serverTimestamp,
  arrayUnion 
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
 * Create a new estimate
 * If jobId is provided, also updates the job to link this estimate AND updates the job's estimatedCost
 */
export const createEstimate = async (estimateData) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Generate estimate number automatically
    const estimateNumber = await getNextEstimateNumber();

    const docRef = await addDoc(collection(db, ESTIMATES_COLLECTION), {
      userId: user.uid,
      ...estimateData,
      estimateNumber,
      status: estimateData.status || 'Draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('Estimate created with number:', estimateNumber);
    
    // If this estimate is linked to a job, update the job's estimateIds AND estimatedCost
    if (estimateData.jobId) {
      console.log('🔗 Linking estimate to job:', estimateData.jobId);
      try {
        const jobRef = doc(db, 'users', user.uid, 'jobs', estimateData.jobId);
        const jobDoc = await getDoc(jobRef);
        
        if (jobDoc.exists()) {
          const jobData = jobDoc.data();
          const currentEstimateIds = jobData.estimateIds || [];
          const newEstimateIds = [...currentEstimateIds, docRef.id];
          
          // Calculate total cost from all estimates for this job
          // Get existing estimates (not including the one we just created since it's already in Firebase)
          const estimatesQuery = query(
            collection(db, ESTIMATES_COLLECTION),
            where('userId', '==', user.uid),
            where('jobId', '==', estimateData.jobId)
          );
          const estimatesSnapshot = await getDocs(estimatesQuery);
          
          let totalCost = 0;
          estimatesSnapshot.forEach((doc) => {
            const est = doc.data();
            totalCost += Number(est.total || est.estimatedCost || 0);
          });
          
          // The query above now includes the estimate we just created (since it's in Firebase)
          // So we don't need to add it again
          
          console.log(`💰 Updating job cost to $${totalCost}`);
          
          await updateDoc(jobRef, {
            estimateIds: newEstimateIds,
            estimatedCost: totalCost.toString(),
            updatedAt: serverTimestamp()
          });
          
          console.log('✅ Estimate linked to job and cost updated successfully');
        } else {
          console.warn('Job not found:', estimateData.jobId);
        }
      } catch (error) {
        console.error('Error linking estimate to job:', error);
        // Don't throw - estimate was created successfully, linking is secondary
      }
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating estimate:', error);
    throw error;
  }
};

/**
 * Update an existing estimate
 * If the estimate is linked to a job, recalculate the job's total cost
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
    
    // If this estimate is linked to a job, recalculate the job's total cost
    if (estimateData.jobId) {
      console.log('♻️ Recalculating cost for job:', estimateData.jobId);
      try {
        const jobRef = doc(db, 'users', user.uid, 'jobs', estimateData.jobId);
        const jobDoc = await getDoc(jobRef);
        
        if (jobDoc.exists()) {
          // Get all estimates for this job
          const estimatesQuery = query(
            collection(db, ESTIMATES_COLLECTION),
            where('userId', '==', user.uid),
            where('jobId', '==', estimateData.jobId)
          );
          const estimatesSnapshot = await getDocs(estimatesQuery);
          
          let totalCost = 0;
          estimatesSnapshot.forEach((doc) => {
            const est = doc.data();
            // Use the updated data if this is the estimate we just updated
            if (doc.id === estimateId) {
              totalCost += Number(estimateData.total || estimateData.estimatedCost || 0);
            } else {
              totalCost += Number(est.total || est.estimatedCost || 0);
            }
          });
          
          console.log(`💰 Updating job cost to $${totalCost}`);
          
          await updateDoc(jobRef, {
            estimatedCost: totalCost.toString(),
            updatedAt: serverTimestamp()
          });
          
          console.log('✅ Job cost recalculated successfully');
        }
      } catch (error) {
        console.error('Error recalculating job cost:', error);
        // Don't throw - estimate was updated successfully
      }
    }
  } catch (error) {
    console.error('Error updating estimate:', error);
    throw error;
  }
};

/**
 * Delete an estimate
 * If the estimate is linked to a job, recalculate the job's total cost and remove from estimateIds
 */
export const deleteEstimate = async (estimateId) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get the estimate data before deleting to check if it's linked to a job
    const estimateRef = doc(db, ESTIMATES_COLLECTION, estimateId);
    const estimateDoc = await getDoc(estimateRef);
    
    if (!estimateDoc.exists()) {
      throw new Error('Estimate not found');
    }
    
    const estimateData = estimateDoc.data();
    const jobId = estimateData.jobId;
    
    // Delete the estimate
    await deleteDoc(estimateRef);
    
    // If this estimate was linked to a job, update the job
    if (jobId) {
      console.log('🔗 Updating job after estimate deletion:', jobId);
      try {
        const jobRef = doc(db, 'users', user.uid, 'jobs', jobId);
        const jobDoc = await getDoc(jobRef);
        
        if (jobDoc.exists()) {
          const jobData = jobDoc.data();
          const currentEstimateIds = jobData.estimateIds || [];
          const newEstimateIds = currentEstimateIds.filter(id => id !== estimateId);
          
          // Recalculate total cost from remaining estimates
          let totalCost = 0;
          if (newEstimateIds.length > 0) {
            const estimatesQuery = query(
              collection(db, ESTIMATES_COLLECTION),
              where('userId', '==', user.uid),
              where('jobId', '==', jobId)
            );
            const estimatesSnapshot = await getDocs(estimatesQuery);
            
            estimatesSnapshot.forEach((doc) => {
              const est = doc.data();
              totalCost += Number(est.total || est.estimatedCost || 0);
            });
          }
          
          console.log(`💰 Updating job cost to $${totalCost} after deletion`);
          
          await updateDoc(jobRef, {
            estimateIds: newEstimateIds,
            estimatedCost: totalCost.toString(),
            updatedAt: serverTimestamp()
          });
          
          console.log('✅ Job updated after estimate deletion');
        }
      } catch (error) {
        console.error('Error updating job after estimate deletion:', error);
        // Don't throw - estimate was deleted successfully
      }
    }
  } catch (error) {
    console.error('Error deleting estimate:', error);
    throw error;
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
    
    if (!estimateDoc.exists()) {
      throw new Error('Estimate not found');
    }
    
    const currentData = estimateDoc.data();
    const currentSentCount = currentData.sentCount || 0;

    await updateDoc(estimateRef, {
      lastSentAt: serverTimestamp(),
      lastSentTo: recipientEmail,
      sentCount: currentSentCount + 1,
      // Auto-update status from Draft to Pending when sent for the first time
      status: currentData.status === 'Draft' ? 'Pending' : currentData.status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error recording estimate sent:', error);
    throw error;
  }
};