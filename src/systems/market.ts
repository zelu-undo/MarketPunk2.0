import { ResourceType, MarketOrder, TradeHistory } from '../types';

export class MarketSystem {
  private orderBook: MarketOrder[] = [];
  private tradeHistory: TradeHistory[] = [];

  constructor() {
    this.orderBook = [];
    this.tradeHistory = [];
  }

  addOrder(order: MarketOrder) {
    this.orderBook.push(order);
    this.matchOrders();
  }

  private matchOrders() {
    // Simple order matching logic
    // In a real implementation, we would match buy and sell orders
    console.log('Matching orders in market system');
  }

  getOrderBook() {
    return this.orderBook;
  }

  getTradeHistory() {
    return this.tradeHistory;
  }
}

export const marketSystem = new MarketSystem();
