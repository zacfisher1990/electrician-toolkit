import React, { useState } from 'react';

function ServiceEntranceSizing({ onBack }) {
  const [activeTab, setActiveTab] = useState('residential');

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

      // General lighting @ 3 VA per sq ft (NEC 220.12)
      const generalLighting = sqft * 3;

      // Small appliance (minimum 2 circuits @ 1500 VA each)
      const smallAppliance = 2 * 1500;

      // Laundry circuit (1500 VA)
      const laundry = 1500;

      // Total general + small appliance + laundry
      const subtotal = generalLighting + smallAppliance + laundry;

      // Apply demand factors (NEC 220.42)
      let demandLighting = 0;
      if (subtotal <= 3000) {
        demandLighting = subtotal;
      } else {
        demandLighting = 3000 + ((subtotal - 3000) * 0.35);
      }

      // Range demand (NEC Table 220.55) - simplified
      let rangeDemand = 0;
      if (range > 0) {
        if (range <= 12000) {
          rangeDemand = 8000;
        } else {
          rangeDemand = 8000 + ((range - 12000) * 0.05);
        }
      }

      // Dryer - 5000W or nameplate, whichever is larger
      const dryerDemand = Math.max(dry, 5000);

      // Water heater - 100%
      const whDemand = wh;

      // HVAC - 100% of largest motor/heat load
      const hvacDemand = hvac;

      // Other loads - 100%
      const otherDemand = other;

      // Total demand
      const totalDemand = demandLighting + rangeDemand + dryerDemand + whDemand + hvacDemand + otherDemand;
      const totalAmperage = totalDemand / volts;

      // Recommend service size
      let recommendedService = 100;
      if (totalAmperage > 200) recommendedService = 400;
      else if (totalAmperage > 150) recommendedService = 200;
      else if (totalAmperage > 100) recommendedService = 150;

      // Service conductor size (approximate, 75°C copper)
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
        <h3>Residential Service Sizing</h3>
        <p className="small">NEC 220.82 Optional Calculation Method</p>

        <div style={{ marginBottom: '15px' }}>
          <label>Square Footage:</label>
          <input 
            type="number" 
            value={squareFootage} 
            onChange={(e) => setSquareFootage(e.target.value)}
            placeholder="Living area"
          />
          <div className="small">Heated/cooled living space</div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>HVAC/Heat Load (Watts):</label>
          <input 
            type="number" 
            value={hvacLoad} 
            onChange={(e) => setHvacLoad(e.target.value)}
            placeholder="Largest heating or cooling load"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Water Heater (Watts):</label>
          <input 
            type="number" 
            value={waterHeater} 
            onChange={(e) => setWaterHeater(e.target.value)}
            placeholder="Water heater nameplate"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Range/Oven (Watts):</label>
          <input 
            type="number" 
            value={rangeOven} 
            onChange={(e) => setRangeOven(e.target.value)}
            placeholder="Electric range rating"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Dryer (Watts):</label>
          <input 
            type="number" 
            value={dryer} 
            onChange={(e) => setDryer(e.target.value)}
            placeholder="Electric dryer rating"
          />
          <div className="small">Minimum 5000W if electric</div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Other Loads (Watts):</label>
          <input 
            type="number" 
            value={otherLoads} 
            onChange={(e) => setOtherLoads(e.target.value)}
            placeholder="Pool, spa, workshop, etc."
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>Service Voltage:</label>
          <select value={voltage} onChange={(e) => setVoltage(e.target.value)}>
            <option value="240">240V</option>
            <option value="208">208V</option>
          </select>
        </div>

        {squareFootage && (
          <div className="result">
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#1e3a8a' }}>Service Sizing Results:</h3>
            
            <div style={{ 
              backgroundColor: '#f8fafc', 
              padding: '12px', 
              borderRadius: '6px',
              marginBottom: '15px',
              color: '#374151'
            }}>
              <strong>Connected Loads:</strong>
              <div>General Lighting: {results.generalLighting.toLocaleString()} VA</div>
              <div>Small Appliance: {results.smallAppliance.toLocaleString()} VA</div>
              <div>Laundry: {results.laundry.toLocaleString()} VA</div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '5px' }}>
                Subtotal: {results.subtotal.toLocaleString()} VA
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#f8fafc', 
              padding: '12px', 
              borderRadius: '6px',
              marginBottom: '15px',
              color: '#374151'
            }}>
              <strong>Demand Loads (after factors):</strong>
              <div>Lighting: {results.demandLighting.toFixed(0)} W</div>
              {rangeOven && <div>Range: {results.rangeDemand.toFixed(0)} W</div>}
              {dryer && <div>Dryer: {results.dryerDemand.toFixed(0)} W</div>}
              {waterHeater && <div>Water Heater: {results.whDemand.toFixed(0)} W</div>}
              {hvacLoad && <div>HVAC: {results.hvacDemand.toFixed(0)} W</div>}
              {otherLoads && <div>Other: {results.otherDemand.toFixed(0)} W</div>}
            </div>

            <div style={{ 
              backgroundColor: '#eff6ff',
              border: '2px solid #3b82f6',
              padding: '15px',
              borderRadius: '8px',
              color: '#1e3a8a'
            }}>
              <div style={{ fontSize: '16px', marginBottom: '5px' }}>
                <strong>Total Demand Load:</strong> {results.totalDemand.toFixed(0)} W
              </div>
              <div style={{ fontSize: '16px', marginBottom: '10px' }}>
                <strong>Calculated Amperage:</strong> {results.totalAmperage.toFixed(1)} A
              </div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: 'bold',
                paddingTop: '10px',
                borderTop: '1px solid #3b82f6'
              }}>
                Recommended Service: {results.recommendedService}A
              </div>
              <div style={{ fontSize: '16px', marginTop: '5px' }}>
                Service Conductors: {results.conductorSize} Copper
              </div>
            </div>
          </div>
        )}

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#374151'
        }}>
          <strong>NEC References:</strong>
          <div>220.12 - General Lighting Loads</div>
          <div>220.52 - Small Appliance and Laundry Loads</div>
          <div>220.55 - Electric Range Demand Loads</div>
          <div>220.82 - Dwelling Unit Optional Calculation</div>
          <div style={{ marginTop: '10px', fontStyle: 'italic', fontSize: '12px' }}>
            Note: Service conductors are approximate for 75°C copper. Consult NEC Table 310.15(B)(16) for exact sizing with all derating factors.
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

      // Standard service sizes
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
        <h3>Commercial Service Sizing</h3>
        <p className="small">Simplified commercial service calculation</p>

        <div style={{ marginBottom: '15px' }}>
          <label>Total Connected Load (kW):</label>
          <input 
            type="number" 
            value={connectedLoad} 
            onChange={(e) => setConnectedLoad(e.target.value)}
            placeholder="Total building load"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Demand Factor (%):</label>
          <input 
            type="number" 
            value={demandFactor} 
            onChange={(e) => setDemandFactor(e.target.value)}
            placeholder="Typically 70-90%"
          />
          <div className="small">Percentage of connected load at peak demand</div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Future Expansion (%):</label>
          <input 
            type="number" 
            value={futureExpansion} 
            onChange={(e) => setFutureExpansion(e.target.value)}
            placeholder="Typically 20-30%"
          />
          <div className="small">Spare capacity for future growth</div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Service Voltage:</label>
          <select value={voltage} onChange={(e) => setVoltage(e.target.value)}>
            <option value="208">208V</option>
            <option value="240">240V</option>
            <option value="480">480V</option>
            <option value="600">600V</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>System Phase:</label>
          <select value={phase} onChange={(e) => setPhase(e.target.value)}>
            <option value="single">Single Phase</option>
            <option value="three">Three Phase</option>
          </select>
        </div>

        {connectedLoad && (
          <div className="result">
            <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#1e3a8a' }}>Service Sizing Results:</h3>
            
            <div style={{ 
              backgroundColor: '#f8fafc', 
              padding: '12px', 
              borderRadius: '6px',
              marginBottom: '15px',
              color: '#374151'
            }}>
              <div><strong>Connected Load:</strong> {results.connectedLoad.toFixed(1)} kW</div>
              <div><strong>Demand Load ({demandFactor}%):</strong> {results.demandLoad.toFixed(1)} kW</div>
              <div><strong>With Future Expansion ({futureExpansion}%):</strong> {results.futureLoad.toFixed(1)} kW</div>
            </div>

            <div style={{ 
              backgroundColor: '#eff6ff',
              border: '2px solid #3b82f6',
              padding: '15px',
              borderRadius: '8px',
              color: '#1e3a8a'
            }}>
              <div style={{ fontSize: '16px', marginBottom: '10px' }}>
                <strong>Calculated Amperage:</strong> {results.amperage.toFixed(1)} A
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '10px' }}>
                @ {voltage}V {phase === 'single' ? 'Single' : 'Three'} Phase
              </div>
              <div style={{ 
                fontSize: '20px', 
                fontWeight: 'bold',
                paddingTop: '10px',
                borderTop: '1px solid #3b82f6'
              }}>
                Recommended Service: {results.recommendedService}A
              </div>
            </div>
          </div>
        )}

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          fontSize: '13px',
          color: '#374151'
        }}>
          <strong>Commercial Service Considerations:</strong>
          <ul style={{ textAlign: 'left', paddingLeft: '20px', margin: '10px 0' }}>
            <li>Include demand factors per NEC 220.40 and Article 220 Part IV</li>
            <li>Consider future expansion (typically 20-30% spare capacity)</li>
            <li>Account for motor loads, HVAC, and large equipment</li>
            <li>Review utility requirements and available fault current</li>
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
    <div className="calculator-container">
      {onBack && (
        <button onClick={onBack} style={{ marginBottom: '20px' }}>
          ← Back to Menu
        </button>
      )}

      <h2>Service Entrance Sizing</h2>
      
      {/* Tab Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '25px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => setActiveTab('residential')}
          style={{
            padding: '10px 15px',
            backgroundColor: activeTab === 'residential' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'residential' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Residential
        </button>
        <button 
          onClick={() => setActiveTab('commercial')}
          style={{
            padding: '10px 15px',
            backgroundColor: activeTab === 'commercial' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'commercial' ? 'white' : '#374151',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Commercial
        </button>
      </div>

      {/* Active Tab Content */}
      {tabComponents[activeTab]}

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f8fafc',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#374151'
      }}>
        <strong>NEC Article 230 - Services:</strong>
        <ul style={{ textAlign: 'left', paddingLeft: '20px', margin: '10px 0' }}>
          <li>230.42 - Minimum service conductor size</li>
          <li>230.79 - Service disconnecting means rating</li>
          <li>230.90 - Overload protection requirements</li>
          <li>Always verify calculations with local code and utility requirements</li>
        </ul>
      </div>
    </div>
  );
}

export default ServiceEntranceSizing;