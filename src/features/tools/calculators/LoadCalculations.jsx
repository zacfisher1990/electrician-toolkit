import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { BarChart3, CheckCircle, Info, Home, Building2, Zap } from 'lucide-react';
import { exportToPDF } from '../../../utils/pdfExport';
import CalculatorLayout, { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox 
} from './CalculatorLayout';

// Residential Load Calculator (NEC 220.82 Standard Method)
const ResidentialLoadCalculator = ({ data, setData, isDarkMode }) => {
  const calculateResidentialLoad = () => {
    const sqft = parseFloat(data.squareFootage) || 0;
    const sac = parseFloat(data.smallApplianceCircuits) || 0;
    const laundry = parseFloat(data.laundryCircuits) || 0;
    const range = parseFloat(data.rangeKW) || 0;
    const dryer = parseFloat(data.dryerKW) || 0;
    const waterHeater = parseFloat(data.waterHeaterKW) || 0;
    const hvac = parseFloat(data.hvacKW) || 0;
    const other = parseFloat(data.otherLoadsKW) || 0;
    const volts = parseFloat(data.voltage);

    const generalLighting = sqft * 3;
    const smallApplianceLoad = sac * 1500;
    const laundryLoad = laundry * 1500;
    const subtotalVA = generalLighting + smallApplianceLoad + laundryLoad;

    let demandLighting = 0;
    if (subtotalVA <= 3000) {
      demandLighting = subtotalVA;
    } else if (subtotalVA <= 120000) {
      demandLighting = 3000 + ((subtotalVA - 3000) * 0.35);
    } else {
      demandLighting = 3000 + (117000 * 0.35) + ((subtotalVA - 120000) * 0.25);
    }

    let rangeDemand = 0;
    if (range > 0) {
      if (range <= 12) {
        rangeDemand = 8000;
      } else {
        rangeDemand = 8000 + ((range - 12) * 400);
      }
    }

    const dryerDemand = Math.max(dryer * 1000, 5000);
    const waterHeaterDemand = waterHeater * 1000;
    const hvacDemand = hvac * 1000;
    const otherDemand = other * 1000;

    const totalDemandVA = demandLighting + rangeDemand + dryerDemand + waterHeaterDemand + hvacDemand + otherDemand;
    const totalDemandKW = totalDemandVA / 1000;
    const totalAmperage = totalDemandVA / volts;

    let recommendedService = 100;
    if (totalAmperage > 200) recommendedService = 400;
    else if (totalAmperage > 150) recommendedService = 200;
    else if (totalAmperage > 100) recommendedService = 150;

    return {
      generalLighting,
      smallApplianceLoad,
      laundryLoad,
      subtotalVA,
      demandLighting,
      rangeDemand,
      dryerDemand,
      waterHeaterDemand,
      hvacDemand,
      otherDemand,
      totalDemandVA,
      totalDemandKW,
      totalAmperage,
      recommendedService
    };
  };

  const results = calculateResidentialLoad();

  return (
    <>
      {/* Basic Information */}
      <Section 
        title="Basic Information" 
        icon={Home} 
        color="#3b82f6" 
        isDarkMode={isDarkMode}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '0.75rem' 
        }}>
          <InputGroup label="Square Footage" isDarkMode={isDarkMode}>
            <Input
              type="number"
              value={data.squareFootage}
              onChange={(e) => setData(prev => ({...prev, squareFootage: e.target.value}))}
              placeholder="Living area"
              isDarkMode={isDarkMode}
            />
          </InputGroup>

          <InputGroup label="Small Appliance Circuits" helper="@ 1500 VA each" isDarkMode={isDarkMode}>
            <Input
              type="number"
              value={data.smallApplianceCircuits}
              onChange={(e) => setData(prev => ({...prev, smallApplianceCircuits: e.target.value}))}
              placeholder="Min 2"
              isDarkMode={isDarkMode}
            />
          </InputGroup>

          <InputGroup label="Laundry Circuits" helper="@ 1500 VA" isDarkMode={isDarkMode}>
            <Input
              type="number"
              value={data.laundryCircuits}
              onChange={(e) => setData(prev => ({...prev, laundryCircuits: e.target.value}))}
              placeholder="Typically 1"
              isDarkMode={isDarkMode}
            />
          </InputGroup>
        </div>
      </Section>

      {/* Major Appliances */}
      <Section 
        title="Major Appliances" 
        icon={Zap} 
        color="#f59e0b" 
        isDarkMode={isDarkMode}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '0.75rem', 
          marginBottom: '0.75rem' 
        }}>
          <InputGroup label="Electric Range (kW)" isDarkMode={isDarkMode}>
            <Input
              type="number"
              value={data.rangeKW}
              onChange={(e) => setData(prev => ({...prev, rangeKW: e.target.value}))}
              placeholder="Nameplate rating"
              isDarkMode={isDarkMode}
            />
          </InputGroup>

          <InputGroup label="Electric Dryer (kW)" isDarkMode={isDarkMode}>
            <Input
              type="number"
              value={data.dryerKW}
              onChange={(e) => setData(prev => ({...prev, dryerKW: e.target.value}))}
              placeholder="Min 5 kW"
              isDarkMode={isDarkMode}
            />
          </InputGroup>

          <InputGroup label="Water Heater (kW)" isDarkMode={isDarkMode}>
            <Input
              type="number"
              value={data.waterHeaterKW}
              onChange={(e) => setData(prev => ({...prev, waterHeaterKW: e.target.value}))}
              placeholder="Nameplate"
              isDarkMode={isDarkMode}
            />
          </InputGroup>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '0.75rem' 
        }}>
          <InputGroup label="HVAC/Heat (kW)" isDarkMode={isDarkMode}>
            <Input
              type="number"
              value={data.hvacKW}
              onChange={(e) => setData(prev => ({...prev, hvacKW: e.target.value}))}
              placeholder="Heating load"
              isDarkMode={isDarkMode}
            />
          </InputGroup>

          <InputGroup label="Other Loads (kW)" isDarkMode={isDarkMode}>
            <Input
              type="number"
              value={data.otherLoadsKW}
              onChange={(e) => setData(prev => ({...prev, otherLoadsKW: e.target.value}))}
              placeholder="Additional"
              isDarkMode={isDarkMode}
            />
          </InputGroup>

          <InputGroup label="Service Voltage" isDarkMode={isDarkMode}>
            <Select
              value={data.voltage}
              onChange={(e) => setData(prev => ({...prev, voltage: e.target.value}))}
              isDarkMode={isDarkMode}
              options={[
                { value: '120', label: '120V' },
                { value: '240', label: '240V' }
              ]}
            />
          </InputGroup>
        </div>
      </Section>

      {/* Results */}
      {results.totalDemandVA > 0 && (
        <Section isDarkMode={isDarkMode}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '0.75rem', 
            marginBottom: '0.75rem' 
          }}>
            <ResultCard
              label="Total Demand"
              value={results.totalDemandKW.toFixed(2)}
              unit="kW"
              color="#3b82f6"
              variant="prominent"
              isDarkMode={isDarkMode}
            />
            
            <ResultCard
              label="Service Amperage"
              value={results.totalAmperage.toFixed(1)}
              unit="Amps"
              color="#10b981"
              variant="prominent"
              isDarkMode={isDarkMode}
            />
            
            <ResultCard
              label="Recommended Service"
              value={results.recommendedService}
              unit="Amp"
              color="#8b5cf6"
              variant="prominent"
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Load Breakdown */}
          <InfoBox type="info" isDarkMode={isDarkMode} title="Load Breakdown">
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>General Lighting:</strong> {results.generalLighting.toLocaleString()} VA
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Small Appliance:</strong> {results.smallApplianceLoad.toLocaleString()} VA
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Laundry:</strong> {results.laundryLoad.toLocaleString()} VA
              </div>
              <div style={{ 
                marginBottom: '0.5rem', 
                paddingTop: '0.5rem', 
                borderTop: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}` 
              }}>
                <strong>Lighting Subtotal:</strong> {results.subtotalVA.toLocaleString()} VA
              </div>
              <div style={{ marginBottom: '0.5rem', opacity: 0.8 }}>
                <strong>After Demand Factors:</strong> {results.demandLighting.toFixed(0)} VA
              </div>
              {results.rangeDemand > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Range:</strong> {results.rangeDemand.toLocaleString()} W
                </div>
              )}
              {results.dryerDemand > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Dryer:</strong> {results.dryerDemand.toLocaleString()} W
                </div>
              )}
              {results.waterHeaterDemand > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Water Heater:</strong> {results.waterHeaterDemand.toLocaleString()} W
                </div>
              )}
              {results.hvacDemand > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>HVAC:</strong> {results.hvacDemand.toLocaleString()} W
                </div>
              )}
              {results.otherDemand > 0 && (
                <div style={{ marginTop: '0.5rem' }}>
                  <strong>Other Loads:</strong> {results.otherDemand.toLocaleString()} W
                </div>
              )}
            </div>
          </InfoBox>

          <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              Calculation Complete
            </div>
            <div style={{ fontSize: '0.8125rem' }}>
              Based on NEC 220.82 Standard Method for Dwelling Units
            </div>
          </InfoBox>
        </Section>
      )}

      {/* NEC Reference */}
      <InfoBox type="info" isDarkMode={isDarkMode}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
          NEC 220.82 - Dwelling Unit Optional Calculation:
        </div>
        <div style={{ fontSize: '0.8125rem' }}>
          General lighting: 3 VA per sq ft • Small appliance: 1500 VA per circuit • Laundry: 1500 VA<br />
          Demand factors: First 3000 VA @ 100%, Next 117000 VA @ 35%, Remainder @ 25%
        </div>
      </InfoBox>
    </>
  );
};

// Commercial Load Calculator
const CommercialLoadCalculator = ({ data, setData, isDarkMode }) => {
  const lightingVAPerSqFt = {
    'office': 3.5,
    'warehouse': 0.25,
    'retail': 3.0,
    'school': 3.0,
    'restaurant': 2.0,
    'hotel': 2.0,
    'hospital': 2.0,
    'industrial': 2.0
  };

  const occupancyNames = {
    'office': 'Office',
    'warehouse': 'Warehouse',
    'retail': 'Retail',
    'school': 'School',
    'restaurant': 'Restaurant',
    'hotel': 'Hotel',
    'hospital': 'Hospital',
    'industrial': 'Industrial'
  };

  const calculateCommercialLoad = () => {
    const sqft = parseFloat(data.squareFootage) || 0;
    const hvac = parseFloat(data.hvacLoad) || 0;
    const receptacles = parseFloat(data.receptacleLoad) || 0;
    const motors = parseFloat(data.motorLoads) || 0;
    const other = parseFloat(data.otherLoads) || 0;
    const demand = parseFloat(data.demandFactor) / 100;
    const volts = parseFloat(data.voltage);

    const lightingVA = sqft * lightingVAPerSqFt[data.occupancyType];
    const lightingKW = lightingVA / 1000;
    const totalConnectedKW = lightingKW + hvac + receptacles + motors + other;
    const demandLoadKW = totalConnectedKW * demand;

    let amperage;
    if (data.phase === 'single') {
      amperage = (demandLoadKW * 1000) / volts;
    } else {
      amperage = (demandLoadKW * 1000) / (1.732 * volts);
    }

    return {
      lightingVA,
      lightingKW,
      totalConnectedKW,
      demandLoadKW,
      amperage
    };
  };

  const results = calculateCommercialLoad();

  return (
    <>
      {/* Building Information */}
      <Section 
        title="Building Information" 
        icon={Building2} 
        color="#3b82f6" 
        isDarkMode={isDarkMode}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '0.75rem' 
        }}>
          <InputGroup label="Square Footage" isDarkMode={isDarkMode}>
            <Input
              type="number"
              value={data.squareFootage}
              onChange={(e) => setData(prev => ({...prev, squareFootage: e.target.value}))}
              placeholder="Total area"
              isDarkMode={isDarkMode}
            />
          </InputGroup>

          <InputGroup label="Occupancy Type" isDarkMode={isDarkMode}>
            <Select
              value={data.occupancyType}
              onChange={(e) => setData(prev => ({...prev, occupancyType: e.target.value}))}
              isDarkMode={isDarkMode}
              options={Object.entries(occupancyNames).map(([value, label]) => ({
                value,
                label: `${label} (${lightingVAPerSqFt[value]} VA/sq ft)`
              }))}
            />
          </InputGroup>

          <InputGroup label="Demand Factor" helper="% of connected load" isDarkMode={isDarkMode}>
            <Input
              type="number"
              value={data.demandFactor}
              onChange={(e) => setData(prev => ({...prev, demandFactor: e.target.value}))}
              placeholder="80"
              min="0"
              max="100"
              isDarkMode={isDarkMode}
            />
          </InputGroup>
        </div>
      </Section>

      {/* Electrical System */}
      <Section 
        title="Electrical System" 
        icon={Zap} 
        color="#f59e0b" 
        isDarkMode={isDarkMode}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '0.75rem' 
        }}>
          <InputGroup label="System Voltage" isDarkMode={isDarkMode}>
            <Select
              value={data.voltage}
              onChange={(e) => setData(prev => ({...prev, voltage: e.target.value}))}
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

          <InputGroup label="Phase Configuration" isDarkMode={isDarkMode}>
            <Select
              value={data.phase}
              onChange={(e) => setData(prev => ({...prev, phase: e.target.value}))}
              isDarkMode={isDarkMode}
              options={[
                { value: 'single', label: 'Single Phase' },
                { value: 'three', label: 'Three Phase' }
              ]}
            />
          </InputGroup>
        </div>
      </Section>

      {/* Additional Loads */}
      <Section 
        title="Additional Loads" 
        icon={BarChart3} 
        color="#10b981" 
        isDarkMode={isDarkMode}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '0.75rem' 
        }}>
          <InputGroup label="HVAC Load (kW)" isDarkMode={isDarkMode}>
            <Input
              type="number"
              value={data.hvacLoad}
              onChange={(e) => setData(prev => ({...prev, hvacLoad: e.target.value}))}
              placeholder="0"
              isDarkMode={isDarkMode}
            />
          </InputGroup>

          <InputGroup label="Receptacle Load (kW)" isDarkMode={isDarkMode}>
            <Input
              type="number"
              value={data.receptacleLoad}
              onChange={(e) => setData(prev => ({...prev, receptacleLoad: e.target.value}))}
              placeholder="0"
              isDarkMode={isDarkMode}
            />
          </InputGroup>

          <InputGroup label="Motor Loads (kW)" isDarkMode={isDarkMode}>
            <Input
              type="number"
              value={data.motorLoads}
              onChange={(e) => setData(prev => ({...prev, motorLoads: e.target.value}))}
              placeholder="0"
              isDarkMode={isDarkMode}
            />
          </InputGroup>

          <InputGroup label="Other Loads (kW)" isDarkMode={isDarkMode}>
            <Input
              type="number"
              value={data.otherLoads}
              onChange={(e) => setData(prev => ({...prev, otherLoads: e.target.value}))}
              placeholder="0"
              isDarkMode={isDarkMode}
            />
          </InputGroup>
        </div>
      </Section>

      {/* Results */}
      {results.totalConnectedKW > 0 && (
        <Section isDarkMode={isDarkMode}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '0.75rem', 
            marginBottom: '0.75rem' 
          }}>
            <ResultCard
              label="Connected Load"
              value={results.totalConnectedKW.toFixed(2)}
              unit="kW"
              color="#6b7280"
              variant="subtle"
              isDarkMode={isDarkMode}
            />
            
            <ResultCard
              label="Demand Load"
              value={results.demandLoadKW.toFixed(2)}
              unit="kW"
              color="#3b82f6"
              variant="prominent"
              isDarkMode={isDarkMode}
            />
            
            <ResultCard
              label="Total Amperage"
              value={results.amperage.toFixed(1)}
              unit="Amps"
              color="#10b981"
              variant="prominent"
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Load Breakdown */}
          <InfoBox type="info" isDarkMode={isDarkMode} title="Load Breakdown">
            <div style={{ fontSize: '0.8125rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <strong>Lighting:</strong> {results.lightingKW.toFixed(2)} kW ({results.lightingVA.toFixed(0)} VA)
              </div>
              {parseFloat(data.hvacLoad) > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>HVAC:</strong> {parseFloat(data.hvacLoad).toFixed(2)} kW
                </div>
              )}
              {parseFloat(data.receptacleLoad) > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Receptacles:</strong> {parseFloat(data.receptacleLoad).toFixed(2)} kW
                </div>
              )}
              {parseFloat(data.motorLoads) > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Motors:</strong> {parseFloat(data.motorLoads).toFixed(2)} kW
                </div>
              )}
              {parseFloat(data.otherLoads) > 0 && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Other:</strong> {parseFloat(data.otherLoads).toFixed(2)} kW
                </div>
              )}
              <div style={{ 
                marginTop: '0.5rem', 
                paddingTop: '0.5rem', 
                borderTop: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
                opacity: 0.8 
              }}>
                {data.phase === 'single' 
                  ? `Amperage = (${results.demandLoadKW.toFixed(2)} kW × 1000) ÷ ${data.voltage}V`
                  : `Amperage = (${results.demandLoadKW.toFixed(2)} kW × 1000) ÷ (1.732 × ${data.voltage}V)`
                }
              </div>
            </div>
          </InfoBox>

          <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode}>
            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
              Calculation Complete
            </div>
            <div style={{ fontSize: '0.8125rem' }}>
              Based on NEC Article 220 - Branch-Circuit, Feeder, and Service Load Calculations
            </div>
          </InfoBox>
        </Section>
      )}

      {/* NEC Reference */}
      <InfoBox type="info" isDarkMode={isDarkMode}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
          NEC Article 220 - Commercial Load Calculations:
        </div>
        <div style={{ fontSize: '0.8125rem' }}>
          Lighting loads per NEC Table 220.12 • Demand factors per local jurisdiction • Always verify with actual connected loads and applicable codes
        </div>
      </InfoBox>
    </>
  );
};

const LoadCalculations = forwardRef(({ isDarkMode = false }, ref) => {
  const [activeTab, setActiveTab] = useState('residential');
  
  const [residentialData, setResidentialData] = useState({
    squareFootage: '',
    smallApplianceCircuits: '2',
    laundryCircuits: '1',
    rangeKW: '',
    dryerKW: '',
    waterHeaterKW: '',
    hvacKW: '',
    otherLoadsKW: '',
    voltage: '240'
  });

  const [commercialData, setCommercialData] = useState({
    squareFootage: '',
    occupancyType: 'office',
    demandFactor: '80',
    voltage: '208',
    phase: 'three',
    hvacLoad: '',
    receptacleLoad: '',
    motorLoads: '',
    otherLoads: ''
  });

  useImperativeHandle(ref, () => ({
    exportPDF() {
      let pdfData = null;

      if (activeTab === 'residential') {
        if (!residentialData.squareFootage) {
          alert('Please enter square footage before exporting');
          return;
        }

        const sqft = parseFloat(residentialData.squareFootage);
        const sac = parseFloat(residentialData.smallApplianceCircuits) || 0;
        const laundry = parseFloat(residentialData.laundryCircuits) || 0;
        const range = parseFloat(residentialData.rangeKW) || 0;
        const dryer = parseFloat(residentialData.dryerKW) || 0;
        const waterHeater = parseFloat(residentialData.waterHeaterKW) || 0;
        const hvac = parseFloat(residentialData.hvacKW) || 0;
        const other = parseFloat(residentialData.otherLoadsKW) || 0;
        const volts = parseFloat(residentialData.voltage);

        const generalLighting = sqft * 3;
        const smallApplianceLoad = sac * 1500;
        const laundryLoad = laundry * 1500;
        const subtotalVA = generalLighting + smallApplianceLoad + laundryLoad;

        let demandLighting = 0;
        if (subtotalVA <= 3000) {
          demandLighting = subtotalVA;
        } else if (subtotalVA <= 120000) {
          demandLighting = 3000 + ((subtotalVA - 3000) * 0.35);
        } else {
          demandLighting = 3000 + (117000 * 0.35) + ((subtotalVA - 120000) * 0.25);
        }

        let rangeDemand = 0;
        if (range > 0) {
          if (range <= 12) {
            rangeDemand = 8000;
          } else {
            rangeDemand = 8000 + ((range - 12) * 400);
          }
        }

        const dryerDemand = Math.max(dryer * 1000, 5000);
        const waterHeaterDemand = waterHeater * 1000;
        const hvacDemand = hvac * 1000;
        const otherDemand = other * 1000;

        const totalDemandVA = demandLighting + rangeDemand + dryerDemand + waterHeaterDemand + hvacDemand + otherDemand;
        const totalDemandKW = (totalDemandVA / 1000).toFixed(2);
        const totalAmperage = (totalDemandVA / volts).toFixed(1);

        let recommendedService = 100;
        if (parseFloat(totalAmperage) > 200) recommendedService = 400;
        else if (parseFloat(totalAmperage) > 150) recommendedService = 200;
        else if (parseFloat(totalAmperage) > 100) recommendedService = 150;

        const inputs = {
          squareFootage: `${residentialData.squareFootage} sq ft`,
          smallApplianceCircuits: `${sac} circuits @ 1500 VA each`,
          laundryCircuits: `${laundry} circuit @ 1500 VA`,
          serviceVoltage: `${residentialData.voltage}V`
        };

        if (range > 0) inputs.electricRange = `${range} kW`;
        if (dryer > 0) inputs.electricDryer = `${dryer} kW`;
        if (waterHeater > 0) inputs.waterHeater = `${waterHeater} kW`;
        if (hvac > 0) inputs.hvacHeat = `${hvac} kW`;
        if (other > 0) inputs.otherLoads = `${other} kW`;

        pdfData = {
          calculatorName: 'Load Calculations - Residential (NEC 220.82)',
          inputs,
          results: {
            totalDemandLoad: `${totalDemandKW} kW (${totalDemandVA.toLocaleString()} VA)`,
            totalAmperage: `${totalAmperage} Amps`,
            recommendedService: `${recommendedService} Amp Service`
          },
          additionalInfo: {
            generalLighting: `${generalLighting.toLocaleString()} VA (${sqft} sq ft × 3 VA/sq ft)`,
            smallAppliance: `${smallApplianceLoad.toLocaleString()} VA`,
            laundry: `${laundryLoad.toLocaleString()} VA`,
            lightingSubtotal: `${subtotalVA.toLocaleString()} VA`,
            demandLightingAfterFactors: `${demandLighting.toFixed(0)} VA`,
            ...(range > 0 && { rangeDemand: `${rangeDemand.toLocaleString()} W` }),
            ...(dryer > 0 && { dryerDemand: `${dryerDemand.toLocaleString()} W (min 5000 W)` }),
            ...(waterHeater > 0 && { waterHeaterDemand: `${waterHeaterDemand.toLocaleString()} W` }),
            ...(hvac > 0 && { hvacDemand: `${hvacDemand.toLocaleString()} W` }),
            ...(other > 0 && { otherDemand: `${otherDemand.toLocaleString()} W` })
          },
          necReferences: [
            'NEC 220.82 - Dwelling Unit Optional Calculation',
            'NEC 220.83 - Existing Dwelling Unit',
            'NEC Table 220.55 - Demand Factors for Electric Ranges',
            'General lighting: 3 VA per square foot (NEC 220.12)',
            'Demand factors: First 3000 VA @ 100%, Next 117000 VA @ 35%, Remainder @ 25%'
          ]
        };

      } else if (activeTab === 'commercial') {
        if (!commercialData.squareFootage) {
          alert('Please enter square footage before exporting');
          return;
        }

        const lightingVAPerSqFt = {
          'office': 3.5, 'warehouse': 0.25, 'retail': 3.0, 'school': 3.0,
          'restaurant': 2.0, 'hotel': 2.0, 'hospital': 2.0, 'industrial': 2.0
        };

        const occupancyNames = {
          'office': 'Office', 'warehouse': 'Warehouse', 'retail': 'Retail', 
          'school': 'School', 'restaurant': 'Restaurant', 'hotel': 'Hotel',
          'hospital': 'Hospital', 'industrial': 'Industrial'
        };

        const sqft = parseFloat(commercialData.squareFootage);
        const hvac = parseFloat(commercialData.hvacLoad) || 0;
        const receptacles = parseFloat(commercialData.receptacleLoad) || 0;
        const motors = parseFloat(commercialData.motorLoads) || 0;
        const other = parseFloat(commercialData.otherLoads) || 0;
        const demand = parseFloat(commercialData.demandFactor) / 100;
        const volts = parseFloat(commercialData.voltage);

        const lightingVA = sqft * lightingVAPerSqFt[commercialData.occupancyType];
        const lightingKW = (lightingVA / 1000).toFixed(2);
        const totalConnectedKW = ((lightingVA / 1000) + hvac + receptacles + motors + other).toFixed(2);
        const demandLoadKW = (parseFloat(totalConnectedKW) * demand).toFixed(2);

        let amperage;
        if (commercialData.phase === 'single') {
          amperage = ((parseFloat(demandLoadKW) * 1000) / volts).toFixed(1);
        } else {
          amperage = ((parseFloat(demandLoadKW) * 1000) / (1.732 * volts)).toFixed(1);
        }

        const inputs = {
          squareFootage: `${commercialData.squareFootage} sq ft`,
          occupancyType: `${occupancyNames[commercialData.occupancyType]} (${lightingVAPerSqFt[commercialData.occupancyType]} VA/sq ft)`,
          demandFactor: `${commercialData.demandFactor}%`,
          systemConfiguration: `${commercialData.voltage}V ${commercialData.phase === 'single' ? 'Single' : 'Three'} Phase`
        };

        if (hvac > 0) inputs.hvacLoad = `${hvac} kW`;
        if (receptacles > 0) inputs.receptacleLoad = `${receptacles} kW`;
        if (motors > 0) inputs.motorLoads = `${motors} kW`;
        if (other > 0) inputs.otherLoads = `${other} kW`;

        pdfData = {
          calculatorName: 'Load Calculations - Commercial',
          inputs,
          results: {
            connectedLoad: `${totalConnectedKW} kW`,
            demandLoad: `${demandLoadKW} kW`,
            totalAmperage: `${amperage} Amps`
          },
          additionalInfo: {
            lighting: `${lightingKW} kW (${lightingVA.toFixed(0)} VA)`,
            calculationMethod: commercialData.phase === 'single' ? 
              `Amperage = (${demandLoadKW} kW × 1000) ÷ ${volts}V = ${amperage} A` :
              `Amperage = (${demandLoadKW} kW × 1000) ÷ (1.732 × ${volts}V) = ${amperage} A`,
            demandFactorNote: `${commercialData.demandFactor}% demand factor applied to total connected load`
          },
          necReferences: [
            'NEC Article 220 - Branch-Circuit, Feeder, and Service Load Calculations',
            'NEC Table 220.12 - General Lighting Loads by Occupancy',
            'NEC 220.42 - General Lighting',
            'NEC 220.50 - Motors',
            'Always verify with actual connected loads and local codes'
          ]
        };
      }

      exportToPDF(pdfData);
    }
  }));

  return (
    <div style={{ margin: '0 -0.75rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '0.75rem'
        }}>
        <button 
          onClick={() => setActiveTab('residential')}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            background: activeTab === 'residential' ? '#3b82f6' : 'transparent',
            color: activeTab === 'residential' ? 'white' : (isDarkMode ? '#d1d5db' : '#374151'),
            border: `1px solid ${activeTab === 'residential' ? '#3b82f6' : (isDarkMode ? '#4b5563' : '#e5e7eb')}`,
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          Residential
        </button>
        <button 
          onClick={() => setActiveTab('commercial')}
          style={{
            flex: 1,
            padding: '0.75rem 1rem',
            background: activeTab === 'commercial' ? '#3b82f6' : 'transparent',
            color: activeTab === 'commercial' ? 'white' : (isDarkMode ? '#d1d5db' : '#374151'),
            border: `1px solid ${activeTab === 'commercial' ? '#3b82f6' : (isDarkMode ? '#4b5563' : '#e5e7eb')}`,
            borderRadius: '0.5rem',
            cursor: 'pointer',
            fontSize: '0.875rem',
            fontWeight: '600',
            transition: 'all 0.2s'
          }}
        >
          Commercial
        </button>
      </div>

      {/* Active Tab Content */}
      {activeTab === 'residential' ? (
        <ResidentialLoadCalculator 
          data={residentialData} 
          setData={setResidentialData} 
          isDarkMode={isDarkMode} 
        />
      ) : (
        <CommercialLoadCalculator 
          data={commercialData} 
          setData={setCommercialData} 
          isDarkMode={isDarkMode} 
        />
      )}
      </CalculatorLayout>
    </div>
  );
});

export default LoadCalculations;