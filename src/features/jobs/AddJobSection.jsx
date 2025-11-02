import React from 'react';
import { Plus, ChevronDown } from 'lucide-react';
import JobForm from './JobForm';
import styles from './Jobs.module.css';

const AddJobSection = ({
  showAddForm,
  handleAddJobClick,
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
  onViewAllEstimates,
  estimateMenuRef,
  handleAddJob,
  resetForm,
  isDarkMode,
  colors
}) => {
  return (
    <div className={styles.addJobContainer} style={{
      background: isDarkMode ? '#1a1a1a' : '#3b82f6',
      border: `1px solid ${colors.border}`
    }}>
      <button
        onClick={handleAddJobClick}
        className={styles.addJobButton}
        style={{ color: isDarkMode ? colors.text : '#ffffff' }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '600'
        }}>
          <Plus size={18} />
          New Job
        </div>
        <ChevronDown 
          size={18} 
          style={{
            transform: showAddForm ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s'
          }}
        />
      </button>

      {showAddForm && (
        <div style={{
          padding: '0 1rem 1rem 1rem',
          borderTop: `1px solid ${colors.border}`
        }}>
          <div style={{ paddingTop: '1rem' }}>
            <JobForm
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
              onViewAllEstimates={onViewAllEstimates}
              estimateMenuRef={estimateMenuRef}
              isDarkMode={isDarkMode}
              colors={colors}
            />

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleAddJob}
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
                Add Job
              </button>
              <button
                onClick={resetForm}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'transparent',
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  fontSize: '0.9375rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddJobSection;