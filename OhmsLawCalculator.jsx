import React, { useState } from 'react';

function OhmsLawCalculator({ onBack }) {
  const [voltage, setVoltage] = useState('');
  const [current, setCurrent] = useState('');
  const [resistance, setResistance] = useState('');
  const [power, setPower] = useState('');

  const calculate = () => {
    const V = parseFloat(voltage);
    const I = parseFloat(current);
    const R = parseFloat(resistance);
    const P = parseFloat(power);

    let results = {};

    // Calculate missing values based on what's provided
    if (V && I) {
      results.resistance = (V / I).toFixed(2);
      results.power = (V * I).toFixed(2);
    } else if (V && R) {
      results.current = (V / R).toFixed(2);
      results.power = (V * V / R).toFixed(2);
    } else if (I && R) {
      results.voltage = (I * R).toFixed(2);
      results.power = (I * I * R).toFixed(2);
    } else if (V && P) {
      results.current = (P / V).toFixed(2);
      results.resistance = (V * V / P).toFixed(2);
    } else if (I && P) {
      results.voltage = (P / I).toFixed(2);
      results.resistance = (P / (I * I)).toFixed(2);
    } else if (R && P) {
      results.voltage = Math.sqrt(P * R).toFixed(2);
      results.current = Math.sqrt(P / R).toFixed(2);
    }

    return results;
  };

  const results = calculate();

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={onBack} style={{ padding: '10px 20px' }}>
          ← Back to Menu
        </button>
      </div>
      
      <h2>Ohm's Law Calculator</h2>
      <p style={{ fontSize: '14px', color: '#666' }}>
        Enter any two values to calculate the others
      </p>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Voltage (V): </label>
        <input 
          type="number" 
          value={voltage} 
          onChange={(e) => setVoltage(e.target.value)}
          placeholder="Volts"
        />
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Current (I): </label>
        <input 
          type="number" 
          value={current} 
          onChange={(e) => setCurrent(e.target.value)}
          placeholder="Amps"
        />
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Resistance (R): </label>
        <input 
          type="number" 
          value={resistance} 
          onChange={(e) => setResistance(e.target.value)}
          placeholder="Ohms"
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Power (P): </label>
        <input 
          type="number" 
          value={power} 
          onChange={(e) => setPower(e.target.value)}
          placeholder="Watts"
        />
      </div>
      
      {Object.keys(results).length > 0 && (
        <div style={{ 
          backgroundColor: '#f0f0f0', 
          padding: '15px', 
          borderRadius: '5px'
        }}>
          <h3>Calculated Results:</h3>
          {results.voltage && <div>Voltage: {results.voltage}V</div>}
          {results.current && <div>Current: {results.current}A</div>}
          {results.resistance && <div>Resistance: {results.resistance}Ω</div>}
          {results.power && <div>Power: {results.power}W</div>}
        </div>
      )}
    </div>
  );
}

export default OhmsLawCalculator;