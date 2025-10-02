import React, { useState } from 'react';

function ConduitFillCalculator({ onBack }) {
  const [conduitType, setConduitType] = useState('emt-0.5');
  const [wireType, setWireType] = useState('thwn');
  const [conductors, setConductors] = useState([
    { size: '12', count: '' }
  ]);

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
      '4/0': 0.3237,
      '250': 0.3970,
      '300': 0.4608,
      '350': 0.5242,
      '400': 0.5863,
      '500': 0.7073
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
      '4/0': 0.3718,
      '250': 0.4596,
      '300': 0.5281,
      '350': 0.5958,
      '400': 0.6619,
      '500': 0.7901
    }
  };

  const addConductor = () => {
    setConductors([...conductors, { size: '12', count: '' }]);
  };

  const removeConductor = (index) => {
    if (conductors.length > 1) {
      setConductors(conductors.filter((_, i) => i !== index));
    }
  };

  const updateConductor = (index, field, value) => {
    const newConductors = [...conductors];
    newConductors[index][field] = value;
    setConductors(newConductors);
  };

  const calculateFill = () => {
    const conduitArea = conduitData[conduitType].area;
    
    // Calculate total wire area and count
    let totalWireArea = 0;
    let totalWireCount = 0;
    
    const conductorDetails = conductors.map(conductor => {
      const count = parseInt(conductor.count) || 0;
      const wireArea = wireData[wireType][conductor.size] || 0;
      const subtotal = wireArea * count;
      
      totalWireArea += subtotal;
      totalWireCount += count;
      
      return {
        size: conductor.size,
        count: count,
        areaEach: wireArea,
        subtotal: subtotal
      };
    });
    
    const fillPercentage = (totalWireArea / conduitArea * 100).toFixed(1);
    
    // NEC Table 1, Chapter 9 - Maximum fill percentages
    let maxFill = 40; // Default for 3+ wires
    if (totalWireCount === 1) maxFill = 53;
    else if (totalWireCount === 2) maxFill = 31;
    
    return {
      conduitArea: conduitArea.toFixed(3),
      totalWireArea: totalWireArea.toFixed(3),
      fillPercentage: parseFloat(fillPercentage),
      maxFill,
      totalWireCount,
      conductorDetails,
      isOverfilled: parseFloat(fillPercentage) > maxFill
    };
  };

  const results = calculateFill();

  return (
    <div className="calculator-container">
      {onBack && (
        <button onClick={onBack} style={{ marginBottom: '20px' }}>
          ← Back to Menu
        </button>
      )}
      
      <h2>Conduit Fill Calculator</h2>
      <p className="small">
        Calculate conduit fill per NEC Chapter 9, Table 1
      </p>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Conduit Type & Size:</label>
        <select 
          value={conduitType} 
          onChange={(e) => setConduitType(e.target.value)}
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
      
      <div style={{ marginBottom: '15px' }}>
        <label>Wire Type:</label>
        <select 
          value={wireType} 
          onChange={(e) => setWireType(e.target.value)}
        >
          <option value="thwn">THWN-2</option>
          <option value="xhhw">XHHW-2</option>
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '10px' }}>
          <strong>Conductors:</strong>
        </label>
        {conductors.map((conductor, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            gap: '10px', 
            marginBottom: '10px',
            alignItems: 'center',
            backgroundColor: '#f8fafc',
            padding: '10px',
            borderRadius: '6px'
          }}>
            <div style={{ flex: '1' }}>
              <select 
                value={conductor.size} 
                onChange={(e) => updateConductor(index, 'size', e.target.value)}
                style={{ width: '100%' }}
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
                <option value="250">250 kcmil</option>
                <option value="300">300 kcmil</option>
                <option value="350">350 kcmil</option>
                <option value="400">400 kcmil</option>
                <option value="500">500 kcmil</option>
              </select>
            </div>
            <div style={{ flex: '1' }}>
              <input 
                type="number" 
                value={conductor.count} 
                onChange={(e) => updateConductor(index, 'count', e.target.value)}
                placeholder="Qty"
                min="0"
                style={{ width: '100%' }}
              />
            </div>
            {conductors.length > 1 && (
              <button 
                onClick={() => removeConductor(index)}
                style={{ 
                  backgroundColor: '#ef4444', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  padding: '8px 12px',
                  fontSize: '12px',
                  minWidth: '70px'
                }}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button 
          onClick={addConductor}
          style={{ 
            backgroundColor: '#10b981', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px',
            padding: '10px 15px',
            fontSize: '14px',
            marginTop: '5px'
          }}
        >
          + Add Wire Size
        </button>
      </div>
      
      <div className={`result ${results.isOverfilled ? 'error' : ''}`}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#1e3a8a' }}>Results:</h3>
        
        {results.conductorDetails.length > 0 && results.totalWireCount > 0 && (
          <div style={{ 
            backgroundColor: '#f8fafc', 
            padding: '12px', 
            borderRadius: '6px',
            marginBottom: '15px'
          }}>
            <strong style={{ color: '#374151' }}>Conductor Breakdown:</strong>
            {results.conductorDetails.map((detail, index) => (
              detail.count > 0 && (
                <div key={index} style={{ 
                  marginTop: '8px',
                  paddingTop: '8px',
                  borderTop: index > 0 ? '1px solid #e5e7eb' : 'none',
                  color: '#374151'
                }}>
                  <div>{detail.count}x {detail.size} AWG {wireType.toUpperCase()}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    {detail.areaEach.toFixed(4)} sq.in. each = {detail.subtotal.toFixed(4)} sq.in. total
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        <div style={{ color: '#374151' }}>
          <strong>Conduit Area:</strong> {results.conduitArea} sq.in.
        </div>
        <div style={{ color: '#374151' }}>
          <strong>Total Wire Area:</strong> {results.totalWireArea} sq.in.
        </div>
        <div style={{ color: '#374151' }}>
          <strong>Total Conductors:</strong> {results.totalWireCount}
        </div>
        
        <div style={{ 
          fontWeight: 'bold',
          fontSize: '18px',
          marginTop: '15px',
          paddingTop: '15px',
          borderTop: '2px solid #e5e7eb',
          color: results.isOverfilled ? '#dc2626' : '#059669'
        }}>
          Fill: {results.fillPercentage}% (Max: {results.maxFill}%)
        </div>

        {results.isOverfilled && (
          <div style={{ 
            color: '#dc2626', 
            fontWeight: 'bold', 
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#fef2f2',
            borderRadius: '5px',
            border: '1px solid #fecaca'
          }}>
            ⚠️ CONDUIT OVERFILLED - Violates NEC Chapter 9
            <div style={{ fontSize: '14px', fontWeight: 'normal', marginTop: '5px' }}>
              Reduce number of conductors or use larger conduit
            </div>
          </div>
        )}

        {!results.isOverfilled && results.totalWireCount > 0 && (
          <div style={{ 
            color: '#059669', 
            marginTop: '10px',
            fontSize: '14px'
          }}>
            ✓ Conduit fill is within NEC limits
          </div>
        )}
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#374151'
      }}>
        <strong>NEC Chapter 9, Table 1 - Conduit Fill Limits:</strong>
        <ul style={{ textAlign: 'left', paddingLeft: '20px', margin: '10px 0' }}>
          <li>1 conductor: 53% maximum fill</li>
          <li>2 conductors: 31% maximum fill</li>
          <li>3+ conductors: 40% maximum fill</li>
        </ul>
        <div style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '10px' }}>
          Note: Equipment grounding conductors and bonding conductors count as conductors for fill calculations.
        </div>
      </div>
    </div>
  );
}

export default ConduitFillCalculator;
