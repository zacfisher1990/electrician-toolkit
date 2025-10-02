import React, { useState } from 'react';

function WireSizeCalculator({ onBack }) {
  const [current, setCurrent] = useState('');
  const [voltage, setVoltage] = useState('240');
  const [distance, setDistance] = useState('');
  const [voltageDropPercent, setVoltageDropPercent] = useState('3');
  const [wireType, setWireType] = useState('copper');
  const [conduitType, setConduitType] = useState('75C');

  // NEC 240.4(D) overcurrent protection limits and Table 310.16 ampacities
  const wireData = {
    copper: {
      '75C': {
        '14': { ampacity: 20, maxOCPD: 15, resistance: 3.19 },
        '12': { ampacity: 25, maxOCPD: 20, resistance: 2.01 },
        '10': { ampacity: 35, maxOCPD: 30, resistance: 1.26 },
        '8': { ampacity: 50, maxOCPD: 50, resistance: 0.794 },
        '6': { ampacity: 65, maxOCPD: 65, resistance: 0.491 },
        '4': { ampacity: 85, maxOCPD: 85, resistance: 0.308 },
        '3': { ampacity: 100, maxOCPD: 100, resistance: 0.245 },
        '2': { ampacity: 115, maxOCPD: 115, resistance: 0.194 },
        '1': { ampacity: 130, maxOCPD: 130, resistance: 0.154 },
        '1/0': { ampacity: 150, maxOCPD: 150, resistance: 0.122 },
        '2/0': { ampacity: 175, maxOCPD: 175, resistance: 0.097 },
        '3/0': { ampacity: 200, maxOCPD: 200, resistance: 0.077 },
        '4/0': { ampacity: 230, maxOCPD: 230, resistance: 0.061 }
      }
    },
    aluminum: {
      '75C': {
        '12': { ampacity: 20, maxOCPD: 15, resistance: 3.28 },
        '10': { ampacity: 30, maxOCPD: 25, resistance: 2.07 },
        '8': { ampacity: 40, maxOCPD: 40, resistance: 1.30 },
        '6': { ampacity: 50, maxOCPD: 50, resistance: 0.808 },
        '4': { ampacity: 65, maxOCPD: 65, resistance: 0.508 },
        '3': { ampacity: 75, maxOCPD: 75, resistance: 0.403 },
        '2': { ampacity: 90, maxOCPD: 90, resistance: 0.319 },
        '1': { ampacity: 100, maxOCPD: 100, resistance: 0.253 },
        '1/0': { ampacity: 120, maxOCPD: 120, resistance: 0.201 },
        '2/0': { ampacity: 135, maxOCPD: 135, resistance: 0.159 },
        '3/0': { ampacity: 155, maxOCPD: 155, resistance: 0.126 },
        '4/0': { ampacity: 180, maxOCPD: 180, resistance: 0.100 }
      }
    }
  };

  const calculateWireSize = () => {
    const amps = parseFloat(current);
    const maxVoltageDropVolts = (parseFloat(voltage) * parseFloat(voltageDropPercent)) / 100;
    const dist = parseFloat(distance);
    
    if (!amps || !dist || !maxVoltageDropVolts) {
      return null;
    }

    const wires = wireData[wireType][conduitType];
    let recommendations = [];

    Object.entries(wires).forEach(([size, data]) => {
      // Voltage drop formula: VD = (2 × L × R × I) / 1000
      // Where L is one-way distance in feet, R is resistance in ohms per 1000ft, I is current in amps
      const voltageDropActual = (2 * dist * data.resistance * amps) / 1000;
      const voltageDropPercent = (voltageDropActual / parseFloat(voltage)) * 100;
      
      recommendations.push({
        size,
        ampacity: data.ampacity,
        maxOCPD: data.maxOCPD,
        voltageDrop: voltageDropActual.toFixed(2),
        voltageDropPercent: voltageDropPercent.toFixed(2),
        meetsAmpacity: data.ampacity >= amps,
        meetsOCPD: data.maxOCPD >= amps, // NEC 240.4(D) requirement
        meetsVoltageDrop: voltageDropActual <= maxVoltageDropVolts,
        current: amps.toFixed(1)
      });
    });

    // Sort by wire size (smallest wire first: 14, 12, 10, 8, 6, 4, 3, 2, 1, 1/0, 2/0, 3/0, 4/0)
    const sizeOrder = ['14', '12', '10', '8', '6', '4', '3', '2', '1', '1/0', '2/0', '3/0', '4/0'];
    recommendations.sort((a, b) => {
      return sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size);
    });

    return recommendations;
  };

  const results = calculateWireSize();
  // Find the smallest wire that meets ampacity, OCPD limits (NEC 240.4(D)), AND voltage drop
  const recommendedWire = results?.find(wire => wire.meetsAmpacity && wire.meetsOCPD && wire.meetsVoltageDrop);

  return (
    <div className="calculator-container">
      {onBack && (
        <button onClick={onBack} style={{ marginBottom: '20px' }}>
          ← Back to Menu
        </button>
      )}
      
      <h2>Wire Size Calculator</h2>
      <p className="small">
        Calculate minimum wire size for load and voltage drop
      </p>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Load Current (Amps):</label>
        <input 
          type="number" 
          value={current} 
          onChange={(e) => setCurrent(e.target.value)}
          placeholder="e.g., 20"
        />
        <div className="small">Enter the actual load current in amperes</div>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Voltage:</label>
        <select 
          value={voltage} 
          onChange={(e) => setVoltage(e.target.value)}
        >
          <option value="120">120V</option>
          <option value="208">208V</option>
          <option value="240">240V</option>
          <option value="277">277V</option>
          <option value="480">480V</option>
        </select>
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Distance (feet):</label>
        <input 
          type="number" 
          value={distance} 
          onChange={(e) => setDistance(e.target.value)}
          placeholder="e.g., 100"
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label>Max Voltage Drop:</label>
        <select 
          value={voltageDropPercent} 
          onChange={(e) => setVoltageDropPercent(e.target.value)}
        >
          <option value="3">3% (NEC Recommended)</option>
          <option value="5">5% (NEC Maximum)</option>
          <option value="2">2% (Conservative)</option>
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
      
      {results && (
        <div className="result">
          <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#1e3a8a' }}>Results:</h3>
          <div style={{ color: '#374151', marginBottom: '15px' }}>
            <strong>Load Current:</strong> {results[0]?.current}A
          </div>
          
          {recommendedWire ? (
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#ecfdf5', 
              border: '2px solid #10b981',
              borderRadius: '8px',
              color: '#065f46'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                Recommended: {recommendedWire.size} AWG {wireType}
              </div>
              <div style={{ color: '#374151' }}>
                <strong>Ampacity:</strong> {recommendedWire.ampacity}A (Max OCPD: {recommendedWire.maxOCPD}A)
              </div>
              <div style={{ color: '#374151' }}>
                <strong>Voltage Drop:</strong> {recommendedWire.voltageDrop}V ({recommendedWire.voltageDropPercent}%)
              </div>
              <div style={{ 
                marginTop: '10px',
                paddingTop: '10px',
                borderTop: '1px solid #10b981',
                fontSize: '14px',
                color: '#059669'
              }}>
                ✓ Meets ampacity, NEC 240.4(D) OCPD limits, and voltage drop requirements
              </div>
            </div>
          ) : (
            <div style={{ 
              padding: '15px', 
              backgroundColor: '#fef2f2', 
              border: '2px solid #ef4444',
              borderRadius: '8px',
              color: '#dc2626'
            }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
                ⚠️ No suitable wire size found
              </div>
              <div style={{ fontSize: '14px' }}>
                Try using a higher voltage, shorter distance, or accept higher voltage drop percentage
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#374151'
      }}>
        <strong>Wire Sizing Considerations:</strong>
        <ul style={{ textAlign: 'left', paddingLeft: '20px', margin: '10px 0' }}>
          <li>Wire must meet ampacity requirements per NEC Table 310.16</li>
          <li>Wire must comply with NEC 240.4(D) overcurrent protection limits:
            <div style={{ marginLeft: '15px', marginTop: '5px' }}>
              • 14 AWG: 15A max OCPD<br/>
              • 12 AWG: 20A max OCPD<br/>
              • 10 AWG: 30A max OCPD
            </div>
          </li>
          <li>NEC recommends max 3% voltage drop for branch circuits</li>
          <li>NEC recommends max 5% combined voltage drop (feeder + branch)</li>
          <li>Larger wire reduces voltage drop and long-term energy loss</li>
          <li>Values shown are for 75°C rated copper/aluminum conductors</li>
        </ul>
      </div>
    </div>
  );
}

export default WireSizeCalculator;