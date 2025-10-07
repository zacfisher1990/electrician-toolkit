import React, { useState, useEffect } from 'react';
import { Zap, Plus, Trash2, Calculator, Info } from 'lucide-react';

const OhmsLawCalculator = ({ isDarkMode = false }) => {
  const [activeTab, setActiveTab] = useState('basic');
  
  // Basic calculator state
  const [voltage, setVoltage] = useState('');
  const [current, setCurrent] = useState('');
  const [resistance, setResistance] = useState('');
  const [power, setPower] = useState('');
  
  // Series circuit state
  const [seriesComponents, setSeriesComponents] = useState([
    { id: 1, R: '', V: '', I: '', P: '' }
  ]);
  
  // Parallel circuit state
  const [parallelComponents, setParallelComponents] = useState([
    { id: 1, R: '', V: '', I: '', P: '' }
  ]);

  // Dark mode colors - matching ConduitFillCalculator
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

  // Auto-calculate when inputs change
  useEffect(() => {
    calculateBasic();
  }, [voltage, current, resistance, power]);

  // Helper function to check if any 2 total fields are filled
  const getTotalFieldsCount = (totals) => {
    return Object.values(totals).filter(val => val && val !== '').length;
  };

  // Helper function to check if a specific total field should be disabled
  const isTotalFieldDisabled = (totals, fieldName) => {
    const filledFields = Object.entries(totals)
      .filter(([key, val]) => key !== fieldName && val && val !== '')
      .map(([key]) => key);
    return filledFields.length >= 2;
  };

  const [seriesTotals, setSeriesTotals] = useState({ R: '', V: '', I: '', P: '' });
  const [parallelTotals, setParallelTotals] = useState({ R: '', V: '', I: '', P: '' });
  const [basicResults, setBasicResults] = useState({ V: '', I: '', R: '', P: '' });

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

  // Series circuit functions
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

  // Parallel circuit functions
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

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header Card */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Zap size={24} color="#3b82f6" />
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: colors.cardText,
            margin: 0 
          }}>
            Ohm's Law Calculator
          </h2>
        </div>
        <p style={{ 
          fontSize: '0.875rem', 
          color: colors.labelText,
          margin: 0 
        }}>
          Professional Electrical Calculations - V, I, R, P
        </p>
      </div>

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
            onClick={() => setActiveTab('basic')}
            style={{
              flex: '1 1 auto',
              minWidth: '80px',
              padding: '0.75rem 1rem',
              background: activeTab === 'basic' ? '#3b82f6' : 'transparent',
              color: activeTab === 'basic' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'basic' ? '#3b82f6' : colors.cardBorder}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Basic
          </button>
          <button
            onClick={() => setActiveTab('series')}
            style={{
              flex: '1 1 auto',
              minWidth: '80px',
              padding: '0.75rem 1rem',
              background: activeTab === 'series' ? '#3b82f6' : 'transparent',
              color: activeTab === 'series' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'series' ? '#3b82f6' : colors.cardBorder}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Series
          </button>
          <button
            onClick={() => setActiveTab('parallel')}
            style={{
              flex: '1 1 auto',
              minWidth: '80px',
              padding: '0.75rem 1rem',
              background: activeTab === 'parallel' ? '#3b82f6' : 'transparent',
              color: activeTab === 'parallel' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'parallel' ? '#3b82f6' : colors.cardBorder}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Parallel
          </button>
        </div>
      </div>

      {/* Basic Tab */}
      {activeTab === 'basic' && (
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
                  Voltage (V)
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
                  Current (A)
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
                  Resistance (Ω)
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
                  Power (W)
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
        </div>
      )}

      {/* Series Tab */}
      {activeTab === 'series' && (
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '0.5rem' }}>
              {['R', 'V', 'I', 'P'].map(field => (
                <div key={field}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.8125rem', 
                    fontWeight: '500', 
                    color: colors.labelText, 
                    marginBottom: '0.5rem' 
                  }}>
                    {field} ({field === 'R' ? 'Ω' : field === 'V' ? 'V' : field === 'I' ? 'A' : 'W'})
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
              ))}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontWeight: '600', color: colors.labelText, margin: 0, fontSize: '0.875rem' }}>
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
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {[
                  { field: 'R', label: 'R (Ω)' },
                  { field: 'V', label: 'V (V)' },
                  { field: 'I', label: 'I (A)' },
                  { field: 'P', label: 'P (W)' }
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Total R
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.cardText }}>
                  {getTotalsSeries().totalR.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  Ω
                </div>
              </div>
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Total V
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.cardText }}>
                  {getTotalsSeries().totalV.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  V
                </div>
              </div>
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Current
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.cardText }}>
                  {getTotalsSeries().totalI.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  A
                </div>
              </div>
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Total P
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.cardText }}>
                  {getTotalsSeries().totalP.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  W
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Parallel Tab */}
      {activeTab === 'parallel' && (
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '0.5rem' }}>
              {['R', 'V', 'I', 'P'].map(field => (
                <div key={field}>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.8125rem', 
                    fontWeight: '500', 
                    color: colors.labelText, 
                    marginBottom: '0.5rem' 
                  }}>
                    {field} ({field === 'R' ? 'Ω' : field === 'V' ? 'V' : field === 'I' ? 'A' : 'W'})
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
              ))}
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <h4 style={{ fontWeight: '600', color: colors.labelText, margin: 0, fontSize: '0.875rem' }}>
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
                      padding: '0.25rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {[
                  { field: 'R', label: 'R (Ω)' },
                  { field: 'V', label: 'V (V)' },
                  { field: 'I', label: 'I (A)' },
                  { field: 'P', label: 'P (W)' }
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Total R
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.cardText }}>
                  {getTotalsParallel().totalR.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  Ω
                </div>
              </div>
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
                  V
                </div>
              </div>
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Total I
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.cardText }}>
                  {getTotalsParallel().totalI.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  A
                </div>
              </div>
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Total P
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: colors.cardText }}>
                  {getTotalsParallel().totalP.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  W
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formula Reference Footer */}
      <div style={{
        background: colors.sectionBg,
        padding: '1rem',
        borderRadius: '8px',
        border: `1px solid ${colors.cardBorder}`,
        fontSize: '0.8125rem',
        color: colors.labelText,
        marginTop: '1rem'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: colors.cardText }}>
          Formulas:
        </div>
        V = I × R • P = V × I • I = V ÷ R • P = I² × R • R = V ÷ I • P = V² ÷ R
      </div>
    </div>
  );
};

export default OhmsLawCalculator;
