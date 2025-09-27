import React, { useState } from 'react';

function MotorCalculations() {
  const [activeCalculator, setActiveCalculator] = useState('flc');
  
  // Motor Full Load Current Calculator
  const MotorFLCCalculator = () => {
    const [horsepower, setHorsepower] = useState('');
    const [voltage, setVoltage] = useState('480');
    const [phase, setPhase] = useState('three');
    const [efficiency, setEfficiency] = useState('0.85');
    const [powerFactor, setPowerFactor] = useState('0.8');

    // NEC Table 430.250 - Full Load Current values (approximate)
    const necFLCTable = {
      single: {
        115: { 0.25: 4.4, 0.33: 5.8, 0.5: 7.2, 0.75: 9.8, 1: 13.8, 1.5: 20, 2: 24, 3: 34, 5: 56 },
        230: { 0.25: 2.2, 0.33: 2.9, 0.5: 3.6, 0.75: 4.9, 1: 6.9, 1.5: 10, 2: 12, 3: 17, 5: 28 }
      },
      three: {
        230: { 0.5: 2.0, 0.75: 2.8, 1: 3.6, 1.5: 5.2, 2: 6.8, 3: 9.6, 5: 15.2, 7.5: 22, 10: 28, 15: 42, 20: 54, 25: 68, 30: 80, 40: 104, 50: 130, 60: 154, 75: 192, 100: 248, 125: 312, 150: 360, 200: 480 },
        460: { 0.5: 1.0, 0.75: 1.4, 1: 1.8, 1.5: 2.6, 2: 3.4, 3: 4.8, 5: 7.6, 7.5: 11, 10: 14, 15: 21, 20: 27, 25: 34, 30: 40, 40: 52, 50: 65, 60: 77, 75: 96, 100: 124, 125: 156, 150: 180, 200: 240 },
        575: { 0.5: 0.8, 0.75: 1.1, 1: 1.4, 1.5: 2.1, 2: 2.7, 3: 3.9, 5: 6.1, 7.5: 9, 10: 11, 15: 17, 20: 22, 25: 27, 30: 32, 40: 41, 50: 52, 60: 62, 75: 77, 100: 99, 125: 125, 150: 144, 200: 192 },
        2300: { 250: 65, 300: 77, 350: 90, 400: 103, 450: 116, 500: 129 },
        4000: { 500: 74, 600: 88, 700: 103, 800: 118, 900: 132, 1000: 147 }
      }
    };

    const calculateFLC = () => {
      const hp = parseFloat(horsepower);
      const volt = parseInt(voltage);
      
      // Try to get NEC table value first
      if (necFLCTable[phase] && necFLCTable[phase][volt] && necFLCTable[phase][volt][hp]) {
        return necFLCTable[phase][volt][hp];
      }
      
      // Calculate using formula if not in table
      const eff = parseFloat(efficiency);
      const pf = parseFloat(powerFactor);
      
      if (phase === 'single') {
        return (hp * 746) / (volt * eff * pf);
      } else {
        return (hp * 746) / (1.732 * volt * eff * pf);
      }
    };

    const flc = calculateFLC();

    return (
      <div>
        <h3>Motor Full Load Current (FLC)</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Motor Horsepower:</label>
          <select value={horsepower} onChange={(e) => setHorsepower(e.target.value)}>
            <option value="">Select HP</option>
            <option value="0.25">1/4 HP</option>
            <option value="0.33">1/3 HP</option>
            <option value="0.5">1/2 HP</option>
            <option value="0.75">3/4 HP</option>
            <option value="1">1 HP</option>
            <option value="1.5">1.5 HP</option>
            <option value="2">2 HP</option>
            <option value="3">3 HP</option>
            <option value="5">5 HP</option>
            <option value="7.5">7.5 HP</option>
            <option value="10">10 HP</option>
            <option value="15">15 HP</option>
            <option value="20">20 HP</option>
            <option value="25">25 HP</option>
            <option value="30">30 HP</option>
            <option value="40">40 HP</option>
            <option value="50">50 HP</option>
            <option value="75">75 HP</option>
            <option value="100">100 HP</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Voltage:</label>
          <select value={voltage} onChange={(e) => setVoltage(e.target.value)}>
            <option value="115">115V</option>
            <option value="230">230V</option>
            <option value="460">460V</option>
            <option value="480">480V</option>
            <option value="575">575V</option>
            <option value="2300">2300V</option>
            <option value="4000">4000V</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Phase:</label>
          <select value={phase} onChange={(e) => setPhase(e.target.value)}>
            <option value="single">Single Phase</option>
            <option value="three">Three Phase</option>
          </select>
        </div>

        {horsepower && !necFLCTable[phase]?.[parseInt(voltage)]?.[parseFloat(horsepower)] && (
          <>
            <div style={{ marginBottom: '15px' }}>
              <label>Motor Efficiency:</label>
              <select value={efficiency} onChange={(e) => setEfficiency(e.target.value)}>
                <option value="0.8">80% (Standard)</option>
                <option value="0.85">85% (High Efficiency)</option>
                <option value="0.9">90% (Premium)</option>
                <option value="0.95">95% (Super Premium)</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label>Power Factor:</label>
              <select value={powerFactor} onChange={(e) => setPowerFactor(e.target.value)}>
                <option value="0.7">0.7 (Poor)</option>
                <option value="0.8">0.8 (Typical)</option>
                <option value="0.85">0.85 (Good)</option>
                <option value="0.9">0.9 (Excellent)</option>
              </select>
            </div>
          </>
        )}

        <div className="result">
          <strong>Full Load Current: {flc ? flc.toFixed(1) : '0.0'} Amps</strong>
          {necFLCTable[phase]?.[parseInt(voltage)]?.[parseFloat(horsepower)] && (
            <div style={{ fontSize: '14px', marginTop: '10px', color: '#059669' }}>
              ✓ Value from NEC Table 430.250
            </div>
          )}
        </div>
      </div>
    );
  };

  // Motor Branch Circuit Protection Calculator
  const MotorProtectionCalculator = () => {
    const [flc, setFlc] = useState('');
    const [protectionType, setProtectionType] = useState('inverse-time-breaker');

    // NEC Table 430.52 - Maximum rating percentages
    const protectionPercentages = {
      'inverse-time-breaker': 250,
      'instantaneous-trip-breaker': 800,
      'inverse-time-fuse': 175,
      'time-delay-fuse': 175
    };

    const calculateProtection = () => {
      if (!flc) return '0';
      const current = parseFloat(flc);
      const percentage = protectionPercentages[protectionType];
      const maxRating = (current * percentage) / 100;
      
      // Round up to next standard size
      const standardSizes = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200, 225, 250, 300, 350, 400, 450, 500, 600, 700, 800, 1000, 1200, 1600, 2000, 2500, 3000, 4000, 5000, 6000];
      
      const nextSize = standardSizes.find(size => size >= maxRating) || maxRating;
      
      return {
        calculated: maxRating.toFixed(1),
        standard: nextSize
      };
    };

    const protection = calculateProtection();

    return (
      <div>
        <h3>Motor Branch Circuit Protection</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Motor Full Load Current (FLC):</label>
          <input 
            type="number" 
            value={flc} 
            onChange={(e) => setFlc(e.target.value)}
            placeholder="Enter FLC in amps"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Protection Type:</label>
          <select value={protectionType} onChange={(e) => setProtectionType(e.target.value)}>
            <option value="inverse-time-breaker">Inverse Time Breaker</option>
            <option value="instantaneous-trip-breaker">Instantaneous Trip Breaker</option>
            <option value="inverse-time-fuse">Inverse Time Fuse</option>
            <option value="time-delay-fuse">Time Delay Fuse</option>
          </select>
        </div>

        <div className="result">
          <div><strong>Maximum Protection Rating:</strong></div>
          <div>Calculated: {protection.calculated} Amps</div>
          <div>Standard Size: <strong>{protection.standard} Amps</strong></div>
          <div style={{ fontSize: '14px', marginTop: '10px', color: '#6b7280' }}>
            Per NEC Table 430.52 ({protectionPercentages[protectionType]}% of FLC)
          </div>
        </div>
      </div>
    );
  };

  // Motor Wire Sizing Calculator
  const MotorWireSizeCalculator = () => {
    const [flc, setFlc] = useState('');
    const [tempRating, setTempRating] = useState('75');
    const [conduitType, setConduitType] = useState('standard');

    const calculateWireSize = () => {
      if (!flc) return null;
      
      // NEC 430.22 - Motor branch circuit conductors must be 125% of FLC
      const requiredAmps = parseFloat(flc) * 1.25;
      
      // Simplified ampacity table (75°C)
      const ampacityTable = {
        '75': {
          '14': 20, '12': 25, '10': 35, '8': 50, '6': 65, '4': 85, '3': 100, '2': 115,
          '1': 130, '1/0': 150, '2/0': 175, '3/0': 200, '4/0': 230, '250': 255,
          '300': 285, '350': 310, '400': 335, '500': 380, '600': 420, '750': 475
        }
      };

      const wireSizes = Object.keys(ampacityTable[tempRating]);
      const suitableWire = wireSizes.find(size => ampacityTable[tempRating][size] >= requiredAmps);

      return {
        requiredAmps: requiredAmps.toFixed(1),
        wireSize: suitableWire || 'Larger than 750 kcmil required',
        ampacity: suitableWire ? ampacityTable[tempRating][suitableWire] : 'N/A'
      };
    };

    const wireCalc = calculateWireSize();

    return (
      <div>
        <h3>Motor Wire Sizing</h3>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Motor Full Load Current (FLC):</label>
          <input 
            type="number" 
            value={flc} 
            onChange={(e) => setFlc(e.target.value)}
            placeholder="Enter FLC in amps"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Temperature Rating:</label>
          <select value={tempRating} onChange={(e) => setTempRating(e.target.value)}>
            <option value="75">75°C (THWN, XHHW)</option>
          </select>
        </div>

        {wireCalc && (
          <div className="result">
            <div><strong>Required Current Capacity:</strong></div>
            <div>{wireCalc.requiredAmps} Amps (125% of FLC)</div>
            <div style={{ marginTop: '10px' }}>
              <strong>Minimum Wire Size: {wireCalc.wireSize}</strong>
            </div>
            {wireCalc.ampacity !== 'N/A' && (
              <div>Ampacity: {wireCalc.ampacity} Amps</div>
            )}
            <div style={{ fontSize: '14px', marginTop: '10px', color: '#6b7280' }}>
              Per NEC 430.22 - Branch circuit conductors must carry 125% of motor FLC
            </div>
          </div>
        )}
      </div>
    );
  };

  const calculatorComponents = {
    flc: <MotorFLCCalculator />,
    protection: <MotorProtectionCalculator />,
    wiresize: <MotorWireSizeCalculator />
  };

  return (
    <div className="calculator-container">
      <h2>Motor Calculations</h2>
      
      {/* Calculator Selection Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '25px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => setActiveCalculator('flc')}
          style={{
            padding: '10px 15px',
            backgroundColor: activeCalculator === 'flc' ? '#3b82f6' : '#e5e7eb',
            color: activeCalculator === 'flc' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Full Load Current
        </button>
        <button 
          onClick={() => setActiveCalculator('protection')}
          style={{
            padding: '10px 15px',
            backgroundColor: activeCalculator === 'protection' ? '#3b82f6' : '#e5e7eb',
            color: activeCalculator === 'protection' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Circuit Protection
        </button>
        <button 
          onClick={() => setActiveCalculator('wiresize')}
          style={{
            padding: '10px 15px',
            backgroundColor: activeCalculator === 'wiresize' ? '#3b82f6' : '#e5e7eb',
            color: activeCalculator === 'wiresize' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Wire Sizing
        </button>
      </div>

      {/* Active Calculator */}
      {calculatorComponents[activeCalculator]}

      {/* NEC Reference */}
      <div style={{ 
        marginTop: '25px', 
        padding: '15px', 
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#374151'
      }}>
        <strong>NEC Article 430 - Motors, Motor Circuits, and Controllers</strong>
        <ul style={{ textAlign: 'left', paddingLeft: '20px', margin: '10px 0' }}>
          <li>430.22: Branch circuit conductors must carry 125% of motor FLC</li>
          <li>430.52: Maximum rating for motor branch circuit protection</li>
          <li>430.250: Full load current tables for motors</li>
          <li>430.32: Overload protection requirements</li>
        </ul>
      </div>
    </div>
  );
}

export default MotorCalculations;