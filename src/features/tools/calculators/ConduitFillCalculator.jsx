import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle, AlertTriangle, Circle, Cable } from 'lucide-react';
import { FaCircleHalfStroke } from 'react-icons/fa6';
import { conduitTypes, conduitSizeLabels, conduitData, getAvailableSizes, getConduitInfo } from './conduitData';
import { wireTypes, wireSizeOrder, wireData, getWireArea, getAvailableWireSizes } from './wireData';
import CalculatorLayout, { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox 
} from './CalculatorLayout';

const ConduitFillCalculator = ({ isDarkMode = false }) => {
  // Conduit selection state
  const [conduitMaterial, setConduitMaterial] = useState('emt');
  const [conduitSize, setConduitSize] = useState('0.5');
  
  // Conductors state - array of wire configurations
  const [conductors, setConductors] = useState([
    { wireType: 'thwn', size: '12', count: '' }
  ]);

  // Get available sizes for the selected conduit type
  const availableSizes = getAvailableSizes(conduitMaterial);

  // Update conduit size if current size is not available for new conduit type
  const handleConduitTypeChange = (newType) => {
    setConduitMaterial(newType);
    const newAvailableSizes = getAvailableSizes(newType);
    if (!newAvailableSizes.includes(conduitSize)) {
      setConduitSize(newAvailableSizes[0] || '0.5');
    }
  };

  const addConductor = () => {
    setConductors([...conductors, { wireType: 'thwn', size: '12', count: '' }]);
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

  // Calculate conduit fill
  const calculateFill = () => {
    const conduitInfo = getConduitInfo(conduitMaterial, conduitSize);
    if (!conduitInfo) return null;
    
    const conduitArea = conduitInfo.area;
    
    let totalWireArea = 0;
    let totalWireCount = 0;
    
    const conductorDetails = conductors.map(conductor => {
      const count = parseInt(conductor.count) || 0;
      const wireArea = getWireArea(conductor.wireType, conductor.size);
      const subtotal = wireArea * count;
      
      totalWireArea += subtotal;
      totalWireCount += count;
      
      return {
        wireType: conductor.wireType,
        size: conductor.size,
        count: count,
        areaEach: wireArea,
        subtotal: subtotal
      };
    });
    
    const fillPercentage = (totalWireArea / conduitArea * 100).toFixed(1);
    
    // Determine max fill based on conductor count (NEC Chapter 9, Table 1)
    let maxFill = 40;
    if (totalWireCount === 1) maxFill = 53;
    else if (totalWireCount === 2) maxFill = 31;
    
    return {
      conduitInfo,
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
    <div style={{ margin: '0 -0.75rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        {/* Conduit Selection */}
        <Section 
          title="Conduit Selection" 
          icon={Circle} 
          color="#dc2626" 
          isDarkMode={isDarkMode}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <InputGroup label="Conduit Type" isDarkMode={isDarkMode}>
            <Select
              value={conduitMaterial}
              onChange={(e) => handleConduitTypeChange(e.target.value)}
              isDarkMode={isDarkMode}
              options={conduitTypes.map(type => ({
                value: type.value,
                label: type.label
              }))}
            />
          </InputGroup>

          <InputGroup label="Conduit Size" isDarkMode={isDarkMode}>
            <Select
              value={conduitSize}
              onChange={(e) => setConduitSize(e.target.value)}
              isDarkMode={isDarkMode}
              options={availableSizes.map(size => ({
                value: size,
                label: conduitSizeLabels[size] || size
              }))}
            />
          </InputGroup>
        </div>
      </Section>

      {/* Conductors */}
      <Section 
        title="Conductors" 
        icon={Cable} 
        color="#10b981" 
        isDarkMode={isDarkMode}
      >
        {conductors.map((conductor, index) => (
          <div 
            key={index}
            style={{
              marginBottom: conductors.length > 1 ? '1rem' : 0
            }}
          >
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr 1fr auto', 
              gap: '0.75rem',
              alignItems: 'end'
            }}>
              <InputGroup 
                label={index === 0 ? "Wire Type" : ""} 
                isDarkMode={isDarkMode}
              >
                <Select
                  value={conductor.wireType}
                  onChange={(e) => updateConductor(index, 'wireType', e.target.value)}
                  isDarkMode={isDarkMode}
                  options={wireTypes.map(type => ({
                    value: type.value,
                    label: type.label
                  }))}
                />
              </InputGroup>

              <InputGroup 
                label={index === 0 ? "Size" : ""} 
                isDarkMode={isDarkMode}
              >
                <Select
                  value={conductor.size}
                  onChange={(e) => updateConductor(index, 'size', e.target.value)}
                  isDarkMode={isDarkMode}
                  options={getAvailableWireSizes(conductor.wireType).map(size => {
                    const isKcmil = !size.includes('/') && parseInt(size) >= 250;
                    const unit = isKcmil ? 'kcmil' : 'AWG';
                    return {
                      value: size,
                      label: `${size} ${unit}`
                    };
                  })}
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

      {/* Results */}
      {results && results.totalWireCount > 0 && (
        <Section isDarkMode={isDarkMode}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '0.75rem', 
            marginBottom: '0.75rem' 
          }}>
            <ResultCard
              label="Conduit Area"
              value={results.conduitArea}
              unit="sq.in."
              color="#6b7280"
              variant="subtle"
              isDarkMode={isDarkMode}
            />
            
            <ResultCard
              label="Wire Area"
              value={results.totalWireArea}
              unit="sq.in."
              color="#6b7280"
              variant="subtle"
              isDarkMode={isDarkMode}
            />
            
            <ResultCard
              label="Fill Percentage"
              value={`${results.fillPercentage}%`}
              unit={`Max: ${results.maxFill}%`}
              color={results.isOverfilled ? '#ef4444' : '#3b82f6'}
              variant="prominent"
              isDarkMode={isDarkMode}
            />
          </div>

          {/* Conductor Breakdown */}
          {results.conductorDetails.length > 0 && (
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
                      {detail.count}× {detail.size} {!detail.size.includes('/') && parseInt(detail.size) >= 250 ? 'kcmil' : 'AWG'} {detail.wireType.toUpperCase()}-2
                    </div>
                    <div style={{ opacity: 0.8 }}>
                      {detail.areaEach.toFixed(4)} sq.in. each = {detail.subtotal.toFixed(4)} sq.in. total
                    </div>
                  </div>
                )
              ))}
            </InfoBox>
          )}

          {/* Status Message */}
          {!results.isOverfilled ? (
            <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                Conduit fill is within NEC limits
              </div>
              <div style={{ fontSize: '0.8125rem' }}>
                Total conductors: {results.totalWireCount}
              </div>
            </InfoBox>
          ) : (
            <InfoBox type="warning" icon={AlertTriangle} isDarkMode={isDarkMode}>
              <div style={{ fontWeight: '600', marginBottom: '0.25rem', fontSize: '0.9375rem' }}>
                CONDUIT OVERFILLED - Violates NEC Chapter 9
              </div>
              <div style={{ fontSize: '0.8125rem' }}>
                Reduce number of conductors or use larger conduit
              </div>
            </InfoBox>
          )}
        </Section>
      )}

      {/* NEC Reference */}
      <InfoBox type="info" isDarkMode={isDarkMode}>
        <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
          NEC Chapter 9, Table 1:
        </div>
        <div style={{ fontSize: '0.8125rem' }}>
          1 conductor: 53% • 2 conductors: 31% • 3+ conductors: 40% • Nipples (&lt;24"): 60%
        </div>
      </InfoBox>
    </CalculatorLayout>
    </div>
  );
};

export default ConduitFillCalculator;
