import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, X, Info, Circle, Calculator } from 'lucide-react';

const Chapter9 = ({ isDarkMode, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConduitType, setSelectedConduitType] = useState('emt');
  const [showInfo, setShowInfo] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Calculator state
  const [conduitSize, setConduitSize] = useState('');
  const [wireSize, setWireSize] = useState('');
  const [wireType, setWireType] = useState('THHN');

  const colors = {
    bg: isDarkMode ? '#121212' : '#f9fafb',
    cardBg: isDarkMode ? '#1e1e1e' : '#ffffff',
    text: isDarkMode ? '#e5e5e5' : '#111827',
    subtext: isDarkMode ? '#a3a3a3' : '#6b7280',
    border: isDarkMode ? '#2a2a2a' : '#e5e7eb',
    inputBg: isDarkMode ? '#2a2a2a' : '#f3f4f6',
    accent: '#10b981',
    accentLight: '#10b98115'
  };

  // Conduit dimensions (40% fill for 3+ conductors)
  const conduitData = {
    emt: [
      { size: '½', area100: 0.304, area60: 0.182, area53: 0.161, area40: 0.122, area1: 0.122 },
      { size: '¾', area100: 0.533, area60: 0.320, area53: 0.282, area40: 0.213, area1: 0.213 },
      { size: '1', area100: 0.864, area60: 0.518, area53: 0.458, area40: 0.346, area1: 0.346 },
      { size: '1¼', area100: 1.496, area60: 0.898, area53: 0.793, area40: 0.598, area1: 0.598 },
      { size: '1½', area100: 2.036, area60: 1.222, area53: 1.079, area40: 0.814, area1: 0.814 },
      { size: '2', area100: 3.356, area60: 2.013, area53: 1.778, area40: 1.342, area1: 1.342 },
      { size: '2½', area100: 5.858, area60: 3.515, area53: 3.105, area40: 2.343, area1: 2.343 },
      { size: '3', area100: 8.846, area60: 5.307, area53: 4.688, area40: 3.538, area1: 3.538 },
      { size: '3½', area100: 11.545, area60: 6.927, area53: 6.119, area40: 4.618, area1: 4.618 },
      { size: '4', area100: 14.753, area60: 8.852, area53: 7.819, area40: 5.901, area1: 5.901 }
    ],
    imc: [
      { size: '½', area100: 0.342, area60: 0.205, area53: 0.181, area40: 0.137, area1: 0.137 },
      { size: '¾', area100: 0.586, area60: 0.352, area53: 0.311, area40: 0.234, area1: 0.234 },
      { size: '1', area100: 0.959, area60: 0.575, area53: 0.508, area40: 0.384, area1: 0.384 },
      { size: '1¼', area100: 1.647, area60: 0.988, area53: 0.873, area40: 0.659, area1: 0.659 },
      { size: '1½', area100: 2.225, area60: 1.335, area53: 1.179, area40: 0.890, area1: 0.890 },
      { size: '2', area100: 3.630, area60: 2.178, area53: 1.924, area40: 1.452, area1: 1.452 },
      { size: '2½', area100: 6.316, area60: 3.790, area53: 3.347, area40: 2.526, area1: 2.526 },
      { size: '3', area100: 9.543, area60: 5.726, area53: 5.058, area40: 3.817, area1: 3.817 },
      { size: '3½', area100: 12.388, area60: 7.433, area53: 6.566, area40: 4.955, area1: 4.955 },
      { size: '4', area100: 15.885, area60: 9.531, area53: 8.419, area40: 6.354, area1: 6.354 }
    ],
    rmc: [
      { size: '½', area100: 0.314, area60: 0.188, area53: 0.166, area40: 0.125, area1: 0.125 },
      { size: '¾', area100: 0.549, area60: 0.329, area53: 0.291, area40: 0.220, area1: 0.220 },
      { size: '1', area100: 0.901, area60: 0.541, area53: 0.478, area40: 0.361, area1: 0.361 },
      { size: '1¼', area100: 1.560, area60: 0.936, area53: 0.827, area40: 0.624, area1: 0.624 },
      { size: '1½', area100: 2.071, area60: 1.243, area53: 1.098, area40: 0.829, area1: 0.829 },
      { size: '2', area100: 3.408, area60: 2.045, area53: 1.806, area40: 1.363, area1: 1.363 },
      { size: '2½', area100: 5.793, area60: 3.476, area53: 3.070, area40: 2.317, area1: 2.317 },
      { size: '3', area100: 8.688, area60: 5.213, area53: 4.605, area40: 3.475, area1: 3.475 },
      { size: '3½', area100: 11.234, area60: 6.740, area53: 5.954, area40: 4.494, area1: 4.494 },
      { size: '4', area100: 14.314, area60: 8.588, area53: 7.586, area40: 5.726, area1: 5.726 }
    ],
    pvc40: [
      { size: '½', area100: 0.285, area60: 0.171, area53: 0.151, area40: 0.114, area1: 0.114 },
      { size: '¾', area100: 0.508, area60: 0.305, area53: 0.269, area40: 0.203, area1: 0.203 },
      { size: '1', area100: 0.832, area60: 0.499, area53: 0.441, area40: 0.333, area1: 0.333 },
      { size: '1¼', area100: 1.453, area60: 0.872, area53: 0.770, area40: 0.581, area1: 0.581 },
      { size: '1½', area100: 1.986, area60: 1.192, area53: 1.053, area40: 0.794, area1: 0.794 },
      { size: '2', area100: 3.269, area60: 1.961, area53: 1.732, area40: 1.308, area1: 1.308 },
      { size: '2½', area100: 5.490, area60: 3.294, area53: 2.910, area40: 2.196, area1: 2.196 },
      { size: '3', area100: 8.221, area60: 4.933, area53: 4.357, area40: 3.288, area1: 3.288 },
      { size: '3½', area100: 10.694, area60: 6.416, area53: 5.668, area40: 4.278, area1: 4.278 },
      { size: '4', area100: 13.723, area60: 8.234, area53: 7.273, area40: 5.489, area1: 5.489 }
    ],
    pvc80: [
      { size: '½', area100: 0.217, area60: 0.130, area53: 0.115, area40: 0.087, area1: 0.087 },
      { size: '¾', area100: 0.408, area60: 0.245, area53: 0.216, area40: 0.163, area1: 0.163 },
      { size: '1', area100: 0.688, area60: 0.413, area53: 0.365, area40: 0.275, area1: 0.275 },
      { size: '1¼', area100: 1.221, area60: 0.733, area53: 0.647, area40: 0.488, area1: 0.488 },
      { size: '1½', area100: 1.711, area60: 1.027, area53: 0.907, area40: 0.684, area1: 0.684 },
      { size: '2', area100: 2.874, area60: 1.724, area53: 1.523, area40: 1.150, area1: 1.150 },
      { size: '2½', area100: 4.618, area60: 2.771, area53: 2.448, area40: 1.847, area1: 1.847 },
      { size: '3', area100: 6.905, area60: 4.143, area53: 3.660, area40: 2.762, area1: 2.762 },
      { size: '3½', area100: 8.978, area60: 5.387, area53: 4.758, area40: 3.591, area1: 3.591 },
      { size: '4', area100: 11.545, area60: 6.927, area53: 6.119, area40: 4.618, area1: 4.618 }
    ]
  };

  // Wire dimensions (THHN/THWN)
  const wireData = {
    THHN: [
      { size: '14', area: 0.0097 },
      { size: '12', area: 0.0133 },
      { size: '10', area: 0.0211 },
      { size: '8', area: 0.0366 },
      { size: '6', area: 0.0507 },
      { size: '4', area: 0.0824 },
      { size: '3', area: 0.0973 },
      { size: '2', area: 0.1158 },
      { size: '1', area: 0.1562 },
      { size: '1/0', area: 0.1855 },
      { size: '2/0', area: 0.2223 },
      { size: '3/0', area: 0.2679 },
      { size: '4/0', area: 0.3237 },
      { size: '250', area: 0.3970 },
      { size: '300', area: 0.4608 },
      { size: '350', area: 0.5242 },
      { size: '400', area: 0.5863 },
      { size: '500', area: 0.7073 },
      { size: '600', area: 0.8676 },
      { size: '700', area: 0.9887 },
      { size: '750', area: 1.0496 }
    ],
    THWN: [
      { size: '14', area: 0.0097 },
      { size: '12', area: 0.0133 },
      { size: '10', area: 0.0211 },
      { size: '8', area: 0.0366 },
      { size: '6', area: 0.0507 },
      { size: '4', area: 0.0824 },
      { size: '3', area: 0.0973 },
      { size: '2', area: 0.1158 },
      { size: '1', area: 0.1562 },
      { size: '1/0', area: 0.1855 },
      { size: '2/0', area: 0.2223 },
      { size: '3/0', area: 0.2679 },
      { size: '4/0', area: 0.3237 }
    ],
    XHHW: [
      { size: '14', area: 0.0139 },
      { size: '12', area: 0.0181 },
      { size: '10', area: 0.0260 },
      { size: '8', area: 0.0437 },
      { size: '6', area: 0.0590 },
      { size: '4', area: 0.0973 },
      { size: '3', area: 0.1134 },
      { size: '2', area: 0.1333 },
      { size: '1', area: 0.1901 },
      { size: '1/0', area: 0.2290 },
      { size: '2/0', area: 0.2733 },
      { size: '3/0', area: 0.3288 },
      { size: '4/0', area: 0.3964 }
    ]
  };

  const conduitTypes = {
    emt: 'EMT',
    imc: 'IMC',
    rmc: 'RMC (Rigid)',
    pvc40: 'PVC Schedule 40',
    pvc80: 'PVC Schedule 80'
  };

  const filteredConduits = useMemo(() => {
    return conduitData[selectedConduitType].filter(conduit => {
      return conduit.size.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [searchTerm, selectedConduitType]);

  const calculateFill = () => {
    if (!conduitSize || !wireSize) return null;

    const conduit = conduitData[selectedConduitType].find(c => c.size === conduitSize);
    const wire = wireData[wireType].find(w => w.size === wireSize);

    if (!conduit || !wire) return null;

    const maxWires = Math.floor(conduit.area40 / wire.area);
    const actualFill = (maxWires * wire.area / conduit.area100) * 100;

    return {
      conduitSize: conduit.size,
      wireSize: wire.size,
      wireType,
      maxWires,
      actualFill: actualFill.toFixed(1),
      conduitArea: conduit.area40,
      wireArea: wire.area
    };
  };

  const calculation = calculateFill();

  return (
    <div style={{
      background: colors.bg,
      minHeight: '100vh',
      paddingBottom: '2rem'
    }}>
      {/* Header */}
      <div style={{
        background: colors.accent,
        padding: '1rem',
        paddingTop: 'calc(1rem + env(safe-area-inset-top))',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1rem'
        }}>
          <button
            onClick={onBack}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <h2 style={{ 
              margin: 0, 
              color: 'white',
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              Chapter 9, Table 1
            </h2>
            <p style={{
              margin: 0,
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.875rem',
              marginTop: '0.125rem'
            }}>
              Conduit Fill Requirements
            </p>
          </div>
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            style={{
              background: showCalculator ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <Calculator size={20} />
          </button>
          <button
            onClick={() => setShowInfo(!showInfo)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <Info size={20} />
          </button>
        </div>

        {/* Search */}
        <div style={{
          position: 'relative',
          marginBottom: '1rem'
        }}>
          <Search 
            size={18} 
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: colors.subtext
            }}
          />
          <input
            type="text"
            placeholder="Search conduit size..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem 2.5rem',
              paddingLeft: '2.5rem',
              border: 'none',
              borderRadius: '0.5rem',
              background: 'rgba(255,255,255,0.95)',
              fontSize: '0.9375rem',
              color: colors.text,
              boxSizing: 'border-box'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                color: colors.subtext
              }}
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Conduit Type Selector */}
        <div style={{
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '0.5rem',
          padding: '0.5rem'
        }}>
          <div style={{
            fontSize: '0.6875rem',
            color: colors.subtext,
            marginBottom: '0.375rem',
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Conduit Type
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.375rem' }}>
            {Object.entries(conduitTypes).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setSelectedConduitType(key)}
                style={{
                  padding: '0.5rem 0.25rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  background: selectedConduitType === key ? colors.accent : colors.inputBg,
                  color: selectedConduitType === key ? 'white' : colors.text,
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Calculator */}
      {showCalculator && (
        <div style={{
          background: colors.cardBg,
          border: `2px solid ${colors.accent}`,
          borderRadius: '0.75rem',
          padding: '1rem',
          margin: '1rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ 
            margin: '0 0 1rem 0', 
            fontSize: '1rem', 
            color: colors.accent,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Calculator size={18} />
            Wire Fill Calculator
          </h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: '600',
              color: colors.text,
              marginBottom: '0.5rem'
            }}>
              Conduit Size
            </label>
            <select
              value={conduitSize}
              onChange={(e) => setConduitSize(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                background: colors.inputBg,
                color: colors.text,
                fontSize: '0.9375rem',
                cursor: 'pointer'
              }}
            >
              <option value="">Select conduit size...</option>
              {conduitData[selectedConduitType].map(c => (
                <option key={c.size} value={c.size}>{c.size}" {conduitTypes[selectedConduitType]}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: '600',
              color: colors.text,
              marginBottom: '0.5rem'
            }}>
              Wire Type
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['THHN', 'THWN', 'XHHW'].map(type => (
                <button
                  key={type}
                  onClick={() => setWireType(type)}
                  style={{
                    flex: 1,
                    padding: '0.625rem',
                    border: 'none',
                    borderRadius: '0.5rem',
                    background: wireType === type ? colors.accent : colors.inputBg,
                    color: wireType === type ? 'white' : colors.text,
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: '600',
              color: colors.text,
              marginBottom: '0.5rem'
            }}>
              Wire Size
            </label>
            <select
              value={wireSize}
              onChange={(e) => setWireSize(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                background: colors.inputBg,
                color: colors.text,
                fontSize: '0.9375rem',
                cursor: 'pointer'
              }}
            >
              <option value="">Select wire size...</option>
              {wireData[wireType].map(w => (
                <option key={w.size} value={w.size}>{w.size} AWG</option>
              ))}
            </select>
          </div>

          {calculation && (
            <div style={{
              background: colors.accentLight,
              borderLeft: `3px solid ${colors.accent}`,
              padding: '1rem',
              borderRadius: '0.5rem'
            }}>
              <div style={{
                fontSize: '0.8125rem',
                color: colors.subtext,
                marginBottom: '0.5rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: '600'
              }}>
                Maximum Wire Fill
              </div>
              <div style={{
                fontSize: '2.5rem',
                fontWeight: '700',
                color: colors.accent,
                lineHeight: '1',
                marginBottom: '0.5rem'
              }}>
                {calculation.maxWires}
              </div>
              <div style={{
                fontSize: '0.8125rem',
                color: colors.subtext,
                lineHeight: '1.5'
              }}>
                {calculation.wireSize} AWG {calculation.wireType} conductors in {calculation.conduitSize}" {conduitTypes[selectedConduitType]}
                <br />
                <span style={{ color: colors.accent, fontWeight: '600' }}>
                  Fill: {calculation.actualFill}% (40% max for 3+ wires)
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Panel */}
      {showInfo && (
        <div style={{
          background: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.75rem',
          padding: '1rem',
          margin: '1rem',
          fontSize: '0.875rem',
          color: colors.text,
          lineHeight: '1.5'
        }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem', color: colors.accent }}>
            NEC Chapter 9, Table 1
          </h3>
          <p style={{ margin: '0 0 0.5rem 0', color: colors.subtext }}>
            Percent of cross section of conduit and tubing for conductors.
          </p>
          <div style={{
            background: colors.accentLight,
            borderLeft: `3px solid ${colors.accent}`,
            padding: '0.75rem',
            marginTop: '0.75rem',
            borderRadius: '0.25rem'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: colors.accent }}>
              Maximum Fill Percentages:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: colors.subtext, fontSize: '0.8125rem' }}>
              <li><strong>1 conductor:</strong> 53%</li>
              <li><strong>2 conductors:</strong> 31%</li>
              <li><strong>3+ conductors:</strong> 40%</li>
              <li>Equipment grounding conductors don't count toward fill</li>
            </ul>
          </div>
        </div>
      )}

      {/* Conduit Table */}
      <div style={{ padding: '0 1rem' }}>
        <div style={{
          background: colors.cardBg,
          borderRadius: '0.75rem',
          border: `1px solid ${colors.border}`,
          overflow: 'hidden'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.5fr',
            background: colors.accentLight,
            borderBottom: `1px solid ${colors.border}`,
            padding: '0.75rem 1rem',
            fontWeight: '600',
            fontSize: '0.875rem',
            color: colors.accent
          }}>
            <div>Size</div>
            <div style={{ textAlign: 'right' }}>40% Fill Area</div>
          </div>

          {/* Table Body */}
          <div>
            {filteredConduits.length > 0 ? (
              filteredConduits.map((conduit, index) => (
                <div
                  key={conduit.size}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.5fr',
                    padding: '0.875rem 1rem',
                    borderBottom: index < filteredConduits.length - 1 ? `1px solid ${colors.border}` : 'none',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = colors.inputBg}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div>
                    <div style={{
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      color: colors.text,
                      marginBottom: '0.125rem'
                    }}>
                      {conduit.size}"
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: colors.subtext
                    }}>
                      {conduitTypes[selectedConduitType]}
                    </div>
                  </div>
                  <div style={{ 
                    textAlign: 'right',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'flex-end'
                  }}>
                    <div style={{
                      fontSize: '1.125rem',
                      fontWeight: '700',
                      color: colors.accent,
                      lineHeight: '1'
                    }}>
                      {conduit.area40}
                    </div>
                    <div style={{
                      fontSize: '0.75rem',
                      color: colors.subtext,
                      marginTop: '0.125rem'
                    }}>
                      sq. in. (3+ wires)
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{
                padding: '3rem 1rem',
                textAlign: 'center',
                color: colors.subtext
              }}>
                <Search size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                <p style={{ margin: 0, fontSize: '0.875rem' }}>
                  No results found for "{searchTerm}"
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Result Count */}
        <div style={{
          textAlign: 'center',
          marginTop: '1rem',
          fontSize: '0.8125rem',
          color: colors.subtext
        }}>
          Showing {filteredConduits.length} of {conduitData[selectedConduitType].length} conduit sizes
        </div>
      </div>
    </div>
  );
};

export default Chapter9;