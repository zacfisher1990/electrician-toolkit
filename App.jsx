import React, { useState } from 'react';
import CalculatorMenu from './CalculatorMenu.jsx';
import VoltageDropCalculator from './VoltageDropCalculator.jsx';
import OhmsLawCalculator from './OhmsLawCalculator.jsx';
import BoxFillCalculator from './BoxFillCalculator.jsx';
import ConduitFillCalculator from './ConduitFillCalculator.jsx';
import WireSizeCalculator from './WireSizeCalculator.jsx';
import AmpacityLookupCalculator from './AmpacityLookupCalculator.jsx';
import './App.css';

function App() {
  const [activeCalculator, setActiveCalculator] = useState(null);

  const BackToMenu = () => {
    return (
      <button 
        onClick={() => setActiveCalculator(null)}
        style={{ padding: '10px 20px', marginBottom: '20px' }}
      >
        ← Back to Menu
      </button>
    );
  };

  const renderCalculator = () => {
    switch(activeCalculator) {
      case 'voltage-drop':
        return (
          <div>
            <BackToMenu />
            <VoltageDropCalculator />
          </div>
        );
      case 'ohms-law':
        return <OhmsLawCalculator onBack={() => setActiveCalculator(null)} />;
      default:
        return <CalculatorMenu onSelectCalculator={setActiveCalculator} />;
      case 'box-fill':
        return <BoxFillCalculator onBack={() => setActiveCalculator(null)} />;
      case 'conduit-fill':
        return <ConduitFillCalculator onBack={() => setActiveCalculator(null)} />;
      case 'wire-size':
        return <WireSizeCalculator onBack={() => setActiveCalculator(null)} />;
      case 'ampacity':
        return <AmpacityLookupCalculator onBack={() => setActiveCalculator(null)} />;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Electrician's Toolkit</h1>
        {renderCalculator()}
      </header>
    </div>
  );
}

export default App;
