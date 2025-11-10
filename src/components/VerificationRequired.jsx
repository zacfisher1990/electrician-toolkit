import React from 'react';
import { AlertCircle, Mail } from 'lucide-react';

/**
 * Wrapper component that blocks content if email is not verified
 * Shows a verification prompt instead of the actual content
 */
const VerificationRequired = ({ 
  isVerified, 
  children, 
  isDarkMode,
  featureName = 'this feature',
  onResendVerification 
}) => {
  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#0a0a0a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    subtext: isDarkMode ? '#666666' : '#6b7280',
    border: isDarkMode ? '#1a1a1a' : '#e5e7eb',
  };

  // If verified, show the actual content
  if (isVerified) {
    return <>{children}</>;
  }

  // If not verified, show verification prompt
  return (
    <div style={{
      background: colors.bg,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      paddingBottom: '5rem' // Space for bottom nav
    }}>
      <div style={{
        background: colors.cardBg,
        borderRadius: '1rem',
        border: `1px solid ${colors.border}`,
        padding: '2.5rem 2rem',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
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
          fontWeight: '700'
        }}>
          Email Verification Required
        </h2>

        {/* Message */}
        <p style={{
          margin: '0 0 1.5rem 0',
          color: colors.subtext,
          fontSize: '0.9375rem',
          lineHeight: '1.6'
        }}>
          You need to verify your email address to use {featureName}.
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
              marginBottom: '0.75rem'
            }}
          >
            Resend Verification Email
          </button>
        )}

        {/* Secondary Action */}
        <p style={{
          margin: 0,
          color: colors.subtext,
          fontSize: '0.8125rem'
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

export default VerificationRequired;