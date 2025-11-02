import React from 'react';
import { X, Trash2 } from 'lucide-react';
import EstimateForm from './EstimateForm';

const EstimateModal = ({
  editingEstimate,
  onSave,
  onCancel,
  onDelete,
  isDarkMode,
  colors,
  isNewEstimate = false
}) => {
  // Don't render if neither editingEstimate nor isNewEstimate is true
  if (!editingEstimate && !isNewEstimate) return null;

  const modalTitle = isNewEstimate ? 'New Estimate' : 'Edit Estimate';

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
            onClick={onCancel}
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

        {/* Estimate Form */}
        <EstimateForm
          isDarkMode={isDarkMode}
          editingEstimate={editingEstimate}
          onSave={onSave}
          onCancel={onCancel}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

export default EstimateModal;