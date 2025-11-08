// NEC Support Spacing Requirements
// Articles 300.11, 334, 344, 352, 358, and others

export const materialTypes = [
  { value: 'cable', label: 'Cables' },
  { value: 'conduit', label: 'Conduit/Raceway' }
];

// Cable support spacing requirements
// Based on NEC Article 334.30 for NM Cable and similar requirements for other cables
export const cableTypes = {
  'nm-cable': {
    name: 'NM Cable (Romex)',
    horizontal: 4.5, // feet
    vertical: 4.5, // feet
    termination: 12, // inches
    necRef: '334.30',
    notes: 'Secured within 12 inches of box/enclosure and every 4.5 feet thereafter'
  },
  'ac-cable': {
    name: 'AC Cable (BX)',
    horizontal: 4.5,
    vertical: 4.5,
    termination: 12,
    necRef: '320.30',
    notes: 'Secured within 12 inches of box/enclosure and every 4.5 feet thereafter'
  },
  'mc-cable': {
    name: 'MC Cable',
    horizontal: 6,
    vertical: 6,
    termination: 12,
    necRef: '330.30',
    notes: 'Secured within 12 inches of box/enclosure and every 6 feet thereafter'
  },
  'uf-cable': {
    name: 'UF Cable',
    horizontal: 4.5,
    vertical: 4.5,
    termination: 12,
    necRef: '340.30',
    notes: 'Secured within 12 inches of box/enclosure and every 4.5 feet thereafter'
  },
  'se-cable': {
    name: 'SE/USE Cable',
    horizontal: 4.5,
    vertical: 4.5,
    termination: 12,
    necRef: '338.10(B)(4)(a)',
    notes: 'Secured at intervals not exceeding 4.5 feet'
  }
};

// Conduit support spacing requirements
// Varies by conduit type and size
export const conduitTypes = {
  'emt': {
    name: 'EMT (Electrical Metallic Tubing)',
    necRef: '358.30',
    horizontal: {
      '1/2': 10,
      '3/4': 10,
      '1': 10,
      '1-1/4': 10,
      '1-1/2': 10,
      '2': 10,
      '2-1/2': 10,
      '3': 10,
      '3-1/2': 10,
      '4': 10
    },
    vertical: 10,
    termination: 3,
    notes: 'Secured within 3 feet of box/enclosure and every 10 feet thereafter'
  },
  'rigid-metal': {
    name: 'Rigid Metal Conduit (RMC)',
    necRef: '344.30',
    horizontal: {
      '1/2': 10,
      '3/4': 10,
      '1': 12,
      '1-1/4': 14,
      '1-1/2': 14,
      '2': 14,
      '2-1/2': 16,
      '3': 16,
      '3-1/2': 16,
      '4': 16,
      '5': 20,
      '6': 20
    },
    vertical: 20,
    termination: 3,
    notes: 'Secured within 3 feet of box/enclosure and at intervals per NEC Table 344.30(B)(2)'
  },
  'imc': {
    name: 'IMC (Intermediate Metal Conduit)',
    necRef: '342.30',
    horizontal: {
      '1/2': 10,
      '3/4': 10,
      '1': 12,
      '1-1/4': 14,
      '1-1/2': 14,
      '2': 14,
      '2-1/2': 16,
      '3': 16,
      '3-1/2': 16,
      '4': 16,
      '5': 20,
      '6': 20
    },
    vertical: 20,
    termination: 3,
    notes: 'Secured within 3 feet of box/enclosure and at intervals per NEC Table 342.30(B)(2)'
  },
  'pvc-schedule-40': {
    name: 'PVC Schedule 40',
    necRef: '352.30',
    horizontal: {
      '1/2': 3,
      '3/4': 3,
      '1': 3,
      '1-1/4': 3,
      '1-1/2': 3,
      '2': 4,
      '2-1/2': 4,
      '3': 5,
      '3-1/2': 5,
      '4': 5,
      '5': 6,
      '6': 6
    },
    vertical: 6,
    termination: 3,
    notes: 'Secured within 3 feet of box/enclosure and at intervals per NEC Table 352.30(B)'
  },
  'pvc-schedule-80': {
    name: 'PVC Schedule 80',
    necRef: '352.30',
    horizontal: {
      '1/2': 3,
      '3/4': 3,
      '1': 3,
      '1-1/4': 3,
      '1-1/2': 3,
      '2': 5,
      '2-1/2': 5,
      '3': 6,
      '3-1/2': 6,
      '4': 6,
      '5': 7,
      '6': 8
    },
    vertical: 6,
    termination: 3,
    notes: 'Secured within 3 feet of box/enclosure and at intervals per NEC Table 352.30(B)'
  },
  'flexible-metal': {
    name: 'Flexible Metal Conduit (FMC)',
    necRef: '348.30',
    horizontal: 4.5,
    vertical: 4.5,
    termination: 12,
    notes: 'Secured within 12 inches of box/enclosure and every 4.5 feet thereafter'
  },
  'lfmc': {
    name: 'LFMC (Liquidtight Flexible Metal)',
    necRef: '350.30',
    horizontal: 4.5,
    vertical: 4.5,
    termination: 12,
    notes: 'Secured within 12 inches of box/enclosure and every 4.5 feet thereafter'
  },
  'lfnc': {
    name: 'LFNC (Liquidtight Flexible Nonmetallic)',
    necRef: '356.30',
    horizontal: 3,
    vertical: 3,
    termination: 12,
    notes: 'Secured within 12 inches of box/enclosure and every 3 feet thereafter'
  }
};

