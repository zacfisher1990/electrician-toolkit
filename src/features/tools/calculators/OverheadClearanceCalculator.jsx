import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { AlertTriangle, CheckCircle, Info, Zap, MapPin, Shield, BookOpen } from 'lucide-react';
import { exportToPDF } from '../../../utils/pdfExport';
import CalculatorLayout, { 
  Section, 
  InputGroup, 
  Select, 
  Input,
  ResultCard, 
  InfoBox
} from './CalculatorLayout';
import { getColors } from '../../../theme';

// NEC Table 225.18 & 225.19 - Overhead Clearance Requirements
const conductorTypes = [
  { 
    value: 'insulated_0_600', 
    label: 'Insulated Conductors (0-600V)',
    description: 'Communication, TV, CATV, or insulated conductors rated 0-600V'
  },
  { 
    value: 'open_0_600', 
    label: 'Open Conductors (0-600V)',
    description: 'Open conductors rated 0-600V'
  },
  { 
    value: 'over_600', 
    label: 'Conductors Over 600V',
    description: 'Conductors rated over 600V up to 22kV'
  }
];

const clearanceLocations = [
  { value: 'above_roof', label: 'Above Roofs' },
  { value: 'driveways_residential', label: 'Driveways & Parking (Residential)' },
  { value: 'streets_alleys', label: 'Streets, Alleys, Roads, Parking (Commercial)' },
  { value: 'other_spaces', label: 'Other Spaces & Ways (Accessible to Pedestrians)' },
  { value: 'over_water', label: 'Over Water (Accessible to Boats)' }
];

const roofTypes = [
  { value: 'standard', label: 'Standard Roof (Slope > 4/12)' },
  { value: 'flat', label: 'Flat Roof (Slope ≤ 4/12)' },
  { value: 'through_only', label: 'Conductors Pass Through Only (No Termination)' }
];

// Clearance requirements in feet based on NEC Table 225.18 and 225.19
const getClearanceRequirement = (conductorType, location, roofType = null) => {
  const clearanceTable = {
    'insulated_0_600': {
      'above_roof': {
        'standard': 3,
        'flat': 3,
        'through_only': 18 / 12 // 18 inches converted to feet
      },
      'driveways_residential': 10,
      'streets_alleys': 15.5,
      'other_spaces': 10,
      'over_water': 10
    },
    'open_0_600': {
      'above_roof': {
        'standard': 3,
        'flat': 3,
        'through_only': 18 / 12 // 18 inches converted to feet
      },
      'driveways_residential': 12,
      'streets_alleys': 15.5,
      'other_spaces': 10,
      'over_water': 10
    },
    'over_600': {
      'above_roof': {
        'standard': 3,
        'flat': 3,
        'through_only': 18 / 12 // 18 inches converted to feet
      },
      'driveways_residential': 15.5,
      'streets_alleys': 18,
      'other_spaces': 15.5,
      'over_water': 17
    }
  };

  if (location === 'above_roof' && roofType) {
    return clearanceTable[conductorType]?.[location]?.[roofType] ?? null;
  }
  
  return clearanceTable[conductorType]?.[location] ?? null;
};

const getSpecialNotes = (conductorType, location, roofType = null) => {
  const notes = [];

  if (location === 'above_roof') {
    if (roofType === 'through_only') {
      notes.push('18" clearance applies only where conductors pass over roof without termination');
      notes.push('If conductors terminate within 6 feet of roof edge, standard 3 ft clearance required');
    }
    
    if (roofType === 'flat') {
      notes.push('Flat roofs (≤4/12 slope) may be accessible for maintenance');
      notes.push('3 ft clearance provides safe working space above roof');
    }
    
    if (roofType === 'standard') {
      notes.push('Roof slope greater than 4/12 (4 inches rise per 12 inches run)');
      notes.push('Not readily accessible for walking');
    }
    
    notes.push('Clearance measured from highest point of roof surface');
    notes.push('NEC 225.19 - Additional clearances may be required by voltage');
  }

  if (location === 'driveways_residential') {
    notes.push('Applies to residential property and driveways');
    notes.push('Not used for commercial vehicle traffic');
    notes.push('Sufficient clearance for typical passenger vehicles and light trucks');
  }

  if (location === 'streets_alleys') {
    notes.push('Applies to public streets, alleys, roads, and commercial parking areas');
    notes.push('Must accommodate truck traffic and emergency vehicles');
    notes.push('Clearance measured from road surface to lowest conductor');
  }

  if (location === 'other_spaces') {
    notes.push('Includes sidewalks, platforms, and pedestrian walkways');
    notes.push('Must provide head clearance for pedestrians');
    notes.push('Measured from finished grade or platform surface');
  }

  if (location === 'over_water') {
    notes.push('Applies to water accessible to boats with masts');
    notes.push('Clearance measured from normal high water level');
    notes.push('Consider maximum boat mast height in area');
  }

  if (conductorType === 'over_600') {
    notes.push('For voltages over 22kV, add 0.4 inches per kV over 22kV');
    notes.push('Verify local utility requirements for medium voltage');
    notes.push('Additional safety precautions required for high voltage work');
  }

  return notes;
};

