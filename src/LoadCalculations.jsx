import React, { useState } from 'react';

function LoadCalculations() {
  const [activeTab, setActiveTab] = useState('residential');

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

      // General lighting load: 3 VA per sq ft (NEC 220.12)
      const generalLighting = sqft * 3;

      // Small appliance circuits: 1500 VA each (NEC 220.52(A))
      const smallApplianceLoad = sac * 1500;

      // Laundry circuit: 1500 VA (NEC 220.52(B))
      const laundryLoad = laundry * 1500;

      // Total general lighting + small appliance + laundry
      const subtotalVA = generalLighting + smallApplianceLoad + laundryLoad;

      // Apply demand factors (NEC 220.42)
      let demandLighting = 0;
      if (subtotalVA <= 3000) {
        demandLighting = subtotalVA;
      } else if (subtotalVA <= 120000) {
        demandLighting = 3000 + ((subtotalVA - 3000) * 0.35);
      } else {
        demandLighting = 3000 + (117000 * 0.35) + ((subtotalVA - 120000) * 0.25);
      }

      // Range demand load (NEC Table 220.55)
      let rangeDemand = 0;
      if (range > 0) {
        if (range <= 12) {
          rangeDemand = 8000; // 8 kW for ranges up to 12 kW
        } else {
          rangeDemand = 8000 + ((range - 12) * 400); // Add 400W per kW over 12
        }
      }

      // Dryer: 5000W or nameplate, whichever is larger (NEC 220.54)
      const dryerDemand = Math.max(dryer * 1000, 5000);

      // Water heater: 100% of nameplate (NEC 220.82)
      const waterHeaterDemand = waterHeater * 1000;

      // HVAC: Largest motor or heat strip load (NEC 220.82(C))
      const hvacDemand = hvac * 1000;

      // Other loads: 100%
      const otherDemand = other * 1000;

      // Total demand load
      const totalDemandVA = demandLighting + rangeDemand + dryerDemand + waterHeaterDemand + hvacDemand + otherDemand;
      const totalDemandKW = totalDemandVA / 1000;

      // Calculate amperage
      const totalAmperage = totalDemandVA / volts;

      // Recommended service size
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
        <h3>Residential Load Calculation</h3>
        <p className="small">NEC 220.82 Standard Calculation Method</p>

        <div style={{ marginBottom: '15px' }}>
          <label>Square Footage:</label>
          <input 
            type="number" 
            value={squareFootage} 
            onChange={(e) => setSquareFootage(e.target.value)}
            placeholder="Living area square footage"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Small Appliance Circuits:</label>
          <input 
            type="number" 
            value={smallApplianceCircuits} 
            onChange={(e) => setSmallApplianceCircuits(e.target.value)}
            placeholder="Minimum 2 required"
          />
          <div className="small">Kitchen/dining circuits @ 1500 VA each</div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Laundry Circuits:</label>
          <input 
            type="number" 
            value={laundryCircuits} 
            onChange={(e) => setLaundryCircuits(e.target.value)}
            placeholder="Typically 1"
          />
          <div className="small">@ 1500 VA each</div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Electric Range (kW):</label>
          <input 
            type="number" 
            value={rangeKW} 
            onChange={(e) => setRangeKW(e.target.value)}
            placeholder="Range nameplate rating"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Electric Dryer (kW):</label>
          <input 
            type="number" 
            value={dryerKW} 
            onChange={(e) => setDryerKW(e.target.value)}
            placeholder="Minimum 5 kW"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Water Heater (kW):</label>
          <input 
            type="number" 
            value={waterHeaterKW} 
            onChange={(e) => setWaterHeaterKW(e.target.value)}
            placeholder="Water heater rating"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>HVAC/Heat (kW):</label>
          <input 
            type="number" 
            value={hvacKW} 
            onChange={(e) => setHvacKW(e.target.value)}
            placeholder="Largest heating or cooling load"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Other Loads (kW):</label>
          <input 
            type="number" 
            value={otherLoadsKW} 
            onChange={(e) => setOtherLoadsKW(e.target.value)}
            placeholder="Pool, spa, etc."
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
            <h4 style={{ marginBottom: '15px' }}>Load Calculation Summary</h4>
            
            <div style={{ 
              backgroundColor: '#f8fafc', 
              padding: '12px', 
              borderRadius: '6px',
              marginBottom: '10px'
            }}>
              <strong>Connected Loads:</strong>
              <div>General Lighting: {results.generalLighting.toLocaleString()} VA</div>
              <div>Small Appliance: {results.smallApplianceLoad.toLocaleString()} VA</div>
              <div>Laundry: {results.laundryLoad.toLocaleString()} VA</div>
              <div style={{ borderTop: '1px solid #d1d5db', marginTop: '5px', paddingTop: '5px' }}>
                Subtotal: {results.subtotalVA.toLocaleString()} VA
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#f8fafc', 
              padding: '12px', 
              borderRadius: '6px',
              marginBottom: '10px'
            }}>
              <strong>Demand Loads:</strong>
              <div>Lighting (with demand factors): {results.demandLighting.toFixed(0)} VA</div>
              {rangeKW && <div>Range: {results.rangeDemand.toLocaleString()} W</div>}
              {dryerKW && <div>Dryer: {results.dryerDemand.toLocaleString()} W</div>}
              {waterHeaterKW && <div>Water Heater: {results.waterHeaterDemand.toLocaleString()} W</div>}
              {hvacKW && <div>HVAC: {results.hvacDemand.toLocaleString()} W</div>}
              {otherLoadsKW && <div>Other Loads: {results.otherDemand.toLocaleString()} W</div>}
            </div>

            <div style={{ 
              backgroundColor: '#ecfdf5',
              border: '2px solid #10b981',
              padding: '15px',
              borderRadius: '8px',
              fontSize: '16px'
            }}>
              <div><strong>Total Demand Load: {results.totalDemandKW.toFixed(2)} kW</strong></div>
              <div><strong>Total Amperage: {results.totalAmperage.toFixed(1)} A</strong></div>
              <div style={{ 
                marginTop: '10px', 
                paddingTop: '10px', 
                borderTop: '1px solid #10b981',
                fontSize: '18px'
              }}>
                <strong>Recommended Service: {results.recommendedService} Amp</strong>
              </div>
            </div>
          </div>
        )}

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          fontSize: '13px'
        }}>
          <strong>NEC References:</strong>
          <div>220.12 - General Lighting (3 VA/sq ft)</div>
          <div>220.52 - Small Appliance and Laundry Loads</div>
          <div>220.55 - Electric Range Demand Loads</div>
          <div>220.82 - Dwelling Unit Optional Calculation</div>
        </div>
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

    // NEC Table 220.12 - General Lighting Loads by Occupancy
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

      // Lighting load based on occupancy type
      const lightingVA = sqft * lightingVAPerSqFt[occupancyType];

      // Total connected load
      const totalConnectedKW = (lightingVA / 1000) + hvac + receptacles + motors + other;

      // Apply demand factor
      const demandLoadKW = totalConnectedKW * demand;

      // Calculate amperage
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
        <h3>Commercial Load Calculation</h3>
        <p className="small">Basic commercial/industrial load estimation</p>

        <div style={{ marginBottom: '15px' }}>
          <label>Square Footage:</label>
          <input 
            type="number" 
            value={squareFootage} 
            onChange={(e) => setSquareFootage(e.target.value)}
            placeholder="Building area"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Occupancy Type:</label>
          <select value={occupancyType} onChange={(e) => setOccupancyType(e.target.value)}>
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

        <div style={{ marginBottom: '15px' }}>
          <label>HVAC Load (kW):</label>
          <input 
            type="number" 
            value={hvacLoad} 
            onChange={(e) => setHvacLoad(e.target.value)}
            placeholder="Total HVAC load"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Receptacle Load (kW):</label>
          <input 
            type="number" 
            value={receptacleLoad} 
            onChange={(e) => setReceptacleLoad(e.target.value)}
            placeholder="Calculated receptacle load"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Motor Loads (kW):</label>
          <input 
            type="number" 
            value={motorLoads} 
            onChange={(e) => setMotorLoads(e.target.value)}
            placeholder="Total motor loads"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Other Loads (kW):</label>
          <input 
            type="number" 
            value={otherLoads} 
            onChange={(e) => setOtherLoads(e.target.value)}
            placeholder="Additional loads"
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Demand Factor (%):</label>
          <input 
            type="number" 
            value={demandFactor} 
            onChange={(e) => setDemandFactor(e.target.value)}
            placeholder="Typically 80-100%"
          />
          <div className="small">Percentage of connected load expected at peak</div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>System Voltage:</label>
          <select value={voltage} onChange={(e) => setVoltage(e.target.value)}>
            <option value="208">208V</option>
            <option value="240">240V</option>
            <option value="277">277V</option>
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

        {squareFootage && (
          <div className="result">
            <h4 style={{ marginBottom: '15px' }}>Load Calculation Summary</h4>
            
            <div style={{ 
              backgroundColor: '#f8fafc', 
              padding: '12px', 
              borderRadius: '6px',
              marginBottom: '10px'
            }}>
              <strong>Connected Loads:</strong>
              <div>Lighting: {results.lightingKW.toFixed(2)} kW ({results.lightingVA.toFixed(0)} VA)</div>
              {hvacLoad && <div>HVAC: {results.hvac.toFixed(2)} kW</div>}
              {receptacleLoad && <div>Receptacles: {results.receptacles.toFixed(2)} kW</div>}
              {motorLoads && <div>Motors: {results.motors.toFixed(2)} kW</div>}
              {otherLoads && <div>Other: {results.other.toFixed(2)} kW</div>}
              <div style={{ borderTop: '1px solid #d1d5db', marginTop: '5px', paddingTop: '5px' }}>
                <strong>Total Connected: {results.totalConnectedKW.toFixed(2)} kW</strong>
              </div>
            </div>

            <div style={{ 
              backgroundColor: '#ecfdf5',
              border: '2px solid #10b981',
              padding: '15px',
              borderRadius: '8px',
              fontSize: '16px'
            }}>
              <div><strong>Demand Load: {results.demandLoadKW.toFixed(2)} kW</strong></div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '5px' }}>
                ({demandFactor}% demand factor applied)
              </div>
              <div style={{ 
                marginTop: '10px', 
                paddingTop: '10px', 
                borderTop: '1px solid #10b981',
                fontSize: '18px'
              }}>
                <strong>Required Amperage: {results.amperage.toFixed(1)} A</strong>
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                @ {voltage}V {phase === 'single' ? 'Single' : 'Three'} Phase
              </div>
            </div>
          </div>
        )}

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          fontSize: '13px'
        }}>
          <strong>NEC References:</strong>
          <div>220.12 - General Lighting Loads by Occupancy</div>
          <div>220.14 - Other Loads - All Occupancies</div>
          <div>220.40 - General - Commercial Building Calculations</div>
          <div>Note: This is a simplified calculation. Complex facilities may require detailed analysis.</div>
        </div>
      </div>
    );
  };

  const tabComponents = {
    residential: <ResidentialLoadCalculator />,
    commercial: <CommercialLoadCalculator />
  };

  return (
    <div className="calculator-container">
      <h2>Load Calculations</h2>
      
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
    </div>
  );
}

export default LoadCalculations;