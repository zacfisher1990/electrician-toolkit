import React, { useState } from 'react';
import { Search, Zap, Plug, Package, Wrench, AlertTriangle, Settings, BarChart3, Cpu, Building, Shield, Maximize2 } from 'lucide-react';

function CalculatorMenu({ onSelectCalculator }) {
  const [searchTerm, setSearchTerm] = useState('');

  const calculators = [
    { id: 'voltage-drop', name: 'Voltage Drop', icon: Zap, keywords: 'voltage drop vd wire circuit' },
    { id: 'ohms-law', name: "Ohm's Law", icon: Plug, keywords: 'ohms law voltage current resistance power series parallel circuit' },
    { id: 'box-fill', name: 'Box Fill', icon: Package, keywords: 'box fill junction cubic inch volume 314' },
    { id: 'conduit-fill', name: 'Conduit Fill', icon: Wrench, keywords: 'conduit fill emt pvc rigid raceway chapter 9' },
    { id: 'ampacity', name: 'Ampacity', icon: AlertTriangle, keywords: 'ampacity current rating 310 temperature' },
    { id: 'motor-calculations', name: 'Motors', icon: Settings, keywords: 'motor flc protection starter 430' },
    { id: 'load-calculations', name: 'Load', icon: BarChart3, keywords: 'load calculation service size residential commercial demand' },
    { id: 'transformer-sizing', name: 'Transformers', icon: Cpu, keywords: 'transformer kva sizing current primary secondary 450' },
    { id: 'service-entrance', name: 'Service', icon: Building, keywords: 'service entrance sizing panel main 230' },
    { id: 'grounding-bonding', name: 'Grounding', icon: Shield, keywords: 'grounding bonding ground electrode equipment gec egc jumper 250' },
    { id: 'conduit-bending', name: 'Bending', icon: Maximize2, keywords: 'conduit bending offset saddle stub bend emt' } 
    
  ];

  const filteredCalculators = calculators.filter(calc => {
    const searchLower = searchTerm.toLowerCase();
    return (
      calc.name.toLowerCase().includes(searchLower) ||
      calc.keywords.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(to bottom right, #0f172a, #1e293b)', 
      padding: '2rem 1rem' 
    }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            color: '#fbbf24', 
            marginBottom: '0.5rem',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Electrician's Toolkit
          </h1>
          <p style={{ 
            fontSize: '1rem', 
            color: '#cbd5e1' 
          }}>
            Professional NEC Calculation Tools
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ 
          marginBottom: '2rem',
          position: 'relative'
        }}>
          <Search 
            size={20} 
            style={{ 
              position: 'absolute', 
              left: '1rem', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#6b7280'
            }} 
          />
          <input
            type="text"
            placeholder="Search calculators..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.875rem 1rem 0.875rem 3rem',
              fontSize: '1rem',
              border: '2px solid #374151',
              borderRadius: '0.5rem',
              backgroundColor: 'white',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />
        </div>
        
        {/* Calculator Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)',  // 3 columns instead of auto-fill
          gap: '0.75rem',  // Tighter gap
          marginBottom: '2rem',
          padding: '0 0.5rem'
        }}>
          {filteredCalculators.length > 0 ? (
            filteredCalculators.map(calc => {
              const IconComponent = calc.icon;
              return (
                <button
                  key={calc.id}
                  onClick={() => onSelectCalculator(calc.id)}
                  style={{
                    backgroundColor: '#fbbf24',
                    border: 'none',
                    borderRadius: '0.75rem',
                    padding: '1rem 0.5rem',  // Reduced horizontal padding
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',  // Reduced gap
                    minHeight: '100px',  // Reduced from 140px
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    transition: 'all 0.2s',
                    color: 'black'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
                  }}
                >
                  <IconComponent size={32} strokeWidth={2} />  {/* Reduced from 40 */}
                  <div style={{ 
                    fontSize: '0.875rem',  // Reduced from 1rem
                    fontWeight: '700',
                    textAlign: 'center',
                    lineHeight: '1.2'
                  }}>
                    {calc.name}
                  </div>
                </button>
              );
            })
          ) : (
            <div style={{ 
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '3rem 1rem',
              color: '#cbd5e1',
              fontSize: '1.125rem'
            }}>
              No calculators found
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ 
          padding: '1.25rem', 
          backgroundColor: '#1e293b',
          borderRadius: '0.75rem',
          textAlign: 'center',
          border: '2px solid #374151'
        }}>
          <p style={{ 
            fontSize: '0.875rem', 
            color: '#cbd5e1',
            margin: 0,
            fontWeight: '500'
          }}>
            All calculations based on current NEC standards
          </p>
        </div>
      </div>
    </div>
  );
}

export default CalculatorMenu;
