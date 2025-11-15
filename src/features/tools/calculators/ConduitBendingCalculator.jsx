import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { TrendingUp, CheckCircle, Info, CornerRightDown, CornerUpRight, Layers, Grid3X3 } from 'lucide-react';
import { exportToPDF } from '../../../utils/pdfExport';
import CalculatorLayout, { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox
} from './CalculatorLayout';

// Offset Bend Calculator
const OffsetBendCalculator = ({ offsetData, setOffsetData, isDarkMode }) => {
  const multipliers = {
    '10': { distance: 6.0, shrink: 0.01 },
    '22.5': { distance: 2.6, shrink: 0.06 },
    '30': { distance: 2.0, shrink: 0.25 },
    '45': { distance: 1.4, shrink: 0.41 },
    '60': { distance: 1.2, shrink: 0.58 }
  };

  const calculateOffset = () => {
    if (!offsetData.obstacleHeight) return null;
    const height = parseFloat(offsetData.obstacleHeight);
    const mult = multipliers[offsetData.bendAngle];
    
    return {
      distanceBetweenBends: (height * mult.distance).toFixed(2),
      shrinkage: (height * mult.shrink).toFixed(2),
      angle: offsetData.bendAngle
    };
  };

  const results = calculateOffset();

  return (
    <div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '0.75rem',
        marginBottom: '0.75rem'
      }}>
        <InputGroup 
          label="Obstacle Height" 
          helpText="Height to clear obstacle"
          isDarkMode={isDarkMode}
        >
          <Input
            type="number"
            value={offsetData.obstacleHeight}
            onChange={(e) => setOffsetData(prev => ({...prev, obstacleHeight: e.target.value}))}
            placeholder="Enter height"
            isDarkMode={isDarkMode}
            unit="in"
          />
        </InputGroup>

        <InputGroup 
          label="Bend Angle" 
          helpText="Most common: 30° or 45°"
          isDarkMode={isDarkMode}
        >
          <Select
            value={offsetData.bendAngle}
            onChange={(e) => setOffsetData(prev => ({...prev, bendAngle: e.target.value}))}
            isDarkMode={isDarkMode}
            options={[
              { value: '10', label: '10°' },
              { value: '22.5', label: '22.5°' },
              { value: '30', label: '30°' },
              { value: '45', label: '45°' },
              { value: '60', label: '60°' }
            ]}
          />
        </InputGroup>
      </div>

      {results && (
        <>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <ResultCard
              label="Distance Between Bends"
              value={`${results.distanceBetweenBends}"`}
              unit=""
              color="#3b82f6"
              isDarkMode={isDarkMode}
            />
            
            <ResultCard
              label="Shrinkage"
              value={`${results.shrinkage}"`}
              unit=""
              variant="subtle"
              isDarkMode={isDarkMode}
            />
          </div>

          <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode} title="How to Make the Bend">
            <div style={{ fontSize: '0.8125rem' }}>
              Mark first bend, measure {results.distanceBetweenBends}" from center of first bend, then make second bend at {results.angle}°.
            </div>
          </InfoBox>

          <InfoBox type="info" icon={Info} isDarkMode={isDarkMode} title="Offset Bend Tips">
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
              <li>30° bends are most common for typical offsets</li>
              <li>45° bends create shorter, steeper offsets</li>
              <li>Always account for shrinkage in measurements</li>
            </ul>
          </InfoBox>
        </>
      )}
    </div>
  );
};

// Stub-Up Calculator
const StubUpCalculator = ({ stubUpData, setStubUpData, isDarkMode }) => {
  const deductions = {
    '1/2': 5, '3/4': 6, '1': 8, '1-1/4': 11, '1-1/2': 14,
    '2': 16, '2-1/2': 21, '3': 26, '3-1/2': 30, '4': 34
  };

  const calculateStubUp = () => {
    if (!stubUpData.stubHeight) return null;
    const height = parseFloat(stubUpData.stubHeight);
    const deduct = deductions[stubUpData.conduitSize];
    
    return {
      markDistance: (height - deduct).toFixed(2),
      deduction: deduct,
      stubHeight: height.toFixed(2)
    };
  };

  const results = calculateStubUp();

  return (
    <div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '0.75rem',
        marginBottom: '0.75rem'
      }}>
        <InputGroup 
          label="Desired Stub Height" 
          helpText="Back of 90° to floor"
          isDarkMode={isDarkMode}
        >
          <Input
            type="number"
            value={stubUpData.stubHeight}
            onChange={(e) => setStubUpData(prev => ({...prev, stubHeight: e.target.value}))}
            placeholder="Enter stub height"
            isDarkMode={isDarkMode}
            unit="in"
          />
        </InputGroup>

        <InputGroup label="Conduit Size" isDarkMode={isDarkMode}>
          <Select
            value={stubUpData.conduitSize}
            onChange={(e) => setStubUpData(prev => ({...prev, conduitSize: e.target.value}))}
            isDarkMode={isDarkMode}
            options={Object.keys(deductions).map(size => ({
              value: size,
              label: `${size}"`
            }))}
          />
        </InputGroup>
      </div>

      {results && (
        <>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <ResultCard
              label="Mark At"
              value={`${results.markDistance}"`}
              unit=""
              color="#3b82f6"
              isDarkMode={isDarkMode}
            />
            
            <ResultCard
              label="Deduction"
              value={`${results.deduction}"`}
              unit=""
              variant="subtle"
              isDarkMode={isDarkMode}
            />

            <ResultCard
              label="Conduit Size"
              value={`${stubUpData.conduitSize}"`}
              unit=""
              variant="subtle"
              isDarkMode={isDarkMode}
            />
          </div>

          <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode} title="How to Bend">
            <div style={{ fontSize: '0.8125rem' }}>
              Measure from end of conduit, mark at {results.markDistance}", line up mark with arrow on bender, make 90° bend.
            </div>
          </InfoBox>

          <InfoBox type="info" icon={Info} isDarkMode={isDarkMode} title="Stub-Up Tips">
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
              <li>Deduction accounts for the radius of the bend</li>
              <li>Larger conduit = larger deduction</li>
              <li>Always check your bender - deductions vary by manufacturer</li>
            </ul>
          </InfoBox>
        </>
      )}
    </div>
  );
};

// 3-Point Saddle Calculator
const SaddleBendCalculator = ({ saddleData, setSaddleData, isDarkMode }) => {
  const calculateSaddle = () => {
    if (!saddleData.obstacleHeight) return null;
    const height = parseFloat(saddleData.obstacleHeight);
    const width = parseFloat(saddleData.obstacleWidth) || (height * 4);
    
    const shrinkage = height * 0.3;
    const distanceToOuterBends = width / 2;

    return {
      centerBend: 45,
      outerBends: 22.5,
      distanceToOuter: distanceToOuterBends.toFixed(2),
      shrinkage: shrinkage.toFixed(2),
      obstacleHeight: height.toFixed(2)
    };
  };

  const results = calculateSaddle();

  return (
    <div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '0.75rem',
        marginBottom: '0.75rem'
      }}>
        <InputGroup label="Obstacle Height" isDarkMode={isDarkMode}>
          <Input
            type="number"
            value={saddleData.obstacleHeight}
            onChange={(e) => setSaddleData(prev => ({...prev, obstacleHeight: e.target.value}))}
            placeholder="Enter height"
            isDarkMode={isDarkMode}
            unit="in"
          />
        </InputGroup>

        <InputGroup 
          label="Obstacle Width" 
          helpText="Optional - defaults to 4x height"
          isDarkMode={isDarkMode}
        >
          <Input
            type="number"
            value={saddleData.obstacleWidth}
            onChange={(e) => setSaddleData(prev => ({...prev, obstacleWidth: e.target.value}))}
            placeholder="Auto: 4x height"
            isDarkMode={isDarkMode}
            unit="in"
          />
        </InputGroup>
      </div>

      {results && (
        <>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <ResultCard
              label="Center Bend"
              value={`${results.centerBend}°`}
              unit=""
              color="#3b82f6"
              isDarkMode={isDarkMode}
            />
            
            <ResultCard
              label="Outer Bends"
              value={`${results.outerBends}°`}
              unit=""
              variant="subtle"
              isDarkMode={isDarkMode}
            />

            <ResultCard
              label="Distance to Outer"
              value={`${results.distanceToOuter}"`}
              unit=""
              variant="subtle"
              isDarkMode={isDarkMode}
            />
          </div>

          <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode} title="Bending Sequence">
            <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
              <li>Mark center of obstacle on conduit</li>
              <li>Make 45° center bend at mark</li>
              <li>Measure {results.distanceToOuter}" from center each direction</li>
              <li>Make 22.5° bends on each side (opposite direction)</li>
            </ol>
          </InfoBox>

          <InfoBox type="info" icon={Info} isDarkMode={isDarkMode} title="3-Point Saddle Tips">
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
              <li>Center bend goes up, outer bends go down</li>
              <li>Most common for going over pipes or other conduits</li>
              <li>Mark all three bend locations before starting</li>
            </ul>
          </InfoBox>
        </>
      )}
    </div>
  );
};

