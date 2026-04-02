import { ResourceType, ResourceState, Contract, MarketOrder } from '../types';

export class EconomicController {
  resources: Map<ResourceType, ResourceState> = new Map();
  contracts: Map<string, Contract> = new Map();
  orderBook: MarketOrder[] = [];
  config = {
    maxContractsPerPlayer: 5,
    npcLiquidity: 100,
    minPrice: 1,
  };

  constructor(resourceTypes: ResourceType[]) {
    resourceTypes.forEach(type => {
      this.resources.set(type, {
        resourceType: type,
        stockGlobal: 1000,
        stockLocal: 100,
        price: 100,
        demand: 50,
        supply: 50,
        volatility: 0.1,
        trend: 0,
        lastPrices: [100, 100, 100, 100, 100],
        state: 'stable'
      });
    });
  }

  tick(marketState: any, orderBook: any[], tradeHistory: any[]) {
    this.resources.forEach(resource => {
      // Simple price fluctuation
      const change = (Math.random() - 0.5) * resource.volatility * resource.price;
      resource.price = Math.max(this.config.minPrice, Math.round(resource.price + change));
      resource.lastPrices.push(resource.price);
      if (resource.lastPrices.length > 20) resource.lastPrices.shift();
      
      // Update marketState for server
      if (marketState[resource.resourceType]) {
        marketState[resource.resourceType].price = resource.price;
      }
    });

    this.npcMarketMaker(orderBook);
    this.generateContracts();
  }

  npcMarketMaker(orderBook: any[]) {
    this.resources.forEach(resource => {
      // NPCs provide liquidity
      if (Math.random() > 0.7) {
        const type = Math.random() > 0.5 ? 'buy' : 'sell';
        const amount = Math.floor(Math.random() * 20) + 1;
        const price = type === 'buy' ? resource.price - 2 : resource.price + 2;
        
        orderBook.push({
          id: 'npc-' + Math.random().toString(36).substr(2, 9),
          username: 'NPC_MarketMaker',
          type,
          resource: resource.resourceType,
          amount,
          price: Math.max(this.config.minPrice, Math.round(price)),
          timestamp: Date.now(),
        });
      }
    });

    // Limit order book size
    if (orderBook.length > 200) {
      orderBook.splice(0, orderBook.length - 200);
    }
  }

  generateContracts() {
    if (this.contracts.size < 10 && Math.random() > 0.8) {
      const types = Array.from(this.resources.keys());
      const type = types[Math.floor(Math.random() * types.length)];
      const resource = this.resources.get(type)!;
      const amount = Math.floor(Math.random() * 100) + 50;
      const pricePerUnit = Math.round(resource.price * 1.2);
      
      const id = 'contract-' + Math.random().toString(36).substr(2, 9);
      this.contracts.set(id, {
        id,
        resource: type,
        totalAmount: amount,
        deliveredAmount: 0,
        totalValue: amount * pricePerUnit,
        pricePerUnit,
        deadline: Date.now() + 3600000, // 1 hour
        status: 'active',
        paymentType: Math.random() > 0.5 ? 'per_delivery' : 'completion',
        penalty: Math.round(amount * pricePerUnit * 0.1)
      });
    }
  }
}
