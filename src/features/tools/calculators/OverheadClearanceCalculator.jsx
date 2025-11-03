import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { exportToPDF } from '../../../utils/pdfExport';

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
  { value: 'above_roof', label: 'Above Roofs', subcategories: true },
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
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Conductor Type Selection */}
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
          Conductor Information
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
              Conductor Type
            </label>
            <select 
              value={conductorType} 
              onChange={(e) => setConductorType(e.target.value)}
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
              {conductorTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <div style={{ 
              fontSize: '0.75rem', 
              color: colors.labelText, 
              marginTop: '0.5rem',
              fontStyle: 'italic'
            }}>
              {selectedConductor.description}
            </div>
          </div>
        </div>
      </div>

      {/* Location Selection */}
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
          Clearance Location
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
              Location Type
            </label>
            <select 
              value={location} 
              onChange={(e) => setLocation(e.target.value)}
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
              {clearanceLocations.map(loc => (
                <option key={loc.value} value={loc.value}>
                  {loc.label}
                </option>
              ))}
            </select>
          </div>

          {location === 'above_roof' && (
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: colors.labelText,
                marginBottom: '0.5rem' 
              }}>
                Roof Type
              </label>
              <select 
                value={roofType} 
                onChange={(e) => setRoofType(e.target.value)}
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
                {roofTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Additional Safety Margin */}
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
          Safety Margin (Optional)
        </h3>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', marginBottom: '1rem' }}>
          <input 
            type="checkbox" 
            checked={includeExtraClearance} 
            onChange={(e) => setIncludeExtraClearance(e.target.checked)}
            style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.labelText }}>
            Add Extra Clearance for Safety Factor
          </span>
        </label>

        {includeExtraClearance && (
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '0.875rem', 
              fontWeight: '500', 
              color: colors.labelText,
              marginBottom: '0.5rem' 
            }}>
              Additional Clearance (feet)
            </label>
            <input
              type="number"
              value={extraClearance}
              onChange={(e) => setExtraClearance(e.target.value)}
              min="0"
              step="0.5"
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
            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${colors.cardBorder}`,
              marginTop: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
                <Info size={18} color="#3b82f6" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                <div style={{ fontSize: '0.875rem', color: colors.labelText, lineHeight: '1.5' }}>
                  Adding extra clearance provides additional safety margin beyond NEC minimums.
                  Recommended for areas with heavy snow loads or future settling.
                </div>
              </div>
            </div>
          </div>
        )}
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
          Required Clearance
        </h3>
        
        {requiredClearance !== null ? (
          <>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: includeExtraClearance ? '1fr 1fr' : '1fr', 
              gap: '1rem', 
              marginBottom: '1rem' 
            }}>
              <div style={{
                background: '#dbeafe',
                padding: '1.5rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.5rem', fontWeight: '600' }}>
                  NEC MINIMUM CLEARANCE
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e40af', lineHeight: '1' }}>
                  {requiredClearance}′
                </div>
                <div style={{ fontSize: '0.875rem', color: '#1e40af', marginTop: '0.5rem' }}>
                  ({(requiredClearance * 12).toFixed(1)} inches)
                </div>
              </div>
              
              {includeExtraClearance && (
                <div style={{
                  background: '#d1fae5',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#047857', marginBottom: '0.5rem', fontWeight: '600' }}>
                    TOTAL WITH SAFETY MARGIN
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#047857', lineHeight: '1' }}>
                    {totalClearance.toFixed(1)}′
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#047857', marginTop: '0.5rem' }}>
                    ({(totalClearance * 12).toFixed(1)} inches)
                  </div>
                </div>
              )}
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
                  <div><strong>Conductor:</strong> {selectedConductor.label}</div>
                  <div><strong>Location:</strong> {selectedLocation.label}</div>
                  {location === 'above_roof' && (
                    <div><strong>Roof Type:</strong> {selectedRoofType.label}</div>
                  )}
                </div>
              </div>
            </div>

            {safetyRecommendations.length > 0 && (
              <div style={{
                background: colors.sectionBg,
                padding: '1rem',
                borderRadius: '8px',
                border: `1px solid ${colors.cardBorder}`,
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.875rem', color: colors.labelText, lineHeight: '1.5' }}>
                  <div style={{ fontWeight: '600', color: colors.cardText, marginBottom: '0.5rem' }}>
                    Safety Recommendations:
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                    {safetyRecommendations.map((rec, index) => (
                      <li key={index} style={{ marginBottom: '0.25rem' }}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
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
                Unable to determine clearance for this configuration. Please verify NEC requirements.
              </div>
            </div>
          </div>
        )}

        {specialNotes.length > 0 && (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <AlertTriangle size={20} color="#d97706" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
              <div style={{ fontSize: '0.875rem', color: '#92400e', lineHeight: '1.5' }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Special Considerations:</div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {specialNotes.map((note, index) => (
                    <li key={index} style={{ marginBottom: '0.25rem' }}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* NEC Reference */}
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
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.clearanceTable}</div>
          {location === 'above_roof' && (
            <div style={{ marginBottom: '0.5rem' }}>• {necReferences.roofClearance}</div>
          )}
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.support}</div>
          <div>• {necReferences.protection}</div>
        </div>
      </div>
    </div>
  );
});

export default OverheadClearanceCalculator;