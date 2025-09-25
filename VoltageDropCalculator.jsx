import React, { useState } from 'react';

function VoltageDropCalculator() {
  const [voltage, setVoltage] = useState('');
  const [current, setCurrent] = useState('');
  const [distance, setDistance] = useState('');
  const [wireSize, setWireSize] = useState('12');

  const calculateDrop = () => {
    if (!voltage || !current || !distance) return '0.00';
    
    // Wire resistance per 1000 feet (simplified)
    const wireResistance = {
      '12': 1.59,
      '10': 0.999,
      '8': 0.628,
      '6': 0.395
    };
    
    const resistance = wireResistance[wireSize];
    // VD = 2 × I × L × R / 1000
    const drop = (2 * parseFloat(current) * parseFloat(distance) * resistance) / 1000;
    const percentage = (drop / parseFloat(voltage)) * 100;
    
    return `${drop.toFixed(2)}V (${percentage.toFixed(1)}%)`;
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>Voltage Drop Calculator</h2>
      
      <div style={{ marginBottom: '10px' }}>
        <label>System Voltage: </label>
        <input 
          type="number" 
          value={voltage} 
          onChange={(e) => setVoltage(e.target.value)}
          placeholder="120, 240, etc."
        />
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Current (Amps): </label>
        <input 
          type="number" 
          value={current} 
          onChange={(e) => setCurrent(e.target.value)}
          placeholder="15, 20, etc."
        />
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Distance (feet): </label>
        <input 
          type="number" 
          value={distance} 
          onChange={(e) => setDistance(e.target.value)}
          placeholder="100, 200, etc."
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Wire Size: </label>
        <select value={wireSize} onChange={(e) => setWireSize(e.target.value)}>
          <option value="12">12 AWG</option>
          <option value="10">10 AWG</option>
          <option value="8">8 AWG</option>
          <option value="6">6 AWG</option>
        </select>
      </div>
      
      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '15px', 
        borderRadius: '5px',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        Voltage Drop: {calculateDrop()}
      </div>
    </div>
  );
}

export default VoltageDropCalculator;