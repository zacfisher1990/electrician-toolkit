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
    console.log('🔗 handleSelectEstimate called with:', estimate);
    console.log('📋 Current formData.estimateIds:', formData.estimateIds);
    console.log('📋 Current linkedEstimates:', linkedEstimates);
    
    // Ensure estimateIds is an array
    const currentEstimateIds = Array.isArray(formData.estimateIds) ? formData.estimateIds : [];
    
    // Check if estimate is already linked
    if (currentEstimateIds.includes(estimate.id)) {
      alert('This estimate is already linked to this job');
      setShowEstimateMenu(false);
      return;
    }

    // Add estimate to the array
    const newEstimateIds = [...currentEstimateIds, estimate.id];
    const newLinkedEstimates = [...linkedEstimates, estimate];
    
    console.log('✅ New estimateIds:', newEstimateIds);
    console.log('✅ New linkedEstimates:', newLinkedEstimates);
    
    setLinkedEstimates(newLinkedEstimates);
    
    // Calculate new total cost
    const totalCost = calculateTotalFromEstimates(newEstimateIds);
    
    setFormData(prev => ({
      ...prev,
      title: prev.title || estimate.title || estimate.name,
      client: prev.client || estimate.client,
      location: prev.location || estimate.location,
      estimatedCost: totalCost.toString(),
      estimateIds: newEstimateIds
    }));
    setShowEstimateMenu(false);
    
    console.log('✅ Estimate added successfully');
  };

  const handleRemoveEstimate = (estimateId) => {
    console.log('🗑️ handleRemoveEstimate called with:', estimateId);
    console.log('📋 Current formData.estimateIds:', formData.estimateIds);
    
    // Ensure estimateIds is an array
    const currentEstimateIds = Array.isArray(formData.estimateIds) ? formData.estimateIds : [];
    
    // Remove estimate from the array
    const newEstimateIds = currentEstimateIds.filter(id => id !== estimateId);
    const newLinkedEstimates = linkedEstimates.filter(e => e.id !== estimateId);
    
    console.log('✅ New estimateIds after removal:', newEstimateIds);
    console.log('✅ New linkedEstimates after removal:', newLinkedEstimates);
    
    setLinkedEstimates(newLinkedEstimates);
    
    // Recalculate total cost
    const totalCost = calculateTotalFromEstimates(newEstimateIds);
    
    setFormData(prev => ({
      ...prev,
      estimatedCost: totalCost.toString(),
      estimateIds: newEstimateIds
    }));
    
    console.log('✅ Estimate removed successfully');
  };

  const handleCreateNewEstimate = async () => {
    console.log('🆕 handleCreateNewEstimate called');
    setShowEstimateMenu(false);
    
    if (showAddForm && formData.title && formData.client) {
      try {
        // Build job data and filter out undefined/empty values
        const rawJobData = {
          name: formData.title,
          title: formData.title,
          client: formData.client,
          location: formData.location,
          status: formData.status,
          date: formData.date,
          time: formData.time,
          estimatedCost: formData.estimatedCost,
          notes: formData.notes,
          estimateIds: formData.estimateIds || []
        };
        
        // Filter out undefined, null, and empty string values
        const jobData = Object.fromEntries(
          Object.entries(rawJobData).filter(([key, value]) => {
            // Keep arrays even if empty
            if (Array.isArray(value)) return true;
            // Filter out undefined, null, and empty strings
            return value !== undefined && value !== null && value !== '';
          })
        );

        const jobId = await createJob(jobData);
        
        const estimateData = {
          createNew: true, // Flag to open the estimate form
          jobId: jobId,
          jobName: formData.title,
          jobClient: formData.client,
          jobLocation: formData.location
        };
        
        if (onNavigateToEstimates) {
          onNavigateToEstimates('estimates', estimateData);
        }
        
        resetForm();
        loadJobs();
      } catch (error) {
        console.error('Error creating job:', error);
        alert('Failed to create job. Please try again.');
      }
    } else if (viewingJob) {
      const estimateData = {
        createNew: true, // Flag to open the estimate form
        jobId: viewingJob.id,
        jobName: viewingJob.title || viewingJob.name,
        jobClient: viewingJob.client,
        jobLocation: viewingJob.location
      };
      
      if (onNavigateToEstimates) {
        onNavigateToEstimates('estimates', estimateData);
      }
    } else {
      // User is creating a new job but hasn't filled in required fields yet
      // Navigate to estimates with just the createNew flag and any partial data
      if (onNavigateToEstimates) {
        onNavigateToEstimates('estimates', { 
          createNew: true,
          jobName: formData.title || '',
          jobClient: formData.client || '',
          jobLocation: formData.location || ''
        });
      }
    }
  };

  const handleEstimateMenuOpen = async (value) => {
    console.log('📂 handleEstimateMenuOpen called with:', value);
    setShowEstimateMenu(value);
    
    if (value === true) {
      try {
        const userEstimates = await getUserEstimates();
        console.log('📊 Loaded estimates:', userEstimates.length);
        setEstimates(userEstimates);
      } catch (error) {
        console.error('Error loading estimates:', error);
      }
    }
  };

  const handleAddAdditionalEstimate = () => {
    console.log('➕ handleAddAdditionalEstimate called');
    setShowEstimateMenu(true);
  };

  const handleViewEstimate = (estimate) => {
    console.log('👁️ handleViewEstimate called with:', estimate);
    if (onNavigateToEstimates) {
      onNavigateToEstimates('estimates', { viewEstimateId: estimate.id });
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