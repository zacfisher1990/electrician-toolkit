import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

/**
 * Account Banners Component
 * Displays various alert banners (verification, incomplete profile, messages)
 */
const AccountBanners = ({
  isEmailVerified,
  isProfileIncomplete,
  sendingVerification,
  success,
  error,
  onResendVerification
}) => {
  return (
    <>
      {/* Email Verification Banner */}
      {!isEmailVerified && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fbbf24',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} style={{ color: '#f59e0b', flexShrink: 0, marginTop: '0.125rem' }} />
          <div style={{ flex: 1 }}>
            <p style={{
              margin: '0 0 0.5rem 0',
              color: '#92400e',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              Email Not Verified
            </p>
            <p style={{
              margin: '0 0 0.75rem 0',
              color: '#92400e',
              fontSize: '0.8125rem',
              lineHeight: '1.4'
            }}>
              Please verify your email address to access all features.
            </p>
            <button
              onClick={onResendVerification}
              disabled={sendingVerification}
              style={{
                background: '#f59e0b',
                color: 'white',
                border: 'none',
                padding: '0.5rem 0.875rem',
                borderRadius: '0.375rem',
                fontSize: '0.8125rem',
                fontWeight: '600',
                cursor: sendingVerification ? 'not-allowed' : 'pointer',
                opacity: sendingVerification ? 0.7 : 1
              }}
            >
              {sendingVerification ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
        </div>
      )}

      {/* Profile Incomplete Warning */}
      {isEmailVerified && isProfileIncomplete && (
        <div style={{
          background: '#dbeafe',
          border: '1px solid #60a5fa',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} style={{ color: '#2563eb', flexShrink: 0, marginTop: '0.125rem' }} />
          <div style={{ flex: 1 }}>
            <p style={{
              margin: '0 0 0.5rem 0',
              color: '#1e40af',
              fontSize: '0.875rem',
              fontWeight: '600'
            }}>
              Complete Your Profile
            </p>
            <p style={{
              margin: 0,
              color: '#1e40af',
              fontSize: '0.8125rem',
              lineHeight: '1.4'
            }}>
              Add your contact information and company details to get the most out of Electrician Pro X.
            </p>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div style={{
          background: '#d1fae5',
          border: '1px solid #6ee7b7',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <CheckCircle size={20} style={{ color: '#059669', flexShrink: 0 }} />
          <p style={{
            margin: 0,
            color: '#065f46',
            fontSize: '0.875rem'
          }}>
            {success}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '0.75rem',
          padding: '1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
          <p style={{
            margin: 0,
            color: '#991b1b',
            fontSize: '0.875rem'
          }}>
            {error}
          </p>
        </div>
      )}
    </>
  );
};

export default AccountBanners;