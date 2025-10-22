import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { exportToPDF } from '../../utils/pdfExport';

// NEC Table 300.5 - Underground Installation Depths
const installationTypes = [
  { 
    value: 'direct_burial', 
    label: 'Direct Burial Cables or Conductors',
    description: 'Cables rated for direct burial without additional protection'
  },
  { 
    value: 'rigid_metal', 
    label: 'Rigid Metal Conduit (RMC) or IMC',
    description: 'Galvanized rigid metal conduit or intermediate metal conduit'
  },
  { 
    value: 'nonmetallic', 
    label: 'Nonmetallic Raceways',
    description: 'PVC, HDPE, or other approved nonmetallic conduit'
  },
  { 
    value: 'residential_gfci', 
    label: 'Residential Branch Circuits (GFCI, ≤20A, 120V)',
    description: 'GFCI-protected residential circuits 20A or less at 120V'
  }
];

const locationTypes = [
  { value: 'general', label: 'General (Open Areas, Yards)' },
  { value: 'under_building', label: 'Under Building (4" Concrete)' },
  { value: 'under_street', label: 'Under Streets, Highways, Roads' },
  { value: 'parking', label: 'Parking Areas (Light Traffic)' },
  { value: 'one_family', label: 'One & Two Family Dwelling Driveways' }
];

const voltageRatings = [
  { value: '0-600', label: '0-600V' },
  { value: 'over_600', label: 'Over 600V' }
];

// Depth requirements in inches based on NEC Table 300.5
const getDepthRequirement = (installationType, locationType, voltage) => {
  const depthTable = {
    'direct_burial': {
      'general': { '0-600': 24, 'over_600': 30 },
      'under_building': { '0-600': 0, 'over_600': 0 },
      'under_street': { '0-600': 24, 'over_600': 30 },
      'parking': { '0-600': 24, 'over_600': 30 },
      'one_family': { '0-600': 24, 'over_600': 30 }
    },
    'rigid_metal': {
      'general': { '0-600': 6, 'over_600': 6 },
      'under_building': { '0-600': 0, 'over_600': 0 },
      'under_street': { '0-600': 24, 'over_600': 24 },
      'parking': { '0-600': 18, 'over_600': 18 },
      'one_family': { '0-600': 18, 'over_600': 18 }
    },
    'nonmetallic': {
      'general': { '0-600': 18, 'over_600': 18 },
      'under_building': { '0-600': 0, 'over_600': 0 },
      'under_street': { '0-600': 24, 'over_600': 24 },
      'parking': { '0-600': 18, 'over_600': 18 },
      'one_family': { '0-600': 18, 'over_600': 18 }
    },
    'residential_gfci': {
      'general': { '0-600': 12, 'over_600': 12 },
      'under_building': { '0-600': 0, 'over_600': 0 },
      'under_street': { '0-600': 24, 'over_600': 24 },
      'parking': { '0-600': 12, 'over_600': 12 },
      'one_family': { '0-600': 12, 'over_600': 12 }
    }
  };

  return depthTable[installationType]?.[locationType]?.[voltage] ?? null;
};

const getSpecialNotes = (installationType, locationType, voltage) => {
  const notes = [];

  if (locationType === 'under_building') {
    notes.push('Raceways in or under buildings require no minimum cover. NEC 300.5(A) Exception');
  }

  if (locationType === 'under_street') {
    notes.push('Additional protection may be required by local jurisdiction');
    notes.push('Consider using concrete encasement for added protection');
  }

  if (installationType === 'residential_gfci') {
    notes.push('Limited to residential branch circuits rated 20A or less at 120V');
    notes.push('Must be GFCI protected at origin');
    notes.push('Must have no more than 120V between conductors');
  }

  if (installationType === 'direct_burial' && locationType === 'parking') {
    notes.push('Direct burial under parking areas subject to heavy vehicles requires 24" depth');
  }

  if (voltage === 'over_600') {
    notes.push('Medium voltage installations require special considerations');
    notes.push('Verify local requirements for over 600V installations');
  }

  return notes;
};

const getProtectionOptions = (depth) => {
  if (depth === 0) {
    return 'No minimum cover required when in or under building';
  }
  if (depth >= 24) {
    return 'Standard depth provides adequate protection';
  }
  if (depth >= 18) {
    return 'Consider additional physical protection in high-traffic areas';
  }
  if (depth >= 12) {
    return 'Warning tape recommended 12" above installation';
  }
  return 'Verify installation meets all NEC requirements';
};

const necReferences = {
  mainTable: 'NEC Table 300.5 - Minimum Cover Requirements',
  column: 'NEC 300.5(A) - Minimum Cover Requirements',
  exceptions: 'NEC 300.5(A) Exceptions',
  protection: 'NEC 300.5(D) - Protection from Damage',
  splices: 'NEC 300.5(E) - Splices and Taps',
  backfill: 'NEC 300.5(F) - Backfill',
  raceway: 'NEC 300.5(I) - Raceway Seals'
};

