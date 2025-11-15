import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Zap, Info, CheckCircle, Calculator, Settings, Gauge } from 'lucide-react';
import { exportToPDF } from '../../../utils/pdfExport';
import CalculatorLayout, { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox,
  TabGroup
} from './CalculatorLayout';

const ThreePhasePowerCalculator = forwardRef(({ isDarkMode = false, onBack }, ref) => {
  const [calculationMode, setCalculationMode] = useState('find-power');
  const [voltage, setVoltage] = useState('480');
  const [current, setCurrent] = useState('');
  const [powerFactor, setPowerFactor] = useState('0.85');
  const [power, setPower] = useState('');
  const [configuration, setConfiguration] = useState('line-to-line');
  const [efficiency, setEfficiency] = useState('');

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

  // Calculation mode tabs
  const modeTabs = [
    { id: 'find-power', label: 'Find Power', icon: Zap },
    { id: 'find-current', label: 'Find Current', icon: Gauge },
    { id: 'motor-power', label: 'Motor', icon: Settings }
  ];

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
    <div style={{ margin: '0 -1rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        {/* Calculation Mode Selection */}
        <Section 
          title="Calculation Mode" 
          icon={Calculator} 
          color="#3b82f6" 
          isDarkMode={isDarkMode}
        >
          <TabGroup
            tabs={modeTabs}
            activeTab={calculationMode}
            onChange={setCalculationMode}
            isDarkMode={isDarkMode}
          />
        </Section>

        {/* Input Fields */}
        <Section 
          title="Input Values" 
          icon={Zap} 
          color="#f59e0b" 
          isDarkMode={isDarkMode}
        >
          {calculationMode === 'motor-power' ? (
            // Motor Power Mode
            <>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '0.75rem' 
              }}>
                <InputGroup label="Output Power" isDarkMode={isDarkMode}>
                  <Input
                    type="number"
                    value={power}
                    onChange={(e) => setPower(e.target.value)}
                    placeholder="Motor output"
                    step="0.1"
                    isDarkMode={isDarkMode}
                    unit="kW"
                  />
                </InputGroup>

                <InputGroup label="Motor Efficiency" isDarkMode={isDarkMode}>
                  <Input
                    type="number"
                    value={efficiency}
                    onChange={(e) => setEfficiency(e.target.value)}
                    placeholder="85-95% typical"
                    step="0.1"
                    min="0"
                    max="100"
                    isDarkMode={isDarkMode}
                    unit="%"
                  />
                </InputGroup>
              </div>

              <InfoBox type="info" isDarkMode={isDarkMode}>
                <div style={{ fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                  Optional: For current calculation
                </div>
                <div style={{ fontSize: '0.75rem' }}>
                  Enter voltage and power factor below to estimate current draw
                </div>
              </InfoBox>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '0.75rem',
                marginTop: '0.75rem'
              }}>
                <InputGroup label="Voltage (Optional)" isDarkMode={isDarkMode}>
                  <Select
                    value={voltage}
                    onChange={(e) => setVoltage(e.target.value)}
                    isDarkMode={isDarkMode}
                    options={[
                      { value: '', label: 'Select' },
                      { value: '208', label: '208V' },
                      { value: '240', label: '240V' },
                      { value: '380', label: '380V' },
                      { value: '400', label: '400V' },
                      { value: '415', label: '415V' },
                      { value: '480', label: '480V' },
                      { value: '600', label: '600V' }
                    ]}
                  />
                </InputGroup>

                <InputGroup label="Power Factor (Optional)" isDarkMode={isDarkMode}>
                  <Input
                    type="number"
                    value={powerFactor}
                    onChange={(e) => setPowerFactor(e.target.value)}
                    placeholder="0.80-0.95"
                    step="0.01"
                    min="0"
                    max="1"
                    isDarkMode={isDarkMode}
                  />
                </InputGroup>
              </div>
            </>
          ) : (
            // Power/Current Mode
            <>
              <InputGroup 
                label="Voltage Configuration" 
                isDarkMode={isDarkMode}
                helpText="Line-to-Line: Voltage between any two phases"
              >
                <Select
                  value={configuration}
                  onChange={(e) => setConfiguration(e.target.value)}
                  isDarkMode={isDarkMode}
                  options={[
                    { value: 'line-to-line', label: 'Line-to-Line (Most Common)' },
                    { value: 'line-to-neutral', label: 'Line-to-Neutral' }
                  ]}
                />
              </InputGroup>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                gap: '0.75rem' 
              }}>
                <InputGroup label="Voltage" isDarkMode={isDarkMode}>
                  <Select
                    value={voltage}
                    onChange={(e) => setVoltage(e.target.value)}
                    isDarkMode={isDarkMode}
                    options={[
                      { value: '208', label: '208V' },
                      { value: '240', label: '240V' },
                      { value: '380', label: '380V' },
                      { value: '400', label: '400V' },
                      { value: '415', label: '415V' },
                      { value: '480', label: '480V' },
                      { value: '600', label: '600V' }
                    ]}
                  />
                </InputGroup>

                <InputGroup label="Power Factor" isDarkMode={isDarkMode}>
                  <Input
                    type="number"
                    value={powerFactor}
                    onChange={(e) => setPowerFactor(e.target.value)}
                    placeholder="0.80-0.95"
                    step="0.01"
                    min="0"
                    max="1"
                    isDarkMode={isDarkMode}
                  />
                </InputGroup>

                {calculationMode === 'find-power' && (
                  <InputGroup label="Current" isDarkMode={isDarkMode}>
                    <Input
                      type="number"
                      value={current}
                      onChange={(e) => setCurrent(e.target.value)}
                      placeholder="Line current"
                      step="0.1"
                      isDarkMode={isDarkMode}
                      unit="A"
                    />
                  </InputGroup>
                )}

                {calculationMode === 'find-current' && (
                  <InputGroup label="Power" isDarkMode={isDarkMode}>
                    <Input
                      type="number"
                      value={power}
                      onChange={(e) => setPower(e.target.value)}
                      placeholder="Real power"
                      step="0.1"
                      isDarkMode={isDarkMode}
                      unit="kW"
                    />
                  </InputGroup>
                )}
              </div>
            </>
          )}
        </Section>

        {/* Results */}
        {results && (
          <Section isDarkMode={isDarkMode}>
            {calculationMode === 'motor-power' ? (
              <>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                  gap: '0.75rem', 
                  marginBottom: '0.75rem' 
                }}>
                  <ResultCard
                    label="Output Power"
                    value={results.outputKW.toFixed(2)}
                    unit={`kW (${results.outputHP.toFixed(2)} HP)`}
                    color="#10b981"
                    variant="prominent"
                    isDarkMode={isDarkMode}
                  />
                  
                  <ResultCard
                    label="Input Power Required"
                    value={results.inputKW.toFixed(2)}
                    unit={`kW @ ${results.efficiency.toFixed(1)}% eff`}
                    color="#3b82f6"
                    variant="prominent"
                    isDarkMode={isDarkMode}
                  />
                  
                  {results.amps > 0 && (
                    <ResultCard
                      label="Estimated Current"
                      value={results.amps.toFixed(2)}
                      unit={`A @ ${voltage}V, PF ${powerFactor}`}
                      color="#f59e0b"
                      variant="prominent"
                      isDarkMode={isDarkMode}
                    />
                  )}
                </div>

                <InfoBox type="info" icon={Info} isDarkMode={isDarkMode} title="Motor Efficiency">
                  <div style={{ fontSize: '0.8125rem' }}>
                    <div>• Input Power = Output Power ÷ Efficiency</div>
                    <div>• 1 kW = 1.341 HP</div>
                    <div>• Typical motor efficiency: 85-95%</div>
                    <div>• Higher efficiency motors use less power</div>
                  </div>
                </InfoBox>
              </>
            ) : (
              <>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                  gap: '0.75rem', 
                  marginBottom: '0.75rem' 
                }}>
                  <ResultCard
                    label="Real Power"
                    value={results.kW.toFixed(2)}
                    unit="kW (Working)"
                    color="#10b981"
                    variant="prominent"
                    isDarkMode={isDarkMode}
                  />
                  
                  <ResultCard
                    label="Apparent Power"
                    value={results.kVA.toFixed(2)}
                    unit="kVA (Total)"
                    color="#8b5cf6"
                    variant="prominent"
                    isDarkMode={isDarkMode}
                  />
                  
                  <ResultCard
                    label="Line Current"
                    value={results.amps.toFixed(2)}
                    unit="Amps"
                    color="#3b82f6"
                    variant="prominent"
                    isDarkMode={isDarkMode}
                  />
                </div>

                <InfoBox type="info" icon={Info} isDarkMode={isDarkMode} title="Three-Phase Formulas">
                  <div style={{ fontSize: '0.8125rem' }}>
                    <div>• P (kW) = √3 × V × I × PF ÷ 1000</div>
                    <div>• S (kVA) = √3 × V × I ÷ 1000</div>
                    <div>• I (A) = P × 1000 ÷ (√3 × V × PF)</div>
                    <div>• √3 = 1.732 (constant for 3-phase)</div>
                    <div>• {configuration === 'line-to-line' ? 'Using Line-to-Line voltage' : 'Using Line-to-Neutral voltage'}</div>
                  </div>
                </InfoBox>
              </>
            )}

            <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode} title="Three-Phase Advantages">
              <div style={{ fontSize: '0.8125rem' }}>
                <div>• Delivers constant, smooth power (no pulsation)</div>
                <div>• More efficient for high-power applications</div>
                <div>• Smaller conductor sizes for same power</div>
                <div>• Standard for industrial and commercial buildings</div>
                <div>• Required for large motors and heavy equipment</div>
              </div>
            </InfoBox>
          </Section>
        )}
      </CalculatorLayout>
    </div>
  );
});

export default ThreePhasePowerCalculator;