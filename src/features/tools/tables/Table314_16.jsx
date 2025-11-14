import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, X, Info, Box } from 'lucide-react';

const Table314_16 = ({ isDarkMode, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('volumes'); // 'volumes' or 'conductors'
  const [showInfo, setShowInfo] = useState(false);

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

  // Standard box volumes
  const boxVolumes = [
    // 4" Round/Octagon boxes
    { type: '4" Round/Octagon', depth: '1¼"', volume: 12.5 },
    { type: '4" Round/Octagon', depth: '1½"', volume: 15.5 },
    { type: '4" Round/Octagon', depth: '2⅛"', volume: 21.5 },
    
    // 4" Square boxes
    { type: '4" Square', depth: '1¼"', volume: 18.0 },
    { type: '4" Square', depth: '1½"', volume: 21.0 },
    { type: '4" Square', depth: '2⅛"', volume: 30.3 },
    
    // 4 11/16" Square boxes
    { type: '4 11/16" Square', depth: '1¼"', volume: 25.5 },
    { type: '4 11/16" Square', depth: '1½"', volume: 29.5 },
    { type: '4 11/16" Square', depth: '2⅛"', volume: 42.0 },
    
    // Device boxes (single gang)
    { type: '3" × 2" × 1½"', depth: null, volume: 7.5 },
    { type: '3" × 2" × 2"', depth: null, volume: 10.0 },
    { type: '3" × 2" × 2¼"', depth: null, volume: 10.5 },
    { type: '3" × 2" × 2½"', depth: null, volume: 12.5 },
    { type: '3" × 2" × 2¾"', depth: null, volume: 14.0 },
    { type: '3" × 2" × 3½"', depth: null, volume: 18.0 },
    
    // Multiple gang device boxes
    { type: '4" × 2⅛" × 1½"', depth: null, volume: 10.0 },
    { type: '4" × 2⅛" × 1⅞"', depth: null, volume: 10.5 },
    { type: '4" × 2⅛" × 2⅛"', depth: null, volume: 14.0 },
    
    // FS and FD boxes
    { type: 'FS - Shallow', depth: null, volume: 13.5 },
    { type: 'FD - Deep', depth: null, volume: 18.0 },
    
    // Masonry boxes
    { type: '3½" × 2" × 2½"', depth: null, volume: 14.0 },
    { type: '3½" × 2" × 3½"', depth: null, volume: 21.0 }
  ];

  // Volume allowances per conductor
  const conductorVolumes = [
    { size: '18', volume: 1.5 },
    { size: '16', volume: 1.75 },
    { size: '14', volume: 2.0 },
    { size: '12', volume: 2.25 },
    { size: '10', volume: 2.5 },
    { size: '8', volume: 3.0 },
    { size: '6', volume: 5.0 }
  ];

  const filteredBoxes = useMemo(() => {
    return boxVolumes.filter(box => {
      const searchLower = searchTerm.toLowerCase();
      return box.type.toLowerCase().includes(searchLower) ||
             (box.depth && box.depth.toLowerCase().includes(searchLower));
    });
  }, [searchTerm]);

  const filteredConductors = useMemo(() => {
    return conductorVolumes.filter(conductor => {
      return conductor.size.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [searchTerm]);

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
              Table 314.16
            </h2>
            <p style={{
              margin: 0,
              color: 'rgba(255,255,255,0.9)',
              fontSize: '0.875rem',
              marginTop: '0.125rem'
            }}>
              Box Fill Requirements
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
            placeholder={selectedTab === 'volumes' ? 'Search box types...' : 'Search wire sizes...'}
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

        {/* Tab Selector */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          background: 'rgba(255,255,255,0.95)',
          borderRadius: '0.5rem',
          padding: '0.25rem'
        }}>
          <button
            onClick={() => {
              setSelectedTab('volumes');
              setSearchTerm('');
            }}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: '0.375rem',
              background: selectedTab === 'volumes' ? colors.accent : 'transparent',
              color: selectedTab === 'volumes' ? 'white' : colors.text,
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Box Volumes
          </button>
          <button
            onClick={() => {
              setSelectedTab('conductors');
              setSearchTerm('');
            }}
            style={{
              flex: 1,
              padding: '0.5rem',
              border: 'none',
              borderRadius: '0.375rem',
              background: selectedTab === 'conductors' ? colors.accent : 'transparent',
              color: selectedTab === 'conductors' ? 'white' : colors.text,
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            Conductor Volumes
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
            NEC Table 314.16(A) & (B)
          </h3>
          <p style={{ margin: '0 0 0.5rem 0', color: colors.subtext }}>
            <strong>Table 314.16(A)</strong> lists the volume allowances required per conductor 
            based on wire size. <strong>Table 314.16(B)</strong> provides the maximum number of 
            conductors permitted in standard metal boxes.
          </p>
          <div style={{
            background: colors.accentLight,
            borderLeft: `3px solid ${colors.accent}`,
            padding: '0.75rem',
            marginTop: '0.75rem',
            borderRadius: '0.25rem'
          }}>
            <p style={{ margin: '0 0 0.5rem 0', fontWeight: '600', color: colors.accent }}>
              Key Points:
            </p>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: colors.subtext, fontSize: '0.8125rem' }}>
              <li>Each conductor = 1 volume allowance</li>
              <li>All equipment grounding conductors = 1 volume allowance (total)</li>
              <li>Each device/strap = 2 volume allowances (largest conductor)</li>
              <li>Cable clamps = 1 volume allowance (largest conductor, once per box)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '0 1rem' }}>
        {selectedTab === 'volumes' ? (
          // Box Volumes Table
          <div style={{
            background: colors.cardBg,
            borderRadius: '0.75rem',
            border: `1px solid ${colors.border}`,
            overflow: 'hidden'
          }}>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1.5fr 0.75fr 1fr',
              background: colors.accentLight,
              borderBottom: `1px solid ${colors.border}`,
              padding: '0.75rem 1rem',
              fontWeight: '600',
              fontSize: '0.875rem',
              color: colors.accent
            }}>
              <div>Box Type</div>
              <div>Depth</div>
              <div style={{ textAlign: 'right' }}>Volume</div>
            </div>

            {/* Table Body */}
            <div>
              {filteredBoxes.length > 0 ? (
                filteredBoxes.map((box, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1.5fr 0.75fr 1fr',
                      padding: '0.875rem 1rem',
                      borderBottom: index < filteredBoxes.length - 1 ? `1px solid ${colors.border}` : 'none',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = colors.inputBg}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <div style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: colors.text,
                        lineHeight: '1.3'
                      }}>
                        {box.type}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '0.8125rem',
                      color: colors.subtext,
                      display: 'flex',
                      alignItems: 'center'
                    }}>
                      {box.depth || '—'}
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
                        {box.volume}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: colors.subtext,
                        marginTop: '0.125rem'
                      }}>
                        cu. in.
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
        ) : (
          // Conductor Volumes Table
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
              <div style={{ textAlign: 'right' }}>Volume Per Conductor</div>
            </div>

            {/* Table Body */}
            <div>
              {filteredConductors.length > 0 ? (
                filteredConductors.map((conductor, index) => (
                  <div
                    key={conductor.size}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      padding: '1rem',
                      borderBottom: index < filteredConductors.length - 1 ? `1px solid ${colors.border}` : 'none',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = colors.inputBg}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div>
                      <div style={{
                        fontSize: '1rem',
                        fontWeight: '600',
                        color: colors.text
                      }}>
                        {conductor.size} AWG
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
                        color: colors.accent,
                        lineHeight: '1'
                      }}>
                        {conductor.volume}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: colors.subtext,
                        marginTop: '0.125rem'
                      }}>
                        cu. in.
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
        )}

        {/* Result Count */}
        <div style={{
          textAlign: 'center',
          marginTop: '1rem',
          fontSize: '0.8125rem',
          color: colors.subtext
        }}>
          {selectedTab === 'volumes' ? (
            <>Showing {filteredBoxes.length} of {boxVolumes.length} box types</>
          ) : (
            <>Showing {filteredConductors.length} of {conductorVolumes.length} wire sizes</>
          )}
        </div>
      </div>
    </div>
  );
};

export default Table314_16;