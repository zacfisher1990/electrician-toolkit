import React from 'react';
import { Plus } from 'lucide-react';
import styles from './Estimates.module.css';

const AddEstimateSection = ({
  handleAddEstimateClick,
  isDarkMode,
  colors
}) => {
  return (
    <div className={styles.addEstimateContainer} style={{
      background: isDarkMode ? '#1a1a1a' : '#3b82f6',
      border: `1px solid ${colors.border}`,
      marginBottom: '0.75rem',
      borderRadius: '0.75rem',
      overflow: 'hidden'
    }}>
      <button
        onClick={handleAddEstimateClick}
        className={styles.addEstimateButton}
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
          New Estimate
        </div>
      </button>
    </div>
  );
};

export default AddEstimateSection;