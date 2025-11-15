import React, { useState, useImperativeHandle, forwardRef, useMemo } from 'react';
import { Shield, CheckCircle, Info, Zap, Link } from 'lucide-react';
import { exportToPDF } from '../../../utils/pdfExport';
import CalculatorLayout, { 
  Section, 
  InputGroup, 
  Select, 
  ResultCard, 
  InfoBox
} from './CalculatorLayout';

// Grounding Electrode Conductor Calculator
const GECCalculator = ({ gecData, setGecData, isDarkMode }) => {
  const gecTable = {
    copper: {
      '2 or smaller': '8', '1 or 1/0': '6', '2/0 or 3/0': '4',
      '4/0 to 350': '2', '400 to 600': '1/0', '650 to 1100': '2/0', 'over 1100': '3/0'
    },
    aluminum: {
      '2 or smaller': '6', '1 or 1/0': '4', '2/0 or 3/0': '2',
      '4/0 to 350': '1/0', '400 to 600': '3/0', '650 to 1100': '4/0', 'over 1100': '250'
    }
  };

  const determineGEC = () => {
    if (!gecData.serviceSize) return null;
    const size = gecData.serviceSize;
    let category = '';
    const awgSizes = ['14', '12', '10', '8', '6', '4', '3', '2', '1'];
    const oughtSizes = ['1/0', '2/0', '3/0', '4/0'];
    const kcmilValue = parseInt(size);

    if (awgSizes.includes(size)) {
      const sizeNum = parseInt(size);
      if (sizeNum >= 2) category = '2 or smaller';
      else if (size === '1') category = '1 or 1/0';
    } else if (oughtSizes.includes(size)) {
      if (size === '1/0') category = '1 or 1/0';
      else if (size === '2/0' || size === '3/0') category = '2/0 or 3/0';
      else if (size === '4/0') category = '4/0 to 350';
    } else if (!isNaN(kcmilValue)) {
      if (kcmilValue >= 250 && kcmilValue <= 350) category = '4/0 to 350';
      else if (kcmilValue >= 400 && kcmilValue <= 600) category = '400 to 600';
      else if (kcmilValue >= 650 && kcmilValue <= 1100) category = '650 to 1100';
      else if (kcmilValue > 1100) category = 'over 1100';
    }

    return {
      serviceSize: size,
      category,
      gecSize: gecTable[gecData.conductorMaterial][category] || 'N/A'
    };
  };

  const results = determineGEC();

  return (
    <div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '0.75rem',
        marginBottom: '0.75rem'
      }}>
        <InputGroup 
          label="Service Conductor Size" 
          helpText="Largest ungrounded service conductor"
          isDarkMode={isDarkMode}
        >
          <Select 
            value={gecData.serviceSize} 
            onChange={(e) => setGecData(prev => ({...prev, serviceSize: e.target.value}))}
            isDarkMode={isDarkMode}
            options={[
              { value: '', label: 'Select Size' },
              { value: '8', label: '8 AWG' },
              { value: '6', label: '6 AWG' },
              { value: '4', label: '4 AWG' },
              { value: '2', label: '2 AWG' },
              { value: '1', label: '1 AWG' },
              { value: '1/0', label: '1/0 AWG' },
              { value: '2/0', label: '2/0 AWG' },
              { value: '3/0', label: '3/0 AWG' },
              { value: '4/0', label: '4/0 AWG' },
              { value: '250', label: '250 kcmil' },
              { value: '350', label: '350 kcmil' },
              { value: '500', label: '500 kcmil' },
              { value: '750', label: '750 kcmil' },
              { value: '1000', label: '1000 kcmil' },
              { value: '1500', label: '1500 kcmil' }
            ]}
          />
        </InputGroup>

        <InputGroup label="GEC Material" isDarkMode={isDarkMode}>
          <Select 
            value={gecData.conductorMaterial} 
            onChange={(e) => setGecData(prev => ({...prev, conductorMaterial: e.target.value}))}
            isDarkMode={isDarkMode}
            options={[
              { value: 'copper', label: 'Copper' },
              { value: 'aluminum', label: 'Aluminum' }
            ]}
          />
        </InputGroup>
      </div>

      {results && results.gecSize !== 'N/A' && (
        <>
          <ResultCard
            label="Grounding Electrode Conductor"
            value={results.gecSize}
            unit={`AWG ${gecData.conductorMaterial.charAt(0).toUpperCase() + gecData.conductorMaterial.slice(1)}`}
            color="#3b82f6"
            isDarkMode={isDarkMode}
          />

          <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              Per NEC Table 250.66
            </div>
            <div style={{ fontSize: '0.8125rem' }}>
              Service conductor: {results.serviceSize} AWG {gecData.conductorMaterial}
            </div>
          </InfoBox>

          <InfoBox type="info" icon={Info} isDarkMode={isDarkMode} title="Important Notes">
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
              <li>GEC to rod/pipe/plate need not be larger than 6 AWG copper</li>
              <li>GEC to concrete-encased electrode need not be larger than 4 AWG copper</li>
              <li>Must be continuous without splices (except as permitted)</li>
            </ul>
          </InfoBox>
        </>
      )}
    </div>
  );
};

// Equipment Grounding Conductor Calculator
const EGCCalculator = ({ egcData, setEgcData, isDarkMode }) => {
  const egcTable = {
    copper: {
      15: '14', 20: '12', 30: '10', 40: '10', 60: '10',
      100: '8', 200: '6', 300: '4', 400: '3', 500: '2',
      600: '1', 800: '1/0', 1000: '2/0', 1200: '3/0',
      1600: '4/0', 2000: '250', 2500: '350', 3000: '400',
      4000: '500', 5000: '700', 6000: '800'
    },
    aluminum: {
      15: '12', 20: '10', 30: '8', 40: '8', 60: '8',
      100: '6', 200: '4', 300: '2', 400: '1', 500: '1/0',
      600: '2/0', 800: '3/0', 1000: '4/0', 1200: '250',
      1600: '350', 2000: '400', 2500: '500', 3000: '600',
      4000: '750', 5000: '1000', 6000: '1200'
    }
  };

  const determineEGC = () => {
    const rating = parseInt(egcData.ocpdRating);
    if (!rating) return null;

    const ratings = Object.keys(egcTable[egcData.conductorMaterial]).map(Number).sort((a, b) => a - b);
    const applicableRating = ratings.find(r => r >= rating) || ratings[ratings.length - 1];
    
    return {
      ocpdRating: rating,
      applicableRating,
      egcSize: egcTable[egcData.conductorMaterial][applicableRating]
    };
  };

  const results = determineEGC();

  return (
    <div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '0.75rem',
        marginBottom: '0.75rem'
      }}>
        <InputGroup 
          label="Overcurrent Device Rating" 
          helpText="Circuit breaker or fuse rating"
          isDarkMode={isDarkMode}
        >
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={egcData.ocpdRating}
              onChange={(e) => {
                const value = e.target.value.replace(/[^0-9]/g, '');
                setEgcData(prev => ({...prev, ocpdRating: value}));
              }}
              placeholder="Enter rating"
              style={{
                width: '100%',
                padding: '0.75rem',
                paddingRight: '2.5rem',
                border: '1px solid',
                borderColor: isDarkMode ? '#2a2a2a' : '#e5e7eb',
                borderRadius: '0.5rem',
                fontSize: '0.9375rem',
                background: isDarkMode ? '#1e1e1e' : '#ffffff',
                color: isDarkMode ? '#e0e0e0' : '#111827',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = isDarkMode ? '#2a2a2a' : '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
            <span style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '0.875rem',
              color: isDarkMode ? '#a0a0a0' : '#6b7280',
              pointerEvents: 'none'
            }}>
              A
            </span>
          </div>
        </InputGroup>

        <InputGroup label="EGC Material" isDarkMode={isDarkMode}>
          <Select 
            value={egcData.conductorMaterial} 
            onChange={(e) => setEgcData(prev => ({...prev, conductorMaterial: e.target.value}))}
            isDarkMode={isDarkMode}
            options={[
              { value: 'copper', label: 'Copper' },
              { value: 'aluminum', label: 'Aluminum' }
            ]}
          />
        </InputGroup>
      </div>

      {results && (
        <>
          <ResultCard
            label="Equipment Grounding Conductor"
            value={results.egcSize}
            unit={`AWG ${egcData.conductorMaterial.charAt(0).toUpperCase() + egcData.conductorMaterial.slice(1)}`}
            color="#3b82f6"
            isDarkMode={isDarkMode}
          />

          <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              Per NEC Table 250.122
            </div>
            <div style={{ fontSize: '0.8125rem' }}>
              OCPD rating: {results.ocpdRating}A (using {results.applicableRating}A table value)
            </div>
          </InfoBox>

          <InfoBox type="info" icon={Info} isDarkMode={isDarkMode} title="Important Notes">
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
              <li>Increase proportionally if conductors upsized for voltage drop</li>
              <li>Size per each raceway if conductors run in parallel</li>
              <li>Based on rating of OCPD ahead of circuit</li>
            </ul>
          </InfoBox>
        </>
      )}
    </div>
  );
};

