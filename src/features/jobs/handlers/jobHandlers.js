import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  getDoc 
} from 'firebase/firestore';
import { db, auth } from '../../../firebase/firebase';
import { uploadMultipleJobPhotos, deleteMultipleJobPhotos } from '../photoStorageUtils';
import { createInvoiceHandlers } from './invoiceHandlers';
import { sendJobInvitation } from '../invitationService'; // NEW

export const createJobHandlers = ({
  formData,
  editingJob,
  viewingJob,
  estimates,
  resetForm,
  loadJobs,
  setJobs
}) => {
  /**
   * NEW: Process pending invitations after job is created
   */
  const processInvitations = async (jobId, jobData, invitations) => {
    if (!invitations || invitations.length === 0) return [];
    
    const processedInvitations = [];
    const errors = [];

    for (const invitation of invitations) {
      try {
        const invitationId = await sendJobInvitation(jobId, invitation.email, jobData);
        processedInvitations.push({
          ...invitation,
          invitationId,
          status: 'pending'
        });
      } catch (error) {
        console.error(`Failed to send invitation to ${invitation.email}:`, error);
        errors.push({ email: invitation.email, error: error.message });
      }
    }

    if (errors.length > 0) {
      console.warn('Some invitations failed:', errors);
    }

    return processedInvitations;
  };

  /**
   * Handle adding a new job with photo uploads and invitations
   * UPDATED: Now processes team member invitations
   */
  const handleAddJob = async (clearEstimateModals) => {
    const userId = auth.currentUser?.uid;
    
    if (!userId) {
      alert('You must be logged in to add a job');
      return null; // Return null so caller knows it failed
    }

    try {
      if (!formData.title?.trim() || !formData.client?.trim()) {
        alert('Please fill in all required fields (Job Title and Client Name)');
        return null;
      }

      const photosToUpload = (formData.photos || []).filter(photo => photo.file);
      const pendingInvitations = formData.invitedElectricians || []; // NEW
      
      const optimisticJob = {
        id: `temp-${Date.now()}`,
        title: formData.title.trim(),
        client: formData.client.trim(),
        location: formData.location?.trim() || '',
        date: formData.date || '',
        time: formData.time || '',
        estimatedCost: formData.estimatedCost || '',
        status: formData.status || 'scheduled',
        notes: formData.notes?.trim() || '',
        estimateIds: formData.estimateIds || [],
        photos: [],
        invitedElectricians: pendingInvitations, // NEW
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _isOptimistic: true,
        _photosUploading: photosToUpload.length
      };

      resetForm(clearEstimateModals);
      console.log('📊 Modal closed immediately (optimistic UI)');

      const { getJobs, saveJobs } = await import('../../../utils/localStorageUtils');
      const currentJobs = getJobs() || [];
      const updatedJobsWithOptimistic = [optimisticJob, ...currentJobs];
      saveJobs(updatedJobsWithOptimistic);
      
      setJobs(updatedJobsWithOptimistic);
      console.log('💾 Optimistic job added to state immediately');

      const jobData = {
        title: formData.title.trim(),
        client: formData.client.trim(),
        location: formData.location?.trim() || '',
        date: formData.date || '',
        time: formData.time || '',
        estimatedCost: formData.estimatedCost || '',
        status: formData.status || 'scheduled',
        notes: formData.notes?.trim() || '',
        estimateIds: formData.estimateIds || [],
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        photos: [],
        invitedElectricians: [] // Will be updated after processing invitations
      };

      const jobRef = await addDoc(collection(db, 'users', userId, 'jobs'), jobData);
      const jobId = jobRef.id;

      console.log('✅ Job created in Firebase:', jobId);

      // NEW: Process pending invitations
      let processedInvitations = [];
      if (pendingInvitations.length > 0) {
        console.log('📧 Processing', pendingInvitations.length, 'team member invitations...');
        processedInvitations = await processInvitations(jobId, {
          title: formData.title.trim(),
          client: formData.client.trim(),
          location: formData.location?.trim() || '',
          date: formData.date || ''
        }, pendingInvitations);
        
        // Update job with processed invitations
        if (processedInvitations.length > 0) {
          await updateDoc(doc(db, 'users', userId, 'jobs', jobId), {
            invitedElectricians: processedInvitations,
            updatedAt: serverTimestamp()
          });
          console.log('✅ Job updated with', processedInvitations.length, 'invitations');
        }
      }

      let invoiceId = null;
      const hasEstimates = formData.estimateIds && formData.estimateIds.length > 0;
      const hasEstimatedCost = formData.estimatedCost && parseFloat(formData.estimatedCost) > 0;
      
      if (hasEstimates || hasEstimatedCost) {
        try {
          console.log('💳 Creating invoice automatically...');
          const invoiceHandlers = createInvoiceHandlers({
            estimates,
            jobs: [],
            loadJobs: () => {},
            setViewingInvoice: () => {}
          });
          
          invoiceId = await invoiceHandlers.createInvoiceForJob({
            ...jobData,
            id: jobId,
            title: jobData.title || jobData.name
          });
          
          if (invoiceId) {
            console.log('✅ Invoice auto-created:', invoiceId);
            await updateDoc(doc(db, 'users', userId, 'jobs', jobId), {
              invoiceId: invoiceId,
              updatedAt: serverTimestamp()
            });
            console.log('✅ Job updated with invoice ID');
          }
        } catch (error) {
          console.error('⚠️ Failed to auto-create invoice:', error);
        }
      }

      let uploadedPhotos = [];
      if (photosToUpload.length > 0) {
        console.log(`📸 Uploading ${photosToUpload.length} photos...`);
        uploadedPhotos = await uploadMultipleJobPhotos(
          photosToUpload.map(p => p.file),
          jobId,
          userId,
          (progress) => {
            console.log(`Photo upload progress: ${progress.percentage}%`);
          }
        );

        await updateDoc(doc(db, 'users', userId, 'jobs', jobId), {
          photos: uploadedPhotos,
          updatedAt: serverTimestamp()
        });
        console.log('✅ Photos uploaded successfully');
      }

      console.log('📊 Reloading with real job data');
      await loadJobs(true);

      return jobId; // NEW: Return job ID so caller can use it

    } catch (error) {
      console.error('❌ Error adding job:', error);
      alert('Failed to add job. Please try again.');
      await loadJobs(true);
      return null;
    }
  };

  /**
   * Handle editing an existing job with photo management
   * UPDATED: Now handles team member invitation updates
   */
  const handleEditJob = async (clearEstimateModals) => {
    if (!editingJob) return;

    const userId = auth.currentUser?.uid;
    
    if (!userId) {
      alert('You must be logged in to edit a job');
      return;
    }

    try {
      if (!formData.title?.trim() || !formData.client?.trim()) {
        alert('Please fill in all required fields (Job Title and Client Name)');
        return;
      }

      const jobDoc = await getDoc(doc(db, 'users', userId, 'jobs', editingJob.id));
      const existingJobData = jobDoc.data();
      const existingPhotos = existingJobData?.photos || [];
      const existingInvitations = existingJobData?.invitedElectricians || [];

      const newPhotosToUpload = (formData.photos || []).filter(photo => photo.file);
      const existingKeptPhotos = (formData.photos || []).filter(photo => photo.url);

      const removedPhotos = existingPhotos.filter(
        existingPhoto => !existingKeptPhotos.find(kept => kept.url === existingPhoto.url)
      );

      if (removedPhotos.length > 0) {
        const photoPaths = removedPhotos.map(photo => photo.path).filter(Boolean);
        if (photoPaths.length > 0) {
          await deleteMultipleJobPhotos(photoPaths);
          console.log('🗑️ Deleted', photoPaths.length, 'photos from storage');
        }
      }

      let newUploadedPhotos = [];
      if (newPhotosToUpload.length > 0) {
        newUploadedPhotos = await uploadMultipleJobPhotos(
          newPhotosToUpload.map(p => p.file),
          editingJob.id,
          userId,
          (progress) => {
            console.log(`Photo upload progress: ${progress.percentage}%`);
          }
        );
      }

      const allPhotos = [...existingKeptPhotos, ...newUploadedPhotos];

      // NEW: Process any new invitations (those without invitationId)
      const currentInvitations = formData.invitedElectricians || [];
      const newInvitations = currentInvitations.filter(inv => !inv.invitationId);
      
      let processedNewInvitations = [];
      if (newInvitations.length > 0) {
        console.log('📧 Processing', newInvitations.length, 'new invitations...');
        processedNewInvitations = await processInvitations(editingJob.id, {
          title: formData.title.trim(),
          client: formData.client.trim(),
          location: formData.location?.trim() || '',
          date: formData.date || ''
        }, newInvitations);
      }

      // Merge existing invitations with newly processed ones
      const existingProcessedInvitations = currentInvitations.filter(inv => inv.invitationId);
      const allInvitations = [...existingProcessedInvitations, ...processedNewInvitations];

      const jobData = {
        title: formData.title.trim(),
        client: formData.client.trim(),
        location: formData.location?.trim() || '',
        date: formData.date || '',
        time: formData.time || '',
        estimatedCost: formData.estimatedCost || '',
        status: formData.status || 'scheduled',
        notes: formData.notes?.trim() || '',
        estimateIds: formData.estimateIds || [],
        photos: allPhotos,
        invitedElectricians: allInvitations, // NEW
        updatedAt: serverTimestamp()
      };

      await updateDoc(doc(db, 'users', userId, 'jobs', editingJob.id), jobData);

      console.log('✅ Job updated successfully');
      
      const hasEstimates = formData.estimateIds && formData.estimateIds.length > 0;
      const hasEstimatedCost = formData.estimatedCost && parseFloat(formData.estimatedCost) > 0;
      
      if ((hasEstimates || hasEstimatedCost) && !editingJob.invoiceId) {
        try {
          console.log('💳 Creating invoice for updated job...');
          const invoiceHandlers = createInvoiceHandlers({
            estimates,
            jobs: [],
            loadJobs: () => {},
            setViewingInvoice: () => {}
          });
          
          const invoiceId = await invoiceHandlers.createInvoiceForJob({
            ...jobData,
            id: editingJob.id,
            title: jobData.title || jobData.name,
            client: jobData.client
          });
          
          if (invoiceId) {
            console.log('✅ Invoice auto-created for updated job:', invoiceId);
            await updateDoc(doc(db, 'users', userId, 'jobs', editingJob.id), {
              invoiceId: invoiceId,
              updatedAt: serverTimestamp()
            });
            console.log('✅ Job updated with invoice ID');
          }
        } catch (error) {
          console.error('⚠️ Failed to auto-create invoice:', error);
        }
      }
      
      await loadJobs(true);
      
      setTimeout(() => {
        console.log('📊 Closing modal after render cycle');
        resetForm(clearEstimateModals);
      }, 300);

    } catch (error) {
      console.error('❌ Error updating job:', error);
      alert('Failed to update job. Please try again.');
    }
  };

  /**
   * Handle deleting a job with all associated photos
   * Note: Invitations are not automatically cleaned up here
   * The Cloud Function cleanup will handle orphaned invitations
   */
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    const userId = auth.currentUser?.uid;
    
    if (!userId) {
      alert('You must be logged in to delete a job');
      return;
    }

    try {
      const jobDoc = await getDoc(doc(db, 'users', userId, 'jobs', jobId));
      const jobData = jobDoc.data();
      
      if (jobData?.photos && jobData.photos.length > 0) {
        const photoPaths = jobData.photos.map(photo => photo.path).filter(Boolean);
        if (photoPaths.length > 0) {
          await deleteMultipleJobPhotos(photoPaths);
          console.log('🗑️ Deleted', photoPaths.length, 'photos from storage');
        }
      }

      // Note: Invitations in jobInvitations collection will be orphaned
      // but the cleanup Cloud Function handles this periodically

      await deleteDoc(doc(db, 'users', userId, 'jobs', jobId));

      resetForm();

      await loadJobs(true);

      console.log('✅ Job deleted successfully');
    } catch (error) {
      console.error('❌ Error deleting job:', error);
      alert('Failed to delete job. Please try again.');
    }
  };

  /**
   * Handle updating job status (no photo changes)
   */
  const handleUpdateStatus = async (jobId, newStatus, jobs) => {
    const userId = auth.currentUser?.uid;
    
    if (!userId) return;

    try {
      const jobRef = doc(db, 'users', userId, 'jobs', jobId);
      await updateDoc(jobRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      await loadJobs(true);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  /**
   * Handle clock in/out with OPTIMISTIC UI updates for instant responsiveness
   * Works for both owned jobs and shared jobs
   */
  const handleClockInOut = async (jobId, clockIn, jobs, setJobs) => {
    const userId = auth.currentUser?.uid;
    
    if (!userId) return;

    try {
      const job = jobs.find(j => j.id === jobId);
      if (!job) return;

      // Check if another job is already clocked in (only when clocking IN)
      if (clockIn) {
        const clockedInJob = jobs.find(j => j.clockedIn && j.id !== jobId);
        if (clockedInJob) {
          alert('Please clock out of the current job before clocking into a new one.');
          return;
        }
      }

      // ⚡ OPTIMISTIC UPDATE - Update UI immediately for instant feedback
      const now = new Date();
      let optimisticJob;

      if (clockIn) {
        // Clocking IN
        optimisticJob = {
          ...job,
          clockedIn: true,
          currentSessionStart: now.toISOString(),
          updatedAt: now.toISOString()
        };
      } else {
        // Clocking OUT
        const currentSessionStart = new Date(job.currentSessionStart);
        const sessionDuration = (now - currentSessionStart) / 1000; // in seconds

        const workSessions = job.workSessions || [];
        const newSession = {
          startTime: job.currentSessionStart,
          endTime: now.toISOString(),
          duration: sessionDuration
        };

        optimisticJob = {
          ...job,
          clockedIn: false,
          currentSessionStart: null,
          workSessions: [...workSessions, newSession],
          updatedAt: now.toISOString()
        };
      }

      // Update state INSTANTLY - this gives immediate visual feedback
      const optimisticJobs = jobs.map(j => j.id === jobId ? optimisticJob : j);
      setJobs(optimisticJobs);
      
      // Update localStorage cache immediately too
      const { saveJobs } = await import('../../../utils/localStorageUtils');
      saveJobs(optimisticJobs);

      console.log(`⚡ Optimistic ${clockIn ? 'clock in' : 'clock out'} - UI updated instantly`);

      // 🔄 BACKGROUND SYNC - Update Firebase in the background
      const jobRef = doc(db, 'users', userId, 'jobs', jobId);

      if (clockIn) {
        await updateDoc(jobRef, {
          clockedIn: true,
          currentSessionStart: now.toISOString(),
          updatedAt: serverTimestamp()
        });
      } else {
        await updateDoc(jobRef, {
          clockedIn: false,
          currentSessionStart: null,
          workSessions: optimisticJob.workSessions,
          updatedAt: serverTimestamp()
        });
      }

      console.log(`✅ Firebase synced for ${clockIn ? 'clock in' : 'clock out'}`);

      // Optional: Reload in background to ensure consistency (non-blocking)
      loadJobs(true).catch(err => {
        console.warn('Background reload failed, keeping optimistic state:', err);
      });

    } catch (error) {
      console.error('Error toggling clock:', error);
      alert('Failed to update clock status. Please try again.');
      
      // On error, reload to restore correct state
      await loadJobs(true);
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