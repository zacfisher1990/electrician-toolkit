import React, { useState } from 'react';
import { X, Edit2, Check, FileText } from 'lucide-react';

const InvoiceViewModal = ({ invoice, onClose, onSave, isDarkMode }) => {
  const [isEditing, setIsEditing] = useState(invoice?.isNew || false);
  const [editedInvoice, setEditedInvoice] = useState(invoice);

  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#111111' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
    border: isDarkMode ? '#1a1a1a' : '#e5e7eb',
  };

  const handleSave = () => {
    onSave(editedInvoice);
  };

  const total = editedInvoice.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  );

  return (
    <div
      style={{
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
      }}
    >
      <div
        style={{
          background: colors.cardBg,
          borderRadius: '0.75rem',
          border: `1px solid ${colors.border}`,
          maxWidth: '600px',
          width: '100%',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          marginBottom: '5rem',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={24} style={{ color: '#3b82f6' }} />
            <h2
              style={{
                margin: 0,
                color: colors.text,
                fontSize: '1.125rem',
                fontWeight: '600',
              }}
            >
              {editedInvoice.invoiceNumber}
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {!invoice.isNew && (
              <button
                onClick={() => setIsEditing(!isEditing)}
                style={{
                  padding: '0.5rem',
                  background: 'transparent',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  color: colors.text,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <Edit2 size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem',
                background: 'transparent',
                border: 'none',
                color: colors.textSecondary,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '1.25rem',
            paddingBottom: '1.25rem',
            overflowY: 'auto',
            flex: 1,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Client & Date Info */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                fontSize: '0.875rem',
                color: colors.textSecondary,
                marginBottom: '0.5rem',
                fontWeight: '500',
              }}
            >
              Bill To
            </div>
            <div
              style={{
                fontSize: '1.125rem',
                fontWeight: '600',
                color: colors.text,
                marginBottom: '1rem',
              }}
            >
              {editedInvoice.client}
            </div>

            <div
              style={{
                display: 'flex',
                gap: '2rem',
                fontSize: '0.875rem',
              }}
            >
              <div>
                <span style={{ color: colors.textSecondary }}>Invoice Date: </span>
                <span style={{ color: colors.text, fontWeight: '500' }}>
                  {new Date(editedInvoice.date).toLocaleDateString()}
                </span>
              </div>
              {editedInvoice.dueDate && (
                <div>
                  <span style={{ color: colors.textSecondary }}>Due: </span>
                  <span style={{ color: colors.text, fontWeight: '500' }}>
                    {new Date(editedInvoice.dueDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Line Items */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr',
                gap: '0.75rem',
                paddingBottom: '0.75rem',
                borderBottom: `1px solid ${colors.border}`,
                fontSize: '0.875rem',
                fontWeight: '500',
                color: colors.textSecondary,
              }}
            >
              <div>Description</div>
              <div style={{ textAlign: 'right' }}>Qty</div>
              <div style={{ textAlign: 'right' }}>Rate</div>
              <div style={{ textAlign: 'right' }}>Amount</div>
            </div>

            {editedInvoice.lineItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  gap: '0.75rem',
                  padding: '0.75rem 0',
                  borderBottom:
                    idx < editedInvoice.lineItems.length - 1
                      ? `1px solid ${colors.border}`
                      : 'none',
                  fontSize: '0.875rem',
                  color: colors.text,
                }}
              >
                <div>{item.description}</div>
                <div style={{ textAlign: 'right' }}>{item.quantity}</div>
                <div style={{ textAlign: 'right' }}>
                  ${item.rate.toFixed(2)}
                </div>
                <div style={{ textAlign: 'right', fontWeight: '600' }}>
                  ${(item.quantity * item.rate).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem',
              background: colors.bg,
              borderRadius: '0.75rem',
              marginBottom: '1rem',
            }}
          >
            <span
              style={{
                fontSize: '1.125rem',
                fontWeight: '700',
                color: colors.text,
              }}
            >
              Total
            </span>
            <span
              style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: '#10b981',
              }}
            >
              ${total.toFixed(2)}
            </span>
          </div>

          {/* Notes */}
          {editedInvoice.notes && (
            <div
              style={{
                padding: '1rem',
                background: colors.bg,
                borderRadius: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              <div
                style={{
                  fontSize: '0.875rem',
                  color: colors.textSecondary,
                  marginBottom: '0.5rem',
                  fontWeight: '500',
                }}
              >
                Notes
              </div>
              <div
                style={{
                  fontSize: '0.875rem',
                  color: colors.text,
                  lineHeight: '1.5',
                }}
              >
                {editedInvoice.notes}
              </div>
            </div>
          )}

          {/* Save Button for New Invoice */}
          {invoice.isNew && (
            <button
              onClick={handleSave}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: '#10b981',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                fontSize: '0.9375rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <Check size={18} />
              Save Invoice
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoiceViewModal;