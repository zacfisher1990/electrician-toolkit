// Common electrical materials for autocomplete
export const COMMON_ELECTRICAL_MATERIALS = [
  // Receptacles & Outlets
  '15A Duplex Receptacle',
  '20A Duplex Receptacle',
  '15A GFCI Receptacle',
  '20A GFCI Receptacle',
  '15A AFCI Receptacle',
  '20A AFCI Receptacle',
  'USB Outlet',
  'USB-C Outlet',
  'Weatherproof Outlet Cover',
  
  // Switches
  'Single-Pole Switch',
  'Three-Way Switch',
  'Four-Way Switch',
  'Dimmer Switch',
  'Smart Switch',
  'Timer Switch',
  'Motion Sensor Switch',
  'Occupancy Sensor',
  
  // Wire & Cable
  '14/2 NM-B Wire (Romex)',
  '12/2 NM-B Wire (Romex)',
  '10/2 NM-B Wire (Romex)',
  '14/3 NM-B Wire (Romex)',
  '12/3 NM-B Wire (Romex)',
  '10/3 NM-B Wire (Romex)',
  '6/3 NM-B Wire (Romex)',
  '4/3 Wire',
  '2/3 Wire',
  '1/0 Wire',
  '2/0 Wire',
  'THHN Wire #14',
  'THHN Wire #12',
  'THHN Wire #10',
  'THHN Wire #8',
  'THHN Wire #6',
  
  // Conduit
  '1/2" EMT Conduit',
  '3/4" EMT Conduit',
  '1" EMT Conduit',
  '1-1/4" EMT Conduit',
  '1-1/2" EMT Conduit',
  '2" EMT Conduit',
  '1/2" PVC Conduit',
  '3/4" PVC Conduit',
  '1" PVC Conduit',
  'EMT Connector',
  'EMT Coupling',
  'PVC Elbow',
  'PVC Coupling',
  
  // Boxes
  'Single Gang Old Work Box',
  'Double Gang Old Work Box',
  'Single Gang New Work Box',
  'Double Gang New Work Box',
  '4" Square Box',
  '4" Octagon Box',
  'Weatherproof Box',
  'Junction Box 4x4',
  'Junction Box 6x6',
  
  // Breakers & Panels
  '15A Circuit Breaker',
  '20A Circuit Breaker',
  '30A Circuit Breaker',
  '40A Circuit Breaker',
  '50A Circuit Breaker',
  '60A Circuit Breaker',
  '15A GFCI Breaker',
  '20A GFCI Breaker',
  '15A AFCI Breaker',
  '20A AFCI Breaker',
  '100A Panel',
  '200A Panel',
  'Panel Cover',
  
  // Lighting
  'LED Bulb',
  'LED Recessed Light',
  'Can Light Fixture',
  'Pendant Light',
  'Chandelier',
  'Ceiling Fan',
  'Ceiling Fan w/ Light',
  'Under Cabinet Light',
  'Track Lighting',
  'Wall Sconce',
  'Outdoor Light Fixture',
  'Motion Sensor Light',
  'LED Strip Light',
  
  // Specialty Items
  'Smoke Detector',
  'Carbon Monoxide Detector',
  'Doorbell Transformer',
  'Low Voltage Bracket',
  'Wire Nuts',
  'Wire Staples',
  'Electrical Tape',
  'Wire Connectors',
  'Ground Rod',
  'Ground Clamp',
  'Bushing',
  'Locknut',
  'Cable Ties',
  
  // HVAC Related
  'Thermostat',
  'Smart Thermostat',
  'Disconnect Box',
  'Whip',
  
  // Data/Low Voltage
  'Cat6 Cable',
  'Cat5e Cable',
  'Coax Cable',
  'Keystone Jack',
  'Wall Plate',
  'Patch Panel',
  'Ethernet Jack',
  'Phone Jack',
  'HDMI Wall Plate',
];

// Function to get materials as objects (for Firebase)
export const getCommonMaterialsAsObjects = () => {
  return COMMON_ELECTRICAL_MATERIALS.map(name => ({
    name,
    cost: 0, // No default price
    usageCount: 0,
    isCommon: true // Flag to identify pre-populated items
  }));
};