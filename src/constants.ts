import { ResourceType, ProductionUnit, MarketItem, Technology, TruckType, Truck } from './types';

export const TRUCK_TYPES: Record<TruckType, Truck> = {
  basic: { type: 'basic', capacity: 10, speed: 1, cost: 500 },
  fast: { type: 'fast', capacity: 5, speed: 2, cost: 1500 },
  heavy: { type: 'heavy', capacity: 25, speed: 0.5, cost: 2500 },
};

export const RESOURCES: Record<ResourceType, { label: string; icon: string; color: string; description: string }> = {
  money: { label: 'Money', icon: 'DollarSign', color: '#10b981', description: 'Universal currency for trading and upgrades.' },
  wood: { label: 'Wood', icon: 'Trees', color: '#8b4513', description: 'Basic raw material harvested from forests.' },
  stone: { label: 'Stone', icon: 'Mountain', color: '#6b7280', description: 'Durable material used for construction.' },
  iron: { label: 'Iron', icon: 'Hammer', color: '#4b5563', description: 'Raw ore mined from the earth.' },
  energy: { label: 'Energy', icon: 'Zap', color: '#f59e0b', description: 'Required for heavy machinery and mining.' },
  planks: { label: 'Planks', icon: 'Layout', color: '#d97706', description: 'Processed wood.' },
  iron_bars: { label: 'Iron Bars', icon: 'Box', color: '#374151', description: 'Refined iron.' },
  concrete: { label: 'Concrete', icon: 'Box', color: '#9ca3af', description: 'Processed stone.' },
  steel: { label: 'Steel', icon: 'Box', color: '#6b7280', description: 'Strong metal alloy.' },
  electronics: { label: 'Electronics', icon: 'Zap', color: '#3b82f6', description: 'Advanced components.' },
  research: { label: 'Research Data', icon: 'FlaskConical', color: '#a855f7', description: 'Used to unlock new technologies.' },
};

export const INITIAL_PRODUCTION_UNITS: ProductionUnit[] = [
  { id: 'logger', name: 'Logger', input: [{ type: 'energy', amount: 1 }], output: { type: 'wood', amount: 2 }, duration: 5, isAutomated: false, isProducing: false, isPaused: false, progress: 0, level: 1, upgradeCost: 200, energyPerTick: 0, inputBuffer: {}, outputBuffer: {}, trucks: 0 },
  { id: 'quarry', name: 'Stone Quarry', input: [{ type: 'energy', amount: 2 }], output: { type: 'stone', amount: 2 }, duration: 8, isAutomated: false, isProducing: false, isPaused: false, progress: 0, level: 1, upgradeCost: 300, energyPerTick: 0, inputBuffer: {}, outputBuffer: {}, trucks: 0 },
  { id: 'mine', name: 'Iron Mine', input: [{ type: 'energy', amount: 2 }], output: { type: 'iron', amount: 2 }, duration: 10, isAutomated: false, isProducing: false, isPaused: false, progress: 0, level: 1, upgradeCost: 400, energyPerTick: 0, inputBuffer: {}, outputBuffer: {}, trucks: 0 },
  { id: 'power_plant', name: 'Power Plant', input: [{ type: 'wood', amount: 1 }], output: { type: 'energy', amount: 2 }, duration: 10, isAutomated: false, isProducing: false, isPaused: false, progress: 0, level: 1, upgradeCost: 500, energyPerTick: 0, inputBuffer: {}, outputBuffer: {}, trucks: 0 },
  { id: 'sawmill', name: 'Sawmill', input: [{ type: 'wood', amount: 2 }, { type: 'energy', amount: 1 }], output: { type: 'planks', amount: 2 }, duration: 8, isAutomated: false, isProducing: false, isPaused: false, progress: 0, level: 1, upgradeCost: 400, energyPerTick: 0, inputBuffer: {}, outputBuffer: {}, trucks: 0 },
  { id: 'foundry', name: 'Foundry', input: [{ type: 'iron', amount: 2 }, { type: 'energy', amount: 2 }], output: { type: 'iron_bars', amount: 1 }, duration: 12, isAutomated: false, isProducing: false, isPaused: false, progress: 0, level: 1, upgradeCost: 800, energyPerTick: 0, inputBuffer: {}, outputBuffer: {}, trucks: 0 },
  { id: 'concrete_mixer', name: 'Concrete Mixer', input: [{ type: 'stone', amount: 2 }, { type: 'energy', amount: 2 }], output: { type: 'concrete', amount: 1 }, duration: 15, isAutomated: false, isProducing: false, isPaused: false, progress: 0, level: 1, upgradeCost: 800, energyPerTick: 0, inputBuffer: {}, outputBuffer: {}, trucks: 0 },
  { id: 'steel_mill', name: 'Steel Mill', input: [{ type: 'iron_bars', amount: 1 }, { type: 'energy', amount: 3 }], output: { type: 'steel', amount: 1 }, duration: 20, isAutomated: false, isProducing: false, isPaused: false, progress: 0, level: 1, upgradeCost: 1500, energyPerTick: 0, inputBuffer: {}, outputBuffer: {}, trucks: 0 },
  { id: 'electronics_factory', name: 'Electronics Factory', input: [{ type: 'iron_bars', amount: 1 }, { type: 'planks', amount: 1 }, { type: 'energy', amount: 4 }], output: { type: 'electronics', amount: 1 }, duration: 25, isAutomated: false, isProducing: false, isPaused: false, progress: 0, level: 1, upgradeCost: 2000, energyPerTick: 0, inputBuffer: {}, outputBuffer: {}, trucks: 0 },
  { id: 'laboratory', name: 'Laboratory', input: [{ type: 'electronics', amount: 1 }, { type: 'energy', amount: 5 }], output: { type: 'research', amount: 1 }, duration: 30, isAutomated: false, isProducing: false, isPaused: false, progress: 0, level: 1, upgradeCost: 5000, energyPerTick: 0, inputBuffer: {}, outputBuffer: {}, trucks: 0 },
];

