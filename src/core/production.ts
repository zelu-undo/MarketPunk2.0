import { ResourceType } from '../types';

export interface ProductionFacility {
  id: string;
  type: ResourceType;
  level: number;
  baseRate: number;
  lastProduction: number;
}

export class ProductionSystem {
  facilities: ProductionFacility[] = [];

  constructor() {
    this.facilities = [
      { id: 'energy-plant-1', type: 'energy', level: 1, baseRate: 10, lastProduction: Date.now() },
      { id: 'water-purifier-1', type: 'water', level: 1, baseRate: 8, lastProduction: Date.now() },
    ];
  }

  calculateProduction(facility: ProductionFacility): number {
    const now = Date.now();
    const elapsed = (now - facility.lastProduction) / 1000; // in seconds
    const production = facility.baseRate * facility.level * (elapsed / 3600); // per hour
    facility.lastProduction = now;
    return Math.floor(production);
  }

  tick() {
    this.facilities.forEach(facility => {
      const produced = this.calculateProduction(facility);
      if (produced > 0) {
        console.log(`Produced ${produced} units of ${facility.type}`);
        // In a real implementation, we would add this to the player's inventory
      }
    });
  }
}

export const productionSystem = new ProductionSystem();
