import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { AlertTriangle, CheckCircle, Info, Zap } from 'lucide-react';
import { exportToPDF } from '../../utils/pdfExport';

// NEC Table 110.26(A)(1) - Working Space Dimensions
const voltageRanges = [
  { value: '0-150', label: '0-150V to Ground', description: 'Typical 120V circuits' },
  { value: '151-600', label: '151-600V to Ground', description: 'Typical 208V, 240V, 277V, 480V systems' },
  { value: '601-2500', label: '601V-2.5kV', description: 'Medium voltage equipment' },
  { value: 'over-2500', label: 'Over 2.5kV', description: 'High voltage equipment' }
];

const conditionTypes = [
  { 
    value: 'condition-1', 
    label: 'Condition 1',
    description: 'Exposed live parts on one side, grounded/insulated on the other side'
  },
  { 
    value: 'condition-2', 
    label: 'Condition 2',
    description: 'Exposed live parts on both sides (equipment on opposite walls)'
  },
  { 
    value: 'condition-3', 
    label: 'Condition 3',
    description: 'Exposed live parts on both sides, not guarded by suitable wood/insulation'
  }
];

const equipmentTypes = [
  { value: 'switchboard', label: 'Switchboard' },
  { value: 'panelboard', label: 'Panelboard' },
  { value: 'motor_control', label: 'Motor Control Center' },
  { value: 'transformer', label: 'Transformer' },
  { value: 'disconnect', label: 'Disconnect Switch' },
  { value: 'general', label: 'General Equipment' }
];

// Working space depth requirements in feet (NEC Table 110.26(A)(1))
const getWorkingSpaceDepth = (voltage, condition) => {
  const depthTable = {
    '0-150': {
      'condition-1': 3,
      'condition-2': 3,
      'condition-3': 3
    },
    '151-600': {
      'condition-1': 3,
      'condition-2': 3.5,
      'condition-3': 4
    },
    '601-2500': {
      'condition-1': 3,
      'condition-2': 4,
      'condition-3': 5
    },
    'over-2500': {
      'condition-1': 4,
      'condition-2': 5,
      'condition-3': 6
    }
  };

  return depthTable[voltage]?.[condition] ?? null;
};

// Minimum width requirement (110.26(A)(2))
const getMinimumWidth = (equipmentWidth) => {
  // Minimum width is 30 inches or width of equipment, whichever is greater
  return Math.max(30, equipmentWidth);
};

// Minimum height requirement (110.26(A)(3))
const getMinimumHeight = (voltage) => {
  // 6.5 feet minimum, or height of equipment, whichever is greater
  return 6.5;
};

const getSpecialRequirements = (voltage, condition, equipmentType) => {
  const requirements = [];

  // Access and entrance requirements (110.26(C))
  requirements.push('At least one entrance not less than 24 inches wide and 6.5 feet high for access');
  
  if (equipmentType === 'switchboard' || equipmentType === 'panelboard' || equipmentType === 'motor_control') {
    requirements.push('For equipment rated 1200A or more and over 6 feet wide, one entrance at each end required (110.26(C)(2))');
  }

  // Illumination requirement (110.26(D))
  requirements.push('Illumination required for all working spaces (110.26(D))');

  // Headroom requirement (110.26(E))
  requirements.push('Minimum headroom of 6.5 feet throughout working space (110.26(E))');

  // Dedicated equipment space (110.26(F))
  requirements.push('Space equal to width and depth of equipment, from floor to 6 feet above equipment or structural ceiling (110.26(F)(1))');

  // Condition-specific notes
  if (condition === 'condition-3') {
    requirements.push('⚠️ Condition 3: Highest risk - exposed live parts on both sides');
    requirements.push('Consider additional safety measures and PPE requirements');
  }

  // Voltage-specific notes
  if (voltage === 'over-2500') {
    requirements.push('⚠️ High voltage equipment requires special safety procedures');
    requirements.push('Additional NFPA 70E arc flash requirements apply');
  }

  if (voltage === '601-2500' || voltage === 'over-2500') {
    requirements.push('Separation from piping, ducts, and other equipment required (110.26(F)(2))');
  }

  return requirements;
};

