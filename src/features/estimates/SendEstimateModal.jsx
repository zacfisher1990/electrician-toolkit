import React, { useState } from 'react';
import { X, Mail, Download, Send, CheckCircle, AlertCircle } from 'lucide-react';
import Toast from '../../components/Toast'; // Add this import

const SendEstimateModal = ({ 
  estimate, 
  onClose, 
  onSend,
  onDownload,
  isDarkMode = false 
}) => {
  const [email, setEmail] = useState(estimate.clientEmail || '');
  const [message, setMessage] = useState(
    `Please find attached your estimate for ${estimate.name || 'your project'}.\n\nThis estimate is valid for 30 days. If you have any questions, please don't hesitate to reach out.\n\nThank you for considering our services!`
  );
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false); // Add toast state
  const [toastMessage, setToastMessage] = useState(''); // Add toast message state
  const [toastType, setToastType] = useState('success'); // Add toast type state

  const colors = {
    bg: isDarkMode ? '#000000' : '#f9fafb',
    cardBg: isDarkMode ? '#111111' : '#ffffff',
    border: isDarkMode ? '#1a1a1a' : '#e5e7eb',
    text: isDarkMode ? '#ffffff' : '#111827',
    textSecondary: isDarkMode ? '#9ca3af' : '#6b7280',
    inputBg: isDarkMode ? '#1a1a1a' : '#ffffff',
    buttonBg: '#3b82f6',
    buttonText: '#ffffff',
    successBg: '#10b981',
    errorBg: '#ef4444'
  };

  const handleSend = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setSending(true);
    setError('');

    try {
      await onSend(email, message);
      setSent(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error sending invoice:', err);
      setError(err.message || 'Failed to send estimate. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleDownload = async () => {
    try {
      if (onDownload) {
        await onDownload();
        // Show success toast
        setToastMessage('Estimate downloaded successfully!');
        setToastType('success');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Download error:', error);
      // Show error toast
      setToastMessage(error.message || 'Failed to download estimate');
      setToastType('error');
      setShowToast(true);
    }
  };

  return (
    <>
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
        padding: '1rem',
        paddingBottom: '6rem',
        overflowY: 'auto'
      }}>
        <div style={{
          background: colors.cardBg,
          borderRadius: '0.75rem',
          padding: '1.5rem',
          maxWidth: '500px',
          width: '100%',
          maxHeight: 'calc(100vh - 8rem)',
          overflow: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          margin: 'auto'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem'
          }}>
            <h3 style={{
              margin: 0,
              color: colors.text,
              fontSize: '1.25rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Mail size={24} color={colors.buttonBg} />
              Send Estimate
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                color: colors.textSecondary
              }}
            >
              <X size={24} />
            </button>
          </div>

          {sent ? (
            // Success state
            <div style={{
              textAlign: 'center',
              padding: '2rem 0'
            }}>
              <CheckCircle 
                size={64} 
                color={colors.successBg}
                style={{ margin: '0 auto 1rem' }}
              />
              <h4 style={{
                color: colors.text,
                fontSize: '1.125rem',
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Estimate Sent!
              </h4>
              <p style={{
                color: colors.textSecondary,
                fontSize: '0.875rem',
                margin: 0
              }}>
                Estimate #{estimate.estimateNumber} has been sent to {email}
              </p>
            </div>
          ) : (
            <>
              {/* Estimate Preview */}
              <div style={{
                background: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                padding: '1rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{
                    color: colors.textSecondary,
                    fontSize: '0.875rem'
                  }}>
                    Estimate #
                  </span>
                  <span style={{
                    color: colors.text,
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {estimate.estimateNumber || 'N/A'}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem'
                }}>
                  <span style={{
                    color: colors.textSecondary,
                    fontSize: '0.875rem'
                  }}>
                    Client
                  </span>
                  <span style={{
                    color: colors.text,
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {estimate.clientName || estimate.client || 'N/A'}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  paddingTop: '0.5rem',
                  borderTop: `1px solid ${colors.border}`
                }}>
                  <span style={{
                    color: colors.textSecondary,
                    fontSize: '0.875rem'
                  }}>
                    Estimated Total
                  </span>
                  <span style={{
                    color: colors.text,
                    fontSize: '1.125rem',
                    fontWeight: '700'
                  }}>
                    ${parseFloat(estimate.total || estimate.amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Email Input */}
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  color: colors.text,
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Client Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@example.com"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: colors.inputBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    color: colors.text,
                    fontSize: '0.9375rem',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Message Input */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  color: colors.text,
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  marginBottom: '0.5rem'
                }}>
                  Message (Optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Add a personal message..."
                  rows={5}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    background: colors.inputBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    color: colors.text,
                    fontSize: '0.9375rem',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div style={{
                  background: '#fee2e2',
                  border: '1px solid #fca5a5',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <AlertCircle size={20} color="#dc2626" />
                  <span style={{
                    color: '#991b1b',
                    fontSize: '0.875rem'
                  }}>
                    {error}
                  </span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem'
              }}>
                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  disabled={sending}
                  style={{
                    padding: '0.75rem 1rem',
                    background: 'transparent',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    color: colors.text,
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    cursor: sending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    opacity: sending ? 0.5 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  <Download size={18} />
                  Download
                </button>

                {/* Send Button */}
                <button
                  onClick={handleSend}
                  disabled={sending || !email}
                  style={{
                    padding: '0.75rem 1rem',
                    background: (!email || sending) ? colors.textSecondary : colors.buttonBg,
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: colors.buttonText,
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    cursor: (!email || sending) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <Send size={18} />
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
          duration={3000}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  );
};

export default SendEstimateModal;