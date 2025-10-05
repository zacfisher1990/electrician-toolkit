import React, { useState } from 'react';
import { Lightbulb, ArrowLeft } from 'lucide-react';

function LightingCalculator({ onBack }) {
  const [activeTab, setActiveTab] = useState('lumens');

  // Lumens Calculator
  const LumensCalculator = () => {
    const [roomLength, setRoomLength] = useState('');
    const [roomWidth, setRoomWidth] = useState('');
    const [roomType, setRoomType] = useState('living');
    const [lumensPerFixture, setLumensPerFixture] = useState('');

    // Recommended foot-candles by room type
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
      
      // Lumens = foot-candles × area
      const totalLumens = footCandles * area;
      
      // Calculate number of fixtures if lumens per fixture is provided
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
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Room Length (feet)
            </label>
            <input
              type="number"
              value={roomLength}
              onChange={(e) => setRoomLength(e.target.value)}
              placeholder="Enter length"
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Room Width (feet)
            </label>
            <input
              type="number"
              value={roomWidth}
              onChange={(e) => setRoomWidth(e.target.value)}
              placeholder="Enter width"
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Room Type
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            >
              {Object.entries(roomTypeNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>fc = foot-candles</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Lumens per Fixture (Optional)
            </label>
            <input
              type="number"
              value={lumensPerFixture}
              onChange={(e) => setLumensPerFixture(e.target.value)}
              placeholder="e.g., 800"
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            />
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>To calculate fixture count</div>
          </div>
        </div>

        {results && (
          <div style={{ 
            background: '#dcfce7', 
            border: '2px solid #16a34a', 
            padding: '1.5rem', 
            borderRadius: '0.5rem'
          }}>
            <h3 style={{ fontWeight: 'bold', color: '#166534', marginTop: 0, marginBottom: '1rem' }}>
              Lighting Requirements
            </h3>

            <div style={{ 
              background: '#f8fafc', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              color: '#374151'
            }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <strong>Room Area:</strong> {results.area} sq ft
              </div>
              <div style={{ fontSize: '0.875rem' }}>
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
          background: '#f8fafc',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
          marginTop: '1.5rem'
        }}>
          <strong style={{ color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Lighting Tips:</strong>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
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
      
      // Maximum spacing = ceiling height × spacing ratio
      const maxSpacing = height * ratio;
      
      // Calculate number of fixtures needed in each direction
      const fixturesLength = Math.ceil(length / maxSpacing);
      const fixturesWidth = Math.ceil(width / maxSpacing);
      const totalFixtures = fixturesLength * fixturesWidth;
      
      // Calculate actual spacing
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
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Room Length (feet)
            </label>
            <input
              type="number"
              value={roomLength}
              onChange={(e) => setRoomLength(e.target.value)}
              placeholder="Enter length"
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Room Width (feet)
            </label>
            <input
              type="number"
              value={roomWidth}
              onChange={(e) => setRoomWidth(e.target.value)}
              placeholder="Enter width"
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Ceiling Height (feet)
            </label>
            <input
              type="number"
              value={ceilingHeight}
              onChange={(e) => setCeilingHeight(e.target.value)}
              placeholder="8"
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Fixture Type
            </label>
            <select
              value={fixtureType}
              onChange={(e) => setFixtureType(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
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
            background: '#dcfce7', 
            border: '2px solid #16a34a', 
            padding: '1.5rem', 
            borderRadius: '0.5rem'
          }}>
            <h3 style={{ fontWeight: 'bold', color: '#166534', marginTop: 0, marginBottom: '1rem' }}>
              Fixture Spacing Results
            </h3>

            <div style={{ 
              background: '#f8fafc', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              color: '#374151'
            }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <strong>Maximum Spacing:</strong> {results.maxSpacing} ft
              </div>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <strong>Fixtures in Length:</strong> {results.fixturesLength}
              </div>
              <div style={{ fontSize: '0.875rem' }}>
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
          background: '#f8fafc',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
          marginTop: '1.5rem'
        }}>
          <strong style={{ color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Spacing Guidelines:</strong>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
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
      const totalVA = totalWatts; // Assume unity power factor for lighting
      
      // Calculate circuit requirements (120V, 80% loading)
      const amperage120V = totalVA / 120;
      const circuits20A = Math.ceil(amperage120V / 16); // 20A × 80% = 16A usable

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
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Area (square feet)
            </label>
            <input
              type="number"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Enter area"
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Building Type
            </label>
            <select
              value={buildingType}
              onChange={(e) => setBuildingType(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            >
              {Object.entries(buildingTypeNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Per NEC Table 220.12</div>
          </div>
        </div>

        {results && (
          <div style={{ 
            background: '#dcfce7', 
            border: '2px solid #16a34a', 
            padding: '1.5rem', 
            borderRadius: '0.5rem'
          }}>
            <h3 style={{ fontWeight: 'bold', color: '#166534', marginTop: 0, marginBottom: '1rem' }}>
              Lighting Load Results
            </h3>

            <div style={{ 
              background: '#f8fafc', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              color: '#374151'
            }}>
              <div style={{ fontSize: '0.875rem' }}>
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
          background: '#f8fafc',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
          marginTop: '1.5rem'
        }}>
          <strong style={{ color: '#374151', display: 'block', marginBottom: '0.5rem' }}>NEC Requirements:</strong>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
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
    <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
      <div style={{ background: '#fbbf24', color: 'black', padding: '1.5rem', borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Lightbulb size={32} />
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Lighting Calculations</h1>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>Professional Lighting Design and Load Calculations</p>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '1.5rem' }}>
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
              background: activeTab === 'lumens' ? '#3b82f6' : '#e5e7eb',
              color: activeTab === 'lumens' ? 'white' : '#374151',
              border: 'none',
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
              background: activeTab === 'spacing' ? '#3b82f6' : '#e5e7eb',
              color: activeTab === 'spacing' ? 'white' : '#374151',
              border: 'none',
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
              background: activeTab === 'watts' ? '#3b82f6' : '#e5e7eb',
              color: activeTab === 'watts' ? 'white' : '#374151',
              border: 'none',
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

      <div style={{ background: '#1e293b', color: '#cbd5e1', padding: '1.5rem', borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem', fontSize: '0.875rem' }}>
        <p style={{ fontWeight: '600', marginTop: 0, marginBottom: '0.75rem' }}>NEC References:</p>
        <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
          <li style={{ marginBottom: '0.25rem' }}>220.12 - Lighting unit loads by occupancy (watts per square foot)</li>
          <li style={{ marginBottom: '0.25rem' }}>210.19(A) - Continuous loads require 125% conductor sizing</li>
          <li style={{ marginBottom: '0.25rem' }}>410 - Luminaires, lampholders, and lamps</li>
          <li>These calculations provide code-minimum requirements; actual design may require more</li>
        </ul>
      </div>
    </div>
  );
}

export default LightingCalculator;