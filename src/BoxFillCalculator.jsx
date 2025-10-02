import React, { useState } from 'react';

function BoxFillCalculator({ onBack }) {
  const [boxType, setBoxType] = useState('4x1.25-round');
  const [wireSize, setWireSize] = useState('12');
  const [conductors, setConductors] = useState('');
  const [devices, setDevices] = useState({
    outlets: '',
    switches: '',
    clamps: '',
    groundWires: false
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

  // NEC 314.16(B) - Volume allowances per conductor
  const wireAllowances = {
    '14': 2.0,
    '12': 2.25,
    '10': 2.5,
    '8': 3.0,
    '6': 5.0
  };

  const calculateFill = () => {
    const wireAllowance = wireAllowances[wireSize];
    
    let totalFill = 0;
    
    // Count conductors entering/leaving the box (NEC 314.16(B)(1))
    const numConductors = parseInt(conductors) || 0;
    totalFill += numConductors * wireAllowance;
    
    // Each device counts as 2 wire equivalents (NEC 314.16(B)(4))
    const outlets = parseInt(devices.outlets) || 0;
    const switches = parseInt(devices.switches) || 0;
    totalFill += (outlets + switches) * 2 * wireAllowance;
    
    // Cable clamps count as 1 wire equivalent per set (NEC 314.16(B)(2))
    const clamps = parseInt(devices.clamps) || 0;
    totalFill += clamps * wireAllowance;
    
    // All ground wires count as 1 wire equivalent total (NEC 314.16(B)(5))
    if (devices.groundWires) {
      totalFill += wireAllowance;
    }
    
    return totalFill;
  };

  const totalFill = calculateFill();
  const boxCapacity = boxCapacities[boxType].capacity;
  const fillPercentage = boxCapacity > 0 ? ((totalFill / boxCapacity) * 100).toFixed(1) : 0;
  const isOverfilled = totalFill > boxCapacity;

  return (
    <div className="calculator-container">
      {onBack && (
        <button onClick={onBack} style={{ marginBottom: '20px' }}>
          ← Back to Menu
        </button>
      )}
      
      <h2>Box Fill Calculator</h2>
      <p className="small">
        Calculate cubic inch fill for electrical boxes (NEC 314.16)
      </p>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Box Type:</label>
        <select 
          value={boxType} 
          onChange={(e) => setBoxType(e.target.value)}
        >
          {Object.entries(boxCapacities).map(([key, box]) => (
            <option key={key} value={key}>{box.name} - {box.capacity} cu.in.</option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Wire Size (AWG):</label>
        <select 
          value={wireSize} 
          onChange={(e) => setWireSize(e.target.value)}
        >
          <option value="14">14 AWG (2.0 cu.in.)</option>
          <option value="12">12 AWG (2.25 cu.in.)</option>
          <option value="10">10 AWG (2.5 cu.in.)</option>
          <option value="8">8 AWG (3.0 cu.in.)</option>
          <option value="6">6 AWG (5.0 cu.in.)</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Number of Conductors:</label>
        <input 
          type="number" 
          value={conductors} 
          onChange={(e) => setConductors(e.target.value)}
          placeholder="0"
          min="0"
        />
        <div className="small">Count all insulated conductors entering, leaving, or passing through the box (do not count equipment grounding conductors here)</div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Receptacles/Outlets:</label>
        <input 
          type="number" 
          value={devices.outlets} 
          onChange={(e) => setDevices({...devices, outlets: e.target.value})}
          placeholder="0"
          min="0"
        />
        <div className="small">Each device counts as 2 conductors</div>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Switches:</label>
        <input 
          type="number" 
          value={devices.switches} 
          onChange={(e) => setDevices({...devices, switches: e.target.value})}
          placeholder="0"
          min="0"
        />
        <div className="small">Each device counts as 2 conductors</div>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Cable Clamps (or fixture studs):</label>
        <input 
          type="number" 
          value={devices.clamps} 
          onChange={(e) => setDevices({...devices, clamps: e.target.value})}
          placeholder="0"
          min="0"
        />
        <div className="small">One or more clamps = 1 conductor volume</div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input 
            type="checkbox" 
            checked={devices.groundWires} 
            onChange={(e) => setDevices({...devices, groundWires: e.target.checked})}
            style={{ width: 'auto', margin: 0 }}
          />
          <span>Equipment Grounding Conductors Present</span>
        </label>
        <div className="small" style={{ marginLeft: '30px' }}>
          All grounds combined count as 1 conductor volume
        </div>
      </div>
      
      <div className={`result ${isOverfilled ? 'error' : ''}`}>
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#1e3a8a' }}>Results:</h3>
        <div style={{ color: '#374151' }}>
          <strong>Box Capacity:</strong> {boxCapacity} cu.in.
        </div>
        <div style={{ color: '#374151' }}>
          <strong>Calculated Fill:</strong> {totalFill.toFixed(2)} cu.in.
        </div>
        <div style={{ 
          fontWeight: 'bold', 
          fontSize: '18px',
          marginTop: '10px',
          color: isOverfilled ? '#dc2626' : '#059669'
        }}>
          Fill: {fillPercentage}%
        </div>
        
        {isOverfilled && (
          <div style={{ 
            color: '#dc2626', 
            fontWeight: 'bold', 
            marginTop: '15px',
            padding: '10px',
            backgroundColor: '#fef2f2',
            borderRadius: '5px',
            border: '1px solid #fecaca'
          }}>
            ⚠️ BOX OVERFILLED - Violates NEC 314.16
            <div style={{ fontSize: '14px', fontWeight: 'normal', marginTop: '5px' }}>
              Reduce number of devices or use larger box
            </div>
          </div>
        )}

        {!isOverfilled && totalFill > 0 && (
          <div style={{ 
            color: '#059669', 
            marginTop: '10px',
            fontSize: '14px'
          }}>
            ✓ Box fill is within NEC limits
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
        <strong>NEC 314.16 - Box Fill Requirements:</strong>
        <ul style={{ textAlign: 'left', paddingLeft: '20px', margin: '10px 0' }}>
          <li>Each conductor = volume per Table 314.16(B)</li>
          <li>Each device (switch/receptacle) = 2 conductor volumes</li>
          <li>All equipment grounding conductors = 1 conductor volume</li>
          <li>Each cable clamp or fixture stud = 1 conductor volume</li>
          <li>Internal cable clamps (one or more) = 1 conductor volume</li>
        </ul>
        <div style={{ fontSize: '12px', fontStyle: 'italic', marginTop: '10px' }}>
          Note: Conductors originating outside the box and terminating inside count as 1 each.
          Conductors passing through without splice count as 1 each.
        </div>
      </div>
    </div>
  );
}

export default BoxFillCalculator;
