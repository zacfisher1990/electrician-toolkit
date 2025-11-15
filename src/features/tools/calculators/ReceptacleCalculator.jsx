import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Plug, CheckCircle, AlertCircle, Home, ChefHat, Bath } from 'lucide-react';
import { exportToPDF } from '../../../utils/pdfExport';
import CalculatorLayout, { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox,
  TabGroup
} from './CalculatorLayout';
import { getColors } from '../../../theme';

// Sub-calculator components
const GeneralReceptaclesCalculator = ({ generalData, setGeneralData, colors, isDarkMode }) => {
  const calculateReceptacles = () => {
    if (!generalData.roomLength || !generalData.roomWidth) return null;
    
    const length = parseFloat(generalData.roomLength);
    const width = parseFloat(generalData.roomWidth);
    const perimeter = (length + width) * 2;
    
    const wallReceptacles = Math.max(2, Math.ceil(perimeter / 12));
    
    let counterReceptacles = 0;
    if (generalData.hasCounters) {
      const counterLength = parseFloat(generalData.counterLength) || 0;
      counterReceptacles = Math.max(2, Math.ceil(counterLength / 2));
    }
    
    const totalReceptacles = wallReceptacles + counterReceptacles;
    const circuits15A = Math.ceil(totalReceptacles / 8);
    const circuits20A = Math.ceil(totalReceptacles / 10);
    
    return {
      perimeter: perimeter.toFixed(1),
      wallReceptacles,
      counterReceptacles,
      totalReceptacles,
      circuits15A,
      circuits20A
    };
  };

  const results = calculateReceptacles();

  return (
    <>
      <Section 
        title="Room Dimensions" 
        icon={Home} 
        color="#3b82f6" 
        isDarkMode={isDarkMode}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '0.75rem' 
        }}>
          <InputGroup label="Room Length (feet)" isDarkMode={isDarkMode}>
            <Input
              type="number"
              value={generalData.roomLength}
              onChange={(e) => setGeneralData(prev => ({...prev, roomLength: e.target.value}))}
              placeholder="Enter length"
              isDarkMode={isDarkMode}
            />
          </InputGroup>

          <InputGroup label="Room Width (feet)" isDarkMode={isDarkMode}>
            <Input
              type="number"
              value={generalData.roomWidth}
              onChange={(e) => setGeneralData(prev => ({...prev, roomWidth: e.target.value}))}
              placeholder="Enter width"
              isDarkMode={isDarkMode}
            />
          </InputGroup>
        </div>

        <div style={{ marginTop: '0.75rem' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: colors.text, 
            cursor: 'pointer' 
          }}>
            <input
              type="checkbox"
              checked={generalData.hasCounters}
              onChange={(e) => setGeneralData(prev => ({...prev, hasCounters: e.target.checked}))}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            Room has countertops/islands
          </label>
        </div>

        {generalData.hasCounters && (
          <div style={{ marginTop: '0.75rem' }}>
            <InputGroup 
              label="Counter Length (feet)" 
              helpText="For kitchens/break rooms"
              isDarkMode={isDarkMode}
            >
              <Input
                type="number"
                value={generalData.counterLength}
                onChange={(e) => setGeneralData(prev => ({...prev, counterLength: e.target.value}))}
                placeholder="Enter counter length"
                isDarkMode={isDarkMode}
              />
            </InputGroup>
          </div>
        )}
      </Section>

      {results && (
        <Section 
          title="Required Receptacles" 
          icon={CheckCircle} 
          color="#10b981" 
          isDarkMode={isDarkMode}
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: results.counterReceptacles > 0 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', 
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <ResultCard
              label="WALL RECEPTACLES"
              value={results.wallReceptacles}
              color="#3b82f6"
              isDarkMode={isDarkMode}
            />
            
            {results.counterReceptacles > 0 && (
              <ResultCard
                label="COUNTER RECEPTACLES"
                value={results.counterReceptacles}
                variant="subtle"
                isDarkMode={isDarkMode}
              />
            )}

            <ResultCard
              label="TOTAL NEEDED"
              value={results.totalReceptacles}
              variant="subtle"
              isDarkMode={isDarkMode}
            />
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <ResultCard
              label="15A CIRCUITS"
              value={results.circuits15A}
              variant="subtle"
              isDarkMode={isDarkMode}
            />

            <ResultCard
              label="20A CIRCUITS"
              value={results.circuits20A}
              variant="subtle"
              isDarkMode={isDarkMode}
            />
          </div>

          <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode} title="NEC Requirements Met">
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ marginBottom: '0.25rem' }}>Room perimeter: {results.perimeter} ft</div>
              <div style={{ marginBottom: results.counterReceptacles > 0 ? '0.25rem' : 0 }}>
                Spacing: One receptacle every 12 feet of wall space
              </div>
              {results.counterReceptacles > 0 && (
                <div>Counter spacing: One receptacle every 2 feet</div>
              )}
            </div>
          </InfoBox>

          <InfoBox type="info" isDarkMode={isDarkMode} title="NEC 210.52 Requirements">
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
              <li style={{ marginBottom: '0.25rem' }}>Wall: Receptacle within 6 ft of doorway, then every 12 ft</li>
              <li style={{ marginBottom: '0.25rem' }}>No point along wall more than 6 ft from receptacle</li>
              <li style={{ marginBottom: '0.25rem' }}>Counters: One receptacle every 24 inches of counter space</li>
              <li>Kitchen requires min. 2 small appliance circuits (20A)</li>
            </ul>
          </InfoBox>
        </Section>
      )}
    </>
  );
};

