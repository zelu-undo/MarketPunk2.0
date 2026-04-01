/**
 * MarketPunk - Sistema de Logística Baseado em Rotas
 */

import { 
  Route, 
  RouteMetrics, 
  RouteStatus, 
  Priority, 
  BottleneckType,
  LogisticsRule,
  RuleCondition,
  RuleAction,
  ResourceType,
  Vector2D
} from '../types';

// ============================================================================
// CONSTANTES
// ============================================================================

const TRUCK_CAPACITY = 100;        // Capacidade por caminhão
const TRUCK_BASE_SPEED = 1;      // Velocidade base (tick)
const TIME_BASE = 3;            // Tempo base em segundos
const COMPLEXITY_FACTOR = 1.0;  // Fator de complexidade

// ============================================================================
// CLASSE PRINCIPAL
// ============================================================================

export class LogisticsSystem {
  private routes: Map<string, Route> = new Map();
  private metrics: Map<string, RouteMetrics> = new Map();
  private rules: Map<string, LogisticsRule> = new Map();
  private totalTrucks: number = 0;
  private availableTrucks: number = 0;
  
  constructor(initialTrucks: number = 10) {
    this.totalTrucks = initialTrucks;
    this.availableTrucks = initialTrucks;
  }
  
  // ============================================================================
  // CRIAÇÃO DE ROTAS
  // ============================================================================
  
  /**
   * Cria uma nova rota
   */
  createRoute(
    id: string,
    name: string,
    originId: string,
    destinationId: string,
    resourceType: ResourceType,
    amount: number,
    priority: Priority = 'MEDIUM',
    complexity: number = 1
  ): Route {
    const route: Route = {
      id,
      name,
      originId,
      destinationId,
      resourceType,
      amount,
      priority,
      status: 'active',
      trucksAllocated: 0,
      complexity,
      currentLoad: 0,
    };
    
    this.routes.set(id, route);
    this.metrics.set(id, this.createMetrics(id));
    
    // Alocar caminhões automaticamente
    this.allocateTrucks(id);
    
    return route;
  }
  
  /**
   * Remove uma rota
   */
  deleteRoute(routeId: string): boolean {
    const route = this.routes.get(routeId);
    if (!route) return false;
    
    // Devolver caminhões
    this.availableTrucks += route.trucksAllocated;
    
    this.routes.delete(routeId);
    this.metrics.delete(routeId);
    
    return true;
  }
  
  // ============================================================================
  // ALOCAÇÃO DE CAMINHÕES
  // ============================================================================
  
  /**
   * Aloca caminhões para uma rota específica
   */
  allocateTrucks(routeId: string): void {
    const route = this.routes.get(routeId);
    if (!route || route.status !== 'active') return;
    
    // Calcular necessário baseado em prioridade
    const neededTrucks = this.calculateNeededTrucks(routeId);
    const available = this.availableTrucks;
    
    // Prioridades mais altas recebem primeiro
    const prioritizedRoutes = this.getPrioritizedRoutes();
    
    let trucksToAllocate = Math.min(neededTrucks, available);
    
    // Verificar se é a rota de maior prioridade
    for (const r of prioritizedRoutes) {
      if (r.id === routeId) break;
      const otherNeeded = this.calculateNeededTrucks(r.id);
      const otherAllocated = this.routes.get(r.id)?.trucksAllocated || 0;
      if (otherAllocated < otherNeeded) {
        return; // Outras rotas precisam mais
      }
    }
    
    if (trucksToAllocate > 0) {
      route.trucksAllocated += trucksToAllocate;
      this.availableTrucks -= trucksToAllocate;
    }
  }
  
  /**
   * Calcula caminhões necessários para uma rota
   */
  private calculateNeededTrucks(routeId: string): number {
    const route = this.routes.get(routeId);
    if (!route) return 0;
    
    // 1 caminhão por 100 unidades
    return Math.ceil(route.amount / TRUCK_CAPACITY);
  }
  
  /**
   * Obtém rotas ordenadas por prioridade
   */
  private getPrioritizedRoutes(): Route[] {
    const priorityOrder: Record<Priority, number> = {
      'CRITICAL': 4,
      'HIGH': 3,
      'MEDIUM': 2,
      'LOW': 1,
    };
    
    return Array.from(this.routes.values())
      .filter(r => r.status === 'active')
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
  }
  
