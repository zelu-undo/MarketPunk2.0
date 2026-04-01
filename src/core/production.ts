/**
 * MarketPunk - Sistema de Produção
 */

import { Resource, ResourceType, Recipe, ResourceCategory, Vector2D, Location, LocationType } from '../types';
import { getResources, getRecipes } from '../config/resources';

// ============================================================================
// SISTEMA DE PRODUÇÃO
// ============================================================================

export class ProductionSystem {
  private resources: Map<ResourceType, Resource> = new Map();
  private recipes: Map<string, Recipe> = new Map();
  private locations: Map<string, Location> = new Map();
  
  constructor() {
    this.loadResources();
    this.loadRecipes();
  }
  
  private loadResources(): void {
    const resources = getResources();
    for (const resource of resources) {
      this.resources.set(resource.id, resource);
    }
  }
  
  private loadRecipes(): void {
    const recipes = getRecipes();
    for (const recipe of recipes) {
      this.recipes.set(recipe.id, recipe);
    }
  }
  
  /**
   * Verifica se uma receita pode ser executada
   */
  canCraft(recipeId: string, locationId: string): boolean {
    const recipe = this.recipes.get(recipeId);
    const location = this.locations.get(locationId);
    
    if (!recipe || !location) return false;
    
    // Verificar inputs disponíveis
    for (const [resourceId, amount] of recipe.inputs) {
      const available = location.storage.get(resourceId) || 0;
      if (available < amount) return false;
    }
    
    return true;
  }
  
  /**
   * Executa uma receita de crafting
   * Retorna: true se bem-sucedido
   */
  craft(recipeId: string, locationId: string): boolean {
    const recipe = this.recipes.get(recipeId);
    const location = this.locations.get(locationId);
    
    if (!recipe || !location || !this.canCraft(recipeId, locationId)) {
      return false;
    }
    
    // Consumir inputs
    for (const [resourceId, amount] of recipe.inputs) {
      const current = location.storage.get(resourceId) || 0;
      location.storage.set(resourceId, current - amount);
    }
    
    // Gerar outputs
    for (const [resourceId, amount] of recipe.outputs) {
      const current = location.storage.get(resourceId) || 0;
      location.storage.set(resourceId, current + amount);
    }
    
    // Gerar subprodutos (byproducts)
    for (const [resourceId, amount] of recipe.byproducts) {
      const current = location.storage.get(resourceId) || 0;
      location.storage.set(resourceId, current + amount);
    }
    
    return true;
  }
  
  /**
   * Adiciona uma localização
   */
  addLocation(location: Location): void {
    this.locations.set(location.id, location);
  }
  
  /**
   * Obtém uma localização
   */
  getLocation(locationId: string): Location | undefined {
    return this.locations.get(locationId);
  }
  
  /**
   * Obtém todas as localizações
   */
  getAllLocations(): Location[] {
    return Array.from(this.locations.values());
  }
  
  /**
   * Obtém recurso por ID
   */
  getResource(resourceId: ResourceType): Resource | undefined {
    return this.resources.get(resourceId);
  }
  
  /**
   * Obtém todas as receitas
   */
  getRecipes(): Recipe[] {
    return Array.from(this.recipes.values());
  }
  
  /**
   * Obtém receita por ID
   */
  getRecipe(recipeId: string): Recipe | undefined {
    return this.recipes.get(recipeId);
  }
  
  /**
   * Obtém receitas por tier
   */
  getRecipesByTier(tier: number): Recipe[] {
    return Array.from(this.recipes.values()).filter(r => r.tier === tier);
  }
  
  /**
   * Obtém receitas que produzem um recurso específico
   */
  getRecipesProducing(resourceId: ResourceType): Recipe[] {
    return Array.from(this.recipes.values()).filter(
      r => r.outputs.has(resourceId)
    );
  }
}

// ============================================================================
// HELPER: CRIAÇÃO DE LOCALIZAÇÃO
// ============================================================================

export function createLocation(
  id: string,
  name: string,
  type: LocationType,
  position: Vector2D
): Location {
  return {
    id,
    name,
    type,
    position,
    storage: new Map(),
    maxStorage: new Map(),
    isActive: true,
  };
}

// ============================================================================
// HELPER: CRIAÇÃO DE RECURSOS INICIAIS
// ============================================================================

export function createInitialLocations(): Location[] {
  return [
    createLocation('warehouse_main', 'Armazém Principal', 'warehouse', { x: 0, y: 0 }),
    createLocation('house_1', 'Casa Inicial', 'base', { x: 10, y: 0 }),
  ];
}

// ============================================================================
// HELPER: CALCULAR TEMPO DE PRODUÇÃO
// ============================================================================

export function calculateProductionTime(baseTime: number, complexity: number): number {
  return baseTime + (complexity * 1.0); // 1s por etapa de complexidade
}