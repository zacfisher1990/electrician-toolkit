import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Plug, CheckCircle, AlertCircle } from 'lucide-react';
import { exportToPDF } from '../../utils/pdfExport';
import styles from './Calculator.module.css';

// Move calculator components OUTSIDE to prevent recreation on each render
const GeneralReceptaclesCalculator = ({ generalData, setGeneralData, colors }) => {
  const calculateReceptacles = () => {
    if (!generalData.roomLength || !generalData.roomWidth) return null;
    
    const length = parseFloat(generalData.roomLength);
    const width = parseFloat(generalData.roomWidth);
    const perimeter = (length + width) * 2;
    
    // NEC 210.52(A): Receptacle every 12 feet along wall, first within 6 feet of doorway
    // Plus one for every 12 feet, minimum 2 per room
    const wallReceptacles = Math.max(2, Math.ceil(perimeter / 12));
    
    // Counter/island receptacles if applicable
    let counterReceptacles = 0;
    if (generalData.hasCounters) {
      const counterLength = parseFloat(generalData.counterLength) || 0;
      // NEC 210.52(C): One receptacle for every 24" of counter space, min 2
      counterReceptacles = Math.max(2, Math.ceil(counterLength / 2));
    }
    
    const totalReceptacles = wallReceptacles + counterReceptacles;
    const circuits15A = Math.ceil(totalReceptacles / 8); // Conservative: 8 receptacles per 15A circuit
    const circuits20A = Math.ceil(totalReceptacles / 10); // 10 receptacles per 20A circuit
    
    return {
      perimeter: perimeter.toFixed(1),
      wallReceptacles,
      counterReceptacles,
      totalReceptacles,
      circuits15A,
      circuits20A
    };
  };

  const results = calculateReceptacles();

  return (
    <div className={styles.menu}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
            Room Length (feet)
          </label>
          <input
            type="number"
            value={generalData.roomLength}
            onChange={(e) => setGeneralData(prev => ({...prev, roomLength: e.target.value}))}
            placeholder="Enter length"
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
            Room Width (feet)
          </label>
          <input
            type="number"
            value={generalData.roomWidth}
            onChange={(e) => setGeneralData(prev => ({...prev, roomWidth: e.target.value}))}
            placeholder="Enter width"
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

        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={generalData.hasCounters}
              onChange={(e) => setGeneralData(prev => ({...prev, hasCounters: e.target.checked}))}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            Room has countertops/islands
          </label>
        </div>

        {generalData.hasCounters && (
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Counter Length (feet)
            </label>
            <input
              type="number"
              value={generalData.counterLength}
              onChange={(e) => setGeneralData(prev => ({...prev, counterLength: e.target.value}))}
              placeholder="Enter counter length"
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
              For kitchens/break rooms
            </div>
          </div>
        )}
      </div>

      {results && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: results.counterReceptacles > 0 ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              background: '#dbeafe',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                Wall Receptacles
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                {results.wallReceptacles}
              </div>
            </div>
            
            {results.counterReceptacles > 0 && (
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Counter Receptacles
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {results.counterReceptacles}
                </div>
              </div>
            )}

            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                Total Needed
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                {results.totalReceptacles}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                15A Circuits
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                {results.circuits15A}
              </div>
            </div>

            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                20A Circuits
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                {results.circuits20A}
              </div>
            </div>
          </div>

          <div style={{
            background: '#d1fae5',
            border: '1px solid #6ee7b7',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <CheckCircle size={20} color="#059669" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.875rem', color: '#047857', lineHeight: '1.5' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                  NEC Requirements Met
                </div>
                <div>Room perimeter: {results.perimeter} ft</div>
                <div>Spacing: One receptacle every 12 feet of wall space</div>
                {results.counterReceptacles > 0 && (
                  <div>Counter spacing: One receptacle every 2 feet</div>
                )}
              </div>
            </div>
          </div>

          <div style={{
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            border: `1px solid ${colors.cardBorder}`,
            fontSize: '0.875rem',
            color: colors.labelText
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: colors.cardText }}>
              NEC 210.52 Requirements:
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>Wall: Receptacle within 6 ft of doorway, then every 12 ft</li>
              <li>No point along wall more than 6 ft from receptacle</li>
              <li>Counters: One receptacle every 24 inches of counter space</li>
              <li>Kitchen requires min. 2 small appliance circuits (20A)</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

const KitchenReceptaclesCalculator = ({ kitchenData, setKitchenData, colors }) => {
  const calculateKitchen = () => {
    if (!kitchenData.counterLength) return null;
    
    const counterLength = parseFloat(kitchenData.counterLength);
    const islandLength = parseFloat(kitchenData.islandLength) || 0;
    
    // NEC 210.52(C): One receptacle for every 24" of counter
    const counterReceptacles = Math.max(2, Math.ceil(counterLength / 2));
    
    // Island needs receptacle if longer than 24" x 12"
    const islandReceptacles = islandLength >= 2 ? Math.max(1, Math.ceil(islandLength / 4)) : 0;
    
    // Small appliance circuits: minimum 2 required (NEC 210.11(C)(1))
    const smallApplianceCircuits = 2;
    
    // GFCI required for all countertop receptacles
    const gfciRequired = counterReceptacles + islandReceptacles;
    
    // Dedicated circuits for appliances
    let dedicatedCircuits = 0;
    if (kitchenData.dishwasher) dedicatedCircuits++;
    if (kitchenData.disposer) dedicatedCircuits++;
    if (kitchenData.microwave) dedicatedCircuits++;
    if (kitchenData.range) dedicatedCircuits++; // 240V
    
    return {
      counterReceptacles,
      islandReceptacles,
      totalReceptacles: counterReceptacles + islandReceptacles,
      smallApplianceCircuits,
      dedicatedCircuits,
      gfciRequired
    };
  };

  const results = calculateKitchen();

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
            Counter Length (feet)
          </label>
          <input
            type="number"
            value={kitchenData.counterLength}
            onChange={(e) => setKitchenData(prev => ({...prev, counterLength: e.target.value}))}
            placeholder="Enter counter length"
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
            Island Length (feet) - Optional
          </label>
          <input
            type="number"
            value={kitchenData.islandLength}
            onChange={(e) => setKitchenData(prev => ({...prev, islandLength: e.target.value}))}
            placeholder="0"
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
            Required if island ≥ 24" long × 12" wide
          </div>
        </div>

        <div style={{ 
          background: colors.sectionBg, 
          padding: '1rem', 
          borderRadius: '8px',
          border: `1px solid ${colors.cardBorder}`
        }}>
          <div style={{ fontWeight: '600', marginBottom: '0.75rem', color: colors.cardText, fontSize: '0.875rem' }}>
            Dedicated Appliance Circuits:
          </div>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: colors.labelText, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={kitchenData.dishwasher}
                onChange={(e) => setKitchenData(prev => ({...prev, dishwasher: e.target.checked}))}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              Dishwasher (dedicated 15A/20A)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: colors.labelText, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={kitchenData.disposer}
                onChange={(e) => setKitchenData(prev => ({...prev, disposer: e.target.checked}))}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              Garbage Disposer (dedicated 15A/20A)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: colors.labelText, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={kitchenData.microwave}
                onChange={(e) => setKitchenData(prev => ({...prev, microwave: e.target.checked}))}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              Microwave (dedicated 20A)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: colors.labelText, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={kitchenData.range}
                onChange={(e) => setKitchenData(prev => ({...prev, range: e.target.checked}))}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              Range/Cooktop (240V, 40-50A)
            </label>
          </div>
        </div>
      </div>

      {results && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              background: '#dbeafe',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                Counter Receptacles
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                {results.counterReceptacles}
              </div>
            </div>

            {results.islandReceptacles > 0 && (
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  Island Receptacles
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {results.islandReceptacles}
                </div>
              </div>
            )}

            {results.islandReceptacles === 0 && (
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                  GFCI Required
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                  {results.gfciRequired}
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                Small Appliance Circuits
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                {results.smallApplianceCircuits}
              </div>
              <div style={{ fontSize: '0.65rem', color: colors.subtleText, marginTop: '0.25rem' }}>
                20A each
              </div>
            </div>

            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                Dedicated Circuits
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                {results.dedicatedCircuits}
              </div>
              <div style={{ fontSize: '0.65rem', color: colors.subtleText, marginTop: '0.25rem' }}>
                for appliances
              </div>
            </div>
          </div>

          <div style={{
            background: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <AlertCircle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: '1.5' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                  GFCI Protection Required
                </div>
                <div>All {results.gfciRequired} countertop receptacles require GFCI protection per NEC 210.8(A)</div>
              </div>
            </div>
          </div>

          <div style={{
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            border: `1px solid ${colors.cardBorder}`,
            fontSize: '0.875rem',
            color: colors.labelText
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: colors.cardText }}>
              Kitchen Requirements:
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>Min. 2 small appliance circuits (20A) for countertop receptacles</li>
              <li>Counter receptacles: One every 24 inches, all GFCI protected</li>
              <li>Island receptacles required if island ≥ 24" long × 12" wide</li>
              <li>Dishwasher, disposer typically need dedicated 15A or 20A circuits</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

const BathroomReceptaclesCalculator = ({ bathroomData, setBathroomData, colors }) => {
  const calculateBathroom = () => {
    // NEC 210.52(D): At least one receptacle within 3 feet of basin
    // NEC 210.11(C)(3): At least one 20A circuit for bathroom receptacles
    
    const numBasins = parseInt(bathroomData.numBasins) || 1;
    const hasTub = bathroomData.hasTub;
    
    // Minimum 1 receptacle per basin area, within 3 feet
    let receptacles = Math.max(1, numBasins);
    
    // Additional receptacle if room is large or has tub area
    if (hasTub) {
      receptacles = Math.max(receptacles, 2);
    }
    
    // 20A circuits: typically 1 circuit can serve one bathroom, or multiple bathrooms if only lighting and receptacles
    const dedicatedCircuits = bathroomData.sharedCircuit ? 1 : numBasins >= 2 ? 2 : 1;
    
    return {
      receptacles,
      dedicatedCircuits,
      gfciRequired: receptacles,
      numBasins
    };
  };

  const results = calculateBathroom();

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
            Number of Sinks/Basins
          </label>
          <select
            value={bathroomData.numBasins}
            onChange={(e) => setBathroomData(prev => ({...prev, numBasins: e.target.value}))}
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
            <option value="1">1 Basin</option>
            <option value="2">2 Basins (Double Vanity)</option>
            <option value="3">3+ Basins</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={bathroomData.hasTub}
              onChange={(e) => setBathroomData(prev => ({...prev, hasTub: e.target.checked}))}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            Has Bathtub/Shower Area
          </label>
        </div>

        <div>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={bathroomData.sharedCircuit}
              onChange={(e) => setBathroomData(prev => ({...prev, sharedCircuit: e.target.checked}))}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            Share circuit with other bathrooms
          </label>
          <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem', marginLeft: '1.625rem' }}>
            One 20A circuit can serve multiple bathrooms if only serving receptacles
          </div>
        </div>
      </div>

      {results && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{
              background: '#dbeafe',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                Receptacles Needed
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1e40af' }}>
                {results.receptacles}
              </div>
            </div>

            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
                20A Circuits
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
                {results.dedicatedCircuits}
              </div>
            </div>
          </div>

          <div style={{
            background: '#fef3c7',
            border: '1px solid #fbbf24',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <AlertCircle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: '1.5' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                  GFCI Protection Required
                </div>
                <div>All {results.gfciRequired} bathroom receptacles require GFCI protection per NEC 210.8(A)</div>
              </div>
            </div>
          </div>

          <div style={{
            background: '#d1fae5',
            border: '1px solid #6ee7b7',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <CheckCircle size={20} color="#059669" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.875rem', color: '#047857', lineHeight: '1.5' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
                  Installation Guidelines
                </div>
                <div>• At least one receptacle within 3 feet of each basin</div>
                <div>• Receptacles must be readily accessible (not behind toilet)</div>
                <div>• Install at least 12 inches above countertop</div>
              </div>
            </div>
          </div>

          <div style={{
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            border: `1px solid ${colors.cardBorder}`,
            fontSize: '0.875rem',
            color: colors.labelText
          }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: colors.cardText }}>
              NEC Bathroom Requirements:
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              <li>NEC 210.52(D): Min. 1 receptacle within 3 ft of basin</li>
              <li>NEC 210.11(C)(3): Min. 1 dedicated 20A circuit for bathroom receptacles</li>
              <li>NEC 210.8(A): All bathroom receptacles require GFCI protection</li>
              <li>One 20A circuit can serve receptacles in multiple bathrooms</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

const ReceptacleCalculator = forwardRef(({ isDarkMode = false, onBack }, ref) => {
  const [activeTab, setActiveTab] = useState('general');

  // Lifted state for all calculators
  const [generalData, setGeneralData] = useState({
    roomLength: '',
    roomWidth: '',
    hasCounters: false,
    counterLength: ''
  });

  const [kitchenData, setKitchenData] = useState({
    counterLength: '',
    islandLength: '',
    dishwasher: false,
    disposer: false,
    microwave: false,
    range: false
  });

  const [bathroomData, setBathroomData] = useState({
    numBasins: '1',
    hasTub: false,
    sharedCircuit: false
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

      if (activeTab === 'general') {
        if (!generalData.roomLength || !generalData.roomWidth) {
          alert('Please enter room dimensions before exporting');
          return;
        }

        const length = parseFloat(generalData.roomLength);
        const width = parseFloat(generalData.roomWidth);
        const perimeter = ((length + width) * 2).toFixed(1);
        const wallReceptacles = Math.max(2, Math.ceil(perimeter / 12));
        
        let counterReceptacles = 0;
        if (generalData.hasCounters && generalData.counterLength) {
          const counterLength = parseFloat(generalData.counterLength);
          counterReceptacles = Math.max(2, Math.ceil(counterLength / 2));
        }
        
        const totalReceptacles = wallReceptacles + counterReceptacles;
        const circuits15A = Math.ceil(totalReceptacles / 8);
        const circuits20A = Math.ceil(totalReceptacles / 10);

        const inputs = {
          roomLength: `${generalData.roomLength} feet`,
          roomWidth: `${generalData.roomWidth} feet`,
          roomPerimeter: `${perimeter} feet`
        };

        if (generalData.hasCounters && generalData.counterLength) {
          inputs.counterLength = `${generalData.counterLength} feet`;
        }

        const results = {
          wallReceptacles: `${wallReceptacles} receptacles`,
          totalReceptacles: `${totalReceptacles} receptacles`,
          circuits15A: `${circuits15A} circuits (15A)`,
          circuits20A: `${circuits20A} circuits (20A)`
        };

        if (counterReceptacles > 0) {
          results.counterReceptacles = `${counterReceptacles} receptacles`;
        }

        pdfData = {
          calculatorName: 'Receptacle Calculator - General Room',
          inputs,
          results,
          additionalInfo: {
            spacing: 'One receptacle every 12 feet of wall space',
            rule: 'No point along wall more than 6 feet from receptacle',
            counterRule: counterReceptacles > 0 ? 'Counter receptacles: one every 24 inches' : null
          },
          necReferences: [
            'NEC 210.52(A) - General Provisions',
            'Receptacle within 6 ft of doorway, then every 12 ft',
            'No point along wall more than 6 ft from receptacle',
            'Conservative: 8 receptacles per 15A circuit, 10 per 20A circuit'
          ]
        };

      } else if (activeTab === 'kitchen') {
        if (!kitchenData.counterLength) {
          alert('Please enter counter length before exporting');
          return;
        }

        const counterLength = parseFloat(kitchenData.counterLength);
        const islandLength = parseFloat(kitchenData.islandLength) || 0;
        
        const counterReceptacles = Math.max(2, Math.ceil(counterLength / 2));
        const islandReceptacles = islandLength >= 2 ? Math.max(1, Math.ceil(islandLength / 4)) : 0;
        const totalReceptacles = counterReceptacles + islandReceptacles;
        const smallApplianceCircuits = 2;
        const gfciRequired = totalReceptacles;
        
        let dedicatedCircuits = 0;
        const appliances = [];
        if (kitchenData.dishwasher) {
          dedicatedCircuits++;
          appliances.push('Dishwasher (15A/20A)');
        }
        if (kitchenData.disposer) {
          dedicatedCircuits++;
          appliances.push('Garbage Disposer (15A/20A)');
        }
        if (kitchenData.microwave) {
          dedicatedCircuits++;
          appliances.push('Microwave (20A)');
        }
        if (kitchenData.range) {
          dedicatedCircuits++;
          appliances.push('Range/Cooktop (240V, 40-50A)');
        }

        const inputs = {
          counterLength: `${kitchenData.counterLength} feet`
        };

        if (islandLength > 0) {
          inputs.islandLength = `${kitchenData.islandLength} feet`;
        }

        if (appliances.length > 0) {
          inputs.dedicatedAppliances = appliances.join(', ');
        }

        const results = {
          counterReceptacles: `${counterReceptacles} receptacles`,
          totalReceptacles: `${totalReceptacles} receptacles`,
          smallApplianceCircuits: `${smallApplianceCircuits} circuits (20A each)`,
          gfciRequired: `${gfciRequired} GFCI-protected receptacles`
        };

        if (islandReceptacles > 0) {
          results.islandReceptacles = `${islandReceptacles} receptacles`;
        }

        if (dedicatedCircuits > 0) {
          results.dedicatedCircuits = `${dedicatedCircuits} dedicated circuits`;
        }

        pdfData = {
          calculatorName: 'Receptacle Calculator - Kitchen',
          inputs,
          results,
          additionalInfo: {
            counterSpacing: 'One receptacle every 24 inches of counter space',
            islandRequirement: 'Island receptacles required if island ≥ 24" long × 12" wide',
            gfciNote: 'All countertop receptacles require GFCI protection'
          },
          necReferences: [
            'NEC 210.52(C) - Countertops',
            'NEC 210.11(C)(1) - Min. 2 small appliance circuits (20A)',
            'NEC 210.8(A) - GFCI protection required for all countertop receptacles',
            'Island receptacles required if ≥ 24" long × 12" wide'
          ]
        };

      } else if (activeTab === 'bathroom') {
        const numBasins = parseInt(bathroomData.numBasins) || 1;
        const hasTub = bathroomData.hasTub;
        
        let receptacles = Math.max(1, numBasins);
        if (hasTub) {
          receptacles = Math.max(receptacles, 2);
        }
        
        const dedicatedCircuits = bathroomData.sharedCircuit ? 1 : numBasins >= 2 ? 2 : 1;
        const gfciRequired = receptacles;

        const basinText = numBasins === 1 ? '1 Basin' : numBasins === 2 ? '2 Basins (Double Vanity)' : '3+ Basins';

        const inputs = {
          numberOfBasins: basinText,
          hasTubShower: hasTub ? 'Yes' : 'No',
          sharedCircuit: bathroomData.sharedCircuit ? 'Yes (shared with other bathrooms)' : 'No (dedicated)'
        };

        const results = {
          receptaclesNeeded: `${receptacles} receptacles`,
          dedicatedCircuits: `${dedicatedCircuits} circuits (20A)`,
          gfciRequired: `${gfciRequired} GFCI-protected receptacles`
        };

        pdfData = {
          calculatorName: 'Receptacle Calculator - Bathroom',
          inputs,
          results,
          additionalInfo: {
            spacing: 'At least one receptacle within 3 feet of each basin',
            installation: 'Install at least 12 inches above countertop',
            accessibility: 'Receptacles must be readily accessible (not behind toilet)',
            gfciNote: 'All bathroom receptacles require GFCI protection'
          },
          necReferences: [
            'NEC 210.52(D) - Min. 1 receptacle within 3 ft of basin',
            'NEC 210.11(C)(3) - Min. 1 dedicated 20A circuit for bathroom receptacles',
            'NEC 210.8(A) - All bathroom receptacles require GFCI protection',
            'One 20A circuit can serve receptacles in multiple bathrooms'
          ]
        };
      }

      exportToPDF(pdfData);
    }
  }));

  const tabComponents = {
    general: <GeneralReceptaclesCalculator generalData={generalData} setGeneralData={setGeneralData} colors={colors} />,
    kitchen: <KitchenReceptaclesCalculator kitchenData={kitchenData} setKitchenData={setKitchenData} colors={colors} />,
    bathroom: <BathroomReceptaclesCalculator bathroomData={bathroomData} setBathroomData={setBathroomData} colors={colors} />
  };

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
          { id: 'general', label: 'General Room' },
          { id: 'kitchen', label: 'Kitchen' },
          { id: 'bathroom', label: 'Bathroom' }
        ].map(tab => (
          <button 
            className={styles.btn}
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: '1 1 auto',
              minWidth: '100px',
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
});

export default ReceptacleCalculator;