  // ============================================================================
  // TEMPO DE TRANSPORTE
  // ============================================================================
  
  /**
   * Calcula tempo de transporte para uma rota
   * Fórmula: tempo_total = tempo_base + (complexidade × fator)
   */
  calculateTransportTime(routeId: string): number {
    const route = this.routes.get(routeId);
    if (!route) return 0;
    
    return TIME_BASE + (route.complexity * COMPLEXITY_FACTOR);
  }
  
  // ============================================================================
  // SIMULAÇÃO DE TICK
  // ============================================================================
  
  /**
   * Executa um tick de logística
   */
  tick(
    getStorage: (locationId: string, resourceId: ResourceType) => number,
    setStorage: (locationId: string, resourceId: ResourceType, amount: number) => void,
    getMaxStorage: (locationId: string, resourceId: ResourceType) => number
  ): void {
    for (const route of this.routes.values()) {
      if (route.status !== 'active') continue;
      
      // Atualizar métricas
      this.updateMetrics(route.id, getStorage, getMaxStorage);
    }
    
    // Avaliar regras
    this.evaluateRules(getStorage);
    
    // Redistribuir caminhões se necessário
    this.rebalanceTrucks();
  }
  
  // ============================================================================
  // MÉTRICAS
  // ============================================================================
  
  private createMetrics(routeId: string): RouteMetrics {
    return {
      routeId,
      throughput: 0,
      efficiency: 0,
      idleTime: 0,
      bottleneck: null,
    };
  }
  
  private updateMetrics(
    routeId: string,
    getStorage: (locationId: string, resourceId: ResourceType) => number,
    getMaxStorage: (locationId: string, resourceId: ResourceType) => number
  ): void {
    const route = this.routes.get(routeId);
    const metrics = this.metrics.get(routeId);
    if (!route || !metrics) return;
    
    const originStorage = getStorage(route.originId, route.resourceType);
    const destStorage = getStorage(route.destinationId, route.resourceType);
    const destMax = getMaxStorage(route.destinationId, route.resourceType);
    
    // Calcular throughput
    const capacity = route.trucksAllocated * TRUCK_CAPACITY;
    const transferred = Math.min(originStorage, capacity, destMax - destStorage);
    metrics.throughput = transferred;
    
    // Calcular eficiência
    metrics.efficiency = capacity > 0 
      ? Math.min(100, (transferred / capacity) * 100) 
      : 0;
    
    // Detectar gargalos
    if (originStorage < route.amount) {
      metrics.bottleneck = 'no_resource_at_origin';
    } else if (destStorage >= destMax) {
      metrics.bottleneck = 'destination_full';
    } else if (route.trucksAllocated === 0) {
      metrics.bottleneck = 'no_trucks';
    } else {
      metrics.bottleneck = null;
    }
    
    // Atualizar status
    if (metrics.efficiency < 30) {
      route.status = 'inefficient';
    } else if (metrics.bottleneck) {
      route.status = 'blocked';
    } else {
      route.status = 'active';
    }
  }
  
  // ============================================================================
  // REGRAS AUTOMATIZADAS
  // ============================================================================
  
  /**
   * Adiciona uma regra
   */
  addRule(rule: LogisticsRule): void {
    this.rules.set(rule.id, rule);
  }
  
