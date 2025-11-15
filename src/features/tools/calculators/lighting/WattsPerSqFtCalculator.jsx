import React from 'react';
import { CheckCircle, Zap, FileDown, Briefcase } from 'lucide-react';
import { calculateWattsPerSqFt } from './utils/lightingCalculations';
import { BUILDING_TYPE_NAMES, WATTS_PER_SQ_FT } from './utils/lightingConstants';
import { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox 
} from '../CalculatorLayout';

const WattsPerSqFtCalculator = ({ wattsData, setWattsData, isDarkMode, onExport, onAttachToJob }) => {
  const results = calculateWattsPerSqFt(wattsData.area, wattsData.buildingType);

  return (
    <>
      {/* Building Parameters */}
      <Section 
        title="Building Parameters" 
        icon={Zap} 
        color="#3b82f6" 
        isDarkMode={isDarkMode}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '0.75rem' 
        }}>
          <InputGroup label="Building Area" isDarkMode={isDarkMode}>
            <Input 
              type="number" 
              value={wattsData.area} 
              onChange={(e) => setWattsData(prev => ({...prev, area: e.target.value}))}
              placeholder="Enter area"
              isDarkMode={isDarkMode}
              unit="sq ft"
            />
          </InputGroup>

          <InputGroup label="Building Type" isDarkMode={isDarkMode}>
            <Select 
              value={wattsData.buildingType} 
              onChange={(e) => setWattsData(prev => ({...prev, buildingType: e.target.value}))}
              isDarkMode={isDarkMode}
              options={Object.entries(BUILDING_TYPE_NAMES).map(([key, name]) => ({
                value: key,
                label: `${name} (${WATTS_PER_SQ_FT[key]} W/sq ft)`
              }))}
            />
          </InputGroup>
        </div>
      </Section>

      {/* Results */}
      {results && (
        <Section isDarkMode={isDarkMode}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: '0.75rem', 
            marginBottom: '0.75rem' 
          }}>
            <ResultCard
              label="Unit Load"
              value={results.unitLoad}
              unit="W/sq ft"
              color="#6b7280"
              variant="subtle"
              isDarkMode={isDarkMode}
            />
            
            <ResultCard
              label="Total Load"
              value={results.totalWatts.toLocaleString()}
              unit="watts"
              color="#3b82f6"
              variant="prominent"
              isDarkMode={isDarkMode}
            />

            <ResultCard
              label="Current @ 120V"
              value={results.amperage}
              unit="Amps"
              color="#6b7280"
              variant="subtle"
              isDarkMode={isDarkMode}
            />

            <ResultCard
              label="Required Circuits"
              value={results.circuits}
              unit="× 20A circuits"
              color="#10b981"
              variant="prominent"
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Calculation Summary */}
          <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode} title="Calculation Summary">
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Load:</strong> Area ({wattsData.area} sq ft) × Unit Load ({results.unitLoad} W/sq ft) = {results.totalWatts.toLocaleString()} watts
              </div>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Total VA:</strong> {results.totalVA.toLocaleString()} VA (for resistive loads, watts = VA)
              </div>
              <div>
                <strong>Circuits:</strong> {results.amperage} A ÷ 16A (80% of 20A breaker) = {results.circuits} circuits
              </div>
            </div>
          </InfoBox>

          {/* NEC Requirements */}
          <InfoBox type="info" isDarkMode={isDarkMode} title="NEC Requirements">
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ marginBottom: '0.25rem' }}>• <strong>NEC Table 220.12:</strong> General lighting loads by occupancy type</div>
              <div style={{ marginBottom: '0.25rem' }}>• <strong>NEC 210.19(A)(1):</strong> Branch circuit ampacity requirements</div>
              <div style={{ marginBottom: '0.25rem' }}>• <strong>NEC 210.20(A):</strong> Continuous loads (3+ hours) require 125% sizing for conductors and overcurrent protection</div>
              <div style={{ marginBottom: '0.25rem' }}>• Calculated using building area, not just lit area</div>
              <div>• Additional loads (receptacles, appliances) calculated separately</div>
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

export default WattsPerSqFtCalculator;