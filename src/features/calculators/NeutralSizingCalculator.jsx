import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { AlertTriangle, CheckCircle, Info, Zap, Plus, Trash2 } from 'lucide-react';
import { exportToPDF } from '../../utils/pdfExport';

// Load types for neutral calculation
const loadTypes = [
  { 
    value: 'general_lighting', 
    label: 'General Lighting & Receptacles',
    description: '120V lighting and receptacle loads',
    needsNeutral: true,
    demandFactor: 1.0
  },
  { 
    value: 'appliances', 
    label: 'Small Appliance & Laundry Circuits',
    description: '20A small appliance and laundry branch circuits',
    needsNeutral: true,
    demandFactor: 1.0
  },
  { 
    value: 'electric_range', 
    label: 'Electric Range/Oven',
    description: 'Cooking equipment (70% neutral load per 220.61)',
    needsNeutral: true,
    demandFactor: 0.70
  },
  { 
    value: 'electric_dryer', 
    label: 'Electric Clothes Dryer',
    description: 'Electric dryer (70% neutral load per 220.61)',
    needsNeutral: true,
    demandFactor: 0.70
  },
  { 
    value: 'hvac_heat_pump', 
    label: 'HVAC/Heat Pump',
    description: 'Heating and cooling equipment (typically 240V, minimal neutral)',
    needsNeutral: false,
    demandFactor: 0.0
  },
  { 
    value: 'water_heater', 
    label: 'Electric Water Heater',
    description: '240V straight heating element (no neutral required)',
    needsNeutral: false,
    demandFactor: 0.0
  },
  { 
    value: 'line_to_neutral', 
    label: 'Line-to-Neutral Load (120V)',
    description: 'Any 120V load between line and neutral',
    needsNeutral: true,
    demandFactor: 1.0
  },
  { 
    value: 'three_phase_balanced', 
    label: '3-Phase Balanced Load',
    description: '3-phase motor or balanced load (minimal neutral current)',
    needsNeutral: false,
    demandFactor: 0.0
  },
  { 
    value: 'three_phase_unbalanced', 
    label: '3-Phase with Line-to-Neutral Loads',
    description: '3-phase system with 120V loads (needs full neutral)',
    needsNeutral: true,
    demandFactor: 1.0
  }
];

const necReferences = {
  mainArticle: 'NEC Article 220.61 - Feeder and Service Neutral Load',
  rangesDryers: 'NEC 220.61(B) - Ranges and Dryers (70% of load)',
  balancedLoads: 'NEC 220.61(C) - Balanced Loads',
  neutralReduction: 'NEC 220.61 - Neutral Load Reduction',
  conductorSizing: 'NEC Table 310.16 - Conductor Ampacity',
  groundingVsNeutral: 'NEC 250.24(C) - Neutral vs Grounding Conductor'
};

