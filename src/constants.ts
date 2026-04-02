export const RESOURCES = {
  wood: { basePrice: 10, volatility: 0.05 },
  stone: { basePrice: 15, volatility: 0.05 },
  iron: { basePrice: 25, volatility: 0.08 },
  planks: { basePrice: 40, volatility: 0.1 },
  iron_bars: { basePrice: 120, volatility: 0.12 },
  energy: { basePrice: 5, volatility: 0.05 },
  concrete: { basePrice: 150, volatility: 0.15 },
  steel: { basePrice: 300, volatility: 0.2 },
  electronics: { basePrice: 500, volatility: 0.25 },
};

export const MARKET_CONFIG = {
  tickRate: 5000,
  maxOrders: 200,
  minPrice: 1,
};
