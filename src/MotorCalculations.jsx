import React, { useState } from 'react';
import { Settings, CheckCircle, AlertTriangle } from 'lucide-react';

function MotorCalculations({ isDarkMode = false }) {
  const [activeCalculator, setActiveCalculator] = useState('flc');

  // Dark mode colors - matching ConduitFillCalculator
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
  
  // Motor Full Load Current Calculator
  const MotorFLCCalculator = () => {
    const [horsepower, setHorsepower] = useState('');
    const [voltage, setVoltage] = useState('480');
    const [phase, setPhase] = useState('three');
    const [efficiency, setEfficiency] = useState('0.85');
    const [powerFactor, setPowerFactor] = useState('0.8');

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
    const isNECValue = necFLCTable[phase]?.[parseInt(voltage)]?.[parseFloat(horsepower)];

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText, 
              marginBottom: '0.5rem' 
            }}>
              Motor Horsepower
            </label>
            <select 
              value={horsepower} 
              onChange={(e) => setHorsepower(e.target.value)}
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
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText, 
              marginBottom: '0.5rem' 
            }}>
              Voltage
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
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText, 
              marginBottom: '0.5rem' 
            }}>
              Phase
            </label>
            <select 
              value={phase} 
              onChange={(e) => setPhase(e.target.value)}
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
              <option value="single">Single Phase</option>
              <option value="three">Three Phase</option>
            </select>
          </div>
        </div>

        {horsepower && !isNECValue && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText, 
                marginBottom: '0.5rem' 
              }}>
                Motor Efficiency
              </label>
              <select 
                value={efficiency} 
                onChange={(e) => setEfficiency(e.target.value)}
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
                <option value="0.8">80% (Standard)</option>
                <option value="0.85">85% (High Efficiency)</option>
                <option value="0.9">90% (Premium)</option>
                <option value="0.95">95% (Super Premium)</option>
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
                Power Factor
              </label>
              <select 
                value={powerFactor} 
                onChange={(e) => setPowerFactor(e.target.value)}
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
                <option value="0.7">0.7 (Poor)</option>
                <option value="0.8">0.8 (Typical)</option>
                <option value="0.85">0.85 (Good)</option>
                <option value="0.9">0.9 (Excellent)</option>
              </select>
            </div>
          </div>
        )}

        <div style={{ 
          background: colors.sectionBg,
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '1rem',
          border: `1px solid ${colors.cardBorder}`
        }}>
          <div style={{ 
            fontSize: '0.75rem', 
            color: colors.labelText, 
            marginBottom: '0.5rem',
            textAlign: 'center'
          }}>
            Full Load Current
          </div>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: colors.cardText,
            textAlign: 'center'
          }}>
            {flc ? flc.toFixed(1) : '0.0'}
          </div>
          <div style={{ 
            fontSize: '0.875rem', 
            color: colors.labelText,
            textAlign: 'center',
            marginTop: '0.25rem'
          }}>
            Amperes
          </div>
        </div>
        
        {isNECValue ? (
          <div style={{
            background: '#d1fae5',
            border: '1px solid #6ee7b7',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <CheckCircle size={20} color="#059669" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.875rem', color: '#047857', lineHeight: '1.5' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  Value from NEC Table 430.250
                </div>
                <div style={{ fontSize: '0.8125rem' }}>
                  Standard full load current from NEC tables
                </div>
              </div>
            </div>
          </div>
        ) : horsepower ? (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: '1.5' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  Calculated Value
                </div>
                <div style={{ fontSize: '0.8125rem' }}>
                  Not in NEC tables - calculated using efficiency and power factor
                </div>
              </div>
            </div>
          </div>
        ) : null}
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
        standard: nextSize,
        percentage
      };
    };

    const protection = calculateProtection();

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText, 
              marginBottom: '0.5rem' 
            }}>
              Motor Full Load Current (FLC)
            </label>
            <input 
              type="number" 
              value={flc} 
              onChange={(e) => setFlc(e.target.value)}
              placeholder="Enter FLC in amps"
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
              Protection Type
            </label>
            <select 
              value={protectionType} 
              onChange={(e) => setProtectionType(e.target.value)}
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
              <option value="inverse-time-breaker">Inverse Time Breaker</option>
              <option value="instantaneous-trip-breaker">Instantaneous Trip Breaker</option>
              <option value="inverse-time-fuse">Inverse Time Fuse</option>
              <option value="time-delay-fuse">Time Delay Fuse</option>
            </select>
          </div>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(2, 1fr)', 
          gap: '1rem', 
          marginBottom: '1rem' 
        }}>
          <div style={{
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
              Calculated Maximum
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
              {protection.calculated}
            </div>
            <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
              Amperes
            </div>
          </div>
          
          <div style={{
            background: '#dbeafe',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
              Standard Size
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
              {protection.standard}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.25rem' }}>
              Amperes
            </div>
          </div>
        </div>

        {flc && (
          <div style={{
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            border: `1px solid ${colors.cardBorder}`,
            fontSize: '0.8125rem',
            color: colors.labelText
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: colors.cardText }}>
              NEC Reference:
            </div>
            Per NEC Table 430.52 ({protection.percentage}% of FLC)
          </div>
        )}
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

      const ocpdLimits = {
        '14': 15,
        '12': 20,
        '10': 30
      };

      const wireSizes = ['14', '12', '10', '8', '6', '4', '3', '2', '1', 
                         '1/0', '2/0', '3/0', '4/0', '250', '300', '350', 
                         '400', '500', '600', '700', '750'];
      
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText, 
              marginBottom: '0.5rem' 
            }}>
              Motor Full Load Current (FLC)
            </label>
            <input 
              type="number" 
              value={flc} 
              onChange={(e) => setFlc(e.target.value)}
              placeholder="Enter FLC in amps"
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
              <option value="60C">60°C (140°F) - TW, UF</option>
              <option value="75C">75°C (167°F) - THWN, XHHW</option>
              <option value="90C">90°C (194°F) - THHN, XHHW-2</option>
            </select>
          </div>
        </div>

        {wireCalc && (
          <>
            <div style={{ 
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              border: `1px solid ${colors.cardBorder}`
            }}>
              <div style={{ 
                fontSize: '0.875rem', 
                color: colors.labelText, 
                marginBottom: '0.75rem' 
              }}>
                <strong style={{ color: colors.cardText }}>Required Current Capacity:</strong> {wireCalc.requiredAmps} Amps (125% of FLC)
              </div>
              
              <div style={{ 
                fontSize: '0.75rem', 
                color: colors.labelText, 
                marginBottom: '0.5rem',
                textAlign: 'center'
              }}>
                Minimum Wire Size
              </div>
              <div style={{ 
                fontSize: '2rem', 
                fontWeight: '700', 
                color: colors.cardText,
                textAlign: 'center',
                marginBottom: '0.5rem'
              }}>
                {wireCalc.wireSize}
              </div>
              
              {wireCalc.ampacity !== 'N/A' && (
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: colors.labelText,
                  textAlign: 'center'
                }}>
                  Ampacity: {wireCalc.ampacity} Amps
                </div>
              )}
            </div>
            
            {wireCalc.ocpdLimit && (
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
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      NEC 240.4(D) Limitation
                    </div>
                    <div style={{ fontSize: '0.8125rem' }}>
                      {wireCalc.ocpdLimit}A maximum overcurrent protection for {wireCalc.wireSize} wire
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${colors.cardBorder}`,
              fontSize: '0.8125rem',
              color: colors.labelText
            }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: colors.cardText }}>
                NEC Reference:
              </div>
              Per NEC 430.22 - Branch circuit conductors must carry 125% of motor FLC
            </div>
          </>
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
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header Card */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <Settings size={24} color="#3b82f6" />
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: colors.cardText,
            margin: 0 
          }}>
            Motor Calculations
          </h2>
        </div>
        <p style={{ 
          fontSize: '0.875rem', 
          color: colors.labelText,
          margin: 0 
        }}>
          NEC Article 430 - Motors and controllers
        </p>
      </div>

      {/* Calculator Selection Tabs */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => setActiveCalculator('flc')}
            style={{
              flex: '1 1 auto',
              minWidth: '120px',
              padding: '0.75rem 1rem',
              background: activeCalculator === 'flc' ? '#3b82f6' : 'transparent',
              color: activeCalculator === 'flc' ? 'white' : colors.labelText,
              border: `1px solid ${activeCalculator === 'flc' ? '#3b82f6' : colors.cardBorder}`,
              borderRadius: '8px',
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
              flex: '1 1 auto',
              minWidth: '120px',
              padding: '0.75rem 1rem',
              background: activeCalculator === 'protection' ? '#3b82f6' : 'transparent',
              color: activeCalculator === 'protection' ? 'white' : colors.labelText,
              border: `1px solid ${activeCalculator === 'protection' ? '#3b82f6' : colors.cardBorder}`,
              borderRadius: '8px',
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
              flex: '1 1 auto',
              minWidth: '120px',
              padding: '0.75rem 1rem',
              background: activeCalculator === 'wiresize' ? '#3b82f6' : 'transparent',
              color: activeCalculator === 'wiresize' ? 'white' : colors.labelText,
              border: `1px solid ${activeCalculator === 'wiresize' ? '#3b82f6' : colors.cardBorder}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Wire Sizing
          </button>
        </div>
      </div>

      {/* Active Calculator */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {calculatorComponents[activeCalculator]}
      </div>

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
          NEC References:
        </div>
        430.22 - Conductors (125% FLC) • 430.52 - Circuit protection • 430.250 - FLC tables • 430.32 - Overload protection
      </div>
    </div>
  );
}

export default MotorCalculations;