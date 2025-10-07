import React, { useState } from 'react';
import { Zap, Info, AlertTriangle } from 'lucide-react';

function TransformerSizingCalculator({ isDarkMode = false }) {
  const [activeTab, setActiveTab] = useState('sizing');

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

  // Transformer Sizing Calculator
  const TransformerSizing = () => {
    const [loadKVA, setLoadKVA] = useState('');
    const [primaryVoltage, setPrimaryVoltage] = useState('480');
    const [secondaryVoltage, setSecondaryVoltage] = useState('208');
    const [phase, setPhase] = useState('three');
    const [loadType, setLoadType] = useState('continuous');
    const [powerFactor, setPowerFactor] = useState('0.85');

    const standardSizes = [3, 6, 9, 15, 30, 45, 75, 112.5, 150, 225, 300, 500, 750, 1000, 1500, 2000, 2500, 3000];

    const calculateTransformerSize = () => {
      const load = parseFloat(loadKVA) || 0;
      if (load === 0) return null;

      let sizingFactor = 1.0;
      
      if (loadType === 'continuous') {
        sizingFactor = 1.25;
      }
      
      const pf = parseFloat(powerFactor);
      const apparentPower = load;
      
      const requiredKVA = apparentPower * sizingFactor;
      const recommendedSize = standardSizes.find(size => size >= requiredKVA) || requiredKVA;
      
      return {
        loadKVA: load,
        requiredKVA: requiredKVA.toFixed(1),
        recommendedSize,
        utilizationPercent: ((load / recommendedSize) * 100).toFixed(1)
      };
    };

    const results = calculateTransformerSize();

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
            Transformer Parameters
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText, 
                marginBottom: '0.5rem' 
              }}>
                Load (kVA)
              </label>
              <input 
                type="number" 
                value={loadKVA} 
                onChange={(e) => setLoadKVA(e.target.value)}
                placeholder="Connected load"
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
                Total connected or demand load
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
                Primary Voltage
              </label>
              <select 
                value={primaryVoltage} 
                onChange={(e) => setPrimaryVoltage(e.target.value)}
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
                <option value="208">208V</option>
                <option value="240">240V</option>
                <option value="480">480V</option>
                <option value="600">600V</option>
                <option value="2400">2400V</option>
                <option value="4160">4160V</option>
                <option value="12470">12470V</option>
                <option value="13200">13200V</option>
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
                Secondary Voltage
              </label>
              <select 
                value={secondaryVoltage} 
                onChange={(e) => setSecondaryVoltage(e.target.value)}
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
                <option value="120">120V</option>
                <option value="208">208V</option>
                <option value="240">240V</option>
                <option value="277">277V</option>
                <option value="480">480V</option>
                <option value="600">600V</option>
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

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText, 
                marginBottom: '0.5rem' 
              }}>
                Load Type
              </label>
              <select 
                value={loadType} 
                onChange={(e) => setLoadType(e.target.value)}
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
                <option value="continuous">Continuous (125% sizing)</option>
                <option value="noncontinuous">Non-Continuous (100% sizing)</option>
              </select>
              <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>
                Continuous loads operate 3+ hours
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
                <option value="1.0">1.0 (Unity)</option>
                <option value="0.95">0.95 (Excellent)</option>
                <option value="0.9">0.9 (Good)</option>
                <option value="0.85">0.85 (Typical)</option>
                <option value="0.8">0.8 (Poor)</option>
              </select>
            </div>
          </div>
        </div>

        {results && (
          <div>
            {/* Calculation Details */}
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
                Sizing Calculation
              </h3>
              
              <div style={{ 
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                border: `1px solid ${colors.cardBorder}`
              }}>
                <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: colors.labelText }}>
                  <strong style={{ color: colors.cardText }}>Connected Load:</strong> {results.loadKVA} kVA
                </div>
                <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: colors.labelText }}>
                  <strong style={{ color: colors.cardText }}>Required Capacity:</strong> {results.requiredKVA} kVA
                </div>
                <div style={{ fontSize: '0.8125rem', color: colors.subtleText, fontStyle: 'italic' }}>
                  ({loadType === 'continuous' ? '125%' : '100%'} sizing factor applied)
                </div>
              </div>
            </div>

            {/* Results */}
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
                Recommended Transformer
              </h3>

              <div style={{ 
                background: '#dbeafe',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#1e40af', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Transformer Size
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e40af' }}>
                  {results.recommendedSize} kVA
                </div>
              </div>

              <div style={{ 
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                border: `1px solid ${colors.cardBorder}`,
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: colors.labelText, marginBottom: '0.5rem' }}>
                  <strong style={{ color: colors.cardText }}>Configuration:</strong> {primaryVoltage}V to {secondaryVoltage}V
                </div>
                <div style={{ fontSize: '0.875rem', color: colors.labelText }}>
                  <strong style={{ color: colors.cardText }}>Phase:</strong> {phase === 'single' ? 'Single' : 'Three'} Phase
                </div>
              </div>

              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Utilization
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {results.utilizationPercent}%
                </div>
              </div>
            </div>

            {parseFloat(results.utilizationPercent) > 80 && (
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
                      High Utilization Warning
                    </div>
                    <div style={{ fontSize: '0.8125rem' }}>
                      Transformer utilization above 80% may result in higher operating temperatures and reduced equipment life. Consider next size up for better efficiency.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Guidelines */}
        <div style={{
          background: '#dbeafe',
          border: '1px solid #3b82f6',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
            <Info size={20} color="#1e40af" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            <div style={{ fontSize: '0.875rem', color: '#1e40af', lineHeight: '1.5' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                Transformer Sizing Guidelines:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
                <li style={{ marginBottom: '0.25rem' }}>Size for continuous loads at 125% per NEC 450.3</li>
                <li style={{ marginBottom: '0.25rem' }}>Consider future load growth (typically 20-25%)</li>
                <li style={{ marginBottom: '0.25rem' }}>Keep utilization below 80% for optimal efficiency</li>
                <li style={{ marginBottom: '0.25rem' }}>Account for inrush current for motor loads</li>
                <li>Consider ambient temperature and ventilation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Current Calculations
  const CurrentCalculations = () => {
    const [transformerKVA, setTransformerKVA] = useState('');
    const [primaryVoltage, setPrimaryVoltage] = useState('480');
    const [secondaryVoltage, setSecondaryVoltage] = useState('208');
    const [phase, setPhase] = useState('three');

    const calculateCurrents = () => {
      const kva = parseFloat(transformerKVA) || 0;
      if (kva === 0) return null;

      const vPrimary = parseFloat(primaryVoltage);
      const vSecondary = parseFloat(secondaryVoltage);

      let primaryCurrent, secondaryCurrent;

      if (phase === 'single') {
        primaryCurrent = (kva * 1000) / vPrimary;
        secondaryCurrent = (kva * 1000) / vSecondary;
      } else {
        primaryCurrent = (kva * 1000) / (1.732 * vPrimary);
        secondaryCurrent = (kva * 1000) / (1.732 * vSecondary);
      }

      return {
        kva,
        primaryCurrent: primaryCurrent.toFixed(1),
        secondaryCurrent: secondaryCurrent.toFixed(1),
        primaryVoltage: vPrimary,
        secondaryVoltage: vSecondary
      };
    };

    const results = calculateCurrents();

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
            Transformer Information
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText, 
                marginBottom: '0.5rem' 
              }}>
                Transformer Rating (kVA)
              </label>
              <input 
                type="number" 
                value={transformerKVA} 
                onChange={(e) => setTransformerKVA(e.target.value)}
                placeholder="Transformer kVA"
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
                Primary Voltage
              </label>
              <select 
                value={primaryVoltage} 
                onChange={(e) => setPrimaryVoltage(e.target.value)}
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
                <option value="208">208V</option>
                <option value="240">240V</option>
                <option value="480">480V</option>
                <option value="600">600V</option>
                <option value="2400">2400V</option>
                <option value="4160">4160V</option>
                <option value="12470">12470V</option>
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
                Secondary Voltage
              </label>
              <select 
                value={secondaryVoltage} 
                onChange={(e) => setSecondaryVoltage(e.target.value)}
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
                <option value="120">120V</option>
                <option value="208">208V</option>
                <option value="240">240V</option>
                <option value="277">277V</option>
                <option value="480">480V</option>
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
        </div>

        {results && (
          <div>
            {/* Transformer Info */}
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
                Transformer Configuration
              </h3>
              
              <div style={{ 
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                border: `1px solid ${colors.cardBorder}`
              }}>
                <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: colors.labelText }}>
                  <strong style={{ color: colors.cardText }}>Rating:</strong> {results.kva} kVA, {phase === 'single' ? 'Single' : 'Three'} Phase
                </div>
                <div style={{ fontSize: '0.875rem', color: colors.labelText }}>
                  <strong style={{ color: colors.cardText }}>Configuration:</strong> {results.primaryVoltage}V / {results.secondaryVoltage}V
                </div>
              </div>
            </div>

            {/* Primary Side */}
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
                color: '#1e40af',
                marginTop: 0,
                marginBottom: '1rem'
              }}>
                Primary Side
              </h3>
              
              <div style={{ 
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: `1px solid ${colors.cardBorder}`
              }}>
                <div style={{ fontSize: '0.875rem', color: colors.labelText }}>
                  <strong style={{ color: colors.cardText }}>Voltage:</strong> {results.primaryVoltage}V
                </div>
              </div>

              <div style={{
                background: '#dbeafe',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                  Primary Current
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e40af' }}>
                  {results.primaryCurrent}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.25rem' }}>
                  Amperes
                </div>
              </div>
            </div>

            {/* Secondary Side */}
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
                color: '#059669',
                marginTop: 0,
                marginBottom: '1rem'
              }}>
                Secondary Side
              </h3>
              
              <div style={{ 
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: `1px solid ${colors.cardBorder}`
              }}>
                <div style={{ fontSize: '0.875rem', color: colors.labelText }}>
                  <strong style={{ color: colors.cardText }}>Voltage:</strong> {results.secondaryVoltage}V
                </div>
              </div>

              <div style={{
                background: '#d1fae5',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#059669', marginBottom: '0.25rem' }}>
                  Secondary Current
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#059669' }}>
                  {results.secondaryCurrent}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.25rem' }}>
                  Amperes
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulas */}
        <div style={{
          background: '#dbeafe',
          border: '1px solid #3b82f6',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
            <Info size={20} color="#1e40af" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            <div style={{ fontSize: '0.875rem', color: '#1e40af', lineHeight: '1.5' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                Current Formulas:
              </div>
              <div style={{ fontSize: '0.8125rem', marginBottom: '0.25rem' }}>
                <strong>Single Phase:</strong> I = (kVA × 1000) ÷ V
              </div>
              <div style={{ fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                <strong>Three Phase:</strong> I = (kVA × 1000) ÷ (1.732 × V)
              </div>
              <div style={{ fontSize: '0.75rem', fontStyle: 'italic' }}>
                Note: Use these currents for selecting primary and secondary protection devices per NEC Article 450.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabComponents = {
    sizing: <TransformerSizing />,
    currents: <CurrentCalculations />
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
          <Zap size={24} color="#3b82f6" />
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: colors.cardText,
            margin: 0 
          }}>
            Transformer Calculations
          </h2>
        </div>
        <p style={{ 
          fontSize: '0.875rem', 
          color: colors.labelText,
          margin: 0 
        }}>
          NEC Article 450
        </p>
      </div>

      {/* Tab Navigation */}
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
            onClick={() => setActiveTab('sizing')}
            style={{
              flex: '1 1 auto',
              minWidth: '140px',
              padding: '0.75rem 1rem',
              background: activeTab === 'sizing' ? '#3b82f6' : 'transparent',
              color: activeTab === 'sizing' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'sizing' ? '#3b82f6' : colors.cardBorder}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Transformer Sizing
          </button>
          <button 
            onClick={() => setActiveTab('currents')}
            style={{
              flex: '1 1 auto',
              minWidth: '140px',
              padding: '0.75rem 1rem',
              background: activeTab === 'currents' ? '#3b82f6' : 'transparent',
              color: activeTab === 'currents' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'currents' ? '#3b82f6' : colors.cardBorder}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Current Calculations
          </button>
        </div>
      </div>

      {/* Active Tab Content */}
      {tabComponents[activeTab]}

      {/* NEC Reference Footer */}
      <div style={{
        background: colors.sectionBg,
        padding: '1rem',
        borderRadius: '8px',
        border: `1px solid ${colors.cardBorder}`,
        fontSize: '0.8125rem',
        color: colors.labelText,
        marginTop: '1rem'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: colors.cardText }}>
          NEC Article 450 - Transformers and Transformer Vaults:
        </div>
        450.3: Overcurrent protection • 450.9: Ventilation requirements • 450.11: Marking • 450.21: Dry-type transformers indoors
      </div>
    </div>
  );
}

export default TransformerSizingCalculator;