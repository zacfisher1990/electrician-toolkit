import React from 'react';
import { Radio, FileDown, Briefcase } from 'lucide-react';
import { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox 
} from '../CalculatorLayout';

const ResonantFrequencyTab = ({ 
  inductance, 
  setInductance, 
  inductanceUnit, 
  setInductanceUnit,
  capacitance, 
  setCapacitance, 
  capacitanceUnit, 
  setCapacitanceUnit,
  result,
  isDarkMode,
  onExport,
  onAttachToJob
}) => {
  return (
    <>
      {/* LC Circuit Parameters */}
      <Section 
        title="LC Circuit Parameters" 
        icon={Radio} 
        color="#ec4899" 
        isDarkMode={isDarkMode}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '0.75rem' 
        }}>
          <InputGroup label="Inductance" isDarkMode={isDarkMode}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
              <Input 
                type="number" 
                value={inductance} 
                onChange={(e) => setInductance(e.target.value)}
                placeholder="Enter value"
                isDarkMode={isDarkMode}
              />
              <Select 
                value={inductanceUnit} 
                onChange={(e) => setInductanceUnit(e.target.value)}
                isDarkMode={isDarkMode}
                options={[
                  { value: 'H', label: 'H' },
                  { value: 'mH', label: 'mH' },
                  { value: 'μH', label: 'μH' }
                ]}
              />
            </div>
          </InputGroup>

          <InputGroup label="Capacitance" isDarkMode={isDarkMode}>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
              <Input 
                type="number" 
                value={capacitance} 
                onChange={(e) => setCapacitance(e.target.value)}
                placeholder="Enter value"
                isDarkMode={isDarkMode}
              />
              <Select 
                value={capacitanceUnit} 
                onChange={(e) => setCapacitanceUnit(e.target.value)}
                isDarkMode={isDarkMode}
                options={[
                  { value: 'F', label: 'F' },
                  { value: 'μF', label: 'μF' },
                  { value: 'nF', label: 'nF' },
                  { value: 'pF', label: 'pF' }
                ]}
              />
            </div>
          </InputGroup>
        </div>
      </Section>

      {/* Results */}
      {result && (
        <Section isDarkMode={isDarkMode}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '0.75rem', 
            marginBottom: '0.75rem' 
          }}>
            <ResultCard
              label="Resonant Frequency (fr)"
              value={result.frequency}
              unit="Hz"
              color="#ec4899"
              variant="prominent"
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Calculation Details */}
          <InfoBox type="info" isDarkMode={isDarkMode} title="Calculation Details">
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Formula:</strong> fr = 1 / (2π√LC)
              </div>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Inductance:</strong> {result.inductance} {result.inductanceUnit}
              </div>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Capacitance:</strong> {result.capacitance} {result.capacitanceUnit}
              </div>
              <div style={{ marginTop: '0.5rem' }}>
                <strong>At Resonance:</strong> XL = XC (reactances cancel out)
              </div>
            </div>
          </InfoBox>

          {/* About Resonant Frequency */}
          <InfoBox type="info" isDarkMode={isDarkMode} title="About Resonant Frequency">
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ marginBottom: '0.25rem' }}>• At resonance, inductive and capacitive reactances are equal (XL = XC)</div>
              <div style={{ marginBottom: '0.25rem' }}>• Series LC circuit has minimum impedance at resonance</div>
              <div style={{ marginBottom: '0.25rem' }}>• Parallel LC circuit has maximum impedance at resonance</div>
              <div style={{ marginBottom: '0.25rem' }}>• The circuit behaves as purely resistive at resonant frequency</div>
              <div>• Used in radio tuning, filters, and oscillator circuits</div>
            </div>
          </InfoBox>

          {/* Action Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            marginTop: '0.75rem'
          }}>
            <button
              onClick={onExport}
              style={{
                padding: '0.75rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#2563eb';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <FileDown size={16} />
              Export PDF
            </button>
            
            <button
              onClick={onAttachToJob}
              style={{
                padding: '0.75rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#059669';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#10b981';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <Briefcase size={16} />
              Attach to Job
            </button>
          </div>
        </Section>
      )}
    </>
  );
};

export default ResonantFrequencyTab;