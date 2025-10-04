import React, { useState } from 'react';

function CalculatorMenu({ onSelectCalculator }) {
  const [searchTerm, setSearchTerm] = useState('');

  const calculators = [
  { id: 'voltage-drop', name: 'Voltage Drop', icon: '⚡', keywords: 'voltage drop vd wire circuit' },
  { id: 'ohms-law', name: "Ohm's Law", icon: '🔌', keywords: 'ohms law voltage current resistance power series parallel circuit' },
  { id: 'box-fill', name: 'Box Fill', icon: '📦', keywords: 'box fill junction cubic inch volume 314' },
  { id: 'conduit-fill', name: 'Conduit Fill', icon: '🔧', keywords: 'conduit fill emt pvc rigid raceway chapter 9' },
  { id: 'ampacity', name: 'Ampacity', icon: '⚠️', keywords: 'ampacity current rating 310 temperature' },
  { id: 'motor-calculations', name: 'Motors', icon: '⚙️', keywords: 'motor flc protection starter 430' },
  { id: 'load-calculations', name: 'Load', icon: '📊', keywords: 'load calculation service size residential commercial demand' },
  { id: 'transformer-sizing', name: 'Transformers', icon: '🔌', keywords: 'transformer kva sizing current primary secondary 450' },
  { id: 'service-entrance', name: 'Service', icon: '🏢', keywords: 'service entrance sizing panel main 230' }
];

  const filteredCalculators = calculators.filter(calc => {
    const searchLower = searchTerm.toLowerCase();
    return (
      calc.name.toLowerCase().includes(searchLower) ||
      calc.keywords.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="calculator-menu" style={{ padding: '15px' }}>
      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Search calculators..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '2px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: 'white',
            boxSizing: 'border-box'
          }}
        />
      </div>
      
      {/* Compact Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px'
      }}>
        {filteredCalculators.length > 0 ? (
          filteredCalculators.map(calc => (
            
  <div
  key={calc.id}
  onClick={() => onSelectCalculator(calc.id)}
  style={{
    backgroundColor: '#c9a227',
    borderRadius: '12px',
    padding: '12px 8px',
    textAlign: 'center',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minHeight: '110px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  }}
>
  <div style={{ fontSize: '32px', lineHeight: '1' }}>
    {calc.icon}
  </div>
  <div style={{ 
    fontSize: '13px', 
    fontWeight: '600',
    color: '#000',
    lineHeight: '1.2',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
    textAlign: 'center',
    width: '100%',
    padding: '0 4px'
  }}>
    {calc.name}
  </div>
</div>

          ))
        ) : (
          <div style={{ 
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '40px 20px',
            color: '#6b7280'
          }}>
            No calculators found
          </div>
        )}
      </div>

      <div style={{ 
        marginTop: '25px', 
        padding: '15px', 
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <p style={{ 
          fontSize: '13px', 
          color: '#374151',
          margin: 0
        }}>
          All calculations based on current NEC standards
        </p>
      </div>
    </div>
  );
}

export default CalculatorMenu;
