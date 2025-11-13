import React from 'react';
import { CheckCircle } from 'lucide-react';
import { getColors } from '../../theme';

/**
 * Password Requirements Display Component
 * Shows validation status for password requirements
 */
const PasswordRequirements = ({ passwordRequirements, isDarkMode }) => {
  const colors = getColors(isDarkMode);

  const requirements = [
    { key: 'minLength', label: 'At least 8 characters' },
    { key: 'hasUpperCase', label: 'One uppercase letter' },
    { key: 'hasLowerCase', label: 'One lowercase letter' },
    { key: 'hasNumber', label: 'One number' }
  ];

  return (
    <div style={{
      marginBottom: '1.5rem',
      padding: '0.75rem',
      background: isDarkMode ? '#1a1a1a' : '#f9fafb',
      borderRadius: '0.5rem',
      border: `1px solid ${colors.border}`
    }}>
      <p style={{
        margin: '0 0 0.5rem 0',
        fontSize: '0.75rem',
        fontWeight: '600',
        color: colors.text
      }}>
        Password must have:
      </p>
      {requirements.map(({ key, label }) => (
        <div
          key={key}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.25rem'
          }}
        >
          <CheckCircle
            size={14}
            style={{
              color: passwordRequirements[key] ? '#10b981' : colors.subtext,
              flexShrink: 0
            }}
          />
          <span
            style={{
              fontSize: '0.8125rem',
              color: passwordRequirements[key] ? colors.text : colors.subtext
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PasswordRequirements;