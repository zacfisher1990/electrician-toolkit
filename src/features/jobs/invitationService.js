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
  getDoc,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';

// ============================================
// INVITATION MANAGEMENT
// ============================================

/**
 * Send an invitation to an electrician to join a job
 * @param {string} jobId - The job ID
 * @param {string} email - The electrician's email
 * @param {Object} jobData - Basic job info for the invitation
 * @returns {Promise<string>} Invitation ID
 */

// Helper to wait for auth to be ready
const waitForAuth = () => {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const maxAttempts = 10;
    
    const checkAuth = () => {
      attempts++;
      if (auth.currentUser?.uid && auth.currentUser?.email) {
        resolve(auth.currentUser);
      } else if (attempts >= maxAttempts) {
        reject(new Error('User not authenticated'));
      } else {
        setTimeout(checkAuth, 100);
      }
    };
    
    checkAuth();
  });
};

export const sendJobInvitation = async (jobId, email, jobData) => {
  try {
    const userId = auth.currentUser?.uid;
    const userEmail = auth.currentUser?.email;
    if (!userId) throw new Error('User not authenticated');

    // Create invitation document in a global invitations collection
    const invitationsRef = collection(db, 'jobInvitations');
    
    const invitationData = {
      jobId,
      jobOwnerId: userId,
      jobOwnerEmail: userEmail,
      invitedEmail: email.toLowerCase(),
      jobTitle: jobData.title || jobData.name,
      jobClient: jobData.client,
      jobLocation: jobData.location || '',
      jobDate: jobData.date || '',
      status: 'pending', // pending, accepted, rejected
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(invitationsRef, invitationData);

    // Also update the job document to track invited electricians
    const jobRef = doc(db, 'users', userId, 'jobs', jobId);
    await updateDoc(jobRef, {
      invitedElectricians: arrayUnion({
        email: email.toLowerCase(),
        status: 'pending',
        invitationId: docRef.id,
        invitedAt: new Date().toISOString()
      }),
      updatedAt: serverTimestamp()
    });

    console.log('✅ Invitation sent:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error sending invitation:', error);
    throw error;
  }
};

/**
 * Remove an invitation (before it's accepted)
 * @param {string} jobId - The job ID
 * @param {string} email - The electrician's email to uninvite
 */
export const removeJobInvitation = async (jobId, email) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    // Find and delete the invitation document
    const invitationsRef = collection(db, 'jobInvitations');
    const q = query(
      invitationsRef,
      where('jobId', '==', jobId),
      where('invitedEmail', '==', email.toLowerCase()),
      where('jobOwnerId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Remove from job's invited electricians array
    const jobRef = doc(db, 'users', userId, 'jobs', jobId);
    const jobDoc = await getDoc(jobRef);
    
    if (jobDoc.exists()) {
      const jobData = jobDoc.data();
      const updatedInvites = (jobData.invitedElectricians || []).filter(
        inv => inv.email.toLowerCase() !== email.toLowerCase()
      );
      
      batch.update(jobRef, {
        invitedElectricians: updatedInvites,
        updatedAt: serverTimestamp()
      });
    }

    await batch.commit();
    console.log('✅ Invitation removed');
  } catch (error) {
    console.error('Error removing invitation:', error);
    throw error;
  }
};

/**
 * Get all pending invitations for the current user (as invitee)
 * @returns {Promise<Array>} Array of invitation objects
 */
export const getMyPendingInvitations = async () => {
  try {
    const userEmail = auth.currentUser?.email;
    if (!userEmail) throw new Error('User not authenticated');

    const invitationsRef = collection(db, 'jobInvitations');
    const q = query(
      invitationsRef,
      where('invitedEmail', '==', userEmail.toLowerCase()),
      where('status', '==', 'pending')
    );

    const snapshot = await getDocs(q);
    const invitations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log(`📬 Found ${invitations.length} pending invitations`);
    return invitations;
  } catch (error) {
    console.error('Error fetching invitations:', error);
    throw error;
  }
};

/**
 * Accept a job invitation
 * @param {string} invitationId - The invitation document ID
 * @returns {Promise<Object>} The accepted job data
 */
export const acceptJobInvitation = async (invitationId) => {
  try {
    // Wait for auth to be ready
    const user = await waitForAuth();
    const userId = user.uid;
    const userEmail = user.email;

    // Get the invitation
    const invitationRef = doc(db, 'jobInvitations', invitationId);
    const invitationDoc = await getDoc(invitationRef);
    
    if (!invitationDoc.exists()) {
      throw new Error('Invitation not found');
    }

    const invitationData = invitationDoc.data();

    // Verify this invitation is for the current user
    if (invitationData.invitedEmail.toLowerCase() !== userEmail.toLowerCase()) {
      throw new Error('This invitation is not for you');
    }

    // Get the original job data
    const originalJobRef = doc(db, 'users', invitationData.jobOwnerId, 'jobs', invitationData.jobId);
    const originalJobDoc = await getDoc(originalJobRef);
    
    if (!originalJobDoc.exists()) {
      throw new Error('Job no longer exists');
    }

    const originalJobData = originalJobDoc.data();

    // Create a reference to this job in the accepting user's jobs collection
    const myJobsRef = collection(db, 'users', userId, 'jobs');
    
    // Create a "shared job" entry - limited data, references original
    const sharedJobData = {
      // Reference to original
      isSharedJob: true,
      originalJobId: invitationData.jobId,
      originalOwnerId: invitationData.jobOwnerId,
      originalOwnerEmail: invitationData.jobOwnerEmail,
      
      // Basic job info (visible to team member)
      title: originalJobData.title || originalJobData.name,
      client: originalJobData.client,
      location: originalJobData.location || '',
      date: originalJobData.date || '',
      time: originalJobData.time || '',
      status: originalJobData.status || 'scheduled',
      notes: originalJobData.notes || '',
      photos: originalJobData.photos || [],
      
      // Team member's own tracking
      workSessions: [], // Their own time tracking
      clockedIn: false,
      currentSessionStart: null,
      
      // Permissions - explicitly NO financial data
      permissions: {
        canViewDetails: true,
        canClockInOut: true,
        canViewPhotos: true,
        canAddPhotos: false, // Could be true if you want
        canViewCost: false,
        canViewEstimate: false,
        canViewInvoice: false,
        canEditJob: false,
        canDeleteJob: false
      },
      
      // Metadata
      acceptedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const newJobRef = await addDoc(myJobsRef, sharedJobData);

    // Update the invitation status
    await updateDoc(invitationRef, {
      status: 'accepted',
      acceptedAt: serverTimestamp(),
      acceptedUserId: userId,
      sharedJobId: newJobRef.id,
      updatedAt: serverTimestamp()
    });

    // Update the original job's invited electricians list
    const updatedInvites = (originalJobData.invitedElectricians || []).map(inv => {
      if (inv.email.toLowerCase() === userEmail.toLowerCase()) {
        return {
          ...inv,
          status: 'accepted',
          acceptedAt: new Date().toISOString(),
          acceptedUserId: userId,
          sharedJobId: newJobRef.id
        };
      }
      return inv;
    });

    await updateDoc(originalJobRef, {
      invitedElectricians: updatedInvites,
      updatedAt: serverTimestamp()
    });

    console.log('✅ Invitation accepted, shared job created:', newJobRef.id);
    
    return {
      sharedJobId: newJobRef.id,
      jobData: sharedJobData
    };
  } catch (error) {
    console.error('Error accepting invitation:', error);
    throw error;
  }
};

/**
 * Reject/decline a job invitation
 * @param {string} invitationId - The invitation document ID
 */
export const rejectJobInvitation = async (invitationId) => {
  try {
    const userEmail = auth.currentUser?.email;
    if (!userEmail) throw new Error('User not authenticated');

    // Get the invitation
    const invitationRef = doc(db, 'jobInvitations', invitationId);
    const invitationDoc = await getDoc(invitationRef);
    
    if (!invitationDoc.exists()) {
      throw new Error('Invitation not found');
    }

    const invitationData = invitationDoc.data();

    // Verify this invitation is for the current user
    if (invitationData.invitedEmail.toLowerCase() !== userEmail.toLowerCase()) {
      throw new Error('This invitation is not for you');
    }

    // Update invitation status
    await updateDoc(invitationRef, {
      status: 'rejected',
      rejectedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Update original job's invited list
    const originalJobRef = doc(db, 'users', invitationData.jobOwnerId, 'jobs', invitationData.jobId);
    const originalJobDoc = await getDoc(originalJobRef);
    
    if (originalJobDoc.exists()) {
      const originalJobData = originalJobDoc.data();
      const updatedInvites = (originalJobData.invitedElectricians || []).map(inv => {
        if (inv.email.toLowerCase() === userEmail.toLowerCase()) {
          return {
            ...inv,
            status: 'rejected',
            rejectedAt: new Date().toISOString()
          };
        }
        return inv;
      });

      await updateDoc(originalJobRef, {
        invitedElectricians: updatedInvites,
        updatedAt: serverTimestamp()
      });
    }

    console.log('✅ Invitation rejected');
  } catch (error) {
    console.error('Error rejecting invitation:', error);
    throw error;
  }
};

/**
 * Get count of pending invitations for badge display
 * @returns {Promise<number>} Count of pending invitations
 */
export const getPendingInvitationCount = async () => {
  try {
    const userEmail = auth.currentUser?.email;
    if (!userEmail) return 0;

    const invitationsRef = collection(db, 'jobInvitations');
    const q = query(
      invitationsRef,
      where('invitedEmail', '==', userEmail.toLowerCase()),
      where('status', '==', 'pending')
    );

    const snapshot = await getDocs(q);
    return snapshot.size;
  } catch (error) {
    console.error('Error getting invitation count:', error);
    return 0;
  }
};

/**
 * Sync shared job with original (for updates to photos, notes, status)
 * Call this periodically or when viewing shared jobs
 * @param {string} sharedJobId - The shared job ID in user's collection
 */
export const syncSharedJob = async (sharedJobId) => {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    const sharedJobRef = doc(db, 'users', userId, 'jobs', sharedJobId);
    const sharedJobDoc = await getDoc(sharedJobRef);
    
    if (!sharedJobDoc.exists()) {
      throw new Error('Shared job not found');
    }

    const sharedJobData = sharedJobDoc.data();
    
    if (!sharedJobData.isSharedJob) {
      throw new Error('This is not a shared job');
    }

    // Get original job
    const originalJobRef = doc(
      db, 
      'users', 
      sharedJobData.originalOwnerId, 
      'jobs', 
      sharedJobData.originalJobId
    );
    const originalJobDoc = await getDoc(originalJobRef);
    
    if (!originalJobDoc.exists()) {
      // Original job was deleted
      await updateDoc(sharedJobRef, {
        status: 'archived',
        notes: 'Original job was deleted by owner',
        updatedAt: serverTimestamp()
      });
      return;
    }

    const originalJobData = originalJobDoc.data();

    // Update shared job with latest allowed fields
    await updateDoc(sharedJobRef, {
      title: originalJobData.title || originalJobData.name,
      client: originalJobData.client,
      location: originalJobData.location || '',
      date: originalJobData.date || '',
      time: originalJobData.time || '',
      status: originalJobData.status || 'scheduled',
      notes: originalJobData.notes || '',
      photos: originalJobData.photos || [],
      updatedAt: serverTimestamp()
    });

    console.log('✅ Shared job synced');
  } catch (error) {
    console.error('Error syncing shared job:', error);
    throw error;
  }
};

/**
 * Set up real-time listener for a shared job to auto-sync with original
 * @param {string} sharedJobId - The shared job ID
 * @param {Function} onUpdate - Callback when job updates (receives updated job data)
 * @returns {Function} Unsubscribe function
 */
export const subscribeToSharedJob = async (sharedJobId, onUpdate) => {
  const userId = auth.currentUser?.uid;
  if (!userId) {
    console.error('User not authenticated for shared job subscription');
    return () => {};
  }

  try {
    const sharedJobRef = doc(db, 'users', userId, 'jobs', sharedJobId);
    const sharedJobDoc = await getDoc(sharedJobRef);
    
    if (!sharedJobDoc.exists() || !sharedJobDoc.data().isSharedJob) {
      console.log('Not a shared job, skipping sync subscription');
      return () => {};
    }

    const sharedJobData = sharedJobDoc.data();
    const originalJobRef = doc(
      db,
      'users',
      sharedJobData.originalOwnerId,
      'jobs',
      sharedJobData.originalJobId
    );

    // Subscribe to original job changes
    const unsubscribe = onSnapshot(
      originalJobRef, 
      async (originalDoc) => {
        try {
          if (!originalDoc.exists()) {
            // Original job deleted
            console.log('Original job deleted, updating shared job');
            await updateDoc(sharedJobRef, {
              status: 'archived',
              notes: 'Original job was deleted by owner',
              updatedAt: serverTimestamp()
            });
            
            // Notify with updated data
            const updated = await getDoc(sharedJobRef);
            if (updated.exists() && onUpdate) {
              onUpdate({ id: sharedJobId, ...updated.data() });
            }
            return;
          }

          const originalData = originalDoc.data();

          // Update shared job with allowed fields
          const updates = {
            title: originalData.title || originalData.name,
            client: originalData.client,
            location: originalData.location || '',
            date: originalData.date || '',
            time: originalData.time || '',
            status: originalData.status || 'scheduled',
            notes: originalData.notes || '',
            photos: originalData.photos || [],
            updatedAt: serverTimestamp()
          };

          await updateDoc(sharedJobRef, updates);
          console.log(`🔄 Synced shared job ${sharedJobId} from original`);

          // Notify with updated data
          const updated = await getDoc(sharedJobRef);
          if (updated.exists() && onUpdate) {
            onUpdate({ id: sharedJobId, ...updated.data() });
          }
        } catch (error) {
          console.error('Error processing shared job update:', error);
        }
      },
      (error) => {
        console.error('Error in shared job subscription:', error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up shared job subscription:', error);
    return () => {};
  }
};