import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Lightbulb } from 'lucide-react';
import { exportToPDF } from "../../../../utils/pdfExport";
import LumensCalculator from './LumensCalculator';
import FixtureSpacingCalculator from './FixtureSpacingCalculator';
import WattsPerSqFtCalculator from './WattsPerSqFtCalculator';
import { 
  calculateLumens, 
  calculateFixtureSpacing, 
  calculateWattsPerSqFt 
} from './utils/lightingCalculations';
import {
  ROOM_TYPE_NAMES,
  FIXTURE_TYPE_NAMES,
  BUILDING_TYPE_NAMES,
  FOOT_CANDLES_BY_ROOM,
  SPACING_RATIOS,
  WATTS_PER_SQ_FT
} from './utils/lightingConstants';
import styles from '../Calculator.module.css';

const LightingCalculator = forwardRef(({ isDarkMode = false }, ref) => {
  const [activeTab, setActiveTab] = useState('lumens');
  
  // State for each calculator tab
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

  // Color scheme based on dark mode
  const colors = {
    cardBg: isDarkMode ? '#1f2937' : '#ffffff',
    cardBorder: isDarkMode ? '#374151' : '#e5e7eb',
    cardText: isDarkMode ? '#f3f4f6' : '#111827',
    labelText: isDarkMode ? '#d1d5db' : '#374151',
    inputBorder: isDarkMode ? '#4b5563' : '#d1d5d8',
    inputBg: isDarkMode ? '#374151' : '#ffffff',
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

        const results = calculateLumens(
          lumensData.roomLength,
          lumensData.roomWidth,
          lumensData.roomType,
          lumensData.lumensPerFixture
        );

        const inputs = {
          roomLength: `${lumensData.roomLength} feet`,
          roomWidth: `${lumensData.roomWidth} feet`,
          roomType: `${ROOM_TYPE_NAMES[lumensData.roomType].split('(')[0].trim()} (${results.footCandles} fc)`
        };

        const pdfResults = {
          roomArea: `${results.area} sq ft`,
          totalLumensNeeded: `${results.totalLumens} lumens`
        };

        if (lumensData.lumensPerFixture) {
          inputs.lumensPerFixture = `${lumensData.lumensPerFixture} lumens`;
          pdfResults.fixturesNeeded = `${results.fixturesNeeded} fixtures`;
        }

        pdfData = {
          calculatorName: 'Lighting Calculations - Room Lumens',
          inputs,
          results: pdfResults,
          additionalInfo: {
            calculation: `Area (${results.area} sq ft) × Recommended Level (${results.footCandles} foot-candles) = ${results.totalLumens} lumens`,
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
        if (!spacingData.roomLength || !spacingData.roomWidth || !spacingData.ceilingHeight) {
          alert('Please enter room dimensions and ceiling height before exporting');
          return;
        }

        const results = calculateFixtureSpacing(
          spacingData.roomLength,
          spacingData.roomWidth,
          spacingData.ceilingHeight,
          spacingData.fixtureType
        );

        pdfData = {
          calculatorName: 'Lighting Calculations - Fixture Spacing',
          inputs: {
            roomLength: `${spacingData.roomLength} feet`,
            roomWidth: `${spacingData.roomWidth} feet`,
            ceilingHeight: `${spacingData.ceilingHeight} feet`,
            fixtureType: FIXTURE_TYPE_NAMES[spacingData.fixtureType]
          },
          results: {
            mountingHeight: `${results.mountingHeight} feet`,
            maximumSpacing: `${results.maxSpacing} feet`,
            targetSpacing: `${results.targetSpacing} feet`,
            totalFixtures: `${results.totalFixtures} fixtures`,
            layoutGrid: `${results.fixturesLength} × ${results.fixturesWidth}`,
            lengthSpacing: `${results.actualSpacingLength} feet`,
            widthSpacing: `${results.actualSpacingWidth} feet`
          },
          additionalInfo: {
            wallOffsets: `Start ${results.wallOffsetLength} ft from long walls and ${results.wallOffsetWidth} ft from short walls`,
            spacingFormula: `Mounting height (${results.mountingHeight} ft) × Spacing ratio (${SPACING_RATIOS[spacingData.fixtureType]}) = ${results.maxSpacing} ft max spacing`,
            tip1: 'Higher ceilings require closer fixture spacing due to light spread and intensity loss',
            tip2: 'Space fixtures evenly with proper wall offsets for uniform coverage'
          },
          necReferences: [
            'Spacing ratio guidelines from IES Lighting Handbook',
            'Mounting height measured from work plane (typically 30" above floor)',
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

        const results = calculateWattsPerSqFt(wattsData.area, wattsData.buildingType);

        pdfData = {
          calculatorName: 'Lighting Calculations - Watts per Square Foot',
          inputs: {
            area: `${wattsData.area} square feet`,
            buildingType: `${BUILDING_TYPE_NAMES[wattsData.buildingType]} (${results.unitLoad} W/sq ft)`
          },
          results: {
            unitLoad: `${results.unitLoad} W/sq ft`,
            totalLoad: `${results.totalWatts} watts`,
            totalVA: `${results.totalVA} VA`,
            currentAt120V: `${results.amperage} Amps`,
            requiredCircuits: `${results.circuits} × 20A circuits`
          },
          additionalInfo: {
            calculation: `Area (${wattsData.area} sq ft) × Unit Load (${results.unitLoad} W/sq ft) = ${results.totalWatts} watts`,
            circuitCalculation: `Total current (${results.amperage} A) ÷ 16A (80% of 20A) = ${results.circuits} circuits needed`,
            note: 'Continuous loads require 125% conductor/OCPD sizing per NEC'
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
            className={styles.btn}
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
        {activeTab === 'lumens' && (
          <LumensCalculator 
            lumensData={lumensData} 
            setLumensData={setLumensData} 
            colors={colors} 
          />
        )}
        {activeTab === 'spacing' && (
          <FixtureSpacingCalculator 
            spacingData={spacingData} 
            setSpacingData={setSpacingData} 
            colors={colors} 
          />
        )}
        {activeTab === 'watts' && (
          <WattsPerSqFtCalculator 
            wattsData={wattsData} 
            setWattsData={setWattsData} 
            colors={colors} 
          />
        )}
      </div>
    </div>
  );
});

export default LightingCalculator;