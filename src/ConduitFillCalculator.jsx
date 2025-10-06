import React, { useState } from 'react';
import { Wrench, Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';

function ConduitFillCalculator({ isDarkMode = false, onBack }) {
  const [conduitType, setConduitType] = useState('emt-0.5');
  const [wireType, setWireType] = useState('thwn');
  const [conductors, setConductors] = useState([
    { size: '12', count: '' }
  ]);

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

  const conduitData = {
    // EMT Conduit
    'emt-0.5': { name: '1/2" EMT', area: 0.304 },
    'emt-0.75': { name: '3/4" EMT', area: 0.533 },
    'emt-1': { name: '1" EMT', area: 0.864 },
    'emt-1.25': { name: '1-1/4" EMT', area: 1.496 },
    'emt-1.5': { name: '1-1/2" EMT', area: 2.036 },
    'emt-2': { name: '2" EMT', area: 3.356 },
    'emt-2.5': { name: '2-1/2" EMT', area: 5.858 },
    'emt-3': { name: '3" EMT', area: 8.846 },
    'emt-4': { name: '4" EMT', area: 14.753 },
    
    // PVC Schedule 40
    'pvc-0.5': { name: '1/2" PVC Sch 40', area: 0.285 },
    'pvc-0.75': { name: '3/4" PVC Sch 40', area: 0.508 },
    'pvc-1': { name: '1" PVC Sch 40', area: 0.832 },
    'pvc-1.25': { name: '1-1/4" PVC Sch 40', area: 1.429 },
    'pvc-1.5': { name: '1-1/2" PVC Sch 40', area: 1.986 },
    'pvc-2': { name: '2" PVC Sch 40', area: 3.291 },
    'pvc-2.5': { name: '2-1/2" PVC Sch 40', area: 5.793 },
    'pvc-3': { name: '3" PVC Sch 40', area: 8.688 },
    'pvc-4': { name: '4" PVC Sch 40', area: 14.314 },
    
    // Rigid Steel Conduit
    'rigid-0.5': { name: '1/2" Rigid Steel', area: 0.220 },
    'rigid-0.75': { name: '3/4" Rigid Steel', area: 0.409 },
    'rigid-1': { name: '1" Rigid Steel', area: 0.688 },
    'rigid-1.25': { name: '1-1/4" Rigid Steel', area: 1.175 },
    'rigid-1.5': { name: '1-1/2" Rigid Steel', area: 1.610 },
    'rigid-2': { name: '2" Rigid Steel', area: 2.647 },
    'rigid-2.5': { name: '2-1/2" Rigid Steel', area: 4.618 },
    'rigid-3': { name: '3" Rigid Steel', area: 6.922 },
    'rigid-4': { name: '4" Rigid Steel', area: 11.545 }
  };

  const wireData = {
    'thwn': {
      '14': 0.0097, '12': 0.0133, '10': 0.0211, '8': 0.0366, '6': 0.0507,
      '4': 0.0824, '3': 0.0973, '2': 0.1158, '1': 0.1562, '1/0': 0.1855,
      '2/0': 0.2223, '3/0': 0.2679, '4/0': 0.3237, '250': 0.3970,
      '300': 0.4608, '350': 0.5242, '400': 0.5863, '500': 0.7073
    },
    'xhhw': {
      '14': 0.0097, '12': 0.0133, '10': 0.0211, '8': 0.0366, '6': 0.0590,
      '4': 0.0973, '3': 0.1134, '2': 0.1333, '1': 0.1901, '1/0': 0.2223,
      '2/0': 0.2624, '3/0': 0.3117, '4/0': 0.3718, '250': 0.4596,
      '300': 0.5281, '350': 0.5958, '400': 0.6619, '500': 0.7901
    }
  };

  const addConductor = () => {
    setConductors([...conductors, { size: '12', count: '' }]);
  };

  const removeConductor = (index) => {
    if (conductors.length > 1) {
      setConductors(conductors.filter((_, i) => i !== index));
    }
  };

  const updateConductor = (index, field, value) => {
    const newConductors = [...conductors];
    newConductors[index][field] = value;
    setConductors(newConductors);
  };

  const calculateFill = () => {
    const conduitArea = conduitData[conduitType].area;
    
    let totalWireArea = 0;
    let totalWireCount = 0;
    
    const conductorDetails = conductors.map(conductor => {
      const count = parseInt(conductor.count) || 0;
      const wireArea = wireData[wireType][conductor.size] || 0;
      const subtotal = wireArea * count;
      
      totalWireArea += subtotal;
      totalWireCount += count;
      
      return {
        size: conductor.size,
        count: count,
        areaEach: wireArea,
        subtotal: subtotal
      };
    });
    
    const fillPercentage = (totalWireArea / conduitArea * 100).toFixed(1);
    
    let maxFill = 40;
    if (totalWireCount === 1) maxFill = 53;
    else if (totalWireCount === 2) maxFill = 31;
    
    return {
      conduitArea: conduitArea.toFixed(3),
      totalWireArea: totalWireArea.toFixed(3),
      fillPercentage: parseFloat(fillPercentage),
      maxFill,
      totalWireCount,
      conductorDetails,
      isOverfilled: parseFloat(fillPercentage) > maxFill
    };
  };

  const results = calculateFill();

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
          <Wrench size={24} color="#3b82f6" />
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: colors.cardText,
            margin: 0 
          }}>
            Conduit Fill Calculator
          </h2>
        </div>
        <p style={{ 
          fontSize: '0.875rem', 
          color: colors.labelText,
          margin: 0 
        }}>
          NEC Chapter 9, Table 1
        </p>
      </div>

      {/* Conduit & Wire Selection */}
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
          Conduit & Wire Selection
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText,
              marginBottom: '0.5rem' 
            }}>
              Conduit Type & Size
            </label>
            <select 
              value={conduitType} 
              onChange={(e) => setConduitType(e.target.value)}
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
              <optgroup label="EMT">
                {Object.entries(conduitData)
                  .filter(([key]) => key.startsWith('emt'))
                  .map(([key, conduit]) => (
                    <option key={key} value={key}>{conduit.name}</option>
                  ))}
              </optgroup>
              <optgroup label="PVC Schedule 40">
                {Object.entries(conduitData)
                  .filter(([key]) => key.startsWith('pvc'))
                  .map(([key, conduit]) => (
                    <option key={key} value={key}>{conduit.name}</option>
                  ))}
              </optgroup>
              <optgroup label="Rigid Steel">
                {Object.entries(conduitData)
                  .filter(([key]) => key.startsWith('rigid'))
                  .map(([key, conduit]) => (
                    <option key={key} value={key}>{conduit.name}</option>
                  ))}
              </optgroup>
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
              Wire Type
            </label>
            <select 
              value={wireType} 
              onChange={(e) => setWireType(e.target.value)}
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
              <option value="thwn">THWN-2</option>
              <option value="xhhw">XHHW-2</option>
            </select>
          </div>
        </div>
      </div>

      {/* Conductors */}
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
          Conductors
        </h3>
        
        {conductors.map((conductor, index) => (
          <div key={index} style={{ 
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '0.75rem',
            border: `1px solid ${colors.cardBorder}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ fontWeight: '600', color: colors.labelText, margin: 0, fontSize: '0.875rem' }}>
                Wire Size {index + 1}
              </h4>
              {conductors.length > 1 && (
                <button
                  onClick={() => removeConductor(index)}
                  style={{ 
                    color: '#dc2626', 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    padding: '0.25rem',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <select 
                value={conductor.size} 
                onChange={(e) => updateConductor(index, 'size', e.target.value)}
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
                {Object.keys(wireData[wireType]).map(size => (
                  <option key={size} value={size}>{size} AWG</option>
                ))}
              </select>
              <input 
                type="number" 
                value={conductor.count} 
                onChange={(e) => updateConductor(index, 'count', e.target.value)}
                placeholder="Quantity"
                min="0"
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
          </div>
        ))}
        
        <button 
          onClick={addConductor}
          style={{ 
            width: '100%',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          <Plus size={16} />
          Add Wire Size
        </button>
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
          fontSize: '1.125rem', 
          fontWeight: '600', 
          color: colors.cardText,
          marginTop: 0,
          marginBottom: '1rem'
        }}>
          Results
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
              Conduit Area
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
              {results.conduitArea}
            </div>
            <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
              sq.in.
            </div>
          </div>
          
          <div style={{
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
              Wire Area
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
              {results.totalWireArea}
            </div>
            <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
              sq.in.
            </div>
          </div>
          
          <div style={{
            background: results.isOverfilled ? '#fee2e2' : '#dbeafe',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: results.isOverfilled ? '#991b1b' : '#1e40af', marginBottom: '0.25rem' }}>
              Fill Percentage
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: results.isOverfilled ? '#dc2626' : '#1e40af' }}>
              {results.fillPercentage}%
            </div>
            <div style={{ fontSize: '0.75rem', color: results.isOverfilled ? '#991b1b' : '#1e40af', marginTop: '0.25rem' }}>
              Max: {results.maxFill}%
            </div>
          </div>
        </div>

        {results.conductorDetails.length > 0 && results.totalWireCount > 0 && (
          <div style={{ 
            background: colors.sectionBg,
            padding: '1rem', 
            borderRadius: '8px',
            marginBottom: '1rem',
            border: `1px solid ${colors.cardBorder}`
          }}>
            <strong style={{ color: colors.cardText, display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem' }}>
              Conductor Breakdown:
            </strong>
            {results.conductorDetails.map((detail, index) => (
              detail.count > 0 && (
                <div key={index} style={{ 
                  marginTop: index > 0 ? '0.75rem' : 0,
                  paddingTop: index > 0 ? '0.75rem' : 0,
                  borderTop: index > 0 ? `1px solid ${colors.cardBorder}` : 'none',
                  fontSize: '0.875rem',
                  color: colors.labelText
                }}>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {detail.count}× {detail.size} AWG {wireType.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: colors.subtleText }}>
                    {detail.areaEach.toFixed(4)} sq.in. each = {detail.subtotal.toFixed(4)} sq.in. total
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {!results.isOverfilled && results.totalWireCount > 0 ? (
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
                  Conduit fill is within NEC limits
                </div>
                <div>Total conductors: {results.totalWireCount}</div>
              </div>
            </div>
          </div>
        ) : results.isOverfilled ? (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: '1.5' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem', fontSize: '0.9375rem' }}>
                  CONDUIT OVERFILLED - Violates NEC Chapter 9
                </div>
                <div>
                  Reduce number of conductors or use larger conduit
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* NEC Reference */}
      <div style={{
        background: colors.sectionBg,
        padding: '1rem',
        borderRadius: '8px',
        border: `1px solid ${colors.cardBorder}`,
        fontSize: '0.8125rem',
        color: colors.labelText
      }}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: colors.cardText }}>
          NEC Chapter 9, Table 1:
        </div>
        1 conductor: 53% • 2 conductors: 31% • 3+ conductors: 40% • Nipples (&lt;24"): 60%
      </div>
    </div>
  );
}

export default ConduitFillCalculator;
