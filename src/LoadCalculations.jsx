import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { BarChart3, CheckCircle, Info } from 'lucide-react';
import { exportToPDF } from './pdfExport';

// Residential Load Calculator (NEC 220.82 Standard Method)
const ResidentialLoadCalculator = ({ data, setData, colors }) => {
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
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem', minHeight: '2.5rem' }}>
            Square<br/>Footage<br/>   <br/>
          </label>
          <input 
            type="number" 
            value={data.squareFootage} 
            onChange={(e) => setData(prev => ({...prev, squareFootage: e.target.value}))}
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
          <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem', visibility: 'hidden' }}>placeholder</div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
            Small Appliance Circuits
          </label>
          <input 
            type="number" 
            value={data.smallApplianceCircuits} 
            onChange={(e) => setData(prev => ({...prev, smallApplianceCircuits: e.target.value}))}
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
            Laundry Circuits <br/>   <br/>
          </label>
          <input 
            type="number" 
            value={data.laundryCircuits} 
            onChange={(e) => setData(prev => ({...prev, laundryCircuits: e.target.value}))}
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
            value={data.rangeKW} 
            onChange={(e) => setData(prev => ({...prev, rangeKW: e.target.value}))}
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
          <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem', visibility: 'hidden' }}>placeholder</div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
            Electric Dryer (kW)
          </label>
          <input 
            type="number" 
            value={data.dryerKW} 
            onChange={(e) => setData(prev => ({...prev, dryerKW: e.target.value}))}
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
          <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem', visibility: 'hidden' }}>placeholder</div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
            Water Heater (kW)
          </label>
          <input 
            type="number" 
            value={data.waterHeaterKW} 
            onChange={(e) => setData(prev => ({...prev, waterHeaterKW: e.target.value}))}
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
          <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem', visibility: 'hidden' }}>placeholder</div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
            HVAC/Heat (kW)
          </label>
          <input 
            type="number" 
            value={data.hvacKW} 
            onChange={(e) => setData(prev => ({...prev, hvacKW: e.target.value}))}
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
          <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem', visibility: 'hidden' }}>placeholder</div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
            Other Loads (kW)
          </label>
          <input 
            type="number" 
            value={data.otherLoadsKW} 
            onChange={(e) => setData(prev => ({...prev, otherLoadsKW: e.target.value}))}
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
          <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem', visibility: 'hidden' }}>placeholder</div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
            Service Voltage
          </label>
          <select 
            value={data.voltage} 
            onChange={(e) => setData(prev => ({...prev, voltage: e.target.value}))}
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
           <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem', visibility: 'hidden' }}>placeholder</div>
        </div>
      </div>

      {data.squareFootage && (
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
                {data.rangeKW > 0 && <div>Range: {results.rangeDemand.toLocaleString()} W</div>}
                {data.dryerKW > 0 && <div>Dryer: {results.dryerDemand.toLocaleString()} W</div>}
                {data.waterHeaterKW > 0 && <div>Water Heater: {results.waterHeaterDemand.toLocaleString()} W</div>}
                {data.hvacKW > 0 && <div>HVAC: {results.hvacDemand.toLocaleString()} W</div>}
                {data.otherLoadsKW > 0 && <div>Other: {results.otherDemand.toLocaleString()} W</div>}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Commercial Load Calculator (Basic)
const CommercialLoadCalculator = ({ data, setData, colors }) => {
  const lightingVAPerSqFt = {
    'office': 3.5, 'warehouse': 0.25, 'retail': 3.0, 'school': 3.0,
    'restaurant': 2.0, 'hotel': 2.0, 'hospital': 2.0, 'industrial': 2.0
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
    const totalConnectedKW = (lightingVA / 1000) + hvac + receptacles + motors + other;
    const demandLoadKW = totalConnectedKW * demand;

    let amperage;
    if (data.phase === 'single') {
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
            value={data.squareFootage} 
            onChange={(e) => setData(prev => ({...prev, squareFootage: e.target.value}))}
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
            value={data.occupancyType} 
            onChange={(e) => setData(prev => ({...prev, occupancyType: e.target.value}))}
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
            value={data.hvacLoad} 
            onChange={(e) => setData(prev => ({...prev, hvacLoad: e.target.value}))}
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
            value={data.receptacleLoad} 
            onChange={(e) => setData(prev => ({...prev, receptacleLoad: e.target.value}))}
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
            value={data.motorLoads} 
            onChange={(e) => setData(prev => ({...prev, motorLoads: e.target.value}))}
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
            value={data.otherLoads} 
            onChange={(e) => setData(prev => ({...prev, otherLoads: e.target.value}))}
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
            value={data.demandFactor} 
            onChange={(e) => setData(prev => ({...prev, demandFactor: e.target.value}))}
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
            value={data.voltage} 
            onChange={(e) => setData(prev => ({...prev, voltage: e.target.value}))}
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
            System<br/> Phase
          </label>
          
          <select 
            value={data.phase} 
            onChange={(e) => setData(prev => ({...prev, phase: e.target.value}))}
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

      {data.squareFootage && (
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
              {data.hvacLoad > 0 && <div>HVAC: {results.hvac.toFixed(2)} kW</div>}
              {data.receptacleLoad > 0 && <div>Receptacles: {results.receptacles.toFixed(2)} kW</div>}
              {data.motorLoads > 0 && <div>Motors: {results.motors.toFixed(2)} kW</div>}
              {data.otherLoads > 0 && <div>Other: {results.other.toFixed(2)} kW</div>}
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
                <div>{data.voltage}V {data.phase === 'single' ? 'Single' : 'Three'} Phase</div>
                <div>{data.demandFactor}% demand factor applied</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const LoadCalculations = forwardRef(({ isDarkMode = false, onBack }, ref) => {
  const [activeTab, setActiveTab] = useState('residential');

  // Lifted state for both calculators
  const [residentialData, setResidentialData] = useState({
    squareFootage: '',
    smallApplianceCircuits: '2',
    laundryCircuits: '1',
    rangeKW: '',
    dryerKW: '5',
    waterHeaterKW: '',
    hvacKW: '',
    otherLoadsKW: '',
    voltage: '240'
  });

  const [commercialData, setCommercialData] = useState({
    squareFootage: '',
    occupancyType: 'office',
    hvacLoad: '',
    receptacleLoad: '',
    motorLoads: '',
    otherLoads: '',
    demandFactor: '100',
    voltage: '480',
    phase: 'three'
  });

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

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      let pdfData;

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
          rangeDemand = range <= 12 ? 8000 : 8000 + ((range - 12) * 400);
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
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
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
        {activeTab === 'residential' ? (
          <ResidentialLoadCalculator 
            data={residentialData} 
            setData={setResidentialData} 
            colors={colors} 
          />
        ) : (
          <CommercialLoadCalculator 
            data={commercialData} 
            setData={setCommercialData} 
            colors={colors} 
          />
        )}
      </div>
    </div>
  );
});

export default LoadCalculations;