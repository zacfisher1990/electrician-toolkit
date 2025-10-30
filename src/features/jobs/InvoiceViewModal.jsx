import React, { useState } from 'react';
import { X, Edit2, Check } from 'lucide-react';

const InvoiceViewModal = ({ invoice, onClose, onSave, isDarkMode }) => {
  const [isEditing, setIsEditing] = useState(invoice?.isNew || false);
  const [editedInvoice, setEditedInvoice] = useState(invoice);

  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#1a1a1a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    subtext: isDarkMode ? '#999999' : '#6b7280',
    border: isDarkMode ? '#2a2a2a' : '#e5e7eb',
  };

  const handleSave = () => {
    onSave(editedInvoice);
  };

  const total = editedInvoice.lineItems.reduce((sum, item) => 
    sum + (item.quantity * item.rate), 0
  );

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
      padding: '1rem'
    }}>
      <div style={{
        background: colors.cardBg,
        borderRadius: '0.75rem',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '85vh',  // Reduced from 90vh
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
        }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            margin: 0,
            color: colors.text,
            fontSize: '1.25rem',
            fontWeight: '600'
          }}>
            {editedInvoice.invoiceNumber}
          </h2>
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
                  cursor: 'pointer'
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
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                color: colors.text,
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
            <div style={{ 
            padding: '1.5rem',
            paddingBottom: '6rem',  // Extra padding for bottom nav
            overflowY: 'auto',
            flex: 1
            }}>
          {/* Client Info */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              fontSize: '0.75rem',
              color: colors.subtext,
              marginBottom: '0.25rem',
              textTransform: 'uppercase',
              fontWeight: '600'
            }}>
              Bill To
            </div>
            <div style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: colors.text
            }}>
              {editedInvoice.client}
            </div>
          </div>

          {/* Dates */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <div style={{
                fontSize: '0.75rem',
                color: colors.subtext,
                marginBottom: '0.25rem'
              }}>
                Invoice Date
              </div>
              <div style={{ color: colors.text }}>
                {new Date(editedInvoice.date).toLocaleDateString()}
              </div>
            </div>
            {editedInvoice.dueDate && (
              <div>
                <div style={{
                  fontSize: '0.75rem',
                  color: colors.subtext,
                  marginBottom: '0.25rem'
                }}>
                  Due Date
                </div>
                <div style={{ color: colors.text }}>
                  {new Date(editedInvoice.dueDate).toLocaleDateString()}
                </div>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div style={{
            marginBottom: '1.5rem',
            border: `1px solid ${colors.border}`,
            borderRadius: '0.5rem',
            overflow: 'hidden'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              gap: '0.5rem',
              padding: '0.75rem',
              background: colors.bg,
              fontSize: '0.75rem',
              fontWeight: '600',
              color: colors.subtext,
              textTransform: 'uppercase'
            }}>
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
                  gap: '0.5rem',
                  padding: '0.75rem',
                  borderTop: `1px solid ${colors.border}`,
                  fontSize: '0.875rem',
                  color: colors.text
                }}
              >
                <div>{item.description}</div>
                <div style={{ textAlign: 'right' }}>{item.quantity}</div>
                <div style={{ textAlign: 'right' }}>${item.rate.toFixed(2)}</div>
                <div style={{ textAlign: 'right', fontWeight: '600' }}>
                  ${(item.quantity * item.rate).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            background: colors.bg,
            borderRadius: '0.5rem',
            marginBottom: '1rem'
          }}>
            <span style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: colors.text
            }}>
              Total
            </span>
            <span style={{
              fontSize: '1.5rem',
              fontWeight: '700',
              color: '#10b981'
            }}>
              ${total.toFixed(2)}
            </span>
          </div>

          {/* Notes */}
          {editedInvoice.notes && (
            <div style={{
              padding: '1rem',
              background: colors.bg,
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: colors.subtext,
                marginBottom: '0.5rem',
                fontWeight: '600'
              }}>
                Notes
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: colors.text
              }}>
                {editedInvoice.notes}
              </div>
            </div>
          )}

          {/* Action Buttons */}
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
                gap: '0.5rem'
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