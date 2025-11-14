import React from 'react';
import { getColors } from '../../../theme';

/**
 * CalculatorLayout Component
 * Provides consistent layout and styling for all calculators
 * 
 * File Location: src/features/tools/calculators/CalculatorLayout.jsx
 * Theme Location: src/theme.js
 * Import Path: ../../../theme (calculators → tools → features → src)
 */
const CalculatorLayout = ({ 
  isDarkMode = false, 
  children 
}) => {
  const colors = getColors(isDarkMode);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.mainBg,
      paddingBottom: '2rem',
      paddingTop: '1rem'
    }}>
      {/* Content Container */}
      <div style={{ padding: '0 0.5rem' }}>
        {children}
      </div>
    </div>
  );
};

/**
 * Section Component
 * Creates a consistent card-style section
 */
export const Section = ({ title, icon: Icon, color, isDarkMode, children, style = {} }) => {
  const colors = getColors(isDarkMode);

  return (
    <div style={{
      background: colors.cardBg,
      border: `1px solid ${colors.border}`,
      borderRadius: '0.75rem',
      padding: '1rem',
      marginBottom: '0.75rem',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      ...style
    }}>
      {title && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.75rem',
          paddingBottom: '0.5rem',
          borderBottom: `1px solid ${colors.border}`
        }}>
          {Icon && (
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '0.5rem',
              background: color ? `${color}15` : colors.inputBg,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon size={18} color={color || colors.text} />
            </div>
          )}
          <h3 style={{
            margin: 0,
            fontSize: '1rem',
            fontWeight: '600',
            color: color || colors.text
          }}>
            {title}
          </h3>
        </div>
      )}
      {children}
    </div>
  );
};

/**
 * InputGroup Component
 * Provides consistent input styling
 */
export const InputGroup = ({ label, helpText, isDarkMode, children }) => {
  const colors = getColors(isDarkMode);

  return (
    <div style={{ marginBottom: '0.75rem' }}>
      {label && (
        <label style={{
          display: 'block',
          marginBottom: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '600',
          color: colors.text
        }}>
          {label}
        </label>
      )}
      {children}
      {helpText && (
        <div style={{
          marginTop: '0.375rem',
          fontSize: '0.75rem',
          color: colors.subtext,
          fontStyle: 'italic'
        }}>
          {helpText}
        </div>
      )}
    </div>
  );
};

/**
 * Input Component
 * Styled input field
 */
export const Input = ({ type = 'text', value, onChange, placeholder, isDarkMode, disabled = false, unit, ...props }) => {
  const colors = getColors(isDarkMode);

  return (
    <div style={{ position: 'relative' }}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '0.75rem',
          paddingRight: unit ? '3rem' : '0.75rem',
          border: `1px solid ${colors.border}`,
          borderRadius: '0.5rem',
          fontSize: '0.9375rem',
          background: disabled ? colors.inputBg : colors.cardBg,
          color: colors.text,
          boxSizing: 'border-box',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          outline: 'none'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#3b82f6';
          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = colors.border;
          e.target.style.boxShadow = 'none';
        }}
        {...props}
      />
      {unit && (
        <span style={{
          position: 'absolute',
          right: '0.75rem',
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: '0.875rem',
          color: colors.subtext,
          pointerEvents: 'none'
        }}>
          {unit}
        </span>
      )}
    </div>
  );
};

/**
 * Select Component
 * Styled select dropdown
 */
export const Select = ({ value, onChange, options, isDarkMode, disabled = false, ...props }) => {
  const colors = getColors(isDarkMode);

  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '0.75rem',
        border: `1px solid ${colors.border}`,
        borderRadius: '0.5rem',
        fontSize: '0.9375rem',
        background: disabled ? colors.inputBg : colors.cardBg,
        color: colors.text,
        boxSizing: 'border-box',
        cursor: 'pointer',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        outline: 'none'
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#3b82f6';
        e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
      }}
      onBlur={(e) => {
        e.target.style.borderColor = colors.border;
        e.target.style.boxShadow = 'none';
      }}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

/**
 * ResultCard Component
 * Displays calculation results in a prominent card
 */
