import React from 'react';
import { Zap, FileDown, Briefcase } from 'lucide-react';
import { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox 
} from '../CalculatorLayout';

const InductiveReactanceTab = ({ 
  frequency, 
  setFrequency, 
  inductance, 
  setInductance, 
  inductanceUnit, 
  setInductanceUnit,
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
        icon={Zap} 
        color="#3b82f6" 
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
              label="Inductive Reactance (XL)"
              value={result.reactance}
              unit="Ohms (Ω)"
              color="#3b82f6"
              variant="prominent"
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Calculation Details */}
          <InfoBox type="info" isDarkMode={isDarkMode} title="Calculation Details">
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Formula:</strong> XL = 2πfL
              </div>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Frequency:</strong> {result.frequency} Hz
              </div>
              <div>
                <strong>Inductance:</strong> {result.inductance} {result.unit}
              </div>
            </div>
          </InfoBox>

          {/* About Inductive Reactance */}
          <InfoBox type="info" isDarkMode={isDarkMode} title="About Inductive Reactance">
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ marginBottom: '0.25rem' }}>• Inductive reactance increases with frequency</div>
              <div style={{ marginBottom: '0.25rem' }}>• In AC circuits, inductors oppose changes in current</div>
              <div style={{ marginBottom: '0.25rem' }}>• Current lags voltage by 90° in a pure inductor</div>
              <div>• XL is directly proportional to both frequency and inductance</div>
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

export default InductiveReactanceTab;