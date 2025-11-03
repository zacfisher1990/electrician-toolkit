import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { AlertTriangle, CheckCircle, Info, Sun, Zap } from 'lucide-react';
import { exportToPDF } from '../../../utils/pdfExport';

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

  // Dark mode colors
  const colors = {
    cardBg: isDarkMode ? '#374151' : '#ffffff',
    cardBorder: isDarkMode ? '#4b5563' : '#e5e7eb',
    cardText: isDarkMode ? '#f9fafb' : '#111827',
    labelText: isDarkMode ? '#d1d5db' : '#374151',
    inputBg: isDarkMode ? '#1f2937' : '#ffffff',
    inputBorder: isDarkMode ? '#4b5563' : '#d1d5db',
    sectionBg: isDarkMode ? '#1f2937' : '#f9fafb',
  };

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
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* PV Module Specifications */}
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
          PV Module Specifications
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
              Module Type
            </label>
            <select 
              value={moduleType} 
              onChange={(e) => handleModuleTypeChange(e.target.value)}
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
              {moduleTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
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
                Vmp (Max Power Voltage)
              </label>
              <input
                type="number"
                value={vmp}
                onChange={(e) => setVmp(e.target.value)}
                step="0.1"
                disabled={moduleType !== 'custom'}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  fontSize: '0.9375rem',
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: '8px',
                  backgroundColor: moduleType !== 'custom' ? colors.sectionBg : colors.inputBg,
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
                Imp (Max Power Current)
              </label>
              <input
                type="number"
                value={imp}
                onChange={(e) => setImp(e.target.value)}
                step="0.01"
                disabled={moduleType !== 'custom'}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  fontSize: '0.9375rem',
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: '8px',
                  backgroundColor: moduleType !== 'custom' ? colors.sectionBg : colors.inputBg,
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
                Voc (Open Circuit Voltage)
              </label>
              <input
                type="number"
                value={voc}
                onChange={(e) => setVoc(e.target.value)}
                step="0.1"
                disabled={moduleType !== 'custom'}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  fontSize: '0.9375rem',
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: '8px',
                  backgroundColor: moduleType !== 'custom' ? colors.sectionBg : colors.inputBg,
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
                Isc (Short Circuit Current)
              </label>
              <input
                type="number"
                value={isc}
                onChange={(e) => setIsc(e.target.value)}
                step="0.01"
                disabled={moduleType !== 'custom'}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  fontSize: '0.9375rem',
                  border: `1px solid ${colors.inputBorder}`,
                  borderRadius: '8px',
                  backgroundColor: moduleType !== 'custom' ? colors.sectionBg : colors.inputBg,
                  color: colors.cardText,
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>

          <div style={{
            background: colors.sectionBg,
            padding: '0.75rem',
            borderRadius: '8px',
            border: `1px solid ${colors.cardBorder}`,
            fontSize: '0.75rem',
            color: colors.labelText,
            fontStyle: 'italic'
          }}>
            Values from module datasheet at Standard Test Conditions (STC): 1000 W/m², 25°C, AM 1.5
          </div>
        </div>
      </div>

      {/* Array Configuration */}
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
          Array Configuration
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText,
              marginBottom: '0.5rem' 
            }}>
              Modules in Series (per string)
            </label>
            <input
              type="number"
              value={seriesModules}
              onChange={(e) => setSeriesModules(e.target.value)}
              min="1"
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
              Parallel Strings
            </label>
            <input
              type="number"
              value={parallelStrings}
              onChange={(e) => setParallelStrings(e.target.value)}
              min="1"
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
        </div>

        <div style={{
          background: '#dbeafe',
          padding: '1rem',
          borderRadius: '8px',
          marginTop: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.875rem', color: '#1e40af', fontWeight: '600' }}>
            Total Modules: {results.totalModules}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.25rem' }}>
            ({seriesModules} × {parallelStrings} configuration)
          </div>
        </div>
      </div>

      {/* Environmental Conditions */}
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
          Environmental Conditions
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
                Minimum Temperature (°C)
              </label>
              <input
                type="number"
                value={minTemp}
                onChange={(e) => setMinTemp(e.target.value)}
                step="1"
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
                Maximum Temperature (°C)
              </label>
              <input
                type="number"
                value={maxTemp}
                onChange={(e) => setMaxTemp(e.target.value)}
                step="1"
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
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText,
              marginBottom: '0.5rem' 
            }}>
              Temperature Coefficient Type
            </label>
            <select 
              value={tempCoeff} 
              onChange={(e) => setTempCoeff(e.target.value)}
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
              <option value="standard">Standard (-0.33%/°C for Voc)</option>
              <option value="premium">Premium (-0.27%/°C for Voc)</option>
            </select>
          </div>

          <div style={{
            background: colors.sectionBg,
            padding: '0.75rem',
            borderRadius: '8px',
            border: `1px solid ${colors.cardBorder}`,
            fontSize: '0.75rem',
            color: colors.labelText,
            fontStyle: 'italic'
          }}>
            Minimum temperature determines maximum voltage. Use coldest expected temperature for your location.
          </div>
        </div>
      </div>

      {/* Conductor Specifications */}
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
          Conductor Specifications
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText,
              marginBottom: '0.5rem' 
            }}>
              One-Way Conductor Length (feet)
            </label>
            <input
              type="number"
              value={conductorLength}
              onChange={(e) => setConductorLength(e.target.value)}
              min="1"
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
              Max Voltage Drop (%)
            </label>
            <input
              type="number"
              value={voltageDropPercent}
              onChange={(e) => setVoltageDropPercent(e.target.value)}
              min="0.5"
              max="5"
              step="0.5"
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
          fontSize: '1.125rem', 
          fontWeight: '600', 
          color: colors.cardText,
          marginTop: 0,
          marginBottom: '1rem'
        }}>
          System Calculations
        </h3>

        {/* System Summary */}
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
            <Sun size={24} color="#d97706" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            <div style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: '1.5', width: '100%' }}>
              <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '0.5rem' }}>
                System: {(results.systemPower / 1000).toFixed(2)} kW DC
              </div>
              <div><strong>Configuration:</strong> {seriesModules} modules × {parallelStrings} strings = {results.totalModules} modules</div>
              <div><strong>String Voltage:</strong> {results.maxPowerVoltage}V (at STC)</div>
              <div><strong>Array Current:</strong> {results.maxPowerCurrent}A (at STC)</div>
            </div>
          </div>
        </div>

        {/* Key Results Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            background: '#fee2e2',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#7f1d1d', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase' }}>
              Max System Voltage
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#dc2626', lineHeight: '1' }}>
              {results.maxVoltage}V
            </div>
            <div style={{ fontSize: '0.75rem', color: '#7f1d1d', marginTop: '0.5rem' }}>
              at {minTemp}°C
            </div>
          </div>

          <div style={{
            background: '#dbeafe',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#1e40af', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase' }}>
              Max Array Current
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1e40af', lineHeight: '1' }}>
              {results.totalArrayCurrent}A
            </div>
            <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.5rem' }}>
              125% of Isc
            </div>
          </div>

          <div style={{
            background: '#d1fae5',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#047857', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase' }}>
              Conductor Size
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#047857', lineHeight: '1' }}>
              {results.conductorSize}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#047857', marginTop: '0.5rem' }}>
              PV Wire 90°C
            </div>
          </div>

          <div style={{
            background: '#fef3c7',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#92400e', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase' }}>
              OCPD Rating
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#92400e', lineHeight: '1' }}>
              {results.ocpdRating}A
            </div>
            <div style={{ fontSize: '0.75rem', color: '#92400e', marginTop: '0.5rem' }}>
              156% of Isc
            </div>
          </div>
        </div>

        {/* Voltage Drop Info */}
        <div style={{
          background: results.voltageDrop.acceptable ? '#d1fae5' : '#fee2e2',
          border: `1px solid ${results.voltageDrop.acceptable ? '#6ee7b7' : '#fca5a5'}`,
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
            {results.voltageDrop.acceptable ? (
              <CheckCircle size={20} color="#059669" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            ) : (
              <AlertTriangle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            )}
            <div style={{ 
              fontSize: '0.875rem', 
              color: results.voltageDrop.acceptable ? '#047857' : '#7f1d1d', 
              lineHeight: '1.5' 
            }}>
              <div><strong>Voltage Drop:</strong> {results.voltageDrop.volts}V ({results.voltageDrop.percent}%)</div>
              <div style={{ marginTop: '0.25rem' }}>
                {results.voltageDrop.acceptable 
                  ? `Acceptable - Within ${voltageDropPercent}% limit`
                  : `Exceeds ${voltageDropPercent}% limit - Consider larger conductor or shorter run`
                }
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div style={{
          background: colors.sectionBg,
          padding: '1rem',
          borderRadius: '8px',
          border: `1px solid ${colors.cardBorder}`
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
            <Info size={20} color="#3b82f6" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            <div style={{ fontSize: '0.875rem', color: colors.labelText, lineHeight: '1.5' }}>
              <strong style={{ color: colors.cardText }}>Important Notes:</strong>
              <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem' }}>
                <li>Use PV wire rated 90°C (USE-2, PV, or equivalent)</li>
                <li>Max voltage calculated at minimum temperature per NEC 690.7</li>
                <li>Conductor sizing includes 125% factor per NEC 690.8(B)(1)</li>
                <li>OCPD rated at 156% of Isc per NEC 690.8(B)</li>
                <li>Verify inverter input voltage and current ratings</li>
                <li>Consider rapid shutdown requirements (NEC 690.12)</li>
                <li>Ground-fault protection required per NEC 690.41</li>
                <li>Install proper disconnecting means per NEC 690.13-690.17</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* NEC References */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1.5rem',
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
          NEC References
        </h3>
        <div style={{ fontSize: '0.875rem', color: colors.labelText, lineHeight: '1.5' }}>
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.main}</div>
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.maxVoltage}</div>
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.shortCircuit}</div>
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.ocpd}</div>
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.conductorSizing}</div>
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.rapidShutdown}</div>
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.groundFault}</div>
          <div>• {necReferences.disconnects}</div>
        </div>
      </div>
    </div>
  );
});

export default SolarPVCalculator;