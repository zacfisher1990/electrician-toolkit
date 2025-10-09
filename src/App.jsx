import React, { useState, useRef } from 'react';
import { Menu, FileDown } from 'lucide-react';
import CalculatorMenu from './CalculatorMenu.jsx';
import VoltageDropCalculator from './VoltageDropCalculator.jsx';
import OhmsLawCalculator from './OhmsLawCalculator.jsx';
import BoxFillCalculator from './BoxFillCalculator.jsx';
import ConduitFillCalculator from './ConduitFillCalculator.jsx';
import AmpacityLookupCalculator from './AmpacityLookupCalculator.jsx';
import MotorCalculations from './MotorCalculations.jsx';
import LoadCalculations from './LoadCalculations.jsx';
import TransformerSizingCalculator from './TransformerSizingCalculator.jsx';
import ServiceEntranceSizing from './ServiceEntranceSizing.jsx';
import GroundingBondingCalculator from './GroundingBondingCalculator.jsx';
import ConduitBendingCalculator from './ConduitBendingCalculator.jsx';
import LightingCalculator from './LightingCalculator.jsx';
import BottomNavigation from './BottomNavigation.jsx';
import VFDSizingCalculator from './VFDSizingCalculator.jsx';
import ReactanceImpedanceCalculator from './ReactanceImpedanceCalculator.jsx';
import PowerFactorCorrection from './PowerFactorCorrection.jsx';
import Profile from './Profile.jsx';
import Jobs from './Jobs.jsx';
import './App.css';

