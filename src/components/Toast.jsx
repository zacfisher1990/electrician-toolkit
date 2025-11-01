import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

/**
 * Toast Notification Component
 * @param {string} message - The message to display
 * @param {string} type - 'success' or 'error'
 * @param {function} onClose - Callback when toast is dismissed
 * @param {number} duration - How long to show toast in ms (default 3000)
 * @param {boolean} isDarkMode - Dark mode flag
 */
const Toast = ({ 
  message, 
  type = 'success', 
  onClose, 
  duration = 3000,
  isDarkMode = false 
}) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const colors = {
    success: {
      bg: isDarkMode ? '#065f46' : '#d1fae5',
      text: isDarkMode ? '#6ee7b7' : '#065f46',
      border: isDarkMode ? '#10b981' : '#6ee7b7',
      icon: '#10b981'
    },
    error: {
      bg: isDarkMode ? '#7f1d1d' : '#fee2e2',
      text: isDarkMode ? '#fca5a5' : '#991b1b',
      border: isDarkMode ? '#ef4444' : '#fca5a5',
      icon: '#ef4444'
    }
  };

  const style = colors[type] || colors.success;

  return (
    <div style={{
      position: 'fixed',
      bottom: '80px', // Above bottom navigation
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      animation: 'slideUp 0.3s ease-out',
      width: 'calc(100% - 2rem)',
      maxWidth: '400px'
    }}>
      <div style={{
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: '0.75rem',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
      }}>
        {/* Icon */}
        {type === 'success' ? (
          <CheckCircle size={24} color={style.icon} style={{ flexShrink: 0 }} />
        ) : (
          <AlertCircle size={24} color={style.icon} style={{ flexShrink: 0 }} />
        )}
        
        {/* Message */}
        <span style={{
          color: style.text,
          fontSize: '0.9375rem',
          fontWeight: '500',
          flex: 1
        }}>
          {message}
        </span>
        
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            color: style.text,
            opacity: 0.7,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
        >
          <X size={18} />
        </button>
      </div>
      
      {/* Add keyframe animation */}
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