import React, { useState } from 'react';
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
import './App.css';

function App() {
  const [activeCalculator, setActiveCalculator] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleNavigate = (view) => {
    if (view === 'home' || view === 'calculators') {
      setActiveCalculator(null);
    }
  };

  const renderCalculator = () => {
    switch(activeCalculator) {
      case 'voltage-drop':
        return <VoltageDropCalculator isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'ohms-law':
        return <OhmsLawCalculator isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'box-fill':
        return <BoxFillCalculator isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'conduit-fill':
        return <ConduitFillCalculator isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'ampacity':
        return <AmpacityLookupCalculator isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'motor-calculations':
        return <MotorCalculations isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'load-calculations':
        return <LoadCalculations isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'transformer-sizing':
        return <TransformerSizingCalculator isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'service-entrance':
        return <ServiceEntranceSizing isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'grounding-bonding':
        return <GroundingBondingCalculator isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'conduit-bending':
        return <ConduitBendingCalculator isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      case 'lighting':
        return <LightingCalculator isDarkMode={isDarkMode} onBack={() => setActiveCalculator(null)} />;
      default:
        return <CalculatorMenu 
          isDarkMode={isDarkMode} 
          onSelectCalculator={setActiveCalculator}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        />;
    }
  };

  return (
    <div className="App" style={{ paddingBottom: '5rem' }}>
      {!activeCalculator ? (
        <div style={{ background: isDarkMode ? '#1f2937' : '#ffffff' }}>
          {renderCalculator()}
        </div>
      ) : (
        <div style={{ 
          minHeight: '100vh', 
          background: isDarkMode ? '#1f2937' : '#ffffff', 
          padding: '1rem',
          paddingBottom: '6rem'
        }}>
          {renderCalculator()}
        </div>
      )}
      
      <BottomNavigation 
  onNavigate={handleNavigate}
  currentView={activeCalculator ? 'calculators' : 'home'}
  isDarkMode={isDarkMode}
/>
    </div>
  );
}

export default App;