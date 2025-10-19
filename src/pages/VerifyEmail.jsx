import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { verifyEmailToken } from '../utils/emailVerification';

const VerifyEmail = ({ isDarkMode, onNavigate }) => {
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');

  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#0a0a0a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    subtext: isDarkMode ? '#666666' : '#6b7280',
    border: isDarkMode ? '#1a1a1a' : '#e5e7eb',
  };

  useEffect(() => {
    const verify = async () => {
      // Get token from URL
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token');

      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. No token provided.');
        return;
      }

      try {
        const result = await verifyEmailToken(token);

        if (result.success) {
          setStatus('success');
          setMessage('Your email has been verified successfully!');
          
          // Force reload the user's verification status
          if (window.auth && window.auth.currentUser) {
            await window.auth.currentUser.reload();
          }
          
          // Redirect to profile after 3 seconds
          setTimeout(() => {
            onNavigate('profile');
            // Clear the token from URL
            window.history.replaceState({}, '', window.location.pathname);
            // Reload to refresh verification status
            window.location.reload();
          }, 3000);
        } else {
          setStatus('error');
          setMessage(result.error || 'Verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage('An error occurred during verification. Please try again.');
      }
    };

    verify();
  }, [onNavigate]);

  return (
    <div style={{
      background: colors.bg,
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: colors.cardBg,
        borderRadius: '0.75rem',
        border: `1px solid ${colors.border}`,
        padding: '3rem 2rem',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center'
      }}>
        {/* Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: status === 'verifying' ? '#3b82f6' : 
                      status === 'success' ? '#10b981' : '#ef4444',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 2rem'
        }}>
          {status === 'verifying' && (
            <Loader size={40} color="white" style={{ animation: 'spin 1s linear infinite' }} />
          )}
          {status === 'success' && <CheckCircle size={40} color="white" />}
          {status === 'error' && <XCircle size={40} color="white" />}
        </div>

        {/* Title */}
        <h2 style={{
          margin: '0 0 1rem 0',
          color: colors.text,
          fontSize: '1.75rem',
          fontWeight: '700'
        }}>
          {status === 'verifying' && 'Verifying Your Email...'}
          {status === 'success' && 'Email Verified!'}
          {status === 'error' && 'Verification Failed'}
        </h2>

        {/* Message */}
        <p style={{
          margin: '0 0 2rem 0',
          color: colors.subtext,
          fontSize: '1rem',
          lineHeight: '1.6'
        }}>
          {status === 'verifying' && 'Please wait while we verify your email address.'}
          {status === 'success' && message}
          {status === 'error' && message}
        </p>

        {/* Actions */}
        {status === 'success' && (
          <div style={{
            padding: '1rem',
            background: '#dcfce7',
            border: '1px solid #86efac',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            <p style={{
              margin: 0,
              color: '#16a34a',
              fontSize: '0.875rem'
            }}>
              Redirecting you to your profile in 3 seconds...
            </p>
          </div>
        )}

        {status === 'success' && (
          <button
            onClick={() => onNavigate('profile')}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Go to Profile
          </button>
        )}

        {status === 'error' && (
          <button
            onClick={() => onNavigate('profile')}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Go to Profile
          </button>
        )}
      </div>

      {/* Add spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default VerifyEmail;