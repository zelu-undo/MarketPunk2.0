/**
 * MarketPunk - Sistema de Mercado (Estilo EVE)
 */

import { 
  MarketOrder, 
  MarketData, 
  Transaction, 
  OrderType, 
  OrderStatus,
  ResourceType 
} from '../types';

// ============================================================================
// CONSTANTES
// ============================================================================

const MAX_TRANSACTIONS_SHOWN = 10;  // Transações para mostrar
const TREND_WINDOW = 100;       // Janela para calcular tendência

// ============================================================================
// CLASSE PRINCIPAL
// ============================================================================

export class MarketSystem {
  private orders: Map<string, MarketOrder> = new Map();
  private transactions: Map<ResourceType, Transaction[]> = new Map();
  private marketData: Map<ResourceType, MarketData> = new Map();
  
  constructor() {
    // Inicializar
  }
  
  // ============================================================================
  // CRIAÇÃO DE ORDENS
  // ============================================================================
  
  /**
   * Cria uma ordem de compra
   */
  createBuyOrder(
    playerId: string,
    resourceType: ResourceType,
    amount: number,
    pricePerUnit: number,
    locationId: string | null = null,
    expiresIn: number = 3600 // 1 hora padrão
  ): MarketOrder {
    return this.createOrder(playerId, 'buy', resourceType, amount, pricePerUnit, locationId, expiresIn);
  }
  
  /**
   * Cria uma ordem de venda
   */
  createSellOrder(
    playerId: string,
    resourceType: ResourceType,
    amount: number,
    pricePerUnit: number,
    locationId: string | null = null,
    expiresIn: number = 3600
  ): MarketOrder {
    return this.createOrder(playerId, 'sell', resourceType, amount, pricePerUnit, locationId, expiresIn);
  }
  
  private createOrder(
    playerId: string,
    type: OrderType,
    resourceType: ResourceType,
    amount: number,
    pricePerUnit: number,
    locationId: string | null,
    expiresIn: number
  ): MarketOrder {
    const order: MarketOrder = {
      id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      playerId,
      type,
      resourceType,
      amount,
      amountFilled: 0,
      pricePerUnit,
      status: 'active',
      locationId,
      createdAt: Date.now(),
      expiresAt: Date.now() + expiresIn * 1000,
    };
    
    this.orders.set(order.id, order);
    return order;
  }
  
  /**
   * Cancela uma ordem
   */
  cancelOrder(orderId: string, playerId: string): boolean {
    const order = this.orders.get(orderId);
    if (!order || order.playerId !== playerId || order.status !== 'active') {
      return false;
    }
    
    order.status = 'cancelled';
    return true;
  }
  
  // ============================================================================
  // MATCHING ENGINE
  // ============================================================================
  
  /**
   * Executa matching para um recurso
   * Retorna: Array de execuções {buyOrder, sellOrder, amount, price}
   */
  matchOrders(resourceType: ResourceType): MatchResult[] {
    const results: MatchResult[] = [];
    
    // Pegar ordens ativas
    const buyOrders = this.getOrders(resourceType, 'buy')
      .filter(o => o.status === 'active')
      .sort((a, b) => b.pricePerUnit - a.pricePerUnit); // Maior preço primeiro
    
    const sellOrders = this.getOrders(resourceType, 'sell')
      .filter(o => o.status === 'active')
      .sort((a, b) => a.pricePerUnit - b.pricePerUnit); // Menor preço primeiro
    
    // Matching
    for (const buy of buyOrders) {
      for (const sell of sellOrders) {
        if (buy.status !== 'active' || sell.status !== 'active') continue;
        if (buy.pricePerUnit < sell.pricePerUnit) continue; // Preço incompatível
        
        // Calcular quanto executar
        const buyRemaining = buy.amount - buy.amountFilled;
        const sellRemaining = sell.amount - sell.amountFilled;
        const executeAmount = Math.min(buyRemaining, sellRemaining);
        
        if (executeAmount <= 0) continue;
        
        // Executar
        buy.amountFilled += executeAmount;
        sell.amountFilled += executeAmount;
        
        results.push({
          buyOrder: buy,
          sellOrder: sell,
          amount: executeAmount,
          price: sell.pricePerUnit,
        });
        
        // Criar transação
        this.addTransaction(resourceType, sell.pricePerUnit, executeAmount);
        
        // Marcar como filled se completo
        if (buy.amountFilled >= buy.amount) {
          buy.status = 'filled';
        }
        if (sell.amountFilled >= sell.amount) {
          sell.status = 'filled';
        }
      }
    }
    
    return results;
  }
  
