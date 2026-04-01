/**
 * MarketPunk - Sistema Principal do Jogo
 */

import { ProductionSystem } from './production';
import { LogisticsSystem } from '../systems/logistics';
import { MarketSystem } from '../systems/market';
import { 
  Player, 
  ResourceType, 
  Vector2D, 
  Population, 
  EnergySystem,
  MaintenanceItem,
  PlayerSpecialization,
  Location
} from '../types';
import { createInitialLocations } from './production';

// ============================================================================
// CONSTANTES DO JOGO
// ============================================================================

const TICK_RATE_MS = 1000;        // 1 tick = 1 segundo
const HEAT_DECAY_RATE = 10;      // Calor dissipa passivamente por tick
const HEAT_DISSIPATION_PER_WATER = 2; // Calor dissipa por água
const MAX_HEAT = 1000;        // Capacidade máxima de calor
const POPULATION_GROWTH_RATE = 0.1; // Crescimento por tick

// ============================================================================
// CLASSE PRINCIPAL
// ============================================================================

export class Game {
  // Sistemas
  production: ProductionSystem;
  logistics: LogisticsSystem;
  market: MarketSystem;
  
  // Estado do jogo
  player: Player;
  population: Population;
  energy: EnergySystem;
  maintenance: Map<string, MaintenanceItem> = new Map();
  
  // Loop
  private tickCount: number = 0;
  private isRunning: boolean = false;
  private tickInterval: NodeJS.Timeout | null = null;
  
  constructor(playerId: string, playerName: string) {
    // Inicializar sistemas
    this.production = new ProductionSystem();
    this.logistics = new LogisticsSystem(10);
    this.market = new MarketSystem();
    
    // Criar localizações iniciais
    for (const location of createInitialLocations()) {
      this.production.addLocation(location);
    }
    
    // Jogador inicial
    this.player = {
      id: playerId,
      name: playerName,
      credits: 100,
      dataPoints: 60, // 50 Lab + 10 Stone Quarry
      trucks: 10,
      locations: ['warehouse_main', 'house_1'],
      recipesUnlocked: new Set(['lumber', 'stone_block']), // Tier 1
      specializations: [],
    };
    
    // População inicial
    this.population = {
      total: 10,
      employed: 0,
      unemployed: 10,
      happiness: 100,
      needs: {
        food: 10,     // 1 por pop/dia
        comfort: 0,
        medical: 0,
      },
    };
    
    // Energia inicial
    this.energy = {
      totalCapacity: 0,
      currentUsage: 0,
      sources: new Map(),
      heatLevel: 0,
      maxHeat: MAX_HEAT,
    };
  }
  
