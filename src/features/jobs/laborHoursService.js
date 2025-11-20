import { db, auth } from '../../firebase/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

/**
 * Calculate total hours from work sessions
 * @param {Array} workSessions - Array of work session objects
 * @returns {number} Total hours
 */
const calculateHoursFromSessions = (workSessions) => {
  if (!workSessions || workSessions.length === 0) return 0;
  
  let totalMs = 0;
  workSessions.forEach(session => {
    if (session.startTime && session.endTime) {
      totalMs += new Date(session.endTime) - new Date(session.startTime);
    }
  });
  
  return totalMs / (1000 * 60 * 60); // Convert to hours
};

/**
 * Get total labor hours for a job including all team members
 * This is only for job owners - team members only see their own hours
 * @param {Object} job - The job object
 * @returns {Promise<Object>} Object with totalHours and breakdown by member
 */
export const getTotalLaborHours = async (job) => {
  try {
    // If this is a shared job (user is team member), only return their hours
    if (job.isSharedJob) {
      const myHours = calculateHoursFromSessions(job.workSessions || []);
      return {
        totalHours: myHours,
        myHours: myHours,
        teamHours: 0,
        breakdown: []
      };
    }

    // Job owner calculation - include all team members
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error('User not authenticated');

    // Start with owner's hours
    const ownerHours = calculateHoursFromSessions(job.workSessions || []);
    let totalTeamHours = 0;
    const breakdown = [];

    // Add owner to breakdown
    breakdown.push({
      email: auth.currentUser?.email || 'You',
      hours: ownerHours,
      isOwner: true
    });

    // Get hours from accepted team members
    if (job.invitedElectricians && job.invitedElectricians.length > 0) {
      const acceptedMembers = job.invitedElectricians.filter(
        inv => inv.status === 'accepted' && inv.sharedJobId
      );

      for (const member of acceptedMembers) {
        try {
          // Each accepted team member has a sharedJobId that points to their copy of the job
          // We need to find their user ID first from the invitation
          const invitationRef = doc(db, 'jobInvitations', member.invitationId);
          const invitationDoc = await getDoc(invitationRef);
          
          if (!invitationDoc.exists() || !invitationDoc.data().acceptedUserId) {
            continue;
          }

          const memberUserId = invitationDoc.data().acceptedUserId;
          
          // Get their shared job document
          const sharedJobRef = doc(db, 'users', memberUserId, 'jobs', member.sharedJobId);
          const sharedJobDoc = await getDoc(sharedJobRef);
          
          if (sharedJobDoc.exists()) {
            const sharedJobData = sharedJobDoc.data();
            const memberHours = calculateHoursFromSessions(sharedJobData.workSessions || []);
            
            totalTeamHours += memberHours;
            breakdown.push({
              email: member.email,
              hours: memberHours,
              isOwner: false
            });
          }
        } catch (error) {
          console.error(`Error fetching hours for ${member.email}:`, error);
        }
      }
    }

    return {
      totalHours: ownerHours + totalTeamHours,
      myHours: ownerHours,
      teamHours: totalTeamHours,
      breakdown
    };
  } catch (error) {
    console.error('Error calculating total labor hours:', error);
    // Return owner's hours only if there's an error
    const ownerHours = calculateHoursFromSessions(job.workSessions || []);
    return {
      totalHours: ownerHours,
      myHours: ownerHours,
      teamHours: 0,
      breakdown: []
    };
  }
};

/**
 * Subscribe to real-time labor hours updates for a job
 * Sets up listeners on all team members' shared jobs
 * @param {Object} job - The job object
 * @param {Function} onUpdate - Callback with updated labor hours data
 * @returns {Function} Unsubscribe function to clean up all listeners
 */
export const subscribeToLaborHours = async (job, onUpdate) => {
  // If this is a shared job, only track own hours (no subscription needed for others)
  if (job.isSharedJob) {
    const myHours = calculateHoursFromSessions(job.workSessions || []);
    onUpdate({
      totalHours: myHours,
      myHours: myHours,
      teamHours: 0,
      breakdown: []
    });
    return () => {}; // No-op unsubscribe
  }

  const userId = auth.currentUser?.uid;
  if (!userId) return () => {};

  const unsubscribers = [];

  try {
    // Calculate initial owner hours
    const calculateAndNotify = async () => {
      const laborData = await getTotalLaborHours(job);
      onUpdate(laborData);
    };

    // Initial calculation
    await calculateAndNotify();

    // Subscribe to owner's job changes (for their own work sessions)
    const ownerJobRef = doc(db, 'users', userId, 'jobs', job.id);
    const ownerUnsubscribe = onSnapshot(ownerJobRef, async () => {
      await calculateAndNotify();
    });
    unsubscribers.push(ownerUnsubscribe);

    // Subscribe to each team member's shared job
    if (job.invitedElectricians && job.invitedElectricians.length > 0) {
      const acceptedMembers = job.invitedElectricians.filter(
        inv => inv.status === 'accepted' && inv.sharedJobId
      );

      for (const member of acceptedMembers) {
        try {
          // Get their user ID from invitation
          const invitationRef = doc(db, 'jobInvitations', member.invitationId);
          const invitationDoc = await getDoc(invitationRef);
          
          if (!invitationDoc.exists() || !invitationDoc.data().acceptedUserId) {
            continue;
          }

          const memberUserId = invitationDoc.data().acceptedUserId;
          
          // Subscribe to their shared job
          const sharedJobRef = doc(db, 'users', memberUserId, 'jobs', member.sharedJobId);
          const memberUnsubscribe = onSnapshot(sharedJobRef, async () => {
            await calculateAndNotify();
          });
          
          unsubscribers.push(memberUnsubscribe);
        } catch (error) {
          console.error(`Error setting up subscription for ${member.email}:`, error);
        }
      }
    }

    // Return combined unsubscribe function
    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  } catch (error) {
    console.error('Error setting up labor hours subscription:', error);
    return () => {};
  }
};