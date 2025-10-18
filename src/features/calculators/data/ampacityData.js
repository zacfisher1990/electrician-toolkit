// NEC Table 310.16 - Allowable Ampacities of Insulated Conductors
// NEC 310.15(B)(2)(a) - Temperature Correction Factors
// NEC 310.15(B)(3)(a) - Conductor Bundling Adjustment Factors

// Wire materials
export const wireMaterials = [
  { value: 'copper', label: 'Copper' },
  { value: 'aluminum', label: 'Aluminum' }
];

// Temperature ratings
export const temperatureRatings = [
  { value: '60C', label: '60°C (140°F)' },
  { value: '75C', label: '75°C (167°F)' },
  { value: '90C', label: '90°C (194°F)' }
];

// Wire sizes (AWG and kcmil)
export const wireSizes = [
  { value: '18', label: '18 AWG' },
  { value: '16', label: '16 AWG' },
  { value: '14', label: '14 AWG' },
  { value: '12', label: '12 AWG' },
  { value: '10', label: '10 AWG' },
  { value: '8', label: '8 AWG' },
  { value: '6', label: '6 AWG' },
  { value: '4', label: '4 AWG' },
  { value: '3', label: '3 AWG' },
  { value: '2', label: '2 AWG' },
  { value: '1', label: '1 AWG' },
  { value: '1/0', label: '1/0 AWG' },
  { value: '2/0', label: '2/0 AWG' },
  { value: '3/0', label: '3/0 AWG' },
  { value: '4/0', label: '4/0 AWG' },
  { value: '250', label: '250 kcmil' },
  { value: '300', label: '300 kcmil' },
  { value: '350', label: '350 kcmil' },
  { value: '400', label: '400 kcmil' },
  { value: '500', label: '500 kcmil' },
  { value: '600', label: '600 kcmil' },
  { value: '700', label: '700 kcmil' },
  { value: '750', label: '750 kcmil' },
  { value: '800', label: '800 kcmil' },
  { value: '900', label: '900 kcmil' },
  { value: '1000', label: '1000 kcmil' },
  { value: '1250', label: '1250 kcmil' },
  { value: '1500', label: '1500 kcmil' },
  { value: '1750', label: '1750 kcmil' },
  { value: '2000', label: '2000 kcmil' }
];

// Ambient temperature options
export const ambientTemperatures = [
  { value: '10', label: '10°C (50°F)' },
  { value: '15', label: '15°C (59°F)' },
  { value: '20', label: '20°C (68°F)' },
  { value: '25', label: '25°C (77°F)' },
  { value: '30', label: '30°C (86°F) - Standard' },
  { value: '35', label: '35°C (95°F)' },
  { value: '40', label: '40°C (104°F)' },
  { value: '45', label: '45°C (113°F)' },
  { value: '50', label: '50°C (122°F)' }
];