// Bonding Jumper Calculator
const BondingJumperCalculator = ({ bondingData, setBondingData, isDarkMode }) => {
  const bondingTable = {
    copper: {
      '2 or smaller': '8', '1 or 1/0': '6', '2/0 or 3/0': '4',
      '4/0 to 350': '2', '400 to 600': '1/0', '650 to 1100': '2/0', 'over 1100': '3/0'
    },
    aluminum: {
      '2 or smaller': '6', '1 or 1/0': '4', '2/0 or 3/0': '2',
      '4/0 to 350': '1/0', '400 to 600': '3/0', '650 to 1100': '4/0', 'over 1100': '250'
    }
  };

  const determineBondingJumper = () => {
    if (!bondingData.serviceSize) return null;
    const size = bondingData.serviceSize;
    let category = '';
    const awgSizes = ['14', '12', '10', '8', '6', '4', '3', '2', '1'];
    const oughtSizes = ['1/0', '2/0', '3/0', '4/0'];
    const kcmilValue = parseInt(size);

    if (awgSizes.includes(size)) {
      const sizeNum = parseInt(size);
      if (sizeNum >= 2) category = '2 or smaller';
      else if (size === '1') category = '1 or 1/0';
    } else if (oughtSizes.includes(size)) {
      if (size === '1/0') category = '1 or 1/0';
      else if (size === '2/0' || size === '3/0') category = '2/0 or 3/0';
      else if (size === '4/0') category = '4/0 to 350';
    } else if (!isNaN(kcmilValue)) {
      if (kcmilValue >= 250 && kcmilValue <= 350) category = '4/0 to 350';
      else if (kcmilValue >= 400 && kcmilValue <= 600) category = '400 to 600';
      else if (kcmilValue >= 650 && kcmilValue <= 1100) category = '650 to 1100';
      else if (kcmilValue > 1100) category = 'over 1100';
    }

    return {
      serviceSize: size,
      jumperSize: bondingTable[bondingData.conductorMaterial][category] || 'N/A',
      jumperType: bondingData.jumperType
    };
  };

  const results = determineBondingJumper();

  return (
    <div>
      <div style={{ marginBottom: '0.75rem' }}>
        <InputGroup label="Bonding Jumper Type" isDarkMode={isDarkMode}>
          <Select 
            value={bondingData.jumperType} 
            onChange={(e) => setBondingData(prev => ({...prev, jumperType: e.target.value}))}
            isDarkMode={isDarkMode}
            options={[
              { value: 'main', label: 'Main Bonding Jumper (Service)' },
              { value: 'system', label: 'System Bonding Jumper (Separately Derived)' }
            ]}
          />
        </InputGroup>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '0.75rem',
        marginBottom: '0.75rem'
      }}>
        <InputGroup label="Conductor Size" isDarkMode={isDarkMode}>
          <Select 
            value={bondingData.serviceSize} 
            onChange={(e) => setBondingData(prev => ({...prev, serviceSize: e.target.value}))}
            isDarkMode={isDarkMode}
            options={[
              { value: '', label: 'Select Size' },
              { value: '8', label: '8 AWG' },
              { value: '6', label: '6 AWG' },
              { value: '4', label: '4 AWG' },
              { value: '2', label: '2 AWG' },
              { value: '1', label: '1 AWG' },
              { value: '1/0', label: '1/0 AWG' },
              { value: '2/0', label: '2/0 AWG' },
              { value: '3/0', label: '3/0 AWG' },
              { value: '4/0', label: '4/0 AWG' },
              { value: '250', label: '250 kcmil' },
              { value: '500', label: '500 kcmil' },
              { value: '750', label: '750 kcmil' },
              { value: '1000', label: '1000 kcmil' }
            ]}
          />
        </InputGroup>

        <InputGroup label="Material" isDarkMode={isDarkMode}>
          <Select 
            value={bondingData.conductorMaterial} 
            onChange={(e) => setBondingData(prev => ({...prev, conductorMaterial: e.target.value}))}
            isDarkMode={isDarkMode}
            options={[
              { value: 'copper', label: 'Copper' },
              { value: 'aluminum', label: 'Aluminum' }
            ]}
          />
        </InputGroup>
      </div>

      {results && results.jumperSize !== 'N/A' && (
        <>
          <ResultCard
            label={`${bondingData.jumperType === 'main' ? 'Main' : 'System'} Bonding Jumper`}
            value={results.jumperSize}
            unit={`AWG ${bondingData.conductorMaterial.charAt(0).toUpperCase() + bondingData.conductorMaterial.slice(1)}`}
            color="#3b82f6"
            isDarkMode={isDarkMode}
          />

          <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              Per NEC {bondingData.jumperType === 'main' ? '250.28(D)' : '250.30(A)(1)'}
            </div>
            <div style={{ fontSize: '0.8125rem' }}>
              Conductor size: {results.serviceSize} AWG {bondingData.conductorMaterial}
            </div>
          </InfoBox>

          <InfoBox 
            type="info" 
            icon={Info} 
            isDarkMode={isDarkMode} 
            title={`${bondingData.jumperType === 'main' ? 'Main' : 'System'} Bonding Jumper Requirements`}
          >
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
              {bondingData.jumperType === 'main' ? (
                <>
                  <li>Connects grounded conductor to equipment grounding conductor</li>
                  <li>Sized per Table 250.66 based on service conductor</li>
                  <li>Can be wire, bus, screw, or similar conductor</li>
                </>
              ) : (
                <>
                  <li>Required for separately derived systems</li>
                  <li>Connects grounded to equipment grounding conductor</li>
                  <li>Installed at same location as GEC connection</li>
                </>
              )}
            </ul>
          </InfoBox>
        </>
      )}
    </div>
  );
};

const GroundingBondingCalculator = forwardRef(({ isDarkMode = false, onBack }, ref) => {
  const [activeTab, setActiveTab] = useState('gec');

  // Lifted state for all calculators
  const [gecData, setGecData] = useState({
    serviceSize: '',
    conductorMaterial: 'copper'
  });

  const [egcData, setEgcData] = useState({
    ocpdRating: '',
    conductorMaterial: 'copper'
  });

  const [bondingData, setBondingData] = useState({
    serviceSize: '',
    conductorMaterial: 'copper',
    jumperType: 'main'
  });

  const tabs = [
    { id: 'gec', label: 'Grounding Electrode', icon: Shield },
    { id: 'egc', label: 'Equipment Grounding', icon: Zap },
    { id: 'bonding', label: 'Bonding Jumpers', icon: Link }
  ];

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      let pdfData;

      if (activeTab === 'gec') {
        if (!gecData.serviceSize) {
          alert('Please select a service conductor size before exporting');
          return;
        }

        const gecTable = {
          copper: {
            '2 or smaller': '8', '1 or 1/0': '6', '2/0 or 3/0': '4',
            '4/0 to 350': '2', '400 to 600': '1/0', '650 to 1100': '2/0', 'over 1100': '3/0'
          },
          aluminum: {
            '2 or smaller': '6', '1 or 1/0': '4', '2/0 or 3/0': '2',
            '4/0 to 350': '1/0', '400 to 600': '3/0', '650 to 1100': '4/0', 'over 1100': '250'
          }
        };

        let category = '';
        const size = gecData.serviceSize;
        const awgSizes = ['14', '12', '10', '8', '6', '4', '3', '2', '1'];
        const oughtSizes = ['1/0', '2/0', '3/0', '4/0'];
        const kcmilValue = parseInt(size);

        if (awgSizes.includes(size)) {
          const sizeNum = parseInt(size);
          if (sizeNum >= 2) category = '2 or smaller';
          else if (size === '1') category = '1 or 1/0';
        } else if (oughtSizes.includes(size)) {
          if (size === '1/0') category = '1 or 1/0';
          else if (size === '2/0' || size === '3/0') category = '2/0 or 3/0';
          else if (size === '4/0') category = '4/0 to 350';
        } else if (!isNaN(kcmilValue)) {
          if (kcmilValue >= 250 && kcmilValue <= 350) category = '4/0 to 350';
          else if (kcmilValue >= 400 && kcmilValue <= 600) category = '400 to 600';
          else if (kcmilValue >= 650 && kcmilValue <= 1100) category = '650 to 1100';
          else if (kcmilValue > 1100) category = 'over 1100';
        }

        const gecSize = gecTable[gecData.conductorMaterial][category];

        pdfData = {
          calculatorName: 'Grounding & Bonding - Grounding Electrode Conductor',
          inputs: {
            serviceConductorSize: `${gecData.serviceSize} AWG`,
            material: gecData.conductorMaterial.charAt(0).toUpperCase() + gecData.conductorMaterial.slice(1)
          },
          results: {
            groundingElectrodeConductor: `${gecSize} AWG ${gecData.conductorMaterial}`
          },
          additionalInfo: {
            note1: 'GEC to rod/pipe/plate need not be larger than 6 AWG copper',
            note2: 'GEC to concrete-encased electrode need not be larger than 4 AWG copper',
            note3: 'Must be continuous without splices (except as permitted)'
          },
          necReferences: [
            'NEC Table 250.66 - Grounding Electrode Conductor for Alternating-Current Systems',
            'NEC 250.64 - Grounding Electrode Conductor Installation',
            'NEC 250.52 - Grounding Electrodes'
          ]
        };

      } else if (activeTab === 'egc') {
        if (!egcData.ocpdRating) {
          alert('Please enter an overcurrent device rating before exporting');
          return;
        }

        const egcTable = {
          copper: {
            15: '14', 20: '12', 30: '10', 40: '10', 60: '10',
            100: '8', 200: '6', 300: '4', 400: '3', 500: '2',
            600: '1', 800: '1/0', 1000: '2/0', 1200: '3/0',
            1600: '4/0', 2000: '250', 2500: '350', 3000: '400',
            4000: '500', 5000: '700', 6000: '800'
          },
          aluminum: {
            15: '12', 20: '10', 30: '8', 40: '8', 60: '8',
            100: '6', 200: '4', 300: '2', 400: '1', 500: '1/0',
            600: '2/0', 800: '3/0', 1000: '4/0', 1200: '250',
            1600: '350', 2000: '400', 2500: '500', 3000: '600',
            4000: '750', 5000: '1000', 6000: '1200'
          }
        };

        const rating = parseInt(egcData.ocpdRating);
        const ratings = Object.keys(egcTable[egcData.conductorMaterial]).map(Number).sort((a, b) => a - b);
        const applicableRating = ratings.find(r => r >= rating) || ratings[ratings.length - 1];
        const egcSize = egcTable[egcData.conductorMaterial][applicableRating];

        pdfData = {
          calculatorName: 'Grounding & Bonding - Equipment Grounding Conductor',
          inputs: {
            overcurrentDeviceRating: `${rating} Amps`,
            material: egcData.conductorMaterial.charAt(0).toUpperCase() + egcData.conductorMaterial.slice(1)
          },
          results: {
            equipmentGroundingConductor: `${egcSize} AWG ${egcData.conductorMaterial}`,
            basedOnOCPDRating: `${applicableRating} Amps`
          },
          additionalInfo: {
            note1: 'Increase proportionally if conductors upsized for voltage drop',
            note2: 'Size per each raceway if conductors run in parallel',
            note3: 'Based on rating of OCPD ahead of circuit'
          },
          necReferences: [
            'NEC Table 250.122 - Minimum Size Equipment Grounding Conductors for Grounding Raceway and Equipment',
            'NEC 250.122(B) - Increased in Size',
            'NEC 250.122(F) - Conductors in Parallel'
          ]
        };

      } else if (activeTab === 'bonding') {
        if (!bondingData.serviceSize) {
          alert('Please select a conductor size before exporting');
          return;
        }

        const bondingTable = {
          copper: {
            '2 or smaller': '8', '1 or 1/0': '6', '2/0 or 3/0': '4',
            '4/0 to 350': '2', '400 to 600': '1/0', '650 to 1100': '2/0', 'over 1100': '3/0'
          },
          aluminum: {
            '2 or smaller': '6', '1 or 1/0': '4', '2/0 or 3/0': '2',
            '4/0 to 350': '1/0', '400 to 600': '3/0', '650 to 1100': '4/0', 'over 1100': '250'
          }
        };

        let category = '';
        const size = bondingData.serviceSize;
        const awgSizes = ['14', '12', '10', '8', '6', '4', '3', '2', '1'];
        const oughtSizes = ['1/0', '2/0', '3/0', '4/0'];
        const kcmilValue = parseInt(size);

        if (awgSizes.includes(size)) {
          const sizeNum = parseInt(size);
          if (sizeNum >= 2) category = '2 or smaller';
          else if (size === '1') category = '1 or 1/0';
        } else if (oughtSizes.includes(size)) {
          if (size === '1/0') category = '1 or 1/0';
          else if (size === '2/0' || size === '3/0') category = '2/0 or 3/0';
          else if (size === '4/0') category = '4/0 to 350';
        } else if (!isNaN(kcmilValue)) {
          if (kcmilValue >= 250 && kcmilValue <= 350) category = '4/0 to 350';
          else if (kcmilValue >= 400 && kcmilValue <= 600) category = '400 to 600';
          else if (kcmilValue >= 650 && kcmilValue <= 1100) category = '650 to 1100';
          else if (kcmilValue > 1100) category = 'over 1100';
        }

        const jumperSize = bondingTable[bondingData.conductorMaterial][category];
        const jumperTypeName = bondingData.jumperType === 'main' ? 'Main Bonding Jumper' : 'System Bonding Jumper';

        pdfData = {
          calculatorName: `Grounding & Bonding - ${jumperTypeName}`,
          inputs: {
            jumperType: jumperTypeName,
            conductorSize: `${bondingData.serviceSize} AWG`,
            material: bondingData.conductorMaterial.charAt(0).toUpperCase() + bondingData.conductorMaterial.slice(1)
          },
          results: {
            bondingJumperSize: `${jumperSize} AWG ${bondingData.conductorMaterial}`
          },
          additionalInfo: bondingData.jumperType === 'main' ? {
            purpose: 'Connects grounded conductor to equipment grounding conductor',
            sizing: 'Sized per Table 250.66 based on service conductor',
            forms: 'Can be wire, bus, screw, or similar conductor'
          } : {
            purpose: 'Required for separately derived systems',
            connection: 'Connects grounded to equipment grounding conductor',
            location: 'Installed at same location as GEC connection'
          },
          necReferences: bondingData.jumperType === 'main' ? [
            'NEC 250.28 - Main Bonding Jumper and System Bonding Jumper',
            'NEC 250.28(D) - Size',
            'NEC Table 250.66 - Sizing Reference'
          ] : [
            'NEC 250.30 - Grounding Separately Derived Alternating-Current Systems',
            'NEC 250.30(A)(1) - System Bonding Jumper',
            'NEC Table 250.66 - Sizing Reference'
          ]
        };
      }

      exportToPDF(pdfData);
    }
  }));

  return (
    <div style={{ margin: '0 -1rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        {/* Tab Navigation - Using Section wrapper to match card width */}
        <Section isDarkMode={isDarkMode} style={{ padding: '0.75rem' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem'
          }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: '0.5rem',
                    border: 'none',
                    background: isActive ? '#3b82f6' : isDarkMode ? '#1a1a1a' : '#f3f4f6',
                    color: isActive ? '#ffffff' : isDarkMode ? '#e0e0e0' : '#111827',
                    fontSize: '0.8125rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                    minHeight: '60px'
                  }}
                >
                  <TabIcon size={18} />
                  <span style={{ 
                    fontSize: '0.75rem',
                    lineHeight: '1.2',
                    textAlign: 'center'
                  }}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        {/* Active Tab Content */}
        <Section 
          title={
            activeTab === 'gec' ? 'Grounding Electrode Conductor' :
            activeTab === 'egc' ? 'Equipment Grounding Conductor' :
            'Bonding Jumper Sizing'
          }
          icon={
            activeTab === 'gec' ? Shield :
            activeTab === 'egc' ? Zap :
            Link
          }
          color="#3b82f6"
          isDarkMode={isDarkMode}
        >
          {activeTab === 'gec' && (
            <GECCalculator 
              gecData={gecData} 
              setGecData={setGecData} 
              isDarkMode={isDarkMode} 
            />
          )}
          {activeTab === 'egc' && (
            <EGCCalculator 
              egcData={egcData} 
              setEgcData={setEgcData} 
              isDarkMode={isDarkMode} 
            />
          )}
          {activeTab === 'bonding' && (
            <BondingJumperCalculator 
              bondingData={bondingData} 
              setBondingData={setBondingData} 
              isDarkMode={isDarkMode} 
            />
          )}
        </Section>
      </CalculatorLayout>
    </div>
  );
});

export default GroundingBondingCalculator;