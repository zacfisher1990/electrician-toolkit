import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { exportToPDF } from './pdfExport';

const AmpacityLookupCalculator = forwardRef(({ isDarkMode = false, onBack }, ref) => {
  const [wireSize, setWireSize] = useState('12');
  const [wireType, setWireType] = useState('copper');
  const [tempRating, setTempRating] = useState('75C');
  const [ambientTemp, setAmbientTemp] = useState('30');
  const [numConductors, setNumConductors] = useState('3');
  const [continuousLoad, setContinuousLoad] = useState(false);

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

  const ampacityData = {
    copper: {
      '60C': {
        '22': 3, '20': 5, '18': 7, '16': 10,
        '14': 15, '12': 20, '10': 30, '8': 40, '6': 55, '4': 70, '3': 85,
        '2': 95, '1': 110, '1/0': 125, '2/0': 145, '3/0': 165, '4/0': 195,
        '250': 215, '300': 240, '350': 260, '400': 280, '500': 320,
        '600': 355, '700': 385, '750': 400
      },
      '75C': {
        '22': 3, '20': 5, '18': 7, '16': 18,
        '14': 20, '12': 25, '10': 35, '8': 50, '6': 65, '4': 85, '3': 100,
        '2': 115, '1': 130, '1/0': 150, '2/0': 175, '3/0': 200, '4/0': 230,
        '250': 255, '300': 285, '350': 310, '400': 335, '500': 380,
        '600': 420, '700': 460, '750': 475
      },
      '90C': {
        '22': 3, '20': 5, '18': 7, '16': 18,
        '14': 25, '12': 30, '10': 40, '8': 55, '6': 75, '4': 95, '3': 115,
        '2': 130, '1': 150, '1/0': 170, '2/0': 195, '3/0': 225, '4/0': 260,
        '250': 290, '300': 320, '350': 350, '400': 380, '500': 430,
        '600': 475, '700': 520, '750': 535
      }
    },
    aluminum: {
      '60C': {
        '12': 15, '10': 25, '8': 30, '6': 40, '4': 55, '3': 65,
        '2': 75, '1': 85, '1/0': 100, '2/0': 115, '3/0': 130, '4/0': 150,
        '250': 170, '300': 190, '350': 210, '400': 225, '500': 260,
        '600': 285, '700': 310, '750': 320
      },
      '75C': {
        '12': 20, '10': 30, '8': 40, '6': 50, '4': 65, '3': 75,
        '2': 90, '1': 100, '1/0': 120, '2/0': 135, '3/0': 155, '4/0': 180,
        '250': 205, '300': 230, '350': 250, '400': 270, '500': 310,
        '600': 340, '700': 375, '750': 385
      },
      '90C': {
        '12': 25, '10': 35, '8': 45, '6': 60, '4': 75, '3': 85,
        '2': 100, '1': 115, '1/0': 135, '2/0': 150, '3/0': 175, '4/0': 205,
        '250': 230, '300': 260, '350': 280, '400': 305, '500': 350,
        '600': 385, '700': 420, '750': 435
      }
    }
  };

  const tempCorrectionFactors = {
    '60C': {
      '10': 1.29, '15': 1.20, '20': 1.11, '25': 1.05, '30': 1.00,
      '35': 0.94, '40': 0.88, '45': 0.82, '50': 0.75, '55': 0.67,
      '60': 0.58, '65': 0.47, '70': 0.33
    },
    '75C': {
      '10': 1.20, '15': 1.15, '20': 1.11, '25': 1.05, '30': 1.00,
      '35': 0.94, '40': 0.88, '45': 0.82, '50': 0.75, '55': 0.67,
      '60': 0.58, '65': 0.47, '70': 0.33, '75': 0.00
    },
    '90C': {
      '10': 1.15, '15': 1.12, '20': 1.08, '25': 1.04, '30': 1.00,
      '35': 0.96, '40': 0.91, '45': 0.87, '50': 0.82, '55': 0.76,
      '60': 0.71, '65': 0.65, '70': 0.58, '75': 0.50, '80': 0.41,
      '85': 0.29, '90': 0.00
    }
  };

  const getCommonApplications = (ampacity, wireSize) => {
    if (wireSize === '22') return "Thermostat wiring, doorbells, low-voltage controls";
    if (wireSize === '20') return "Doorbells, security systems, low-voltage controls";
    if (wireSize === '18') return "Thermostats, lighting controls, doorbells, signaling circuits";
    if (wireSize === '16') return "Electronics, lighting control systems, doorbells, low-voltage applications";
    
    if (ampacity <= 15) return "Lighting circuits, small appliances";
    if (ampacity <= 20) return "Lighting circuits, small appliances";
    if (ampacity <= 25) return "General outlets, lighting circuits";
    if (ampacity <= 30) return "Small appliances, dryers (240V)";
    if (ampacity <= 40) return "Electric ranges, large appliances";
    if (ampacity <= 50) return "Electric ranges, welders, heat pumps";
    if (ampacity <= 100) return "Sub-panels, large motors";
    if (ampacity <= 200) return "Main panels, large commercial loads";
    return "Service entrances, industrial applications";
  };

  const getOCPDLimit = (size, material) => {
    const limits = {
      copper: { '14': 15, '12': 20, '10': 30 },
      aluminum: { '12': 15, '10': 25 }
    };
    return limits[material]?.[size] || null;
  };

  const getCurrentAmpacity = () => {
    return ampacityData[wireType][tempRating][wireSize] || 0;
  };

  const calculateDeratedAmpacity = () => {
    let baseAmpacity = currentAmpacity;
    
    const tempFactor = tempCorrectionFactors[tempRating][ambientTemp] || 1.00;
    
    let conductorFactor = 1.00;
    const numCond = parseInt(numConductors);
    if (numCond <= 3) conductorFactor = 1.00;
    else if (numCond <= 6) conductorFactor = 0.80;
    else if (numCond <= 9) conductorFactor = 0.70;
    else if (numCond <= 20) conductorFactor = 0.50;
    else if (numCond <= 30) conductorFactor = 0.45;
    else if (numCond <= 40) conductorFactor = 0.40;
    else conductorFactor = 0.35;
    
    let deratedAmpacity = baseAmpacity * tempFactor * conductorFactor;
    
    let continuousAmpacity = deratedAmpacity;
    if (continuousLoad) {
      continuousAmpacity = deratedAmpacity * 0.8;
    }
    
    return {
      base: baseAmpacity,
      tempFactor,
      conductorFactor,
      derated: Math.round(deratedAmpacity * 10) / 10,
      continuous: Math.round(continuousAmpacity * 10) / 10
    };
  };

  const currentAmpacity = getCurrentAmpacity();
  const ocpdLimit = getOCPDLimit(wireSize, wireType);
  const deratingResults = calculateDeratedAmpacity();
  const hasDerating = deratingResults.tempFactor !== 1.00 || deratingResults.conductorFactor !== 1.00 || continuousLoad;

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      const getTempLabel = (temp) => {
        const labels = {
          '60C': '60°C (140°F)',
          '75C': '75°C (167°F)',
          '90C': '90°C (194°F)'
        };
        return labels[temp] || temp;
      };

      const getAmbientTempLabel = (temp) => {
        const temps = {
          '10': '10°C (50°F)',
          '15': '15°C (59°F)',
          '20': '20°C (68°F)',
          '25': '25°C (77°F)',
          '30': '30°C (86°F)',
          '35': '35°C (95°F)',
          '40': '40°C (104°F)',
          '45': '45°C (113°F)',
          '50': '50°C (122°F)'
        };
        return temps[temp] || `${temp}°C`;
      };

      const pdfData = {
        calculatorName: 'Ampacity Lookup Calculator',
        inputs: {
          wireSize: wireSize.includes('/') ? `${wireSize} AWG` : `${wireSize} ${parseInt(wireSize) <= 16 ? 'AWG' : 'kcmil'}`,
          wireMaterial: wireType.charAt(0).toUpperCase() + wireType.slice(1),
          temperatureRating: getTempLabel(tempRating),
          ambientTemperature: getAmbientTempLabel(ambientTemp),
          currentCarryingConductors: numConductors,
          continuousLoad: continuousLoad ? 'Yes (3+ hours)' : 'No'
        },
        results: {
          baseAmpacity: `${deratingResults.base} A`,
          deratedAmpacity: hasDerating ? `${deratingResults.derated} A` : 'N/A (no derating applied)',
          finalAmpacity: `${continuousLoad ? deratingResults.continuous : (hasDerating ? deratingResults.derated : deratingResults.base)} A`,
          ocpdLimit: ocpdLimit ? `${ocpdLimit} A (NEC 240.4(D))` : 'No special limit',
          commonApplications: getCommonApplications(currentAmpacity, wireSize)
        },
        additionalInfo: {
          temperatureCorrectionFactor: `×${deratingResults.tempFactor.toFixed(2)}`,
          conductorAdjustmentFactor: `×${deratingResults.conductorFactor.toFixed(2)}`,
          continuousLoadFactor: continuousLoad ? '×0.80' : 'Not applied',
          deratingApplied: hasDerating ? 'Yes' : 'No'
        },
        necReferences: [
          'NEC Table 310.16 - Allowable Ampacities of Insulated Conductors',
          'NEC 310.15(B)(2)(a) - Temperature Correction Factors',
          'NEC 310.15(B)(3)(a) - Conductor Bundling Adjustment Factors',
          ocpdLimit ? 'NEC 240.4(D) - Small Conductor Overcurrent Protection' : null,
          continuousLoad ? 'NEC 210.19(A)(1) - Continuous Load Sizing (125% factor)' : null
        ].filter(Boolean)
      };

      exportToPDF(pdfData);
    }
  }));

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      

      {/* Wire Selection */}
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
          Wire Selection
        </h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText,
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
                fontSize: '0.9375rem',
                border: `1px solid ${colors.inputBorder}`,
                borderRadius: '8px',
                backgroundColor: colors.inputBg,
                color: colors.cardText,
                boxSizing: 'border-box'
              }}
            >
              <option value="22">22 AWG</option>
              <option value="20">20 AWG</option>
              <option value="18">18 AWG</option>
              <option value="16">16 AWG</option>
              <option value="14">14 AWG</option>
              <option value="12">12 AWG</option>
              <option value="10">10 AWG</option>
              <option value="8">8 AWG</option>
              <option value="6">6 AWG</option>
              <option value="4">4 AWG</option>
              <option value="3">3 AWG</option>
              <option value="2">2 AWG</option>
              <option value="1">1 AWG</option>
              <option value="1/0">1/0 AWG</option>
              <option value="2/0">2/0 AWG</option>
              <option value="3/0">3/0 AWG</option>
              <option value="4/0">4/0 AWG</option>
              <option value="250">250 kcmil</option>
              <option value="300">300 kcmil</option>
              <option value="350">350 kcmil</option>
              <option value="400">400 kcmil</option>
              <option value="500">500 kcmil</option>
              <option value="600">600 kcmil</option>
              <option value="700">700 kcmil</option>
              <option value="750">750 kcmil</option>
            </select>
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
                Wire Material
              </label>
              <select 
                value={wireType} 
                onChange={(e) => setWireType(e.target.value)}
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
                <option value="copper">Copper</option>
                <option value="aluminum">Aluminum</option>
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
                Temperature Rating
              </label>
              <select 
                value={tempRating} 
                onChange={(e) => setTempRating(e.target.value)}
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
                <option value="60C">60°C (140°F)</option>
                <option value="75C">75°C (167°F)</option>
                <option value="90C">90°C (194°F)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Derating Factors */}
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
          Derating Factors (Optional)
        </h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText,
                marginBottom: '0.5rem' 
              }}>
                Ambient Temp (°C)
              </label>
              <select 
                value={ambientTemp} 
                onChange={(e) => setAmbientTemp(e.target.value)}
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
                <option value="10">10°C (50°F)</option>
                <option value="15">15°C (59°F)</option>
                <option value="20">20°C (68°F)</option>
                <option value="25">25°C (77°F)</option>
                <option value="30">30°C (86°F) - Standard</option>
                <option value="35">35°C (95°F)</option>
                <option value="40">40°C (104°F)</option>
                <option value="45">45°C (113°F)</option>
                <option value="50">50°C (122°F)</option>
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
                Current-Carrying Conductors
              </label>
              <input
                type="number"
                value={numConductors}
                onChange={(e) => setNumConductors(e.target.value)}
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
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={continuousLoad} 
              onChange={(e) => setContinuousLoad(e.target.checked)}
              style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.labelText }}>
              Continuous Load (3+ hours) - Apply 80% factor
            </span>
          </label>

          <div style={{
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            border: `1px solid ${colors.cardBorder}`
          }}>
            <h4 style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: colors.cardText,
              marginTop: 0,
              marginBottom: '0.75rem'
            }}>
              Applied Factors
            </h4>
            <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem', color: colors.labelText }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Temperature Factor:</span>
                <span style={{ fontWeight: '600', color: colors.cardText }}>
                  ×{deratingResults.tempFactor.toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Conductor Adjustment:</span>
                <span style={{ fontWeight: '600', color: colors.cardText }}>
                  ×{deratingResults.conductorFactor.toFixed(2)}
                </span>
              </div>
              {continuousLoad && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Continuous Load:</span>
                  <span style={{ fontWeight: '600', color: colors.cardText }}>
                    ×0.80
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
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
          Results
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: hasDerating ? 'repeat(3, 1fr)' : '1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
              Base Ampacity
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
              {deratingResults.base} A
            </div>
          </div>
          
          {hasDerating && (
            <>
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Derated Ampacity
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {deratingResults.derated} A
                </div>
              </div>
              
              <div style={{
                background: '#dbeafe',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                  {continuousLoad ? 'Final Ampacity' : 'Final Ampacity'}
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                  {continuousLoad ? deratingResults.continuous : deratingResults.derated} A
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{
          background: '#d1fae5',
          border: '1px solid #6ee7b7',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
            <CheckCircle size={20} color="#059669" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            <div style={{ fontSize: '0.875rem', color: '#047857', lineHeight: '1.5', width: '100%' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Wire:</strong> {wireSize} AWG {wireType}
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Temperature Rating:</strong> {tempRating} ({tempRating === '60C' ? '140°F' : tempRating === '75C' ? '167°F' : '194°F'})
              </div>
            </div>
          </div>
        </div>

        {ocpdLimit && (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: '1.5' }}>
                <strong>NEC 240.4(D) Limit:</strong> {ocpdLimit}A max overcurrent protection
              </div>
            </div>
          </div>
        )}

        <div style={{
          background: colors.sectionBg,
          padding: '1rem',
          borderRadius: '8px',
          border: `1px solid ${colors.cardBorder}`
        }}>
          <div style={{ fontSize: '0.875rem', color: colors.labelText, lineHeight: '1.5' }}>
            <div style={{ fontWeight: '600', color: colors.cardText, marginBottom: '0.5rem' }}>
              Common Applications:
            </div>
            {getCommonApplications(currentAmpacity, wireSize)}
          </div>
        </div>
      </div>
    </div>
  );
});

export default AmpacityLookupCalculator;