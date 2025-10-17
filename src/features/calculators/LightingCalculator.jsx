import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Lightbulb, CheckCircle, Info } from 'lucide-react';
import { exportToPDF } from '../../utils/pdfExport';

// Move calculator components OUTSIDE to prevent recreation on each render
const LumensCalculator = ({ lumensData, setLumensData, colors }) => {
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
    if (!lumensData.roomLength || !lumensData.roomWidth) return null;
    
    const length = parseFloat(lumensData.roomLength);
    const width = parseFloat(lumensData.roomWidth);
    const area = length * width;
    const footCandles = footCandlesByRoom[lumensData.roomType];
    const totalLumens = footCandles * area;
    
    let fixturesNeeded = null;
    if (lumensData.lumensPerFixture) {
      const lpf = parseFloat(lumensData.lumensPerFixture);
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
            value={lumensData.roomLength}
            onChange={(e) => setLumensData(prev => ({...prev, roomLength: e.target.value}))}
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
            value={lumensData.roomWidth}
            onChange={(e) => setLumensData(prev => ({...prev, roomWidth: e.target.value}))}
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
            Room Type <br/>  <br/>
          </label>
          <select
            value={lumensData.roomType}
            onChange={(e) => setLumensData(prev => ({...prev, roomType: e.target.value}))}
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
            value={lumensData.lumensPerFixture}
            onChange={(e) => setLumensData(prev => ({...prev, lumensPerFixture: e.target.value}))}
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
                  <div>Using {lumensData.lumensPerFixture} lumens per fixture</div>
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

const FixtureSpacingCalculator = ({ spacingData, setSpacingData, colors }) => {
  const spacingRatios = {
    'recessed': 1.5,
    'pendant': 1.0,
    'track': 2.0,
    'surface': 1.5
  };

  const calculateSpacing = () => {
    if (!spacingData.roomLength || !spacingData.roomWidth) return null;
    
    const length = parseFloat(spacingData.roomLength);
    const width = parseFloat(spacingData.roomWidth);
    const height = parseFloat(spacingData.ceilingHeight);
    const ratio = spacingRatios[spacingData.fixtureType];
    
    const maxSpacing = height * ratio;
    const targetSpacing = spacingData.fixtureType === 'recessed' ? 6 : maxSpacing * 0.8;
    
    const fixturesLength = Math.max(2, Math.round(length / targetSpacing));
    const fixturesWidth = Math.max(2, Math.round(width / targetSpacing));
    
    const totalFixtures = fixturesLength * fixturesWidth;
    
    const actualSpacingLength = length / fixturesLength;
    const actualSpacingWidth = width / fixturesWidth;
    
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
            value={spacingData.roomLength}
            onChange={(e) => setSpacingData(prev => ({...prev, roomLength: e.target.value}))}
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
            value={spacingData.roomWidth}
            onChange={(e) => setSpacingData(prev => ({...prev, roomWidth: e.target.value}))}
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
            value={spacingData.ceilingHeight}
            onChange={(e) => setSpacingData(prev => ({...prev, ceilingHeight: e.target.value}))}
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
            value={spacingData.fixtureType}
            onChange={(e) => setSpacingData(prev => ({...prev, fixtureType: e.target.value}))}
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

const WattsPerSqFtCalculator = ({ wattsData, setWattsData, colors }) => {
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
    if (!wattsData.area) return null;
    
    const sqft = parseFloat(wattsData.area);
    const watts = wattsPerSqFt[wattsData.buildingType];
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
            value={wattsData.area}
            onChange={(e) => setWattsData(prev => ({...prev, area: e.target.value}))}
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
            value={wattsData.buildingType}
            onChange={(e) => setWattsData(prev => ({...prev, buildingType: e.target.value}))}
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

const LightingCalculator = forwardRef(({ isDarkMode = false, onBack }, ref) => {
  const [activeTab, setActiveTab] = useState('lumens');

  // Lifted state for all calculators
  const [lumensData, setLumensData] = useState({
    roomLength: '',
    roomWidth: '',
    roomType: 'living',
    lumensPerFixture: ''
  });

  const [spacingData, setSpacingData] = useState({
    roomLength: '',
    roomWidth: '',
    ceilingHeight: '8',
    fixtureType: 'recessed'
  });

  const [wattsData, setWattsData] = useState({
    area: '',
    buildingType: 'office'
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

      if (activeTab === 'lumens') {
        if (!lumensData.roomLength || !lumensData.roomWidth) {
          alert('Please enter room dimensions before exporting');
          return;
        }

        const roomTypeNames = {
          'living': 'Living Room', 'kitchen': 'Kitchen',
          'bathroom': 'Bathroom', 'bedroom': 'Bedroom',
          'office': 'Office/Study', 'workshop': 'Workshop',
          'garage': 'Garage', 'hallway': 'Hallway',
          'dining': 'Dining Room', 'laundry': 'Laundry Room'
        };

        const footCandlesByRoom = {
          'living': 10, 'kitchen': 50, 'bathroom': 70, 'bedroom': 10,
          'office': 50, 'workshop': 75, 'garage': 50, 'hallway': 5,
          'dining': 30, 'laundry': 50
        };

        const length = parseFloat(lumensData.roomLength);
        const width = parseFloat(lumensData.roomWidth);
        const area = (length * width).toFixed(1);
        const footCandles = footCandlesByRoom[lumensData.roomType];
        const totalLumens = (footCandles * area).toFixed(0);
        
        const inputs = {
          roomLength: `${lumensData.roomLength} feet`,
          roomWidth: `${lumensData.roomWidth} feet`,
          roomType: `${roomTypeNames[lumensData.roomType]} (${footCandles} fc)`
        };

        const results = {
          roomArea: `${area} sq ft`,
          totalLumensNeeded: `${totalLumens} lumens`
        };

        if (lumensData.lumensPerFixture) {
          const lpf = parseFloat(lumensData.lumensPerFixture);
          const fixturesNeeded = Math.ceil(parseFloat(totalLumens) / lpf);
          inputs.lumensPerFixture = `${lumensData.lumensPerFixture} lumens`;
          results.fixturesNeeded = `${fixturesNeeded} fixtures`;
        }

        pdfData = {
          calculatorName: 'Lighting Calculations - Room Lumens',
          inputs,
          results,
          additionalInfo: {
            calculation: `Area (${area} sq ft) × Recommended Level (${footCandles} foot-candles) = ${totalLumens} lumens`,
            tip1: 'LED bulbs typically produce 60-100 lumens per watt',
            tip2: 'Layer lighting: combine ambient, task, and accent lighting',
            tip3: 'Dark wall colors absorb light; increase lumens by 10-20%'
          },
          necReferences: [
            'IES (Illuminating Engineering Society) recommended light levels',
            'Foot-candles measure illuminance on a surface',
            '1 foot-candle = 1 lumen per square foot'
          ]
        };

      } else if (activeTab === 'spacing') {
        if (!spacingData.roomLength || !spacingData.roomWidth) {
          alert('Please enter room dimensions before exporting');
          return;
        }

        const fixtureTypeNames = {
          'recessed': 'Recessed Can (1.5:1 ratio)',
          'pendant': 'Pendant (1:1 ratio)',
          'track': 'Track Light (2:1 ratio)',
          'surface': 'Surface Mount (1.5:1 ratio)'
        };

        const spacingRatios = {
          'recessed': 1.5, 'pendant': 1.0, 'track': 2.0, 'surface': 1.5
        };

        const length = parseFloat(spacingData.roomLength);
        const width = parseFloat(spacingData.roomWidth);
        const height = parseFloat(spacingData.ceilingHeight);
        const ratio = spacingRatios[spacingData.fixtureType];
        
        const maxSpacing = (height * ratio).toFixed(1);
        const targetSpacing = spacingData.fixtureType === 'recessed' ? 6 : parseFloat(maxSpacing) * 0.8;
        
        const fixturesLength = Math.max(2, Math.round(length / targetSpacing));
        const fixturesWidth = Math.max(2, Math.round(width / targetSpacing));
        const totalFixtures = fixturesLength * fixturesWidth;
        
        const actualSpacingLength = (length / fixturesLength).toFixed(1);
        const actualSpacingWidth = (width / fixturesWidth).toFixed(1);
        const wallOffsetLength = (parseFloat(actualSpacingLength) / 2).toFixed(1);
        const wallOffsetWidth = (parseFloat(actualSpacingWidth) / 2).toFixed(1);

        pdfData = {
          calculatorName: 'Lighting Calculations - Fixture Spacing',
          inputs: {
            roomLength: `${spacingData.roomLength} feet`,
            roomWidth: `${spacingData.roomWidth} feet`,
            ceilingHeight: `${spacingData.ceilingHeight} feet`,
            fixtureType: fixtureTypeNames[spacingData.fixtureType]
          },
          results: {
            maximumSpacing: `${maxSpacing} feet`,
            totalFixtures: `${totalFixtures} fixtures`,
            layoutGrid: `${fixturesLength} × ${fixturesWidth}`,
            lengthSpacing: `${actualSpacingLength} feet`,
            widthSpacing: `${actualSpacingWidth} feet`
          },
          additionalInfo: {
            wallOffsets: `Start ${wallOffsetLength} ft from walls (length) and ${wallOffsetWidth} ft from walls (width)`,
            spacingFormula: `Maximum spacing = Ceiling height (${height} ft) × Spacing ratio (${ratio}) = ${maxSpacing} ft`,
            tip1: 'Industry standard: 4-6 feet spacing for recessed cans',
            tip2: 'Space fixtures evenly with proper wall offsets for uniform coverage'
          },
          necReferences: [
            'Spacing ratio guidelines from IES Lighting Handbook',
            'Recessed fixtures: 1.5:1 ratio (spacing to mounting height)',
            'Pendant fixtures: 1:1 ratio for focused task lighting',
            'Track lights: 2:1 ratio for accent lighting'
          ]
        };

      } else if (activeTab === 'watts') {
        if (!wattsData.area) {
          alert('Please enter area before exporting');
          return;
        }

        const buildingTypeNames = {
          'office': 'Office Building',
          'retail': 'Retail Store',
          'warehouse': 'Warehouse',
          'school': 'School',
          'hospital': 'Hospital',
          'hotel': 'Hotel',
          'restaurant': 'Restaurant',
          'residential': 'Residential'
        };

        const wattsPerSqFt = {
          'office': 1.0, 'retail': 1.5, 'warehouse': 0.5, 'school': 1.2,
          'hospital': 1.0, 'hotel': 1.0, 'restaurant': 1.3, 'residential': 1.0
        };

        const sqft = parseFloat(wattsData.area);
        const watts = wattsPerSqFt[wattsData.buildingType];
        const totalWatts = (sqft * watts).toFixed(0);
        const totalVA = totalWatts;
        const amperage = (parseFloat(totalVA) / 120).toFixed(1);
        const circuits = Math.ceil(parseFloat(amperage) / 16);

        pdfData = {
          calculatorName: 'Lighting Calculations - Watts per Square Foot',
          inputs: {
            area: `${wattsData.area} square feet`,
            buildingType: `${buildingTypeNames[wattsData.buildingType]} (${watts} W/sq ft)`
          },
          results: {
            unitLoad: `${watts} W/sq ft`,
            totalLoad: `${totalWatts} watts`,
            totalVA: `${totalVA} VA`,
            currentAt120V: `${amperage} Amps`,
            requiredCircuits: `${circuits} × 20A circuits`
          },
          additionalInfo: {
            calculation: `Area (${sqft} sq ft) × Unit Load (${watts} W/sq ft) = ${totalWatts} watts`,
            circuitCalculation: `Total current (${amperage} A) ÷ 16A (80% of 20A) = ${circuits} circuits needed`,
            note: 'Continuous loads require 125% conductor/OCPD sizing'
          },
          necReferences: [
            'NEC Table 220.12 - General Lighting Loads by Occupancy',
            'NEC 210.19(A)(1) - Branch Circuit Ampacity',
            'NEC 210.20(A) - Continuous and Noncontinuous Loads',
            'Calculate using building area, not just lit area'
          ]
        };
      }

      exportToPDF(pdfData);
    }
  }));

  const tabComponents = {
    lumens: <LumensCalculator lumensData={lumensData} setLumensData={setLumensData} colors={colors} />,
    spacing: <FixtureSpacingCalculator spacingData={spacingData} setSpacingData={setSpacingData} colors={colors} />,
    watts: <WattsPerSqFtCalculator wattsData={wattsData} setWattsData={setWattsData} colors={colors} />
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
});

export default LightingCalculator;