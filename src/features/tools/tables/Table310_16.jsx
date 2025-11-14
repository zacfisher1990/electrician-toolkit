import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, X, Info, Thermometer } from 'lucide-react';

const Table310_16 = ({ isDarkMode, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemp, setSelectedTemp] = useState('75');
  const [selectedInsulation, setSelectedInsulation] = useState('cu');
  const [showInfo, setShowInfo] = useState(false);

  const colors = {
    bg: isDarkMode ? '#121212' : '#f9fafb',
    cardBg: isDarkMode ? '#1e1e1e' : '#ffffff',
    text: isDarkMode ? '#e5e5e5' : '#111827',
    subtext: isDarkMode ? '#a3a3a3' : '#6b7280',
    border: isDarkMode ? '#2a2a2a' : '#e5e7eb',
    inputBg: isDarkMode ? '#2a2a2a' : '#f3f4f6',
    accent: '#3b82f6',
    accentLight: '#3b82f615'
  };

  // Comprehensive ampacity data for copper and aluminum conductors
  const ampacityData = [
    // Copper conductors
    { size: '14', cu60: 20, cu75: 20, cu90: 25, al60: null, al75: null, al90: null },
    { size: '12', cu60: 25, cu75: 25, cu90: 30, al60: 20, al75: 20, al90: 25 },
    { size: '10', cu60: 30, cu75: 35, cu90: 40, al60: 25, al75: 30, al90: 35 },
    { size: '8', cu60: 40, cu75: 50, cu90: 55, al60: 30, al75: 40, al90: 45 },
    { size: '6', cu60: 55, cu75: 65, cu90: 75, al60: 40, al75: 50, al90: 60 },
    { size: '4', cu60: 70, cu75: 85, cu90: 95, al60: 55, al75: 65, al90: 75 },
    { size: '3', cu60: 85, cu75: 100, cu90: 115, al60: 65, al75: 75, al90: 85 },
    { size: '2', cu60: 95, cu75: 115, cu90: 130, al60: 75, al75: 90, al90: 100 },
    { size: '1', cu60: 110, cu75: 130, cu90: 150, al60: 85, al75: 100, al90: 115 },
    { size: '1/0', cu60: 125, cu75: 150, cu90: 170, al60: 100, al75: 120, al90: 135 },
    { size: '2/0', cu60: 145, cu75: 175, cu90: 195, al60: 115, al75: 135, al90: 150 },
    { size: '3/0', cu60: 165, cu75: 200, cu90: 225, al60: 130, al75: 155, al90: 175 },
    { size: '4/0', cu60: 195, cu75: 230, cu90: 260, al60: 150, al75: 180, al90: 205 },
    { size: '250', cu60: 215, cu75: 255, cu90: 290, al60: 170, al75: 205, al90: 230 },
    { size: '300', cu60: 240, cu75: 285, cu90: 320, al60: 190, al75: 230, al90: 255 },
    { size: '350', cu60: 260, cu75: 310, cu90: 350, al60: 210, al75: 250, al90: 280 },
    { size: '400', cu60: 280, cu75: 335, cu90: 380, al60: 225, al75: 270, al90: 305 },
    { size: '500', cu60: 320, cu75: 380, cu90: 430, al60: 260, al75: 310, al90: 350 },
    { size: '600', cu60: 355, cu75: 420, cu90: 475, al60: 285, al75: 340, al90: 385 },
    { size: '700', cu60: 385, cu75: 460, cu90: 520, al60: 310, al75: 375, al90: 425 },
    { size: '750', cu60: 400, cu75: 475, cu90: 535, al60: 320, al75: 385, al90: 435 },
    { size: '800', cu60: 410, cu75: 490, cu90: 555, al60: 330, al75: 395, al90: 445 },
    { size: '900', cu60: 435, cu75: 520, cu90: 585, al60: 355, al75: 425, al90: 480 },
    { size: '1000', cu60: 455, cu75: 545, cu90: 615, al60: 375, al75: 445, al90: 500 },
    { size: '1250', cu60: 495, cu75: 590, cu90: 665, al60: 405, al75: 485, al90: 545 },
    { size: '1500', cu60: 520, cu75: 625, cu90: 705, al60: 435, al75: 520, al90: 585 },
    { size: '1750', cu60: 545, cu75: 650, cu90: 735, al60: 455, al75: 545, al90: 615 },
    { size: '2000', cu60: 560, cu75: 665, cu90: 750, al60: 470, al75: 560, al90: 630 }
  ];

  const filteredData = useMemo(() => {
    return ampacityData.filter(row => {
      const matchesSearch = row.size.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [searchTerm]);

  const getAmpacity = (row) => {
    const tempKey = selectedTemp;
    const materialKey = selectedInsulation;
    const key = `${materialKey}${tempKey}`;
    return row[key];
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
          <div>
            <h2 style={{ 
              margin: 0, 
              color: 'white',
              fontSize: '1.25rem',
              fontWeight: '600'
            }}>
              Table 310.16
            </h2>
            <p style={{
              margin: 0,
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.875rem',
              marginTop: '0.125rem'
            }}>
              Allowable Ampacities
            </p>
          </div>
          <button
            onClick={() => setShowInfo(!showInfo)}
            style={{
              marginLeft: 'auto',
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
            placeholder="Search wire size..."
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

        {/* Filter Pills */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '0.75rem'
        }}>
          <div style={{
            flex: 1,
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '0.5rem',
            padding: '0.5rem'
          }}>
            <div style={{
              fontSize: '0.6875rem',
              color: colors.subtext,
              marginBottom: '0.25rem',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Material
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                onClick={() => setSelectedInsulation('cu')}
                style={{
                  flex: 1,
                  padding: '0.375rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  background: selectedInsulation === 'cu' ? colors.accent : colors.inputBg,
                  color: selectedInsulation === 'cu' ? 'white' : colors.text,
                  fontSize: '0.8125rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Copper
              </button>
              <button
                onClick={() => setSelectedInsulation('al')}
                style={{
                  flex: 1,
                  padding: '0.375rem',
                  border: 'none',
                  borderRadius: '0.375rem',
                  background: selectedInsulation === 'al' ? colors.accent : colors.inputBg,
                  color: selectedInsulation === 'al' ? 'white' : colors.text,
                  fontSize: '0.8125rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                Aluminum
              </button>
            </div>
          </div>

          <div style={{
            flex: 1,
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '0.5rem',
            padding: '0.5rem'
          }}>
            <div style={{
              fontSize: '0.6875rem',
              color: colors.subtext,
              marginBottom: '0.25rem',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <Thermometer size={10} />
              Temp Rating
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {['60', '75', '90'].map(temp => (
                <button
                  key={temp}
                  onClick={() => setSelectedTemp(temp)}
                  style={{
                    flex: 1,
                    padding: '0.375rem',
                    border: 'none',
                    borderRadius: '0.375rem',
                    background: selectedTemp === temp ? colors.accent : colors.inputBg,
                    color: selectedTemp === temp ? 'white' : colors.text,
                    fontSize: '0.8125rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {temp}°C
                </button>
              ))}
            </div>
          </div>
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
            NEC Table 310.16
          </h3>
          <p style={{ margin: '0 0 0.5rem 0', color: colors.subtext }}>
            Allowable ampacities of insulated conductors rated up to and including 2000 volts, 
            60°C through 90°C, not more than three current-carrying conductors in raceway, 
            cable, or earth (directly buried), based on ambient temperature of 30°C (86°F).
          </p>
          <p style={{ margin: '0', color: colors.subtext, fontSize: '0.8125rem', fontStyle: 'italic' }}>
            <strong>Note:</strong> Values shown are for copper and aluminum/copper-clad aluminum conductors.
            Always check applicable correction factors and derating requirements.
          </p>
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
            gridTemplateColumns: '1fr 1fr',
            background: colors.accentLight,
            borderBottom: `1px solid ${colors.border}`,
            padding: '0.75rem 1rem',
            fontWeight: '600',
            fontSize: '0.875rem',
            color: colors.accent
          }}>
            <div>Wire Size</div>
            <div style={{ textAlign: 'right' }}>Ampacity</div>
          </div>

          {/* Table Body */}
          <div>
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => {
                const ampacity = getAmpacity(row);
                return (
                  <div
                    key={row.size}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      padding: '0.875rem 1rem',
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
                        marginBottom: '0.125rem'
                      }}>
                        {row.size} AWG
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: colors.subtext
                      }}>
                        {selectedInsulation === 'cu' ? 'Copper' : 'Aluminum'}
                      </div>
                    </div>
                    <div style={{ 
                      textAlign: 'right',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'flex-end'
                    }}>
                      {ampacity ? (
                        <>
                          <div style={{
                            fontSize: '1.125rem',
                            fontWeight: '700',
                            color: colors.accent,
                            lineHeight: '1'
                          }}>
                            {ampacity}
                          </div>
                          <div style={{
                            fontSize: '0.75rem',
                            color: colors.subtext,
                            marginTop: '0.125rem'
                          }}>
                            Amps @ {selectedTemp}°C
                          </div>
                        </>
                      ) : (
                        <div style={{
                          fontSize: '0.875rem',
                          color: colors.subtext,
                          fontStyle: 'italic'
                        }}>
                          N/A
                        </div>
                      )}
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
          Showing {filteredData.length} of {ampacityData.length} wire sizes
        </div>
      </div>
    </div>
  );
};

export default Table310_16;