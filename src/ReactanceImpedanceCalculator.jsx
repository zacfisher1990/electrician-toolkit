import React, { useState } from 'react';
import { Waves, Info } from 'lucide-react';

function ReactanceImpedanceCalculator({ isDarkMode = false }) {
  const [activeTab, setActiveTab] = useState('inductive');

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

  // Inductive Reactance Calculator
  const InductiveReactance = () => {
    const [frequency, setFrequency] = useState('60');
    const [inductance, setInductance] = useState('');
    const [inductanceUnit, setInductanceUnit] = useState('mH');

    const calculateXL = () => {
      if (!frequency || !inductance) return null;
      
      const f = parseFloat(frequency);
      let L = parseFloat(inductance);
      
      // Convert to Henries
      if (inductanceUnit === 'mH') L = L / 1000;
      else if (inductanceUnit === 'μH') L = L / 1000000;
      
      const XL = 2 * Math.PI * f * L;
      
      return {
        reactance: XL.toFixed(2),
        frequency: f,
        inductance: inductance,
        unit: inductanceUnit
      };
    };

    const result = calculateXL();

    return (
      <div>
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
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText, 
                marginBottom: '0.5rem' 
              }}>
                Frequency (Hz)
              </label>
              <input 
                type="number" 
                value={frequency} 
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="60"
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
              <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>
                Common: 50 Hz or 60 Hz
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
                Inductance
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                <input 
                  type="number" 
                  value={inductance} 
                  onChange={(e) => setInductance(e.target.value)}
                  placeholder="Enter value"
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
                <select 
                  value={inductanceUnit} 
                  onChange={(e) => setInductanceUnit(e.target.value)}
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
                  <option value="H">H</option>
                  <option value="mH">mH</option>
                  <option value="μH">μH</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
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
              
              <div style={{
                background: '#dbeafe',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#1e40af', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Inductive Reactance (X<sub>L</sub>)
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e40af' }}>
                  {result.reactance}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#1e40af', marginTop: '0.25rem' }}>
                  Ohms (Ω)
                </div>
              </div>

              <div style={{ 
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                border: `1px solid ${colors.cardBorder}`
              }}>
                <div style={{ fontSize: '0.875rem', color: colors.labelText, marginBottom: '0.5rem' }}>
                  <strong style={{ color: colors.cardText }}>Circuit Values:</strong>
                </div>
                <div style={{ fontSize: '0.8125rem', color: colors.labelText, display: 'grid', gap: '0.25rem' }}>
                  <div>Frequency: {result.frequency} Hz</div>
                  <div>Inductance: {result.inductance} {result.unit}</div>
                  <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: colors.subtleText }}>
                    Formula: X<sub>L</sub> = 2πfL
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Capacitive Reactance Calculator
  const CapacitiveReactance = () => {
    const [frequency, setFrequency] = useState('60');
    const [capacitance, setCapacitance] = useState('');
    const [capacitanceUnit, setCapacitanceUnit] = useState('μF');

    const calculateXC = () => {
      if (!frequency || !capacitance) return null;
      
      const f = parseFloat(frequency);
      let C = parseFloat(capacitance);
      
      // Convert to Farads
      if (capacitanceUnit === 'μF') C = C / 1000000;
      else if (capacitanceUnit === 'nF') C = C / 1000000000;
      else if (capacitanceUnit === 'pF') C = C / 1000000000000;
      
      const XC = 1 / (2 * Math.PI * f * C);
      
      return {
        reactance: XC.toFixed(2),
        frequency: f,
        capacitance: capacitance,
        unit: capacitanceUnit
      };
    };

    const result = calculateXC();

    return (
      <div>
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
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText, 
                marginBottom: '0.5rem' 
              }}>
                Frequency (Hz)
              </label>
              <input 
                type="number" 
                value={frequency} 
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="60"
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
              <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>
                Common: 50 Hz or 60 Hz
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
                Capacitance
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                <input 
                  type="number" 
                  value={capacitance} 
                  onChange={(e) => setCapacitance(e.target.value)}
                  placeholder="Enter value"
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
                <select 
                  value={capacitanceUnit} 
                  onChange={(e) => setCapacitanceUnit(e.target.value)}
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
                  <option value="F">F</option>
                  <option value="μF">μF</option>
                  <option value="nF">nF</option>
                  <option value="pF">pF</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
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
              
              <div style={{
                background: '#dbeafe',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#1e40af', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Capacitive Reactance (X<sub>C</sub>)
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e40af' }}>
                  {result.reactance}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#1e40af', marginTop: '0.25rem' }}>
                  Ohms (Ω)
                </div>
              </div>

              <div style={{ 
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                border: `1px solid ${colors.cardBorder}`
              }}>
                <div style={{ fontSize: '0.875rem', color: colors.labelText, marginBottom: '0.5rem' }}>
                  <strong style={{ color: colors.cardText }}>Circuit Values:</strong>
                </div>
                <div style={{ fontSize: '0.8125rem', color: colors.labelText, display: 'grid', gap: '0.25rem' }}>
                  <div>Frequency: {result.frequency} Hz</div>
                  <div>Capacitance: {result.capacitance} {result.unit}</div>
                  <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: colors.subtleText }}>
                    Formula: X<sub>C</sub> = 1 / (2πfC)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Impedance Calculator
  const ImpedanceCalculator = () => {
    const [resistance, setResistance] = useState('');
    const [reactance, setReactance] = useState('');
    const [reactanceType, setReactanceType] = useState('inductive');

    const calculateImpedance = () => {
      if (!resistance || !reactance) return null;
      
      const R = parseFloat(resistance);
      const X = parseFloat(reactance);
      
      const Z = Math.sqrt(R * R + X * X);
      const angle = Math.atan2(X, R) * (180 / Math.PI);
      
      return {
        impedance: Z.toFixed(2),
        angle: angle.toFixed(2),
        resistance: R,
        reactance: X,
        type: reactanceType
      };
    };

    const result = calculateImpedance();

    return (
      <div>
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
          
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText, 
                marginBottom: '0.5rem' 
              }}>
                Reactance Type
              </label>
              <select 
                value={reactanceType} 
                onChange={(e) => setReactanceType(e.target.value)}
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
                <option value="inductive">Inductive (X<sub>L</sub>)</option>
                <option value="capacitive">Capacitive (X<sub>C</sub>)</option>
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
                Resistance (R) in Ohms
              </label>
              <input 
                type="number" 
                value={resistance} 
                onChange={(e) => setResistance(e.target.value)}
                placeholder="Enter resistance"
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
                Reactance (X) in Ohms
              </label>
              <input 
                type="number" 
                value={reactance} 
                onChange={(e) => setReactance(e.target.value)}
                placeholder="Enter reactance"
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
          </div>
        </div>

        {/* Results */}
        {result && (
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
                  background: '#dbeafe',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                    Impedance (Z)
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                    {result.impedance}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.25rem' }}>
                    Ohms (Ω)
                  </div>
                </div>
                
                <div style={{
                  background: colors.sectionBg,
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                    Phase Angle (θ)
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                    {result.angle}°
                  </div>
                  <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                    {reactanceType === 'inductive' ? 'Leading' : 'Lagging'}
                  </div>
                </div>
              </div>

              <div style={{ 
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                border: `1px solid ${colors.cardBorder}`
              }}>
                <div style={{ fontSize: '0.875rem', color: colors.labelText, marginBottom: '0.5rem' }}>
                  <strong style={{ color: colors.cardText }}>Circuit Values:</strong>
                </div>
                <div style={{ fontSize: '0.8125rem', color: colors.labelText, display: 'grid', gap: '0.25rem' }}>
                  <div>Resistance (R): {result.resistance} Ω</div>
                  <div>Reactance (X): {result.reactance} Ω ({result.type})</div>
                  <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: colors.subtleText }}>
                    Formula: Z = √(R² + X²)
                  </div>
                  <div style={{ fontStyle: 'italic', color: colors.subtleText }}>
                    Phase Angle: θ = arctan(X / R)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Resonant Frequency Calculator
  const ResonantFrequency = () => {
    const [inductance, setInductance] = useState('');
    const [inductanceUnit, setInductanceUnit] = useState('mH');
    const [capacitance, setCapacitance] = useState('');
    const [capacitanceUnit, setCapacitanceUnit] = useState('μF');

    const calculateResonance = () => {
      if (!inductance || !capacitance) return null;
      
      let L = parseFloat(inductance);
      let C = parseFloat(capacitance);
      
      // Convert to base units
      if (inductanceUnit === 'mH') L = L / 1000;
      else if (inductanceUnit === 'μH') L = L / 1000000;
      
      if (capacitanceUnit === 'μF') C = C / 1000000;
      else if (capacitanceUnit === 'nF') C = C / 1000000000;
      else if (capacitanceUnit === 'pF') C = C / 1000000000000;
      
      const fr = 1 / (2 * Math.PI * Math.sqrt(L * C));
      
      return {
        frequency: fr.toFixed(2),
        inductance: inductance,
        inductanceUnit: inductanceUnit,
        capacitance: capacitance,
        capacitanceUnit: capacitanceUnit
      };
    };

    const result = calculateResonance();

    return (
      <div>
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
            LC Circuit Parameters
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
                Inductance
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                <input 
                  type="number" 
                  value={inductance} 
                  onChange={(e) => setInductance(e.target.value)}
                  placeholder="Enter value"
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
                <select 
                  value={inductanceUnit} 
                  onChange={(e) => setInductanceUnit(e.target.value)}
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
                  <option value="H">H</option>
                  <option value="mH">mH</option>
                  <option value="μH">μH</option>
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
                Capacitance
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                <input 
                  type="number" 
                  value={capacitance} 
                  onChange={(e) => setCapacitance(e.target.value)}
                  placeholder="Enter value"
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
                <select 
                  value={capacitanceUnit} 
                  onChange={(e) => setCapacitanceUnit(e.target.value)}
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
                  <option value="F">F</option>
                  <option value="μF">μF</option>
                  <option value="nF">nF</option>
                  <option value="pF">pF</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
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
              
              <div style={{
                background: '#dbeafe',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#1e40af', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Resonant Frequency (f<sub>r</sub>)
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e40af' }}>
                  {result.frequency}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#1e40af', marginTop: '0.25rem' }}>
                  Hertz (Hz)
                </div>
              </div>

              <div style={{ 
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                border: `1px solid ${colors.cardBorder}`
              }}>
                <div style={{ fontSize: '0.875rem', color: colors.labelText, marginBottom: '0.5rem' }}>
                  <strong style={{ color: colors.cardText }}>Circuit Values:</strong>
                </div>
                <div style={{ fontSize: '0.8125rem', color: colors.labelText, display: 'grid', gap: '0.25rem' }}>
                  <div>Inductance: {result.inductance} {result.inductanceUnit}</div>
                  <div>Capacitance: {result.capacitance} {result.capacitanceUnit}</div>
                  <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: colors.subtleText }}>
                    Formula: f<sub>r</sub> = 1 / (2π√LC)
                  </div>
                </div>
              </div>
            </div>

            <div style={{
              background: '#dbeafe',
              border: '1px solid #3b82f6',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                <Info size={20} color="#1e40af" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                <div style={{ fontSize: '0.875rem', color: '#1e40af', lineHeight: '1.5' }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    About Resonant Frequency:
                  </div>
                  <div style={{ fontSize: '0.8125rem' }}>
                    At resonance, inductive and capacitive reactances are equal and opposite, resulting in minimum impedance in series circuits and maximum impedance in parallel circuits.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const tabComponents = {
    inductive: <InductiveReactance />,
    capacitive: <CapacitiveReactance />,
    impedance: <ImpedanceCalculator />,
    resonance: <ResonantFrequency />
  };

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
          <Waves size={24} color="#3b82f6" />
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: colors.cardText,
            margin: 0 
          }}>
            Reactance & Impedance Calculator
          </h2>
        </div>
        <p style={{ 
          fontSize: '0.875rem', 
          color: colors.labelText,
          margin: 0 
        }}>
          AC Circuit Analysis Tools
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => setActiveTab('inductive')}
            style={{
              flex: '1 1 auto',
              minWidth: '110px',
              padding: '0.75rem 1rem',
              background: activeTab === 'inductive' ? '#3b82f6' : 'transparent',
              color: activeTab === 'inductive' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'inductive' ? '#3b82f6' : colors.cardBorder}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Inductive (X<sub>L</sub>)
          </button>
          <button 
            onClick={() => setActiveTab('capacitive')}
            style={{
              flex: '1 1 auto',
              minWidth: '110px',
              padding: '0.75rem 1rem',
              background: activeTab === 'capacitive' ? '#3b82f6' : 'transparent',
              color: activeTab === 'capacitive' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'capacitive' ? '#3b82f6' : colors.cardBorder}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Capacitive (X<sub>C</sub>)
          </button>
          <button 
            onClick={() => setActiveTab('impedance')}
            style={{
              flex: '1 1 auto',
              minWidth: '110px',
              padding: '0.75rem 1rem',
              background: activeTab === 'impedance' ? '#3b82f6' : 'transparent',
              color: activeTab === 'impedance' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'impedance' ? '#3b82f6' : colors.cardBorder}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Impedance (Z)
          </button>
          <button 
            onClick={() => setActiveTab('resonance')}
            style={{
              flex: '1 1 auto',
              minWidth: '110px',
              padding: '0.75rem 1rem',
              background: activeTab === 'resonance' ? '#3b82f6' : 'transparent',
              color: activeTab === 'resonance' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'resonance' ? '#3b82f6' : colors.cardBorder}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Resonance
          </button>
        </div>
      </div>

      {/* Active Tab Content */}
      {tabComponents[activeTab]}

      {/* Reference Footer */}
      <div style={{
        background: colors.sectionBg,
        padding: '1rem',
        borderRadius: '8px',
        border: `1px solid ${colors.cardBorder}`,
        fontSize: '0.8125rem',
        color: colors.labelText
      }}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: colors.cardText }}>
          Key Concepts:
        </div>
        X<sub>L</sub> increases with frequency • X<sub>C</sub> decreases with frequency • At resonance X<sub>L</sub> = X<sub>C</sub> • Impedance combines resistance and reactance
      </div>
    </div>
  );
}

export default ReactanceImpedanceCalculator;