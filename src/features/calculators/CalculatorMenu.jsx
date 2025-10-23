import React, { useState } from 'react';
import { Search, Tally3, Target, Cable, SquareDivide, Omega, Plug, Package, Circle, AlertTriangle, Settings, BarChart3, Radio, Building, Globe, CornerDownRight, Lightbulb, Gauge, Waves, Activity, Calculator, User, Briefcase, Triangle, Home as HomeIcon, FileText, TrendingDown, Box, ArrowDown, ArrowUp, Ruler, Minus, Sun } from 'lucide-react';
import styles from './Calculator.module.css';

function CalculatorMenu({ onSelectCalculator, isDarkMode }) {
  const [searchTerm, setSearchTerm] = useState('');

  const calculatorCategories = [
  {
    name: 'Installation',
    calculators: [
      { id: 'box-fill', name: 'Box Fill', icon: Package, keywords: 'box fill junction cubic inch volume 314' },
      { id: 'pull-box', name: 'Pull Box', icon: Box, keywords: 'pull box junction sizing straight angle u-pull 314.28 raceway conduit' },
      { id: 'conduit-fill', name: 'Conduit Fill', icon: Circle, keywords: 'conduit fill emt pvc rigid raceway chapter 9' },
      { id: 'conduit-bending', name: 'Conduit Bending', icon: CornerDownRight, keywords: 'conduit bending offset saddle stub bend emt' },
      { id: 'underground-depth', name: 'Underground Depth', icon: ArrowDown, keywords: 'underground depth burial trench cable direct bury 300.5 nec pvc rmc duct install' },
      { id: 'overhead-clearance', name: 'Overhead Clearance', icon: ArrowUp, keywords: 'overhead clearance aerial height span service drop mast 225 attachment point roof' },
      { id: 'working-space', name: 'Working Space', icon: Ruler, keywords: 'working space clearance 110.26 condition panel switchboard equipment depth width height electrical room' },
      { id: 'receptacles', name: 'Receptacles', icon: Plug, keywords: 'receptacle outlet gfci plug socket 210.52 counter kitchen bathroom wall spacing' },
      { id: 'lighting', name: 'Lighting', icon: Lightbulb, keywords: 'lighting lumens foot candles fixtures spacing watts illumination' }
    ]
  },
  {
    name: 'Power Calculations',
    calculators: [
      { id: 'voltage-drop', name: 'Voltage Drop', icon: TrendingDown, keywords: 'voltage drop vd wire circuit' },
      { id: 'ohms-law', name: "Ohm's Law", icon: SquareDivide, keywords: 'ohms law voltage current resistance power series parallel circuit' },
      { id: 'reactance-impedance', name: 'Reactance', icon: Omega, keywords: 'reactance impedance xl xc capacitive inductive resonance frequency ac circuit' },
      { id: 'power-factor', name: 'Power Factor', icon: Target, keywords: 'power factor correction pf capacitor kvar cos phi efficiency demand charge penalty savings' },
      { id: 'power-triangle', name: 'Power Triangle', icon: Triangle, keywords: 'power triangle kva kw kvar apparent real reactive power factor angle phase' },
      { id: 'three-phase-power', name: 'Three-Phase', icon: Tally3, keywords: 'three phase power 3 phase current voltage kw kva motor industrial commercial wye delta line' }
    ]
  },
  {
    name: 'Sizing & Rating',
    calculators: [
      { id: 'ampacity', name: 'Ampacity', icon: Cable, keywords: 'ampacity current rating 310 temperature' },
      { id: 'load-calculations', name: 'Load Calculations', icon: BarChart3, keywords: 'load calculation service size residential commercial demand' },
      { id: 'service-entrance', name: 'Service Entrance', icon: Building, keywords: 'service entrance sizing panel main 230' },
      { id: 'grounding-bonding', name: 'Grounding & Bonding', icon: Globe, keywords: 'grounding bonding ground electrode equipment gec egc jumper 250' },
      { id: 'neutral-sizing', name: 'Neutral Sizing', icon: Minus, keywords: 'neutral sizing conductor 220.61 feeder service range dryer balanced load line to neutral' }
    ]
  },
  {
    name: 'Equipment',
    calculators: [
      { id: 'motor-calculations', name: 'Motors', icon: Settings, keywords: 'motor flc protection starter 430' },
      { id: 'transformer-sizing', name: 'Transformers', icon: Radio, keywords: 'transformer kva sizing current primary secondary 450' },
      { id: 'vfd-sizing', name: 'VFD Sizing', icon: Gauge, keywords: 'vfd variable frequency drive motor speed control inverter ac drive' },
      { id: 'solar-pv', name: 'Solar PV', icon: Sun, keywords: 'solar pv photovoltaic 690 panel array inverter string conductor ocpd renewable' }
    ]
  }
];

  // Category colors for icon accents
  const categoryColors = {
    'Power Calculations': '#3b82f6',    // Blue
    'Sizing & Rating': '#10b981',       // Green
    'Equipment': '#f59e0b',             // Amber
    'Installation': '#8b5cf6',          // Purple
    'Safety': '#ef4444'                 // Red
  };

  // Dark mode colors - PURE BLACK
  const colors = {
    mainBg: isDarkMode ? '#000000' : '#f3f4f6',
    cardBg: isDarkMode ? '#0a0a0a' : '#ffffff',
    cardBorder: isDarkMode ? '#1a1a1a' : '#d1d5db',
    cardText: isDarkMode ? '#ffffff' : '#111827',
    inputBg: isDarkMode ? '#0a0a0a' : '#ffffff',
    inputBorder: isDarkMode ? '#1a1a1a' : '#d1d5db',
    inputText: isDarkMode ? '#ffffff' : '#111827',
    placeholderText: isDarkMode ? '#666666' : '#6b7280',
    headerGradient: isDarkMode 
      ? 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)'
      : 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)',
    categoryHeaderText: isDarkMode ? '#cccccc' : '#4b5563'
  };

  // Flatten all calculators for searching
  const allCalculators = calculatorCategories.flatMap(category => 
    category.calculators.map(calc => ({ ...calc, category: category.name }))
  );

  const filteredResults = searchTerm 
    ? allCalculators.filter(calc => {
        const searchLower = searchTerm.toLowerCase();
        return (
          calc.name.toLowerCase().includes(searchLower) ||
          calc.keywords.toLowerCase().includes(searchLower)
        );
      })
    : null;

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: colors.mainBg,
      padding: '0'
    }}>
      <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
        {/* Content Area */}
        <div style={{ 
          padding: '1.25rem',
          boxSizing: 'border-box'
        }}>
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
                e.target.style.backgroundColor = isDarkMode ? '#000000' : '#ffffff';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = colors.inputBorder;
                e.target.style.backgroundColor = colors.inputBg;
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          
          {/* Search Results or Categorized Grid */}
          {filteredResults ? (
            // Search Results
            <div>
              <div style={{
                fontSize: '0.875rem',
                color: colors.placeholderText,
                marginBottom: '1rem',
                paddingLeft: '0'
              }}>
                {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found
              </div>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '1.25rem',
                marginBottom: '1rem',
                boxSizing: 'border-box',
                width: '100%'
              }}>
                {filteredResults.length > 0 ? (
                  filteredResults.map(calc => {
                    const IconComponent = calc.icon;
                    const iconColor = categoryColors[calc.category];
                    
                    return (
                      <div
                        key={calc.id}
                        onClick={() => {
                          console.log('Clicked calculator:', calc.id);
                          onSelectCalculator(calc.id);
                        }}
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        {/* Square Button with Icon Only */}
                        <button
                          style={{
                            backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                            border: `2px solid ${isDarkMode ? '#2a2a2a' : '#d1d5db'}`,
                            borderRadius: '12px',
                            padding: '0',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '70px',
                            height: '70px',
                            minWidth: '70px',      
                            minHeight: '70px',     
                            maxWidth: '70px',      
                            maxHeight: '70px',     
                            flexShrink: 0,         
                            boxShadow: isDarkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#252525' : '#ffffff';
                            e.currentTarget.style.borderColor = iconColor;
                            e.currentTarget.style.boxShadow = `0 8px 16px ${iconColor}30, 0 4px 6px ${iconColor}20`;
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#1a1a1a' : '#ffffff';
                            e.currentTarget.style.borderColor = isDarkMode ? '#2a2a2a' : '#d1d5db';
                            e.currentTarget.style.boxShadow = isDarkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)';
                          }}
                          onMouseDown={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px) scale(0.95)';
                          }}
                          onMouseUp={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                          }}
                        >
                          <IconComponent size={28} strokeWidth={2} color={iconColor} />
                        </button>
                        
                        {/* Title Below Button */}
                        <div style={{ 
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textAlign: 'center',
                          lineHeight: '1.2',
                          color: colors.cardText,
                          maxWidth: '90px'
                        }}>
                          {calc.name}
                        </div>
                      </div>
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
          ) : (
            // Categorized View
            calculatorCategories.map((category, categoryIndex) => (
              <div key={category.name} style={{ marginBottom: '2rem' }}>
                {/* Category Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '1rem',
                  paddingLeft: '0'
                }}>
                  <div style={{
                    width: '4px',
                    height: '20px',
                    backgroundColor: categoryColors[category.name],
                    borderRadius: '2px'
                  }} />
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: colors.categoryHeaderText,
                    margin: 0,
                    letterSpacing: '-0.01em'
                  }}>
                    {category.name}
                  </h3>
                </div>

                {/* Calculator Grid */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: '1.25rem',
                  marginBottom: categoryIndex < calculatorCategories.length - 1 ? '1.5rem' : '1rem',
                  boxSizing: 'border-box',
                  width: '100%'
                }}>
                  {category.calculators.map(calc => {
                    const IconComponent = calc.icon;
                    const iconColor = categoryColors[category.name];
                    
                    return (
                      <div
                        key={calc.id}
                        onClick={() => {
                          console.log('Clicked calculator:', calc.id);
                          onSelectCalculator(calc.id);
                        }}
                        style={{
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        {/* Square Button with Icon Only */}
                        <button
                          style={{
                            backgroundColor: isDarkMode ? '#1a1a1a' : '#ffffff',
                            border: `2px solid ${isDarkMode ? '#2a2a2a' : '#d1d5db'}`,
                            borderRadius: '12px',
                            padding: '0',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '70px',
                            height: '70px',
                            minWidth: '70px',      
                            minHeight: '70px',     
                            maxWidth: '70px',      
                            maxHeight: '70px',     
                            flexShrink: 0,         
                            boxShadow: isDarkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
                            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                            position: 'relative',
                            overflow: 'hidden'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#252525' : '#ffffff';
                            e.currentTarget.style.borderColor = iconColor;
                            e.currentTarget.style.boxShadow = `0 8px 16px ${iconColor}30, 0 4px 6px ${iconColor}20`;
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.backgroundColor = isDarkMode ? '#1a1a1a' : '#ffffff';
                            e.currentTarget.style.borderColor = isDarkMode ? '#2a2a2a' : '#d1d5db';
                            e.currentTarget.style.boxShadow = isDarkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)';
                          }}
                          onMouseDown={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px) scale(0.95)';
                          }}
                          onMouseUp={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px) scale(1.05)';
                          }}
                        >
                          <IconComponent size={28} strokeWidth={2} color={iconColor} />
                        </button>
                        
                        {/* Title Below Button */}
                        <div style={{ 
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          textAlign: 'center',
                          lineHeight: '1.2',
                          color: colors.cardText,
                          maxWidth: '90px'
                        }}>
                          {calc.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default CalculatorMenu;
