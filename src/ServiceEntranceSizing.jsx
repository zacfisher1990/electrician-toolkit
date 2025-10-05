import React, { useState } from 'react';
import { Home } from 'lucide-react';

function ServiceEntranceSizing({ isDarkMode = false }) {
  const [activeTab, setActiveTab] = useState('residential');

  // Dark mode colors - matching the design system
  const colors = {
    mainBg: isDarkMode ? '#1f2937' : '#ffffff',
    headerBg: isDarkMode ? '#111827' : '#ffffff',
    headerText: isDarkMode ? '#f9fafb' : '#111827',
    headerBorder: isDarkMode ? '#374151' : '#e5e7eb',
    contentBg: isDarkMode ? '#111827' : '#f9fafb',
    labelText: isDarkMode ? '#d1d5db' : '#374151',
    inputBg: isDarkMode ? '#374151' : 'white',
    inputBgAlt: isDarkMode ? '#1f2937' : '#f9fafb',
    inputBorder: isDarkMode ? '#4b5563' : '#d1d5db',
    inputText: isDarkMode ? '#f9fafb' : '#111827',
    cardBg: isDarkMode ? '#1f2937' : 'white',
    cardBorder: isDarkMode ? '#4b5563' : '#e5e7eb',
    subtleText: isDarkMode ? '#9ca3af' : '#6b7280',
    footerBg: isDarkMode ? '#111827' : '#f9fafb',
    footerText: isDarkMode ? '#9ca3af' : '#6b7280',
    footerBorder: isDarkMode ? '#374151' : '#e5e7eb'
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Square Footage
            </label>
            <input 
              type="number" 
              value={squareFootage} 
              onChange={(e) => setSquareFootage(e.target.value)}
              placeholder="Living area"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>Heated/cooled living space</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              HVAC/Heat Load (Watts)
            </label>
            <input 
              type="number" 
              value={hvacLoad} 
              onChange={(e) => setHvacLoad(e.target.value)}
              placeholder="Largest heating or cooling load"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Water Heater (Watts)
            </label>
            <input 
              type="number" 
              value={waterHeater} 
              onChange={(e) => setWaterHeater(e.target.value)}
              placeholder="Water heater nameplate"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Range/Oven (Watts)
            </label>
            <input 
              type="number" 
              value={rangeOven} 
              onChange={(e) => setRangeOven(e.target.value)}
              placeholder="Electric range rating"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Dryer (Watts)
            </label>
            <input 
              type="number" 
              value={dryer} 
              onChange={(e) => setDryer(e.target.value)}
              placeholder="Electric dryer rating"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>Minimum 5000W if electric</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Other Loads (Watts)
            </label>
            <input 
              type="number" 
              value={otherLoads} 
              onChange={(e) => setOtherLoads(e.target.value)}
              placeholder="Pool, spa, workshop, etc."
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
              Service Sizing Results
            </h3>
            
            <div style={{ 
              background: colors.cardBg, 
              padding: '1rem', 
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <strong style={{ display: 'block', marginBottom: '0.5rem', color: colors.labelText }}>Connected Loads:</strong>
              <div style={{ fontSize: '0.875rem', color: colors.labelText }}>General Lighting: {results.generalLighting.toLocaleString()} VA</div>
              <div style={{ fontSize: '0.875rem', color: colors.labelText }}>Small Appliance: {results.smallAppliance.toLocaleString()} VA</div>
              <div style={{ fontSize: '0.875rem', color: colors.labelText }}>Laundry: {results.laundry.toLocaleString()} VA</div>
              <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.5rem' }}>
                Subtotal: {results.subtotal.toLocaleString()} VA
              </div>
            </div>

            <div style={{ 
              background: colors.cardBg, 
              padding: '1rem', 
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <strong style={{ display: 'block', marginBottom: '0.5rem', color: colors.labelText }}>Demand Loads (after factors):</strong>
              <div style={{ fontSize: '0.875rem', color: colors.labelText }}>Lighting: {results.demandLighting.toFixed(0)} W</div>
              {rangeOven && <div style={{ fontSize: '0.875rem', color: colors.labelText }}>Range: {results.rangeDemand.toFixed(0)} W</div>}
              {dryer && <div style={{ fontSize: '0.875rem', color: colors.labelText }}>Dryer: {results.dryerDemand.toFixed(0)} W</div>}
              {waterHeater && <div style={{ fontSize: '0.875rem', color: colors.labelText }}>Water Heater: {results.whDemand.toFixed(0)} W</div>}
              {hvacLoad && <div style={{ fontSize: '0.875rem', color: colors.labelText }}>HVAC: {results.hvacDemand.toFixed(0)} W</div>}
              {otherLoads && <div style={{ fontSize: '0.875rem', color: colors.labelText }}>Other: {results.otherDemand.toFixed(0)} W</div>}
            </div>

            <div style={{ color: '#14532d', marginBottom: '0.75rem' }}>
              <strong>Total Demand Load:</strong> {results.totalDemand.toFixed(0)} W
            </div>
            
            <div style={{ color: '#14532d', marginBottom: '1rem' }}>
              <strong>Calculated Amperage:</strong> {results.totalAmperage.toFixed(1)} A
            </div>

            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#16a34a',
              marginBottom: '0.5rem',
              padding: '1rem',
              background: 'white',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              {results.recommendedService}A Service
            </div>

            <div style={{ 
              color: '#14532d',
              paddingTop: '1rem',
              borderTop: '1px solid #bbf7d0',
              textAlign: 'center'
            }}>
              <strong>Service Conductors:</strong> {results.conductorSize} Copper
            </div>
          </div>
        )}

        <div style={{ 
          background: colors.cardBg,
          padding: '1rem',
          borderRadius: '0.5rem',
          border: `1px solid ${colors.cardBorder}`,
          marginTop: '1.5rem'
        }}>
          <strong style={{ color: colors.labelText, display: 'block', marginBottom: '0.5rem' }}>Important Notes:</strong>
          <div style={{ color: colors.subtleText, fontSize: '0.875rem', fontStyle: 'italic' }}>
            Service conductors are approximate for 75°C copper. Consult NEC Table 310.15(B)(16) for exact sizing with all derating factors.
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Total Connected Load (kW)
            </label>
            <input 
              type="number" 
              value={connectedLoad} 
              onChange={(e) => setConnectedLoad(e.target.value)}
              placeholder="Total building load"
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
              placeholder="Typically 70-90%"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>Percentage of connected load at peak demand</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: colors.labelText, marginBottom: '0.5rem' }}>
              Future Expansion (%)
            </label>
            <input 
              type="number" 
              value={futureExpansion} 
              onChange={(e) => setFutureExpansion(e.target.value)}
              placeholder="Typically 20-30%"
              style={{ width: '100%', padding: '0.5rem 1rem', border: `1px solid ${colors.inputBorder}`, borderRadius: '0.375rem', fontSize: '1rem', background: colors.inputBg, color: colors.inputText }}
            />
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>Spare capacity for future growth</div>
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
              <option value="208">208V</option>
              <option value="240">240V</option>
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

        {connectedLoad && (
          <div style={{ 
            background: '#f0fdf4', 
            border: '2px solid #22c55e', 
            padding: '1.5rem', 
            borderRadius: '0.5rem'
          }}>
            <h3 style={{ fontWeight: 'bold', color: '#166534', marginTop: 0, marginBottom: '1rem' }}>
              Service Sizing Results
            </h3>
            
            <div style={{ 
              background: colors.cardBg, 
              padding: '1rem', 
              borderRadius: '0.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: colors.labelText }}><strong>Connected Load:</strong> {results.connectedLoad.toFixed(1)} kW</div>
              <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem', color: colors.labelText }}><strong>Demand Load ({demandFactor}%):</strong> {results.demandLoad.toFixed(1)} kW</div>
              <div style={{ fontSize: '0.875rem', color: colors.labelText }}><strong>With Future Expansion ({futureExpansion}%):</strong> {results.futureLoad.toFixed(1)} kW</div>
            </div>

            <div style={{ color: '#14532d', marginBottom: '0.75rem' }}>
              <strong>Calculated Amperage:</strong> {results.amperage.toFixed(1)} A
            </div>

            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#16a34a',
              marginBottom: '0.5rem',
              padding: '1rem',
              background: 'white',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              {results.recommendedService}A Service
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

        <div style={{ 
          background: colors.cardBg,
          padding: '1rem',
          borderRadius: '0.5rem',
          border: `1px solid ${colors.cardBorder}`,
          marginTop: '1.5rem'
        }}>
          <strong style={{ color: colors.labelText, display: 'block', marginBottom: '0.5rem' }}>Commercial Service Considerations:</strong>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: colors.subtleText, fontSize: '0.875rem' }}>
            <li style={{ marginBottom: '0.25rem' }}>Include demand factors per NEC 220.40 and Article 220 Part IV</li>
            <li style={{ marginBottom: '0.25rem' }}>Consider future expansion (typically 20-30% spare capacity)</li>
            <li style={{ marginBottom: '0.25rem' }}>Account for motor loads, HVAC, and large equipment</li>
            <li style={{ marginBottom: '0.25rem' }}>Review utility requirements and available fault current</li>
            <li>Consider separate services for different occupancies</li>
          </ul>
        </div>
      </div>
    );
  };

  const tabComponents = {
    residential: <ResidentialService />,
    commercial: <CommercialService />
  };

  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto', background: colors.mainBg, borderRadius: '0.5rem', overflow: 'hidden' }}>
      {/* Modern Header */}
      <div style={{ background: colors.headerBg, color: colors.headerText, padding: '1rem 1.5rem', borderBottom: `1px solid ${colors.headerBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Home size={24} color="#3b82f6" />
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: '600', margin: 0 }}>Service Entrance Sizing</h1>
            <p style={{ fontSize: '0.8125rem', margin: 0, color: colors.subtleText }}>NEC Article 230</p>
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
              background: activeTab === 'residential' ? '#3b82f6' : colors.inputBgAlt,
              color: activeTab === 'residential' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'residential' ? '#3b82f6' : colors.inputBorder}`,
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
              padding: '0.75rem 1.25rem',
              background: activeTab === 'commercial' ? '#3b82f6' : colors.inputBgAlt,
              color: activeTab === 'commercial' ? 'white' : colors.labelText,
              border: `1px solid ${activeTab === 'commercial' ? '#3b82f6' : colors.inputBorder}`,
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
        {tabComponents[activeTab]}
      </div>

      {/* Footer */}
      <div style={{ background: colors.footerBg, color: colors.footerText, padding: '1rem 1.5rem', borderTop: `1px solid ${colors.footerBorder}`, fontSize: '0.75rem' }}>
        <p style={{ fontWeight: '600', marginTop: 0, marginBottom: '0.5rem', color: colors.labelText }}>NEC Article 230 - Services and Service Equipment:</p>
        <p style={{ margin: 0 }}>
          220.82: Dwelling unit optional calculation • 230.42: Minimum conductor size • 230.79: Disconnecting means rating • 230.90: Overload protection
        </p>
      </div>
    </div>
  );
}

export default ServiceEntranceSizing;