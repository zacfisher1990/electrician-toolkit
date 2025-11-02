import React from 'react';
import JobModal from './JobModal';
import JobEstimatesSummaryModal from './JobEstimatesSummaryModal';
import EstimateModal from './EstimateModal';
import InvoiceViewModal from './InvoiceViewModal';
import AuthModal from '../profile/AuthModal';

const ModalsContainer = ({
  // Auth Modal
  showAuthModal,
  setShowAuthModal,
  
  // Add Job Modal
  showAddForm,
  setShowAddForm,
  handleAddJob,
  
  // Job Modal
  viewingJob,
  formData,
  setFormData,
  linkedEstimates,
  estimates,
  showEstimateMenu,
  handleEstimateMenuOpen,
  onSelectEstimate,
  onCreateNewEstimate,
  onViewEstimate,
  onRemoveEstimate,
  onAddAdditionalEstimate,
  handleViewCombinedEstimates,
  estimateMenuRef,
  resetForm,
  handleEditJob,
  handleDeleteJob,
  
  // Combined Estimates Modal
  showCombinedEstimatesModal,
  setShowCombinedEstimatesModal,
  handleViewSingleEstimateFromCombined,
  
  // Single Estimate Modal
  viewingSingleEstimate,
  handleCloseSingleEstimate,
  
  // Invoice Modal
  viewingInvoice,
  setViewingInvoice,
  handleSaveInvoice,
  
  isDarkMode,
  colors
}) => {
  return (
    <>
      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        isDarkMode={isDarkMode}
      />

      {/* Add Job Modal */}
      {showAddForm && (
        <JobModal
          viewingJob={null}
          formData={formData}
          setFormData={setFormData}
          linkedEstimate={linkedEstimates.length > 0 ? linkedEstimates[0] : null}
          linkedEstimates={linkedEstimates}
          estimates={estimates}
          showEstimateMenu={showEstimateMenu}
          setShowEstimateMenu={handleEstimateMenuOpen}
          onSelectEstimate={onSelectEstimate}
          onCreateNewEstimate={onCreateNewEstimate}
          onViewEstimate={onViewEstimate}
          onRemoveEstimate={onRemoveEstimate}
          onAddAdditionalEstimate={onAddAdditionalEstimate}
          onViewAllEstimates={handleViewCombinedEstimates}
          estimateMenuRef={estimateMenuRef}
          onClose={() => {
            setShowAddForm(false);
            resetForm();
          }}
          onSave={handleAddJob}
          onDelete={null}
          isDarkMode={isDarkMode}
          colors={colors}
          isNewJob={true}
        />
      )}

      {/* Job Modal (for viewing/editing existing jobs) */}
      <JobModal
        viewingJob={viewingJob}
        formData={formData}
        setFormData={setFormData}
        linkedEstimate={linkedEstimates.length > 0 ? linkedEstimates[0] : null}
        linkedEstimates={linkedEstimates}
        estimates={estimates}
        showEstimateMenu={showEstimateMenu}
        setShowEstimateMenu={handleEstimateMenuOpen}
        onSelectEstimate={onSelectEstimate}
        onCreateNewEstimate={onCreateNewEstimate}
        onViewEstimate={onViewEstimate}
        onRemoveEstimate={onRemoveEstimate}
        onAddAdditionalEstimate={onAddAdditionalEstimate}
        onViewAllEstimates={handleViewCombinedEstimates}
        estimateMenuRef={estimateMenuRef}
        onClose={resetForm}
        onSave={handleEditJob}
        onDelete={handleDeleteJob}
        isDarkMode={isDarkMode}
        colors={colors}
      />

      {/* Combined Estimates Summary Modal */}
      {showCombinedEstimatesModal && (
        <JobEstimatesSummaryModal
          estimates={linkedEstimates}
          isDarkMode={isDarkMode}
          onClose={() => setShowCombinedEstimatesModal(false)}
          onViewSingleEstimate={handleViewSingleEstimateFromCombined}
        />
      )}

      {/* Single Estimate Detail Modal */}
      {viewingSingleEstimate && (
        <EstimateModal
          estimate={viewingSingleEstimate}
          isDarkMode={isDarkMode}
          onClose={handleCloseSingleEstimate}
        />
      )}

      {/* Invoice View Modal */}
      {viewingInvoice && (
        <InvoiceViewModal
          invoice={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
          onSave={handleSaveInvoice}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  );
};

export default ModalsContainer;