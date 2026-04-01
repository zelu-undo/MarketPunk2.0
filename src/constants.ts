import { ResourceType, ProductionUnit, MarketItem, Technology, TruckType, Truck } from './types';

export const TRUCK_TYPES: Record<TruckType, Truck> = {
  basic: { type: 'basic', capacity: 10, speed: 1, cost: 500 },
  fast: { type: 'fast', capacity: 5, speed: 2, cost: 1500 },
  heavy: { type: 'heavy', capacity: 25, speed: 0.5, cost: 2500 },
};

export const RESOURCES: Record<ResourceType, { label: string; icon: string; color: string; description: string }> = {
  // Money
  money: { label: 'Money', icon: 'DollarSign', color: '#10b981', description: 'Universal currency for trading and upgrades.' },
  
  // Tier 1 - Raw Resources
  wood: { label: 'Wood', icon: 'Trees', color: '#8b4513', description: 'Basic raw material harvested from forests.' },
  wood_plank: { label: 'Wood Plank', icon: 'Trees', color: '#a0522d', description: 'Processed wood planks for construction.' },
  stone: { label: 'Stone', icon: 'Mountain', color: '#6b7280', description: 'Durable material used for construction.' },
  iron: { label: 'Iron Ore', icon: 'Hammer', color: '#4b5563', description: 'Raw ore mined from the earth.' },
  sand: { label: 'Sand', icon: 'Waves', color: '#d4a574', description: 'Basic material for glass and construction.' },
  water: { label: 'Water', icon: 'Droplets', color: '#3b82f6', description: 'Essential for processing and cooling.' },
  coal: { label: 'Coal', icon: 'Flame', color: '#1f2937', description: 'Fuel for smelting and power generation.' },
  copper_ore: { label: 'Copper Ore', icon: 'Circle', color: '#b87333', description: 'Raw copper ore for refining.' },
  limestone: { label: 'Limestone', icon: 'Mountain', color: '#9ca3af', description: 'Rock used in cement production.' },
  crude_oil: { label: 'Crude Oil', icon: 'Fuel', color: '#1a1a2e', description: 'Raw petroleum for refining.' },
  clay: { label: 'Clay', icon: 'Layers', color: '#a55d35', description: 'Moldable material for bricks and ceramics.' },
  lead: { label: 'Lead Ore', icon: 'Hexagon', color: '#4a5568', description: 'Heavy metal for radiation shielding.' },
  sulfur: { label: 'Sulfur', icon: 'Triangle', color: '#fbbf24', description: 'Chemical component for acid production.' },
  gold: { label: 'Gold', icon: 'Star', color: '#ffd700', description: 'Precious metal for electronics.' },
  uranium: { label: 'Uranium', icon: 'Radiation', color: '#22c55e', description: 'Nuclear fuel source.' },
  thorium: { label: 'Thorium', icon: 'Atom', color: '#84cc16', description: 'Advanced nuclear fuel.' },

  // Tier 2 - Basic Processing
  lumber: { label: 'Lumber', icon: 'Square', color: '#cd853f', description: 'Processed wood for construction.' },
  stone_block: { label: 'Stone Block', icon: 'Box', color: '#71717a', description: 'Processed stone for building.' },
  iron_ingot: { label: 'Iron Ingot', icon: 'Box', color: '#52525b', description: 'Refined iron ready for manufacturing.' },
  copper_ingot: { label: 'Copper Ingot', icon: 'Box', color: '#cd7f32', description: 'Refined copper for wiring.' },
  coal_brick: { label: 'Coal Brick', icon: 'Box', color: '#374151', description: 'Processed coal for efficient burning.' },
  glass_sheet: { label: 'Glass Sheet', icon: 'Square', color: '#93c5fd', description: 'Transparent material for construction.' },
  purified_water: { label: 'Purified Water', icon: 'Droplets', color: '#60a5fa', description: 'Clean water for industrial use.' },
  quicklime: { label: 'Quicklime', icon: 'Box', color: '#fcd34d', description: 'Processed limestone for cement.' },
  charcoal: { label: 'Charcoal', icon: 'Flame', color: '#4b5563', description: 'Alternative fuel from wood.' },
  crude_oil_extract: { label: 'Crude Oil Extract', icon: 'Droplet', color: '#2d2d44', description: 'Refined petroleum.' },
  slag: { label: 'Slag', icon: 'Box', color: '#6b7280', description: 'Byproduct used in cement.' },
  sawdust: { label: 'Sawdust', icon: 'Dust', color: '#d4d4d4', description: 'Wood byproduct for composting.' },

  // Tier 3 - Industrial Materials
  steel: { label: 'Steel', icon: 'Box', color: '#71717a', description: 'Strong metal alloy for construction.' },
  steel_sheet: { label: 'Steel Sheet', icon: 'Layers', color: '#a1a1aa', description: 'Flat steel for manufacturing.' },
  steel_pipe: { label: 'Steel Pipe', icon: 'Tube', color: '#52525b', description: 'Steel tubes for plumbing.' },
  copper_wire: { label: 'Copper Wire', icon: 'Line', color: '#c2410c', description: 'Conductive wire for electronics.' },
  plastic: { label: 'Plastic', icon: 'Box', color: '#06b6d4', description: 'Versatile material for components.' },
  rubber: { label: 'Rubber', icon: 'Circle', color: '#ef4444', description: 'Flexible material for tires and seals.' },
  cement: { label: 'Cement', icon: 'Package', color: '#a3a3a3', description: 'Binding material for construction.' },
  brick: { label: 'Brick', icon: 'Box', color: '#b45309', description: 'Building blocks for structures.' },
  aluminum_ingot: { label: 'Aluminum Ingot', icon: 'Box', color: '#cbd5e1', description: 'Lightweight metal for aerospace.' },
  chemical_resin: { label: 'Chemical Resin', icon: 'Flask', color: '#8b5cf6', description: 'Base for adhesives and coatings.' },
  fuel_oil: { label: 'Fuel Oil', icon: 'Droplet', color: '#1e1b4b', description: 'Diesel fuel for generators.' },
  sulfuric_acid: { label: 'Sulfuric Acid', icon: 'FlaskConical', color: '#facc15', description: 'Corrosive acid for batteries.' },
  lead_ingot: { label: 'Lead Ingot', icon: 'Box', color: '#64748b', description: 'Refined lead for shielding.' },
  graphite: { label: 'Graphite', icon: 'Hexagon', color: '#1e293b', description: 'Lubricant and nuclear moderator.' },

  // Tier 4 - Components
  gear: { label: 'Gear', icon: 'Settings', color: '#78350f', description: 'Mechanical component for machines.' },
  bearing: { label: 'Bearing', icon: 'Circle', color: '#92400e', description: 'Rotary support for shafts.' },
  electric_motor: { label: 'Electric Motor', icon: 'Zap', color: '#dc2626', description: 'Converts electricity to motion.' },
  magnetic_steel: { label: 'Magnetic Steel', icon: 'Magnet', color: '#7c3aed', description: 'Steel with magnetic properties.' },
  integrated_circuit: { label: 'Integrated Circuit', icon: 'Cpu', color: '#0891b2', description: 'Electronic chip for devices.' },
  pcb: { label: 'PCB', icon: 'Grid3x3', color: '#059669', description: 'Circuit board for electronics.' },
  pipe_assembly: { label: 'Pipe Assembly', icon: 'Tube', color: '#ea580c', description: 'Connected piping system.' },
  gearbox: { label: 'Gearbox', icon: 'Gear', color: '#c2410c', description: 'Transmits power with gear ratio.' },
  control_unit: { label: 'Control Unit', icon: 'Cpu', color: '#6366f1', description: 'Processes automation commands.' },
  battery: { label: 'Battery', icon: 'Battery', color: '#22c55e', description: 'Stores electrical energy.' },
  solar_cell: { label: 'Solar Cell', icon: 'Sun', color: '#3b82f6', description: 'Generates power from sunlight.' },
  heat_exchanger: { label: 'Heat Exchanger', icon: 'Thermometer', color: '#f97316', description: 'Transfers heat between fluids.' },
  
  // Maintenance Items
  lubricant: { label: 'Lubricant', icon: 'Droplet', color: '#a16207', description: 'Reduces friction in machines.' },
  coolant: { label: 'Coolant', icon: 'Snowflake', color: '#06b6d4', description: 'Cools nuclear reactors.' },
  spare_parts: { label: 'Spare Parts', icon: 'Wrench', color: '#64748b', description: 'Replacement components.' },
  gold_filament: { label: 'Gold Filament', icon: 'Thread', color: '#eab308', description: 'High-conductivity wire.' },

  // Tier 5 - Final Products
  factory_machine: { label: 'Factory Machine', icon: 'Factory', color: '#71717a', description: 'Automated production unit.' },
  basic_electronics: { label: 'Basic Electronics', icon: 'Smartphone', color: '#0ea5e9', description: 'Simple electronic devices.' },
  advanced_electronics: { label: 'Advanced Electronics', icon: 'Laptop', color: '#2563eb', description: 'Complex electronic devices.' },
  food_ration: { label: 'Food Ration', icon: 'Utensils', color: '#84cc16', description: 'Sustenance for population.' },
  medical_supply: { label: 'Medical Supply', icon: 'Syringe', color: '#ec4899', description: 'Healthcare materials.' },
  comfort_item: { label: 'Comfort Item', icon: 'Heart', color: '#f43f5e', description: 'Happiness item for population.' },
  building_block: { label: 'Building Block', icon: 'Home', color: '#78716c', description: 'Construction material.' },
  steel_frame: { label: 'Steel Frame', icon: 'Building', color: '#52525b', description: 'Structural steel framework.' },
  reinforced_glass: { label: 'Reinforced Glass', icon: 'Shield', color: '#bae6fd', description: 'Strong transparent material.' },
  basic_fuel_rod: { label: 'Basic Fuel Rod', icon: 'Atomic', color: '#4ade80', description: 'Nuclear fuel for reactors.' },
  vehicle: { label: 'Vehicle', icon: 'Car', color: '#f59e0b', description: 'Personal transportation.' },
  transport_truck: { label: 'Transport Truck', icon: 'Truck', color: '#d97706', description: 'Heavy cargo transport.' },
  basic_tool_set: { label: 'Basic Tool Set', icon: 'Hammer', color: '#71717a', description: 'Manual tools.' },
  advanced_tool_set: { label: 'Advanced Tool Set', icon: 'Wrench', color: '#52525b', description: 'Powered tools.' },
  
  // Power Generation
  coal_power_plant: { label: 'Coal Power Plant', icon: 'Factory', color: '#374151', description: 'Generates 200 kWh.' },
  diesel_generator: { label: 'Diesel Generator', icon: 'Zap', color: '#1f2937', description: 'Generates 1000 kWh.' },
  solar_power_array: { label: 'Solar Power Array', icon: 'Sun', color: '#fbbf24', description: 'Generates 500 kWh.' },
  wind_turbine: { label: 'Wind Turbine', icon: 'Wind', color: '#67e8f9', description: 'Generates 300 kWh.' },
  nuclear_reactor: { label: 'Nuclear Reactor', icon: 'Radiation', color: '#22c55e', description: 'Generates 5000 kWh.' },
  
  // Automation
  basic_automation: { label: 'Basic Automation', icon: 'Robot', color: '#8b5cf6', description: 'Simple automation controller.' },
  advanced_automation: { label: 'Advanced Automation', icon: 'Bot', color: '#7c3aed', description: 'Advanced automation system.' },
  
  // Packaging
  shipping_crate: { label: 'Shipping Crate', icon: 'Package', color: '#a78bfa', description: 'Container for goods.' },
  pallet: { label: 'Pallet', icon: 'Layers', color: '#a18077', description: 'Stack base for logistics.' },

  // Energy & Utilities
  energy: { label: 'Energy', icon: 'Zap', color: '#f59e0b', description: 'Required for heavy machinery and mining.' },
  research: { label: 'Research Data', icon: 'FlaskConical', color: '#a855f7', description: 'Used to unlock new technologies.' },

  // Legacy/Compatibility
  planks: { label: 'Planks', icon: 'Layout', color: '#d97706', description: 'Processed wood.' },
  iron_bars: { label: 'Iron Bars', icon: 'Box', color: '#374151', description: 'Refined iron.' },
  concrete: { label: 'Concrete', icon: 'Box', color: '#9ca3af', description: 'Processed stone.' },
  electronics: { label: 'Electronics', icon: 'Zap', color: '#3b82f6', description: 'Advanced components.' },
  concrete_mixer_unit: { label: 'Concrete Mixer', icon: 'Mixer', color: '#9ca3af', description: 'Produces concrete.' },
  steel_mill_unit: { label: 'Steel Mill', icon: 'Factory', color: '#6b7280', description: 'Produces steel.' },
  electronics_factory_unit: { label: 'Electronics Factory', icon: 'Cpu', color: '#3b82f6', description: 'Produces electronics.' },
  laboratory_unit: { label: 'Laboratory', icon: 'FlaskConical', color: '#a855f7', description: 'Produces research.' },
  power_plant_unit: { label: 'Power Plant', icon: 'Zap', color: '#f59e0b', description: 'Produces energy.' },
  sawmill_unit: { label: 'Sawmill', icon: 'Trees', color: '#d97706', description: 'Produces planks.' },
  foundry_unit: { label: 'Foundry', icon: 'Flame', color: '#374151', description: 'Produces iron bars.' },
  logger_unit: { label: 'Logger', icon: 'Trees', color: '#8b4513', description: 'Produces wood.' },
  quarry_unit: { label: 'Stone Quarry', icon: 'Mountain', color: '#6b7280', description: 'Produces stone.' },
  mine_unit: { label: 'Iron Mine', icon: 'Hammer', color: '#4b5563', description: 'Produces iron.' },
};

export const PRODUCTION_RECIPES: Record<string, {
  name: string;
  tier: number;
  input: { type: ResourceType; amount: number }[];
  output: { type: ResourceType; amount: number };
  duration: number;
  heatOutput?: number;
  byproduct?: { type: ResourceType; amount: number };
  description: string;
  cost: number;
}> = {
  // ============ TIER 1 - RAW EXTRACTION ============
  logger: { tier: 1, name: 'Logger', input: [{ type: 'energy', amount: 1 }], output: { type: 'wood', amount: 2 }, duration: 5, description: 'Harvests wood from forests', cost: 100 },
  quarry: { tier: 1, name: 'Stone Quarry', input: [{ type: 'energy', amount: 2 }], output: { type: 'stone', amount: 2 }, duration: 8, description: 'Extracts stone from quarries', cost: 150 },
  mine: { tier: 1, name: 'Iron Mine', input: [{ type: 'energy', amount: 2 }], output: { type: 'iron', amount: 2 }, duration: 10, description: 'Mines iron ore', cost: 200 },
  coal_mine: { tier: 1, name: 'Coal Mine', input: [{ type: 'energy', amount: 2 }], output: { type: 'coal', amount: 2 }, duration: 8, description: 'Mines coal', cost: 250 },
  copper_mine: { tier: 1, name: 'Copper Mine', input: [{ type: 'energy', amount: 3 }], output: { type: 'copper_ore', amount: 1 }, duration: 12, description: 'Mines copper ore', cost: 350 },
  sand_extractor: { tier: 1, name: 'Sand Extractor', input: [{ type: 'energy', amount: 1 }], output: { type: 'sand', amount: 3 }, duration: 5, description: 'Extracts sand', cost: 100 },
  water_pump: { tier: 1, name: 'Water Pump', input: [{ type: 'energy', amount: 1 }], output: { type: 'water', amount: 5 }, duration: 5, description: 'Pumps water', cost: 80 },
  clay_pit: { tier: 1, name: 'Clay Pit', input: [{ type: 'energy', amount: 1 }], output: { type: 'clay', amount: 2 }, duration: 6, description: 'Extracts clay', cost: 120 },
  limestone_quarry: { tier: 1, name: 'Limestone Quarry', input: [{ type: 'energy', amount: 2 }], output: { type: 'limestone', amount: 2 }, duration: 8, description: 'Extracts limestone', cost: 180 },
  oil_rig: { tier: 1, name: 'Oil Rig', input: [{ type: 'energy', amount: 5 }], output: { type: 'crude_oil', amount: 1 }, duration: 15, description: 'Extracts crude oil', cost: 800 },
  // Food production - Tier 1 (critical for population survival)
  food_processor: { tier: 1, name: 'Food Processor', input: [{ type: 'wood', amount: 2 }], output: { type: 'food_ration', amount: 3 }, duration: 5, description: 'Processes food from wood', cost: 200 },

  // ============ TIER 2 - BASIC PROCESSING ============
  lumber_mill: { tier: 2, name: 'Lumber Mill', input: [{ type: 'wood', amount: 3 }], output: { type: 'lumber', amount: 1 }, duration: 6, description: 'Processes wood into lumber', cost: 300, byproduct: { type: 'sawdust', amount: 1 } },
  stone_cutter: { tier: 2, name: 'Stone Cutter', input: [{ type: 'stone', amount: 2 }], output: { type: 'stone_block', amount: 1 }, duration: 8, description: 'Cuts stone into blocks', cost: 250 },
  iron_smelter: { tier: 2, name: 'Iron Smelter', input: [{ type: 'iron', amount: 2 }, { type: 'coal', amount: 1 }], output: { type: 'iron_ingot', amount: 1 }, duration: 12, description: 'Smelts iron ore into ingots', cost: 500, heatOutput: 30, byproduct: { type: 'slag', amount: 1 } },
  copper_smelter: { tier: 2, name: 'Copper Smelter', input: [{ type: 'copper_ore', amount: 2 }, { type: 'coal', amount: 1 }], output: { type: 'copper_ingot', amount: 1 }, duration: 12, description: 'Smelts copper ore', cost: 450, heatOutput: 30, byproduct: { type: 'slag', amount: 1 } },
  coal_processor: { tier: 2, name: 'Coal Processor', input: [{ type: 'coal', amount: 2 }], output: { type: 'coal_brick', amount: 1 }, duration: 6, description: 'Processes coal into bricks', cost: 200 },
  glass_furnace: { tier: 2, name: 'Glass Furnace', input: [{ type: 'sand', amount: 3 }, { type: 'coal_brick', amount: 2 }], output: { type: 'glass_sheet', amount: 1 }, duration: 18, description: 'Produces glass sheets', cost: 800, heatOutput: 50 },
  water_purifier: { tier: 2, name: 'Water Purifier', input: [{ type: 'water', amount: 5 }, { type: 'sand', amount: 1 }], output: { type: 'purified_water', amount: 2 }, duration: 8, description: 'Purifies water', cost: 300 },
  lime_kiln: { tier: 2, name: 'Lime Kiln', input: [{ type: 'limestone', amount: 3 }], output: { type: 'quicklime', amount: 2 }, duration: 15, description: 'Produces quicklime', cost: 500, heatOutput: 40 },
  charcoal_kiln: { tier: 2, name: 'Charcoal Kiln', input: [{ type: 'wood', amount: 3 }], output: { type: 'charcoal', amount: 1 }, duration: 10, description: 'Produces charcoal', cost: 250 },
  oil_refinery: { tier: 2, name: 'Oil Refinery', input: [{ type: 'crude_oil', amount: 1 }], output: { type: 'crude_oil_extract', amount: 1 }, duration: 8, description: 'Refines crude oil', cost: 600 },

  // ============ TIER 3 - INDUSTRIAL MATERIALS ============
  steel_maker: { tier: 3, name: 'Steel Maker', input: [{ type: 'iron_ingot', amount: 2 }, { type: 'coal_brick', amount: 1 }], output: { type: 'steel', amount: 1 }, duration: 20, description: 'Produces steel from iron', cost: 1200, heatOutput: 100 },
  steel_roller: { tier: 3, name: 'Steel Roller', input: [{ type: 'steel', amount: 2 }], output: { type: 'steel_sheet', amount: 1 }, duration: 12, description: 'Rolls steel into sheets', cost: 800 },
  pipe_former: { tier: 3, name: 'Pipe Former', input: [{ type: 'steel', amount: 2 }], output: { type: 'steel_pipe', amount: 2 }, duration: 10, description: 'Forms steel pipes', cost: 600 },
  wire_drawer: { tier: 3, name: 'Wire Drawer', input: [{ type: 'copper_ingot', amount: 1 }], output: { type: 'copper_wire', amount: 3 }, duration: 8, description: 'Draws copper wire', cost: 400 },
  plastic_plant: { tier: 3, name: 'Plastic Plant', input: [{ type: 'crude_oil_extract', amount: 3 }], output: { type: 'plastic', amount: 2 }, duration: 18, description: 'Refines plastic from oil', cost: 1500 },
  rubber_plant: { tier: 3, name: 'Rubber Plant', input: [{ type: 'plastic', amount: 3 }], output: { type: 'rubber', amount: 2 }, duration: 10, description: 'Processes rubber', cost: 700 },
  cement_plant: { tier: 3, name: 'Cement Plant', input: [{ type: 'quicklime', amount: 2 }, { type: 'sand', amount: 2 }, { type: 'slag', amount: 1 }], output: { type: 'cement', amount: 3 }, duration: 20, description: 'Produces cement', cost: 1000 },
  brick_maker: { tier: 3, name: 'Brick Maker', input: [{ type: 'clay', amount: 3 }, { type: 'quicklime', amount: 1 }], output: { type: 'brick', amount: 4 }, duration: 12, description: 'Makes bricks', cost: 500 },
  aluminum_producer: { tier: 3, name: 'Aluminum Producer', input: [{ type: 'limestone', amount: 3 }, { type: 'coal_brick', amount: 2 }, { type: 'copper_wire', amount: 1 }], output: { type: 'aluminum_ingot', amount: 1 }, duration: 30, description: 'Produces aluminum', cost: 2000, heatOutput: 200 },
  chemical_plant: { tier: 3, name: 'Chemical Plant', input: [{ type: 'coal', amount: 2 }, { type: 'water', amount: 1 }], output: { type: 'chemical_resin', amount: 1 }, duration: 15, description: 'Produces chemical resin', cost: 900 },
  fuel_processor: { tier: 3, name: 'Fuel Processor', input: [{ type: 'crude_oil_extract', amount: 2 }], output: { type: 'fuel_oil', amount: 1 }, duration: 12, description: 'Processes fuel oil', cost: 700 },
  acid_plant: { tier: 3, name: 'Acid Plant', input: [{ type: 'sulfur', amount: 2 }, { type: 'quicklime', amount: 1 }], output: { type: 'sulfuric_acid', amount: 2 }, duration: 20, description: 'Produces sulfuric acid', cost: 1100 },
  lead_smelter: { tier: 3, name: 'Lead Smelter', input: [{ type: 'lead', amount: 2 }, { type: 'coal_brick', amount: 1 }], output: { type: 'lead_ingot', amount: 1 }, duration: 15, description: 'Smelts lead', cost: 600 },
  graphite_press: { tier: 3, name: 'Graphite Press', input: [{ type: 'coal', amount: 2 }, { type: 'coal_brick', amount: 1 }, { type: 'lead_ingot', amount: 1 }], output: { type: 'graphite', amount: 1 }, duration: 18, description: 'Presses graphite', cost: 800 },

  // ============ TIER 4 - COMPONENTS ============
  gear_factory: { tier: 4, name: 'Gear Factory', input: [{ type: 'steel', amount: 1 }], output: { type: 'gear', amount: 3 }, duration: 8, description: 'Manufactures gears', cost: 1000 },
  bearing_factory: { tier: 4, name: 'Bearing Factory', input: [{ type: 'steel', amount: 2 }, { type: 'copper_wire', amount: 1 }], output: { type: 'bearing', amount: 2 }, duration: 12, description: 'Manufactures bearings', cost: 1200 },
  motor_factory: { tier: 4, name: 'Motor Factory', input: [{ type: 'steel_sheet', amount: 2 }, { type: 'copper_wire', amount: 3 }, { type: 'magnetic_steel', amount: 1 }], output: { type: 'electric_motor', amount: 1 }, duration: 25, description: 'Manufactures electric motors', cost: 2500 },
  magnetizer: { tier: 4, name: 'Magnetizer', input: [{ type: 'steel', amount: 2 }, { type: 'iron_ingot', amount: 1 }], output: { type: 'magnetic_steel', amount: 1 }, duration: 18, description: 'Creates magnetic steel', cost: 1500 },
  ic_factory: { tier: 4, name: 'IC Factory', input: [{ type: 'copper_wire', amount: 2 }, { type: 'plastic', amount: 1 }, { type: 'chemical_resin', amount: 1 }], output: { type: 'integrated_circuit', amount: 1 }, duration: 30, description: 'Produces integrated circuits', cost: 3000 },
  pcb_factory: { tier: 4, name: 'PCB Factory', input: [{ type: 'plastic', amount: 2 }, { type: 'copper_wire', amount: 3 }, { type: 'chemical_resin', amount: 1 }], output: { type: 'pcb', amount: 1 }, duration: 20, description: 'Produces PCBs', cost: 1800 },
  pipe_assembler: { tier: 4, name: 'Pipe Assembler', input: [{ type: 'steel_pipe', amount: 4 }, { type: 'rubber', amount: 2 }, { type: 'steel_sheet', amount: 1 }], output: { type: 'pipe_assembly', amount: 1 }, duration: 15, description: 'Assembles pipe systems', cost: 1100 },
  gearbox_factory: { tier: 4, name: 'Gearbox Factory', input: [{ type: 'gear', amount: 4 }, { type: 'bearing', amount: 2 }, { type: 'steel_sheet', amount: 1 }], output: { type: 'gearbox', amount: 1 }, duration: 22, description: 'Manufactures gearboxes', cost: 2000 },
  control_factory: { tier: 4, name: 'Control Unit Factory', input: [{ type: 'integrated_circuit', amount: 2 }, { type: 'pcb', amount: 1 }, { type: 'copper_wire', amount: 2 }], output: { type: 'control_unit', amount: 1 }, duration: 28, description: 'Produces control units', cost: 2800 },
  battery_plant: { tier: 4, name: 'Battery Plant', input: [{ type: 'lead_ingot', amount: 2 }, { type: 'sulfuric_acid', amount: 1 }, { type: 'plastic', amount: 1 }], output: { type: 'battery', amount: 1 }, duration: 18, description: 'Produces batteries', cost: 1500 },
  solar_panel_factory: { tier: 4, name: 'Solar Panel Factory', input: [{ type: 'glass_sheet', amount: 2 }, { type: 'copper_wire', amount: 1 }, { type: 'aluminum_ingot', amount: 1 }], output: { type: 'solar_cell', amount: 1 }, duration: 35, description: 'Produces solar cells', cost: 3500 },
  heat_exchanger_factory: { tier: 4, name: 'Heat Exchanger Factory', input: [{ type: 'steel_pipe', amount: 2 }, { type: 'steel_sheet', amount: 1 }, { type: 'copper_wire', amount: 1 }], output: { type: 'heat_exchanger', amount: 1 }, duration: 25, description: 'Produces heat exchangers', cost: 1800 },

  // Maintenance Items
  lubricant_plant: { tier: 4, name: 'Lubricant Plant', input: [{ type: 'rubber', amount: 1 }, { type: 'plastic', amount: 1 }], output: { type: 'lubricant', amount: 2 }, duration: 10, description: 'Produces lubricant', cost: 500 },
  coolant_plant: { tier: 4, name: 'Coolant Plant', input: [{ type: 'purified_water', amount: 2 }, { type: 'chemical_resin', amount: 1 }], output: { type: 'coolant', amount: 2 }, duration: 15, description: 'Produces coolant', cost: 800 },
  parts_factory: { tier: 4, name: 'Spare Parts Factory', input: [{ type: 'gear', amount: 2 }, { type: 'bearing', amount: 1 }, { type: 'steel_sheet', amount: 1 }], output: { type: 'spare_parts', amount: 3 }, duration: 20, description: 'Produces spare parts', cost: 1200 },
  gold_wire_factory: { tier: 4, name: 'Gold Wire Factory', input: [{ type: 'gold', amount: 1 }, { type: 'chemical_resin', amount: 1 }], output: { type: 'gold_filament', amount: 2 }, duration: 25, description: 'Produces gold filament', cost: 5000 },

  // ============ TIER 5 - FINAL PRODUCTS ============
  factory_machine_builder: { tier: 5, name: 'Factory Machine Builder', input: [{ type: 'steel_sheet', amount: 3 }, { type: 'gearbox', amount: 2 }, { type: 'electric_motor', amount: 1 }], output: { type: 'factory_machine', amount: 1 }, duration: 50, description: 'Builds factory machines', cost: 5000, maintenance: 'lubricant' },
  electronics_factory_basic: { tier: 5, name: 'Basic Electronics Factory', input: [{ type: 'integrated_circuit', amount: 2 }, { type: 'pcb', amount: 1 }, { type: 'plastic', amount: 1 }], output: { type: 'basic_electronics', amount: 1 }, duration: 35, description: 'Produces basic electronics', cost: 3500 },
  electronics_factory_advanced: { tier: 5, name: 'Advanced Electronics Factory', input: [{ type: 'integrated_circuit', amount: 2 }, { type: 'control_unit', amount: 1 }, { type: 'battery', amount: 1 }], output: { type: 'advanced_electronics', amount: 1 }, duration: 55, description: 'Produces advanced electronics', cost: 6000 },
  food_processor: { tier: 5, name: 'Food Processor', input: [{ type: 'purified_water', amount: 2 }, { type: 'wood', amount: 3 }], output: { type: 'food_ration', amount: 4 }, duration: 15, description: 'Processes food rations', cost: 800 },
  medical_factory: { tier: 5, name: 'Medical Supply Factory', input: [{ type: 'chemical_resin', amount: 1 }, { type: 'purified_water', amount: 1 }, { type: 'plastic', amount: 1 }], output: { type: 'medical_supply', amount: 2 }, duration: 25, description: 'Produces medical supplies', cost: 2000 },
  comfort_factory: { tier: 5, name: 'Comfort Item Factory', input: [{ type: 'lumber', amount: 1 }, { type: 'plastic', amount: 1 }, { type: 'copper_wire', amount: 1 }], output: { type: 'comfort_item', amount: 1 }, duration: 20, description: 'Produces comfort items', cost: 1500 },
  construction_factory: { tier: 5, name: 'Construction Factory', input: [{ type: 'brick', amount: 2 }, { type: 'cement', amount: 1 }, { type: 'steel_sheet', amount: 1 }], output: { type: 'building_block', amount: 3 }, duration: 22, description: 'Produces building blocks', cost: 1800 },
  steel_frame_factory: { tier: 5, name: 'Steel Frame Factory', input: [{ type: 'steel_sheet', amount: 4 }, { type: 'steel_pipe', amount: 2 }], output: { type: 'steel_frame', amount: 1 }, duration: 35, description: 'Produces steel frames', cost: 2500 },
  glass_strengthener: { tier: 5, name: 'Glass Strengthener', input: [{ type: 'glass_sheet', amount: 3 }, { type: 'chemical_resin', amount: 1 }], output: { type: 'reinforced_glass', amount: 2 }, duration: 28, description: 'Produces reinforced glass', cost: 2200 },
  fuel_rod_factory: { tier: 5, name: 'Fuel Rod Factory', input: [{ type: 'steel', amount: 3 }, { type: 'uranium', amount: 2 }, { type: 'lead_ingot', amount: 1 }], output: { type: 'basic_fuel_rod', amount: 1 }, duration: 45, description: 'Produces nuclear fuel rods', cost: 8000 },
  vehicle_factory: { tier: 5, name: 'Vehicle Factory', input: [{ type: 'steel_frame', amount: 2 }, { type: 'gearbox', amount: 2 }, { type: 'rubber', amount: 4 }, { type: 'electric_motor', amount: 1 }], output: { type: 'vehicle', amount: 1 }, duration: 55, description: 'Produces vehicles', cost: 6000 },
  truck_factory: { tier: 5, name: 'Truck Factory', input: [{ type: 'vehicle', amount: 2 }, { type: 'battery', amount: 1 }, { type: 'control_unit', amount: 1 }], output: { type: 'transport_truck', amount: 1 }, duration: 70, description: 'Produces transport trucks', cost: 9000, maintenance: 'spare_parts' },
  tool_factory_basic: { tier: 5, name: 'Basic Tool Factory', input: [{ type: 'steel', amount: 2 }, { type: 'lumber', amount: 1 }, { type: 'rubber', amount: 1 }], output: { type: 'basic_tool_set', amount: 1 }, duration: 20, description: 'Produces basic tools', cost: 1200 },
  tool_factory_advanced: { tier: 5, name: 'Advanced Tool Factory', input: [{ type: 'basic_tool_set', amount: 2 }, { type: 'electric_motor', amount: 1 }, { type: 'battery', amount: 1 }], output: { type: 'advanced_tool_set', amount: 1 }, duration: 40, description: 'Produces advanced tools', cost: 3500 },

  // Power Generation
  coal_power_plant: { tier: 5, name: 'Coal Power Plant', input: [{ type: 'coal', amount: 4 }], output: { type: 'energy', amount: 200 }, duration: 5, description: 'Generates 200 kWh', cost: 3000 },
  diesel_plant: { tier: 5, name: 'Diesel Generator', input: [{ type: 'fuel_oil', amount: 2 }], output: { type: 'energy', amount: 1000 }, duration: 5, description: 'Generates 1000 kWh', cost: 5000 },
  solar_farm: { tier: 5, name: 'Solar Power Array', input: [{ type: 'solar_cell', amount: 6 }, { type: 'steel_frame', amount: 2 }, { type: 'control_unit', amount: 1 }], output: { type: 'energy', amount: 500 }, duration: 5, description: 'Generates 500 kWh', cost: 8000 },
  wind_turbine_plant: { tier: 5, name: 'Wind Turbine', input: [{ type: 'steel', amount: 4 }, { type: 'gearbox', amount: 3 }, { type: 'magnetic_steel', amount: 2 }], output: { type: 'energy', amount: 300 }, duration: 5, description: 'Generates 300 kWh', cost: 4000 },
  nuclear_plant: { tier: 5, name: 'Nuclear Reactor', input: [{ type: 'basic_fuel_rod', amount: 1 }], output: { type: 'energy', amount: 5000 }, duration: 5, description: 'Generates 5000 kWh', cost: 25000, maintenance: 'coolant' },

  // Automation
  automation_basic: { tier: 5, name: 'Basic Automation System', input: [{ type: 'control_unit', amount: 2 }, { type: 'basic_electronics', amount: 1 }, { type: 'copper_wire', amount: 1 }], output: { type: 'basic_automation', amount: 1 }, duration: 40, description: 'Basic automation controller', cost: 4000 },
  automation_advanced: { tier: 5, name: 'Advanced Automation System', input: [{ type: 'basic_automation', amount: 2 }, { type: 'advanced_electronics', amount: 1 }, { type: 'control_unit', amount: 1 }], output: { type: 'advanced_automation', amount: 1 }, duration: 55, description: 'Advanced automation system', cost: 7000 },

  // Packaging
  crate_factory: { tier: 5, name: 'Crate Factory', input: [{ type: 'lumber', amount: 2 }, { type: 'plastic', amount: 1 }, { type: 'iron_ingot', amount: 1 }], output: { type: 'shipping_crate', amount: 3 }, duration: 12, description: 'Makes shipping crates', cost: 600 },
  pallet_factory: { tier: 5, name: 'Pallet Factory', input: [{ type: 'lumber', amount: 4 }, { type: 'steel_sheet', amount: 2 }], output: { type: 'pallet', amount: 1 }, duration: 15, description: 'Makes pallets', cost: 400 },

  // Energy Production (Legacy)
  power_plant: { tier: 1, name: 'Power Plant', input: [{ type: 'wood', amount: 1 }], output: { type: 'energy', amount: 2 }, duration: 10, description: 'Generates energy from wood', cost: 500 },
  sawmill: { tier: 2, name: 'Sawmill', input: [{ type: 'wood', amount: 2 }, { type: 'energy', amount: 1 }], output: { type: 'planks', amount: 2 }, duration: 8, description: 'Processes wood into planks', cost: 400 },
  foundry: { tier: 2, name: 'Foundry', input: [{ type: 'iron', amount: 2 }, { type: 'energy', amount: 2 }], output: { type: 'iron_bars', amount: 1 }, duration: 12, description: 'Smelts iron into bars', cost: 600 },
  concrete_mixer: { tier: 2, name: 'Concrete Mixer', input: [{ type: 'stone', amount: 2 }, { type: 'energy', amount: 2 }], output: { type: 'concrete', amount: 1 }, duration: 15, description: 'Mixes concrete', cost: 800 },
  electronics_plant: { tier: 3, name: 'Electronics Factory', input: [{ type: 'iron_bars', amount: 1 }, { type: 'planks', amount: 1 }, { type: 'energy', amount: 4 }], output: { type: 'electronics', amount: 1 }, duration: 25, description: 'Produces electronics', cost: 2000 },
  laboratory: { tier: 2, name: 'Laboratory', input: [{ type: 'electronics', amount: 1 }, { type: 'energy', amount: 5 }], output: { type: 'research', amount: 1 }, duration: 30, description: 'Generates research data', cost: 5000 },
};

