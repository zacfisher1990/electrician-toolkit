import React, { useState } from 'react';
import { X, Mail, Download, Send, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';
import Toast from '../../components/Toast';

const SendInvoiceModal = ({ 
  invoice, 
  onClose, 
  onSend,
  onDownload,
  onGeneratePDF, // New prop for getting PDF blob
  isDarkMode = false 
}) => {
  const [email, setEmail] = useState(invoice.clientEmail || '');
  const [message, setMessage] = useState(
    `Hi ${invoice.clientName || invoice.client || 'there'},\n\nPlease find attached invoice #${invoice.invoiceNumber || 'N/A'} for $${parseFloat(invoice.total || invoice.amount || 0).toFixed(2)}.\n\nThank you for your business!`
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
      setError(err.message || 'Failed to send invoice. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleDownload = async () => {
    try {
      if (onDownload) {
        await onDownload();
        // Show success toast
        setToastMessage('Invoice downloaded successfully!');
        setToastType('success');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Download error:', error);
      // Show error toast
      setToastMessage(error.message || 'Failed to download invoice');
      setToastType('error');
      setShowToast(true);
    }
  };

  const handleSendViaText = async () => {
    try {
      // Generate the PDF blob
      if (!onGeneratePDF) {
        throw new Error('PDF generation not available');
      }

      const pdfBlob = await onGeneratePDF();
      
      if (!pdfBlob) {
        throw new Error('Failed to generate PDF');
      }

      // Create a File object from the blob
      const file = new File(
        [pdfBlob], 
        `Invoice-${invoice.invoiceNumber || 'draft'}.pdf`, 
        { type: 'application/pdf' }
      );
      
      // Pre-filled message
      const shareMessage = `Hi ${invoice.clientName || invoice.client || 'there'}, please find attached invoice #${invoice.invoiceNumber || 'N/A'} for $${parseFloat(invoice.total || invoice.amount || 0).toFixed(2)}. Thank you for your business!`;
      
      // Check if Web Share API is available and can share files
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          text: shareMessage,
          files: [file]
        });
        
        // Show success toast
        setToastMessage('Share menu opened successfully!');
        setToastType('success');
        setShowToast(true);
      } else if (navigator.share) {
        // Fallback: share without file (just the message)
        await navigator.share({
          text: shareMessage
        });
        
        // Show info toast
        setToastMessage('Message shared! Please attach the downloaded PDF manually.');
        setToastType('info');
        setShowToast(true);
        
        // Also trigger download
        if (onDownload) {
          await onDownload();
        }
      } else {
        // No share API available - copy message and download PDF
        await navigator.clipboard.writeText(shareMessage);
        
        // Trigger download
        if (onDownload) {
          await onDownload();
        }
        
        setToastMessage('Message copied! PDF downloaded. You can now text both to your client.');
        setToastType('success');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error sharing invoice:', error);
      
      // If user canceled the share, don't show error
      if (error.name === 'AbortError') {
        return;
      }
      
      setToastMessage(error.message || 'Unable to share. Try the download option instead.');
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
              Send Invoice
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
                Invoice Sent!
              </h4>
              <p style={{
                color: colors.textSecondary,
                fontSize: '0.875rem',
                margin: 0
              }}>
                Invoice #{invoice.invoiceNumber} has been sent to {email}
              </p>
            </div>
          ) : (
            <>
              {/* Invoice Preview */}
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
                    Invoice #
                  </span>
                  <span style={{
                    color: colors.text,
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    {invoice.invoiceNumber || 'N/A'}
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
                    {invoice.clientName || invoice.client || 'N/A'}
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
                    Total
                  </span>
                  <span style={{
                    color: colors.text,
                    fontSize: '1.125rem',
                    fontWeight: '700'
                  }}>
                    ${parseFloat(invoice.total || invoice.amount || 0).toFixed(2)}
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
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '0.5rem'
              }}>
                {/* Download Button */}
                <button
                  onClick={handleDownload}
                  disabled={sending}
                  style={{
                    padding: '0.75rem 0.5rem',
                    background: 'transparent',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    color: colors.text,
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    cursor: sending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    opacity: sending ? 0.5 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  <Download size={16} />
                  <span style={{ display: 'inline' }}>PDF</span>
                </button>

                {/* Send via Text Button */}
                <button
                  onClick={handleSendViaText}
                  disabled={sending}
                  style={{
                    padding: '0.75rem 0.5rem',
                    background: 'transparent',
                    border: `1px solid ${colors.border}`,
                    borderRadius: '0.5rem',
                    color: colors.text,
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    cursor: sending ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    opacity: sending ? 0.5 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  <MessageSquare size={16} />
                  <span style={{ display: 'inline' }}>Text</span>
                </button>

                {/* Send Email Button */}
                <button
                  onClick={handleSend}
                  disabled={sending || !email}
                  style={{
                    padding: '0.75rem 0.5rem',
                    background: (!email || sending) ? colors.textSecondary : colors.buttonBg,
                    border: 'none',
                    borderRadius: '0.5rem',
                    color: colors.buttonText,
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    cursor: (!email || sending) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <Send size={16} />
                  <span style={{ display: 'inline' }}>{sending ? 'Sending...' : 'Email'}</span>
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

export default SendInvoiceModal;