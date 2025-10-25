import React from 'react';
import { X, FileText, Clock, DollarSign } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

const JobEstimatesSummaryModal = ({ estimates = [], isDarkMode, onClose, onViewSingleEstimate }) => {
  if (!estimates || estimates.length === 0) return null;

  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#1a1a1a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    subtext: isDarkMode ? '#999999' : '#6b7280',
    border: isDarkMode ? '#2a2a2a' : '#e5e7eb',
    overlayBg: isDarkMode ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.5)',
  };

  // Calculate totals from all estimates
  const totalLabor = estimates.reduce((sum, est) => sum + (est.laborHours * est.laborRate), 0);
  const totalMaterials = estimates.reduce((sum, est) => {
    const matTotal = est.materials?.reduce((matSum, m) => matSum + parseFloat(m.cost || 0), 0) || 0;
    return sum + matTotal;
  }, 0);
  const grandTotal = estimates.reduce((sum, est) => sum + (est.total || 0), 0);

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
            maxWidth: '600px',
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
                Combined Estimates Summary
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
            paddingBottom: '5rem',
            overflowY: 'auto',
            overflowX: 'hidden',
            flex: '1 1 auto',
            minHeight: 0,
            WebkitOverflowScrolling: 'touch'
          }}>
            {/* Grand Total - Prominent Display */}
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
                Total from All Estimates
              </p>
              <p style={{
                margin: 0,
                color: '#10b981',
                fontSize: '2.5rem',
                fontWeight: '700',
                lineHeight: 1
              }}>
                ${grandTotal.toFixed(2)}
              </p>
            </div>

            {/* Individual Estimates */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h3 style={{
                margin: '0 0 1rem 0',
                color: colors.text,
                fontSize: '1rem',
                fontWeight: '600'
              }}>
                Included Estimates ({estimates.length})
              </h3>
              
              {estimates.map((estimate, index) => (
                <div
                  key={estimate.id || index}
                  style={{
                    background: colors.bg,
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    marginBottom: '1rem',
                    border: `1px solid ${colors.border}`
                  }}
                >
                  {/* Estimate Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem'
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{
                        margin: '0 0 0.25rem 0',
                        color: colors.text,
                        fontSize: '0.9375rem',
                        fontWeight: '600'
                      }}>
                        {estimate.name}
                      </h4>
                      {estimate.createdAt && (
                        <p style={{
                          margin: 0,
                          color: colors.subtext,
                          fontSize: '0.75rem'
                        }}>
                          Created {formatDate(estimate.createdAt)}
                        </p>
                      )}
                    </div>
                    <div style={{
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      color: '#10b981'
                    }}>
                      ${estimate.total.toFixed(2)}
                    </div>
                  </div>

                  {/* Labor Summary */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginBottom: '0.5rem',
                    color: colors.subtext,
                    fontSize: '0.8125rem'
                  }}>
                    <Clock size={14} />
                    <span>
                      {estimate.laborHours}h × ${estimate.laborRate}/hr = ${(estimate.laborHours * estimate.laborRate).toFixed(2)}
                    </span>
                  </div>

                  {/* Materials Summary */}
                  {estimate.materials && estimate.materials.length > 0 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.75rem',
                      color: colors.subtext,
                      fontSize: '0.8125rem'
                    }}>
                      <DollarSign size={14} />
                      <span>
                        {estimate.materials.length} material{estimate.materials.length !== 1 ? 's' : ''} = ${estimate.materials.reduce((sum, m) => sum + parseFloat(m.cost || 0), 0).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* View Details Button */}
                  <button
                    onClick={() => onViewSingleEstimate(estimate)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      background: 'transparent',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '0.375rem',
                      color: '#2563eb',
                      fontSize: '0.8125rem',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    View Full Details
                  </button>
                </div>
              ))}
            </div>

            {/* Breakdown Summary */}
            <div style={{
              background: colors.bg,
              borderRadius: '0.75rem',
              padding: '1rem',
              border: `1px solid ${colors.border}`,
              marginBottom: '1rem'
            }}>
              <h4 style={{
                margin: '0 0 0.75rem 0',
                color: colors.text,
                fontSize: '0.9375rem',
                fontWeight: '600'
              }}>
                Total Breakdown
              </h4>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem'
              }}>
                <span style={{ color: colors.subtext, fontSize: '0.875rem' }}>
                  Total Labor
                </span>
                <span style={{ color: colors.text, fontSize: '0.875rem', fontWeight: '500' }}>
                  ${totalLabor.toFixed(2)}
                </span>
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem'
              }}>
                <span style={{ color: colors.subtext, fontSize: '0.875rem' }}>
                  Total Materials
                </span>
                <span style={{ color: colors.text, fontSize: '0.875rem', fontWeight: '500' }}>
                  ${totalMaterials.toFixed(2)}
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
                  ${grandTotal.toFixed(2)}
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

export default JobEstimatesSummaryModal;