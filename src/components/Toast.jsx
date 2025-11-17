import React, { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, Clock, Square } from 'lucide-react';

const Toast = ({ 
  message, 
  type = 'success', 
  onClose, 
  duration = 3000,
  isDarkMode = false 
}) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getToastStyles = () => {
    switch (type) {
      case 'clock-in':
        return {
          bg: isDarkMode ? '#065f46' : '#d1fae5',
          border: isDarkMode ? '#047857' : '#10b981',
          text: isDarkMode ? '#d1fae5' : '#065f46',
          icon: Clock
        };
      case 'clock-out':
        return {
          bg: isDarkMode ? '#7f1d1d' : '#fee2e2',
          border: isDarkMode ? '#991b1b' : '#ef4444',
          text: isDarkMode ? '#fecaca' : '#7f1d1d',
          icon: Square
        };
      case 'success':
        return {
          bg: isDarkMode ? '#065f46' : '#d1fae5',
          border: isDarkMode ? '#047857' : '#10b981',
          text: isDarkMode ? '#d1fae5' : '#065f46',
          icon: CheckCircle
        };
      case 'error':
        return {
          bg: isDarkMode ? '#7f1d1d' : '#fee2e2',
          border: isDarkMode ? '#991b1b' : '#ef4444',
          text: isDarkMode ? '#fecaca' : '#7f1d1d',
          icon: XCircle
        };
      case 'warning':
        return {
          bg: isDarkMode ? '#78350f' : '#fef3c7',
          border: isDarkMode ? '#92400e' : '#f59e0b',
          text: isDarkMode ? '#fde68a' : '#78350f',
          icon: AlertCircle
        };
      case 'info':
        return {
          bg: isDarkMode ? '#1e3a8a' : '#dbeafe',
          border: isDarkMode ? '#1e40af' : '#3b82f6',
          text: isDarkMode ? '#bfdbfe' : '#1e3a8a',
          icon: Info
        };
      default:
        return {
          bg: isDarkMode ? '#065f46' : '#d1fae5',
          border: isDarkMode ? '#047857' : '#10b981',
          text: isDarkMode ? '#d1fae5' : '#065f46',
          icon: CheckCircle
        };
    }
  };

  const styles = getToastStyles();
  const Icon = styles.icon;

  return (
    <div style={{
      position: 'fixed',
      bottom: '6rem',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      width: 'calc(100% - 2rem)',
      maxWidth: '400px',
      animation: 'slideUp 0.3s ease-out'
    }}>
      <div style={{
        background: styles.bg,
        border: `1px solid ${styles.border}`,
        borderRadius: '0.75rem',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}>
        <Icon size={20} color={styles.text} style={{ flexShrink: 0 }} />
        <p style={{
          margin: 0,
          color: styles.text,
          fontSize: '0.875rem',
          fontWeight: '500',
          flex: 1
        }}>
          {message}
        </p>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem',
            color: styles.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <XCircle size={18} />
        </button>
      </div>
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateX(-50%) translateY(100px);
            opacity: 0;
          }
          to {
            transform: translateX(-50%) translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default Toast;