const KitchenReceptaclesCalculator = ({ kitchenData, setKitchenData, colors, isDarkMode }) => {
  const calculateKitchen = () => {
    if (!kitchenData.counterLength) return null;
    
    const counterLength = parseFloat(kitchenData.counterLength);
    const islandLength = parseFloat(kitchenData.islandLength) || 0;
    
    const counterReceptacles = Math.max(2, Math.ceil(counterLength / 2));
    const islandReceptacles = islandLength >= 2 ? Math.max(1, Math.ceil(islandLength / 4)) : 0;
    const smallApplianceCircuits = 2;
    const gfciRequired = counterReceptacles + islandReceptacles;
    
    let dedicatedCircuits = 0;
    if (kitchenData.dishwasher) dedicatedCircuits++;
    if (kitchenData.disposer) dedicatedCircuits++;
    if (kitchenData.microwave) dedicatedCircuits++;
    if (kitchenData.range) dedicatedCircuits++;
    
    return {
      counterReceptacles,
      islandReceptacles,
      totalReceptacles: counterReceptacles + islandReceptacles,
      smallApplianceCircuits,
      dedicatedCircuits,
      gfciRequired
    };
  };

  const results = calculateKitchen();

  return (
    <>
      <Section 
        title="Counter & Island" 
        icon={ChefHat} 
        color="#3b82f6" 
        isDarkMode={isDarkMode}
      >
        <InputGroup label="Counter Length (feet)" isDarkMode={isDarkMode}>
          <Input
            type="number"
            value={kitchenData.counterLength}
            onChange={(e) => setKitchenData(prev => ({...prev, counterLength: e.target.value}))}
            placeholder="Enter counter length"
            isDarkMode={isDarkMode}
          />
        </InputGroup>

        <InputGroup 
          label="Island Length (feet) - Optional" 
          helpText="Required if island ≥ 24&quot; long × 12&quot; wide"
          isDarkMode={isDarkMode}
        >
          <Input
            type="number"
            value={kitchenData.islandLength}
            onChange={(e) => setKitchenData(prev => ({...prev, islandLength: e.target.value}))}
            placeholder="0"
            isDarkMode={isDarkMode}
          />
        </InputGroup>

        <div style={{ 
          background: colors.inputBg,
          padding: '1rem',
          borderRadius: '0.5rem',
          border: `1px solid ${colors.border}`,
          marginTop: '0.75rem'
        }}>
          <div style={{ 
            fontWeight: '600', 
            marginBottom: '0.75rem', 
            color: colors.text, 
            fontSize: '0.875rem' 
          }}>
            Dedicated Appliance Circuits:
          </div>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {[
              { key: 'dishwasher', label: 'Dishwasher (dedicated 15A/20A)' },
              { key: 'disposer', label: 'Garbage Disposer (dedicated 15A/20A)' },
              { key: 'microwave', label: 'Microwave (dedicated 20A)' },
              { key: 'range', label: 'Range/Cooktop (240V, 40-50A)' }
            ].map(appliance => (
              <label 
                key={appliance.key}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem', 
                  fontSize: '0.875rem', 
                  color: colors.text, 
                  cursor: 'pointer' 
                }}
              >
                <input
                  type="checkbox"
                  checked={kitchenData[appliance.key]}
                  onChange={(e) => setKitchenData(prev => ({...prev, [appliance.key]: e.target.checked}))}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                {appliance.label}
              </label>
            ))}
          </div>
        </div>
      </Section>

      {results && (
        <Section 
          title="Kitchen Requirements" 
          icon={CheckCircle} 
          color="#10b981" 
          isDarkMode={isDarkMode}
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <ResultCard
              label="COUNTER RECEPTACLES"
              value={results.counterReceptacles}
              color="#3b82f6"
              isDarkMode={isDarkMode}
            />

            {results.islandReceptacles > 0 && (
              <ResultCard
                label="ISLAND RECEPTACLES"
                value={results.islandReceptacles}
                variant="subtle"
                isDarkMode={isDarkMode}
              />
            )}

            <ResultCard
              label="GFCI REQUIRED"
              value={results.gfciRequired}
              variant="subtle"
              isDarkMode={isDarkMode}
            />
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <ResultCard
              label="SMALL APPLIANCE CIRCUITS"
              value={results.smallApplianceCircuits}
              unit="20A each"
              variant="subtle"
              isDarkMode={isDarkMode}
            />

            <ResultCard
              label="DEDICATED CIRCUITS"
              value={results.dedicatedCircuits}
              unit="for appliances"
              variant="subtle"
              isDarkMode={isDarkMode}
            />
          </div>

          <InfoBox type="warning" icon={AlertCircle} isDarkMode={isDarkMode} title="GFCI Protection Required">
            <div style={{ fontSize: '0.8125rem' }}>
              All {results.gfciRequired} countertop receptacles require GFCI protection per NEC 210.8(A)
            </div>
          </InfoBox>

          <InfoBox type="info" isDarkMode={isDarkMode} title="Kitchen Requirements">
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
              <li style={{ marginBottom: '0.25rem' }}>Min. 2 small appliance circuits (20A) for countertop receptacles</li>
              <li style={{ marginBottom: '0.25rem' }}>Counter receptacles: One every 24 inches, all GFCI protected</li>
              <li style={{ marginBottom: '0.25rem' }}>Island receptacles required if island ≥ 24&quot; long × 12&quot; wide</li>
              <li>Dishwasher, disposer typically need dedicated 15A or 20A circuits</li>
            </ul>
          </InfoBox>
        </Section>
      )}
    </>
  );
};

const BathroomReceptaclesCalculator = ({ bathroomData, setBathroomData, colors, isDarkMode }) => {
  const calculateBathroom = () => {
    const numBasins = parseInt(bathroomData.numBasins) || 1;
    const hasTub = bathroomData.hasTub;
    
    let receptacles = Math.max(1, numBasins);
    
    if (hasTub) {
      receptacles = Math.max(receptacles, 2);
    }
    
    const dedicatedCircuits = bathroomData.sharedCircuit ? 1 : numBasins >= 2 ? 2 : 1;
    
    return {
      receptacles,
      dedicatedCircuits,
      gfciRequired: receptacles,
      numBasins
    };
  };

  const results = calculateBathroom();

  return (
    <>
      <Section 
        title="Bathroom Configuration" 
        icon={Bath} 
        color="#3b82f6" 
        isDarkMode={isDarkMode}
      >
        <InputGroup label="Number of Sinks/Basins" isDarkMode={isDarkMode}>
          <Select
            value={bathroomData.numBasins}
            onChange={(e) => setBathroomData(prev => ({...prev, numBasins: e.target.value}))}
            isDarkMode={isDarkMode}
            options={[
              { value: '1', label: '1 Basin' },
              { value: '2', label: '2 Basins (Double Vanity)' },
              { value: '3', label: '3+ Basins' }
            ]}
          />
        </InputGroup>

        <div style={{ marginTop: '0.75rem' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: colors.text, 
            cursor: 'pointer' 
          }}>
            <input
              type="checkbox"
              checked={bathroomData.hasTub}
              onChange={(e) => setBathroomData(prev => ({...prev, hasTub: e.target.checked}))}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            Has Bathtub/Shower Area
          </label>
        </div>

        <div style={{ marginTop: '0.75rem' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: colors.text, 
            cursor: 'pointer' 
          }}>
            <input
              type="checkbox"
              checked={bathroomData.sharedCircuit}
              onChange={(e) => setBathroomData(prev => ({...prev, sharedCircuit: e.target.checked}))}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            Share circuit with other bathrooms
          </label>
          <div style={{ 
            fontSize: '0.75rem', 
            color: colors.subtext, 
            marginTop: '0.25rem', 
            marginLeft: '1.625rem',
            fontStyle: 'italic'
          }}>
            One 20A circuit can serve multiple bathrooms if only serving receptacles
          </div>
        </div>
      </Section>

      {results && (
        <Section 
          title="Bathroom Requirements" 
          icon={CheckCircle} 
          color="#10b981" 
          isDarkMode={isDarkMode}
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <ResultCard
              label="RECEPTACLES NEEDED"
              value={results.receptacles}
              color="#3b82f6"
              isDarkMode={isDarkMode}
            />

            <ResultCard
              label="20A CIRCUITS"
              value={results.dedicatedCircuits}
              variant="subtle"
              isDarkMode={isDarkMode}
            />
          </div>

          <InfoBox type="warning" icon={AlertCircle} isDarkMode={isDarkMode} title="GFCI Protection Required">
            <div style={{ fontSize: '0.8125rem' }}>
              All {results.gfciRequired} bathroom receptacles require GFCI protection per NEC 210.8(A)
            </div>
          </InfoBox>

          <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode} title="Installation Guidelines">
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ marginBottom: '0.25rem' }}>• At least one receptacle within 3 feet of each basin</div>
              <div style={{ marginBottom: '0.25rem' }}>• Receptacles must be readily accessible (not behind toilet)</div>
              <div>• Install at least 12 inches above countertop</div>
            </div>
          </InfoBox>

          <InfoBox type="info" isDarkMode={isDarkMode} title="NEC Bathroom Requirements">
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
              <li style={{ marginBottom: '0.25rem' }}>NEC 210.52(D): Min. 1 receptacle within 3 ft of basin</li>
              <li style={{ marginBottom: '0.25rem' }}>NEC 210.11(C)(3): Min. 1 dedicated 20A circuit for bathroom receptacles</li>
              <li style={{ marginBottom: '0.25rem' }}>NEC 210.8(A): All bathroom receptacles require GFCI protection</li>
              <li>One 20A circuit can serve receptacles in multiple bathrooms</li>
            </ul>
          </InfoBox>
        </Section>
      )}
    </>
  );
};

const ReceptacleCalculator = forwardRef(({ isDarkMode = false, onBack }, ref) => {
  const [activeTab, setActiveTab] = useState('general');

  const [generalData, setGeneralData] = useState({
    roomLength: '',
    roomWidth: '',
    hasCounters: false,
    counterLength: ''
  });

  const [kitchenData, setKitchenData] = useState({
    counterLength: '',
    islandLength: '',
    dishwasher: false,
    disposer: false,
    microwave: false,
    range: false
  });

  const [bathroomData, setBathroomData] = useState({
    numBasins: '1',
    hasTub: false,
    sharedCircuit: false
  });

  const colors = getColors(isDarkMode);

  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      let pdfData;

      if (activeTab === 'general') {
        if (!generalData.roomLength || !generalData.roomWidth) {
          alert('Please enter room dimensions before exporting');
          return;
        }

        const length = parseFloat(generalData.roomLength);
        const width = parseFloat(generalData.roomWidth);
        const perimeter = ((length + width) * 2).toFixed(1);
        const wallReceptacles = Math.max(2, Math.ceil(perimeter / 12));
        
        let counterReceptacles = 0;
        if (generalData.hasCounters && generalData.counterLength) {
          const counterLength = parseFloat(generalData.counterLength);
          counterReceptacles = Math.max(2, Math.ceil(counterLength / 2));
        }
        
        const totalReceptacles = wallReceptacles + counterReceptacles;
        const circuits15A = Math.ceil(totalReceptacles / 8);
        const circuits20A = Math.ceil(totalReceptacles / 10);

        const inputs = {
          roomLength: `${generalData.roomLength} feet`,
          roomWidth: `${generalData.roomWidth} feet`,
          roomPerimeter: `${perimeter} feet`
        };

        if (generalData.hasCounters && generalData.counterLength) {
          inputs.counterLength = `${generalData.counterLength} feet`;
        }

        const results = {
          wallReceptacles: `${wallReceptacles} receptacles`,
          totalReceptacles: `${totalReceptacles} receptacles`,
          circuits15A: `${circuits15A} circuits (15A)`,
          circuits20A: `${circuits20A} circuits (20A)`
        };

        if (counterReceptacles > 0) {
          results.counterReceptacles = `${counterReceptacles} receptacles`;
        }

        pdfData = {
          calculatorName: 'Receptacle Calculator - General Room',
          inputs,
          results,
          additionalInfo: {
            spacing: 'One receptacle every 12 feet of wall space',
            rule: 'No point along wall more than 6 feet from receptacle',
            counterRule: counterReceptacles > 0 ? 'Counter receptacles: one every 24 inches' : null
          },
          necReferences: [
            'NEC 210.52(A) - General Provisions',
            'Receptacle within 6 ft of doorway, then every 12 ft',
            'No point along wall more than 6 ft from receptacle',
            'Conservative: 8 receptacles per 15A circuit, 10 per 20A circuit'
          ]
        };

      } else if (activeTab === 'kitchen') {
        if (!kitchenData.counterLength) {
          alert('Please enter counter length before exporting');
          return;
        }

        const counterLength = parseFloat(kitchenData.counterLength);
        const islandLength = parseFloat(kitchenData.islandLength) || 0;
        
        const counterReceptacles = Math.max(2, Math.ceil(counterLength / 2));
        const islandReceptacles = islandLength >= 2 ? Math.max(1, Math.ceil(islandLength / 4)) : 0;
        const totalReceptacles = counterReceptacles + islandReceptacles;
        const smallApplianceCircuits = 2;
        const gfciRequired = totalReceptacles;
        
        let dedicatedCircuits = 0;
        const appliances = [];
        if (kitchenData.dishwasher) {
          dedicatedCircuits++;
          appliances.push('Dishwasher (15A/20A)');
        }
        if (kitchenData.disposer) {
          dedicatedCircuits++;
          appliances.push('Garbage Disposer (15A/20A)');
        }
        if (kitchenData.microwave) {
          dedicatedCircuits++;
          appliances.push('Microwave (20A)');
        }
        if (kitchenData.range) {
          dedicatedCircuits++;
          appliances.push('Range/Cooktop (240V, 40-50A)');
        }

        const inputs = {
          counterLength: `${kitchenData.counterLength} feet`
        };

        if (islandLength > 0) {
          inputs.islandLength = `${kitchenData.islandLength} feet`;
        }

        if (appliances.length > 0) {
          inputs.dedicatedAppliances = appliances.join(', ');
        }

        const results = {
          counterReceptacles: `${counterReceptacles} receptacles`,
          totalReceptacles: `${totalReceptacles} receptacles`,
          smallApplianceCircuits: `${smallApplianceCircuits} circuits (20A each)`,
          gfciRequired: `${gfciRequired} GFCI-protected receptacles`
        };

        if (islandReceptacles > 0) {
          results.islandReceptacles = `${islandReceptacles} receptacles`;
        }

        if (dedicatedCircuits > 0) {
          results.dedicatedCircuits = `${dedicatedCircuits} dedicated circuits`;
        }

        pdfData = {
          calculatorName: 'Receptacle Calculator - Kitchen',
          inputs,
          results,
          additionalInfo: {
            counterSpacing: 'One receptacle every 24 inches of counter space',
            islandRequirement: 'Island receptacles required if island ≥ 24" long × 12" wide',
            gfciNote: 'All countertop receptacles require GFCI protection'
          },
          necReferences: [
            'NEC 210.52(C) - Countertops',
            'NEC 210.11(C)(1) - Min. 2 small appliance circuits (20A)',
            'NEC 210.8(A) - GFCI protection required for all countertop receptacles',
            'Island receptacles required if ≥ 24" long × 12" wide'
          ]
        };

      } else if (activeTab === 'bathroom') {
        const numBasins = parseInt(bathroomData.numBasins) || 1;
        const hasTub = bathroomData.hasTub;
        
        let receptacles = Math.max(1, numBasins);
        if (hasTub) {
          receptacles = Math.max(receptacles, 2);
        }
        
        const dedicatedCircuits = bathroomData.sharedCircuit ? 1 : numBasins >= 2 ? 2 : 1;
        const gfciRequired = receptacles;

        const basinText = numBasins === 1 ? '1 Basin' : numBasins === 2 ? '2 Basins (Double Vanity)' : '3+ Basins';

        const inputs = {
          numberOfBasins: basinText,
          hasTubShower: hasTub ? 'Yes' : 'No',
          sharedCircuit: bathroomData.sharedCircuit ? 'Yes (shared with other bathrooms)' : 'No (dedicated)'
        };

        const results = {
          receptaclesNeeded: `${receptacles} receptacles`,
          dedicatedCircuits: `${dedicatedCircuits} circuits (20A)`,
          gfciRequired: `${gfciRequired} GFCI-protected receptacles`
        };

        pdfData = {
          calculatorName: 'Receptacle Calculator - Bathroom',
          inputs,
          results,
          additionalInfo: {
            spacing: 'At least one receptacle within 3 feet of each basin',
            installation: 'Install at least 12 inches above countertop',
            accessibility: 'Receptacles must be readily accessible (not behind toilet)',
            gfciNote: 'All bathroom receptacles require GFCI protection'
          },
          necReferences: [
            'NEC 210.52(D) - Min. 1 receptacle within 3 ft of basin',
            'NEC 210.11(C)(3) - Min. 1 dedicated 20A circuit for bathroom receptacles',
            'NEC 210.8(A) - All bathroom receptacles require GFCI protection',
            'One 20A circuit can serve receptacles in multiple bathrooms'
          ]
        };
      }

      exportToPDF(pdfData);
    }
  }));

  const tabs = [
    { id: 'general', label: 'General Room', icon: Home },
    { id: 'kitchen', label: 'Kitchen', icon: ChefHat },
    { id: 'bathroom', label: 'Bathroom', icon: Bath }
  ];

  return (
    <div style={{ margin: '0 -1rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        <TabGroup 
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          isDarkMode={isDarkMode}
        />

        {activeTab === 'general' && (
          <GeneralReceptaclesCalculator 
            generalData={generalData} 
            setGeneralData={setGeneralData} 
            colors={colors}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'kitchen' && (
          <KitchenReceptaclesCalculator 
            kitchenData={kitchenData} 
            setKitchenData={setKitchenData} 
            colors={colors}
            isDarkMode={isDarkMode}
          />
        )}

        {activeTab === 'bathroom' && (
          <BathroomReceptaclesCalculator 
            bathroomData={bathroomData} 
            setBathroomData={setBathroomData} 
            colors={colors}
            isDarkMode={isDarkMode}
          />
        )}
      </CalculatorLayout>
    </div>
  );
});

export default ReceptacleCalculator;