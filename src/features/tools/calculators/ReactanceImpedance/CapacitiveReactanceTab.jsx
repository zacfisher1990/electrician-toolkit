import React from 'react';
import { Activity, FileDown, Briefcase } from 'lucide-react';
import { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox 
} from '../CalculatorLayout';

const CapacitiveReactanceTab = ({ 
  frequency, 
  setFrequency, 
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
      {/* Circuit Parameters */}
      <Section 
        title="Circuit Parameters" 
        icon={Activity} 
        color="#f59e0b" 
        isDarkMode={isDarkMode}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '0.75rem' 
        }}>
          <InputGroup 
            label="Frequency" 
            helpText="Common: 50 Hz or 60 Hz"
            isDarkMode={isDarkMode}
          >
            <Input 
              type="number" 
              value={frequency} 
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="60"
              isDarkMode={isDarkMode}
              unit="Hz"
            />
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
              label="Capacitive Reactance (XC)"
              value={result.reactance}
              unit="Ohms (Ω)"
              color="#f59e0b"
              variant="prominent"
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Calculation Details */}
          <InfoBox type="info" isDarkMode={isDarkMode} title="Calculation Details">
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Formula:</strong> XC = 1 / (2πfC)
              </div>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Frequency:</strong> {result.frequency} Hz
              </div>
              <div>
                <strong>Capacitance:</strong> {result.capacitance} {result.unit}
              </div>
            </div>
          </InfoBox>

          {/* About Capacitive Reactance */}
          <InfoBox type="info" isDarkMode={isDarkMode} title="About Capacitive Reactance">
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ marginBottom: '0.25rem' }}>• Capacitive reactance decreases with frequency</div>
              <div style={{ marginBottom: '0.25rem' }}>• In AC circuits, capacitors oppose changes in voltage</div>
              <div style={{ marginBottom: '0.25rem' }}>• Current leads voltage by 90° in a pure capacitor</div>
              <div>• XC is inversely proportional to both frequency and capacitance</div>
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

export default CapacitiveReactanceTab;