import React, { useState } from 'react';
import { Wrench, Plus, Trash2, ArrowLeft } from 'lucide-react';

function ConduitFillCalculator({ onBack }) {
  const [conduitType, setConduitType] = useState('emt-0.5');
  const [wireType, setWireType] = useState('thwn');
  const [conductors, setConductors] = useState([
    { size: '12', count: '' }
  ]);

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
    <div style={{ maxWidth: '64rem', margin: '0 auto' }}>
      <div style={{ background: '#fbbf24', color: 'black', padding: '1.5rem', borderTopLeftRadius: '0.5rem', borderTopRightRadius: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Wrench size={32} />
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Conduit Fill Calculator</h1>
            <p style={{ fontSize: '0.875rem', margin: 0 }}>Calculate conduit fill per NEC Chapter 9, Table 1</p>
          </div>
        </div>
      </div>

      <div style={{ background: 'white', padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Conduit Type & Size
            </label>
            <select 
              value={conduitType} 
              onChange={(e) => setConduitType(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
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
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: '#374151', marginBottom: '0.5rem' }}>
              Wire Type
            </label>
            <select 
              value={wireType} 
              onChange={(e) => setWireType(e.target.value)}
              style={{ width: '100%', padding: '0.5rem 1rem', border: '2px solid #d1d5db', borderRadius: '0.25rem', fontSize: '1rem' }}
            >
              <option value="thwn">THWN-2</option>
              <option value="xhhw">XHHW-2</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '700', color: '#374151', marginBottom: '0.75rem' }}>
            Conductors
          </label>
          {conductors.map((conductor, index) => (
  <div key={index} style={{ 
    background: '#f9fafb',
    padding: '1rem',
    borderRadius: '0.5rem',
    marginBottom: '0.75rem',
    border: '1px solid #e5e7eb'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
      <h3 style={{ fontWeight: 'bold', color: '#374151', margin: 0, fontSize: '0.875rem' }}>
        Wire Size {index + 1}
      </h3>
      {conductors.length > 1 && (
        <button
          onClick={() => removeConductor(index)}
          style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
        >
          <Trash2 size={20} />
        </button>
      )}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
      <select 
        value={conductor.size} 
        onChange={(e) => updateConductor(index, 'size', e.target.value)}
        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
      >
        <option value="14">14 AWG</option>
        <option value="12">12 AWG</option>
        <option value="10">10 AWG</option>
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
      </select>
      <input 
        type="number" 
        value={conductor.count} 
        onChange={(e) => updateConductor(index, 'count', e.target.value)}
        placeholder="Quantity"
        min="0"
        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.25rem' }}
      />
    </div>
  </div>
))}
          <button 
            onClick={addConductor}
            style={{ 
              width: '100%',
              background: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem',
              padding: '0.625rem',
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

        {/* Results Box */}
        <div style={{ 
          background: results.isOverfilled ? '#fef2f2' : '#dcfce7', 
          border: `2px solid ${results.isOverfilled ? '#dc2626' : '#16a34a'}`, 
          padding: '1.5rem', 
          borderRadius: '0.5rem'
        }}>
          <h3 style={{ fontWeight: 'bold', color: results.isOverfilled ? '#991b1b' : '#166534', marginTop: 0, marginBottom: '1rem' }}>
            Results
          </h3>
          
          {results.conductorDetails.length > 0 && results.totalWireCount > 0 && (
            <div style={{ 
              background: 'white', 
              padding: '1rem', 
              borderRadius: '0.375rem',
              marginBottom: '1rem'
            }}>
              <strong style={{ color: '#374151', display: 'block', marginBottom: '0.5rem' }}>Conductor Breakdown:</strong>
              {results.conductorDetails.map((detail, index) => (
                detail.count > 0 && (
                  <div key={index} style={{ 
                    marginTop: index > 0 ? '0.5rem' : 0,
                    paddingTop: index > 0 ? '0.5rem' : 0,
                    borderTop: index > 0 ? '1px solid #e5e7eb' : 'none',
                    color: '#374151'
                  }}>
                    <div style={{ fontWeight: '600' }}>{detail.count}x {detail.size} AWG {wireType.toUpperCase()}</div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {detail.areaEach.toFixed(4)} sq.in. each = {detail.subtotal.toFixed(4)} sq.in. total
                    </div>
                  </div>
                )
              ))}
            </div>
          )}

          <div style={{ color: results.isOverfilled ? '#7f1d1d' : '#14532d', marginBottom: '0.5rem' }}>
            <strong>Conduit Area:</strong> {results.conduitArea} sq.in.
          </div>
          <div style={{ color: results.isOverfilled ? '#7f1d1d' : '#14532d', marginBottom: '0.5rem' }}>
            <strong>Total Wire Area:</strong> {results.totalWireArea} sq.in.
          </div>
          <div style={{ color: results.isOverfilled ? '#7f1d1d' : '#14532d', marginBottom: '0.75rem' }}>
            <strong>Total Conductors:</strong> {results.totalWireCount}
          </div>
          
          <div style={{ 
            fontWeight: 'bold',
            fontSize: '1.5rem',
            marginTop: '1rem',
            paddingTop: '1rem',
            borderTop: `2px solid ${results.isOverfilled ? '#fecaca' : '#bbf7d0'}`,
            color: results.isOverfilled ? '#dc2626' : '#16a34a'
          }}>
            Fill: {results.fillPercentage}% (Max: {results.maxFill}%)
          </div>

          {results.isOverfilled && (
            <div style={{ 
              color: '#dc2626', 
              fontWeight: 'bold', 
              marginTop: '1rem',
              padding: '0.75rem',
              background: '#fee2e2',
              borderRadius: '0.375rem',
              border: '1px solid #fecaca'
            }}>
              <div style={{ fontSize: '1.125rem' }}>⚠ CONDUIT OVERFILLED - Violates NEC Chapter 9</div>
              <div style={{ fontSize: '0.875rem', fontWeight: 'normal', marginTop: '0.5rem' }}>
                Reduce number of conductors or use larger conduit
              </div>
            </div>
          )}

          {!results.isOverfilled && results.totalWireCount > 0 && (
            <div style={{ 
              color: '#16a34a', 
              marginTop: '0.75rem',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              ✓ Conduit fill is within NEC limits
            </div>
          )}
        </div>
      </div>

      <div style={{ background: '#1e293b', color: '#cbd5e1', padding: '1.5rem', borderBottomLeftRadius: '0.5rem', borderBottomRightRadius: '0.5rem', fontSize: '0.875rem' }}>
        <p style={{ fontWeight: '600', marginTop: 0, marginBottom: '0.75rem' }}>NEC Chapter 9, Table 1 - Conduit Fill Limits:</p>
        <ul style={{ paddingLeft: '1.5rem', margin: '0 0 0.75rem 0' }}>
          <li style={{ marginBottom: '0.25rem' }}>1 conductor: 53% maximum fill</li>
          <li style={{ marginBottom: '0.25rem' }}>2 conductors: 31% maximum fill</li>
          <li style={{ marginBottom: '0.25rem' }}>3+ conductors: 40% maximum fill</li>
          <li>Nipples (under 24"): 60% maximum fill per NEC 314.16(B)(4)</li>
        </ul>
        <p style={{ fontSize: '0.75rem', fontStyle: 'italic', margin: 0 }}>
          Note: Equipment grounding conductors and bonding conductors count as conductors for fill calculations.
        </p>
      </div>
    </div>
  );
}

export default ConduitFillCalculator;
