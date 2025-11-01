import React from 'react';
import { X, FileText, Clock, DollarSign } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

const JobEstimatesSummaryModal = ({ estimates = [], isDarkMode, onClose, onViewSingleEstimate }) => {
  if (!estimates || estimates.length === 0) return null;

  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#111111' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
    border: isDarkMode ? '#1a1a1a' : '#e5e7eb',
    overlayBg: 'rgba(0, 0, 0, 0.5)',
  };

  // Calculate totals from all estimates
  const totalLabor = estimates.reduce((sum, est) => sum + (est.laborHours * est.laborRate), 0);
  const totalMaterials = estimates.reduce((sum, est) => {
    const matTotal = est.materials?.reduce((matSum, m) => matSum + parseFloat(m.cost || 0), 0) || 0;
    return sum + matTotal;
  }, 0);
  const grandTotal = estimates.reduce((sum, est) => sum + (est.total || 0), 0);

  return (
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
        padding: '1rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: colors.cardBg,
          borderRadius: '0.75rem',
          border: `1px solid ${colors.border}`,
          width: '100%',
          maxWidth: '600px',
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          marginBottom: '5rem',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1.25rem',
            borderBottom: `1px solid ${colors.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={24} style={{ color: '#3b82f6' }} />
            <div>
              <h2
                style={{
                  margin: 0,
                  color: colors.text,
                  fontSize: '1.125rem',
                  fontWeight: '600',
                }}
              >
                Combined Estimates
              </h2>
              <p
                style={{
                  margin: '0.25rem 0 0 0',
                  color: colors.textSecondary,
                  fontSize: '0.875rem',
                }}
              >
                {estimates.length} estimate{estimates.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: colors.textSecondary,
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              borderRadius: '0.5rem',
            }}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '1.25rem',
            paddingBottom: '1.25rem',
            overflowY: 'auto',
            flex: '1 1 auto',
            minHeight: 0,
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {/* Individual Estimates */}
          <div style={{ marginBottom: '1.5rem' }}>
            {estimates.map((estimate, index) => (
              <div
                key={estimate.id || index}
                style={{
                  marginBottom: '1rem',
                  paddingBottom: '1rem',
                  borderBottom:
                    index < estimates.length - 1
                      ? `1px solid ${colors.border}`
                      : 'none',
                }}
              >
                {/* Estimate Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.75rem',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <h4
                      style={{
                        margin: '0 0 0.25rem 0',
                        color: colors.text,
                        fontSize: '1rem',
                        fontWeight: '600',
                      }}
                    >
                      {estimate.name}
                    </h4>
                    {estimate.createdAt && (
                      <p
                        style={{
                          margin: 0,
                          color: colors.textSecondary,
                          fontSize: '0.875rem',
                        }}
                      >
                        {formatDate(estimate.createdAt)}
                      </p>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: '#10b981',
                    }}
                  >
                    ${estimate.total.toFixed(2)}
                  </div>
                </div>

                {/* Labor & Materials Summary */}
                <div style={{ marginBottom: '0.75rem' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                      color: colors.textSecondary,
                      fontSize: '0.875rem',
                    }}
                  >
                    <Clock size={16} style={{ flexShrink: 0 }} />
                    <span>
                      {estimate.laborHours}h × ${estimate.laborRate}/hr = $
                      {(estimate.laborHours * estimate.laborRate).toFixed(2)}
                    </span>
                  </div>

                  {estimate.materials && estimate.materials.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: colors.textSecondary,
                        fontSize: '0.875rem',
                      }}
                    >
                      <DollarSign size={16} style={{ flexShrink: 0 }} />
                      <span>
                        {estimate.materials.length} material
                        {estimate.materials.length !== 1 ? 's' : ''} = $
                        {estimate.materials
                          .reduce((sum, m) => sum + parseFloat(m.cost || 0), 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* View Details Button */}
                <button
                  onClick={() => onViewSingleEstimate(estimate)}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    background: 'transparent',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    color: '#3b82f6',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  View Details
                </button>
              </div>
            ))}
          </div>

          {/* Totals Summary */}
          <div
            style={{
              paddingTop: '1rem',
              borderTop: `2px solid ${colors.border}`,
              marginBottom: '1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.5rem',
              }}
            >
              <span
                style={{
                  color: colors.textSecondary,
                  fontSize: '0.875rem',
                }}
              >
                Total Labor
              </span>
              <span
                style={{
                  color: colors.text,
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                ${totalLabor.toFixed(2)}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
              }}
            >
              <span
                style={{
                  color: colors.textSecondary,
                  fontSize: '0.875rem',
                }}
              >
                Total Materials
              </span>
              <span
                style={{
                  color: colors.text,
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                ${totalMaterials.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Grand Total */}
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
                color: colors.text,
                fontSize: '1.125rem',
                fontWeight: '700',
              }}
            >
              Grand Total
            </span>
            <span
              style={{
                color: '#10b981',
                fontSize: '2rem',
                fontWeight: '700',
              }}
            >
              ${grandTotal.toFixed(2)}
            </span>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: '#3b82f6',
              border: 'none',
              borderRadius: '0.5rem',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9375rem',
              fontWeight: '600',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobEstimatesSummaryModal;