export type ResourceType = 'money' | 'wood' | 'stone' | 'iron' | 'energy' | 'planks' | 'iron_bars' | 'concrete' | 'steel' | 'electronics' | 'research';

export type TruckType = 'basic' | 'fast' | 'heavy';

export interface Truck {
  type: TruckType;
  capacity: number;
  speed: number; // multiplier
  cost: number;
}

export interface Mission {
  id: string;
  name: string;
  description: string;
  objective: { type: 'produce' | 'accumulate' | 'research', resource: ResourceType, amount: number };
  reward: number;
  isCompleted: boolean;
}

export interface Campaign {
  id: string;
  name: string;
  missions: Mission[];
  currentMissionIndex: number;
}

export interface Resource {
  type: ResourceType;
  amount: number;
  label: string;
  icon: string;
  color: string;
  storageLimit: number;
  storageLevel: number;
}

export interface ProductionUnit {
  id: string;
  name: string;
  input: { type: ResourceType; amount: number }[];
  output: { type: ResourceType; amount: number };
  duration: number; // in seconds
  isAutomated: boolean;
  isProducing: boolean;
  isPaused: boolean;
  progress: number; // 0 to 100
  lastStarted?: number;
  level: number;
  upgradeCost: number;
  energyPerTick: number;
  inputBuffer: Partial<Record<ResourceType, number>>;
  outputBuffer: Partial<Record<ResourceType, number>>;
  trucks: number;
  currentEfficiency?: number;
}

export interface MarketItem {
  type: ResourceType;
  price: number;
  history: { price: number; timestamp: number }[];
  volatility: number;
  basePrice: number;
  demand: number;
  supply: number;
}

export type Operator = '<' | '>' | '==';
export type Action = 'buy' | 'sell' | 'produce';

export interface AutomationCondition {
  resource: ResourceType;
  operator: Operator;
  value: number;
  isMarketCondition?: boolean; // New field to indicate if it's a market price condition
}

export interface Technology {
  id: string;
  name: string;
  description: string;
  cost: number; // in research points
  requirements: string[]; // ids of required technologies
  unlocks: string[]; // ids of production units unlocked
  icon: string;
}

export interface AutomationRule {
  id: string;
  conditions: AutomationCondition[];
  action: {
    type: Action;
    resource: ResourceType;
    amount: number;
  };
  isEnabled: boolean;
}

export interface User {
  username: string;
  token: string;
}

export interface Order {
  id: string;
  type: 'buy' | 'sell';
  resource: ResourceType;
  amount: number;
  price: number;
  ownerId: string;
  timestamp: number;
}

export interface TradeRecord {
  id: string;
  type: 'buy' | 'sell';
  resource: ResourceType;
  amount: number;
  price: number;
  timestamp: number;
  isOrder?: boolean;
}

export interface GameState {
  user: User | null;
  money: number;
  dataPoints: number;  // Data Points - starts with 60 (50 Lab + 10 Stone)
  resources: Record<ResourceType, number>;
  storageLimits: Record<ResourceType, number>;
  storageLevels: Record<ResourceType, number>;
  productionUnits: ProductionUnit[];
  market: Record<ResourceType, MarketItem>;
  orderBook: Order[];
  tradeHistory: TradeRecord[];
  automationRules: AutomationRule[];
  maxCompanies: number;
  maxAutomations: number;
  lastUpdate: number;
  totalProfit: number;
  profitHistory: number[];
  notification?: string;
  totalTrucks: number;
  availableTrucks: number;
  unlockedTechs: string[];
  netFlow: Record<ResourceType, number>;
  campaign: Campaign;
  // Heat System
  heatLevel: number;
  maxHeat: number;
  // Population System
  population: number;
  populationHappiness: number;
}
