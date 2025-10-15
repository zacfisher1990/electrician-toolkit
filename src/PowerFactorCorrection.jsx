import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Activity, Info, TrendingUp } from 'lucide-react';
import { exportToPDF } from './pdfExport';

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
        // Check if we have enough data to export
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
        // Check if we have enough data to export
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
            onClick={() => setActiveTab('correction')}
            style={{
              flex: '1 1 auto',
              minWidth: '140px',
              padding: '0.75rem 1rem',
              background: activeTab === 'correction' ? '#3b82f6' : 'transparent',
              color: activeTab === 'correction' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'correction' ? '#3b82f6' : colors.cardBorder}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Capacitor Sizing
          </button>
          <button 
            onClick={() => setActiveTab('savings')}
            style={{
              flex: '1 1 auto',
              minWidth: '140px',
              padding: '0.75rem 1rem',
              background: activeTab === 'savings' ? '#3b82f6' : 'transparent',
              color: activeTab === 'savings' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'savings' ? '#3b82f6' : colors.cardBorder}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Cost Savings
          </button>
        </div>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'correction' ? (
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
              System Parameters
            </h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: colors.labelText, 
                    marginBottom: '0.5rem' 
                  }}>
                    Real Power (kW)
                  </label>
                  <input 
                    type="number" 
                    value={realPower} 
                    onChange={(e) => setRealPower(e.target.value)}
                    placeholder="Enter load"
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
                    System Voltage (V)
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
                    <option value="208">208V</option>
                    <option value="240">240V</option>
                    <option value="480">480V</option>
                    <option value="600">600V</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: colors.labelText, 
                    marginBottom: '0.5rem' 
                  }}>
                    Existing Power Factor
                  </label>
                  <input 
                    type="number" 
                    value={existingPF} 
                    onChange={(e) => setExistingPF(e.target.value)}
                    placeholder="0.70 - 0.99"
                    step="0.01"
                    min="0.5"
                    max="1"
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
                    Current (uncorrected)
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
                    Target Power  <br/>Factor <br/>
                  </label>
                  <select 
                    value={targetPF} 
                    onChange={(e) => setTargetPF(e.target.value)}
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
                    <option value="0.90">0.90 (90%)</option>
                    <option value="0.95">0.95 (95%) - Recommended</option>
                    <option value="0.98">0.98 (98%)</option>
                    <option value="0.99">0.99 (99%)</option>
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
                  Frequency (Hz)
                </label>
                <select 
                  value={frequency} 
                  onChange={(e) => setFrequency(e.target.value)}
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
                  <option value="50">50 Hz</option>
                  <option value="60">60 Hz</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          {capacitorResult && (
            <div>
              {/* Capacitor Requirements */}
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
                  Required Capacitor Bank
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    background: '#dbeafe',
                    padding: '1rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                      Capacitor Size
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                      {capacitorResult.kVAR}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.25rem' }}>
                      kVAR
                    </div>
                  </div>
                  
                  <div style={{
                    background: colors.sectionBg,
                    padding: '1rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                      Capacitance
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                      {capacitorResult.capacitance}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                      μF per phase
                    </div>
                  </div>
                </div>

                <div style={{ 
                  background: colors.sectionBg,
                  padding: '1rem',
                  borderRadius: '8px',
                  border: `1px solid ${colors.cardBorder}`
                }}>
                  <div style={{ fontSize: '0.875rem', color: colors.labelText, marginBottom: '0.5rem' }}>
                    <strong style={{ color: colors.cardText }}>Power Factor Improvement:</strong>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: colors.labelText, display: 'grid', gap: '0.25rem' }}>
                    <div>From: {capacitorResult.existingPF}% → To: {capacitorResult.targetPF}%</div>
                    <div>Real Power: {realPower} kW (constant)</div>
                    <div>System Voltage: {voltage}V, {frequency} Hz</div>
                  </div>
                </div>
              </div>

              {/* System Improvements */}
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
                  System Improvements
                </h3>
                
                <div style={{ display: 'grid', gap: '1rem' }}>
                  <div style={{ 
                    background: colors.sectionBg,
                    padding: '1rem',
                    borderRadius: '8px',
                    border: `1px solid ${colors.cardBorder}`
                  }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: colors.cardText, marginBottom: '0.5rem' }}>
                      Apparent Power Reduction
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: colors.labelText, display: 'grid', gap: '0.25rem' }}>
                      <div>Before: {capacitorResult.existingApparentPower} kVA</div>
                      <div>After: {capacitorResult.correctedApparentPower} kVA</div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '600', 
                        color: '#059669',
                        marginTop: '0.25rem'
                      }}>
                        Reduction: {capacitorResult.powerReduction}%
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    background: colors.sectionBg,
                    padding: '1rem',
                    borderRadius: '8px',
                    border: `1px solid ${colors.cardBorder}`
                  }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: colors.cardText, marginBottom: '0.5rem' }}>
                      Line Current Reduction
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: colors.labelText, display: 'grid', gap: '0.25rem' }}>
                      <div>Before: {capacitorResult.existingCurrent} A</div>
                      <div>After: {capacitorResult.correctedCurrent} A</div>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        fontWeight: '600', 
                        color: '#059669',
                        marginTop: '0.25rem'
                      }}>
                        Reduction: {capacitorResult.currentReduction}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits Info */}
              <div style={{
                background: '#d1fae5',
                border: '1px solid #6ee7b7',
                borderRadius: '8px',
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                  <TrendingUp size={20} color="#059669" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                  <div style={{ fontSize: '0.875rem', color: '#047857', lineHeight: '1.5' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                      Benefits of Power Factor Correction:
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
                      <li style={{ marginBottom: '0.25rem' }}>Reduced utility demand charges</li>
                      <li style={{ marginBottom: '0.25rem' }}>Lower line losses and voltage drop</li>
                      <li style={{ marginBottom: '0.25rem' }}>Increased system capacity</li>
                      <li style={{ marginBottom: '0.25rem' }}>Reduced equipment heating</li>
                      <li>Improved voltage regulation</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Cost Savings Tab Input Card */}
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
              Load & Power Factor
            </h3>
            
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: colors.labelText, 
                    marginBottom: '0.5rem' 
                  }}>
                    Real Power (kW)
                  </label>
                  <input 
                    type="number" 
                    value={savingsRealPower} 
                    onChange={(e) => setSavingsRealPower(e.target.value)}
                    placeholder="Enter load"
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
                    Operating Hours/Year
                  </label>
                  <input 
                    type="number" 
                    value={operatingHours} 
                    onChange={(e) => setOperatingHours(e.target.value)}
                    placeholder="8760"
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
                    8760 = 24/7 operation
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.875rem', 
                    fontWeight: '500', 
                    color: colors.labelText, 
                    marginBottom: '0.5rem' 
                  }}>
                    Existing Power Factor
                  </label>
                  <input 
                    type="number" 
                    value={savingsExistingPF} 
                    onChange={(e) => setSavingsExistingPF(e.target.value)}
                    placeholder="0.70 - 0.99"
                    step="0.01"
                    min="0.5"
                    max="1"
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
                    Target Power Factor
                  </label>
                  <select 
                    value={savingsTargetPF} 
                    onChange={(e) => setSavingsTargetPF(e.target.value)}
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
                    <option value="0.90">0.90 (90%)</option>
                    <option value="0.95">0.95 (95%)</option>
                    <option value="0.98">0.98 (98%)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Utility Rates Card */}
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
              Utility Rates
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
                  Demand Charge ($/kVA/month)
                </label>
                <input 
                  type="number" 
                  value={demandCharge} 
                  onChange={(e) => setDemandCharge(e.target.value)}
                  placeholder="10 - 25"
                  step="0.01"
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
                  Check your utility bill
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
                  Energy Rate ($/kWh) - Optional
                </label>
                <input 
                  type="number" 
                  value={energyRate} 
                  onChange={(e) => setEnergyRate(e.target.value)}
                  placeholder="0.08 - 0.15"
                  step="0.001"
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
                  For energy loss savings
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
                  Monthly PF Penalty ($/month) - Optional
                </label>
                <input 
                  type="number" 
                  value={pfPenalty} 
                  onChange={(e) => setPfPenalty(e.target.value)}
                  placeholder="0"
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
                  If utility charges PF penalty
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          {savingsResult && (
            <div>
              {/* Annual Savings */}
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
                  Annual Cost Savings
                </h3>
                
                <div style={{
                  background: '#d1fae5',
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center',
                  marginBottom: '1rem'
                }}>
                  <div style={{ fontSize: '0.875rem', color: '#059669', marginBottom: '0.5rem', fontWeight: '600' }}>
                    Total Annual Savings
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#059669' }}>
                    ${savingsResult.totalAnnualSavings}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#059669', marginTop: '0.25rem' }}>
                    per year
                  </div>
                </div>

                <div style={{ 
                  background: colors.sectionBg,
                  padding: '1rem',
                  borderRadius: '8px',
                  border: `1px solid ${colors.cardBorder}`
                }}>
                  <div style={{ fontSize: '0.875rem', color: colors.labelText, marginBottom: '0.5rem' }}>
                    <strong style={{ color: colors.cardText }}>Savings Breakdown:</strong>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: colors.labelText, display: 'grid', gap: '0.25rem' }}>
                    <div>Demand Charge Savings: ${savingsResult.annualDemandSavings}/year</div>
                    {parseFloat(savingsResult.annualEnergySavings) > 0 && (
                      <div>Energy Loss Savings: ${savingsResult.annualEnergySavings}/year</div>
                    )}
                    {parseFloat(savingsResult.annualPenaltySavings) > 0 && (
                      <div>Penalty Elimination: ${savingsResult.annualPenaltySavings}/year</div>
                    )}
                    <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: `1px solid ${colors.cardBorder}` }}>
                      kVA Reduction: {savingsResult.kVAReduction} kVA
                    </div>
                  </div>
                </div>
              </div>

              {/* ROI Analysis */}
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
                  Return on Investment
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{
                    background: colors.sectionBg,
                    padding: '1rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                      Estimated Cost
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                      ${savingsResult.estimatedCost}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                      {savingsResult.kVARRequired} kVAR @ $75/kVAR
                    </div>
                  </div>
                  
                  <div style={{
                    background: '#dbeafe',
                    padding: '1rem',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                      Payback Period
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                      {savingsResult.paybackMonths}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.25rem' }}>
                      months ({savingsResult.paybackYears} years)
                    </div>
                  </div>
                </div>

                <div style={{ 
                  background: colors.sectionBg,
                  padding: '1rem',
                  borderRadius: '8px',
                  border: `1px solid ${colors.cardBorder}`
                }}>
                  <div style={{ fontSize: '0.875rem', color: colors.labelText, display: 'grid', gap: '0.25rem' }}>
                    <div><strong style={{ color: colors.cardText }}>5-Year Net Savings:</strong></div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#059669', marginTop: '0.25rem' }}>
                      ${savingsResult.fiveYearSavings}
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: colors.subtleText, marginTop: '0.25rem' }}>
                      Total savings minus initial investment
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Note */}
              <div style={{
                background: '#dbeafe',
                border: '1px solid #3b82f6',
                borderRadius: '8px',
                padding: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                  <Info size={20} color="#1e40af" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                  <div style={{ fontSize: '0.875rem', color: '#1e40af', lineHeight: '1.5' }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      Note:
                    </div>
                    <div style={{ fontSize: '0.8125rem' }}>
                      Actual costs and savings may vary based on equipment selection, installation costs, utility rate structures, and load profiles. Consult with a qualified electrical engineer for detailed analysis.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reference Footer */}
      <div style={{
        background: colors.sectionBg,
        padding: '1rem',
        borderRadius: '8px',
        border: `1px solid ${colors.cardBorder}`,
        fontSize: '0.8125rem',
        color: colors.labelText
      }}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: colors.cardText }}>
          Power Factor Basics:
        </div>
        PF = Real Power (kW) ÷ Apparent Power (kVA) • Low PF causes higher current and utility charges • Target 0.95+ for optimal efficiency • Capacitors supply reactive power locally
      </div>
    </div>
  );
});

export default PowerFactorCorrection;