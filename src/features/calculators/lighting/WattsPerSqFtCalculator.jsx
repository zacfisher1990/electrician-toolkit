import React from 'react';
import { CheckCircle } from 'lucide-react';
import { calculateWattsPerSqFt } from './utils/lightingCalculations';
import { BUILDING_TYPE_NAMES, WATTS_PER_SQ_FT } from './utils/lightingConstants';
import styles from '../Calculator.module.css';

const WattsPerSqFtCalculator = ({ wattsData, setWattsData, colors }) => {
  const results = calculateWattsPerSqFt(wattsData.area, wattsData.buildingType);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
            Building Area (sq ft)
          </label>
          <input
            type="number"
            value={wattsData.area}
            onChange={(e) => setWattsData(prev => ({...prev, area: e.target.value}))}
            placeholder="Enter area"
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
            Building Type
          </label>
          <select
            value={wattsData.buildingType}
            onChange={(e) => setWattsData(prev => ({...prev, buildingType: e.target.value}))}
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
            {Object.entries(BUILDING_TYPE_NAMES).map(([key, name]) => (
              <option key={key} value={key}>
                {name} ({WATTS_PER_SQ_FT[key]} W/sq ft)
              </option>
            ))}
          </select>
        </div>
      </div>

      {results && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                Unit Load
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                {results.unitLoad}
              </div>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                W/sq ft
              </div>
            </div>
            
            <div style={{
              background: '#dbeafe',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                Total Load
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                {results.totalWatts}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.25rem' }}>
                watts
              </div>
            </div>

            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                Current @ 120V
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                {results.amperage}
              </div>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                Amps
              </div>
            </div>

            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                Required Circuits
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                {results.circuits}
              </div>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                × 20A circuits
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
                  Calculation Summary
                </div>
                <div>Area ({wattsData.area} sq ft) × Unit Load ({results.unitLoad} W/sq ft) = {results.totalWatts} watts</div>
                <div>Total VA: {results.totalVA} VA (for resistive loads, watts = VA)</div>
                <div>Circuits needed: {results.amperage} A ÷ 16A (80% of 20A breaker) = {results.circuits} circuits</div>
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
              NEC Requirements:
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li><strong>NEC Table 220.12:</strong> General lighting loads by occupancy type</li>
              <li><strong>NEC 210.19(A)(1):</strong> Branch circuit ampacity requirements</li>
              <li><strong>NEC 210.20(A):</strong> Continuous loads (3+ hours) require 125% sizing for conductors and overcurrent protection</li>
              <li>Calculated using building area, not just lit area</li>
              <li>Additional loads (receptacles, appliances) calculated separately</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default WattsPerSqFtCalculator;