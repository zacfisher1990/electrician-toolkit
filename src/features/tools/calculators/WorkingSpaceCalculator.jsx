import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, Zap, Ruler, Box } from 'lucide-react';
import CalculatorLayout, { 
  Section, 
  InputGroup, 
  Input, 
  Select, 
  ResultCard, 
  InfoBox
} from './CalculatorLayout';
import { getColors } from '../../../theme';

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

const WorkingSpaceCalculator = ({ isDarkMode = false, onBack }) => {
  const [voltage, setVoltage] = useState('151-600');
  const [condition, setCondition] = useState('condition-1');
  const [equipmentType, setEquipmentType] = useState('panelboard');
  const [equipmentWidth, setEquipmentWidth] = useState('20');
  const [equipmentHeight, setEquipmentHeight] = useState('72');
  const [showConditionHelp, setShowConditionHelp] = useState(false);

  const colors = getColors(isDarkMode);

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

  return (
    <div style={{ margin: '0 -1rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        {/* Electrical System Information */}
        <Section 
          title="Electrical System Information" 
          icon={Zap} 
          color="#3b82f6" 
          isDarkMode={isDarkMode}
        >
          <InputGroup 
            label="Voltage to Ground" 
            isDarkMode={isDarkMode}
            helpText={selectedVoltage.description}
          >
            <Select
              value={voltage}
              onChange={(e) => setVoltage(e.target.value)}
              isDarkMode={isDarkMode}
              options={voltageRanges.map(range => ({
                value: range.value,
                label: range.label
              }))}
            />
          </InputGroup>

          <InputGroup isDarkMode={isDarkMode}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <label style={{ 
                fontSize: '0.875rem', 
                fontWeight: '600',
                color: colors.text
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
            <Select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              isDarkMode={isDarkMode}
              options={conditionTypes.map(cond => ({
                value: cond.value,
                label: cond.label
              }))}
            />
            <div style={{ 
              marginTop: '0.375rem',
              fontSize: '0.75rem',
              color: colors.subtext,
              fontStyle: 'italic'
            }}>
              {selectedCondition.description}
            </div>
          </InputGroup>

          {showConditionHelp && (
            <InfoBox type="info" icon={Info} isDarkMode={isDarkMode} title={`${selectedCondition.label} Examples`}>
              <div style={{ fontSize: '0.8125rem' }}>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {conditionExamples.map((example, index) => (
                    <li key={index} style={{ marginBottom: '0.25rem' }}>{example}</li>
                  ))}
                </ul>
              </div>
            </InfoBox>
          )}
        </Section>

        {/* Equipment Details */}
        <Section 
          title="Equipment Details" 
          icon={Box} 
          color="#8b5cf6" 
          isDarkMode={isDarkMode}
        >
          <InputGroup label="Equipment Type" isDarkMode={isDarkMode}>
            <Select
              value={equipmentType}
              onChange={(e) => setEquipmentType(e.target.value)}
              isDarkMode={isDarkMode}
              options={equipmentTypes.map(type => ({
                value: type.value,
                label: type.label
              }))}
            />
          </InputGroup>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '0.75rem' 
          }}>
            <InputGroup label="Equipment Width" isDarkMode={isDarkMode}>
              <Input
                type="number"
                value={equipmentWidth}
                onChange={(e) => setEquipmentWidth(e.target.value)}
                min="1"
                step="1"
                isDarkMode={isDarkMode}
                unit="in"
              />
            </InputGroup>

            <InputGroup label="Equipment Height" isDarkMode={isDarkMode}>
              <Input
                type="number"
                value={equipmentHeight}
                onChange={(e) => setEquipmentHeight(e.target.value)}
                min="1"
                step="1"
                isDarkMode={isDarkMode}
                unit="in"
              />
            </InputGroup>
          </div>
        </Section>

        {/* Results */}
        <Section isDarkMode={isDarkMode}>
          {requiredDepth !== null ? (
            <>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
                gap: '0.75rem', 
                marginBottom: '0.75rem' 
              }}>
                <ResultCard
                  label="Depth (Front to Back)"
                  value={`${requiredDepth}′`}
                  unit={`(${requiredDepth * 12}" minimum)`}
                  color="#3b82f6"
                  variant="prominent"
                  isDarkMode={isDarkMode}
                />
                
                <ResultCard
                  label="Width (Side to Side)"
                  value={`${requiredWidth}"`}
                  unit={`(${(requiredWidth / 12).toFixed(2)}′ minimum)`}
                  color="#10b981"
                  variant="prominent"
                  isDarkMode={isDarkMode}
                />
                
                <ResultCard
                  label="Height (Floor to Ceiling)"
                  value={`${requiredHeight}′`}
                  unit={`(${requiredHeight * 12}" minimum)`}
                  color="#f59e0b"
                  variant="prominent"
                  isDarkMode={isDarkMode}
                />
              </div>

              <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode}>
                <div style={{ fontSize: '0.8125rem' }}>
                  <div><strong>Voltage:</strong> {selectedVoltage.label}</div>
                  <div><strong>Condition:</strong> {selectedCondition.label}</div>
                  <div><strong>Equipment:</strong> {selectedEquipment.label}</div>
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid currentColor', opacity: 0.3 }}>
                  </div>
                  <div style={{ marginTop: '0.25rem' }}>
                    <strong>Working Space Volume:</strong> {workingSpaceVolume.toFixed(1)} cubic feet
                  </div>
                </div>
              </InfoBox>

              {/* Visual Representation */}
              <InfoBox type="info" icon={Ruler} isDarkMode={isDarkMode} title="Working Space Layout (Top View)">
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem 0'
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
                      background: colors.cardBg,
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#3b82f6',
                      whiteSpace: 'nowrap',
                      borderRadius: '4px'
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
              </InfoBox>
            </>
          ) : (
            <InfoBox type="error" icon={AlertTriangle} isDarkMode={isDarkMode}>
              <div style={{ fontSize: '0.8125rem' }}>
                Unable to determine working space for this configuration. Please verify NEC requirements.
              </div>
            </InfoBox>
          )}
        </Section>

        {/* Additional Requirements */}
        {specialRequirements.length > 0 && (
          <InfoBox type="warning" icon={Zap} isDarkMode={isDarkMode} title="Additional Requirements">
            <div style={{ fontSize: '0.8125rem' }}>
              <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                {specialRequirements.map((req, index) => (
                  <li key={index} style={{ marginBottom: '0.5rem' }}>{req}</li>
                ))}
              </ul>
            </div>
          </InfoBox>
        )}

        {/* NEC References */}
        <InfoBox type="info" isDarkMode={isDarkMode}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
            NEC References:
          </div>
          <div style={{ fontSize: '0.8125rem' }}>
            Article 110.26 • Table 110.26(A)(1) • 110.26(A)(2) Width • 110.26(A)(3) Height • 110.26(C) Entrance • 110.26(D) Illumination
          </div>
        </InfoBox>
      </CalculatorLayout>
    </div>
  );
};

export default WorkingSpaceCalculator;