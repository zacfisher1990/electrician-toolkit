import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Box, Plus, Trash2, Info, CheckCircle, Settings } from 'lucide-react';
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
import CalculatorLayout, { 
  Section, 
  InputGroup, 
  Select, 
  ResultCard, 
  InfoBox,
  Button
} from './CalculatorLayout';
import { getColors } from '../../../theme';

const PullBoxCalculator = forwardRef(({ isDarkMode = false, onBack }, ref) => {
  const [pullType, setPullType] = useState('straight');
  const [raceways, setRaceways] = useState([
    { size: '1' }
  ]);

  const colors = getColors(isDarkMode);

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

  const getPullTypeDescription = () => {
    switch (pullType) {
      case 'straight':
        return 'Straight Pull: Conduits enter and exit on opposite sides';
      case 'angle':
        return 'Angle Pull: Conduits enter on one side and exit on adjacent side (L-shaped)';
      case 'u-pull':
        return 'U-Pull: Conduits enter and exit on the same side';
      default:
        return '';
    }
  };

  const getRacewaysSectionTitle = () => {
    switch (pullType) {
      case 'straight':
        return 'Raceway Size';
      case 'angle':
        return 'Raceways on Same Wall';
      case 'u-pull':
        return 'Raceway Size';
      default:
        return 'Raceway Size';
    }
  };

  const getRacewayHelpText = () => {
    switch (pullType) {
      case 'straight':
        return 'Enter the largest raceway entering the box';
      case 'angle':
        return 'Enter largest raceway first, then add any other raceways entering on the same wall';
      case 'u-pull':
        return 'Enter the largest raceway entering and exiting on the same side';
      default:
        return '';
    }
  };

  return (
    <div style={{ margin: '0 -1rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        {/* Pull Box Configuration */}
        <Section 
          title="Pull Box Configuration" 
          icon={Settings} 
          color="#3b82f6" 
          isDarkMode={isDarkMode}
        >
          <InputGroup label="Pull Type" isDarkMode={isDarkMode}>
            <Select 
              value={pullType} 
              onChange={(e) => setPullType(e.target.value)}
              isDarkMode={isDarkMode}
              options={pullBoxTypes.map(type => ({
                value: type.value,
                label: type.label
              }))}
            />
          </InputGroup>

          <InfoBox type="info" isDarkMode={isDarkMode}>
            {getPullTypeDescription()}
          </InfoBox>
        </Section>

        {/* Raceways */}
        <Section 
          title={getRacewaysSectionTitle()} 
          icon={Box} 
          color="#10b981" 
          isDarkMode={isDarkMode}
        >
          {raceways.map((raceway, index) => (
            <div key={index} style={{ 
              background: colors.inputBg,
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '0.75rem',
              border: `1px solid ${colors.border}`
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '0.75rem' 
              }}>
                <h4 style={{ 
                  fontWeight: '600', 
                  color: colors.text, 
                  margin: 0, 
                  fontSize: '0.875rem' 
                }}>
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
              
              <InputGroup label="Trade Size" isDarkMode={isDarkMode}>
                <Select 
                  value={raceway.size} 
                  onChange={(e) => updateRaceway(index, e.target.value)}
                  isDarkMode={isDarkMode}
                  options={racewayTradeSizes.map(size => ({
                    value: size,
                    label: getTradeSizeLabel(size)
                  }))}
                />
              </InputGroup>
            </div>
          ))}
          
          {pullType === 'angle' && (
            <Button 
              onClick={addRaceway}
              variant="primary"
              fullWidth
              isDarkMode={isDarkMode}
            >
              <Plus size={16} />
              Add Other Raceway
            </Button>
          )}
          
          <div style={{ 
            fontSize: '0.75rem', 
            color: colors.subtext, 
            marginTop: '0.5rem',
            fontStyle: 'italic'
          }}>
            {getRacewayHelpText()}
          </div>
        </Section>

        {/* Results */}
        {results && (
          <Section 
            title="Minimum Box Dimensions" 
            icon={CheckCircle} 
            color="#f59e0b" 
            isDarkMode={isDarkMode}
          >
            <ResultCard
              label={`MINIMUM ${pullType === 'straight' ? 'LENGTH' : 'DISTANCE'}`}
              value={`${(results.minLength || results.minDistance).toFixed(1)}"`}
              unit={results.formula}
              color="#3b82f6"
              isDarkMode={isDarkMode}
            />

            <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode} title="NEC Requirement Met">
              <div style={{ fontSize: '0.8125rem' }}>
                <div style={{ marginBottom: '0.25rem' }}>
                  Reference: {results.necReference}
                </div>
                <div>
                  These are minimum dimensions. Larger boxes may be used for ease of installation.
                </div>
              </div>
            </InfoBox>

            {pullType === 'angle' && results.largestRaceway && (
              <InfoBox type="info" isDarkMode={isDarkMode} title="Angle Pull Calculation">
                <div style={{ fontSize: '0.8125rem' }}>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Step 1:</strong> Largest raceway × 6
                  </div>
                  <div style={{ paddingLeft: '1rem', color: colors.subtext, marginBottom: '0.5rem' }}>
                    {results.largestRaceway}" × 6 = {(results.largestRaceway * 6).toFixed(1)}"
                  </div>
                  
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Step 2:</strong> Add other raceways on same wall
                  </div>
                  <div style={{ paddingLeft: '1rem', color: colors.subtext, marginBottom: '0.5rem' }}>
                    {results.sumOfOthers > 0 
                      ? `Sum of others = ${results.sumOfOthers.toFixed(1)}"`
                      : 'No other raceways'
                    }
                  </div>
                  
                  <div style={{ 
                    marginTop: '0.5rem', 
                    paddingTop: '0.5rem', 
                    borderTop: `1px solid ${colors.border}`,
                    fontWeight: '600',
                    color: '#3b82f6'
                  }}>
                    Total: {(results.largestRaceway * 6).toFixed(1)}" + {results.sumOfOthers.toFixed(1)}" = {results.minDistance.toFixed(1)}"
                  </div>
                </div>
              </InfoBox>
            )}
          </Section>
        )}

        {/* NEC Reference */}
        <InfoBox type="info" isDarkMode={isDarkMode} title="NEC 314.28 Requirements">
          <div style={{ fontSize: '0.8125rem' }}>
            Straight: 8× largest • Angle/U: 6× largest + others • For conductors 4 AWG or larger
          </div>
        </InfoBox>
      </CalculatorLayout>
    </div>
  );
});

export default PullBoxCalculator;