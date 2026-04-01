/**
 * MarketPunk - Exportações Principais
 */

// Types
export * from './types';

// Core
export { ProductionSystem, createLocation, createInitialLocations, calculateProductionTime } from './core/production';
export { Game, GameStatus } from './core/game';

// Systems
export { LogisticsSystem, createLogisticsRule, exampleRules } from './systems/logistics';
export { MarketSystem } from './systems/market';

// Config
export { getResources, getRecipes } from './config/resources';

/*
// ============================================================================
// EXEMPLO DE USO: CRIANDO UM NOVO JOGO
// ============================================================================

import { Game } from './index';

// 1. Criar jogo
const game = new Game('player1', 'Meu Jogo');

// 2. Receitas desbloqueadas inicialmente (Tier 1)
console.log('Receitas desbloqueadas:', [...game.player.recipesUnlocked]);

// 3. Iniciar loop
game.start();

// 4. Após 5 segundos, executar um craft
setTimeout(() => {
  // Craftar Lumber
  game.craft('lumber', 'warehouse_main');
  
  // Verificar resultado
  const warehouse = game.production.getLocation('warehouse_main');
  console.log('Storage:', warehouse?.storage);
}, 5000);

// 5. Parar após 10 segundos
setTimeout(() => {
  game.stop();
  
  const status = game.getStatus();
  console.log('Status final:', status);
}, 10000);
*/

/*
// ============================================================================
// EXEMPLO: USANDO LOGÍSTICA
// ============================================================================

import { LogisticsSystem } from './index';

// Criar sistema
const logistics = new LogisticsSystem(10);

// Criar rotas
const route1 = logistics.createRoute(
  'wood_to_warehouse',
  'Wood → Warehouse',
  'forest',
  'warehouse',
  'wood',
  100,
  'HIGH',
  1
);

const route2 = logistics.createRoute(
  'iron_to_steel',
  'Iron → Steel Mill',
  'iron_mine',
  'steel_mill',
  'iron_ore',
  200,
  'MEDIUM',
  2
);

// Obter métricas
const metrics = logistics.getMetrics('wood_to_warehouse');
console.log('Metrics:', metrics);

// Executar tick
logistics.tick(
  (locId, resId) => storage.get(locId)?.get(resId) || 0,
  (locId, resId, amount) => storage.get(locId)?.set(resId, amount),
  (locId, resId) => maxStorage.get(locId)?.get(resId) || 1000
);

/*
// ============================================================================
// EXEMPLO: USANDO MERCADO
// ============================================================================

import { MarketSystem } from './index';

// Criar mercado
const market = new MarketSystem();

// Jogador 1 coloca ordem de compra
const buyOrder = market.createBuyOrder(
  'player1',
  'wood',
  100,  // quantidade
  1.2    // preço
);

// Jogador 2 coloca ordem de venda
const sellOrder = market.createSellOrder(
  'player2',
  'wood',
  100,
  1.0
);

// Matching
const matches = market.matchOrders('wood');
console.log('Matches:', matches);

// Dados do mercado (imperfeitos)
const data = market.getMarketData('wood');
console.log('Market data:', data);
// {
//   resourceType: 'wood',
//   trend: 'stable',
//   volume: 100,
//   lowestAsk: 1.0,
//   highestBid: 1.2
// }
*/