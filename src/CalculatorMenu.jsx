import React, { useState } from 'react';

function CalculatorMenu({ onSelectCalculator }) {
  const [searchTerm, setSearchTerm] = useState('');

  const calculators = [
    { id: 'voltage-drop', name: 'Voltage Drop', icon: '⚡', keywords: 'voltage drop vd wire circuit' },
    { id: 'ohms-law', name: "Ohm's Law", icon: '🔌', keywords: 'ohms law voltage current resistance power series parallel circuit' },
    { id: 'box-fill', name: 'Box Fill', icon: '📦', keywords: 'box fill junction cubic inch volume 314' },
    { id: 'conduit-fill', name: 'Conduit Fill', icon: '🔧', keywords: 'conduit fill emt pvc rigid raceway chapter 9' },
    { id: 'ampacity', name: 'Ampacity Lookup', icon: '⚠️', keywords: 'ampacity current rating 310 temperature' },
    { id: 'motor-calculations', name: 'Motor Calculations', icon: '⚙️', keywords: 'motor flc protection starter 430' },
    { id: 'load-calculations', name: 'Load Calculations', icon: '📊', keywords: 'load calculation service size residential commercial demand' },
    { id: 'transformer-sizing', name: 'Transformer Sizing', icon: '🔌', keywords: 'transformer kva sizing current primary secondary 450' },
    { id: 'service-entrance', name: 'Service Entrance Sizing', icon: '🏢', keywords: 'service entrance sizing panel main 230' }
  ];

  // Filter calculators based on search term
  const filteredCalculators = calculators.filter(calc => {
    const searchLower = searchTerm.toLowerCase();
    return (
      calc.name.toLowerCase().includes(searchLower) ||
      calc.keywords.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="calculator-menu">
      {/* Search Bar */}
      <div style={{ marginBottom: '25px' }}>
        <input
          type="text"
          placeholder="Search calculators..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: '16px',
            border: '2px solid #d1d5db',
            borderRadius: '8px',
            backgroundColor: 'white',
            boxSizing: 'border-box'
          }}
        />
        {searchTerm && (
          <div style={{ 
            marginTop: '8px', 
            fontSize: '14px', 
            color: '#6b7280' 
          }}>
            {filteredCalculators.length} calculator{filteredCalculators.length !== 1 ? 's' : ''} found
          </div>
        )}
      </div>
      
      {/* Calculator Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '15px',
        marginTop: '20px'
      }}>
        {filteredCalculators.length > 0 ? (
          filteredCalculators.map(calc => (
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
          ))
        ) : (
          <div style={{ 
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: '40px 20px',
            color: '#6b7280'
          }}>
            No calculators found matching "{searchTerm}"
          </div>
        )}
      </div>

      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#f8fafc',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <p style={{ 
          fontSize: '14px', 
          color: '#374151',
          margin: 0
        }}>
          All calculations based on current NEC standards. 
          Always verify with local codes and current NEC edition.
        </p>
      </div>
    </div>
  );
}

export default CalculatorMenu;
