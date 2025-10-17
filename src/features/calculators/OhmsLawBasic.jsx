import React, { useState, useEffect } from 'react';
import { Info, FileDown, Briefcase } from 'lucide-react';
import { getUserJobs, addCalculationToJob } from '../jobs/jobsService';

const OhmsLawBasic = ({ isDarkMode, colors, onExport }) => {
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

  return (
    <div>
      {/* Info Box */}
      <div style={{
        background: '#dbeafe',
        border: '1px solid #3b82f6',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
          <Info size={20} color="#1e40af" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
          <p style={{ 
            margin: 0, 
            fontSize: '0.875rem', 
            color: '#1e40af',
            lineHeight: '1.5'
          }}>
            Enter any 2 known values to calculate the remaining values
          </p>
        </div>
      </div>

      {/* Input Card */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText, 
              marginBottom: '0.5rem' 
            }}>
              Volts (E)
            </label>
            <input
              type="number"
              value={voltage || basicResults.V}
              onChange={(e) => setVoltage(e.target.value)}
              placeholder="Enter voltage"
              disabled={
                (current && resistance) || 
                (current && power) || 
                (resistance && power)
              }
              style={{ 
                width: '100%', 
                padding: '0.625rem',
                fontSize: '0.9375rem',
                border: `1px solid ${colors.inputBorder}`, 
                borderRadius: '8px',
                backgroundColor: ((current && resistance) || (current && power) || (resistance && power)) ? colors.sectionBg : colors.inputBg,
                color: colors.cardText,
                boxSizing: 'border-box',
                cursor: ((current && resistance) || (current && power) || (resistance && power)) ? 'not-allowed' : 'text'
              }}
            />
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText, 
              marginBottom: '0.5rem' 
            }}>
              Amps (I)
            </label>
            <input
              type="number"
              value={current || basicResults.I}
              onChange={(e) => setCurrent(e.target.value)}
              placeholder="Enter current"
              disabled={
                (voltage && resistance) || 
                (voltage && power) || 
                (resistance && power)
              }
              style={{ 
                width: '100%', 
                padding: '0.625rem',
                fontSize: '0.9375rem',
                border: `1px solid ${colors.inputBorder}`, 
                borderRadius: '8px',
                backgroundColor: ((voltage && resistance) || (voltage && power) || (resistance && power)) ? colors.sectionBg : colors.inputBg,
                color: colors.cardText,
                boxSizing: 'border-box',
                cursor: ((voltage && resistance) || (voltage && power) || (resistance && power)) ? 'not-allowed' : 'text'
              }}
            />
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText, 
              marginBottom: '0.5rem' 
            }}>
              Ohms (R)
            </label>
            <input
              type="number"
              value={resistance || basicResults.R}
              onChange={(e) => setResistance(e.target.value)}
              placeholder="Enter resistance"
              disabled={
                (voltage && current) || 
                (voltage && power) || 
                (current && power)
              }
              style={{ 
                width: '100%', 
                padding: '0.625rem',
                fontSize: '0.9375rem',
                border: `1px solid ${colors.inputBorder}`, 
                borderRadius: '8px',
                backgroundColor: ((voltage && current) || (voltage && power) || (current && power)) ? colors.sectionBg : colors.inputBg,
                color: colors.cardText,
                boxSizing: 'border-box',
                cursor: ((voltage && current) || (voltage && power) || (current && power)) ? 'not-allowed' : 'text'
              }}
            />
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText, 
              marginBottom: '0.5rem' 
            }}>
              Watts (P)
            </label>
            <input
              type="number"
              value={power || basicResults.P}
              onChange={(e) => setPower(e.target.value)}
              placeholder="Enter power"
              disabled={
                (voltage && current) || 
                (voltage && resistance) || 
                (current && resistance)
              }
              style={{ 
                width: '100%', 
                padding: '0.625rem',
                fontSize: '0.9375rem',
                border: `1px solid ${colors.inputBorder}`, 
                borderRadius: '8px',
                backgroundColor: ((voltage && current) || (voltage && resistance) || (current && resistance)) ? colors.sectionBg : colors.inputBg,
                color: colors.cardText,
                boxSizing: 'border-box',
                cursor: ((voltage && current) || (voltage && resistance) || (current && resistance)) ? 'not-allowed' : 'text'
              }}
            />
          </div>
        </div>

        <button
          onClick={clearBasic}
          style={{
            width: '100%',
            background: '#6b7280',
            color: 'white',
            fontWeight: '600',
            padding: '0.75rem',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem'
          }}
        >
          Clear All
        </button>
      </div>

      {/* Results */}
      {(basicResults.V || basicResults.I || basicResults.R || basicResults.P) && (
        <div style={{
          background: colors.cardBg,
          border: `1px solid ${colors.cardBorder}`,
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: colors.cardText,
            marginTop: 0,
            marginBottom: '1rem'
          }}>
            Results
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {basicResults.V && (
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Voltage
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {basicResults.V}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  Volts
                </div>
              </div>
            )}
            {basicResults.I && (
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Current
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {basicResults.I}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  Amperes
                </div>
              </div>
            )}
            {basicResults.R && (
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Resistance
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {basicResults.R}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  Ohms
                </div>
              </div>
            )}
            {basicResults.P && (
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Power
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {basicResults.P}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  Watts
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {(voltage || current || resistance || power) && (
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginTop: '1rem'
        }}>
          <button
            onClick={handleExport}
            style={{
              flex: 1,
              padding: '0.875rem',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'background 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#2563eb'}
            onMouseOut={(e) => e.currentTarget.style.background = '#3b82f6'}
          >
            <FileDown size={18} />
            Export to PDF
          </button>
          
          <button
            onClick={handleOpenJobSelector}
            style={{
              flex: 1,
              padding: '0.875rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '0.9375rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'background 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#059669'}
            onMouseOut={(e) => e.currentTarget.style.background = '#10b981'}
          >
            <Briefcase size={18} />
            Attach to Job
          </button>
        </div>
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
            borderRadius: '12px',
            padding: '1.5rem',
            maxWidth: '400px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ 
              marginTop: 0, 
              marginBottom: '1rem',
              color: colors.cardText,
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
                  color: colors.labelText 
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
                      background: colors.sectionBg,
                      borderRadius: '8px',
                      marginBottom: '0.5rem',
                      cursor: 'pointer',
                      border: `1px solid ${colors.cardBorder}`,
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div style={{ 
                      fontWeight: '600', 
                      color: colors.cardText,
                      marginBottom: '0.25rem'
                    }}>
                      {job.name}
                    </div>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: colors.labelText 
                    }}>
                      {job.location || 'No location'}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '2rem', 
                  color: colors.labelText 
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
                borderRadius: '8px',
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