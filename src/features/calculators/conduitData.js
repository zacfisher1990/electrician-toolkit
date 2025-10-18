// NEC Chapter 9, Table 4 - Dimensions and Percent Area of Conduit and Tubing
// All areas are in square inches (40% fill for over 2 wires)

export const conduitTypes = [
  { value: 'emt', label: 'EMT - Electrical Metallic Tubing' },
  { value: 'ent', label: 'ENT - Electrical Nonmetallic Tubing' },
  { value: 'fmc', label: 'FMC - Flexible Metal Conduit' },
  { value: 'imc', label: 'IMC - Intermediate Metal Conduit' },
  { value: 'lfnc-b', label: 'LFNC-B - Liquidtight Flexible Nonmetallic Conduit (Type B)' },
  { value: 'lfnc-a', label: 'LFNC-A - Liquidtight Flexible Nonmetallic Conduit (Type A)' },
  { value: 'lfmc', label: 'LFMC - Liquidtight Flexible Metal Conduit' },
  { value: 'rmc', label: 'RMC - Rigid Metal Conduit' },
  { value: 'pvc-40', label: 'PVC Schedule 40' },
  { value: 'pvc-80', label: 'PVC Schedule 80' },
  { value: 'pvc-a', label: 'PVC Type A' },
  { value: 'pvc-eb', label: 'PVC Type EB' },
];

export const conduitSizes = [
  '0.375', '0.5', '0.75', '1', '1.25', '1.5', '2', '2.5', '3', '3.5', '4', '5', '6'
];

export const conduitSizeLabels = {
  '0.375': '3/8"',
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

// Conduit data organized by type and size
// Format: { name: string, area: number (sq. in.) }
export const conduitData = {
  // EMT - Electrical Metallic Tubing (Article 358)
  'emt-0.5': { name: '1/2" EMT', area: 0.304 },
  'emt-0.75': { name: '3/4" EMT', area: 0.533 },
  'emt-1': { name: '1" EMT', area: 0.864 },
  'emt-1.25': { name: '1-1/4" EMT', area: 1.496 },
  'emt-1.5': { name: '1-1/2" EMT', area: 2.036 },
  'emt-2': { name: '2" EMT', area: 3.356 },
  'emt-2.5': { name: '2-1/2" EMT', area: 5.858 },
  'emt-3': { name: '3" EMT', area: 8.846 },
  'emt-3.5': { name: '3-1/2" EMT', area: 11.545 },
  'emt-4': { name: '4" EMT', area: 14.753 },

  // ENT - Electrical Nonmetallic Tubing (Article 362)
  'ent-0.5': { name: '1/2" ENT', area: 0.246 },
  'ent-0.75': { name: '3/4" ENT', area: 0.454 },
  'ent-1': { name: '1" ENT', area: 0.785 },
  'ent-1.25': { name: '1-1/4" ENT', area: 1.410 },
  'ent-1.5': { name: '1-1/2" ENT', area: 1.936 },
  'ent-2': { name: '2" ENT', area: 3.205 },

  // FMC - Flexible Metal Conduit (Article 348)
  'fmc-0.375': { name: '3/8" FMC', area: 0.116 },
  'fmc-0.5': { name: '1/2" FMC', area: 0.317 },
  'fmc-0.75': { name: '3/4" FMC', area: 0.533 },
  'fmc-1': { name: '1" FMC', area: 0.817 },
  'fmc-1.25': { name: '1-1/4" FMC', area: 1.277 },
  'fmc-1.5': { name: '1-1/2" FMC', area: 1.858 },
  'fmc-2': { name: '2" FMC', area: 3.269 },
  'fmc-2.5': { name: '2-1/2" FMC', area: 4.909 },
  'fmc-3': { name: '3" FMC', area: 7.069 },
  'fmc-3.5': { name: '3-1/2" FMC', area: 9.621 },
  'fmc-4': { name: '4" FMC', area: 12.566 },

  // IMC - Intermediate Metal Conduit (Article 342)
  'imc-0.5': { name: '1/2" IMC', area: 0.342 },
  'imc-0.75': { name: '3/4" IMC', area: 0.586 },
  'imc-1': { name: '1" IMC', area: 0.959 },
  'imc-1.25': { name: '1-1/4" IMC', area: 1.647 },
  'imc-1.5': { name: '1-1/2" IMC', area: 2.225 },
  'imc-2': { name: '2" IMC', area: 3.630 },
  'imc-2.5': { name: '2-1/2" IMC', area: 5.135 },
  'imc-3': { name: '3" IMC', area: 7.922 },
  'imc-3.5': { name: '3-1/2" IMC', area: 10.584 },
  'imc-4': { name: '4" IMC', area: 13.631 },

  // LFNC-B - Liquidtight Flexible Nonmetallic Conduit Type B (Article 356)
  'lfnc-b-0.375': { name: '3/8" LFNC-B', area: 0.192 },
  'lfnc-b-0.5': { name: '1/2" LFNC-B', area: 0.314 },
  'lfnc-b-0.75': { name: '3/4" LFNC-B', area: 0.541 },
  'lfnc-b-1': { name: '1" LFNC-B', area: 0.873 },
  'lfnc-b-1.25': { name: '1-1/4" LFNC-B', area: 1.528 },
  'lfnc-b-1.5': { name: '1-1/2" LFNC-B', area: 1.981 },
  'lfnc-b-2': { name: '2" LFNC-B', area: 3.246 },

  // LFNC-A - Liquidtight Flexible Nonmetallic Conduit Type A (Article 356)
  'lfnc-a-0.375': { name: '3/8" LFNC-A', area: 0.192 },
  'lfnc-a-0.5': { name: '1/2" LFNC-A', area: 0.312 },
  'lfnc-a-0.75': { name: '3/4" LFNC-A', area: 0.535 },
  'lfnc-a-1': { name: '1" LFNC-A', area: 0.854 },
  'lfnc-a-1.25': { name: '1-1/4" LFNC-A', area: 1.502 },
  'lfnc-a-1.5': { name: '1-1/2" LFNC-A', area: 2.018 },
  'lfnc-a-2': { name: '2" LFNC-A', area: 3.343 },

  // LFMC - Liquidtight Flexible Metal Conduit (Article 350)
  'lfmc-0.375': { name: '3/8" LFMC', area: 0.192 },
  'lfmc-0.5': { name: '1/2" LFMC', area: 0.314 },
  'lfmc-0.75': { name: '3/4" LFMC', area: 0.541 },
  'lfmc-1': { name: '1" LFMC', area: 0.873 },
  'lfmc-1.25': { name: '1-1/4" LFMC', area: 1.528 },
  'lfmc-1.5': { name: '1-1/2" LFMC', area: 1.981 },
  'lfmc-2': { name: '2" LFMC', area: 3.246 },
  'lfmc-2.5': { name: '2-1/2" LFMC', area: 4.881 },
  'lfmc-3': { name: '3" LFMC', area: 7.475 },
  'lfmc-3.5': { name: '3-1/2" LFMC', area: 9.731 },
  'lfmc-4': { name: '4" LFMC', area: 12.692 },

  // RMC - Rigid Metal Conduit (Article 344)
  'rmc-0.5': { name: '1/2" RMC', area: 0.314 },
  'rmc-0.75': { name: '3/4" RMC', area: 0.549 },
  'rmc-1': { name: '1" RMC', area: 0.887 },
  'rmc-1.25': { name: '1-1/4" RMC', area: 1.526 },
  'rmc-1.5': { name: '1-1/2" RMC', area: 2.071 },
  'rmc-2': { name: '2" RMC', area: 3.408 },
  'rmc-2.5': { name: '2-1/2" RMC', area: 4.866 },
  'rmc-3': { name: '3" RMC', area: 7.499 },
  'rmc-3.5': { name: '3-1/2" RMC', area: 10.010 },
  'rmc-4': { name: '4" RMC', area: 12.882 },
  'rmc-5': { name: '5" RMC', area: 20.212 },
  'rmc-6': { name: '6" RMC', area: 29.158 },

  // PVC Schedule 40 (Article 352)
  'pvc-40-0.5': { name: '1/2" PVC Sch 40', area: 0.285 },
  'pvc-40-0.75': { name: '3/4" PVC Sch 40', area: 0.508 },
  'pvc-40-1': { name: '1" PVC Sch 40', area: 0.832 },
  'pvc-40-1.25': { name: '1-1/4" PVC Sch 40', area: 1.453 },
  'pvc-40-1.5': { name: '1-1/2" PVC Sch 40', area: 1.986 },
  'pvc-40-2': { name: '2" PVC Sch 40', area: 3.291 },
  'pvc-40-2.5': { name: '2-1/2" PVC Sch 40', area: 4.695 },
  'pvc-40-3': { name: '3" PVC Sch 40', area: 7.268 },
  'pvc-40-3.5': { name: '3-1/2" PVC Sch 40', area: 9.737 },
  'pvc-40-4': { name: '4" PVC Sch 40', area: 12.554 },
  'pvc-40-5': { name: '5" PVC Sch 40', area: 19.761 },
  'pvc-40-6': { name: '6" PVC Sch 40', area: 28.567 },

  // PVC Schedule 80 (Article 352)
  'pvc-80-0.5': { name: '1/2" PVC Sch 80', area: 0.217 },
  'pvc-80-0.75': { name: '3/4" PVC Sch 80', area: 0.409 },
  'pvc-80-1': { name: '1" PVC Sch 80', area: 0.688 },
  'pvc-80-1.25': { name: '1-1/4" PVC Sch 80', area: 1.237 },
  'pvc-80-1.5': { name: '1-1/2" PVC Sch 80', area: 1.711 },
  'pvc-80-2': { name: '2" PVC Sch 80', area: 2.874 },
  'pvc-80-2.5': { name: '2-1/2" PVC Sch 80', area: 4.119 },
  'pvc-80-3': { name: '3" PVC Sch 80', area: 6.442 },
  'pvc-80-3.5': { name: '3-1/2" PVC Sch 80', area: 8.688 },
  'pvc-80-4': { name: '4" PVC Sch 80', area: 11.258 },
  'pvc-80-5': { name: '5" PVC Sch 80', area: 17.855 },
  'pvc-80-6': { name: '6" PVC Sch 80', area: 25.598 },

  // PVC Type A (Article 352)
  'pvc-a-0.5': { name: '1/2" PVC Type A', area: 0.385 },
  'pvc-a-0.75': { name: '3/4" PVC Type A', area: 0.650 },
  'pvc-a-1': { name: '1" PVC Type A', area: 1.084 },
  'pvc-a-1.25': { name: '1-1/4" PVC Type A', area: 1.767 },
  'pvc-a-1.5': { name: '1-1/2" PVC Type A', area: 2.324 },
  'pvc-a-2': { name: '2" PVC Type A', area: 3.647 },
  'pvc-a-2.5': { name: '2-1/2" PVC Type A', area: 5.453 },
  'pvc-a-3': { name: '3" PVC Type A', area: 8.194 },
  'pvc-a-3.5': { name: '3-1/2" PVC Type A', area: 10.694 },
  'pvc-a-4': { name: '4" PVC Type A', area: 13.723 },

  // PVC Type EB (Article 352)
  'pvc-eb-2': { name: '2" PVC Type EB', area: 3.874 },
  'pvc-eb-3': { name: '3" PVC Type EB', area: 8.709 },
  'pvc-eb-3.5': { name: '3-1/2" PVC Type EB', area: 11.365 },
  'pvc-eb-4': { name: '4" PVC Type EB', area: 14.448 },
  'pvc-eb-5': { name: '5" PVC Type EB', area: 22.195 },
  'pvc-eb-6': { name: '6" PVC Type EB', area: 31.530 },
};

// Helper function to get available sizes for a specific conduit type
export const getAvailableSizes = (conduitType) => {
  const prefix = conduitType + '-';
  const availableSizes = Object.keys(conduitData)
    .filter(key => key.startsWith(prefix))
    .map(key => key.replace(prefix, ''));
  
  // Sort sizes numerically
  return availableSizes.sort((a, b) => parseFloat(a) - parseFloat(b));
};

// Helper function to get conduit info
export const getConduitInfo = (conduitType, size) => {
  const key = `${conduitType}-${size}`;
  return conduitData[key] || null;
};