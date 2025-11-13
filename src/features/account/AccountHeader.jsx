import React from 'react';
import { AlertCircle } from 'lucide-react';
import { getColors } from '../../theme';

/**
 * Profile Header Component
 * Displays user avatar, name, and email with verification badge
 */
const AccountHeader = ({ user, userData, isEmailVerified, isDarkMode }) => {
  const colors = getColors(isDarkMode);

  return (
    <div style={{
      background: colors.cardBg,
      borderRadius: '1rem',
      padding: '1.5rem',
      marginBottom: '1rem',
      border: `1px solid ${colors.border}`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* Avatar */}
      <div style={{
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '2.5rem',
        fontWeight: '700',
        color: 'white',
        marginBottom: '1rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        {userData?.displayName ? userData.displayName.charAt(0).toUpperCase() : 
         user.displayName ? user.displayName.charAt(0).toUpperCase() : 
         user.email.charAt(0).toUpperCase()}
      </div>

      {/* Name */}
      <h2 style={{
        margin: '0 0 0.25rem 0',
        fontSize: '1.5rem',
        fontWeight: '700',
        color: colors.text,
        textAlign: 'center'
      }}>
        {userData?.displayName || user.displayName || 'User'}
      </h2>

      {/* Email with Unverified Badge (only shown if not verified) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.5rem'
      }}>
        <p style={{
          margin: 0,
          fontSize: '0.9375rem',
          color: colors.subtext
        }}>
          {user.email}
        </p>
        {!isEmailVerified && (
          <div style={{
            background: '#fef3c7',
            color: '#92400e',
            padding: '0.25rem 0.5rem',
            borderRadius: '0.375rem',
            fontSize: '0.75rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            <AlertCircle size={12} />
            Unverified
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountHeader;