import React from 'react';
import { CheckCircle, Info, Grid3X3, FileDown, Briefcase } from 'lucide-react';
import { calculateFixtureSpacing } from './utils/lightingCalculations';
import { FIXTURE_TYPE_NAMES } from './utils/lightingConstants';
import { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox 
} from '../CalculatorLayout';

const FixtureSpacingCalculator = ({ spacingData, setSpacingData, isDarkMode, onExport, onAttachToJob }) => {
  const results = calculateFixtureSpacing(
    spacingData.roomLength,
    spacingData.roomWidth,
    spacingData.ceilingHeight,
    spacingData.fixtureType
  );

  return (
    <>
      {/* Room Parameters */}
      <Section 
        title="Room Parameters" 
        icon={Grid3X3} 
        color="#8b5cf6" 
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
              value={spacingData.roomLength} 
              onChange={(e) => setSpacingData(prev => ({...prev, roomLength: e.target.value}))}
              placeholder="Enter length"
              isDarkMode={isDarkMode}
              unit="ft"
            />
          </InputGroup>

          <InputGroup label="Room Width" isDarkMode={isDarkMode}>
            <Input 
              type="number" 
              value={spacingData.roomWidth} 
              onChange={(e) => setSpacingData(prev => ({...prev, roomWidth: e.target.value}))}
              placeholder="Enter width"
              isDarkMode={isDarkMode}
              unit="ft"
            />
          </InputGroup>

          <InputGroup label="Ceiling Height" isDarkMode={isDarkMode}>
            <Input 
              type="number" 
              value={spacingData.ceilingHeight} 
              onChange={(e) => setSpacingData(prev => ({...prev, ceilingHeight: e.target.value}))}
              placeholder="8"
              isDarkMode={isDarkMode}
              unit="ft"
            />
          </InputGroup>

          <InputGroup label="Fixture Type" isDarkMode={isDarkMode}>
            <Select 
              value={spacingData.fixtureType} 
              onChange={(e) => setSpacingData(prev => ({...prev, fixtureType: e.target.value}))}
              isDarkMode={isDarkMode}
              options={Object.entries(FIXTURE_TYPE_NAMES).map(([key, name]) => ({
                value: key,
                label: name
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
              label="Max Spacing"
              value={results.maxSpacing}
              unit="feet"
              color="#6b7280"
              variant="subtle"
              isDarkMode={isDarkMode}
            />
            
            <ResultCard
              label="Total Fixtures"
              value={results.totalFixtures}
              unit="fixtures"
              color="#3b82f6"
              variant="prominent"
              isDarkMode={isDarkMode}
            />

            <ResultCard
              label="Layout Grid"
              value={`${results.fixturesLength}×${results.fixturesWidth}`}
              unit="grid"
              color="#8b5cf6"
              variant="prominent"
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Spacing Results */}
          <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode} title="Spacing Results">
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Length:</strong> Space fixtures {results.actualSpacingLength} feet apart
              </div>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Width:</strong> Space fixtures {results.actualSpacingWidth} feet apart
              </div>
              <div>
                <strong>Wall Offset:</strong> Start {results.wallOffsetLength} ft from long walls, {results.wallOffsetWidth} ft from short walls
              </div>
            </div>
          </InfoBox>

          {/* How Spacing is Calculated */}
          <InfoBox type="warning" icon={Info} isDarkMode={isDarkMode} title="How Spacing is Calculated">
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Mounting Height:</strong> {results.mountingHeight} ft (ceiling height - 2.5 ft work plane)
              </div>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Maximum Spacing:</strong> {results.maxSpacing} ft (mounting height × spacing ratio)
              </div>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Target Spacing:</strong> {results.targetSpacing} ft (80% of max for better coverage)
              </div>
              {parseFloat(results.mountingHeight) > 12 && (
                <div style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>
                  Note: High ceiling detected. Spacing reduced by 10% to compensate for light loss (inverse square law).
                </div>
              )}
            </div>
          </InfoBox>

          {/* Spacing Guidelines */}
          <InfoBox type="info" isDarkMode={isDarkMode} title="Spacing Guidelines">
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ marginBottom: '0.25rem' }}>• <strong>Recessed cans:</strong> 1.5:1 ratio - general ambient lighting</div>
              <div style={{ marginBottom: '0.25rem' }}>• <strong>Pendants:</strong> 1:1 ratio - focused task lighting over counters/tables</div>
              <div style={{ marginBottom: '0.25rem' }}>• <strong>Track lights:</strong> 2:1 ratio - adjustable accent and display lighting</div>
              <div style={{ marginBottom: '0.25rem' }}>• <strong>Surface mount:</strong> 1.5:1 ratio - ceiling-mounted ambient fixtures</div>
              <div>• Higher ceilings require closer fixture spacing due to light spread and intensity loss</div>
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

export default FixtureSpacingCalculator;