  /**
   * Avalia todas as regras
   */
  private evaluateRules(getStorage: (locationId: string, resourceId: ResourceType) => number): void {
    const now = Date.now();
    
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;
      if (now - rule.lastRun < rule.cooldown * 1000) continue;
      
      if (this.evaluateCondition(rule.condition, getStorage)) {
        this.executeAction(rule.action);
        rule.lastRun = now;
      }
    }
  }
  
  private evaluateCondition(
    condition: RuleCondition,
    getStorage: (locationId: string, resourceId: ResourceType) => number
  ): boolean {
    switch (condition.type) {
      case 'resource_level': {
        const amount = getStorage(condition.locationId!, condition.resourceId!);
        return condition.comparison === '<' 
          ? amount < condition.threshold!
          : amount > condition.threshold!;
      }
      case 'efficiency': {
        const metrics = this.metrics.get(condition.routeId!);
        return metrics 
          ? metrics.efficiency < condition.efficiencyThreshold! 
          : false;
      }
      case 'status': {
        const route = this.routes.get(condition.routeId!);
        return route?.status === condition.statusMatch || false;
      }
      default:
        return false;
    }
  }
  
  private executeAction(action: RuleAction): void {
    const route = this.routes.get(action.routeId!);
    if (!route) return;
    
    switch (action.type) {
      case 'add_trucks':
        if (this.availableTrucks >= action.amount!) {
          route.trucksAllocated += action.amount!;
          this.availableTrucks -= action.amount!;
        }
        break;
      case 'remove_trucks':
        route.trucksAllocated = Math.max(0, route.trucksAllocated - action.amount!);
        this.availableTrucks += action.amount!;
        break;
      case 'set_priority':
        route.priority = action.newPriority!;
        this.rebalanceTrucks();
        break;
      case 'pause':
        route.status = 'paused';
        this.availableTrucks += route.trucksAllocated;
        route.trucksAllocated = 0;
        break;
      case 'activate':
        route.status = 'active';
        this.allocateTrucks(route.id);
        break;
    }
  }
  
  /**
   * Redistribui caminhões
   */
  private rebalanceTrucks(): void {
    const activeRoutes = Array.from(this.routes.values())
      .filter(r => r.status === 'active');
    
    if (activeRoutes.length === 0) return;
    
    // Recolher semua
    for (const route of activeRoutes) {
      this.availableTrucks += route.trucksAllocated;
      route.trucksAllocated = 0;
    }
    
    // Realocar
    const prioritized = activeRoutes.sort((a, b) => {
      const priorityOrder: Record<Priority, number> = {
        'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1
      };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
    
    for (const route of prioritized) {
      if (this.availableTrucks <= 0) break;
      this.allocateTrucks(route.id);
    }
  }
  
  // ============================================================================
  // GETTERS
  // ============================================================================
  
  getRoute(routeId: string): Route | undefined {
    return this.routes.get(routeId);
  }
  
  getAllRoutes(): Route[] {
    return Array.from(this.routes.values());
  }
  
  getMetrics(routeId: string): RouteMetrics | undefined {
    return this.metrics.get(routeId);
  }
  
  getRouteByStatus(status: RouteStatus): Route[] {
    return Array.from(this.routes.values())
      .filter(r => r.status === status);
  }
  
  getTotalTrucks(): number {
    return this.totalTrucks;
  }
  
  getAvailableTrucks(): number {
    return this.availableTrucks;
  }
  
  getAllocatedTrucks(): number {
    return this.totalTrucks - this.availableTrucks;
  }
}

// ============================================================================
// HELPER: CRIAÇÃO DE REGRA
// ============================================================================

export function createLogisticsRule(
  id: string,
  name: string,
  condition: RuleCondition,
  action: RuleAction,
  cooldown: number
): LogisticsRule {
  return {
    id,
    name,
    enabled: true,
    condition,
    action,
    cooldown,
    lastRun: 0,
  };
}

// ============================================================================
// EXEMPLOS DE REGRAS
// ============================================================================

export const exampleRules = {
  rule001: createLogisticsRule(
    'rule001',
    'Aumentar caminhões se estoque baixo',
    {
      type: 'resource_level',
      resourceId: 'iron_ingot',
      locationId: 'warehouse_north',
      threshold: 100,
      comparison: '<',
    },
    {
      type: 'add_trucks',
      routeId: 'iron_to_steel',
      amount: 2,
    },
    60 // 60s cooldown
  ),
  
  rule002: createLogisticsRule(
    'rule002',
    'Pausar se eficiência < 50%',
    {
      type: 'efficiency',
      routeId: 'wood_to_lumber',
      efficiencyThreshold: 50,
    },
    {
      type: 'pause',
      routeId: 'wood_to_lumber',
    },
    120 // 120s cooldown
  ),
  
  rule003: createLogisticsRule(
    'rule003',
    'Aumentar prioridade se destino cheio',
    {
      type: 'status',
      routeId: 'steel_to_warehouse',
      statusMatch: 'blocked',
    },
    {
      type: 'set_priority',
      routeId: 'steel_to_warehouse',
      newPriority: 'HIGH',
    },
    30
  ),
};