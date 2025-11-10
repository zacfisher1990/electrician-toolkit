import React from 'react';
import { X, AlertCircle, Mail } from 'lucide-react';

/**
 * Modal component that shows when unverified users try to create content
 * Unlike VerificationRequired.jsx which blocks entire pages, this is a popup modal
 */
const VerificationRequiredModal = ({ 
  isOpen,
  onClose,
  isDarkMode,
  featureName = 'this feature',
  onResendVerification 
}) => {
  if (!isOpen) return null;

  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#0a0a0a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    subtext: isDarkMode ? '#666666' : '#6b7280',
    border: isDarkMode ? '#1a1a1a' : '#e5e7eb',
  };

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
        borderRadius: '1rem',
        border: `1px solid ${colors.border}`,
        padding: '2rem',
        maxWidth: '500px',
        width: '100%',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            color: colors.subtext,
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '0.375rem',
            transition: 'background 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = colors.border}
          onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
        >
          <X size={24} />
        </button>

        {/* Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: '#fef3c7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem'
        }}>
          <Mail size={40} color="#f59e0b" />
        </div>

        {/* Title */}
        <h2 style={{
          margin: '0 0 1rem 0',
          color: colors.text,
          fontSize: '1.5rem',
          fontWeight: '700',
          textAlign: 'center'
        }}>
          Email Verification Required
        </h2>

        {/* Message */}
        <p style={{
          margin: '0 0 1.5rem 0',
          color: colors.subtext,
          fontSize: '0.9375rem',
          lineHeight: '1.6',
          textAlign: 'center'
        }}>
          You need to verify your email address to {featureName}.
        </p>

        {/* Info Box */}
        <div style={{
          padding: '1rem',
          background: '#fef3c7',
          border: '2px solid #fbbf24',
          borderRadius: '0.75rem',
          marginBottom: '1.5rem',
          textAlign: 'left'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <AlertCircle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            <div>
              <p style={{
                margin: '0 0 0.5rem 0',
                color: '#92400e',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                Check your email inbox
              </p>
              <p style={{
                margin: 0,
                color: '#92400e',
                fontSize: '0.8125rem',
                lineHeight: '1.5'
              }}>
                We've sent you a verification link. Click it to activate your account and unlock all features.
              </p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div style={{
          padding: '1rem',
          background: isDarkMode ? '#1a1a1a' : '#f9fafb',
          border: `1px solid ${colors.border}`,
          borderRadius: '0.75rem',
          marginBottom: '1.5rem',
          textAlign: 'left'
        }}>
          <p style={{
            margin: '0 0 0.75rem 0',
            color: colors.text,
            fontSize: '0.8125rem',
            fontWeight: '600'
          }}>
            Haven't received the email?
          </p>
          <ul style={{
            margin: 0,
            paddingLeft: '1.25rem',
            color: colors.subtext,
            fontSize: '0.8125rem',
            lineHeight: '1.6'
          }}>
            <li>Check your spam/junk folder</li>
            <li>Make sure your email address is correct</li>
            <li>Wait a few minutes and check again</li>
          </ul>
        </div>

        {/* Resend Button */}
        {onResendVerification && (
          <button
            onClick={onResendVerification}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '0.75rem',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
          >
            Resend Verification Email
          </button>
        )}

        {/* Secondary Action */}
        <p style={{
          margin: 0,
          color: colors.subtext,
          fontSize: '0.8125rem',
          textAlign: 'center'
        }}>
          Already verified?{' '}
          <button
            onClick={() => window.location.reload()}
            style={{
              background: 'none',
              border: 'none',
              color: '#2563eb',
              cursor: 'pointer',
              fontSize: '0.8125rem',
              fontWeight: '600',
              textDecoration: 'underline',
              padding: 0
            }}
          >
            Refresh page
          </button>
        </p>
      </div>
    </div>
  );
};

export default VerificationRequiredModal;