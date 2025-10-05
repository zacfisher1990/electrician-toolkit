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
import './App.css';

function App() {
  const [activeCalculator, setActiveCalculator] = useState(null);

  const renderCalculator = () => {
    switch(activeCalculator) {
      case 'voltage-drop':
        return <VoltageDropCalculator onBack={() => setActiveCalculator(null)} />;
      case 'ohms-law':
        return <OhmsLawCalculator onBack={() => setActiveCalculator(null)} />;
      case 'box-fill':
        return <BoxFillCalculator onBack={() => setActiveCalculator(null)} />;
      case 'conduit-fill':
        return <ConduitFillCalculator onBack={() => setActiveCalculator(null)} />;
      case 'ampacity':
        return <AmpacityLookupCalculator onBack={() => setActiveCalculator(null)} />;
      case 'motor-calculations':
        return <MotorCalculations onBack={() => setActiveCalculator(null)} />;
      case 'load-calculations':
        return <LoadCalculations onBack={() => setActiveCalculator(null)} />;
      case 'transformer-sizing':
        return <TransformerSizingCalculator onBack={() => setActiveCalculator(null)} />;
      case 'service-entrance':
        return <ServiceEntranceSizing onBack={() => setActiveCalculator(null)} />;
      case 'grounding-bonding':
        return <GroundingBondingCalculator onBack={() => setActiveCalculator(null)} />;
      case 'conduit-bending':
        return <ConduitBendingCalculator onBack={() => setActiveCalculator(null)} />;
        default:
        return <CalculatorMenu onSelectCalculator={setActiveCalculator} />;
    }
  };

  return (
    <div className="App">
      {!activeCalculator ? (
  <div>
    {renderCalculator()}
  </div>
      ) : (
        // Consistent dark gradient background wrapper for all calculators
        <div style={{ 
          minHeight: '100vh', 
          background: 'linear-gradient(to bottom right, #0f172a, #1e293b)', 
          padding: '1rem' 
        }}>
          {renderCalculator()}
        </div>
      )}
    </div>
  );
}

export default App;
