import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Zap, Activity, Radio, FileDown, Briefcase } from 'lucide-react';
import { exportToPDF } from '../../../../utils/pdfExport';
import { getUserJobs, addCalculationToJob } from '../../../jobs/jobsService';
import CalculatorLayout, { 
  TabGroup,
  InfoBox
} from '../CalculatorLayout';

// Import calculation utilities
import {
  calculateInductiveReactance,
  calculateCapacitiveReactance,
  calculateImpedance,
  calculateResonantFrequency
} from './reactanceCalculations';

// Import tab components
import InductiveReactanceTab from './InductiveReactanceTab';
import CapacitiveReactanceTab from './CapacitiveReactanceTab';
import ImpedanceCalculatorTab from './ImpedanceCalculatorTab';
import ResonantFrequencyTab from './ResonantFrequencyTab';

const ReactanceImpedanceCalculator = forwardRef(({ isDarkMode = false, onExportSuccess }, ref) => {
  const [activeTab, setActiveTab] = useState('inductive');
  const [showJobSelector, setShowJobSelector] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // Inductive Reactance State
  const [inductiveFrequency, setInductiveFrequency] = useState('60');
  const [inductance, setInductance] = useState('');
  const [inductanceUnit, setInductanceUnit] = useState('mH');

  // Capacitive Reactance State
  const [capacitiveFrequency, setCapacitiveFrequency] = useState('60');
  const [capacitance, setCapacitance] = useState('');
  const [capacitanceUnit, setCapacitanceUnit] = useState('μF');

  // Impedance Calculator State
  const [resistance, setResistance] = useState('');
  const [reactance, setReactance] = useState('');
  const [reactanceType, setReactanceType] = useState('inductive');

  // Resonant Frequency State
  const [resonantInductance, setResonantInductance] = useState('');
  const [resonantInductanceUnit, setResonantInductanceUnit] = useState('mH');
  const [resonantCapacitance, setResonantCapacitance] = useState('');
  const [resonantCapacitanceUnit, setResonantCapacitanceUnit] = useState('μF');

  const tabs = [
    { id: 'inductive', label: 'XL', icon: Zap },
    { id: 'capacitive', label: 'XC', icon: Activity },
    { id: 'impedance', label: 'Z', icon: Zap },
    { id: 'resonance', label: 'fr', icon: Radio }
  ];

  // Calculate results using utility functions
  const inductiveResult = calculateInductiveReactance(inductiveFrequency, inductance, inductanceUnit);
  const capacitiveResult = calculateCapacitiveReactance(capacitiveFrequency, capacitance, capacitanceUnit);
  const impedanceResult = calculateImpedance(resistance, reactance, reactanceType);
  const resonanceResult = calculateResonantFrequency(
    resonantInductance, 
    resonantInductanceUnit, 
    resonantCapacitance, 
    resonantCapacitanceUnit
  );

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

      if (activeTab === 'inductive') {
        calculationData = {
          type: 'reactance-inductive',
          data: {
            frequency: inductiveFrequency,
            inductance,
            inductanceUnit,
            results: inductiveResult
          }
        };
      } else if (activeTab === 'capacitive') {
        calculationData = {
          type: 'reactance-capacitive',
          data: {
            frequency: capacitiveFrequency,
            capacitance,
            capacitanceUnit,
            results: capacitiveResult
          }
        };
      } else if (activeTab === 'impedance') {
        calculationData = {
          type: 'reactance-impedance',
          data: {
            resistance,
            reactance,
            reactanceType,
            results: impedanceResult
          }
        };
      } else if (activeTab === 'resonance') {
        calculationData = {
          type: 'reactance-resonance',
          data: {
            inductance: resonantInductance,
            inductanceUnit: resonantInductanceUnit,
            capacitance: resonantCapacitance,
            capacitanceUnit: resonantCapacitanceUnit,
            results: resonanceResult
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
    if (activeTab === 'inductive') {
      if (!inductiveFrequency || !inductance) {
        alert('Please enter all required values before exporting to PDF');
        return;
      }

      const pdfData = {
        calculatorName: 'Reactance & Impedance - Inductive Reactance (XL)',
        inputs: {
          'Frequency': `${inductiveFrequency} Hz`,
          'Inductance': `${inductance} ${inductanceUnit}`
        },
        results: {
          'Inductive Reactance (XL)': `${inductiveResult.reactance} Ω`
        },
        additionalInfo: {
          'Formula': 'XL = 2πfL',
          'Description': 'Inductive reactance increases with frequency and opposes changes in current flow'
        },
        necReferences: [
          'Inductive reactance is directly proportional to frequency',
          'In AC circuits, inductors oppose current changes',
          'XL increases linearly with both frequency and inductance'
        ]
      };

      exportToPDF(pdfData);

    } else if (activeTab === 'capacitive') {
      if (!capacitiveFrequency || !capacitance) {
        alert('Please enter all required values before exporting to PDF');
        return;
      }

      const pdfData = {
        calculatorName: 'Reactance & Impedance - Capacitive Reactance (XC)',
        inputs: {
          'Frequency': `${capacitiveFrequency} Hz`,
          'Capacitance': `${capacitance} ${capacitanceUnit}`
        },
        results: {
          'Capacitive Reactance (XC)': `${capacitiveResult.reactance} Ω`
        },
        additionalInfo: {
          'Formula': 'XC = 1 / (2πfC)',
          'Description': 'Capacitive reactance decreases with frequency and opposes changes in voltage'
        },
        necReferences: [
          'Capacitive reactance is inversely proportional to frequency',
          'In AC circuits, capacitors oppose voltage changes',
          'XC decreases as frequency or capacitance increases'
        ]
      };

      exportToPDF(pdfData);

    } else if (activeTab === 'impedance') {
      if (!resistance || !reactance) {
        alert('Please enter all required values before exporting to PDF');
        return;
      }

      const pdfData = {
        calculatorName: 'Reactance & Impedance - Impedance Calculator',
        inputs: {
          'Reactance Type': reactanceType.charAt(0).toUpperCase() + reactanceType.slice(1),
          'Resistance (R)': `${resistance} Ω`,
          'Reactance (X)': `${reactance} Ω`
        },
        results: {
          'Impedance (Z)': `${impedanceResult.impedance} Ω`,
          'Phase Angle (θ)': `${impedanceResult.angle}°`,
          'Phase Relationship': reactanceType === 'inductive' ? 'Current Lags Voltage' : 'Current Leads Voltage'
        },
        additionalInfo: {
          'Impedance Formula': 'Z = √(R² + X²)',
          'Phase Angle Formula': 'θ = arctan(X / R)',
          'Description': 'Impedance is the total opposition to current flow in an AC circuit, combining resistance and reactance'
        },
        necReferences: [
          'Impedance combines resistive and reactive components',
          'Phase angle indicates the relationship between voltage and current',
          'In inductive circuits, current lags voltage; in capacitive circuits, current leads voltage'
        ]
      };

      exportToPDF(pdfData);

    } else if (activeTab === 'resonance') {
      if (!resonantInductance || !resonantCapacitance) {
        alert('Please enter all required values before exporting to PDF');
        return;
      }

      const pdfData = {
        calculatorName: 'Reactance & Impedance - Resonant Frequency',
        inputs: {
          'Inductance': `${resonantInductance} ${resonantInductanceUnit}`,
          'Capacitance': `${resonantCapacitance} ${resonantCapacitanceUnit}`
        },
        results: {
          'Resonant Frequency (fr)': `${resonanceResult.frequency} Hz`
        },
        additionalInfo: {
          'Formula': 'fr = 1 / (2π√LC)',
          'At Resonance': 'Inductive and capacitive reactances are equal and opposite (XL = XC)',
          'Series Circuit': 'Minimum impedance at resonance',
          'Parallel Circuit': 'Maximum impedance at resonance'
        },
        necReferences: [
          'Resonance occurs when XL = XC',
          'At resonant frequency, circuit is purely resistive',
          'Series resonant circuits have minimum impedance',
          'Parallel resonant circuits have maximum impedance'
        ]
      };

      exportToPDF(pdfData);
    }

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
        {activeTab === 'inductive' && (
          <InductiveReactanceTab
            frequency={inductiveFrequency}
            setFrequency={setInductiveFrequency}
            inductance={inductance}
            setInductance={setInductance}
            inductanceUnit={inductanceUnit}
            setInductanceUnit={setInductanceUnit}
            result={inductiveResult}
            isDarkMode={isDarkMode}
            onExport={handleExport}
            onAttachToJob={handleOpenJobSelector}
          />
        )}

        {activeTab === 'capacitive' && (
          <CapacitiveReactanceTab
            frequency={capacitiveFrequency}
            setFrequency={setCapacitiveFrequency}
            capacitance={capacitance}
            setCapacitance={setCapacitance}
            capacitanceUnit={capacitanceUnit}
            setCapacitanceUnit={setCapacitanceUnit}
            result={capacitiveResult}
            isDarkMode={isDarkMode}
            onExport={handleExport}
            onAttachToJob={handleOpenJobSelector}
          />
        )}

        {activeTab === 'impedance' && (
          <ImpedanceCalculatorTab
            reactanceType={reactanceType}
            setReactanceType={setReactanceType}
            resistance={resistance}
            setResistance={setResistance}
            reactance={reactance}
            setReactance={setReactance}
            result={impedanceResult}
            isDarkMode={isDarkMode}
            onExport={handleExport}
            onAttachToJob={handleOpenJobSelector}
          />
        )}

        {activeTab === 'resonance' && (
          <ResonantFrequencyTab
            inductance={resonantInductance}
            setInductance={setResonantInductance}
            inductanceUnit={resonantInductanceUnit}
            setInductanceUnit={setResonantInductanceUnit}
            capacitance={resonantCapacitance}
            setCapacitance={setResonantCapacitance}
            capacitanceUnit={resonantCapacitanceUnit}
            setCapacitanceUnit={setResonantCapacitanceUnit}
            result={resonanceResult}
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

export default ReactanceImpedanceCalculator;