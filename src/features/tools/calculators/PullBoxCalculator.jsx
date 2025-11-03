import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Box, Plus, Trash2, Info } from 'lucide-react';
import {
  pullBoxTypes,
  racewayTradeSizes,
  getTradeSizeLabel,
  calculateStraightPull,
  calculateAnglePull,
  calculateUPull,
  necReferences
} from './data/pullBoxData';
import { exportToPDF } from '../../../utils/pdfExport';

const PullBoxCalculator = forwardRef(({ isDarkMode = false, onBack }, ref) => {
  const [pullType, setPullType] = useState('straight');
  const [raceways, setRaceways] = useState([
    { size: '1' }
  ]);

  // Dark mode colors
  const colors = {
    cardBg: isDarkMode ? '#374151' : '#ffffff',
    cardBorder: isDarkMode ? '#4b5563' : '#e5e7eb',
    cardText: isDarkMode ? '#f9fafb' : '#111827',
    labelText: isDarkMode ? '#d1d5db' : '#374151',
    inputBg: isDarkMode ? '#1f2937' : '#ffffff',
    inputBorder: isDarkMode ? '#4b5563' : '#d1d5db',
    sectionBg: isDarkMode ? '#1f2937' : '#f9fafb',
    subtleText: isDarkMode ? '#9ca3af' : '#6b7280'
  };

  const addRaceway = () => {
    setRaceways([...raceways, { size: '1' }]);
  };

  const removeRaceway = (index) => {
    if (raceways.length > 1) {
      setRaceways(raceways.filter((_, i) => i !== index));
    }
  };

  const updateRaceway = (index, value) => {
    const newRaceways = [...raceways];
    newRaceways[index].size = value;
    setRaceways(newRaceways);
  };

  const calculateDimensions = () => {
    const largestRaceway = Math.max(...raceways.map(r => parseFloat(r.size)));
    const largestRacewayStr = largestRaceway.toString();

    if (pullType === 'straight') {
      return calculateStraightPull(largestRacewayStr);
    } else if (pullType === 'angle') {
      return calculateAnglePull(raceways);
    } else if (pullType === 'u-pull') {
      return calculateUPull(largestRacewayStr);
    }
  };

  const results = calculateDimensions();

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      const pullTypeLabel = pullBoxTypes.find(pt => pt.value === pullType)?.label || pullType;
      
      // Build raceway list
      const racewayList = raceways.map((r, i) => 
        `Raceway ${i + 1}: ${getTradeSizeLabel(r.size)}`
      ).join(', ');

      const pdfData = {
        calculatorName: 'Pull Box Calculator',
        inputs: {
          pullType: pullTypeLabel,
          numberOfRaceways: raceways.length,
          raceways: racewayList,
          largestRaceway: results ? getTradeSizeLabel(Math.max(...raceways.map(r => r.size)).toString()) : 'N/A'
        },
        results: {
          minimumDimension: results ? `${results.minLength || results.minDistance}" inches` : 'N/A',
          formula: results?.formula || 'N/A',
          necReference: results?.necReference || 'N/A'
        },
        additionalInfo: {
          calculation: results?.formula || 'N/A',
          note: 'These are minimum dimensions per NEC. Larger boxes may be used.',
          conductorRequirement: 'Applies to conductors 4 AWG or larger'
        },
        necReferences: [
          necReferences.mainSection,
          results?.necReference,
          necReferences.conductorSize,
          ...necReferences.rules
        ].filter(Boolean)
      };

      exportToPDF(pdfData);
    }
  }));

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>

      {/* Pull Type Selection */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          fontSize: '1rem', 
          fontWeight: '600', 
          color: colors.cardText,
          marginTop: 0,
          marginBottom: '1rem',
          borderBottom: `1px solid ${colors.cardBorder}`,
          paddingBottom: '0.5rem'
        }}>
          Pull Box Configuration
        </h3>
        
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: colors.labelText,
            marginBottom: '0.5rem' 
          }}>
            Pull Type
          </label>
          <select 
            value={pullType} 
            onChange={(e) => setPullType(e.target.value)}
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
            {pullBoxTypes.map(type => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Info Box */}
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: '#dbeafe',
          border: '1px solid #93c5fd',
          borderRadius: '8px',
          fontSize: '0.8125rem',
          color: '#1e40af',
          display: 'flex',
          gap: '0.5rem'
        }}>
          <Info size={16} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
          <div>
            {pullType === 'straight' && 'Straight Pull: Conduits enter and exit on opposite sides'}
            {pullType === 'angle' && 'Angle Pull: Conduits enter on one side and exit on adjacent side (L-shaped)'}
            {pullType === 'u-pull' && 'U-Pull: Conduits enter and exit on the same side'}
          </div>
        </div>
      </div>

      {/* Raceways */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ 
          fontSize: '1rem', 
          fontWeight: '600', 
          color: colors.cardText,
          marginTop: 0,
          marginBottom: '1rem',
          borderBottom: `1px solid ${colors.cardBorder}`,
          paddingBottom: '0.5rem'
        }}>
          {pullType === 'straight' && 'Raceway Size'}
          {pullType === 'angle' && 'Raceways on Same Wall'}
          {pullType === 'u-pull' && 'Raceway Size'}
        </h3>
        
        {raceways.map((raceway, index) => (
          <div key={index} style={{ 
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '0.75rem',
            border: `1px solid ${colors.cardBorder}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ fontWeight: '600', color: colors.labelText, margin: 0, fontSize: '0.875rem' }}>
                {pullType === 'angle' 
                  ? (index === 0 ? 'Largest Raceway' : `Other Raceway ${index}`)
                  : 'Largest Raceway'
                }
              </h4>
              {pullType === 'angle' && index > 0 && (
                <button
                  onClick={() => removeRaceway(index)}
                  style={{ 
                    color: '#dc2626', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.8125rem', 
                fontWeight: '500', 
                color: colors.labelText,
                marginBottom: '0.5rem' 
              }}>
                Trade Size
              </label>
              <select 
                value={raceway.size} 
                onChange={(e) => updateRaceway(index, e.target.value)}
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
                {racewayTradeSizes.map(size => (
                  <option key={size} value={size}>
                    {getTradeSizeLabel(size)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
        
        {pullType === 'angle' && (
          <button 
            onClick={addRaceway}
            style={{ 
              width: '100%',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '0.75rem',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={16} />
            Add Other Raceway
          </button>
        )}
        
        <p style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>
          {pullType === 'straight' && 'Enter the largest raceway entering the box'}
          {pullType === 'angle' && 'Enter largest raceway first, then add any other raceways entering on the same wall'}
          {pullType === 'u-pull' && 'Enter the largest raceway entering and exiting on the same side'}
        </p>
      </div>

      {/* Results */}
      {results && (
        <div style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            fontSize: '1.125rem', 
            fontWeight: '600', 
            color: colors.cardText,
            marginTop: 0,
            marginBottom: '1rem'
          }}>
            Minimum Box Dimensions
          </h3>
          
          <div style={{ 
            background: colors.sectionBg,
            padding: '1.5rem',
            borderRadius: '8px',
            textAlign: 'center',
            marginBottom: '1rem'
          }}>
            <div style={{ fontSize: '0.875rem', color: colors.labelText, marginBottom: '0.5rem' }}>
              Minimum {pullType === 'straight' ? 'Length' : 'Distance'}
            </div>
            <div style={{ fontSize: '3rem', fontWeight: '700', color: '#3b82f6', lineHeight: 1 }}>
              {(results.minLength || results.minDistance).toFixed(1)}"
            </div>
            <div style={{ fontSize: '0.875rem', color: colors.subtleText, marginTop: '0.5rem' }}>
              {results.formula}
            </div>
          </div>

          <div style={{
            background: '#dbeafe',
            border: '1px solid #93c5fd',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#1e40af', lineHeight: '1.5' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                NEC Requirement Met
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                Reference: {results.necReference}
              </div>
              <div style={{ fontSize: '0.8125rem' }}>
                These are minimum dimensions. Larger boxes may be used for ease of installation.
              </div>
            </div>
          </div>

          {pullType === 'angle' && results.largestRaceway && (
            <div style={{ 
              background: colors.sectionBg,
              padding: '1rem', 
              borderRadius: '8px',
              marginTop: '1rem',
              border: `1px solid ${colors.cardBorder}`
            }}>
              <strong style={{ color: colors.cardText, display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                Angle Pull Calculation:
              </strong>
              <div style={{ fontSize: '0.8125rem', color: colors.labelText, lineHeight: '1.8' }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Step 1:</strong> Largest raceway × 6
                </div>
                <div style={{ paddingLeft: '1rem', color: colors.subtleText }}>
                  {results.largestRaceway}" × 6 = {(results.largestRaceway * 6).toFixed(1)}"
                </div>
                
                <div style={{ marginTop: '0.75rem', marginBottom: '0.5rem' }}>
                  <strong>Step 2:</strong> Add other raceways on same wall
                </div>
                <div style={{ paddingLeft: '1rem', color: colors.subtleText }}>
                  {results.sumOfOthers > 0 
                    ? `Sum of others = ${results.sumOfOthers.toFixed(1)}"`
                    : 'No other raceways'
                  }
                </div>
                
                <div style={{ 
                  marginTop: '0.75rem', 
                  paddingTop: '0.75rem', 
                  borderTop: `1px solid ${colors.cardBorder}`,
                  fontWeight: '600',
                  color: '#3b82f6'
                }}>
                  Total: {(results.largestRaceway * 6).toFixed(1)}" + {results.sumOfOthers.toFixed(1)}" = {results.minDistance.toFixed(1)}"
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* NEC Reference */}
      <div style={{
        background: colors.sectionBg,
        padding: '1rem',
        borderRadius: '8px',
        border: `1px solid ${colors.cardBorder}`,
        fontSize: '0.8125rem',
        color: colors.labelText
      }}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: colors.cardText }}>
          NEC 314.28 Requirements:
        </div>
        <div style={{ lineHeight: '1.6' }}>
          Straight: 8× largest • Angle/U: 6× largest + others • For conductors 4 AWG or larger
        </div>
      </div>
    </div>
  );
});

export default PullBoxCalculator;