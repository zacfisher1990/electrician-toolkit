import React from 'react';
import { X } from 'lucide-react';
import InvoiceForm from './InvoiceForm';

const InvoiceModal = ({
  editingInvoice,
  onSave,
  onCancel,
  onDelete,
  isDarkMode,
  colors,
  estimates,
  jobs,
  invoices,
  isNewInvoice = false
}) => {
  // Don't render if neither editingInvoice nor isNewInvoice is true
  if (!editingInvoice && !isNewInvoice) return null;

  const modalTitle = isNewInvoice ? 'New Invoice' : 'Edit Invoice';

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

        {/* Invoice Form */}
        <InvoiceForm
          isDarkMode={isDarkMode}
          editingInvoice={editingInvoice}
          onSave={onSave}
          onCancel={onCancel}
          estimates={estimates}
          jobs={jobs}
          invoices={invoices}
          showToggle={false}
        />
      </div>
    </div>
  );
};

export default InvoiceModal;