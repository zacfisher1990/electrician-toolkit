import { createJob, deleteJob as deleteJobFromFirebase } from './../jobsService';
import { clearJobsCache } from '../../../utils/localStorageUtils';

/**
 * Job operation handlers
 */
export const createJobHandlers = ({
  formData,
  editingJob,
  viewingJob,
  estimates,
  resetForm,
  loadJobs
}) => {
  
  const handleAddJob = async () => {
    if (formData.title && formData.client) {
      try {
        const jobData = {
          name: formData.title,
          title: formData.title,
          client: formData.client,
          location: formData.location,
          status: formData.status,
          date: formData.date,
          time: formData.time,
          estimatedCost: formData.estimatedCost,
          duration: formData.duration,
          notes: formData.notes,
          estimateIds: formData.estimateIds || []
        };

        await createJob(jobData);
        resetForm();
        clearJobsCache();
        loadJobs();
      } catch (error) {
        console.error('Error adding job:', error);
        alert('Failed to add job. Please try again.');
      }
    }
  };

  const handleEditJob = async () => {
    if (formData.title && formData.client && editingJob) {
      try {
        const { updateJob } = await import('./../jobsService');
        const jobData = {
          name: formData.title,
          title: formData.title,
          client: formData.client,
          location: formData.location,
          status: formData.status,
          date: formData.date,
          time: formData.time,
          estimatedCost: formData.estimatedCost,
          duration: formData.duration,
          notes: formData.notes,
          estimateIds: formData.estimateIds || []
        };

        await updateJob(editingJob.id, jobData);
        resetForm();
        loadJobs();
      } catch (error) {
        console.error('Error updating job:', error);
        alert('Failed to update job. Please try again.');
      }
    }
  };

  const handleDeleteJob = async (id, jobTitle) => {
    if (window.confirm(`Are you sure you want to delete "${jobTitle}"?`)) {
      try {
        await deleteJobFromFirebase(id);
        if (viewingJob && viewingJob.id === id) {
          resetForm();
        }
        loadJobs();
      } catch (error) {
        console.error('Error deleting job:', error);
        alert('Failed to delete job. Please try again.');
      }
    }
  };

  const handleUpdateStatus = async (jobId, newStatus, jobs) => {
    try {
      const { updateJob } = await import('./../jobsService');
      const job = jobs.find(j => j.id === jobId);
      await updateJob(jobId, { ...job, status: newStatus });
      loadJobs();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleClockInOut = async (jobId, clockIn, jobs, setJobs) => {
    try {
      const { updateJob } = await import('./../jobsService');
      const job = jobs.find(j => j.id === jobId);
      
      if (clockIn) {
        // CLOCK IN - First check if already clocked into another job
        const currentlyClockedInJob = jobs.find(j => j.clockedIn === true && j.id !== jobId);
        
        if (currentlyClockedInJob) {
          // Ask user if they want to clock out of the other job
          const confirmed = window.confirm(
            `You're currently clocked into "${currentlyClockedInJob.title}". ` +
            `Clock out and switch to "${job.title}"?`
          );
          
          if (!confirmed) {
            return; // User cancelled, don't do anything
          }
          
          // Clock out the other job first
          const sessionEnd = new Date().toISOString();
          const sessionStart = currentlyClockedInJob.currentSessionStart;
          
          const workSessions = currentlyClockedInJob.workSessions || [];
          workSessions.push({
            startTime: sessionStart,
            endTime: sessionEnd
          });
          
          const clockedOutJob = {
            ...currentlyClockedInJob,
            clockedIn: false,
            currentSessionStart: null,
            workSessions: workSessions
          };
          
          // Update the other job in local state
          setJobs(prevJobs => 
            prevJobs.map(j => j.id === currentlyClockedInJob.id ? clockedOutJob : j)
          );
          
          // Update the other job in database
          await updateJob(currentlyClockedInJob.id, clockedOutJob);
        }
        
        // Now clock IN to the new job
        const updatedJob = {
          ...job,
          clockedIn: true,
          currentSessionStart: new Date().toISOString()
        };
        
        // Update local state IMMEDIATELY (optimistic update)
        setJobs(prevJobs => 
          prevJobs.map(j => j.id === jobId ? updatedJob : j)
        );
        
        // Update in database
        await updateJob(jobId, updatedJob);
        
      } else {
        // CLOCK OUT - end current session
        const sessionEnd = new Date().toISOString();
        const sessionStart = job.currentSessionStart;
        
        // Add completed session to workSessions array
        const workSessions = job.workSessions || [];
        workSessions.push({
          startTime: sessionStart,
          endTime: sessionEnd
        });
        
        const updatedJob = {
          ...job,
          clockedIn: false,
          currentSessionStart: null,
          workSessions: workSessions
        };
        
        // Update local state IMMEDIATELY (optimistic update)
        setJobs(prevJobs => 
          prevJobs.map(j => j.id === jobId ? updatedJob : j)
        );
        
        // Then update in database in the background
        await updateJob(jobId, updatedJob);
      }
      
    } catch (error) {
      console.error('Error updating clock status:', error);
      alert('Failed to update clock status. Please try again.');
      // Reload jobs on error to ensure consistency
      loadJobs();
    }
  };

  return {
    handleAddJob,
    handleEditJob,
    handleDeleteJob,
    handleUpdateStatus,
    handleClockInOut
  };
};