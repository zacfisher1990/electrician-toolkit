import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { exportToPDF } from '../../../../utils/pdfExport';
import styles from '../Calculator.module.css';

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

const ReactanceImpedanceCalculator = forwardRef(({ isDarkMode = false }, ref) => {
  const [activeTab, setActiveTab] = useState('inductive');

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

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
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
            'Phase Relationship': reactanceType === 'inductive' ? 'Leading' : 'Lagging'
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
    }
  }));

  return (
    <div className={styles.menu}>
      {/* Tab Navigation */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => setActiveTab('inductive')}
            style={{
              flex: '1 1 auto',
              minWidth: '110px',
              padding: '0.75rem 1rem',
              background: activeTab === 'inductive' ? '#3b82f6' : 'transparent',
              color: activeTab === 'inductive' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'inductive' ? '#3b82f6' : colors.cardBorder}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Inductive (XL)
          </button>
          <button 
            onClick={() => setActiveTab('capacitive')}
            style={{
              flex: '1 1 auto',
              minWidth: '110px',
              padding: '0.75rem 1rem',
              background: activeTab === 'capacitive' ? '#3b82f6' : 'transparent',
              color: activeTab === 'capacitive' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'capacitive' ? '#3b82f6' : colors.cardBorder}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Capacitive (XC)
          </button>
          <button 
            onClick={() => setActiveTab('impedance')}
            style={{
              flex: '1 1 auto',
              minWidth: '110px',
              padding: '0.75rem 1rem',
              background: activeTab === 'impedance' ? '#3b82f6' : 'transparent',
              color: activeTab === 'impedance' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'impedance' ? '#3b82f6' : colors.cardBorder}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Impedance (Z)
          </button>
          <button 
            onClick={() => setActiveTab('resonance')}
            style={{
              flex: '1 1 auto',
              minWidth: '110px',
              padding: '0.75rem 1rem',
              background: activeTab === 'resonance' ? '#3b82f6' : 'transparent',
              color: activeTab === 'resonance' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'resonance' ? '#3b82f6' : colors.cardBorder}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Resonance
          </button>
        </div>
      </div>

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
          colors={colors}
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
          colors={colors}
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
          colors={colors}
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
          colors={colors}
        />
      )}
    </div>
  );
});

export default ReactanceImpedanceCalculator;