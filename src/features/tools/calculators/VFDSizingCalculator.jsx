import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Settings, AlertCircle, CheckCircle, Gauge, Thermometer, Info } from 'lucide-react';
import { exportToPDF } from '../../../utils/pdfExport';
import CalculatorLayout, { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox
} from './CalculatorLayout';

const VFDSizingCalculator = forwardRef(({ isDarkMode, onBack }, ref) => {
  const [motorHP, setMotorHP] = useState('');
  const [voltage, setVoltage] = useState('460');
  const [phases, setPhases] = useState('3');
  const [dutyCycle, setDutyCycle] = useState('normal');
  const [altitude, setAltitude] = useState('0');
  const [ambientTemp, setAmbientTemp] = useState('40');
  const [loadType, setLoadType] = useState('variable');

  // Calculate motor FLA based on HP and voltage
  const calculateMotorFLA = (hp, volts, ph) => {
    if (!hp || !volts) return 0;
    
    const hpNum = parseFloat(hp);
    const voltNum = parseFloat(volts);
    
    if (ph === '3') {
      return (hpNum * 746) / (voltNum * 1.732 * 0.85 * 0.9);
    } else {
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

  // Standard VFD sizes
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

  const recommendedVFD = standardVFDSizes.find(vfd => vfd.amps >= requiredVFDCurrent);
  const hasWarnings = altitudeFactor < 1.0 || tempFactor < 1.0 || dutyCycle === 'heavy';

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      if (!motorHP) {
        alert('Please enter motor horsepower before exporting to PDF');
        return;
      }

      const loadTypeText = loadType === 'variable' ? 'Variable Torque (Fans, Pumps)' :
                          loadType === 'constant' ? 'Constant Torque (Conveyors)' :
                          'High Starting Torque';

      const dutyCycleText = dutyCycle === 'light' ? 'Light Duty (Intermittent)' :
                           dutyCycle === 'normal' ? 'Normal Duty' :
                           'Heavy Duty (Continuous)';

      const pdfData = {
        calculatorName: 'VFD Sizing Calculator',
        inputs: {
          'Motor Horsepower': `${motorHP} HP`,
          'Voltage': `${voltage}V`,
          'Phases': phases === '1' ? 'Single Phase' : 'Three Phase',
          'Load Type': loadTypeText,
          'Duty Cycle': dutyCycleText,
          'Altitude': `${altitude} feet`,
          'Ambient Temperature': `${ambientTemp}°C`
        },
        results: {
          'Motor Full Load Amperes (FLA)': `${motorFLA.toFixed(1)} A`,
          'Required VFD Current': `${requiredVFDCurrent.toFixed(1)} A`,
          'Recommended VFD Rating': recommendedVFD ? `${recommendedVFD.amps} A` : 'N/A',
          'VFD Motor HP (460V)': recommendedVFD ? `${recommendedVFD.hp460V} HP` : 'N/A',
          'VFD Motor HP (230V)': recommendedVFD ? `${recommendedVFD.hp230V} HP` : 'N/A',
          'Safety Margin': recommendedVFD ? `${((recommendedVFD.amps / requiredVFDCurrent - 1) * 100).toFixed(0)}%` : 'N/A'
        },
        additionalInfo: {
          'Altitude Derating Factor': `${(altitudeFactor * 100).toFixed(0)}%`,
          'Temperature Derating Factor': `${(tempFactor * 100).toFixed(0)}%`,
          'Duty Cycle Factor': `${(dutyCycleFactor * 100).toFixed(0)}%`,
          'Calculation Method': phases === '3' 
            ? 'Three Phase: (HP × 746) ÷ (V × 1.732 × 0.85 × 0.9)'
            : 'Single Phase: (HP × 746) ÷ (V × 0.85 × 0.9)',
          'Required VFD Current Formula': 'Motor FLA × Duty Cycle Factor ÷ (Altitude Factor × Temperature Factor)'
        },
        necReferences: [
          'NEC Article 430 - Motors, Motor Circuits, and Controllers',
          'NEC 430.122 - Rating of Motor Control Circuit Overcurrent Protective Device',
          'Always follow VFD manufacturer specifications',
          'Use shielded cables for motor connections to reduce EMI',
          'Install line and load reactors when recommended by manufacturer',
          'Ensure proper grounding and bonding per NEC Article 250',
          'Consider bypass contactor for critical applications',
          'Verify VFD voltage matches motor nameplate voltage',
          'Consider harmonic filtering for sensitive equipment',
          'Ensure adequate cooling and ventilation for VFD enclosure',
          altitudeFactor < 1.0 ? `WARNING: High altitude derating applied (${(altitudeFactor * 100).toFixed(0)}%)` : '',
          tempFactor < 1.0 ? `WARNING: High temperature derating applied (${(tempFactor * 100).toFixed(0)}%)` : '',
          dutyCycle === 'heavy' ? 'WARNING: Heavy duty cycle requires oversizing for continuous operation' : ''
        ].filter(ref => ref !== '')
      };

      exportToPDF(pdfData);
    }
  }));

  return (
    <div style={{ margin: '0 -1rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        {/* Motor Information */}
        <Section 
          title="Motor Information" 
          icon={Settings} 
          color="#3b82f6" 
          isDarkMode={isDarkMode}
        >
          <InputGroup label="Motor Horsepower" isDarkMode={isDarkMode}>
            <Input
              type="number"
              value={motorHP}
              onChange={(e) => setMotorHP(e.target.value)}
              placeholder="Enter HP"
              step="0.5"
              isDarkMode={isDarkMode}
              unit="HP"
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
                  { value: '230', label: '230V' },
                  { value: '460', label: '460V' },
                  { value: '575', label: '575V' }
                ]}
              />
            </InputGroup>

            <InputGroup label="Phases" isDarkMode={isDarkMode}>
              <Select
                value={phases}
                onChange={(e) => setPhases(e.target.value)}
                isDarkMode={isDarkMode}
                options={[
                  { value: '1', label: 'Single Phase' },
                  { value: '3', label: 'Three Phase' }
                ]}
              />
            </InputGroup>
          </div>

          <InputGroup label="Load Type" isDarkMode={isDarkMode}>
            <Select
              value={loadType}
              onChange={(e) => setLoadType(e.target.value)}
              isDarkMode={isDarkMode}
              options={[
                { value: 'variable', label: 'Variable Torque (Fans, Pumps)' },
                { value: 'constant', label: 'Constant Torque (Conveyors)' },
                { value: 'highTorque', label: 'High Starting Torque' }
              ]}
            />
          </InputGroup>
        </Section>

        {/* Environmental Conditions */}
        <Section 
          title="Environmental Conditions" 
          icon={Thermometer} 
          color="#f59e0b" 
          isDarkMode={isDarkMode}
        >
          <InputGroup label="Duty Cycle" isDarkMode={isDarkMode}>
            <Select
              value={dutyCycle}
              onChange={(e) => setDutyCycle(e.target.value)}
              isDarkMode={isDarkMode}
              options={[
                { value: 'light', label: 'Light Duty (Intermittent)' },
                { value: 'normal', label: 'Normal Duty' },
                { value: 'heavy', label: 'Heavy Duty (Continuous)' }
              ]}
            />
          </InputGroup>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '0.75rem' 
          }}>
            <InputGroup label="Altitude" isDarkMode={isDarkMode}>
              <Input
                type="number"
                value={altitude}
                onChange={(e) => setAltitude(e.target.value)}
                placeholder="0"
                step="100"
                isDarkMode={isDarkMode}
                unit="ft"
              />
            </InputGroup>

            <InputGroup label="Ambient Temp" isDarkMode={isDarkMode}>
              <Input
                type="number"
                value={ambientTemp}
                onChange={(e) => setAmbientTemp(e.target.value)}
                placeholder="40"
                isDarkMode={isDarkMode}
                unit="°C"
              />
            </InputGroup>
          </div>

          <InfoBox type="info" icon={Info} isDarkMode={isDarkMode} title="Derating Factors">
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Altitude Factor:</span>
                <span style={{ fontWeight: '600' }}>{(altitudeFactor * 100).toFixed(0)}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Temperature Factor:</span>
                <span style={{ fontWeight: '600' }}>{(tempFactor * 100).toFixed(0)}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Duty Cycle Factor:</span>
                <span style={{ fontWeight: '600' }}>{(dutyCycleFactor * 100).toFixed(0)}%</span>
              </div>
            </div>
          </InfoBox>
        </Section>

        {/* Results */}
        {motorHP && (
          <Section isDarkMode={isDarkMode}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
              gap: '0.75rem', 
              marginBottom: '0.75rem' 
            }}>
              <ResultCard
                label="Motor FLA"
                value={motorFLA.toFixed(1)}
                unit="Amperes"
                color="#8b5cf6"
                variant="prominent"
                isDarkMode={isDarkMode}
              />
              
              <ResultCard
                label="Required VFD Current"
                value={requiredVFDCurrent.toFixed(1)}
                unit="Amperes"
                color="#f59e0b"
                variant="prominent"
                isDarkMode={isDarkMode}
              />
              
              <ResultCard
                label="Recommended VFD"
                value={recommendedVFD ? recommendedVFD.amps : 'N/A'}
                unit="Amperes"
                color="#3b82f6"
                variant="prominent"
                isDarkMode={isDarkMode}
              />
            </div>

            {recommendedVFD && (
              <InfoBox type="info" icon={Info} isDarkMode={isDarkMode} title="VFD Specifications">
                <div style={{ fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>Current Rating:</span>
                    <span style={{ fontWeight: '600' }}>{recommendedVFD.amps} Amperes</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>Motor HP (460V):</span>
                    <span style={{ fontWeight: '600' }}>{recommendedVFD.hp460V} HP</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>Motor HP (230V):</span>
                    <span style={{ fontWeight: '600' }}>{recommendedVFD.hp230V} HP</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid currentColor',
                    marginTop: '0.25rem',
                    opacity: 0.3
                  }}>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                    <span>Safety Margin:</span>
                    <span style={{ fontWeight: '600', color: '#10b981' }}>
                      {((recommendedVFD.amps / requiredVFDCurrent - 1) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </InfoBox>
            )}

            {/* Success Message */}
            {recommendedVFD && !hasWarnings && (
              <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode} title="VFD Selection Complete">
                <div style={{ fontSize: '0.8125rem' }}>
                  Selected VFD meets all requirements with adequate safety margin for reliable operation.
                </div>
              </InfoBox>
            )}

            {/* Warnings */}
            {hasWarnings && (
              <InfoBox type="warning" icon={AlertCircle} isDarkMode={isDarkMode} title="Important Considerations">
                <div style={{ fontSize: '0.8125rem' }}>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
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
              </InfoBox>
            )}
          </Section>
        )}

        {/* Installation Notes */}
        <InfoBox type="info" isDarkMode={isDarkMode}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
            VFD Installation Notes:
          </div>
          <div style={{ fontSize: '0.8125rem' }}>
            Always follow manufacturer specifications • Use shielded cables for motor connections • Install line and load reactors when recommended • Ensure proper grounding and bonding • Consider bypass contactor for critical applications
          </div>
        </InfoBox>
      </CalculatorLayout>
    </div>
  );
});

export default VFDSizingCalculator;