const getSafetyRecommendations = (clearance, location) => {
  const recommendations = [];
  
  if (location === 'above_roof') {
    recommendations.push('Ensure proper support and strain relief');
    recommendations.push('Use appropriate weatherhead and service entrance equipment');
    recommendations.push('Consider local wind and ice loading conditions');
  } else {
    recommendations.push('Mark and protect overhead conductors in work areas');
    recommendations.push('Maintain proper sag to prevent excessive conductor stress');
    recommendations.push('Consider future grade changes that might reduce clearance');
  }
  
  if (clearance < 12) {
    recommendations.push('⚠️ Low clearance - ensure adequate warning signage');
  }
  
  if (clearance >= 15) {
    recommendations.push('Use proper equipment and safety measures for high installations');
  }
  
  return recommendations;
};

const necReferences = {
  mainArticle: 'NEC Article 225 - Outside Branch Circuits and Feeders',
  clearanceTable: 'NEC Table 225.18 - Clearance from Ground and Buildings',
  roofClearance: 'NEC 225.19 - Clearances from Buildings for Conductors',
  support: 'NEC 225.12 - Point of Attachment',
  protection: 'NEC 225.20 - Mechanical Protection',
  vegetation: 'NEC 225.26 - Vegetation as Support'
};

const OverheadClearanceCalculator = forwardRef(({ isDarkMode = false, onBack }, ref) => {
  const [conductorType, setConductorType] = useState('insulated_0_600');
  const [location, setLocation] = useState('above_roof');
  const [roofType, setRoofType] = useState('standard');
  const [includeExtraClearance, setIncludeExtraClearance] = useState(false);
  const [extraClearance, setExtraClearance] = useState('2');

  const colors = getColors(isDarkMode);

  const requiredClearance = getClearanceRequirement(
    conductorType, 
    location, 
    location === 'above_roof' ? roofType : null
  );
  
  const totalClearance = requiredClearance + (includeExtraClearance ? parseFloat(extraClearance) : 0);
  const specialNotes = getSpecialNotes(conductorType, location, location === 'above_roof' ? roofType : null);
  const safetyRecommendations = getSafetyRecommendations(requiredClearance, location);
  const selectedConductor = conductorTypes.find(t => t.value === conductorType);
  const selectedLocation = clearanceLocations.find(t => t.value === location);
  const selectedRoofType = roofTypes.find(t => t.value === roofType);

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      const pdfData = {
        calculatorName: 'Overhead Clearance Calculator',
        inputs: {
          conductorType: selectedConductor.label,
          location: selectedLocation.label,
          ...(location === 'above_roof' && { roofType: selectedRoofType.label }),
          extraClearance: includeExtraClearance ? `${extraClearance} ft (for safety factor)` : 'None'
        },
        results: {
          minimumClearance: requiredClearance !== null ? `${requiredClearance} feet` : 'See special conditions',
          minimumClearanceInches: requiredClearance !== null ? `${(requiredClearance * 12).toFixed(1)} inches` : 'N/A',
          totalClearance: includeExtraClearance ? `${totalClearance.toFixed(1)} feet` : 'N/A',
          totalClearanceInches: includeExtraClearance ? `${(totalClearance * 12).toFixed(1)} inches` : 'N/A'
        },
        additionalInfo: {
          specialNotes: specialNotes.length > 0 ? specialNotes : ['No special conditions apply'],
          safetyRecommendations: safetyRecommendations,
          conductorDescription: selectedConductor.description
        },
        necReferences: [
          necReferences.mainArticle,
          necReferences.clearanceTable,
          ...(location === 'above_roof' ? [necReferences.roofClearance] : []),
          necReferences.support,
          necReferences.protection
        ]
      };

      exportToPDF(pdfData);
    }
  }));

  return (
    <div style={{ margin: '0 -1rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        {/* Conductor Information */}
        <Section 
          title="Conductor Information" 
          icon={Zap} 
          color="#3b82f6" 
          isDarkMode={isDarkMode}
        >
          <InputGroup 
            label="Conductor Type" 
            helpText={selectedConductor.description}
            isDarkMode={isDarkMode}
          >
            <Select 
              value={conductorType} 
              onChange={(e) => setConductorType(e.target.value)}
              isDarkMode={isDarkMode}
              options={conductorTypes.map(type => ({
                value: type.value,
                label: type.label
              }))}
            />
          </InputGroup>
        </Section>

        {/* Clearance Location */}
        <Section 
          title="Clearance Location" 
          icon={MapPin} 
          color="#10b981" 
          isDarkMode={isDarkMode}
        >
          <InputGroup label="Location Type" isDarkMode={isDarkMode}>
            <Select 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
              isDarkMode={isDarkMode}
              options={clearanceLocations.map(loc => ({
                value: loc.value,
                label: loc.label
              }))}
            />
          </InputGroup>

          {location === 'above_roof' && (
            <InputGroup label="Roof Type" isDarkMode={isDarkMode}>
              <Select 
                value={roofType} 
                onChange={(e) => setRoofType(e.target.value)}
                isDarkMode={isDarkMode}
                options={roofTypes.map(type => ({
                  value: type.value,
                  label: type.label
                }))}
              />
            </InputGroup>
          )}
        </Section>

        {/* Safety Margin */}
        <Section 
          title="Safety Margin (Optional)" 
          icon={Shield} 
          color="#f59e0b" 
          isDarkMode={isDarkMode}
        >
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            cursor: 'pointer', 
            marginBottom: includeExtraClearance ? '0.75rem' : 0 
          }}>
            <input 
              type="checkbox" 
              checked={includeExtraClearance} 
              onChange={(e) => setIncludeExtraClearance(e.target.checked)}
              style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.text }}>
              Add Extra Clearance for Safety Factor
            </span>
          </label>

          {includeExtraClearance && (
            <>
              <InputGroup label="Additional Clearance" isDarkMode={isDarkMode}>
                <Input
                  type="number"
                  value={extraClearance}
                  onChange={(e) => setExtraClearance(e.target.value)}
                  min="0"
                  step="0.5"
                  isDarkMode={isDarkMode}
                  unit="ft"
                />
              </InputGroup>
              
              <InfoBox type="info" isDarkMode={isDarkMode}>
                Adding extra clearance provides additional safety margin beyond NEC minimums.
                Recommended for areas with heavy snow loads or future settling.
              </InfoBox>
            </>
          )}
        </Section>

        {/* Results */}
        {requiredClearance !== null ? (
          <Section 
            title="Required Clearance" 
            icon={CheckCircle} 
            color="#10b981" 
            isDarkMode={isDarkMode}
          >
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: includeExtraClearance ? '1fr 1fr' : '1fr', 
              gap: '0.75rem', 
              marginBottom: '0.75rem' 
            }}>
              <ResultCard
                label="NEC MINIMUM CLEARANCE"
                value={`${requiredClearance}′`}
                unit={`(${(requiredClearance * 12).toFixed(1)} inches)`}
                color="#3b82f6"
                isDarkMode={isDarkMode}
              />
              
              {includeExtraClearance && (
                <ResultCard
                  label="TOTAL WITH SAFETY MARGIN"
                  value={`${totalClearance.toFixed(1)}′`}
                  unit={`(${(totalClearance * 12).toFixed(1)} inches)`}
                  color="#10b981"
                  isDarkMode={isDarkMode}
                />
              )}
            </div>

            {/* Configuration Summary */}
            <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode}>
              <div style={{ fontSize: '0.8125rem' }}>
                <div style={{ marginBottom: '0.25rem' }}>
                  <strong>Conductor:</strong> {selectedConductor.label}
                </div>
                <div style={{ marginBottom: location === 'above_roof' ? '0.25rem' : 0 }}>
                  <strong>Location:</strong> {selectedLocation.label}
                </div>
                {location === 'above_roof' && (
                  <div>
                    <strong>Roof Type:</strong> {selectedRoofType.label}
                  </div>
                )}
              </div>
            </InfoBox>

            {/* Safety Recommendations */}
            {safetyRecommendations.length > 0 && (
              <InfoBox type="info" isDarkMode={isDarkMode} title="Safety Recommendations">
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
                  {safetyRecommendations.map((rec, index) => (
                    <li key={index} style={{ marginBottom: '0.25rem' }}>{rec}</li>
                  ))}
                </ul>
              </InfoBox>
            )}

            {/* Special Notes */}
            {specialNotes.length > 0 && (
              <InfoBox type="warning" icon={AlertTriangle} isDarkMode={isDarkMode} title="Special Considerations">
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem' }}>
                  {specialNotes.map((note, index) => (
                    <li key={index} style={{ marginBottom: '0.25rem' }}>{note}</li>
                  ))}
                </ul>
              </InfoBox>
            )}
          </Section>
        ) : (
          <Section isDarkMode={isDarkMode}>
            <InfoBox type="error" icon={AlertTriangle} isDarkMode={isDarkMode}>
              Unable to determine clearance for this configuration. Please verify NEC requirements.
            </InfoBox>
          </Section>
        )}

        {/* NEC References */}
        <InfoBox type="info" isDarkMode={isDarkMode} title="NEC References">
          <div style={{ fontSize: '0.8125rem' }}>
            <div style={{ marginBottom: '0.25rem' }}>• {necReferences.mainArticle}</div>
            <div style={{ marginBottom: '0.25rem' }}>• {necReferences.clearanceTable}</div>
            {location === 'above_roof' && (
              <div style={{ marginBottom: '0.25rem' }}>• {necReferences.roofClearance}</div>
            )}
            <div style={{ marginBottom: '0.25rem' }}>• {necReferences.support}</div>
            <div>• {necReferences.protection}</div>
          </div>
        </InfoBox>
      </CalculatorLayout>
    </div>
  );
});

export default OverheadClearanceCalculator;