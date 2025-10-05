import React, { useState } from 'react';
import { TrendingDown, AlertTriangle } from 'lucide-react';

function VoltageDropCalculator() {
  const [voltage, setVoltage] = useState('');
  const [current, setCurrent] = useState('');
  const [distance, setDistance] = useState('');
  const [wireSize, setWireSize] = useState('12');
  const [phaseType, setPhaseType] = useState('single');
  const [conductorType, setConductorType] = useState('copper');
  const [powerFactor, setPowerFactor] = useState('1.0');

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
    if (!voltage || !current || !distance) return { drop: '0.00', percentage: '0.00', excessive: false };
    
    const V = parseFloat(voltage);
    const I = parseFloat(current);
    const L = parseFloat(distance);
    const CM = circularMils[wireSize];
    const PF = parseFloat(powerFactor);
    const K = kConstants[conductorType].ac;
    
    let voltageDrop;
    
    if (phaseType === 'single') {
      voltageDrop = (2 * K * I * L * PF) / CM;
    } else {
      voltageDrop = (1.732 * K * I * L * PF) / CM;
    }
    
    const percentage = (voltageDrop / V) * 100;
    const isExcessive = percentage > 3;
    
    return {
      drop: voltageDrop.toFixed(2),
      percentage: percentage.toFixed(2),
      excessive: isExcessive
    };
  };

  const result = calculateDrop();

  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto', background: '#ffffff', borderRadius: '0.5rem', overflow: 'hidden' }}>
      {/* Modern Header */}
      <div style={{ background: '#ffffff', color: '#111827', padding: '1rem 1.5rem', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <TrendingDown size={24} color="#3b82f6" />
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Voltage Drop Calculator</h1>
            <p style={{ fontSize: '0.8125rem', margin: 0, color: '#6b7280' }}>NEC approved calculation method</p>
          </div>
        </div>
      </div>

      <div style={{ background: '#f9fafb', padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              System Type
            </label>
            <select 
              value={phaseType} 
              onChange={(e) => setPhaseType(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem', background: 'white' }}
            >
              <option value="single">Single Phase</option>
              <option value="three">Three Phase</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Conductor Material
            </label>
            <select 
              value={conductorType} 
              onChange={(e) => setConductorType(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem', background: 'white' }}
            >
              <option value="copper">Copper</option>
              <option value="aluminum">Aluminum</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              System Voltage (V)
            </label>
            <input 
              type="number" 
              value={voltage} 
              onChange={(e) => setVoltage(e.target.value)}
              placeholder="120, 240, 480, etc."
              style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem', background: 'white' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Load Current (Amps)
            </label>
            <input 
              type="number" 
              value={current} 
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="15, 20, 30, etc."
              style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem', background: 'white' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              One-Way Distance (feet)
            </label>
            <input 
              type="number" 
              value={distance} 
              onChange={(e) => setDistance(e.target.value)}
              placeholder="100, 200, 500, etc."
              style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem', background: 'white' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Wire Size (AWG/kcmil)
            </label>
            <select 
              value={wireSize} 
              onChange={(e) => setWireSize(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem', background: 'white' }}
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

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Power Factor (for AC loads)
            </label>
            <select 
              value={powerFactor} 
              onChange={(e) => setPowerFactor(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', fontSize: '1rem', background: 'white' }}
            >
              <option value="1.0">1.0 (Resistive loads)</option>
              <option value="0.9">0.9 (Most motors)</option>
              <option value="0.85">0.85 (Typical mixed load)</option>
              <option value="0.8">0.8 (Poor power factor)</option>
            </select>
          </div>
        </div>

        {/* Results Box */}
        <div style={{ 
          background: result.excessive ? '#fef2f2' : '#f0fdf4', 
          border: `2px solid ${result.excessive ? '#dc2626' : '#22c55e'}`, 
          padding: '1.5rem', 
          borderRadius: '0.5rem'
        }}>
          <h3 style={{ fontWeight: 'bold', color: result.excessive ? '#991b1b' : '#166534', marginTop: 0, marginBottom: '1rem' }}>
            Results
          </h3>
          
          <div style={{ 
            fontWeight: 'bold',
            fontSize: '1.5rem',
            marginBottom: '1rem',
            color: result.excessive ? '#dc2626' : '#22c55e'
          }}>
            Voltage Drop: {result.drop}V ({result.percentage}%)
          </div>
          
          {result.excessive && (
            <div style={{ 
              color: '#dc2626', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              padding: '0.75rem',
              background: '#fee2e2',
              borderRadius: '0.375rem',
              border: '1px solid #fecaca'
            }}>
              <div style={{ fontSize: '1.125rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={20} />
                WARNING: Exceeds NEC 3% Limit
              </div>
              <div style={{ fontSize: '0.875rem', fontWeight: 'normal', marginTop: '0.5rem' }}>
                Consider using larger wire size to reduce voltage drop
              </div>
            </div>
          )}

          {!result.excessive && voltage && current && distance && (
            <div style={{ 
              color: '#22c55e', 
              marginBottom: '1rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              ✓ Voltage drop is within NEC recommended limits
            </div>
          )}

          <div style={{ 
            background: 'white', 
            padding: '1rem', 
            borderRadius: '0.375rem',
            marginTop: '1rem'
          }}>
            <strong style={{ color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Calculation Details:</strong>
            <div style={{ fontSize: '0.875rem', color: '#6b7280', display: 'grid', gap: '0.25rem' }}>
              <div>• Formula: {phaseType === 'single' ? '2' : '1.732'} × K × I × L × PF ÷ CM</div>
              <div>• K constant ({conductorType}): {kConstants[conductorType].ac}</div>
              <div>• Circular mils: {circularMils[wireSize].toLocaleString()}</div>
              <div>• Power factor: {powerFactor}</div>
              <div>• System: {phaseType === 'single' ? 'Single' : 'Three'} phase</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ background: '#f9fafb', color: '#6b7280', padding: '1rem 1.5rem', borderTop: '1px solid #e5e7eb', fontSize: '0.75rem' }}>
        <p style={{ fontWeight: '600', marginTop: 0, marginBottom: '0.5rem', color: '#374151' }}>NEC Guidelines:</p>
        <p style={{ margin: 0 }}>
          Branch circuits: 3% max • Feeders: 3% max • Combined: 5% max
        </p>
      </div>
    </div>
  );
}

export default VoltageDropCalculator;
