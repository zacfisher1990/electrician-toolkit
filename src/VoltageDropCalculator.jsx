import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { exportToPDF } from './pdfExport';

const VoltageDropCalculator = forwardRef(({ isDarkMode = false }, ref) => {
  const [voltage, setVoltage] = useState('');
  const [current, setCurrent] = useState('');
  const [distance, setDistance] = useState('');
  const [wireSize, setWireSize] = useState('12');
  const [phaseType, setPhaseType] = useState('single');
  const [conductorType, setConductorType] = useState('copper');
  const [powerFactor, setPowerFactor] = useState('1.0');

  // Dark mode colors
  const colors = {
    cardBg: isDarkMode ? '#374151' : '#ffffff',
    cardBorder: isDarkMode ? '#4b5563' : '#e5e7eb',
    cardText: isDarkMode ? '#f9fafb' : '#111827',
    labelText: isDarkMode ? '#d1d5db' : '#374151',
    inputBg: isDarkMode ? '#1f2937' : '#ffffff',
    inputBorder: isDarkMode ? '#4b5563' : '#d1d5db',
    sectionBg: isDarkMode ? '#1f2937' : '#f9fafb',
    subtleText: isDarkMode ? '#9ca3af' : '#6b7280'
  };

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

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      // Check if we have enough data to export
      if (!voltage || !current || !distance) {
        alert('Please enter all required values before exporting to PDF');
        return;
      }

      const pdfData = {
        calculatorName: 'Voltage Drop Calculator',
        inputs: {
          systemType: phaseType === 'single' ? 'Single Phase' : 'Three Phase',
          conductorMaterial: conductorType.charAt(0).toUpperCase() + conductorType.slice(1),
          systemVoltage: `${voltage} V`,
          loadCurrent: `${current} A`,
          oneWayDistance: `${distance} ft`,
          wireSize: wireSize.includes('/') ? `${wireSize} AWG` : `${wireSize} ${parseInt(wireSize) <= 4 ? 'AWG' : 'kcmil'}`,
          powerFactor: powerFactor
        },
        results: {
          voltageDrop: `${result.drop} V`,
          percentageDrop: `${result.percentage}%`,
          necCompliant: result.excessive ? 'NO - Exceeds 3% limit' : 'YES - Within 3% limit',
          status: result.excessive ? '⚠️ WARNING: Exceeds NEC 3% Limit' : '✓ Within NEC limits'
        },
        additionalInfo: {
          formula: phaseType === 'single' 
            ? '2 × K × I × L × PF ÷ CM'
            : '1.732 × K × I × L × PF ÷ CM',
          kConstant: `${kConstants[conductorType].ac} (${conductorType} AC)`,
          circularMils: circularMils[wireSize].toLocaleString(),
          powerFactorUsed: powerFactor,
          systemConfiguration: phaseType === 'single' ? 'Single phase' : 'Three phase'
        },
        necReferences: [
          'NEC Guidelines: Branch circuits - 3% max',
          'Feeders - 3% max',
          'Combined branch circuit and feeder - 5% max',
          'Note: Excessive voltage drop can cause equipment malfunction and reduced efficiency'
        ]
      };

      exportToPDF(pdfData);
    }
  }));

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header Card */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <TrendingDown size={24} color="#3b82f6" />
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: colors.cardText,
            margin: 0 
          }}>
            Voltage Drop Calculator
          </h2>
        </div>
        <p style={{ 
          fontSize: '0.875rem', 
          color: colors.labelText,
          margin: 0 
        }}>
          NEC approved calculation method
        </p>
      </div>

      {/* Input Card */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          fontSize: '1rem', 
          fontWeight: '600', 
          color: colors.cardText,
          marginTop: 0,
          marginBottom: '1rem',
          borderBottom: `1px solid ${colors.cardBorder}`,
          paddingBottom: '0.5rem'
        }}>
          Circuit Parameters
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText, 
              marginBottom: '0.5rem' 
            }}>
              System Type
            </label>
            <select 
              value={phaseType} 
              onChange={(e) => setPhaseType(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.625rem',
                fontSize: '0.9375rem',
                border: `1px solid ${colors.inputBorder}`, 
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.cardText,
                boxSizing: 'border-box'
              }}
            >
              <option value="single">Single Phase</option>
              <option value="three">Three Phase</option>
            </select>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText, 
              marginBottom: '0.5rem' 
            }}>
              Conductor Material
            </label>
            <select 
              value={conductorType} 
              onChange={(e) => setConductorType(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.625rem',
                fontSize: '0.9375rem',
                border: `1px solid ${colors.inputBorder}`, 
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.cardText,
                boxSizing: 'border-box'
              }}
            >
              <option value="copper">Copper</option>
              <option value="aluminum">Aluminum</option>
            </select>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText, 
              marginBottom: '0.5rem' 
            }}>
              System Voltage (V)
            </label>
            <input 
              type="number" 
              value={voltage} 
              onChange={(e) => setVoltage(e.target.value)}
              placeholder="120, 240, 480"
              style={{ 
                width: '100%', 
                padding: '0.625rem',
                fontSize: '0.9375rem',
                border: `1px solid ${colors.inputBorder}`, 
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.cardText,
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText, 
              marginBottom: '0.5rem' 
            }}>
              Load Current (Amps)
            </label>
            <input 
              type="number" 
              value={current} 
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="15, 20, 30"
              style={{ 
                width: '100%', 
                padding: '0.625rem',
                fontSize: '0.9375rem',
                border: `1px solid ${colors.inputBorder}`, 
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.cardText,
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText, 
              marginBottom: '0.5rem' 
            }}>
              One-Way Distance (feet)
            </label>
            <input 
              type="number" 
              value={distance} 
              onChange={(e) => setDistance(e.target.value)}
              placeholder="100, 200, 500"
              style={{ 
                width: '100%', 
                padding: '0.625rem',
                fontSize: '0.9375rem',
                border: `1px solid ${colors.inputBorder}`, 
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.cardText,
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText, 
              marginBottom: '0.5rem' 
            }}>
              Wire Size (AWG/kcmil)
            </label>
            <select 
              value={wireSize} 
              onChange={(e) => setWireSize(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.625rem',
                fontSize: '0.9375rem',
                border: `1px solid ${colors.inputBorder}`, 
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.cardText,
                boxSizing: 'border-box'
              }}
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
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText, 
              marginBottom: '0.5rem' 
            }}>
              Power Factor (AC loads)
            </label>
            <select 
              value={powerFactor} 
              onChange={(e) => setPowerFactor(e.target.value)}
              style={{ 
                width: '100%', 
                padding: '0.625rem',
                fontSize: '0.9375rem',
                border: `1px solid ${colors.inputBorder}`, 
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.cardText,
                boxSizing: 'border-box'
              }}
            >
              <option value="1.0">1.0 (Resistive loads)</option>
              <option value="0.9">0.9 (Most motors)</option>
              <option value="0.85">0.85 (Typical mixed load)</option>
              <option value="0.8">0.8 (Poor power factor)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Card */}
      {voltage && current && distance && (
        <div>
          <div style={{
            background: colors.cardBg,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '1rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ 
              fontSize: '1rem', 
              fontWeight: '600', 
              color: colors.cardText,
              marginTop: 0,
              marginBottom: '1rem'
            }}>
              Results
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Voltage Drop
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {result.drop}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  Volts
                </div>
              </div>
              
              <div style={{
                background: result.excessive ? '#fee2e2' : '#dbeafe',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: result.excessive ? '#991b1b' : '#1e40af', marginBottom: '0.25rem' }}>
                  Percentage Drop
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: result.excessive ? '#dc2626' : '#1e40af' }}>
                  {result.percentage}%
                </div>
                <div style={{ fontSize: '0.75rem', color: result.excessive ? '#991b1b' : '#1e40af', marginTop: '0.25rem' }}>
                  Max: 3%
                </div>
              </div>
            </div>

            <div style={{ 
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${colors.cardBorder}`
            }}>
              <strong style={{ color: colors.cardText, display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                Calculation Details:
              </strong>
              <div style={{ fontSize: '0.8125rem', color: colors.labelText, display: 'grid', gap: '0.25rem' }}>
                <div>Formula: {phaseType === 'single' ? '2' : '1.732'} × K × I × L × PF ÷ CM</div>
                <div>K constant ({conductorType}): {kConstants[conductorType].ac}</div>
                <div>Circular mils: {circularMils[wireSize].toLocaleString()}</div>
                <div>Power factor: {powerFactor}</div>
                <div>System: {phaseType === 'single' ? 'Single' : 'Three'} phase</div>
              </div>
            </div>
          </div>

          {/* Status Message */}
          {result.excessive ? (
            <div style={{
              background: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                <div style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: '1.5' }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>
                    WARNING: Exceeds NEC 3% Limit
                  </div>
                  <div style={{ fontSize: '0.8125rem' }}>
                    Consider using larger wire size to reduce voltage drop. Excessive voltage drop can cause equipment malfunction and reduced efficiency.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              background: '#d1fae5',
              border: '1px solid #6ee7b7',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                <CheckCircle size={20} color="#059669" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                <div style={{ fontSize: '0.875rem', color: '#047857', lineHeight: '1.5' }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    Voltage drop is within NEC limits
                  </div>
                  <div style={{ fontSize: '0.8125rem' }}>
                    This circuit meets the NEC recommended 3% maximum voltage drop for branch circuits.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* NEC Guidelines */}
      <div style={{
        background: colors.sectionBg,
        padding: '1rem',
        borderRadius: '8px',
        border: `1px solid ${colors.cardBorder}`,
        fontSize: '0.8125rem',
        color: colors.labelText
      }}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: colors.cardText }}>
          NEC Guidelines:
        </div>
        Branch circuits: 3% max • Feeders: 3% max • Combined: 5% max
      </div>
    </div>
  );
});

export default VoltageDropCalculator;