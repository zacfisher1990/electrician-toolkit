import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle, AlertTriangle, Box, Zap, Info } from 'lucide-react';
import { 
  boxCapacities, 
  wireVolumeAllowances, 
  availableWireSizes,
  getBoxCapacity,
  getBoxName,
  getWireVolumeAllowance,
  necReferences 
} from './boxFillData';
import CalculatorLayout, { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox 
} from './CalculatorLayout';

const BoxFillCalculator = ({ isDarkMode = false }) => {
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
    <CalculatorLayout isDarkMode={isDarkMode}>
      {/* Box Selection */}
      <Section 
        title="Box Selection" 
        icon={Box} 
        color="#dc2626" 
        isDarkMode={isDarkMode}
      >
        <InputGroup label="Box Type" isDarkMode={isDarkMode}>
          <Select 
            value={boxType} 
            onChange={(e) => handleBoxTypeChange(e.target.value)}
            isDarkMode={isDarkMode}
            options={[
              { value: 'custom', label: 'Custom Box (Enter cu.in. below)' },
              ...Object.entries(boxCapacities)
                .filter(([key, box]) => box.type === 'device' && key.startsWith('3x2'))
                .map(([key, box]) => ({
                  value: key,
                  label: `${box.name} - ${box.capacity} cu.in.`
                })),
              ...Object.entries(boxCapacities)
                .filter(([key, box]) => box.type === 'device' && key.startsWith('4x2'))
                .map(([key, box]) => ({
                  value: key,
                  label: `${box.name} - ${box.capacity} cu.in.`
                })),
              ...Object.entries(boxCapacities)
                .filter(([key, box]) => box.type === 'square')
                .map(([key, box]) => ({
                  value: key,
                  label: `${box.name} - ${box.capacity} cu.in.`
                })),
              ...Object.entries(boxCapacities)
                .filter(([key, box]) => box.type === 'round-octagon')
                .map(([key, box]) => ({
                  value: key,
                  label: `${box.name} - ${box.capacity} cu.in.`
                })),
              ...Object.entries(boxCapacities)
                .filter(([key, box]) => box.type === 'masonry')
                .map(([key, box]) => ({
                  value: key,
                  label: `${box.name} - ${box.capacity} cu.in.`
                })),
              ...Object.entries(boxCapacities)
                .filter(([key, box]) => box.type === 'fs-fd')
                .map(([key, box]) => ({
                  value: key,
                  label: `${box.name} - ${box.capacity} cu.in.`
                }))
            ]}
          />
        </InputGroup>

        {isCustomBox && (
          <InputGroup label="Custom Box Capacity" isDarkMode={isDarkMode}>
            <Input
              type="number"
              value={customBoxCapacity}
              onChange={(e) => setCustomBoxCapacity(e.target.value)}
              placeholder="Enter capacity"
              isDarkMode={isDarkMode}
              unit="cu.in."
            />
          </InputGroup>
        )}
      </Section>

      {/* Conductors */}
      <Section 
        title="Conductors" 
        icon={Zap} 
        color="#10b981" 
        isDarkMode={isDarkMode}
      >
        {conductors.map((conductor, index) => (
          <div 
            key={index}
            style={{
              marginBottom: conductors.length > 1 ? '0.75rem' : 0
            }}
          >
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr auto', 
              gap: '0.75rem',
              alignItems: 'end'
            }}>
              <InputGroup 
                label={index === 0 ? "Wire Size" : ""} 
                isDarkMode={isDarkMode}
              >
                <Select
                  value={conductor.size}
                  onChange={(e) => updateConductor(index, 'size', e.target.value)}
                  isDarkMode={isDarkMode}
                  options={availableWireSizes.map(size => ({
                    value: size,
                    label: `${size} AWG`
                  }))}
                />
              </InputGroup>

              <InputGroup 
                label={index === 0 ? "Quantity" : ""} 
                isDarkMode={isDarkMode}
              >
                <Input
                  type="number"
                  value={conductor.count}
                  onChange={(e) => updateConductor(index, 'count', e.target.value)}
                  placeholder="Qty"
                  min="0"
                  isDarkMode={isDarkMode}
                />
              </InputGroup>

              {conductors.length > 1 && (
                <button
                  onClick={() => removeConductor(index)}
                  style={{
                    padding: '0.75rem',
                    background: 'transparent',
                    border: `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}`,
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#fee2e2';
                    e.target.style.borderColor = '#ef4444';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.borderColor = isDarkMode ? '#4b5563' : '#e5e7eb';
                  }}
                >
                  <Trash2 size={16} />
                </button>
              )}
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
            borderRadius: '0.5rem',
            padding: '0.75rem',
            fontSize: '0.875rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            marginTop: '0.75rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#2563eb';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#3b82f6';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          <Plus size={16} />
          Add Conductor
        </button>
      </Section>

      {/* Devices and Fittings */}
      <Section 
        title="Devices & Fittings" 
        icon={Info} 
        color="#f59e0b" 
        isDarkMode={isDarkMode}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '0.75rem',
          marginBottom: '0.75rem'
        }}>
          <InputGroup label="Outlets/Receptacles" helper="2 volumes each" isDarkMode={isDarkMode}>
            <Input
              type="number"
              value={devices.outlets}
              onChange={(e) => setDevices({...devices, outlets: e.target.value})}
              placeholder="0"
              min="0"
              isDarkMode={isDarkMode}
            />
          </InputGroup>

          <InputGroup label="Switches" helper="2 volumes each" isDarkMode={isDarkMode}>
            <Input
              type="number"
              value={devices.switches}
              onChange={(e) => setDevices({...devices, switches: e.target.value})}
              placeholder="0"
              min="0"
              isDarkMode={isDarkMode}
            />
          </InputGroup>

          <InputGroup label="Internal Clamps" helper="1 volume if present" isDarkMode={isDarkMode}>
            <Input
              type="number"
              value={devices.clamps}
              onChange={(e) => setDevices({...devices, clamps: e.target.value})}
              placeholder="0"
              min="0"
              isDarkMode={isDarkMode}
            />
          </InputGroup>
        </div>

        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          cursor: 'pointer',
          fontSize: '0.875rem',
          fontWeight: '500',
          color: isDarkMode ? '#d1d5db' : '#374151'
        }}>
          <input 
            type="checkbox" 
            checked={devices.groundWires} 
            onChange={(e) => setDevices({...devices, groundWires: e.target.checked})}
            style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
          />
          Equipment Grounding Conductors Present
        </label>
        <div style={{ 
          fontSize: '0.75rem', 
          color: isDarkMode ? '#9ca3af' : '#6b7280',
          marginLeft: '2rem',
          marginTop: '0.25rem'
        }}>
          All grounds combined count as 1 conductor volume
        </div>
      </Section>

      {/* Results */}
      {boxCapacity > 0 && (
        <Section isDarkMode={isDarkMode}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '0.75rem', 
            marginBottom: '0.75rem' 
          }}>
            <ResultCard
              label="Box Capacity"
              value={boxCapacity}
              unit="cu.in."
              color="#6b7280"
              variant="subtle"
              isDarkMode={isDarkMode}
            />
            
            <ResultCard
              label="Calculated Fill"
              value={results.totalFill.toFixed(2)}
              unit="cu.in."
              color="#6b7280"
              variant="subtle"
              isDarkMode={isDarkMode}
            />
            
            <ResultCard
              label="Fill Percentage"
              value={`${fillPercentage}%`}
              unit={isOverfilled ? 'OVERFILLED' : 'Within Limits'}
              color={isOverfilled ? '#ef4444' : '#3b82f6'}
              variant="prominent"
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Conductor Breakdown */}
          {results.conductorDetails.length > 0 && results.conductorDetails.some(c => c.count > 0) && (
            <InfoBox type="info" isDarkMode={isDarkMode} title="Conductor Breakdown">
              {results.conductorDetails.map((detail, index) => (
                detail.count > 0 && (
                  <div key={index} style={{ 
                    marginTop: index > 0 ? '0.5rem' : 0,
                    paddingTop: index > 0 ? '0.5rem' : 0,
                    borderTop: index > 0 ? `1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'}` : 'none',
                    fontSize: '0.8125rem'
                  }}>
                    <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                      {detail.count}× {detail.size} AWG
                    </div>
                    <div style={{ opacity: 0.8 }}>
                      {detail.allowanceEach} cu.in. each = {detail.subtotal.toFixed(2)} cu.in. total
                    </div>
                  </div>
                )
              ))}
            </InfoBox>
          )}

          {/* Status Message */}
          {!isOverfilled && results.totalFill > 0 ? (
            <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                Box fill is within NEC limits
              </div>
              <div style={{ fontSize: '0.8125rem' }}>
                {results.deviceFill > 0 && <div>Devices: {results.deviceFill.toFixed(2)} cu.in.</div>}
                {results.clampFill > 0 && <div>Clamps: {results.clampFill.toFixed(2)} cu.in.</div>}
                {results.groundFill > 0 && <div>Grounds: {results.groundFill.toFixed(2)} cu.in.</div>}
              </div>
            </InfoBox>
          ) : isOverfilled ? (
            <InfoBox type="warning" icon={AlertTriangle} isDarkMode={isDarkMode}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>
                BOX OVERFILLED - Violates NEC 314.16
              </div>
              <div style={{ fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                Reduce number of devices or use larger box
              </div>
              <div style={{ fontSize: '0.8125rem' }}>
                {results.deviceFill > 0 && <div>Devices: {results.deviceFill.toFixed(2)} cu.in.</div>}
                {results.clampFill > 0 && <div>Clamps: {results.clampFill.toFixed(2)} cu.in.</div>}
                {results.groundFill > 0 && <div>Grounds: {results.groundFill.toFixed(2)} cu.in.</div>}
              </div>
            </InfoBox>
          ) : null}
        </Section>
      )}

      {/* NEC Reference */}
      <InfoBox type="info" isDarkMode={isDarkMode}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
          NEC 314.16 Requirements:
        </div>
        <div style={{ fontSize: '0.8125rem' }}>
          Conductor = table volume • Device = 2 volumes • All grounds = 1 volume • Clamps = 1 volume
        </div>
      </InfoBox>
    </CalculatorLayout>
  );
};

export default BoxFillCalculator;
