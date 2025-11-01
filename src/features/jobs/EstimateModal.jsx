import React from 'react';
import { X, FileText } from 'lucide-react';
import { formatDate } from '../../utils/dateUtils';

const EstimateModal = ({ estimate, isDarkMode, onClose }) => {
  if (!estimate) return null;

  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#111111' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
    border: isDarkMode ? '#1a1a1a' : '#e5e7eb',
    overlayBg: 'rgba(0, 0, 0, 0.5)',
  };

  const laborTotal = estimate.laborHours * estimate.laborRate;
  const materialsTotal = estimate.materials.reduce((sum, m) => sum + parseFloat(m.cost || 0), 0);

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
          maxWidth: '500px',
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
                {estimate.name}
              </h2>
              {estimate.createdAt && (
                <p
                  style={{
                    margin: '0.25rem 0 0 0',
                    color: colors.textSecondary,
                    fontSize: '0.875rem',
                  }}
                >
                  {formatDate(estimate.createdAt)}
                </p>
              )}
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
          {/* Labor Section */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
                paddingBottom: '0.5rem',
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <span
                style={{
                  color: colors.textSecondary,
                  fontSize: '0.875rem',
                  fontWeight: '500',
                }}
              >
                Labor
              </span>
              <span
                style={{
                  color: '#3b82f6',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                }}
              >
                ${laborTotal.toFixed(2)}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '0.5rem',
              }}
            >
              <span style={{ color: colors.textSecondary, fontSize: '0.875rem' }}>
                {estimate.laborHours}h × ${estimate.laborRate}/hr
              </span>
            </div>
          </div>

          {/* Materials Section */}
          {estimate.materials && estimate.materials.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.75rem',
                  paddingBottom: '0.5rem',
                  borderBottom: `1px solid ${colors.border}`,
                }}
              >
                <span
                  style={{
                    color: colors.textSecondary,
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}
                >
                  Materials
                </span>
                <span
                  style={{
                    color: '#10b981',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                  }}
                >
                  ${materialsTotal.toFixed(2)}
                </span>
              </div>
              {estimate.materials.map((material, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.5rem',
                  }}
                >
                  <span style={{ color: colors.text, fontSize: '0.875rem' }}>
                    {material.name}
                  </span>
                  <span
                    style={{
                      color: colors.textSecondary,
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}
                  >
                    ${parseFloat(material.cost).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}

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
              ${estimate.total.toFixed(2)}
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

export default EstimateModal;