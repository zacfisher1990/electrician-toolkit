import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Plus, Trash2, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { exportToPDF } from '../../utils/pdfExport';

const EVChargingCalculator = forwardRef(({ isDarkMode = false, onBack }, ref) => {
  // State for EVSE inputs
  const [evseList, setEvseList] = useState([
    { name: 'EVSE 1', ratingAmps: '', voltage: '240', count: '1' }
  ]);
  const [loadType, setLoadType] = useState('continuous'); // continuous or fastcharge
  const [diversityFactor, setDiversityFactor] = useState('100');
  const [useDiversityTable] = useState(false);

  // Dark mode colors
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

  const addEVSE = () => {
    const nextNum = evseList.length + 1;
    setEvseList([...evseList, { 
      name: `EVSE ${nextNum}`, 
      ratingAmps: '', 
      voltage: '240', 
      count: '1' 
    }]);
  };

  const removeEVSE = (index) => {
    if (evseList.length > 1) {
      setEvseList(evseList.filter((_, i) => i !== index));
    }
  };

  const updateEVSE = (index, field, value) => {
    const newEvseList = [...evseList];
    newEvseList[index][field] = value;
    setEvseList(newEvseList);
  };

  // NEC 625.42 Diversity Table (informational - for reference)
  const getDiversityFromTable = (numberOfEVSE) => {
    if (numberOfEVSE === 1) return 100;
    if (numberOfEVSE === 2) return 100;
    if (numberOfEVSE === 3) return 90;
    if (numberOfEVSE === 4) return 80;
    if (numberOfEVSE === 5) return 70;
    if (numberOfEVSE === 6) return 60;
    if (numberOfEVSE >= 7 && numberOfEVSE <= 8) return 50;
    if (numberOfEVSE >= 9 && numberOfEVSE <= 11) return 45;
    if (numberOfEVSE >= 12 && numberOfEVSE <= 14) return 40;
    if (numberOfEVSE >= 15 && numberOfEVSE <= 19) return 35;
    if (numberOfEVSE >= 20) return 30;
    return 100;
  };

  const calculateEVCharging = () => {
    let totalLoad = 0;
    let totalEVSECount = 0;
    
    const evseDetails = evseList.map(evse => {
      const rating = parseFloat(evse.ratingAmps) || 0;
      const voltage = parseFloat(evse.voltage) || 240;
      const count = parseInt(evse.count) || 0;
      
      // NEC 625.41: Continuous load factor (125% for continuous)
      const loadFactor = loadType === 'continuous' ? 1.25 : 1.0;
      const loadPerUnit = rating * loadFactor;
      const totalUnitLoad = loadPerUnit * count;
      const powerPerUnit = (rating * voltage) / 1000; // kW
      
      totalLoad += totalUnitLoad;
      totalEVSECount += count;
      
      return {
        name: evse.name,
        rating,
        voltage,
        count,
        loadFactor,
        loadPerUnit: loadPerUnit.toFixed(2),
        totalUnitLoad: totalUnitLoad.toFixed(2),
        powerPerUnit: powerPerUnit.toFixed(2)
      };
    });

    // Apply diversity if enabled
    let diversityPercent = parseFloat(diversityFactor) || 100;
    if (useDiversityTable) {
      diversityPercent = getDiversityFromTable(totalEVSECount);
    }
    
    const calculatedLoad = totalLoad * (diversityPercent / 100);
    
    // Calculate conductor and OCPD sizing
    // NEC 625.41: Feeder/branch circuit must be sized at 125% of continuous load
    const feederLoad = calculatedLoad;
    
    // Suggest standard OCPD sizes
    const standardBreakers = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200, 225, 250, 300, 350, 400, 450, 500, 600, 700, 800, 1000, 1200];
    const minOCPD = standardBreakers.find(size => size >= feederLoad) || Math.ceil(feederLoad);
    
    // Conductor sizing: 125% of OCPD (NEC 310.15 adjustment)
    const minConductorAmpacity = minOCPD;

    return {
      evseDetails: evseDetails.filter(e => e.count > 0),
      totalEVSECount,
      totalConnectedLoad: totalLoad.toFixed(2),
      diversityPercent,
      calculatedLoad: calculatedLoad.toFixed(2),
      feederLoad: feederLoad.toFixed(2),
      minOCPD,
      minConductorAmpacity: minConductorAmpacity.toFixed(0),
      loadType,
      hasLoad: totalLoad > 0
    };
  };

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      const results = calculateEVCharging();
      
      if (!results.hasLoad || results.totalEVSECount === 0) {
        alert('Please enter at least one EVSE with ratings before exporting');
        return;
      }

      // Build EVSE breakdown
      const evseBreakdown = results.evseDetails
        .map(detail => 
          `${detail.name}: ${detail.rating}A @ ${detail.voltage}V × ${detail.count} = ${detail.totalUnitLoad}A (with ${loadType === 'continuous' ? '125%' : '100%'} factor)`
        )
        .join('; ');

      const pdfData = {
        calculatorName: 'EV Charging Calculator (NEC 625)',
        inputs: {
          totalEVSE: results.totalEVSECount,
          loadType: loadType === 'continuous' ? 'Continuous (125% factor)' : 'Fast Charge (100% factor)',
          diversityFactor: `${results.diversityPercent}%`
        },
        results: {
          totalConnectedLoad: `${results.totalConnectedLoad} A`,
          diversityApplied: `${results.diversityPercent}%`,
          calculatedLoad: `${results.calculatedLoad} A`,
          minimumOCPD: `${results.minOCPD} A`,
          minimumConductorAmpacity: `${results.minConductorAmpacity} A`
        },
        additionalInfo: {
          evseBreakdown: evseBreakdown,
          loadCalculation: loadType === 'continuous' 
            ? 'Continuous loads calculated at 125% per NEC 625.41' 
            : 'Fast charging loads at 100%',
          conductorNote: `Conductors must be rated for at least ${results.minConductorAmpacity}A based on the ${results.minOCPD}A OCPD`,
          diversityNote: results.diversityPercent < 100 
            ? `Diversity factor of ${results.diversityPercent}% applied per load calculation` 
            : 'No diversity factor applied (100%)'
        },
        necReferences: [
          'NEC 625.41 - Rating: EVSE load shall be computed at 125% of maximum load for continuous charging',
          'NEC 625.42 - Feeder and Service Load Calculations: Permitted to apply diversity factors',
          'NEC 625.43 - Overcurrent Protection: Branch circuits and feeders shall be sized for loads',
          'NEC 210.19(A)(1) - Conductor sizing for continuous loads',
          'NEC 215.2(A)(1) - Feeder conductor sizing requirements',
          'Continuous Load: A load where maximum current is expected to continue for 3 hours or more'
        ]
      };

      exportToPDF(pdfData);
    }
  }));

  const results = calculateEVCharging();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>

      {/* Load Configuration */}
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
          Load Configuration
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* Load Type */}
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
              value={loadType} 
              onChange={(e) => setLoadType(e.target.value)}
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
              <option value="continuous">Continuous (125% factor)</option>
              <option value="fastcharge">Fast Charge (100%)</option>
            </select>
          </div>

          {/* Diversity Factor */}
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText,
              marginBottom: '0.5rem' 
            }}>
              Diversity Factor (%)
            </label>
            <input 
              type="number" 
              value={diversityFactor} 
              onChange={(e) => setDiversityFactor(e.target.value)}
              placeholder="100"
              min="1"
              max="100"
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

        {/* Info box about continuous loads */}
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: '#dbeafe',
          border: '1px solid #93c5fd',
          borderRadius: '8px',
          fontSize: '0.8125rem',
          color: '#1e40af',
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'start'
        }}>
          <Info size={16} style={{ flexShrink: 0, marginTop: '0.125rem' }} />
          <div>
            <strong>NEC 625.41:</strong> EV charging is considered a continuous load. Conductors and overcurrent protection must be sized at 125% of the maximum load for continuous charging equipment.
          </div>
        </div>
      </div>

      {/* EVSE List */}
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
          EVSE Equipment
        </h3>
        
        {evseList.map((evse, index) => (
          <div key={index} style={{ marginBottom: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '0.75rem'
            }}>
              <input 
                type="text"
                value={evse.name}
                onChange={(e) => updateEVSE(index, 'name', e.target.value)}
                placeholder="EVSE Name"
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: '6px',
                  backgroundColor: colors.inputBg,
                  color: colors.cardText,
                  marginRight: '0.5rem'
                }}
              />
              {evseList.length > 1 && (
                <button 
                  onClick={() => removeEVSE(index)}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    width: '32px',
                    height: '32px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '2fr 1.5fr 1fr', 
              gap: '0.75rem'
            }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.75rem', 
                  fontWeight: '500', 
                  color: colors.labelText,
                  marginBottom: '0.25rem' 
                }}>
                  Rating (Amps)
                </label>
                <input 
                  type="number" 
                  value={evse.ratingAmps} 
                  onChange={(e) => updateEVSE(index, 'ratingAmps', e.target.value)}
                  placeholder="e.g., 32"
                  min="0"
                  step="1"
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
                  fontSize: '0.75rem', 
                  fontWeight: '500', 
                  color: colors.labelText,
                  marginBottom: '0.25rem' 
                }}>
                  Voltage
                </label>
                <select 
                  value={evse.voltage} 
                  onChange={(e) => updateEVSE(index, 'voltage', e.target.value)}
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
                  <option value="120">120V</option>
                  <option value="240">240V</option>
                  <option value="208">208V</option>
                  <option value="480">480V</option>
                </select>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.75rem', 
                  fontWeight: '500', 
                  color: colors.labelText,
                  marginBottom: '0.25rem' 
                }}>
                  Quantity
                </label>
                <input 
                  type="number" 
                  value={evse.count} 
                  onChange={(e) => updateEVSE(index, 'count', e.target.value)}
                  placeholder="1"
                  min="1"
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
        ))}
        
        <button 
          onClick={addEVSE}
          style={{ 
            width: '100%',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <Plus size={16} />
          Add EVSE
        </button>
      </div>

      {/* Results */}
      {results && results.hasLoad && (
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
            Results
          </h3>
          
          {/* Main metrics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                Total Connected Load
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                {results.totalConnectedLoad}
              </div>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                Amps
              </div>
            </div>
            
            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                Calculated Load
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                {results.calculatedLoad}
              </div>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                Amps ({results.diversityPercent}% diversity)
              </div>
            </div>
            
            <div style={{
              background: '#dbeafe',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                Total EVSE
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                {results.totalEVSECount}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.25rem' }}>
                Units
              </div>
            </div>
          </div>

          {/* Circuit sizing results */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              background: '#dcfce7',
              border: '1px solid #86efac',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#166534', marginBottom: '0.25rem' }}>
                Minimum OCPD
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#166534' }}>
                {results.minOCPD}A
              </div>
              <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '0.25rem' }}>
                Breaker/Fuse Size
              </div>
            </div>

            <div style={{
              background: '#fef3c7',
              border: '1px solid #fcd34d',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#92400e', marginBottom: '0.25rem' }}>
                Min. Conductor Ampacity
              </div>
              <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#92400e' }}>
                {results.minConductorAmpacity}A
              </div>
              <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '0.25rem' }}>
                Before derating
              </div>
            </div>
          </div>

          {/* EVSE Breakdown */}
          {results.evseDetails.length > 0 && (
            <div style={{ 
              background: colors.sectionBg,
              padding: '1rem', 
              borderRadius: '8px',
              marginBottom: '1rem',
              border: `1px solid ${colors.cardBorder}`
            }}>
              <strong style={{ color: colors.cardText, display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                EVSE Breakdown:
              </strong>
              {results.evseDetails.map((detail, index) => (
                <div key={index} style={{ 
                  marginTop: index > 0 ? '0.75rem' : 0,
                  paddingTop: index > 0 ? '0.75rem' : 0,
                  borderTop: index > 0 ? `1px solid ${colors.cardBorder}` : 'none',
                  fontSize: '0.875rem',
                  color: colors.labelText
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {detail.name} - {detail.rating}A @ {detail.voltage}V × {detail.count}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: colors.subtleText }}>
                    {detail.powerPerUnit} kW per unit • Load per unit: {detail.loadPerUnit}A • Total: {detail.totalUnitLoad}A
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Compliance notice */}
          <div style={{
            background: '#d1fae5',
            border: '1px solid #6ee7b7',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <CheckCircle size={20} color="#059669" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.875rem', color: '#047857', lineHeight: '1.5' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                  Calculation Complete
                </div>
                <div>
                  {loadType === 'continuous' 
                    ? 'Continuous load factor of 125% applied per NEC 625.41'
                    : 'Fast charging load calculated at 100%'
                  }
                </div>
                {results.diversityPercent < 100 && (
                  <div style={{ marginTop: '0.25rem' }}>
                    Diversity factor of {results.diversityPercent}% applied to total load
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEC Reference */}
      <div style={{
        background: colors.sectionBg,
        padding: '1rem',
        borderRadius: '8px',
        border: `1px solid ${colors.cardBorder}`,
        fontSize: '0.8125rem',
        color: colors.labelText
      }}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: colors.cardText }}>
          NEC Article 625 - Electric Vehicle Charging:
        </div>
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>625.41:</strong> Rating - EV load computed at 125% of max load for continuous charging
        </div>
        <div style={{ marginBottom: '0.25rem' }}>
          <strong>625.42:</strong> Feeder/Service calculations - Diversity factors permitted
        </div>
        <div>
          <strong>625.43:</strong> Overcurrent protection shall be sized for calculated loads
        </div>
      </div>
    </div>
  );
});

export default EVChargingCalculator;