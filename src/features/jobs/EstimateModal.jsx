import React from 'react';
import { X, Clock, DollarSign, FileText, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

const EstimateModal = ({ estimate, isDarkMode, onClose }) => {
  if (!estimate) return null;

  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#1a1a1a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    subtext: isDarkMode ? '#999999' : '#6b7280',
    border: isDarkMode ? '#2a2a2a' : '#e5e7eb',
    overlayBg: isDarkMode ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.5)',
  };

  const laborTotal = estimate.laborHours * estimate.laborRate;
  const materialsTotal = estimate.materials.reduce((sum, m) => sum + parseFloat(m.cost || 0), 0);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: colors.overlayBg,
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem'
        }}
      >
        {/* Modal Content */}
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: colors.cardBg,
            borderRadius: '1rem',
            border: `1px solid ${colors.border}`,
            width: '100%',
            maxWidth: '500px',
            maxHeight: '90vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: isDarkMode 
              ? '0 20px 25px -5px rgba(0, 0, 0, 0.8), 0 10px 10px -5px rgba(0, 0, 0, 0.6)'
              : '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
          }}
        >
          {/* Header */}
          <div style={{
            padding: '1.25rem',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={24} style={{ color: '#2563eb' }} />
              <h2 style={{
                margin: 0,
                color: colors.text,
                fontSize: '1.25rem',
                fontWeight: '700'
              }}>
                Estimate Summary
              </h2>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: colors.subtext,
                cursor: 'pointer',
                padding: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                borderRadius: '0.5rem'
              }}
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div style={{
            padding: '1.25rem',
            paddingBottom: '5rem', // Extra padding to clear the bottom nav bar
            overflowY: 'auto',
            overflowX: 'hidden',
            flex: '1 1 auto',
            minHeight: 0,
            WebkitOverflowScrolling: 'touch'
          }}>
            {/* Estimate Name */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{
                margin: '0 0 0.5rem 0',
                color: colors.text,
                fontSize: '1.125rem',
                fontWeight: '600'
              }}>
                {estimate.name}
              </h3>
              {estimate.createdAt && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: colors.subtext,
                  fontSize: '0.875rem'
                }}>
                  <Calendar size={16} />
                  <span>Created {formatDate(estimate.createdAt)}</span>
                </div>
              )}
            </div>

            {/* Total Amount - Prominent Display */}
            <div style={{
              background: colors.bg,
              borderRadius: '0.75rem',
              padding: '1.25rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
              border: `2px solid #10b981`
            }}>
              <p style={{
                margin: '0 0 0.5rem 0',
                color: colors.subtext,
                fontSize: '0.875rem',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Total Estimate
              </p>
              <p style={{
                margin: 0,
                color: '#10b981',
                fontSize: '2.5rem',
                fontWeight: '700',
                lineHeight: 1
              }}>
                ${estimate.total.toFixed(2)}
              </p>
            </div>

            {/* Labor Breakdown */}
            <div style={{
              background: colors.bg,
              borderRadius: '0.75rem',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}>
                <Clock size={18} style={{ color: '#2563eb' }} />
                <h4 style={{
                  margin: 0,
                  color: colors.text,
                  fontSize: '0.9375rem',
                  fontWeight: '600'
                }}>
                  Labor
                </h4>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: colors.subtext, fontSize: '0.875rem' }}>
                  Hours
                </span>
                <span style={{ color: colors.text, fontSize: '0.875rem', fontWeight: '600' }}>
                  {estimate.laborHours}h
                </span>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: colors.subtext, fontSize: '0.875rem' }}>
                  Rate
                </span>
                <span style={{ color: colors.text, fontSize: '0.875rem', fontWeight: '600' }}>
                  ${estimate.laborRate}/hr
                </span>
              </div>

              <div style={{
                borderTop: `1px solid ${colors.border}`,
                marginTop: '0.75rem',
                paddingTop: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: colors.text, fontSize: '0.9375rem', fontWeight: '600' }}>
                  Labor Total
                </span>
                <span style={{ color: '#2563eb', fontSize: '1.125rem', fontWeight: '700' }}>
                  ${laborTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Materials Breakdown */}
            {estimate.materials && estimate.materials.length > 0 && (
              <div style={{
                background: colors.bg,
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '1rem'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.75rem'
                }}>
                  <DollarSign size={18} style={{ color: '#10b981' }} />
                  <h4 style={{
                    margin: 0,
                    color: colors.text,
                    fontSize: '0.9375rem',
                    fontWeight: '600'
                  }}>
                    Materials
                  </h4>
                </div>

                {estimate.materials.map((material, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: idx < estimate.materials.length - 1 ? '0.5rem' : '0'
                    }}
                  >
                    <span style={{ color: colors.subtext, fontSize: '0.875rem' }}>
                      {material.name}
                    </span>
                    <span style={{ color: colors.text, fontSize: '0.875rem', fontWeight: '600' }}>
                      ${parseFloat(material.cost).toFixed(2)}
                    </span>
                  </div>
                ))}

                <div style={{
                  borderTop: `1px solid ${colors.border}`,
                  marginTop: '0.75rem',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ color: colors.text, fontSize: '0.9375rem', fontWeight: '600' }}>
                    Materials Total
                  </span>
                  <span style={{ color: '#10b981', fontSize: '1.125rem', fontWeight: '700' }}>
                    ${materialsTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            {/* No Materials Message */}
            {(!estimate.materials || estimate.materials.length === 0) && (
              <div style={{
                background: colors.bg,
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                <p style={{
                  margin: 0,
                  color: colors.subtext,
                  fontSize: '0.875rem',
                  fontStyle: 'italic'
                }}>
                  No materials included in this estimate
                </p>
              </div>
            )}

            {/* Breakdown Summary */}
            <div style={{
              background: colors.bg,
              borderRadius: '0.75rem',
              padding: '1rem',
              border: `1px solid ${colors.border}`,
              marginBottom: '1rem'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: colors.subtext, fontSize: '0.875rem' }}>
                  Labor
                </span>
                <span style={{ color: colors.text, fontSize: '0.875rem', fontWeight: '500' }}>
                  ${laborTotal.toFixed(2)}
                </span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem'
              }}>
                <span style={{ color: colors.subtext, fontSize: '0.875rem' }}>
                  Materials
                </span>
                <span style={{ color: colors.text, fontSize: '0.875rem', fontWeight: '500' }}>
                  ${materialsTotal.toFixed(2)}
                </span>
              </div>
              <div style={{
                borderTop: `2px solid ${colors.border}`,
                paddingTop: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ color: colors.text, fontSize: '1rem', fontWeight: '700' }}>
                  Grand Total
                </span>
                <span style={{ color: '#10b981', fontSize: '1.5rem', fontWeight: '700' }}>
                  ${estimate.total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Close Button - inside scrollable area */}
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '0.875rem',
                background: '#2563eb',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9375rem',
                fontWeight: '600',
                marginBottom: '1rem'
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EstimateModal;