// Lighting Calculation Functions

import {
  FOOT_CANDLES_BY_ROOM,
  SPACING_RATIOS,
  WATTS_PER_SQ_FT,
  WORK_PLANE_HEIGHT,
  SPACING_SAFETY_FACTOR,
  HIGH_CEILING_THRESHOLD,
  HIGH_CEILING_ADJUSTMENT
} from './lightingConstants';

/**
 * Calculate total lumens needed for a room
 * Formula: Area (sq ft) × Foot-candles = Total Lumens
 */
export const calculateLumens = (roomLength, roomWidth, roomType, lumensPerFixture = null) => {
  if (!roomLength || !roomWidth) return null;
  
  const length = parseFloat(roomLength);
  const width = parseFloat(roomWidth);
  const area = length * width;
  const footCandles = FOOT_CANDLES_BY_ROOM[roomType];
  const totalLumens = footCandles * area;
  
  let fixturesNeeded = null;
  if (lumensPerFixture) {
    const lpf = parseFloat(lumensPerFixture);
    fixturesNeeded = Math.ceil(totalLumens / lpf);
  }

  return {
    area: area.toFixed(1),
    footCandles,
    totalLumens: totalLumens.toFixed(0),
    fixturesNeeded
  };
};

/**
 * Calculate fixture spacing using spacing criterion method
 * 
 * Key concepts:
 * 1. Mounting Height = Ceiling Height - Work Plane Height (2.5 ft)
 * 2. Maximum Spacing = Mounting Height × Spacing Ratio
 * 3. Use 80% of max spacing for better coverage
 * 4. Higher ceilings need MORE fixtures due to inverse square law
 * 
 * @param {number} roomLength - Room length in feet
 * @param {number} roomWidth - Room width in feet
 * @param {number} ceilingHeight - Ceiling height in feet
 * @param {string} fixtureType - Type of fixture (recessed, pendant, track, surface)
 */
export const calculateFixtureSpacing = (roomLength, roomWidth, ceilingHeight, fixtureType) => {
  if (!roomLength || !roomWidth || !ceilingHeight) return null;
  
  const length = parseFloat(roomLength);
  const width = parseFloat(roomWidth);
  const ceilingHt = parseFloat(ceilingHeight);
  
  // Calculate mounting height above work plane
  const mountingHeight = ceilingHt - WORK_PLANE_HEIGHT;
  
  // Get spacing ratio for this fixture type
  const ratio = SPACING_RATIOS[fixtureType];
  
  // Calculate maximum spacing using spacing criterion
  const maxSpacing = mountingHeight * ratio;
  
  // Apply safety factor (80% of max) for better coverage
  let targetSpacing = maxSpacing * SPACING_SAFETY_FACTOR;
  
  // For high ceilings, reduce spacing further to compensate for light loss
  // (Inverse square law: light intensity decreases with distance squared)
  if (mountingHeight > HIGH_CEILING_THRESHOLD) {
    targetSpacing = targetSpacing * HIGH_CEILING_ADJUSTMENT;
  }
  
  // Calculate number of fixtures needed in each direction
  // Always use at least 2 fixtures per direction for proper coverage
  const fixturesLength = Math.max(2, Math.ceil(length / targetSpacing));
  const fixturesWidth = Math.max(2, Math.ceil(width / targetSpacing));
  
  const totalFixtures = fixturesLength * fixturesWidth;
  
  // Calculate actual spacing based on fixture count
  const actualSpacingLength = length / fixturesLength;
  const actualSpacingWidth = width / fixturesWidth;
  
  // Wall offsets should be half the spacing for even distribution
  const wallOffsetLength = actualSpacingLength / 2;
  const wallOffsetWidth = actualSpacingWidth / 2;

  return {
    mountingHeight: mountingHeight.toFixed(1),
    maxSpacing: maxSpacing.toFixed(1),
    targetSpacing: targetSpacing.toFixed(1),
    fixturesLength,
    fixturesWidth,
    totalFixtures,
    actualSpacingLength: actualSpacingLength.toFixed(1),
    actualSpacingWidth: actualSpacingWidth.toFixed(1),
    wallOffsetLength: wallOffsetLength.toFixed(1),
    wallOffsetWidth: wallOffsetWidth.toFixed(1)
  };
};

/**
 * Calculate watts per square foot based on NEC Table 220.12
 * @param {number} area - Area in square feet
 * @param {string} buildingType - Type of building/occupancy
 */
export const calculateWattsPerSqFt = (area, buildingType) => {
  if (!area) return null;

  const sqft = parseFloat(area);
  const watts = WATTS_PER_SQ_FT[buildingType];
  const totalWatts = sqft * watts;
  const totalVA = totalWatts; // For resistive loads, watts = VA
  
  // Calculate amperage at 120V
  const amperage = totalVA / 120;
  
  // Calculate circuits needed (80% of 20A = 16A max per circuit)
  const circuits = Math.ceil(amperage / 16);

  return {
    unitLoad: watts.toFixed(1),
    totalWatts: totalWatts.toFixed(0),
    totalVA: totalVA.toFixed(0),
    amperage: amperage.toFixed(1),
    circuits
  };
};