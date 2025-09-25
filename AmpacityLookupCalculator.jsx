import React, { useState } from 'react';

function AmpacityLookupCalculator({ onBack }) {
  const [wireSize, setWireSize] = useState('12');
  const [wireType, setWireType] = useState('copper');
  const [tempRating, setTempRating] = useState('75C');
  const [installationType, setInstallationType] = useState('raceway');

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

  const deratingFactors = {
    temperature: {
      '86-95F': 0.82,
      '96-104F': 0.71,
      '105-113F': 0.58,
      '114-122F': 0.41,
      '123-131F': 0.00
    },
    bundling: {
      '4-6': 0.80,
      '7-9': 0.70,
      '10-20': 0.50,
      '21-30': 0.45,
      '31-40': 0.40,
      '41+': 0.35
    }
  };

  const getCurrentAmpacity = () => {
    return ampacityData[wireType][tempRating][wireSize] || 0;
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

  const currentAmpacity = getCurrentAmpacity();

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={onBack} style={{ padding: '10px 20px' }}>
          ← Back to Menu
        </button>
      </div>
      
      <h2>Ampacity Lookup</h2>
      <p style={{ fontSize: '14px', color: '#666' }}>
        Wire ampacity ratings per NEC Table 310.16
      </p>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Wire Size: </label>
        <select 
          value={wireSize} 
          onChange={(e) => setWireSize(e.target.value)}
          style={{ width: '100%', padding: '5px' }}
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
      
      <div style={{ marginBottom: '10px' }}>
        <label>Wire Material: </label>
        <select 
          value={wireType} 
          onChange={(e) => setWireType(e.target.value)}
          style={{ width: '100%', padding: '5px' }}
        >
          <option value="copper">Copper</option>
          <option value="aluminum">Aluminum</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label>Temperature Rating: </label>
        <select 
          value={tempRating} 
          onChange={(e) => setTempRating(e.target.value)}
          style={{ width: '100%', padding: '5px' }}
        >
          <option value="60C">60°C (140°F) - TW, UF</option>
          <option value="75C">75°C (167°F) - THWN, XHHW</option>
          <option value="90C">90°C (194°F) - THHN, XHHW-2</option>
        </select>
      </div>
      
      <div style={{ 
        backgroundColor: '#f0f0f0', 
        padding: '15px', 
        borderRadius: '5px'
      }}>
        <h3>Results:</h3>
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#007bff', marginBottom: '10px' }}>
          {currentAmpacity} Amperes
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Wire:</strong> {wireSize} AWG {wireType}
        </div>
        <div style={{ marginBottom: '10px' }}>
          <strong>Rating:</strong> {tempRating} ({tempRating === '60C' ? '140°F' : tempRating === '75C' ? '167°F' : '194°F'})
        </div>
        <div style={{ marginBottom: '15px' }}>
          <strong>Common Uses:</strong><br />
          {getCommonApplications(currentAmpacity)}
        </div>
        
        <div style={{ fontSize: '12px', color: '#666', marginTop: '15px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
          <strong>Derating Required When:</strong><br />
          • Ambient temp > 86°F (multiply by factor)<br />
          • More than 3 current-carrying conductors<br />
          • Continuous loads (multiply by 0.8)<br />
        </div>
      </div>
      
      <div style={{ 
        backgroundColor: '#e8f4ff', 
        padding: '10px', 
        borderRadius: '5px',
        marginTop: '15px',
        fontSize: '12px'
      }}>
        <strong>Quick Reference:</strong><br />
        12 AWG: 20A (outlets) | 10 AWG: 30A (dryer) | 8 AWG: 40A (range)
      </div>
    </div>
  );
}

export default AmpacityLookupCalculator;