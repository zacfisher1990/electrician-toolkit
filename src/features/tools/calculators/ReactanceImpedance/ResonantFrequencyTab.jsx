import React from 'react';

const ResonantFrequencyTab = ({ 
  inductance, 
  setInductance, 
  inductanceUnit, 
  setInductanceUnit,
  capacitance, 
  setCapacitance, 
  capacitanceUnit, 
  setCapacitanceUnit,
  result,
  colors 
}) => {
  return (
    <div>
      {/* Input Card */}
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
          LC Circuit Parameters
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
              Inductance
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
              <input 
                type="number" 
                value={inductance} 
                onChange={(e) => setInductance(e.target.value)}
                placeholder="Enter value"
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
              <select 
                value={inductanceUnit} 
                onChange={(e) => setInductanceUnit(e.target.value)}
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
                <option value="H">H</option>
                <option value="mH">mH</option>
                <option value="μH">μH</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText, 
              marginBottom: '0.5rem' 
            }}>
              Capacitance
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
              <input 
                type="number" 
                value={capacitance} 
                onChange={(e) => setCapacitance(e.target.value)}
                placeholder="Enter value"
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
              <select 
                value={capacitanceUnit} 
                onChange={(e) => setCapacitanceUnit(e.target.value)}
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
                <option value="F">F</option>
                <option value="μF">μF</option>
                <option value="nF">nF</option>
                <option value="pF">pF</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div>
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
              marginBottom: '1rem'
            }}>
              Results
            </h3>
            
            <div style={{
              background: '#fce7f3',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#9f1239', marginBottom: '0.5rem', fontWeight: '600' }}>
                Resonant Frequency (fr)
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#9f1239' }}>
                {result.frequency}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#9f1239', marginTop: '0.25rem' }}>
                Hz
              </div>
            </div>

            <div style={{ 
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${colors.cardBorder}`
            }}>
              <strong style={{ color: colors.cardText, display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                Calculation Details:
              </strong>
              <div style={{ fontSize: '0.875rem', color: colors.labelText, lineHeight: '1.75' }}>
                <div><strong>Formula:</strong> fr = 1 / (2π√LC)</div>
                <div><strong>Inductance:</strong> {result.inductance} {result.inductanceUnit}</div>
                <div><strong>Capacitance:</strong> {result.capacitance} {result.capacitanceUnit}</div>
                <div style={{ marginTop: '0.5rem', color: colors.cardText }}>
                  <strong>At Resonance:</strong> XL = XC (reactances cancel out)
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div style={{
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            border: `1px solid ${colors.cardBorder}`,
            fontSize: '0.8125rem',
            color: colors.labelText
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: colors.cardText }}>
              About Resonant Frequency:
            </div>
            <div style={{ lineHeight: '1.75' }}>
              • At resonance, inductive and capacitive reactances are equal (XL = XC)<br />
              • Series LC circuit has minimum impedance at resonance<br />
              • Parallel LC circuit has maximum impedance at resonance<br />
              • The circuit behaves as purely resistive at resonant frequency<br />
              • Used in radio tuning, filters, and oscillator circuits
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResonantFrequencyTab;