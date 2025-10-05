import React, { useState } from 'react';
import { Search, Zap, Plug, Package, Wrench, AlertTriangle, Settings, BarChart3, Cpu, Building, Shield, Maximize2, Lightbulb, Menu } from 'lucide-react';

function CalculatorMenu({ onSelectCalculator, isDarkMode, onToggleDarkMode }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenu, setShowMenu] = useState(false);

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

  // Dark mode colors
  const colors = {
    mainBg: isDarkMode ? '#1f2937' : '#f9fafb',
    headerBg: isDarkMode ? '#111827' : '#ffffff',
    headerText: isDarkMode ? '#f9fafb' : '#111827',
    headerBorder: isDarkMode ? '#374151' : '#e5e7eb',
    cardBg: isDarkMode ? '#374151' : '#ffffff',
    cardBorder: isDarkMode ? '#4b5563' : '#e5e7eb',
    cardText: isDarkMode ? '#f9fafb' : '#111827',
    inputBg: isDarkMode ? '#374151' : '#f9fafb',
    inputBorder: isDarkMode ? '#4b5563' : '#e5e7eb',
    inputText: isDarkMode ? '#f9fafb' : '#111827',
    placeholderText: isDarkMode ? '#9ca3af' : '#6b7280',
    menuBg: isDarkMode ? '#1f2937' : 'white'
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
        {/* Compact Professional Header */}
        <div style={{ 
          background: colors.headerBg,
          padding: '0.5rem 1.5rem',
          borderBottom: `1px solid ${colors.headerBorder}`,
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600',
            color: colors.headerText,
            margin: 0,
            letterSpacing: '-0.01em'
          }}>
            Electrician's Toolkit
          </h1>
          
          {/* Menu Button */}
          <div style={{ position: 'relative' }}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Menu size={24} color={isDarkMode ? '#9ca3af' : '#6b7280'} />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <>
                {/* Backdrop */}
                <div 
                  onClick={() => setShowMenu(false)}
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 998
                  }}
                />
                
                {/* Menu */}
                <div style={{
                  position: 'absolute',
                  top: '2.5rem',
                  right: 0,
                  zIndex: 999,
                  background: colors.menuBg,
                  border: `1px solid ${colors.cardBorder}`,
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                  minWidth: '200px',
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '0.5rem 0' }}>
                    <button
                      onClick={() => {
                        onToggleDarkMode();
                        setShowMenu(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        color: colors.cardText,
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                      onMouseEnter={(e) => e.target.style.background = isDarkMode ? '#374151' : '#f3f4f6'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      
                      <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                      <span>{isDarkMode ? '☀️' : '🌙'}</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div style={{ padding: '1rem' }}>
          {/* Search Bar */}
          <div style={{ 
            marginBottom: '1rem',
            position: 'relative'
          }}>
            <Search 
              size={18} 
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
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                fontSize: '0.9375rem',
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: '10px',
                backgroundColor: colors.inputBg,
                color: colors.inputText,
                boxSizing: 'border-box',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.backgroundColor = isDarkMode ? '#1f2937' : '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.inputBorder;
                e.target.style.backgroundColor = colors.inputBg;
              }}
            />
          </div>
          
          {/* Calculator Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            {filteredCalculators.length > 0 ? (
              filteredCalculators.map(calc => {
                const IconComponent = calc.icon;
                return (
                  <button
                    key={calc.id}
                    onClick={() => onSelectCalculator(calc.id)}
                    style={{
                      backgroundColor: colors.cardBg,
                      border: `1px solid ${colors.cardBorder}`,
                      borderRadius: '12px',
                      padding: '1rem 0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      minHeight: '100px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                      transition: 'all 0.2s',
                      color: colors.cardText
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
                      e.currentTarget.style.borderColor = '#3b82f6';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                      e.currentTarget.style.borderColor = colors.cardBorder;
                    }}
                  >
                    <IconComponent size={28} strokeWidth={1.5} color="#3b82f6" />
                    <div style={{ 
                      fontSize: '0.8125rem',
                      fontWeight: '600',
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
