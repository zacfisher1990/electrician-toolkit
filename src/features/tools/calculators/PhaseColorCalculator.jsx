import React, { useState } from 'react';
import { Palette, Zap, Info } from 'lucide-react';
import CalculatorLayout, { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  InfoBox,
  TabGroup
} from './CalculatorLayout';
import { getColors } from '../../../theme';

const PhaseColorCalculator = ({ isDarkMode = false }) => {
  const [voltageSystem, setVoltageSystem] = useState('120/208');
  const [circuitNumber, setCircuitNumber] = useState('');

  const colors = getColors(isDarkMode);

  // Phase color definitions
  const phaseColors = {
    '120/208': {
      A: { name: 'Black', hex: '#000000', textColor: '#ffffff' },
      B: { name: 'Red', hex: '#dc2626', textColor: '#ffffff' },
      C: { name: 'Blue', hex: '#2563eb', textColor: '#ffffff' }
    },
    '277/480': {
      A: { name: 'Brown', hex: '#92400e', textColor: '#ffffff' },
      B: { name: 'Orange', hex: '#ea580c', textColor: '#ffffff' },
      C: { name: 'Yellow', hex: '#facc15', textColor: '#000000' }
    }
  };

  // Calculate phase from circuit number
  const getPhaseFromCircuit = (circuitNum) => {
    if (!circuitNum || circuitNum < 1) return null;
    
    const num = parseInt(circuitNum);
    
    // Standard 3-phase panel layout:
    // Left side (odd): 1=A, 3=B, 5=C, 7=A, 9=B, 11=C...
    // Right side (even): 2=A, 4=B, 6=C, 8=A, 10=B, 12=C...
    // Pattern: A-B-C rotation down each side
    
    // Convert to 0-indexed position in the sequence
    const position = Math.ceil(num / 2) - 1;
    const phaseIndex = position % 3;
    
    const phaseMap = ['A', 'B', 'C']; // Standard 3-phase panel pattern
    return phaseMap[phaseIndex];
  };

  const phase = getPhaseFromCircuit(circuitNumber);
  const colorInfo = phase ? phaseColors[voltageSystem][phase] : null;

  // Voltage system tabs
  const voltageTabs = [
    { id: '120/208', label: '120/208V', icon: Zap },
    { id: '277/480', label: '277/480V', icon: Zap }
  ];

  // Generate panel layout preview (first 12 circuits)
  const getPanelLayout = () => {
    const layout = [];
    for (let i = 1; i <= 42; i += 2) {
      const leftPhase = getPhaseFromCircuit(i);
      const rightPhase = getPhaseFromCircuit(i + 1);
      layout.push({
        left: { num: i, phase: leftPhase },
        right: { num: i + 1, phase: rightPhase }
      });
    }
    return layout;
  };

  const panelLayout = getPanelLayout();

  return (
    <div style={{ margin: '0 -1rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        {/* Voltage System Selection */}
        <Section 
          title="Voltage System" 
          icon={Zap} 
          color="#3b82f6" 
          isDarkMode={isDarkMode}
        >
          <TabGroup
            tabs={voltageTabs}
            activeTab={voltageSystem}
            onChange={setVoltageSystem}
            isDarkMode={isDarkMode}
          />

          <InfoBox type="info" isDarkMode={isDarkMode}>
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                {Object.entries(phaseColors[voltageSystem]).map(([phase, color]) => (
                  <div key={phase} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '4px',
                      background: color.hex,
                      border: '2px solid ' + colors.border
                    }} />
                    <span style={{ fontWeight: '600' }}>Phase {phase}: {color.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </InfoBox>
        </Section>

        {/* Circuit Number Input */}
        <Section 
          title="Circuit Number" 
          icon={Palette} 
          color="#8b5cf6" 
          isDarkMode={isDarkMode}
        >
          <InputGroup 
            label="Enter Circuit Number" 
            isDarkMode={isDarkMode}
            helpText="Enter the circuit breaker number from the panel"
          >
            <Input
              type="number"
              value={circuitNumber}
              onChange={(e) => setCircuitNumber(e.target.value)}
              placeholder="1, 2, 3..."
              min="1"
              isDarkMode={isDarkMode}
            />
          </InputGroup>

          {/* Result Display */}
          {circuitNumber && phase && colorInfo && (
            <div style={{
              background: colorInfo.hex,
              borderRadius: '0.75rem',
              padding: '2rem',
              textAlign: 'center',
              marginTop: '0.75rem',
              boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
            }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: colorInfo.textColor,
                opacity: 0.8,
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Circuit {circuitNumber} • Phase {phase}
              </div>
              <div style={{
                fontSize: '3rem',
                fontWeight: '700',
                color: colorInfo.textColor,
                lineHeight: '1'
              }}>
                {colorInfo.name}
              </div>
              <div style={{
                fontSize: '0.875rem',
                color: colorInfo.textColor,
                opacity: 0.7,
                marginTop: '0.5rem'
              }}>
                {voltageSystem}V System
              </div>
            </div>
          )}
        </Section>

        {/* Panel Layout Reference */}
        <Section 
          title="Panel Layout Reference" 
          icon={Info} 
          color="#10b981" 
          isDarkMode={isDarkMode}
        >
          <div style={{
            background: colors.inputBg,
            borderRadius: '0.5rem',
            padding: '1rem',
            border: `1px solid ${colors.border}`
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              gap: '0.25rem',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {panelLayout.slice(0, 21).map((row, index) => (
                <React.Fragment key={index}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    background: circuitNumber == row.left.num ? colors.hover : 'transparent',
                    borderRadius: '4px'
                  }}>
                    <span style={{ color: colors.subtext }}>{row.left.num}</span>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '3px',
                      background: phaseColors[voltageSystem][row.left.phase].hex,
                      border: `1px solid ${colors.border}`
                    }} />
                  </div>
                  <div style={{
                    width: '2px',
                    background: colors.border,
                    margin: '0 0.5rem'
                  }} />
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.25rem 0.5rem',
                    background: circuitNumber == row.right.num ? colors.hover : 'transparent',
                    borderRadius: '4px'
                  }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '3px',
                      background: phaseColors[voltageSystem][row.right.phase].hex,
                      border: `1px solid ${colors.border}`
                    }} />
                    <span style={{ color: colors.subtext }}>{row.right.num}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <InfoBox type="info" isDarkMode={isDarkMode}>
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Standard Panel Pattern:</div>
              <div>Circuits follow A-B-C rotation down each side of the panel. Odd numbers on left, even on right.</div>
            </div>
          </InfoBox>
        </Section>

        {/* NEC Reference */}
        <InfoBox type="info" isDarkMode={isDarkMode}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
            Color Code Reference:
          </div>
          <div style={{ fontSize: '0.8125rem' }}>
            120/208V: Black (A) • Red (B) • Blue (C) | 277/480V: Brown (A) • Orange (B) • Yellow (C) | Neutral: White/Gray | Ground: Green/Bare
          </div>
        </InfoBox>
      </CalculatorLayout>
    </div>
  );
};

export default PhaseColorCalculator;