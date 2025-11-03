import React from 'react';
import { Home, Calculator, Briefcase, FileText, Receipt, Wrench } from 'lucide-react';
import { getColors } from '../theme';

function BottomNavigation({ onNavigate, currentView, isDarkMode = false }) {
  // Get colors from centralized theme
  const colors = getColors(isDarkMode);

  const buttonStyle = (isActive) => ({
    background: 'transparent',
    border: '0',
    borderWidth: '0',
    outline: 'none',
    boxShadow: 'none',
    color: isActive ? colors.blue : colors.subtext,
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: '0.25rem',
    fontSize: '0.625rem',
    fontWeight: '500',
    flex: '1 1 0',
    padding: '0.5rem 0.25rem',
    paddingTop: '0.75rem',
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
      background: colors.cardBg,
      borderTop: `1px solid ${colors.border}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'stretch',
      padding: '0.25rem 0.5rem',
      paddingBottom: 'calc(0.25rem + env(safe-area-inset-bottom))',
      margin: 0,
      zIndex: 10000,
      minHeight: '80px',
      boxSizing: 'border-box'
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
        <Wrench size={22} strokeWidth={currentView === 'calculators' ? 2.5 : 2} />
        <span style={labelStyle}>Tools</span>
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
        onClick={() => onNavigate('invoices')}
        style={buttonStyle(currentView === 'invoices')}
      >
        <Receipt size={22} strokeWidth={currentView === 'invoices' ? 2.5 : 2} />
        <span style={labelStyle}>Invoices</span>
      </button>
    </div>
  );
}

export default BottomNavigation;