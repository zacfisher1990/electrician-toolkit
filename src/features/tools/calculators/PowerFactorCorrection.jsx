import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Activity, Info, TrendingUp, Zap, DollarSign, Calculator } from 'lucide-react';
import { exportToPDF } from '../../../utils/pdfExport';
import CalculatorLayout, { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox,
  TabGroup
} from './CalculatorLayout';
import { getColors } from '../../../theme';

const PowerFactorCorrection = forwardRef(({ isDarkMode = false }, ref) => {
  const [activeTab, setActiveTab] = useState('correction');

  // Capacitor Sizing State
  const [realPower, setRealPower] = useState('');
  const [voltage, setVoltage] = useState('480');
  const [existingPF, setExistingPF] = useState('');
  const [targetPF, setTargetPF] = useState('0.95');
  const [frequency, setFrequency] = useState('60');

  // Cost Savings State
  const [savingsRealPower, setSavingsRealPower] = useState('');
  const [savingsExistingPF, setSavingsExistingPF] = useState('');
  const [savingsTargetPF, setSavingsTargetPF] = useState('0.95');
  const [demandCharge, setDemandCharge] = useState('');
  const [energyRate, setEnergyRate] = useState('');
  const [operatingHours, setOperatingHours] = useState('8760');
  const [pfPenalty, setPfPenalty] = useState('');

  const colors = getColors(isDarkMode);

  // Capacitor Sizing Calculations
  const calculateCapacitor = () => {
    if (!realPower || !existingPF) return null;

    const P = parseFloat(realPower);
    const PF1 = parseFloat(existingPF);
    const PF2 = parseFloat(targetPF);
    const V = parseFloat(voltage);
    const f = parseFloat(frequency);

    const theta1 = Math.acos(PF1);
    const theta2 = Math.acos(PF2);
    const Q1 = P * Math.tan(theta1);
    const Q2 = P * Math.tan(theta2);
    const Qc = Q1 - Q2;
    const kVAR = Qc;
    const capacitance = (kVAR * 1000000000) / (2 * Math.PI * f * V * V);
    const S1 = P / PF1;
    const S2 = P / PF2;
    const I1 = (S1 * 1000) / (Math.sqrt(3) * V);
    const I2 = (S2 * 1000) / (Math.sqrt(3) * V);
    const currentReduction = ((I1 - I2) / I1) * 100;

    return {
      kVAR: kVAR.toFixed(2),
      capacitance: capacitance.toFixed(2),
      existingApparentPower: S1.toFixed(2),
      correctedApparentPower: S2.toFixed(2),
      powerReduction: ((S1 - S2) / S1 * 100).toFixed(1),
      existingCurrent: I1.toFixed(2),
      correctedCurrent: I2.toFixed(2),
      currentReduction: currentReduction.toFixed(1),
      existingPF: (PF1 * 100).toFixed(1),
      targetPF: (PF2 * 100).toFixed(1)
    };
  };

  // Cost Savings Calculations
  const calculateSavings = () => {
    if (!savingsRealPower || !savingsExistingPF || !demandCharge) return null;

    const P = parseFloat(savingsRealPower);
    const PF1 = parseFloat(savingsExistingPF);
    const PF2 = parseFloat(savingsTargetPF);
    const demandCost = parseFloat(demandCharge);
    const energyCost = parseFloat(energyRate) || 0;
    const hours = parseFloat(operatingHours);
    const penalty = parseFloat(pfPenalty) || 0;

    const S1 = P / PF1;
    const S2 = P / PF2;
    const kVAReduction = S1 - S2;
    const monthlyDemandSavings = kVAReduction * demandCost;
    const pfImprovement = (PF2 - PF1) * 100;
    const lossReduction = pfImprovement * 0.01;
    const annualEnergySavings = P * hours * (lossReduction / 100) * energyCost;
    const annualPenaltySavings = penalty * 12;
    const annualDemandSavings = monthlyDemandSavings * 12;
    const totalAnnualSavings = annualDemandSavings + annualEnergySavings + annualPenaltySavings;
    const theta1 = Math.acos(PF1);
    const theta2 = Math.acos(PF2);
    const kVARRequired = P * (Math.tan(theta1) - Math.tan(theta2));
    const estimatedCost = kVARRequired * 75;
    const paybackMonths = totalAnnualSavings > 0 ? (estimatedCost / totalAnnualSavings) * 12 : 0;

    return {
      kVAReduction: kVAReduction.toFixed(2),
      monthlyDemandSavings: monthlyDemandSavings.toFixed(2),
      annualDemandSavings: annualDemandSavings.toFixed(2),
      annualEnergySavings: annualEnergySavings.toFixed(2),
      annualPenaltySavings: annualPenaltySavings.toFixed(2),
      totalAnnualSavings: totalAnnualSavings.toFixed(2),
      kVARRequired: kVARRequired.toFixed(2),
      estimatedCost: estimatedCost.toFixed(2),
      paybackMonths: paybackMonths.toFixed(1),
      paybackYears: (paybackMonths / 12).toFixed(1),
      fiveYearSavings: (totalAnnualSavings * 5 - estimatedCost).toFixed(2)
    };
  };

  const capacitorResult = calculateCapacitor();
  const savingsResult = calculateSavings();

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      if (activeTab === 'correction') {
        if (!realPower || !existingPF) {
          alert('Please enter all required values before exporting to PDF');
          return;
        }

        const pdfData = {
          calculatorName: 'Power Factor Correction - Capacitor Sizing',
          inputs: {
            'Real Power': `${realPower} kW`,
            'System Voltage': `${voltage}V`,
            'Existing Power Factor': existingPF,
            'Target Power Factor': targetPF,
            'Frequency': `${frequency} Hz`
          },
          results: {
            'Required Capacitor Size': `${capacitorResult.kVAR} kVAR`,
            'Capacitance per Phase': `${capacitorResult.capacitance} μF`,
            'Power Factor Before': `${capacitorResult.existingPF}%`,
            'Power Factor After': `${capacitorResult.targetPF}%`,
            'Apparent Power Before': `${capacitorResult.existingApparentPower} kVA`,
            'Apparent Power After': `${capacitorResult.correctedApparentPower} kVA`,
            'Apparent Power Reduction': `${capacitorResult.powerReduction}%`,
            'Line Current Before': `${capacitorResult.existingCurrent} A`,
            'Line Current After': `${capacitorResult.correctedCurrent} A`,
            'Current Reduction': `${capacitorResult.currentReduction}%`
          },
          additionalInfo: {
            'Benefits': 'Power factor correction reduces utility demand charges, lowers line losses and voltage drop, increases system capacity, reduces equipment heating, and improves voltage regulation.'
          },
          necReferences: [
            'NEC Article 460 - Capacitors',
            'NEC 460.8 - Conductors supplying capacitors shall have an ampacity of not less than 135% of the rated current of the capacitor',
            'NEC 460.9 - Rating or Setting of Motor Overload Device'
          ]
        };

        exportToPDF(pdfData);

      } else if (activeTab === 'savings') {
        if (!savingsRealPower || !savingsExistingPF || !demandCharge) {
          alert('Please enter all required values before exporting to PDF');
          return;
        }

        const pdfData = {
          calculatorName: 'Power Factor Correction - Cost Savings Analysis',
          inputs: {
            'Real Power': `${savingsRealPower} kW`,
            'Operating Hours per Year': operatingHours,
            'Existing Power Factor': savingsExistingPF,
            'Target Power Factor': savingsTargetPF,
            'Demand Charge': `$${demandCharge}/kVA/month`,
            'Energy Rate': energyRate ? `$${energyRate}/kWh` : 'Not specified',
            'Monthly PF Penalty': pfPenalty ? `$${pfPenalty}/month` : 'None'
          },
          results: {
            'Total Annual Savings': `$${savingsResult.totalAnnualSavings}/year`,
            'Monthly Demand Savings': `$${savingsResult.monthlyDemandSavings}/month`,
            'Annual Demand Savings': `$${savingsResult.annualDemandSavings}/year`,
            'Annual Energy Savings': `$${savingsResult.annualEnergySavings}/year`,
            'Annual Penalty Savings': `$${savingsResult.annualPenaltySavings}/year`,
            'kVA Reduction': `${savingsResult.kVAReduction} kVA`,
            'Required Capacitor Size': `${savingsResult.kVARRequired} kVAR`,
            'Estimated Equipment Cost': `$${savingsResult.estimatedCost}`,
            'Payback Period': `${savingsResult.paybackMonths} months (${savingsResult.paybackYears} years)`,
            '5-Year Net Savings': `$${savingsResult.fiveYearSavings}`
          },
          additionalInfo: {
            'Cost Basis': 'Estimated at $75 per kVAR installed',
            'Savings Note': 'Actual costs and savings may vary based on equipment selection, installation costs, utility rate structures, and load profiles'
          },
          necReferences: [
            'NEC Article 460 - Capacitors',
            'NEC 460.8 - Conductors supplying capacitors shall have an ampacity of not less than 135% of the rated current of the capacitor',
            'IEEE Std 18-2012 - Standard for Shunt Power Capacitors'
          ]
        };

        exportToPDF(pdfData);
      }
    }
  }));

  const tabs = [
    { id: 'correction', label: 'Capacitor Sizing', icon: Calculator },
    { id: 'savings', label: 'Cost Savings', icon: DollarSign }
  ];

  return (
    <div style={{ margin: '0 -1rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        {/* Tab Navigation */}
        <TabGroup 
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          isDarkMode={isDarkMode}
        />

        {/* Active Tab Content */}
        {activeTab === 'correction' ? (
          <>
            {/* System Parameters */}
            <Section 
              title="System Parameters" 
              icon={Zap} 
              color="#3b82f6" 
              isDarkMode={isDarkMode}
            >
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '0.75rem' 
              }}>
                <InputGroup label="Real Power (kW)" isDarkMode={isDarkMode}>
                  <Input 
                    type="number" 
                    value={realPower} 
                    onChange={(e) => setRealPower(e.target.value)}
                    placeholder="Enter load"
                    isDarkMode={isDarkMode}
                  />
                </InputGroup>

                <InputGroup label="System Voltage" isDarkMode={isDarkMode}>
                  <Select 
                    value={voltage} 
                    onChange={(e) => setVoltage(e.target.value)}
                    isDarkMode={isDarkMode}
                    options={[
                      { value: '208', label: '208V' },
                      { value: '240', label: '240V' },
                      { value: '480', label: '480V' },
                      { value: '600', label: '600V' }
                    ]}
                  />
                </InputGroup>

                <InputGroup 
                  label="Existing Power Factor" 
                  helpText="Current (uncorrected)"
                  isDarkMode={isDarkMode}
                >
                  <Input 
                    type="number" 
                    value={existingPF} 
                    onChange={(e) => setExistingPF(e.target.value)}
                    placeholder="0.70 - 0.99"
                    step="0.01"
                    min="0.5"
                    max="1"
                    isDarkMode={isDarkMode}
                  />
                </InputGroup>

                <InputGroup label="Target Power Factor" isDarkMode={isDarkMode}>
                  <Select 
                    value={targetPF} 
                    onChange={(e) => setTargetPF(e.target.value)}
                    isDarkMode={isDarkMode}
                    options={[
                      { value: '0.90', label: '0.90 (90%)' },
                      { value: '0.95', label: '0.95 (95%) - Recommended' },
                      { value: '0.98', label: '0.98 (98%)' },
                      { value: '0.99', label: '0.99 (99%)' }
                    ]}
                  />
                </InputGroup>

                <InputGroup label="Frequency" isDarkMode={isDarkMode}>
                  <Select 
                    value={frequency} 
                    onChange={(e) => setFrequency(e.target.value)}
                    isDarkMode={isDarkMode}
                    options={[
                      { value: '50', label: '50 Hz' },
                      { value: '60', label: '60 Hz' }
                    ]}
                  />
                </InputGroup>
              </div>
            </Section>

            {/* Results */}
            {capacitorResult && (
              <>
                {/* Required Capacitor Bank */}
                <Section 
                  title="Required Capacitor Bank" 
                  icon={Activity} 
                  color="#10b981" 
                  isDarkMode={isDarkMode}
                >
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: '0.75rem',
                    marginBottom: '0.75rem'
                  }}>
                    <ResultCard
                      label="CAPACITOR SIZE"
                      value={capacitorResult.kVAR}
                      unit="kVAR"
                      color="#3b82f6"
                      isDarkMode={isDarkMode}
                    />
                    <ResultCard
                      label="CAPACITANCE"
                      value={capacitorResult.capacitance}
                      unit="μF per phase"
                      variant="subtle"
                      isDarkMode={isDarkMode}
                    />
                  </div>

                  <InfoBox type="info" isDarkMode={isDarkMode} title="Power Factor Improvement">
                    <div style={{ fontSize: '0.8125rem' }}>
                      <div style={{ marginBottom: '0.25rem' }}>
                        From: {capacitorResult.existingPF}% → To: {capacitorResult.targetPF}%
                      </div>
                      <div style={{ marginBottom: '0.25rem' }}>
                        Real Power: {realPower} kW (constant)
                      </div>
                      <div>
                        System Voltage: {voltage}V, {frequency} Hz
                      </div>
                    </div>
                  </InfoBox>
                </Section>

                {/* System Improvements */}
                <Section 
                  title="System Improvements" 
                  icon={TrendingUp} 
                  color="#f59e0b" 
                  isDarkMode={isDarkMode}
                >
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <InfoBox type="info" isDarkMode={isDarkMode} title="Apparent Power Reduction">
                      <div style={{ fontSize: '0.8125rem' }}>
                        <div style={{ marginBottom: '0.25rem' }}>
                          Before: {capacitorResult.existingApparentPower} kVA
                        </div>
                        <div style={{ marginBottom: '0.25rem' }}>
                          After: {capacitorResult.correctedApparentPower} kVA
                        </div>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '600', 
                          color: '#059669',
                          marginTop: '0.5rem'
                        }}>
                          Reduction: {capacitorResult.powerReduction}%
                        </div>
                      </div>
                    </InfoBox>

                    <InfoBox type="info" isDarkMode={isDarkMode} title="Line Current Reduction">
                      <div style={{ fontSize: '0.8125rem' }}>
                        <div style={{ marginBottom: '0.25rem' }}>
                          Before: {capacitorResult.existingCurrent} A
                        </div>
                        <div style={{ marginBottom: '0.25rem' }}>
                          After: {capacitorResult.correctedCurrent} A
                        </div>
                        <div style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '600', 
                          color: '#059669',
                          marginTop: '0.5rem'
                        }}>
                          Reduction: {capacitorResult.currentReduction}%
                        </div>
                      </div>
                    </InfoBox>
                  </div>
                </Section>

                {/* Benefits Info */}
                <InfoBox type="success" icon={TrendingUp} isDarkMode={isDarkMode} title="Benefits of Power Factor Correction">
                  <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
                    <li style={{ marginBottom: '0.25rem' }}>Reduced utility demand charges</li>
                    <li style={{ marginBottom: '0.25rem' }}>Lower line losses and voltage drop</li>
                    <li style={{ marginBottom: '0.25rem' }}>Increased system capacity</li>
                    <li style={{ marginBottom: '0.25rem' }}>Reduced equipment heating</li>
                    <li>Improved voltage regulation</li>
                  </ul>
                </InfoBox>
              </>
            )}
          </>
        ) : (
          <>
            {/* Load & Power Factor */}
            <Section 
              title="Load & Power Factor" 
              icon={Zap} 
              color="#3b82f6" 
              isDarkMode={isDarkMode}
            >
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '0.75rem' 
              }}>
                <InputGroup label="Real Power (kW)" isDarkMode={isDarkMode}>
                  <Input 
                    type="number" 
                    value={savingsRealPower} 
                    onChange={(e) => setSavingsRealPower(e.target.value)}
                    placeholder="Enter load"
                    isDarkMode={isDarkMode}
                  />
                </InputGroup>

                <InputGroup 
                  label="Operating Hours/Year" 
                  helpText="8760 = 24/7 operation"
                  isDarkMode={isDarkMode}
                >
                  <Input 
                    type="number" 
                    value={operatingHours} 
                    onChange={(e) => setOperatingHours(e.target.value)}
                    placeholder="8760"
                    isDarkMode={isDarkMode}
                  />
                </InputGroup>

                <InputGroup label="Existing Power Factor" isDarkMode={isDarkMode}>
                  <Input 
                    type="number" 
                    value={savingsExistingPF} 
                    onChange={(e) => setSavingsExistingPF(e.target.value)}
                    placeholder="0.70 - 0.99"
                    step="0.01"
                    min="0.5"
                    max="1"
                    isDarkMode={isDarkMode}
                  />
                </InputGroup>

                <InputGroup label="Target Power Factor" isDarkMode={isDarkMode}>
                  <Select 
                    value={savingsTargetPF} 
                    onChange={(e) => setSavingsTargetPF(e.target.value)}
                    isDarkMode={isDarkMode}
                    options={[
                      { value: '0.90', label: '0.90 (90%)' },
                      { value: '0.95', label: '0.95 (95%)' },
                      { value: '0.98', label: '0.98 (98%)' }
                    ]}
                  />
                </InputGroup>
              </div>
            </Section>

            {/* Utility Rates */}
            <Section 
              title="Utility Rates" 
              icon={DollarSign} 
              color="#10b981" 
              isDarkMode={isDarkMode}
            >
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <InputGroup 
                  label="Demand Charge ($/kVA/month)" 
                  helpText="Check your utility bill"
                  isDarkMode={isDarkMode}
                >
                  <Input 
                    type="number" 
                    value={demandCharge} 
                    onChange={(e) => setDemandCharge(e.target.value)}
                    placeholder="10 - 25"
                    step="0.01"
                    isDarkMode={isDarkMode}
                  />
                </InputGroup>

                <InputGroup 
                  label="Energy Rate ($/kWh) - Optional" 
                  helpText="For energy loss savings"
                  isDarkMode={isDarkMode}
                >
                  <Input 
                    type="number" 
                    value={energyRate} 
                    onChange={(e) => setEnergyRate(e.target.value)}
                    placeholder="0.08 - 0.15"
                    step="0.001"
                    isDarkMode={isDarkMode}
                  />
                </InputGroup>

                <InputGroup 
                  label="Monthly PF Penalty ($/month) - Optional" 
                  helpText="If utility charges PF penalty"
                  isDarkMode={isDarkMode}
                >
                  <Input 
                    type="number" 
                    value={pfPenalty} 
                    onChange={(e) => setPfPenalty(e.target.value)}
                    placeholder="0"
                    isDarkMode={isDarkMode}
                  />
                </InputGroup>
              </div>
            </Section>

            {/* Results */}
            {savingsResult && (
              <>
                {/* Annual Cost Savings */}
                <Section 
                  title="Annual Cost Savings" 
                  icon={TrendingUp} 
                  color="#10b981" 
                  isDarkMode={isDarkMode}
                >
                  <ResultCard
                    label="TOTAL ANNUAL SAVINGS"
                    value={`$${savingsResult.totalAnnualSavings}`}
                    unit="per year"
                    color="#10b981"
                    variant="prominent"
                    isDarkMode={isDarkMode}
                  />

                  <InfoBox type="info" isDarkMode={isDarkMode} title="Savings Breakdown">
                    <div style={{ fontSize: '0.8125rem' }}>
                      <div style={{ marginBottom: '0.25rem' }}>
                        Demand Charge Savings: ${savingsResult.annualDemandSavings}/year
                      </div>
                      {parseFloat(savingsResult.annualEnergySavings) > 0 && (
                        <div style={{ marginBottom: '0.25rem' }}>
                          Energy Loss Savings: ${savingsResult.annualEnergySavings}/year
                        </div>
                      )}
                      {parseFloat(savingsResult.annualPenaltySavings) > 0 && (
                        <div style={{ marginBottom: '0.25rem' }}>
                          Penalty Elimination: ${savingsResult.annualPenaltySavings}/year
                        </div>
                      )}
                      <div style={{ 
                        marginTop: '0.5rem', 
                        paddingTop: '0.5rem', 
                        borderTop: `1px solid ${colors.border}` 
                      }}>
                        kVA Reduction: {savingsResult.kVAReduction} kVA
                      </div>
                    </div>
                  </InfoBox>
                </Section>

                {/* Return on Investment */}
                <Section 
                  title="Return on Investment" 
                  icon={DollarSign} 
                  color="#f59e0b" 
                  isDarkMode={isDarkMode}
                >
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                    gap: '0.75rem',
                    marginBottom: '0.75rem'
                  }}>
                    <ResultCard
                      label="ESTIMATED COST"
                      value={`$${savingsResult.estimatedCost}`}
                      unit={`${savingsResult.kVARRequired} kVAR @ $75/kVAR`}
                      variant="subtle"
                      isDarkMode={isDarkMode}
                    />
                    <ResultCard
                      label="PAYBACK PERIOD"
                      value={savingsResult.paybackMonths}
                      unit={`months (${savingsResult.paybackYears} years)`}
                      color="#3b82f6"
                      isDarkMode={isDarkMode}
                    />
                  </div>

                  <InfoBox type="success" isDarkMode={isDarkMode}>
                    <div style={{ fontSize: '0.8125rem' }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                        5-Year Net Savings:
                      </div>
                      <div style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: '700', 
                        color: '#059669',
                        marginBottom: '0.25rem'
                      }}>
                        ${savingsResult.fiveYearSavings}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: colors.subtext }}>
                        Total savings minus initial investment
                      </div>
                    </div>
                  </InfoBox>
                </Section>

                {/* Info Note */}
                <InfoBox type="info" icon={Info} isDarkMode={isDarkMode} title="Note">
                  <div style={{ fontSize: '0.8125rem' }}>
                    Actual costs and savings may vary based on equipment selection, installation costs, utility rate structures, and load profiles. Consult with a qualified electrical engineer for detailed analysis.
                  </div>
                </InfoBox>
              </>
            )}
          </>
        )}

        {/* Reference Footer */}
        <InfoBox type="info" isDarkMode={isDarkMode} title="Power Factor Basics">
          <div style={{ fontSize: '0.8125rem' }}>
            PF = Real Power (kW) ÷ Apparent Power (kVA) • Low PF causes higher current and utility charges • Target 0.95+ for optimal efficiency • Capacitors supply reactive power locally
          </div>
        </InfoBox>
      </CalculatorLayout>
    </div>
  );
});

export default PowerFactorCorrection;