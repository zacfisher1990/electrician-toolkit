import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Waves, Info } from 'lucide-react';
import { exportToPDF } from './pdfExport';

const ReactanceImpedanceCalculator = forwardRef(({ isDarkMode = false }, ref) => {
  const [activeTab, setActiveTab] = useState('inductive');

  // Inductive Reactance State
  const [inductiveFrequency, setInductiveFrequency] = useState('60');
  const [inductance, setInductance] = useState('');
  const [inductanceUnit, setInductanceUnit] = useState('mH');

  // Capacitive Reactance State
  const [capacitiveFrequency, setCapacitiveFrequency] = useState('60');
  const [capacitance, setCapacitance] = useState('');
  const [capacitanceUnit, setCapacitanceUnit] = useState('μF');

  // Impedance Calculator State
  const [resistance, setResistance] = useState('');
  const [reactance, setReactance] = useState('');
  const [reactanceType, setReactanceType] = useState('inductive');

  // Resonant Frequency State
  const [resonantInductance, setResonantInductance] = useState('');
  const [resonantInductanceUnit, setResonantInductanceUnit] = useState('mH');
  const [resonantCapacitance, setResonantCapacitance] = useState('');
  const [resonantCapacitanceUnit, setResonantCapacitanceUnit] = useState('μF');

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

  // Inductive Reactance Calculation
  const calculateXL = () => {
    if (!inductiveFrequency || !inductance) return null;
    
    const f = parseFloat(inductiveFrequency);
    let L = parseFloat(inductance);
    
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

  // Capacitive Reactance Calculation
  const calculateXC = () => {
    if (!capacitiveFrequency || !capacitance) return null;
    
    const f = parseFloat(capacitiveFrequency);
    let C = parseFloat(capacitance);
    
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

  // Impedance Calculation
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

  // Resonant Frequency Calculation
  const calculateResonance = () => {
    if (!resonantInductance || !resonantCapacitance) return null;
    
    let L = parseFloat(resonantInductance);
    let C = parseFloat(resonantCapacitance);
    
    if (resonantInductanceUnit === 'mH') L = L / 1000;
    else if (resonantInductanceUnit === 'μH') L = L / 1000000;
    
    if (resonantCapacitanceUnit === 'μF') C = C / 1000000;
    else if (resonantCapacitanceUnit === 'nF') C = C / 1000000000;
    else if (resonantCapacitanceUnit === 'pF') C = C / 1000000000000;
    
    const fr = 1 / (2 * Math.PI * Math.sqrt(L * C));
    
    return {
      frequency: fr.toFixed(2),
      inductance: resonantInductance,
      inductanceUnit: resonantInductanceUnit,
      capacitance: resonantCapacitance,
      capacitanceUnit: resonantCapacitanceUnit
    };
  };

  const inductiveResult = calculateXL();
  const capacitiveResult = calculateXC();
  const impedanceResult = calculateImpedance();
  const resonanceResult = calculateResonance();

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      if (activeTab === 'inductive') {
        if (!inductiveFrequency || !inductance) {
          alert('Please enter all required values before exporting to PDF');
          return;
        }

        const pdfData = {
          calculatorName: 'Reactance & Impedance - Inductive Reactance (XL)',
          inputs: {
            'Frequency': `${inductiveFrequency} Hz`,
            'Inductance': `${inductance} ${inductanceUnit}`
          },
          results: {
            'Inductive Reactance (XL)': `${inductiveResult.reactance} Ω`
          },
          additionalInfo: {
            'Formula': 'XL = 2πfL',
            'Description': 'Inductive reactance increases with frequency and opposes changes in current flow'
          },
          necReferences: [
            'Inductive reactance is directly proportional to frequency',
            'In AC circuits, inductors oppose current changes',
            'XL increases linearly with both frequency and inductance'
          ]
        };

        exportToPDF(pdfData);

      } else if (activeTab === 'capacitive') {
        if (!capacitiveFrequency || !capacitance) {
          alert('Please enter all required values before exporting to PDF');
          return;
        }

        const pdfData = {
          calculatorName: 'Reactance & Impedance - Capacitive Reactance (XC)',
          inputs: {
            'Frequency': `${capacitiveFrequency} Hz`,
            'Capacitance': `${capacitance} ${capacitanceUnit}`
          },
          results: {
            'Capacitive Reactance (XC)': `${capacitiveResult.reactance} Ω`
          },
          additionalInfo: {
            'Formula': 'XC = 1 / (2πfC)',
            'Description': 'Capacitive reactance decreases with frequency and opposes changes in voltage'
          },
          necReferences: [
            'Capacitive reactance is inversely proportional to frequency',
            'In AC circuits, capacitors oppose voltage changes',
            'XC decreases as frequency or capacitance increases'
          ]
        };

        exportToPDF(pdfData);

      } else if (activeTab === 'impedance') {
        if (!resistance || !reactance) {
          alert('Please enter all required values before exporting to PDF');
          return;
        }

        const pdfData = {
          calculatorName: 'Reactance & Impedance - Impedance Calculator',
          inputs: {
            'Reactance Type': reactanceType.charAt(0).toUpperCase() + reactanceType.slice(1),
            'Resistance (R)': `${resistance} Ω`,
            'Reactance (X)': `${reactance} Ω`
          },
          results: {
            'Impedance (Z)': `${impedanceResult.impedance} Ω`,
            'Phase Angle (θ)': `${impedanceResult.angle}°`,
            'Phase Relationship': reactanceType === 'inductive' ? 'Leading' : 'Lagging'
          },
          additionalInfo: {
            'Impedance Formula': 'Z = √(R² + X²)',
            'Phase Angle Formula': 'θ = arctan(X / R)',
            'Description': 'Impedance is the total opposition to current flow in an AC circuit, combining resistance and reactance'
          },
          necReferences: [
            'Impedance combines resistive and reactive components',
            'Phase angle indicates the relationship between voltage and current',
            'In inductive circuits, current lags voltage; in capacitive circuits, current leads voltage'
          ]
        };

        exportToPDF(pdfData);

      } else if (activeTab === 'resonance') {
        if (!resonantInductance || !resonantCapacitance) {
          alert('Please enter all required values before exporting to PDF');
          return;
        }

        const pdfData = {
          calculatorName: 'Reactance & Impedance - Resonant Frequency',
          inputs: {
            'Inductance': `${resonantInductance} ${resonantInductanceUnit}`,
            'Capacitance': `${resonantCapacitance} ${resonantCapacitanceUnit}`
          },
          results: {
            'Resonant Frequency (fr)': `${resonanceResult.frequency} Hz`
          },
          additionalInfo: {
            'Formula': 'fr = 1 / (2π√LC)',
            'At Resonance': 'Inductive and capacitive reactances are equal and opposite (XL = XC)',
            'Series Circuit': 'Minimum impedance at resonance',
            'Parallel Circuit': 'Maximum impedance at resonance'
          },
          necReferences: [
            'Resonance occurs when XL = XC',
            'At resonant frequency, circuit is purely resistive',
            'Series resonant circuits have minimum impedance',
            'Parallel resonant circuits have maximum impedance'
          ]
        };

        exportToPDF(pdfData);
      }
    }
  }));

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      

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
      {activeTab === 'inductive' && (
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
                  value={inductiveFrequency} 
                  onChange={(e) => setInductiveFrequency(e.target.value)}
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
          {inductiveResult && (
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
                    {inductiveResult.reactance}
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
                    <div>Frequency: {inductiveResult.frequency} Hz</div>
                    <div>Inductance: {inductiveResult.inductance} {inductiveResult.unit}</div>
                    <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: colors.subtleText }}>
                      Formula: X<sub>L</sub> = 2πfL
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'capacitive' && (
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
                  value={capacitiveFrequency} 
                  onChange={(e) => setCapacitiveFrequency(e.target.value)}
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
          {capacitiveResult && (
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
                    {capacitiveResult.reactance}
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
                    <div>Frequency: {capacitiveResult.frequency} Hz</div>
                    <div>Capacitance: {capacitiveResult.capacitance} {capacitiveResult.unit}</div>
                    <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: colors.subtleText }}>
                      Formula: X<sub>C</sub> = 1 / (2πfC)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'impedance' && (
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
          {impedanceResult && (
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
                      {impedanceResult.impedance}
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
                      {impedanceResult.angle}°
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
                    <div>Resistance (R): {impedanceResult.resistance} Ω</div>
                    <div>Reactance (X): {impedanceResult.reactance} Ω ({impedanceResult.type})</div>
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
      )}

      {activeTab === 'resonance' && (
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
                    value={resonantInductance} 
                    onChange={(e) => setResonantInductance(e.target.value)}
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
                    value={resonantInductanceUnit} 
                    onChange={(e) => setResonantInductanceUnit(e.target.value)}
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
                    value={resonantCapacitance} 
                    onChange={(e) => setResonantCapacitance(e.target.value)}
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
                    value={resonantCapacitanceUnit} 
                    onChange={(e) => setResonantCapacitanceUnit(e.target.value)}
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
          {resonanceResult && (
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
                    {resonanceResult.frequency}
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
                    <div>Inductance: {resonanceResult.inductance} {resonanceResult.inductanceUnit}</div>
                    <div>Capacitance: {resonanceResult.capacitance} {resonanceResult.capacitanceUnit}</div>
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
      )}

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
});

export default ReactanceImpedanceCalculator;