  // ============================================================================
  // MERCADO: INFORMAÇÕES (IMPERFEITAS)
  // ============================================================================
  
  /**
   * Obtém dados do mercado para um recurso (informações imperfeitas)
   */
  getMarketData(resourceType: ResourceType): MarketData {
    // Verificar cache
    const cached = this.marketData.get(resourceType);
    if (cached) return cached;
    
    // Calcular dados
    const buyOrders = this.getOrders(resourceType, 'buy')
      .filter(o => o.status === 'active');
    const sellOrders = this.getOrders(resourceType, 'sell')
      .filter(o => o.status === 'active');
    
    const highestBid = buyOrders.length > 0
      ? Math.max(...buyOrders.map(o => o.pricePerUnit))
      : 0;
    
    const lowestAsk = sellOrders.length > 0
      ? Math.min(...sellOrders.map(o => o.pricePerUnit))
      : Infinity;
    
    const transactions = this.transactions.get(resourceType) || [];
    const trend = this.calculateTrend(transactions);
    const volume = transactions.reduce((sum, t) => sum + t.amount, 0);
    
    const data: MarketData = {
      resourceType,
      lastTransactions: transactions.slice(-MAX_TRANSACTIONS_SHOWN),
      trend,
      volume,
      lowestAsk: lowestAsk === Infinity ? 0 : lowestAsk,
      highestBid,
    };
    
    this.marketData.set(resourceType, data);
    return data;
  }
  
  /**
   * Calcula tendência baseada em transações recentes
   */
  private calculateTrend(transactions: Transaction[]): 'rising' | 'falling' | 'stable' {
    if (transactions.length < 2) return 'stable';
    
    const recent = transactions.slice(-TREND_WINDOW);
    if (recent.length < 2) return 'stable';
    
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));
    
    const firstAvg = firstHalf.reduce((sum, t) => sum + t.price, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, t) => sum + t.price, 0) / secondHalf.length;
    
    const diff = (secondAvg - firstAvg) / firstAvg;
    
    if (diff > 0.05) return 'rising';
    if (diff < -0.05) return 'falling';
    return 'stable';
  }
  
  private addTransaction(resourceType: ResourceType, price: number, amount: number): void {
    const transactions = this.transactions.get(resourceType) || [];
    
    transactions.push({
      price,
      amount,
      timestamp: Date.now(),
    });
    
    // Manter só últimos 100
    if (transactions.length > 100) {
      transactions.shift();
    }
    
    this.transactions.set(resourceType, transactions);
    this.marketData.delete(resourceType); // Invalidar cache
  }
  
  // ============================================================================
  // GETTERS
  // ============================================================================
  
  private getOrders(resourceType: ResourceType, type?: OrderType): MarketOrder[] {
    const all = Array.from(this.orders.values());
    if (type) {
      return all.filter(o => o.resourceType === resourceType && o.type === type);
    }
    return all.filter(o => o.resourceType === resourceType);
  }
  
  getOrder(orderId: string): MarketOrder | undefined {
    return this.orders.get(orderId);
  }
  
  getActiveOrders(resourceType: ResourceType): MarketOrder[] {
    return this.getOrders(resourceType).filter(o => o.status === 'active');
  }
  
  getOrdersByPlayer(playerId: string): MarketOrder[] {
    return Array.from(this.orders.values())
      .filter(o => o.playerId === playerId);
  }
  
  getAllOrders(): MarketOrder[] {
    return Array.from(this.orders.values());
  }
  
  /**
   * Obtém preço base (sem ordens)
   */
  getBasePrice(resourceType: ResourceType): number {
    const data = this.getMarketData(resourceType);
    if (data.highestBid === 0 && data.lowestAsk === 0) {
      return 1; // Fallback
    }
    // Retornar média se houver ordens
    if (data.highestBid > 0 && data.lowestAsk > 0) {
      return (data.highestBid + data.lowestAsk) / 2;
    }
    return data.highestBid || data.lowestAsk || 1;
  }
  
  /**
   * Compra instantânea (fill or kill)
   */
  instantBuy(
    playerId: string,
    resourceType: ResourceType,
    amount: number,
    maxPrice: number
  ): { success: boolean; spent: number; bought: number } {
    const sellOrders = this.getOrders(resourceType, 'sell')
      .filter(o => o.status === 'active' && o.pricePerUnit <= maxPrice)
      .sort((a, b) => a.pricePerUnit - b.pricePerUnit);
    
    let bought = 0;
    let spent = 0;
    
    for (const order of sellOrders) {
      if (bought >= amount) break;
      
      const available = order.amount - order.amountFilled;
      const buyAmount = Math.min(available, amount - bought);
      
      bought += buyAmount;
      spent += buyAmount * order.pricePerUnit;
      order.amountFilled += buyAmount;
      
      if (order.amountFilled >= order.amount) {
        order.status = 'filled';
      }
    }
    
    this.addTransaction(resourceType, spent / bought || 0, bought);
    
    return {
      success: bought >= amount,
      spent,
      bought,
    };
  }
  
  /**
   * Venda instantânea
   */
  instantSell(
    playerId: string,
    resourceType: ResourceType,
    amount: number,
    minPrice: number
  ): { success: boolean; earned: number; sold: number } {
    const buyOrders = this.getOrders(resourceType, 'buy')
      .filter(o => o.status === 'active' && o.pricePerUnit >= minPrice)
      .sort((a, b) => b.pricePerUnit - a.pricePerUnit);
    
    let sold = 0;
    let earned = 0;
    
    for (const order of buyOrders) {
      if (sold >= amount) break;
      
      const available = order.amount - order.amountFilled;
      const sellAmount = Math.min(available, amount - sold);
      
      sold += sellAmount;
      earned += sellAmount * order.pricePerUnit;
      order.amountFilled += sellAmount;
      
      if (order.amountFilled >= order.amount) {
        order.status = 'filled';
      }
    }
    
    this.addTransaction(resourceType, earned / sold || 0, sold);
    
    return {
      success: sold >= amount,
      earned,
      sold,
    };
  }
}

// ============================================================================
// TIPOS AUXILIARES
// ============================================================================

interface MatchResult {
  buyOrder: MarketOrder;
  sellOrder: MarketOrder;
  amount: number;
  price: number;
}

// ============================================================================
// EXEMPLOS DE USO
// ============================================================================

/*
// Criar mercado
const market = new MarketSystem();

// Jogador 1 cria ordem de compra
const buyOrder = market.createBuyOrder('player1', 'wood', 100, 1.2);
console.log('Buy order:', buyOrder);

// Jogador 2 cria ordem de venda
const sellOrder = market.createSellOrder('player2', 'wood', 100, 1.0);
console.log('Sell order:', sellOrder);

// Matching
const matches = market.matchOrders('wood');
console.log('Matches:', matches);

// Dados do mercado (imperfeitos)
const data = market.getMarketData('wood');
console.log('Market data:', data);
// {
//   resourceType: 'wood',
//   lastTransactions: [...],
//   trend: 'rising' | 'falling' | 'stable',
//   volume: 1000,
//   lowestAsk: 1.0,
//   highestBid: 1.2
// }
*/