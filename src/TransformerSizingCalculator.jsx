import React, { useState } from 'react';

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

    // Standard transformer sizes (kVA)
    const standardSizes = [3, 6, 9, 15, 30, 45, 75, 112.5, 150, 225, 300, 500, 750, 1000, 1500, 2000, 2500, 3000];

    const calculateTransformerSize = () => {
      const load = parseFloat(loadKVA) || 0;
      if (load === 0) return null;

      // Apply sizing factors
      let sizingFactor = 1.0;
      
      // Continuous loads require 125% capacity (NEC 450.3)
      if (loadType === 'continuous') {
        sizingFactor = 1.25;
      }
      
      // Account for power factor if provided
      const pf = parseFloat(powerFactor);
      const apparentPower = load; // Already in kVA
      
      const requiredKVA = apparentPower * sizingFactor;
      
      // Find next standard size
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
        <h3>Transformer Sizing</h3>
        <p className="small">Size transformer based on load requirements</p>

        <div style={{ marginBottom: '15px' }}>
          <label>Load (kVA):</label>
          <input 
            type="number" 
            value={loadKVA} 
            onChange={(e) => setLoadKVA(e.target.value)}
            placeholder="Connected load in kVA"
          />
          <div className="small">Enter total connected load or demand load</div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Primary Voltage:</label>
          <select value={primaryVoltage} onChange={(e) => setPrimaryVoltage(e.target.value)}>
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

        <div style={{ marginBottom: '15px' }}>
          <label>Secondary Voltage:</label>
          <select value={secondaryVoltage} onChange={(e) => setSecondaryVoltage(e.target.value)}>
            <option value="120">120V</option>
            <option value="208">208V</option>
            <option value="240">240V</option>
            <option value="277">277V</option>
            <option value="480">480V</option>
            <option value="600">600V</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Phase:</label>
          <select value={phase} onChange={(e) => setPhase(e.target.value)}>
            <option value="single">Single Phase</option>
            <option value="three">Three Phase</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Load Type:</label>
          <select value={loadType} onChange={(e) => setLoadType(e.target.value)}>
            <option value="continuous">Continuous (125% sizing)</option>
            <option value="noncontinuous">Non-Continuous (100% sizing)</option>
          </select>
          <div className="small">Continuous loads operate for 3+ hours</div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Power Factor:</label>
          <select value={powerFactor} onChange={(e) => setPowerFactor(e.target.value)}>
            <option value="1.0">1.0 (Unity)</option>
            <option value="0.95">0.95 (Excellent)</option>
            <option value="0.9">0.9 (Good)</option>
            <option value="0.85">0.85 (Typical)</option>
            <option value="0.8">0.8 (Poor)</option>
          </select>
        </div>

        {results && (
          <div className="result">
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#1e3a8a' }}>Results:</h3>
            
            <div style={{ 
              backgroundColor: '#f8fafc', 
              padding: '12px', 
              borderRadius: '6px',
              marginBottom: '15px',
              color: '#374151'
            }}>
              <div><strong>Connected Load:</strong> {results.loadKVA} kVA</div>
              <div><strong>Required Capacity:</strong> {results.requiredKVA} kVA</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '5px' }}>
                ({loadType === 'continuous' ? '125%' : '100%'} sizing factor applied)
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#eff6ff',
              border: '2px solid #3b82f6',
              padding: '15px',
              borderRadius: '8px',
              color: '#1e3a8a'
            }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
                Recommended: {results.recommendedSize} kVA
              </div>
              <div style={{ color: '#374151' }}>
                <strong>Configuration:</strong> {primaryVoltage}V to {secondaryVoltage}V, {phase === 'single' ? 'Single' : 'Three'} Phase
              </div>
              <div style={{ color: '#374151', marginTop: '5px' }}>
                <strong>Utilization:</strong> {results.utilizationPercent}%
              </div>
            </div>

            {parseFloat(results.utilizationPercent) > 80 && (
              <div style={{ 
                marginTop: '15px',
                padding: '12px',
                backgroundColor: '#fef3c7',
                borderRadius: '6px',
                border: '1px solid #fbbf24',
                color: '#92400e',
                fontSize: '14px'
              }}>
                ⚠️ <strong>Note:</strong> Transformer utilization above 80% may result in higher operating temperatures and reduced equipment life. Consider next size up for better efficiency.
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
          <strong>Transformer Sizing Guidelines:</strong>
          <ul style={{ textAlign: 'left', paddingLeft: '20px', margin: '10px 0' }}>
            <li>Size for continuous loads at 125% per NEC 450.3</li>
            <li>Consider future load growth (typically 20-25%)</li>
            <li>Keep utilization below 80% for optimal efficiency</li>
            <li>Account for inrush current for motor loads</li>
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
        // Single phase: I = kVA × 1000 / V
        primaryCurrent = (kva * 1000) / vPrimary;
        secondaryCurrent = (kva * 1000) / vSecondary;
      } else {
        // Three phase: I = kVA × 1000 / (√3 × V)
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
        <h3>Transformer Current Calculations</h3>
        <p className="small">Calculate primary and secondary currents</p>

        <div style={{ marginBottom: '15px' }}>
          <label>Transformer Rating (kVA):</label>
          <input 
            type="number" 
            value={transformerKVA} 
            onChange={(e) => setTransformerKVA(e.target.value)}
            placeholder="Transformer kVA rating"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Primary Voltage:</label>
          <select value={primaryVoltage} onChange={(e) => setPrimaryVoltage(e.target.value)}>
            <option value="208">208V</option>
            <option value="240">240V</option>
            <option value="480">480V</option>
            <option value="600">600V</option>
            <option value="2400">2400V</option>
            <option value="4160">4160V</option>
            <option value="12470">12470V</option>
          </select>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Secondary Voltage:</label>
          <select value={secondaryVoltage} onChange={(e) => setSecondaryVoltage(e.target.value)}>
            <option value="120">120V</option>
            <option value="208">208V</option>
            <option value="240">240V</option>
            <option value="277">277V</option>
            <option value="480">480V</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Phase:</label>
          <select value={phase} onChange={(e) => setPhase(e.target.value)}>
            <option value="single">Single Phase</option>
            <option value="three">Three Phase</option>
          </select>
        </div>

        {results && (
          <div className="result">
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#1e3a8a' }}>Results:</h3>
            
            <div style={{ 
              backgroundColor: '#f8fafc', 
              padding: '15px', 
              borderRadius: '6px',
              marginBottom: '10px',
              color: '#374151'
            }}>
              <div style={{ fontSize: '16px', marginBottom: '10px' }}>
                <strong>Transformer:</strong> {results.kva} kVA, {phase === 'single' ? 'Single' : 'Three'} Phase
              </div>
              <div><strong>Configuration:</strong> {results.primaryVoltage}V / {results.secondaryVoltage}V</div>
            </div>

            <div style={{ 
              backgroundColor: '#eff6ff',
              border: '2px solid #3b82f6',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '10px'
            }}>
              <div style={{ color: '#1e3a8a', fontSize: '18px', marginBottom: '10px' }}>
                <strong>Primary Side</strong>
              </div>
              <div style={{ color: '#374151' }}>
                <strong>Voltage:</strong> {results.primaryVoltage}V
              </div>
              <div style={{ color: '#374151', fontSize: '20px', fontWeight: 'bold', marginTop: '5px' }}>
                <strong>Current:</strong> {results.primaryCurrent} A
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#ecfdf5',
              border: '2px solid #10b981',
              padding: '15px',
              borderRadius: '8px'
            }}>
              <div style={{ color: '#065f46', fontSize: '18px', marginBottom: '10px' }}>
                <strong>Secondary Side</strong>
              </div>
              <div style={{ color: '#374151' }}>
                <strong>Voltage:</strong> {results.secondaryVoltage}V
              </div>
              <div style={{ color: '#374151', fontSize: '20px', fontWeight: 'bold', marginTop: '5px' }}>
                <strong>Current:</strong> {results.secondaryCurrent} A
              </div>
            </div>
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
          <strong>Current Formulas:</strong>
          <div style={{ marginTop: '8px' }}>
            <div><strong>Single Phase:</strong> I = (kVA × 1000) ÷ V</div>
            <div><strong>Three Phase:</strong> I = (kVA × 1000) ÷ (1.732 × V)</div>
          </div>
          <div style={{ marginTop: '10px', fontSize: '12px', fontStyle: 'italic' }}>
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
    <div className="calculator-container">
      {onBack && (
        <button onClick={onBack} style={{ marginBottom: '20px' }}>
          ← Back to Menu
        </button>
      )}

      <h2>Transformer Calculations</h2>
      
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '25px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => setActiveTab('sizing')}
          style={{
            padding: '10px 15px',
            backgroundColor: activeTab === 'sizing' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'sizing' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Transformer Sizing
        </button>
        <button 
          onClick={() => setActiveTab('currents')}
          style={{
            padding: '10px 15px',
            backgroundColor: activeTab === 'currents' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'currents' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Current Calculations
        </button>
      </div>

      {/* Active Tab Content */}
      {tabComponents[activeTab]}

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#374151'
      }}>
        <strong>NEC Article 450 - Transformers:</strong>
        <ul style={{ textAlign: 'left', paddingLeft: '20px', margin: '10px 0' }}>
          <li>450.3 - Overcurrent protection requirements</li>
          <li>450.9 - Ventilation requirements</li>
          <li>450.11 - Marking requirements</li>
          <li>450.21 - Dry-type transformers 1000V or less</li>
        </ul>
      </div>
    </div>
  );
}

export default TransformerSizingCalculator;