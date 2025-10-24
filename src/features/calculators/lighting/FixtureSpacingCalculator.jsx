import React from 'react';
import { CheckCircle, Info } from 'lucide-react';
import { calculateFixtureSpacing } from './utils/lightingCalculations';
import { FIXTURE_TYPE_NAMES } from './utils/lightingConstants';
import styles from '../Calculator.module.css';

const FixtureSpacingCalculator = ({ spacingData, setSpacingData, colors }) => {
  const results = calculateFixtureSpacing(
    spacingData.roomLength,
    spacingData.roomWidth,
    spacingData.ceilingHeight,
    spacingData.fixtureType
  );

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
            Room Length (feet)
          </label>
          <input
            type="number"
            value={spacingData.roomLength}
            onChange={(e) => setSpacingData(prev => ({...prev, roomLength: e.target.value}))}
            placeholder="Enter length"
            style={{
              width: '100%',
              padding: '0.625rem',
              fontSize: '0.9375rem',
              border: `1px solid ${colors.inputBorder}`,
              borderRadius: '8px',
              backgroundColor: colors.inputBg,
              color: colors.cardText,
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
            Room Width (feet)
          </label>
          <input
            type="number"
            value={spacingData.roomWidth}
            onChange={(e) => setSpacingData(prev => ({...prev, roomWidth: e.target.value}))}
            placeholder="Enter width"
            style={{
              width: '100%',
              padding: '0.625rem',
              fontSize: '0.9375rem',
              border: `1px solid ${colors.inputBorder}`,
              borderRadius: '8px',
              backgroundColor: colors.inputBg,
              color: colors.cardText,
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
            Ceiling Height (feet)
          </label>
          <input
            type="number"
            value={spacingData.ceilingHeight}
            onChange={(e) => setSpacingData(prev => ({...prev, ceilingHeight: e.target.value}))}
            placeholder="8"
            style={{
              width: '100%',
              padding: '0.625rem',
              fontSize: '0.9375rem',
              border: `1px solid ${colors.inputBorder}`,
              borderRadius: '8px',
              backgroundColor: colors.inputBg,
              color: colors.cardText,
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
            Fixture Type
          </label>
          <select
            value={spacingData.fixtureType}
            onChange={(e) => setSpacingData(prev => ({...prev, fixtureType: e.target.value}))}
            style={{
              width: '100%',
              padding: '0.625rem',
              fontSize: '0.9375rem',
              border: `1px solid ${colors.inputBorder}`,
              borderRadius: '8px',
              backgroundColor: colors.inputBg,
              color: colors.cardText,
              boxSizing: 'border-box'
            }}
          >
            {Object.entries(FIXTURE_TYPE_NAMES).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      {results && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                Max Spacing
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                {results.maxSpacing}
              </div>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                feet
              </div>
            </div>
            
            <div style={{
              background: '#dbeafe',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                Total Fixtures
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                {results.totalFixtures}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.25rem' }}>
                fixtures
              </div>
            </div>

            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                Layout
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                {results.fixturesLength}×{results.fixturesWidth}
              </div>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                grid
              </div>
            </div>
          </div>

          <div style={{
            background: '#d1fae5',
            border: '1px solid #6ee7b7',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <CheckCircle size={20} color="#059669" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.875rem', color: '#047857', lineHeight: '1.5' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                  Spacing Results
                </div>
                <div><strong>Length:</strong> Space fixtures {results.actualSpacingLength} feet apart</div>
                <div><strong>Width:</strong> Space fixtures {results.actualSpacingWidth} feet apart</div>
                <div><strong>Wall Offset:</strong> Start {results.wallOffsetLength} ft from long walls, {results.wallOffsetWidth} ft from short walls</div>
              </div>
            </div>
          </div>

          <div style={{
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <Info size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: '1.5' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                  How Spacing is Calculated
                </div>
                <div><strong>Mounting Height:</strong> {results.mountingHeight} ft (ceiling height - 2.5 ft work plane)</div>
                <div><strong>Maximum Spacing:</strong> {results.maxSpacing} ft (mounting height × spacing ratio)</div>
                <div><strong>Target Spacing:</strong> {results.targetSpacing} ft (80% of max for better coverage)</div>
                {parseFloat(results.mountingHeight) > 12 && (
                  <div style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>
                    Note: High ceiling detected. Spacing reduced by 10% to compensate for light loss (inverse square law).
                  </div>
                )}
              </div>
            </div>
          </div>

          <div style={{
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            border: `1px solid ${colors.cardBorder}`,
            fontSize: '0.875rem',
            color: colors.labelText
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: colors.cardText }}>
              Spacing Guidelines:
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li><strong>Recessed cans:</strong> 1.5:1 ratio - general ambient lighting</li>
              <li><strong>Pendants:</strong> 1:1 ratio - focused task lighting over counters/tables</li>
              <li><strong>Track lights:</strong> 2:1 ratio - adjustable accent and display lighting</li>
              <li><strong>Surface mount:</strong> 1.5:1 ratio - ceiling-mounted ambient fixtures</li>
              <li>Higher ceilings require closer fixture spacing due to light spread and intensity loss</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default FixtureSpacingCalculator;