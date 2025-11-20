import { useEffect, useRef } from 'react';
import { subscribeToSharedJob } from '../invitationService';

/**
 * Custom hook to set up real-time sync for all shared jobs
 * @param {Array} jobs - Array of all jobs
 * @param {Function} onJobUpdate - Callback to update a specific job in the jobs array
 */
export const useSharedJobSync = (jobs, onJobUpdate) => {
  const unsubscribesRef = useRef({});
  const onJobUpdateRef = useRef(onJobUpdate);

  // Keep the callback ref up to date
  useEffect(() => {
    onJobUpdateRef.current = onJobUpdate;
  }, [onJobUpdate]);

  useEffect(() => {
    if (!jobs || jobs.length === 0) {
      return;
    }

    // Find all shared jobs
    const sharedJobs = jobs.filter(job => job.isSharedJob === true);
    
    if (sharedJobs.length === 0) {
      return;
    }

    console.log(`🔍 [useSharedJobSync] Found ${sharedJobs.length} shared jobs`);

    // Set up listeners for new shared jobs
    sharedJobs.forEach(async (job) => {
      // Skip if already subscribed
      if (unsubscribesRef.current[job.id]) {
        return;
      }

      console.log(`📡 Setting up sync for shared job: ${job.id}`);
      
      try {
        const unsubscribe = await subscribeToSharedJob(job.id, (updatedJob) => {
          console.log(`🔄 Synced shared job ${job.id} from original`);
          // Use the ref to avoid dependency issues
          if (onJobUpdateRef.current) {
            onJobUpdateRef.current(updatedJob);
          }
        });

        unsubscribesRef.current[job.id] = unsubscribe;
        console.log(`✅ Successfully subscribed to ${job.id}`);
      } catch (error) {
        console.error(`❌ Error subscribing to shared job ${job.id}:`, error);
      }
    });

    // Clean up listeners for jobs that no longer exist
    const currentJobIds = sharedJobs.map(j => j.id);
    Object.keys(unsubscribesRef.current).forEach(jobId => {
      if (!currentJobIds.includes(jobId)) {
        console.log(`🔌 Unsubscribing from removed shared job: ${jobId}`);
        if (typeof unsubscribesRef.current[jobId] === 'function') {
          unsubscribesRef.current[jobId]();
        }
        delete unsubscribesRef.current[jobId];
      }
    });

    // Cleanup on unmount
    return () => {
      Object.values(unsubscribesRef.current).forEach(unsubscribe => {
        if (typeof unsubscribesRef.current === 'function') {
          unsubscribe();
        }
      });
      unsubscribesRef.current = {};
    };
  }, [jobs.length, jobs.map(j => j.id).join(',')]); // Only re-run when job count or IDs change
};