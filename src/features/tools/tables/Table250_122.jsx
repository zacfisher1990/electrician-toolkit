import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, X, Info, Zap, AlertTriangle } from 'lucide-react';

const Table250_122 = ({ isDarkMode, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showInfo, setShowInfo] = useState(false);

  const colors = {
    bg: isDarkMode ? '#121212' : '#f9fafb',
    cardBg: isDarkMode ? '#1e1e1e' : '#ffffff',
    text: isDarkMode ? '#e5e5e5' : '#111827',
    subtext: isDarkMode ? '#a3a3a3' : '#6b7280',
    border: isDarkMode ? '#2a2a2a' : '#e5e7eb',
    inputBg: isDarkMode ? '#2a2a2a' : '#f3f4f6',
    accent: '#f59e0b',
    accentLight: '#f59e0b15',
    warning: '#ef4444',
    warningLight: '#ef444415'
  };

  // Equipment Grounding Conductor sizing data
  const equipmentGroundingData = [
    { rating: '15', copper: '14', aluminum: '12' },
    { rating: '20', copper: '12', aluminum: '10' },
    { rating: '30', copper: '10', aluminum: '8' },
    { rating: '40', copper: '10', aluminum: '8' },
    { rating: '60', copper: '10', aluminum: '8' },
    { rating: '100', copper: '8', aluminum: '6' },
    { rating: '200', copper: '6', aluminum: '4' },
    { rating: '300', copper: '4', aluminum: '2' },
    { rating: '400', copper: '3', aluminum: '1' },
    { rating: '500', copper: '2', aluminum: '1/0' },
    { rating: '600', copper: '1', aluminum: '2/0' },
    { rating: '800', copper: '1/0', aluminum: '3/0' },
    { rating: '1000', copper: '2/0', aluminum: '4/0' },
    { rating: '1200', copper: '3/0', aluminum: '250' },
    { rating: '1600', copper: '4/0', aluminum: '350' },
    { rating: '2000', copper: '250', aluminum: '400' },
    { rating: '2500', copper: '350', aluminum: '600' },
    { rating: '3000', copper: '400', aluminum: '600' },
    { rating: '4000', copper: '500', aluminum: '800' },
    { rating: '5000', copper: '700', aluminum: '1200' },
    { rating: '6000', copper: '800', aluminum: '1200' }
  ];

  const filteredData = useMemo(() => {
    return equipmentGroundingData.filter(row => {
      const searchLower = searchTerm.toLowerCase();
      return row.rating.includes(searchLower) ||
             row.copper.toLowerCase().includes(searchLower) ||
             row.aluminum.toLowerCase().includes(searchLower);
    });
  }, [searchTerm]);

  // Helper to determine if a rating is common/residential
  const isCommonRating = (rating) => {
    const common = ['15', '20', '30', '40', '50', '60', '100', '200'];
    return common.includes(rating);
  };

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
              Table 250.122
            </h2>
            <p style={{
              margin: 0,
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.875rem',
              marginTop: '0.125rem'
            }}>
              Equipment Grounding Conductor
            </p>
          </div>
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
          position: 'relative'
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
            placeholder="Search rating or wire size..."
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
      </div>

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
            NEC Table 250.122
          </h3>
          <p style={{ margin: '0 0 0.5rem 0', color: colors.subtext }}>
            Minimum Size Equipment Grounding Conductors for Grounding Raceway and Equipment. 
            This table shows the minimum size of equipment grounding conductor based on the 
            rating of the automatic overcurrent device ahead of the equipment.
          </p>
          <div style={{
            background: colors.accentLight,
            borderLeft: `3px solid ${colors.accent}`,
            padding: '0.75rem',
            marginTop: '0.75rem',
            borderRadius: '0.25rem'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: colors.accent }}>
              Important Notes:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: colors.subtext, fontSize: '0.8125rem' }}>
              <li>Equipment grounding conductor shall not be required to be larger than circuit conductors</li>
              <li>If only ungrounded conductors are increased in size, increase grounding conductor proportionally</li>
              <li>Multiple circuits run in same raceway may share a single equipment grounding conductor sized for largest breaker</li>
              <li>Aluminum conductors must comply with minimum sizing requirements</li>
            </ul>
          </div>
        </div>
      )}

      {/* Table */}
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
            gridTemplateColumns: '1fr 1fr 1fr',
            background: colors.accentLight,
            borderBottom: `1px solid ${colors.border}`,
            padding: '0.75rem 1rem',
            fontWeight: '600',
            fontSize: '0.875rem',
            color: colors.accent
          }}>
            <div>
              Breaker Rating
              <div style={{
                fontSize: '0.6875rem',
                fontWeight: '500',
                marginTop: '0.125rem',
                opacity: 0.8
              }}>
                Amperes
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              Copper
              <div style={{
                fontSize: '0.6875rem',
                fontWeight: '500',
                marginTop: '0.125rem',
                opacity: 0.8
              }}>
                AWG
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              Aluminum
              <div style={{
                fontSize: '0.6875rem',
                fontWeight: '500',
                marginTop: '0.125rem',
                opacity: 0.8
              }}>
                AWG
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div>
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => {
                const isCommon = isCommonRating(row.rating);
                
                return (
                  <div
                    key={row.rating}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr 1fr',
                      padding: '1rem',
                      borderBottom: index < filteredData.length - 1 ? `1px solid ${colors.border}` : 'none',
                      transition: 'background 0.2s',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = colors.inputBg}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {isCommon && (
                      <div style={{
                        position: 'absolute',
                        top: '0.5rem',
                        left: '0.5rem',
                        background: colors.accent,
                        color: 'white',
                        fontSize: '0.625rem',
                        padding: '0.125rem 0.375rem',
                        borderRadius: '0.25rem',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Common
                      </div>
                    )}
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center'
                    }}>
                      <div style={{
                        fontSize: '1.125rem',
                        fontWeight: '700',
                        color: colors.accent,
                        lineHeight: '1',
                        marginBottom: '0.25rem'
                      }}>
                        {row.rating}A
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: colors.subtext
                      }}>
                        Overcurrent device
                      </div>
                    </div>

                    <div style={{ 
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: colors.text,
                        lineHeight: '1',
                        marginBottom: '0.25rem'
                      }}>
                        {row.copper}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: colors.subtext
                      }}>
                        AWG
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
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: colors.text,
                        lineHeight: '1',
                        marginBottom: '0.25rem'
                      }}>
                        {row.aluminum}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: colors.subtext
                      }}>
                        AWG
                      </div>
                    </div>
                  </div>
                );
              })
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
          Showing {filteredData.length} of {equipmentGroundingData.length} breaker ratings
        </div>

        {/* Quick Reference Cards */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginTop: '1rem'
        }}>
          {/* Common Residential Sizes */}
          <div style={{
            background: colors.cardBg,
            border: `1px solid ${colors.border}`,
            borderRadius: '0.75rem',
            padding: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              <Zap size={18} color={colors.accent} />
              <h3 style={{ 
                margin: 0, 
                fontSize: '0.9375rem',
                fontWeight: '600',
                color: colors.text
              }}>
                Common Residential Circuits
              </h3>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '0.5rem'
            }}>
              <div style={{
                background: colors.inputBg,
                padding: '0.75rem',
                borderRadius: '0.5rem'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: colors.subtext,
                  marginBottom: '0.25rem'
                }}>
                  15A / 20A Circuits
                </div>
                <div style={{
                  fontSize: '0.9375rem',
                  fontWeight: '700',
                  color: colors.accent
                }}>
                  14 AWG Cu / 12 AWG Al
                </div>
              </div>

              <div style={{
                background: colors.inputBg,
                padding: '0.75rem',
                borderRadius: '0.5rem'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: colors.subtext,
                  marginBottom: '0.25rem'
                }}>
                  30A - 60A Circuits
                </div>
                <div style={{
                  fontSize: '0.9375rem',
                  fontWeight: '700',
                  color: colors.accent
                }}>
                  10 AWG Cu / 8 AWG Al
                </div>
              </div>

              <div style={{
                background: colors.inputBg,
                padding: '0.75rem',
                borderRadius: '0.5rem'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: colors.subtext,
                  marginBottom: '0.25rem'
                }}>
                  100A Panel
                </div>
                <div style={{
                  fontSize: '0.9375rem',
                  fontWeight: '700',
                  color: colors.accent
                }}>
                  8 AWG Cu / 6 AWG Al
                </div>
              </div>

              <div style={{
                background: colors.inputBg,
                padding: '0.75rem',
                borderRadius: '0.5rem'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: colors.subtext,
                  marginBottom: '0.25rem'
                }}>
                  200A Service
                </div>
                <div style={{
                  fontSize: '0.9375rem',
                  fontWeight: '700',
                  color: colors.accent
                }}>
                  6 AWG Cu / 4 AWG Al
                </div>
              </div>
            </div>
          </div>

          {/* Important Reminders */}
          <div style={{
            background: colors.cardBg,
            border: `2px solid ${colors.warning}`,
            borderRadius: '0.75rem',
            padding: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.75rem'
            }}>
              <AlertTriangle size={18} color={colors.warning} />
              <h3 style={{ 
                margin: 0, 
                fontSize: '0.9375rem',
                fontWeight: '600',
                color: colors.warning
              }}>
                Critical Requirements
              </h3>
            </div>
            
            <ul style={{
              margin: 0,
              paddingLeft: '1.25rem',
              color: colors.subtext,
              fontSize: '0.8125rem',
              lineHeight: '1.6'
            }}>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: colors.text }}>Size proportionally:</strong> If ungrounded conductors are increased in size for voltage drop, the equipment grounding conductor must be increased proportionally
              </li>
              <li style={{ marginBottom: '0.5rem' }}>
                <strong style={{ color: colors.text }}>Never smaller than:</strong> Equipment grounding conductor shall not be required to be larger than the circuit conductors supplying the equipment
              </li>
              <li>
                <strong style={{ color: colors.text }}>Multiple circuits:</strong> Single equipment grounding conductor may serve multiple circuits in same raceway if sized for the largest overcurrent device
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table250_122;