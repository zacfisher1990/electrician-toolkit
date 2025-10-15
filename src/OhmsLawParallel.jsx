import React, { useState } from 'react';
import { Info, Plus, Trash2, Calculator, FileDown, Briefcase } from 'lucide-react';
import { getUserJobs, addCalculationToJob } from './jobsService';

const OhmsLawParallel = ({ isDarkMode, colors, onExport }) => {
  const [parallelComponents, setParallelComponents] = useState([
    { id: 1, R: '', V: '', I: '', P: '' }
  ]);
  const [parallelTotals, setParallelTotals] = useState({ R: '', V: '', I: '', P: '' });
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

  const addParallelComponent = () => {
    const newId = Math.max(...parallelComponents.map(c => c.id), 0) + 1;
    setParallelComponents([...parallelComponents, { id: newId, R: '', V: '', I: '', P: '' }]);
  };

  const removeParallelComponent = (id) => {
    if (parallelComponents.length > 1) {
      setParallelComponents(parallelComponents.filter(c => c.id !== id));
    }
  };

  const updateParallelComponent = (id, field, value) => {
    setParallelComponents(parallelComponents.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const validateParallelTotals = (components, totals) => {
    const conflicts = [];
    if (totals.V && totals.V !== '') {
      const totalV = parseFloat(totals.V);
      components.forEach((comp, idx) => {
        if (comp.V && comp.V !== '') {
          const compV = parseFloat(comp.V);
          if (Math.abs(compV - totalV) > 0.01) {
            conflicts.push(`Total voltage (${totalV}V) conflicts with Component ${idx + 1} voltage (${compV}V)`);
          }
        }
      });
    }
    return conflicts;
  };

  const calculateParallel = () => {
    const conflicts = validateParallelTotals(parallelComponents, parallelTotals);
    if (conflicts.length > 0) {
      alert('Conflicts detected:\n' + conflicts.join('\n'));
      return;
    }

    let components = [...parallelComponents];
    
    if (parallelTotals.V && parallelTotals.V !== '') {
      const totalV = parseFloat(parallelTotals.V);
      components = components.map(comp => {
        if (!comp.V || comp.V === '') {
          return { ...comp, V: totalV.toFixed(1) };
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
      
      let knownVoltage = null;
      for (let comp of components) {
        if (comp.V && !isNaN(parseFloat(comp.V))) {
          knownVoltage = parseFloat(comp.V);
          break;
        }
      }

      if (knownVoltage === null) {
        for (let comp of components) {
          const I = parseFloat(comp.I);
          const R = parseFloat(comp.R);
          const P = parseFloat(comp.P);
          
          if (!isNaN(I) && !isNaN(R)) {
            knownVoltage = I * R;
            break;
          } else if (!isNaN(P) && !isNaN(I) && I !== 0) {
            knownVoltage = P / I;
            break;
          } else if (!isNaN(P) && !isNaN(R)) {
            knownVoltage = Math.sqrt(P * R);
            break;
          }
        }
      }

      if (knownVoltage !== null) {
        components = components.map(comp => {
          if (!comp.V || comp.V === '') {
            changed = true;
            return { ...comp, V: knownVoltage.toFixed(1) };
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
        const newV = parseFloat(newComp.V);
        if ((comp.I === '' || isNaN(I)) && !isNaN(newV) && !isNaN(newR) && newR !== 0) {
          newComp.I = (newV / newR).toFixed(1);
          changed = true;
        } else if ((comp.I === '' || isNaN(I)) && !isNaN(P) && !isNaN(newV) && newV !== 0) {
          newComp.I = (P / newV).toFixed(1);
          changed = true;
        } else if ((comp.I === '' || isNaN(I)) && !isNaN(P) && !isNaN(newR) && newR !== 0) {
          newComp.I = Math.sqrt(P / newR).toFixed(1);
          changed = true;
        }

        const newI = parseFloat(newComp.I);
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

    setParallelComponents(components);
  };

  const clearParallel = () => {
    setParallelComponents([{ id: 1, R: '', V: '', I: '', P: '' }]);
    setParallelTotals({ R: '', V: '', I: '', P: '' });
  };

  const getTotalsParallel = () => {
    const totalI = parallelComponents.reduce((sum, c) => {
      const i = parseFloat(c.I);
      return sum + (isNaN(i) ? 0 : i);
    }, 0);
    
    const totalP = parallelComponents.reduce((sum, c) => {
      const p = parseFloat(c.P);
      return sum + (isNaN(p) ? 0 : p);
    }, 0);
    
    const firstV = parallelComponents.find(c => !isNaN(parseFloat(c.V)));
    const totalV = firstV ? parseFloat(firstV.V) : 0;
    
    const resistances = parallelComponents.map(c => parseFloat(c.R)).filter(r => !isNaN(r) && r > 0);
    const totalR = resistances.length > 0 
      ? 1 / resistances.reduce((sum, r) => sum + 1/r, 0)
      : 0;
    
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
      const totals = getTotalsParallel();
      const calculationData = {
        type: 'ohms-law-parallel',
        data: {
          components: parallelComponents,
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
    const hasData = parallelComponents.some(c => c.R || c.V || c.I || c.P);
    
    if (!hasData) {
      alert('Please enter component values before exporting');
      return;
    }

    const totals = getTotalsParallel();
    const inputs = {};
    parallelComponents.forEach((comp, idx) => {
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
      calculatorName: "Ohm's Law Calculator - Parallel Circuit",
      inputs,
      results: {
        totalResistance: `${totals.totalR.toFixed(1)} Ω`,
        voltage: `${totals.totalV.toFixed(1)} V (constant)`,
        totalCurrent: `${totals.totalI.toFixed(1)} A`,
        totalPower: `${totals.totalP.toFixed(1)} W`
      },
      additionalInfo: {
        circuitType: 'Parallel Circuit',
        principle: 'Voltage is constant across all components',
        totalResistanceFormula: '1/R_total = 1/R1 + 1/R2 + 1/R3 + ...',
        totalCurrentFormula: 'I_total = I1 + I2 + I3 + ...'
      },
      necReferences: [
        'Parallel circuits: Voltage is the same across all components',
        'Total resistance = 1 ÷ (1/R1 + 1/R2 + 1/R3 + ...)',
        'Total current = Sum of currents through each branch',
        'Total power = Sum of power dissipated in each component'
      ]
    };

    onExport(pdfData);
  };

  const hasResults = parallelComponents.some(c => c.R || c.V || c.I || c.P);

  return (
    <div>
      {/* Info Box */}
      <div style={{
        background: '#faf5ff',
        border: '1px solid #a855f7',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
          <Info size={20} color="#7e22ce" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
          <p style={{ 
            margin: 0, 
            fontSize: '0.875rem', 
            color: '#7e22ce',
            lineHeight: '1.5'
          }}>
            Parallel Circuit: Voltage is constant across all components
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
                  value={parallelTotals[field]}
                  onChange={(e) => setParallelTotals({...parallelTotals, [field]: e.target.value})}
                  placeholder="Optional"
                  disabled={isTotalFieldDisabled(parallelTotals, field)}
                  style={{ 
                    width: '100%', 
                    padding: '0.625rem',
                    fontSize: '0.9375rem',
                    border: `1px solid ${colors.inputBorder}`, 
                    borderRadius: '8px',
                    backgroundColor: isTotalFieldDisabled(parallelTotals, field) ? colors.sectionBg : colors.inputBg,
                    color: colors.cardText,
                    boxSizing: 'border-box',
                    cursor: isTotalFieldDisabled(parallelTotals, field) ? 'not-allowed' : 'text'
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
          Enter known total values to help solve the circuit. Voltage is constant in parallel.
        </p>
      </div>

      {/* Components */}
      {parallelComponents.map((comp, index) => (
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
            {parallelComponents.length > 1 && (
              <button
                onClick={() => removeParallelComponent(comp.id)}
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
                  onChange={(e) => updateParallelComponent(comp.id, field, e.target.value)}
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
        onClick={addParallelComponent}
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
          onClick={calculateParallel}
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
          onClick={clearParallel}
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
              {getTotalsParallel().totalV.toFixed(1)}
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
              {getTotalsParallel().totalI.toFixed(1)}
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
              {getTotalsParallel().totalR.toFixed(1)}
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
              {getTotalsParallel().totalP.toFixed(1)}
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

export default OhmsLawParallel;