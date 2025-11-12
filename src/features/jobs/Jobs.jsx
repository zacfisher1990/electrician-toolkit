import React, { useState, useEffect, useMemo } from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getColors } from '../../theme'; // Import theme
import styles from './Jobs.module.css';
import StatusTabs from './StatusTabs';
import JobsHeader from './JobsHeader';
import AddJobSection from './AddJobSection';
import JobsList from './JobsList';
import ModalsContainer from './ModalsContainer';
import VerificationRequiredModal from '../../components/VerificationRequiredModal';

// Custom Hooks
import { useJobsState } from './hooks/useJobsState';
import { useJobForm } from './hooks/useJobForm';
import { useModals } from './hooks/useModals';

// Handler creators
import { createJobHandlers } from './handlers/jobHandlers';
import { createEstimateHandlers } from './handlers/estimateHandlers';
import { createInvoiceHandlers } from './handlers/invoiceHandlers';

// Utilities
import { filterJobs, getStatusCounts } from './utils/jobsUtils';
import { openJobView, handleViewEstimateFromCard } from './utils/jobViewHelpers';

const Jobs = ({ isDarkMode, onNavigateToEstimates, onClockedInJobChange, prefilledDate, navigationData, isEmailVerified, onResendVerification }) => {
  // State from custom hooks
  const {
    jobs,
    setJobs,
    loading,
    estimates,
    setEstimates,
    isUserLoggedIn,
    loadJobs,
    loadEstimatesWithCache
  } = useJobsState();

  const {
    formData,
    setFormData,
    showAddForm,
    setShowAddForm,
    viewingJob,
    setViewingJob,
    editingJob,
    setEditingJob,
    linkedEstimates,
    setLinkedEstimates,
    showEstimateMenu,
    setShowEstimateMenu,
    estimateMenuRef,
    lastSyncedJobId,
    resetForm
  } = useJobForm();

  const {
    showAuthModal,
    setShowAuthModal,
    showCombinedEstimatesModal,
    setShowCombinedEstimatesModal,
    viewingSingleEstimate,
    setViewingSingleEstimate,
    viewingInvoice,
    setViewingInvoice,
    statusDropdownOpen,
    setStatusDropdownOpen
  } = useModals();

  // Local state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusTab, setActiveStatusTab] = useState('all');
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  // Create a function to clear estimate modals
  const clearEstimateModals = () => {
    setViewingSingleEstimate(null);
    setShowCombinedEstimatesModal(false);
  };

  // Get colors from centralized theme
  const colors = getColors(isDarkMode);

  const statusConfig = {
    'scheduled': { 
      color: colors.blue, 
      icon: Clock, 
      label: 'Scheduled' 
    },
    'in-progress': { 
      color: colors.amber, 
      icon: AlertCircle, 
      label: 'In Progress' 
    },
    'completed': { 
      color: colors.green, 
      icon: CheckCircle, 
      label: 'Completed' 
    }
  };

  // Sync estimates when editing a job
  useEffect(() => {
    if (editingJob && estimates.length > 0 && editingJob.estimateIds?.length > 0) {
      if (editingJob.id !== lastSyncedJobId.current) {
        const linkedEstimatesArray = estimates.filter(est => 
          editingJob.estimateIds.includes(est.id)
        );
        setLinkedEstimates(linkedEstimatesArray);
        lastSyncedJobId.current = editingJob.id;
      }
    } else if (!editingJob) {
      lastSyncedJobId.current = null;
    }
  }, [estimates, editingJob, setLinkedEstimates, lastSyncedJobId]);

  // Handle prefilled date from Home calendar
  useEffect(() => {
    if (prefilledDate && isUserLoggedIn && isEmailVerified) {
      setShowAddForm(true);
      setFormData({
        title: '',
        client: '',
        location: '',
        status: 'scheduled',
        date: prefilledDate,
        time: '',
        estimatedCost: '',
        notes: '',
        estimateIds: [],
        photos: []
      });
      setLinkedEstimates([]);
    } else if (prefilledDate && isUserLoggedIn && !isEmailVerified) {
      // Show verification modal if user is logged in but not verified
      setShowVerificationModal(true);
    }
  }, [prefilledDate, isUserLoggedIn, isEmailVerified, setShowAddForm, setFormData, setLinkedEstimates]);

  // Notify parent of clocked-in job changes INSTANTLY
  useEffect(() => {
    const clockedJob = jobs.find(job => job.clockedIn === true) || null;
    if (onClockedInJobChange) {
      onClockedInJobChange(clockedJob);
    }
  }, [jobs, onClockedInJobChange]);

  // Handle navigation back from Estimates - reload fresh data (cache already cleared in App.jsx)
  useEffect(() => {
    if (navigationData?.openJobId) {
      console.log('📂 Reloading data after cache clear');
      
      // Cache was already cleared in App.jsx, so loadJobs will fetch fresh
      loadJobs();
      loadEstimatesWithCache();
    }
  }, [navigationData?.openJobId, loadJobs, loadEstimatesWithCache]);

  // Separate effect to open the job after data is reloaded
  useEffect(() => {
    if (navigationData?.openJobId && jobs.length > 0 && estimates.length > 0) {
      const jobToOpen = jobs.find(j => j.id === navigationData.openJobId);
      
      // Check if this job actually has the new estimate ID
      if (jobToOpen && jobToOpen.estimateIds?.includes(navigationData.newEstimateId)) {
        console.log('✅ Job data refreshed with new estimate, opening job');
        handleOpenJobView(jobToOpen);
      }
    }
  }, [jobs, estimates, navigationData?.openJobId, navigationData?.newEstimateId]);

  // Create handlers
  const jobHandlers = createJobHandlers({
    formData,
    editingJob,
    viewingJob,
    estimates,
    resetForm,
    loadJobs,
    setJobs
  });

  const estimateHandlers = createEstimateHandlers({
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
  });

  const invoiceHandlers = createInvoiceHandlers({
    estimates,
    jobs,
    loadJobs,
    setViewingInvoice
  });

  // Specific handlers
  const handleAddJobClick = () => {
    if (!isUserLoggedIn) {
      // User not logged in - show auth modal
      setShowAuthModal(true);
    } else if (!isEmailVerified) {
      // User logged in but not verified - show verification modal
      setShowVerificationModal(true);
    } else {
      // User logged in and verified - proceed with job creation
      setShowAddForm(true);
      // Reset form data for new job
      setFormData({
        title: '',
        client: '',
        location: '',
        status: 'scheduled',
        date: '',
        time: '',
        estimatedCost: '',
        notes: '',
        estimateIds: [],
        photos: []
      });
      setLinkedEstimates([]);
    }
  };

  const handleUpdateStatusWrapper = (jobId, newStatus) => {
    jobHandlers.handleUpdateStatus(jobId, newStatus, jobs);
    setStatusDropdownOpen(null);
  };

  const handleClockInOutWrapper = (jobId, clockIn) => {
    jobHandlers.handleClockInOut(jobId, clockIn, jobs, setJobs);
  };

  const handleOpenJobView = (job) => {
    console.log('📂 Opening job, clearing estimate modals');
    // FORCE CLEAR everything before opening
    setViewingSingleEstimate(null);
    setShowCombinedEstimatesModal(false);
    
    // Get linked estimates for this job
    const jobLinkedEstimates = job.estimateIds?.length > 0 
      ? estimates.filter(est => job.estimateIds.includes(est.id))
      : [];
    
    // Calculate total cost from linked estimates
    const totalFromEstimates = jobLinkedEstimates.reduce((total, estimate) => {
      const estimateTotal = estimate.total || estimate.estimatedCost || 0;
      return total + Number(estimateTotal);
    }, 0);
    
    // Use calculated total if estimates exist, otherwise use job's stored cost
    const costToUse = jobLinkedEstimates.length > 0 
      ? totalFromEstimates.toString() 
      : (job.estimatedCost || job.cost || '');
    
    openJobView({
      job: {
        ...job,
        estimatedCost: costToUse // Override with calculated cost
      },
      estimates,
      setViewingJob,
      setEditingJob,
      setFormData,
      setLinkedEstimates
    });
  };

  const handleViewEstimateFromCardWrapper = (job) => {
    handleViewEstimateFromCard({
      job,
      estimates,
      setLinkedEstimates,
      setShowCombinedEstimatesModal,
      setViewingSingleEstimate
    });
  };

  const handleViewCombinedEstimates = () => {
    setShowCombinedEstimatesModal(true);
  };

  const handleViewSingleEstimateFromCombined = (estimate) => {
    setShowCombinedEstimatesModal(false);
    setViewingSingleEstimate(estimate);
  };

  const handleCloseSingleEstimate = () => {
    setViewingSingleEstimate(null);
    // Only reopen combined modal if NOT currently editing/viewing a job
    if (!editingJob && !viewingJob) {
      setShowCombinedEstimatesModal(true);
    }
  };

  // Filter and count - use useMemo to ensure these recompute when jobs changes
  const filteredJobs = useMemo(() => {
    console.log('🔄 Recomputing filteredJobs, jobs.length:', jobs.length);
    return filterJobs(jobs, searchQuery, activeStatusTab);
  }, [jobs, searchQuery, activeStatusTab]);
  
  const statusCounts = useMemo(() => {
    return getStatusCounts(jobs);
  }, [jobs]);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: colors.mainBg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: colors.subtext }}>Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="jobs-container">
      {/* Verification Modal */}
      <VerificationRequiredModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        isDarkMode={isDarkMode}
        featureName="create new jobs"
        onResendVerification={onResendVerification}
      />

      <ModalsContainer
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
        showAddForm={showAddForm}
        setShowAddForm={setShowAddForm}
        viewingJob={viewingJob}
        formData={formData}
        setFormData={setFormData}
        linkedEstimates={linkedEstimates}
        estimates={estimates}
        showEstimateMenu={showEstimateMenu}
        handleEstimateMenuOpen={estimateHandlers.handleEstimateMenuOpen}
        onSelectEstimate={estimateHandlers.handleSelectEstimate}
        onCreateNewEstimate={estimateHandlers.handleCreateNewEstimate}
        onViewEstimate={estimateHandlers.handleViewEstimate}
        onRemoveEstimate={estimateHandlers.handleRemoveEstimate}
        onAddAdditionalEstimate={estimateHandlers.handleAddAdditionalEstimate}
        handleViewCombinedEstimates={handleViewCombinedEstimates}
        estimateMenuRef={estimateMenuRef}
        resetForm={() => resetForm(clearEstimateModals)}
        handleAddJob={jobHandlers.handleAddJob}
        handleEditJob={jobHandlers.handleEditJob}
        handleDeleteJob={jobHandlers.handleDeleteJob}
        showCombinedEstimatesModal={showCombinedEstimatesModal}
        setShowCombinedEstimatesModal={setShowCombinedEstimatesModal}
        handleViewSingleEstimateFromCombined={handleViewSingleEstimateFromCombined}
        viewingSingleEstimate={viewingSingleEstimate}
        handleCloseSingleEstimate={handleCloseSingleEstimate}
        viewingInvoice={viewingInvoice}
        setViewingInvoice={setViewingInvoice}
        handleSaveInvoice={invoiceHandlers.handleSaveInvoice}
        isDarkMode={isDarkMode}
        colors={colors}
      />

      <div style={{ 
        minHeight: '100vh', 
        background: colors.mainBg,
        paddingBottom: '5rem'
      }}>
        <div style={{ padding: '1rem 0.25rem' }}>
          <StatusTabs
            activeStatusTab={activeStatusTab}
            setActiveStatusTab={setActiveStatusTab}
            statusCounts={statusCounts}
            colors={colors}
          />

          <JobsHeader
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeStatusTab={activeStatusTab}
            filteredJobsCount={filteredJobs.length}
            statusConfig={statusConfig}
            colors={colors}
          />

          <AddJobSection
            handleAddJobClick={handleAddJobClick}
            isDarkMode={isDarkMode}
            colors={colors}
          />

          <JobsList
            key={`jobs-list-${jobs.length}-${jobs[0]?.id || 'empty'}`}
            filteredJobs={filteredJobs}
            searchQuery={searchQuery}
            activeStatusTab={activeStatusTab}
            statusConfig={statusConfig}
            statusDropdownOpen={statusDropdownOpen}
            setStatusDropdownOpen={setStatusDropdownOpen}
            onUpdateStatus={handleUpdateStatusWrapper}
            onViewJob={handleOpenJobView}
            onViewEstimate={handleViewEstimateFromCardWrapper}
            onViewInvoice={invoiceHandlers.handleViewInvoice}
            onClockInOut={handleClockInOutWrapper}
            estimates={estimates}
            isDarkMode={isDarkMode}
            colors={colors}
          />
        </div>
      </div>
    </div>
  );
};

export default Jobs;