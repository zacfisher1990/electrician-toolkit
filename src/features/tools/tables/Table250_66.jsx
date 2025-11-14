import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, X, Info, Globe } from 'lucide-react';

const Table250_66 = ({ isDarkMode, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('copper');
  const [showInfo, setShowInfo] = useState(false);

  const colors = {
    bg: isDarkMode ? '#121212' : '#f9fafb',
    cardBg: isDarkMode ? '#1e1e1e' : '#ffffff',
    text: isDarkMode ? '#e5e5e5' : '#111827',
    subtext: isDarkMode ? '#a3a3a3' : '#6b7280',
    border: isDarkMode ? '#2a2a2a' : '#e5e7eb',
    inputBg: isDarkMode ? '#2a2a2a' : '#f3f4f6',
    accent: '#f59e0b',
    accentLight: '#f59e0b15'
  };

  // Grounding Electrode Conductor sizing data
  const groundingData = [
    // Copper service conductors
    { serviceCu: '2 or smaller', serviceAl: '1/0 or smaller', groundCu: '8', groundAl: '6' },
    { serviceCu: '1 or 1/0', serviceAl: '2/0 or 3/0', groundCu: '6', groundAl: '4' },
    { serviceCu: '2/0 or 3/0', serviceAl: '4/0 or 250', groundCu: '4', groundAl: '2' },
    { serviceCu: '4/0 or 250', serviceAl: '300 or 350', groundCu: '2', groundAl: '1/0' },
    { serviceCu: '300 or 350', serviceAl: '400 or 500', groundCu: '1/0', groundAl: '3/0' },
    { serviceCu: '400 or 500', serviceAl: '600 or 750', groundCu: '2/0', groundAl: '4/0' },
    { serviceCu: '600 or 750', serviceAl: '800 or 1000', groundCu: '3/0', groundAl: '250' },
    { serviceCu: '800 or 1000', serviceAl: '1200 or 1500', groundCu: '4/0', groundAl: '350' },
    { serviceCu: '1100 or 1250', serviceAl: '1750 or 2000', groundCu: '250', groundAl: '400' },
    { serviceCu: '1300 or 1500', serviceAl: '—', groundCu: '350', groundAl: '500' },
    { serviceCu: '1600 or 1750', serviceAl: '—', groundCu: '400', groundAl: '600' },
    { serviceCu: '2000', serviceAl: '—', groundCu: '500', groundAl: '750' }
  ];

  const filteredData = useMemo(() => {
    return groundingData.filter(row => {
      const searchLower = searchTerm.toLowerCase();
      const serviceCol = selectedMaterial === 'copper' ? row.serviceCu : row.serviceAl;
      const groundCol = selectedMaterial === 'copper' ? row.groundCu : row.groundAl;
      
      return serviceCol.toLowerCase().includes(searchLower) ||
             groundCol.toLowerCase().includes(searchLower);
    });
  }, [searchTerm, selectedMaterial]);

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
              Table 250.66
            </h2>
            <p style={{
              margin: 0,
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.875rem',
              marginTop: '0.125rem'
            }}>
              Grounding Electrode Conductor
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
            placeholder="Search conductor size..."
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

        {/* Material Selector */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '0.5rem',
          padding: '0.25rem'
        }}>
          <button
            onClick={() => setSelectedMaterial('copper')}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: '0.375rem',
              background: selectedMaterial === 'copper' ? colors.accent : 'transparent',
              color: selectedMaterial === 'copper' ? 'white' : colors.text,
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Copper Service
          </button>
          <button
            onClick={() => setSelectedMaterial('aluminum')}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: '0.375rem',
              background: selectedMaterial === 'aluminum' ? colors.accent : 'transparent',
              color: selectedMaterial === 'aluminum' ? 'white' : colors.text,
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Aluminum Service
          </button>
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
            NEC Table 250.66
          </h3>
          <p style={{ margin: '0 0 0.5rem 0', color: colors.subtext }}>
            Grounding Electrode Conductor for Alternating-Current Systems. This table determines 
            the minimum size of the grounding electrode conductor based on the size of the largest 
            ungrounded service-entrance conductor or equivalent area for parallel conductors.
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
              <li>Where multiple sets of service-entrance conductors are used in parallel, use the equivalent area</li>
              <li>For sole connection to rod, pipe, or plate electrode, conductor need not be larger than 6 AWG copper or 4 AWG aluminum</li>
              <li>For sole connection to concrete-encased electrode, conductor need not be larger than 4 AWG copper</li>
              <li>Bonding jumper on supply side not required to be larger than largest ungrounded conductor</li>
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
            gridTemplateColumns: '1.2fr 1fr',
            background: colors.accentLight,
            borderBottom: `1px solid ${colors.border}`,
            padding: '0.75rem 1rem',
            fontWeight: '600',
            fontSize: '0.875rem',
            color: colors.accent
          }}>
            <div>
              {selectedMaterial === 'copper' ? 'Copper Service' : 'Aluminum Service'}
              <div style={{
                fontSize: '0.6875rem',
                fontWeight: '500',
                marginTop: '0.125rem',
                opacity: 0.8
              }}>
                Largest Conductor Size
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              Grounding Conductor
              <div style={{
                fontSize: '0.6875rem',
                fontWeight: '500',
                marginTop: '0.125rem',
                opacity: 0.8
              }}>
                {selectedMaterial === 'copper' ? 'Copper' : 'Aluminum'}
              </div>
            </div>
          </div>

          {/* Table Body */}
          <div>
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => {
                const serviceSize = selectedMaterial === 'copper' ? row.serviceCu : row.serviceAl;
                const groundSize = selectedMaterial === 'copper' ? row.groundCu : row.groundAl;
                
                if (serviceSize === '—') return null;
                
                return (
                  <div
                    key={index}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.2fr 1fr',
                      padding: '1rem',
                      borderBottom: index < filteredData.length - 1 ? `1px solid ${colors.border}` : 'none',
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
                        marginBottom: '0.25rem'
                      }}>
                        {serviceSize} AWG
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: colors.subtext
                      }}>
                        Service entrance conductor
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
                        fontSize: '1.5rem',
                        fontWeight: '700',
                        color: colors.accent,
                        lineHeight: '1',
                        marginBottom: '0.25rem'
                      }}>
                        {groundSize}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: colors.subtext
                      }}>
                        AWG minimum
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
          Showing {filteredData.filter(r => (selectedMaterial === 'copper' ? r.serviceCu : r.serviceAl) !== '—').length} conductor size ranges
        </div>

        {/* Quick Reference Card */}
        <div style={{
          background: colors.cardBg,
          border: `1px solid ${colors.border}`,
          borderRadius: '0.75rem',
          padding: '1rem',
          marginTop: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem'
          }}>
            <Globe size={18} color={colors.accent} />
            <h3 style={{ 
              margin: 0, 
              fontSize: '0.9375rem',
              fontWeight: '600',
              color: colors.text
            }}>
              Special Conditions
            </h3>
          </div>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{
              background: colors.inputBg,
              padding: '0.75rem',
              borderRadius: '0.5rem'
            }}>
              <div style={{
                fontSize: '0.8125rem',
                fontWeight: '600',
                color: colors.text,
                marginBottom: '0.25rem'
              }}>
                Rod, Pipe, or Plate Electrode
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: colors.subtext,
                lineHeight: '1.4'
              }}>
                Maximum required: <span style={{ fontWeight: '600', color: colors.accent }}>6 AWG copper</span> or <span style={{ fontWeight: '600', color: colors.accent }}>4 AWG aluminum</span>
              </div>
            </div>

            <div style={{
              background: colors.inputBg,
              padding: '0.75rem',
              borderRadius: '0.5rem'
            }}>
              <div style={{
                fontSize: '0.8125rem',
                fontWeight: '600',
                color: colors.text,
                marginBottom: '0.25rem'
              }}>
                Concrete-Encased Electrode
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: colors.subtext,
                lineHeight: '1.4'
              }}>
                Maximum required: <span style={{ fontWeight: '600', color: colors.accent }}>4 AWG copper</span>
              </div>
            </div>

            <div style={{
              background: colors.inputBg,
              padding: '0.75rem',
              borderRadius: '0.5rem'
            }}>
              <div style={{
                fontSize: '0.8125rem',
                fontWeight: '600',
                color: colors.text,
                marginBottom: '0.25rem'
              }}>
                Parallel Service Conductors
              </div>
              <div style={{
                fontSize: '0.75rem',
                color: colors.subtext,
                lineHeight: '1.4'
              }}>
                Calculate based on equivalent area of parallel conductors per phase
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Table250_66;