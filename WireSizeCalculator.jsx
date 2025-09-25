import React, { useState } from 'react';

function WireSizeCalculator({ onBack }) {
  const [load, setLoad] = useState('');
  const [voltage, setVoltage] = useState('240');
  const [distance, setDistance] = useState('');
  const [voltageDropPercent, setVoltageDropPercent] = useState('3');
  const [wireType, setWireType] = useState('copper');
  const [conduitType, setConduitType] = useState('75C');

  const wireData = {
    copper: {
      '75C': {
        '14': { ampacity: 20, resistance: 3.19 },
        '12': { ampacity: 25, resistance: 2.01 },
        '10': { ampacity: 35, resistance: 1.26 },
        '8': { ampacity: 50, resistance: 0.794 },
        '6': { ampacity: 65, resistance: 0.491 },
        '4': { ampacity: 85, resistance: 0.308 },
        '3': { ampacity: 100, resistance: 0.245 },
        '2': { ampacity: 115, resistance: 0.194 },
        '1': { ampacity: 130, resistance: 0.154 },
        '1/0': { ampacity: 150, resistance: 0.122 },
        '2/0': { ampacity: 175, resistance: 0.097 },
        '3/0': { ampacity: 200, resistance: 0.077 },
        '4/0': { ampacity: 230, resistance: 0.061 }
      }
    },
    aluminum: {
      '75C': {
        '12': { ampacity: 20, resistance: 3.28 },
        '10': { ampacity: 30, resistance: 2.07 },
        '8': { ampacity: 40, resistance: 1.30 },
        '6': { ampacity: 50, resistance: 0.808 },
        '4': { ampacity: 65, resistance: 0.508 },
        '3': { ampacity: 75, resistance: 0.403 },
        '2': { ampacity: 90, resistance: 0.319 },
        '1': { ampacity: 100, resistance: 0.253 },
        '1/0': { ampacity: 120, resistance: 0.201 },
        '2/0': { ampacity: 135, resistance: 0.159 },
        '3/0': { ampacity: 155, resistance: 0.126 },
        '4/0': { ampacity: 180, resistance: 0.100 }
      }
    }
  };

  const calculateWireSize = () => {
    const current = parseFloat(load) / parseFloat(voltage);
    const maxVoltageDropVolts = (parseFloat(voltage) * parseFloat(voltageDropPercent)) / 100;
    const dist = parseFloat(distance);
    
    if (!current || !dist || !maxVoltageDropVolts) {
      return null;
    }

    const wires = wireData[wireType][conduitType];
    let recommendations = [];

    Object.entries(wires).forEach(([size, data]) => {
      const voltageDropActual = (2 * current * dist * data.resistance) / 1000;
      const voltageDropPercent = (voltageDropActual / parseFloat(voltage)) * 100;
      
      recommendations.push({
        size,
        ampacity: data.ampacity,
        voltageDrop: voltageDropActual.toFixed(2),
        voltageDropPercent: voltageDropPercent.toFixed(2),
        meetsAmpacity: data.ampacity >= current,
        meetsVoltageDrop: voltageDropActual <= maxVoltageDropVolts,
        current: current.toFixed(1)
      });
    });

    // Sort by wire size (smaller numbers first, then /0 sizes)
    recommendations.sort((a, b) => {
      const aNum = a.size.includes('/') ? parseInt(a.size.split('/')[0]) + 100 : parseInt(a.size);
      const bNum = b.size.includes('/') ? parseInt(b.size.split('/')[0]) + 100 : parseInt(b.size);
      return aNum - bNum;
    });

    return recommendations;
  };

  const results = calculateWireSize();
  const recommendedWire = results?.find(wire => wire.meetsAmpacity && wire.meetsVoltageDrop);

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={onBack} style={{ padding: '10px 20px' }}>
          ← Back to Menu
        </button>
      </div>
      
      <h2>Wire Size Calculator</h2>
      <p style={{ fontSize: '14px', color: '#666' }}>
        Calculate minimum wire size for load and voltage drop
      </p>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Load (Watts): </label>
        <input 
          type="number" 
          value={load} 
          onChange={(e) => setLoad(e.target.value)}
          placeholder="e.g., 3000"
        />
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Voltage: </label>
        <select 
          value={voltage} 
          onChange={(e) => setVoltage(e.target.value)}
        >
          <option value="120">120V</option>
          <option value="240">240V</option>
          <option value="208">208V</option>
          <option value="480">480V</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Distance (feet): </label>
        <input 
          type="number" 
          value={distance} 
          onChange={(e) => setDistance(e.target.value)}
          placeholder="e.g., 100"
        />
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Max Voltage Drop: </label>
        <select 
          value={voltageDropPercent} 
          onChange={(e) => setVoltageDropPercent(e.target.value)}
        >
          <option value="3">3% (NEC Recommended)</option>
          <option value="5">5% (NEC Maximum)</option>
          <option value="2">2% (Conservative)</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '10px' }}>
        <label>Wire Material: </label>
        <select 
          value={wireType} 
          onChange={(e) => setWireType(e.target.value)}
        >
          <option value="copper">Copper</option>
          <option value="aluminum">Aluminum</option>
        </select>
      </div>
      
      {results && (
        <div style={{ 
          backgroundColor: '#f0f0f0', 
          padding: '15px', 
          borderRadius: '5px',
          marginTop: '20px'
        }}>
          <h3>Results:</h3>
          <div>Load Current: {results[0]?.current}A</div>
          {recommendedWire ? (
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#d4edda', borderRadius: '5px' }}>
              <strong>Recommended: {recommendedWire.size} AWG</strong>
              <div>Ampacity: {recommendedWire.ampacity}A</div>
              <div>Voltage Drop: {recommendedWire.voltageDrop}V ({recommendedWire.voltageDropPercent}%)</div>
            </div>
          ) : (
            <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8d7da', borderRadius: '5px' }}>
              <strong>No suitable wire size found</strong>
              <div>Try larger voltage or shorter distance</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default WireSizeCalculator;