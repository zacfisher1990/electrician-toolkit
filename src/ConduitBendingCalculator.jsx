import React, { useState } from 'react';
import { TrendingUp } from 'lucide-react';

function ConduitBendingCalculator({ isDarkMode = false }) {
  const [activeTab, setActiveTab] = useState('offset');

  // Dark mode colors - matching the design system
  const colors = {
    mainBg: isDarkMode ? '#1f2937' : '#ffffff',
    headerBg: isDarkMode ? '#111827' : '#ffffff',
    headerText: isDarkMode ? '#f9fafb' : '#111827',
    headerBorder: isDarkMode ? '#374151' : '#e5e7eb',
    contentBg: isDarkMode ? '#111827' : '#f9fafb',
    labelText: isDarkMode ? '#d1d5db' : '#374151',
    inputBg: isDarkMode ? '#374151' : 'white',
    inputBgAlt: isDarkMode ? '#1f2937' : '#f9fafb',
    inputBorder: isDarkMode ? '#4b5563' : '#d1d5db',
    inputText: isDarkMode ? '#f9fafb' : '#111827',
    cardBg: isDarkMode ? '#1f2937' : 'white',
    cardBorder: isDarkMode ? '#4b5563' : '#e5e7eb',
    subtleText: isDarkMode ? '#9ca3af' : '#6b7280',
    footerBg: isDarkMode ? '#111827' : '#f9fafb',
    footerText: isDarkMode ? '#9ca3af' : '#6b7280',
    footerBorder: isDarkMode ? '#374151' : '#e5e7eb'
  };

  // Offset Bend Calculator
  const OffsetBendCalculator = () => {
    const [obstacleHeight, setObstacleHeight] = useState('');
    const [bendAngle, setBendAngle] = useState('30');

    const multipliers = {
      '10': { distance: 6.0, shrink: 0.01 },
      '22.5': { distance: 2.6, shrink: 0.06 },
      '30': { distance: 2.0, shrink: 0.25 },
      '45': { distance: 1.4, shrink: 0.41 },
      '60': { distance: 1.2, shrink: 0.58 }
    };

    const calculateOffset = () => {
      if (!obstacleHeight) return null;
      const height = parseFloat(obstacleHeight);
      const mult = multipliers[bendAngle];
      
      return {
        distanceBetweenBends: (height * mult.distance).toFixed(2),
        shrinkage: (height * mult.shrink).toFixed(2),
        angle: bendAngle
      };
    };

    const results = calculateOffset();

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Obstacle Height (inches)
            </label>
            <input
              type="number"
              value={obstacleHeight}
              onChange={(e) => setObstacleHeight(e.target.value)}
              placeholder="Enter height"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>Height to clear obstacle</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Bend Angle
            </label>
            <select
              value={bendAngle}
              onChange={(e) => setBendAngle(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            >
              <option value="10">10°</option>
              <option value="15">15°</option>
              <option value="22.5">22.5°</option>
              <option value="30">30°</option>
              <option value="45">45°</option>
              <option value="60">60°</option>
            </select>
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>Most common: 30° or 45°</div>
          </div>
        </div>

        {results && (
          <div style={{ 
            background: '#f0fdf4', 
            border: '2px solid #22c55e', 
            padding: '1.5rem', 
            borderRadius: '0.5rem'
          }}>
            <h3 style={{ fontWeight: 'bold', color: '#166534', marginTop: 0, marginBottom: '1rem' }}>
              Offset Bend Results
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ color: '#14532d', marginBottom: '0.5rem' }}>
                <strong>Distance Between Bends:</strong>
              </div>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#16a34a',
                padding: '1rem',
                background: 'white',
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                {results.distanceBetweenBends}"
              </div>
            </div>

            <div style={{ 
              color: '#14532d',
              paddingTop: '1rem',
              borderTop: '1px solid #bbf7d0'
            }}>
              <div style={{ marginBottom: '0.5rem' }}><strong>Shrinkage:</strong> {results.shrinkage}"</div>
              <div><strong>Bend Angle:</strong> {results.angle}°</div>
            </div>

            <div style={{ 
              background: '#fef3c7',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #fbbf24',
              color: '#92400e',
              fontSize: '0.875rem',
              marginTop: '1rem'
            }}>
              <strong>Note:</strong> Mark first bend, measure distance between bends from center of first bend, then make second bend.
            </div>
          </div>
        )}

        <div style={{ 
          background: colors.cardBg,
          padding: '1rem',
          borderRadius: '0.5rem',
          border: `1px solid ${colors.cardBorder}`,
          marginTop: '1.5rem'
        }}>
          <strong style={{ color: colors.labelText, display: 'block', marginBottom: '0.5rem' }}>Offset Bend Tips:</strong>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: colors.subtleText, fontSize: '0.875rem' }}>
            <li style={{ marginBottom: '0.25rem' }}>30° bends are most common for typical offsets</li>
            <li style={{ marginBottom: '0.25rem' }}>45° bends create shorter, steeper offsets</li>
            <li style={{ marginBottom: '0.25rem' }}>10° bends are gentler and take more space</li>
            <li>Always account for shrinkage in your measurements</li>
          </ul>
        </div>
      </div>
    );
  };

  // Stub-Up (90°) Calculator
  const StubUpCalculator = () => {
    const [stubHeight, setStubHeight] = useState('');
    const [conduitSize, setConduitSize] = useState('3/4');

    const deductions = {
      '1/2': 5,
      '3/4': 6,
      '1': 8,
      '1-1/4': 11,
      '1-1/2': 14,
      '2': 16,
      '2-1/2': 21,
      '3': 26,
      '3-1/2': 30,
      '4': 34
    };

    const calculateStubUp = () => {
      if (!stubHeight) return null;
      const height = parseFloat(stubHeight);
      const deduct = deductions[conduitSize];
      
      return {
        markDistance: (height - deduct).toFixed(2),
        deduction: deduct,
        stubHeight: height.toFixed(2)
      };
    };

    const results = calculateStubUp();

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Desired Stub Height (inches)
            </label>
            <input
              type="number"
              value={stubHeight}
              onChange={(e) => setStubHeight(e.target.value)}
              placeholder="Enter stub height"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>Back of 90° to floor</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Conduit Size
            </label>
            <select
              value={conduitSize}
              onChange={(e) => setConduitSize(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            >
              <option value="1/2">1/2"</option>
              <option value="3/4">3/4"</option>
              <option value="1">1"</option>
              <option value="1-1/4">1-1/4"</option>
              <option value="1-1/2">1-1/2"</option>
              <option value="2">2"</option>
              <option value="2-1/2">2-1/2"</option>
              <option value="3">3"</option>
              <option value="3-1/2">3-1/2"</option>
              <option value="4">4"</option>
            </select>
          </div>
        </div>

        {results && (
          <div style={{ 
            background: '#f0fdf4', 
            border: '2px solid #22c55e', 
            padding: '1.5rem', 
            borderRadius: '0.5rem'
          }}>
            <h3 style={{ fontWeight: 'bold', color: '#166534', marginTop: 0, marginBottom: '1rem' }}>
              90° Stub-Up Results
            </h3>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ color: '#14532d', marginBottom: '0.5rem' }}>
                <strong>Mark at:</strong>
              </div>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: 'bold', 
                color: '#16a34a',
                padding: '1rem',
                background: 'white',
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                {results.markDistance}"
              </div>
            </div>

            <div style={{ 
              color: '#14532d',
              paddingTop: '1rem',
              borderTop: '1px solid #bbf7d0'
            }}>
              <div style={{ marginBottom: '0.5rem' }}><strong>Deduction Used:</strong> {results.deduction}"</div>
              <div style={{ marginBottom: '0.5rem' }}><strong>Conduit Size:</strong> {conduitSize}"</div>
              <div><strong>Final Stub Height:</strong> {results.stubHeight}"</div>
            </div>

            <div style={{ 
              background: '#fef3c7',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #fbbf24',
              color: '#92400e',
              fontSize: '0.875rem',
              marginTop: '1rem'
            }}>
              <strong>How to bend:</strong> Measure from end of conduit, mark at {results.markDistance}", line up mark with arrow on bender, make 90° bend.
            </div>
          </div>
        )}

        <div style={{ 
          background: colors.cardBg,
          padding: '1rem',
          borderRadius: '0.5rem',
          border: `1px solid ${colors.cardBorder}`,
          marginTop: '1.5rem'
        }}>
          <strong style={{ color: colors.labelText, display: 'block', marginBottom: '0.5rem' }}>Stub-Up Tips:</strong>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: colors.subtleText, fontSize: '0.875rem' }}>
            <li style={{ marginBottom: '0.25rem' }}>Deduction accounts for the radius of the bend</li>
            <li style={{ marginBottom: '0.25rem' }}>Larger conduit = larger deduction</li>
            <li style={{ marginBottom: '0.25rem' }}>Always check your bender - deductions can vary slightly by manufacturer</li>
            <li>Measure from end of conduit to your mark for accuracy</li>
          </ul>
        </div>
      </div>
    );
  };

  // 3-Point Saddle Calculator
  const SaddleBendCalculator = () => {
    const [obstacleHeight, setObstacleHeight] = useState('');
    const [obstacleWidth, setObstacleWidth] = useState('');

    const calculateSaddle = () => {
      if (!obstacleHeight) return null;
      const height = parseFloat(obstacleHeight);
      const width = parseFloat(obstacleWidth) || (height * 4);
      
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Obstacle Height (inches)
            </label>
            <input
              type="number"
              value={obstacleHeight}
              onChange={(e) => setObstacleHeight(e.target.value)}
              placeholder="Enter height"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>Height to clear</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Obstacle Width (inches) - Optional
            </label>
            <input
              type="number"
              value={obstacleWidth}
              onChange={(e) => setObstacleWidth(e.target.value)}
              placeholder="Auto: 4x height"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>Width of obstacle</div>
          </div>
        </div>

        {results && (
          <div style={{ 
            background: '#f0fdf4', 
            border: '2px solid #22c55e', 
            padding: '1.5rem', 
            borderRadius: '0.5rem'
          }}>
            <h3 style={{ fontWeight: 'bold', color: '#166534', marginTop: 0, marginBottom: '1rem' }}>
              3-Point Saddle Results
            </h3>

            <div style={{ 
              background: colors.cardBg, 
              padding: '1rem', 
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: colors.labelText }}>
                <strong>Center Bend:</strong> {results.centerBend}°
              </div>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: colors.labelText }}>
                <strong>Outer Bends:</strong> {results.outerBends}° each
              </div>
              <div style={{ fontSize: '0.875rem', color: colors.labelText }}>
                <strong>Distance to Outer Bends:</strong> {results.distanceToOuter}" (each side of center)
              </div>
            </div>

            <div style={{ 
              color: '#14532d',
              paddingTop: '1rem',
              borderTop: '1px solid #bbf7d0'
            }}>
              <div style={{ marginBottom: '0.5rem' }}><strong>Shrinkage:</strong> ~{results.shrinkage}"</div>
              <div><strong>Obstacle Height:</strong> {results.obstacleHeight}"</div>
            </div>

            <div style={{ 
              background: '#fef3c7',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #fbbf24',
              color: '#92400e',
              fontSize: '0.875rem',
              marginTop: '1rem'
            }}>
              <strong>Bending sequence:</strong>
              <ol style={{ margin: '0.5rem 0 0 1.25rem', padding: 0 }}>
                <li>Mark center of obstacle on conduit</li>
                <li>Make 45° center bend at mark</li>
                <li>Measure {results.distanceToOuter}" from center each direction</li>
                <li>Make 22.5° bends on each side (opposite direction of center)</li>
              </ol>
            </div>
          </div>
        )}

        <div style={{ 
          background: colors.cardBg,
          padding: '1rem',
          borderRadius: '0.5rem',
          border: `1px solid ${colors.cardBorder}`,
          marginTop: '1.5rem'
        }}>
          <strong style={{ color: colors.labelText, display: 'block', marginBottom: '0.5rem' }}>3-Point Saddle Tips:</strong>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: colors.subtleText, fontSize: '0.875rem' }}>
            <li style={{ marginBottom: '0.25rem' }}>Center bend goes up, outer bends go down</li>
            <li style={{ marginBottom: '0.25rem' }}>Most common for going over pipes or other conduits</li>
            <li style={{ marginBottom: '0.25rem' }}>Distance between bends typically 2-4x the obstacle height</li>
            <li>Mark all three bend locations before starting</li>
          </ul>
        </div>
      </div>
    );
  };

  // 4-Point Saddle Calculator
  const FourPointSaddleCalculator = () => {
    const [obstacleHeight, setObstacleHeight] = useState('');
    const [obstacleWidth, setObstacleWidth] = useState('');

    const calculateFourPointSaddle = () => {
      if (!obstacleHeight || !obstacleWidth) return null;
      
      const height = parseFloat(obstacleHeight);
      const width = parseFloat(obstacleWidth);
      
      const distanceToOuter = width / 2;
      const innerSpacing = width / 4;
      const shrinkage = height * 0.15;

      return {
        bendAngle: 22.5,
        distanceToOuter: distanceToOuter.toFixed(2),
        innerSpacing: innerSpacing.toFixed(2),
        shrinkage: shrinkage.toFixed(2),
        obstacleHeight: height.toFixed(2),
        obstacleWidth: width.toFixed(2)
      };
    };

    const results = calculateFourPointSaddle();

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Obstacle Height (inches)
            </label>
            <input
              type="number"
              value={obstacleHeight}
              onChange={(e) => setObstacleHeight(e.target.value)}
              placeholder="Enter height"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>Height to clear</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Obstacle Width (inches)
            </label>
            <input
              type="number"
              value={obstacleWidth}
              onChange={(e) => setObstacleWidth(e.target.value)}
              placeholder="Enter width"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>Width of obstacle</div>
          </div>
        </div>

        {results && (
          <div style={{ 
            background: '#f0fdf4', 
            border: '2px solid #22c55e', 
            padding: '1.5rem', 
            borderRadius: '0.5rem'
          }}>
            <h3 style={{ fontWeight: 'bold', color: '#166534', marginTop: 0, marginBottom: '1rem' }}>
              4-Point Saddle Results
            </h3>

            <div style={{ 
              background: colors.cardBg, 
              padding: '1rem', 
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: colors.labelText }}>
                <strong>All Four Bends:</strong> {results.bendAngle}° each
              </div>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: colors.labelText }}>
                <strong>Distance to Outer Bends:</strong> {results.distanceToOuter}" (each side from center)
              </div>
              <div style={{ fontSize: '0.875rem', color: colors.labelText }}>
                <strong>Spacing Between Inner Bends:</strong> {results.innerSpacing}"
              </div>
            </div>

            <div style={{ 
              color: '#14532d',
              paddingTop: '1rem',
              borderTop: '1px solid #bbf7d0'
            }}>
              <div style={{ marginBottom: '0.5rem' }}><strong>Shrinkage:</strong> ~{results.shrinkage}"</div>
              <div style={{ marginBottom: '0.5rem' }}><strong>Obstacle Height:</strong> {results.obstacleHeight}"</div>
              <div><strong>Obstacle Width:</strong> {results.obstacleWidth}"</div>
            </div>

            <div style={{ 
              background: '#fef3c7',
              padding: '0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid #fbbf24',
              color: '#92400e',
              fontSize: '0.875rem',
              marginTop: '1rem'
            }}>
              <strong>Bending sequence:</strong>
              <ol style={{ margin: '0.5rem 0 0 1.25rem', padding: 0 }}>
                <li>Mark center of obstacle on conduit</li>
                <li>Measure {results.distanceToOuter}" from center in both directions (outer bends)</li>
                <li>Measure {results.innerSpacing}" from center in both directions (inner bends)</li>
                <li>Make all four 22.5° bends: outer bends go up, inner bends go down</li>
              </ol>
            </div>
          </div>
        )}

        <div style={{ 
          background: colors.cardBg,
          padding: '1rem',
          borderRadius: '0.5rem',
          border: `1px solid ${colors.cardBorder}`,
          marginTop: '1.5rem'
        }}>
          <strong style={{ color: colors.labelText, display: 'block', marginBottom: '0.5rem' }}>4-Point Saddle Tips:</strong>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: colors.subtleText, fontSize: '0.875rem' }}>
            <li style={{ marginBottom: '0.25rem' }}>Used for larger obstacles where 3-point saddle won't work</li>
            <li style={{ marginBottom: '0.25rem' }}>Outer bends go up, inner bends go down (alternating pattern)</li>
            <li style={{ marginBottom: '0.25rem' }}>Creates a flatter top for better clearance over wide obstacles</li>
            <li>Mark all four bend locations before starting to bend</li>
          </ul>
        </div>
      </div>
    );
  };

  const tabComponents = {
    offset: <OffsetBendCalculator />,
    stubup: <StubUpCalculator />,
    saddle: <SaddleBendCalculator />,
    fourpoint: <FourPointSaddleCalculator />
  };

  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto', background: colors.mainBg, borderRadius: '0.5rem', overflow: 'hidden' }}>
      {/* Modern Header */}
      <div style={{ background: colors.headerBg, color: colors.headerText, padding: '1rem 1.5rem', borderBottom: `1px solid ${colors.headerBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <TrendingUp size={24} color="#3b82f6" />
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Conduit Bending</h1>
            <p style={{ fontSize: '0.8125rem', margin: 0, color: colors.subtleText }}>Professional Bending Calculations</p>
          </div>
        </div>
      </div>

      <div style={{ background: colors.contentBg, padding: '1.5rem' }}>
        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => setActiveTab('offset')}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === 'offset' ? '#3b82f6' : colors.inputBgAlt,
              color: activeTab === 'offset' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'offset' ? '#3b82f6' : colors.inputBorder}`,
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Offset Bends
          </button>
          <button 
            onClick={() => setActiveTab('stubup')}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === 'stubup' ? '#3b82f6' : colors.inputBgAlt,
              color: activeTab === 'stubup' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'stubup' ? '#3b82f6' : colors.inputBorder}`,
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            90° Stub-Up
          </button>
          <button 
            onClick={() => setActiveTab('saddle')}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === 'saddle' ? '#3b82f6' : colors.inputBgAlt,
              color: activeTab === 'saddle' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'saddle' ? '#3b82f6' : colors.inputBorder}`,
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            3-Point Saddle
          </button>
          <button 
            onClick={() => setActiveTab('fourpoint')}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === 'fourpoint' ? '#3b82f6' : colors.inputBgAlt,
              color: activeTab === 'fourpoint' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'fourpoint' ? '#3b82f6' : colors.inputBorder}`,
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            4-Point Saddle
          </button>
        </div>

        {/* Active Tab Content */}
        {tabComponents[activeTab]}
      </div>

      {/* Footer */}
      <div style={{ background: colors.footerBg, color: colors.footerText, padding: '1rem 1.5rem', borderTop: `1px solid ${colors.footerBorder}`, fontSize: '0.75rem' }}>
        <p style={{ fontWeight: '600', marginTop: 0, marginBottom: '0.5rem', color: colors.labelText }}>Bending Best Practices:</p>
        <p style={{ margin: 0 }}>
          Use quality benders for your conduit size • Deductions vary by manufacturer - verify with your tool • Practice on scrap before final runs • EMT is most common; rigid/IMC require hydraulic benders
        </p>
      </div>
    </div>
  );
}

export default ConduitBendingCalculator;