// Base ampacity data from NEC Table 310.16
export const ampacityData = {
  copper: {
    '60C': {
      '18': 0, '16': 0,
      '14': 15, '12': 20, '10': 30, '8': 40, '6': 55, '4': 70, '3': 85,
      '2': 95, '1': 110, '1/0': 125, '2/0': 145, '3/0': 165, '4/0': 195,
      '250': 215, '300': 240, '350': 260, '400': 280, '500': 320,
      '600': 350, '700': 385, '750': 400, '800': 410, '900': 435,
      '1000': 455, '1250': 495, '1500': 525, '1750': 545, '2000': 555
    },
    '75C': {
      '18': 0, '16': 0,
      '14': 20, '12': 25, '10': 35, '8': 50, '6': 65, '4': 85, '3': 100,
      '2': 115, '1': 130, '1/0': 150, '2/0': 175, '3/0': 200, '4/0': 230,
      '250': 255, '300': 285, '350': 310, '400': 335, '500': 380,
      '600': 420, '700': 460, '750': 475, '800': 490, '900': 520,
      '1000': 545, '1250': 590, '1500': 625, '1750': 650, '2000': 665
    },
    '90C': {
      '18': 14, '16': 18,
      '14': 25, '12': 30, '10': 40, '8': 55, '6': 75, '4': 95, '3': 115,
      '2': 130, '1': 150, '1/0': 170, '2/0': 195, '3/0': 225, '4/0': 260,
      '250': 290, '300': 320, '350': 350, '400': 380, '500': 430,
      '600': 475, '700': 520, '750': 535, '800': 555, '900': 585,
      '1000': 615, '1250': 665, '1500': 705, '1750': 735, '2000': 750
    }
  },
  aluminum: {
    '60C': {
      '18': 0, '16': 0, '14': 0,
      '12': 15, '10': 25, '8': 30, '6': 40, '4': 55, '3': 65,
      '2': 75, '1': 85, '1/0': 100, '2/0': 115, '3/0': 130, '4/0': 150,
      '250': 170, '300': 195, '350': 210, '400': 225, '500': 260,
      '600': 285, '700': 310, '750': 320, '800': 330, '900': 355,
      '1000': 375, '1250': 405, '1500': 435, '1750': 455, '2000': 470
    },
    '75C': {
      '18': 0, '16': 0, '14': 0,
      '12': 20, '10': 30, '8': 40, '6': 50, '4': 65, '3': 75,
      '2': 90, '1': 100, '1/0': 120, '2/0': 135, '3/0': 155, '4/0': 180,
      '250': 205, '300': 230, '350': 250, '400': 270, '500': 310,
      '600': 340, '700': 375, '750': 385, '800': 395, '900': 425,
      '1000': 445, '1250': 485, '1500': 520, '1750': 545, '2000': 560
    },
    '90C': {
      '18': 0, '16': 0, '14': 0,
      '12': 25, '10': 35, '8': 45, '6': 55, '4': 75, '3': 85,
      '2': 100, '1': 115, '1/0': 135, '2/0': 150, '3/0': 175, '4/0': 205,
      '250': 230, '300': 260, '350': 280, '400': 305, '500': 350,
      '600': 385, '700': 420, '750': 435, '800': 445, '900': 480,
      '1000': 500, '1250': 545, '1500': 585, '1750': 615, '2000': 630
    }
  }
};

// Temperature correction factors from NEC 310.15(B)(2)(a)
export const tempCorrectionFactors = {
  '60C': {
    '10': 1.29, '15': 1.20, '20': 1.11, '25': 1.05, '30': 1.00,
    '35': 0.94, '40': 0.88, '45': 0.82, '50': 0.75, '55': 0.67,
    '60': 0.58, '65': 0.47, '70': 0.33
  },
  '75C': {
    '10': 1.20, '15': 1.15, '20': 1.11, '25': 1.05, '30': 1.00,
    '35': 0.94, '40': 0.88, '45': 0.82, '50': 0.75, '55': 0.67,
    '60': 0.58, '65': 0.47, '70': 0.33, '75': 0.00
  },
  '90C': {
    '10': 1.15, '15': 1.12, '20': 1.08, '25': 1.04, '30': 1.00,
    '35': 0.96, '40': 0.91, '45': 0.87, '50': 0.82, '55': 0.76,
    '60': 0.71, '65': 0.65, '70': 0.58, '75': 0.50, '80': 0.41,
    '85': 0.29, '90': 0.00
  }
};

// Overcurrent protection device limits for small conductors (NEC 240.4(D))
export const ocpdLimits = {
  copper: {
    '14': 15,
    '12': 20,
    '10': 30
  },
  aluminum: {
    '12': 15,
    '10': 25
  }
};

// Helper function to get base ampacity
export const getBaseAmpacity = (material, tempRating, wireSize) => {
  return ampacityData[material]?.[tempRating]?.[wireSize] || 0;
};

// Helper function to get temperature correction factor
export const getTempCorrectionFactor = (tempRating, ambientTemp) => {
  return tempCorrectionFactors[tempRating]?.[ambientTemp] || 1.00;
};

// Helper function to get conductor adjustment factor based on number of conductors
export const getConductorAdjustmentFactor = (numConductors) => {
  const num = parseInt(numConductors);
  if (num <= 3) return 1.00;
  if (num <= 6) return 0.80;
  if (num <= 9) return 0.70;
  if (num <= 20) return 0.50;
  if (num <= 30) return 0.45;
  if (num <= 40) return 0.40;
  return 0.35;
};

// Helper function to get OCPD limit
export const getOCPDLimit = (material, wireSize) => {
  return ocpdLimits[material]?.[wireSize] || null;
};

// Helper function to get common applications based on ampacity
export const getCommonApplications = (ampacity, wireSize) => {
  // Special cases for very small wire sizes
  if (wireSize === '18') return "Thermostats, lighting controls, doorbells, signaling circuits";
  if (wireSize === '16') return "Electronics, lighting control systems, doorbells, low-voltage applications";
  
  // Based on ampacity ranges
  if (ampacity <= 15) return "Lighting circuits, small appliances";
  if (ampacity <= 20) return "Lighting circuits, small appliances";
  if (ampacity <= 25) return "General outlets, lighting circuits";
  if (ampacity <= 30) return "Small appliances, dryers (240V)";
  if (ampacity <= 40) return "Electric ranges, large appliances";
  if (ampacity <= 50) return "Electric ranges, welders, heat pumps";
  if (ampacity <= 100) return "Sub-panels, large motors";
  if (ampacity <= 200) return "Main panels, large commercial loads";
  if (ampacity <= 400) return "Service entrances, large commercial/industrial applications";
  if (ampacity <= 600) return "Large service entrances, industrial feeders";
  return "Large industrial services, utility connections";
};

// Helper function to calculate derated ampacity
export const calculateDeratedAmpacity = (
  baseAmpacity,
  tempRating,
  ambientTemp,
  numConductors,
  continuousLoad
) => {
  const tempFactor = getTempCorrectionFactor(tempRating, ambientTemp);
  const conductorFactor = getConductorAdjustmentFactor(numConductors);
  
  let deratedAmpacity = baseAmpacity * tempFactor * conductorFactor;
  
  let continuousAmpacity = deratedAmpacity;
  if (continuousLoad) {
    continuousAmpacity = deratedAmpacity * 0.8;
  }
  
  return {
    base: baseAmpacity,
    tempFactor,
    conductorFactor,
    derated: Math.round(deratedAmpacity * 10) / 10,
    continuous: Math.round(continuousAmpacity * 10) / 10
  };
};

// Helper function to format temperature rating for display
export const formatTempRating = (tempRating) => {
  const labels = {
    '60C': '60°C (140°F)',
    '75C': '75°C (167°F)',
    '90C': '90°C (194°F)'
  };
  return labels[tempRating] || tempRating;
};

// Helper function to format ambient temperature for display
export const formatAmbientTemp = (temp) => {
  const temps = {
    '10': '10°C (50°F)',
    '15': '15°C (59°F)',
    '20': '20°C (68°F)',
    '25': '25°C (77°F)',
    '30': '30°C (86°F)',
    '35': '35°C (95°F)',
    '40': '40°C (104°F)',
    '45': '45°C (113°F)',
    '50': '50°C (122°F)'
  };
  return temps[temp] || `${temp}°C`;
};

// Helper function to format wire size for display
export const formatWireSize = (wireSize) => {
  if (wireSize.includes('/')) {
    return `${wireSize} AWG`;
  }
  return parseInt(wireSize) <= 16 ? `${wireSize} AWG` : `${wireSize} kcmil`;
};

// NEC Reference Information
export const necReferences = {
  ampacityTable: 'NEC Table 310.16 - Allowable Ampacities of Insulated Conductors',
  tempCorrection: 'NEC 310.15(B)(2)(a) - Temperature Correction Factors',
  conductorAdjustment: 'NEC 310.15(B)(3)(a) - Conductor Bundling Adjustment Factors',
  ocpdLimit: 'NEC 240.4(D) - Small Conductor Overcurrent Protection',
  continuousLoad: 'NEC 210.19(A)(1) - Continuous Load Sizing (125% factor)',
  rules: [
    'Base ampacity from NEC Table 310.16',
    'Apply temperature correction for ambient temperature other than 30°C',
    'Apply adjustment factor for more than 3 current-carrying conductors',
    'Apply 80% factor (125% sizing) for continuous loads (3+ hours)',
    'Small conductors (14, 12, 10 AWG) have maximum OCPD limits per 240.4(D)'
  ]
};