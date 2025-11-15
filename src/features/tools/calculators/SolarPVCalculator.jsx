import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { AlertTriangle, CheckCircle, Info, Sun, Zap, Thermometer, Cable, Calculator } from 'lucide-react';
import { exportToPDF } from '../../../utils/pdfExport';
import CalculatorLayout, { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox 
} from './CalculatorLayout';

// PV Module specifications (common examples)
const moduleTypes = [
  { value: 'custom', label: 'Custom Module' },
  { value: '300w', label: '300W Module (Vmp: 32.5V, Imp: 9.23A, Voc: 40V, Isc: 9.8A)' },
  { value: '350w', label: '350W Module (Vmp: 37.8V, Imp: 9.26A, Voc: 46.5V, Isc: 9.85A)' },
  { value: '400w', label: '400W Module (Vmp: 40.5V, Imp: 9.88A, Voc: 49.5V, Isc: 10.48A)' },
  { value: '450w', label: '450W Module (Vmp: 41.7V, Imp: 10.79A, Voc: 49.9V, Isc: 11.45A)' }
];

const modulePresets = {
  '300w': { vmp: 32.5, imp: 9.23, voc: 40, isc: 9.8 },
  '350w': { vmp: 37.8, imp: 9.26, voc: 46.5, isc: 9.85 },
  '400w': { vmp: 40.5, imp: 9.88, voc: 49.5, isc: 10.48 },
  '450w': { vmp: 41.7, imp: 10.79, voc: 49.9, isc: 11.45 }
};

// Temperature coefficient presets
const tempCoefficients = {
  'standard': { voc: -0.33, isc: 0.06 },
  'premium': { voc: -0.27, isc: 0.05 }
};

const necReferences = {
  main: 'NEC Article 690 - Solar Photovoltaic (PV) Systems',
  shortCircuit: 'NEC 690.8(A)(1) - Circuit Current (125% of Isc)',
  maxVoltage: 'NEC 690.7 - Maximum Voltage (Voc × temp factor)',
  ocpd: 'NEC 690.8(B) - OCPD Rating (156% of Isc)',
  conductorSizing: 'NEC 690.8(B)(1) - PV Circuit Conductors (125% of calculated current)',
  systemVoltage: 'NEC 690.7(A) - Maximum PV System Voltage',
  groundFault: 'NEC 690.41 - Ground-Fault Protection',
  rapidShutdown: 'NEC 690.12 - Rapid Shutdown Requirements',
  disconnects: 'NEC 690.13-690.17 - Disconnecting Means'
};

