import React, { useState } from 'react';

function BoxFillCalculator({ onBack }) {
  const [boxType, setBoxType] = useState('4x1.5-square');
  const [conductors, setConductors] = useState([
    { size: '12', count: '' }
  ]);
  const [devices, setDevices] = useState({
    outlets: '',
    switches: '',
    clamps: '',
    groundWires: false
  });

  const boxCapacities = {
    // Device Boxes (Single Gang)
    '3x2x1.5': { capacity: 7.5, name: '3" x 2" x 1-1/2" Device Box' },
    '3x2x2': { capacity: 10.0, name: '3" x 2" x 2" Device Box' },
    '3x2x2.25': { capacity: 10.5, name: '3" x 2" x 2-1/4" Device Box' },
    '3x2x2.5': { capacity: 12.5, name: '3" x 2" x 2-1/2" Device Box' },
    '3x2x2.75': { capacity: 14.0, name: '3" x 2" x 2-3/4" Device Box' },
    '3x2x3.5': { capacity: 18.0, name: '3" x 2" x 3-1/2" Device Box' },
    
    // Device Boxes (Multi-Gang)
    '3x2x2-2gang': { capacity: 14.0, name: '2-Gang 3" x 2" x 2" Device Box' },
    '3x2x2.25-2gang': { capacity: 17.0, name: '2-Gang 3" x 2" x 2-1/4" Device Box' },
    '3x2x2.5-2gang': { capacity: 21.0, name: '2-Gang 3" x 2" x 2-1/2" Device Box' },
    '3x2x3.5-2gang': { capacity: 29.5, name: '2-Gang 3" x 2" x 3-1/2" Device Box' },
    '3x2x3.5-3gang': { capacity: 43.5, name: '3-Gang 3" x 2" x 3-1/2" Device Box' },
    
    // Square Boxes
    '4x1.25-square': { capacity: 18.0, name: '4" x 1-1/4" Square' },
    '4x1.5-square': { capacity: 21.0, name: '4" x 1-1/2" Square' },
    '4x2.125-square': { capacity: 30.3, name: '4" x 2-1/8" Square' },
    '4-11/16x1.5-square': { capacity: 25.5, name: '4-11/16" x 1-1/2" Square' },
    '4-11/16x2.125-square': { capacity: 42.0, name: '4-11/16" x 2-1/8" Square' },
    
    // Round/Octagon Boxes
    '4x1.25-round': { capacity: 12.5, name: '4" x 1-1/4" Round' },
    '4x1.5-round': { capacity: 15.5, name: '4" x 1-1/2" Round' },
    '4x2.125-round': { capacity: 21.5, name: '4" x 2-1/8" Round' },
    '4x1.25-octagon': { capacity: 15.5, name: '4" x 1-1/4" Octagon' },
    '4x1.5-octagon': { capacity: 18.0, name: '4" x 1-1/2" Octagon' },
    '4x2.125-octagon': { capacity: 24.5, name: '4" x 2-1/8" Octagon' },
    
    // Masonry Boxes
    '3.5x1.5-masonry': { capacity: 14.0, name: '3-1/2" x 1-1/2" Masonry Box' },
    '3.5x2.125-masonry': { capacity: 21.0, name: '3-1/2" x 2-1/8" Masonry Box' }
  };

  // NEC 314.16(B) - Volume allowances per conductor
  const wireAllowances = {
    '14': 2.0,
    '12': 2.25,
    '10': 2.5,
    '8': 3.0,
    '6': 5.0,
    '4': 5.0,
    '3': 5.0,
    '2': 5.0,
    '1': 5.0
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
    let totalFill = 0;
    
    // Calculate conductor fill
    const conductorDetails = conductors.map(conductor => {
      const count = parseInt(conductor.count) || 0;
      const wireAllowance = wireAllowances[conductor.size];
      const subtotal = wireAllowance * count;
      
      totalFill += subtotal;
      
      return {
        size: conductor.size,
        count: count,
        allowanceEach: wireAllowance,
        subtotal: subtotal
      };
    });
    
    // Device fill - use largest conductor size for calculating device volume
    const largestWireSize = conductors.reduce((largest, conductor) => {
      const count = parseInt(conductor.count) || 0;
      if (count > 0) {
        const currentSize = parseInt(conductor.size.replace('/', '')) || 0;
        const largestSize = parseInt(largest.replace('/', '')) || 0;
        return currentSize < largestSize ? conductor.size : largest;
      }
      return largest;
    }, '14');
    
    const deviceWireAllowance = wireAllowances[largestWireSize];
    const outlets = parseInt(devices.outlets) || 0;
    const switches = parseInt(devices.switches) || 0;
    const deviceFill = (outlets + switches) * 2 * deviceWireAllowance;
    totalFill += deviceFill;
    
    // Cable clamps (NEC 314.16(B)(2))
    const clamps = parseInt(devices.clamps) || 0;
    const clampFill = clamps > 0 ? deviceWireAllowance : 0;
    totalFill += clampFill;
    
    // All ground wires count as 1 wire equivalent (NEC 314.16(B)(5))
    const groundFill = devices.groundWires ? deviceWireAllowance : 0;
    totalFill += groundFill;
    
    return {
      conductorDetails,
      deviceFill,
      clampFill,
      groundFill,
      totalFill,
      largestWireSize,
      deviceWireAllowance
    };
  };

  const results = calculateFill();
  const boxCapacity = boxCapacities[boxType].capacity;
  const fillPercentage = boxCapacity > 0 ? ((results.totalFill / boxCapacity) * 100).toFixed(1) : 0;
  const isOverfilled = results.totalFill > boxCapacity;

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
          <optgroup label="Device Boxes (Single Gang)">
            <option value="3x2x1.5">{boxCapacities['3x2x1.5'].name} - {boxCapacities['3x2x1.5'].capacity} cu.in.</option>
            <option value="3x2x2">{boxCapacities['3x2x2'].name} - {boxCapacities['3x2x2'].capacity} cu.in.</option>
            <option value="3x2x2.25">{boxCapacities['3x2x2.25'].name} - {boxCapacities['3x2x2.25'].capacity} cu.in.</option>
            <option value="3x2x2.5">{boxCapacities['3x2x2.5'].name} - {boxCapacities['3x2x2.5'].capacity} cu.in.</option>
            <option value="3x2x2.75">{boxCapacities['3x2x2.75'].name} - {boxCapacities['3x2x2.75'].capacity} cu.in.</option>
            <option value="3x2x3.5">{boxCapacities['3x2x3.5'].name} - {boxCapacities['3x2x3.5'].capacity} cu.in.</option>
          </optgroup>
          <optgroup label="Device Boxes (Multi-Gang)">
            <option value="3x2x2-2gang">{boxCapacities['3x2x2-2gang'].name} - {boxCapacities['3x2x2-2gang'].capacity} cu.in.</option>
            <option value="3x2x2.25-2gang">{boxCapacities['3x2x2.25-2gang'].name} - {boxCapacities['3x2x2.25-2gang'].capacity} cu.in.</option>
            <option value="3x2x2.5-2gang">{boxCapacities['3x2x2.5-2gang'].name} - {boxCapacities['3x2x2.5-2gang'].capacity} cu.in.</option>
            <option value="3x2x3.5-2gang">{boxCapacities['3x2x3.5-2gang'].name} - {boxCapacities['3x2x3.5-2gang'].capacity} cu.in.</option>
            <option value="3x2x3.5-3gang">{boxCapacities['3x2x3.5-3gang'].name} - {boxCapacities['3x2x3.5-3gang'].capacity} cu.in.</option>
          </optgroup>
          <optgroup label="Square Boxes">
            <option value="4x1.25-square">{boxCapacities['4x1.25-square'].name} - {boxCapacities['4x1.25-square'].capacity} cu.in.</option>
            <option value="4x1.5-square">{boxCapacities['4x1.5-square'].name} - {boxCapacities['4x1.5-square'].capacity} cu.in.</option>
            <option value="4x2.125-square">{boxCapacities['4x2.125-square'].name} - {boxCapacities['4x2.125-square'].capacity} cu.in.</option>
            <option value="4-11/16x1.5-square">{boxCapacities['4-11/16x1.5-square'].name} - {boxCapacities['4-11/16x1.5-square'].capacity} cu.in.</option>
            <option value="4-11/16x2.125-square">{boxCapacities['4-11/16x2.125-square'].name} - {boxCapacities['4-11/16x2.125-square'].capacity} cu.in.</option>
          </optgroup>
          <optgroup label="Round/Octagon Boxes">
            <option value="4x1.25-round">{boxCapacities['4x1.25-round'].name} - {boxCapacities['4x1.25-round'].capacity} cu.in.</option>
            <option value="4x1.5-round">{boxCapacities['4x1.5-round'].name} - {boxCapacities['4x1.5-round'].capacity} cu.in.</option>
            <option value="4x2.125-round">{boxCapacities['4x2.125-round'].name} - {boxCapacities['4x2.125-round'].capacity} cu.in.</option>
            <option value="4x1.25-octagon">{boxCapacities['4x1.25-octagon'].name} - {boxCapacities['4x1.25-octagon'].capacity} cu.in.</option>
            <option value="4x1.5-octagon">{boxCapacities['4x1.5-octagon'].name} - {boxCapacities['4x1.5-octagon'].capacity} cu.in.</option>
            <option value="4x2.125-octagon">{boxCapacities['4x2.125-octagon'].name} - {boxCapacities['4x2.125-octagon'].capacity} cu.in.</option>
          </optgroup>
          <optgroup label="Masonry Boxes">
            <option value="3.5x1.5-masonry">{boxCapacities['3.5x1.5-masonry'].name} - {boxCapacities['3.5x1.5-masonry'].capacity} cu.in.</option>
            <option value="3.5x2.125-masonry">{boxCapacities['3.5x2.125-masonry'].name} - {boxCapacities['3.5x2.125-masonry'].capacity} cu.in.</option>
          </optgroup>
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
        <div className="small" style={{ marginTop: '8px' }}>
          Count all insulated conductors entering, leaving, or passing through the box
        </div>
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
        
        {results.conductorDetails.length > 0 && results.conductorDetails.some(c => c.count > 0) && (
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
                  borderTop: index > 0 && results.conductorDetails.slice(0, index).some(c => c.count > 0) ? '1px solid #e5e7eb' : 'none',
                  color: '#374151'
                }}>
                  <div>{detail.count}x {detail.size} AWG</div>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    {detail.allowanceEach} cu.in. each = {detail.subtotal.toFixed(2)} cu.in. total
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        <div style={{ color: '#374151' }}>
          <strong>Box Capacity:</strong> {boxCapacity} cu.in.
        </div>
        {results.deviceFill > 0 && (
          <div style={{ color: '#374151' }}>
            <strong>Devices:</strong> {results.deviceFill.toFixed(2)} cu.in.
          </div>
        )}
        {results.clampFill > 0 && (
          <div style={{ color: '#374151' }}>
            <strong>Clamps:</strong> {results.clampFill.toFixed(2)} cu.in.
          </div>
        )}
        {results.groundFill > 0 && (
          <div style={{ color: '#374151' }}>
            <strong>Grounds:</strong> {results.groundFill.toFixed(2)} cu.in.
          </div>
        )}
        <div style={{ color: '#374151', marginTop: '5px', paddingTop: '5px', borderTop: '1px solid #e5e7eb' }}>
          <strong>Calculated Fill:</strong> {results.totalFill.toFixed(2)} cu.in.
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

        {!isOverfilled && results.totalFill > 0 && (
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
          <li>Each device (switch/receptacle) = 2 conductor volumes (based on largest conductor)</li>
          <li>All equipment grounding conductors = 1 conductor volume (based on largest conductor)</li>
          <li>Each cable clamp or fixture stud = 1 conductor volume (based on largest conductor)</li>
          <li>Internal cable clamps (one or more) = 1 conductor volume</li>
        </ul>
      </div>
    </div>
  );
}

export default BoxFillCalculator;
