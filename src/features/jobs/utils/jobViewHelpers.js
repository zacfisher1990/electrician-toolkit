/**
 * Helper functions for job view operations
 * UPDATED: Now includes invitedElectricians handling
 */

export const openJobView = ({
  job,
  estimates,
  setViewingJob,
  setEditingJob,
  setFormData,
  setLinkedEstimates
}) => {
  setViewingJob(job);
  setEditingJob(job);
  setFormData({
    title: job.title || job.name,
    client: job.client,
    location: job.location || '',
    status: job.status,
    date: job.date || '',
    time: job.time || '',
    estimatedCost: job.estimatedCost || '',
    duration: job.duration || '',
    notes: job.notes || '',
    estimateIds: job.estimateIds || [],
    photos: job.photos || [],
    invitedElectricians: job.invitedElectricians || [] // NEW: Load team members
  });
  
  // Load linked estimates based on estimateIds array
  if (job.estimateIds && job.estimateIds.length > 0) {
    const linkedEstimatesArray = estimates.filter(est => 
      job.estimateIds.includes(est.id)
    );
    setLinkedEstimates(linkedEstimatesArray);
  } else {
    // Fallback: check for old singular estimateId format
    if (job.estimateId) {
      const estimate = estimates.find(e => e.id === job.estimateId);
      if (estimate) {
        setLinkedEstimates([estimate]);
      } else {
        setLinkedEstimates([]);
      }
    } else {
      setLinkedEstimates([]);
    }
  }
};

export const handleViewEstimateFromCard = ({
  job,
  estimates,
  setLinkedEstimates,
  setShowCombinedEstimatesModal,
  setViewingSingleEstimate
}) => {
  // If job has multiple estimates, show combined summary
  if (job.estimateIds && job.estimateIds.length > 1) {
    const jobEstimates = estimates.filter(est => 
      job.estimateIds.includes(est.id)
    );
    setLinkedEstimates(jobEstimates);
    setShowCombinedEstimatesModal(true);
  } 
  // If job has exactly 1 estimate, show single estimate modal
  else if (job.estimateIds && job.estimateIds.length === 1) {
    const estimate = estimates.find(e => e.id === job.estimateIds[0]);
    if (estimate) {
      setViewingSingleEstimate(estimate);
    }
  }
  // Fallback for old estimateId format
  else if (job.estimateId) {
    const estimate = estimates.find(e => e.id === job.estimateId);
    if (estimate) {
      setViewingSingleEstimate(estimate);
    }
  }
};

/**
 * NEW: Open shared job view (for team members with limited permissions)
 */
export const openSharedJobView = ({
  job,
  setViewingJob,
  setFormData
}) => {
  setViewingJob(job);
  // For shared jobs, we don't set editingJob since they can't edit
  setFormData({
    title: job.title || job.name,
    client: job.client,
    location: job.location || '',
    status: job.status,
    date: job.date || '',
    time: job.time || '',
    estimatedCost: '', // Hidden for shared jobs
    notes: job.notes || '',
    estimateIds: [], // Hidden for shared jobs
    photos: job.photos || [],
    invitedElectricians: [] // Not relevant for shared job view
  });
};