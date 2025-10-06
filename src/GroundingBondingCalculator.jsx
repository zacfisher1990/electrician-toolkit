import React, { useState } from 'react';
import { Shield, CheckCircle, Info } from 'lucide-react';

function GroundingBondingCalculator({ isDarkMode = false, onBack }) {
  const [activeTab, setActiveTab] = useState('gec');

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

  // Grounding Electrode Conductor Calculator
  const GECCalculator = () => {
    const [serviceSize, setServiceSize] = useState('');
    const [conductorMaterial, setConductorMaterial] = useState('copper');

    const gecTable = {
      copper: {
        '2 or smaller': '8', '1 or 1/0': '6', '2/0 or 3/0': '4',
        '4/0 to 350': '2', '400 to 600': '1/0', '650 to 1100': '2/0', 'over 1100': '3/0'
      },
      aluminum: {
        '2 or smaller': '6', '1 or 1/0': '4', '2/0 or 3/0': '2',
        '4/0 to 350': '1/0', '400 to 600': '3/0', '650 to 1100': '4/0', 'over 1100': '250'
      }
    };

    const determineGEC = () => {
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

      return {
        serviceSize: size,
        category,
        gecSize: gecTable[conductorMaterial][category] || 'N/A'
      };
    };

    const results = determineGEC();

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Service Conductor Size
            </label>
            <select 
              value={serviceSize} 
              onChange={(e) => setServiceSize(e.target.value)}
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
              <option value="">Select Size</option>
              <option value="8">8 AWG</option>
              <option value="6">6 AWG</option>
              <option value="4">4 AWG</option>
              <option value="2">2 AWG</option>
              <option value="1">1 AWG</option>
              <option value="1/0">1/0 AWG</option>
              <option value="2/0">2/0 AWG</option>
              <option value="3/0">3/0 AWG</option>
              <option value="4/0">4/0 AWG</option>
              <option value="250">250 kcmil</option>
              <option value="350">350 kcmil</option>
              <option value="500">500 kcmil</option>
              <option value="750">750 kcmil</option>
              <option value="1000">1000 kcmil</option>
              <option value="1500">1500 kcmil</option>
            </select>
            <div style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem' }}>
              Largest ungrounded service conductor
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              GEC Material
            </label>
            <select 
              value={conductorMaterial} 
              onChange={(e) => setConductorMaterial(e.target.value)}
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
              <option value="copper">Copper</option>
              <option value="aluminum">Aluminum</option>
            </select>
          </div>
        </div>

        {results && results.gecSize !== 'N/A' && (
          <>
            <div style={{
              background: '#dbeafe',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                Grounding Electrode Conductor
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e40af' }}>
                {results.gecSize} AWG
              </div>
              <div style={{ fontSize: '0.875rem', color: '#1e40af', marginTop: '0.25rem' }}>
                {conductorMaterial.charAt(0).toUpperCase() + conductorMaterial.slice(1)}
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
                    Per NEC Table 250.66
                  </div>
                  <div>Service conductor: {results.serviceSize} AWG {conductorMaterial}</div>
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
                Important Notes:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>GEC to rod/pipe/plate need not be larger than 6 AWG copper</li>
                <li>GEC to concrete-encased electrode need not be larger than 4 AWG copper</li>
                <li>Must be continuous without splices (except as permitted)</li>
              </ul>
            </div>
          </>
        )}
      </div>
    );
  };

  // Equipment Grounding Conductor Calculator
  const EGCCalculator = () => {
    const [ocpdRating, setOcpdRating] = useState('');
    const [conductorMaterial, setConductorMaterial] = useState('copper');

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

      const ratings = Object.keys(egcTable[conductorMaterial]).map(Number).sort((a, b) => a - b);
      const applicableRating = ratings.find(r => r >= rating) || ratings[ratings.length - 1];
      
      return {
        ocpdRating: rating,
        applicableRating,
        egcSize: egcTable[conductorMaterial][applicableRating]
      };
    };

    const results = determineEGC();

    return (
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Overcurrent Device Rating (A)
            </label>
            <input 
              type="number" 
              value={ocpdRating} 
              onChange={(e) => setOcpdRating(e.target.value)}
              placeholder="Enter rating"
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
              Circuit breaker or fuse rating
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              EGC Material
            </label>
            <select 
              value={conductorMaterial} 
              onChange={(e) => setConductorMaterial(e.target.value)}
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
              <option value="copper">Copper</option>
              <option value="aluminum">Aluminum</option>
            </select>
          </div>
        </div>

        {results && (
          <>
            <div style={{
              background: '#dbeafe',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                Equipment Grounding Conductor
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e40af' }}>
                {results.egcSize} AWG
              </div>
              <div style={{ fontSize: '0.875rem', color: '#1e40af', marginTop: '0.25rem' }}>
                {conductorMaterial.charAt(0).toUpperCase() + conductorMaterial.slice(1)}
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
                    Per NEC Table 250.122
                  </div>
                  <div>OCPD rating: {results.ocpdRating}A</div>
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
                Important Notes:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                <li>Increase proportionally if conductors upsized for voltage drop</li>
                <li>Size per each raceway if conductors run in parallel</li>
                <li>Based on rating of OCPD ahead of circuit</li>
              </ul>
            </div>
          </>
        )}
      </div>
    );
  };

  // Bonding Jumper Calculator (combining main and system)
  const BondingJumperCalculator = () => {
    const [serviceSize, setServiceSize] = useState('');
    const [conductorMaterial, setConductorMaterial] = useState('copper');
    const [jumperType, setJumperType] = useState('main');

    const bondingTable = {
      copper: {
        '2 or smaller': '8', '1 or 1/0': '6', '2/0 or 3/0': '4',
        '4/0 to 350': '2', '400 to 600': '1/0', '650 to 1100': '2/0', 'over 1100': '3/0'
      },
      aluminum: {
        '2 or smaller': '6', '1 or 1/0': '4', '2/0 or 3/0': '2',
        '4/0 to 350': '1/0', '400 to 600': '3/0', '650 to 1100': '4/0', 'over 1100': '250'
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

      return {
        serviceSize: size,
        jumperSize: bondingTable[conductorMaterial][category] || 'N/A',
        jumperType
      };
    };

    const results = determineBondingJumper();

    return (
      <div>
        <div style={{ display: 'grid', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
              Bonding Jumper Type
            </label>
            <select 
              value={jumperType} 
              onChange={(e) => setJumperType(e.target.value)}
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
              <option value="main">Main Bonding Jumper (Service)</option>
              <option value="system">System Bonding Jumper (Separately Derived)</option>
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
                Conductor Size
              </label>
              <select 
                value={serviceSize} 
                onChange={(e) => setServiceSize(e.target.value)}
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
                <option value="">Select Size</option>
                <option value="8">8 AWG</option>
                <option value="6">6 AWG</option>
                <option value="4">4 AWG</option>
                <option value="2">2 AWG</option>
                <option value="1">1 AWG</option>
                <option value="1/0">1/0 AWG</option>
                <option value="2/0">2/0 AWG</option>
                <option value="3/0">3/0 AWG</option>
                <option value="4/0">4/0 AWG</option>
                <option value="250">250 kcmil</option>
                <option value="500">500 kcmil</option>
                <option value="750">750 kcmil</option>
                <option value="1000">1000 kcmil</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: colors.labelText, marginBottom: '0.5rem' }}>
                Material
              </label>
              <select 
                value={conductorMaterial} 
                onChange={(e) => setConductorMaterial(e.target.value)}
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
                <option value="copper">Copper</option>
                <option value="aluminum">Aluminum</option>
              </select>
            </div>
          </div>
        </div>

        {results && results.jumperSize !== 'N/A' && (
          <>
            <div style={{
              background: '#dbeafe',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.25rem' }}>
                {jumperType === 'main' ? 'Main' : 'System'} Bonding Jumper
              </div>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e40af' }}>
                {results.jumperSize} AWG
              </div>
              <div style={{ fontSize: '0.875rem', color: '#1e40af', marginTop: '0.25rem' }}>
                {conductorMaterial.charAt(0).toUpperCase() + conductorMaterial.slice(1)}
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
                    Per NEC {jumperType === 'main' ? '250.28(D)' : '250.30(A)(1)'}
                  </div>
                  <div>Conductor size: {results.serviceSize} AWG {conductorMaterial}</div>
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
                {jumperType === 'main' ? 'Main' : 'System'} Bonding Jumper Requirements:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {jumperType === 'main' ? (
                  <>
                    <li>Connects grounded conductor to equipment grounding conductor</li>
                    <li>Sized per Table 250.66 based on service conductor</li>
                    <li>Can be wire, bus, screw, or similar conductor</li>
                  </>
                ) : (
                  <>
                    <li>Required for separately derived systems</li>
                    <li>Connects grounded to equipment grounding conductor</li>
                    <li>Installed at same location as GEC connection</li>
                  </>
                )}
              </ul>
            </div>
          </>
        )}
      </div>
    );
  };

  const tabComponents = {
    gec: <GECCalculator />,
    egc: <EGCCalculator />,
    bonding: <BondingJumperCalculator />
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
          <Shield size={24} color="#3b82f6" />
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: colors.cardText,
            margin: 0 
          }}>
            Grounding & Bonding
          </h2>
        </div>
        <p style={{ 
          fontSize: '0.875rem', 
          color: colors.labelText,
          margin: 0 
        }}>
          NEC Article 250
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
          { id: 'gec', label: 'Grounding Electrode' },
          { id: 'egc', label: 'Equipment Grounding' },
          { id: 'bonding', label: 'Bonding Jumpers' }
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

export default GroundingBondingCalculator;