function App() {
  const [activeCalculator, setActiveCalculator] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showExportToast, setShowExportToast] = useState(false);
  
  // Ref to access calculator's export function
  const calculatorRef = useRef(null);

  const handleNavigate = (view) => {
  if (view === 'home' || view === 'calculators') {
    setActiveCalculator(null);
  } else if (view === 'profile') {
    setActiveCalculator('profile');
  } else if (view === 'jobs') {
    setActiveCalculator('jobs');
  }
};

  // Handle PDF Export
  const handleExportPDF = () => {
    if (calculatorRef.current && calculatorRef.current.exportPDF) {
      try {
        calculatorRef.current.exportPDF();
        setShowMenu(false);
        
        // Show success toast
        setShowExportToast(true);
        setTimeout(() => setShowExportToast(false), 3000);
      } catch (error) {
        console.error('PDF export failed:', error);
        alert('Failed to export PDF. Please try again.');
      }
    }
  };

  // Dark mode colors
  const colors = {
    headerBg: isDarkMode ? '#111827' : '#ffffff',
    headerText: isDarkMode ? '#f9fafb' : '#111827',
    headerBorder: isDarkMode ? '#374151' : '#e5e7eb',
    menuBg: isDarkMode ? '#1f2937' : 'white',
    cardBorder: isDarkMode ? '#4b5563' : '#e5e7eb',
    cardText: isDarkMode ? '#f9fafb' : '#111827',
  };

  const renderCalculator = () => {
    switch(activeCalculator) {
      case 'voltage-drop':
        return <VoltageDropCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'ohms-law':
        return <OhmsLawCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'box-fill':
        return <BoxFillCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'conduit-fill':
        return <ConduitFillCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'ampacity':
        return <AmpacityLookupCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'motor-calculations':
        return <MotorCalculations ref={calculatorRef} isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'load-calculations':
        return <LoadCalculations ref={calculatorRef} isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'transformer-sizing':
        return <TransformerSizingCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'service-entrance':
        return <ServiceEntranceSizing ref={calculatorRef} isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'grounding-bonding':
        return <GroundingBondingCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'conduit-bending':
        return <ConduitBendingCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'lighting':
        return <LightingCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'vfd-sizing':
        return <VFDSizingCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'reactance-impedance':
        return <ReactanceImpedanceCalculator ref={calculatorRef} isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'power-factor':
        return <PowerFactorCorrection ref={calculatorRef} isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'profile':
        return <Profile isDarkMode={isDarkMode} />;
      case 'jobs':
        return <Jobs isDarkMode={isDarkMode} />;
      default:
        return <CalculatorMenu 
          isDarkMode={isDarkMode} 
          onSelectCalculator={setActiveCalculator}
        />;
    }
  };

  const getHeaderTitle = () => {
  if (!activeCalculator) return 'Calculator Menu';
  if (activeCalculator === 'profile') return 'Profile';
  if (activeCalculator === 'jobs') return 'Job Log';
    
    const titles = {
      'voltage-drop': 'Voltage Drop',
      'ohms-law': "Ohm's Law",
      'box-fill': 'Box Fill',
      'conduit-fill': 'Conduit Fill',
      'ampacity': 'Ampacity',
      'motor-calculations': 'Motors',
      'load-calculations': 'Load Calculations',
      'transformer-sizing': 'Transformers',
      'service-entrance': 'Service Entrance Sizing',
      'grounding-bonding': 'Grounding & Bonding',
      'conduit-bending': 'Conduit Bending',
      'lighting': 'Lighting',
      'vfd-sizing': 'VFD Sizing',
      'reactance-impedance': 'Reactance & Impedance',
      'power-factor': 'Power Factor Correction'
    };
    
    return titles[activeCalculator] || 'Electrician\'s Toolkit';
  };

  return (
    <div className="App" style={{ background: isDarkMode ? '#1f2937' : '#ffffff' }}>
      {/* Persistent Header - Always Visible */}
      <div style={{ 
        background: '#2563eb',
        padding: '0.5rem 1rem',
        borderBottom: `1px solid ${colors.headerBorder}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ 
          fontSize: '1.125rem', 
          fontWeight: '600',
          color: 'white',
          margin: 0,
          letterSpacing: '-0.01em'
        }}>
          {getHeaderTitle()}
        </h1>
        
        {/* Menu Button */}
        <div style={{ position: 'relative' }}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            style={{ 
              background: 'none', 
              border: 'none', 
              cursor: 'pointer',
              padding: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minWidth: '40px',
              minHeight: '40px',
              lineHeight: 1
            }}
          >
            <Menu size={24} color="white" style={{ display: 'block', flexShrink: 0 }} />
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
                  {/* Export PDF Button - Only show when calculator is active */}
                  {activeCalculator && (
                    <>
                      <button
                        onClick={handleExportPDF}
                        style={{
                          width: '100%',
                          padding: '0.75rem 1rem',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          color: colors.cardText,
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}
                        onMouseEnter={(e) => e.target.style.background = isDarkMode ? '#374151' : '#f3f4f6'}
                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                      >
                        <FileDown size={16} />
                        <span>Export to PDF</span>
                      </button>
                      <div style={{
                        height: '1px',
                        background: colors.cardBorder,
                        margin: '0.5rem 0'
                      }} />
                    </>
                  )}
                  
                  {/* Dark Mode Toggle */}
                  <button
                    onClick={() => {
                      setIsDarkMode(!isDarkMode);
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
      <div style={{ paddingBottom: '5rem' }}>
        {!activeCalculator ? (
          renderCalculator()
        ) : (
          <div style={{ 
            minHeight: 'calc(100vh - 3.5rem)', 
            padding: '1rem',
            paddingBottom: '5rem'
          }}>
            {renderCalculator()}
          </div>
        )}
      </div>

      {/* Export Success Toast */}
      {showExportToast && (
        <div style={{
          position: 'fixed',
          bottom: '6rem',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#10b981',
          color: 'white',
          padding: '0.75rem 1.5rem',
          borderRadius: '0.5rem',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          animation: 'slideUp 0.3s ease-out',
          maxWidth: '90%',
          textAlign: 'center'
        }}>
          <span style={{ fontSize: '1.25rem' }}>✓</span>
          <span>PDF saved to Downloads</span>
        </div>
      )}
      
      <BottomNavigation 
  onNavigate={handleNavigate}
  currentView={
    activeCalculator === 'profile' 
      ? 'profile'
      : activeCalculator === 'jobs'
      ? 'jobs'
      : activeCalculator 
      ? 'calculators' 
      : 'home'
  }
  isDarkMode={isDarkMode}
/>
    </div>
  );
}

export default App;