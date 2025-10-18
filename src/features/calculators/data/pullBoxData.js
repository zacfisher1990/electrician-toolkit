// NEC 314.28 - Pull and Junction Boxes for Conductors 4 AWG or Larger

// Pull box calculation types
export const pullBoxTypes = [
  { value: 'straight', label: 'Straight Pull' },
  { value: 'angle', label: 'Angle Pull (L-shaped)' },
  { value: 'u-pull', label: 'U-Pull (Same Side)' },
];

// Standard conduit/raceway trade sizes (in inches)
export const racewayTradeSizes = [
  '0.5', '0.75', '1', '1.25', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6'
];

// Trade size labels for display
export const racewayTradeSizeLabels = {
  '0.5': '1/2"',
  '0.75': '3/4"',
  '1': '1"',
  '1.25': '1-1/4"',
  '1.5': '1-1/2"',
  '2': '2"',
  '2.5': '2-1/2"',
  '3': '3"',
  '3.5': '3-1/2"',
  '4': '4"',
  '5': '5"',
  '6': '6"'
};

// NEC multipliers for different pull box types
export const necMultipliers = {
  straight: {
    length: 8,
    description: 'Length = 8 × largest raceway trade size'
  },
  angle: {
    distance: 6,
    description: 'Distance = 6 × largest raceway + sum of other raceways'
  },
  uPull: {
    distance: 6,
    description: 'Distance = 6 × largest raceway (same side)'
  }
};

// Helper function to get trade size label
export const getTradeSizeLabel = (size) => {
  return racewayTradeSizeLabels[size] || size;
};

// Helper function to parse trade size string to number
export const parseTradeSizeToNumber = (size) => {
  return parseFloat(size);
};

// Calculate straight pull length (NEC 314.28(A)(1))
export const calculateStraightPull = (largestRaceway) => {
  const size = parseTradeSizeToNumber(largestRaceway);
  const minLength = size * necMultipliers.straight.length;
  return {
    minLength: minLength,
    formula: `${size}" × ${necMultipliers.straight.length} = ${minLength}"`,
    necReference: 'NEC 314.28(A)(1)'
  };
};

// Calculate angle pull dimensions (NEC 314.28(A)(2))
export const calculateAnglePull = (raceways) => {
  if (!raceways || raceways.length === 0) return null;
  
  const sizes = raceways.map(r => parseTradeSizeToNumber(r.size));
  const largestSize = Math.max(...sizes);
  const sumOfOtherSizes = sizes.reduce((sum, size) => sum + size, 0) - largestSize;
  
  const minDistance = (largestSize * necMultipliers.angle.distance) + sumOfOtherSizes;
  
  return {
    minDistance: minDistance,
    largestRaceway: largestSize,
    sumOfOthers: sumOfOtherSizes,
    formula: `(${largestSize}" × ${necMultipliers.angle.distance}) + ${sumOfOtherSizes}" = ${minDistance}"`,
    necReference: 'NEC 314.28(A)(2)'
  };
};

// Calculate U-pull dimensions (NEC 314.28(A)(2))
export const calculateUPull = (largestRaceway) => {
  const size = parseTradeSizeToNumber(largestRaceway);
  const minDistance = size * necMultipliers.uPull.distance;
  
  return {
    minDistance: minDistance,
    formula: `${size}" × ${necMultipliers.uPull.distance} = ${minDistance}"`,
    necReference: 'NEC 314.28(A)(2)'
  };
};

// NEC Reference Information
export const necReferences = {
  mainSection: 'NEC 314.28 - Pull and Junction Boxes and Conduit Bodies',
  straightPull: 'NEC 314.28(A)(1) - Straight Pulls',
  anglePull: 'NEC 314.28(A)(2) - Angle or U Pulls',
  minimumDepth: 'NEC 314.28(A)(2) - Box depth must accommodate largest conduit',
  conductorSize: 'Applies to boxes containing conductors 4 AWG or larger',
  rules: [
    'Straight Pull: Length = 8 × trade size of largest raceway',
    'Angle/U Pull: Distance = 6 × largest raceway + sum of other raceways on same wall',
    'Rows of conduits: Each row calculated separately',
    'Box depth: Must accommodate the largest conduit locknut and bushing',
    'These are minimum dimensions - larger boxes may be used'
  ]
};