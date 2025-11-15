import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Lightbulb, Sun, Grid3X3, Zap, FileDown, Briefcase } from 'lucide-react';
import { exportToPDF } from '../../../../utils/pdfExport';
import { getUserJobs, addCalculationToJob } from '../../../jobs/jobsService';
import CalculatorLayout, { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox,
  TabGroup
} from '../CalculatorLayout';
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

const LightingCalculator = forwardRef(({ isDarkMode = false, onExportSuccess }, ref) => {
  const [activeTab, setActiveTab] = useState('lumens');
  const [showJobSelector, setShowJobSelector] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  
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

  const tabs = [
    { id: 'lumens', label: 'Room Lumens', icon: Sun },
    { id: 'spacing', label: 'Fixture Spacing', icon: Grid3X3 },
    { id: 'watts', label: 'Watts/Sq Ft', icon: Zap }
  ];

  const handleOpenJobSelector = async () => {
    setShowJobSelector(true);
    setLoadingJobs(true);
    try {
      const userJobs = await getUserJobs();
      setJobs(userJobs);
    } catch (error) {
      console.error('Error loading jobs:', error);
      alert('Failed to load jobs. Please try again.');
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleAttachToJob = async (jobId) => {
    try {
      let calculationData;

      if (activeTab === 'lumens') {
        const results = calculateLumens(
          lumensData.roomLength,
          lumensData.roomWidth,
          lumensData.roomType,
          lumensData.lumensPerFixture
        );
        calculationData = {
          type: 'lighting-lumens',
          data: {
            ...lumensData,
            results
          }
        };
      } else if (activeTab === 'spacing') {
        const results = calculateFixtureSpacing(
          spacingData.roomLength,
          spacingData.roomWidth,
          spacingData.ceilingHeight,
          spacingData.fixtureType
        );
        calculationData = {
          type: 'lighting-spacing',
          data: {
            ...spacingData,
            results
          }
        };
      } else if (activeTab === 'watts') {
        const results = calculateWattsPerSqFt(wattsData.area, wattsData.buildingType);
        calculationData = {
          type: 'lighting-watts',
          data: {
            ...wattsData,
            results
          }
        };
      }
      
      await addCalculationToJob(jobId, calculationData);
      setShowJobSelector(false);
      alert('Calculation attached to job successfully!');
    } catch (error) {
      console.error('Error attaching calculation:', error);
      alert('Failed to attach calculation. Please try again.');
    }
  };

  const handleExport = () => {
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
    
    if (onExportSuccess) {
      onExportSuccess();
    }
  };

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: handleExport
  }));

  return (
    <div style={{ margin: '0 -1rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        {/* Tab Navigation */}
        <TabGroup 
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          isDarkMode={isDarkMode}
        />

        {/* Active Tab Content */}
        {activeTab === 'lumens' && (
          <LumensCalculator 
            lumensData={lumensData} 
            setLumensData={setLumensData} 
            isDarkMode={isDarkMode}
            onExport={handleExport}
            onAttachToJob={handleOpenJobSelector}
          />
        )}
        {activeTab === 'spacing' && (
          <FixtureSpacingCalculator 
            spacingData={spacingData} 
            setSpacingData={setSpacingData} 
            isDarkMode={isDarkMode}
            onExport={handleExport}
            onAttachToJob={handleOpenJobSelector}
          />
        )}
        {activeTab === 'watts' && (
          <WattsPerSqFtCalculator 
            wattsData={wattsData} 
            setWattsData={setWattsData} 
            isDarkMode={isDarkMode}
            onExport={handleExport}
            onAttachToJob={handleOpenJobSelector}
          />
        )}

        {/* Job Selector Modal */}
        {showJobSelector && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              background: isDarkMode ? '#374151' : '#ffffff',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              maxWidth: '400px',
              width: '100%',
              maxHeight: '80vh',
              overflow: 'auto'
            }}>
              <h3 style={{ 
                marginTop: 0, 
                marginBottom: '1rem',
                color: isDarkMode ? '#f9fafb' : '#111827',
                fontSize: '1.125rem',
                fontWeight: '600'
              }}>
                Select a Job
              </h3>
              
              <div style={{ marginBottom: '1rem' }}>
                {loadingJobs ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem', 
                    color: isDarkMode ? '#d1d5db' : '#374151' 
                  }}>
                    Loading jobs...
                  </div>
                ) : jobs && jobs.length > 0 ? (
                  jobs.map(job => (
                    <div
                      key={job.id}
                      onClick={() => handleAttachToJob(job.id)}
                      style={{
                        padding: '1rem',
                        background: isDarkMode ? '#1f2937' : '#f9fafb',
                        borderRadius: '0.5rem',
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                        border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <div style={{ 
                        fontWeight: '600', 
                        color: isDarkMode ? '#f9fafb' : '#111827',
                        marginBottom: '0.25rem'
                      }}>
                        {job.name}
                      </div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        color: isDarkMode ? '#d1d5db' : '#374151' 
                      }}>
                        {job.location || 'No location'}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '2rem', 
                    color: isDarkMode ? '#d1d5db' : '#374151' 
                  }}>
                    <p>No jobs found. Create a job first.</p>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => setShowJobSelector(false)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#4b5563'}
                onMouseOut={(e) => e.currentTarget.style.background = '#6b7280'}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </CalculatorLayout>
    </div>
  );
});

export default LightingCalculator;