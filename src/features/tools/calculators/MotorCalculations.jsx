import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Settings, CheckCircle, AlertTriangle, Zap, Shield, Cable } from 'lucide-react';
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

// Motor Full Load Current Calculator Component
const MotorFLCCalculator = ({ flcData, setFlcData, isDarkMode }) => {
  const necFLCTable = {
    single: {
      115: { 0.25: 4.4, 0.33: 5.8, 0.5: 7.2, 0.75: 9.8, 1: 13.8, 1.5: 20, 2: 24, 3: 34, 5: 56 },
      230: { 0.25: 2.2, 0.33: 2.9, 0.5: 3.6, 0.75: 4.9, 1: 6.9, 1.5: 10, 2: 12, 3: 17, 5: 28 }
    },
    three: {
      230: { 0.5: 2.0, 0.75: 2.8, 1: 3.6, 1.5: 5.2, 2: 6.8, 3: 9.6, 5: 15.2, 7.5: 22, 10: 28, 15: 42, 20: 54, 25: 68, 30: 80, 40: 104, 50: 130, 60: 154, 75: 192, 100: 248, 125: 312, 150: 360, 200: 480 },
      460: { 0.5: 1.0, 0.75: 1.4, 1: 1.8, 1.5: 2.6, 2: 3.4, 3: 4.8, 5: 7.6, 7.5: 11, 10: 14, 15: 21, 20: 27, 25: 34, 30: 40, 40: 52, 50: 65, 60: 77, 75: 96, 100: 124, 125: 156, 150: 180, 200: 240 },
      575: { 0.5: 0.8, 0.75: 1.1, 1: 1.4, 1.5: 2.1, 2: 2.7, 3: 3.9, 5: 6.1, 7.5: 9, 10: 11, 15: 17, 20: 22, 25: 27, 30: 32, 40: 41, 50: 52, 60: 62, 75: 77, 100: 99, 125: 125, 150: 144, 200: 192 },
      2300: { 250: 65, 300: 77, 350: 90, 400: 103, 450: 116, 500: 129 },
      4000: { 500: 74, 600: 88, 700: 103, 800: 118, 900: 132, 1000: 147 }
    }
  };

  const calculateFLC = () => {
    const hp = parseFloat(flcData.horsepower);
    const volt = parseInt(flcData.voltage);
    
    if (necFLCTable[flcData.phase] && necFLCTable[flcData.phase][volt] && necFLCTable[flcData.phase][volt][hp]) {
      return necFLCTable[flcData.phase][volt][hp];
    }
    
    const eff = parseFloat(flcData.efficiency);
    const pf = parseFloat(flcData.powerFactor);
    
    if (flcData.phase === 'single') {
      return (hp * 746) / (volt * eff * pf);
    } else {
      return (hp * 746) / (1.732 * volt * eff * pf);
    }
  };

  const flc = calculateFLC();
  const isNECValue = necFLCTable[flcData.phase]?.[parseInt(flcData.voltage)]?.[parseFloat(flcData.horsepower)];

  return (
    <>
      <Section title="Motor Parameters" icon={Settings} color="#3b82f6" isDarkMode={isDarkMode}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <InputGroup label="Motor Horsepower" isDarkMode={isDarkMode}>
            <Select 
              value={flcData.horsepower} 
              onChange={(e) => setFlcData({...flcData, horsepower: e.target.value})}
              isDarkMode={isDarkMode}
              options={[
                { value: '', label: 'Select HP' },
                { value: '0.25', label: '1/4 HP' },
                { value: '0.33', label: '1/3 HP' },
                { value: '0.5', label: '1/2 HP' },
                { value: '0.75', label: '3/4 HP' },
                { value: '1', label: '1 HP' },
                { value: '1.5', label: '1.5 HP' },
                { value: '2', label: '2 HP' },
                { value: '3', label: '3 HP' },
                { value: '5', label: '5 HP' },
                { value: '7.5', label: '7.5 HP' },
                { value: '10', label: '10 HP' },
                { value: '15', label: '15 HP' },
                { value: '20', label: '20 HP' },
                { value: '25', label: '25 HP' },
                { value: '30', label: '30 HP' },
                { value: '40', label: '40 HP' },
                { value: '50', label: '50 HP' },
                { value: '75', label: '75 HP' },
                { value: '100', label: '100 HP' }
              ]}
            />
          </InputGroup>

          <InputGroup label="Voltage" isDarkMode={isDarkMode}>
            <Select 
              value={flcData.voltage} 
              onChange={(e) => setFlcData({...flcData, voltage: e.target.value})}
              isDarkMode={isDarkMode}
              options={[
                { value: '115', label: '115V' },
                { value: '230', label: '230V' },
                { value: '460', label: '460V' },
                { value: '480', label: '480V' },
                { value: '575', label: '575V' },
                { value: '2300', label: '2300V' },
                { value: '4000', label: '4000V' }
              ]}
            />
          </InputGroup>

          <InputGroup label="Phase" isDarkMode={isDarkMode}>
            <Select 
              value={flcData.phase} 
              onChange={(e) => setFlcData({...flcData, phase: e.target.value})}
              isDarkMode={isDarkMode}
              options={[
                { value: 'single', label: 'Single Phase' },
                { value: 'three', label: 'Three Phase' }
              ]}
            />
          </InputGroup>
        </div>

        {flcData.horsepower && !isNECValue && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
            <InputGroup label="Motor Efficiency" isDarkMode={isDarkMode}>
              <Select 
                value={flcData.efficiency} 
                onChange={(e) => setFlcData({...flcData, efficiency: e.target.value})}
                isDarkMode={isDarkMode}
                options={[
                  { value: '0.8', label: '80% (Standard)' },
                  { value: '0.85', label: '85% (High Efficiency)' },
                  { value: '0.9', label: '90% (Premium)' },
                  { value: '0.95', label: '95% (Super Premium)' }
                ]}
              />
            </InputGroup>

            <InputGroup label="Power Factor" isDarkMode={isDarkMode}>
              <Select 
                value={flcData.powerFactor} 
                onChange={(e) => setFlcData({...flcData, powerFactor: e.target.value})}
                isDarkMode={isDarkMode}
                options={[
                  { value: '0.8', label: '0.80' },
                  { value: '0.85', label: '0.85' },
                  { value: '0.9', label: '0.90' }
                ]}
              />
            </InputGroup>
          </div>
        )}
      </Section>

      {flcData.horsepower && (
        <Section isDarkMode={isDarkMode}>
          <ResultCard
            label="Full Load Current"
            value={flc.toFixed(1)}
            unit="Amperes"
            color="#3b82f6"
            variant="prominent"
            isDarkMode={isDarkMode}
          />

          {isNECValue ? (
            <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                NEC Table Value
              </div>
              <div style={{ fontSize: '0.8125rem' }}>
                This value is from NEC Table 430.248 (Single Phase) or 430.250 (Three Phase)
              </div>
            </InfoBox>
          ) : (
            <InfoBox type="warning" icon={AlertTriangle} isDarkMode={isDarkMode}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                Calculated Value
              </div>
              <div style={{ fontSize: '0.8125rem' }}>
                This combination is not in NEC tables. Value calculated using: I = (HP × 746) ÷ (V × Eff × PF)
              </div>
            </InfoBox>
          )}
        </Section>
      )}
    </>
  );
};

