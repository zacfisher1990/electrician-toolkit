import { createJob } from './../jobsService';
import { getUserEstimates } from '../../estimates/estimatesService';

/**
 * Estimate operation handlers
 */
export const createEstimateHandlers = ({
  formData,
  setFormData,
  linkedEstimates,
  setLinkedEstimates,
  setShowEstimateMenu,
  showAddForm,
  viewingJob,
  resetForm,
  loadJobs,
  onNavigateToEstimates,
  estimates,
  setEstimates
}) => {

  const calculateTotalFromEstimates = (estimateIds) => {
    if (!estimateIds || estimateIds.length === 0) return 0;
    
    return estimateIds.reduce((total, estimateId) => {
      const estimate = estimates.find(e => e.id === estimateId);
      if (estimate) {
        return total + Number(estimate.total || estimate.estimatedCost || 0);
      }
      return total;
    }, 0);
  };

  const handleSelectEstimate = (estimate) => {
    // Check if estimate is already linked
    if (formData.estimateIds.includes(estimate.id)) {
      alert('This estimate is already linked to this job');
      setShowEstimateMenu(false);
      return;
    }

    // Add estimate to the array
    const newEstimateIds = [...formData.estimateIds, estimate.id];
    const newLinkedEstimates = [...linkedEstimates, estimate];
    
    setLinkedEstimates(newLinkedEstimates);
    
    // Calculate new total cost
    const totalCost = calculateTotalFromEstimates(newEstimateIds);
    
    setFormData(prev => ({
      ...prev,
      title: prev.title || estimate.title,
      client: prev.client || estimate.client,
      location: prev.location || estimate.location,
      estimatedCost: totalCost.toString(),
      estimateIds: newEstimateIds
    }));
    setShowEstimateMenu(false);
  };

  const handleRemoveEstimate = (estimateId) => {
    // Remove estimate from the array
    const newEstimateIds = formData.estimateIds.filter(id => id !== estimateId);
    const newLinkedEstimates = linkedEstimates.filter(e => e.id !== estimateId);
    
    setLinkedEstimates(newLinkedEstimates);
    
    // Recalculate total cost
    const totalCost = calculateTotalFromEstimates(newEstimateIds);
    
    setFormData(prev => ({
      ...prev,
      estimatedCost: totalCost.toString(),
      estimateIds: newEstimateIds
    }));
  };

  const handleCreateNewEstimate = async () => {
    setShowEstimateMenu(false);
    
    if (showAddForm && formData.title && formData.client) {
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
          notes: formData.notes
        };

        const jobId = await createJob(jobData);
        
        const estimateData = {
          jobId: jobId,
          jobName: formData.title,
          jobClient: formData.client
        };
        
        if (onNavigateToEstimates) {
          onNavigateToEstimates(estimateData);
        }
        
        resetForm();
        loadJobs();
      } catch (error) {
        console.error('Error creating job:', error);
        alert('Failed to create job. Please try again.');
      }
    } else if (viewingJob) {
      const estimateData = {
        jobId: viewingJob.id,
        jobName: viewingJob.title || viewingJob.name,
        jobClient: viewingJob.client
      };
      
      if (onNavigateToEstimates) {
        onNavigateToEstimates(estimateData);
      }
    } else {
      alert('Please fill in the job title and client name first.');
    }
  };

  const handleEstimateMenuOpen = async (value) => {
    setShowEstimateMenu(value);
    
    if (value === true) {
      try {
        const userEstimates = await getUserEstimates();
        setEstimates(userEstimates);
      } catch (error) {
        console.error('Error loading estimates:', error);
      }
    }
  };

  const handleAddAdditionalEstimate = () => {
    console.log('handleAddAdditionalEstimate called');
    setShowEstimateMenu(true);
  };

  const handleViewEstimate = (estimateId) => {
    if (onNavigateToEstimates) {
      onNavigateToEstimates({ viewEstimateId: estimateId });
    }
  };

  return {
    handleSelectEstimate,
    handleRemoveEstimate,
    handleCreateNewEstimate,
    handleEstimateMenuOpen,
    handleAddAdditionalEstimate,
    handleViewEstimate,
    calculateTotalFromEstimates
  };
};