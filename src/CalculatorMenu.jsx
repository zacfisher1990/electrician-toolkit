import React from 'react';

function CalculatorMenu({ onSelectCalculator }) {
  const calculators = [
    { id: 'voltage-drop', name: 'Voltage Drop', icon: '⚡' },
    { id: 'ohms-law', name: "Ohm's Law", icon: '🔌' },
    { id: 'box-fill', name: 'Box Fill', icon: '📦' },
    { id: 'conduit-fill', name: 'Conduit Fill', icon: '🔧' },
    { id: 'wire-size', name: 'Wire Size', icon: '🔗' },
    { id: 'ampacity', name: 'Ampacity Lookup', icon: '⚠️' }
  ];

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Select a Calculator</h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '15px',
        marginTop: '20px'
      }}>
        {calculators.map(calc => (
          <button
            key={calc.id}
            onClick={() => onSelectCalculator(calc.id)}
            style={{
              padding: '20px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <span style={{ fontSize: '24px' }}>{calc.icon}</span>
            {calc.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CalculatorMenu;