// Motor Protection Calculator Component
const MotorProtectionCalculator = ({ protectionData, setProtectionData, isDarkMode }) => {
  const protectionTypes = {
    'non-time-delay': { name: 'Non-Time Delay Fuse', percentage: 300 },
    'dual-element': { name: 'Dual Element (Time-Delay) Fuse', percentage: 175 },
    'instantaneous-trip': { name: 'Instantaneous Trip Breaker', percentage: 800 },
    'inverse-time': { name: 'Inverse Time Breaker', percentage: 250 }
  };

  const standardSizes = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200, 225, 250, 300, 350, 400, 450, 500, 600, 700, 800, 1000, 1200, 1600, 2000, 2500, 3000, 4000, 5000, 6000];

  const calculateProtection = () => {
    const current = parseFloat(protectionData.flc) || 0;
    const percentage = protectionTypes[protectionData.protectionType].percentage;
    const maxRating = (current * percentage) / 100;
    const nextSize = standardSizes.find(size => size >= maxRating) || Math.ceil(maxRating);
    
    return { maxRating, nextSize, percentage };
  };

  const protection = calculateProtection();

  return (
    <>
      <Section title="Motor Information" icon={Shield} color="#f59e0b" isDarkMode={isDarkMode}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <InputGroup label="Motor FLC (Amps)" isDarkMode={isDarkMode}>
            <Input 
              type="number" 
              value={protectionData.flc} 
              onChange={(e) => setProtectionData({...protectionData, flc: e.target.value})}
              placeholder="From FLC calculator"
              isDarkMode={isDarkMode}
              unit="A"
            />
          </InputGroup>

          <InputGroup label="Protection Type" isDarkMode={isDarkMode}>
            <Select 
              value={protectionData.protectionType} 
              onChange={(e) => setProtectionData({...protectionData, protectionType: e.target.value})}
              isDarkMode={isDarkMode}
              options={Object.entries(protectionTypes).map(([value, type]) => ({
                value,
                label: `${type.name} (${type.percentage}%)`
              }))}
            />
          </InputGroup>
        </div>
      </Section>

      {protectionData.flc && (
        <Section isDarkMode={isDarkMode}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <ResultCard
              label="Maximum Rating"
              value={protection.maxRating.toFixed(1)}
              unit="Amperes"
              color="#6b7280"
              variant="subtle"
              isDarkMode={isDarkMode}
            />
            
            <ResultCard
              label="Standard OCPD Size"
              value={protection.nextSize}
              unit="Amperes"
              color="#f59e0b"
              variant="prominent"
              isDarkMode={isDarkMode}
            />
          </div>

          <InfoBox type="info" isDarkMode={isDarkMode} title="Calculation">
            <div style={{ fontSize: '0.8125rem' }}>
              Maximum = {protectionData.flc}A × {protection.percentage}% = {protection.maxRating.toFixed(1)}A<br />
              Next standard OCPD size: {protection.nextSize}A
            </div>
          </InfoBox>

          <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              NEC Table 430.52 Compliant
            </div>
            <div style={{ fontSize: '0.8125rem' }}>
              Maximum rating for {protectionTypes[protectionData.protectionType].name}: {protection.percentage}% of FLC
            </div>
          </InfoBox>
        </Section>
      )}
    </>
  );
};

