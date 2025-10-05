import React, { useState } from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

function TransformerSizingCalculator({ onBack }) {
  const [activeTab, setActiveTab] = useState('sizing');

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Load (kVA)
            </label>
            <input 
              type="number" 
              value={loadKVA} 
              onChange={(e) => setLoadKVA(e.target.value)}
              placeholder="Connected load in kVA"
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            />
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Enter total connected load or demand load</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Primary Voltage
            </label>
            <select 
              value={primaryVoltage} 
              onChange={(e) => setPrimaryVoltage(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
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
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Secondary Voltage
            </label>
            <select 
              value={secondaryVoltage} 
              onChange={(e) => setSecondaryVoltage(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
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

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Load Type
            </label>
            <select 
              value={loadType} 
              onChange={(e) => setLoadType(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            >
              <option value="continuous">Continuous (125% sizing)</option>
              <option value="noncontinuous">Non-Continuous (100% sizing)</option>
            </select>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Continuous loads operate for 3+ hours</div>
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
              <option value="1.0">1.0 (Unity)</option>
              <option value="0.95">0.95 (Excellent)</option>
              <option value="0.9">0.9 (Good)</option>
              <option value="0.85">0.85 (Typical)</option>
              <option value="0.8">0.8 (Poor)</option>
            </select>
          </div>
        </div>

        {results && (
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
              background: '#f8fafc', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              color: '#374151'
            }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}><strong>Connected Load:</strong> {results.loadKVA} kVA</div>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}><strong>Required Capacity:</strong> {results.requiredKVA} kVA</div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                ({loadType === 'continuous' ? '125%' : '100%'} sizing factor applied)
              </div>
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
              {results.recommendedSize} kVA
            </div>

            <div style={{ color: '#14532d', marginBottom: '0.5rem' }}>
              <strong>Configuration:</strong> {primaryVoltage}V to {secondaryVoltage}V, {phase === 'single' ? 'Single' : 'Three'} Phase
            </div>
            
            <div style={{ 
              color: '#14532d',
              paddingTop: '1rem',
              borderTop: '1px solid #bbf7d0'
            }}>
              <strong>Utilization:</strong> {results.utilizationPercent}%
            </div>

            {parseFloat(results.utilizationPercent) > 80 && (
              <div style={{ 
                marginTop: '1rem',
                padding: '0.75rem',
                background: '#fef3c7',
                borderRadius: '0.375rem',
                border: '1px solid #fbbf24',
                color: '#92400e',
                fontSize: '0.875rem'
              }}>
                <strong>⚠ Note:</strong> Transformer utilization above 80% may result in higher operating temperatures and reduced equipment life. Consider next size up for better efficiency.
              </div>
            )}
          </div>
        )}

        <div style={{ 
          background: '#f8fafc',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
          marginTop: '1.5rem'
        }}>
          <strong style={{ color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Transformer Sizing Guidelines:</strong>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
            <li style={{ marginBottom: '0.25rem' }}>Size for continuous loads at 125% per NEC 450.3</li>
            <li style={{ marginBottom: '0.25rem' }}>Consider future load growth (typically 20-25%)</li>
            <li style={{ marginBottom: '0.25rem' }}>Keep utilization below 80% for optimal efficiency</li>
            <li style={{ marginBottom: '0.25rem' }}>Account for inrush current for motor loads</li>
            <li>Consider ambient temperature and ventilation</li>
          </ul>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Transformer Rating (kVA)
            </label>
            <input 
              type="number" 
              value={transformerKVA} 
              onChange={(e) => setTransformerKVA(e.target.value)}
              placeholder="Transformer kVA rating"
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Primary Voltage
            </label>
            <select 
              value={primaryVoltage} 
              onChange={(e) => setPrimaryVoltage(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
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
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Secondary Voltage
            </label>
            <select 
              value={secondaryVoltage} 
              onChange={(e) => setSecondaryVoltage(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            >
              <option value="120">120V</option>
              <option value="208">208V</option>
              <option value="240">240V</option>
              <option value="277">277V</option>
              <option value="480">480V</option>
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

        {results && (
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
              background: '#f8fafc', 
              padding: '1rem', 
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              color: '#374151'
            }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <strong>Transformer:</strong> {results.kva} kVA, {phase === 'single' ? 'Single' : 'Three'} Phase
              </div>
              <div style={{ fontSize: '0.875rem' }}><strong>Configuration:</strong> {results.primaryVoltage}V / {results.secondaryVoltage}V</div>
            </div>

            <div style={{ 
              background: '#dbeafe',
              border: '2px solid #3b82f6',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{ color: '#1e3a8a', fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                Primary Side
              </div>
              <div style={{ color: '#374151', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <strong>Voltage:</strong> {results.primaryVoltage}V
              </div>
              <div style={{ 
                color: '#1e40af', 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                padding: '0.75rem',
                background: 'white',
                borderRadius: '0.375rem',
                textAlign: 'center'
              }}>
                {results.primaryCurrent} A
              </div>
            </div>

            <div style={{ 
              background: '#ecfdf5',
              border: '2px solid #10b981',
              padding: '1rem',
              borderRadius: '0.5rem'
            }}>
              <div style={{ color: '#065f46', fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '0.75rem' }}>
                Secondary Side
              </div>
              <div style={{ color: '#374151', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <strong>Voltage:</strong> {results.secondaryVoltage}V
              </div>
              <div style={{ 
                color: '#059669', 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                padding: '0.75rem',
                background: 'white',
                borderRadius: '0.375rem',
                textAlign: 'center'
              }}>
                {results.secondaryCurrent} A
              </div>
            </div>
          </div>
        )}

        <div style={{ 
          background: '#f8fafc',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
          marginTop: '1.5rem'
        }}>
          <strong style={{ color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Current Formulas:</strong>
          <div style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            <div style={{ marginBottom: '0.25rem' }}><strong>Single Phase:</strong> I = (kVA × 1000) ÷ V</div>
            <div><strong>Three Phase:</strong> I = (kVA × 1000) ÷ (1.732 × V)</div>
          </div>
          <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', fontStyle: 'italic', color: '#6b7280' }}>
            Note: Use these currents for selecting primary and secondary protection devices per NEC Article 450.
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
    <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
      <div style={{ background: '#fbbf24', color: 'black', padding: '1.5rem', borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={32} />
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Transformer Calculations</h1>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>NEC Article 450 - Transformers and Transformer Vaults</p>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '1.5rem' }}>
        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => setActiveTab('sizing')}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === 'sizing' ? '#3b82f6' : '#e5e7eb',
              color: activeTab === 'sizing' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '0.5rem',
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
              padding: '0.75rem 1.25rem',
              background: activeTab === 'currents' ? '#3b82f6' : '#e5e7eb',
              color: activeTab === 'currents' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Current Calculations
          </button>
        </div>

        {/* Active Tab Content */}
        {tabComponents[activeTab]}
      </div>

      <div style={{ background: '#1e293b', color: '#cbd5e1', padding: '1.5rem', borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem', fontSize: '0.875rem' }}>
        <p style={{ fontWeight: '600', marginTop: 0, marginBottom: '0.75rem' }}>NEC References:</p>
        <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
          <li style={{ marginBottom: '0.25rem' }}>450.3 - Overcurrent protection requirements for transformers</li>
          <li style={{ marginBottom: '0.25rem' }}>450.9 - Ventilation requirements for transformer installations</li>
          <li style={{ marginBottom: '0.25rem' }}>450.11 - Marking requirements for transformers</li>
          <li>450.21 - Dry-type transformers installed indoors (1000V or less)</li>
        </ul>
      </div>
    </div>
  );
}

export default TransformerSizingCalculator;