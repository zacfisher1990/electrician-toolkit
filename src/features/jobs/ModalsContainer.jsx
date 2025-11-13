import React from 'react';
import JobModal from './JobModal';
import JobEstimatesSummaryModal from './JobEstimatesSummaryModal';
import EstimateModal from './EstimateModal';
import InvoiceViewModal from './InvoiceViewModal';
import AuthModal from '../account/AuthModal';

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
  onNavigateToEstimatesFromModal,
  
  // Invoice Modal
  viewingInvoice,
  setViewingInvoice,
  handleSaveInvoice,
  onNavigateToInvoices,
  
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

      {/* Add Job Modal - only show when adding a new job */}
      {showAddForm && !viewingJob && (
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

      {/* Job Modal (for viewing/editing existing jobs) - only show when viewing a job */}
      {viewingJob && !showAddForm && (
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
          isNewJob={false}
        />
      )}

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
          onNavigateToEstimates={onNavigateToEstimatesFromModal}
        />
      )}

      {/* Invoice View Modal */}
      {viewingInvoice && (
        <InvoiceViewModal
          invoice={viewingInvoice}
          onClose={() => setViewingInvoice(null)}
          onSave={handleSaveInvoice}
          onNavigateToInvoices={onNavigateToInvoices}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  );
};

export default ModalsContainer;