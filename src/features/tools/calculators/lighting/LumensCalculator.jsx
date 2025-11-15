import React from 'react';
import { CheckCircle, Sun, FileDown, Briefcase } from 'lucide-react';
import { calculateLumens } from './utils/lightingCalculations';
import { ROOM_TYPE_NAMES } from './utils/lightingConstants';
import { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox 
} from '../CalculatorLayout';

const LumensCalculator = ({ lumensData, setLumensData, isDarkMode, onExport, onAttachToJob }) => {
  const results = calculateLumens(
    lumensData.roomLength,
    lumensData.roomWidth,
    lumensData.roomType,
    lumensData.lumensPerFixture
  );

  return (
    <>
      {/* Room Parameters */}
      <Section 
        title="Room Parameters" 
        icon={Sun} 
        color="#f59e0b" 
        isDarkMode={isDarkMode}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '0.75rem' 
        }}>
          <InputGroup label="Room Length" isDarkMode={isDarkMode}>
            <Input 
              type="number" 
              value={lumensData.roomLength} 
              onChange={(e) => setLumensData(prev => ({...prev, roomLength: e.target.value}))}
              placeholder="Enter length"
              isDarkMode={isDarkMode}
              unit="ft"
            />
          </InputGroup>

          <InputGroup label="Room Width" isDarkMode={isDarkMode}>
            <Input 
              type="number" 
              value={lumensData.roomWidth} 
              onChange={(e) => setLumensData(prev => ({...prev, roomWidth: e.target.value}))}
              placeholder="Enter width"
              isDarkMode={isDarkMode}
              unit="ft"
            />
          </InputGroup>

          <InputGroup label="Room Type" isDarkMode={isDarkMode}>
            <Select 
              value={lumensData.roomType} 
              onChange={(e) => setLumensData(prev => ({...prev, roomType: e.target.value}))}
              isDarkMode={isDarkMode}
              options={Object.entries(ROOM_TYPE_NAMES).map(([key, name]) => ({
                value: key,
                label: name
              }))}
            />
          </InputGroup>

          <InputGroup 
            label="Lumens per Fixture" 
            helpText="Optional - to calculate fixture count"
            isDarkMode={isDarkMode}
          >
            <Input 
              type="number" 
              value={lumensData.lumensPerFixture} 
              onChange={(e) => setLumensData(prev => ({...prev, lumensPerFixture: e.target.value}))}
              placeholder="e.g., 800"
              isDarkMode={isDarkMode}
              unit="lm"
            />
          </InputGroup>
        </div>
      </Section>

      {/* Results */}
      {results && (
        <Section isDarkMode={isDarkMode}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: results.fixturesNeeded 
              ? 'repeat(auto-fit, minmax(140px, 1fr))' 
              : 'repeat(auto-fit, minmax(180px, 1fr))', 
            gap: '0.75rem', 
            marginBottom: '0.75rem' 
          }}>
            <ResultCard
              label="Room Area"
              value={results.area}
              unit="sq ft"
              color="#6b7280"
              variant="subtle"
              isDarkMode={isDarkMode}
            />
            
            <ResultCard
              label="Total Lumens Needed"
              value={results.totalLumens.toLocaleString()}
              unit="lumens"
              color="#3b82f6"
              variant="prominent"
              isDarkMode={isDarkMode}
            />

            {results.fixturesNeeded && (
              <ResultCard
                label="Fixtures Needed"
                value={results.fixturesNeeded}
                unit="fixtures"
                color="#10b981"
                variant="prominent"
                isDarkMode={isDarkMode}
              />
            )}
          </div>

          {/* Calculation Details */}
          <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode} title="Lighting Requirements">
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Recommended level:</strong> {results.footCandles} foot-candles
              </div>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Calculation:</strong> {results.area} sq ft × {results.footCandles} fc = {results.totalLumens.toLocaleString()} lumens
              </div>
              {results.fixturesNeeded && (
                <div>
                  <strong>Fixtures:</strong> {results.totalLumens.toLocaleString()} lm ÷ {lumensData.lumensPerFixture} lm = {results.fixturesNeeded} fixtures
                </div>
              )}
            </div>
          </InfoBox>

          {/* Lighting Tips */}
          <InfoBox type="info" isDarkMode={isDarkMode} title="Lighting Tips">
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ marginBottom: '0.25rem' }}>• LED bulbs typically produce 60-100 lumens per watt</div>
              <div style={{ marginBottom: '0.25rem' }}>• Layer lighting: combine ambient, task, and accent lighting</div>
              <div>• Dark wall colors absorb light; increase lumens by 10-20%</div>
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

export default LumensCalculator;