const SolarPVCalculator = forwardRef(({ isDarkMode = false, onBack }, ref) => {
  const [moduleType, setModuleType] = useState('350w');
  const [vmp, setVmp] = useState('37.8');
  const [imp, setImp] = useState('9.26');
  const [voc, setVoc] = useState('46.5');
  const [isc, setIsc] = useState('9.85');
  const [seriesModules, setSeriesModules] = useState('10');
  const [parallelStrings, setParallelStrings] = useState('2');
  const [minTemp, setMinTemp] = useState('-10');
  const [maxTemp, setMaxTemp] = useState('70');
  const [tempCoeff, setTempCoeff] = useState('standard');
  const [conductorLength, setConductorLength] = useState('50');
  const [voltageDropPercent, setVoltageDropPercent] = useState('2');

  // Handle module type change
  const handleModuleTypeChange = (type) => {
    setModuleType(type);
    if (type !== 'custom' && modulePresets[type]) {
      const preset = modulePresets[type];
      setVmp(preset.vmp.toString());
      setImp(preset.imp.toString());
      setVoc(preset.voc.toString());
      setIsc(preset.isc.toString());
    }
  };

  // Calculate temperature correction factors
  const getTempCorrectionFactor = (temp, baseTemp = 25) => {
    const tempDiff = temp - baseTemp;
    const coeff = tempCoefficients[tempCoeff];
    return {
      vocFactor: 1 + (coeff.voc / 100) * tempDiff,
      iscFactor: 1 + (coeff.isc / 100) * tempDiff
    };
  };

  // Calculate system parameters
  const calculateSystem = () => {
    const vocValue = parseFloat(voc);
    const iscValue = parseFloat(isc);
    const vmpValue = parseFloat(vmp);
    const impValue = parseFloat(imp);
    const series = parseInt(seriesModules);
    const parallel = parseInt(parallelStrings);
    const minTempValue = parseFloat(minTemp);
    const maxTempValue = parseFloat(maxTemp);
    const lengthFeet = parseFloat(conductorLength);
    const vDropPercent = parseFloat(voltageDropPercent) / 100;

    // Temperature correction for minimum temperature (maximum voltage)
    const minTempCorrection = getTempCorrectionFactor(minTempValue);
    const maxVoltage = vocValue * series * minTempCorrection.vocFactor;

    // Maximum current per string (125% of Isc per NEC 690.8(A)(1))
    const maxCurrentPerString = iscValue * 1.25;

    // Total array current (all strings in parallel)
    const totalArrayCurrent = maxCurrentPerString * parallel;

    // Maximum power point voltage (at STC)
    const maxPowerVoltage = vmpValue * series;
    
    // Maximum power point current (at STC)
    const maxPowerCurrent = impValue * parallel;

    // System power at STC
    const systemPower = maxPowerVoltage * maxPowerCurrent;

    // Conductor sizing (125% of max current per NEC 690.8(B)(1))
    const conductorCurrent = totalArrayCurrent * 1.25;

    // OCPD sizing (156% of Isc per NEC 690.8(B))
    const ocpdRating = Math.ceil(iscValue * parallel * 1.56 / 5) * 5; // Round up to nearest 5A

    // Get conductor size recommendation
    const conductorSize = getConductorSize(conductorCurrent);

    // Voltage drop calculation
    const vDrop = calculateVoltageDrop(maxPowerCurrent, maxPowerVoltage, lengthFeet, conductorSize, vDropPercent);

    return {
      maxVoltage: Math.round(maxVoltage * 10) / 10,
      maxCurrentPerString: Math.round(maxCurrentPerString * 100) / 100,
      totalArrayCurrent: Math.round(totalArrayCurrent * 100) / 100,
      maxPowerVoltage: Math.round(maxPowerVoltage * 10) / 10,
      maxPowerCurrent: Math.round(maxPowerCurrent * 100) / 100,
      systemPower: Math.round(systemPower),
      conductorCurrent: Math.round(conductorCurrent * 100) / 100,
      ocpdRating,
      conductorSize,
      voltageDrop: vDrop,
      totalModules: series * parallel
    };
  };

  // Get conductor size based on ampacity
  const getConductorSize = (current) => {
    // Simplified conductor sizing for copper at 90°C (PV rated wire)
    if (current <= 20) return '12 AWG';
    if (current <= 25) return '10 AWG';
    if (current <= 35) return '8 AWG';
    if (current <= 50) return '6 AWG';
    if (current <= 65) return '4 AWG';
    if (current <= 85) return '3 AWG';
    if (current <= 100) return '2 AWG';
    if (current <= 115) return '1 AWG';
    if (current <= 130) return '1/0 AWG';
    if (current <= 150) return '2/0 AWG';
    if (current <= 175) return '3/0 AWG';
    if (current <= 200) return '4/0 AWG';
    return '250+ kcmil';
  };

  // Calculate voltage drop
  const calculateVoltageDrop = (current, voltage, lengthFeet, conductorSize, maxDropPercent) => {
    // Resistance values (ohms per 1000 ft for copper at 75°C)
    const resistanceTable = {
      '12 AWG': 1.93,
      '10 AWG': 1.21,
      '8 AWG': 0.764,
      '6 AWG': 0.491,
      '4 AWG': 0.308,
      '3 AWG': 0.245,
      '2 AWG': 0.194,
      '1 AWG': 0.154,
      '1/0 AWG': 0.122,
      '2/0 AWG': 0.0967,
      '3/0 AWG': 0.0766,
      '4/0 AWG': 0.0608
    };

    const resistance = resistanceTable[conductorSize] || 0.05;
    const totalResistance = (resistance * lengthFeet * 2) / 1000; // Round trip
    const dropVolts = current * totalResistance;
    const dropPercent = (dropVolts / voltage) * 100;

    return {
      volts: Math.round(dropVolts * 10) / 10,
      percent: Math.round(dropPercent * 100) / 100,
      acceptable: dropPercent <= (maxDropPercent * 100)
    };
  };

  const results = calculateSystem();

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      const pdfData = {
        calculatorName: 'Solar PV System Calculator',
        inputs: {
          moduleType: moduleTypes.find(m => m.value === moduleType).label,
          vmp: `${vmp}V`,
          imp: `${imp}A`,
          voc: `${voc}V`,
          isc: `${isc}A`,
          seriesModules: seriesModules,
          parallelStrings: parallelStrings,
          totalModules: results.totalModules,
          minTemperature: `${minTemp}°C`,
          maxTemperature: `${maxTemp}°C`,
          temperatureCoefficient: tempCoeff === 'standard' ? 'Standard (-0.33%/°C Voc)' : 'Premium (-0.27%/°C Voc)',
          conductorLength: `${conductorLength} feet`
        },
        results: {
          systemPower: `${(results.systemPower / 1000).toFixed(2)} kW`,
          maxSystemVoltage: `${results.maxVoltage}V (at ${minTemp}°C)`,
          maxPowerVoltage: `${results.maxPowerVoltage}V (at STC)`,
          maxArrayCurrent: `${results.totalArrayCurrent}A (125% of Isc)`,
          maxPowerCurrent: `${results.maxPowerCurrent}A (at STC)`,
          recommendedConductorSize: results.conductorSize,
          conductorAmpacity: `${results.conductorCurrent}A (required)`,
          ocpdRating: `${results.ocpdRating}A (156% of Isc)`,
          voltageDrop: `${results.voltageDrop.volts}V (${results.voltageDrop.percent}%)`,
          voltageDropAcceptable: results.voltageDrop.acceptable ? 'Yes' : 'No - Consider larger conductor'
        },
        necReferences: [
          necReferences.main,
          necReferences.maxVoltage,
          necReferences.shortCircuit,
          necReferences.ocpd,
          necReferences.conductorSizing,
          necReferences.rapidShutdown
        ]
      };

      exportToPDF(pdfData);
    }
  }));

  return (
    <div style={{ margin: '0 -1rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        {/* PV Module Specifications */}
        <Section 
          title="PV Module Specifications" 
          icon={Sun} 
          color="#f59e0b" 
          isDarkMode={isDarkMode}
        >
          <InputGroup 
            label="Module Type" 
            isDarkMode={isDarkMode}
            helpText="Values from module datasheet at Standard Test Conditions (STC): 1000 W/m², 25°C, AM 1.5"
          >
            <Select
              value={moduleType}
              onChange={(e) => handleModuleTypeChange(e.target.value)}
              isDarkMode={isDarkMode}
              options={moduleTypes}
            />
          </InputGroup>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '0.75rem' 
          }}>
            <InputGroup label="Vmp (Max Power V)" isDarkMode={isDarkMode}>
              <Input
                type="number"
                value={vmp}
                onChange={(e) => setVmp(e.target.value)}
                step="0.1"
                disabled={moduleType !== 'custom'}
                isDarkMode={isDarkMode}
                unit="V"
              />
            </InputGroup>

            <InputGroup label="Imp (Max Power A)" isDarkMode={isDarkMode}>
              <Input
                type="number"
                value={imp}
                onChange={(e) => setImp(e.target.value)}
                step="0.01"
                disabled={moduleType !== 'custom'}
                isDarkMode={isDarkMode}
                unit="A"
              />
            </InputGroup>

            <InputGroup label="Voc (Open Circuit)" isDarkMode={isDarkMode}>
              <Input
                type="number"
                value={voc}
                onChange={(e) => setVoc(e.target.value)}
                step="0.1"
                disabled={moduleType !== 'custom'}
                isDarkMode={isDarkMode}
                unit="V"
              />
            </InputGroup>

            <InputGroup label="Isc (Short Circuit)" isDarkMode={isDarkMode}>
              <Input
                type="number"
                value={isc}
                onChange={(e) => setIsc(e.target.value)}
                step="0.01"
                disabled={moduleType !== 'custom'}
                isDarkMode={isDarkMode}
                unit="A"
              />
            </InputGroup>
          </div>
        </Section>

        {/* Array Configuration */}
        <Section 
          title="Array Configuration" 
          icon={Calculator} 
          color="#3b82f6" 
          isDarkMode={isDarkMode}
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '0.75rem' 
          }}>
            <InputGroup label="Modules in Series" isDarkMode={isDarkMode}>
              <Input
                type="number"
                value={seriesModules}
                onChange={(e) => setSeriesModules(e.target.value)}
                min="1"
                isDarkMode={isDarkMode}
                placeholder="per string"
              />
            </InputGroup>

            <InputGroup label="Parallel Strings" isDarkMode={isDarkMode}>
              <Input
                type="number"
                value={parallelStrings}
                onChange={(e) => setParallelStrings(e.target.value)}
                min="1"
                isDarkMode={isDarkMode}
              />
            </InputGroup>
          </div>

          <InfoBox type="info" isDarkMode={isDarkMode}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.25rem' }}>
                Total Modules: {results.totalModules}
              </div>
              <div style={{ fontSize: '0.8125rem' }}>
                ({seriesModules} × {parallelStrings} configuration)
              </div>
            </div>
          </InfoBox>
        </Section>

        {/* Environmental Conditions */}
        <Section 
          title="Environmental Conditions" 
          icon={Thermometer} 
          color="#ef4444" 
          isDarkMode={isDarkMode}
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '0.75rem' 
          }}>
            <InputGroup 
              label="Minimum Temperature" 
              isDarkMode={isDarkMode}
              helpText="Determines max voltage"
            >
              <Input
                type="number"
                value={minTemp}
                onChange={(e) => setMinTemp(e.target.value)}
                step="1"
                isDarkMode={isDarkMode}
                unit="°C"
              />
            </InputGroup>

            <InputGroup label="Maximum Temperature" isDarkMode={isDarkMode}>
              <Input
                type="number"
                value={maxTemp}
                onChange={(e) => setMaxTemp(e.target.value)}
                step="1"
                isDarkMode={isDarkMode}
                unit="°C"
              />
            </InputGroup>
          </div>

          <InputGroup label="Temperature Coefficient Type" isDarkMode={isDarkMode}>
            <Select
              value={tempCoeff}
              onChange={(e) => setTempCoeff(e.target.value)}
              isDarkMode={isDarkMode}
              options={[
                { value: 'standard', label: 'Standard (-0.33%/°C for Voc)' },
                { value: 'premium', label: 'Premium (-0.27%/°C for Voc)' }
              ]}
            />
          </InputGroup>
        </Section>

        {/* Conductor Specifications */}
        <Section 
          title="Conductor Specifications" 
          icon={Cable} 
          color="#8b5cf6" 
          isDarkMode={isDarkMode}
        >
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '0.75rem' 
          }}>
            <InputGroup label="One-Way Length" isDarkMode={isDarkMode}>
              <Input
                type="number"
                value={conductorLength}
                onChange={(e) => setConductorLength(e.target.value)}
                min="1"
                isDarkMode={isDarkMode}
                unit="ft"
              />
            </InputGroup>

            <InputGroup label="Max Voltage Drop" isDarkMode={isDarkMode}>
              <Input
                type="number"
                value={voltageDropPercent}
                onChange={(e) => setVoltageDropPercent(e.target.value)}
                min="0.5"
                max="5"
                step="0.5"
                isDarkMode={isDarkMode}
                unit="%"
              />
            </InputGroup>
          </div>
        </Section>

        {/* System Results */}
        <Section isDarkMode={isDarkMode}>
          {/* System Summary */}
          <InfoBox type="warning" icon={Sun} isDarkMode={isDarkMode} title={`System: ${(results.systemPower / 1000).toFixed(2)} kW DC`}>
            <div style={{ fontSize: '0.8125rem' }}>
              <div><strong>Configuration:</strong> {seriesModules} modules × {parallelStrings} strings = {results.totalModules} modules</div>
              <div><strong>String Voltage:</strong> {results.maxPowerVoltage}V (at STC)</div>
              <div><strong>Array Current:</strong> {results.maxPowerCurrent}A (at STC)</div>
            </div>
          </InfoBox>

          {/* Key Results Grid */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: '0.75rem', 
            marginTop: '0.75rem',
            marginBottom: '0.75rem' 
          }}>
            <ResultCard
              label="Max System Voltage"
              value={`${results.maxVoltage}`}
              unit={`at ${minTemp}°C`}
              color="#ef4444"
              variant="prominent"
              isDarkMode={isDarkMode}
            />
            
            <ResultCard
              label="Max Array Current"
              value={`${results.totalArrayCurrent}`}
              unit="125% of Isc"
              color="#3b82f6"
              variant="prominent"
              isDarkMode={isDarkMode}
            />
            
            <ResultCard
              label="Conductor Size"
              value={results.conductorSize.replace(' AWG', '')}
              unit="PV Wire 90°C"
              color="#10b981"
              variant="prominent"
              isDarkMode={isDarkMode}
            />
            
            <ResultCard
              label="OCPD Rating"
              value={`${results.ocpdRating}A`}
              unit="156% of Isc"
              color="#f59e0b"
              variant="prominent"
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Voltage Drop Status */}
          {results.voltageDrop.acceptable ? (
            <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                Voltage Drop: {results.voltageDrop.volts}V ({results.voltageDrop.percent}%)
              </div>
              <div style={{ fontSize: '0.8125rem' }}>
                Acceptable - Within {voltageDropPercent}% limit
              </div>
            </InfoBox>
          ) : (
            <InfoBox type="error" icon={AlertTriangle} isDarkMode={isDarkMode}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                Voltage Drop: {results.voltageDrop.volts}V ({results.voltageDrop.percent}%)
              </div>
              <div style={{ fontSize: '0.8125rem' }}>
                Exceeds {voltageDropPercent}% limit - Consider larger conductor or shorter run
              </div>
            </InfoBox>
          )}

          {/* Important Notes */}
          <InfoBox type="info" icon={Info} isDarkMode={isDarkMode} title="Important Notes">
            <div style={{ fontSize: '0.8125rem' }}>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>Use PV wire rated 90°C (USE-2, PV, or equivalent)</li>
                <li>Max voltage calculated at minimum temperature per NEC 690.7</li>
                <li>Conductor sizing includes 125% factor per NEC 690.8(B)(1)</li>
                <li>OCPD rated at 156% of Isc per NEC 690.8(B)</li>
                <li>Verify inverter input voltage and current ratings</li>
                <li>Consider rapid shutdown requirements (NEC 690.12)</li>
                <li>Ground-fault protection required per NEC 690.41</li>
              </ul>
            </div>
          </InfoBox>
        </Section>

        {/* NEC References */}
        <InfoBox type="info" isDarkMode={isDarkMode}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
            NEC References:
          </div>
          <div style={{ fontSize: '0.8125rem' }}>
            Article 690 (PV Systems) • 690.7 (Max Voltage) • 690.8 (Circuit Sizing) • 690.12 (Rapid Shutdown)
          </div>
        </InfoBox>
      </CalculatorLayout>
    </div>
  );
});

export default SolarPVCalculator;