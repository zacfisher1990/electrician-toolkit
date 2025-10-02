import React, { useState } from 'react';

function AmpacityLookupCalculator({ onBack }) {
  const [wireSize, setWireSize] = useState('12');
  const [wireType, setWireType] = useState('copper');
  const [tempRating, setTempRating] = useState('75C');

  const ampacityData = {
    copper: {
      '60C': {
        '14': 15, '12': 20, '10': 30, '8': 40, '6': 55, '4': 70, '3': 85,
        '2': 95, '1': 110, '1/0': 125, '2/0': 145, '3/0': 165, '4/0': 195
      },
      '75C': {
        '14': 20, '12': 25, '10': 35, '8': 50, '6': 65, '4': 85, '3': 100,
        '2': 115, '1': 130, '1/0': 150, '2/0': 175, '3/0': 200, '4/0': 230
      },
      '90C': {
        '14': 25, '12': 30, '10': 40, '8': 55, '6': 75, '4': 95, '3': 115,
        '2': 130, '1': 150, '1/0': 170, '2/0': 195, '3/0': 225, '4/0': 260
      }
    },
    aluminum: {
      '60C': {
        '12': 15, '10': 25, '8': 30, '6': 40, '4': 55, '3': 65,
        '2': 75, '1': 85, '1/0': 100, '2/0': 115, '3/0': 130, '4/0': 150
      },
      '75C': {
        '12': 20, '10': 30, '8': 40, '6': 50, '4': 65, '3': 75,
        '2': 90, '1': 100, '1/0': 120, '2/0': 135, '3/0': 155, '4/0': 180
      },
      '90C': {
        '12': 25, '10': 35, '8': 45, '6': 60, '4': 75, '3': 85,
        '2': 100, '1': 115, '1/0': 135, '2/0': 150, '3/0': 175, '4/0': 205
      }
    }
  };

  const getCommonApplications = (ampacity) => {
    if (ampacity <= 15) return "Lighting circuits, small appliances";
    if (ampacity <= 20) return "General outlets, lighting";
    if (ampacity <= 30) return "Small appliances, dryers (240V)";
    if (ampacity <= 40) return "Electric ranges, large appliances";
    if (ampacity <= 50) return "Electric ranges, welders";
    if (ampacity <= 100) return "Sub-panels, large motors";
    if (ampacity <= 200) return "Main panels, large commercial loads";
    return "Service entrances, industrial applications";
  };

  const getOCPDLimit = (size, material) => {
    // NEC 240.4(D) overcurrent protection limits
    const limits = {
      copper: { '14': 15, '12': 20, '10': 30 },
      aluminum: { '12': 15, '10': 25 }
    };
    return limits[material]?.[size] || null;
  };

  const getCurrentAmpacity = () => {
    return ampacityData[wireType][tempRating][wireSize] || 0;
  };

  const currentAmpacity = getCurrentAmpacity();
  const ocpdLimit = getOCPDLimit(wireSize, wireType);

  return (
    <div className="calculator-container">
      {onBack && (
        <button onClick={onBack} style={{ marginBottom: '20px' }}>
          ← Back to Menu
        </button>
      )}
      
      <h2>Ampacity Lookup</h2>
      <p className="small">
        Wire ampacity ratings per NEC Table 310.16
      </p>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Wire Size:</label>
        <select 
          value={wireSize} 
          onChange={(e) => setWireSize(e.target.value)}
        >
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
        </select>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Wire Material:</label>
        <select 
          value={wireType} 
          onChange={(e) => setWireType(e.target.value)}
        >
          <option value="copper">Copper</option>
          <option value="aluminum">Aluminum</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Temperature Rating:</label>
        <select 
          value={tempRating} 
          onChange={(e) => setTempRating(e.target.value)}
        >
          <option value="60C">60°C (140°F) - TW, UF</option>
          <option value="75C">75°C (167°F) - THWN, XHHW</option>
          <option value="90C">90°C (194°F) - THHN, XHHW-2</option>
        </select>
      </div>
      
      <div className="result">
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#1e3a8a' }}>Results:</h3>
        
        <div style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#1e3a8a',
          marginBottom: '15px',
          padding: '15px',
          backgroundColor: '#eff6ff',
          borderRadius: '8px',
          border: '2px solid #3b82f6'
        }}>
          {currentAmpacity} Amperes
        </div>
        
        <div style={{ color: '#374151', marginBottom: '10px' }}>
          <strong>Wire:</strong> {wireSize} AWG {wireType}
        </div>
        
        <div style={{ color: '#374151', marginBottom: '10px' }}>
          <strong>Temperature Rating:</strong> {tempRating} ({tempRating === '60C' ? '140°F' : tempRating === '75C' ? '167°F' : '194°F'})
        </div>
        
        {ocpdLimit && (
          <div style={{ 
            color: '#374151', 
            marginBottom: '15px',
            padding: '10px',
            backgroundColor: '#fef3c7',
            borderRadius: '6px',
            border: '1px solid #fbbf24'
          }}>
            <strong>⚠️ NEC 240.4(D) Limit:</strong> {ocpdLimit}A max overcurrent protection
          </div>
        )}
        
        <div style={{ 
          color: '#374151',
          marginBottom: '15px',
          paddingTop: '15px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <strong>Common Applications:</strong>
          <div style={{ marginTop: '5px', color: '#6b7280' }}>
            {getCommonApplications(currentAmpacity)}
          </div>
        </div>
        
        <div style={{ 
          fontSize: '13px', 
          color: '#374151',
          backgroundColor: '#f8fafc',
          padding: '12px',
          borderRadius: '6px',
          marginTop: '15px'
        }}>
          <strong>Derating Required When:</strong>
          <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
            <li>Ambient temperature exceeds 86°F (30°C)</li>
            <li>More than 3 current-carrying conductors in raceway</li>
            <li>Continuous loads (multiply ampacity by 0.8 or 80%)</li>
          </ul>
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: '#eff6ff', 
        padding: '15px', 
        borderRadius: '8px',
        marginTop: '20px',
        fontSize: '13px',
        color: '#374151'
      }}>
        <strong>Quick Reference (75°C Copper):</strong>
        <div style={{ marginTop: '8px', display: 'grid', gap: '5px' }}>
          <div>14 AWG: 20A (15A max OCPD) - Lighting circuits</div>
          <div>12 AWG: 25A (20A max OCPD) - General receptacles</div>
          <div>10 AWG: 35A (30A max OCPD) - Dryers, small AC units</div>
          <div>8 AWG: 50A - Electric ranges, heat pumps</div>
          <div>6 AWG: 65A - Large appliances, sub-panels</div>
        </div>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#374151'
      }}>
        <strong>NEC References:</strong>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Table 310.16 - Allowable ampacities of insulated conductors</li>
          <li>240.4(D) - Small conductor overcurrent protection limits</li>
          <li>310.15(B) - Adjustment factors for ambient temperature and bundling</li>
          <li>210.19(A) - Continuous loads require 125% conductor capacity</li>
        </ul>
      </div>
    </div>
  );
}

export default AmpacityLookupCalculator;
