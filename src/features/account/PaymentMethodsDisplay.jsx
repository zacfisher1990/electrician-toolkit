import React from 'react';
import { DollarSign, ExternalLink } from 'lucide-react';

/**
 * Payment Methods Display Component
 * Shows payment methods on invoices, estimates, and other documents
 * Can be used in both UI and PDF generation
 */
const PaymentMethodsDisplay = ({ 
  paymentMethods, 
  isDarkMode = false,
  variant = 'card', // 'card' or 'inline' or 'pdf'
  showTitle = true 
}) => {
  if (!paymentMethods || paymentMethods.length === 0) {
    return null;
  }

  const colors = {
    text: isDarkMode ? '#ffffff' : '#111827',
    subtext: isDarkMode ? '#9ca3af' : '#6b7280',
    border: isDarkMode ? '#1a1a1a' : '#e5e7eb',
    cardBg: isDarkMode ? '#1a1a1a' : '#f9fafb',
    greenBg: '#d1fae5',
    greenBorder: '#10b981',
    greenText: '#047857'
  };

  // PDF variant for use in PDF documents
  if (variant === 'pdf') {
    return (
      <div style={{
        marginTop: '20px',
        padding: '15px',
        background: '#f0fdf4',
        border: '2px solid #10b981',
        borderRadius: '8px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '12px'
        }}>
          <span style={{
            fontSize: '16px',
            fontWeight: '700',
            color: '#047857'
          }}>
            💳 Payment Methods
          </span>
        </div>
        {paymentMethods.map((method, index) => (
          <div 
            key={index}
            style={{
              padding: '10px',
              background: 'white',
              borderRadius: '6px',
              marginBottom: index < paymentMethods.length - 1 ? '8px' : 0,
              border: '1px solid #d1fae5'
            }}
          >
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#047857',
              marginBottom: '4px'
            }}>
              {method.name}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#065f46',
              wordBreak: 'break-all'
            }}>
              {method.url}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Inline variant for compact display
  if (variant === 'inline') {
    return (
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        alignItems: 'center'
      }}>
        {showTitle && (
          <span style={{
            fontSize: '0.8125rem',
            fontWeight: '600',
            color: colors.subtext
          }}>
            Payment:
          </span>
        )}
        {paymentMethods.map((method, index) => (
          <a
            key={index}
            href={method.url.startsWith('http') ? method.url : `mailto:${method.url}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '0.375rem 0.75rem',
              background: colors.greenBg,
              color: colors.greenText,
              borderRadius: '0.375rem',
              fontSize: '0.8125rem',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              border: `1px solid ${colors.greenBorder}`
            }}
          >
            {method.name}
            {method.url.startsWith('http') && <ExternalLink size={12} />}
          </a>
        ))}
      </div>
    );
  }

  // Card variant (default) for full display
  return (
    <div style={{
      padding: '1rem',
      background: colors.greenBg,
      border: `2px solid ${colors.greenBorder}`,
      borderRadius: '0.75rem'
    }}>
      {showTitle && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem'
        }}>
          <DollarSign size={18} style={{ color: colors.greenText }} />
          <p style={{
            margin: 0,
            fontSize: '0.9375rem',
            fontWeight: '700',
            color: colors.greenText
          }}>
            Payment Methods
          </p>
        </div>
      )}
      
      <p style={{
        margin: '0 0 0.75rem 0',
        fontSize: '0.8125rem',
        color: colors.greenText,
        lineHeight: '1.4'
      }}>
        Click on any payment method below to pay this invoice:
      </p>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}>
        {paymentMethods.map((method, index) => (
          <a
            key={index}
            href={method.url.startsWith('http') ? method.url : `mailto:${method.url}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem',
              background: 'white',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              border: `1px solid ${colors.greenBorder}`,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div>
              <p style={{
                margin: '0 0 0.25rem 0',
                fontSize: '0.9375rem',
                fontWeight: '600',
                color: colors.greenText
              }}>
                {method.name}
              </p>
              <p style={{
                margin: 0,
                fontSize: '0.75rem',
                color: '#065f46',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '250px'
              }}>
                {method.url}
              </p>
            </div>
            {method.url.startsWith('http') && (
              <ExternalLink size={16} style={{ color: colors.greenText, flexShrink: 0 }} />
            )}
          </a>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethodsDisplay;