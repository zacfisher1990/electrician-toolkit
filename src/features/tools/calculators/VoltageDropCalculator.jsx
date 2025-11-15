import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { AlertTriangle, CheckCircle, FileDown, Briefcase, Zap, Calculator, Info } from 'lucide-react';
import { exportToPDF } from '../../../utils/pdfExport';
import { getUserJobs, addCalculationToJob } from '../../jobs/jobsService';
import CalculatorLayout, { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox,
  Button
} from './CalculatorLayout';

const VoltageDropCalculator = forwardRef(({ isDarkMode = false, onExportSuccess }, ref) => {
  const [voltage, setVoltage] = useState('');
  const [current, setCurrent] = useState('');
  const [distance, setDistance] = useState('');
  const [wireSize, setWireSize] = useState('12');
  const [phaseType, setPhaseType] = useState('single');
  const [conductorType, setConductorType] = useState('copper');
  const [powerFactor, setPowerFactor] = useState('1.0');
  const [showJobSelector, setShowJobSelector] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const circularMils = {
    '14': 4110,
    '12': 6530,
    '10': 10380,
    '8': 16510,
    '6': 26240,
    '4': 41740,
    '3': 52620,
    '2': 66360,
    '1': 83690,
    '1/0': 105600,
    '2/0': 133100,
    '3/0': 167800,
    '4/0': 211600,
    '250': 250000,
    '300': 300000,
    '350': 350000,
    '400': 400000,
    '500': 500000,
    '600': 600000,
    '750': 750000,
    '1000': 1000000
  };

  const kConstants = {
    copper: {
      dc: 10.8,
      ac: 12.9
    },
    aluminum: {
      dc: 17.4,
      ac: 21.2
    }
  };

  const calculateDrop = () => {
    if (!voltage || !current || !distance) return { drop: '0.00', percentage: '0.00', excessive: false };
    
    const V = parseFloat(voltage);
    const I = parseFloat(current);
    const L = parseFloat(distance);
    const CM = circularMils[wireSize];
    const PF = parseFloat(powerFactor);
    const K = kConstants[conductorType].ac;
    
    let voltageDrop;
    
    if (phaseType === 'single') {
      voltageDrop = (2 * K * I * L * PF) / CM;
    } else {
      voltageDrop = (1.732 * K * I * L * PF) / CM;
    }
    
    const percentage = (voltageDrop / V) * 100;
    const isExcessive = percentage > 3;
    
    return {
      drop: voltageDrop.toFixed(2),
      percentage: percentage.toFixed(2),
      excessive: isExcessive
    };
  };

  const result = calculateDrop();

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
      const calculationData = {
        type: 'voltage-drop',
        data: {
          voltage: parseFloat(voltage),
          current: parseFloat(current),
          distance: parseFloat(distance),
          wireSize,
          phaseType,
          conductorType,
          powerFactor: parseFloat(powerFactor),
          results: {
            voltageDrop: result.drop,
            percentageDrop: result.percentage,
            excessive: result.excessive
          }
        }
      };
      
      await addCalculationToJob(jobId, calculationData);
      setShowJobSelector(false);
      alert('Calculation attached to job successfully!');
    } catch (error) {
      console.error('Error attaching calculation:', error);
      alert('Failed to attach calculation. Please try again.');
    }
  };

  const handleExport = () => {
    if (!voltage || !current || !distance) {
      alert('Please enter all required values before exporting to PDF');
      return;
    }

    const pdfData = {
      calculatorName: 'Voltage Drop Calculator',
      inputs: {
        systemType: phaseType === 'single' ? 'Single Phase' : 'Three Phase',
        conductorMaterial: conductorType.charAt(0).toUpperCase() + conductorType.slice(1),
        systemVoltage: `${voltage} V`,
        loadCurrent: `${current} A`,
        oneWayDistance: `${distance} ft`,
        wireSize: wireSize.includes('/') ? `${wireSize} AWG` : `${wireSize} ${parseInt(wireSize) <= 4 ? 'AWG' : 'kcmil'}`,
        powerFactor: powerFactor
      },
      results: {
        voltageDrop: `${result.drop} V`,
        percentageDrop: `${result.percentage}%`,
        necCompliant: result.excessive ? 'NO - Exceeds 3% limit' : 'YES - Within 3% limit',
        status: result.excessive ? '⚠️ WARNING: Exceeds NEC 3% Limit' : '✓ Within NEC limits'
      },
      additionalInfo: {
        formula: phaseType === 'single' 
          ? '2 × K × I × L × PF ÷ CM'
          : '1.732 × K × I × L × PF ÷ CM',
        kConstant: `${kConstants[conductorType].ac} (${conductorType} AC)`,
        circularMils: circularMils[wireSize].toLocaleString(),
        powerFactorUsed: powerFactor,
        systemConfiguration: phaseType === 'single' ? 'Single phase' : 'Three phase'
      },
      necReferences: [
        'NEC Guidelines: Branch circuits - 3% max',
        'Feeders - 3% max',
        'Combined branch circuit and feeder - 5% max',
        'Note: Excessive voltage drop can cause equipment malfunction and reduced efficiency'
      ]
    };

    exportToPDF(pdfData);
    
    if (onExportSuccess) {
      onExportSuccess();
    }
  };

  useImperativeHandle(ref, () => ({
    exportPDF: handleExport
  }));

  return (
    <div style={{ margin: '0 -1rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        {/* Circuit Parameters */}
        <Section 
          title="Circuit Parameters" 
          icon={Zap} 
          color="#3b82f6" 
          isDarkMode={isDarkMode}
        >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '0.75rem' 
        }}>
          <InputGroup label="System Type" isDarkMode={isDarkMode}>
            <Select 
              value={phaseType} 
              onChange={(e) => setPhaseType(e.target.value)}
              isDarkMode={isDarkMode}
              options={[
                { value: 'single', label: 'Single Phase' },
                { value: 'three', label: 'Three Phase' }
              ]}
            />
          </InputGroup>

          <InputGroup label="Conductor Material" isDarkMode={isDarkMode}>
            <Select 
              value={conductorType} 
              onChange={(e) => setConductorType(e.target.value)}
              isDarkMode={isDarkMode}
              options={[
                { value: 'copper', label: 'Copper' },
                { value: 'aluminum', label: 'Aluminum' }
              ]}
            />
          </InputGroup>

          <InputGroup label="System Voltage" isDarkMode={isDarkMode}>
            <Input 
              type="number" 
              value={voltage} 
              onChange={(e) => setVoltage(e.target.value)}
              placeholder="120, 240, 480..."
              isDarkMode={isDarkMode}
              unit="V"
            />
          </InputGroup>

          <InputGroup label="Load Current" isDarkMode={isDarkMode}>
            <Input 
              type="number" 
              value={current} 
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Amps"
              isDarkMode={isDarkMode}
              unit="A"
            />
          </InputGroup>

          <InputGroup label="One-Way Distance" isDarkMode={isDarkMode}>
            <Input 
              type="number" 
              value={distance} 
              onChange={(e) => setDistance(e.target.value)}
              placeholder="Feet"
              isDarkMode={isDarkMode}
              unit="ft"
            />
          </InputGroup>

          <InputGroup label="Wire Size" isDarkMode={isDarkMode}>
            <Select 
              value={wireSize} 
              onChange={(e) => setWireSize(e.target.value)}
              isDarkMode={isDarkMode}
              options={Object.keys(circularMils).map(size => {
                const isKcmil = !size.includes('/') && parseInt(size) >= 250;
                const unit = isKcmil ? 'kcmil' : 'AWG';
                return {
                  value: size,
                  label: `${size} ${unit}`
                };
              })}
            />
          </InputGroup>

          <InputGroup label="Power Factor" isDarkMode={isDarkMode}>
            <Select 
              value={powerFactor} 
              onChange={(e) => setPowerFactor(e.target.value)}
              isDarkMode={isDarkMode}
              options={[
                { value: '1.0', label: '1.0 (Unity)' },
                { value: '0.95', label: '0.95' },
                { value: '0.9', label: '0.90' },
                { value: '0.85', label: '0.85' },
                { value: '0.8', label: '0.80' }
              ]}
            />
          </InputGroup>
        </div>
      </Section>

      {/* Results */}
      {voltage && current && distance && (
        <Section isDarkMode={isDarkMode}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '0.75rem', 
            marginBottom: '0.75rem' 
          }}>
            <ResultCard
              label="Voltage Drop"
              value={result.drop}
              unit="Volts"
              color={result.excessive ? '#ef4444' : '#3b82f6'}
              variant="prominent"
              isDarkMode={isDarkMode}
            />
            
            <ResultCard
              label="Percentage Drop"
              value={`${result.percentage}%`}
              unit="Max: 3%"
              color={result.excessive ? '#ef4444' : '#10b981'}
              variant="prominent"
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Calculation Details */}
          <InfoBox type="info" isDarkMode={isDarkMode} title="Calculation Details">
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Formula:</strong> {phaseType === 'single' ? '2 × K × I × L × PF ÷ CM' : '1.732 × K × I × L × PF ÷ CM'}
              </div>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>K constant:</strong> {kConstants[conductorType].ac} ({conductorType} AC)
              </div>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Circular mils:</strong> {circularMils[wireSize].toLocaleString()}
              </div>
              <div style={{ marginBottom: '0.25rem' }}>
                <strong>Power factor:</strong> {powerFactor}
              </div>
              <div>
                <strong>System:</strong> {phaseType === 'single' ? 'Single' : 'Three'} phase
              </div>
            </div>
          </InfoBox>

          {/* Status Message */}
          {result.excessive ? (
            <InfoBox type="warning" icon={AlertTriangle} isDarkMode={isDarkMode}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>
                WARNING: Exceeds NEC 3% Limit
              </div>
              <div style={{ fontSize: '0.8125rem' }}>
                Consider using larger wire size to reduce voltage drop. Excessive voltage drop can cause equipment malfunction and reduced efficiency.
              </div>
            </InfoBox>
          ) : (
            <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                Voltage drop is within NEC limits
              </div>
              <div style={{ fontSize: '0.8125rem' }}>
                This circuit meets the NEC recommended 3% maximum voltage drop for branch circuits.
              </div>
            </InfoBox>
          )}

          {/* Action Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem',
            marginTop: '0.75rem'
          }}>
            <button
              onClick={handleExport}
              style={{
                padding: '0.75rem',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#2563eb';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#3b82f6';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <FileDown size={16} />
              Export PDF
            </button>
            
            <button
              onClick={handleOpenJobSelector}
              style={{
                padding: '0.75rem',
                background: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#059669';
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#10b981';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <Briefcase size={16} />
              Attach to Job
            </button>
          </div>
        </Section>
      )}

      {/* NEC Guidelines */}
      <InfoBox type="info" isDarkMode={isDarkMode}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
          NEC Guidelines:
        </div>
        <div style={{ fontSize: '0.8125rem' }}>
          Branch circuits: 3% max • Feeders: 3% max • Combined: 5% max
        </div>
      </InfoBox>

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

export default VoltageDropCalculator;