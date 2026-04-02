export type ResourceType = 'energy' | 'water' | 'food' | 'minerals' | 'tech' | 'luxury';

export interface ResourceState {
  resourceType: ResourceType;
  stockGlobal: number;
  stockLocal: number;
  price: number;
  demand: number;
  supply: number;
  volatility: number;
  trend: number;
  lastPrices: number[];
  state?: 'surplus' | 'scarcity' | 'stable';
}

export interface MarketOrder {
  id: string;
  username: string;
  type: 'buy' | 'sell';
  resource: ResourceType;
  amount: number;
  price: number;
  timestamp: number;
}

export interface TradeHistory {
  id: string;
  buyerId: string;
  sellerId: string;
  resource: ResourceType;
  amount: number;
  price: number;
  timestamp: number;
}

export interface Contract {
  id: string;
  resource: ResourceType;
  totalAmount: number;
  deliveredAmount: number;
  totalValue: number;
  pricePerUnit: number;
  deadline: number;
  status: 'active' | 'completed' | 'expired' | 'failed';
  assignedPlayerId?: string;
  paymentType: 'upfront' | 'per_delivery' | 'completion';
  penalty?: number;
}

export interface User {
  username: string;
  money: number;
  token?: string;
}

export interface GameState {
  user: User | null;
  market: Record<ResourceType, ResourceState>;
  orderBook: MarketOrder[];
  tradeHistory: TradeHistory[];
  contracts: Contract[];
  inventory: Record<ResourceType, number>;
}
