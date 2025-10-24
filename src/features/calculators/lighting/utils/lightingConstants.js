// Lighting Calculator Constants

export const FOOT_CANDLES_BY_ROOM = {
  'living': 10,
  'kitchen': 50,
  'bathroom': 70,
  'bedroom': 10,
  'office': 50,
  'workshop': 75,
  'garage': 50,
  'hallway': 5,
  'dining': 30,
  'laundry': 50
};

export const ROOM_TYPE_NAMES = {
  'living': 'Living Room (10 fc)',
  'kitchen': 'Kitchen (50 fc)',
  'bathroom': 'Bathroom (70 fc)',
  'bedroom': 'Bedroom (10 fc)',
  'office': 'Office/Study (50 fc)',
  'workshop': 'Workshop (75 fc)',
  'garage': 'Garage (50 fc)',
  'hallway': 'Hallway (5 fc)',
  'dining': 'Dining Room (30 fc)',
  'laundry': 'Laundry Room (50 fc)'
};

export const SPACING_RATIOS = {
  'recessed': 1.5,
  'pendant': 1.0,
  'track': 2.0,
  'surface': 1.5
};

export const FIXTURE_TYPE_NAMES = {
  'recessed': 'Recessed Can (1.5:1 ratio)',
  'pendant': 'Pendant (1:1 ratio)',
  'track': 'Track Light (2:1 ratio)',
  'surface': 'Surface Mount (1.5:1 ratio)'
};

export const WATTS_PER_SQ_FT = {
  'office': 1.0,
  'retail': 1.5,
  'warehouse': 0.5,
  'school': 1.2,
  'hospital': 1.0,
  'hotel': 1.0,
  'restaurant': 1.3,
  'residential': 1.0
};

export const BUILDING_TYPE_NAMES = {
  'office': 'Office Building',
  'retail': 'Retail Store',
  'warehouse': 'Warehouse',
  'school': 'School',
  'hospital': 'Hospital',
  'hotel': 'Hotel',
  'restaurant': 'Restaurant',
  'residential': 'Residential'
};

// Work plane is typically 30 inches (2.5 feet) above floor for desk height
export const WORK_PLANE_HEIGHT = 2.5;

// Use 80% of maximum spacing for better coverage
export const SPACING_SAFETY_FACTOR = 0.8;

// For very high ceilings (above this threshold), apply additional spacing reduction
export const HIGH_CEILING_THRESHOLD = 12;
export const HIGH_CEILING_ADJUSTMENT = 0.9;