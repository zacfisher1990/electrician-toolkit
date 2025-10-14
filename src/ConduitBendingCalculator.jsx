import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import { exportToPDF } from './pdfExport';

// Move calculator components OUTSIDE to prevent recreation on each render
const OffsetBendCalculator = ({ offsetData, setOffsetData, colors }) => {
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
            Obstacle Height (inches)
          </label>
          <input
            type="number"
            value={offsetData.obstacleHeight}
            onChange={(e) => setOffsetData(prev => ({...prev, obstacleHeight: e.target.value}))}
            placeholder="Enter height"
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
          <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>Height to clear obstacle</div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
            Bend Angle <br/>  <br/>
          </label>
          <select
            value={offsetData.bendAngle}
            onChange={(e) => setOffsetData(prev => ({...prev, bendAngle: e.target.value}))}
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
            <option value="10">10°</option>
            <option value="22.5">22.5°</option>
            <option value="30">30°</option>
            <option value="45">45°</option>
            <option value="60">60°</option>
          </select>
          <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>Most common: 30° or 45°</div>
        </div>
      </div>

      {results && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              background: '#dbeafe',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                Distance Between Bends
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                {results.distanceBetweenBends}"
              </div>
            </div>
            
            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                Shrinkage
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                {results.shrinkage}"
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
                  How to Make the Bend
                </div>
                <div>Mark first bend, measure {results.distanceBetweenBends}" from center of first bend, then make second bend at {results.angle}°.</div>
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
              Offset Bend Tips:
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>30° bends are most common for typical offsets</li>
              <li>45° bends create shorter, steeper offsets</li>
              <li>Always account for shrinkage in measurements</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

const StubUpCalculator = ({ stubUpData, setStubUpData, colors }) => {
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
            Desired Stub Height (inches)
          </label>
          <input
            type="number"
            value={stubUpData.stubHeight}
            onChange={(e) => setStubUpData(prev => ({...prev, stubHeight: e.target.value}))}
            placeholder="Enter stub height"
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
          <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>Back of 90° to floor</div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
            Conduit Size <br/>  <br/>
          </label>
          <select
            value={stubUpData.conduitSize}
            onChange={(e) => setStubUpData(prev => ({...prev, conduitSize: e.target.value}))}
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
            {Object.keys(deductions).map(size => (
              <option key={size} value={size}>{size}"</option>
            ))}
          </select>
        </div>
      </div>

      {results && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              background: '#dbeafe',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                Mark At
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                {results.markDistance}"
              </div>
            </div>
            
            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                Deduction
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                {results.deduction}"
              </div>
            </div>

            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                Conduit Size
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                {stubUpData.conduitSize}"
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
                  How to Bend
                </div>
                <div>Measure from end of conduit, mark at {results.markDistance}", line up mark with arrow on bender, make 90° bend.</div>
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
              Stub-Up Tips:
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>Deduction accounts for the radius of the bend</li>
              <li>Larger conduit = larger deduction</li>
              <li>Always check your bender - deductions vary by manufacturer</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

const SaddleBendCalculator = ({ saddleData, setSaddleData, colors }) => {
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
            Obstacle Height (inches)
          </label>
          <input
            type="number"
            value={saddleData.obstacleHeight}
            onChange={(e) => setSaddleData(prev => ({...prev, obstacleHeight: e.target.value}))}
            placeholder="Enter height"
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
            Obstacle Width <br/> (Optional)
          </label>
          <input
            type="number"
            value={saddleData.obstacleWidth}
            onChange={(e) => setSaddleData(prev => ({...prev, obstacleWidth: e.target.value}))}
            placeholder="Auto: 4x height"
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

      {results && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              background: '#dbeafe',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                Center Bend
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                {results.centerBend}°
              </div>
            </div>
            
            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                Outer Bends
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                {results.outerBends}°
              </div>
            </div>

            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                Distance to Outer
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                {results.distanceToOuter}"
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
                  Bending Sequence
                </div>
                <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  <li>Mark center of obstacle on conduit</li>
                  <li>Make 45° center bend at mark</li>
                  <li>Measure {results.distanceToOuter}" from center each direction</li>
                  <li>Make 22.5° bends on each side (opposite direction)</li>
                </ol>
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
              3-Point Saddle Tips:
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>Center bend goes up, outer bends go down</li>
              <li>Most common for going over pipes or other conduits</li>
              <li>Mark all three bend locations before starting</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

const FourPointSaddleCalculator = ({ fourPointData, setFourPointData, colors }) => {
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
            Obstacle Height <br/> (inches)
          </label>
          <input
            type="number"
            value={fourPointData.obstacleHeight}
            onChange={(e) => setFourPointData(prev => ({...prev, obstacleHeight: e.target.value}))}
            placeholder="Enter height"
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
            Obstacle Width <br/> (inches)
          </label>
          <input
            type="number"
            value={fourPointData.obstacleWidth}
            onChange={(e) => setFourPointData(prev => ({...prev, obstacleWidth: e.target.value}))}
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
      </div>

      {results && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              background: '#dbeafe',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                All Bends
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                {results.bendAngle}°
              </div>
            </div>
            
            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                Outer Distance
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                {results.distanceToOuter}"
              </div>
            </div>

            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                Inner Spacing
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                {results.innerSpacing}"
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
                  Bending Sequence
                </div>
                <ol style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  <li>Mark center of obstacle on conduit</li>
                  <li>Measure {results.distanceToOuter}" from center (outer bends)</li>
                  <li>Measure {results.innerSpacing}" from center (inner bends)</li>
                  <li>Make all four 22.5° bends: outer up, inner down</li>
                </ol>
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
              4-Point Saddle Tips:
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>Used for larger obstacles where 3-point won't work</li>
              <li>Outer bends go up, inner bends go down</li>
              <li>Creates a flatter top for better clearance</li>
            </ul>
          </div>
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

  const tabComponents = {
    offset: <OffsetBendCalculator offsetData={offsetData} setOffsetData={setOffsetData} colors={colors} />,
    stubup: <StubUpCalculator stubUpData={stubUpData} setStubUpData={setStubUpData} colors={colors} />,
    saddle: <SaddleBendCalculator saddleData={saddleData} setSaddleData={setSaddleData} colors={colors} />,
    fourpoint: <FourPointSaddleCalculator fourPointData={fourPointData} setFourPointData={setFourPointData} colors={colors} />
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Tab Navigation */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'offset', label: 'Offset Bends' },
          { id: 'stubup', label: '90° Stub-Up' },
          { id: 'saddle', label: '3-Point Saddle' },
          { id: 'fourpoint', label: '4-Point Saddle' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: '1 1 auto',
              minWidth: '120px',
              padding: '0.625rem 1rem',
              background: activeTab === tab.id ? '#3b82f6' : colors.sectionBg,
              color: activeTab === tab.id ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === tab.id ? '#3b82f6' : colors.cardBorder}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {tabComponents[activeTab]}
      </div>
    </div>
  );
});

export default ConduitBendingCalculator;