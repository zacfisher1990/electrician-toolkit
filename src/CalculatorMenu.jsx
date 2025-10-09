import React, { useState } from 'react';
import { Search, Zap, Plug, Package, Wrench, AlertTriangle, Settings, BarChart3, Cpu, Building, Shield, Maximize2, Lightbulb, Gauge, Waves, Activity } from 'lucide-react';

function CalculatorMenu({ onSelectCalculator, isDarkMode }) {
  const [searchTerm, setSearchTerm] = useState('');

  const calculators = [
    { id: 'voltage-drop', name: 'Voltage Drop', icon: Zap, keywords: 'voltage drop vd wire circuit', category: 'power' },
    { id: 'ohms-law', name: "Ohm's Law", icon: Plug, keywords: 'ohms law voltage current resistance power series parallel circuit', category: 'power' },
    { id: 'reactance-impedance', name: 'Reactance', icon: Waves, keywords: 'reactance impedance xl xc capacitive inductive resonance frequency ac circuit', category: 'power' },
    { id: 'power-factor', name: 'Power Factor', icon: Activity, keywords: 'power factor correction pf capacitor kvar cos phi efficiency demand charge penalty savings', category: 'power' },
    { id: 'box-fill', name: 'Box Fill', icon: Package, keywords: 'box fill junction cubic inch volume 314', category: 'physical' },
    { id: 'conduit-fill', name: 'Conduit Fill', icon: Wrench, keywords: 'conduit fill emt pvc rigid raceway chapter 9', category: 'physical' },
    { id: 'ampacity', name: 'Ampacity', icon: AlertTriangle, keywords: 'ampacity current rating 310 temperature', category: 'sizing' },
    { id: 'motor-calculations', name: 'Motors', icon: Settings, keywords: 'motor flc protection starter 430', category: 'equipment' },
    { id: 'load-calculations', name: 'Load', icon: BarChart3, keywords: 'load calculation service size residential commercial demand', category: 'sizing' },
    { id: 'transformer-sizing', name: 'Transformers', icon: Cpu, keywords: 'transformer kva sizing current primary secondary 450', category: 'equipment' },
    { id: 'service-entrance', name: 'Service', icon: Building, keywords: 'service entrance sizing panel main 230', category: 'sizing' },
    { id: 'grounding-bonding', name: 'Grounding', icon: Shield, keywords: 'grounding bonding ground electrode equipment gec egc jumper 250', category: 'safety' },
    { id: 'conduit-bending', name: 'Bending', icon: Maximize2, keywords: 'conduit bending offset saddle stub bend emt', category: 'physical' },
    { id: 'lighting', name: 'Lighting', icon: Lightbulb, keywords: 'lighting lumens foot candles fixtures spacing watts illumination', category: 'equipment' },
    { id: 'vfd-sizing', name: 'VFD Sizing', icon: Gauge, keywords: 'vfd variable frequency drive motor speed control inverter ac drive', category: 'equipment' } 
  ];

  // Category colors for icon accents
  const categoryColors = {
    power: '#3b82f6',      // Blue
    physical: '#8b5cf6',   // Purple
    sizing: '#10b981',     // Green
    equipment: '#f59e0b',  // Amber
    safety: '#ef4444'      // Red
  };

  // Dark mode colors
  const colors = {
    mainBg: isDarkMode ? '#1f2937' : '#f9fafb',
    cardBg: isDarkMode ? '#374151' : '#ffffff',
    cardBorder: isDarkMode ? '#4b5563' : '#e5e7eb',
    cardText: isDarkMode ? '#f9fafb' : '#111827',
    inputBg: isDarkMode ? '#374151' : '#f9fafb',
    inputBorder: isDarkMode ? '#4b5563' : '#e5e7eb',
    inputText: isDarkMode ? '#f9fafb' : '#111827',
    placeholderText: isDarkMode ? '#9ca3af' : '#6b7280',
    headerGradient: isDarkMode 
      ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
      : 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)'
  };

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
      background: colors.mainBg,
      padding: '0'
    }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        {/* Content Area */}
        <div style={{ padding: '1.25rem' }}>
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
                color: colors.placeholderText
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
                fontSize: '0.9375rem',
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: '12px',
                backgroundColor: colors.inputBg,
                color: colors.inputText,
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.backgroundColor = isDarkMode ? '#1f2937' : '#ffffff';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.inputBorder;
                e.target.style.backgroundColor = colors.inputBg;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          {/* Calculator Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '1rem',
            marginBottom: '1rem'
          }}>
            {filteredCalculators.length > 0 ? (
              filteredCalculators.map(calc => {
                const IconComponent = calc.icon;
                const iconColor = categoryColors[calc.category] || '#3b82f6';
                
                return (
                  <button
                    key={calc.id}
                    onClick={() => onSelectCalculator(calc.id)}
                    style={{
                      backgroundColor: colors.cardBg,
                      border: `1px solid ${colors.cardBorder}`,
                      borderRadius: '14px',
                      padding: '1.25rem 0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.625rem',
                      minHeight: '110px',
                      boxShadow: isDarkMode 
                        ? '0 2px 4px rgba(0,0,0,0.2)' 
                        : '0 2px 4px rgba(0,0,0,0.06)',
                      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      color: colors.cardText,
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                      e.currentTarget.style.boxShadow = isDarkMode
                        ? '0 8px 16px rgba(0,0,0,0.3)'
                        : '0 8px 16px rgba(0,0,0,0.12)';
                      e.currentTarget.style.borderColor = iconColor;
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = isDarkMode 
                        ? '0 2px 4px rgba(0,0,0,0.2)' 
                        : '0 2px 4px rgba(0,0,0,0.06)';
                      e.currentTarget.style.borderColor = colors.cardBorder;
                    }}
                    onMouseDown={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px) scale(0.98)';
                    }}
                    onMouseUp={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px) scale(1.02)';
                    }}
                  >
                    {/* Icon with background circle */}
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: isDarkMode 
                        ? `${iconColor}20` 
                        : `${iconColor}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.25s ease'
                    }}>
                      <IconComponent size={26} strokeWidth={2} color={iconColor} />
                    </div>
                    
                    {/* Calculator name */}
                    <div style={{ 
                      fontSize: '0.875rem',
                      fontWeight: '700',
                      textAlign: 'center',
                      lineHeight: '1.3',
                      letterSpacing: '-0.01em'
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
                color: colors.placeholderText,
                fontSize: '0.9375rem'
              }}>
                No calculators found
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalculatorMenu;