// 4-Point Saddle Calculator
const FourPointSaddleCalculator = ({ fourPointData, setFourPointData, isDarkMode }) => {
  const calculateFourPointSaddle = () => {
    if (!fourPointData.obstacleHeight || !fourPointData.obstacleWidth) return null;
    
    const height = parseFloat(fourPointData.obstacleHeight);
    const width = parseFloat(fourPointData.obstacleWidth);
    
    const distanceToOuter = width / 2;
    const innerSpacing = width / 4;
    const shrinkage = height * 0.15;

    return {
      bendAngle: 22.5,
      distanceToOuter: distanceToOuter.toFixed(2),
      innerSpacing: innerSpacing.toFixed(2),
      shrinkage: shrinkage.toFixed(2)
    };
  };

  const results = calculateFourPointSaddle();

  return (
    <div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '0.75rem',
        marginBottom: '0.75rem'
      }}>
        <InputGroup label="Obstacle Height" isDarkMode={isDarkMode}>
          <Input
            type="number"
            value={fourPointData.obstacleHeight}
            onChange={(e) => setFourPointData(prev => ({...prev, obstacleHeight: e.target.value}))}
            placeholder="Enter height"
            isDarkMode={isDarkMode}
            unit="in"
          />
        </InputGroup>

        <InputGroup label="Obstacle Width" isDarkMode={isDarkMode}>
          <Input
            type="number"
            value={fourPointData.obstacleWidth}
            onChange={(e) => setFourPointData(prev => ({...prev, obstacleWidth: e.target.value}))}
            placeholder="Enter width"
            isDarkMode={isDarkMode}
            unit="in"
          />
        </InputGroup>
      </div>

      {results && (
        <>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', 
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <ResultCard
              label="All Bends"
              value={`${results.bendAngle}°`}
              unit=""
              color="#3b82f6"
              isDarkMode={isDarkMode}
            />
            
            <ResultCard
              label="Outer Distance"
              value={`${results.distanceToOuter}"`}
              unit=""
              variant="subtle"
              isDarkMode={isDarkMode}
            />

            <ResultCard
              label="Inner Spacing"
              value={`${results.innerSpacing}"`}
              unit=""
              variant="subtle"
              isDarkMode={isDarkMode}
            />
          </div>

          <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode} title="Bending Sequence">
            <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
              <li>Mark center of obstacle on conduit</li>
              <li>Measure {results.distanceToOuter}" from center (outer bends)</li>
              <li>Measure {results.innerSpacing}" from center (inner bends)</li>
              <li>Make all four 22.5° bends: outer up, inner down</li>
            </ol>
          </InfoBox>

          <InfoBox type="info" icon={Info} isDarkMode={isDarkMode} title="4-Point Saddle Tips">
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
              <li>Used for larger obstacles where 3-point won't work</li>
              <li>Outer bends go up, inner bends go down</li>
              <li>Creates a flatter top for better clearance</li>
            </ul>
          </InfoBox>
        </>
      )}
    </div>
  );
};

const ConduitBendingCalculator = forwardRef(({ isDarkMode = false, onBack }, ref) => {
  const [activeTab, setActiveTab] = useState('offset');

  // Lifted state for all calculators
  const [offsetData, setOffsetData] = useState({
    obstacleHeight: '',
    bendAngle: '30'
  });

  const [stubUpData, setStubUpData] = useState({
    stubHeight: '',
    conduitSize: '3/4'
  });

  const [saddleData, setSaddleData] = useState({
    obstacleHeight: '',
    obstacleWidth: ''
  });

  const [fourPointData, setFourPointData] = useState({
    obstacleHeight: '',
    obstacleWidth: ''
  });

  const tabs = [
    { id: 'offset', label: 'Offset', icon: TrendingUp },
    { id: 'stubup', label: '90° Stub', icon: CornerUpRight },
    { id: 'saddle', label: '3-Point', icon: Layers },
    { id: 'fourpoint', label: '4-Point', icon: Grid3X3 }
  ];

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      let pdfData;

      // Generate PDF based on active tab
      if (activeTab === 'offset') {
        if (!offsetData.obstacleHeight) {
          alert('Please enter obstacle height for Offset Bends before exporting');
          return;
        }

        const multipliers = {
          '10': { distance: 6.0, shrink: 0.01 },
          '22.5': { distance: 2.6, shrink: 0.06 },
          '30': { distance: 2.0, shrink: 0.25 },
          '45': { distance: 1.4, shrink: 0.41 },
          '60': { distance: 1.2, shrink: 0.58 }
        };

        const height = parseFloat(offsetData.obstacleHeight);
        const mult = multipliers[offsetData.bendAngle];
        const distanceBetweenBends = (height * mult.distance).toFixed(2);
        const shrinkage = (height * mult.shrink).toFixed(2);

        pdfData = {
          calculatorName: 'Conduit Bending - Offset Bends',
          inputs: {
            obstacleHeight: `${offsetData.obstacleHeight} inches`,
            bendAngle: `${offsetData.bendAngle}°`
          },
          results: {
            distanceBetweenBends: `${distanceBetweenBends} inches`,
            shrinkage: `${shrinkage} inches`
          },
          additionalInfo: {
            instructions: `Mark first bend, measure ${distanceBetweenBends}" from center of first bend, then make second bend at ${offsetData.bendAngle}°`,
            multiplierUsed: `Distance: ${mult.distance}, Shrink: ${mult.shrink}`
          },
          necReferences: [
            'NEC Article 358 - Electrical Metallic Tubing (EMT)',
            'NEC Article 344 - Rigid Metal Conduit (RMC)',
            '30° bends are most common for typical offsets',
            '45° bends create shorter, steeper offsets'
          ]
        };

      } else if (activeTab === 'stubup') {
        if (!stubUpData.stubHeight) {
          alert('Please enter stub height for 90° Stub-Up before exporting');
          return;
        }

        const deductions = {
          '1/2': 5, '3/4': 6, '1': 8, '1-1/4': 11, '1-1/2': 14,
          '2': 16, '2-1/2': 21, '3': 26, '3-1/2': 30, '4': 34
        };

        const height = parseFloat(stubUpData.stubHeight);
        const deduct = deductions[stubUpData.conduitSize];
        const markDistance = (height - deduct).toFixed(2);

        pdfData = {
          calculatorName: 'Conduit Bending - 90° Stub-Up',
          inputs: {
            desiredStubHeight: `${stubUpData.stubHeight} inches`,
            conduitSize: `${stubUpData.conduitSize}"`
          },
          results: {
            markAt: `${markDistance} inches`,
            deduction: `${deduct} inches`
          },
          additionalInfo: {
            instructions: `Measure from end of conduit, mark at ${markDistance}", line up mark with arrow on bender, make 90° bend`,
            note: 'Deduction accounts for the radius of the bend - larger conduit requires larger deduction'
          },
          necReferences: [
            'NEC Article 358 - Electrical Metallic Tubing (EMT)',
            'NEC Article 344 - Rigid Metal Conduit (RMC)',
            'Always check your bender - deductions vary by manufacturer'
          ]
        };

      } else if (activeTab === 'saddle') {
        if (!saddleData.obstacleHeight) {
          alert('Please enter obstacle height for 3-Point Saddle before exporting');
          return;
        }

        const height = parseFloat(saddleData.obstacleHeight);
        const width = parseFloat(saddleData.obstacleWidth) || (height * 4);
        const shrinkage = (height * 0.3).toFixed(2);
        const distanceToOuter = (width / 2).toFixed(2);

        pdfData = {
          calculatorName: 'Conduit Bending - 3-Point Saddle',
          inputs: {
            obstacleHeight: `${saddleData.obstacleHeight} inches`,
            obstacleWidth: saddleData.obstacleWidth ? `${saddleData.obstacleWidth} inches` : `${width} inches (Auto: 4x height)`
          },
          results: {
            centerBend: '45°',
            outerBends: '22.5°',
            distanceToOuter: `${distanceToOuter} inches`,
            shrinkage: `${shrinkage} inches`
          },
          additionalInfo: {
            bendingSequence: `1) Mark center of obstacle on conduit 2) Make 45° center bend at mark 3) Measure ${distanceToOuter}" from center each direction 4) Make 22.5° bends on each side (opposite direction)`,
            tip: 'Center bend goes up, outer bends go down'
          },
          necReferences: [
            'NEC Article 358 - Electrical Metallic Tubing (EMT)',
            'NEC Article 344 - Rigid Metal Conduit (RMC)',
            'Most common for going over pipes or other conduits',
            'Mark all three bend locations before starting'
          ]
        };

      } else if (activeTab === 'fourpoint') {
        if (!fourPointData.obstacleHeight || !fourPointData.obstacleWidth) {
          alert('Please enter both obstacle height and width for 4-Point Saddle before exporting');
          return;
        }

        const height = parseFloat(fourPointData.obstacleHeight);
        const width = parseFloat(fourPointData.obstacleWidth);
        const distanceToOuter = (width / 2).toFixed(2);
        const innerSpacing = (width / 4).toFixed(2);
        const shrinkage = (height * 0.15).toFixed(2);

        pdfData = {
          calculatorName: 'Conduit Bending - 4-Point Saddle',
          inputs: {
            obstacleHeight: `${fourPointData.obstacleHeight} inches`,
            obstacleWidth: `${fourPointData.obstacleWidth} inches`
          },
          results: {
            allBends: '22.5°',
            outerDistance: `${distanceToOuter} inches`,
            innerSpacing: `${innerSpacing} inches`,
            shrinkage: `${shrinkage} inches`
          },
          additionalInfo: {
            bendingSequence: `1) Mark center of obstacle on conduit 2) Measure ${distanceToOuter}" from center (outer bends) 3) Measure ${innerSpacing}" from center (inner bends) 4) Make all four 22.5° bends: outer up, inner down`,
            tip: 'Used for larger obstacles where 3-point saddle will not work'
          },
          necReferences: [
            'NEC Article 358 - Electrical Metallic Tubing (EMT)',
            'NEC Article 344 - Rigid Metal Conduit (RMC)',
            'Creates a flatter top for better clearance over wide obstacles'
          ]
        };
      }

      exportToPDF(pdfData);
    }
  }));

  return (
    <div style={{ margin: '0 -1rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        {/* Tab Navigation */}
        <Section isDarkMode={isDarkMode} style={{ padding: '0.75rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '0.5rem'
          }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '0.75rem 0.25rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: isActive ? '#3b82f6' : isDarkMode ? '#1a1a1a' : '#f3f4f6',
                    color: isActive ? '#ffffff' : isDarkMode ? '#e0e0e0' : '#111827',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    minHeight: '60px'
                  }}
                >
                  <TabIcon size={18} />
                  <span style={{ 
                    fontSize: '0.6875rem',
                    lineHeight: '1.2',
                    textAlign: 'center'
                  }}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Active Tab Content */}
        <Section 
          title={
            activeTab === 'offset' ? 'Offset Bends' :
            activeTab === 'stubup' ? '90° Stub-Up' :
            activeTab === 'saddle' ? '3-Point Saddle' :
            '4-Point Saddle'
          }
          icon={
            activeTab === 'offset' ? TrendingUp :
            activeTab === 'stubup' ? CornerUpRight :
            activeTab === 'saddle' ? Layers :
            Grid3X3
          }
          color="#3b82f6"
          isDarkMode={isDarkMode}
        >
          {activeTab === 'offset' && (
            <OffsetBendCalculator 
              offsetData={offsetData} 
              setOffsetData={setOffsetData} 
              isDarkMode={isDarkMode} 
            />
          )}
          {activeTab === 'stubup' && (
            <StubUpCalculator 
              stubUpData={stubUpData} 
              setStubUpData={setStubUpData} 
              isDarkMode={isDarkMode} 
            />
          )}
          {activeTab === 'saddle' && (
            <SaddleBendCalculator 
              saddleData={saddleData} 
              setSaddleData={setSaddleData} 
              isDarkMode={isDarkMode} 
            />
          )}
          {activeTab === 'fourpoint' && (
            <FourPointSaddleCalculator 
              fourPointData={fourPointData} 
              setFourPointData={setFourPointData} 
              isDarkMode={isDarkMode} 
            />
          )}
        </Section>
      </CalculatorLayout>
    </div>
  );
});

export default ConduitBendingCalculator;