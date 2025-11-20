import React from 'react';
import { X, Trash2 } from 'lucide-react';
import JobForm from './JobForm';

const JobModal = ({
  viewingJob,
  formData,
  setFormData,
  linkedEstimate,
  linkedEstimates = [],
  estimates,
  showEstimateMenu,
  setShowEstimateMenu,
  onSelectEstimate,
  onCreateNewEstimate,
  onViewEstimate,
  onRemoveEstimate,
  onAddAdditionalEstimate,
  onViewAllEstimates,
  estimateMenuRef,
  onClose,
  onSave,
  onDelete,
  isDarkMode,
  colors,
  isNewJob = false,
  // NEW: Electrician invitation handlers
  onAddElectrician,
  onRemoveElectrician
}) => {
  // Only render if we're creating a new job OR viewing an existing job
  if (!isNewJob && !viewingJob) return null;

  const modalTitle = isNewJob ? 'New Job' : 'Job Details';
  const saveButtonText = isNewJob ? 'Add Job' : 'Save Changes';

  // Check if this is a shared job (team member view)
  const isSharedJob = viewingJob?.isSharedJob === true;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem',
      paddingBottom: '6rem',
      overflowY: 'auto'
    }}>
      <div style={{
        background: colors.cardBg,
        borderRadius: '0.75rem',
        padding: '1.5rem',
        maxWidth: '600px',
        width: '100%',
        maxHeight: 'calc(100vh - 8rem)',
        overflow: 'auto',
        margin: 'auto'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: '600',
            color: colors.text
          }}>
            {modalTitle}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.25rem',
              color: colors.subtext
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Fields */}
        <div>
          <JobForm
            formData={formData}
            setFormData={setFormData}
            linkedEstimate={linkedEstimate}
            linkedEstimates={linkedEstimates}
            estimates={estimates}
            showEstimateMenu={showEstimateMenu}
            setShowEstimateMenu={setShowEstimateMenu}
            onSelectEstimate={onSelectEstimate}
            onCreateNewEstimate={onCreateNewEstimate}
            onViewEstimate={onViewEstimate}
            onRemoveEstimate={onRemoveEstimate}
            onAddAdditionalEstimate={onAddAdditionalEstimate}
            onViewAllEstimates={onViewAllEstimates}
            estimateMenuRef={estimateMenuRef}
            isDarkMode={isDarkMode}
            colors={colors}
            // NEW: Pass invitation handlers
            onAddElectrician={onAddElectrician}
            onRemoveElectrician={onRemoveElectrician}
            isSharedJob={isSharedJob}
          />

          {/* Action Buttons - Hide for shared jobs */}
          {!isSharedJob && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={onSave}
                disabled={!formData.title || !formData.client}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: (!formData.title || !formData.client) ? colors.border : '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: (!formData.title || !formData.client) ? 'not-allowed' : 'pointer',
                  opacity: (!formData.title || !formData.client) ? 0.5 : 1
                }}
              >
                {saveButtonText}
              </button>
              {!isNewJob && onDelete && viewingJob && (
                <button
                  onClick={() => onDelete(viewingJob.id, viewingJob.title || viewingJob.name)}
                  style={{
                    padding: '0.75rem',
                    background: 'transparent',
                    color: '#ef4444',
                    border: `1px solid #ef4444`,
                    borderRadius: '0.5rem',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          )}

          {/* Close button for shared jobs (view only) */}
          {isSharedJob && (
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: colors.border,
                color: colors.text,
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.9375rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobModal;