import React from 'react';

const ImpedanceCalculatorTab = ({ 
  reactanceType,
  setReactanceType,
  resistance, 
  setResistance, 
  reactance, 
  setReactance,
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
              Reactance Type
            </label>
            <select 
              value={reactanceType} 
              onChange={(e) => setReactanceType(e.target.value)}
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
              <option value="inductive">Inductive (XL)</option>
              <option value="capacitive">Capacitive (XC)</option>
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
              Resistance (R) in Ohms
            </label>
            <input 
              type="number" 
              value={resistance} 
              onChange={(e) => setResistance(e.target.value)}
              placeholder="Enter resistance"
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
              Reactance (X) in Ohms
            </label>
            <input 
              type="number" 
              value={reactance} 
              onChange={(e) => setReactance(e.target.value)}
              placeholder="Enter reactance"
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
              {reactanceType === 'inductive' ? 'XL (inductive)' : 'XC (capacitive)'}
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
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                background: '#dcfce7',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#166534', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Impedance (Z)
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#166534' }}>
                  {result.impedance}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#166534', marginTop: '0.25rem' }}>
                  Ohms (Ω)
                </div>
              </div>

              <div style={{
                background: '#e0e7ff',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#3730a3', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Phase Angle (θ)
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#3730a3' }}>
                  {result.angle}°
                </div>
                <div style={{ fontSize: '0.75rem', color: '#3730a3', marginTop: '0.25rem' }}>
                  {result.type === 'inductive' ? 'Current Lags' : 'Current Leads'}
                </div>
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
                <div><strong>Formula:</strong> Z = √(R² + X²)</div>
                <div><strong>Resistance (R):</strong> {result.resistance} Ω</div>
                <div><strong>Reactance (X):</strong> {result.reactance} Ω</div>
                <div><strong>Type:</strong> {result.type === 'inductive' ? 'Inductive' : 'Capacitive'}</div>
                <div><strong>Phase Relationship:</strong> {result.type === 'inductive' ? 'Current lags voltage' : 'Current leads voltage'}</div>
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
              About Impedance:
            </div>
            <div style={{ lineHeight: '1.75' }}>
              • Impedance (Z) is the total opposition to current flow in AC circuits<br />
              • It combines both resistance (R) and reactance (X)<br />
              • Phase angle indicates the relationship between voltage and current<br />
              • In {result.type === 'inductive' ? 'inductive' : 'capacitive'} circuits, current {result.type === 'inductive' ? 'lags' : 'leads'} voltage
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImpedanceCalculatorTab;