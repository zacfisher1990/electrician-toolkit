import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { AlertTriangle, CheckCircle, Info, Shovel, MapPin, Zap, Shield } from 'lucide-react';
import { exportToPDF } from '../../../utils/pdfExport';
import CalculatorLayout, { 
  Section, 
  InputGroup, 
  Select, 
  ResultCard, 
  InfoBox
} from './CalculatorLayout';

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
    <div style={{ margin: '0 -1rem' }}>
      <CalculatorLayout isDarkMode={isDarkMode}>
        {/* Installation Details */}
        <Section 
          title="Installation Details" 
          icon={Shovel} 
          color="#f59e0b" 
          isDarkMode={isDarkMode}
        >
          <InputGroup 
            label="Installation Type" 
            isDarkMode={isDarkMode}
            helpText={selectedInstallation.description}
          >
            <Select
              value={installationType}
              onChange={(e) => setInstallationType(e.target.value)}
              isDarkMode={isDarkMode}
              options={installationTypes.map(type => ({
                value: type.value,
                label: type.label
              }))}
            />
          </InputGroup>

          <InputGroup label="Location Type" isDarkMode={isDarkMode}>
            <Select
              value={locationType}
              onChange={(e) => setLocationType(e.target.value)}
              isDarkMode={isDarkMode}
              options={locationTypes.map(location => ({
                value: location.value,
                label: location.label
              }))}
            />
          </InputGroup>

          <InputGroup label="Voltage Rating" isDarkMode={isDarkMode}>
            <Select
              value={voltage}
              onChange={(e) => setVoltage(e.target.value)}
              isDarkMode={isDarkMode}
              options={voltageRatings.map(rating => ({
                value: rating.value,
                label: rating.label
              }))}
            />
          </InputGroup>
        </Section>

        {/* Results */}
        <Section isDarkMode={isDarkMode}>
          {requiredDepth !== null ? (
            <>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: useWarningTape && requiredDepth >= 12 ? 'repeat(auto-fit, minmax(150px, 1fr))' : '1fr', 
                gap: '0.75rem', 
                marginBottom: '0.75rem' 
              }}>
                <ResultCard
                  label="Minimum Depth"
                  value={`${requiredDepth}"`}
                  unit={`(${(requiredDepth / 12).toFixed(2)} feet)`}
                  color="#3b82f6"
                  variant="prominent"
                  isDarkMode={isDarkMode}
                />
                
                {useWarningTape && requiredDepth >= 12 && (
                  <ResultCard
                    label="Warning Tape Depth"
                    value={`${requiredDepth - 12}"`}
                    unit="(12&quot; above cable)"
                    color="#f59e0b"
                    variant="prominent"
                    isDarkMode={isDarkMode}
                  />
                )}
              </div>

              <InfoBox type="success" icon={CheckCircle} isDarkMode={isDarkMode}>
                <div style={{ fontSize: '0.8125rem' }}>
                  <div><strong>Installation:</strong> {selectedInstallation.label}</div>
                  <div><strong>Location:</strong> {selectedLocation.label}</div>
                  <div><strong>Voltage:</strong> {voltage === '0-600' ? '0-600V' : 'Over 600V'}</div>
                </div>
              </InfoBox>

              <InfoBox type="info" icon={Info} isDarkMode={isDarkMode} title="Protection Recommendation">
                <div style={{ fontSize: '0.8125rem' }}>
                  {protectionInfo}
                </div>
              </InfoBox>
            </>
          ) : (
            <InfoBox type="error" icon={AlertTriangle} isDarkMode={isDarkMode}>
              <div style={{ fontSize: '0.8125rem' }}>
                Unable to determine depth for this configuration. Please verify NEC requirements.
              </div>
            </InfoBox>
          )}

          {specialNotes.length > 0 && (
            <InfoBox type="warning" icon={AlertTriangle} isDarkMode={isDarkMode} title="Special Considerations">
              <div style={{ fontSize: '0.8125rem' }}>
                <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
                  {specialNotes.map((note, index) => (
                    <li key={index} style={{ marginBottom: '0.25rem' }}>{note}</li>
                  ))}
                </ul>
              </div>
            </InfoBox>
          )}
        </Section>

        {/* NEC References */}
        <InfoBox type="info" isDarkMode={isDarkMode}>
          <div style={{ fontWeight: '600', marginBottom: '0.5rem' }}>
            NEC References:
          </div>
          <div style={{ fontSize: '0.8125rem' }}>
            Table 300.5 (Cover Requirements) • 300.5(A) (Minimum Cover) • 300.5(D) (Protection) • 300.5(F) (Backfill)
          </div>
        </InfoBox>
      </CalculatorLayout>
    </div>
  );
});

export default UndergroundDepthCalculator;