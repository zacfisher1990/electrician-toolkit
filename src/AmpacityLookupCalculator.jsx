import React, { useState } from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

function AmpacityLookupCalculator({ onBack }) {
  const [wireSize, setWireSize] = useState('12');
  const [wireType, setWireType] = useState('copper');
  const [tempRating, setTempRating] = useState('75C');
  const [ambientTemp, setAmbientTemp] = useState('30');
  const [numConductors, setNumConductors] = useState('3');
  const [continuousLoad, setContinuousLoad] = useState(false);

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

  // Temperature correction factors (NEC Table 310.15(B)(1))
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
    
    // Temperature correction
    const tempFactor = tempCorrectionFactors[tempRating][ambientTemp] || 1.00;
    
    // Conductor adjustment
    let conductorFactor = 1.00;
    const numCond = parseInt(numConductors);
    if (numCond <= 3) conductorFactor = 1.00;
    else if (numCond <= 6) conductorFactor = 0.80;
    else if (numCond <= 9) conductorFactor = 0.70;
    else if (numCond <= 20) conductorFactor = 0.50;
    else if (numCond <= 30) conductorFactor = 0.45;
    else if (numCond <= 40) conductorFactor = 0.40;
    else conductorFactor = 0.35;
    
    // Apply derating
    let deratedAmpacity = baseAmpacity * tempFactor * conductorFactor;
    
    // Continuous load (80% rule)
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
          <AlertTriangle size={32} />
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Ampacity Lookup</h1>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>Wire ampacity ratings per NEC Table 310.16</p>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Wire Size
            </label>
            <select 
              value={wireSize} 
              onChange={(e) => setWireSize(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
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

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Wire Material
            </label>
            <select 
              value={wireType} 
              onChange={(e) => setWireType(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            >
              <option value="copper">Copper</option>
              <option value="aluminum">Aluminum</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Temperature Rating
            </label>
            <select 
              value={tempRating} 
              onChange={(e) => setTempRating(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            >
              <option value="60C">60°C (140°F) - TW, UF</option>
              <option value="75C">75°C (167°F) - THWN, XHHW</option>
              <option value="90C">90°C (194°F) - THHN, XHHW-2</option>
            </select>
          </div>
        </div>

        {/* Derating Factors Section */}
        <div style={{ 
          background: '#f1f5f9',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          border: '2px solid #cbd5e1',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontWeight: 'bold', color: '#374151', marginTop: 0, marginBottom: '1rem' }}>
            Derating Factors (Optional)
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Ambient Temperature (°C)
              </label>
              <select 
                value={ambientTemp} 
                onChange={(e) => setAmbientTemp(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem' }}
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
                <option value="55">55°C (131°F)</option>
                <option value="60">60°C (140°F)</option>
              </select>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Current-Carrying Conductors
              </label>
              <input
                type="number"
                value={numConductors}
                onChange={(e) => setNumConductors(e.target.value)}
                min="1"
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem', fontSize: '0.875rem' }}
              />
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0.25rem 0 0 0' }}>
                In same raceway/cable (excludes grounds)
              </p>
            </div>
          </div>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={continuousLoad} 
              onChange={(e) => setContinuousLoad(e.target.checked)}
              style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#374151' }}>
              Continuous Load (3+ hours) - Apply 80% factor
            </span>
          </label>
        </div>

        {/* Results Box */}
        <div style={{ 
          background: '#dcfce7', 
          border: '2px solid #16a34a', 
          padding: '1.5rem', 
          borderRadius: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          <h3 style={{ fontWeight: 'bold', color: '#166534', marginTop: 0, marginBottom: '1rem' }}>
            Results
          </h3>
          
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#16a34a',
            marginBottom: '0.5rem',
            padding: '1rem',
            background: 'white',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            {deratingResults.base} Amperes
            <div style={{ fontSize: '0.875rem', fontWeight: 'normal', color: '#15803d', marginTop: '0.5rem' }}>
              Base Ampacity
            </div>
          </div>
          
          {(deratingResults.tempFactor !== 1.00 || deratingResults.conductorFactor !== 1.00 || continuousLoad) && (
            <>
              <div style={{ 
                background: '#fef3c7',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1rem',
                border: '1px solid #fbbf24'
              }}>
                <div style={{ fontWeight: 'bold', color: '#92400e', marginBottom: '0.5rem' }}>
                  Derating Applied:
                </div>
                {deratingResults.tempFactor !== 1.00 && (
                  <div style={{ fontSize: '0.875rem', color: '#78350f', marginBottom: '0.25rem' }}>
                    • Temperature correction: ×{deratingResults.tempFactor.toFixed(2)}
                  </div>
                )}
                {deratingResults.conductorFactor !== 1.00 && (
                  <div style={{ fontSize: '0.875rem', color: '#78350f', marginBottom: '0.25rem' }}>
                    • Conductor adjustment: ×{deratingResults.conductorFactor.toFixed(2)}
                  </div>
                )}
                {continuousLoad && (
                  <div style={{ fontSize: '0.875rem', color: '#78350f' }}>
                    • Continuous load: ×0.80
                  </div>
                )}
              </div>
              
              <div style={{ 
                fontSize: '1.75rem', 
                fontWeight: 'bold', 
                color: '#ea580c',
                marginBottom: '1rem',
                padding: '1rem',
                background: 'white',
                borderRadius: '0.5rem',
                textAlign: 'center',
                border: '2px solid #fb923c'
              }}>
                {continuousLoad ? deratingResults.continuous : deratingResults.derated} Amperes
                <div style={{ fontSize: '0.875rem', fontWeight: 'normal', color: '#c2410c', marginTop: '0.5rem' }}>
                  {continuousLoad ? 'Final Derated Ampacity (with continuous load)' : 'Derated Ampacity'}
                </div>
              </div>
            </>
          )}
          
          <div style={{ color: '#14532d', marginBottom: '0.75rem' }}>
            <strong>Wire:</strong> {wireSize} AWG {wireType}
          </div>
          
          <div style={{ color: '#14532d', marginBottom: '1rem' }}>
            <strong>Temperature Rating:</strong> {tempRating} ({tempRating === '60C' ? '140°F' : tempRating === '75C' ? '167°F' : '194°F'})
          </div>
          
          {ocpdLimit && (
            <div style={{ 
              color: '#92400e', 
              marginBottom: '1rem',
              padding: '0.75rem',
              background: '#fef3c7',
              borderRadius: '0.375rem',
              border: '1px solid #fbbf24'
            }}>
              <strong>⚠ NEC 240.4(D) Limit:</strong> {ocpdLimit}A max overcurrent protection
            </div>
          )}
          
          <div style={{ 
            color: '#14532d',
            paddingTop: '1rem',
            borderTop: '1px solid #bbf7d0'
          }}>
            <strong>Common Applications:</strong>
            <div style={{ marginTop: '0.5rem', color: '#15803d' }}>
              {getCommonApplications(currentAmpacity, wireSize)}
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <div style={{ 
          background: '#dbeafe',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #93c5fd'
        }}>
          <strong style={{ color: '#1e3a8a', display: 'block', marginBottom: '0.5rem' }}>Quick Reference (75°C Copper):</strong>
          <div style={{ fontSize: '0.875rem', color: '#1e40af' }}>
            <div style={{ marginBottom: '0.25rem' }}>14 AWG: 20A (15A max OCPD) - Lighting circuits</div>
            <div style={{ marginBottom: '0.25rem' }}>12 AWG: 25A (20A max OCPD) - General receptacles</div>
            <div style={{ marginBottom: '0.25rem' }}>10 AWG: 35A (30A max OCPD) - Dryers, small AC units</div>
            <div style={{ marginBottom: '0.25rem' }}>8 AWG: 50A - Electric ranges, heat pumps</div>
            <div>6 AWG: 65A - Large appliances, sub-panels</div>
          </div>
        </div>
      </div>

      <div style={{ background: '#1e293b', color: '#cbd5e1', padding: '1.5rem', borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem', fontSize: '0.875rem' }}>
        <p style={{ fontWeight: '600', marginTop: 0, marginBottom: '0.75rem' }}>NEC References:</p>
        <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
          <li style={{ marginBottom: '0.25rem' }}>Table 310.16 - Allowable ampacities of insulated conductors</li>
          <li style={{ marginBottom: '0.25rem' }}>240.4(D) - Small conductor overcurrent protection limits</li>
          <li style={{ marginBottom: '0.25rem' }}>Table 310.15(B)(1) - Temperature correction factors</li>
          <li style={{ marginBottom: '0.25rem' }}>Table 310.15(C)(1) - Adjustment factors for multiple conductors</li>
          <li>210.19(A) - Continuous loads require 125% conductor capacity</li>
        </ul>
      </div>
    </div>
  );
}

export default AmpacityLookupCalculator;
