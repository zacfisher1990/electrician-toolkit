import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Triangle, Info, CheckCircle, AlertTriangle, Zap, Calculator } from 'lucide-react';
import { exportToPDF } from '../../../utils/pdfExport';
import CalculatorLayout, { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox
} from './CalculatorLayout';
import { getColors } from '../../../theme';

const PowerTriangleCalculator = forwardRef(({ isDarkMode = false, onBack }, ref) => {
  const [calculationMode, setCalculationMode] = useState('from-kw-pf');
  const [kW, setKW] = useState('');
  const [kVAR, setKVAR] = useState('');
  const [kVA, setKVA] = useState('');
  const [powerFactor, setPowerFactor] = useState('');
  const [leadingLagging, setLeadingLagging] = useState('lagging');

  const colors = getColors(isDarkMode);

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
    if (absPF >= 0.95) return { quality: 'Excellent', color: '#10b981' };
    if (absPF >= 0.90) return { quality: 'Good', color: '#3b82f6' };
    if (absPF >= 0.85) return { quality: 'Fair', color: '#f59e0b' };
    return { quality: 'Poor', color: '#ef4444' };
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

  const calculationModes = [
    { value: 'from-kw-pf', label: 'From kW and Power Factor' },
    { value: 'from-kw-kvar', label: 'From kW and kVAR' },
    { value: 'from-kva-pf', label: 'From kVA and Power Factor' },
    { value: 'from-kva-kw', label: 'From kVA and kW' }
  ];

  return (
    <div style={{ margin: '0 -1rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        {/* Calculation Mode Selection */}
        <Section 
          title="Calculation Mode" 
          icon={Calculator} 
          color="#3b82f6" 
          isDarkMode={isDarkMode}
        >
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {calculationModes.map(mode => (
              <label 
                key={mode.value}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  background: calculationMode === mode.value ? colors.inputBg : 'transparent',
                  border: `1px solid ${calculationMode === mode.value ? '#3b82f6' : colors.border}`,
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
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
                <span style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.text }}>
                  {mode.label}
                </span>
              </label>
            ))}
          </div>
        </Section>

        {/* Input Values */}
        <Section 
          title="Input Values" 
          icon={Zap} 
          color="#10b981" 
          isDarkMode={isDarkMode}
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            {(calculationMode === 'from-kw-pf' || calculationMode === 'from-kw-kvar' || calculationMode === 'from-kva-kw') && (
              <InputGroup label="Real Power (kW)" isDarkMode={isDarkMode}>
                <Input 
                  type="number" 
                  value={kW} 
                  onChange={(e) => setKW(e.target.value)}
                  placeholder="Enter kW"
                  step="0.01"
                  isDarkMode={isDarkMode}
                />
              </InputGroup>
            )}

            {calculationMode === 'from-kw-kvar' && (
              <InputGroup label="Reactive Power (kVAR)" isDarkMode={isDarkMode}>
                <Input 
                  type="number" 
                  value={kVAR} 
                  onChange={(e) => setKVAR(e.target.value)}
                  placeholder="Enter kVAR"
                  step="0.01"
                  isDarkMode={isDarkMode}
                />
              </InputGroup>
            )}

            {(calculationMode === 'from-kva-pf' || calculationMode === 'from-kva-kw') && (
              <InputGroup label="Apparent Power (kVA)" isDarkMode={isDarkMode}>
                <Input 
                  type="number" 
                  value={kVA} 
                  onChange={(e) => setKVA(e.target.value)}
                  placeholder="Enter kVA"
                  step="0.01"
                  isDarkMode={isDarkMode}
                />
              </InputGroup>
            )}

            {(calculationMode === 'from-kw-pf' || calculationMode === 'from-kva-pf') && (
              <InputGroup label="Power Factor" isDarkMode={isDarkMode}>
                <Input 
                  type="number" 
                  value={powerFactor} 
                  onChange={(e) => setPowerFactor(e.target.value)}
                  placeholder="0.00 to 1.00"
                  step="0.01"
                  min="0"
                  max="1"
                  isDarkMode={isDarkMode}
                />
              </InputGroup>
            )}
          </div>

          <InputGroup 
            label="Reactive Power Type" 
            helpText="Inductive: Motors, transformers | Capacitive: Capacitor banks, lightly loaded cables"
            isDarkMode={isDarkMode}
          >
            <Select 
              value={leadingLagging} 
              onChange={(e) => setLeadingLagging(e.target.value)}
              isDarkMode={isDarkMode}
              options={[
                { value: 'lagging', label: 'Lagging (Inductive - Most Common)' },
                { value: 'leading', label: 'Leading (Capacitive)' }
              ]}
            />
          </InputGroup>
        </Section>

        {/* Results */}
        {results && (
          <>
            <Section 
              title="Power Triangle Results" 
              icon={Triangle} 
              color="#f59e0b" 
              isDarkMode={isDarkMode}
            >
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                gap: '0.75rem',
                marginBottom: '0.75rem'
              }}>
                <ResultCard
                  label="REAL POWER (kW)"
                  value={results.kW.toFixed(2)}
                  unit="Working Power"
                  variant="subtle"
                  isDarkMode={isDarkMode}
                />
                <ResultCard
                  label="REACTIVE POWER (kVAR)"
                  value={Math.abs(results.kVAR).toFixed(2)}
                  unit={results.isLeading ? 'Leading' : 'Lagging'}
                  variant="subtle"
                  isDarkMode={isDarkMode}
                />
                <ResultCard
                  label="APPARENT POWER (kVA)"
                  value={results.kVA.toFixed(2)}
                  unit="Total Power"
                  variant="subtle"
                  isDarkMode={isDarkMode}
                />
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                gap: '0.75rem'
              }}>
                <ResultCard
                  label="POWER FACTOR"
                  value={results.powerFactor.toFixed(4)}
                  unit={getPowerFactorQuality(results.powerFactor).quality}
                  color={getPowerFactorQuality(results.powerFactor).color}
                  isDarkMode={isDarkMode}
                />
                <ResultCard
                  label="PHASE ANGLE (θ)"
                  value={`${results.angle.toFixed(2)}°`}
                  unit="V-I Phase Shift"
                  variant="subtle"
                  isDarkMode={isDarkMode}
                />
              </div>
            </Section>

            {/* Power Factor Info */}
            <InfoBox type="info" icon={Info} isDarkMode={isDarkMode} title="Power Triangle Relationships">
              <div style={{ fontSize: '0.8125rem' }}>
                <div style={{ marginBottom: '0.25rem' }}>• kVA² = kW² + kVAR² (Pythagorean theorem)</div>
                <div style={{ marginBottom: '0.25rem' }}>• Power Factor = kW ÷ kVA = cos(θ)</div>
                <div style={{ marginBottom: '0.25rem' }}>• kVAR = kVA × sin(θ)</div>
                <div>• {results.isLeading ? 
                  'Leading PF: Current leads voltage (capacitive loads)' : 
                  'Lagging PF: Current lags voltage (inductive loads - most common)'}
                </div>
              </div>
            </InfoBox>

            {/* Power Factor Quality Warning */}
            {results.powerFactor < 0.90 && (
              <InfoBox type="warning" icon={AlertTriangle} isDarkMode={isDarkMode} title="Low Power Factor Alert">
                <div style={{ fontSize: '0.8125rem' }}>
                  Power factor below 0.90 may result in utility penalties and increased energy costs. 
                  Consider power factor correction using {results.isLeading ? 'inductors (reactors)' : 'capacitor banks'} 
                  to improve efficiency and reduce demand charges.
                </div>
              </InfoBox>
            )}
          </>
        )}
      </CalculatorLayout>
    </div>
  );
});

export default PowerTriangleCalculator;