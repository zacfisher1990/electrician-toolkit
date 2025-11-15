import React, { useState, useEffect } from 'react';
import { Info, FileDown, Briefcase, Zap, Calculator } from 'lucide-react';
import { getUserJobs, addCalculationToJob } from '../../jobs/jobsService';
import { getColors } from '../../../theme';
import { 
  Section, 
  InputGroup, 
  ResultCard, 
  InfoBox,
  Button
} from './CalculatorLayout';

const OhmsLawBasic = ({ isDarkMode, onExport }) => {
  const colors = getColors(isDarkMode);
  const [voltage, setVoltage] = useState('');
  const [current, setCurrent] = useState('');
  const [resistance, setResistance] = useState('');
  const [power, setPower] = useState('');
  const [basicResults, setBasicResults] = useState({ V: '', I: '', R: '', P: '' });
  const [showJobSelector, setShowJobSelector] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    calculateBasic();
  }, [voltage, current, resistance, power]);

  const calculateBasic = () => {
    const V = parseFloat(voltage) || 0;
    const I = parseFloat(current) || 0;
    const R = parseFloat(resistance) || 0;
    const P = parseFloat(power) || 0;

    const results = { V: '', I: '', R: '', P: '' };

    // Calculate Voltage
    if (!voltage && I && R) {
      results.V = (I * R).toFixed(1);
    } else if (!voltage && P && I && I !== 0) {
      results.V = (P / I).toFixed(1);
    } else if (!voltage && P && R) {
      results.V = Math.sqrt(P * R).toFixed(1);
    } else if (voltage) {
      results.V = V.toFixed(1);
    }

    // Calculate Current
    if (!current && V && R && R !== 0) {
      results.I = (V / R).toFixed(1);
    } else if (!current && P && V && V !== 0) {
      results.I = (P / V).toFixed(1);
    } else if (!current && P && R && R !== 0) {
      results.I = Math.sqrt(P / R).toFixed(1);
    } else if (current) {
      results.I = I.toFixed(1);
    }

    // Calculate Resistance
    if (!resistance && V && I && I !== 0) {
      results.R = (V / I).toFixed(1);
    } else if (!resistance && V && P && P !== 0) {
      results.R = (V * V / P).toFixed(1);
    } else if (!resistance && P && I && I !== 0) {
      results.R = (P / (I * I)).toFixed(1);
    } else if (resistance) {
      results.R = R.toFixed(1);
    }

    // Calculate Power
    if (!power && V && I) {
      results.P = (V * I).toFixed(1);
    } else if (!power && I && R) {
      results.P = (I * I * R).toFixed(1);
    } else if (!power && V && R && R !== 0) {
      results.P = (V * V / R).toFixed(1);
    } else if (power) {
      results.P = P.toFixed(1);
    }

    setBasicResults(results);
  };

  const clearBasic = () => {
    setVoltage('');
    setCurrent('');
    setResistance('');
    setPower('');
    setBasicResults({ V: '', I: '', R: '', P: '' });
  };

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
        type: 'ohms-law-basic',
        data: {
          voltage: parseFloat(voltage) || parseFloat(basicResults.V) || 0,
          current: parseFloat(current) || parseFloat(basicResults.I) || 0,
          resistance: parseFloat(resistance) || parseFloat(basicResults.R) || 0,
          power: parseFloat(power) || parseFloat(basicResults.P) || 0
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
    const hasData = voltage || current || resistance || power || 
                    basicResults.V || basicResults.I || basicResults.R || basicResults.P;
    
    if (!hasData) {
      alert('Please enter at least 2 values before exporting');
      return;
    }

    const inputs = {};
    const results = {};
    
    if (voltage) inputs.voltage = `${voltage} V`;
    if (current) inputs.current = `${current} A`;
    if (resistance) inputs.resistance = `${resistance} Ω`;
    if (power) inputs.power = `${power} W`;

    if (basicResults.V) results.voltage = `${basicResults.V} V`;
    if (basicResults.I) results.current = `${basicResults.I} A`;
    if (basicResults.R) results.resistance = `${basicResults.R} Ω`;
    if (basicResults.P) results.power = `${basicResults.P} W`;

    const pdfData = {
      calculatorName: "Ohm's Law Calculator - Basic",
      inputs,
      results,
      additionalInfo: {
        note: 'Calculations based on fundamental electrical formulas'
      },
      necReferences: [
        "Ohm's Law: E = I × R",
        'Power formulas: P = E × I, P = I² × R, P = E² ÷ R',
        'Current: I = E ÷ R, I = P ÷ E, I = √(P ÷ R)',
        'Resistance: R = E ÷ I, R = E² ÷ P, R = P ÷ I²'
      ]
    };

    onExport(pdfData);
  };

  const isVoltageDisabled = (current && resistance) || (current && power) || (resistance && power);
  const isCurrentDisabled = (voltage && resistance) || (voltage && power) || (resistance && power);
  const isResistanceDisabled = (voltage && current) || (voltage && power) || (current && power);
  const isPowerDisabled = (voltage && current) || (voltage && resistance) || (current && resistance);

  return (
    <div>
      {/* Info Box */}
      <InfoBox type="info" icon={Info} isDarkMode={isDarkMode}>
        <div style={{ fontSize: '0.875rem' }}>
          Enter any 2 known values to calculate the remaining values
        </div>
      </InfoBox>

      {/* Input Section */}
      <Section 
        title="Enter Values" 
        icon={Zap} 
        color="#3b82f6" 
        isDarkMode={isDarkMode}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
          gap: '0.75rem', 
          marginBottom: '0.75rem' 
        }}>
          <InputGroup label="Volts (E)" isDarkMode={isDarkMode}>
            <input
              type="number"
              value={voltage || basicResults.V}
              onChange={(e) => setVoltage(e.target.value)}
              placeholder="Enter voltage"
              disabled={isVoltageDisabled}
              style={{ 
                width: '100%', 
                padding: '0.75rem',
                fontSize: '0.9375rem',
                border: `1px solid ${colors.border}`, 
                borderRadius: '0.5rem',
                backgroundColor: isVoltageDisabled ? colors.inputBg : colors.cardBg,
                color: colors.text,
                boxSizing: 'border-box',
                cursor: isVoltageDisabled ? 'not-allowed' : 'text',
                opacity: isVoltageDisabled ? 0.6 : 1
              }}
            />
          </InputGroup>

          <InputGroup label="Amps (I)" isDarkMode={isDarkMode}>
            <input
              type="number"
              value={current || basicResults.I}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Enter current"
              disabled={isCurrentDisabled}
              style={{ 
                width: '100%', 
                padding: '0.75rem',
                fontSize: '0.9375rem',
                border: `1px solid ${colors.border}`, 
                borderRadius: '0.5rem',
                backgroundColor: isCurrentDisabled ? colors.inputBg : colors.cardBg,
                color: colors.text,
                boxSizing: 'border-box',
                cursor: isCurrentDisabled ? 'not-allowed' : 'text',
                opacity: isCurrentDisabled ? 0.6 : 1
              }}
            />
          </InputGroup>

          <InputGroup label="Ohms (R)" isDarkMode={isDarkMode}>
            <input
              type="number"
              value={resistance || basicResults.R}
              onChange={(e) => setResistance(e.target.value)}
              placeholder="Enter resistance"
              disabled={isResistanceDisabled}
              style={{ 
                width: '100%', 
                padding: '0.75rem',
                fontSize: '0.9375rem',
                border: `1px solid ${colors.border}`, 
                borderRadius: '0.5rem',
                backgroundColor: isResistanceDisabled ? colors.inputBg : colors.cardBg,
                color: colors.text,
                boxSizing: 'border-box',
                cursor: isResistanceDisabled ? 'not-allowed' : 'text',
                opacity: isResistanceDisabled ? 0.6 : 1
              }}
            />
          </InputGroup>

          <InputGroup label="Watts (P)" isDarkMode={isDarkMode}>
            <input
              type="number"
              value={power || basicResults.P}
              onChange={(e) => setPower(e.target.value)}
              placeholder="Enter power"
              disabled={isPowerDisabled}
              style={{ 
                width: '100%', 
                padding: '0.75rem',
                fontSize: '0.9375rem',
                border: `1px solid ${colors.border}`, 
                borderRadius: '0.5rem',
                backgroundColor: isPowerDisabled ? colors.inputBg : colors.cardBg,
                color: colors.text,
                boxSizing: 'border-box',
                cursor: isPowerDisabled ? 'not-allowed' : 'text',
                opacity: isPowerDisabled ? 0.6 : 1
              }}
            />
          </InputGroup>
        </div>

        <button
          onClick={clearBasic}
          style={{
            width: '100%',
            background: '#6b7280',
            color: 'white',
            fontWeight: '600',
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Clear All
        </button>
      </Section>

      {/* Results */}
      {(basicResults.V || basicResults.I || basicResults.R || basicResults.P) && (
        <Section 
          title="Results" 
          icon={Calculator} 
          color="#10b981" 
          isDarkMode={isDarkMode}
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            {basicResults.V && (
              <ResultCard
                label="Voltage"
                value={basicResults.V}
                unit="Volts"
                variant="subtle"
                isDarkMode={isDarkMode}
              />
            )}
            {basicResults.I && (
              <ResultCard
                label="Current"
                value={basicResults.I}
                unit="Amperes"
                variant="subtle"
                isDarkMode={isDarkMode}
              />
            )}
            {basicResults.R && (
              <ResultCard
                label="Resistance"
                value={basicResults.R}
                unit="Ohms"
                variant="subtle"
                isDarkMode={isDarkMode}
              />
            )}
            {basicResults.P && (
              <ResultCard
                label="Power"
                value={basicResults.P}
                unit="Watts"
                variant="subtle"
                isDarkMode={isDarkMode}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.75rem'
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
            background: colors.cardBg,
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
              color: colors.text,
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
                  color: colors.subtext 
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
                      background: colors.inputBg,
                      borderRadius: '0.5rem',
                      marginBottom: '0.5rem',
                      cursor: 'pointer',
                      border: `1px solid ${colors.border}`,
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ 
                      fontWeight: '600', 
                      color: colors.text,
                      marginBottom: '0.25rem'
                    }}>
                      {job.name}
                    </div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: colors.subtext 
                    }}>
                      {job.location || 'No location'}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem', 
                  color: colors.subtext 
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
    </div>
  );
};

export default OhmsLawBasic;