const getConditionExamples = (condition) => {
  const examples = {
    'condition-1': [
      'Panel on concrete or brick wall',
      'Equipment facing grounded metal partition',
      'Switchboard backed by insulated wall',
      'Most typical installations'
    ],
    'condition-2': [
      'Panels on opposite walls facing each other',
      'Equipment on both sides of aisle',
      'Back-to-back switchboards with wooden separation',
      'Properly insulated barriers between equipment'
    ],
    'condition-3': [
      'Exposed live parts on both sides without proper insulation',
      'Equipment facing equipment without barriers',
      'Unprotected back-to-back installations',
      'Highest safety risk scenario'
    ]
  };

  return examples[condition] || [];
};

const necReferences = {
  mainArticle: 'NEC Article 110.26 - Spaces About Electrical Equipment',
  workingSpaceTable: 'NEC Table 110.26(A)(1) - Working Space Depth',
  width: 'NEC 110.26(A)(2) - Width of Working Space',
  height: 'NEC 110.26(A)(3) - Height of Working Space',
  entrance: 'NEC 110.26(C) - Entrance to Working Space',
  illumination: 'NEC 110.26(D) - Illumination',
  headroom: 'NEC 110.26(E) - Headroom',
  dedicatedSpace: 'NEC 110.26(F) - Dedicated Equipment Space',
  arcFlash: 'NFPA 70E - Arc Flash Protection Requirements'
};

