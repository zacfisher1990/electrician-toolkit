import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle } from 'lucide-react';
import styles from './Jobs.module.css';
import StatusTabs from './StatusTabs';
import JobsHeader from './JobsHeader';
import AddJobSection from './AddJobSection';
import JobsList from './JobsList';
import ModalsContainer from './ModalsContainer';

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

const Jobs = ({ isDarkMode, onNavigateToEstimates }) => {
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

  // Create a function to clear estimate modals
const clearEstimateModals = () => {
  setViewingSingleEstimate(null);
  setShowCombinedEstimatesModal(false);
};

  // Colors
  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#1a1a1a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    subtext: isDarkMode ? '#999999' : '#6b7280',
    border: isDarkMode ? '#2a2a2a' : '#e5e7eb',
    inputBg: isDarkMode ? '#000000' : '#ffffff',
  };

  const statusConfig = {
    'scheduled': { color: '#3b82f6', icon: Clock, label: 'Scheduled' },
    'in-progress': { color: '#f59e0b', icon: AlertCircle, label: 'In Progress' },
    'completed': { color: '#10b981', icon: CheckCircle, label: 'Completed' }
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

  // Create handlers
  const jobHandlers = createJobHandlers({
    formData,
    editingJob,
    viewingJob,
    estimates,
    resetForm,
    loadJobs
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
      setShowAuthModal(true);
    } else {
      setShowAddForm(!showAddForm);
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
    console.log('🔓 Opening job, clearing estimate modals');
      // FORCE CLEAR everything before opening
      setViewingSingleEstimate(null);
      setShowCombinedEstimatesModal(false);
      
      openJobView({
        job,
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
  // Filter and count
  const filteredJobs = filterJobs(jobs, searchQuery, activeStatusTab);
  const statusCounts = getStatusCounts(jobs);

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: colors.bg,
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
      <ModalsContainer
        showAuthModal={showAuthModal}
        setShowAuthModal={setShowAuthModal}
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
        background: colors.bg,
        paddingBottom: '5rem'
      }}>
        <div style={{ padding: '1rem 0.25rem' }}>
          <StatusTabs
            activeStatusTab={activeStatusTab}
            setActiveStatusTab={setActiveStatusTab}
            statusCounts={statusCounts}
            statusConfig={statusConfig}
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
            showAddForm={showAddForm}
            handleAddJobClick={handleAddJobClick}
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
            onViewAllEstimates={handleViewCombinedEstimates}
            estimateMenuRef={estimateMenuRef}
            handleAddJob={jobHandlers.handleAddJob}
            resetForm={resetForm}
            isDarkMode={isDarkMode}
            colors={colors}
          />

          <JobsList
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