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
    console.log('💾 handleAddJob called');
    console.log('📋 formData:', formData);
    
    if (!formData.title || !formData.client) {
      console.error('❌ Missing required fields: title or client');
      alert('Please fill in both Job Title and Client Name');
      return;
    }

    try {
      // Ensure estimateIds is an array
      const estimateIds = Array.isArray(formData.estimateIds) ? formData.estimateIds : [];
      
      const jobData = {
        name: formData.title,
        title: formData.title,
        client: formData.client,
        location: formData.location || '',
        status: formData.status || 'scheduled',
        date: formData.date || '',
        time: formData.time || '',
        estimatedCost: formData.estimatedCost || '',
        duration: formData.duration || '',
        notes: formData.notes || '',
        estimateIds: estimateIds
      };

      console.log('✅ Creating job with data:', jobData);
      const jobId = await createJob(jobData);
      console.log('✅ Job created successfully with ID:', jobId);
      
      resetForm();
      clearJobsCache();
      await loadJobs();
      
      console.log('✅ Job add complete');
    } catch (error) {
      console.error('❌ Error adding job:', error);
      alert('Failed to add job. Please try again. Error: ' + error.message);
    }
  };

  const handleEditJob = async () => {
    console.log('💾 handleEditJob called');
    console.log('📋 formData:', formData);
    console.log('📋 editingJob:', editingJob);
    
    if (!formData.title || !formData.client) {
      console.error('❌ Missing required fields: title or client');
      alert('Please fill in both Job Title and Client Name');
      return;
    }
    
    if (!editingJob || !editingJob.id) {
      console.error('❌ No editing job found');
      alert('Error: No job selected for editing');
      return;
    }

    try {
      const { updateJob } = await import('./../jobsService');
      
      // Ensure estimateIds is an array
      const estimateIds = Array.isArray(formData.estimateIds) ? formData.estimateIds : [];
      
      const jobData = {
        name: formData.title,
        title: formData.title,
        client: formData.client,
        location: formData.location || '',
        status: formData.status || 'scheduled',
        date: formData.date || '',
        time: formData.time || '',
        estimatedCost: formData.estimatedCost || '',
        duration: formData.duration || '',
        notes: formData.notes || '',
        estimateIds: estimateIds
      };

      console.log('✅ Updating job with data:', jobData);
      await updateJob(editingJob.id, jobData);
      console.log('✅ Job updated successfully');
      
      resetForm();
      await loadJobs();
      
      console.log('✅ Job edit complete');
    } catch (error) {
      console.error('❌ Error updating job:', error);
      alert('Failed to update job. Please try again. Error: ' + error.message);
    }
  };

  const handleDeleteJob = async (id, jobTitle) => {
    console.log('🗑️ handleDeleteJob called for:', jobTitle, id);
    
    if (window.confirm(`Are you sure you want to delete "${jobTitle}"?`)) {
      try {
        await deleteJobFromFirebase(id);
        console.log('✅ Job deleted successfully');
        
        if (viewingJob && viewingJob.id === id) {
          resetForm();
        }
        await loadJobs();
      } catch (error) {
        console.error('❌ Error deleting job:', error);
        alert('Failed to delete job. Please try again. Error: ' + error.message);
      }
    }
  };

  const handleUpdateStatus = async (jobId, newStatus, jobs) => {
    console.log('🔄 handleUpdateStatus called:', jobId, newStatus);
    
    try {
      const { updateJob } = await import('./../jobsService');
      const job = jobs.find(j => j.id === jobId);
      
      if (!job) {
        console.error('❌ Job not found:', jobId);
        return;
      }
      
      await updateJob(jobId, { ...job, status: newStatus });
      console.log('✅ Status updated successfully');
      await loadJobs();
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert('Failed to update status. Please try again. Error: ' + error.message);
    }
  };

  const handleClockInOut = async (jobId, clockIn, jobs, setJobs) => {
    console.log('⏰ handleClockInOut called:', jobId, clockIn ? 'CLOCK IN' : 'CLOCK OUT');
    
    try {
      const { updateJob } = await import('./../jobsService');
      const job = jobs.find(j => j.id === jobId);
      
      if (!job) {
        console.error('❌ Job not found:', jobId);
        return;
      }
      
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
          console.log('✅ Clocked out of previous job');
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
        console.log('✅ Clocked in successfully');
        
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
        console.log('✅ Clocked out successfully');
      }
      
    } catch (error) {
      console.error('❌ Error updating clock status:', error);
      alert('Failed to update clock status. Please try again. Error: ' + error.message);
      // Reload jobs on error to ensure consistency
      await loadJobs();
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