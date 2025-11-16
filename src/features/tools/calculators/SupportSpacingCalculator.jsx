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

    // First support must be within termination distance from first box
    // Last support must be within termination distance from second box
    
    if (length <= termination * 2) {
      // Run is very short - might only need 1-2 supports
      if (length <= termination) {
        // Single support can satisfy both terminations
        return {
          totalSupports: 1,
          intermediateSupports: 0,
          firstSupport: length / 2,
          lastSupport: length / 2,
          spacing: 0,
          maxSpacing: spacing,
          terminationDistance: requirements.termination
        };
      } else {
        // Need support near each end
        return {
          totalSupports: 2,
          intermediateSupports: 0,
          firstSupport: termination,
          lastSupport: length - termination,
          spacing: length - (termination * 2),
          maxSpacing: spacing,
          terminationDistance: requirements.termination
        };
      }
    }

    // Calculate the distance between first and last supports
    const firstSupportPos = termination;
    const lastSupportPos = length - termination;
    const distanceBetweenEndSupports = lastSupportPos - firstSupportPos;

    // Calculate how many intermediate supports needed between first and last
    // We need enough supports so spacing doesn't exceed max
    const spansNeeded = Math.ceil(distanceBetweenEndSupports / spacing);
    const actualSpacing = distanceBetweenEndSupports / spansNeeded;
    
    // Total supports = first support + intermediate supports + last support
    // But intermediate supports = spansNeeded - 1 (since spansNeeded includes the span to last support)
    const intermediateSupports = spansNeeded - 1;
    const totalSupports = 1 + intermediateSupports + 1; // first + intermediate + last

    return {
      totalSupports: totalSupports,
      intermediateSupports: intermediateSupports,
      firstSupport: firstSupportPos,
      lastSupport: lastSupportPos,
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

        {/* Support Calculation Results - Show right after run length input */}
        {supportCalc && requirements && (
          <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode} title={`Support Layout for ${runLength}' Run:`}>
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>First support from box:</span>
                <span style={{ fontWeight: '600' }}>{supportCalc.firstSupport.toFixed(2)}' ({(supportCalc.firstSupport * 12).toFixed(1)}")</span>
              </div>
              
              {supportCalc.intermediateSupports > 0 && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>Intermediate supports:</span>
                    <span style={{ fontWeight: '600' }}>{supportCalc.intermediateSupports}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span>Spacing between supports:</span>
                    <span style={{ fontWeight: '600' }}>{supportCalc.spacing.toFixed(2)}' (max {supportCalc.maxSpacing}')</span>
                  </div>
                </>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span>Last support from box:</span>
                <span style={{ fontWeight: '600' }}>{(parseFloat(runLength) - supportCalc.lastSupport).toFixed(2)}' ({((parseFloat(runLength) - supportCalc.lastSupport) * 12).toFixed(1)}")</span>
              </div>
              
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
                <span style={{ fontWeight: '700', fontSize: '1rem' }}>{supportCalc.totalSupports}</span>
              </div>
            </div>
          </InfoBox>
        )}

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