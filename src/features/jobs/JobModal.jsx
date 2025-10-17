import React from 'react';
import { X, Trash2 } from 'lucide-react';
import JobForm from './JobForm';

const JobModal = ({
  viewingJob,
  formData,
  setFormData,
  linkedEstimate,
  estimates,
  showEstimateMenu,
  setShowEstimateMenu,
  onSelectEstimate,
  onCreateNewEstimate,
  onViewEstimate,
  onRemoveEstimate,
  estimateMenuRef,
  onClose,
  onSave,
  onDelete,
  isDarkMode,
  colors
}) => {
  if (!viewingJob) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          animation: 'fadeIn 0.2s'
        }}
      />
      
      {/* Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: colors.cardBg,
        borderRadius: '1rem',
        padding: '1.5rem',
        paddingBottom: 'calc(100px + env(safe-area-inset-bottom))',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        overflowY: 'auto',
        zIndex: 1001,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        WebkitOverflowScrolling: 'touch'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: '600',
            color: colors.text
          }}>
            Job Details
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0.5rem',
              color: colors.subtext,
              display: 'flex',
              alignItems: 'center'
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
            estimates={estimates}
            showEstimateMenu={showEstimateMenu}
            setShowEstimateMenu={setShowEstimateMenu}
            onSelectEstimate={onSelectEstimate}
            onCreateNewEstimate={onCreateNewEstimate}
            onViewEstimate={onViewEstimate}
            onRemoveEstimate={onRemoveEstimate}
            estimateMenuRef={estimateMenuRef}
            isDarkMode={isDarkMode}
            colors={colors}
          />

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
              Save Changes
            </button>
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
          </div>
        </div>
      </div>
    </>
  );
};

export default JobModal;