const NeutralSizingCalculator = forwardRef(({ isDarkMode = false, onBack }, ref) => {
  const [loads, setLoads] = useState([
    { id: 1, type: 'general_lighting', amperage: '20', description: 'General Lighting' }
  ]);
  const [nextId, setNextId] = useState(2);
  const [systemType, setSystemType] = useState('single_phase');
  const [voltage, setVoltage] = useState('240');

  // Dark mode colors
  const colors = {
    cardBg: isDarkMode ? '#374151' : '#ffffff',
    cardBorder: isDarkMode ? '#4b5563' : '#e5e7eb',
    cardText: isDarkMode ? '#f9fafb' : '#111827',
    labelText: isDarkMode ? '#d1d5db' : '#374151',
    inputBg: isDarkMode ? '#1f2937' : '#ffffff',
    inputBorder: isDarkMode ? '#4b5563' : '#d1d5db',
    sectionBg: isDarkMode ? '#1f2937' : '#f9fafb',
  };

  // Add new load
  const addLoad = () => {
    setLoads([...loads, { 
      id: nextId, 
      type: 'general_lighting', 
      amperage: '0', 
      description: `Load ${nextId}` 
    }]);
    setNextId(nextId + 1);
  };

  // Remove load
  const removeLoad = (id) => {
    if (loads.length > 1) {
      setLoads(loads.filter(load => load.id !== id));
    }
  };

  // Update load
  const updateLoad = (id, field, value) => {
    setLoads(loads.map(load => 
      load.id === id ? { ...load, [field]: value } : load
    ));
  };

  // Calculate neutral load
  const calculateNeutralLoad = () => {
    let totalNeutralCurrent = 0;
    let lineToNeutralLoads = [];
    let reducedLoads = [];
    let excludedLoads = [];

    loads.forEach(load => {
      const loadInfo = loadTypes.find(lt => lt.value === load.type);
      const amperage = parseFloat(load.amperage) || 0;

      if (amperage === 0) return;

      if (!loadInfo.needsNeutral) {
        // Loads that don't contribute to neutral
        excludedLoads.push({
          description: load.description || loadInfo.label,
          amperage: amperage,
          reason: 'No neutral required (240V line-to-line or balanced 3-phase)'
        });
      } else if (loadInfo.demandFactor < 1.0) {
        // Loads with reduced neutral (ranges, dryers)
        const neutralCurrent = amperage * loadInfo.demandFactor;
        reducedLoads.push({
          description: load.description || loadInfo.label,
          lineAmperage: amperage,
          neutralAmperage: neutralCurrent,
          factor: loadInfo.demandFactor
        });
        totalNeutralCurrent += neutralCurrent;
      } else {
        // Full neutral loads (120V loads)
        lineToNeutralLoads.push({
          description: load.description || loadInfo.label,
          amperage: amperage
        });
        totalNeutralCurrent += amperage;
      }
    });

    return {
      totalNeutralCurrent: Math.round(totalNeutralCurrent * 10) / 10,
      lineToNeutralLoads,
      reducedLoads,
      excludedLoads
    };
  };

  // Get conductor size recommendation
  const getConductorSizeRecommendation = (current) => {
    // Simplified conductor sizing based on 75°C copper
    if (current <= 20) return '12 AWG';
    if (current <= 25) return '10 AWG';
    if (current <= 35) return '8 AWG';
    if (current <= 50) return '6 AWG';
    if (current <= 65) return '4 AWG';
    if (current <= 85) return '3 AWG';
    if (current <= 100) return '2 AWG';
    if (current <= 115) return '1 AWG';
    if (current <= 130) return '1/0 AWG';
    if (current <= 150) return '2/0 AWG';
    if (current <= 175) return '3/0 AWG';
    if (current <= 200) return '4/0 AWG';
    if (current <= 230) return '250 kcmil';
    if (current <= 255) return '300 kcmil';
    if (current <= 285) return '350 kcmil';
    if (current <= 310) return '400 kcmil';
    if (current <= 335) return '500 kcmil';
    return '600+ kcmil (see NEC Table 310.16)';
  };

  const results = calculateNeutralLoad();
  const recommendedSize = getConductorSizeRecommendation(results.totalNeutralCurrent);

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      const pdfData = {
        calculatorName: 'Neutral Sizing Calculator',
        inputs: {
          systemType: systemType === 'single_phase' ? 'Single-Phase' : '3-Phase',
          voltage: `${voltage}V`,
          numberOfLoads: loads.length,
          loads: loads.map(load => {
            const loadInfo = loadTypes.find(lt => lt.value === load.type);
            return `${load.description || loadInfo.label}: ${load.amperage}A`;
          })
        },
        results: {
          totalNeutralCurrent: `${results.totalNeutralCurrent} A`,
          recommendedConductorSize: recommendedSize,
          lineToNeutralLoads: results.lineToNeutralLoads.length > 0 
            ? results.lineToNeutralLoads.map(l => `${l.description}: ${l.amperage}A`).join(', ')
            : 'None',
          reducedNeutralLoads: results.reducedLoads.length > 0
            ? results.reducedLoads.map(l => `${l.description}: ${l.lineAmperage}A → ${l.neutralAmperage}A (${l.factor * 100}%)`).join(', ')
            : 'None',
          excludedLoads: results.excludedLoads.length > 0
            ? results.excludedLoads.map(l => `${l.description}: ${l.amperage}A (${l.reason})`).join(', ')
            : 'None'
        },
        necReferences: [
          necReferences.mainArticle,
          necReferences.rangesDryers,
          necReferences.balancedLoads,
          necReferences.conductorSizing,
          necReferences.groundingVsNeutral
        ]
      };

      exportToPDF(pdfData);
    }
  }));

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* System Configuration */}
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
          System Configuration
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText,
              marginBottom: '0.5rem' 
            }}>
              System Type
            </label>
            <select 
              value={systemType} 
              onChange={(e) => setSystemType(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem',
                fontSize: '0.9375rem',
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.cardText,
                boxSizing: 'border-box'
              }}
            >
              <option value="single_phase">Single-Phase</option>
              <option value="three_phase">3-Phase</option>
            </select>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText,
              marginBottom: '0.5rem' 
            }}>
              System Voltage
            </label>
            <select 
              value={voltage} 
              onChange={(e) => setVoltage(e.target.value)}
              style={{
                width: '100%',
                padding: '0.625rem',
                fontSize: '0.9375rem',
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.cardText,
                boxSizing: 'border-box'
              }}
            >
              <option value="120/240">120/240V</option>
              <option value="120/208">120/208V</option>
              <option value="277/480">277/480V</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loads */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1rem',
          paddingBottom: '0.5rem',
          borderBottom: `1px solid ${colors.cardBorder}`
        }}>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: colors.cardText,
            margin: 0
          }}>
            Connected Loads
          </h3>
          <button
            onClick={addLoad}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#ffffff',
              background: '#3b82f6',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            <Plus size={18} />
            Add Load
          </button>
        </div>

        {loads.map((load, index) => {
          const loadInfo = loadTypes.find(lt => lt.value === load.type);
          
          return (
            <div key={load.id} style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${colors.cardBorder}`,
              marginBottom: index < loads.length - 1 ? '1rem' : 0
            }}>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'start' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      fontWeight: '500', 
                      color: colors.labelText,
                      marginBottom: '0.5rem' 
                    }}>
                      Load Type
                    </label>
                    <select 
                      value={load.type} 
                      onChange={(e) => updateLoad(load.id, 'type', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.625rem',
                        fontSize: '0.9375rem',
                        border: `1px solid ${colors.inputBorder}`,
                        borderRadius: '8px',
                        backgroundColor: colors.inputBg,
                        color: colors.cardText,
                        boxSizing: 'border-box'
                      }}
                    >
                      {loadTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {loads.length > 1 && (
                    <button
                      onClick={() => removeLoad(load.id)}
                      style={{
                        marginTop: '1.85rem',
                        padding: '0.625rem',
                        background: '#ef4444',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Trash2 size={18} color="#ffffff" />
                    </button>
                  )}
                </div>

                <div style={{ 
                  fontSize: '0.75rem', 
                  color: colors.labelText, 
                  fontStyle: 'italic',
                  marginTop: '-0.5rem'
                }}>
                  {loadInfo?.description}
                  {loadInfo?.demandFactor < 1.0 && (
                    <span style={{ color: '#f59e0b', fontWeight: '600', marginLeft: '0.5rem' }}>
                      ({loadInfo.demandFactor * 100}% neutral load)
                    </span>
                  )}
                  {!loadInfo?.needsNeutral && (
                    <span style={{ color: '#10b981', fontWeight: '600', marginLeft: '0.5rem' }}>
                      (No neutral current)
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '0.875rem', 
                      fontWeight: '500', 
                      color: colors.labelText,
                      marginBottom: '0.5rem' 
                    }}>
                      Load Current (Amperes)
                    </label>
                    <input
                      type="number"
                      value={load.amperage}
                      onChange={(e) => updateLoad(load.id, 'amperage', e.target.value)}
                      min="0"
                      step="0.1"
                      style={{
                        width: '100%',
                        padding: '0.625rem',
                        fontSize: '0.9375rem',
                        border: `1px solid ${colors.inputBorder}`,
                        borderRadius: '8px',
                        backgroundColor: colors.inputBg,
                        color: colors.cardText,
                        boxSizing: 'border-box'
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
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={load.description}
                      onChange={(e) => updateLoad(load.id, 'description', e.target.value)}
                      placeholder={loadInfo?.label}
                      style={{
                        width: '100%',
                        padding: '0.625rem',
                        fontSize: '0.9375rem',
                        border: `1px solid ${colors.inputBorder}`,
                        borderRadius: '8px',
                        backgroundColor: colors.inputBg,
                        color: colors.cardText,
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
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
          fontSize: '1.125rem', 
          fontWeight: '600', 
          color: colors.cardText,
          marginTop: 0,
          marginBottom: '1rem'
        }}>
          Neutral Conductor Sizing
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            background: '#dbeafe',
            padding: '1.5rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase' }}>
              Neutral Current
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e40af', lineHeight: '1' }}>
              {results.totalNeutralCurrent}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#1e40af', marginTop: '0.5rem' }}>
              Amperes
            </div>
          </div>

          <div style={{
            background: '#d1fae5',
            padding: '1.5rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#047857', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase' }}>
              Recommended Size
            </div>
            <div style={{ fontSize: '2rem', fontWeight: '700', color: '#047857', lineHeight: '1' }}>
              {recommendedSize}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#047857', marginTop: '0.5rem' }}>
              Copper @ 75°C
            </div>
          </div>
        </div>

        {/* Load Breakdown */}
        {results.lineToNeutralLoads.length > 0 && (
          <div style={{
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            border: `1px solid ${colors.cardBorder}`,
            marginBottom: '1rem'
          }}>
            <div style={{ fontWeight: '600', color: colors.cardText, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Full Neutral Loads (100%):
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: colors.labelText }}>
              {results.lineToNeutralLoads.map((load, index) => (
                <li key={index}>{load.description}: {load.amperage}A</li>
              ))}
            </ul>
          </div>
        )}

        {results.reducedLoads.length > 0 && (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <div style={{ fontWeight: '600', color: '#92400e', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Reduced Neutral Loads (NEC 220.61):
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#92400e' }}>
              {results.reducedLoads.map((load, index) => (
                <li key={index}>
                  {load.description}: {load.lineAmperage}A → {load.neutralAmperage}A ({load.factor * 100}%)
                </li>
              ))}
            </ul>
          </div>
        )}

        {results.excludedLoads.length > 0 && (
          <div style={{
            background: '#d1fae5',
            border: '1px solid #6ee7b7',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '1rem'
          }}>
            <div style={{ fontWeight: '600', color: '#047857', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              Loads Not Contributing to Neutral:
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: '#047857' }}>
              {results.excludedLoads.map((load, index) => (
                <li key={index}>
                  {load.description}: {load.amperage}A - {load.reason}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{
          background: '#dbeafe',
          border: '1px solid #93c5fd',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
            <Info size={20} color="#1e40af" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            <div style={{ fontSize: '0.875rem', color: '#1e3a8a', lineHeight: '1.5' }}>
              <strong>Important Notes:</strong>
              <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem' }}>
                <li>Conductor sizing based on 75°C copper in conduit (NEC Table 310.16)</li>
                <li>Electric ranges and dryers calculated at 70% per NEC 220.61(B)</li>
                <li>240V line-to-line loads (water heaters, HVAC) don't require neutral current</li>
                <li>Balanced 3-phase loads have minimal neutral current</li>
                <li>Always verify with local codes and specific installation conditions</li>
                <li>Consider voltage drop for long runs</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* NEC References */}
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
          marginBottom: '1rem',
          borderBottom: `1px solid ${colors.cardBorder}`,
          paddingBottom: '0.5rem'
        }}>
          NEC References
        </h3>
        <div style={{ fontSize: '0.875rem', color: colors.labelText, lineHeight: '1.5' }}>
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.mainArticle}</div>
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.rangesDryers}</div>
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.balancedLoads}</div>
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.conductorSizing}</div>
          <div>• {necReferences.groundingVsNeutral}</div>
        </div>
      </div>
    </div>
  );
});

export default NeutralSizingCalculator;