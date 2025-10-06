import React, { useState } from 'react';
import { BarChart3, CheckCircle, Info } from 'lucide-react';

function LoadCalculations({ isDarkMode = false, onBack }) {
  const [activeTab, setActiveTab] = useState('residential');

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Square Footage
            </label>
            <input 
              type="number" 
              value={squareFootage} 
              onChange={(e) => setSquareFootage(e.target.value)}
              placeholder="Living area"
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
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Small Appliance Circuits
            </label>
            <input 
              type="number" 
              value={smallApplianceCircuits} 
              onChange={(e) => setSmallApplianceCircuits(e.target.value)}
              placeholder="Min 2"
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
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>@ 1500 VA each</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Laundry Circuits
            </label>
            <input 
              type="number" 
              value={laundryCircuits} 
              onChange={(e) => setLaundryCircuits(e.target.value)}
              placeholder="Typically 1"
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
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>@ 1500 VA</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Electric Range (kW)
            </label>
            <input 
              type="number" 
              value={rangeKW} 
              onChange={(e) => setRangeKW(e.target.value)}
              placeholder="Nameplate rating"
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
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Electric Dryer (kW)
            </label>
            <input 
              type="number" 
              value={dryerKW} 
              onChange={(e) => setDryerKW(e.target.value)}
              placeholder="Min 5 kW"
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
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Water Heater (kW)
            </label>
            <input 
              type="number" 
              value={waterHeaterKW} 
              onChange={(e) => setWaterHeaterKW(e.target.value)}
              placeholder="Rating"
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
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              HVAC/Heat (kW)
            </label>
            <input 
              type="number" 
              value={hvacKW} 
              onChange={(e) => setHvacKW(e.target.value)}
              placeholder="Largest load"
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
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Other Loads (kW)
            </label>
            <input 
              type="number" 
              value={otherLoadsKW} 
              onChange={(e) => setOtherLoadsKW(e.target.value)}
              placeholder="Pool, spa, etc"
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
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Service Voltage
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
              <option value="240">240V</option>
              <option value="208">208V</option>
            </select>
          </div>
        </div>

        {squareFootage && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Total Demand
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {results.totalDemandKW.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  kW
                </div>
              </div>
              
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Total Amperage
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {results.totalAmperage.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  amps
                </div>
              </div>

              <div style={{
                background: '#dbeafe',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                  Recommended Service
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                  {results.recommendedService}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.25rem' }}>
                  amp service
                </div>
              </div>
            </div>

            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${colors.cardBorder}`,
              marginBottom: '1rem'
            }}>
              <div style={{ fontWeight: '600', color: colors.cardText, marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                Connected Loads:
              </div>
              <div style={{ fontSize: '0.875rem', color: colors.labelText, display: 'grid', gap: '0.25rem' }}>
                <div>General Lighting: {results.generalLighting.toLocaleString()} VA</div>
                <div>Small Appliance: {results.smallApplianceLoad.toLocaleString()} VA</div>
                <div>Laundry: {results.laundryLoad.toLocaleString()} VA</div>
                <div style={{ borderTop: `1px solid ${colors.cardBorder}`, marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                  <strong>Subtotal: {results.subtotalVA.toLocaleString()} VA</strong>
                </div>
              </div>
            </div>

            <div style={{
              background: '#d1fae5',
              border: '1px solid #6ee7b7',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                <CheckCircle size={20} color="#059669" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                <div style={{ fontSize: '0.875rem', color: '#047857', lineHeight: '1.5', width: '100%' }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                    Demand Loads (with factors applied):
                  </div>
                  <div>Lighting: {results.demandLighting.toFixed(0)} VA</div>
                  {rangeKW > 0 && <div>Range: {results.rangeDemand.toLocaleString()} W</div>}
                  {dryerKW > 0 && <div>Dryer: {results.dryerDemand.toLocaleString()} W</div>}
                  {waterHeaterKW > 0 && <div>Water Heater: {results.waterHeaterDemand.toLocaleString()} W</div>}
                  {hvacKW > 0 && <div>HVAC: {results.hvacDemand.toLocaleString()} W</div>}
                  {otherLoadsKW > 0 && <div>Other: {results.otherDemand.toLocaleString()} W</div>}
                </div>
              </div>
            </div>
          </>
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
      'office': 3.5, 'warehouse': 0.25, 'retail': 3.0, 'school': 3.0,
      'restaurant': 2.0, 'hotel': 2.0, 'hospital': 2.0, 'industrial': 2.0
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Square Footage
            </label>
            <input 
              type="number" 
              value={squareFootage} 
              onChange={(e) => setSquareFootage(e.target.value)}
              placeholder="Building area"
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
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Occupancy Type
            </label>
            <select 
              value={occupancyType} 
              onChange={(e) => setOccupancyType(e.target.value)}
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
              <option value="office">Office (3.5 VA/sq ft)</option>
              <option value="warehouse">Warehouse (0.25 VA/sq ft)</option>
              <option value="retail">Retail (3.0 VA/sq ft)</option>
              <option value="school">School (3.0 VA/sq ft)</option>
              <option value="restaurant">Restaurant (2.0 VA/sq ft)</option>
              <option value="hotel">Hotel (2.0 VA/sq ft)</option>
              <option value="hospital">Hospital (2.0 VA/sq ft)</option>
              <option value="industrial">Industrial (2.0 VA/sq ft)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              HVAC Load (kW)
            </label>
            <input 
              type="number" 
              value={hvacLoad} 
              onChange={(e) => setHvacLoad(e.target.value)}
              placeholder="Total HVAC"
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
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Receptacle Load (kW)
            </label>
            <input 
              type="number" 
              value={receptacleLoad} 
              onChange={(e) => setReceptacleLoad(e.target.value)}
              placeholder="Receptacles"
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
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Motor Loads (kW)
            </label>
            <input 
              type="number" 
              value={motorLoads} 
              onChange={(e) => setMotorLoads(e.target.value)}
              placeholder="Total motors"
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
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Other Loads (kW)
            </label>
            <input 
              type="number" 
              value={otherLoads} 
              onChange={(e) => setOtherLoads(e.target.value)}
              placeholder="Additional"
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
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Demand Factor (%)
            </label>
            <input 
              type="number" 
              value={demandFactor} 
              onChange={(e) => setDemandFactor(e.target.value)}
              placeholder="80-100%"
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
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>Peak load %</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              System Voltage
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
              <option value="277">277V</option>
              <option value="480">480V</option>
              <option value="600">600V</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              System Phase
            </label>
            <select 
              value={phase} 
              onChange={(e) => setPhase(e.target.value)}
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
              <option value="single">Single Phase</option>
              <option value="three">Three Phase</option>
            </select>
          </div>
        </div>

        {squareFootage && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Connected Load
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {results.totalConnectedKW.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  kW
                </div>
              </div>
              
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Demand Load
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {results.demandLoadKW.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  kW
                </div>
              </div>

              <div style={{
                background: '#dbeafe',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                  Total Amperage
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                  {results.amperage.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', marginTop: '0.25rem' }}>
                  amps
                </div>
              </div>
            </div>

            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${colors.cardBorder}`,
              marginBottom: '1rem'
            }}>
              <div style={{ fontWeight: '600', color: colors.cardText, marginBottom: '0.75rem', fontSize: '0.875rem' }}>
                Connected Loads:
              </div>
              <div style={{ fontSize: '0.875rem', color: colors.labelText, display: 'grid', gap: '0.25rem' }}>
                <div>Lighting: {results.lightingKW.toFixed(2)} kW ({results.lightingVA.toFixed(0)} VA)</div>
                {hvacLoad > 0 && <div>HVAC: {results.hvac.toFixed(2)} kW</div>}
                {receptacleLoad > 0 && <div>Receptacles: {results.receptacles.toFixed(2)} kW</div>}
                {motorLoads > 0 && <div>Motors: {results.motors.toFixed(2)} kW</div>}
                {otherLoads > 0 && <div>Other: {results.other.toFixed(2)} kW</div>}
              </div>
            </div>

            <div style={{
              background: '#d1fae5',
              border: '1px solid #6ee7b7',
              borderRadius: '8px',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                <CheckCircle size={20} color="#059669" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                <div style={{ fontSize: '0.875rem', color: '#047857', lineHeight: '1.5' }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                    System Configuration
                  </div>
                  <div>{voltage}V {phase === 'single' ? 'Single' : 'Three'} Phase</div>
                  <div>{demandFactor}% demand factor applied</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const tabComponents = {
    residential: <ResidentialLoadCalculator />,
    commercial: <CommercialLoadCalculator />
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header Card */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <BarChart3 size={24} color="#3b82f6" />
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: colors.cardText,
            margin: 0 
          }}>
            Load Calculations
          </h2>
        </div>
        <p style={{ 
          fontSize: '0.875rem', 
          color: colors.labelText,
          margin: 0 
        }}>
          NEC Article 220 - Service and feeder sizing
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        display: 'flex',
        gap: '0.5rem',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'residential', label: 'Residential' },
          { id: 'commercial', label: 'Commercial' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: '1 1 auto',
              minWidth: '140px',
              padding: '0.625rem 1rem',
              background: activeTab === tab.id ? '#3b82f6' : colors.sectionBg,
              color: activeTab === tab.id ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === tab.id ? '#3b82f6' : colors.cardBorder}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active Tab Content */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1.5rem',
        marginBottom: '1rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {tabComponents[activeTab]}
      </div>
    </div>
  );
}

export default LoadCalculations;