export const ResultCard = ({ 
  label, 
  value, 
  unit, 
  color = '#3b82f6', 
  variant = 'default', // 'default' | 'prominent' | 'subtle'
  isDarkMode 
}) => {
  const colors = getColors(isDarkMode);

  const variants = {
    default: {
      background: `${color}15`,
      textColor: color,
      borderColor: `${color}30`
    },
    prominent: {
      background: color,
      textColor: '#ffffff',
      borderColor: color
    },
    subtle: {
      background: colors.inputBg,
      textColor: colors.text,
      borderColor: colors.border
    }
  };

  const style = variants[variant];

  return (
    <div style={{
      background: style.background,
      border: `1px solid ${style.borderColor}`,
      borderRadius: '0.75rem',
      padding: '1.25rem',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '0.75rem',
        fontWeight: '500',
        color: variant === 'prominent' ? 'rgba(255,255,255,0.8)' : colors.subtext,
        marginBottom: '0.5rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        {label}
      </div>
      <div style={{
        fontSize: '2.25rem',
        fontWeight: '700',
        color: style.textColor,
        lineHeight: '1',
        marginBottom: unit ? '0.25rem' : 0
      }}>
        {value}
      </div>
      {unit && (
        <div style={{
          fontSize: '0.875rem',
          fontWeight: '500',
          color: variant === 'prominent' ? 'rgba(255,255,255,0.7)' : colors.subtext
        }}>
          {unit}
        </div>
      )}
    </div>
  );
};

/**
 * InfoBox Component
 * For notes, warnings, and informational messages
 */
export const InfoBox = ({ 
  type = 'info', // 'info' | 'warning' | 'success' | 'error'
  icon: Icon,
  title,
  children,
  isDarkMode
}) => {
  const colors = getColors(isDarkMode);

  const typeStyles = {
    info: {
      background: isDarkMode ? '#1e3a8a20' : '#dbeafe',
      border: '#3b82f6',
      iconColor: '#1e40af',
      textColor: isDarkMode ? '#93c5fd' : '#1e40af'
    },
    warning: {
      background: isDarkMode ? '#78350f20' : '#fef3c7',
      border: '#f59e0b',
      iconColor: '#d97706',
      textColor: isDarkMode ? '#fbbf24' : '#92400e'
    },
    success: {
      background: isDarkMode ? '#14532d20' : '#d1fae5',
      border: '#10b981',
      iconColor: '#059669',
      textColor: isDarkMode ? '#6ee7b7' : '#065f46'
    },
    error: {
      background: isDarkMode ? '#7f1d1d20' : '#fee2e2',
      border: '#ef4444',
      iconColor: '#dc2626',
      textColor: isDarkMode ? '#fca5a5' : '#991b1b'
    }
  };

  const style = typeStyles[type];

  return (
    <div style={{
      background: style.background,
      border: `1px solid ${style.border}`,
      borderRadius: '0.75rem',
      padding: '1rem',
      marginTop: '0.75rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'start',
        gap: '0.75rem'
      }}>
        {Icon && (
          <Icon 
            size={20} 
            color={style.iconColor} 
            style={{ flexShrink: 0, marginTop: '0.125rem' }} 
          />
        )}
        <div style={{ fontSize: '0.875rem', color: style.textColor, lineHeight: '1.5', flex: 1 }}>
          {title && (
            <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
              {title}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * TabGroup Component
 * For calculators with multiple tabs/modes
 * Uses blue for active tabs to match app's color scheme (white/gray/blue in light, black/gray/white in dark)
 */
export const TabGroup = ({ tabs, activeTab, onChange, isDarkMode }) => {
  const colors = getColors(isDarkMode);
  
  // Always use blue for active tabs - matches app's primary color scheme
  const activeColor = '#3b82f6';

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${tabs.length}, 1fr)`,
      gap: '0.5rem',
      marginBottom: '0.75rem',
      padding: '0.375rem',
      background: colors.inputBg,
      borderRadius: '0.75rem',
      border: `1px solid ${colors.border}`
    }}>
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              border: 'none',
              background: isActive ? activeColor : 'transparent',
              color: isActive ? '#ffffff' : colors.text,
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            {tab.icon && <tab.icon size={16} />}
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

/**
 * Button Component
 * Styled button for actions
 */
export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', // 'primary' | 'secondary' | 'outline'
  size = 'medium', // 'small' | 'medium' | 'large'
  fullWidth = false,
  disabled = false,
  isDarkMode,
  ...props 
}) => {
  const colors = getColors(isDarkMode);

  const variants = {
    primary: {
      background: '#3b82f6',
      color: '#ffffff',
      border: 'none'
    },
    secondary: {
      background: colors.inputBg,
      color: colors.text,
      border: `1px solid ${colors.border}`
    },
    outline: {
      background: 'transparent',
      color: '#3b82f6',
      border: '1px solid #3b82f6'
    }
  };

  const sizes = {
    small: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
    medium: { padding: '0.75rem 1.5rem', fontSize: '0.9375rem' },
    large: { padding: '1rem 2rem', fontSize: '1rem' }
  };

  const variantStyle = variants[variant];
  const sizeStyle = sizes[size];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variantStyle,
        ...sizeStyle,
        width: fullWidth ? '100%' : 'auto',
        borderRadius: '0.5rem',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem'
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.target.style.transform = 'translateY(-1px)';
          e.target.style.boxShadow = '0 4px 6px rgba(0,0,0,0.15)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.target.style.transform = 'translateY(0)';
          e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
};

export default CalculatorLayout;