import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  getDoc 
} from 'firebase/firestore';
import { db, auth } from '../../../firebase/firebase'; // Import BOTH db and auth
import { uploadMultipleJobPhotos, deleteMultipleJobPhotos } from '../photoStorageUtils';

export const createJobHandlers = ({
  formData,
  editingJob,
  viewingJob,
  estimates,
  resetForm,
  loadJobs
}) => {
  /**
   * Handle adding a new job with photo uploads
   */
  const handleAddJob = async (clearEstimateModals) => {
    // Get userId from Firebase Auth
    const userId = auth.currentUser?.uid;
    
    if (!userId) {
      alert('You must be logged in to add a job');
      return;
    }

    try {
      // Validate required fields
      if (!formData.title?.trim() || !formData.client?.trim()) {
        alert('Please fill in all required fields (Job Title and Client Name)');
        return;
      }

      // Prepare photos array (filter out any that are still uploading)
      const photosToUpload = (formData.photos || []).filter(photo => photo.file);
      
      // Create the job document first
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
        photos: [] // Will be updated after upload
      };

      // Add job to Firestore - FIXED PATH to users subcollection
      const jobRef = await addDoc(collection(db, 'users', userId, 'jobs'), jobData);
      const jobId = jobRef.id;

      // Upload photos if any
      let uploadedPhotos = [];
      if (photosToUpload.length > 0) {
        uploadedPhotos = await uploadMultipleJobPhotos(
          photosToUpload.map(p => p.file),
          jobId,
          userId,
          (progress) => {
            console.log(`Photo upload progress: ${progress.percentage}%`);
          }
        );

        // Update job with photo URLs - FIXED PATH
        await updateDoc(doc(db, 'users', userId, 'jobs', jobId), {
          photos: uploadedPhotos,
          updatedAt: serverTimestamp()
        });
      }

      // Reload jobs to show the new job
      await loadJobs();
      
      // Reset form and close modal
      resetForm(clearEstimateModals);

      console.log('✅ Job added successfully with', uploadedPhotos.length, 'photos');
    } catch (error) {
      console.error('❌ Error adding job:', error);
      alert('Failed to add job. Please try again.');
    }
  };

  /**
   * Handle editing an existing job with photo management
   */
  const handleEditJob = async (clearEstimateModals) => {
    if (!editingJob) return;

    // Get userId from Firebase Auth
    const userId = auth.currentUser?.uid;
    
    if (!userId) {
      alert('You must be logged in to edit a job');
      return;
    }

    try {
      // Validate required fields
      if (!formData.title?.trim() || !formData.client?.trim()) {
        alert('Please fill in all required fields (Job Title and Client Name)');
        return;
      }

      // Get existing photos from Firestore - FIXED PATH
      const jobDoc = await getDoc(doc(db, 'users', userId, 'jobs', editingJob.id));
      const existingPhotos = jobDoc.data()?.photos || [];

      // Separate new photos (with file) from existing photos (with url)
      const newPhotosToUpload = (formData.photos || []).filter(photo => photo.file);
      const existingKeptPhotos = (formData.photos || []).filter(photo => photo.url);

      // Find photos that were removed (in existing but not in current form)
      const removedPhotos = existingPhotos.filter(
        existingPhoto => !existingKeptPhotos.find(kept => kept.url === existingPhoto.url)
      );

      // Delete removed photos from Firebase Storage
      if (removedPhotos.length > 0) {
        const photoPaths = removedPhotos.map(photo => photo.path).filter(Boolean);
        if (photoPaths.length > 0) {
          await deleteMultipleJobPhotos(photoPaths);
          console.log('🗑️ Deleted', photoPaths.length, 'photos from storage');
        }
      }

      // Upload new photos
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

      // Combine existing kept photos with newly uploaded photos
      const allPhotos = [...existingKeptPhotos, ...newUploadedPhotos];

      // Update job document
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
        updatedAt: serverTimestamp()
      };

      // FIXED PATH
      await updateDoc(doc(db, 'users', userId, 'jobs', editingJob.id), jobData);

      // Reload jobs to show updated data
      await loadJobs();

      // Reset form and close modal
      resetForm(clearEstimateModals);

      console.log('✅ Job updated successfully');
    } catch (error) {
      console.error('❌ Error updating job:', error);
      alert('Failed to update job. Please try again.');
    }
  };

  /**
   * Handle deleting a job with all associated photos
   */
  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    // Get userId from Firebase Auth
    const userId = auth.currentUser?.uid;
    
    if (!userId) {
      alert('You must be logged in to delete a job');
      return;
    }

    try {
      // Get job document to find photos - FIXED PATH
      const jobDoc = await getDoc(doc(db, 'users', userId, 'jobs', jobId));
      const jobData = jobDoc.data();
      
      // Delete all photos from storage if they exist
      if (jobData?.photos && jobData.photos.length > 0) {
        const photoPaths = jobData.photos.map(photo => photo.path).filter(Boolean);
        if (photoPaths.length > 0) {
          await deleteMultipleJobPhotos(photoPaths);
          console.log('🗑️ Deleted', photoPaths.length, 'photos from storage');
        }
      }

      // Delete job document - FIXED PATH
      await deleteDoc(doc(db, 'users', userId, 'jobs', jobId));

      // Reload jobs
      await loadJobs();

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
    // Get userId from Firebase Auth
    const userId = auth.currentUser?.uid;
    
    if (!userId) return;

    try {
      // FIXED PATH
      const jobRef = doc(db, 'users', userId, 'jobs', jobId);
      await updateDoc(jobRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      await loadJobs();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  /**
   * Handle clock in/out (no photo changes)
   */
  const handleClockInOut = async (jobId, clockIn, jobs, setJobs) => {
    // Get userId from Firebase Auth
    const userId = auth.currentUser?.uid;
    
    if (!userId) return;

    try {
      const job = jobs.find(j => j.id === jobId);
      // FIXED PATH
      const jobRef = doc(db, 'users', userId, 'jobs', jobId);

      if (clockIn) {
        // Check if another job is already clocked in
        const clockedInJob = jobs.find(j => j.clockedIn && j.id !== jobId);
        if (clockedInJob) {
          alert('Please clock out of the current job before clocking into a new one.');
          return;
        }

        // Clock in
        await updateDoc(jobRef, {
          clockedIn: true,
          currentSessionStart: new Date().toISOString(),
          updatedAt: serverTimestamp()
        });
      } else {
        // Clock out
        const currentSessionStart = new Date(job.currentSessionStart);
        const currentSessionEnd = new Date();
        const sessionDuration = (currentSessionEnd - currentSessionStart) / 1000; // in seconds

        const workSessions = job.workSessions || [];
        workSessions.push({
          startTime: job.currentSessionStart,
          endTime: currentSessionEnd.toISOString(),
          duration: sessionDuration
        });

        await updateDoc(jobRef, {
          clockedIn: false,
          currentSessionStart: null,
          workSessions,
          updatedAt: serverTimestamp()
        });
      }

      await loadJobs();
    } catch (error) {
      console.error('Error toggling clock:', error);
      alert('Failed to update clock status. Please try again.');
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