const WorkingSpaceCalculator = forwardRef(({ isDarkMode = false, onBack }, ref) => {
  const [voltage, setVoltage] = useState('151-600');
  const [condition, setCondition] = useState('condition-1');
  const [equipmentType, setEquipmentType] = useState('panelboard');
  const [equipmentWidth, setEquipmentWidth] = useState('20');
  const [equipmentHeight, setEquipmentHeight] = useState('72');
  const [showConditionHelp, setShowConditionHelp] = useState(false);

  // Dark mode colors
  const colors = {
    cardBg: isDarkMode ? '#374151' : '#ffffff',
    cardBorder: isDarkMode ? '#4b5563' : '#e5e7eb',
    cardText: isDarkMode ? '#f9fafb' : '#111827',
    labelText: isDarkMode ? '#d1d5db' : '#374151',
    inputBg: isDarkMode ? '#1f2937' : '#ffffff',
    inputBorder: isDarkMode ? '#4b5563' : '#d1d5db',
    sectionBg: isDarkMode ? '#1f2937' : '#f9fafb',
  };

  const requiredDepth = getWorkingSpaceDepth(voltage, condition);
  const requiredWidth = getMinimumWidth(parseFloat(equipmentWidth));
  const requiredHeight = getMinimumHeight(voltage);
  const specialRequirements = getSpecialRequirements(voltage, condition, equipmentType);
  const conditionExamples = getConditionExamples(condition);
  
  const selectedVoltage = voltageRanges.find(v => v.value === voltage);
  const selectedCondition = conditionTypes.find(c => c.value === condition);
  const selectedEquipment = equipmentTypes.find(e => e.value === equipmentType);

  // Calculate total working space volume
  const workingSpaceVolume = requiredDepth * (requiredWidth / 12) * requiredHeight;

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      const pdfData = {
        calculatorName: 'Working Space Requirements Calculator',
        inputs: {
          voltageRange: selectedVoltage.label,
          condition: selectedCondition.label,
          equipmentType: selectedEquipment.label,
          equipmentWidth: `${equipmentWidth} inches`,
          equipmentHeight: `${equipmentHeight} inches`
        },
        results: {
          requiredDepth: `${requiredDepth} feet (${requiredDepth * 12} inches)`,
          requiredWidth: `${requiredWidth} inches (${(requiredWidth / 12).toFixed(2)} feet)`,
          requiredHeight: `${requiredHeight} feet (${requiredHeight * 12} inches)`,
          workingSpaceVolume: `${workingSpaceVolume.toFixed(1)} cubic feet`
        },
        additionalInfo: {
          conditionDescription: selectedCondition.description,
          conditionExamples: conditionExamples,
          specialRequirements: specialRequirements
        },
        necReferences: [
          necReferences.mainArticle,
          necReferences.workingSpaceTable,
          necReferences.width,
          necReferences.height,
          necReferences.entrance,
          necReferences.illumination,
          necReferences.headroom,
          necReferences.dedicatedSpace,
          ...(voltage === 'over-2500' || voltage === '601-2500' ? [necReferences.arcFlash] : [])
        ]
      };

      exportToPDF(pdfData);
    }
  }));

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Voltage and Condition Selection */}
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
          Electrical System Information
        </h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText,
              marginBottom: '0.5rem' 
            }}>
              Voltage to Ground
            </label>
            <select 
              value={voltage} 
              onChange={(e) => setVoltage(e.target.value)}
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
              {voltageRanges.map(range => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
            <div style={{ 
              fontSize: '0.75rem', 
              color: colors.labelText, 
              marginTop: '0.5rem',
              fontStyle: 'italic'
            }}>
              {selectedVoltage.description}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <label style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText
              }}>
                Working Space Condition
              </label>
              <button
                onClick={() => setShowConditionHelp(!showConditionHelp)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  color: '#3b82f6'
                }}
              >
                <Info size={18} />
              </button>
            </div>
            <select 
              value={condition} 
              onChange={(e) => setCondition(e.target.value)}
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
              {conditionTypes.map(cond => (
                <option key={cond.value} value={cond.value}>
                  {cond.label}
                </option>
              ))}
            </select>
            <div style={{ 
              fontSize: '0.75rem', 
              color: colors.labelText, 
              marginTop: '0.5rem',
              fontStyle: 'italic'
            }}>
              {selectedCondition.description}
            </div>
          </div>

          {showConditionHelp && (
            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${colors.cardBorder}`
            }}>
              <div style={{ fontWeight: '600', color: colors.cardText, marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                {selectedCondition.label} Examples:
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: colors.labelText }}>
                {conditionExamples.map((example, index) => (
                  <li key={index} style={{ marginBottom: '0.25rem' }}>{example}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Equipment Details */}
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
          Equipment Details
        </h3>
        
        <div style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText,
              marginBottom: '0.5rem' 
            }}>
              Equipment Type
            </label>
            <select 
              value={equipmentType} 
              onChange={(e) => setEquipmentType(e.target.value)}
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
              {equipmentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText,
                marginBottom: '0.5rem' 
              }}>
                Equipment Width (inches)
              </label>
              <input
                type="number"
                value={equipmentWidth}
                onChange={(e) => setEquipmentWidth(e.target.value)}
                min="1"
                step="1"
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
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText,
                marginBottom: '0.5rem' 
              }}>
                Equipment Height (inches)
              </label>
              <input
                type="number"
                value={equipmentHeight}
                onChange={(e) => setEquipmentHeight(e.target.value)}
                min="1"
                step="1"
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
        </div>
      </div>

      {/* Results - Three Dimensions */}
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
          Required Working Space Dimensions
        </h3>
        
        {requiredDepth !== null ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
              {/* Depth */}
              <div style={{
                background: '#dbeafe',
                padding: '1.25rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#1e40af', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Depth (Front to Back)
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e40af', lineHeight: '1' }}>
                  {requiredDepth}′
                </div>
                <div style={{ fontSize: '0.875rem', color: '#1e40af', marginTop: '0.5rem' }}>
                  ({requiredDepth * 12}" minimum)
                </div>
              </div>
              
              {/* Width */}
              <div style={{
                background: '#d1fae5',
                padding: '1.25rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#047857', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Width (Side to Side)
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#047857', lineHeight: '1' }}>
                  {requiredWidth}"
                </div>
                <div style={{ fontSize: '0.875rem', color: '#047857', marginTop: '0.5rem' }}>
                  ({(requiredWidth / 12).toFixed(2)}′ minimum)
                </div>
              </div>

              {/* Height */}
              <div style={{
                background: '#fef3c7',
                padding: '1.25rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.7rem', color: '#92400e', marginBottom: '0.5rem', fontWeight: '600', textTransform: 'uppercase' }}>
                  Height (Floor to Ceiling)
                </div>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#92400e', lineHeight: '1' }}>
                  {requiredHeight}′
                </div>
                <div style={{ fontSize: '0.875rem', color: '#92400e', marginTop: '0.5rem' }}>
                  ({requiredHeight * 12}" minimum)
                </div>
              </div>
            </div>

            {/* Summary Card */}
            <div style={{
              background: '#d1fae5',
              border: '1px solid #6ee7b7',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                <CheckCircle size={20} color="#059669" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                <div style={{ fontSize: '0.875rem', color: '#047857', lineHeight: '1.5', width: '100%' }}>
                  <div><strong>Voltage:</strong> {selectedVoltage.label}</div>
                  <div><strong>Condition:</strong> {selectedCondition.label}</div>
                  <div><strong>Equipment:</strong> {selectedEquipment.label}</div>
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #6ee7b7' }}>
                    <strong>Working Space Volume:</strong> {workingSpaceVolume.toFixed(1)} cubic feet
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Representation */}
            <div style={{
              background: colors.sectionBg,
              padding: '1.5rem',
              borderRadius: '8px',
              border: `1px solid ${colors.cardBorder}`,
              marginBottom: '1rem'
            }}>
              <div style={{ fontWeight: '600', color: colors.cardText, marginBottom: '1rem', fontSize: '0.875rem' }}>
                Working Space Layout (Top View):
              </div>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                {/* Equipment Box */}
                <div style={{
                  width: '120px',
                  height: '40px',
                  background: '#ef4444',
                  border: '2px solid #dc2626',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  EQUIPMENT
                </div>
                {/* Arrow showing depth */}
                <div style={{
                  width: '2px',
                  height: `${Math.min(requiredDepth * 15, 80)}px`,
                  background: '#3b82f6',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: colors.sectionBg,
                    padding: '0.25rem 0.5rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    color: '#3b82f6',
                    whiteSpace: 'nowrap'
                  }}>
                    {requiredDepth}′ depth
                  </div>
                </div>
                {/* Working Space */}
                <div style={{
                  width: '120px',
                  height: '40px',
                  background: '#10b981',
                  border: '2px dashed #059669',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: '600'
                }}>
                  WORKING SPACE
                </div>
              </div>
            </div>
          </>
        ) : (
          <div style={{
            background: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <AlertTriangle size={20} color="#dc2626" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.875rem', color: '#7f1d1d', lineHeight: '1.5' }}>
                Unable to determine working space for this configuration. Please verify NEC requirements.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Special Requirements */}
      {specialRequirements.length > 0 && (
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
            Additional Requirements
          </h3>
          <div style={{
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <Zap size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: '1.5' }}>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {specialRequirements.map((req, index) => (
                    <li key={index} style={{ marginBottom: '0.5rem' }}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NEC References */}
      <div style={{
        background: colors.cardBg,
        border: `1px solid ${colors.cardBorder}`,
        borderRadius: '12px',
        padding: '1.5rem',
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
          NEC References
        </h3>
        <div style={{ fontSize: '0.875rem', color: colors.labelText, lineHeight: '1.5' }}>
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.mainArticle}</div>
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.workingSpaceTable}</div>
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.width}</div>
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.height}</div>
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.entrance}</div>
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.illumination}</div>
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.headroom}</div>
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.dedicatedSpace}</div>
          {(voltage === 'over-2500' || voltage === '601-2500') && (
            <div>• {necReferences.arcFlash}</div>
          )}
        </div>
      </div>
    </div>
  );
});

export default WorkingSpaceCalculator;