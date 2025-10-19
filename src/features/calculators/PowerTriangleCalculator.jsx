import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Triangle, Info, CheckCircle } from 'lucide-react';
import { exportToPDF } from '../../utils/pdfExport';
import styles from './Calculator.module.css';

const PowerTriangleCalculator = forwardRef(({ isDarkMode = false, onBack }, ref) => {
  const [calculationMode, setCalculationMode] = useState('from-kw-pf');
  const [kW, setKW] = useState('');
  const [kVAR, setKVAR] = useState('');
  const [kVA, setKVA] = useState('');
  const [powerFactor, setPowerFactor] = useState('');
  const [leadingLagging, setLeadingLagging] = useState('lagging');

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

  const calculatePowerTriangle = () => {
    let realPower = 0;
    let reactivePower = 0;
    let apparentPower = 0;
    let pf = 0;
    let angle = 0;

    switch (calculationMode) {
      case 'from-kw-pf':
        if (!kW || !powerFactor) return null;
        realPower = parseFloat(kW);
        pf = parseFloat(powerFactor);
        apparentPower = realPower / pf;
        angle = Math.acos(pf) * (180 / Math.PI);
        reactivePower = apparentPower * Math.sin(Math.acos(pf));
        if (leadingLagging === 'leading') reactivePower = -reactivePower;
        break;

      case 'from-kw-kvar':
        if (!kW || !kVAR) return null;
        realPower = parseFloat(kW);
        reactivePower = parseFloat(kVAR);
        if (leadingLagging === 'leading') reactivePower = -Math.abs(reactivePower);
        apparentPower = Math.sqrt(Math.pow(realPower, 2) + Math.pow(reactivePower, 2));
        pf = realPower / apparentPower;
        angle = Math.atan(Math.abs(reactivePower) / realPower) * (180 / Math.PI);
        break;

      case 'from-kva-pf':
        if (!kVA || !powerFactor) return null;
        apparentPower = parseFloat(kVA);
        pf = parseFloat(powerFactor);
        realPower = apparentPower * pf;
        angle = Math.acos(pf) * (180 / Math.PI);
        reactivePower = apparentPower * Math.sin(Math.acos(pf));
        if (leadingLagging === 'leading') reactivePower = -reactivePower;
        break;

      case 'from-kva-kw':
        if (!kVA || !kW) return null;
        apparentPower = parseFloat(kVA);
        realPower = parseFloat(kW);
        if (realPower > apparentPower) return null; // Invalid
        pf = realPower / apparentPower;
        angle = Math.acos(pf) * (180 / Math.PI);
        reactivePower = Math.sqrt(Math.pow(apparentPower, 2) - Math.pow(realPower, 2));
        if (leadingLagging === 'leading') reactivePower = -reactivePower;
        break;

      default:
        return null;
    }

    return {
      kW: realPower,
      kVAR: reactivePower,
      kVA: apparentPower,
      powerFactor: pf,
      angle: angle,
      isLeading: leadingLagging === 'leading'
    };
  };

  const results = calculatePowerTriangle();

  const getPowerFactorQuality = (pf) => {
    const absPF = Math.abs(pf);
    if (absPF >= 0.95) return { quality: 'Excellent', color: '#10b981', bg: '#d1fae5', border: '#6ee7b7' };
    if (absPF >= 0.90) return { quality: 'Good', color: '#3b82f6', bg: '#dbeafe', border: '#93c5fd' };
    if (absPF >= 0.85) return { quality: 'Fair', color: '#f59e0b', bg: '#fef3c7', border: '#fcd34d' };
    return { quality: 'Poor', color: '#ef4444', bg: '#fee2e2', border: '#fca5a5' };
  };

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      if (!results) {
        alert('Please enter values before exporting to PDF');
        return;
      }

      const pfQuality = getPowerFactorQuality(results.powerFactor);
      const modeName = {
        'from-kw-pf': 'Real Power (kW) and Power Factor',
        'from-kw-kvar': 'Real Power (kW) and Reactive Power (kVAR)',
        'from-kva-pf': 'Apparent Power (kVA) and Power Factor',
        'from-kva-kw': 'Apparent Power (kVA) and Real Power (kW)'
      };

      const pdfData = {
        calculatorName: 'Power Triangle Calculator',
        inputs: {
          calculationMode: modeName[calculationMode],
          ...(kW && { realPower: `${kW} kW` }),
          ...(kVAR && { reactivePower: `${kVAR} kVAR` }),
          ...(kVA && { apparentPower: `${kVA} kVA` }),
          ...(powerFactor && { powerFactor: powerFactor }),
          reactiveType: leadingLagging === 'leading' ? 'Leading (Capacitive)' : 'Lagging (Inductive)'
        },
        results: {
          realPower: `${results.kW.toFixed(2)} kW`,
          reactivePower: `${Math.abs(results.kVAR).toFixed(2)} kVAR (${results.isLeading ? 'Leading' : 'Lagging'})`,
          apparentPower: `${results.kVA.toFixed(2)} kVA`,
          powerFactor: `${results.powerFactor.toFixed(4)} ${results.isLeading ? '(Leading)' : '(Lagging)'}`,
          phaseAngle: `${results.angle.toFixed(2)}°`,
          powerFactorQuality: pfQuality.quality
        },
        additionalInfo: {
          powerTriangleRelationship: 'kVA² = kW² + kVAR²',
          powerFactorFormula: 'PF = kW ÷ kVA = cos(θ)',
          reactivePowerFormula: 'kVAR = kVA × sin(θ)',
          phaseAngleFormula: 'θ = arccos(PF)',
          leadingVsLagging: results.isLeading ? 
            'Leading PF: Current leads voltage (capacitive loads)' :
            'Lagging PF: Current lags voltage (inductive loads - most common)'
        },
        necReferences: [
          'Power Factor: Ratio of real power to apparent power',
          'Leading PF (capacitive): Synchronous motors, over-excited generators, capacitor banks',
          'Lagging PF (inductive): Most common - motors, transformers, inductive loads',
          'Poor power factor results in: Higher current draw, increased losses, utility penalties',
          'Power factor correction: Add capacitors for lagging PF, add inductors for leading PF',
          'Many utilities charge penalties for power factor below 0.90-0.95'
        ]
      };

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
            { value: 'from-kw-pf', label: 'From kW and Power Factor' },
            { value: 'from-kw-kvar', label: 'From kW and kVAR' },
            { value: 'from-kva-pf', label: 'From kVA and Power Factor' },
            { value: 'from-kva-kw', label: 'From kVA and kW' }
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          {(calculationMode === 'from-kw-pf' || calculationMode === 'from-kw-kvar' || calculationMode === 'from-kva-kw') && (
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText, 
                marginBottom: '0.5rem' 
              }}>
                Real Power <br/>(kW)
              </label>
              <input 
                type="number" 
                value={kW} 
                onChange={(e) => setKW(e.target.value)}
                placeholder="Enter kW"
                step="0.01"
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

          {calculationMode === 'from-kw-kvar' && (
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText, 
                marginBottom: '0.5rem' 
              }}>
                Reactive Power (kVAR)
              </label>
              <input 
                type="number" 
                value={kVAR} 
                onChange={(e) => setKVAR(e.target.value)}
                placeholder="Enter kVAR"
                step="0.01"
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

          {(calculationMode === 'from-kva-pf' || calculationMode === 'from-kva-kw') && (
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText, 
                marginBottom: '0.5rem' 
              }}>
                Apparent Power <br/> (kVA)
              </label>
              <input 
                type="number" 
                value={kVA} 
                onChange={(e) => setKVA(e.target.value)}
                placeholder="Enter kVA"
                step="0.01"
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

          {(calculationMode === 'from-kw-pf' || calculationMode === 'from-kva-pf') && (
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText, 
                marginBottom: '0.5rem' 
              }}>
                Power Factor <br/>  <br/>
              </label>
              <input 
                type="number" 
                value={powerFactor} 
                onChange={(e) => setPowerFactor(e.target.value)}
                placeholder="0.00 to 1.00"
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
          )}
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: colors.labelText, 
            marginBottom: '0.5rem' 
          }}>
            Reactive Power Type
          </label>
          <select 
            value={leadingLagging} 
            onChange={(e) => setLeadingLagging(e.target.value)}
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
            <option value="lagging">Lagging (Inductive - Most Common)</option>
            <option value="leading">Leading (Capacitive)</option>
          </select>
          <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>
            Inductive: Motors, transformers | Capacitive: Capacitor banks, lightly loaded cables
          </div>
        </div>
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
              Power Triangle Results
            </h3>

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
                  Reactive Power (kVAR)
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {Math.abs(results.kVAR).toFixed(2)}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  {results.isLeading ? 'Leading' : 'Lagging'}
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
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
              <div style={{
                background: getPowerFactorQuality(results.powerFactor).bg,
                border: `1px solid ${getPowerFactorQuality(results.powerFactor).border}`,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: getPowerFactorQuality(results.powerFactor).color, 
                  marginBottom: '0.25rem' 
                }}>
                  Power Factor
                </div>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700', 
                  color: getPowerFactorQuality(results.powerFactor).color 
                }}>
                  {results.powerFactor.toFixed(4)}
                </div>
                <div style={{ 
                  fontSize: '0.75rem', 
                  color: getPowerFactorQuality(results.powerFactor).color, 
                  marginTop: '0.25rem' 
                }}>
                  {getPowerFactorQuality(results.powerFactor).quality}
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
                  {results.angle.toFixed(2)}°
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  V-I Phase Shift
                </div>
              </div>
            </div>
          </div>

          {/* Power Factor Info */}
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
                  Power Triangle Relationships:
                </div>
                <div style={{ display: 'grid', gap: '0.25rem' }}>
                  <div>• kVA² = kW² + kVAR² (Pythagorean theorem)</div>
                  <div>• Power Factor = kW ÷ kVA = cos(θ)</div>
                  <div>• kVAR = kVA × sin(θ)</div>
                  <div>• {results.isLeading ? 
                    'Leading PF: Current leads voltage (capacitive loads)' : 
                    'Lagging PF: Current lags voltage (inductive loads - most common)'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Power Factor Quality Warning */}
          {results.powerFactor < 0.90 && (
            <div style={{
              background: '#fef3c7',
              border: '1px solid #fcd34d',
              borderRadius: '12px',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                <Info size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                <div style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: '1.5' }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                    Low Power Factor Alert
                  </div>
                  <div>
                    Power factor below 0.90 may result in utility penalties and increased energy costs. 
                    Consider power factor correction using {results.isLeading ? 'inductors (reactors)' : 'capacitor banks'} 
                    to improve efficiency and reduce demand charges.
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default PowerTriangleCalculator;