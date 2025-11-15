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

const ImpedanceCalculatorTab = ({ 
  reactanceType,
  setReactanceType,
  resistance, 
  setResistance, 
  reactance, 
  setReactance,
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
        color="#10b981" 
        isDarkMode={isDarkMode}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '0.75rem' 
        }}>
          <InputGroup label="Reactance Type" isDarkMode={isDarkMode}>
            <Select 
              value={reactanceType} 
              onChange={(e) => setReactanceType(e.target.value)}
              isDarkMode={isDarkMode}
              options={[
                { value: 'inductive', label: 'Inductive (XL)' },
                { value: 'capacitive', label: 'Capacitive (XC)' }
              ]}
            />
          </InputGroup>

          <InputGroup label="Resistance (R)" isDarkMode={isDarkMode}>
            <Input 
              type="number" 
              value={resistance} 
              onChange={(e) => setResistance(e.target.value)}
              placeholder="Enter resistance"
              isDarkMode={isDarkMode}
              unit="Ω"
            />
          </InputGroup>

          <InputGroup 
            label="Reactance (X)" 
            helpText={reactanceType === 'inductive' ? 'XL (inductive)' : 'XC (capacitive)'}
            isDarkMode={isDarkMode}
          >
            <Input 
              type="number" 
              value={reactance} 
              onChange={(e) => setReactance(e.target.value)}
              placeholder="Enter reactance"
              isDarkMode={isDarkMode}
              unit="Ω"
            />
          </InputGroup>
        </div>
      </Section>

      {/* Results */}
      {result && (
        <Section isDarkMode={isDarkMode}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '0.75rem', 
            marginBottom: '0.75rem' 
          }}>
            <ResultCard
              label="Impedance (Z)"
              value={result.impedance}
              unit="Ohms (Ω)"
              color="#10b981"
              variant="prominent"
              isDarkMode={isDarkMode}
            />
            
            <ResultCard
              label="Phase Angle (θ)"
              value={`${result.angle}°`}
              unit={result.type === 'inductive' ? 'Current Lags' : 'Current Leads'}
              color="#8b5cf6"
              variant="prominent"
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Calculation Details */}
          <InfoBox type="info" isDarkMode={isDarkMode} title="Calculation Details">
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Formula:</strong> Z = √(R² + X²)
              </div>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Resistance (R):</strong> {result.resistance} Ω
              </div>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Reactance (X):</strong> {result.reactance} Ω
              </div>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Type:</strong> {result.type === 'inductive' ? 'Inductive' : 'Capacitive'}
              </div>
              <div>
                <strong>Phase Relationship:</strong> {result.type === 'inductive' ? 'Current lags voltage' : 'Current leads voltage'}
              </div>
            </div>
          </InfoBox>

          {/* About Impedance */}
          <InfoBox type="info" isDarkMode={isDarkMode} title="About Impedance">
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ marginBottom: '0.25rem' }}>• Impedance (Z) is the total opposition to current flow in AC circuits</div>
              <div style={{ marginBottom: '0.25rem' }}>• It combines both resistance (R) and reactance (X)</div>
              <div style={{ marginBottom: '0.25rem' }}>• Phase angle indicates the relationship between voltage and current</div>
              <div>• In {result.type === 'inductive' ? 'inductive' : 'capacitive'} circuits, current {result.type === 'inductive' ? 'lags' : 'leads'} voltage</div>
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

export default ImpedanceCalculatorTab;