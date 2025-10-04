import React, { useState } from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

function MotorCalculations({ onBack }) {
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
      
      if (necFLCTable[phase] && necFLCTable[phase][volt] && necFLCTable[phase][volt][hp]) {
        return necFLCTable[phase][volt][hp];
      }
      
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Motor Horsepower
            </label>
            <select 
              value={horsepower} 
              onChange={(e) => setHorsepower(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            >
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

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Voltage
            </label>
            <select 
              value={voltage} 
              onChange={(e) => setVoltage(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            >
              <option value="115">115V</option>
              <option value="230">230V</option>
              <option value="460">460V</option>
              <option value="480">480V</option>
              <option value="575">575V</option>
              <option value="2300">2300V</option>
              <option value="4000">4000V</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Phase
            </label>
            <select 
              value={phase} 
              onChange={(e) => setPhase(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            >
              <option value="single">Single Phase</option>
              <option value="three">Three Phase</option>
            </select>
          </div>
        </div>

        {horsepower && !necFLCTable[phase]?.[parseInt(voltage)]?.[parseFloat(horsepower)] && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Motor Efficiency
              </label>
              <select 
                value={efficiency} 
                onChange={(e) => setEfficiency(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
              >
                <option value="0.8">80% (Standard)</option>
                <option value="0.85">85% (High Efficiency)</option>
                <option value="0.9">90% (Premium)</option>
                <option value="0.95">95% (Super Premium)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
                Power Factor
              </label>
              <select 
                value={powerFactor} 
                onChange={(e) => setPowerFactor(e.target.value)}
                style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
              >
                <option value="0.7">0.7 (Poor)</option>
                <option value="0.8">0.8 (Typical)</option>
                <option value="0.85">0.85 (Good)</option>
                <option value="0.9">0.9 (Excellent)</option>
              </select>
            </div>
          </div>
        )}

        <div style={{ 
          background: '#dcfce7', 
          border: '2px solid #16a34a', 
          padding: '1.5rem', 
          borderRadius: '0.5rem'
        }}>
          <h3 style={{ fontWeight: 'bold', color: '#166534', marginTop: 0, marginBottom: '1rem' }}>
            Results
          </h3>
          
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#16a34a',
            marginBottom: '1rem',
            padding: '1rem',
            background: 'white',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            {flc ? flc.toFixed(1) : '0.0'} Amperes
          </div>
          
          {necFLCTable[phase]?.[parseInt(voltage)]?.[parseFloat(horsepower)] && (
            <div style={{ 
              color: '#059669',
              padding: '0.75rem',
              background: '#ecfdf5',
              borderRadius: '0.375rem',
              border: '1px solid #10b981'
            }}>
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

    const protectionPercentages = {
      'inverse-time-breaker': 250,
      'instantaneous-trip-breaker': 800,
      'inverse-time-fuse': 175,
      'time-delay-fuse': 175
    };

    const calculateProtection = () => {
      if (!flc) return { calculated: '0', standard: 0 };
      const current = parseFloat(flc);
      const percentage = protectionPercentages[protectionType];
      const maxRating = (current * percentage) / 100;
      
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Motor Full Load Current (FLC)
            </label>
            <input 
              type="number" 
              value={flc} 
              onChange={(e) => setFlc(e.target.value)}
              placeholder="Enter FLC in amps"
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Protection Type
            </label>
            <select 
              value={protectionType} 
              onChange={(e) => setProtectionType(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            >
              <option value="inverse-time-breaker">Inverse Time Breaker</option>
              <option value="instantaneous-trip-breaker">Instantaneous Trip Breaker</option>
              <option value="inverse-time-fuse">Inverse Time Fuse</option>
              <option value="time-delay-fuse">Time Delay Fuse</option>
            </select>
          </div>
        </div>

        <div style={{ 
          background: '#dcfce7', 
          border: '2px solid #16a34a', 
          padding: '1.5rem', 
          borderRadius: '0.5rem'
        }}>
          <h3 style={{ fontWeight: 'bold', color: '#166534', marginTop: 0, marginBottom: '1rem' }}>
            Results
          </h3>
          
          <div style={{ color: '#14532d', marginBottom: '0.75rem' }}>
            <strong>Calculated Maximum:</strong> {protection.calculated} Amps
          </div>
          
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#16a34a',
            marginBottom: '1rem',
            padding: '1rem',
            background: 'white',
            borderRadius: '0.5rem',
            textAlign: 'center'
          }}>
            {protection.standard} Amperes
          </div>
          
          <div style={{ 
            color: '#14532d',
            paddingTop: '1rem',
            borderTop: '1px solid #bbf7d0'
          }}>
            <strong>NEC Reference:</strong>
            <div style={{ marginTop: '0.5rem', color: '#15803d', fontSize: '0.875rem' }}>
              Per NEC Table 430.52 ({protectionPercentages[protectionType]}% of FLC)
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Motor Wire Sizing Calculator
  const MotorWireSizeCalculator = () => {
    const [flc, setFlc] = useState('');
    const [tempRating, setTempRating] = useState('75C');

    const calculateWireSize = () => {
      if (!flc) return null;
      
      const requiredAmps = parseFloat(flc) * 1.25;
      
      const ampacityTable = {
        '60C': {
          '14': 15, '12': 20, '10': 30, '8': 40, '6': 55, '4': 70, '3': 85,
          '2': 95, '1': 110, '1/0': 125, '2/0': 145, '3/0': 165, '4/0': 195,
          '250': 215, '300': 240, '350': 260, '400': 280, '500': 320,
          '600': 355, '700': 385, '750': 400
        },
        '75C': {
          '14': 20, '12': 25, '10': 35, '8': 50, '6': 65, '4': 85, '3': 100, '2': 115,
          '1': 130, '1/0': 150, '2/0': 175, '3/0': 200, '4/0': 230, '250': 255,
          '300': 285, '350': 310, '400': 335, '500': 380, '600': 420, '750': 475
        },
        '90C': {
          '14': 25, '12': 30, '10': 40, '8': 55, '6': 75, '4': 95, '3': 115,
          '2': 130, '1': 150, '1/0': 170, '2/0': 195, '3/0': 225, '4/0': 260,
          '250': 290, '300': 320, '350': 350, '400': 380, '500': 430,
          '600': 475, '700': 520, '750': 535
        }
      };

      // NEC 240.4(D) - Small conductor OCPD limits
      const ocpdLimits = {
        '14': 15,
        '12': 20,
        '10': 30
      };

      // Define wire sizes in order from smallest to largest
      const wireSizes = ['14', '12', '10', '8', '6', '4', '3', '2', '1', 
                         '1/0', '2/0', '3/0', '4/0', '250', '300', '350', 
                         '400', '500', '600', '700', '750'];
      
      // Find suitable wire based on ampacity AND OCPD limits
      const suitableWire = wireSizes.find(size => {
        const hasEnoughAmpacity = ampacityTable[tempRating][size] >= requiredAmps;
        const meetsOCPDLimit = !ocpdLimits[size] || ocpdLimits[size] >= requiredAmps;
        return hasEnoughAmpacity && meetsOCPDLimit;
      });

      return {
        requiredAmps: requiredAmps.toFixed(1),
        wireSize: suitableWire || 'Larger than 750 kcmil required',
        ampacity: suitableWire ? ampacityTable[tempRating][suitableWire] : 'N/A',
        ocpdLimit: suitableWire && ocpdLimits[suitableWire] ? ocpdLimits[suitableWire] : null
      };
    };

    const wireCalc = calculateWireSize();

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Motor Full Load Current (FLC)
            </label>
            <input 
              type="number" 
              value={flc} 
              onChange={(e) => setFlc(e.target.value)}
              placeholder="Enter FLC in amps"
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            />
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

        {wireCalc && (
          <div style={{ 
            background: '#dcfce7', 
            border: '2px solid #16a34a', 
            padding: '1.5rem', 
            borderRadius: '0.5rem'
          }}>
            <h3 style={{ fontWeight: 'bold', color: '#166534', marginTop: 0, marginBottom: '1rem' }}>
              Results
            </h3>
            
            <div style={{ color: '#14532d', marginBottom: '0.75rem' }}>
              <strong>Required Current Capacity:</strong> {wireCalc.requiredAmps} Amps (125% of FLC)
            </div>
            
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#16a34a',
              marginBottom: '1rem',
              padding: '1rem',
              background: 'white',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              {wireCalc.wireSize}
            </div>
            
            {wireCalc.ampacity !== 'N/A' && (
              <div style={{ color: '#14532d', marginBottom: '1rem' }}>
                <strong>Ampacity:</strong> {wireCalc.ampacity} Amps
              </div>
            )}
            
            {wireCalc.ocpdLimit && (
              <div style={{ 
                color: '#92400e', 
                marginBottom: '1rem',
                padding: '0.75rem',
                background: '#fef3c7',
                borderRadius: '0.375rem',
                border: '1px solid #fbbf24'
              }}>
                <strong>⚠ NEC 240.4(D):</strong> {wireCalc.ocpdLimit}A max overcurrent protection for {wireCalc.wireSize} wire
              </div>
            )}
            
            <div style={{ 
              color: '#14532d',
              paddingTop: '1rem',
              borderTop: '1px solid #bbf7d0'
            }}>
              <strong>NEC Reference:</strong>
              <div style={{ marginTop: '0.5rem', color: '#15803d', fontSize: '0.875rem' }}>
                Per NEC 430.22 - Branch circuit conductors must carry 125% of motor FLC
              </div>
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
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Motor Calculations</h1>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>NEC Article 430 - Motors, Motor Circuits, and Controllers</p>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '1.5rem' }}>
        {/* Calculator Selection Tabs */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => setActiveCalculator('flc')}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeCalculator === 'flc' ? '#3b82f6' : '#e5e7eb',
              color: activeCalculator === 'flc' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Full Load Current
          </button>
          <button 
            onClick={() => setActiveCalculator('protection')}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeCalculator === 'protection' ? '#3b82f6' : '#e5e7eb',
              color: activeCalculator === 'protection' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Circuit Protection
          </button>
          <button 
            onClick={() => setActiveCalculator('wiresize')}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeCalculator === 'wiresize' ? '#3b82f6' : '#e5e7eb',
              color: activeCalculator === 'wiresize' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Wire Sizing
          </button>
        </div>

        {/* Active Calculator */}
        {calculatorComponents[activeCalculator]}
      </div>

      <div style={{ background: '#1e293b', color: '#cbd5e1', padding: '1.5rem', borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem', fontSize: '0.875rem' }}>
        <p style={{ fontWeight: '600', marginTop: 0, marginBottom: '0.75rem' }}>NEC References:</p>
        <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
          <li style={{ marginBottom: '0.25rem' }}>430.22 - Branch circuit conductors must carry 125% of motor FLC</li>
          <li style={{ marginBottom: '0.25rem' }}>430.52 - Maximum rating for motor branch circuit protection</li>
          <li style={{ marginBottom: '0.25rem' }}>430.250 - Full load current tables for motors</li>
          <li>430.32 - Overload protection requirements</li>
        </ul>
      </div>
    </div>
  );
}

export default MotorCalculations;