// Motor Wire Sizing Calculator Component
const MotorWireSizeCalculator = ({ wireSizeData, setWireSizeData, isDarkMode }) => {
  const ampacityTable = {
    '60C': {
      '14': 15, '12': 20, '10': 30, '8': 40, '6': 55, '4': 70, '3': 85,
      '2': 95, '1': 110, '1/0': 125, '2/0': 145, '3/0': 165, '4/0': 195,
      '250': 215, '300': 240, '350': 260, '400': 280, '500': 320,
      '600': 355, '700': 385, '750': 400
    },
    '75C': {
      '14': 20, '12': 25, '10': 35, '8': 50, '6': 65, '4': 85, '3': 100, '2': 115,
      '1': 130, '1/0': 150, '2/0': 175, '3/0': 200, '4/0': 230, '250': 255,
      '300': 285, '350': 310, '400': 335, '500': 380, '600': 420, '750': 475
    },
    '90C': {
      '14': 25, '12': 30, '10': 40, '8': 55, '6': 75, '4': 95, '3': 115,
      '2': 130, '1': 150, '1/0': 170, '2/0': 195, '3/0': 225, '4/0': 260,
      '250': 290, '300': 320, '350': 350, '400': 380, '500': 430,
      '600': 475, '700': 520, '750': 535
    }
  };

  const ocpdLimits = { '14': 15, '12': 20, '10': 30 };

  const calculateWireSize = () => {
    const flc = parseFloat(wireSizeData.flc) || 0;
    const requiredAmps = flc * 1.25;
    
    const wireSizes = ['14', '12', '10', '8', '6', '4', '3', '2', '1', '1/0', '2/0', '3/0', '4/0', '250', '300', '350', '400', '500', '600', '700', '750'];
    
    const suitableWire = wireSizes.find(size => {
      const hasEnoughAmpacity = ampacityTable[wireSizeData.tempRating][size] >= requiredAmps;
      const meetsOCPDLimit = !ocpdLimits[size] || ocpdLimits[size] >= requiredAmps;
      return hasEnoughAmpacity && meetsOCPDLimit;
    });

    return {
      requiredAmps,
      wireSize: suitableWire || 'Larger than 750 kcmil required',
      ampacity: suitableWire ? ampacityTable[wireSizeData.tempRating][suitableWire] : null
    };
  };

  const wireResult = calculateWireSize();

  return (
    <>
      <Section title="Wire Sizing Parameters" icon={Cable} color="#10b981" isDarkMode={isDarkMode}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <InputGroup label="Motor FLC (Amps)" isDarkMode={isDarkMode}>
            <Input 
              type="number" 
              value={wireSizeData.flc} 
              onChange={(e) => setWireSizeData({...wireSizeData, flc: e.target.value})}
              placeholder="From FLC calculator"
              isDarkMode={isDarkMode}
              unit="A"
            />
          </InputGroup>

          <InputGroup label="Temperature Rating" isDarkMode={isDarkMode}>
            <Select 
              value={wireSizeData.tempRating} 
              onChange={(e) => setWireSizeData({...wireSizeData, tempRating: e.target.value})}
              isDarkMode={isDarkMode}
              options={[
                { value: '60C', label: '60°C (TW, UF)' },
                { value: '75C', label: '75°C (THWN, XHHW)' },
                { value: '90C', label: '90°C (THHN, XHHW-2)' }
              ]}
            />
          </InputGroup>
        </div>
      </Section>

      {wireSizeData.flc && (
        <Section isDarkMode={isDarkMode}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <ResultCard
              label="Required Capacity"
              value={wireResult.requiredAmps.toFixed(1)}
              unit="Amperes (125%)"
              color="#6b7280"
              variant="subtle"
              isDarkMode={isDarkMode}
            />
            
            <ResultCard
              label="Minimum Wire Size"
              value={wireResult.wireSize}
              unit={wireResult.ampacity ? `${wireResult.ampacity}A capacity` : ''}
              color="#10b981"
              variant="prominent"
              isDarkMode={isDarkMode}
            />
          </div>

          <InfoBox type="info" isDarkMode={isDarkMode} title="Calculation">
            <div style={{ fontSize: '0.8125rem' }}>
              Required capacity = {wireSizeData.flc}A × 125% = {wireResult.requiredAmps.toFixed(1)}A<br />
              Wire size based on NEC Table 310.16 for {wireSizeData.tempRating} rated conductors
            </div>
          </InfoBox>

          <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              NEC 430.22 Compliant
            </div>
            <div style={{ fontSize: '0.8125rem' }}>
              Conductors sized at minimum 125% of motor FLC per NEC requirements
            </div>
          </InfoBox>
        </Section>
      )}
    </>
  );
};

