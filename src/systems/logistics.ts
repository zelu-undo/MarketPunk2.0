import { ResourceType } from '../types';

export interface LogisticsRoute {
  id: string;
  source: string;
  destination: string;
  resource: ResourceType;
  amount: number;
  lastDelivery: number;
}

export class LogisticsSystem {
  routes: LogisticsRoute[] = [];

  constructor() {
    this.routes = [
      { id: 'route-1', source: 'energy-plant-1', destination: 'city-center', resource: 'energy', amount: 50, lastDelivery: Date.now() },
      { id: 'route-2', source: 'water-purifier-1', destination: 'industrial-zone', resource: 'water', amount: 30, lastDelivery: Date.now() },
    ];
  }

  calculateDelivery(route: LogisticsRoute): number {
    const now = Date.now();
    const elapsed = (now - route.lastDelivery) / 1000; // in seconds
    const delivery = route.amount * (elapsed / 3600); // per hour
    route.lastDelivery = now;
    return Math.floor(delivery);
  }

  tick() {
    this.routes.forEach(route => {
      const delivered = this.calculateDelivery(route);
      if (delivered > 0) {
        console.log(`Delivered ${delivered} units of ${route.resource} from ${route.source} to ${route.destination}`);
        // In a real implementation, we would update the source and destination inventories
      }
    });
  }
}

export const logisticsSystem = new LogisticsSystem();
