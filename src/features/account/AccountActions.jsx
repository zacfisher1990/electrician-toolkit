import React from 'react';
import { LogOut, Trash2 } from 'lucide-react';
import { getColors } from '../../theme';

/**
 * Profile Actions Component
 * Displays sign out and delete account buttons
 */
const AccountActions = ({ isDarkMode, onLogout, onDeleteAccount }) => {
  const colors = getColors(isDarkMode);

  return (
    <div style={{
      background: colors.cardBg,
      borderRadius: '1rem',
      padding: '0.5rem',
      marginBottom: '1rem',
      border: `1px solid ${colors.border}`
    }}>
      {/* Sign Out Button */}
      <button
        onClick={onLogout}
        style={{
          width: '100%',
          padding: '0.875rem',
          background: 'transparent',
          color: colors.text,
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '0.9375rem',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '0.5rem'
        }}
      >
        <LogOut size={20} style={{ color: colors.subtext }} />
        Sign Out
      </button>

      {/* Delete Account Button */}
      <button
        onClick={onDeleteAccount}
        style={{
          width: '100%',
          padding: '0.875rem',
          background: 'transparent',
          color: '#dc2626',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '0.9375rem',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}
      >
        <Trash2 size={20} />
        Delete Account
      </button>
    </div>
  );
};

export default AccountActions;