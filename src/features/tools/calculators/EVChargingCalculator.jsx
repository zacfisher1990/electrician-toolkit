import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Plus, Trash2, CheckCircle, AlertTriangle, Info, Zap, Settings, Battery } from 'lucide-react';
import { exportToPDF } from '../../../utils/pdfExport';
import CalculatorLayout, { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox,
  Button
} from './CalculatorLayout';
import { getColors } from '../../../theme';

const EVChargingCalculator = forwardRef(({ isDarkMode = false, onBack }, ref) => {
  const colors = getColors(isDarkMode);
  
  // State for EVSE inputs
  const [evseList, setEvseList] = useState([
    { name: 'EVSE 1', ratingAmps: '', voltage: '240', count: '1' }
  ]);
  const [loadType, setLoadType] = useState('continuous');
  const [diversityFactor, setDiversityFactor] = useState('100');
  const [useDiversityTable] = useState(false);

  const addEVSE = () => {
    const nextNum = evseList.length + 1;
    setEvseList([...evseList, { 
      name: `EVSE ${nextNum}`, 
      ratingAmps: '', 
      voltage: '240', 
      count: '1' 
    }]);
  };

  const removeEVSE = (index) => {
    if (evseList.length > 1) {
      setEvseList(evseList.filter((_, i) => i !== index));
    }
  };

  const updateEVSE = (index, field, value) => {
    const newEvseList = [...evseList];
    newEvseList[index][field] = value;
    setEvseList(newEvseList);
  };

  // NEC 625.42 Diversity Table
  const getDiversityFromTable = (numberOfEVSE) => {
    if (numberOfEVSE === 1) return 100;
    if (numberOfEVSE === 2) return 100;
    if (numberOfEVSE === 3) return 90;
    if (numberOfEVSE === 4) return 80;
    if (numberOfEVSE === 5) return 70;
    if (numberOfEVSE === 6) return 60;
    if (numberOfEVSE >= 7 && numberOfEVSE <= 8) return 50;
    if (numberOfEVSE >= 9 && numberOfEVSE <= 11) return 45;
    if (numberOfEVSE >= 12 && numberOfEVSE <= 14) return 40;
    if (numberOfEVSE >= 15 && numberOfEVSE <= 19) return 35;
    if (numberOfEVSE >= 20) return 30;
    return 100;
  };

  const calculateEVCharging = () => {
    let totalLoad = 0;
    let totalEVSECount = 0;
    
    const evseDetails = evseList.map(evse => {
      const rating = parseFloat(evse.ratingAmps) || 0;
      const voltage = parseFloat(evse.voltage) || 240;
      const count = parseInt(evse.count) || 0;
      
      const loadFactor = loadType === 'continuous' ? 1.25 : 1.0;
      const loadPerUnit = rating * loadFactor;
      const totalUnitLoad = loadPerUnit * count;
      const powerPerUnit = (rating * voltage) / 1000;
      
      totalLoad += totalUnitLoad;
      totalEVSECount += count;
      
      return {
        name: evse.name,
        rating,
        voltage,
        count,
        loadFactor,
        loadPerUnit: loadPerUnit.toFixed(2),
        totalUnitLoad: totalUnitLoad.toFixed(2),
        powerPerUnit: powerPerUnit.toFixed(2)
      };
    });

    let diversityPercent = parseFloat(diversityFactor) || 100;
    if (useDiversityTable) {
      diversityPercent = getDiversityFromTable(totalEVSECount);
    }
    
    const calculatedLoad = totalLoad * (diversityPercent / 100);
    const feederLoad = calculatedLoad;
    
    const standardBreakers = [15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 110, 125, 150, 175, 200, 225, 250, 300, 350, 400, 450, 500, 600, 700, 800, 1000, 1200];
    const minOCPD = standardBreakers.find(size => size >= feederLoad) || Math.ceil(feederLoad);
    const minConductorAmpacity = minOCPD;

    return {
      evseDetails: evseDetails.filter(e => e.count > 0),
      totalEVSECount,
      totalConnectedLoad: totalLoad.toFixed(2),
      diversityPercent,
      calculatedLoad: calculatedLoad.toFixed(2),
      feederLoad: feederLoad.toFixed(2),
      minOCPD,
      minConductorAmpacity: minConductorAmpacity.toFixed(0),
      loadType,
      hasLoad: totalLoad > 0
    };
  };

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      const results = calculateEVCharging();
      
      if (!results.hasLoad || results.totalEVSECount === 0) {
        alert('Please enter at least one EVSE with ratings before exporting');
        return;
      }

      const evseBreakdown = results.evseDetails
        .map(detail => 
          `${detail.name}: ${detail.rating}A @ ${detail.voltage}V × ${detail.count} = ${detail.totalUnitLoad}A (with ${loadType === 'continuous' ? '125%' : '100%'} factor)`
        )
        .join('; ');

      const pdfData = {
        calculatorName: 'EV Charging Calculator (NEC 625)',
        inputs: {
          totalEVSE: results.totalEVSECount,
          loadType: loadType === 'continuous' ? 'Continuous (125% factor)' : 'Fast Charge (100% factor)',
          diversityFactor: `${results.diversityPercent}%`
        },
        results: {
          totalConnectedLoad: `${results.totalConnectedLoad} A`,
          diversityApplied: `${results.diversityPercent}%`,
          calculatedLoad: `${results.calculatedLoad} A`,
          minimumOCPD: `${results.minOCPD} A`,
          minimumConductorAmpacity: `${results.minConductorAmpacity} A`
        },
        additionalInfo: {
          evseBreakdown: evseBreakdown,
          loadCalculation: loadType === 'continuous' 
            ? 'Continuous loads calculated at 125% per NEC 625.41' 
            : 'Fast charging loads at 100%',
          conductorNote: `Conductors must be rated for at least ${results.minConductorAmpacity}A based on the ${results.minOCPD}A OCPD`,
          diversityNote: results.diversityPercent < 100 
            ? `Diversity factor of ${results.diversityPercent}% applied per load calculation` 
            : 'No diversity factor applied (100%)'
        },
        necReferences: [
          'NEC 625.41 - Rating: EVSE load shall be computed at 125% of maximum load for continuous charging',
          'NEC 625.42 - Feeder and Service Load Calculations: Permitted to apply diversity factors',
          'NEC 625.43 - Overcurrent Protection: Branch circuits and feeders shall be sized for loads',
          'NEC 210.19(A)(1) - Conductor sizing for continuous loads',
          'NEC 215.2(A)(1) - Feeder conductor sizing requirements',
          'Continuous Load: A load where maximum current is expected to continue for 3 hours or more'
        ]
      };

      exportToPDF(pdfData);
    }
  }));

  const results = calculateEVCharging();

  return (
    <div style={{ margin: '0 -1rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        {/* Load Configuration */}
        <Section 
          title="Load Configuration" 
          icon={Settings} 
          color="#3b82f6" 
          isDarkMode={isDarkMode}
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '0.75rem' 
          }}>
            <InputGroup label="Load Type" isDarkMode={isDarkMode}>
              <Select 
                value={loadType} 
                onChange={(e) => setLoadType(e.target.value)}
                isDarkMode={isDarkMode}
                options={[
                  { value: 'continuous', label: 'Continuous (125%)' },
                  { value: 'fastcharge', label: 'Fast Charge (100%)' }
                ]}
              />
            </InputGroup>

            <InputGroup 
              label="Diversity Factor" 
              helpText="100% = no diversity"
              isDarkMode={isDarkMode}
            >
              <Input
                type="number"
                value={diversityFactor}
                onChange={(e) => setDiversityFactor(e.target.value)}
                min="1"
                max="100"
                unit="%"
                isDarkMode={isDarkMode}
              />
            </InputGroup>
          </div>

          <InfoBox type="info" icon={Info} isDarkMode={isDarkMode}>
            <div style={{ fontSize: '0.8125rem' }}>
              <strong>Continuous Load:</strong> Maximum current expected to continue for 3+ hours. 
              NEC 625.41 requires 125% sizing for continuous EV charging loads.
            </div>
          </InfoBox>
        </Section>

        {/* EVSE Equipment */}
        <Section 
          title="EVSE Equipment" 
          icon={Battery} 
          color="#f59e0b" 
          isDarkMode={isDarkMode}
        >
          {evseList.map((evse, index) => (
            <div 
              key={index} 
              style={{
                background: colors.inputBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '0.5rem',
                padding: '0.75rem',
                marginBottom: '0.75rem'
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem'
              }}>
                <input
                  type="text"
                  value={evse.name}
                  onChange={(e) => updateEVSE(index, 'name', e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: '0.9375rem',
                    fontWeight: '600',
                    color: colors.text,
                    outline: 'none',
                    padding: '0.25rem 0'
                  }}
                />
                {evseList.length > 1 && (
                  <button
                    onClick={() => removeEVSE(index)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      borderRadius: '0.25rem',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                gap: '0.5rem' 
              }}>
                <InputGroup label="Rating (A)" isDarkMode={isDarkMode}>
                  <Input
                    type="number"
                    value={evse.ratingAmps}
                    onChange={(e) => updateEVSE(index, 'ratingAmps', e.target.value)}
                    placeholder="32"
                    isDarkMode={isDarkMode}
                  />
                </InputGroup>

                <InputGroup label="Voltage" isDarkMode={isDarkMode}>
                  <Select
                    value={evse.voltage}
                    onChange={(e) => updateEVSE(index, 'voltage', e.target.value)}
                    isDarkMode={isDarkMode}
                    options={[
                      { value: '120', label: '120V' },
                      { value: '208', label: '208V' },
                      { value: '240', label: '240V' },
                      { value: '480', label: '480V' }
                    ]}
                  />
                </InputGroup>

                <InputGroup label="Quantity" isDarkMode={isDarkMode}>
                  <Input
                    type="number"
                    value={evse.count}
                    onChange={(e) => updateEVSE(index, 'count', e.target.value)}
                    min="0"
                    isDarkMode={isDarkMode}
                  />
                </InputGroup>
              </div>
            </div>
          ))}

          <Button 
            onClick={addEVSE}
            variant="outline"
            size="medium"
            fullWidth
            isDarkMode={isDarkMode}
          >
            <Plus size={16} />
            Add EVSE
          </Button>
        </Section>

        {/* Results */}
        {results && results.hasLoad && (
          <Section 
            title="Load Calculation Results" 
            icon={CheckCircle} 
            color="#10b981" 
            isDarkMode={isDarkMode}
          >
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
              gap: '0.75rem',
              marginBottom: '0.75rem'
            }}>
              <ResultCard
                label="Total Connected Load"
                value={results.totalConnectedLoad}
                unit="Amps"
                variant="subtle"
                isDarkMode={isDarkMode}
              />
              
              <ResultCard
                label="Calculated Load"
                value={results.calculatedLoad}
                unit={`Amps (${results.diversityPercent}%)`}
                variant="subtle"
                isDarkMode={isDarkMode}
              />
              
              <ResultCard
                label="Total EVSE"
                value={results.totalEVSECount}
                unit="Units"
                color="#3b82f6"
                isDarkMode={isDarkMode}
              />
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
              gap: '0.75rem',
              marginBottom: '0.75rem'
            }}>
              <ResultCard
                label="Minimum OCPD"
                value={results.minOCPD}
                unit="Amps (Breaker/Fuse)"
                color="#10b981"
                isDarkMode={isDarkMode}
              />

              <ResultCard
                label="Min. Conductor Ampacity"
                value={results.minConductorAmpacity}
                unit="Amps (Before Derating)"
                color="#f59e0b"
                isDarkMode={isDarkMode}
              />
            </div>

            {/* EVSE Breakdown */}
            {results.evseDetails.length > 0 && (
              <InfoBox type="info" icon={Info} isDarkMode={isDarkMode} title="EVSE Breakdown">
                <div style={{ fontSize: '0.8125rem' }}>
                  {results.evseDetails.map((detail, index) => (
                    <div key={index} style={{ 
                      marginTop: index > 0 ? '0.5rem' : 0,
                      paddingTop: index > 0 ? '0.5rem' : 0,
                      borderTop: index > 0 ? `1px solid ${colors.border}` : 'none'
                    }}>
                      <div style={{ fontWeight: '600', marginBottom: '0.125rem' }}>
                        {detail.name} - {detail.rating}A @ {detail.voltage}V × {detail.count}
                      </div>
                      <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                        {detail.powerPerUnit} kW/unit • Load: {detail.loadPerUnit}A/unit • Total: {detail.totalUnitLoad}A
                      </div>
                    </div>
                  ))}
                </div>
              </InfoBox>
            )}

            <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode}>
              <div style={{ fontSize: '0.8125rem' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                  Calculation Complete
                </div>
                <div>
                  {loadType === 'continuous' 
                    ? 'Continuous load factor of 125% applied per NEC 625.41'
                    : 'Fast charging load calculated at 100%'
                  }
                </div>
                {results.diversityPercent < 100 && (
                  <div style={{ marginTop: '0.25rem' }}>
                    Diversity factor of {results.diversityPercent}% applied to total load
                  </div>
                )}
              </div>
            </InfoBox>
          </Section>
        )}

        {/* NEC Reference */}
        <Section 
          title="NEC Article 625 Reference" 
          icon={Info} 
          color="#8b5cf6" 
          isDarkMode={isDarkMode}
        >
          <div style={{ fontSize: '0.8125rem', color: colors.subtext, lineHeight: '1.6' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: colors.text }}>625.41 Rating:</strong> EV load computed at 125% of max load for continuous charging
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong style={{ color: colors.text }}>625.42 Feeder/Service:</strong> Diversity factors permitted for multiple EVSE
            </div>
            <div>
              <strong style={{ color: colors.text }}>625.43 OCPD:</strong> Overcurrent protection shall be sized for calculated loads
            </div>
          </div>
        </Section>
      </CalculatorLayout>
    </div>
  );
});

export default EVChargingCalculator;