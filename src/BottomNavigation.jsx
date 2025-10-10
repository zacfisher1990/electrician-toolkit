import React from 'react';
import { Home, Calculator, Briefcase, User, FileText } from 'lucide-react';

function BottomNavigation({ onNavigate, currentView, isDarkMode = false }) {
  // Dark mode colors
  const colors = {
    bg: isDarkMode ? '#111827' : '#ffffff',
    border: isDarkMode ? '#374151' : '#e5e7eb',
    activeText: '#3b82f6',
    inactiveText: isDarkMode ? '#9ca3af' : '#6b7280'
  };

  const buttonStyle = (isActive) => ({
    background: 'none',
    border: 'none',
    color: isActive ? colors.activeText : colors.inactiveText,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.125rem',
    fontSize: '0.5625rem',
    fontWeight: '500',
    flex: 1,
    padding: '0.25rem 0.125rem',
    transition: 'color 0.2s',
    minWidth: 0,
    minHeight: '52px', // Fixed height to prevent shifting
    maxHeight: '52px'
  });

  const labelStyle = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
    lineHeight: '1'
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
      padding: 0,
      zIndex: 10000,
      boxShadow: isDarkMode ? '0 -1px 3px rgba(0, 0, 0, 0.3)' : '0 -1px 3px rgba(0, 0, 0, 0.1)',
      height: '52px',
      minHeight: '52px',
      maxHeight: '52px'
    }}>
      <button
        onClick={() => onNavigate('home')}
        style={buttonStyle(currentView === 'home')}
      >
        <Home size={18} strokeWidth={2} />
        <span style={labelStyle}>Home</span>
      </button>
      
      <button
        onClick={() => onNavigate('calculators')}
        style={buttonStyle(currentView === 'calculators')}
      >
        <Calculator size={18} strokeWidth={2} />
        <span style={labelStyle}>Calculators</span>
      </button>

      <button
        onClick={() => onNavigate('jobs')}
        style={buttonStyle(currentView === 'jobs')}
      >
        <Briefcase size={18} strokeWidth={2} />
        <span style={labelStyle}>Jobs</span>
      </button>

      <button
        onClick={() => onNavigate('estimates')}
        style={buttonStyle(currentView === 'estimates')}
      >
        <FileText size={18} strokeWidth={2} />
        <span style={labelStyle}>Estimates</span>
      </button>

      <button
        onClick={() => onNavigate('profile')}
        style={buttonStyle(currentView === 'profile')}
      >
        <User size={18} strokeWidth={2} />
        <span style={labelStyle}>Profile</span>
      </button>
    </div>
  );
}

export default BottomNavigation;