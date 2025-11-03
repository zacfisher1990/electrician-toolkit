import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import {
  wireMaterials,
  temperatureRatings,
  wireSizes,
  ambientTemperatures,
  getBaseAmpacity,
  calculateDeratedAmpacity,
  getOCPDLimit,
  getCommonApplications,
  formatTempRating,
  formatAmbientTemp,
  formatWireSize,
  necReferences
} from './data/ampacityData';
import { exportToPDF } from '../../../utils/pdfExport';

const AmpacityLookupCalculator = forwardRef(({ isDarkMode = false, onBack }, ref) => {
  const [wireSize, setWireSize] = useState('12');
  const [wireType, setWireType] = useState('copper');
  const [tempRating, setTempRating] = useState('75C');
  const [ambientTemp, setAmbientTemp] = useState('30');
  const [numConductors, setNumConductors] = useState('3');
  const [continuousLoad, setContinuousLoad] = useState(false);

  // Dark mode colors
  const colors = {
    cardBg: isDarkMode ? '#374151' : '#ffffff',
    cardBorder: isDarkMode ? '#4b5563' : '#e5e7eb',
    cardText: isDarkMode ? '#f9fafb' : '#111827',
    labelText: isDarkMode ? '#d1d5db' : '#374151',
    inputBg: isDarkMode ? '#1f2937' : '#ffffff',
    inputBorder: isDarkMode ? '#4b5563' : '#d1d5db',
    sectionBg: isDarkMode ? '#1f2937' : '#f9fafb',
  };

  const currentAmpacity = getBaseAmpacity(wireType, tempRating, wireSize);
  const ocpdLimit = getOCPDLimit(wireType, wireSize);
  const deratingResults = calculateDeratedAmpacity(
    currentAmpacity,
    tempRating,
    ambientTemp,
    numConductors,
    continuousLoad
  );
  const hasDerating = deratingResults.tempFactor !== 1.00 || deratingResults.conductorFactor !== 1.00 || continuousLoad;

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      const pdfData = {
        calculatorName: 'Ampacity Lookup Calculator',
        inputs: {
          wireSize: formatWireSize(wireSize),
          wireMaterial: wireType.charAt(0).toUpperCase() + wireType.slice(1),
          temperatureRating: formatTempRating(tempRating),
          ambientTemperature: formatAmbientTemp(ambientTemp),
          currentCarryingConductors: numConductors,
          continuousLoad: continuousLoad ? 'Yes (3+ hours)' : 'No'
        },
        results: {
          baseAmpacity: `${deratingResults.base} A`,
          deratedAmpacity: hasDerating ? `${deratingResults.derated} A` : 'N/A (no derating applied)',
          finalAmpacity: `${continuousLoad ? deratingResults.continuous : (hasDerating ? deratingResults.derated : deratingResults.base)} A`,
          ocpdLimit: ocpdLimit ? `${ocpdLimit} A (NEC 240.4(D))` : 'No special limit',
          commonApplications: getCommonApplications(currentAmpacity, wireSize)
        },
        additionalInfo: {
          temperatureCorrectionFactor: `×${deratingResults.tempFactor.toFixed(2)}`,
          conductorAdjustmentFactor: `×${deratingResults.conductorFactor.toFixed(2)}`,
          continuousLoadFactor: continuousLoad ? '×0.80' : 'Not applied',
          deratingApplied: hasDerating ? 'Yes' : 'No'
        },
        necReferences: [
          necReferences.ampacityTable,
          necReferences.tempCorrection,
          necReferences.conductorAdjustment,
          ocpdLimit ? necReferences.ocpdLimit : null,
          continuousLoad ? necReferences.continuousLoad : null
        ].filter(Boolean)
      };

      exportToPDF(pdfData);
    }
  }));

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Wire Selection */}
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
          Wire Selection
        </h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText,
              marginBottom: '0.5rem' 
            }}>
              Wire Size
            </label>
            <select 
              value={wireSize} 
              onChange={(e) => setWireSize(e.target.value)}
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
              {wireSizes.map(size => (
                <option key={size.value} value={size.value}>
                  {size.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText,
                marginBottom: '0.5rem' 
              }}>
                Wire Material
              </label>
              <select 
                value={wireType} 
                onChange={(e) => setWireType(e.target.value)}
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
                {wireMaterials.map(material => (
                  <option key={material.value} value={material.value}>
                    {material.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText,
                marginBottom: '0.5rem' 
              }}>
                Temperature Rating
              </label>
              <select 
                value={tempRating} 
                onChange={(e) => setTempRating(e.target.value)}
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
                {temperatureRatings.map(rating => (
                  <option key={rating.value} value={rating.value}>
                    {rating.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Derating Factors */}
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
          Derating Factors (Optional)
        </h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', alignItems: 'end' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText,
                marginBottom: '0.5rem' 
              }}>
                Ambient Temp (°C)
              </label>
              <select 
                value={ambientTemp} 
                onChange={(e) => setAmbientTemp(e.target.value)}
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
                {ambientTemperatures.map(temp => (
                  <option key={temp.value} value={temp.value}>
                    {temp.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText,
                marginBottom: '0.5rem' 
              }}>
                Current-Carrying Conductors
              </label>
              <input
                type="number"
                value={numConductors}
                onChange={(e) => setNumConductors(e.target.value)}
                min="1"
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
          </div>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={continuousLoad} 
              onChange={(e) => setContinuousLoad(e.target.checked)}
              style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.labelText }}>
              Continuous Load (3+ hours) - Apply 80% factor
            </span>
          </label>

          <div style={{
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            border: `1px solid ${colors.cardBorder}`
          }}>
            <h4 style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: colors.cardText,
              marginTop: 0,
              marginBottom: '0.75rem'
            }}>
              Applied Factors
            </h4>
            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem', color: colors.labelText }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Temperature Factor:</span>
                <span style={{ fontWeight: '600', color: colors.cardText }}>
                  ×{deratingResults.tempFactor.toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Conductor Adjustment:</span>
                <span style={{ fontWeight: '600', color: colors.cardText }}>
                  ×{deratingResults.conductorFactor.toFixed(2)}
                </span>
              </div>
              {continuousLoad && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Continuous Load:</span>
                  <span style={{ fontWeight: '600', color: colors.cardText }}>
                    ×0.80
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
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
          Results
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: hasDerating ? 'repeat(3, 1fr)' : '1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
              Base Ampacity
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
              {deratingResults.base} A
            </div>
          </div>
          
          {hasDerating && (
            <>
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Derated Ampacity
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {deratingResults.derated} A
                </div>
              </div>
              
              <div style={{
                background: '#dbeafe',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                  Final Ampacity
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                  {continuousLoad ? deratingResults.continuous : deratingResults.derated} A
                </div>
              </div>
            </>
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
            <div style={{ fontSize: '0.875rem', color: '#047857', lineHeight: '1.5', width: '100%' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Wire:</strong> {formatWireSize(wireSize)} {wireType}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Temperature Rating:</strong> {formatTempRating(tempRating)}
              </div>
            </div>
          </div>
        </div>

        {ocpdLimit && (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: '1.5' }}>
                <strong>NEC 240.4(D) Limit:</strong> {ocpdLimit}A max overcurrent protection
              </div>
            </div>
          </div>
        )}

        <div style={{
          background: colors.sectionBg,
          padding: '1rem',
          borderRadius: '8px',
          border: `1px solid ${colors.cardBorder}`
        }}>
          <div style={{ fontSize: '0.875rem', color: colors.labelText, lineHeight: '1.5' }}>
            <div style={{ fontWeight: '600', color: colors.cardText, marginBottom: '0.5rem' }}>
              Common Applications:
            </div>
            {getCommonApplications(currentAmpacity, wireSize)}
          </div>
        </div>
      </div>
    </div>
  );
});

export default AmpacityLookupCalculator;