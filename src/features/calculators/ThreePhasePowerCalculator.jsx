import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Zap, Info, CheckCircle } from 'lucide-react';
import { exportToPDF } from '../../utils/pdfExport';
import styles from './Calculator.module.css';

const ThreePhasePowerCalculator = forwardRef(({ isDarkMode = false, onBack }, ref) => {
  const [calculationMode, setCalculationMode] = useState('find-power');
  const [voltage, setVoltage] = useState('480');
  const [current, setCurrent] = useState('');
  const [powerFactor, setPowerFactor] = useState('0.85');
  const [power, setPower] = useState('');
  const [configuration, setConfiguration] = useState('line-to-line');
  const [efficiency, setEfficiency] = useState('');

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

  const calculate3Phase = () => {
    const V = parseFloat(voltage);
    const I = parseFloat(current);
    const PF = parseFloat(powerFactor);
    const P = parseFloat(power);
    const eff = efficiency ? parseFloat(efficiency) / 100 : 1;

    if (calculationMode === 'find-power') {
      if (!voltage || !current || !powerFactor) return null;
      
      // P = √3 × V × I × PF
      const kW = (Math.sqrt(3) * V * I * PF) / 1000;
      const kVA = (Math.sqrt(3) * V * I) / 1000;
      const kVAR = Math.sqrt(Math.pow(kVA, 2) - Math.pow(kW, 2));
      
      return {
        kW: kW,
        kVA: kVA,
        kVAR: kVAR,
        current: I,
        voltage: V,
        powerFactor: PF,
        amps: I
      };
    } else if (calculationMode === 'find-current') {
      if (!voltage || !power || !powerFactor) return null;
      
      // I = P / (√3 × V × PF)
      const amps = (P * 1000) / (Math.sqrt(3) * V * PF);
      const kVA = (Math.sqrt(3) * V * amps) / 1000;
      const kVAR = Math.sqrt(Math.pow(kVA, 2) - Math.pow(P, 2));
      
      return {
        kW: P,
        kVA: kVA,
        kVAR: kVAR,
        current: amps,
        voltage: V,
        powerFactor: PF,
        amps: amps
      };
    } else if (calculationMode === 'motor-power') {
      if (!power || !efficiency) return null;
      
      // Input power = Output power / Efficiency
      const inputKW = P / eff;
      const outputHP = P * 1.341; // Convert kW to HP
      
      // Estimate current (need voltage and PF)
      let amps = 0;
      if (voltage && powerFactor) {
        amps = (inputKW * 1000) / (Math.sqrt(3) * V * PF);
      }
      
      return {
        inputKW: inputKW,
        outputKW: P,
        outputHP: outputHP,
        efficiency: eff * 100,
        amps: amps,
        voltage: V,
        powerFactor: PF
      };
    }
    
    return null;
  };

  const results = calculate3Phase();

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      if (!results) {
        alert('Please enter all required values before exporting to PDF');
        return;
      }

      const modeName = {
        'find-power': 'Calculate Power from Voltage & Current',
        'find-current': 'Calculate Current from Power & Voltage',
        'motor-power': 'Motor Power & Efficiency Calculation'
      };

      let pdfData;

      if (calculationMode === 'motor-power') {
        pdfData = {
          calculatorName: 'Three-Phase Power Calculator - Motor',
          inputs: {
            calculationMode: modeName[calculationMode],
            outputPower: `${power} kW`,
            efficiency: `${efficiency}%`,
            ...(voltage && { voltage: `${voltage}V (${configuration === 'line-to-line' ? 'Line-to-Line' : 'Line-to-Neutral'})` }),
            ...(powerFactor && { powerFactor: powerFactor })
          },
          results: {
            outputPower: `${results.outputKW.toFixed(2)} kW`,
            outputPowerHP: `${results.outputHP.toFixed(2)} HP`,
            inputPower: `${results.inputKW.toFixed(2)} kW`,
            efficiency: `${results.efficiency.toFixed(1)}%`,
            ...(results.amps > 0 && { estimatedCurrent: `${results.amps.toFixed(2)} A` })
          },
          additionalInfo: {
            formula: 'Input Power = Output Power ÷ Efficiency',
            hpConversion: '1 kW = 1.341 HP',
            note: efficiency ? `At ${efficiency}% efficiency, motor draws ${results.inputKW.toFixed(2)} kW to produce ${results.outputKW.toFixed(2)} kW output` : ''
          }
        };
      } else {
        pdfData = {
          calculatorName: 'Three-Phase Power Calculator',
          inputs: {
            calculationMode: modeName[calculationMode],
            voltage: `${voltage}V (${configuration === 'line-to-line' ? 'Line-to-Line' : 'Line-to-Neutral'})`,
            ...(current && { current: `${current} A` }),
            ...(power && { power: `${power} kW` }),
            powerFactor: powerFactor
          },
          results: {
            realPower: `${results.kW.toFixed(2)} kW`,
            apparentPower: `${results.kVA.toFixed(2)} kVA`,
            reactivePower: `${results.kVAR.toFixed(2)} kVAR`,
            current: `${results.amps.toFixed(2)} A`,
            voltage: `${results.voltage}V`,
            powerFactor: results.powerFactor
          },
          additionalInfo: {
            powerFormula: 'P = √3 × V × I × PF (kW)',
            apparentPowerFormula: 'S = √3 × V × I (kVA)',
            currentFormula: 'I = P / (√3 × V × PF)',
            sqrt3: '√3 = 1.732',
            configuration: configuration === 'line-to-line' ? 'Line-to-Line (most common)' : 'Line-to-Neutral',
            note: 'Three-phase systems are more efficient for power transmission and are standard in industrial applications'
          },
          necReferences: [
            'Three-phase power: P = √3 × VL-L × I × PF',
            'Line-to-Line voltage: Standard between any two phases',
            'Line-to-Neutral voltage: VL-N = VL-L ÷ √3',
            'Common voltages: 208V, 240V, 480V, 600V (North America)',
            'Three-phase systems provide constant power delivery',
            'More efficient than single-phase for large loads and motors'
          ]
        };
      }

      exportToPDF(pdfData);
    }
  }));

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Calculation Mode Selection */}
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
          Calculation Mode
        </h3>

        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {[
            { value: 'find-power', label: 'Find Power (from Voltage & Current)' },
            { value: 'find-current', label: 'Find Current (from Power & Voltage)' },
            { value: 'motor-power', label: 'Motor Power & Efficiency' }
          ].map(mode => (
            <label 
              key={mode.value}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem',
                background: calculationMode === mode.value ? colors.sectionBg : 'transparent',
                border: `1px solid ${calculationMode === mode.value ? '#3b82f6' : colors.cardBorder}`,
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                if (calculationMode !== mode.value) {
                  e.currentTarget.style.background = colors.sectionBg;
                }
              }}
              onMouseOut={(e) => {
                if (calculationMode !== mode.value) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <input
                type="radio"
                name="calculationMode"
                value={mode.value}
                checked={calculationMode === mode.value}
                onChange={(e) => setCalculationMode(e.target.value)}
                style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.cardText }}>
                {mode.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Input Fields */}
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
          Input Values
        </h3>

        {calculationMode === 'motor-power' ? (
          // Motor Power Mode
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText, 
                marginBottom: '0.5rem' 
              }}>
                Output Power (kW)
              </label>
              <input 
                type="number" 
                value={power} 
                onChange={(e) => setPower(e.target.value)}
                placeholder="Motor output power"
                step="0.1"
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
                Motor Efficiency (%)
              </label>
              <input 
                type="number" 
                value={efficiency} 
                onChange={(e) => setEfficiency(e.target.value)}
                placeholder="85-95% typical"
                step="0.1"
                min="0"
                max="100"
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
                Optional: For current calculation, enter voltage and PF below
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'end' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: colors.labelText, 
                  marginBottom: '0.5rem' 
                }}>
                  Voltage (V) - Optional
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
                  <option value="">Select</option>
                  <option value="208">208V</option>
                  <option value="240">240V</option>
                  <option value="380">380V</option>
                  <option value="400">400V</option>
                  <option value="415">415V</option>
                  <option value="480">480V</option>
                  <option value="600">600V</option>
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
                  Power Factor - Optional
                </label>
                <input 
                  type="number" 
                  value={powerFactor} 
                  onChange={(e) => setPowerFactor(e.target.value)}
                  placeholder="0.80-0.95"
                  step="0.01"
                  min="0"
                  max="1"
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
        ) : (
          // Power/Current Mode
          <div style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText, 
                marginBottom: '0.5rem' 
              }}>
                Voltage Configuration
              </label>
              <select 
                value={configuration} 
                onChange={(e) => setConfiguration(e.target.value)}
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
                <option value="line-to-line">Line-to-Line (Most Common)</option>
                <option value="line-to-neutral">Line-to-Neutral</option>
              </select>
              <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>
                Line-to-Line: Voltage between any two phases
              </div>
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
                  <option value="208">208V</option>
                  <option value="240">240V</option>
                  <option value="380">380V</option>
                  <option value="400">400V</option>
                  <option value="415">415V</option>
                  <option value="480">480V</option>
                  <option value="600">600V</option>
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
                  Power Factor
                </label>
                <input 
                  type="number" 
                  value={powerFactor} 
                  onChange={(e) => setPowerFactor(e.target.value)}
                  placeholder="0.80-0.95"
                  step="0.01"
                  min="0"
                  max="1"
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

            {calculationMode === 'find-power' && (
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: colors.labelText, 
                  marginBottom: '0.5rem' 
                }}>
                  Current (Amps)
                </label>
                <input 
                  type="number" 
                  value={current} 
                  onChange={(e) => setCurrent(e.target.value)}
                  placeholder="Line current"
                  step="0.1"
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
            )}

            {calculationMode === 'find-current' && (
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: colors.labelText, 
                  marginBottom: '0.5rem' 
                }}>
                  Power (kW)
                </label>
                <input 
                  type="number" 
                  value={power} 
                  onChange={(e) => setPower(e.target.value)}
                  placeholder="Real power"
                  step="0.1"
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
            )}
          </div>
        )}
      </div>

      {/* Results */}
      {results && (
        <>
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

            {calculationMode === 'motor-power' ? (
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div style={{
                    background: colors.sectionBg,
                    padding: '1rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                      Output Power
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                      {results.outputKW.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                      kW ({results.outputHP.toFixed(2)} HP)
                    </div>
                  </div>

                  <div style={{
                    background: '#dbeafe',
                    padding: '1rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                      Input Power Required
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                      {results.inputKW.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.25rem' }}>
                      kW @ {results.efficiency.toFixed(1)}% efficiency
                    </div>
                  </div>
                </div>

                {results.amps > 0 && (
                  <div style={{
                    background: colors.sectionBg,
                    padding: '1rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                      Estimated Current Draw
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                      {results.amps.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                      Amps @ {voltage}V, PF {powerFactor}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  background: colors.sectionBg,
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                    Real Power (kW)
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                    {results.kW.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                    Working Power
                  </div>
                </div>

                <div style={{
                  background: colors.sectionBg,
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                    Apparent Power (kVA)
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                    {results.kVA.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                    Total Power
                  </div>
                </div>

                <div style={{
                  background: '#dbeafe',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                    Current (A)
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                    {results.amps.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.25rem' }}>
                    Line Current
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Formula Info */}
          <div style={{
            background: colors.sectionBg,
            border: `1px solid ${colors.cardBorder}`,
            borderRadius: '12px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <Info size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.875rem', color: colors.labelText, lineHeight: '1.5' }}>
                <div style={{ fontWeight: '600', color: colors.cardText, marginBottom: '0.5rem' }}>
                  {calculationMode === 'motor-power' ? 'Motor Efficiency:' : 'Three-Phase Formulas:'}
                </div>
                <div style={{ display: 'grid', gap: '0.25rem' }}>
                  {calculationMode === 'motor-power' ? (
                    <>
                      <div>• Input Power = Output Power ÷ Efficiency</div>
                      <div>• 1 kW = 1.341 HP</div>
                      <div>• Typical motor efficiency: 85-95%</div>
                      <div>• Higher efficiency motors use less power</div>
                    </>
                  ) : (
                    <>
                      <div>• P (kW) = √3 × V × I × PF ÷ 1000</div>
                      <div>• S (kVA) = √3 × V × I ÷ 1000</div>
                      <div>• I (A) = P × 1000 ÷ (√3 × V × PF)</div>
                      <div>• √3 = 1.732 (constant for 3-phase)</div>
                      <div>• {configuration === 'line-to-line' ? 'Using Line-to-Line voltage' : 'Using Line-to-Neutral voltage'}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div style={{
            background: '#d1fae5',
            border: '1px solid #6ee7b7',
            borderRadius: '12px',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <CheckCircle size={20} color="#059669" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.875rem', color: '#047857', lineHeight: '1.5' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                  Three-Phase Advantages:
                </div>
                <div style={{ display: 'grid', gap: '0.25rem' }}>
                  <div>• Delivers constant, smooth power (no pulsation)</div>
                  <div>• More efficient for high-power applications</div>
                  <div>• Smaller conductor sizes for same power</div>
                  <div>• Standard for industrial and commercial buildings</div>
                  <div>• Required for large motors and heavy equipment</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
});

export default ThreePhasePowerCalculator;