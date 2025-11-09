import React, { useRef, useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Edit, Trash2, Send, AlertCircle } from 'lucide-react';
import { getColors } from '../../theme';

const InvoiceCard = ({ 
  invoice, 
  onUpdateStatus,
  onViewInvoice,
  onDeleteInvoice,
  onSendInvoice,
  isDarkMode,
  colors 
}) => {
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const statusDropdownRef = useRef(null);

  // Status configuration - Updated to new statuses
  const statusConfig = {
    'Draft': { 
      color: '#6b7280', 
      label: 'Draft',
      bgColor: '#f3f4f6'
    },
    'Pending': { 
      color: '#f59e0b', 
      label: 'Pending',
      bgColor: '#fef3c7'
    },
    'Paid': { 
      color: '#10b981', 
      label: 'Paid',
      bgColor: '#d1fae5'
    }
  };

  // Check if invoice is overdue
  const isOverdue = () => {
    if (invoice.status === 'Paid') return false;
    if (!invoice.dueDate) return false;
    
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    return dueDate < today;
  };

  const overdueStatus = isOverdue();

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

  const currentStatus = invoice.status || 'Draft';
  const statusStyle = statusConfig[currentStatus] || statusConfig['Draft'];

  return (
    <div
      style={{
        background: colors.cardBg,
        border: `1px solid ${colors.border}`,
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '0.75rem',
        transition: 'all 0.2s',
        position: 'relative'
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
        {/* Left side - Invoice Number and Client/Description */}
        <div style={{ 
          flex: 1,
          paddingRight: '0.5rem'
        }}>
          {/* Invoice Number - Small label above (matching estimate style) */}
          <div style={{
            fontSize: '0.75rem',
            color: colors.subtext,
            marginBottom: '0.25rem',
            fontWeight: '500',
            textAlign: 'left'
          }}>
            {invoice.invoiceNumber}
          </div>
          
          {/* Client/Description - Main text */}
          <h3 style={{
            margin: '0',
            color: colors.text,
            fontSize: '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {invoice.description || invoice.client || invoice.clientName || 'Invoice'}
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </h3>
        </div>

        {/* Status Badge with Dropdown and Overdue Indicator */}
        <div style={{ 
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.375rem',
          flexShrink: 0,
          marginLeft: 'auto'
        }}>
          {/* Overdue Badge */}
          {overdueStatus && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem',
              background: '#fee2e2',
              color: '#991b1b',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              <AlertCircle size={12} />
              <span>Overdue</span>
            </div>
          )}

          {/* Status Dropdown */}
          <div style={{ position: 'relative' }} ref={statusDropdownRef}>
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
          {/* Send History */}
          {invoice.lastSentAt && (
            <div style={{
              marginBottom: '0.75rem',
              padding: '0.5rem 0.75rem',
              background: isDarkMode ? '#1a3a1a' : '#f0fdf4',
              borderRadius: '0.5rem',
              fontSize: '0.75rem',
              color: isDarkMode ? '#86efac' : '#166534',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <span style={{ fontSize: '1rem' }}>✓</span>
              <div>
                <div style={{ fontWeight: '600' }}>
                  Sent {invoice.sentCount > 1 ? `${invoice.sentCount} times` : 'once'}
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>
                  Last sent to {invoice.lastSentTo} on {new Date(invoice.lastSentAt.seconds * 1000).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          )}

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
              color: overdueStatus ? '#ef4444' : colors.subtext,
              marginBottom: '0.5rem',
              fontWeight: overdueStatus ? '600' : '400'
            }}>
              Due: {new Date(invoice.dueDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
              {overdueStatus && ' - Payment Overdue'}
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