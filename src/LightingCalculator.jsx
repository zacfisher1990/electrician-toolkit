import React, { useState } from 'react';
import { Lightbulb } from 'lucide-react';

function LightingCalculator({ isDarkMode = false }) {
  const [activeTab, setActiveTab] = useState('lumens');

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

  // Lumens Calculator
  const LumensCalculator = () => {
    const [roomLength, setRoomLength] = useState('');
    const [roomWidth, setRoomWidth] = useState('');
    const [roomType, setRoomType] = useState('living');
    const [lumensPerFixture, setLumensPerFixture] = useState('');

    const footCandlesByRoom = {
      'living': 10,
      'kitchen': 50,
      'bathroom': 70,
      'bedroom': 10,
      'office': 50,
      'workshop': 75,
      'garage': 50,
      'hallway': 5,
      'dining': 30,
      'laundry': 50
    };

    const roomTypeNames = {
      'living': 'Living Room (10 fc)',
      'kitchen': 'Kitchen (50 fc)',
      'bathroom': 'Bathroom (70 fc)',
      'bedroom': 'Bedroom (10 fc)',
      'office': 'Office/Study (50 fc)',
      'workshop': 'Workshop (75 fc)',
      'garage': 'Garage (50 fc)',
      'hallway': 'Hallway (5 fc)',
      'dining': 'Dining Room (30 fc)',
      'laundry': 'Laundry Room (50 fc)'
    };

    const calculateLumens = () => {
      if (!roomLength || !roomWidth) return null;
      
      const length = parseFloat(roomLength);
      const width = parseFloat(roomWidth);
      const area = length * width;
      const footCandles = footCandlesByRoom[roomType];
      
      const totalLumens = footCandles * area;
      
      let fixturesNeeded = null;
      if (lumensPerFixture) {
        const lpf = parseFloat(lumensPerFixture);
        fixturesNeeded = Math.ceil(totalLumens / lpf);
      }

      return {
        area: area.toFixed(1),
        footCandles,
        totalLumens: totalLumens.toFixed(0),
        fixturesNeeded
      };
    };

    const results = calculateLumens();

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Room Length (feet)
            </label>
            <input
              type="number"
              value={roomLength}
              onChange={(e) => setRoomLength(e.target.value)}
              placeholder="Enter length"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Room Width (feet)
            </label>
            <input
              type="number"
              value={roomWidth}
              onChange={(e) => setRoomWidth(e.target.value)}
              placeholder="Enter width"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Room Type
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            >
              {Object.entries(roomTypeNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>fc = foot-candles</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Lumens per Fixture (Optional)
            </label>
            <input
              type="number"
              value={lumensPerFixture}
              onChange={(e) => setLumensPerFixture(e.target.value)}
              placeholder="e.g., 800"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>To calculate fixture count</div>
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
              Lighting Requirements
            </h3>

            <div style={{ 
              background: colors.cardBg, 
              padding: '1rem', 
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: colors.labelText }}>
                <strong>Room Area:</strong> {results.area} sq ft
              </div>
              <div style={{ fontSize: '0.875rem', color: colors.labelText }}>
                <strong>Recommended Level:</strong> {results.footCandles} foot-candles
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ color: '#14532d', marginBottom: '0.5rem' }}>
                <strong>Total Lumens Needed:</strong>
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
                {results.totalLumens} lumens
              </div>
            </div>

            {results.fixturesNeeded && (
              <div style={{ 
                color: '#14532d',
                paddingTop: '1rem',
                borderTop: '1px solid #bbf7d0'
              }}>
                <strong>Fixtures Needed:</strong> {results.fixturesNeeded} fixtures
                <div style={{ fontSize: '0.875rem', color: '#15803d', marginTop: '0.25rem' }}>
                  @ {lumensPerFixture} lumens each
                </div>
              </div>
            )}
          </div>
        )}

        <div style={{ 
          background: colors.cardBg,
          padding: '1rem',
          borderRadius: '0.5rem',
          border: `1px solid ${colors.cardBorder}`,
          marginTop: '1.5rem'
        }}>
          <strong style={{ color: colors.labelText, display: 'block', marginBottom: '0.5rem' }}>Lighting Tips:</strong>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: colors.subtleText, fontSize: '0.875rem' }}>
            <li style={{ marginBottom: '0.25rem' }}>LED bulbs typically produce 60-100 lumens per watt</li>
            <li style={{ marginBottom: '0.25rem' }}>Layer lighting: combine ambient, task, and accent lighting</li>
            <li style={{ marginBottom: '0.25rem' }}>Higher ceilings may require more lumens</li>
            <li>Dark wall colors absorb light; increase lumens by 10-20%</li>
          </ul>
        </div>
      </div>
    );
  };

  // Fixture Spacing Calculator
  const FixtureSpacingCalculator = () => {
    const [roomLength, setRoomLength] = useState('');
    const [roomWidth, setRoomWidth] = useState('');
    const [ceilingHeight, setCeilingHeight] = useState('8');
    const [fixtureType, setFixtureType] = useState('recessed');

    const spacingRatios = {
      'recessed': 1.5,
      'pendant': 1.0,
      'track': 2.0,
      'surface': 1.5
    };

    const calculateSpacing = () => {
      if (!roomLength || !roomWidth) return null;
      
      const length = parseFloat(roomLength);
      const width = parseFloat(roomWidth);
      const height = parseFloat(ceilingHeight);
      const ratio = spacingRatios[fixtureType];
      
      const maxSpacing = height * ratio;
      
      const fixturesLength = Math.ceil(length / maxSpacing);
      const fixturesWidth = Math.ceil(width / maxSpacing);
      const totalFixtures = fixturesLength * fixturesWidth;
      
      const actualSpacingLength = length / fixturesLength;
      const actualSpacingWidth = width / fixturesWidth;

      return {
        maxSpacing: maxSpacing.toFixed(1),
        fixturesLength,
        fixturesWidth,
        totalFixtures,
        actualSpacingLength: actualSpacingLength.toFixed(1),
        actualSpacingWidth: actualSpacingWidth.toFixed(1)
      };
    };

    const results = calculateSpacing();

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Room Length (feet)
            </label>
            <input
              type="number"
              value={roomLength}
              onChange={(e) => setRoomLength(e.target.value)}
              placeholder="Enter length"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Room Width (feet)
            </label>
            <input
              type="number"
              value={roomWidth}
              onChange={(e) => setRoomWidth(e.target.value)}
              placeholder="Enter width"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Ceiling Height (feet)
            </label>
            <input
              type="number"
              value={ceilingHeight}
              onChange={(e) => setCeilingHeight(e.target.value)}
              placeholder="8"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Fixture Type
            </label>
            <select
              value={fixtureType}
              onChange={(e) => setFixtureType(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            >
              <option value="recessed">Recessed Can (1.5:1 ratio)</option>
              <option value="pendant">Pendant (1:1 ratio)</option>
              <option value="track">Track Light (2:1 ratio)</option>
              <option value="surface">Surface Mount (1.5:1 ratio)</option>
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
              Fixture Spacing Results
            </h3>

            <div style={{ 
              background: colors.cardBg, 
              padding: '1rem', 
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: colors.labelText }}>
                <strong>Maximum Spacing:</strong> {results.maxSpacing} ft
              </div>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: colors.labelText }}>
                <strong>Fixtures in Length:</strong> {results.fixturesLength}
              </div>
              <div style={{ fontSize: '0.875rem', color: colors.labelText }}>
                <strong>Fixtures in Width:</strong> {results.fixturesWidth}
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ color: '#14532d', marginBottom: '0.5rem' }}>
                <strong>Total Fixtures:</strong>
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
                {results.totalFixtures} fixtures
              </div>
            </div>

            <div style={{ 
              color: '#14532d',
              paddingTop: '1rem',
              borderTop: '1px solid #bbf7d0'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Actual Spacing (Length):</strong> {results.actualSpacingLength} ft
              </div>
              <div>
                <strong>Actual Spacing (Width):</strong> {results.actualSpacingWidth} ft
              </div>
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
              <strong>Layout tip:</strong> Start {(parseFloat(results.actualSpacingLength) / 2).toFixed(1)} ft from walls along length, and {(parseFloat(results.actualSpacingWidth) / 2).toFixed(1)} ft from walls along width for balanced spacing.
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
          <strong style={{ color: colors.labelText, display: 'block', marginBottom: '0.5rem' }}>Spacing Guidelines:</strong>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: colors.subtleText, fontSize: '0.875rem' }}>
            <li style={{ marginBottom: '0.25rem' }}>Spacing ratio = maximum distance between fixtures ÷ ceiling height</li>
            <li style={{ marginBottom: '0.25rem' }}>Recessed cans: 1.5:1 ratio is standard (8 ft ceiling = 12 ft max spacing)</li>
            <li style={{ marginBottom: '0.25rem' }}>Space fixtures evenly; avoid placing directly against walls</li>
            <li>Higher ceilings may require more fixtures for even coverage</li>
          </ul>
        </div>
      </div>
    );
  };

  // Watts per Square Foot Calculator
  const WattsPerSqFtCalculator = () => {
    const [area, setArea] = useState('');
    const [buildingType, setBuildingType] = useState('office');

    const wattsPerSqFt = {
      'office': 1.0,
      'retail': 1.5,
      'warehouse': 0.5,
      'school': 1.2,
      'hospital': 1.0,
      'hotel': 1.0,
      'restaurant': 1.3,
      'residential': 1.0
    };

    const buildingTypeNames = {
      'office': 'Office Building (1.0 W/sq ft)',
      'retail': 'Retail Store (1.5 W/sq ft)',
      'warehouse': 'Warehouse (0.5 W/sq ft)',
      'school': 'School (1.2 W/sq ft)',
      'hospital': 'Hospital (1.0 W/sq ft)',
      'hotel': 'Hotel (1.0 W/sq ft)',
      'restaurant': 'Restaurant (1.3 W/sq ft)',
      'residential': 'Residential (1.0 W/sq ft)'
    };

    const calculateWattage = () => {
      if (!area) return null;
      
      const sqft = parseFloat(area);
      const watts = wattsPerSqFt[buildingType];
      const totalWatts = sqft * watts;
      const totalVA = totalWatts;
      
      const amperage120V = totalVA / 120;
      const circuits20A = Math.ceil(amperage120V / 16);

      return {
        wattsPerSqFt: watts,
        totalWatts: totalWatts.toFixed(0),
        totalVA: totalVA.toFixed(0),
        amperage: amperage120V.toFixed(1),
        circuits: circuits20A
      };
    };

    const results = calculateWattage();

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Area (square feet)
            </label>
            <input
              type="number"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Enter area"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Building Type
            </label>
            <select
              value={buildingType}
              onChange={(e) => setBuildingType(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            >
              {Object.entries(buildingTypeNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>Per NEC Table 220.12</div>
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
              Lighting Load Results
            </h3>

            <div style={{ 
              background: colors.cardBg, 
              padding: '1rem', 
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.875rem', color: colors.labelText }}>
                <strong>Unit Load:</strong> {results.wattsPerSqFt} watts per sq ft
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ color: '#14532d', marginBottom: '0.5rem' }}>
                <strong>Total Lighting Load:</strong>
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
                {results.totalWatts} watts
              </div>
            </div>

            <div style={{ 
              color: '#14532d',
              paddingTop: '1rem',
              borderTop: '1px solid #bbf7d0'
            }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Total VA:</strong> {results.totalVA} VA
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Current @ 120V:</strong> {results.amperage} A
              </div>
              <div>
                <strong>20A Circuits Needed:</strong> {results.circuits} circuits
              </div>
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
          <strong style={{ color: colors.labelText, display: 'block', marginBottom: '0.5rem' }}>NEC Requirements:</strong>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: colors.subtleText, fontSize: '0.875rem' }}>
            <li style={{ marginBottom: '0.25rem' }}>NEC 220.12 specifies unit lighting loads by occupancy type</li>
            <li style={{ marginBottom: '0.25rem' }}>Calculate using building area, not just lit area</li>
            <li style={{ marginBottom: '0.25rem' }}>Continuous loads require 125% conductor/OCPD sizing</li>
            <li>Actual fixture wattage may differ; this is minimum code requirement</li>
          </ul>
        </div>
      </div>
    );
  };

  const tabComponents = {
    lumens: <LumensCalculator />,
    spacing: <FixtureSpacingCalculator />,
    watts: <WattsPerSqFtCalculator />
  };

  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto', background: colors.mainBg, borderRadius: '0.5rem', overflow: 'hidden' }}>
      {/* Modern Header */}
      <div style={{ background: colors.headerBg, color: colors.headerText, padding: '1rem 1.5rem', borderBottom: `1px solid ${colors.headerBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Lightbulb size={24} color="#3b82f6" />
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Lighting Calculations</h1>
            <p style={{ fontSize: '0.8125rem', margin: 0, color: colors.subtleText }}>Professional Lighting Design</p>
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
            onClick={() => setActiveTab('lumens')}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === 'lumens' ? '#3b82f6' : colors.inputBgAlt,
              color: activeTab === 'lumens' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'lumens' ? '#3b82f6' : colors.inputBorder}`,
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Room Lumens
          </button>
          <button 
            onClick={() => setActiveTab('spacing')}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === 'spacing' ? '#3b82f6' : colors.inputBgAlt,
              color: activeTab === 'spacing' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'spacing' ? '#3b82f6' : colors.inputBorder}`,
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Fixture Spacing
          </button>
          <button 
            onClick={() => setActiveTab('watts')}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === 'watts' ? '#3b82f6' : colors.inputBgAlt,
              color: activeTab === 'watts' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'watts' ? '#3b82f6' : colors.inputBorder}`,
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Watts/Sq Ft
          </button>
        </div>

        {/* Active Tab Content */}
        {tabComponents[activeTab]}
      </div>

      {/* Footer */}
      <div style={{ background: colors.footerBg, color: colors.footerText, padding: '1rem 1.5rem', borderTop: `1px solid ${colors.footerBorder}`, fontSize: '0.75rem' }}>
        <p style={{ fontWeight: '600', marginTop: 0, marginBottom: '0.5rem', color: colors.labelText }}>NEC Article 220 & 410:</p>
        <p style={{ margin: 0 }}>
          220.12: Lighting unit loads by occupancy • 210.19(A): Continuous loads require 125% conductor sizing • 410: Luminaires and lamps • Calculations provide code-minimum requirements
        </p>
      </div>
    </div>
  );
}

export default LightingCalculator;