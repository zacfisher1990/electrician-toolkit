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

  // Basic Ohm's Law calculations
  const calculateBasic = (field) => {
    const V = parseFloat(voltage);
    const I = parseFloat(current);
    const R = parseFloat(resistance);
    const P = parseFloat(power);

    if (field !== 'voltage' && !isNaN(I) && !isNaN(R)) {
      setVoltage((I * R).toFixed(2));
    } else if (field !== 'voltage' && !isNaN(P) && !isNaN(I) && I !== 0) {
      setVoltage((P / I).toFixed(2));
    } else if (field !== 'voltage' && !isNaN(P) && !isNaN(R)) {
      setVoltage(Math.sqrt(P * R).toFixed(2));
    }

    if (field !== 'current' && !isNaN(V) && !isNaN(R) && R !== 0) {
      setCurrent((V / R).toFixed(2));
    } else if (field !== 'current' && !isNaN(P) && !isNaN(V) && V !== 0) {
      setCurrent((P / V).toFixed(2));
    } else if (field !== 'current' && !isNaN(P) && !isNaN(R) && R !== 0) {
      setCurrent(Math.sqrt(P / R).toFixed(2));
    }

    if (field !== 'resistance' && !isNaN(V) && !isNaN(I) && I !== 0) {
      setResistance((V / I).toFixed(2));
    } else if (field !== 'resistance' && !isNaN(V) && !isNaN(P) && P !== 0) {
      setResistance((V * V / P).toFixed(2));
    } else if (field !== 'resistance' && !isNaN(P) && !isNaN(I) && I !== 0) {
      setResistance((P / (I * I)).toFixed(2));
    }

    if (field !== 'power' && !isNaN(V) && !isNaN(I)) {
      setPower((V * I).toFixed(2));
    } else if (field !== 'power' && !isNaN(I) && !isNaN(R)) {
      setPower((I * I * R).toFixed(2));
    } else if (field !== 'power' && !isNaN(V) && !isNaN(R) && R !== 0) {
      setPower((V * V / R).toFixed(2));
    }
  };

  const clearBasic = () => {
    setVoltage('');
    setCurrent('');
    setResistance('');
    setPower('');
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

  const calculateSeries = () => {
    let components = [...seriesComponents];
    let changed = true;
    let iterations = 0;
    const maxIterations = 50;

    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;
      
      // Find known current (same for all in series)
      let knownCurrent = null;
      for (let comp of components) {
        if (comp.I && !isNaN(parseFloat(comp.I))) {
          knownCurrent = parseFloat(comp.I);
          break;
        }
      }

      // If no current known, try to derive from any component
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

      // Apply known current to all components
      if (knownCurrent !== null) {
        components = components.map(comp => {
          if (!comp.I || comp.I === '') {
            changed = true;
            return { ...comp, I: knownCurrent.toFixed(3) };
          }
          return comp;
        });
      }

      // Calculate missing values for each component
      components = components.map(comp => {
        const newComp = { ...comp };
        const V = parseFloat(comp.V);
        const I = parseFloat(comp.I);
        const R = parseFloat(comp.R);
        const P = parseFloat(comp.P);

        // Calculate R
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

        // Calculate V
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

        // Calculate P
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
    let components = [...parallelComponents];
    let changed = true;
    let iterations = 0;
    const maxIterations = 50;

    while (changed && iterations < maxIterations) {
      changed = false;
      iterations++;
      
      // Find known voltage (same for all in parallel)
      let knownVoltage = null;
      for (let comp of components) {
        if (comp.V && !isNaN(parseFloat(comp.V))) {
          knownVoltage = parseFloat(comp.V);
          break;
        }
      }

      // If no voltage known, try to derive from any component
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

      // Apply known voltage to all components
      if (knownVoltage !== null) {
        components = components.map(comp => {
          if (!comp.V || comp.V === '') {
            changed = true;
            return { ...comp, V: knownVoltage.toFixed(3) };
          }
          return comp;
        });
      }

      // Calculate missing values for each component
      components = components.map(comp => {
        const newComp = { ...comp };
        const V = parseFloat(comp.V);
        const I = parseFloat(comp.I);
        const R = parseFloat(comp.R);
        const P = parseFloat(comp.P);

        // Calculate R
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

        // Calculate I
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

        // Calculate P
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
      <p style={{ fontSize: '0.875rem', margin: 0 }}>Professional Electrical Calculations</p>
    </div>
  </div>
</div>

<div style={{ background: 'white' }}>
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('basic')}
              className={`flex-1 px-4 py-3 font-semibold transition-colors ${
                activeTab === 'basic'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Basic
            </button>
            <button
              onClick={() => setActiveTab('series')}
              className={`flex-1 px-4 py-3 font-semibold transition-colors ${
                activeTab === 'series'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Series
            </button>
            <button
              onClick={() => setActiveTab('parallel')}
              className={`flex-1 px-4 py-3 font-semibold transition-colors ${
                activeTab === 'parallel'
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Parallel
            </button>
          </div>

          <div className="p-6">
            {activeTab === 'basic' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Voltage (V)
                    </label>
                    <input
                      type="number"
                      value={voltage}
                      onChange={(e) => {
                        setVoltage(e.target.value);
                        setTimeout(() => calculateBasic('voltage'), 0);
                      }}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-yellow-400 focus:outline-none"
                      placeholder="Enter voltage"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Current (A)
                    </label>
                    <input
                      type="number"
                      value={current}
                      onChange={(e) => {
                        setCurrent(e.target.value);
                        setTimeout(() => calculateBasic('current'), 0);
                      }}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-yellow-400 focus:outline-none"
                      placeholder="Enter current"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Resistance (Ω)
                    </label>
                    <input
                      type="number"
                      value={resistance}
                      onChange={(e) => {
                        setResistance(e.target.value);
                        setTimeout(() => calculateBasic('resistance'), 0);
                      }}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-yellow-400 focus:outline-none"
                      placeholder="Enter resistance"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Power (W)
                    </label>
                    <input
                      type="number"
                      value={power}
                      onChange={(e) => {
                        setPower(e.target.value);
                        setTimeout(() => calculateBasic('power'), 0);
                      }}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:border-yellow-400 focus:outline-none"
                      placeholder="Enter power"
                    />
                  </div>
                </div>
                <button
                  onClick={clearBasic}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 rounded transition-colors"
                >
                  Clear All
                </button>
              </div>
            )}

            {activeTab === 'series' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                  <p className="text-sm text-blue-800 font-semibold">
                    Series Circuit: Current is constant across all components
                  </p>
                </div>
                
                {seriesComponents.map((comp, index) => (
                  <div key={comp.id} className="bg-gray-50 p-4 rounded border-2 border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-gray-700">Component {index + 1}</h3>
                      {seriesComponents.length > 1 && (
                        <button
                          onClick={() => removeSeriesComponent(comp.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">R (Ω)</label>
                        <input
                          type="number"
                          value={comp.R}
                          onChange={(e) => updateSeriesComponent(comp.id, 'R', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:border-yellow-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">V (V)</label>
                        <input
                          type="number"
                          value={comp.V}
                          onChange={(e) => updateSeriesComponent(comp.id, 'V', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:border-yellow-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">I (A)</label>
                        <input
                          type="number"
                          value={comp.I}
                          onChange={(e) => updateSeriesComponent(comp.id, 'I', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:border-yellow-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">P (W)</label>
                        <input
                          type="number"
                          value={comp.P}
                          onChange={(e) => updateSeriesComponent(comp.id, 'P', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:border-yellow-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addSeriesComponent}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Component
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={calculateSeries}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <Calculator className="w-5 h-5" />
                    Calculate
                  </button>
                  <button
                    onClick={clearSeries}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="bg-green-50 border-2 border-green-500 p-4 rounded">
                  <h3 className="font-bold text-green-800 mb-2">Circuit Totals</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="font-semibold">Total R:</span>
                      <p className="text-lg font-bold text-green-700">{getTotalsSeries().totalR.toFixed(3)} Ω</p>
                    </div>
                    <div>
                      <span className="font-semibold">Total V:</span>
                      <p className="text-lg font-bold text-green-700">{getTotalsSeries().totalV.toFixed(3)} V</p>
                    </div>
                    <div>
                      <span className="font-semibold">Current:</span>
                      <p className="text-lg font-bold text-green-700">{getTotalsSeries().totalI.toFixed(3)} A</p>
                    </div>
                    <div>
                      <span className="font-semibold">Total P:</span>
                      <p className="text-lg font-bold text-green-700">{getTotalsSeries().totalP.toFixed(3)} W</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'parallel' && (
              <div className="space-y-4">
                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-4">
                  <p className="text-sm text-purple-800 font-semibold">
                    Parallel Circuit: Voltage is constant across all components
                  </p>
                </div>
                
                {parallelComponents.map((comp, index) => (
                  <div key={comp.id} className="bg-gray-50 p-4 rounded border-2 border-gray-200">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-bold text-gray-700">Component {index + 1}</h3>
                      {parallelComponents.length > 1 && (
                        <button
                          onClick={() => removeParallelComponent(comp.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">R (Ω)</label>
                        <input
                          type="number"
                          value={comp.R}
                          onChange={(e) => updateParallelComponent(comp.id, 'R', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:border-yellow-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">V (V)</label>
                        <input
                          type="number"
                          value={comp.V}
                          onChange={(e) => updateParallelComponent(comp.id, 'V', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:border-yellow-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">I (A)</label>
                        <input
                          type="number"
                          value={comp.I}
                          onChange={(e) => updateParallelComponent(comp.id, 'I', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:border-yellow-400 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1">P (W)</label>
                        <input
                          type="number"
                          value={comp.P}
                          onChange={(e) => updateParallelComponent(comp.id, 'P', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:border-yellow-400 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addParallelComponent}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add Component
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={calculateParallel}
                    className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 rounded transition-colors flex items-center justify-center gap-2"
                  >
                    <Calculator className="w-5 h-5" />
                    Calculate
                  </button>
                  <button
                    onClick={clearParallel}
                    className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="bg-green-50 border-2 border-green-500 p-4 rounded">
                  <h3 className="font-bold text-green-800 mb-2">Circuit Totals</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <span className="font-semibold">Total R:</span>
                      <p className="text-lg font-bold text-green-700">{getTotalsParallel().totalR.toFixed(3)} Ω</p>
                    </div>
                    <div>
                      <span className="font-semibold">Voltage:</span>
                      <p className="text-lg font-bold text-green-700">{getTotalsParallel().totalV.toFixed(3)} V</p>
                    </div>
                    <div>
                      <span className="font-semibold">Total I:</span>
                      <p className="text-lg font-bold text-green-700">{getTotalsParallel().totalI.toFixed(3)} A</p>
                    </div>
                    <div>
                      <span className="font-semibold">Total P:</span>
                      <p className="text-lg font-bold text-green-700">{getTotalsParallel().totalP.toFixed(3)} W</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{ background: '#1e293b', color: '#cbd5e1', padding: '1.5rem', borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem', fontSize: '0.875rem' }}>
          <p className="font-semibold mb-2">Formulas:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <p>V = I × R</p>
            <p>P = V × I</p>
            <p>I = V ÷ R</p>
            <p>P = I² × R</p>
            <p>R = V ÷ I</p>
            <p>P = V² ÷ R</p>
          </div>
        </div>
      </div>
  );
};

export default OhmsLawCalculator;
