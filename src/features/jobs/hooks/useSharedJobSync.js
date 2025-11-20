import { useEffect, useRef } from 'react';
import { subscribeToSharedJob } from '../invitationService';

/**
 * Custom hook to set up real-time sync for all shared jobs
 * @param {Array} jobs - Array of all jobs
 * @param {Function} onJobUpdate - Callback to update a specific job in the jobs array
 */
export const useSharedJobSync = (jobs, onJobUpdate) => {
  const unsubscribesRef = useRef({});

  useEffect(() => {
    console.log('🔍 [useSharedJobSync] Hook running');
    console.log('🔍 [useSharedJobSync] Total jobs:', jobs?.length);
    console.log('🔍 [useSharedJobSync] Jobs:', jobs);
    
    if (!jobs || jobs.length === 0) {
      console.log('⚠️ [useSharedJobSync] No jobs to sync');
      return;
    }

    // Find all shared jobs
    const sharedJobs = jobs.filter(job => {
      console.log(`🔍 [useSharedJobSync] Checking job ${job.id}:`, {
        isSharedJob: job.isSharedJob,
        hasOriginalJobId: !!job.originalJobId,
        hasOriginalOwnerId: !!job.originalOwnerId
      });
      return job.isSharedJob === true;
    });
    
    console.log('🔍 [useSharedJobSync] Found shared jobs:', sharedJobs.length);
    console.log('🔍 [useSharedJobSync] Shared jobs data:', sharedJobs);

    if (sharedJobs.length === 0) {
      console.log('⚠️ [useSharedJobSync] No shared jobs found');
      return;
    }

    // Set up listeners for new shared jobs
    sharedJobs.forEach(async (job) => {
      // Skip if already subscribed
      if (unsubscribesRef.current[job.id]) {
        console.log(`⏭️ [useSharedJobSync] Already subscribed to ${job.id}`);
        return;
      }

      console.log(`📡 Setting up sync for shared job: ${job.id}`);
      
      try {
        const unsubscribe = await subscribeToSharedJob(job.id, (updatedJob) => {
          console.log(`✅ Received update for shared job ${job.id}`);
          console.log('📥 Updated job data:', updatedJob);
          if (onJobUpdate) {
            onJobUpdate(updatedJob);
          }
        });

        unsubscribesRef.current[job.id] = unsubscribe;
        console.log(`✅ [useSharedJobSync] Successfully subscribed to ${job.id}`);
      } catch (error) {
        console.error(`❌ [useSharedJobSync] Error subscribing to shared job ${job.id}:`, error);
      }
    });

    // Clean up listeners for jobs that no longer exist
    Object.keys(unsubscribesRef.current).forEach(jobId => {
      const stillExists = jobs.some(job => job.id === jobId && job.isSharedJob);
      if (!stillExists && unsubscribesRef.current[jobId]) {
        console.log(`🔌 Unsubscribing from removed shared job: ${jobId}`);
        if (typeof unsubscribesRef.current[jobId] === 'function') {
          unsubscribesRef.current[jobId]();
        }
        delete unsubscribesRef.current[jobId];
      }
    });

    // Cleanup on unmount
    return () => {
      console.log('🧹 [useSharedJobSync] Cleaning up subscriptions');
      Object.values(unsubscribesRef.current).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
      unsubscribesRef.current = {};
    };
  }, [jobs, onJobUpdate]);
};