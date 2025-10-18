// NEC 314.16 - Box Fill Calculations
// Box capacities in cubic inches

export const boxTypes = [
  { value: 'device-single', label: 'Device Boxes (Single Gang)' },
  { value: 'device-multi', label: 'Device Boxes (Multi-Gang)' },
  { value: 'square', label: 'Square Boxes' },
  { value: 'round-octagon', label: 'Round/Octagon Boxes' },
  { value: 'masonry', label: 'Masonry Boxes' },
];

// Box capacities organized by type
// Format: { capacity: number (cubic inches), name: string }
export const boxCapacities = {
  // Device Boxes (Single Gang)
  '3x2x1.5': { capacity: 7.5, name: '3" x 2" x 1-1/2" Device Box', type: 'device-single' },
  '3x2x2': { capacity: 10.0, name: '3" x 2" x 2" Device Box', type: 'device-single' },
  '3x2x2.25': { capacity: 10.5, name: '3" x 2" x 2-1/4" Device Box', type: 'device-single' },
  '3x2x2.5': { capacity: 12.5, name: '3" x 2" x 2-1/2" Device Box', type: 'device-single' },
  '3x2x2.75': { capacity: 14.0, name: '3" x 2" x 2-3/4" Device Box', type: 'device-single' },
  '3x2x3.5': { capacity: 18.0, name: '3" x 2" x 3-1/2" Device Box', type: 'device-single' },
  
  // Device Boxes (Multi-Gang)
  '3x2x2-2gang': { capacity: 14.0, name: '2-Gang 3" x 2" x 2" Device Box', type: 'device-multi' },
  '3x2x2.25-2gang': { capacity: 17.0, name: '2-Gang 3" x 2" x 2-1/4" Device Box', type: 'device-multi' },
  '3x2x2.5-2gang': { capacity: 21.0, name: '2-Gang 3" x 2" x 2-1/2" Device Box', type: 'device-multi' },
  '3x2x3.5-2gang': { capacity: 29.5, name: '2-Gang 3" x 2" x 3-1/2" Device Box', type: 'device-multi' },
  '3x2x3.5-3gang': { capacity: 43.5, name: '3-Gang 3" x 2" x 3-1/2" Device Box', type: 'device-multi' },
  
  // Square Boxes
  '4x1.25-square': { capacity: 18.0, name: '4" x 1-1/4" Square', type: 'square' },
  '4x1.5-square': { capacity: 21.0, name: '4" x 1-1/2" Square', type: 'square' },
  '4x2.125-square': { capacity: 30.3, name: '4" x 2-1/8" Square', type: 'square' },
  '4-11/16x1.25-square': { capacity: 25.5, name: '4-11/16" x 1-1/4" Square', type: 'square' },
  '4-11/16x1.5-square': { capacity: 25.5, name: '4-11/16" x 1-1/2" Square', type: 'square' },
  '4-11/16x2.125-square': { capacity: 42.0, name: '4-11/16" x 2-1/8" Square', type: 'square' },
  
  // Round/Octagon Boxes
  '4x1.25-round': { capacity: 12.5, name: '4" x 1-1/4" Round', type: 'round-octagon' },
  '4x1.5-round': { capacity: 15.5, name: '4" x 1-1/2" Round', type: 'round-octagon' },
  '4x2.125-round': { capacity: 21.5, name: '4" x 2-1/8" Round', type: 'round-octagon' },
  '4x1.25-octagon': { capacity: 15.5, name: '4" x 1-1/4" Octagon', type: 'round-octagon' },
  '4x1.5-octagon': { capacity: 18.0, name: '4" x 1-1/2" Octagon', type: 'round-octagon' },
  '4x2.125-octagon': { capacity: 24.5, name: '4" x 2-1/8" Octagon', type: 'round-octagon' },
  
  // Masonry Boxes
  '3.5x1.5-masonry': { capacity: 14.0, name: '3-1/2" x 1-1/2" Masonry Box', type: 'masonry' },
  '3.5x2.125-masonry': { capacity: 21.0, name: '3-1/2" x 2-1/8" Masonry Box', type: 'masonry' }
};

// Volume allowance per conductor (NEC Table 314.16(B))
// Values in cubic inches
export const wireVolumeAllowances = {
  '18': 1.50,
  '16': 1.75,
  '14': 2.00,
  '12': 2.25,
  '10': 2.50,
  '8': 3.00,
  '6': 5.00
};

// Available wire sizes for box fill calculations
export const availableWireSizes = ['18', '16', '14', '12', '10', '8', '6'];

// Helper function to get box capacity
export const getBoxCapacity = (boxKey) => {
  return boxCapacities[boxKey]?.capacity || 0;
};

// Helper function to get box name
export const getBoxName = (boxKey) => {
  return boxCapacities[boxKey]?.name || 'Unknown Box';
};

// Helper function to get wire volume allowance
export const getWireVolumeAllowance = (wireSize) => {
  return wireVolumeAllowances[wireSize] || 0;
};

// Helper function to get boxes by type
export const getBoxesByType = (type) => {
  return Object.entries(boxCapacities)
    .filter(([key, box]) => box.type === type)
    .map(([key, box]) => ({ key, ...box }));
};

// NEC Reference Information
export const necReferences = {
  mainSection: 'NEC 314.16 - Number of Conductors in Outlet, Device, and Junction Boxes',
  calculations: 'NEC 314.16(B) - Box Fill Calculations',
  table: 'NEC Table 314.16(B) - Volume Allowance Required per Conductor',
  rules: [
    'Each conductor = volume from Table 314.16(B)',
    'Each device (receptacle/switch) counts as 2 conductor volumes',
    'All equipment grounding conductors combined count as 1 conductor volume',
    'One or more cable clamps count as 1 conductor volume',
    'Conductor size for devices/clamps/grounds is based on largest conductor entering the box'
  ]
};