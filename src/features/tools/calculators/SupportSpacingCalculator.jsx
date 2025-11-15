import React, { useState } from 'react';
import { Ruler, CheckCircle, AlertCircle, Cable, ArrowUpDown, Info, Circle, MoveHorizontal, MoveVertical } from 'lucide-react';
import {
  materialTypes,
  cableTypes,
  conduitTypes,
  conduitSizes,
  getCableSpacing,
  getConduitSpacing,
  generalRequirements,
  necReferences
} from './supportSpacingData';
import CalculatorLayout, { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox,
  TabGroup
} from './CalculatorLayout';

const SupportSpacingCalculator = ({ isDarkMode = false, onBack }) => {
  const [materialType, setMaterialType] = useState('cable');
  const [cableType, setCableType] = useState('nm-cable');
  const [conduitType, setConduitType] = useState('emt');
  const [conduitSize, setConduitSize] = useState('3/4');
  const [orientation, setOrientation] = useState('horizontal');
  const [runLength, setRunLength] = useState('');

  // Get spacing requirements
  const getSpacingRequirements = () => {
    if (materialType === 'cable') {
      return getCableSpacing(cableType, orientation);
    } else {
      return getConduitSpacing(conduitType, conduitSize, orientation);
    }
  };

  const requirements = getSpacingRequirements();

  // Calculate number of supports needed
  const calculateSupports = () => {
    if (!requirements || !runLength || parseFloat(runLength) <= 0) {
      return null;
    }

    const length = parseFloat(runLength);
    const spacing = requirements.spacing;
    const termination = requirements.termination / 12; // Convert inches to feet

    // First support must be within termination distance
    let remainingLength = length - termination;
    
    if (remainingLength <= 0) {
      // Run is shorter than termination distance - only need supports at ends
      return {
        supportsNeeded: 2,
        totalWithEnds: 2,
        intermediateSupports: 0,
        firstSupport: Math.min(length / 2, termination),
        lastSupport: length - Math.min(length / 2, termination),
        spacing: spacing,
        terminationDistance: requirements.termination
      };
    }

    // Calculate intermediate supports
    const intermediateSupports = Math.ceil(remainingLength / spacing);
    const actualSpacing = remainingLength / intermediateSupports;

    return {
      supportsNeeded: intermediateSupports + 1, // +1 for the first support near termination
      totalWithEnds: intermediateSupports + 2, // +2 including both ends
      intermediateSupports: intermediateSupports,
      firstSupport: termination,
      lastSupport: length - termination,
      spacing: actualSpacing,
      maxSpacing: spacing,
      terminationDistance: requirements.termination
    };
  };

  const supportCalc = calculateSupports();

  // Material type tabs
  const materialTabs = materialTypes.map(type => ({
    id: type.value,
    label: type.label,
    icon: type.value === 'cable' ? Cable : Circle
  }));

  // Orientation tabs
  const orientationTabs = [
    { id: 'horizontal', label: 'Horizontal', icon: MoveHorizontal },
    { id: 'vertical', label: 'Vertical', icon: MoveVertical }
  ];

  return (
    <div style={{ margin: '0 -1rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        {/* Material Selection */}
        <Section 
          title="Material Type" 
          icon={Cable} 
          color="#3b82f6" 
          isDarkMode={isDarkMode}
        >
          <TabGroup
            tabs={materialTabs}
            activeTab={materialType}
            onChange={setMaterialType}
            isDarkMode={isDarkMode}
          />
        </Section>

        {/* Cable/Conduit Selection */}
        <Section 
          title={materialType === 'cable' ? 'Cable Type' : 'Conduit Type & Size'} 
          icon={materialType === 'cable' ? Cable : Circle} 
          color="#8b5cf6" 
          isDarkMode={isDarkMode}
        >
          {materialType === 'cable' ? (
            <InputGroup label="Cable Type" isDarkMode={isDarkMode}>
              <Select
                value={cableType}
                onChange={(e) => setCableType(e.target.value)}
                isDarkMode={isDarkMode}
                options={Object.entries(cableTypes).map(([key, cable]) => ({
                  value: key,
                  label: cable.name
                }))}
              />
            </InputGroup>
          ) : (
            <>
              <InputGroup label="Conduit Type" isDarkMode={isDarkMode}>
                <Select
                  value={conduitType}
                  onChange={(e) => setConduitType(e.target.value)}
                  isDarkMode={isDarkMode}
                  options={Object.entries(conduitTypes).map(([key, conduit]) => ({
                    value: key,
                    label: conduit.name
                  }))}
                />
              </InputGroup>

              <InputGroup label="Conduit Size" isDarkMode={isDarkMode}>
                <Select
                  value={conduitSize}
                  onChange={(e) => setConduitSize(e.target.value)}
                  isDarkMode={isDarkMode}
                  options={conduitSizes.map(size => ({
                    value: size,
                    label: `${size}"`
                  }))}
                />
              </InputGroup>
            </>
          )}
        </Section>

        {/* Orientation Selection */}
        <Section 
          title="Installation Orientation" 
          icon={MoveHorizontal} 
          color="#f59e0b" 
          isDarkMode={isDarkMode}
        >
          <TabGroup
            tabs={orientationTabs}
            activeTab={orientation}
            onChange={setOrientation}
            isDarkMode={isDarkMode}
          />
        </Section>

        {/* Run Length Input */}
        <Section 
          title="Run Length (Optional)" 
          icon={Ruler} 
          color="#10b981" 
          isDarkMode={isDarkMode}
        >
          <InputGroup 
            label="Total Length" 
            isDarkMode={isDarkMode}
            helpText="Enter your run length to calculate the exact number of supports needed"
          >
            <Input
              type="number"
              value={runLength}
              onChange={(e) => setRunLength(e.target.value)}
              placeholder="Enter length"
              step="0.5"
              min="0"
              isDarkMode={isDarkMode}
              unit="ft"
            />
          </InputGroup>
        </Section>

        {/* Requirements Display */}
        {requirements && (
          <Section isDarkMode={isDarkMode}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '0.75rem', 
              marginBottom: '0.75rem' 
            }}>
              <ResultCard
                label="Support Spacing"
                value={requirements.spacing}
                unit="feet max"
                color="#3b82f6"
                variant="prominent"
                isDarkMode={isDarkMode}
              />
              
              <ResultCard
                label="From Termination"
                value={requirements.termination}
                unit="inches max"
                color="#8b5cf6"
                variant="prominent"
                isDarkMode={isDarkMode}
              />
            </div>

            <InfoBox type="info" icon={CheckCircle} isDarkMode={isDarkMode} title={`NEC ${requirements.necRef}`}>
              <div style={{ fontSize: '0.8125rem' }}>
                {requirements.notes}
              </div>
            </InfoBox>

            {/* Support Calculation Results */}
            {supportCalc && (
              <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode} title={`Support Layout for ${runLength}' Run:`}>
                <div style={{ fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>First support from termination:</span>
                    <span style={{ fontWeight: '600' }}>{supportCalc.firstSupport.toFixed(2)}' ({(supportCalc.firstSupport * 12).toFixed(1)}")</span>
                  </div>
                  
                  {supportCalc.intermediateSupports > 0 && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>Intermediate supports needed:</span>
                        <span style={{ fontWeight: '600' }}>{supportCalc.intermediateSupports}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>Spacing between supports:</span>
                        <span style={{ fontWeight: '600' }}>{supportCalc.spacing.toFixed(2)}' (max {supportCalc.maxSpacing}')</span>
                      </div>
                    </>
                  )}
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    paddingTop: '0.5rem',
                    borderTop: '1px solid currentColor',
                    marginTop: '0.5rem',
                    opacity: 0.3
                  }}>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    marginTop: '0.25rem'
                  }}>
                    <span style={{ fontWeight: '600' }}>Total supports needed:</span>
                    <span style={{ fontWeight: '700', fontSize: '1rem' }}>{supportCalc.totalWithEnds}</span>
                  </div>
                  
                  <div style={{ 
                    fontSize: '0.75rem',
                    marginTop: '0.5rem',
                    fontStyle: 'italic',
                    opacity: 0.8
                  }}>
                    (Includes supports at both termination points)
                  </div>
                </div>
              </InfoBox>
            )}
          </Section>
        )}

        {/* General NEC Requirements */}
        <InfoBox type="info" icon={Info} isDarkMode={isDarkMode} title={generalRequirements.title}>
          <div style={{ fontSize: '0.8125rem' }}>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: '1.6' }}>
              {generalRequirements.rules.map((rule, index) => (
                <li key={index} style={{ marginBottom: '0.25rem' }}>{rule}</li>
              ))}
            </ul>
          </div>
        </InfoBox>
      </CalculatorLayout>
    </div>
  );
};

export default SupportSpacingCalculator;