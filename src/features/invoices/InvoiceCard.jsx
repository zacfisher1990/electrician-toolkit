import React, { useRef, useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Edit, Trash2, Send } from 'lucide-react';
import { getColors } from '../../theme';

const InvoiceCard = ({ 
  invoice, 
  onUpdateStatus,
  onViewInvoice,
  onDeleteInvoice,
  onSendInvoice, // Added this prop
  isDarkMode,
  colors 
}) => {
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const statusDropdownRef = useRef(null);

  // Status configuration
  const statusConfig = {
    'Unsent': { 
      color: '#6b7280', 
      label: 'Unsent',
      bgColor: '#f3f4f6'
    },
    'Sent': { 
      color: '#3b82f6', 
      label: 'Sent',
      bgColor: '#dbeafe'
    },
    'Paid': { 
      color: '#10b981', 
      label: 'Paid',
      bgColor: '#d1fae5'
    },
    'Overdue': { 
      color: '#ef4444', 
      label: 'Overdue',
      bgColor: '#fee2e2'
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target)) {
        setStatusDropdownOpen(false);
      }
    };

    if (statusDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [statusDropdownOpen]);

  const currentStatus = invoice.status || 'Unsent';
  const statusStyle = statusConfig[currentStatus] || statusConfig['Unsent'];

  return (
    <div
      style={{
        background: colors.cardBg,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '0.75rem',
        transition: 'all 0.2s'
      }}
    >
      {/* Header - Invoice Number, Client/Description, and Status Badge */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          cursor: 'pointer',
          marginBottom: '0.5rem'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Invoice Number and Client/Description */}
        <div style={{ 
          flex: 1, 
          minWidth: 0,
          maxWidth: 'calc(100% - 120px)', // Leave space for status badge
          paddingRight: '0.5rem'
        }}>
          <h3 style={{
            margin: '0 0 0.25rem 0',
            color: colors.text,
            fontSize: '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {invoice.invoiceNumber}
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </h3>
          {(invoice.description || invoice.client) && (
            <p style={{
              margin: 0,
              color: colors.subtext,
              fontSize: '0.875rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              width: '100%',
              textAlign: 'left'
            }}>
              {invoice.description || invoice.client}
            </p>
          )}
        </div>

        {/* Status Badge with Dropdown */}
        <div style={{ 
          position: 'relative',
          flexShrink: 0,
          marginLeft: 'auto'
        }} ref={statusDropdownRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setStatusDropdownOpen(!statusDropdownOpen);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              background: `${statusStyle.color}15`,
              color: statusStyle.color,
              fontSize: '0.75rem',
              fontWeight: '600',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            {statusStyle.label}
            <ChevronDown size={12} />
          </button>

          {/* Status Dropdown Menu */}
          {statusDropdownOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '0.5rem',
              background: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              zIndex: 100,
              minWidth: '140px',
              overflow: 'hidden'
            }}>
              {Object.entries(statusConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStatus(invoice.id, key);
                    setStatusDropdownOpen(false);
                  }}
                  style={{
                    width: '100%',
                    padding: '0.625rem 0.75rem',
                    background: currentStatus === key 
                      ? (isDarkMode ? `${config.color}20` : config.bgColor)
                      : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    color: config.color,
                    fontSize: '0.875rem',
                    fontWeight: currentStatus === key ? '600' : '500',
                    transition: 'background 0.2s',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => {
                    if (currentStatus !== key) {
                      e.currentTarget.style.background = isDarkMode ? '#2a2a2a' : '#f3f4f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentStatus !== key) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span>{config.label}</span>
                  {currentStatus === key && (
                    <span style={{ fontSize: '1rem' }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Date and Amount - Always visible */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer'
        }}
      >
        <span style={{
          color: colors.subtext,
          fontSize: '0.875rem'
        }}>
          {invoice.date ? new Date(invoice.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          }) : 'No date'}
        </span>
        <span style={{
          color: colors.text,
          fontSize: '1.125rem',
          fontWeight: '600'
        }}>
          ${Number(invoice.amount || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
          })}
        </span>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div style={{
          marginTop: '0.75rem',
          paddingTop: '0.75rem',
          borderTop: `1px solid ${colors.border}`
        }}>
          {/* Line Items */}
          {invoice.lineItems && invoice.lineItems.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              {invoice.lineItems.map((item, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.375rem 0',
                    fontSize: '0.875rem',
                    color: colors.subtext
                  }}
                >
                  <span>{item.description}</span>
                  <span>${(item.quantity * item.rate).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Due Date */}
          {invoice.dueDate && (
            <div style={{
              fontSize: '0.875rem',
              color: colors.subtext,
              marginBottom: '0.5rem'
            }}>
              Due: {new Date(invoice.dueDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </div>
          )}

          {/* Notes */}
          {invoice.notes && (
            <div style={{
              marginBottom: '0.75rem',
              padding: '0.75rem',
              background: colors.mainBg,
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: colors.text
            }}>
              {invoice.notes}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '0.75rem'
          }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewInvoice(invoice);
              }}
              style={{
                flex: 1,
                padding: '0.625rem',
                background: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Edit size={16} />
              Edit
            </button>

            {onSendInvoice && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSendInvoice(invoice);
                }}
                style={{
                  padding: '0.625rem 0.75rem',
                  background: '#3b82f6',
                  border: 'none',
                  borderRadius: '0.5rem',
                  color: 'white',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
              >
                <Send size={16} />
                Send
              </button>
            )}

            {onDeleteInvoice && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteInvoice(invoice.id, invoice.invoiceNumber);
                }}
                style={{
                  padding: '0.625rem 0.75rem',
                  background: 'transparent',
                  color: '#ef4444',
                  border: `1px solid #ef4444`,
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceCard;