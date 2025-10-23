import React from 'react';

const CapacitiveReactanceTab = ({ 
  frequency, 
  setFrequency, 
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
          Circuit Parameters
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
              Frequency (Hz)
            </label>
            <input 
              type="number" 
              value={frequency} 
              onChange={(e) => setFrequency(e.target.value)}
              placeholder="60"
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
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>
              Common: 50 Hz or 60 Hz
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
              background: '#fef3c7',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.875rem', color: '#92400e', marginBottom: '0.5rem', fontWeight: '600' }}>
                Capacitive Reactance (XC)
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#92400e' }}>
                {result.reactance}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#92400e', marginTop: '0.25rem' }}>
                Ohms (Ω)
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
                <div><strong>Formula:</strong> XC = 1 / (2πfC)</div>
                <div><strong>Frequency:</strong> {result.frequency} Hz</div>
                <div><strong>Capacitance:</strong> {result.capacitance} {result.unit}</div>
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
              About Capacitive Reactance:
            </div>
            <div style={{ lineHeight: '1.75' }}>
              • Capacitive reactance decreases with frequency<br />
              • In AC circuits, capacitors oppose changes in voltage<br />
              • Current leads voltage by 90° in a pure capacitor<br />
              • XC is inversely proportional to both frequency and capacitance
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CapacitiveReactanceTab;