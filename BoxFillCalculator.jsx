import React, { useState } from 'react';

function BoxFillCalculator({ onBack }) {
  const [boxType, setBoxType] = useState('4x1.25-round');
  const [devices, setDevices] = useState({
    outlets: 0,
    switches: 0,
    wirenuts: 0,
    clamps: 0,
    groundWires: 0
  });

  const boxCapacities = {
    '4x1.25-round': { capacity: 12.5, name: '4" x 1-1/4" Round' },
    '4x1.5-round': { capacity: 15.5, name: '4" x 1-1/2" Round' },
    '4x2.125-round': { capacity: 21.5, name: '4" x 2-1/8" Round' },
    '4x1.25-octagon': { capacity: 15.5, name: '4" x 1-1/4" Octagon' },
    '4x1.5-octagon': { capacity: 18.0, name: '4" x 1-1/2" Octagon' },
    '4x2.125-octagon': { capacity: 24.5, name: '4" x 2-1/8" Octagon' },
    '3x2x1.5': { capacity: 7.5, name: '3" x 2" x 1-1/2"' },
    '3x2x2': { capacity: 10.0, name: '3" x 2" x 2"' },
    '3x2x2.5': { capacity: 12.5, name: '3" x 2" x 2-1/2"' },
    '4x1.25-square': { capacity: 18.0, name: '4" x 1-1/4" Square' },
    '4x1.5-square': { capacity: 21.0, name: '4" x 1-1/2" Square' },
    '4x2.125-square': { capacity: 30.3, name: '4" x 2-1/8" Square' }
  };

  const calculateFill = () => {
    const wireAllowance = 2.0; // cubic inches per 12 AWG wire (assuming 12 AWG)
    
    let totalFill = 0;
    
    // Each device counts as 2 wire equivalents
    totalFill += (devices.outlets + devices.switches) * 2 * wireAllowance;
    
    // Wire nuts count as 1 wire equivalent each
    totalFill += devices.wirenuts * wireAllowance;
    
    // Cable clamps count as 1 wire equivalent each
    totalFill += devices.clamps * wireAllowance;
    
    // Ground wires count as 1 wire equivalent total (regardless of quantity)
    if (devices.groundWires > 0) {
      totalFill += wireAllowance;
    }
    
    return totalFill;
  };

  const totalFill = calculateFill();
  const boxCapacity = boxCapacities[boxType].capacity;
  const fillPercentage = ((totalFill / boxCapacity) * 100).toFixed(1);
  const isOverfilled = totalFill > boxCapacity;

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={onBack} style={{ padding: '10px 20px' }}>
          ← Back to Menu
        </button>
      </div>
      
      <h2>Box Fill Calculator</h2>
      <p style={{ fontSize: '14px', color: '#666' }}>
        Calculate cubic inch fill for electrical boxes (NEC 314.16)
      </p>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Box Type: </label>
        <select 
          value={boxType} 
          onChange={(e) => setBoxType(e.target.value)}
          style={{ width: '100%', padding: '5px' }}
        >
          {Object.entries(boxCapacities).map(([key, box]) => (
            <option key={key} value={key}>{box.name} - {box.capacity} cu.in.</option>
          ))}
        </select>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Receptacles/Outlets: </label>
        <input 
          type="number" 
          value={devices.outlets} 
          onChange={(e) => setDevices({...devices, outlets: parseInt(e.target.value) || 0})}
          min="0"
        />
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Switches: </label>
        <input 
          type="number" 
          value={devices.switches} 
          onChange={(e) => setDevices({...devices, switches: parseInt(e.target.value) || 0})}
          min="0"
        />
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Wire Nuts: </label>
        <input 
          type="number" 
          value={devices.wirenuts} 
          onChange={(e) => setDevices({...devices, wirenuts: parseInt(e.target.value) || 0})}
          min="0"
        />
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Cable Clamps: </label>
        <input 
          type="number" 
          value={devices.clamps} 
          onChange={(e) => setDevices({...devices, clamps: parseInt(e.target.value) || 0})}
          min="0"
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Ground Wires Present: </label>
        <input 
          type="checkbox" 
          checked={devices.groundWires > 0} 
          onChange={(e) => setDevices({...devices, groundWires: e.target.checked ? 1 : 0})}
        />
      </div>
      
      <div style={{ 
        backgroundColor: isOverfilled ? '#ffebee' : '#f0f0f0', 
        border: isOverfilled ? '2px solid #f44336' : '1px solid #ddd',
        padding: '15px', 
        borderRadius: '5px'
      }}>
        <h3>Results:</h3>
        <div>Box Capacity: {boxCapacity} cu.in.</div>
        <div>Calculated Fill: {totalFill.toFixed(1)} cu.in.</div>
        <div style={{ fontWeight: 'bold', color: isOverfilled ? '#f44336' : '#4caf50' }}>
          Fill Percentage: {fillPercentage}%
        </div>
        {isOverfilled && (
          <div style={{ color: '#f44336', fontWeight: 'bold', marginTop: '10px' }}>
            ⚠️ BOX OVERFILLED - Violates NEC 314.16
          </div>
        )}
      </div>
    </div>
  );
}

export default BoxFillCalculator;