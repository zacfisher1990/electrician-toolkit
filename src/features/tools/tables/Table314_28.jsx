import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, X, Info, Ruler, Calculator } from 'lucide-react';

const Table314_28 = ({ isDarkMode, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('straight'); // 'straight' or 'angle'
  const [showInfo, setShowInfo] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  
  // Calculator state
  const [largestRaceway, setLargestRaceway] = useState('');
  const [multiplier, setMultiplier] = useState('8');

  const colors = {
    bg: isDarkMode ? '#121212' : '#f9fafb',
    cardBg: isDarkMode ? '#1e1e1e' : '#ffffff',
    text: isDarkMode ? '#e5e5e5' : '#111827',
    subtext: isDarkMode ? '#a3a3a3' : '#6b7280',
    border: isDarkMode ? '#2a2a2a' : '#e5e7eb',
    inputBg: isDarkMode ? '#2a2a2a' : '#f3f4f6',
    accent: '#8b5cf6',
    accentLight: '#8b5cf615'
  };

  // Pull box sizing requirements
  const pullBoxRules = [
    {
      type: 'Straight Pulls',
      rule: 'straight',
      description: 'Conductors entering and exiting on opposite sides',
      multiplier: '8×',
      calculation: 'Length must be at least 8 times the trade size of the largest raceway',
      example: '2" conduit requires minimum 16" length (2 × 8 = 16)',
      necRef: '314.28(A)(1)'
    },
    {
      type: 'Angle Pulls - Single Raceway',
      rule: 'angle',
      description: 'Conductors entering and exiting at 90° angle',
      multiplier: '6×',
      calculation: 'Distance from raceway entry to opposite wall must be at least 6 times the trade size of that raceway',
      example: '2" conduit requires minimum 12" distance (2 × 6 = 12)',
      necRef: '314.28(A)(2)'
    },
    {
      type: 'Angle Pulls - Multiple Raceways (Same Side)',
      rule: 'angle-multiple',
      description: 'Multiple raceways entering/exiting on same wall',
      multiplier: '6× largest + sum',
      calculation: 'Distance = (6 × largest raceway) + (sum of all other raceways on that side)',
      example: 'One 2" and two 1" conduits: (2 × 6) + 1 + 1 = 14"',
      necRef: '314.28(A)(2)'
    },
    {
      type: 'U Pulls',
      rule: 'u-pull',
      description: 'Conductors entering and exiting same side',
      multiplier: '6×',
      calculation: 'Distance must be at least 6 times the trade size of the largest raceway',
      example: '2" conduit requires minimum 12" distance (2 × 6 = 12)',
      necRef: '314.28(A)(2)'
    },
    {
      type: 'Removable Sides',
      rule: 'removable',
      description: 'Boxes with removable covers',
      multiplier: 'Length varies',
      calculation: 'The distance between each raceway entry and opposite wall shall not be less than 6 times the trade size of the largest raceway',
      example: 'See specific installation requirements',
      necRef: '314.28(A)(2) Exception'
    },
    {
      type: 'Smaller Raceways Spacing',
      rule: 'spacing',
      description: 'Spacing between raceways on same wall',
      multiplier: '6× each',
      calculation: 'Each row requires 6 times its largest raceway size',
      example: 'Two rows with 2" and 1½" conduits need separate calculations',
      necRef: '314.28(A)(2)'
    }
  ];

  // Common raceway sizes for calculator
  const racewayData = [
    { size: '½', decimal: 0.5, minStraight: 4, minAngle: 3 },
    { size: '¾', decimal: 0.75, minStraight: 6, minAngle: 4.5 },
    { size: '1', decimal: 1, minStraight: 8, minAngle: 6 },
    { size: '1¼', decimal: 1.25, minStraight: 10, minAngle: 7.5 },
    { size: '1½', decimal: 1.5, minStraight: 12, minAngle: 9 },
    { size: '2', decimal: 2, minStraight: 16, minAngle: 12 },
    { size: '2½', decimal: 2.5, minStraight: 20, minAngle: 15 },
    { size: '3', decimal: 3, minStraight: 24, minAngle: 18 },
    { size: '3½', decimal: 3.5, minStraight: 28, minAngle: 21 },
    { size: '4', decimal: 4, minStraight: 32, minAngle: 24 },
    { size: '5', decimal: 5, minStraight: 40, minAngle: 30 },
    { size: '6', decimal: 6, minStraight: 48, minAngle: 36 }
  ];

  const filteredRules = useMemo(() => {
    return pullBoxRules.filter(rule => {
      const matchesSearch = 
        rule.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (selectedType === 'straight') {
        return matchesSearch && rule.rule === 'straight';
      } else if (selectedType === 'angle') {
        return matchesSearch && rule.rule !== 'straight';
      }
      return matchesSearch;
    });
  }, [searchTerm, selectedType]);

  const calculatePullBox = () => {
    const raceway = racewayData.find(r => r.size === largestRaceway);
    if (!raceway) return null;

    const mult = parseInt(multiplier);
    const result = raceway.decimal * mult;
    return {
      racewaySize: raceway.size,
      multiplier: mult,
      minimumSize: result,
      recommendedSize: Math.ceil(result)
    };
  };

  const calculation = calculatePullBox();

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
              Table 314.28
            </h2>
            <p style={{
              margin: 0,
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.875rem',
              marginTop: '0.125rem'
            }}>
              Pull & Junction Box Sizing
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
            placeholder="Search pull box rules..."
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

        {/* Type Filter */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '0.5rem',
          padding: '0.25rem'
        }}>
          <button
            onClick={() => setSelectedType('straight')}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: '0.375rem',
              background: selectedType === 'straight' ? colors.accent : 'transparent',
              color: selectedType === 'straight' ? 'white' : colors.text,
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Straight Pulls
          </button>
          <button
            onClick={() => setSelectedType('angle')}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: '0.375rem',
              background: selectedType === 'angle' ? colors.accent : 'transparent',
              color: selectedType === 'angle' ? 'white' : colors.text,
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Angle & U Pulls
          </button>
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
            Quick Calculator
          </h3>
          
          <div style={{ marginBottom: '1rem' }}>
            <label style={{
              display: 'block',
              fontSize: '0.8125rem',
              fontWeight: '600',
              color: colors.text,
              marginBottom: '0.5rem'
            }}>
              Largest Raceway Size
            </label>
            <select
              value={largestRaceway}
              onChange={(e) => setLargestRaceway(e.target.value)}
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
              <option value="">Select raceway size...</option>
              {racewayData.map(r => (
                <option key={r.size} value={r.size}>{r.size}"</option>
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
              Multiplier
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setMultiplier('8')}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  background: multiplier === '8' ? colors.accent : colors.inputBg,
                  color: multiplier === '8' ? 'white' : colors.text,
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                8× (Straight)
              </button>
              <button
                onClick={() => setMultiplier('6')}
                style={{
                  flex: 1,
                  padding: '0.625rem',
                  border: 'none',
                  borderRadius: '0.5rem',
                  background: multiplier === '6' ? colors.accent : colors.inputBg,
                  color: multiplier === '6' ? 'white' : colors.text,
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                6× (Angle)
              </button>
            </div>
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
                Minimum Pull Box Size
              </div>
              <div style={{
                fontSize: '2rem',
                fontWeight: '700',
                color: colors.accent,
                lineHeight: '1',
                marginBottom: '0.5rem'
              }}>
                {calculation.minimumSize}"
              </div>
              <div style={{
                fontSize: '0.8125rem',
                color: colors.subtext,
                lineHeight: '1.5'
              }}>
                {calculation.racewaySize}" raceway × {calculation.multiplier} = {calculation.minimumSize}" minimum
                <br />
                <span style={{ color: colors.accent, fontWeight: '600' }}>
                  Recommended: Use {calculation.recommendedSize}" box or larger
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
            NEC Section 314.28
          </h3>
          <p style={{ margin: '0 0 0.5rem 0', color: colors.subtext }}>
            Minimum size requirements for pull boxes, junction boxes, and conduit bodies containing 
            conductors 4 AWG or larger.
          </p>
          <div style={{
            background: colors.accentLight,
            borderLeft: `3px solid ${colors.accent}`,
            padding: '0.75rem',
            marginTop: '0.75rem',
            borderRadius: '0.25rem'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: colors.accent }}>
              Key Requirements:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: colors.subtext, fontSize: '0.8125rem' }}>
              <li><strong>Straight pulls:</strong> 8× largest raceway diameter</li>
              <li><strong>Angle pulls:</strong> 6× largest raceway diameter (minimum)</li>
              <li><strong>Multiple raceways:</strong> Additional spacing requirements apply</li>
              <li>Measurements are trade size, not actual diameter</li>
            </ul>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div style={{ padding: '0 1rem' }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {filteredRules.length > 0 ? (
            filteredRules.map((rule, index) => (
              <div
                key={index}
                style={{
                  background: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  marginBottom: '0.75rem'
                }}>
                  <div style={{
                    minWidth: '40px',
                    height: '40px',
                    borderRadius: '0.75rem',
                    background: colors.accentLight,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Ruler size={20} color={colors.accent} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{
                      margin: '0 0 0.25rem 0',
                      fontSize: '0.9375rem',
                      fontWeight: '600',
                      color: colors.text
                    }}>
                      {rule.type}
                    </h4>
                    <p style={{
                      margin: '0',
                      fontSize: '0.8125rem',
                      color: colors.subtext,
                      lineHeight: '1.4'
                    }}>
                      {rule.description}
                    </p>
                  </div>
                  <div style={{
                    background: colors.accentLight,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.375rem',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: colors.accent,
                    whiteSpace: 'nowrap'
                  }}>
                    {rule.multiplier}
                  </div>
                </div>

                <div style={{
                  background: colors.inputBg,
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: colors.text,
                    marginBottom: '0.375rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Calculation
                  </div>
                  <div style={{
                    fontSize: '0.8125rem',
                    color: colors.subtext,
                    lineHeight: '1.5'
                  }}>
                    {rule.calculation}
                  </div>
                </div>

                <div style={{
                  background: colors.accentLight,
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: colors.accent,
                    marginBottom: '0.375rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Example
                  </div>
                  <div style={{
                    fontSize: '0.8125rem',
                    color: colors.subtext,
                    lineHeight: '1.5'
                  }}>
                    {rule.example}
                  </div>
                </div>

                <div style={{
                  fontSize: '0.75rem',
                  color: colors.subtext,
                  fontStyle: 'italic'
                }}>
                  NEC Reference: {rule.necRef}
                </div>
              </div>
            ))
          ) : (
            <div style={{
              padding: '3rem 1rem',
              textAlign: 'center',
              color: colors.subtext,
              background: colors.cardBg,
              borderRadius: '0.75rem',
              border: `1px solid ${colors.border}`
            }}>
              <Search size={40} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
              <p style={{ margin: 0, fontSize: '0.875rem' }}>
                No results found for "{searchTerm}"
              </p>
            </div>
          )}
        </div>

        {/* Result Count */}
        <div style={{
          textAlign: 'center',
          marginTop: '1rem',
          fontSize: '0.8125rem',
          color: colors.subtext
        }}>
          Showing {filteredRules.length} of {pullBoxRules.length} sizing rules
        </div>
      </div>
    </div>
  );
};

export default Table314_28;