import React from 'react';
import { Plus } from 'lucide-react';
import styles from './Invoices.module.css';

const AddInvoiceSection = ({
  handleAddInvoiceClick,
  isDarkMode,
  colors
}) => {
  return (
    <div className={styles.addInvoiceContainer} style={{
      background: '#3b82f6',
      border: `1px solid ${colors.border}`,
      marginBottom: '0.75rem',
      borderRadius: '0.75rem',
      overflow: 'hidden'
    }}>
      <button
        onClick={handleAddInvoiceClick}
        className={styles.addInvoiceButton}
        style={{ color: '#ffffff' }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '600'
        }}>
          <Plus size={18} />
          New Invoice
        </div>
      </button>
    </div>
  );
};

export default AddInvoiceSection;