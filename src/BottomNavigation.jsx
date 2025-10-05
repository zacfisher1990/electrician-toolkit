import React from 'react';
import { Home, Calculator } from 'lucide-react';

function BottomNavigation({ onNavigate, currentView }) {
  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      background: '#1e293b',
      borderTop: '2px solid #475569',
      display: 'flex',
      justifyContent: 'space-around',
      padding: '0.75rem 0',
      zIndex: 1000,
      boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.3)'
    }}>
      <button
        onClick={() => onNavigate('home')}
        style={{
          background: 'none',
          border: 'none',
          color: currentView === 'home' ? '#fbbf24' : '#94a3b8',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.75rem',
          fontWeight: '600',
          flex: 1,
          transition: 'color 0.2s'
        }}
      >
        <Home size={24} />
        <span>Home</span>
      </button>
      
      <button
        onClick={() => onNavigate('calculators')}
        style={{
          background: 'none',
          border: 'none',
          color: currentView === 'calculators' ? '#fbbf24' : '#94a3b8',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.25rem',
          fontSize: '0.75rem',
          fontWeight: '600',
          flex: 1,
          transition: 'color 0.2s'
        }}
      >
        <Calculator size={24} />
        <span>Calculators</span>
      </button>
    </div>
  );
}

export default BottomNavigation;