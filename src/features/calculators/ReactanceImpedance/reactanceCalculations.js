// reactanceCalculations.js
// Utility functions for reactance and impedance calculations

/**
 * Convert inductance to Henries
 */
export const convertToHenries = (value, unit) => {
  let L = parseFloat(value);
  if (unit === 'mH') return L / 1000;
  if (unit === 'μH') return L / 1000000;
  return L; // Already in H
};

/**
 * Convert capacitance to Farads
 */
export const convertToFarads = (value, unit) => {
  let C = parseFloat(value);
  if (unit === 'μF') return C / 1000000;
  if (unit === 'nF') return C / 1000000000;
  if (unit === 'pF') return C / 1000000000000;
  return C; // Already in F
};

/**
 * Calculate Inductive Reactance (XL)
 * Formula: XL = 2πfL
 */
export const calculateInductiveReactance = (frequency, inductance, unit) => {
  if (!frequency || !inductance) return null;
  
  const f = parseFloat(frequency);
  const L = convertToHenries(inductance, unit);
  const XL = 2 * Math.PI * f * L;
  
  return {
    reactance: XL.toFixed(2),
    frequency: f,
    inductance: inductance,
    unit: unit
  };
};

/**
 * Calculate Capacitive Reactance (XC)
 * Formula: XC = 1 / (2πfC)
 */
export const calculateCapacitiveReactance = (frequency, capacitance, unit) => {
  if (!frequency || !capacitance) return null;
  
  const f = parseFloat(frequency);
  const C = convertToFarads(capacitance, unit);
  const XC = 1 / (2 * Math.PI * f * C);
  
  return {
    reactance: XC.toFixed(2),
    frequency: f,
    capacitance: capacitance,
    unit: unit
  };
};

/**
 * Calculate Impedance (Z)
 * Formula: Z = √(R² + X²)
 * Phase Angle: θ = arctan(X / R)
 */
export const calculateImpedance = (resistance, reactance, reactanceType) => {
  if (!resistance || !reactance) return null;
  
  const R = parseFloat(resistance);
  const X = parseFloat(reactance);
  
  const Z = Math.sqrt(R * R + X * X);
  const angle = Math.atan2(X, R) * (180 / Math.PI);
  
  return {
    impedance: Z.toFixed(2),
    angle: angle.toFixed(2),
    resistance: R,
    reactance: X,
    type: reactanceType
  };
};

/**
 * Calculate Resonant Frequency
 * Formula: fr = 1 / (2π√LC)
 */
export const calculateResonantFrequency = (inductance, inductanceUnit, capacitance, capacitanceUnit) => {
  if (!inductance || !capacitance) return null;
  
  const L = convertToHenries(inductance, inductanceUnit);
  const C = convertToFarads(capacitance, capacitanceUnit);
  
  const fr = 1 / (2 * Math.PI * Math.sqrt(L * C));
  
  return {
    frequency: fr.toFixed(2),
    inductance: inductance,
    inductanceUnit: inductanceUnit,
    capacitance: capacitance,
    capacitanceUnit: capacitanceUnit
  };
};