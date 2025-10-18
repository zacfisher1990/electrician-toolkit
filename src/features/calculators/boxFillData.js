// NEC 314.16 - Box Fill Calculations
// Box capacities in cubic inches from NEC Table 314.16(A) Metal Boxes

export const boxTypes = [
  { value: 'round-octagon', label: 'Round/Octagon Boxes' },
  { value: 'square', label: 'Square Boxes' },
  { value: 'device', label: 'Device Boxes' },
  { value: 'masonry', label: 'Masonry Boxes' },
  { value: 'fs-fd', label: 'FS/FD Boxes' },
];

// Box capacities organized by type
// Format: { capacity: number (cubic inches), name: string }
// All data from NEC Table 314.16(A) Metal Boxes
export const boxCapacities = {
  // Round/Octagonal Boxes (4" diameter) - Round and Octagon have same capacity
  '4x1.25-round-octagon': { capacity: 12.5, name: '4" x 1-1/4" Round/Octagon', type: 'round-octagon' },
  '4x1.5-round-octagon': { capacity: 15.5, name: '4" x 1-1/2" Round/Octagon', type: 'round-octagon' },
  '4x2.125-round-octagon': { capacity: 21.5, name: '4" x 2-1/8" Round/Octagon', type: 'round-octagon' },
  
  // Square Boxes (4")
  '4x1.25-square': { capacity: 18.0, name: '4" x 1-1/4" Square', type: 'square' },
  '4x1.5-square': { capacity: 21.0, name: '4" x 1-1/2" Square', type: 'square' },
  '4x2.125-square': { capacity: 30.3, name: '4" x 2-1/8" Square', type: 'square' },
  
  // Square Boxes (4-11/16")
  '4-11/16x1.25-square': { capacity: 25.5, name: '4-11/16" x 1-1/4" Square', type: 'square' },
  '4-11/16x1.5-square': { capacity: 29.5, name: '4-11/16" x 1-1/2" Square', type: 'square' },
  '4-11/16x2.125-square': { capacity: 42.0, name: '4-11/16" x 2-1/8" Square', type: 'square' },
  
  // Device Boxes (3" x 2")
  '3x2x1.5-device': { capacity: 7.5, name: '3" x 2" x 1-1/2" Device', type: 'device' },
  '3x2x2-device': { capacity: 10.0, name: '3" x 2" x 2" Device', type: 'device' },
  '3x2x2.25-device': { capacity: 10.5, name: '3" x 2" x 2-1/4" Device', type: 'device' },
  '3x2x2.5-device': { capacity: 12.5, name: '3" x 2" x 2-1/2" Device', type: 'device' },
  '3x2x2.75-device': { capacity: 14.0, name: '3" x 2" x 2-3/4" Device', type: 'device' },
  '3x2x3.5-device': { capacity: 18.0, name: '3" x 2" x 3-1/2" Device', type: 'device' },
  
  // Device Boxes (4" x 2-1/8")
  '4x2.125x1.5-device': { capacity: 10.3, name: '4" x 2-1/8" x 1-1/2" Device', type: 'device' },
  '4x2.125x1.875-device': { capacity: 13.0, name: '4" x 2-1/8" x 1-7/8" Device', type: 'device' },
  '4x2.125x2.125-device': { capacity: 14.5, name: '4" x 2-1/8" x 2-1/8" Device', type: 'device' },
  
  // Masonry Box/Gang
  '3.5x2x2.5-masonry': { capacity: 14.0, name: '3-1/2" x 2" x 2-1/2" Masonry', type: 'masonry' },
  '3.5x2x3.5-masonry': { capacity: 21.0, name: '3-1/2" x 2" x 3-1/2" Masonry', type: 'masonry' },
  
  // FS/FD Boxes
  'fs-1.25-single': { capacity: 13.5, name: 'FS Single Cover/Gang (1-1/4" min)', type: 'fs-fd' },
  'fd-2.125-single': { capacity: 18.0, name: 'FD Single Cover/Gang (2-1/8" min)', type: 'fs-fd' },
  'fs-1.25-multiple': { capacity: 18.0, name: 'FS Multiple Cover/Gang (1-1/4" min)', type: 'fs-fd' },
  'fd-2.125-multiple': { capacity: 24.0, name: 'FD Multiple Cover/Gang (2-1/8" min)', type: 'fs-fd' },
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