import React, { useState } from 'react';
import { TrendingDown, ArrowLeft, AlertTriangle } from 'lucide-react';

function VoltageDropCalculator({ onBack }) {
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
    <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
      <div style={{ background: '#fbbf24', color: 'black', padding: '1.5rem', borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <TrendingDown size={32} />
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Voltage Drop Calculator</h1>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>Calculate voltage drop using NEC approved methods</p>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              System Type
            </label>
            <select 
              value={phaseType} 
              onChange={(e) => setPhaseType(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
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
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
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
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
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
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
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
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Wire Size (AWG/kcmil)
            </label>
            <select 
              value={wireSize} 
              onChange={(e) => setWireSize(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
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
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            >
              <option value="1.0">1.0 (Resistive loads)</option>
              <option value="0.9">0.9 (Most motors)</option>
              <option value="0.85">0.85 (Typical mixed load)</option>
              <option value="0.8">0.8 (Poor power factor)</option>
            </select>
          </div>
        </div>

        <div style={{ 
          background: result.excessive ? '#fef2f2' : '#dcfce7', 
          border: `2px solid ${result.excessive ? '#dc2626' : '#16a34a'}`, 
          padding: '1.5rem', 
          borderRadius: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: result.excessive ? '#991b1b' : '#166534', marginBottom: '1rem' }}>
            Voltage Drop: {result.drop}V ({result.percentage}%)
          </div>
          
          {result.excessive && (
            <div style={{ 
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.5rem',
              background: '#fee2e2',
              padding: '1rem',
              borderRadius: '0.25rem',
              border: '1px solid #fecaca',
              marginBottom: '1rem'
            }}>
              <AlertTriangle size={20} style={{ color: '#dc2626', flexShrink: 0, marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.875rem', color: '#991b1b' }}>
                <strong>WARNING:</strong> Voltage drop exceeds NEC recommended 3% limit! Consider using larger wire size.
              </div>
            </div>
          )}

          <div style={{ 
            fontSize: '0.875rem', 
            color: result.excessive ? '#7f1d1d' : '#14532d',
            borderTop: `1px solid ${result.excessive ? '#fecaca' : '#bbf7d0'}`,
            paddingTop: '1rem'
          }}>
            <strong>Calculation Details:</strong>
            <div style={{ marginTop: '0.5rem', display: 'grid', gap: '0.25rem' }}>
              <div>• Formula: {phaseType === 'single' ? '2' : '1.732'} × K × I × L × PF ÷ CM</div>
              <div>• K constant ({conductorType}): {kConstants[conductorType].ac}</div>
              <div>• Circular mils: {circularMils[wireSize].toLocaleString()}</div>
              <div>• Power factor: {powerFactor}</div>
              <div>• System: {phaseType === 'single' ? 'Single' : 'Three'} phase</div>
            </div>
          </div>
        </div>

        <div style={{ 
          background: '#f8fafc',
          border: '2px solid #e2e8f0',
          borderRadius: '0.5rem',
          padding: '1rem'
        }}>
          <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '0.5rem' }}>NEC Guidelines:</div>
          <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', color: '#475569', fontSize: '0.875rem' }}>
            <li>Branch circuits: 3% maximum recommended</li>
            <li>Feeders: 3% maximum recommended</li>
            <li>Combined branch circuit + feeder: 5% maximum</li>
          </ul>
        </div>
      </div>

      <div style={{ background: '#1e293b', color: '#cbd5e1', padding: '1.5rem', borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem', fontSize: '0.875rem' }}>
        <p style={{ fontWeight: '600', marginTop: 0, marginBottom: '0.5rem' }}>Notes:</p>
        <p style={{ margin: 0 }}>
          This calculator uses the K constant method as recommended by the NEC. 
          Always verify calculations against local codes and consult a licensed electrician for final decisions.
        </p>
      </div>
    </div>
  );
}

export default VoltageDropCalculator;
