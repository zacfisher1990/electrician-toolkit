import React, { useState } from 'react';

function ConduitFillCalculator({ onBack }) {
  const [conduitType, setConduitType] = useState('emt-0.5');
  const [wireSize, setWireSize] = useState('12');
  const [wireType, setWireType] = useState('thwn');
  const [wireCount, setWireCount] = useState(1);

  const conduitData = {
    // EMT Conduit
    'emt-0.5': { name: '1/2" EMT', area: 0.304 },
    'emt-0.75': { name: '3/4" EMT', area: 0.533 },
    'emt-1': { name: '1" EMT', area: 0.864 },
    'emt-1.25': { name: '1-1/4" EMT', area: 1.496 },
    'emt-1.5': { name: '1-1/2" EMT', area: 2.036 },
    'emt-2': { name: '2" EMT', area: 3.356 },
    'emt-2.5': { name: '2-1/2" EMT', area: 5.858 },
    'emt-3': { name: '3" EMT', area: 8.846 },
    'emt-4': { name: '4" EMT', area: 14.753 },
    
    // PVC Schedule 40
    'pvc-0.5': { name: '1/2" PVC Sch 40', area: 0.285 },
    'pvc-0.75': { name: '3/4" PVC Sch 40', area: 0.508 },
    'pvc-1': { name: '1" PVC Sch 40', area: 0.832 },
    'pvc-1.25': { name: '1-1/4" PVC Sch 40', area: 1.429 },
    'pvc-1.5': { name: '1-1/2" PVC Sch 40', area: 1.986 },
    'pvc-2': { name: '2" PVC Sch 40', area: 3.291 },
    'pvc-2.5': { name: '2-1/2" PVC Sch 40', area: 5.793 },
    'pvc-3': { name: '3" PVC Sch 40', area: 8.688 },
    'pvc-4': { name: '4" PVC Sch 40', area: 14.314 },
    
    // Rigid Steel Conduit
    'rigid-0.5': { name: '1/2" Rigid Steel', area: 0.220 },
    'rigid-0.75': { name: '3/4" Rigid Steel', area: 0.409 },
    'rigid-1': { name: '1" Rigid Steel', area: 0.688 },
    'rigid-1.25': { name: '1-1/4" Rigid Steel', area: 1.175 },
    'rigid-1.5': { name: '1-1/2" Rigid Steel', area: 1.610 },
    'rigid-2': { name: '2" Rigid Steel', area: 2.647 },
    'rigid-2.5': { name: '2-1/2" Rigid Steel', area: 4.618 },
    'rigid-3': { name: '3" Rigid Steel', area: 6.922 },
    'rigid-4': { name: '4" Rigid Steel', area: 11.545 }
  };

  const wireData = {
    // THWN-2 Wire Areas (sq in)
    'thwn': {
      '14': 0.0097,
      '12': 0.0133,
      '10': 0.0211,
      '8': 0.0366,
      '6': 0.0507,
      '4': 0.0824,
      '3': 0.0973,
      '2': 0.1158,
      '1': 0.1562,
      '1/0': 0.1855,
      '2/0': 0.2223,
      '3/0': 0.2679,
      '4/0': 0.3237
    },
    // XHHW Wire Areas (sq in)
    'xhhw': {
      '14': 0.0097,
      '12': 0.0133,
      '10': 0.0211,
      '8': 0.0366,
      '6': 0.0590,
      '4': 0.0973,
      '3': 0.1134,
      '2': 0.1333,
      '1': 0.1901,
      '1/0': 0.2223,
      '2/0': 0.2624,
      '3/0': 0.3117,
      '4/0': 0.3718
    }
  };

  const calculateFill = () => {
    const conduitArea = conduitData[conduitType].area;
    const wireArea = wireData[wireType][wireSize] || 0;
    const totalWireArea = wireArea * wireCount;
    
    const fillPercentage = (totalWireArea / conduitArea * 100).toFixed(1);
    
    // NEC Table 1, Chapter 9 - Maximum fill percentages
    let maxFill = 40; // Default for 3+ wires
    if (wireCount === 1) maxFill = 53;
    else if (wireCount === 2) maxFill = 31;
    
    const maxWires = Math.floor((conduitArea * maxFill / 100) / wireArea);
    
    return {
      conduitArea: conduitArea.toFixed(3),
      wireArea: wireArea.toFixed(4),
      totalWireArea: totalWireArea.toFixed(3),
      fillPercentage: parseFloat(fillPercentage),
      maxFill,
      maxWires: maxWires,
      isOverfilled: parseFloat(fillPercentage) > maxFill
    };
  };

  const results = calculateFill();

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={onBack} style={{ padding: '10px 20px' }}>
          ← Back to Menu
        </button>
      </div>
      
      <h2>Conduit Fill Calculator</h2>
      <p style={{ fontSize: '14px', color: '#666' }}>
        Calculate conduit fill per NEC Chapter 9, Table 1
      </p>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Conduit Type & Size: </label>
        <select 
          value={conduitType} 
          onChange={(e) => setConduitType(e.target.value)}
          style={{ width: '100%', padding: '5px' }}
        >
          <optgroup label="EMT">
            {Object.entries(conduitData)
              .filter(([key]) => key.startsWith('emt'))
              .map(([key, conduit]) => (
                <option key={key} value={key}>{conduit.name}</option>
              ))}
          </optgroup>
          <optgroup label="PVC Schedule 40">
            {Object.entries(conduitData)
              .filter(([key]) => key.startsWith('pvc'))
              .map(([key, conduit]) => (
                <option key={key} value={key}>{conduit.name}</option>
              ))}
          </optgroup>
          <optgroup label="Rigid Steel">
            {Object.entries(conduitData)
              .filter(([key]) => key.startsWith('rigid'))
              .map(([key, conduit]) => (
                <option key={key} value={key}>{conduit.name}</option>
              ))}
          </optgroup>
        </select>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Wire Type: </label>
        <select 
          value={wireType} 
          onChange={(e) => setWireType(e.target.value)}
          style={{ width: '100%', padding: '5px' }}
        >
          <option value="thwn">THWN-2</option>
          <option value="xhhw">XHHW-2</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Wire Size (AWG): </label>
        <select 
          value={wireSize} 
          onChange={(e) => setWireSize(e.target.value)}
          style={{ width: '100%', padding: '5px' }}
        >
          <option value="14">14 AWG</option>
          <option value="12">12 AWG</option>
          <option value="10">10 AWG</option>
          <option value="8">8 AWG</option>
          <option value="6">6 AWG</option>
          <option value="4">4 AWG</option>
          <option value="3">3 AWG</option>
          <option value="2">2 AWG</option>
          <option value="1">1 AWG</option>
          <option value="1/0">1/0 AWG</option>
          <option value="2/0">2/0 AWG</option>
          <option value="3/0">3/0 AWG</option>
          <option value="4/0">4/0 AWG</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Number of Wires: </label>
        <input 
          type="number" 
          value={wireCount} 
          onChange={(e) => setWireCount(parseInt(e.target.value) || 1)}
          min="1"
          max="50"
        />
      </div>
      
      <div style={{ 
        backgroundColor: results.isOverfilled ? '#ffebee' : '#f0f0f0', 
        border: results.isOverfilled ? '2px solid #f44336' : '1px solid #ddd',
        padding: '15px', 
        borderRadius: '5px'
      }}>
        <h3>Results:</h3>
        <div>Conduit Area: {results.conduitArea} sq.in.</div>
        <div>Wire Area Each: {results.wireArea} sq.in.</div>
        <div>Total Wire Area: {results.totalWireArea} sq.in.</div>
        <div style={{ fontWeight: 'bold', color: results.isOverfilled ? '#f44336' : '#4caf50' }}>
          Fill: {results.fillPercentage}% (Max: {results.maxFill}%)
        </div>
        <div style={{ marginTop: '10px', fontWeight: 'bold' }}>
          Max {wireSize} AWG wires: {results.maxWires}
        </div>
        {results.isOverfilled && (
          <div style={{ color: '#f44336', fontWeight: 'bold', marginTop: '10px' }}>
            ⚠️ CONDUIT OVERFILLED - Violates NEC
          </div>
        )}
      </div>
    </div>
  );
}

export default ConduitFillCalculator;