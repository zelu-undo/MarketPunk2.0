import { ResourceType } from '../types';

export interface ResourceConfig {
  type: ResourceType;
  name: string;
  description: string;
  basePrice: number;
  volatility: number;
  rarity: number;
}

export const RESOURCES_CONFIG: Record<ResourceType, ResourceConfig> = {
  energy: { type: 'energy', name: 'Energy', description: 'Power for the grid', basePrice: 50, volatility: 0.1, rarity: 1 },
  water: { type: 'water', name: 'Water', description: 'Essential for life', basePrice: 30, volatility: 0.05, rarity: 1 },
  food: { type: 'food', name: 'Food', description: 'Nourishment for the citizens', basePrice: 40, volatility: 0.08, rarity: 1 },
  minerals: { type: 'minerals', name: 'Minerals', description: 'Raw materials for industry', basePrice: 80, volatility: 0.15, rarity: 2 },
  tech: { type: 'tech', name: 'Tech', description: 'Advanced components', basePrice: 150, volatility: 0.2, rarity: 3 },
  luxury: { type: 'luxury', name: 'Luxury', description: 'High-end goods', basePrice: 300, volatility: 0.25, rarity: 4 },
};
