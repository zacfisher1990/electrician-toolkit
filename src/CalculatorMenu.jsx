import React, { useState } from 'react';
import { Search, Zap, Plug, Package, Wrench, AlertTriangle, Settings, BarChart3, Cpu, Building, Shield, Maximize2, Lightbulb } from 'lucide-react';

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
    { id: 'conduit-bending', name: 'Bending', icon: Maximize2, keywords: 'conduit bending offset saddle stub bend emt' },
    { id: 'lighting', name: 'Lighting', icon: Lightbulb, keywords: 'lighting lumens foot candles fixtures spacing watts illumination' } 
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
      padding: '0'
    }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        {/* Modern Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)',
          padding: '1.5rem 1.5rem 2rem 1.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Subtle background pattern */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.05) 0%, transparent 50%)',
            pointerEvents: 'none'
          }}></div>
          
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h1 style={{ 
              fontSize: '1.75rem', 
              fontWeight: '700',
              color: '#fbbf24',
              margin: '0 0 0.5rem 0',
              letterSpacing: '-0.02em'
            }}>
              Electrician's Toolkit
            </h1>
            <p style={{ 
              fontSize: '0.875rem', 
              color: 'rgba(255,255,255,0.8)',
              margin: 0,
              fontWeight: '400'
            }}>
              NEC-compliant calculations & tools
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ padding: '1.5rem 1rem' }}>
          {/* Search Bar */}
          <div style={{ 
            marginBottom: '1.5rem',
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
                padding: '1rem 1rem 1rem 3rem',
                fontSize: '1rem',
                border: 'none',
                borderRadius: '12px',
                backgroundColor: 'white',
                boxSizing: 'border-box',
                outline: 'none',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
          </div>
          
          {/* Calculator Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '0.75rem',
            marginBottom: '1.5rem'
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
                      padding: '1rem 0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      minHeight: '100px',
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
                    <IconComponent size={32} strokeWidth={2} />
                    <div style={{ 
                      fontSize: '0.875rem',
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

          {/* Simplified Footer */}
          <div style={{ 
            padding: '0.75rem', 
            backgroundColor: 'rgba(30, 41, 59, 0.5)',
            borderRadius: '0.5rem',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <p style={{ 
              fontSize: '0.75rem', 
              color: '#94a3b8',
              margin: 0,
              fontWeight: '400'
            }}>
              All calculations based on current NEC standards
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalculatorMenu;
