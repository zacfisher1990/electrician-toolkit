import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../firebase/firebase';

const VerifyEmail = ({ isDarkMode, onNavigate }) => {
  const [status, setStatus] = useState('verifying');
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
      try {
        // Get the action code from URL parameters
        const params = new URLSearchParams(window.location.search);
        const oobCode = params.get('oobCode'); // Firebase uses 'oobCode' not 'token'
        const mode = params.get('mode');

        console.log('URL params:', { oobCode, mode, fullURL: window.location.href }); // Debug log

        if (!oobCode) {
          setStatus('error');
          setMessage('Invalid verification link. Please request a new verification email.');
          return;
        }

        if (mode !== 'verifyEmail') {
          setStatus('error');
          setMessage('Invalid verification link type.');
          return;
        }

        // Apply the action code using Firebase's built-in function
        await applyActionCode(auth, oobCode);

        // Success!
        setStatus('success');
        setMessage('Your email has been verified successfully!');

        // Reload the current user to update emailVerified status
        if (auth.currentUser) {
          await auth.currentUser.reload();
          console.log('Email verified:', auth.currentUser.emailVerified);
        }

        // Redirect after 3 seconds
        setTimeout(() => {
          onNavigate('profile');
          window.history.replaceState({}, '', window.location.pathname);
          window.location.reload();
        }, 3000);

      } catch (error) {
        console.error('Verification error:', error);
        
        setStatus('error');
        
        // Provide specific error messages
        if (error.code === 'auth/invalid-action-code') {
          setMessage('This verification link is invalid or has already been used.');
        } else if (error.code === 'auth/expired-action-code') {
          setMessage('This verification link has expired. Please request a new one.');
        } else {
          setMessage('Verification failed. Please try again or request a new verification email.');
        }
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

        <p style={{
          margin: '0 0 2rem 0',
          color: colors.subtext,
          fontSize: '1rem',
          lineHeight: '1.6'
        }}>
          {status === 'verifying' && 'Please wait while we verify your email address.'}
          {message}
        </p>

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

        <button
          onClick={() => {
            onNavigate('profile');
            if (status === 'success') {
              window.location.reload();
            }
          }}
          style={{
            width: '100%',
            padding: '0.875rem',
            background: status === 'success' ? '#10b981' : '#3b82f6',
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
      </div>

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