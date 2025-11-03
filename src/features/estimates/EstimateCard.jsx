import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Edit, Send, ChevronDown, ChevronUp, XCircle } from 'lucide-react';
import { getColors } from '../../theme';
import { formatDate } from '../../utils/dateUtils';

const EstimateCard = ({ 
  estimate, 
  isDarkMode, 
  onEdit, 
  onDelete, 
  onSendEstimate,
  onUpdateStatus,
  colors 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef(null);

  // Use provided colors from parent, or get from theme if not provided
  const cardColors = colors || getColors(isDarkMode);

  // Status configuration - Updated to Draft, Pending, Accepted, Rejected
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
    'Accepted': { 
      color: '#10b981', 
      label: 'Accepted',
      bgColor: '#d1fae5'
    },
    'Rejected': { 
      color: '#ef4444', 
      label: 'Rejected',
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

  const currentStatus = estimate.status || 'Draft';
  const statusStyle = statusConfig[currentStatus] || statusConfig['Draft'];
  const isRejected = currentStatus === 'Rejected';

  return (
    <div
      style={{
        background: cardColors.cardBg,
        border: `1px solid ${cardColors.border}`,
        borderRadius: '0.75rem',
        padding: '1rem',
        marginBottom: '0.75rem',
        transition: 'all 0.2s'
      }}
    >
      {/* Header - Always visible, clickable to expand/collapse */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          cursor: 'pointer',
          marginBottom: isExpanded ? '0.75rem' : 0
        }}
      >
        {/* Estimate Name */}
        <div style={{ flex: 1, maxWidth: 'calc(100% - 140px)', paddingRight: '0.5rem' }}>
          <h3 style={{
            margin: '0',
            color: cardColors.text,
            fontSize: '1rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            {estimate.name}
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </h3>
        </div>

        {/* Status Badge with Dropdown and Rejected Indicator */}
        <div style={{ 
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.375rem',
          flexShrink: 0,
          marginLeft: 'auto'
        }}>
          {/* Rejected Badge (only show when rejected) */}
          {isRejected && (
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
              <XCircle size={12} />
              <span>Rejected</span>
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
              {!isRejected && statusStyle.label}
              <ChevronDown size={12} />
            </button>

            {/* Status Dropdown Menu */}
            {statusDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.5rem',
                background: cardColors.cardBg,
                border: `1px solid ${cardColors.border}`,
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
                      if (onUpdateStatus) {
                        onUpdateStatus(estimate.id, key);
                      }
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
          cursor: 'pointer',
          marginTop: '0.5rem'
        }}
      >
        <span style={{
          color: cardColors.subtext,
          fontSize: '0.875rem'
        }}>
          {formatDate(estimate.createdAt)}
        </span>
        <span style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: cardColors.text
        }}>
          ${Number(estimate.total || 0).toLocaleString('en-US', {
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
          borderTop: `1px solid ${cardColors.border}`
        }}>
          {/* Labor Details */}
          {estimate.laborHours && estimate.laborRate && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '0.375rem 0',
              fontSize: '0.875rem',
              color: cardColors.subtext
            }}>
              <span>Labor: {estimate.laborHours}h × ${estimate.laborRate}/hr</span>
              <span>${(estimate.laborHours * estimate.laborRate).toFixed(2)}</span>
            </div>
          )}

          {/* Materials List */}
          {estimate.materials && estimate.materials.length > 0 && (
            <div style={{ marginBottom: '0.75rem' }}>
              {estimate.materials.map((item, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.375rem 0',
                    fontSize: '0.875rem',
                    color: cardColors.subtext
                  }}
                >
                  <span>{item.name}</span>
                  <span>${parseFloat(item.cost || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Notes */}
          {estimate.notes && (
            <div style={{
              marginBottom: '0.75rem',
              padding: '0.75rem',
              background: cardColors.mainBg,
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              color: cardColors.text
            }}>
              {estimate.notes}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginTop: '0.75rem'
          }}>
            {/* Edit Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(estimate);
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
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
            >
              <Edit size={16} />
              Edit
            </button>

            {/* Send Button */}
            {onSendEstimate && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSendEstimate(estimate);
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

            {/* Delete Button */}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(estimate.id, estimate.name);
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
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#ef4444';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#ef4444';
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

export default EstimateCard;