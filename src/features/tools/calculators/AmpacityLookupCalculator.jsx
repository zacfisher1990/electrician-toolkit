import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { AlertTriangle, CheckCircle, Zap, Thermometer, Info } from 'lucide-react';
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
import CalculatorLayout, { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox
} from './CalculatorLayout';

const AmpacityLookupCalculator = forwardRef(({ isDarkMode = false, onBack }, ref) => {
  const [wireSize, setWireSize] = useState('12');
  const [wireType, setWireType] = useState('copper');
  const [tempRating, setTempRating] = useState('75C');
  const [ambientTemp, setAmbientTemp] = useState('30');
  const [numConductors, setNumConductors] = useState('3');
  const [continuousLoad, setContinuousLoad] = useState(false);

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
    <div style={{ margin: '0 -1rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        {/* Wire Selection */}
        <Section 
          title="Wire Selection" 
          icon={Zap} 
          color="#3b82f6" 
          isDarkMode={isDarkMode}
        >
          <InputGroup label="Wire Size" isDarkMode={isDarkMode}>
            <Select 
              value={wireSize} 
              onChange={(e) => setWireSize(e.target.value)}
              isDarkMode={isDarkMode}
              options={wireSizes}
            />
          </InputGroup>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '0.75rem' 
          }}>
            <InputGroup label="Wire Material" isDarkMode={isDarkMode}>
              <Select 
                value={wireType} 
                onChange={(e) => setWireType(e.target.value)}
                isDarkMode={isDarkMode}
                options={wireMaterials}
              />
            </InputGroup>

            <InputGroup label="Temperature Rating" isDarkMode={isDarkMode}>
              <Select 
                value={tempRating} 
                onChange={(e) => setTempRating(e.target.value)}
                isDarkMode={isDarkMode}
                options={temperatureRatings}
              />
            </InputGroup>
          </div>
        </Section>

        {/* Derating Factors */}
        <Section 
          title="Derating Factors" 
          icon={Thermometer} 
          color="#f59e0b" 
          isDarkMode={isDarkMode}
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '0.75rem' 
          }}>
            <InputGroup label="Ambient Temperature" isDarkMode={isDarkMode}>
              <Select 
                value={ambientTemp} 
                onChange={(e) => setAmbientTemp(e.target.value)}
                isDarkMode={isDarkMode}
                options={ambientTemperatures}
              />
            </InputGroup>
            
            <InputGroup 
              label="Current-Carrying Conductors" 
              helpText="Number in raceway/cable"
              isDarkMode={isDarkMode}
            >
              <Input
                type="number"
                value={numConductors}
                onChange={(e) => setNumConductors(e.target.value)}
                min="1"
                isDarkMode={isDarkMode}
              />
            </InputGroup>
          </div>
          
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              cursor: 'pointer',
              padding: '0.5rem 0'
            }}>
              <input 
                type="checkbox" 
                checked={continuousLoad} 
                onChange={(e) => setContinuousLoad(e.target.checked)}
                style={{ 
                  width: '1.125rem', 
                  height: '1.125rem', 
                  cursor: 'pointer',
                  accentColor: '#3b82f6'
                }}
              />
              <span style={{ 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                color: isDarkMode ? '#e0e0e0' : '#111827'
              }}>
                Continuous Load (3+ hours) - Apply 80% factor
              </span>
            </label>
          </div>

          <InfoBox type="info" isDarkMode={isDarkMode} title="Applied Factors">
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '0.25rem'
              }}>
                <span>Temperature Factor:</span>
                <span style={{ fontWeight: '600' }}>
                  ×{deratingResults.tempFactor.toFixed(2)}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: continuousLoad ? '0.25rem' : 0
              }}>
                <span>Conductor Adjustment:</span>
                <span style={{ fontWeight: '600' }}>
                  ×{deratingResults.conductorFactor.toFixed(2)}
                </span>
              </div>
              {continuousLoad && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Continuous Load:</span>
                  <span style={{ fontWeight: '600' }}>
                    ×0.80
                  </span>
                </div>
              )}
            </div>
          </InfoBox>
        </Section>

        {/* Results */}
        <Section 
          title="Ampacity Results" 
          icon={CheckCircle} 
          color="#10b981" 
          isDarkMode={isDarkMode}
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: hasDerating ? 'repeat(auto-fit, minmax(120px, 1fr))' : '1fr', 
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <ResultCard
              label="Base Ampacity"
              value={deratingResults.base}
              unit="Amps"
              variant="subtle"
              isDarkMode={isDarkMode}
            />
            
            {hasDerating && (
              <>
                <ResultCard
                  label="Derated"
                  value={deratingResults.derated}
                  unit="Amps"
                  variant="subtle"
                  isDarkMode={isDarkMode}
                />
                
                <ResultCard
                  label="Final Ampacity"
                  value={continuousLoad ? deratingResults.continuous : deratingResults.derated}
                  unit="Amps"
                  color="#3b82f6"
                  isDarkMode={isDarkMode}
                />
              </>
            )}
          </div>

          <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode}>
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Wire:</strong> {formatWireSize(wireSize)} {wireType}
              </div>
              <div>
                <strong>Temperature Rating:</strong> {formatTempRating(tempRating)}
              </div>
            </div>
          </InfoBox>

          {ocpdLimit && (
            <InfoBox type="warning" icon={AlertTriangle} isDarkMode={isDarkMode}>
              <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                NEC 240.4(D) Limit: {ocpdLimit}A max overcurrent protection
              </div>
            </InfoBox>
          )}

          <InfoBox type="info" icon={Info} isDarkMode={isDarkMode} title="Common Applications">
            <div style={{ fontSize: '0.8125rem' }}>
              {getCommonApplications(currentAmpacity, wireSize)}
            </div>
          </InfoBox>
        </Section>
      </CalculatorLayout>
    </div>
  );
});

export default AmpacityLookupCalculator;