const UndergroundDepthCalculator = forwardRef(({ isDarkMode = false, onBack }, ref) => {
  const [installationType, setInstallationType] = useState('direct_burial');
  const [locationType, setLocationType] = useState('general');
  const [voltage, setVoltage] = useState('0-600');
  const [useWarningTape, setUseWarningTape] = useState(true);

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

  const requiredDepth = getDepthRequirement(installationType, locationType, voltage);
  const specialNotes = getSpecialNotes(installationType, locationType, voltage);
  const protectionInfo = getProtectionOptions(requiredDepth);
  const selectedInstallation = installationTypes.find(t => t.value === installationType);
  const selectedLocation = locationTypes.find(t => t.value === locationType);

  // Expose exportPDF function to parent via ref
  useImperativeHandle(ref, () => ({
    exportPDF: () => {
      const pdfData = {
        calculatorName: 'Underground Depth Requirements Calculator',
        inputs: {
          installationType: selectedInstallation.label,
          locationType: selectedLocation.label,
          voltageRating: voltage === '0-600' ? '0-600V' : 'Over 600V',
          warningTape: useWarningTape ? 'Yes (Recommended)' : 'No'
        },
        results: {
          minimumDepth: requiredDepth !== null ? `${requiredDepth} inches` : 'See special conditions',
          depthInFeet: requiredDepth !== null ? `${(requiredDepth / 12).toFixed(2)} feet` : 'N/A',
          warningTapeDepth: useWarningTape && requiredDepth >= 12 ? `${requiredDepth - 12} inches from surface` : 'N/A',
          protectionRecommendation: protectionInfo
        },
        additionalInfo: {
          specialNotes: specialNotes.length > 0 ? specialNotes : ['No special conditions apply'],
          installationDescription: selectedInstallation.description
        },
        necReferences: [
          necReferences.mainTable,
          necReferences.column,
          necReferences.protection,
          necReferences.backfill,
          ...(specialNotes.length > 0 ? [necReferences.exceptions] : [])
        ]
      };

      exportToPDF(pdfData);
    }
  }));

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Installation Type Selection */}
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
          Installation Details
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
              Installation Type
            </label>
            <select 
              value={installationType} 
              onChange={(e) => setInstallationType(e.target.value)}
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
              {installationTypes.map(type => (
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
              {selectedInstallation.description}
            </div>
          </div>

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
              value={locationType} 
              onChange={(e) => setLocationType(e.target.value)}
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
              {locationTypes.map(location => (
                <option key={location.value} value={location.value}>
                  {location.label}
                </option>
              ))}
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
              Voltage Rating
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
              {voltageRatings.map(rating => (
                <option key={rating.value} value={rating.value}>
                  {rating.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Additional Options */}
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
          Additional Protection
        </h3>
        
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={useWarningTape} 
            onChange={(e) => setUseWarningTape(e.target.checked)}
            style={{ width: '1.125rem', height: '1.125rem', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '0.875rem', fontWeight: '500', color: colors.labelText }}>
            Use Warning/Detectable Tape (Recommended)
          </span>
        </label>

        {useWarningTape && requiredDepth >= 12 && (
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
                Install warning tape approximately 12 inches above the cable/conduit.
                Tape depth: <strong style={{ color: colors.cardText }}>{requiredDepth - 12} inches</strong> from surface.
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
          Required Burial Depth
        </h3>
        
        {requiredDepth !== null ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{
                background: '#dbeafe',
                padding: '1.5rem',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '0.75rem', color: '#1e40af', marginBottom: '0.5rem', fontWeight: '600' }}>
                  MINIMUM DEPTH
                </div>
                <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#1e40af', lineHeight: '1' }}>
                  {requiredDepth}"
                </div>
                <div style={{ fontSize: '0.875rem', color: '#1e40af', marginTop: '0.5rem' }}>
                  ({(requiredDepth / 12).toFixed(2)} feet)
                </div>
              </div>
              
              {useWarningTape && requiredDepth >= 12 && (
                <div style={{
                  background: '#fef3c7',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.75rem', color: '#92400e', marginBottom: '0.5rem', fontWeight: '600' }}>
                    WARNING TAPE DEPTH
                  </div>
                  <div style={{ fontSize: '2.5rem', fontWeight: '700', color: '#92400e', lineHeight: '1' }}>
                    {requiredDepth - 12}"
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#92400e', marginTop: '0.5rem' }}>
                    (12" above cable)
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
                  <div><strong>Installation:</strong> {selectedInstallation.label}</div>
                  <div><strong>Location:</strong> {selectedLocation.label}</div>
                  <div><strong>Voltage:</strong> {voltage === '0-600' ? '0-600V' : 'Over 600V'}</div>
                </div>
              </div>
            </div>

            <div style={{
              background: colors.sectionBg,
              padding: '1rem',
              borderRadius: '8px',
              border: `1px solid ${colors.cardBorder}`,
              marginBottom: '1rem'
            }}>
              <div style={{ fontSize: '0.875rem', color: colors.labelText, lineHeight: '1.5' }}>
                <div style={{ fontWeight: '600', color: colors.cardText, marginBottom: '0.5rem' }}>
                  Protection Recommendation:
                </div>
                {protectionInfo}
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
                Unable to determine depth for this configuration. Please verify NEC requirements.
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
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.mainTable}</div>
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.column}</div>
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.protection}</div>
          <div style={{ marginBottom: '0.5rem' }}>• {necReferences.backfill}</div>
          {specialNotes.length > 0 && (
            <div>• {necReferences.exceptions}</div>
          )}
        </div>
      </div>
    </div>
  );
});

export default UndergroundDepthCalculator;