export const INITIAL_PRODUCTION_UNITS: ProductionUnit[] = [
  { id: 'logger', name: 'Logger', input: [{ type: 'energy', amount: 1 }], output: { type: 'wood', amount: 2 }, duration: 5, isAutomated: false, isProducing: false, isPaused: false, progress: 0, level: 1, upgradeCost: 200, energyPerTick: 0, inputBuffer: {}, outputBuffer: {}, trucks: 0 },
  { id: 'quarry', name: 'Stone Quarry', input: [{ type: 'energy', amount: 2 }], output: { type: 'stone', amount: 2 }, duration: 8, isAutomated: false, isProducing: false, isPaused: false, progress: 0, level: 1, upgradeCost: 300, energyPerTick: 0, inputBuffer: {}, outputBuffer: {}, trucks: 0 },
  { id: 'mine', name: 'Iron Mine', input: [{ type: 'energy', amount: 2 }], output: { type: 'iron', amount: 2 }, duration: 10, isAutomated: false, isProducing: false, isPaused: false, progress: 0, level: 1, upgradeCost: 400, energyPerTick: 0, inputBuffer: {}, outputBuffer: {}, trucks: 0 },
  { id: 'power_plant', name: 'Power Plant', input: [{ type: 'wood', amount: 1 }], output: { type: 'energy', amount: 2 }, duration: 10, isAutomated: false, isProducing: false, isPaused: false, progress: 0, level: 1, upgradeCost: 500, energyPerTick: 0, inputBuffer: {}, outputBuffer: {}, trucks: 0 },
  { id: 'food_processor', name: 'Food Processor', input: [{ type: 'wood', amount: 2 }], output: { type: 'food_ration', amount: 3 }, duration: 5, isAutomated: false, isProducing: false, isPaused: false, progress: 0, level: 1, upgradeCost: 200, energyPerTick: 0, inputBuffer: {}, outputBuffer: {}, trucks: 0 },
  { id: 'sawmill', name: 'Sawmill', input: [{ type: 'wood', amount: 2 }, { type: 'energy', amount: 1 }], output: { type: 'planks', amount: 2 }, duration: 8, isAutomated: false, isProducing: false, isPaused: false, progress: 0, level: 1, upgradeCost: 400, energyPerTick: 0, inputBuffer: {}, outputBuffer: {}, trucks: 0 },
  { id: 'foundry', name: 'Foundry', input: [{ type: 'iron', amount: 2 }, { type: 'energy', amount: 2 }], output: { type: 'iron_bars', amount: 1 }, duration: 12, isAutomated: false, isProducing: false, isPaused: false, progress: 0, level: 1, upgradeCost: 800, energyPerTick: 0, inputBuffer: {}, outputBuffer: {}, trucks: 0 },
  { id: 'concrete_mixer', name: 'Concrete Mixer', input: [{ type: 'stone', amount: 2 }, { type: 'energy', amount: 2 }], output: { type: 'concrete', amount: 1 }, duration: 15, isAutomated: false, isProducing: false, isPaused: false, progress: 0, level: 1, upgradeCost: 800, energyPerTick: 0, inputBuffer: {}, outputBuffer: {}, trucks: 0 },
  { id: 'electronics_factory', name: 'Electronics Factory', input: [{ type: 'iron_bars', amount: 1 }, { type: 'planks', amount: 1 }, { type: 'energy', amount: 4 }], output: { type: 'electronics', amount: 1 }, duration: 25, isAutomated: false, isProducing: false, isPaused: false, progress: 0, level: 1, upgradeCost: 2000, energyPerTick: 0, inputBuffer: {}, outputBuffer: {}, trucks: 0 },
  // Laboratory unlocked at 500 population (handled dynamically)
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

// ============ HEAT SYSTEM CONSTANTS ============
export const MAX_HEAT = 1000;
export const BASE_HEAT_DISSIPATION = 10; // Base heat dissipation per tick
export const WATER_COOLING_BONUS = 25; // Additional dissipation with water
export const HEAT_EXCHANGER_BONUS = 50; // Additional dissipation with heat exchanger
export const OVERHEAT_THRESHOLD = 800; // At this level, production slows
export const CRITICAL_HEAT_THRESHOLD = 950; // At this level, production stops
export const HEAT_WARNING_THRESHOLD = 600; // Warning level

// ============ POPULATION CONSTANTS ============
export const INITIAL_POPULATION = 10;
export const MAX_POPULATION = 1000;
export const BASE_POPULATION_GROWTH = 0.1; // Per tick when happy
export const POPULATION_DECAY = 0.05; // Per tick when unhappy (no food)

// Consumption rates per population per tick
export const FOOD_CONSUMPTION_RATE = 0.1; // Food needed per person
export const COMFORT_CONSUMPTION_RATE = 0.01; // Comfort items needed
export const MEDICAL_CONSUMPTION_RATE = 0.001; // Medical supplies needed
export const ENERGY_CONSUMPTION_RATE = 0.5; // Energy per person (for housing)

// Happiness
export const HAPPINESS_DECAY = 2; // Per tick without needs
export const HAPPINESS_RECOVERY = 1; // Per tick with needs met
export const HAPPINESS_WARNING_THRESHOLD = 50;
export const HAPPINESS_CRITICAL_THRESHOLD = 30;

// Efficiency bonuses
export const POPULATION_EFFICIENCY_BONUS = 0.1; // +10% production when needs met
export const POPULATION_EFFICIENCY_PENALTY = 0.3; // -30% production when needs not met
export const HAPPINESS_TAX_BONUS = 0.05; // +5% tax per happiness point above 70

// Worker requirements
export const WORKERS_PER_FACTORY = 5; // Workers needed per factory
export const BASE_WORKER_PRODUCTION = 0.2; // Base production bonus per worker

// Tax/Income
export const BASE_TAX_RATE = 0.1; // Base 10% of population generates as tax
export const TAX_INTERVAL = 1000; // Every 1 second (tick)

// ============ BUILDINGS ============
export const BUILDINGS: Record<BuildingType, {
  name: string;
  populationCapacity: number;
  happinessBonus: number;
  resourceConsumption: Record<ResourceType, number>;
  baseCost: number;
  costMultiplier: number;
  description: string;
}> = {
  house: {
    name: 'House',
    populationCapacity: 10,
    happinessBonus: 5,
    resourceConsumption: { food_ration: 1 },
    baseCost: 500,
    costMultiplier: 1.5,
    description: 'Basic housing for workers. Provides 10 population capacity.',
  },
  apartment: {
    name: 'Apartment Complex',
    populationCapacity: 50,
    happinessBonus: 15,
    resourceConsumption: { food_ration: 3, comfort_item: 1 },
    baseCost: 3000,
    costMultiplier: 1.8,
    description: 'Multi-family housing. Provides 50 population capacity.',
  },
  luxury_housing: {
    name: 'Luxury Housing',
    populationCapacity: 100,
    happinessBonus: 30,
    resourceConsumption: { food_ration: 5, comfort_item: 2, medical_supply: 1 },
    baseCost: 10000,
    costMultiplier: 2.0,
    description: 'High-end housing for VIPs. Provides 100 population capacity.',
  },
  hospital: {
    name: 'Hospital',
    populationCapacity: 0,
    happinessBonus: 20,
    resourceConsumption: { medical_supply: 3, energy: 10 },
    baseCost: 8000,
    costMultiplier: 2.0,
    description: 'Provides medical care. Increases happiness and reduces illness.',
  },
  warehouse: {
    name: 'Warehouse',
    populationCapacity: 0,
    happinessBonus: 0,
    resourceConsumption: { energy: 5 },
    baseCost: 2000,
    costMultiplier: 1.5,
    description: 'Storage facility. Increases storage capacity for all resources.',
  },
  research_lab: {
    name: 'Research Lab',
    populationCapacity: 0,
    happinessBonus: 10,
    resourceConsumption: { energy: 20, research: 1 },
    baseCost: 15000,
    costMultiplier: 2.0,
    description: 'Advanced research facility. Boosts technology research speed.',
  },
};

// ============ LOGISTICS CONSTANTS ============
export const BASE_TRUCK_CAPACITY = 10;
export const BASE_TRUCK_SPEED = 1; // Units per tick
export const BASE_ROUTE_EFFICIENCY = 80; // Percentage
export const PRIORITY_MULTIPLIERS = {
  low: 0.5,
  medium: 1.0,
  high: 1.5,
  critical: 2.0,
};

// ============ MAINTENANCE CONSTANTS ============
export const MAINTENANCE_INTERVAL = 86400000; // 24 hours in ms
export const FACTORY_MAINTENANCE_RATE = 0.01; // 1% per day
export const MOTOR_MAINTENANCE_RATE = 0.02; // 2% per day
export const VEHICLE_MAINTENANCE_RATE = 0.005; // 0.5% per 1000km

export const TICK_RATE = 1000; // 1 second
export const MARKET_TICK_RATE = 1000; // 1 second
export const HISTORY_LIMIT = 100;
