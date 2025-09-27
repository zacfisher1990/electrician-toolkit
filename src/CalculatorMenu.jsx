import React from 'react';

function CalculatorMenu({ onSelectCalculator }) {
  const calculators = [
    { id: 'voltage-drop', name: 'Voltage Drop', icon: '⚡' },
    { id: 'ohms-law', name: "Ohm's Law", icon: '🔌' },
    { id: 'box-fill', name: 'Box Fill', icon: '📦' },
    { id: 'conduit-fill', name: 'Conduit Fill', icon: '🔧' },
    { id: 'wire-size', name: 'Wire Size', icon: '🔗' },
    { id: 'ampacity', name: 'Ampacity Lookup', icon: '⚠️' },
    { id: 'motor-calculations', name: 'Motor Calculations', icon: '⚙️' }
  ];

  return (
    <div className="calculator-menu">
      <h2>Electrician Toolkit</h2>
      <p style={{ color: '#6b7280', marginBottom: '25px' }}>
        Professional electrical calculations for the field
      </p>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '15px',
        marginTop: '20px'
      }}>
        {calculators.map(calc => (
          <div
            key={calc.id}
            className="menu-item"
            onClick={() => onSelectCalculator(calc.id)}
          >
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>
              {calc.icon}
            </div>
            <h3>{calc.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CalculatorMenu;
