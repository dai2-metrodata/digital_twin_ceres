export const PROCESS_PARAMS = {
  cuttingSpeed: { label: 'Cutting Speed (Vc)', unit: 'm/min', min: 20, max: 200, default: 80 },
  feedRate: { label: 'Feed Rate (f)', unit: 'mm/min', min: 5, max: 32000, default: 500 },
  spindleSpeed: { label: 'Spindle Speed', unit: 'RPM', min: 100, max: 4000, default: 1592 },
  zeroPointCorrection: { label: 'Zero-Point Correction', unit: 'mm', min: -0.5, max: 0.5, default: 0 },
  railLength: { label: 'Rail Length', unit: 'ft', min: 5, max: 25, default: 12 }
}

export const KPI_THRESHOLDS = {
  oee: { good: 85, warning: 65 },
  availability: { good: 90, warning: 75 },
  performance: { good: 95, warning: 80 },
  quality: { good: 99, warning: 95 },
  railAccuracy: { good: 0.01, warning: 0.05 },
  vibration: { good: 2.5, warning: 5.0 },
  axisError: { good: 0.005, warning: 0.02 },
  mtbf: { good: 500, warning: 200 },
  mttr: { good: 2, warning: 6 },
  toolLife: { good: 80, warning: 40 }
}

export const MATERIALS = [
  { id: 'mild_steel', name: 'Mild Steel', cuttingSpeedFactor: 1.0, feedFactor: 1.0 },
  { id: 'cast_iron', name: 'Cast Iron', cuttingSpeedFactor: 0.7, feedFactor: 0.8 },
  { id: 'stainless', name: 'Stainless Steel', cuttingSpeedFactor: 0.5, feedFactor: 0.6 },
  { id: 'aluminum', name: 'Aluminum', cuttingSpeedFactor: 2.0, feedFactor: 1.5 }
]

export const SENSORS = [
  { id: 'temp1', type: 'Temperature', location: 'Spindle Head', position: [0, 2.5, 0.5] },
  { id: 'vib1', type: 'Vibration', location: 'Rail Top', position: [-1.5, 1.8, 0] },
  { id: 'vib2', type: 'Vibration', location: 'Rail Bottom', position: [-1.5, -0.5, 0] },
  { id: 'pos1', type: 'Position', location: 'Gantry X', position: [0, 2, -1] },
  { id: 'pos2', type: 'Position', location: 'Gantry Y', position: [1, 2, 0] },
  { id: 'load1', type: 'Load Cell', location: 'Tool Holder', position: [0, 2.8, 0] },
  { id: 'flow1', type: 'Coolant Flow', location: 'Nozzle', position: [0.5, 2.3, 0.5] },
  { id: 'acoustic1', type: 'Acoustic', location: 'Enclosure', position: [2, 1.5, 1] },
  { id: 'power1', type: 'Power', location: 'Main Drive', position: [-2, 0.5, -1] }
]

export const SUPPLY_CHAIN_DEFAULTS = {
  rawMaterials: [
    { id: 'steel_billet', name: 'Steel Billet', unit: 'tons', stock: 45, reorderPoint: 20, leadTimeDays: 7 },
    { id: 'cutting_tools', name: 'Cutting Tools', unit: 'sets', stock: 12, reorderPoint: 5, leadTimeDays: 3 },
    { id: 'coolant', name: 'Coolant Fluid', unit: 'liters', stock: 800, reorderPoint: 200, leadTimeDays: 2 }
  ],
  transportModes: [
    { id: 'truck', name: 'Truck', capacity: 20, unit: 'tons', transitDays: 2, costPerUnit: 150 },
    { id: 'train', name: 'Train', capacity: 100, unit: 'tons', transitDays: 5, costPerUnit: 80 }
  ],
  warehouse: { capacity: 200, currentStock: 85, unit: 'finished rails' },
  dailyOrders: { min: 5, max: 25, average: 12 }
}
