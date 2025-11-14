import React, { useState } from 'react';
import { Plus, Trash2, ExternalLink, DollarSign } from 'lucide-react';

/**
 * Payment Methods Section Component
 * Allows users to add/remove payment method links (Venmo, PayPal, Square, etc.)
 */
const PaymentMethodsSection = ({ paymentMethods, onChange, isDarkMode, colors }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMethod, setNewMethod] = useState({ name: '', url: '' });

  // Common payment method templates
  const commonMethods = [
    { name: 'Venmo', template: 'https://venmo.com/u/username', placeholder: 'Replace "username" with your Venmo username' },
    { name: 'PayPal', template: 'https://paypal.me/username', placeholder: 'Replace "username" with your PayPal username' },
    { name: 'Square', template: 'https://square.link/u/xxxxx', placeholder: 'Replace "xxxxx" with your Square link code' },
    { name: 'Zelle', template: '', placeholder: 'Enter your email or phone number' },
    { name: 'Cash App', template: 'https://cash.app/$username', placeholder: 'Replace "username" with your Cash App username' }
  ];

  const handleAdd = () => {
    if (!newMethod.name || !newMethod.url) return;

    const updatedMethods = [...(paymentMethods || []), newMethod];
    onChange(updatedMethods);
    setNewMethod({ name: '', url: '' });
    setShowAddForm(false);
  };

  const handleRemove = (index) => {
    const updatedMethods = paymentMethods.filter((_, i) => i !== index);
    onChange(updatedMethods);
  };

  const handleQuickAdd = (method) => {
    setNewMethod({ name: method.name, url: method.template });
    setShowAddForm(true);
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem'
      }}>
        <label style={{
          display: 'block',
          color: colors.text,
          fontSize: '0.875rem',
          fontWeight: '500'
        }}>
          Payment Methods
        </label>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            style={{
              padding: '0.375rem 0.75rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '0.8125rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem'
            }}
          >
            <Plus size={14} />
            Add Method
          </button>
        )}
      </div>

      <p style={{
        margin: '0 0 1rem 0',
        color: colors.subtext,
        fontSize: '0.8125rem',
        lineHeight: '1.4'
      }}>
        Add payment links so clients can easily pay invoices. These will appear on your invoices and estimates.
      </p>

      {/* Existing Payment Methods */}
      {paymentMethods && paymentMethods.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          {paymentMethods.map((method, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.875rem',
                background: isDarkMode ? '#1a1a1a' : '#f9fafb',
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                marginBottom: '0.5rem'
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.25rem'
                }}>
                  <DollarSign size={16} style={{ color: '#10b981', flexShrink: 0 }} />
                  <p style={{
                    margin: 0,
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: colors.text
                  }}>
                    {method.name}
                  </p>
                </div>
                <p style={{
                  margin: 0,
                  fontSize: '0.8125rem',
                  color: colors.subtext,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {method.url}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                style={{
                  padding: '0.5rem',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0.375rem',
                  marginLeft: '0.5rem'
                }}
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Payment Method Form */}
      {showAddForm && (
        <div style={{
          padding: '1rem',
          background: isDarkMode ? '#1a1a1a' : '#f9fafb',
          border: `1px solid ${colors.border}`,
          borderRadius: '0.5rem',
          marginBottom: '1rem'
        }}>
          <p style={{
            margin: '0 0 0.75rem 0',
            fontSize: '0.875rem',
            fontWeight: '600',
            color: colors.text
          }}>
            Add Payment Method
          </p>

          {/* Quick Add Buttons */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1rem'
          }}>
            {commonMethods.map((method) => (
              <button
                key={method.name}
                type="button"
                onClick={() => handleQuickAdd(method)}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: newMethod.name === method.name ? '#2563eb' : colors.border,
                  color: newMethod.name === method.name ? 'white' : colors.text,
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.8125rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                {method.name}
              </button>
            ))}
          </div>

          {/* Name Input */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.375rem',
              color: colors.text,
              fontSize: '0.8125rem',
              fontWeight: '500'
            }}>
              Payment Method Name
            </label>
            <input
              type="text"
              value={newMethod.name}
              onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
              placeholder="e.g., Venmo, PayPal, Square"
              style={{
                width: '100%',
                padding: '0.625rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                background: colors.inputBg,
                color: colors.text,
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* URL/Link Input */}
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{
              display: 'block',
              marginBottom: '0.375rem',
              color: colors.text,
              fontSize: '0.8125rem',
              fontWeight: '500'
            }}>
              Payment Link or Info
            </label>
            <div style={{ position: 'relative' }}>
              <ExternalLink 
                size={16} 
                style={{
                  position: 'absolute',
                  left: '0.625rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.subtext
                }}
              />
              <input
                type="text"
                value={newMethod.url}
                onChange={(e) => setNewMethod({ ...newMethod, url: e.target.value })}
                onFocus={(e) => {
                  // Auto-select text on focus to make editing easier
                  e.target.select();
                }}
                placeholder={
                  commonMethods.find(m => m.name === newMethod.name)?.placeholder || 
                  'https://... or email/phone'
                }
                style={{
                  width: '100%',
                  padding: '0.625rem 0.625rem 0.625rem 2.25rem',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  background: colors.inputBg,
                  color: colors.text,
                  boxSizing: 'border-box'
                }}
              />
            </div>
            <p style={{
              margin: '0.375rem 0 0 0',
              fontSize: '0.75rem',
              color: colors.subtext
            }}>
              {newMethod.name && commonMethods.find(m => m.name === newMethod.name)?.template 
                ? 'Tip: Click the field to select all text, then just replace the highlighted parts'
                : 'Enter the full payment link or contact info (email/phone for Zelle)'}
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setNewMethod({ name: '', url: '' });
              }}
              style={{
                flex: 1,
                padding: '0.625rem',
                background: colors.border,
                color: colors.text,
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newMethod.name || !newMethod.url}
              style={{
                flex: 1,
                padding: '0.625rem',
                background: (!newMethod.name || !newMethod.url) ? colors.border : '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: (!newMethod.name || !newMethod.url) ? 'not-allowed' : 'pointer',
                opacity: (!newMethod.name || !newMethod.url) ? 0.5 : 1
              }}
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!paymentMethods || paymentMethods.length === 0) && !showAddForm && (
        <div style={{
          padding: '1.5rem',
          background: isDarkMode ? '#1a1a1a' : '#f9fafb',
          border: `2px dashed ${colors.border}`,
          borderRadius: '0.5rem',
          textAlign: 'center'
        }}>
          <DollarSign size={32} style={{ color: colors.subtext, margin: '0 auto 0.5rem' }} />
          <p style={{
            margin: '0 0 0.5rem 0',
            color: colors.text,
            fontSize: '0.9375rem',
            fontWeight: '600'
          }}>
            No payment methods added
          </p>
          <p style={{
            margin: 0,
            color: colors.subtext,
            fontSize: '0.8125rem'
          }}>
            Add your payment links to make it easy for clients to pay
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodsSection;