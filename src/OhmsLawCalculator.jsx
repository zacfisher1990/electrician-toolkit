import React, { useState } from 'react';
import { Zap, Plus, Trash2, Calculator, ArrowLeft } from 'lucide-react';

const OhmsLawCalculator = ({ onBack }) => {
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
      results.V = (I * R).toFixed(2);
    } else if (!voltage && P && I && I !== 0) {
      results.V = (P / I).toFixed(2);
    } else if (!voltage && P && R) {
      results.V = Math.sqrt(P * R).toFixed(2);
    } else if (voltage) {
      results.V = V.toFixed(2);
    }

    // Calculate Current
    if (!current && V && R && R !== 0) {
      results.I = (V / R).toFixed(2);
    } else if (!current && P && V && V !== 0) {
      results.I = (P / V).toFixed(2);
    } else if (!current && P && R && R !== 0) {
      results.I = Math.sqrt(P / R).toFixed(2);
    } else if (current) {
      results.I = I.toFixed(2);
    }

    // Calculate Resistance
    if (!resistance && V && I && I !== 0) {
      results.R = (V / I).toFixed(2);
    } else if (!resistance && V && P && P !== 0) {
      results.R = (V * V / P).toFixed(2);
    } else if (!resistance && P && I && I !== 0) {
      results.R = (P / (I * I)).toFixed(2);
    } else if (resistance) {
      results.R = R.toFixed(2);
    }

    // Calculate Power
    if (!power && V && I) {
      results.P = (V * I).toFixed(2);
    } else if (!power && I && R) {
      results.P = (I * I * R).toFixed(2);
    } else if (!power && V && R && R !== 0) {
      results.P = (V * V / R).toFixed(2);
    } else if (power) {
      results.P = P.toFixed(2);
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
          return { ...comp, I: totalI.toFixed(3) };
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
            return { ...comp, I: knownCurrent.toFixed(3) };
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
          newComp.R = (V / I).toFixed(3);
          changed = true;
        } else if ((comp.R === '' || isNaN(R)) && !isNaN(P) && !isNaN(I) && I !== 0) {
          newComp.R = (P / (I * I)).toFixed(3);
          changed = true;
        } else if ((comp.R === '' || isNaN(R)) && !isNaN(V) && !isNaN(P) && P !== 0) {
          newComp.R = (V * V / P).toFixed(3);
          changed = true;
        }

        const newR = parseFloat(newComp.R);
        const newI = parseFloat(newComp.I);
        if ((comp.V === '' || isNaN(V)) && !isNaN(newI) && !isNaN(newR)) {
          newComp.V = (newI * newR).toFixed(3);
          changed = true;
        } else if ((comp.V === '' || isNaN(V)) && !isNaN(P) && !isNaN(newI) && newI !== 0) {
          newComp.V = (P / newI).toFixed(3);
          changed = true;
        } else if ((comp.V === '' || isNaN(V)) && !isNaN(P) && !isNaN(newR)) {
          newComp.V = Math.sqrt(P * newR).toFixed(3);
          changed = true;
        }

        const newV = parseFloat(newComp.V);
        if ((comp.P === '' || isNaN(P)) && !isNaN(newV) && !isNaN(newI)) {
          newComp.P = (newV * newI).toFixed(3);
          changed = true;
        } else if ((comp.P === '' || isNaN(P)) && !isNaN(newI) && !isNaN(newR)) {
          newComp.P = (newI * newI * newR).toFixed(3);
          changed = true;
        } else if ((comp.P === '' || isNaN(P)) && !isNaN(newV) && !isNaN(newR) && newR !== 0) {
          newComp.P = (newV * newV / newR).toFixed(3);
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
          return { ...comp, V: totalV.toFixed(3) };
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
            return { ...comp, V: knownVoltage.toFixed(3) };
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
          newComp.R = (V / I).toFixed(3);
          changed = true;
        } else if ((comp.R === '' || isNaN(R)) && !isNaN(P) && !isNaN(I) && I !== 0) {
          newComp.R = (P / (I * I)).toFixed(3);
          changed = true;
        } else if ((comp.R === '' || isNaN(R)) && !isNaN(V) && !isNaN(P) && P !== 0) {
          newComp.R = (V * V / P).toFixed(3);
          changed = true;
        }

        const newR = parseFloat(newComp.R);
        const newV = parseFloat(newComp.V);
        if ((comp.I === '' || isNaN(I)) && !isNaN(newV) && !isNaN(newR) && newR !== 0) {
          newComp.I = (newV / newR).toFixed(3);
          changed = true;
        } else if ((comp.I === '' || isNaN(I)) && !isNaN(P) && !isNaN(newV) && newV !== 0) {
          newComp.I = (P / newV).toFixed(3);
          changed = true;
        } else if ((comp.I === '' || isNaN(I)) && !isNaN(P) && !isNaN(newR) && newR !== 0) {
          newComp.I = Math.sqrt(P / newR).toFixed(3);
          changed = true;
        }

        const newI = parseFloat(newComp.I);
        if ((comp.P === '' || isNaN(P)) && !isNaN(newV) && !isNaN(newI)) {
          newComp.P = (newV * newI).toFixed(3);
          changed = true;
        } else if ((comp.P === '' || isNaN(P)) && !isNaN(newI) && !isNaN(newR)) {
          newComp.P = (newI * newI * newR).toFixed(3);
          changed = true;
        } else if ((comp.P === '' || isNaN(P)) && !isNaN(newV) && !isNaN(newR) && newR !== 0) {
          newComp.P = (newV * newV / newR).toFixed(3);
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
    <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            marginBottom: '1rem',
            background: '#374151',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} />
          Back to Menu
        </button>
      )}

      <div style={{ background: '#fbbf24', color: 'black', padding: '1.5rem', borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Zap size={32} />
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Ohm's Law Calculator</h1>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>Professional Electrical Calculations - V, I, R, P</p>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '1.5rem' }}>
        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb' }}>
          <button
            onClick={() => setActiveTab('basic')}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              background: activeTab === 'basic' ? '#fbbf24' : '#f3f4f6',
              color: activeTab === 'basic' ? 'black' : '#6b7280',
              border: 'none',
              borderRadius: '0',
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
              flex: 1,
              padding: '0.75rem 1rem',
              background: activeTab === 'series' ? '#fbbf24' : '#f3f4f6',
              color: activeTab === 'series' ? 'black' : '#6b7280',
              border: 'none',
              borderRadius: '0',
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
              flex: 1,
              padding: '0.75rem 1rem',
              background: activeTab === 'parallel' ? '#fbbf24' : '#f3f4f6',
              color: activeTab === 'parallel' ? 'black' : '#6b7280',
              border: 'none',
              borderRadius: '0',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Parallel
          </button>
        </div>

        {/* Basic Tab */}
        {activeTab === 'basic' && (
          <div>
            <div style={{ 
              background: '#dbeafe', 
              border: '1px solid #3b82f6', 
              padding: '0.75rem', 
              borderRadius: '0.5rem', 
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e40af', fontWeight: '600' }}>
                Enter any 2 known values to calculate the remaining values
              </p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Voltage (V)
                </label>
                <input
                  type="number"
                  value={voltage}
                  onChange={(e) => setVoltage(e.target.value)}
                  placeholder="Enter voltage"
                  disabled={
                    (current && resistance) || 
                    (current && power) || 
                    (resistance && power)
                  }
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem 1rem', 
                    border: '2px solid #d1d5db', 
                    borderRadius: '0.25rem', 
                    fontSize: '1rem',
                    background: ((current && resistance) || (current && power) || (resistance && power)) ? '#f3f4f6' : 'white',
                    cursor: ((current && resistance) || (current && power) || (resistance && power)) ? 'not-allowed' : 'text'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Current (A)
                </label>
                <input
                  type="number"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  placeholder="Enter current"
                  disabled={
                    (voltage && resistance) || 
                    (voltage && power) || 
                    (resistance && power)
                  }
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem 1rem', 
                    border: '2px solid #d1d5db', 
                    borderRadius: '0.25rem', 
                    fontSize: '1rem',
                    background: ((voltage && resistance) || (voltage && power) || (resistance && power)) ? '#f3f4f6' : 'white',
                    cursor: ((voltage && resistance) || (voltage && power) || (resistance && power)) ? 'not-allowed' : 'text'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Resistance (Ω)
                </label>
                <input
                  type="number"
                  value={resistance}
                  onChange={(e) => setResistance(e.target.value)}
                  placeholder="Enter resistance"
                  disabled={
                    (voltage && current) || 
                    (voltage && power) || 
                    (current && power)
                  }
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem 1rem', 
                    border: '2px solid #d1d5db', 
                    borderRadius: '0.25rem', 
                    fontSize: '1rem',
                    background: ((voltage && current) || (voltage && power) || (current && power)) ? '#f3f4f6' : 'white',
                    cursor: ((voltage && current) || (voltage && power) || (current && power)) ? 'not-allowed' : 'text'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                  Power (W)
                </label>
                <input
                  type="number"
                  value={power}
                  onChange={(e) => setPower(e.target.value)}
                  placeholder="Enter power"
                  disabled={
                    (voltage && current) || 
                    (voltage && resistance) || 
                    (current && resistance)
                  }
                  style={{ 
                    width: '100%', 
                    padding: '0.5rem 1rem', 
                    border: '2px solid #d1d5db', 
                    borderRadius: '0.25rem', 
                    fontSize: '1rem',
                    background: ((voltage && current) || (voltage && resistance) || (current && resistance)) ? '#f3f4f6' : 'white',
                    cursor: ((voltage && current) || (voltage && resistance) || (current && resistance)) ? 'not-allowed' : 'text'
                  }}
                />
              </div>
            </div>

            <button
              onClick={calculateBasic}
              style={{
                width: '100%',
                background: '#fbbf24',
                color: 'black',
                fontWeight: 'bold',
                padding: '0.75rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginBottom: '0.75rem'
              }}
            >
              <Calculator size={20} />
              Calculate
            </button>

            <button
              onClick={clearBasic}
              style={{
                width: '100%',
                background: '#6b7280',
                color: 'white',
                fontWeight: '600',
                padding: '0.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                marginBottom: '1rem'
              }}
            >
              Clear All
            </button>

            {(basicResults.V || basicResults.I || basicResults.R || basicResults.P) && (
              <div style={{ 
                background: '#dcfce7', 
                border: '2px solid #16a34a', 
                padding: '1.5rem', 
                borderRadius: '0.5rem'
              }}>
                <h3 style={{ fontWeight: 'bold', color: '#166534', marginTop: 0, marginBottom: '1rem', textAlign: 'center' }}>
                  Results
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  {basicResults.V && (
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Voltage:</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#15803d' }}>
                        {basicResults.V} V
                      </div>
                    </div>
                  )}
                  {basicResults.I && (
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Current:</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#15803d' }}>
                        {basicResults.I} A
                      </div>
                    </div>
                  )}
                  {basicResults.R && (
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Resistance:</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#15803d' }}>
                        {basicResults.R} Ω
                      </div>
                    </div>
                  )}
                  {basicResults.P && (
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>Power:</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#15803d' }}>
                        {basicResults.P} W
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
            <div style={{ background: '#eff6ff', borderLeft: '4px solid #3b82f6', padding: '1rem', marginBottom: '1rem', borderRadius: '0.25rem' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e40af', fontWeight: '600' }}>
                Series Circuit: Current is constant across all components
              </p>
            </div>

            <div style={{ background: '#f9fafb', border: '2px solid #d1d5db', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 'bold', color: '#374151', marginTop: 0, marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                Circuit Totals (Optional)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {['R', 'V', 'I', 'P'].map(field => (
                  <div key={field}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Total {field} ({field === 'R' ? 'Ω' : field === 'V' ? 'V' : field === 'I' ? 'A' : 'W'})
                    </label>
                    <input
                      type="number"
                      value={seriesTotals[field]}
                      onChange={(e) => setSeriesTotals({...seriesTotals, [field]: e.target.value})}
                      placeholder="Optional"
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem' }}
                    />
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', marginBottom: 0 }}>
                Enter known total values to help solve the circuit. Series: Current is constant.
              </p>
            </div>

            {seriesComponents.map((comp, index) => (
              <div key={comp.id} style={{ background: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '2px solid #e5e7eb', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontWeight: 'bold', color: '#374151', margin: 0, fontSize: '0.875rem' }}>Component {index + 1}</h3>
                  {seriesComponents.length > 1 && (
                    <button
                      onClick={() => removeSeriesComponent(comp.id)}
                      style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
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
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>
                        {label}
                      </label>
                      <input
                        type="number"
                        value={comp[field]}
                        onChange={(e) => updateSeriesComponent(comp.id, field, e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem' }}
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
                background: '#16a34a',
                color: 'white',
                fontWeight: '600',
                padding: '0.5rem',
                borderRadius: '0.5rem',
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
              <Plus size={20} />
              Add Component
            </button>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                onClick={calculateSeries}
                style={{
                  flex: 1,
                  background: '#fbbf24',
                  color: 'black',
                  fontWeight: 'bold',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
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
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Clear All
              </button>
            </div>

            <div style={{ background: '#dcfce7', border: '2px solid #16a34a', padding: '1rem', borderRadius: '0.5rem' }}>
              <h3 style={{ fontWeight: 'bold', color: '#166534', marginTop: 0, marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                Circuit Totals
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ fontWeight: '600', color: '#374151' }}>Total R:</span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#16a34a', margin: '0.25rem 0 0 0' }}>
                    {getTotalsSeries().totalR.toFixed(3)} Ω
                  </p>
                </div>
                <div>
                  <span style={{ fontWeight: '600', color: '#374151' }}>Total V:</span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#16a34a', margin: '0.25rem 0 0 0' }}>
                    {getTotalsSeries().totalV.toFixed(3)} V
                  </p>
                </div>
                <div>
                  <span style={{ fontWeight: '600', color: '#374151' }}>Current:</span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#16a34a', margin: '0.25rem 0 0 0' }}>
                    {getTotalsSeries().totalI.toFixed(3)} A
                  </p>
                </div>
                <div>
                  <span style={{ fontWeight: '600', color: '#374151' }}>Total P:</span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#16a34a', margin: '0.25rem 0 0 0' }}>
                    {getTotalsSeries().totalP.toFixed(3)} W
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Parallel Tab */}
        {activeTab === 'parallel' && (
          <div>
            <div style={{ background: '#faf5ff', borderLeft: '4px solid #a855f7', padding: '1rem', marginBottom: '1rem', borderRadius: '0.25rem' }}>
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#7e22ce', fontWeight: '600' }}>
                Parallel Circuit: Voltage is constant across all components
              </p>
            </div>

            <div style={{ background: '#f9fafb', border: '2px solid #d1d5db', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>
              <h3 style={{ fontWeight: 'bold', color: '#374151', marginTop: 0, marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                Circuit Totals (Optional)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {['R', 'V', 'I', 'P'].map(field => (
                  <div key={field}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>
                      Total {field} ({field === 'R' ? 'Ω' : field === 'V' ? 'V' : field === 'I' ? 'A' : 'W'})
                    </label>
                    <input
                      type="number"
                      value={parallelTotals[field]}
                      onChange={(e) => setParallelTotals({...parallelTotals, [field]: e.target.value})}
                      placeholder="Optional"
                      style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem' }}
                    />
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.5rem', marginBottom: 0 }}>
                Enter known total values to help solve the circuit. Parallel: Voltage is constant.
              </p>
            </div>

            {parallelComponents.map((comp, index) => (
              <div key={comp.id} style={{ background: '#f9fafb', padding: '1rem', borderRadius: '0.5rem', border: '2px solid #e5e7eb', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontWeight: 'bold', color: '#374151', margin: 0, fontSize: '0.875rem' }}>Component {index + 1}</h3>
                  {parallelComponents.length > 1 && (
                    <button
                      onClick={() => removeParallelComponent(comp.id)}
                      style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
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
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '600', color: '#6b7280', marginBottom: '0.25rem' }}>
                        {label}
                      </label>
                      <input
                        type="number"
                        value={comp[field]}
                        onChange={(e) => updateParallelComponent(comp.id, field, e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem' }}
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
                background: '#16a34a',
                color: 'white',
                fontWeight: '600',
                padding: '0.5rem',
                borderRadius: '0.5rem',
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
              <Plus size={20} />
              Add Component
            </button>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <button
                onClick={calculateParallel}
                style={{
                  flex: 1,
                  background: '#fbbf24',
                  color: 'black',
                  fontWeight: 'bold',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '1rem',
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
                  borderRadius: '0.5rem',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Clear All
              </button>
            </div>

            <div style={{ background: '#dcfce7', border: '2px solid #16a34a', padding: '1rem', borderRadius: '0.5rem' }}>
              <h3 style={{ fontWeight: 'bold', color: '#166534', marginTop: 0, marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                Circuit Totals
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ fontWeight: '600', color: '#374151' }}>Total R:</span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#16a34a', margin: '0.25rem 0 0 0' }}>
                    {getTotalsParallel().totalR.toFixed(3)} Ω
                  </p>
                </div>
                <div>
                  <span style={{ fontWeight: '600', color: '#374151' }}>Voltage:</span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#16a34a', margin: '0.25rem 0 0 0' }}>
                    {getTotalsParallel().totalV.toFixed(3)} V
                  </p>
                </div>
                <div>
                  <span style={{ fontWeight: '600', color: '#374151' }}>Total I:</span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#16a34a', margin: '0.25rem 0 0 0' }}>
                    {getTotalsParallel().totalI.toFixed(3)} A
                  </p>
                </div>
                <div>
                  <span style={{ fontWeight: '600', color: '#374151' }}>Total P:</span>
                  <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#16a34a', margin: '0.25rem 0 0 0' }}>
                    {getTotalsParallel().totalP.toFixed(3)} W
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{ background: '#1e293b', color: '#cbd5e1', padding: '1.5rem', borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem', fontSize: '0.875rem' }}>
        <p style={{ fontWeight: '600', marginTop: 0, marginBottom: '0.75rem' }}>Formulas:</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          <p style={{ margin: 0 }}>V = I × R</p>
          <p style={{ margin: 0 }}>P = V × I</p>
          <p style={{ margin: 0 }}>I = V ÷ R</p>
          <p style={{ margin: 0 }}>P = I² × R</p>
          <p style={{ margin: 0 }}>R = V ÷ I</p>
          <p style={{ margin: 0 }}>P = V² ÷ R</p>
        </div>
      </div>
    </div>
  );
};

export default OhmsLawCalculator;
