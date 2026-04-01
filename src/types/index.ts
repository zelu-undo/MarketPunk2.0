/**
 * MarketPunk - Tipos Principais
 */

// ============================================================================
// RECURSOS
// ============================================================================

export type ResourceType = string;

export interface Resource {
  id: ResourceType;
  name: string;
  tier: number;
  category: ResourceCategory;
  basePrice: number;
  stackSize: number;
  isRaw: boolean;
}

export type ResourceCategory = 
  | 'raw'           // Tier 1: recursos brutos
  | 'processed'     // Tier 2: processamento básico
  | 'material'     // Tier 3: materiais industriais
  | 'component'   // Tier 4: componentes
  | 'product'     // Tier 5: produtos finais
  | 'maintenance' // Manutenção
  | 'energy';    // Energia

// ============================================================================
// LOCALIZAÇÕES
// ============================================================================

export interface Vector2D {
  x: number;
  y: number;
}

export type LocationType = 'warehouse' | 'producer' | 'consumer' | 'mine' | 'base';

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  position: Vector2D;
  storage: Map<ResourceType, number>;
  maxStorage: Map<ResourceType, number>;
  isActive: boolean;
}

// ============================================================================
// PRODUÇÃO
// ============================================================================

export interface Recipe {
  id: string;
  name: string;
  inputs: Map<ResourceType, number>;
  outputs: Map<ResourceType, number>;
  byproducts: Map<ResourceType, number>;
  timeSeconds: number;
  complexity: number;
  tier: number;
  energyCost: number;
  heatGenerated: number;
  category: ProductionCategory;
}

export type ProductionCategory = 
  | 'crafting'
  | 'mining'
  | 'refining'
  | 'assembly'
  | 'manufacturing';

// ============================================================================
// LOGÍSTICA
// ============================================================================

export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type RouteStatus = 'active' | 'paused' | 'blocked' | 'inefficient';

export interface Route {
  id: string;
  name: string;
  originId: string;
  destinationId: string;
  resourceType: ResourceType;
  amount: number;
  priority: Priority;
  status: RouteStatus;
  trucksAllocated: number;
  complexity: number;
  currentLoad: number;
}

export interface RouteMetrics {
  routeId: string;
  throughput: number;
  efficiency: number;
  idleTime: number;
  bottleneck: BottleneckType | null;
}

export type BottleneckType = 
  | 'no_resource_at_origin'
  | 'destination_full'
  | 'no_trucks'
  | 'path_blocked';

// ============================================================================
// MERCADO
// ============================================================================

export type OrderType = 'buy' | 'sell';
export type OrderStatus = 'active' | 'filled' | 'cancelled' | 'expired';

export interface MarketOrder {
  id: string;
  playerId: string;
  type: OrderType;
  resourceType: ResourceType;
  amount: number;
  amountFilled: number;
  pricePerUnit: number;
  status: OrderStatus;
  locationId: string | null;
  createdAt: number;
  expiresAt: number;
}

export interface MarketData {
  resourceType: ResourceType;
  lastTransactions: Transaction[];
  trend: 'rising' | 'falling' | 'stable';
  volume: number;
  lowestAsk: number;
  highestBid: number;
}

export interface Transaction {
  price: number;
  amount: number;
  timestamp: number;
}

// ============================================================================
// ECONOMIA
// ============================================================================

export interface Player {
  id: string;
  name: string;
  credits: number;
  dataPoints: number;
  trucks: number;
  locations: string[];
  recipesUnlocked: Set<string>;
  specializations: PlayerSpecialization[];
}

export type PlayerSpecialization = 
  | 'industrial'
  | 'logistics'
  | 'trader'
  | 'energy';

export interface Population {
  total: number;
  employed: number;
  unemployed: number;
  happiness: number;
  needs: PopulationNeeds;
}

export interface PopulationNeeds {
  food: number;
  comfort: number;
  medical: number;
}

// ============================================================================
// SISTEMA DE ENERGIA
// ============================================================================

export type EnergySource = 
  | 'coal_plant'
  | 'diesel_generator'
  | 'solar_array'
  | 'wind_turbine'
  | 'nuclear_reactor';

export interface EnergySystem {
  totalCapacity: number;
  currentUsage: number;
  sources: Map<EnergySource, number>;
  heatLevel: number;
  maxHeat: number;
}

// ============================================================================
// MANUTENÇÃO
// ============================================================================

export interface MaintenanceItem {
  itemId: string;
  type: 'machine' | 'vehicle' | 'generator';
  decayRate: number;
  currentDurability: number;
  requires: ResourceType;
  lastMaintenance: number;
}

// ============================================================================
// REGRAS DE LOGÍSTICA
// ============================================================================

export interface LogisticsRule {
  id: string;
  name: string;
  enabled: boolean;
  condition: RuleCondition;
  action: RuleAction;
  cooldown: number;
  lastRun: number;
}

export interface RuleCondition {
  type: 'resource_level' | 'efficiency' | 'status' | 'custom';
  resourceId?: string;
  locationId?: string;
  threshold?: number;
  comparison?: '<' | '>';
  routeId?: string;
  efficiencyThreshold?: number;
  statusMatch?: RouteStatus;
}

export interface RuleAction {
  type: 'add_trucks' | 'remove_trucks' | 'set_priority' | 'pause' | 'activate';
  routeId?: string;
  amount?: number;
  newPriority?: Priority;
}