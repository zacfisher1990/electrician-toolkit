import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Zap, Info, AlertTriangle } from 'lucide-react';
import { exportToPDF } from '../../../utils/pdfExport';
import styles from './Calculator.module.css';

const TransformerSizingCalculator = forwardRef(({ isDarkMode = false }, ref) => {
  const [activeTab, setActiveTab] = useState('sizing');

  // Transformer Sizing State
  const [loadKVA, setLoadKVA] = useState('');
  const [sizingPrimaryVoltage, setSizingPrimaryVoltage] = useState('480');
  const [sizingSecondaryVoltage, setSizingSecondaryVoltage] = useState('208');
  const [sizingPhase, setSizingPhase] = useState('three');
  const [loadType, setLoadType] = useState('continuous');
  const [powerFactor, setPowerFactor] = useState('0.85');

  // Current Calculations State
  const [transformerKVA, setTransformerKVA] = useState('');
  const [currentPrimaryVoltage, setCurrentPrimaryVoltage] = useState('480');
  const [currentSecondaryVoltage, setCurrentSecondaryVoltage] = useState('208');
  const [currentPhase, setCurrentPhase] = useState('three');

  // Dark mode colors
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

  const standardSizes = [3, 6, 9, 15, 30, 45, 75, 112.5, 150, 225, 300, 500, 750, 1000, 1500, 2000, 2500, 3000];

  // Transformer Sizing Calculation
  const calculateTransformerSize = () => {
    const load = parseFloat(loadKVA) || 0;
    if (load === 0) return null;

    let sizingFactor = 1.0;
    
    if (loadType === 'continuous') {
      sizingFactor = 1.25;
    }
    
    const requiredKVA = load * sizingFactor;
    const recommendedSize = standardSizes.find(size => size >= requiredKVA) || requiredKVA;
    
    return {
      loadKVA: load,
      requiredKVA: requiredKVA.toFixed(1),
      recommendedSize,
      utilizationPercent: ((load / recommendedSize) * 100).toFixed(1)
    };
  };

  // Current Calculations
  const calculateCurrents = () => {
    const kva = parseFloat(transformerKVA) || 0;
    if (kva === 0) return null;

    const vPrimary = parseFloat(currentPrimaryVoltage);
    const vSecondary = parseFloat(currentSecondaryVoltage);

    let primaryCurrent, secondaryCurrent;

    if (currentPhase === 'single') {
      primaryCurrent = (kva * 1000) / vPrimary;
      secondaryCurrent = (kva * 1000) / vSecondary;
    } else {
      primaryCurrent = (kva * 1000) / (1.732 * vPrimary);
      secondaryCurrent = (kva * 1000) / (1.732 * vSecondary);
    }

    // Calculate breaker sizes based on NEC 450.3
    // Primary: 125% of rated primary current (most common for transformers with 2-6% impedance)
    // Secondary: 125% of rated secondary current
    const primaryBreakerSize = primaryCurrent * 1.25;
    const secondaryBreakerSize = secondaryCurrent * 1.25;

    // Standard breaker sizes
    const standardBreakers = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200, 225, 250, 300, 350, 400, 450, 500, 600, 700, 800, 1000, 1200, 1600, 2000, 2500, 3000, 4000, 5000, 6000];
    
    // Find next standard breaker size
    const primaryBreaker = standardBreakers.find(size => size >= primaryBreakerSize) || Math.ceil(primaryBreakerSize);
    const secondaryBreaker = standardBreakers.find(size => size >= secondaryBreakerSize) || Math.ceil(secondaryBreakerSize);

    return {
      kva,
      primaryCurrent: primaryCurrent.toFixed(1),
      secondaryCurrent: secondaryCurrent.toFixed(1),
      primaryVoltage: vPrimary,
      secondaryVoltage: vSecondary,
      primaryBreaker,
      secondaryBreaker
    };
  };

  const sizingResults = calculateTransformerSize();
  const currentResults = calculateCurrents();

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      if (activeTab === 'sizing') {
        if (!loadKVA) {
          alert('Please enter load (kVA) before exporting to PDF');
          return;
        }

        const pdfData = {
          calculatorName: 'Transformer Calculations - Transformer Sizing',
          inputs: {
            'Load': `${loadKVA} kVA`,
            'Primary Voltage': `${sizingPrimaryVoltage}V`,
            'Secondary Voltage': `${sizingSecondaryVoltage}V`,
            'Phase': sizingPhase === 'single' ? 'Single Phase' : 'Three Phase',
            'Load Type': loadType === 'continuous' ? 'Continuous (125% sizing)' : 'Non-Continuous (100% sizing)',
            'Power Factor': powerFactor
          },
          results: {
            'Recommended Transformer Size': `${sizingResults.recommendedSize} kVA`,
            'Configuration': `${sizingPrimaryVoltage}V to ${sizingSecondaryVoltage}V`,
            'Phase': sizingPhase === 'single' ? 'Single Phase' : 'Three Phase',
            'Connected Load': `${sizingResults.loadKVA} kVA`,
            'Required Capacity': `${sizingResults.requiredKVA} kVA`,
            'Utilization': `${sizingResults.utilizationPercent}%`
          },
          additionalInfo: {
            'Sizing Factor': loadType === 'continuous' ? '125% (continuous loads)' : '100% (non-continuous loads)',
            'Calculation Method': 'Required Capacity = Connected Load × Sizing Factor',
            'Utilization Note': parseFloat(sizingResults.utilizationPercent) > 80 
              ? 'WARNING: Utilization above 80% may result in higher operating temperatures and reduced equipment life'
              : 'Utilization is within acceptable range'
          },
          necReferences: [
            'NEC 450.3 - Overcurrent Protection for Transformers',
            'NEC 450.9 - Ventilation Requirements',
            'NEC 450.11 - Marking Requirements',
            'NEC 450.21 - Dry-Type Transformers Installed Indoors',
            'Size continuous loads at 125% per NEC requirements',
            'Keep utilization below 80% for optimal efficiency and equipment life',
            'Consider future load growth (typically 20-25% spare capacity)',
            'Account for inrush current for motor loads',
            'Consider ambient temperature and ventilation requirements'
          ]
        };

        exportToPDF(pdfData);

      } else if (activeTab === 'currents') {
        if (!transformerKVA) {
          alert('Please enter transformer rating (kVA) before exporting to PDF');
          return;
        }

        const formula = currentPhase === 'single' 
          ? 'I = (kVA × 1000) ÷ V'
          : 'I = (kVA × 1000) ÷ (1.732 × V)';

        const pdfData = {
          calculatorName: 'Transformer Calculations - Current Calculations',
          inputs: {
            'Transformer Rating': `${transformerKVA} kVA`,
            'Primary Voltage': `${currentPrimaryVoltage}V`,
            'Secondary Voltage': `${currentSecondaryVoltage}V`,
            'Phase': currentPhase === 'single' ? 'Single Phase' : 'Three Phase'
          },
          results: {
            'Configuration': `${currentResults.kva} kVA, ${currentPhase === 'single' ? 'Single' : 'Three'} Phase`,
            'Voltage Ratio': `${currentResults.primaryVoltage}V / ${currentResults.secondaryVoltage}V`,
            'Primary Current': `${currentResults.primaryCurrent} A`,
            'Secondary Current': `${currentResults.secondaryCurrent} A`,
            'Primary Breaker Size': `${currentResults.primaryBreaker} A`,
            'Secondary Breaker Size': `${currentResults.secondaryBreaker} A`
          },
          additionalInfo: {
            'Formula Used': formula,
            'Primary Side': `${currentResults.primaryCurrent}A at ${currentResults.primaryVoltage}V → ${currentResults.primaryBreaker}A breaker`,
            'Secondary Side': `${currentResults.secondaryCurrent}A at ${currentResults.secondaryVoltage}V → ${currentResults.secondaryBreaker}A breaker`,
            'Breaker Sizing': 'Breakers sized at 125% of rated current per NEC 450.3 (for transformers with 2-6% impedance)',
            'Application': 'Use these currents and breaker sizes for selecting primary and secondary protection devices per NEC Article 450'
          },
          necReferences: [
            'NEC Article 450 - Transformers and Transformer Vaults',
            'NEC 450.3 - Overcurrent Protection',
            'Single Phase Formula: I = (kVA × 1000) ÷ V',
            'Three Phase Formula: I = (kVA × 1000) ÷ (1.732 × V)',
            'Primary overcurrent protection: 125% of rated primary current (most common)',
            'Secondary overcurrent protection: 125% of rated secondary current',
            'Breaker sizes rounded up to next standard rating',
            'Consider temperature correction and adjustment factors for conductors',
            'Account for voltage drop in feeder calculations'
          ]
        };

        exportToPDF(pdfData);
      }
    }
  }));

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
     

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
      {activeTab === 'sizing' ? (
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
                  value={sizingPrimaryVoltage} 
                  onChange={(e) => setSizingPrimaryVoltage(e.target.value)}
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
                  value={sizingSecondaryVoltage} 
                  onChange={(e) => setSizingSecondaryVoltage(e.target.value)}
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
                  value={sizingPhase} 
                  onChange={(e) => setSizingPhase(e.target.value)}
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

          {sizingResults && (
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
                    <strong style={{ color: colors.cardText }}>Connected Load:</strong> {sizingResults.loadKVA} kVA
                  </div>
                  <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: colors.labelText }}>
                    <strong style={{ color: colors.cardText }}>Required Capacity:</strong> {sizingResults.requiredKVA} kVA
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
                    {sizingResults.recommendedSize} kVA
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
                    <strong style={{ color: colors.cardText }}>Configuration:</strong> {sizingPrimaryVoltage}V to {sizingSecondaryVoltage}V
                  </div>
                  <div style={{ fontSize: '0.875rem', color: colors.labelText }}>
                    <strong style={{ color: colors.cardText }}>Phase:</strong> {sizingPhase === 'single' ? 'Single' : 'Three'} Phase
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
                    {sizingResults.utilizationPercent}%
                  </div>
                </div>
              </div>

              {parseFloat(sizingResults.utilizationPercent) > 80 && (
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
      ) : (
        <div>
          {/* Current Calculations Input Card */}
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
                  value={currentPrimaryVoltage} 
                  onChange={(e) => setCurrentPrimaryVoltage(e.target.value)}
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
                  value={currentSecondaryVoltage} 
                  onChange={(e) => setCurrentSecondaryVoltage(e.target.value)}
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
                  value={currentPhase} 
                  onChange={(e) => setCurrentPhase(e.target.value)}
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

          {currentResults && (
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
                    <strong style={{ color: colors.cardText }}>Rating:</strong> {currentResults.kva} kVA, {currentPhase === 'single' ? 'Single' : 'Three'} Phase
                  </div>
                  <div style={{ fontSize: '0.875rem', color: colors.labelText }}>
                    <strong style={{ color: colors.cardText }}>Configuration:</strong> {currentResults.primaryVoltage}V / {currentResults.secondaryVoltage}V
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
                    <strong style={{ color: colors.cardText }}>Voltage:</strong> {currentResults.primaryVoltage}V
                  </div>
                </div>

                <div style={{
                  background: '#dbeafe',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                    Primary Current
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e40af' }}>
                    {currentResults.primaryCurrent}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.25rem' }}>
                    Amperes
                  </div>
                </div>

                <div style={{
                  background: '#1e3a8a',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#93c5fd', marginBottom: '0.25rem' }}>
                    Primary Breaker Size
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#ffffff' }}>
                    {currentResults.primaryBreaker}A
                  </div>
                  <div style={{ fontSize: '0.625rem', color: '#93c5fd', marginTop: '0.25rem' }}>
                    125% of Primary Current (NEC 450.3)
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
                    <strong style={{ color: colors.cardText }}>Voltage:</strong> {currentResults.secondaryVoltage}V
                  </div>
                </div>

                <div style={{
                  background: '#d1fae5',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#059669', marginBottom: '0.25rem' }}>
                    Secondary Current
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#059669' }}>
                    {currentResults.secondaryCurrent}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#059669', marginTop: '0.25rem' }}>
                    Amperes
                  </div>
                </div>

                <div style={{
                  background: '#047857',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#a7f3d0', marginBottom: '0.25rem' }}>
                    Secondary Breaker Size
                  </div>
                  <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#ffffff' }}>
                    {currentResults.secondaryBreaker}A
                  </div>
                  <div style={{ fontSize: '0.625rem', color: '#a7f3d0', marginTop: '0.25rem' }}>
                    125% of Secondary Current (NEC 450.3)
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
      )}

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
});

export default TransformerSizingCalculator;