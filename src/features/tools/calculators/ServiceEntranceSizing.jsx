import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Home, Info, Building2, Zap, Calculator } from 'lucide-react';
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

const ServiceEntranceSizing = forwardRef(({ isDarkMode = false }, ref) => {
  const [activeTab, setActiveTab] = useState('residential');

  // Residential Service State
  const [squareFootage, setSquareFootage] = useState('');
  const [hvacLoad, setHvacLoad] = useState('');
  const [waterHeater, setWaterHeater] = useState('');
  const [rangeOven, setRangeOven] = useState('');
  const [dryer, setDryer] = useState('');
  const [otherLoads, setOtherLoads] = useState('');
  const [resVoltage, setResVoltage] = useState('240');

  // Commercial Service State
  const [connectedLoad, setConnectedLoad] = useState('');
  const [demandFactor, setDemandFactor] = useState('80');
  const [comVoltage, setComVoltage] = useState('480');
  const [phase, setPhase] = useState('three');
  const [futureExpansion, setFutureExpansion] = useState('25');

  const colors = getColors(isDarkMode);

  // Residential Service Calculation
  const calculateResidentialService = () => {
    const sqft = parseFloat(squareFootage) || 0;
    const hvac = parseFloat(hvacLoad) || 0;
    const wh = parseFloat(waterHeater) || 0;
    const range = parseFloat(rangeOven) || 0;
    const dry = parseFloat(dryer) || 0;
    const other = parseFloat(otherLoads) || 0;
    const volts = parseFloat(resVoltage);

    const generalLighting = sqft * 3;
    const smallAppliance = 2 * 1500;
    const laundry = 1500;
    const subtotal = generalLighting + smallAppliance + laundry;

    let demandLighting = 0;
    if (subtotal <= 3000) {
      demandLighting = subtotal;
    } else {
      demandLighting = 3000 + ((subtotal - 3000) * 0.35);
    }

    let rangeDemand = 0;
    if (range > 0) {
      if (range <= 12000) {
        rangeDemand = 8000;
      } else {
        rangeDemand = 8000 + ((range - 12000) * 0.05);
      }
    }

    const dryerDemand = Math.max(dry, 5000);
    const whDemand = wh;
    const hvacDemand = hvac;
    const otherDemand = other;

    const totalDemand = demandLighting + rangeDemand + dryerDemand + whDemand + hvacDemand + otherDemand;
    const totalAmperage = totalDemand / volts;

    let recommendedService = 100;
    if (totalAmperage > 200) recommendedService = 400;
    else if (totalAmperage > 150) recommendedService = 200;
    else if (totalAmperage > 100) recommendedService = 150;

    const serviceConductorSizes = {
      100: '4 AWG',
      150: '1/0 AWG',
      200: '2/0 AWG',
      400: '400 kcmil'
    };

    return {
      generalLighting,
      smallAppliance,
      laundry,
      subtotal,
      demandLighting,
      rangeDemand,
      dryerDemand,
      whDemand,
      hvacDemand,
      otherDemand,
      totalDemand,
      totalAmperage,
      recommendedService,
      conductorSize: serviceConductorSizes[recommendedService]
    };
  };

  // Commercial Service Calculation
  const calculateCommercialService = () => {
    const connected = parseFloat(connectedLoad) || 0;
    const demand = parseFloat(demandFactor) / 100;
    const expansion = parseFloat(futureExpansion) / 100;
    const volts = parseFloat(comVoltage);

    const demandLoad = connected * demand;
    const futureLoad = demandLoad * (1 + expansion);

    let amperage;
    if (phase === 'single') {
      amperage = (futureLoad * 1000) / volts;
    } else {
      amperage = (futureLoad * 1000) / (1.732 * volts);
    }

    const standardSizes = [100, 150, 200, 225, 400, 600, 800, 1000, 1200, 1600, 2000, 2500, 3000, 4000];
    const recommendedService = standardSizes.find(size => size >= amperage) || Math.ceil(amperage / 100) * 100;

    return {
      connectedLoad: connected,
      demandLoad,
      futureLoad,
      amperage,
      recommendedService
    };
  };

  const residentialResults = calculateResidentialService();
  const commercialResults = calculateCommercialService();

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      if (activeTab === 'residential') {
        if (!squareFootage) {
          alert('Please enter square footage before exporting to PDF');
          return;
        }

        const pdfData = {
          calculatorName: 'Service Entrance Sizing - Residential',
          inputs: {
            'Square Footage': `${squareFootage} sq ft`,
            'HVAC/Heat Load': hvacLoad ? `${hvacLoad} W` : 'Not specified',
            'Water Heater': waterHeater ? `${waterHeater} W` : 'Not specified',
            'Range/Oven': rangeOven ? `${rangeOven} W` : 'Not specified',
            'Dryer': dryer ? `${dryer} W` : 'Not specified',
            'Other Loads': otherLoads ? `${otherLoads} W` : 'Not specified',
            'Service Voltage': `${resVoltage}V`
          },
          results: {
            'Recommended Service Size': `${residentialResults.recommendedService}A`,
            'Service Conductors': `${residentialResults.conductorSize} Copper`,
            'Total Demand Load': `${residentialResults.totalDemand.toFixed(0)} W`,
            'Calculated Amperage': `${residentialResults.totalAmperage.toFixed(1)} A`
          },
          additionalInfo: {
            'General Lighting Load': `${residentialResults.generalLighting.toLocaleString()} VA`,
            'Small Appliance Circuits': `${residentialResults.smallAppliance.toLocaleString()} VA`,
            'Laundry Circuit': `${residentialResults.laundry.toLocaleString()} VA`,
            'Lighting Demand (after factors)': `${residentialResults.demandLighting.toFixed(0)} W`,
            'Range Demand': rangeOven ? `${residentialResults.rangeDemand.toFixed(0)} W` : 'N/A',
            'Dryer Demand': dryer ? `${residentialResults.dryerDemand.toFixed(0)} W` : 'N/A',
            'Water Heater': waterHeater ? `${residentialResults.whDemand.toFixed(0)} W` : 'N/A',
            'HVAC': hvacLoad ? `${residentialResults.hvacDemand.toFixed(0)} W` : 'N/A',
            'Calculation Method': 'NEC Article 220.82 - Dwelling Unit Optional Calculation'
          },
          necReferences: [
            'NEC 220.82 - Dwelling Unit Optional Calculation',
            'NEC 230.42 - Minimum Size and Rating (service conductors)',
            'NEC 230.79 - Rating of Service Disconnecting Means',
            'NEC 230.90 - Where Required (overload protection)',
            'NEC Table 310.15(B)(16) - Allowable Ampacities',
            'Service conductors shown are approximate for 75°C copper. Consult NEC for exact sizing with all derating factors.'
          ]
        };

        exportToPDF(pdfData);

      } else if (activeTab === 'commercial') {
        if (!connectedLoad) {
          alert('Please enter total connected load before exporting to PDF');
          return;
        }

        const pdfData = {
          calculatorName: 'Service Entrance Sizing - Commercial',
          inputs: {
            'Total Connected Load': `${connectedLoad} kW`,
            'Demand Factor': `${demandFactor}%`,
            'Future Expansion': `${futureExpansion}%`,
            'Service Voltage': `${comVoltage}V`,
            'System Phase': phase === 'single' ? 'Single Phase' : 'Three Phase'
          },
          results: {
            'Recommended Service Size': `${commercialResults.recommendedService}A`,
            'System Configuration': `${comVoltage}V ${phase === 'single' ? 'Single' : 'Three'} Phase`,
            'Connected Load': `${commercialResults.connectedLoad.toFixed(1)} kW`,
            'Demand Load': `${commercialResults.demandLoad.toFixed(1)} kW`,
            'With Future Expansion': `${commercialResults.futureLoad.toFixed(1)} kW`,
            'Calculated Amperage': `${commercialResults.amperage.toFixed(1)} A`
          },
          additionalInfo: {
            'Calculation Method': 'Commercial demand calculation with future expansion factor',
            'Demand Factor Applied': `${demandFactor}% of connected load`,
            'Future Growth Allowance': `${futureExpansion}% spare capacity`,
            'Formula Used': phase === 'single' 
              ? 'Amperage = (kW × 1000) / Voltage'
              : 'Amperage = (kW × 1000) / (1.732 × Voltage)'
          },
          necReferences: [
            'NEC Article 220 Part IV - Optional Feeder and Service Load Calculations',
            'NEC 220.40 - General (demand factors)',
            'NEC 230.42 - Minimum Size and Rating',
            'NEC 230.79 - Rating of Service Disconnecting Means',
            'Consider demand factors per NEC 220.40 and Article 220 Part IV',
            'Include motor loads, HVAC, and large equipment per NEC requirements',
            'Review utility requirements and available fault current',
            'Future expansion typically 20-30% spare capacity'
          ]
        };

        exportToPDF(pdfData);
      }
    }
  }));

  const tabs = [
    { id: 'residential', label: 'Residential', icon: Home },
    { id: 'commercial', label: 'Commercial', icon: Building2 }
  ];

  return (
    <div style={{ margin: '0 -1rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        <TabGroup 
          tabs={tabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          isDarkMode={isDarkMode}
        />

        {activeTab === 'residential' ? (
          <>
            {/* Residential Load Information */}
            <Section 
              title="Load Information" 
              icon={Home} 
              color="#3b82f6" 
              isDarkMode={isDarkMode}
            >
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '0.75rem' 
              }}>
                <InputGroup 
                  label="Square Footage" 
                  helpText="Heated/cooled living space"
                  isDarkMode={isDarkMode}
                >
                  <Input 
                    type="number" 
                    value={squareFootage} 
                    onChange={(e) => setSquareFootage(e.target.value)}
                    placeholder="Living area"
                    isDarkMode={isDarkMode}
                  />
                </InputGroup>

                <InputGroup label="HVAC/Heat Load (Watts)" isDarkMode={isDarkMode}>
                  <Input 
                    type="number" 
                    value={hvacLoad} 
                    onChange={(e) => setHvacLoad(e.target.value)}
                    placeholder="Largest load"
                    isDarkMode={isDarkMode}
                  />
                </InputGroup>

                <InputGroup label="Water Heater (Watts)" isDarkMode={isDarkMode}>
                  <Input 
                    type="number" 
                    value={waterHeater} 
                    onChange={(e) => setWaterHeater(e.target.value)}
                    placeholder="Nameplate rating"
                    isDarkMode={isDarkMode}
                  />
                </InputGroup>

                <InputGroup label="Range/Oven (Watts)" isDarkMode={isDarkMode}>
                  <Input 
                    type="number" 
                    value={rangeOven} 
                    onChange={(e) => setRangeOven(e.target.value)}
                    placeholder="Electric range"
                    isDarkMode={isDarkMode}
                  />
                </InputGroup>

                <InputGroup 
                  label="Dryer (Watts)" 
                  helpText="Minimum 5000W if electric"
                  isDarkMode={isDarkMode}
                >
                  <Input 
                    type="number" 
                    value={dryer} 
                    onChange={(e) => setDryer(e.target.value)}
                    placeholder="Electric dryer"
                    isDarkMode={isDarkMode}
                  />
                </InputGroup>

                <InputGroup label="Other Loads (Watts)" isDarkMode={isDarkMode}>
                  <Input 
                    type="number" 
                    value={otherLoads} 
                    onChange={(e) => setOtherLoads(e.target.value)}
                    placeholder="Pool, spa, etc."
                    isDarkMode={isDarkMode}
                  />
                </InputGroup>

                <InputGroup label="Service Voltage" isDarkMode={isDarkMode}>
                  <Select 
                    value={resVoltage} 
                    onChange={(e) => setResVoltage(e.target.value)}
                    isDarkMode={isDarkMode}
                    options={[
                      { value: '240', label: '240V' },
                      { value: '208', label: '208V' }
                    ]}
                  />
                </InputGroup>
              </div>
            </Section>

            {squareFootage && (
              <>
                {/* Load Breakdown */}
                <Section 
                  title="Load Breakdown" 
                  icon={Calculator} 
                  color="#10b981" 
                  isDarkMode={isDarkMode}
                >
                  <InfoBox type="info" isDarkMode={isDarkMode} title="Connected Loads">
                    <div style={{ fontSize: '0.8125rem' }}>
                      <div style={{ marginBottom: '0.25rem' }}>
                        General Lighting: {residentialResults.generalLighting.toLocaleString()} VA
                      </div>
                      <div style={{ marginBottom: '0.25rem' }}>
                        Small Appliance: {residentialResults.smallAppliance.toLocaleString()} VA
                      </div>
                      <div style={{ marginBottom: '0.5rem' }}>
                        Laundry: {residentialResults.laundry.toLocaleString()} VA
                      </div>
                      <div style={{ 
                        paddingTop: '0.5rem',
                        borderTop: `1px solid ${colors.border}`,
                        color: colors.subtext
                      }}>
                        Subtotal: {residentialResults.subtotal.toLocaleString()} VA
                      </div>
                    </div>
                  </InfoBox>

                  <InfoBox type="info" isDarkMode={isDarkMode} title="Demand Loads (after factors)">
                    <div style={{ fontSize: '0.8125rem' }}>
                      <div style={{ marginBottom: '0.25rem' }}>
                        Lighting: {residentialResults.demandLighting.toFixed(0)} W
                      </div>
                      {rangeOven && (
                        <div style={{ marginBottom: '0.25rem' }}>
                          Range: {residentialResults.rangeDemand.toFixed(0)} W
                        </div>
                      )}
                      {dryer && (
                        <div style={{ marginBottom: '0.25rem' }}>
                          Dryer: {residentialResults.dryerDemand.toFixed(0)} W
                        </div>
                      )}
                      {waterHeater && (
                        <div style={{ marginBottom: '0.25rem' }}>
                          Water Heater: {residentialResults.whDemand.toFixed(0)} W
                        </div>
                      )}
                      {hvacLoad && (
                        <div style={{ marginBottom: '0.25rem' }}>
                          HVAC: {residentialResults.hvacDemand.toFixed(0)} W
                        </div>
                      )}
                      {otherLoads && (
                        <div>
                          Other: {residentialResults.otherDemand.toFixed(0)} W
                        </div>
                      )}
                    </div>
                  </InfoBox>
                </Section>

                {/* Results */}
                <Section 
                  title="Service Sizing Results" 
                  icon={Zap} 
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
                      label="TOTAL DEMAND LOAD"
                      value={residentialResults.totalDemand.toFixed(0)}
                      unit="Watts"
                      variant="subtle"
                      isDarkMode={isDarkMode}
                    />
                    
                    <ResultCard
                      label="CALCULATED AMPERAGE"
                      value={residentialResults.totalAmperage.toFixed(1)}
                      unit="Amperes"
                      variant="subtle"
                      isDarkMode={isDarkMode}
                    />
                  </div>

                  <ResultCard
                    label="RECOMMENDED SERVICE SIZE"
                    value={`${residentialResults.recommendedService}A`}
                    color="#3b82f6"
                    isDarkMode={isDarkMode}
                  />

                  <InfoBox type="info" isDarkMode={isDarkMode}>
                    <div style={{ fontSize: '0.875rem', textAlign: 'center' }}>
                      <strong>Service Conductors:</strong> {residentialResults.conductorSize} Copper
                    </div>
                  </InfoBox>
                </Section>
              </>
            )}

            {/* Important Notes */}
            <InfoBox type="warning" icon={Info} isDarkMode={isDarkMode} title="Important Notes">
              <div style={{ fontSize: '0.8125rem' }}>
                Service conductors are approximate for 75°C copper. Consult NEC Table 310.15(B)(16) for exact sizing with all derating factors.
              </div>
            </InfoBox>
          </>
        ) : (
          <>
            {/* Commercial Load Information */}
            <Section 
              title="Load Information" 
              icon={Building2} 
              color="#3b82f6" 
              isDarkMode={isDarkMode}
            >
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '0.75rem' 
              }}>
                <InputGroup label="Total Connected Load (kW)" isDarkMode={isDarkMode}>
                  <Input 
                    type="number" 
                    value={connectedLoad} 
                    onChange={(e) => setConnectedLoad(e.target.value)}
                    placeholder="Total building load"
                    isDarkMode={isDarkMode}
                  />
                </InputGroup>

                <InputGroup 
                  label="Demand Factor (%)" 
                  helpText="Peak demand percentage"
                  isDarkMode={isDarkMode}
                >
                  <Input 
                    type="number" 
                    value={demandFactor} 
                    onChange={(e) => setDemandFactor(e.target.value)}
                    placeholder="Typically 70-90%"
                    isDarkMode={isDarkMode}
                  />
                </InputGroup>

                <InputGroup 
                  label="Future Expansion (%)" 
                  helpText="Spare capacity for growth"
                  isDarkMode={isDarkMode}
                >
                  <Input 
                    type="number" 
                    value={futureExpansion} 
                    onChange={(e) => setFutureExpansion(e.target.value)}
                    placeholder="Typically 20-30%"
                    isDarkMode={isDarkMode}
                  />
                </InputGroup>

                <InputGroup label="Service Voltage" isDarkMode={isDarkMode}>
                  <Select 
                    value={comVoltage} 
                    onChange={(e) => setComVoltage(e.target.value)}
                    isDarkMode={isDarkMode}
                    options={[
                      { value: '208', label: '208V' },
                      { value: '240', label: '240V' },
                      { value: '480', label: '480V' },
                      { value: '600', label: '600V' }
                    ]}
                  />
                </InputGroup>

                <InputGroup label="System Phase" isDarkMode={isDarkMode}>
                  <Select 
                    value={phase} 
                    onChange={(e) => setPhase(e.target.value)}
                    isDarkMode={isDarkMode}
                    options={[
                      { value: 'single', label: 'Single Phase' },
                      { value: 'three', label: 'Three Phase' }
                    ]}
                  />
                </InputGroup>
              </div>
            </Section>

            {connectedLoad && (
              <>
                {/* Load Calculation */}
                <Section 
                  title="Load Calculation" 
                  icon={Calculator} 
                  color="#10b981" 
                  isDarkMode={isDarkMode}
                >
                  <InfoBox type="info" isDarkMode={isDarkMode}>
                    <div style={{ fontSize: '0.8125rem' }}>
                      <div style={{ marginBottom: '0.25rem' }}>
                        <strong>Connected Load:</strong> {commercialResults.connectedLoad.toFixed(1)} kW
                      </div>
                      <div style={{ marginBottom: '0.25rem' }}>
                        <strong>Demand Load ({demandFactor}%):</strong> {commercialResults.demandLoad.toFixed(1)} kW
                      </div>
                      <div>
                        <strong>With Future Expansion ({futureExpansion}%):</strong> {commercialResults.futureLoad.toFixed(1)} kW
                      </div>
                    </div>
                  </InfoBox>

                  <ResultCard
                    label="CALCULATED AMPERAGE"
                    value={commercialResults.amperage.toFixed(1)}
                    unit="Amperes"
                    variant="subtle"
                    isDarkMode={isDarkMode}
                  />
                </Section>

                {/* Results */}
                <Section 
                  title="Recommended Service" 
                  icon={Zap} 
                  color="#f59e0b" 
                  isDarkMode={isDarkMode}
                >
                  <ResultCard
                    label="SERVICE SIZE"
                    value={`${commercialResults.recommendedService}A`}
                    color="#3b82f6"
                    isDarkMode={isDarkMode}
                  />

                  <InfoBox type="info" isDarkMode={isDarkMode}>
                    <div style={{ fontSize: '0.875rem', textAlign: 'center' }}>
                      @ {comVoltage}V {phase === 'single' ? 'Single' : 'Three'} Phase
                    </div>
                  </InfoBox>
                </Section>
              </>
            )}

            {/* Considerations */}
            <InfoBox type="warning" icon={Info} isDarkMode={isDarkMode} title="Commercial Service Considerations">
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
                <li style={{ marginBottom: '0.25rem' }}>Include demand factors per NEC 220.40 and Article 220 Part IV</li>
                <li style={{ marginBottom: '0.25rem' }}>Consider future expansion (typically 20-30% spare capacity)</li>
                <li style={{ marginBottom: '0.25rem' }}>Account for motor loads, HVAC, and large equipment</li>
                <li style={{ marginBottom: '0.25rem' }}>Review utility requirements and available fault current</li>
                <li>Consider separate services for different occupancies</li>
              </ul>
            </InfoBox>
          </>
        )}

        {/* NEC Reference Footer */}
        <InfoBox type="info" isDarkMode={isDarkMode} title="NEC Article 230 - Services and Service Equipment">
          <div style={{ fontSize: '0.8125rem' }}>
            220.82: Dwelling unit optional calculation • 230.42: Minimum conductor size • 230.79: Disconnecting means rating • 230.90: Overload protection
          </div>
        </InfoBox>
      </CalculatorLayout>
    </div>
  );
});

export default ServiceEntranceSizing;