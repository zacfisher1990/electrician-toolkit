import React, { useState } from 'react';
import { X, AlertTriangle, Trash2, Lock } from 'lucide-react';
import { 
  getAuth, 
  EmailAuthProvider, 
  reauthenticateWithCredential,
  deleteUser 
} from 'firebase/auth';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { auth } from '../../firebase/firebase';

const DeleteAccountModal = ({ isOpen, onClose, isDarkMode }) => {
  const user = auth.currentUser;

  const [step, setStep] = useState(1); // 1: Warning, 2: Password Confirmation, 3: Final Confirmation
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#0a0a0a' : '#ffffff',
    text: isDarkMode ? '#ffffff' : '#111827',
    subtext: isDarkMode ? '#666666' : '#6b7280',
    border: isDarkMode ? '#1a1a1a' : '#e5e7eb',
    inputBg: isDarkMode ? '#000000' : '#ffffff',
  };

  if (!isOpen) return null;

  const handleClose = () => {
    if (!loading) {
      setStep(1);
      setPassword('');
      setConfirmText('');
      setError('');
      onClose();
    }
  };

  const handlePasswordVerification = async () => {
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Reauthenticate user
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      
      // Move to final confirmation step
      setStep(3);
      setPassword(''); // Clear password for security
    } catch (err) {
      console.error('Reauthentication error:', err);
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Incorrect password. Please try again.');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get functions instance from auth.app
      const functions = getFunctions(auth.app);
      
      // Call Cloud Function to delete all user data
      const deleteUserData = httpsCallable(functions, 'deleteUserAccount');
      await deleteUserData();

      // Delete the auth user
      await deleteUser(user);

      // Success - user will be logged out automatically
      onClose();
    } catch (err) {
      console.error('Error deleting account:', err);
      
      if (err.code === 'auth/requires-recent-login') {
        setError('Session expired. Please close this dialog and try again.');
      } else {
        setError('Failed to delete account. Please try again or contact support.');
      }
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem',
      paddingBottom: '5rem' // Extra padding for bottom nav bar
    }}>
      <div style={{
        background: colors.cardBg,
        borderRadius: '1rem',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '85vh', // Reduced from 90vh to account for nav
        overflow: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: `1px solid ${colors.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          background: colors.cardBg,
          zIndex: 1
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#fee2e2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle size={20} color="#dc2626" />
            </div>
            <h2 style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: '700',
              color: colors.text
            }}>
              Delete Account
            </h2>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '0.375rem',
              color: colors.subtext,
              opacity: loading ? 0.5 : 1
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {/* Step 1: Warning */}
          {step === 1 && (
            <>
              <div style={{
                padding: '1rem',
                background: '#fef3c7',
                border: '2px solid #fbbf24',
                borderRadius: '0.75rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{
                  margin: '0 0 0.75rem 0',
                  color: '#92400e',
                  fontSize: '0.9375rem',
                  fontWeight: '600'
                }}>
                  ⚠️ This action cannot be undone
                </p>
                <p style={{
                  margin: 0,
                  color: '#92400e',
                  fontSize: '0.875rem',
                  lineHeight: '1.5'
                }}>
                  Deleting your account will permanently remove:
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                {[
                  'All your jobs and job history',
                  'All estimates and invoices',
                  'All client information',
                  'All uploaded photos and documents',
                  'Your profile and company information',
                  'All app data and settings'
                ].map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.75rem',
                      padding: '0.75rem',
                      background: isDarkMode ? '#1a1a1a' : '#f9fafb',
                      borderRadius: '0.5rem',
                      marginBottom: '0.5rem'
                    }}
                  >
                    <Trash2 size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                    <span style={{
                      color: colors.text,
                      fontSize: '0.875rem',
                      lineHeight: '1.5'
                    }}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{
                padding: '1rem',
                background: '#dbeafe',
                border: '1px solid #3b82f6',
                borderRadius: '0.75rem',
                marginBottom: '1.5rem'
              }}>
                <p style={{
                  margin: 0,
                  color: '#1e40af',
                  fontSize: '0.875rem',
                  lineHeight: '1.5'
                }}>
                  <strong>Note:</strong> If you're having issues with the app, please consider contacting support before deleting your account. We're here to help!
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleClose}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: colors.border,
                    color: colors.text,
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  Continue
                </button>
              </div>
            </>
          )}

          {/* Step 2: Password Verification */}
          {step === 2 && (
            <>
              <p style={{
                margin: '0 0 1.5rem 0',
                color: colors.text,
                fontSize: '0.9375rem',
                lineHeight: '1.6'
              }}>
                To confirm this is you, please enter your password:
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: colors.text,
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock 
                    size={18} 
                    style={{
                      position: 'absolute',
                      left: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: colors.subtext
                    }}
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handlePasswordVerification();
                      }
                    }}
                    disabled={loading}
                    placeholder="Enter your password"
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.5rem',
                      border: `1px solid ${error ? '#dc2626' : colors.border}`,
                      borderRadius: '0.5rem',
                      fontSize: '0.9375rem',
                      background: colors.inputBg,
                      color: colors.text,
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {error && (
                <div style={{
                  padding: '0.75rem',
                  background: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: '0.5rem',
                  color: '#dc2626',
                  fontSize: '0.875rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    setStep(1);
                    setPassword('');
                    setError('');
                  }}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: colors.border,
                    color: colors.text,
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  Back
                </button>
                <button
                  onClick={handlePasswordVerification}
                  disabled={loading || !password}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: (loading || !password) ? colors.border : '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: (loading || !password) ? 'not-allowed' : 'pointer',
                    opacity: (loading || !password) ? 0.5 : 1
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </>
          )}

          {/* Step 3: Final Confirmation */}
          {step === 3 && (
            <>
              <p style={{
                margin: '0 0 1.5rem 0',
                color: colors.text,
                fontSize: '0.9375rem',
                lineHeight: '1.6'
              }}>
                This is your last chance to cancel. To permanently delete your account and all associated data, type <strong style={{ color: '#dc2626' }}>DELETE</strong> below:
              </p>

              <div style={{ marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => {
                    setConfirmText(e.target.value);
                    setError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleDeleteAccount();
                    }
                  }}
                  disabled={loading}
                  placeholder="Type DELETE to confirm"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: `2px solid ${confirmText === 'DELETE' ? '#dc2626' : colors.border}`,
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    background: colors.inputBg,
                    color: colors.text,
                    boxSizing: 'border-box',
                    fontWeight: '600',
                    textAlign: 'center',
                    letterSpacing: '0.05em'
                  }}
                />
              </div>

              {error && (
                <div style={{
                  padding: '0.75rem',
                  background: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: '0.5rem',
                  color: '#dc2626',
                  fontSize: '0.875rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertTriangle size={16} />
                  {error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => {
                    setStep(1);
                    setConfirmText('');
                    setError('');
                  }}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: colors.border,
                    color: colors.text,
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading || confirmText !== 'DELETE'}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: (loading || confirmText !== 'DELETE') ? colors.border : '#dc2626',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: (loading || confirmText !== 'DELETE') ? 'not-allowed' : 'pointer',
                    opacity: (loading || confirmText !== 'DELETE') ? 0.5 : 1
                  }}
                >
                  {loading ? 'Deleting Account...' : 'Delete My Account'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;