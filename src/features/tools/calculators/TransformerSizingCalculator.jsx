import React, { useState } from 'react';
import { Zap, Info, AlertTriangle, Calculator as CalcIcon, Gauge } from 'lucide-react';
import { TbCircuitInductor } from 'react-icons/tb';
import { RiWirelessChargingLine } from 'react-icons/ri';
import CalculatorLayout, { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox,
  TabGroup 
} from './CalculatorLayout';

const TransformerSizingCalculator = ({ isDarkMode = false }) => {
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

    const primaryBreakerSize = primaryCurrent * 1.25;
    const secondaryBreakerSize = secondaryCurrent * 1.25;

    const standardBreakers = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200, 225, 250, 300, 350, 400, 450, 500, 600, 700, 800, 1000, 1200, 1600, 2000, 2500, 3000, 4000, 5000, 6000];
    
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

  const tabs = [
    { id: 'sizing', label: 'Transformer Sizing', icon: RiWirelessChargingLine },
    { id: 'currents', label: 'Current Calculations', icon: Gauge }
  ];

  return (
    <div style={{ margin: '0 -1rem' }}>
      <CalculatorLayout
        isDarkMode={isDarkMode}
      >
        <TabGroup
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          isDarkMode={isDarkMode}
        />

      {/* TRANSFORMER SIZING TAB */}
      {activeTab === 'sizing' && (
        <>
          <Section title="Load Information" icon={Info} color="#3b82f6" isDarkMode={isDarkMode}>
            <InputGroup label="Connected Load (kVA)" isDarkMode={isDarkMode}>
              <Input
                type="number"
                value={loadKVA}
                onChange={(e) => setLoadKVA(e.target.value)}
                placeholder="Enter load in kVA"
                isDarkMode={isDarkMode}
                unit="kVA"
              />
            </InputGroup>

            <InputGroup label="Power Factor" isDarkMode={isDarkMode}>
              <Input
                type="number"
                value={powerFactor}
                onChange={(e) => setPowerFactor(e.target.value)}
                placeholder="0.85"
                isDarkMode={isDarkMode}
                step="0.01"
                min="0"
                max="1"
              />
            </InputGroup>

            <InputGroup label="Load Type" isDarkMode={isDarkMode}>
              <Select
                value={loadType}
                onChange={(e) => setLoadType(e.target.value)}
                isDarkMode={isDarkMode}
                options={[
                  { value: 'continuous', label: 'Continuous (125% sizing)' },
                  { value: 'non-continuous', label: 'Non-Continuous (100% sizing)' }
                ]}
              />
            </InputGroup>
          </Section>

          <Section title="Voltage Configuration" icon={Zap} color="#10b981" isDarkMode={isDarkMode}>
            <InputGroup label="Primary Voltage" isDarkMode={isDarkMode}>
              <Select
                value={sizingPrimaryVoltage}
                onChange={(e) => setSizingPrimaryVoltage(e.target.value)}
                isDarkMode={isDarkMode}
                options={[
                  { value: '120', label: '120V' },
                  { value: '208', label: '208V' },
                  { value: '240', label: '240V' },
                  { value: '277', label: '277V' },
                  { value: '480', label: '480V' },
                  { value: '600', label: '600V' },
                  { value: '4160', label: '4160V' },
                  { value: '12470', label: '12470V' }
                ]}
              />
            </InputGroup>

            <InputGroup label="Secondary Voltage" isDarkMode={isDarkMode}>
              <Select
                value={sizingSecondaryVoltage}
                onChange={(e) => setSizingSecondaryVoltage(e.target.value)}
                isDarkMode={isDarkMode}
                options={[
                  { value: '120', label: '120V' },
                  { value: '208', label: '208V' },
                  { value: '240', label: '240V' },
                  { value: '277', label: '277V' },
                  { value: '480', label: '480V' }
                ]}
              />
            </InputGroup>

            <InputGroup label="Phase" isDarkMode={isDarkMode}>
              <Select
                value={sizingPhase}
                onChange={(e) => setSizingPhase(e.target.value)}
                isDarkMode={isDarkMode}
                options={[
                  { value: 'single', label: 'Single Phase' },
                  { value: 'three', label: 'Three Phase' }
                ]}
              />
            </InputGroup>
          </Section>

          {sizingResults && (
            <>
              <Section isDarkMode={isDarkMode}>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <ResultCard
                    label="Recommended Transformer Size"
                    value={sizingResults.recommendedSize}
                    unit="kVA"
                    color="#f59e0b"
                    variant="prominent"
                    isDarkMode={isDarkMode}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <ResultCard
                      label="Connected Load"
                      value={sizingResults.loadKVA}
                      unit="kVA"
                      color="#3b82f6"
                      isDarkMode={isDarkMode}
                    />
                    <ResultCard
                      label="Required Capacity"
                      value={sizingResults.requiredKVA}
                      unit="kVA"
                      color="#10b981"
                      isDarkMode={isDarkMode}
                    />
                  </div>

                  <ResultCard
                    label="Utilization"
                    value={sizingResults.utilizationPercent}
                    unit="%"
                    color={parseFloat(sizingResults.utilizationPercent) > 80 ? '#ef4444' : '#10b981'}
                    isDarkMode={isDarkMode}
                  />
                </div>
              </Section>

              {parseFloat(sizingResults.utilizationPercent) > 80 && (
                <InfoBox type="warning" icon={AlertTriangle} isDarkMode={isDarkMode}>
                  <strong>High Utilization Warning:</strong> Utilization above 80% may result in higher operating 
                  temperatures and reduced equipment life. Consider selecting a larger transformer for better efficiency 
                  and longevity.
                </InfoBox>
              )}

              <InfoBox type="info" icon={Info} title="Sizing Notes" isDarkMode={isDarkMode}>
                <div style={{ fontSize: '0.8125rem', lineHeight: '1.6' }}>
                  • Configuration: {sizingPrimaryVoltage}V to {sizingSecondaryVoltage}V, {sizingPhase === 'single' ? 'Single' : 'Three'} Phase<br/>
                  • Sizing Factor: {loadType === 'continuous' ? '125%' : '100%'} ({loadType === 'continuous' ? 'continuous loads' : 'non-continuous loads'})<br/>
                  • Keep utilization below 80% for optimal efficiency<br/>
                  • Consider 20-25% spare capacity for future growth<br/>
                  • Account for inrush current with motor loads
                </div>
              </InfoBox>
            </>
          )}
        </>
      )}

      {/* CURRENT CALCULATIONS TAB */}
      {activeTab === 'currents' && (
        <>
          <Section title="Transformer Rating" icon={TbCircuitInductor} color="#f59e0b" isDarkMode={isDarkMode}>
            <InputGroup label="Transformer kVA Rating" isDarkMode={isDarkMode}>
              <Input
                type="number"
                value={transformerKVA}
                onChange={(e) => setTransformerKVA(e.target.value)}
                placeholder="Enter transformer rating"
                isDarkMode={isDarkMode}
                unit="kVA"
              />
            </InputGroup>
          </Section>

          <Section title="Voltage Configuration" icon={Zap} color="#10b981" isDarkMode={isDarkMode}>
            <InputGroup label="Primary Voltage" isDarkMode={isDarkMode}>
              <Select
                value={currentPrimaryVoltage}
                onChange={(e) => setCurrentPrimaryVoltage(e.target.value)}
                isDarkMode={isDarkMode}
                options={[
                  { value: '120', label: '120V' },
                  { value: '208', label: '208V' },
                  { value: '240', label: '240V' },
                  { value: '277', label: '277V' },
                  { value: '480', label: '480V' },
                  { value: '600', label: '600V' },
                  { value: '4160', label: '4160V' },
                  { value: '12470', label: '12470V' }
                ]}
              />
            </InputGroup>

            <InputGroup label="Secondary Voltage" isDarkMode={isDarkMode}>
              <Select
                value={currentSecondaryVoltage}
                onChange={(e) => setCurrentSecondaryVoltage(e.target.value)}
                isDarkMode={isDarkMode}
                options={[
                  { value: '120', label: '120V' },
                  { value: '208', label: '208V' },
                  { value: '240', label: '240V' },
                  { value: '277', label: '277V' },
                  { value: '480', label: '480V' }
                ]}
              />
            </InputGroup>

            <InputGroup label="Phase" isDarkMode={isDarkMode}>
              <Select
                value={currentPhase}
                onChange={(e) => setCurrentPhase(e.target.value)}
                isDarkMode={isDarkMode}
                options={[
                  { value: 'single', label: 'Single Phase' },
                  { value: 'three', label: 'Three Phase' }
                ]}
              />
            </InputGroup>
          </Section>

          {currentResults && (
            <>
              <Section title="Primary Side" icon={Zap} color="#1e40af" isDarkMode={isDarkMode}>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <ResultCard
                    label="Primary Current"
                    value={currentResults.primaryCurrent}
                    unit="Amperes"
                    color="#3b82f6"
                    variant="default"
                    isDarkMode={isDarkMode}
                  />
                  <ResultCard
                    label="Primary Breaker Size"
                    value={`${currentResults.primaryBreaker}A`}
                    color="#1e40af"
                    variant="prominent"
                    isDarkMode={isDarkMode}
                  />
                </div>
              </Section>

              <Section title="Secondary Side" icon={Zap} color="#059669" isDarkMode={isDarkMode}>
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  <ResultCard
                    label="Secondary Current"
                    value={currentResults.secondaryCurrent}
                    unit="Amperes"
                    color="#10b981"
                    variant="default"
                    isDarkMode={isDarkMode}
                  />
                  <ResultCard
                    label="Secondary Breaker Size"
                    value={`${currentResults.secondaryBreaker}A`}
                    color="#047857"
                    variant="prominent"
                    isDarkMode={isDarkMode}
                  />
                </div>
              </Section>

              <InfoBox type="info" icon={Info} title="Current Formulas" isDarkMode={isDarkMode}>
                <div style={{ fontSize: '0.8125rem', lineHeight: '1.6' }}>
                  <strong>Single Phase:</strong> I = (kVA × 1000) ÷ V<br/>
                  <strong>Three Phase:</strong> I = (kVA × 1000) ÷ (1.732 × V)<br/><br/>
                  <em>Note: Breakers sized at 125% of rated current per NEC 450.3 (for transformers with 2-6% impedance)</em>
                </div>
              </InfoBox>
            </>
          )}
        </>
      )}

      {/* NEC Reference Footer */}
      <InfoBox type="info" isDarkMode={isDarkMode}>
        <div style={{ fontSize: '0.8125rem' }}>
          <strong>NEC Article 450 - Transformers and Transformer Vaults:</strong><br/>
          450.3: Overcurrent protection • 450.9: Ventilation requirements • 450.11: Marking • 450.21: Dry-type transformers indoors
        </div>
      </InfoBox>
    </CalculatorLayout>
    </div>
  );
};

export default TransformerSizingCalculator;