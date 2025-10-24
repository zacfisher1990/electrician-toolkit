import React from 'react';
import { CheckCircle } from 'lucide-react';
import { calculateLumens } from './utils/lightingCalculations';
import { ROOM_TYPE_NAMES } from './utils/lightingConstants';
import styles from '../Calculator.module.css';

const LumensCalculator = ({ lumensData, setLumensData, colors }) => {
  const results = calculateLumens(
    lumensData.roomLength,
    lumensData.roomWidth,
    lumensData.roomType,
    lumensData.lumensPerFixture
  );

  return (
    <div className={styles.menu}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
            Room Length (feet)
          </label>
          <input
            type="number"
            value={lumensData.roomLength}
            onChange={(e) => setLumensData(prev => ({...prev, roomLength: e.target.value}))}
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
            value={lumensData.roomWidth}
            onChange={(e) => setLumensData(prev => ({...prev, roomWidth: e.target.value}))}
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
            Room Type <br/>  <br/>
          </label>
          <select
            value={lumensData.roomType}
            onChange={(e) => setLumensData(prev => ({...prev, roomType: e.target.value}))}
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
            {Object.entries(ROOM_TYPE_NAMES).map(([key, name]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
          <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>fc = foot-candles</div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
            Lumens per Fixture (Optional)
          </label>
          <input
            type="number"
            value={lumensData.lumensPerFixture}
            onChange={(e) => setLumensData(prev => ({...prev, lumensPerFixture: e.target.value}))}
            placeholder="e.g., 800"
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
          <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>To calculate fixture count</div>
        </div>
      </div>

      {results && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: results.fixturesNeeded ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                Room Area
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                {results.area}
              </div>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                sq ft
              </div>
            </div>
            
            <div style={{
              background: '#dbeafe',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                Total Lumens Needed
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                {results.totalLumens}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.25rem' }}>
                lumens
              </div>
            </div>

            {results.fixturesNeeded && (
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Fixtures Needed
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {results.fixturesNeeded}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  fixtures
                </div>
              </div>
            )}
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
                  Lighting Requirements
                </div>
                <div>Recommended level: {results.footCandles} foot-candles</div>
                {results.fixturesNeeded && (
                  <div>Using {lumensData.lumensPerFixture} lumens per fixture</div>
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
              Lighting Tips:
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>LED bulbs typically produce 60-100 lumens per watt</li>
              <li>Layer lighting: combine ambient, task, and accent lighting</li>
              <li>Dark wall colors absorb light; increase lumens by 10-20%</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default LumensCalculator;