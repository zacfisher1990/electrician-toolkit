import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { getColors } from '../../theme'; // Import theme
import styles from './Jobs.module.css';
import StatusTabs from './StatusTabs';
import JobsHeader from './JobsHeader';
import AddJobSection from './AddJobSection';
import JobsList from './JobsList';
import ModalsContainer from './ModalsContainer';
import VerificationRequiredModal from '../../components/VerificationRequiredModal';
import Toast from '../../components/Toast'; // ADD THIS IMPORT

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

const Jobs = ({ isDarkMode, onNavigateToEstimates, onClockedInJobChange, prefilledDate, navigationData, isEmailVerified, onResendVerification, onNavigateToInvoices }) => {
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
  const [toast, setToast] = useState(null); // ADD TOAST STATE
  
  // Ref to track if we've already handled this navigation to prevent infinite loop
  const handledNavigationRef = useRef(null);

  // Toast helper function
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

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
        photos: [],
        invitedElectricians: []
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
      // Force fresh reload from Firebase (skip cache) for both jobs and estimates
      loadJobs(true);
      loadEstimatesWithCache(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigationData?.openJobId]);

  // Separate effect to open the job after data is reloaded
  useEffect(() => {
    if (navigationData?.openJobId && jobs.length > 0 && estimates.length > 0) {
      const navigationKey = `${navigationData.openJobId}-${navigationData.newEstimateId}`;
      
      // Check if we've already handled this navigation
      if (handledNavigationRef.current === navigationKey) {
        return;
      }
      
      const jobToOpen = jobs.find(j => j.id === navigationData.openJobId);
      
      // Check if this job actually has the new estimate ID
      if (jobToOpen && jobToOpen.estimateIds?.includes(navigationData.newEstimateId)) {
        handledNavigationRef.current = navigationKey; // Mark as handled
        handleOpenJobView(jobToOpen);
      }
    } else if (!navigationData?.openJobId) {
      // Reset the ref when navigation data is cleared
      handledNavigationRef.current = null;
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
        photos: [],
        invitedElectricians: []
      });
      setLinkedEstimates([]);
    }
  };

  // NEW: Invitation handlers for the form
const handleAddElectricianToJob = async (email) => {
  const newInvitation = {
    email: email.toLowerCase(),
    status: 'pending',
    invitedAt: new Date().toISOString()
  };
  
  setFormData(prev => ({
    ...prev,
    invitedElectricians: [...(prev.invitedElectricians || []), newInvitation]
  }));
};

const handleRemoveElectricianFromJob = async (email) => {
  setFormData(prev => ({
    ...prev,
    invitedElectricians: (prev.invitedElectricians || []).filter(
      inv => inv.email !== email.toLowerCase()
    )
  }));
};

  const handleUpdateStatusWrapper = (jobId, newStatus) => {
    jobHandlers.handleUpdateStatus(jobId, newStatus, jobs);
    setStatusDropdownOpen(null);
  };

  const handleClockInOutWrapper = (jobId, clockIn) => {
    jobHandlers.handleClockInOut(jobId, clockIn, jobs, setJobs);
  };

  const handleOpenJobView = (job) => {
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

  const handleNavigateToInvoices = (invoice) => {
    if (onNavigateToInvoices) {
      // Pass invoice data with viewInvoiceId to open the editor
      onNavigateToInvoices(invoice.id);
    }
  };

  const handleNavigateToEstimatesFromModal = (estimate) => {
    if (onNavigateToEstimates) {
      // Navigate with the estimate ID to view/edit
      onNavigateToEstimates('estimates', { viewEstimateId: estimate.id });
    }
  };

  // Filter and count - use useMemo to ensure these recompute when jobs changes
  const filteredJobs = useMemo(() => {
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
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          isDarkMode={isDarkMode}
        />
      )}

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
        handleAddJob={() => jobHandlers.handleAddJob(clearEstimateModals)}
        handleEditJob={() => jobHandlers.handleEditJob(clearEstimateModals)}
        handleDeleteJob={jobHandlers.handleDeleteJob}
        showCombinedEstimatesModal={showCombinedEstimatesModal}
        setShowCombinedEstimatesModal={setShowCombinedEstimatesModal}
        handleViewSingleEstimateFromCombined={handleViewSingleEstimateFromCombined}
        viewingSingleEstimate={viewingSingleEstimate}
        handleCloseSingleEstimate={handleCloseSingleEstimate}
        onNavigateToEstimatesFromModal={handleNavigateToEstimatesFromModal}
        viewingInvoice={viewingInvoice}
        setViewingInvoice={setViewingInvoice}
        handleSaveInvoice={invoiceHandlers.handleSaveInvoice}
        onNavigateToInvoices={handleNavigateToInvoices}
        isDarkMode={isDarkMode}
        colors={colors}
        onAddElectrician={handleAddElectricianToJob}
        onRemoveElectrician={handleRemoveElectricianFromJob}
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
            onShowToast={showToast} // PASS THE TOAST FUNCTION
          />
        </div>
      </div>
    </div>
  );
};

export default Jobs;