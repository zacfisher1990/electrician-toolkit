import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle, AlertTriangle } from 'lucide-react';
import { 
  boxCapacities, 
  wireVolumeAllowances, 
  availableWireSizes,
  getBoxCapacity,
  getBoxName,
  getWireVolumeAllowance,
  necReferences 
} from './boxFillData';

const BoxFillCalculator = ({ isDarkMode = false, onBack }) => {
  const [boxType, setBoxType] = useState('4x1.5-square');
  const [customBoxCapacity, setCustomBoxCapacity] = useState('');
  const [isCustomBox, setIsCustomBox] = useState(false);
  const [conductors, setConductors] = useState([
    { size: '12', count: '' }
  ]);
  const [devices, setDevices] = useState({
    outlets: '',
    switches: '',
    clamps: '',
    groundWires: false
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

  const handleBoxTypeChange = (value) => {
    if (value === 'custom') {
      setIsCustomBox(true);
      setBoxType('custom');
    } else {
      setIsCustomBox(false);
      setBoxType(value);
      setCustomBoxCapacity('');
    }
  };

  const calculateFill = () => {
    let totalFill = 0;
    
    const conductorDetails = conductors.map(conductor => {
      const count = parseInt(conductor.count) || 0;
      const wireAllowance = getWireVolumeAllowance(conductor.size);
      const subtotal = wireAllowance * count;
      
      totalFill += subtotal;
      
      return {
        size: conductor.size,
        count: count,
        allowanceEach: wireAllowance,
        subtotal: subtotal
      };
    });
    
    // Find largest wire size (smallest AWG number) that has a count > 0
    const largestWireSize = conductors.reduce((largest, conductor) => {
      const count = parseInt(conductor.count) || 0;
      if (count > 0) {
        const currentSize = parseInt(conductor.size.replace('/', '')) || 0;
        const largestSize = parseInt(largest.replace('/', '')) || 0;
        return currentSize < largestSize ? conductor.size : largest;
      }
      return largest;
    }, '14');
    
    const deviceWireAllowance = getWireVolumeAllowance(largestWireSize);
    const outlets = parseInt(devices.outlets) || 0;
    const switches = parseInt(devices.switches) || 0;
    const deviceFill = (outlets + switches) * 2 * deviceWireAllowance;
    totalFill += deviceFill;
    
    const clamps = parseInt(devices.clamps) || 0;
    const clampFill = clamps > 0 ? deviceWireAllowance : 0;
    totalFill += clampFill;
    
    const groundFill = devices.groundWires ? deviceWireAllowance : 0;
    totalFill += groundFill;
    
    return {
      conductorDetails,
      deviceFill,
      clampFill,
      groundFill,
      totalFill,
      largestWireSize,
      deviceWireAllowance
    };
  };

  const results = calculateFill();
  const boxCapacity = isCustomBox 
    ? (parseFloat(customBoxCapacity) || 0) 
    : getBoxCapacity(boxType);
  const fillPercentage = boxCapacity > 0 ? ((results.totalFill / boxCapacity) * 100).toFixed(1) : 0;
  const isOverfilled = results.totalFill > boxCapacity;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Box Selection */}
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
          Box Selection
        </h3>
        
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '0.875rem', 
            fontWeight: '500', 
            color: colors.labelText,
            marginBottom: '0.5rem' 
          }}>
            Box Type
          </label>
          <select 
            value={boxType} 
            onChange={(e) => handleBoxTypeChange(e.target.value)}
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
            <optgroup label="Custom">
              <option value="custom">Custom Box (Enter cu.in. below)</option>
            </optgroup>
            <optgroup label="Device Boxes (3&quot; x 2&quot;)">
              {Object.entries(boxCapacities)
                .filter(([key, box]) => box.type === 'device' && key.startsWith('3x2'))
                .map(([key, box]) => (
                  <option key={key} value={key}>{box.name} - {box.capacity} cu.in.</option>
                ))}
            </optgroup>
            <optgroup label="Device Boxes (4&quot; x 2-1/8&quot;)">
              {Object.entries(boxCapacities)
                .filter(([key, box]) => box.type === 'device' && key.startsWith('4x2'))
                .map(([key, box]) => (
                  <option key={key} value={key}>{box.name} - {box.capacity} cu.in.</option>
                ))}
            </optgroup>
            <optgroup label="Square Boxes">
              {Object.entries(boxCapacities)
                .filter(([key, box]) => box.type === 'square')
                .map(([key, box]) => (
                  <option key={key} value={key}>{box.name} - {box.capacity} cu.in.</option>
                ))}
            </optgroup>
            <optgroup label="Round/Octagon Boxes">
              {Object.entries(boxCapacities)
                .filter(([key, box]) => box.type === 'round-octagon')
                .map(([key, box]) => (
                  <option key={key} value={key}>{box.name} - {box.capacity} cu.in.</option>
                ))}
            </optgroup>
            <optgroup label="Masonry Boxes">
              {Object.entries(boxCapacities)
                .filter(([key, box]) => box.type === 'masonry')
                .map(([key, box]) => (
                  <option key={key} value={key}>{box.name} - {box.capacity} cu.in.</option>
                ))}
            </optgroup>
            <optgroup label="FS/FD Boxes">
              {Object.entries(boxCapacities)
                .filter(([key, box]) => box.type === 'fs-fd')
                .map(([key, box]) => (
                  <option key={key} value={key}>{box.name} - {box.capacity} cu.in.</option>
                ))}
            </optgroup>
          </select>
          
          {/* Custom Box Capacity Input */}
          {isCustomBox && (
            <div style={{ marginTop: '1rem' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText,
                marginBottom: '0.5rem' 
              }}>
                Box Capacity (cu.in.)
              </label>
              <input 
                type="number"
                value={customBoxCapacity}
                onChange={(e) => setCustomBoxCapacity(e.target.value)}
                placeholder="Enter cubic inches"
                step="0.1"
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
              <p style={{ 
                fontSize: '0.75rem', 
                color: colors.subtleText, 
                marginTop: '0.25rem',
                margin: '0.25rem 0 0 0'
              }}>
                Non-metallic boxes are marked with their volume. Custom enclosures may require calculation.
              </p>
            </div>
          )}
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
                {availableWireSizes.map(size => (
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
        <p style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.5rem', margin: '0.5rem 0 0 0' }}>
          Count all insulated conductors entering, leaving, or passing through the box
        </p>
      </div>

      {/* Devices and Other Items */}
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
          Devices & Other Items
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText,
              marginBottom: '0.5rem' 
            }}>
              Receptacles/Outlets
            </label>
            <input 
              type="number" 
              value={devices.outlets} 
              onChange={(e) => setDevices({...devices, outlets: e.target.value})}
              placeholder="0"
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
            <p style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
              Each device counts as 2 conductors
            </p>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText,
              marginBottom: '0.5rem' 
            }}>
              Switches
            </label>
            <input 
              type="number" 
              value={devices.switches} 
              onChange={(e) => setDevices({...devices, switches: e.target.value})}
              placeholder="0"
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
            <p style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
              Each device counts as 2 conductors
            </p>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText,
              marginBottom: '0.5rem' 
            }}>
              Cable Clamps
            </label>
            <input 
              type="number" 
              value={devices.clamps} 
              onChange={(e) => setDevices({...devices, clamps: e.target.value})}
              placeholder="0"
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
            <p style={{ fontSize: '0.75rem', color: colors.subtleText, marginTop: '0.25rem', margin: '0.25rem 0 0 0' }}>
              One or more = 1 conductor volume
            </p>
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={devices.groundWires} 
            onChange={(e) => setDevices({...devices, groundWires: e.target.checked})}
            style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.labelText }}>
            Equipment Grounding Conductors Present
          </span>
        </label>
        <p style={{ fontSize: '0.75rem', color: colors.subtleText, marginLeft: '2rem', margin: '0.25rem 0 0 2rem' }}>
          All grounds combined count as 1 conductor volume
        </p>
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
              Box Capacity
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
              {boxCapacity}
            </div>
            <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
              cu.in.
            </div>
          </div>
          
          <div style={{
            background: colors.sectionBg,
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: colors.labelText, marginBottom: '0.25rem' }}>
              Calculated Fill
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: colors.cardText }}>
              {results.totalFill.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.75rem', color: colors.labelText, marginTop: '0.25rem' }}>
              cu.in.
            </div>
          </div>
          
          <div style={{
            background: isOverfilled ? '#fee2e2' : '#dbeafe',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.75rem', color: isOverfilled ? '#991b1b' : '#1e40af', marginBottom: '0.25rem' }}>
              Fill Percentage
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: isOverfilled ? '#dc2626' : '#1e40af' }}>
              {fillPercentage}%
            </div>
            <div style={{ fontSize: '0.75rem', color: isOverfilled ? '#991b1b' : '#1e40af', marginTop: '0.25rem' }}>
              {isOverfilled ? 'OVERFILLED' : 'Within Limits'}
            </div>
          </div>
        </div>

        {results.conductorDetails.length > 0 && results.conductorDetails.some(c => c.count > 0) && (
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
                    {detail.count}× {detail.size} AWG
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: colors.subtleText }}>
                    {detail.allowanceEach} cu.in. each = {detail.subtotal.toFixed(2)} cu.in. total
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {!isOverfilled && results.totalFill > 0 ? (
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
                  Box fill is within NEC limits
                </div>
                {results.deviceFill > 0 && (
                  <div>Devices: {results.deviceFill.toFixed(2)} cu.in.</div>
                )}
                {results.clampFill > 0 && (
                  <div>Clamps: {results.clampFill.toFixed(2)} cu.in.</div>
                )}
                {results.groundFill > 0 && (
                  <div>Grounds: {results.groundFill.toFixed(2)} cu.in.</div>
                )}
              </div>
            </div>
          </div>
        ) : isOverfilled ? (
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
                  BOX OVERFILLED - Violates NEC 314.16
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  Reduce number of devices or use larger box
                </div>
                {results.deviceFill > 0 && (
                  <div>Devices: {results.deviceFill.toFixed(2)} cu.in.</div>
                )}
                {results.clampFill > 0 && (
                  <div>Clamps: {results.clampFill.toFixed(2)} cu.in.</div>
                )}
                {results.groundFill > 0 && (
                  <div>Grounds: {results.groundFill.toFixed(2)} cu.in.</div>
                )}
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
          NEC 314.16 Requirements:
        </div>
        Conductor = table volume • Device = 2 volumes • All grounds = 1 volume • Clamps = 1 volume
      </div>
    </div>
  );
};

export default BoxFillCalculator;
