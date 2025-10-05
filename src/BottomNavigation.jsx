import React from 'react';
import { Home, Calculator } from 'lucide-react';

function BottomNavigation({ onNavigate, currentView }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#ffffff',
      borderTop: '1px solid #e5e7eb',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '0.5rem 0',
      zIndex: 1000,
      boxShadow: '0 -1px 3px rgba(0, 0, 0, 0.1)'
    }}>
      <button
        onClick={() => onNavigate('home')}
        style={{
          background: 'none',
          border: 'none',
          color: currentView === 'home' ? '#3b82f6' : '#6b7280',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.125rem',
          fontSize: '0.625rem',
          fontWeight: '500',
          flex: 1,
          padding: '0.25rem',
          transition: 'color 0.2s'
        }}
      >
        <Home size={20} strokeWidth={2} />
        <span>Home</span>
      </button>
      
      <button
        onClick={() => onNavigate('calculators')}
        style={{
          background: 'none',
          border: 'none',
          color: currentView === 'calculators' ? '#3b82f6' : '#6b7280',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.125rem',
          fontSize: '0.625rem',
          fontWeight: '500',
          flex: 1,
          padding: '0.25rem',
          transition: 'color 0.2s'
        }}
      >
        <Calculator size={20} strokeWidth={2} />
        <span>Calculators</span>
      </button>
    </div>
  );
}

export default BottomNavigation;