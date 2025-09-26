import React, { useState } from 'react';

function VoltageDropCalculator() {
  const [voltage, setVoltage] = useState('');
  const [current, setCurrent] = useState('');
  const [distance, setDistance] = useState('');
  const [wireSize, setWireSize] = useState('12');
  const [phaseType, setPhaseType] = useState('single');
  const [conductorType, setConductorType] = useState('copper');
  const [powerFactor, setPowerFactor] = useState('1.0');

  // Circular mil values for common wire sizes
  const circularMils = {
    '14': 4110,
    '12': 6530,
    '10': 10380,
    '8': 16510,
    '6': 26240,
    '4': 41740,
    '3': 52620,
    '2': 66360,
    '1': 83690,
    '1/0': 105600,
    '2/0': 133100,
    '3/0': 167800,
    '4/0': 211600,
    '250': 250000,
    '300': 300000,
    '350': 350000,
    '400': 400000,
    '500': 500000,
    '600': 600000,
    '750': 750000,
    '1000': 1000000
  };

  // K constants for different conductor types (ohms per circular mil-foot)
  const kConstants = {
    copper: {
      dc: 10.8,
      ac: 12.9
    },
    aluminum: {
      dc: 17.4,
      ac: 21.2
    }
  };

  const calculateDrop = () => {
    if (!voltage || !current || !distance) return '0.00';
    
    const V = parseFloat(voltage);
    const I = parseFloat(current);
    const L = parseFloat(distance);
    const CM = circularMils[wireSize];
    const PF = parseFloat(powerFactor);
    
    // Use AC constants for more realistic calculations
    const K = kConstants[conductorType].ac;
    
    let voltageDrop;
    
    if (phaseType === 'single') {
      // Single phase: VD = 2 × K × I × L × cos(θ) / CM
      voltageDrop = (2 * K * I * L * PF) / CM;
    } else {
      // Three phase: VD = 1.732 × K × I × L × cos(θ) / CM
      voltageDrop = (1.732 * K * I * L * PF) / CM;
    }
    
    const percentage = (voltageDrop / V) * 100;
    const isExcessive = percentage > 3; // NEC recommends keeping under 3%
    
    return {
      drop: voltageDrop.toFixed(2),
      percentage: percentage.toFixed(2),
      excessive: isExcessive
    };
  };

  const result = calculateDrop();

  return (
    <div className="calculator-container">
      <h2>Voltage Drop Calculator</h2>
      <p className="small">Calculate voltage drop using NEC approved methods</p>
      
      <div style={{ marginBottom: '15px' }}>
        <label>System Type:</label>
        <select 
          value={phaseType} 
          onChange={(e) => setPhaseType(e.target.value)}
          style={{ width: '100%' }}
        >
          <option value="single">Single Phase</option>
          <option value="three">Three Phase</option>
        </select>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label>Conductor Material:</label>
        <select 
          value={conductorType} 
          onChange={(e) => setConductorType(e.target.value)}
          style={{ width: '100%' }}
        >
          <option value="copper">Copper</option>
          <option value="aluminum">Aluminum</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>System Voltage (V):</label>
        <input 
          type="number" 
          value={voltage} 
          onChange={(e) => setVoltage(e.target.value)}
          placeholder="120, 240, 480, etc."
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Load Current (Amps):</label>
        <input 
          type="number" 
          value={current} 
          onChange={(e) => setCurrent(e.target.value)}
          placeholder="15, 20, 30, etc."
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>One-Way Distance (feet):</label>
        <input 
          type="number" 
          value={distance} 
          onChange={(e) => setDistance(e.target.value)}
          placeholder="100, 200, 500, etc."
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Wire Size (AWG/kcmil):</label>
        <select 
          value={wireSize} 
          onChange={(e) => setWireSize(e.target.value)}
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
          <option value="600">600 kcmil</option>
          <option value="750">750 kcmil</option>
          <option value="1000">1000 kcmil</option>
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label>Power Factor (for AC loads):</label>
        <select 
          value={powerFactor} 
          onChange={(e) => setPowerFactor(e.target.value)}
          style={{ width: '100%' }}
        >
          <option value="1.0">1.0 (Resistive loads)</option>
          <option value="0.9">0.9 (Most motors)</option>
          <option value="0.8">0.8 (Poor power factor)</option>
          <option value="0.85">0.85 (Typical mixed load)</option>
        </select>
      </div>
      
      <div className={`result ${result.excessive ? 'error' : ''}`}>
        <div style={{ fontSize: '20px', marginBottom: '10px' }}>
          <strong>Voltage Drop: {result.drop}V ({result.percentage}%)</strong>
        </div>
        
        {result.excessive && (
          <div style={{ 
            color: '#dc2626', 
            fontSize: '14px',
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#fef2f2',
            borderRadius: '5px',
            border: '1px solid #fecaca'
          }}>
            ⚠️ <strong>WARNING:</strong> Voltage drop exceeds NEC recommended 3% limit!
            <br />Consider using larger wire size.
          </div>
        )}

        <div style={{ 
          fontSize: '12px', 
          color: '#6b7280', 
          marginTop: '15px',
          textAlign: 'left'
        }}>
          <strong>Calculation Details:</strong><br />
          • Formula: {phaseType === 'single' ? '2' : '1.732'} × K × I × L × PF ÷ CM<br />
          • K constant ({conductorType}): {kConstants[conductorType].ac}<br />
          • Circular mils: {circularMils[wireSize].toLocaleString()}<br />
          • Power factor: {powerFactor}<br />
          • System: {phaseType === 'single' ? 'Single' : 'Three'} phase
        </div>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#374151'
      }}>
        <strong>NEC Guidelines:</strong>
        <ul style={{ textAlign: 'left', paddingLeft: '20px', margin: '10px 0' }}>
          <li>Branch circuits: 3% maximum recommended</li>
          <li>Feeders: 3% maximum recommended</li>
          <li>Combined branch circuit + feeder: 5% maximum</li>
        </ul>
      </div>
    </div>
  );
}

export default VoltageDropCalculator;