export const TECHNOLOGIES: Technology[] = [
  { id: 'tech_laboratory', name: 'Research Facilities', description: 'Unlocks the Laboratory to generate Research Data.', cost: 0, requirements: [], unlocks: ['laboratory'], icon: 'FlaskConical' },
  { id: 'tech_basic_extraction', name: 'Basic Extraction', description: 'Unlocks Logger, Quarry, and Iron Mine.', cost: 10, requirements: ['tech_laboratory'], unlocks: ['logger', 'quarry', 'mine'], icon: 'Hammer' },
  { id: 'tech_power', name: 'Energy Production', description: 'Unlocks the Power Plant.', cost: 15, requirements: ['tech_basic_extraction'], unlocks: ['power_plant'], icon: 'Zap' },
  { id: 'tech_sawmill', name: 'Wood Processing', description: 'Unlocks the Sawmill to produce Planks.', cost: 20, requirements: ['tech_basic_extraction'], unlocks: ['sawmill'], icon: 'Layout' },
  { id: 'tech_foundry', name: 'Basic Metallurgy', description: 'Unlocks the Foundry to produce Iron Bars.', cost: 30, requirements: ['tech_basic_extraction'], unlocks: ['foundry'], icon: 'Box' },
  { id: 'tech_concrete', name: 'Advanced Construction', description: 'Unlocks the Concrete Mixer.', cost: 40, requirements: ['tech_basic_extraction'], unlocks: ['concrete_mixer'], icon: 'Building' },
  { id: 'tech_steel', name: 'Advanced Metallurgy', description: 'Unlocks the Steel Mill.', cost: 60, requirements: ['tech_foundry'], unlocks: ['steel_mill'], icon: 'Anvil' },
  { id: 'tech_electronics', name: 'Electronics', description: 'Unlocks the Electronics Factory.', cost: 120, requirements: ['tech_steel', 'tech_sawmill'], unlocks: ['electronics_factory'], icon: 'Cpu' },
  { id: 'tech_truck_speed', name: 'Vehicle Optimization', description: 'Increases truck speed by 50%.', cost: 50, requirements: ['tech_basic_extraction'], unlocks: [], icon: 'Truck' },
  { id: 'tech_truck_capacity', name: 'Heavy Logistics', description: 'Increases truck capacity by 100%.', cost: 80, requirements: ['tech_truck_speed'], unlocks: [], icon: 'Truck' },
];

export const INITIAL_STORAGE_LIMIT = 100;
export const STORAGE_UPGRADE_COST = 250;
export const INITIAL_MAX_COMPANIES = 3;
export const INITIAL_MAX_AUTOMATIONS = 1;
export const INITIAL_MONEY = 1000;

export const TICK_RATE = 1000; // 1 second
export const MARKET_TICK_RATE = 1000; // 1 second
export const HISTORY_LIMIT = 100;