// Main Motor Calculations Component
const MotorCalculations = forwardRef(({ isDarkMode = false }, ref) => {
  const [activeCalculator, setActiveCalculator] = useState('flc');

  const [flcData, setFlcData] = useState({
    horsepower: '',
    voltage: '230',
    phase: 'three',
    efficiency: '0.85',
    powerFactor: '0.85'
  });

  const [protectionData, setProtectionData] = useState({
    flc: '',
    protectionType: 'dual-element'
  });

  const [wireSizeData, setWireSizeData] = useState({
    flc: '',
    tempRating: '75C'
  });

  const tabs = [
    { id: 'flc', label: 'Full Load Current' },
    { id: 'protection', label: 'Circuit Protection' },
    { id: 'wiresize', label: 'Wire Sizing' }
  ];

  useImperativeHandle(ref, () => ({
    exportPDF() {
      let pdfData = null;

      if (activeCalculator === 'flc') {
        if (!flcData.horsepower) {
          alert('Please select motor horsepower before exporting');
          return;
        }

        const necFLCTable = {
          single: {
            115: { 0.25: 4.4, 0.33: 5.8, 0.5: 7.2, 0.75: 9.8, 1: 13.8, 1.5: 20, 2: 24, 3: 34, 5: 56 },
            230: { 0.25: 2.2, 0.33: 2.9, 0.5: 3.6, 0.75: 4.9, 1: 6.9, 1.5: 10, 2: 12, 3: 17, 5: 28 }
          },
          three: {
            230: { 0.5: 2.0, 0.75: 2.8, 1: 3.6, 1.5: 5.2, 2: 6.8, 3: 9.6, 5: 15.2, 7.5: 22, 10: 28, 15: 42, 20: 54, 25: 68, 30: 80, 40: 104, 50: 130, 60: 154, 75: 192, 100: 248, 125: 312, 150: 360, 200: 480 },
            460: { 0.5: 1.0, 0.75: 1.4, 1: 1.8, 1.5: 2.6, 2: 3.4, 3: 4.8, 5: 7.6, 7.5: 11, 10: 14, 15: 21, 20: 27, 25: 34, 30: 40, 40: 52, 50: 65, 60: 77, 75: 96, 100: 124, 125: 156, 150: 180, 200: 240 },
            575: { 0.5: 0.8, 0.75: 1.1, 1: 1.4, 1.5: 2.1, 2: 2.7, 3: 3.9, 5: 6.1, 7.5: 9, 10: 11, 15: 17, 20: 22, 25: 27, 30: 32, 40: 41, 50: 52, 60: 62, 75: 77, 100: 99, 125: 125, 150: 144, 200: 192 }
          }
        };

        const hp = parseFloat(flcData.horsepower);
        const volt = parseInt(flcData.voltage);
        let flc;
        let source;

        if (necFLCTable[flcData.phase]?.[volt]?.[hp]) {
          flc = necFLCTable[flcData.phase][volt][hp];
          source = 'NEC Table';
        } else {
          const eff = parseFloat(flcData.efficiency);
          const pf = parseFloat(flcData.powerFactor);
          if (flcData.phase === 'single') {
            flc = (hp * 746) / (volt * eff * pf);
          } else {
            flc = (hp * 746) / (1.732 * volt * eff * pf);
          }
          source = 'Calculated';
        }

        pdfData = {
          calculatorName: 'Motor Calculations - Full Load Current',
          inputs: {
            motorHorsepower: `${hp} HP`,
            voltage: `${volt}V`,
            phase: flcData.phase === 'single' ? 'Single Phase' : 'Three Phase',
            ...(source === 'Calculated' && {
              efficiency: `${parseFloat(flcData.efficiency) * 100}%`,
              powerFactor: flcData.powerFactor
            })
          },
          results: {
            fullLoadCurrent: `${flc.toFixed(1)} Amperes`,
            source: source === 'NEC Table' ? 
              `NEC Table 430.${flcData.phase === 'single' ? '248' : '250'}` : 
              'Calculated using I = (HP × 746) ÷ (V × Eff × PF)'
          },
          additionalInfo: {
            ...(source === 'Calculated' && {
              formula: flcData.phase === 'single' ? 
                `I = (${hp} × 746) ÷ (${volt} × ${flcData.efficiency} × ${flcData.powerFactor})` :
                `I = (${hp} × 746) ÷ (1.732 × ${volt} × ${flcData.efficiency} × ${flcData.powerFactor})`
            })
          },
          necReferences: [
            'NEC Table 430.248 - Full-Load Current, Single-Phase AC Motors',
            'NEC Table 430.250 - Full-Load Current, Three-Phase AC Motors',
            'NEC 430.6 - Ampacity and Motor Rating Determination'
          ]
        };

      } else if (activeCalculator === 'protection') {
        if (!protectionData.flc) {
          alert('Please enter motor FLC before exporting');
          return;
        }

        const protectionTypes = {
          'non-time-delay': { name: 'Non-Time Delay Fuse', percentage: 300 },
          'dual-element': { name: 'Dual Element (Time-Delay) Fuse', percentage: 175 },
          'instantaneous-trip': { name: 'Instantaneous Trip Breaker', percentage: 800 },
          'inverse-time': { name: 'Inverse Time Breaker', percentage: 250 }
        };

        const standardSizes = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200, 225, 250, 300, 350, 400, 450, 500, 600];
        const current = parseFloat(protectionData.flc);
        const percentage = protectionTypes[protectionData.protectionType].percentage;
        const maxRating = (current * percentage) / 100;
        const nextSize = standardSizes.find(size => size >= maxRating) || Math.ceil(maxRating);

        pdfData = {
          calculatorName: 'Motor Calculations - Circuit Protection',
          inputs: {
            motorFullLoadCurrent: `${protectionData.flc} Amps`,
            protectionType: protectionTypes[protectionData.protectionType].name,
            maxPercentage: `${percentage}%`
          },
          results: {
            calculatedMaximum: `${maxRating.toFixed(1)} Amperes`,
            standardSize: `${nextSize} Amperes`
          },
          additionalInfo: {
            calculation: `Maximum = ${current}A × ${percentage}% = ${maxRating.toFixed(1)}A`,
            nextStandardSize: `Next standard OCPD size: ${nextSize}A`
          },
          necReferences: [
            `NEC Table 430.52 - Maximum Rating or Setting of Motor Branch-Circuit Short-Circuit and Ground-Fault Protective Devices (${percentage}% of FLC)`,
            'NEC 430.52(C) - Rating or Setting for Individual Motor Circuit',
            'NEC 240.6 - Standard Ampere Ratings'
          ]
        };

      } else if (activeCalculator === 'wiresize') {
        if (!wireSizeData.flc) {
          alert('Please enter motor FLC before exporting');
          return;
        }

        const tempRatingNames = {
          '60C': '60°C (140°F) - TW, UF',
          '75C': '75°C (167°F) - THWN, XHHW',
          '90C': '90°C (194°F) - THHN, XHHW-2'
        };

        const requiredAmps = (parseFloat(wireSizeData.flc) * 1.25).toFixed(1);
        
        const ampacityTable = {
          '60C': { '14': 15, '12': 20, '10': 30, '8': 40, '6': 55, '4': 70, '3': 85, '2': 95, '1': 110, '1/0': 125, '2/0': 145, '3/0': 165, '4/0': 195, '250': 215, '300': 240, '350': 260, '400': 280, '500': 320, '600': 355, '700': 385, '750': 400 },
          '75C': { '14': 20, '12': 25, '10': 35, '8': 50, '6': 65, '4': 85, '3': 100, '2': 115, '1': 130, '1/0': 150, '2/0': 175, '3/0': 200, '4/0': 230, '250': 255, '300': 285, '350': 310, '400': 335, '500': 380, '600': 420, '750': 475 },
          '90C': { '14': 25, '12': 30, '10': 40, '8': 55, '6': 75, '4': 95, '3': 115, '2': 130, '1': 150, '1/0': 170, '2/0': 195, '3/0': 225, '4/0': 260, '250': 290, '300': 320, '350': 350, '400': 380, '500': 430, '600': 475, '700': 520, '750': 535 }
        };

        const ocpdLimits = { '14': 15, '12': 20, '10': 30 };
        const wireSizes = ['14', '12', '10', '8', '6', '4', '3', '2', '1', '1/0', '2/0', '3/0', '4/0', '250', '300', '350', '400', '500', '600', '700', '750'];
        
        const suitableWire = wireSizes.find(size => {
          const hasEnoughAmpacity = ampacityTable[wireSizeData.tempRating][size] >= parseFloat(requiredAmps);
          const meetsOCPDLimit = !ocpdLimits[size] || ocpdLimits[size] >= parseFloat(requiredAmps);
          return hasEnoughAmpacity && meetsOCPDLimit;
        });

        const wireSize = suitableWire || 'Larger than 750 kcmil required';
        const ampacity = suitableWire ? ampacityTable[wireSizeData.tempRating][suitableWire] : 'N/A';

        pdfData = {
          calculatorName: 'Motor Calculations - Wire Sizing',
          inputs: {
            motorFullLoadCurrent: `${wireSizeData.flc} Amps`,
            temperatureRating: tempRatingNames[wireSizeData.tempRating]
          },
          results: {
            requiredCapacity: `${requiredAmps} Amps (125% of FLC)`,
            minimumWireSize: wireSize,
            wireAmpacity: ampacity !== 'N/A' ? `${ampacity} Amps` : 'N/A'
          },
          additionalInfo: {
            calculation: `Required capacity = ${wireSizeData.flc}A × 125% = ${requiredAmps}A`,
            ...(suitableWire && ocpdLimits[suitableWire] && {
              ocpdLimitation: `NEC 240.4(D): ${ocpdLimits[suitableWire]}A maximum OCPD for ${wireSize} wire`
            })
          },
          necReferences: [
            'NEC 430.22 - Single Motor - Conductors supplying a single motor shall have an ampacity not less than 125% of FLC',
            'NEC Table 310.16 - Allowable Ampacities of Insulated Conductors',
            'NEC 240.4(D) - Small Conductors - Unless specifically permitted, overcurrent protection shall not exceed limits'
          ]
        };
      }

      exportToPDF(pdfData);
    }
  }));

  return (
    <div style={{ margin: '0 -1rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        <TabGroup
          tabs={tabs}
          activeTab={activeCalculator}
          onChange={setActiveCalculator}
          isDarkMode={isDarkMode}
        />

        {activeCalculator === 'flc' && (
          <MotorFLCCalculator flcData={flcData} setFlcData={setFlcData} isDarkMode={isDarkMode} />
        )}

        {activeCalculator === 'protection' && (
          <MotorProtectionCalculator protectionData={protectionData} setProtectionData={setProtectionData} isDarkMode={isDarkMode} />
        )}

        {activeCalculator === 'wiresize' && (
          <MotorWireSizeCalculator wireSizeData={wireSizeData} setWireSizeData={setWireSizeData} isDarkMode={isDarkMode} />
        )}

        <InfoBox type="info" isDarkMode={isDarkMode}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
            NEC References:
          </div>
          <div style={{ fontSize: '0.8125rem' }}>
            430.22 - Conductors (125% FLC) • 430.52 - Circuit protection • 430.250 - FLC tables • 430.32 - Overload protection
          </div>
        </InfoBox>
      </CalculatorLayout>
    </div>
  );
});

export default MotorCalculations;