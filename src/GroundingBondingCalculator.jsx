import React, { useState } from 'react';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

function GroundingBondingCalculator({ onBack }) {
  const [activeTab, setActiveTab] = useState('gec');

  // Grounding Electrode Conductor Calculator
  const GECCalculator = () => {
    const [serviceSize, setServiceSize] = useState('');
    const [conductorMaterial, setConductorMaterial] = useState('copper');

    // NEC Table 250.66 - Grounding Electrode Conductor for AC Systems
    const gecTable = {
      copper: {
        '2 or smaller': '8',
        '1 or 1/0': '6',
        '2/0 or 3/0': '4',
        '4/0 to 350': '2',
        '400 to 600': '1/0',
        '650 to 1100': '2/0',
        'over 1100': '3/0'
      },
      aluminum: {
        '2 or smaller': '6',
        '1 or 1/0': '4',
        '2/0 or 3/0': '2',
        '4/0 to 350': '1/0',
        '400 to 600': '3/0',
        '650 to 1100': '4/0',
        'over 1100': '250'
      }
    };

    const determineGEC = () => {
      if (!serviceSize) return null;

      const size = serviceSize;
      let category = '';

      // Determine which category the service conductor falls into
      const awgSizes = ['14', '12', '10', '8', '6', '4', '3', '2', '1'];
      const oughtSizes = ['1/0', '2/0', '3/0', '4/0'];
      const kcmilValue = parseInt(size);

      if (awgSizes.includes(size)) {
        const sizeNum = parseInt(size);
        if (sizeNum >= 2) category = '2 or smaller';
        else if (size === '1') category = '1 or 1/0';
      } else if (oughtSizes.includes(size)) {
        if (size === '1/0') category = '1 or 1/0';
        else if (size === '2/0' || size === '3/0') category = '2/0 or 3/0';
        else if (size === '4/0') category = '4/0 to 350';
      } else if (!isNaN(kcmilValue)) {
        if (kcmilValue >= 250 && kcmilValue <= 350) category = '4/0 to 350';
        else if (kcmilValue >= 400 && kcmilValue <= 600) category = '400 to 600';
        else if (kcmilValue >= 650 && kcmilValue <= 1100) category = '650 to 1100';
        else if (kcmilValue > 1100) category = 'over 1100';
      }

      const gecSize = gecTable[conductorMaterial][category];

      return {
        serviceSize: size,
        category,
        gecSize: gecSize || 'N/A'
      };
    };

    const results = determineGEC();

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Service Conductor Size
            </label>
            <select 
              value={serviceSize} 
              onChange={(e) => setServiceSize(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            >
              <option value="">Select Size</option>
              <option value="8">8 AWG</option>
              <option value="6">6 AWG</option>
              <option value="4">4 AWG</option>
              <option value="3">3 AWG</option>
              <option value="2">2 AWG</option>
              <option value="1">1 AWG</option>
              <option value="1/0">1/0 AWG</option>
              <option value="2/0">2/0 AWG</option>
              <option value="3/0">3/0 AWG</option>
              <option value="4/0">4/0 AWG</option>
              <option value="250">250 kcmil</option>
              <option value="300">300 kcmil</option>
              <option value="350">350 kcmil</option>
              <option value="400">400 kcmil</option>
              <option value="500">500 kcmil</option>
              <option value="600">600 kcmil</option>
              <option value="750">750 kcmil</option>
              <option value="1000">1000 kcmil</option>
              <option value="1250">1250 kcmil</option>
              <option value="1500">1500 kcmil</option>
            </select>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Largest ungrounded service conductor</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              GEC Material
            </label>
            <select 
              value={conductorMaterial} 
              onChange={(e) => setConductorMaterial(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            >
              <option value="copper">Copper</option>
              <option value="aluminum">Aluminum</option>
            </select>
          </div>
        </div>

        {results && results.gecSize !== 'N/A' && (
          <div style={{ 
            background: '#dcfce7', 
            border: '2px solid #16a34a', 
            padding: '1.5rem', 
            borderRadius: '0.5rem'
          }}>
            <h3 style={{ fontWeight: 'bold', color: '#166534', marginTop: 0, marginBottom: '1rem' }}>
              Results
            </h3>
            
            <div style={{ color: '#14532d', marginBottom: '0.75rem' }}>
              <strong>Service Conductor:</strong> {results.serviceSize} {conductorMaterial}
            </div>
            
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#16a34a',
              marginBottom: '1rem',
              padding: '1rem',
              background: 'white',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              {results.gecSize} AWG {conductorMaterial}
            </div>
            
            <div style={{ 
              color: '#14532d',
              paddingTop: '1rem',
              borderTop: '1px solid #bbf7d0'
            }}>
              <strong>Grounding Electrode Conductor Size</strong>
              <div style={{ marginTop: '0.5rem', color: '#15803d', fontSize: '0.875rem' }}>
                Per NEC Table 250.66
              </div>
            </div>
          </div>
        )}

        <div style={{ 
          background: '#f8fafc',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
          marginTop: '1.5rem'
        }}>
          <strong style={{ color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Important Notes:</strong>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
            <li style={{ marginBottom: '0.25rem' }}>GEC connected to rod, pipe, or plate electrodes need not be larger than 6 AWG copper or 4 AWG aluminum</li>
            <li style={{ marginBottom: '0.25rem' }}>GEC connected to concrete-encased electrode need not be larger than 4 AWG copper</li>
            <li style={{ marginBottom: '0.25rem' }}>Where multiple service conductors run in parallel, use the equivalent area for one conductor</li>
            <li>GEC must be continuous without splices except as permitted in 250.64(C)</li>
          </ul>
        </div>
      </div>
    );
  };

  // Equipment Grounding Conductor Calculator
  const EGCCalculator = () => {
    const [ocpdRating, setOcpdRating] = useState('');
    const [conductorMaterial, setConductorMaterial] = useState('copper');

    // NEC Table 250.122 - Minimum Size Equipment Grounding Conductors
    const egcTable = {
      copper: {
        15: '14', 20: '12', 30: '10', 40: '10', 60: '10',
        100: '8', 200: '6', 300: '4', 400: '3', 500: '2',
        600: '1', 800: '1/0', 1000: '2/0', 1200: '3/0',
        1600: '4/0', 2000: '250', 2500: '350', 3000: '400',
        4000: '500', 5000: '700', 6000: '800'
      },
      aluminum: {
        15: '12', 20: '10', 30: '8', 40: '8', 60: '8',
        100: '6', 200: '4', 300: '2', 400: '1', 500: '1/0',
        600: '2/0', 800: '3/0', 1000: '4/0', 1200: '250',
        1600: '350', 2000: '400', 2500: '500', 3000: '600',
        4000: '750', 5000: '1000', 6000: '1200'
      }
    };

    const determineEGC = () => {
      const rating = parseInt(ocpdRating);
      if (!rating) return null;

      // Find the appropriate EGC size based on OCPD rating
      const ratings = Object.keys(egcTable[conductorMaterial]).map(Number).sort((a, b) => a - b);
      const applicableRating = ratings.find(r => r >= rating) || ratings[ratings.length - 1];
      
      const egcSize = egcTable[conductorMaterial][applicableRating];

      return {
        ocpdRating: rating,
        applicableRating,
        egcSize
      };
    };

    const results = determineEGC();

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Overcurrent Device Rating (Amps)
            </label>
            <input 
              type="number" 
              value={ocpdRating} 
              onChange={(e) => setOcpdRating(e.target.value)}
              placeholder="Enter breaker/fuse rating"
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            />
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Circuit breaker or fuse rating</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              EGC Material
            </label>
            <select 
              value={conductorMaterial} 
              onChange={(e) => setConductorMaterial(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            >
              <option value="copper">Copper</option>
              <option value="aluminum">Aluminum</option>
            </select>
          </div>
        </div>

        {results && (
          <div style={{ 
            background: '#dcfce7', 
            border: '2px solid #16a34a', 
            padding: '1.5rem', 
            borderRadius: '0.5rem'
          }}>
            <h3 style={{ fontWeight: 'bold', color: '#166534', marginTop: 0, marginBottom: '1rem' }}>
              Results
            </h3>
            
            <div style={{ color: '#14532d', marginBottom: '0.75rem' }}>
              <strong>OCPD Rating:</strong> {results.ocpdRating}A
            </div>
            
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#16a34a',
              marginBottom: '1rem',
              padding: '1rem',
              background: 'white',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              {results.egcSize} AWG {conductorMaterial}
            </div>
            
            <div style={{ 
              color: '#14532d',
              paddingTop: '1rem',
              borderTop: '1px solid #bbf7d0'
            }}>
              <strong>Equipment Grounding Conductor Size</strong>
              <div style={{ marginTop: '0.5rem', color: '#15803d', fontSize: '0.875rem' }}>
                Per NEC Table 250.122
              </div>
            </div>
          </div>
        )}

        <div style={{ 
          background: '#f8fafc',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
          marginTop: '1.5rem'
        }}>
          <strong style={{ color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Important Notes:</strong>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
            <li style={{ marginBottom: '0.25rem' }}>Where circuit conductors are adjusted for voltage drop, the EGC must be proportionally increased</li>
            <li style={{ marginBottom: '0.25rem' }}>Where ungrounded conductors are run in parallel, the EGC must be run in parallel and sized per each raceway</li>
            <li style={{ marginBottom: '0.25rem' }}>EGC sizes are based on the rating of the OCPD ahead of the circuit</li>
            <li>A single EGC can serve multiple circuits in the same raceway</li>
          </ul>
        </div>
      </div>
    );
  };

  // Main/System Bonding Jumper Calculator
  const BondingJumperCalculator = () => {
    const [serviceSize, setServiceSize] = useState('');
    const [conductorMaterial, setConductorMaterial] = useState('copper');
    const [jumperType, setJumperType] = useState('main');

    // Same table as GEC (NEC 250.28 references 250.66)
    const bondingTable = {
      copper: {
        '2 or smaller': '8',
        '1 or 1/0': '6',
        '2/0 or 3/0': '4',
        '4/0 to 350': '2',
        '400 to 600': '1/0',
        '650 to 1100': '2/0',
        'over 1100': '3/0'
      },
      aluminum: {
        '2 or smaller': '6',
        '1 or 1/0': '4',
        '2/0 or 3/0': '2',
        '4/0 to 350': '1/0',
        '400 to 600': '3/0',
        '650 to 1100': '4/0',
        'over 1100': '250'
      }
    };

    const determineBondingJumper = () => {
      if (!serviceSize) return null;

      const size = serviceSize;
      let category = '';

      const awgSizes = ['14', '12', '10', '8', '6', '4', '3', '2', '1'];
      const oughtSizes = ['1/0', '2/0', '3/0', '4/0'];
      const kcmilValue = parseInt(size);

      if (awgSizes.includes(size)) {
        const sizeNum = parseInt(size);
        if (sizeNum >= 2) category = '2 or smaller';
        else if (size === '1') category = '1 or 1/0';
      } else if (oughtSizes.includes(size)) {
        if (size === '1/0') category = '1 or 1/0';
        else if (size === '2/0' || size === '3/0') category = '2/0 or 3/0';
        else if (size === '4/0') category = '4/0 to 350';
      } else if (!isNaN(kcmilValue)) {
        if (kcmilValue >= 250 && kcmilValue <= 350) category = '4/0 to 350';
        else if (kcmilValue >= 400 && kcmilValue <= 600) category = '400 to 600';
        else if (kcmilValue >= 650 && kcmilValue <= 1100) category = '650 to 1100';
        else if (kcmilValue > 1100) category = 'over 1100';
      }

      const jumperSize = bondingTable[conductorMaterial][category];

      return {
        serviceSize: size,
        category,
        jumperSize: jumperSize || 'N/A',
        jumperType
      };
    };

    const results = determineBondingJumper();

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Bonding Jumper Type
            </label>
            <select 
              value={jumperType} 
              onChange={(e) => setJumperType(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            >
              <option value="main">Main Bonding Jumper (Service)</option>
              <option value="system">System Bonding Jumper (Separately Derived System)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Service/Derived Conductor Size
            </label>
            <select 
              value={serviceSize} 
              onChange={(e) => setServiceSize(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            >
              <option value="">Select Size</option>
              <option value="8">8 AWG</option>
              <option value="6">6 AWG</option>
              <option value="4">4 AWG</option>
              <option value="3">3 AWG</option>
              <option value="2">2 AWG</option>
              <option value="1">1 AWG</option>
              <option value="1/0">1/0 AWG</option>
              <option value="2/0">2/0 AWG</option>
              <option value="3/0">3/0 AWG</option>
              <option value="4/0">4/0 AWG</option>
              <option value="250">250 kcmil</option>
              <option value="300">300 kcmil</option>
              <option value="350">350 kcmil</option>
              <option value="400">400 kcmil</option>
              <option value="500">500 kcmil</option>
              <option value="600">600 kcmil</option>
              <option value="750">750 kcmil</option>
              <option value="1000">1000 kcmil</option>
              <option value="1250">1250 kcmil</option>
              <option value="1500">1500 kcmil</option>
            </select>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '0.25rem' }}>Largest ungrounded conductor</div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Jumper Material
            </label>
            <select 
              value={conductorMaterial} 
              onChange={(e) => setConductorMaterial(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            >
              <option value="copper">Copper</option>
              <option value="aluminum">Aluminum</option>
            </select>
          </div>
        </div>

        {results && results.jumperSize !== 'N/A' && (
          <div style={{ 
            background: '#dcfce7', 
            border: '2px solid #16a34a', 
            padding: '1.5rem', 
            borderRadius: '0.5rem'
          }}>
            <h3 style={{ fontWeight: 'bold', color: '#166534', marginTop: 0, marginBottom: '1rem' }}>
              Results
            </h3>
            
            <div style={{ color: '#14532d', marginBottom: '0.75rem' }}>
              <strong>Conductor Size:</strong> {results.serviceSize} {conductorMaterial}
            </div>
            
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#16a34a',
              marginBottom: '1rem',
              padding: '1rem',
              background: 'white',
              borderRadius: '0.5rem',
              textAlign: 'center'
            }}>
              {results.jumperSize} AWG {conductorMaterial}
            </div>
            
            <div style={{ 
              color: '#14532d',
              paddingTop: '1rem',
              borderTop: '1px solid #bbf7d0'
            }}>
              <strong>{jumperType === 'main' ? 'Main' : 'System'} Bonding Jumper Size</strong>
              <div style={{ marginTop: '0.5rem', color: '#15803d', fontSize: '0.875rem' }}>
                Per NEC {jumperType === 'main' ? '250.28(D)' : '250.30(A)(1)'}
              </div>
            </div>
          </div>
        )}

        <div style={{ 
          background: '#f8fafc',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0',
          marginTop: '1.5rem'
        }}>
          <strong style={{ color: '#374151', display: 'block', marginBottom: '0.5rem' }}>
            {jumperType === 'main' ? 'Main Bonding Jumper' : 'System Bonding Jumper'} Requirements:
          </strong>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#6b7280', fontSize: '0.875rem' }}>
            {jumperType === 'main' ? (
              <>
                <li style={{ marginBottom: '0.25rem' }}>Connects grounded conductor to equipment grounding conductor and service enclosure</li>
                <li style={{ marginBottom: '0.25rem' }}>Must be copper, aluminum, or copper-clad aluminum</li>
                <li style={{ marginBottom: '0.25rem' }}>Sized per Table 250.66 based on service conductor size</li>
                <li>Can be a wire, bus, screw, or similar conductor</li>
              </>
            ) : (
              <>
                <li style={{ marginBottom: '0.25rem' }}>Required for separately derived systems (transformers, generators)</li>
                <li style={{ marginBottom: '0.25rem' }}>Connects grounded conductor to equipment grounding conductor at source</li>
                <li style={{ marginBottom: '0.25rem' }}>Sized per Table 250.66 based on derived phase conductors</li>
                <li>Must be installed at the same location as grounding electrode conductor connection</li>
              </>
            )}
          </ul>
        </div>
      </div>
    );
  };

  const tabComponents = {
    gec: <GECCalculator />,
    egc: <EGCCalculator />,
    bonding: <BondingJumperCalculator />
  };

  return (
    <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
      {onBack && (
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.5rem',
            marginBottom: '1rem',
            background: '#374151',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          <ArrowLeft size={20} />
          Back to Menu
        </button>
      )}

      <div style={{ background: '#fbbf24', color: 'black', padding: '1.5rem', borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AlertTriangle size={32} />
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Grounding & Bonding</h1>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>NEC Article 250 - Grounding and Bonding Conductor Sizing</p>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '1.5rem' }}>
        {/* Tab Navigation */}
        <div style={{ 
          display: 'flex', 
          gap: '0.5rem', 
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <button 
            onClick={() => setActiveTab('gec')}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === 'gec' ? '#3b82f6' : '#e5e7eb',
              color: activeTab === 'gec' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Grounding Electrode
          </button>
          <button 
            onClick={() => setActiveTab('egc')}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === 'egc' ? '#3b82f6' : '#e5e7eb',
              color: activeTab === 'egc' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Equipment Grounding
          </button>
          <button 
            onClick={() => setActiveTab('bonding')}
            style={{
              padding: '0.75rem 1.25rem',
              background: activeTab === 'bonding' ? '#3b82f6' : '#e5e7eb',
              color: activeTab === 'bonding' ? 'white' : '#374151',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            Bonding Jumpers
          </button>
        </div>

        {/* Active Tab Content */}
        {tabComponents[activeTab]}
      </div>

      <div style={{ background: '#1e293b', color: '#cbd5e1', padding: '1.5rem', borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem', fontSize: '0.875rem' }}>
        <p style={{ fontWeight: '600', marginTop: 0, marginBottom: '0.75rem' }}>NEC References:</p>
        <ul style={{ paddingLeft: '1.5rem', margin: 0 }}>
          <li style={{ marginBottom: '0.25rem' }}>250.66 - Grounding Electrode Conductor sizing table</li>
          <li style={{ marginBottom: '0.25rem' }}>250.122 - Equipment Grounding Conductor sizing table</li>
          <li style={{ marginBottom: '0.25rem' }}>250.28 - Main Bonding Jumper and System Bonding Jumper</li>
          <li style={{ marginBottom: '0.25rem' }}>250.30 - Grounding Separately Derived Alternating-Current Systems</li>
          <li>250.102 - Bonding conductors and jumpers</li>
        </ul>
      </div>
    </div>
  );
}

export default GroundingBondingCalculator;