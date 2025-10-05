import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';

function LoadCalculations({ isDarkMode = false }) {
  const [activeTab, setActiveTab] = useState('residential');

  // Dark mode colors
  const colors = {
    mainBg: isDarkMode ? '#1f2937' : '#ffffff',
    headerBg: isDarkMode ? '#111827' : '#ffffff',
    headerText: isDarkMode ? '#f9fafb' : '#111827',
    headerBorder: isDarkMode ? '#374151' : '#e5e7eb',
    contentBg: isDarkMode ? '#111827' : '#f9fafb',
    labelText: isDarkMode ? '#d1d5db' : '#374151',
    inputBg: isDarkMode ? '#374151' : 'white',
    inputBorder: isDarkMode ? '#4b5563' : '#d1d5db',
    inputText: isDarkMode ? '#f9fafb' : '#111827',
    cardBg: isDarkMode ? '#1f2937' : 'white',
    cardBgAlt: isDarkMode ? '#374151' : '#f8fafc',
    subtleText: isDarkMode ? '#9ca3af' : '#6b7280',
    footerBg: isDarkMode ? '#111827' : '#f9fafb',
    footerText: isDarkMode ? '#9ca3af' : '#6b7280',
    footerBorder: isDarkMode ? '#374151' : '#e5e7eb'
  };

  // Residential Load Calculator (NEC 220.82 Standard Method)
  const ResidentialLoadCalculator = () => {
    const [squareFootage, setSquareFootage] = useState('');
    const [smallApplianceCircuits, setSmallApplianceCircuits] = useState('2');
    const [laundryCircuits, setLaundryCircuits] = useState('1');
    const [rangeKW, setRangeKW] = useState('');
    const [dryerKW, setDryerKW] = useState('5');
    const [waterHeaterKW, setWaterHeaterKW] = useState('');
    const [hvacKW, setHvacKW] = useState('');
    const [otherLoadsKW, setOtherLoadsKW] = useState('');
    const [voltage, setVoltage] = useState('240');

    const calculateResidentialLoad = () => {
      const sqft = parseFloat(squareFootage) || 0;
      const sac = parseFloat(smallApplianceCircuits) || 0;
      const laundry = parseFloat(laundryCircuits) || 0;
      const range = parseFloat(rangeKW) || 0;
      const dryer = parseFloat(dryerKW) || 0;
      const waterHeater = parseFloat(waterHeaterKW) || 0;
      const hvac = parseFloat(hvacKW) || 0;
      const other = parseFloat(otherLoadsKW) || 0;
      const volts = parseFloat(voltage);

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
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Square Footage
            </label>
            <input 
              type="number" 
              value={squareFootage} 
              onChange={(e) => setSquareFootage(e.target.value)}
              placeholder="Living area square footage"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Small Appliance Circuits
            </label>
            <input 
              type="number" 
              value={smallApplianceCircuits} 
              onChange={(e) => setSmallApplianceCircuits(e.target.value)}
              placeholder="Minimum 2 required"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>Kitchen/dining circuits @ 1500 VA each</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Laundry Circuits
            </label>
            <input 
              type="number" 
              value={laundryCircuits} 
              onChange={(e) => setLaundryCircuits(e.target.value)}
              placeholder="Typically 1"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>@ 1500 VA each</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Electric Range (kW)
            </label>
            <input 
              type="number" 
              value={rangeKW} 
              onChange={(e) => setRangeKW(e.target.value)}
              placeholder="Range nameplate rating"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Electric Dryer (kW)
            </label>
            <input 
              type="number" 
              value={dryerKW} 
              onChange={(e) => setDryerKW(e.target.value)}
              placeholder="Minimum 5 kW"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Water Heater (kW)
            </label>
            <input 
              type="number" 
              value={waterHeaterKW} 
              onChange={(e) => setWaterHeaterKW(e.target.value)}
              placeholder="Water heater rating"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              HVAC/Heat (kW)
            </label>
            <input 
              type="number" 
              value={hvacKW} 
              onChange={(e) => setHvacKW(e.target.value)}
              placeholder="Largest heating or cooling load"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Other Loads (kW)
            </label>
            <input 
              type="number" 
              value={otherLoadsKW} 
              onChange={(e) => setOtherLoadsKW(e.target.value)}
              placeholder="Pool, spa, etc."
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Service Voltage
            </label>
            <select 
              value={voltage} 
              onChange={(e) => setVoltage(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            >
              <option value="240">240V</option>
              <option value="208">208V</option>
            </select>
          </div>
        </div>

        {squareFootage && (
          <div style={{ 
            background: '#f0fdf4', 
            border: '2px solid #22c55e', 
            padding: '1.5rem', 
            borderRadius: '0.5rem'
          }}>
            <h3 style={{ fontWeight: 'bold', color: '#166534', marginTop: 0, marginBottom: '1rem' }}>
              Load Calculation Summary
            </h3>
            
            <div style={{ 
              background: colors.cardBgAlt, 
              padding: '1rem', 
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              color: colors.labelText
            }}>
              <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Connected Loads:</strong>
              <div style={{ fontSize: '0.875rem' }}>General Lighting: {results.generalLighting.toLocaleString()} VA</div>
              <div style={{ fontSize: '0.875rem' }}>Small Appliance: {results.smallApplianceLoad.toLocaleString()} VA</div>
              <div style={{ fontSize: '0.875rem' }}>Laundry: {results.laundryLoad.toLocaleString()} VA</div>
              <div style={{ borderTop: `1px solid ${colors.inputBorder}`, marginTop: '0.5rem', paddingTop: '0.5rem', fontSize: '0.875rem' }}>
                <strong>Subtotal: {results.subtotalVA.toLocaleString()} VA</strong>
              </div>
            </div>

            <div style={{ 
              background: colors.cardBgAlt, 
              padding: '1rem', 
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              color: colors.labelText
            }}>
              <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Demand Loads:</strong>
              <div style={{ fontSize: '0.875rem' }}>Lighting (with demand factors): {results.demandLighting.toFixed(0)} VA</div>
              {rangeKW && <div style={{ fontSize: '0.875rem' }}>Range: {results.rangeDemand.toLocaleString()} W</div>}
              {dryerKW && <div style={{ fontSize: '0.875rem' }}>Dryer: {results.dryerDemand.toLocaleString()} W</div>}
              {waterHeaterKW && <div style={{ fontSize: '0.875rem' }}>Water Heater: {results.waterHeaterDemand.toLocaleString()} W</div>}
              {hvacKW && <div style={{ fontSize: '0.875rem' }}>HVAC: {results.hvacDemand.toLocaleString()} W</div>}
              {otherLoadsKW && <div style={{ fontSize: '0.875rem' }}>Other Loads: {results.otherDemand.toLocaleString()} W</div>}
            </div>

            <div style={{ color: '#14532d', marginBottom: '0.75rem' }}>
              <strong>Total Demand Load:</strong> {results.totalDemandKW.toFixed(2)} kW
            </div>
            
            <div style={{ color: '#14532d', marginBottom: '1rem' }}>
              <strong>Total Amperage:</strong> {results.totalAmperage.toFixed(1)} A
            </div>

            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#22c55e',
              padding: '1rem',
              background: colors.cardBg,
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              {results.recommendedService} Amp Service
            </div>
          </div>
        )}
      </div>
    );
  };

  // Commercial Load Calculator (Basic)
  const CommercialLoadCalculator = () => {
    const [squareFootage, setSquareFootage] = useState('');
    const [occupancyType, setOccupancyType] = useState('office');
    const [hvacLoad, setHvacLoad] = useState('');
    const [receptacleLoad, setReceptacleLoad] = useState('');
    const [motorLoads, setMotorLoads] = useState('');
    const [otherLoads, setOtherLoads] = useState('');
    const [demandFactor, setDemandFactor] = useState('100');
    const [voltage, setVoltage] = useState('480');
    const [phase, setPhase] = useState('three');

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

    const calculateCommercialLoad = () => {
      const sqft = parseFloat(squareFootage) || 0;
      const hvac = parseFloat(hvacLoad) || 0;
      const receptacles = parseFloat(receptacleLoad) || 0;
      const motors = parseFloat(motorLoads) || 0;
      const other = parseFloat(otherLoads) || 0;
      const demand = parseFloat(demandFactor) / 100;
      const volts = parseFloat(voltage);

      const lightingVA = sqft * lightingVAPerSqFt[occupancyType];
      const totalConnectedKW = (lightingVA / 1000) + hvac + receptacles + motors + other;
      const demandLoadKW = totalConnectedKW * demand;

      let amperage;
      if (phase === 'single') {
        amperage = (demandLoadKW * 1000) / volts;
      } else {
        amperage = (demandLoadKW * 1000) / (1.732 * volts);
      }

      return {
        lightingVA,
        lightingKW: lightingVA / 1000,
        hvac,
        receptacles,
        motors,
        other,
        totalConnectedKW,
        demandLoadKW,
        amperage
      };
    };

    const results = calculateCommercialLoad();

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Square Footage
            </label>
            <input 
              type="number" 
              value={squareFootage} 
              onChange={(e) => setSquareFootage(e.target.value)}
              placeholder="Building area"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Occupancy Type
            </label>
            <select 
              value={occupancyType} 
              onChange={(e) => setOccupancyType(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            >
              <option value="office">Office Building (3.5 VA/sq ft)</option>
              <option value="warehouse">Warehouse (0.25 VA/sq ft)</option>
              <option value="retail">Retail Store (3.0 VA/sq ft)</option>
              <option value="school">School (3.0 VA/sq ft)</option>
              <option value="restaurant">Restaurant (2.0 VA/sq ft)</option>
              <option value="hotel">Hotel (2.0 VA/sq ft)</option>
              <option value="hospital">Hospital (2.0 VA/sq ft)</option>
              <option value="industrial">Industrial (2.0 VA/sq ft)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              HVAC Load (kW)
            </label>
            <input 
              type="number" 
              value={hvacLoad} 
              onChange={(e) => setHvacLoad(e.target.value)}
              placeholder="Total HVAC load"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Receptacle Load (kW)
            </label>
            <input 
              type="number" 
              value={receptacleLoad} 
              onChange={(e) => setReceptacleLoad(e.target.value)}
              placeholder="Calculated receptacle load"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Motor Loads (kW)
            </label>
            <input 
              type="number" 
              value={motorLoads} 
              onChange={(e) => setMotorLoads(e.target.value)}
              placeholder="Total motor loads"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Other Loads (kW)
            </label>
            <input 
              type="number" 
              value={otherLoads} 
              onChange={(e) => setOtherLoads(e.target.value)}
              placeholder="Additional loads"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Demand Factor (%)
            </label>
            <input 
              type="number" 
              value={demandFactor} 
              onChange={(e) => setDemandFactor(e.target.value)}
              placeholder="Typically 80-100%"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>Percentage of connected load expected at peak</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              System Voltage
            </label>
            <select 
              value={voltage} 
              onChange={(e) => setVoltage(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            >
              <option value="208">208V</option>
              <option value="240">240V</option>
              <option value="277">277V</option>
              <option value="480">480V</option>
              <option value="600">600V</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              System Phase
            </label>
            <select 
              value={phase} 
              onChange={(e) => setPhase(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            >
              <option value="single">Single Phase</option>
              <option value="three">Three Phase</option>
            </select>
          </div>
        </div>

        {squareFootage && (
          <div style={{ 
            background: '#f0fdf4', 
            border: '2px solid #22c55e', 
            padding: '1.5rem', 
            borderRadius: '0.5rem'
          }}>
            <h3 style={{ fontWeight: 'bold', color: '#166534', marginTop: 0, marginBottom: '1rem' }}>
              Load Calculation Summary
            </h3>
            
            <div style={{ 
              background: colors.cardBgAlt, 
              padding: '1rem', 
              borderRadius: '0.5rem',
              marginBottom: '1rem',
              color: colors.labelText
            }}>
              <strong style={{ display: 'block', marginBottom: '0.5rem' }}>Connected Loads:</strong>
              <div style={{ fontSize: '0.875rem' }}>Lighting: {results.lightingKW.toFixed(2)} kW ({results.lightingVA.toFixed(0)} VA)</div>
              {hvacLoad && <div style={{ fontSize: '0.875rem' }}>HVAC: {results.hvac.toFixed(2)} kW</div>}
              {receptacleLoad && <div style={{ fontSize: '0.875rem' }}>Receptacles: {results.receptacles.toFixed(2)} kW</div>}
              {motorLoads && <div style={{ fontSize: '0.875rem' }}>Motors: {results.motors.toFixed(2)} kW</div>}
              {otherLoads && <div style={{ fontSize: '0.875rem' }}>Other: {results.other.toFixed(2)} kW</div>}
              <div style={{ borderTop: `1px solid ${colors.inputBorder}`, marginTop: '0.5rem', paddingTop: '0.5rem', fontSize: '0.875rem' }}>
                <strong>Total Connected: {results.totalConnectedKW.toFixed(2)} kW</strong>
              </div>
            </div>

            <div style={{ color: '#14532d', marginBottom: '0.75rem' }}>
              <strong>Demand Load:</strong> {results.demandLoadKW.toFixed(2)} kW
              <div style={{ fontSize: '0.875rem', color: '#15803d', marginTop: '0.25rem' }}>
                ({demandFactor}% demand factor applied)
              </div>
            </div>

            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#22c55e',
              marginBottom: '0.5rem',
              padding: '1rem',
              background: colors.cardBg,
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              {results.amperage.toFixed(1)} Amperes
            </div>

            <div style={{ 
              color: '#14532d',
              paddingTop: '1rem',
              borderTop: '1px solid #bbf7d0',
              fontSize: '0.875rem',
              textAlign: 'center'
            }}>
              @ {voltage}V {phase === 'single' ? 'Single' : 'Three'} Phase
            </div>
          </div>
        )}
      </div>
    );
  };

  const tabComponents = {
    residential: <ResidentialLoadCalculator />,
    commercial: <CommercialLoadCalculator />
  };

  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto', background: colors.mainBg, borderRadius: '0.5rem', overflow: 'hidden' }}>
      {/* Modern Header */}
      <div style={{ background: colors.headerBg, color: colors.headerText, padding: '1rem 1.5rem', borderBottom: `1px solid ${colors.headerBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BarChart3 size={24} color="#3b82f6" />
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Load Calculations</h1>
            <p style={{ fontSize: '0.8125rem', margin: 0, color: colors.subtleText }}>NEC Article 220 - Service and feeder sizing</p>
          </div>
        </div>
      </div>

      <div style={{ background: colors.contentBg, padding: '1.5rem' }}>
        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => setActiveTab('residential')}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === 'residential' ? '#3b82f6' : colors.cardBg,
              color: activeTab === 'residential' ? 'white' : colors.subtleText,
              border: `1px solid ${activeTab === 'residential' ? '#3b82f6' : colors.headerBorder}`,
              borderRadius: '0.375rem',
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
              padding: '0.75rem 1.25rem',
              background: activeTab === 'commercial' ? '#3b82f6' : colors.cardBg,
              color: activeTab === 'commercial' ? 'white' : colors.subtleText,
              border: `1px solid ${activeTab === 'commercial' ? '#3b82f6' : colors.headerBorder}`,
              borderRadius: '0.375rem',
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
        {tabComponents[activeTab]}
      </div>

      {/* Footer */}
      <div style={{ background: colors.footerBg, color: colors.footerText, padding: '1rem 1.5rem', borderTop: `1px solid ${colors.footerBorder}`, fontSize: '0.75rem' }}>
        <p style={{ fontWeight: '600', marginTop: 0, marginBottom: '0.5rem', color: colors.labelText }}>NEC References:</p>
        <p style={{ margin: 0 }}>
          220.12 - Lighting loads (3 VA/sq ft residential) • 220.52 - Small appliance/laundry (1500 VA each) • 220.55 - Range demand • 220.82 - Optional calculation • 220.40 - Commercial loads
        </p>
      </div>
    </div>
  );
}

export default LoadCalculations;