  // ============================================================================
  // LOOP DO JOGO
  // ============================================================================
  
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.tickInterval = setInterval(() => this.tick(), TICK_RATE_MS);
    console.log('[Game] Jogo iniciado!');
  }
  
  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
    console.log('[Game] Jogo parado!');
  }
  
  private tick(): void {
    this.tickCount++;
    
    // 1. Atualizar sistema de logística
    this.tickLogistics();
    
    // 2. Atualizar energia (calor)
    this.tickEnergy();
    
    // 3. Atualizar manutenção
    this.tickMaintenance();
    
    // 4. Atualizar população
    this.tickPopulation();
    
    // 5. Mercado: executar matching
    this.tickMarket();
    
    // Log a cada 10 ticks
    if (this.tickCount % 10 === 0) {
      this.logStatus();
    }
  }
  
  // ============================================================================
  // ticks POR SISTEMA
  // ============================================================================
  
  private tickLogistics(): void {
    this.logistics.tick(
      // getStorage
      (locId, resId) => {
        const loc = this.production.getLocation(locId);
        return loc?.storage.get(resId) || 0;
      },
      // setStorage
      (locId, resId, amount) => {
        const loc = this.production.getLocation(locId);
        if (loc) loc.storage.set(resId, amount);
      },
      // getMaxStorage
      (locId, resId) => {
        const loc = this.production.getLocation(locId);
        return loc?.maxStorage.get(resId) || 1000;
      }
    );
  }
  
  private tickEnergy(): void {
    // Decaimento de calor
    const heatDecay = Math.min(this.energy.heatLevel, HEAT_DECAY_RATE);
    this.energy.heatLevel -= heatDecay;
  }
  
  private tickMaintenance(): void {
    for (const item of this.maintenance.values()) {
      // Decaimento
      item.currentDurability -= item.decayRate;
      
      // Verificar se precisa de manutenção
      if (item.currentDurability <= 0) {
        this.maintenance.set(item.itemId, item);
      }
    }
  }
  
  private tickPopulation(): void {
    // Necessidades
    const foodNeeded = this.population.total * 1; // 1 por dia
    const comfortNeeded = Math.ceil(this.population.total / 10);
    const medicalNeeded = Math.ceil(this.population.total / 100);
    
    // Verificar se necessidades são atendidas
    const warehouse = this.production.getLocation('warehouse_main');
    if (!warehouse) return;
    
    const food = warehouse.storage.get('food_ration') || 0;
    const comfort = warehouse.storage.get('comfort_item') || 0;
    const medical = warehouse.storage.get('medical_supply') || 0;
    
    // Felicidade afeta crescimento
    let happinessChange = 0;
    
    if (food >= foodNeeded) {
      warehouse.storage.set('food_ration', food - foodNeeded);
      // Manter necessidades
      this.population.needs.food = foodNeeded;
    } else {
      happinessChange -= 10;
      warehouse.storage.set('food_ration', 0);
      this.population.needs.food = 0;
    }
    
    if (comfort >= comfortNeeded) {
      warehouse.storage.set('comfort_item', comfort - comfortNeeded);
      this.population.needs.comfort = comfortNeeded;
    } else {
      happinessChange -= 5;
      this.population.needs.comfort = 0;
    }
    
    if (medical >= medicalNeeded) {
      warehouse.storage.set('medical_supply', medical - medicalNeeded);
      this.population.needs.medical = medicalNeeded;
    } else {
      happinessChange -= 2;
      this.population.needs.medical = 0;
    }
    
    // Ajustar felicidade
    this.population.happiness = Math.max(0, Math.min(100, 
      this.population.happiness + happinessChange
    ));
    
    // Crescimento se felicidade > 70
    if (this.population.happiness > 70 && food >= foodNeeded) {
      this.population.total += POPULATION_GROWTH_RATE;
    }
  }
  
  private tickMarket(): void {
    // Executar matching para todos os recursos com ordens ativas
    const resources = new Set<string>();
    
    for (const order of this.market.getAllOrders()) {
      resources.add(order.resourceType);
    }
    
    for (const resource of resources) {
      this.market.matchOrders(resource);
    }
  }
  
  // ============================================================================
  // AÇÕES DO JOGADOR
  // ============================================================================
  
  /**
   * Executa crafting
   */
  craft(recipeId: string, locationId: string): boolean {
    const recipe = this.production.getRecipe(recipeId);
    if (!recipe) {
      console.log(`[Game] Receita ${recipeId} não encontrada`);
      return false;
    }
    
    // Verificar se desbloqueada
    if (!this.player.recipesUnlocked.has(recipeId)) {
      console.log(`[Game] Receita ${recipeId} ainda não desbloqueada`);
      return false;
    }
    
    // Verificar energia
    if (this.energy.currentUsage + recipe.energyCost > this.energy.totalCapacity) {
      console.log('[Game] Energia insuficiente!');
      return false;
    }
    
    // Verificar calor (se gerar)
    if (this.energy.heatLevel + recipe.heatGenerated > this.energy.maxHeat) {
      console.log('[Game] Calor excessivo! Dissipe primeiro.');
      return false;
    }
    
    // Executar
    const success = this.production.craft(recipeId, locationId);
    
    if (success) {
      this.energy.currentUsage += recipe.energyCost;
      this.energy.heatLevel += recipe.heatGenerated;
      console.log(`[Game] Craftou: ${recipe.name}`);
    }
    
    return success;
  }
  
  /**
   * Compra recurso do mercado
   */
  buyFromMarket(resourceType: ResourceType, amount: number, maxPrice: number): boolean {
    const result = this.market.instantBuy(
      this.player.id,
      resourceType,
      amount,
      maxPrice
    );
    
    if (result.success) {
      this.player.credits -= result.spent;
      
      // Adicionar ao armazenamento
      const warehouse = this.production.getLocation('warehouse_main');
      if (warehouse) {
        const current = warehouse.storage.get(resourceType) || 0;
        warehouse.storage.set(resourceType, current + result.bought);
        console.log(`[Game] Comprou ${result.bought} ${resourceType} por ${result.spent} Credits`);
      }
    }
    
    return result.success;
  }
  
  /**
   * Vende recurso no mercado
   */
  sellToMarket(resourceType: ResourceType, amount: number, minPrice: number): boolean {
    // Remover do armazenamento primeiro
    const warehouse = this.production.getLocation('warehouse_main');
    if (!warehouse) return false;
    
    const available = warehouse.storage.get(resourceType) || 0;
    if (available < amount) {
      console.log(`[Game] Estoque insuficiente: ${available} ${resourceType}`);
      return false;
    }
    
    warehouse.storage.set(resourceType, available - amount);
    
    const result = this.market.instantSell(
      this.player.id,
      resourceType,
      amount,
      minPrice
    );
    
    if (result.success) {
      this.player.credits += result.earned;
      console.log(`[Game] Vendeu ${result.sold} ${resourceType} por ${result.earned} Credits`);
    } else {
      // Devolver ao estoque
      warehouse.storage.set(resourceType, available);
    }
    
    return result.success;
  }
  
  /**
   * Pesquisa receita
   */
  research(recipeId: string): boolean {
    const recipe = this.production.getRecipe(recipeId);
    if (!recipe) {
      console.log(`[Game] Receita ${recipeId} não existe`);
      return false;
    }
    
    if (this.player.recipesUnlocked.has(recipeId)) {
      console.log(`[Game] Receita ${recipeId} já desbloqueada`);
      return false;
    }
    
    const cost = recipe.tier * 10; // 10 Data Points por tier
    
    if (this.player.dataPoints < cost) {
      console.log(`[Game] Data Points insuficientes! Precisa: ${cost}, Tem: ${this.player.dataPoints}`);
      return false;
    }
    
    this.player.dataPoints -= cost;
    this.player.recipesUnlocked.add(recipeId);
    console.log(`[Game] Desbloqueou: ${recipe.name} (${cost} DP)`);
    
    return true;
  }
  
  // ============================================================================
  // INFORMAÇÕES
  // ============================================================================
  
  private logStatus(): void {
    console.log(`=== Tick ${this.tickCount} ===`);
    console.log(`Credits: ${this.player.credits.toFixed(0)}`);
    console.log(`Data Points: ${this.player.dataPoints}`);
    console.log(`População: ${this.population.total.toFixed(0)}`);
    console.log(`Felicidade: ${this.population.happiness.toFixed(0)}%`);
    console.log(`Energia: ${this.energy.currentUsage}/${this.energy.totalCapacity} kWh`);
    console.log(`Calor: ${this.energy.heatLevel}/${this.energy.maxHeat}`);
  }
  
  getStatus(): GameStatus {
    return {
      tick: this.tickCount,
      player: { ...this.player },
      population: { ...this.population },
      energy: { ...this.energy },
      routesCount: this.logistics.getAllRoutes().length,
      ordersCount: this.market.getAllOrders().length,
    };
  }
  
  // ============================================================================
  // SAVE/LOAD
  // ============================================================================
  
  serialize(): string {
    return JSON.stringify({
      tickCount: this.tickCount,
      player: this.player,
      population: this.population,
      energy: this.energy,
      // production: location storage
      // market: orders
    });
  }
  
  // static deserialize(json: string): Game { ... }
}

// ============================================================================
// TIPOS
// ============================================================================

export interface GameStatus {
  tick: number;
  player: Player;
  population: Population;
  energy: EnergySystem;
  routesCount: number;
  ordersCount: number;
}

// ============================================================================
// MAIN
// ============================================================================

/*
// Criar novo jogo
const game = new Game('player1', 'Primeiro Jogador');

// Começar
game.start();

// Após 10 segundos, parar
setTimeout(() => {
  game.stop();
  
  const status = game.getStatus();
  console.log('=== Status Final ===');
  console.log(JSON.stringify(status, null, 2));
}, 10000);
*/

export { Game };