// Available conduit sizes
export const conduitSizes = [
  '1/2', '3/4', '1', '1-1/4', '1-1/2', '2', '2-1/2', '3', '3-1/2', '4', '5', '6'
];

// Helper functions
export const getCableSpacing = (cableType, orientation) => {
  const cable = cableTypes[cableType];
  if (!cable) return null;
  
  return {
    spacing: orientation === 'horizontal' ? cable.horizontal : cable.vertical,
    termination: cable.termination,
    name: cable.name,
    necRef: cable.necRef,
    notes: cable.notes
  };
};

export const getConduitSpacing = (conduitType, size, orientation) => {
  const conduit = conduitTypes[conduitType];
  if (!conduit) return null;
  
  let spacing;
  if (orientation === 'horizontal') {
    // Check if horizontal spacing varies by size
    if (typeof conduit.horizontal === 'object') {
      spacing = conduit.horizontal[size] || null;
    } else {
      spacing = conduit.horizontal;
    }
  } else {
    spacing = conduit.vertical;
  }
  
  return {
    spacing,
    termination: conduit.termination,
    name: conduit.name,
    necRef: conduit.necRef,
    notes: conduit.notes
  };
};

// General NEC requirements
export const generalRequirements = {
  title: 'NEC 300.11 - General Requirements',
  rules: [
    'Raceways, cable assemblies, boxes, cabinets, and fittings shall be securely fastened in place',
    'Support methods must be suitable for the environment (wet, corrosive, etc.)',
    'Conduit and cable assemblies shall not be used as a means of support for other cables',
    'Vertical runs require support to prevent stress on terminations',
    'Support within listed distances from termination points prevents strain on connections'
  ]
};

export const necReferences = {
  cables: {
    '334.30': 'NM Cable - Securing and Supporting',
    '320.30': 'AC Cable - Securing and Supporting',
    '330.30': 'MC Cable - Securing and Supporting',
    '340.30': 'UF Cable - Securing and Supporting',
    '338.10': 'SE/USE Cable - Installation'
  },
  conduits: {
    '344.30': 'Rigid Metal Conduit - Securing and Supporting',
    '342.30': 'IMC - Securing and Supporting',
    '352.30': 'PVC - Securing and Supporting',
    '358.30': 'EMT - Securing and Supporting',
    '348.30': 'FMC - Securing and Supporting',
    '350.30': 'LFMC - Securing and Supporting',
    '356.30': 'LFNC - Securing and Supporting'
  }
};