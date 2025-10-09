import React, { useState } from 'react';
import { Lightbulb, CheckCircle, Info } from 'lucide-react';

function LightingCalculator({ isDarkMode = false, onBack }) {
  const [activeTab, setActiveTab] = useState('lumens');

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

  // Lumens Calculator
  const LumensCalculator = () => {
    const [roomLength, setRoomLength] = useState('');
    const [roomWidth, setRoomWidth] = useState('');
    const [roomType, setRoomType] = useState('living');
    const [lumensPerFixture, setLumensPerFixture] = useState('');

    const footCandlesByRoom = {
      'living': 10, 'kitchen': 50, 'bathroom': 70, 'bedroom': 10,
      'office': 50, 'workshop': 75, 'garage': 50, 'hallway': 5,
      'dining': 30, 'laundry': 50
    };

    const roomTypeNames = {
      'living': 'Living Room (10 fc)', 'kitchen': 'Kitchen (50 fc)',
      'bathroom': 'Bathroom (70 fc)', 'bedroom': 'Bedroom (10 fc)',
      'office': 'Office/Study (50 fc)', 'workshop': 'Workshop (75 fc)',
      'garage': 'Garage (50 fc)', 'hallway': 'Hallway (5 fc)',
      'dining': 'Dining Room (30 fc)', 'laundry': 'Laundry Room (50 fc)'
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Room Length (feet)
            </label>
            <input
              type="number"
              value={roomLength}
              onChange={(e) => setRoomLength(e.target.value)}
              placeholder="Enter length"
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
              Room Width (feet)
            </label>
            <input
              type="number"
              value={roomWidth}
              onChange={(e) => setRoomWidth(e.target.value)}
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

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Room Type
            </label>
            <select
              value={roomType}
              onChange={(e) => setRoomType(e.target.value)}
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
              {Object.entries(roomTypeNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>fc = foot-candles</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Lumens per Fixture (Optional)
            </label>
            <input
              type="number"
              value={lumensPerFixture}
              onChange={(e) => setLumensPerFixture(e.target.value)}
              placeholder="e.g., 800"
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
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>To calculate fixture count</div>
          </div>
        </div>

        {results && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: results.fixturesNeeded ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Room Area
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {results.area}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  sq ft
                </div>
              </div>
              
              <div style={{
                background: '#dbeafe',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                  Total Lumens Needed
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                  {results.totalLumens}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.25rem' }}>
                  lumens
                </div>
              </div>

              {results.fixturesNeeded && (
                <div style={{
                  background: colors.sectionBg,
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                    Fixtures Needed
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                    {results.fixturesNeeded}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                    fixtures
                  </div>
                </div>
              )}
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
                    Lighting Requirements
                  </div>
                  <div>Recommended level: {results.footCandles} foot-candles</div>
                  {results.fixturesNeeded && (
                    <div>Using {lumensPerFixture} lumens per fixture</div>
                  )}
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
                Lighting Tips:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>LED bulbs typically produce 60-100 lumens per watt</li>
                <li>Layer lighting: combine ambient, task, and accent lighting</li>
                <li>Dark wall colors absorb light; increase lumens by 10-20%</li>
              </ul>
            </div>
          </>
        )}
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
      
      // Calculate maximum spacing based on ceiling height and fixture type
      const maxSpacing = height * ratio;
      
      // Industry standard for recessed cans: 4-6 feet spacing
      // Most common practice is 5-6 feet for residential, balanced coverage
      const targetSpacing = fixtureType === 'recessed' ? 6 : maxSpacing * 0.8;
      
      // Calculate number of fixtures needed
      // Round to nearest integer for most balanced layout
      const fixturesLength = Math.max(2, Math.round(length / targetSpacing));
      const fixturesWidth = Math.max(2, Math.round(width / targetSpacing));
      
      const totalFixtures = fixturesLength * fixturesWidth;
      
      // Calculate actual spacing between fixtures
      const actualSpacingLength = length / fixturesLength;
      const actualSpacingWidth = width / fixturesWidth;
      
      // Wall offset is half the actual spacing for centered layout
      const wallOffsetLength = actualSpacingLength / 2;
      const wallOffsetWidth = actualSpacingWidth / 2;

      return {
        maxSpacing: maxSpacing.toFixed(1),
        fixturesLength,
        fixturesWidth,
        totalFixtures,
        actualSpacingLength: actualSpacingLength.toFixed(1),
        actualSpacingWidth: actualSpacingWidth.toFixed(1),
        wallOffsetLength: wallOffsetLength.toFixed(1),
        wallOffsetWidth: wallOffsetWidth.toFixed(1)
      };
    };

    const results = calculateSpacing();

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Room Length (feet)
            </label>
            <input
              type="number"
              value={roomLength}
              onChange={(e) => setRoomLength(e.target.value)}
              placeholder="Enter length"
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
              Room Width (feet)
            </label>
            <input
              type="number"
              value={roomWidth}
              onChange={(e) => setRoomWidth(e.target.value)}
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

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Ceiling Height (feet)
            </label>
            <input
              type="number"
              value={ceilingHeight}
              onChange={(e) => setCeilingHeight(e.target.value)}
              placeholder="8"
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
              Fixture Type
            </label>
            <select
              value={fixtureType}
              onChange={(e) => setFixtureType(e.target.value)}
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
              <option value="recessed">Recessed Can (1.5:1 ratio)</option>
              <option value="pendant">Pendant (1:1 ratio)</option>
              <option value="track">Track Light (2:1 ratio)</option>
              <option value="surface">Surface Mount (1.5:1 ratio)</option>
            </select>
          </div>
        </div>

        {results && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Max Spacing
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {results.maxSpacing}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  feet
                </div>
              </div>
              
              <div style={{
                background: '#dbeafe',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                  Total Fixtures
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                  {results.totalFixtures}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.25rem' }}>
                  fixtures
                </div>
              </div>

              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Layout
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {results.fixturesLength}×{results.fixturesWidth}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  grid
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
                    Spacing Results
                  </div>
                  <div>Length spacing: {results.actualSpacingLength} ft</div>
                  <div>Width spacing: {results.actualSpacingWidth} ft</div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8125rem' }}>
                    Start {results.wallOffsetLength} ft from walls (length) and {results.wallOffsetWidth} ft from walls (width)
                  </div>
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
                Spacing Guidelines:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>Industry standard: 4-6 feet spacing for recessed cans</li>
                <li>Spacing ratio = max distance between fixtures ÷ ceiling height</li>
                <li>Space fixtures evenly with proper wall offsets for uniform coverage</li>
              </ul>
            </div>
          </>
        )}
      </div>
    );
  };

  // Watts per Square Foot Calculator
  const WattsPerSqFtCalculator = () => {
    const [area, setArea] = useState('');
    const [buildingType, setBuildingType] = useState('office');

    const wattsPerSqFt = {
      'office': 1.0, 'retail': 1.5, 'warehouse': 0.5, 'school': 1.2,
      'hospital': 1.0, 'hotel': 1.0, 'restaurant': 1.3, 'residential': 1.0
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Area (square feet)
            </label>
            <input
              type="number"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Enter area"
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
              Building Type
            </label>
            <select
              value={buildingType}
              onChange={(e) => setBuildingType(e.target.value)}
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
              {Object.entries(buildingTypeNames).map(([key, name]) => (
                <option key={key} value={key}>{name}</option>
              ))}
            </select>
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>Per NEC Table 220.12</div>
          </div>
        </div>

        {results && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Unit Load
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {results.wattsPerSqFt}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  W/sq ft
                </div>
              </div>
              
              <div style={{
                background: '#dbeafe',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                  Total Load
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                  {results.totalWatts}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.25rem' }}>
                  watts
                </div>
              </div>

              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  20A Circuits
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {results.circuits}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  needed
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
                    Lighting Load Calculation
                  </div>
                  <div>Total VA: {results.totalVA} VA</div>
                  <div>Current @ 120V: {results.amperage} A</div>
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
                NEC Requirements:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>NEC 220.12 specifies unit lighting loads by occupancy</li>
                <li>Calculate using building area, not just lit area</li>
                <li>Continuous loads require 125% conductor/OCPD sizing</li>
              </ul>
            </div>
          </>
        )}
      </div>
    );
  };

  const tabComponents = {
    lumens: <LumensCalculator />,
    spacing: <FixtureSpacingCalculator />,
    watts: <WattsPerSqFtCalculator />
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header Card */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Lightbulb size={24} color="#3b82f6" />
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: colors.cardText,
            margin: 0 
          }}>
            Lighting Calculations
          </h2>
        </div>
        <p style={{ 
          fontSize: '0.875rem', 
          color: colors.labelText,
          margin: 0 
        }}>
          Professional Lighting Design
        </p>
      </div>

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
          { id: 'lumens', label: 'Room Lumens' },
          { id: 'spacing', label: 'Fixture Spacing' },
          { id: 'watts', label: 'Watts/Sq Ft' }
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
}

export default LightingCalculator;