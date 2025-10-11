import React from 'react';
import { Home, Calculator, Briefcase, User, FileText } from 'lucide-react';

function BottomNavigation({ onNavigate, currentView, isDarkMode = false }) {
  // Dark mode colors
  const colors = {
    bg: isDarkMode ? '#000000' : '#ffffff',
    border: isDarkMode ? '#1a1a1a' : '#e5e7eb',
    activeText: '#3b82f6',
    inactiveText: isDarkMode ? '#666666' : '#6b7280'
  };

  const buttonStyle = (isActive) => ({
    background: 'transparent',
    border: '0',
    borderWidth: '0',
    outline: 'none',
    boxShadow: 'none',
    color: isActive ? colors.activeText : colors.inactiveText,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.25rem',
    fontSize: '0.625rem',
    fontWeight: '500',
    flex: '1 1 0',
    padding: '0.5rem 0.25rem',
    margin: 0,
    transition: 'color 0.2s',
    WebkitTapHighlightColor: 'transparent',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    minWidth: '0'
  });

  const labelStyle = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '100%',
    textAlign: 'center',
    lineHeight: '1',
    marginTop: '0.125rem'
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      width: '100%',
      background: colors.bg,
      borderTop: `1px solid ${colors.border}`,
      margin: 0,
      zIndex: 10000,
      boxSizing: 'border-box',
      paddingBottom: 'env(safe-area-inset-bottom)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0.25rem 0',
        paddingLeft: 'max(0.5rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.5rem, env(safe-area-inset-right))',
        minHeight: '60px'
      }}>
        <button
          onClick={() => onNavigate('home')}
          style={buttonStyle(currentView === 'home')}
        >
          <Home size={22} strokeWidth={currentView === 'home' ? 2.5 : 2} />
          <span style={labelStyle}>Home</span>
        </button>
        
        <button
          onClick={() => onNavigate('calculators')}
          style={buttonStyle(currentView === 'calculators')}
        >
          <Calculator size={22} strokeWidth={currentView === 'calculators' ? 2.5 : 2} />
          <span style={labelStyle}>Calculators</span>
        </button>

        <button
          onClick={() => onNavigate('jobs')}
          style={buttonStyle(currentView === 'jobs')}
        >
          <Briefcase size={22} strokeWidth={currentView === 'jobs' ? 2.5 : 2} />
          <span style={labelStyle}>Jobs</span>
        </button>

        <button
          onClick={() => onNavigate('estimates')}
          style={buttonStyle(currentView === 'estimates')}
        >
          <FileText size={22} strokeWidth={currentView === 'estimates' ? 2.5 : 2} />
          <span style={labelStyle}>Estimates</span>
        </button>

        <button
          onClick={() => onNavigate('profile')}
          style={buttonStyle(currentView === 'profile')}
        >
          <User size={22} strokeWidth={currentView === 'profile' ? 2.5 : 2} />
          <span style={labelStyle}>Profile</span>
        </button>
      </div>
    </div>
  );
}

export default BottomNavigation;