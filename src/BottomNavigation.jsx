import React from 'react';
import { Home, Calculator, Briefcase, User } from 'lucide-react';

function BottomNavigation({ onNavigate, currentView, isDarkMode = false }) {
  // Dark mode colors
  const colors = {
    bg: isDarkMode ? '#111827' : '#ffffff',
    border: isDarkMode ? '#374151' : '#e5e7eb',
    activeText: '#3b82f6',
    inactiveText: isDarkMode ? '#9ca3af' : '#6b7280'
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: colors.bg,
      borderTop: `1px solid ${colors.border}`,
      display: 'flex',
      justifyContent: 'space-around',
      padding: '0.375rem 0',
      zIndex: 1000,
      boxShadow: isDarkMode ? '0 -1px 3px rgba(0, 0, 0, 0.3)' : '0 -1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <button
        onClick={() => onNavigate('home')}
        style={{
          background: 'none',
          border: 'none',
          color: currentView === 'home' ? colors.activeText : colors.inactiveText,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.125rem',
          fontSize: '0.5625rem',
          fontWeight: '500',
          flex: 1,
          padding: '0.125rem',
          transition: 'color 0.2s',
          minWidth: 0
        }}
      >
        <Home size={18} strokeWidth={2} />
        <span>Home</span>
      </button>
      
      <button
        onClick={() => onNavigate('calculators')}
        style={{
          background: 'none',
          border: 'none',
          color: currentView === 'calculators' ? colors.activeText : colors.inactiveText,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.125rem',
          fontSize: '0.5625rem',
          fontWeight: '500',
          flex: 1,
          padding: '0.125rem',
          transition: 'color 0.2s',
          minWidth: 0
        }}
      >
        <Calculator size={18} strokeWidth={2} />
        <span>Calculators</span>
      </button>

      <button
        onClick={() => onNavigate('jobs')}
        style={{
          background: 'none',
          border: 'none',
          color: currentView === 'jobs' ? colors.activeText : colors.inactiveText,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.125rem',
          fontSize: '0.5625rem',
          fontWeight: '500',
          flex: 1,
          padding: '0.125rem',
          transition: 'color 0.2s',
          minWidth: 0
        }}
      >
        <Briefcase size={18} strokeWidth={2} />
        <span>Jobs</span>
      </button>

      <button
        onClick={() => onNavigate('profile')}
        style={{
          background: 'none',
          border: 'none',
          color: currentView === 'profile' ? colors.activeText : colors.inactiveText,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.125rem',
          fontSize: '0.5625rem',
          fontWeight: '500',
          flex: 1,
          padding: '0.125rem',
          transition: 'color 0.2s',
          minWidth: 0
        }}
      >
        <User size={18} strokeWidth={2} />
        <span>Profile</span>
      </button>
    </div>
  );
}

export default BottomNavigation;