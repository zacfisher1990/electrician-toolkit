import React, { useState } from 'react';
import { Info, Plus, Trash2, Calculator, FileDown, Briefcase } from 'lucide-react';
import { getUserJobs, addCalculationToJob } from '../../jobs/jobsService';
import styles from './Calculator.module.css';

const OhmsLawSeries = ({ isDarkMode, colors, onExport }) => {
  const [seriesComponents, setSeriesComponents] = useState([
    { id: 1, R: '', V: '', I: '', P: '' }
  ]);
  const [seriesTotals, setSeriesTotals] = useState({ R: '', V: '', I: '', P: '' });
  const [showJobSelector, setShowJobSelector] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const getTotalFieldsCount = (totals) => {
    return Object.values(totals).filter(val => val && val !== '').length;
  };

  const isTotalFieldDisabled = (totals, fieldName) => {
    const filledFields = Object.entries(totals)
      .filter(([key, val]) => key !== fieldName && val && val !== '')
      .map(([key]) => key);
    return filledFields.length >= 2;
  };

  const addSeriesComponent = () => {
    const newId = Math.max(...seriesComponents.map(c => c.id), 0) + 1;
    setSeriesComponents([...seriesComponents, { id: newId, R: '', V: '', I: '', P: '' }]);
  };

  const removeSeriesComponent = (id) => {
    if (seriesComponents.length > 1) {
      setSeriesComponents(seriesComponents.filter(c => c.id !== id));
    }
  };

  const updateSeriesComponent = (id, field, value) => {
    setSeriesComponents(seriesComponents.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const validateSeriesTotals = (components, totals) => {
    const conflicts = [];
    if (totals.I && totals.I !== '') {
      const totalI = parseFloat(totals.I);
      components.forEach((comp, idx) => {
        if (comp.I && comp.I !== '') {
          const compI = parseFloat(comp.I);
          if (Math.abs(compI - totalI) > 0.01) {
            conflicts.push(`Total current (${totalI}A) conflicts with Component ${idx + 1} current (${compI}A)`);
          }
        }
      });
    }
    return conflicts;
  };

  const calculateSeries = () => {
    const conflicts = validateSeriesTotals(seriesComponents, seriesTotals);
    if (conflicts.length > 0) {
      alert('Conflicts detected:\n' + conflicts.join('\n'));
      return;
    }

    let components = [...seriesComponents];
    
    if (seriesTotals.I && seriesTotals.I !== '') {
      const totalI = parseFloat(seriesTotals.I);
      components = components.map(comp => {
        if (!comp.I || comp.I === '') {
          return { ...comp, I: totalI.toFixed(1) };
        }
        return comp;
      });
    }

    let changed = true;
    let iterations = 0;
    const maxIterations = 50;

    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;
      
      let knownCurrent = null;
      for (let comp of components) {
        if (comp.I && !isNaN(parseFloat(comp.I))) {
          knownCurrent = parseFloat(comp.I);
          break;
        }
      }

      if (knownCurrent === null) {
        for (let comp of components) {
          const V = parseFloat(comp.V);
          const R = parseFloat(comp.R);
          const P = parseFloat(comp.P);
          
          if (!isNaN(V) && !isNaN(R) && R !== 0) {
            knownCurrent = V / R;
            break;
          } else if (!isNaN(P) && !isNaN(V) && V !== 0) {
            knownCurrent = P / V;
            break;
          } else if (!isNaN(P) && !isNaN(R) && R !== 0) {
            knownCurrent = Math.sqrt(P / R);
            break;
          }
        }
      }

      if (knownCurrent !== null) {
        components = components.map(comp => {
          if (!comp.I || comp.I === '') {
            changed = true;
            return { ...comp, I: knownCurrent.toFixed(1) };
          }
          return comp;
        });
      }

      components = components.map(comp => {
        const newComp = { ...comp };
        const V = parseFloat(comp.V);
        const I = parseFloat(comp.I);
        const R = parseFloat(comp.R);
        const P = parseFloat(comp.P);

        if ((comp.R === '' || isNaN(R)) && !isNaN(V) && !isNaN(I) && I !== 0) {
          newComp.R = (V / I).toFixed(1);
          changed = true;
        } else if ((comp.R === '' || isNaN(R)) && !isNaN(P) && !isNaN(I) && I !== 0) {
          newComp.R = (P / (I * I)).toFixed(1);
          changed = true;
        } else if ((comp.R === '' || isNaN(R)) && !isNaN(V) && !isNaN(P) && P !== 0) {
          newComp.R = (V * V / P).toFixed(1);
          changed = true;
        }

        const newR = parseFloat(newComp.R);
        const newI = parseFloat(newComp.I);
        if ((comp.V === '' || isNaN(V)) && !isNaN(newI) && !isNaN(newR)) {
          newComp.V = (newI * newR).toFixed(1);
          changed = true;
        } else if ((comp.V === '' || isNaN(V)) && !isNaN(P) && !isNaN(newI) && newI !== 0) {
          newComp.V = (P / newI).toFixed(1);
          changed = true;
        } else if ((comp.V === '' || isNaN(V)) && !isNaN(P) && !isNaN(newR)) {
          newComp.V = Math.sqrt(P * newR).toFixed(1);
          changed = true;
        }

        const newV = parseFloat(newComp.V);
        if ((comp.P === '' || isNaN(P)) && !isNaN(newV) && !isNaN(newI)) {
          newComp.P = (newV * newI).toFixed(1);
          changed = true;
        } else if ((comp.P === '' || isNaN(P)) && !isNaN(newI) && !isNaN(newR)) {
          newComp.P = (newI * newI * newR).toFixed(1);
          changed = true;
        } else if ((comp.P === '' || isNaN(P)) && !isNaN(newV) && !isNaN(newR) && newR !== 0) {
          newComp.P = (newV * newV / newR).toFixed(1);
          changed = true;
        }

        return newComp;
      });
    }

    setSeriesComponents(components);
  };

  const clearSeries = () => {
    setSeriesComponents([{ id: 1, R: '', V: '', I: '', P: '' }]);
    setSeriesTotals({ R: '', V: '', I: '', P: '' });
  };

  const getTotalsSeries = () => {
    const totalR = seriesComponents.reduce((sum, c) => {
      const r = parseFloat(c.R);
      return sum + (isNaN(r) ? 0 : r);
    }, 0);
    
    const totalV = seriesComponents.reduce((sum, c) => {
      const v = parseFloat(c.V);
      return sum + (isNaN(v) ? 0 : v);
    }, 0);
    
    const totalP = seriesComponents.reduce((sum, c) => {
      const p = parseFloat(c.P);
      return sum + (isNaN(p) ? 0 : p);
    }, 0);
    
    const firstI = seriesComponents.find(c => !isNaN(parseFloat(c.I)));
    const totalI = firstI ? parseFloat(firstI.I) : 0;
    
    return { totalR, totalV, totalI, totalP };
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
      const totals = getTotalsSeries();
      const calculationData = {
        type: 'ohms-law-series',
        data: {
          components: seriesComponents,
          totals: totals
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
    const hasData = seriesComponents.some(c => c.R || c.V || c.I || c.P);
    
    if (!hasData) {
      alert('Please enter component values before exporting');
      return;
    }

    const totals = getTotalsSeries();
    const inputs = {};
    seriesComponents.forEach((comp, idx) => {
      const values = [];
      if (comp.R) values.push(`R=${comp.R}Ω`);
      if (comp.V) values.push(`V=${comp.V}V`);
      if (comp.I) values.push(`I=${comp.I}A`);
      if (comp.P) values.push(`P=${comp.P}W`);
      if (values.length > 0) {
        inputs[`component${idx + 1}`] = values.join(', ');
      }
    });

    const pdfData = {
      calculatorName: "Ohm's Law Calculator - Series Circuit",
      inputs,
      results: {
        totalResistance: `${totals.totalR.toFixed(1)} Ω`,
        totalVoltage: `${totals.totalV.toFixed(1)} V`,
        current: `${totals.totalI.toFixed(1)} A (constant)`,
        totalPower: `${totals.totalP.toFixed(1)} W`
      },
      additionalInfo: {
        circuitType: 'Series Circuit',
        principle: 'Current is constant across all components',
        totalResistanceFormula: 'R_total = R1 + R2 + R3 + ...',
        totalVoltageFormula: 'V_total = V1 + V2 + V3 + ...'
      },
      necReferences: [
        'Series circuits: Current is the same through all components',
        'Total resistance = Sum of all resistances',
        'Total voltage = Sum of voltage drops across components',
        'Total power = Sum of power dissipated in each component'
      ]
    };

    onExport(pdfData);
  };

  const hasResults = seriesComponents.some(c => c.R || c.V || c.I || c.P);

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
            Series Circuit: Current is constant across all components
          </p>
        </div>
      </div>

      {/* Circuit Totals */}
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
          marginBottom: '1rem',
          borderBottom: `1px solid ${colors.cardBorder}`,
          paddingBottom: '0.5rem'
        }}>
          Circuit Totals (Optional)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '0.5rem' }}>
          {['V', 'I', 'R', 'P'].map(field => {
            const labels = {
              'R': 'Ohms (R)',
              'V': 'Volts (E)',
              'I': 'Amps (I)',
              'P': 'Watts (P)'
            };
            
            return (
              <div key={field}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.8125rem', 
                  fontWeight: '500', 
                  color: colors.labelText, 
                  marginBottom: '0.5rem' 
                }}>
                  {labels[field]}
                </label>
                <input
                  type="number"
                  value={seriesTotals[field]}
                  onChange={(e) => setSeriesTotals({...seriesTotals, [field]: e.target.value})}
                  placeholder="Optional"
                  disabled={isTotalFieldDisabled(seriesTotals, field)}
                  style={{ 
                    width: '100%', 
                    padding: '0.625rem',
                    fontSize: '0.9375rem',
                    border: `1px solid ${colors.inputBorder}`, 
                    borderRadius: '8px',
                    backgroundColor: isTotalFieldDisabled(seriesTotals, field) ? colors.sectionBg : colors.inputBg,
                    color: colors.cardText,
                    boxSizing: 'border-box',
                    cursor: isTotalFieldDisabled(seriesTotals, field) ? 'not-allowed' : 'text'
                  }}
                />
              </div>
            );
          })}
        </div>
        <p style={{ 
          fontSize: '0.8125rem', 
          color: colors.subtleText, 
          margin: 0,
          fontStyle: 'italic'
        }}>
          Enter known total values to help solve the circuit. Current is constant in series.
        </p>
      </div>

      {/* Components */}
      {seriesComponents.map((comp, index) => (
        <div key={comp.id} style={{ 
          background: colors.sectionBg,
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '0.75rem',
          border: `1px solid ${colors.cardBorder}`
        }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            marginBottom: '0.75rem',
            gap: '0.5rem'
          }}>
            <h4 style={{ 
              fontWeight: '600', 
              color: colors.labelText, 
              margin: 0, 
              fontSize: '0.875rem'
            }}>
              Component {index + 1}
            </h4>
            {seriesComponents.length > 1 && (
              <button
                onClick={() => removeSeriesComponent(comp.id)}
                style={{ 
                  color: '#dc2626', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  padding: '0.5rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
            {[
              { field: 'V', label: 'Volts (E)' },
              { field: 'I', label: 'Amps (I)' },
              { field: 'R', label: 'Ohms (R)' },
              { field: 'P', label: 'Watts (P)' }
            ].map(({ field, label }) => (
              <div key={field}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.75rem', 
                  fontWeight: '500', 
                  color: colors.subtleText, 
                  marginBottom: '0.25rem' 
                }}>
                  {label}
                </label>
                <input
                  type="number"
                  value={comp[field]}
                  onChange={(e) => updateSeriesComponent(comp.id, field, e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem',
                    fontSize: '0.875rem',
                    border: `1px solid ${colors.inputBorder}`, 
                    borderRadius: '8px',
                    backgroundColor: colors.inputBg,
                    color: colors.cardText,
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={addSeriesComponent}
        style={{
          width: '100%',
          background: '#3b82f6',
          color: 'white',
          fontWeight: '600',
          padding: '0.75rem',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.875rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          marginBottom: '1rem'
        }}
      >
        <Plus size={16} />
        Add Component
      </button>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          onClick={calculateSeries}
          style={{
            flex: 1,
            background: '#3b82f6',
            color: 'white',
            fontWeight: '600',
            padding: '0.75rem',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <Calculator size={20} />
          Calculate
        </button>
        <button
          onClick={clearSeries}
          style={{
            flex: 1,
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
          Circuit Totals
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div style={{
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
              Voltage
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.cardText }}>
              {getTotalsSeries().totalV.toFixed(1)}
            </div>
            <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
              E
            </div>
          </div>
          <div style={{
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
              Amperage
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.cardText }}>
              {getTotalsSeries().totalI.toFixed(1)}
            </div>
            <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
              I
            </div>
          </div>
          <div style={{
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
              Resistance
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.cardText }}>
              {getTotalsSeries().totalR.toFixed(1)}
            </div>
            <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
              R
            </div>
          </div>
          <div style={{
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
              Wattage
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.cardText }}>
              {getTotalsSeries().totalP.toFixed(1)}
            </div>
            <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
              P
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      {hasResults && (
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

export default OhmsLawSeries;