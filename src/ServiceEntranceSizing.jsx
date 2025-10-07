import React, { useState } from 'react';
import { Home, Info } from 'lucide-react';

function ServiceEntranceSizing({ isDarkMode = false }) {
  const [activeTab, setActiveTab] = useState('residential');

  // Dark mode colors - matching ConduitFillCalculator
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

  // Residential Service Sizing
  const ResidentialService = () => {
    const [squareFootage, setSquareFootage] = useState('');
    const [hvacLoad, setHvacLoad] = useState('');
    const [waterHeater, setWaterHeater] = useState('');
    const [rangeOven, setRangeOven] = useState('');
    const [dryer, setDryer] = useState('');
    const [otherLoads, setOtherLoads] = useState('');
    const [voltage, setVoltage] = useState('240');

    const calculateService = () => {
      const sqft = parseFloat(squareFootage) || 0;
      const hvac = parseFloat(hvacLoad) || 0;
      const wh = parseFloat(waterHeater) || 0;
      const range = parseFloat(rangeOven) || 0;
      const dry = parseFloat(dryer) || 0;
      const other = parseFloat(otherLoads) || 0;
      const volts = parseFloat(voltage);

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

    const results = calculateService();

    return (
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
            Load Information
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText, 
                marginBottom: '0.5rem' 
              }}>
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
              <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>
                Heated/cooled living space
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
                HVAC/Heat Load (Watts)
              </label>
              <input 
                type="number" 
                value={hvacLoad} 
                onChange={(e) => setHvacLoad(e.target.value)}
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
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText, 
                marginBottom: '0.5rem' 
              }}>
                Water Heater (Watts)
              </label>
              <input 
                type="number" 
                value={waterHeater} 
                onChange={(e) => setWaterHeater(e.target.value)}
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
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText, 
                marginBottom: '0.5rem' 
              }}>
                Range/Oven (Watts)
              </label>
              <input 
                type="number" 
                value={rangeOven} 
                onChange={(e) => setRangeOven(e.target.value)}
                placeholder="Electric range"
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
                Dryer (Watts)
              </label>
              <input 
                type="number" 
                value={dryer} 
                onChange={(e) => setDryer(e.target.value)}
                placeholder="Electric dryer"
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
                Minimum 5000W if electric
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
                Other Loads (Watts)
              </label>
              <input 
                type="number" 
                value={otherLoads} 
                onChange={(e) => setOtherLoads(e.target.value)}
                placeholder="Pool, spa, etc."
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
        </div>

        {squareFootage && (
          <div>
            {/* Load Breakdown */}
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
                Load Breakdown
              </h3>
              
              <div style={{ 
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                border: `1px solid ${colors.cardBorder}`
              }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem', color: colors.cardText, fontSize: '0.875rem' }}>
                  Connected Loads:
                </strong>
                <div style={{ fontSize: '0.875rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  General Lighting: {results.generalLighting.toLocaleString()} VA
                </div>
                <div style={{ fontSize: '0.875rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Small Appliance: {results.smallAppliance.toLocaleString()} VA
                </div>
                <div style={{ fontSize: '0.875rem', color: colors.labelText, marginBottom: '0.5rem' }}>
                  Laundry: {results.laundry.toLocaleString()} VA
                </div>
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: colors.subtleText,
                  paddingTop: '0.5rem',
                  borderTop: `1px solid ${colors.cardBorder}`
                }}>
                  Subtotal: {results.subtotal.toLocaleString()} VA
                </div>
              </div>

              <div style={{ 
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                border: `1px solid ${colors.cardBorder}`
              }}>
                <strong style={{ display: 'block', marginBottom: '0.5rem', color: colors.cardText, fontSize: '0.875rem' }}>
                  Demand Loads (after factors):
                </strong>
                <div style={{ fontSize: '0.875rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Lighting: {results.demandLighting.toFixed(0)} W
                </div>
                {rangeOven && (
                  <div style={{ fontSize: '0.875rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                    Range: {results.rangeDemand.toFixed(0)} W
                  </div>
                )}
                {dryer && (
                  <div style={{ fontSize: '0.875rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                    Dryer: {results.dryerDemand.toFixed(0)} W
                  </div>
                )}
                {waterHeater && (
                  <div style={{ fontSize: '0.875rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                    Water Heater: {results.whDemand.toFixed(0)} W
                  </div>
                )}
                {hvacLoad && (
                  <div style={{ fontSize: '0.875rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                    HVAC: {results.hvacDemand.toFixed(0)} W
                  </div>
                )}
                {otherLoads && (
                  <div style={{ fontSize: '0.875rem', color: colors.labelText }}>
                    Other: {results.otherDemand.toFixed(0)} W
                  </div>
                )}
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
                fontSize: '1rem', 
                fontWeight: '600', 
                color: colors.cardText,
                marginTop: 0,
                marginBottom: '1rem'
              }}>
                Service Sizing Results
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  background: colors.sectionBg,
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                    Total Demand Load
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                    {results.totalDemand.toFixed(0)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                    Watts
                  </div>
                </div>
                
                <div style={{
                  background: colors.sectionBg,
                  padding: '1rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                    Calculated Amperage
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                    {results.totalAmperage.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                    Amperes
                  </div>
                </div>
              </div>

              <div style={{ 
                background: '#dbeafe',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#1e40af', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Recommended Service Size
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e40af' }}>
                  {results.recommendedService}A
                </div>
              </div>

              <div style={{ 
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center',
                border: `1px solid ${colors.cardBorder}`
              }}>
                <div style={{ fontSize: '0.875rem', color: colors.labelText }}>
                  <strong style={{ color: colors.cardText }}>Service Conductors:</strong> {results.conductorSize} Copper
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Important Notes */}
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
            <Info size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            <div style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: '1.5' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                Important Notes:
              </div>
              <div style={{ fontSize: '0.8125rem' }}>
                Service conductors are approximate for 75°C copper. Consult NEC Table 310.15(B)(16) for exact sizing with all derating factors.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Commercial Service Sizing
  const CommercialService = () => {
    const [connectedLoad, setConnectedLoad] = useState('');
    const [demandFactor, setDemandFactor] = useState('80');
    const [voltage, setVoltage] = useState('480');
    const [phase, setPhase] = useState('three');
    const [futureExpansion, setFutureExpansion] = useState('25');

    const calculateCommercialService = () => {
      const connected = parseFloat(connectedLoad) || 0;
      const demand = parseFloat(demandFactor) / 100;
      const expansion = parseFloat(futureExpansion) / 100;
      const volts = parseFloat(voltage);

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

    const results = calculateCommercialService();

    return (
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
            Load Information
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText, 
                marginBottom: '0.5rem' 
              }}>
                Total Connected Load (kW)
              </label>
              <input 
                type="number" 
                value={connectedLoad} 
                onChange={(e) => setConnectedLoad(e.target.value)}
                placeholder="Total building load"
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
                Demand Factor (%)
              </label>
              <input 
                type="number" 
                value={demandFactor} 
                onChange={(e) => setDemandFactor(e.target.value)}
                placeholder="Typically 70-90%"
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
                Peak demand percentage
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
                Future Expansion (%)
              </label>
              <input 
                type="number" 
                value={futureExpansion} 
                onChange={(e) => setFutureExpansion(e.target.value)}
                placeholder="Typically 20-30%"
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
                Spare capacity for growth
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
                <option value="208">208V</option>
                <option value="240">240V</option>
                <option value="480">480V</option>
                <option value="600">600V</option>
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText, 
                marginBottom: '0.5rem' 
              }}>
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
        </div>

        {connectedLoad && (
          <div>
            {/* Load Calculation */}
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
                Load Calculation
              </h3>
              
              <div style={{ 
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                border: `1px solid ${colors.cardBorder}`,
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: colors.labelText }}>
                  <strong style={{ color: colors.cardText }}>Connected Load:</strong> {results.connectedLoad.toFixed(1)} kW
                </div>
                <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: colors.labelText }}>
                  <strong style={{ color: colors.cardText }}>Demand Load ({demandFactor}%):</strong> {results.demandLoad.toFixed(1)} kW
                </div>
                <div style={{ fontSize: '0.875rem', color: colors.labelText }}>
                  <strong style={{ color: colors.cardText }}>With Future Expansion ({futureExpansion}%):</strong> {results.futureLoad.toFixed(1)} kW
                </div>
              </div>

              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Calculated Amperage
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {results.amperage.toFixed(1)}
                </div>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
                  Amperes
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
                fontSize: '1rem', 
                fontWeight: '600', 
                color: colors.cardText,
                marginTop: 0,
                marginBottom: '1rem'
              }}>
                Recommended Service
              </h3>

              <div style={{ 
                background: '#dbeafe',
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: '#1e40af', marginBottom: '0.5rem', fontWeight: '600' }}>
                  Service Size
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e40af' }}>
                  {results.recommendedService}A
                </div>
              </div>

              <div style={{ 
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center',
                border: `1px solid ${colors.cardBorder}`
              }}>
                <div style={{ fontSize: '0.875rem', color: colors.labelText }}>
                  @ {voltage}V {phase === 'single' ? 'Single' : 'Three'} Phase
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Considerations */}
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fcd34d',
          borderRadius: '8px',
          padding: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
            <Info size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
            <div style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: '1.5' }}>
              <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                Commercial Service Considerations:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
                <li style={{ marginBottom: '0.25rem' }}>Include demand factors per NEC 220.40 and Article 220 Part IV</li>
                <li style={{ marginBottom: '0.25rem' }}>Consider future expansion (typically 20-30% spare capacity)</li>
                <li style={{ marginBottom: '0.25rem' }}>Account for motor loads, HVAC, and large equipment</li>
                <li style={{ marginBottom: '0.25rem' }}>Review utility requirements and available fault current</li>
                <li>Consider separate services for different occupancies</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const tabComponents = {
    residential: <ResidentialService />,
    commercial: <CommercialService />
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
          <Home size={24} color="#3b82f6" />
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: colors.cardText,
            margin: 0 
          }}>
            Service Entrance Sizing
          </h2>
        </div>
        <p style={{ 
          fontSize: '0.875rem', 
          color: colors.labelText,
          margin: 0 
        }}>
          NEC Article 230
        </p>
      </div>

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
            onClick={() => setActiveTab('residential')}
            style={{
              flex: '1 1 auto',
              minWidth: '120px',
              padding: '0.75rem 1rem',
              background: activeTab === 'residential' ? '#3b82f6' : 'transparent',
              color: activeTab === 'residential' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'residential' ? '#3b82f6' : colors.cardBorder}`,
              borderRadius: '8px',
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
              flex: '1 1 auto',
              minWidth: '120px',
              padding: '0.75rem 1rem',
              background: activeTab === 'commercial' ? '#3b82f6' : 'transparent',
              color: activeTab === 'commercial' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'commercial' ? '#3b82f6' : colors.cardBorder}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Commercial
          </button>
        </div>
      </div>

      {/* Active Tab Content */}
      {tabComponents[activeTab]}

      {/* NEC Reference Footer */}
      <div style={{
        background: colors.sectionBg,
        padding: '1rem',
        borderRadius: '8px',
        border: `1px solid ${colors.cardBorder}`,
        fontSize: '0.8125rem',
        color: colors.labelText,
        marginTop: '1rem'
      }}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: colors.cardText }}>
          NEC Article 230 - Services and Service Equipment:
        </div>
        220.82: Dwelling unit optional calculation • 230.42: Minimum conductor size • 230.79: Disconnecting means rating • 230.90: Overload protection
      </div>
    </div>
  );
}

export default ServiceEntranceSizing;