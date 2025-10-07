import React, { useState } from 'react';
import { Settings, AlertCircle, CheckCircle } from 'lucide-react';

export default function VFDSizingCalculator({ isDarkMode, onBack }) {
  const [motorHP, setMotorHP] = useState('');
  const [voltage, setVoltage] = useState('460');
  const [phases, setPhases] = useState('3');
  const [dutyCycle, setDutyCycle] = useState('normal');
  const [altitude, setAltitude] = useState('0');
  const [ambientTemp, setAmbientTemp] = useState('40');
  const [loadType, setLoadType] = useState('variable');

  // Dark mode colors - matching ConduitFillCalculator
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

  // Calculate motor FLA based on HP and voltage
  const calculateMotorFLA = (hp, volts, ph) => {
    if (!hp || !volts) return 0;
    
    const hpNum = parseFloat(hp);
    const voltNum = parseFloat(volts);
    
    // Approximate FLA calculations
    if (ph === '3') {
      // Three phase: HP * 746 / (V * 1.732 * 0.85 efficiency * 0.9 PF)
      return (hpNum * 746) / (voltNum * 1.732 * 0.85 * 0.9);
    } else {
      // Single phase: HP * 746 / (V * 0.85 efficiency * 0.9 PF)
      return (hpNum * 746) / (voltNum * 0.85 * 0.9);
    }
  };

  const motorFLA = calculateMotorFLA(motorHP, voltage, phases);

  // Calculate derating factors
  const getAltitudeDeratingFactor = (alt) => {
    const altNum = parseFloat(alt);
    if (altNum <= 3300) return 1.0;
    if (altNum <= 5000) return 0.95;
    if (altNum <= 6600) return 0.90;
    if (altNum <= 8200) return 0.85;
    return 0.80;
  };

  const getTempDeratingFactor = (temp) => {
    const tempNum = parseFloat(temp);
    if (tempNum <= 40) return 1.0;
    if (tempNum <= 45) return 0.97;
    if (tempNum <= 50) return 0.94;
    return 0.91;
  };

  const getDutyCycleFactor = (duty) => {
    switch(duty) {
      case 'heavy': return 1.25;
      case 'normal': return 1.15;
      case 'light': return 1.10;
      default: return 1.15;
    }
  };

  const altitudeFactor = getAltitudeDeratingFactor(altitude);
  const tempFactor = getTempDeratingFactor(ambientTemp);
  const dutyCycleFactor = getDutyCycleFactor(dutyCycle);

  // Calculate required VFD current
  const requiredVFDCurrent = motorFLA * dutyCycleFactor / (altitudeFactor * tempFactor);

  // Standard VFD sizes (amperage ratings)
  const standardVFDSizes = [
    { amps: 2, hp460V: 1, hp230V: 0.5 },
    { amps: 3, hp460V: 1.5, hp230V: 1 },
    { amps: 5, hp460V: 2, hp230V: 1.5 },
    { amps: 7, hp460V: 3, hp230V: 2 },
    { amps: 10, hp460V: 5, hp230V: 3 },
    { amps: 14, hp460V: 7.5, hp230V: 5 },
    { amps: 18, hp460V: 10, hp230V: 7.5 },
    { amps: 24, hp460V: 15, hp230V: 10 },
    { amps: 31, hp460V: 20, hp230V: 15 },
    { amps: 40, hp460V: 25, hp230V: 20 },
    { amps: 52, hp460V: 30, hp230V: 25 },
    { amps: 62, hp460V: 40, hp230V: 30 },
    { amps: 77, hp460V: 50, hp230V: 40 },
    { amps: 96, hp460V: 60, hp230V: 50 },
    { amps: 124, hp460V: 75, hp230V: 60 },
    { amps: 156, hp460V: 100, hp230V: 75 },
    { amps: 180, hp460V: 125, hp230V: 100 },
    { amps: 240, hp460V: 150, hp230V: 125 },
    { amps: 302, hp460V: 200, hp230V: 150 },
  ];

  // Find recommended VFD size
  const recommendedVFD = standardVFDSizes.find(vfd => vfd.amps >= requiredVFDCurrent);

  const hasWarnings = altitudeFactor < 1.0 || tempFactor < 1.0 || dutyCycle === 'heavy';

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
          <Settings size={24} color="#3b82f6" />
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: colors.cardText,
            margin: 0 
          }}>
            VFD Sizing Calculator
          </h2>
        </div>
        <p style={{ 
          fontSize: '0.875rem', 
          color: colors.labelText,
          margin: 0 
        }}>
          Variable Frequency Drive Selection Tool
        </p>
      </div>

      {/* Motor Information */}
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
          Motor Information
        </h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText,
              marginBottom: '0.5rem' 
            }}>
              Motor Horsepower (HP)
            </label>
            <input
              type="number"
              value={motorHP}
              onChange={(e) => setMotorHP(e.target.value)}
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
              placeholder="Enter HP"
              step="0.5"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText,
                marginBottom: '0.5rem' 
              }}>
                Voltage (V)
              </label>
              <select
                value={voltage}
                onChange={(e) => setVoltage(e.target.value)}
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
                <option value="230">230V</option>
                <option value="460">460V</option>
                <option value="575">575V</option>
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
                Phases
              </label>
              <select
                value={phases}
                onChange={(e) => setPhases(e.target.value)}
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
                <option value="1">Single Phase</option>
                <option value="3">Three Phase</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText,
              marginBottom: '0.5rem' 
            }}>
              Load Type
            </label>
            <select
              value={loadType}
              onChange={(e) => setLoadType(e.target.value)}
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
              <option value="variable">Variable Torque (Fans, Pumps)</option>
              <option value="constant">Constant Torque (Conveyors)</option>
              <option value="highTorque">High Starting Torque</option>
            </select>
          </div>
        </div>
      </div>

      {/* Environmental Conditions */}
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
          Environmental Conditions
        </h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText,
              marginBottom: '0.5rem' 
            }}>
              Duty Cycle
            </label>
            <select
              value={dutyCycle}
              onChange={(e) => setDutyCycle(e.target.value)}
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
              <option value="light">Light Duty (Intermittent)</option>
              <option value="normal">Normal Duty</option>
              <option value="heavy">Heavy Duty (Continuous)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText,
                marginBottom: '0.5rem' 
              }}>
                Altitude (feet)
              </label>
              <input
                type="number"
                value={altitude}
                onChange={(e) => setAltitude(e.target.value)}
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
                placeholder="0"
                step="100"
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
                Ambient Temp (°C)
              </label>
              <input
                type="number"
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(e.target.value)}
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
                placeholder="40"
              />
            </div>
          </div>

          <div style={{
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            border: `1px solid ${colors.cardBorder}`
          }}>
            <h4 style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: colors.cardText,
              marginTop: 0,
              marginBottom: '0.75rem'
            }}>
              Derating Factors
            </h4>
            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem', color: colors.labelText }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Altitude Factor:</span>
                <span style={{ fontWeight: '600', color: colors.cardText }}>
                  {(altitudeFactor * 100).toFixed(0)}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Temperature Factor:</span>
                <span style={{ fontWeight: '600', color: colors.cardText }}>
                  {(tempFactor * 100).toFixed(0)}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Duty Cycle Factor:</span>
                <span style={{ fontWeight: '600', color: colors.cardText }}>
                  {(dutyCycleFactor * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {motorHP && (
        <div>
          {/* Calculation Results */}
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
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Motor FLA
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {motorFLA.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  Amperes
                </div>
              </div>
              
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Required VFD Current
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {requiredVFDCurrent.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  Amperes
                </div>
              </div>
              
              <div style={{
                background: '#dbeafe',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                  Recommended VFD
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                  {recommendedVFD ? recommendedVFD.amps : 'N/A'}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.25rem' }}>
                  Amperes
                </div>
              </div>
            </div>

            {recommendedVFD && (
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                border: `1px solid ${colors.cardBorder}`
              }}>
                <h4 style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '600', 
                  color: colors.cardText,
                  marginTop: 0,
                  marginBottom: '0.75rem'
                }}>
                  VFD Specifications
                </h4>
                <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem', color: colors.labelText }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Current Rating:</span>
                    <span style={{ fontWeight: '600', color: colors.cardText }}>
                      {recommendedVFD.amps} Amperes
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Motor HP (460V):</span>
                    <span style={{ fontWeight: '600', color: colors.cardText }}>
                      {recommendedVFD.hp460V} HP
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Motor HP (230V):</span>
                    <span style={{ fontWeight: '600', color: colors.cardText }}>
                      {recommendedVFD.hp230V} HP
                    </span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    paddingTop: '0.5rem',
                    borderTop: `1px solid ${colors.cardBorder}`,
                    marginTop: '0.25rem'
                  }}>
                    <span>Safety Margin:</span>
                    <span style={{ fontWeight: '600', color: '#059669' }}>
                      {((recommendedVFD.amps / requiredVFDCurrent - 1) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Success Message */}
          {recommendedVFD && !hasWarnings && (
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
                    VFD Selection Complete
                  </div>
                  <div style={{ fontSize: '0.8125rem' }}>
                    Selected VFD meets all requirements with adequate safety margin for reliable operation.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Warnings */}
          {hasWarnings && (
            <div style={{
              background: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                <AlertCircle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                <div style={{ lineHeight: '1.5' }}>
                  <div style={{ 
                    fontSize: '0.9375rem', 
                    fontWeight: '600', 
                    color: '#78350f',
                    marginBottom: '0.5rem'
                  }}>
                    Important Considerations
                  </div>
                  <ul style={{ 
                    fontSize: '0.8125rem', 
                    color: '#92400e',
                    margin: 0,
                    paddingLeft: '1.25rem'
                  }}>
                    {altitudeFactor < 1.0 && (
                      <li style={{ marginBottom: '0.25rem' }}>
                        High altitude installation requires derating ({(altitudeFactor * 100).toFixed(0)}% of rated capacity)
                      </li>
                    )}
                    {tempFactor < 1.0 && (
                      <li style={{ marginBottom: '0.25rem' }}>
                        High ambient temperature requires derating ({(tempFactor * 100).toFixed(0)}% of rated capacity)
                      </li>
                    )}
                    {dutyCycle === 'heavy' && (
                      <li style={{ marginBottom: '0.25rem' }}>
                        Heavy duty cycle applications require oversizing for continuous operation
                      </li>
                    )}
                    <li style={{ marginBottom: '0.25rem' }}>Verify VFD voltage matches motor nameplate voltage</li>
                    <li style={{ marginBottom: '0.25rem' }}>Consider harmonic filtering for sensitive equipment</li>
                    <li>Ensure adequate cooling and ventilation</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Installation Notes */}
      <div style={{
        background: colors.sectionBg,
        padding: '1rem',
        borderRadius: '8px',
        border: `1px solid ${colors.cardBorder}`,
        fontSize: '0.8125rem',
        color: colors.labelText
      }}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: colors.cardText }}>
          VFD Installation Notes:
        </div>
        Always follow manufacturer specifications • Use shielded cables for motor connections • Install line and load reactors when recommended • Ensure proper grounding and bonding • Consider bypass contactor for critical applications
      </div>
    </div>
  );
}