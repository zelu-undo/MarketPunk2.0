import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { GameState, ResourceType, ProductionUnit, MarketItem, AutomationRule, Action, Operator, User, Order, TruckType, BuildingType } from './types';
import { 
  INITIAL_MONEY, 
  INITIAL_PRODUCTION_UNITS, 
  TICK_RATE, 
  MARKET_TICK_RATE, 
  HISTORY_LIMIT,
  INITIAL_STORAGE_LIMIT,
  STORAGE_UPGRADE_COST,
  INITIAL_MAX_COMPANIES,
  INITIAL_MAX_AUTOMATIONS,
  TRUCK_TYPES,
  // Heat constants
  MAX_HEAT,
  BASE_HEAT_DISSIPATION,
  WATER_COOLING_BONUS,
  HEAT_EXCHANGER_BONUS,
  OVERHEAT_THRESHOLD,
  CRITICAL_HEAT_THRESHOLD,
  // Population constants
  INITIAL_POPULATION,
  BASE_POPULATION_GROWTH,
  POPULATION_DECAY,
  FOOD_CONSUMPTION_RATE,
  COMFORT_CONSUMPTION_RATE,
  MEDICAL_CONSUMPTION_RATE,
  ENERGY_CONSUMPTION_RATE,
  HAPPINESS_DECAY,
  HAPPINESS_RECOVERY,
  HAPPINESS_WARNING_THRESHOLD,
  HAPPINESS_CRITICAL_THRESHOLD,
  POPULATION_EFFICIENCY_BONUS,
  POPULATION_EFFICIENCY_PENALTY,
  HAPPINESS_TAX_BONUS,
  WORKERS_PER_FACTORY,
  BASE_TAX_RATE,
  BUILDINGS,
} from './constants';

const STORAGE_KEY_PREFIX = 'marketpunk_save_';
const CURRENT_USER_KEY = 'marketpunk_current_user';

function getInitialState(user: User | null): GameState {
  const initialResources: Record<ResourceType, number> = {
    money: INITIAL_MONEY,
    wood: 10,
    stone: 5,
    iron: 0,
    energy: 20,
    planks: 0,
    iron_bars: 0,
    concrete: 0,
    steel: 0,
    electronics: 0,
    research: 50,
    // Add new resource defaults
    sand: 0,
    water: 0,
    coal: 0,
    copper_ore: 0,
    limestone: 0,
    crude_oil: 0,
    clay: 0,
    lead: 0,
    sulfur: 0,
    gold: 0,
    uranium: 0,
    thorium: 0,
    lumber: 0,
    stone_block: 0,
    iron_ingot: 0,
    copper_ingot: 0,
    coal_brick: 0,
    glass_sheet: 0,
    purified_water: 0,
    quicklime: 0,
    charcoal: 0,
    crude_oil_extract: 0,
    slag: 0,
    sawdust: 0,
    steel_sheet: 0,
    steel_pipe: 0,
    copper_wire: 0,
    plastic: 0,
    rubber: 0,
    cement: 0,
    brick: 0,
    aluminum_ingot: 0,
    chemical_resin: 0,
    fuel_oil: 0,
    sulfuric_acid: 0,
    lead_ingot: 0,
    graphite: 0,
    gear: 0,
    bearing: 0,
    electric_motor: 0,
    magnetic_steel: 0,
    integrated_circuit: 0,
    pcb: 0,
    pipe_assembly: 0,
    gearbox: 0,
    control_unit: 0,
    battery: 0,
    solar_cell: 0,
    heat_exchanger: 0,
    lubricant: 0,
    coolant: 0,
    spare_parts: 0,
    gold_filament: 0,
    factory_machine: 0,
    basic_electronics: 0,
    advanced_electronics: 0,
    food_ration: 100,  // Starting food for population
    medical_supply: 0,
    comfort_item: 0,
    building_block: 0,
    steel_frame: 0,
    reinforced_glass: 0,
    basic_fuel_rod: 0,
    vehicle: 0,
    transport_truck: 0,
    basic_tool_set: 0,
    advanced_tool_set: 0,
    coal_power_plant: 0,
    diesel_generator: 0,
    solar_power_array: 0,
    wind_turbine: 0,
    nuclear_reactor: 0,
    basic_automation: 0,
    advanced_automation: 0,
    shipping_crate: 0,
    pallet: 0,
    wood_plank: 0,
  };
  
  const initialStorageLimits: Record<ResourceType, number> = {};
  Object.keys(initialResources).forEach(key => {
    initialStorageLimits[key as ResourceType] = key === 'money' || key === 'research' ? 1000000000 : INITIAL_STORAGE_LIMIT;
  });

  const initialStorageLevels: Record<ResourceType, number> = {};
  Object.keys(initialResources).forEach(key => {
    initialStorageLevels[key as ResourceType] = key === 'money' || key === 'research' ? 1000 : 1;
  });

  return {
    user,
    money: INITIAL_MONEY,
    dataPoints: 60,  // 50 for Laboratory + 10 for Stone Quarry (as per design doc)
    resources: initialResources,
    storageLimits: initialStorageLimits,
    storageLevels: initialStorageLevels,
    productionUnits: [],
    market: {} as Record<ResourceType, MarketItem>,
    orderBook: [],
    automationRules: [],
    maxCompanies: INITIAL_MAX_COMPANIES,
    maxAutomations: INITIAL_MAX_AUTOMATIONS,
    lastUpdate: Date.now(),
    totalProfit: 0,
    profitHistory: [0],
    totalTrucks: 2,
    availableTrucks: 2,
    unlockedTechs: [],
    tradeHistory: [],
    netFlow: {} as Record<ResourceType, number>,
    campaign: { id: '1', name: 'Industrial Revolution', missions: [], currentMissionIndex: 0 },
    // Heat System
    heatLevel: 0,
    maxHeat: 1000,
    heatDissipationRate: 10,
    // Population System
    population: 10,
    populationHappiness: 100,
    populationGrowthRate: 1,
    populationEfficiency: 1.0,
    // Buildings
    buildings: [],
    // Maintenance
    maintenanceItems: {},
  };
}

export function useGameLoop() {
  const [state, setState] = useState<GameState>(() => {
    const currentUserJson = localStorage.getItem(CURRENT_USER_KEY);
    let user: User | null = null;
    if (currentUserJson) {
      try {
        user = JSON.parse(currentUserJson);
      } catch (e) {}
    }

    if (user) {
      const saved = localStorage.getItem(STORAGE_KEY_PREFIX + user.username);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          
          // Sanitization logic
          const initialResources = getInitialState(null).resources;
          const mergedResources = { ...initialResources, ...(parsed.resources || {}) };
          const sanitizedUnits = (parsed.productionUnits || []).map((u: any) => ({
            ...u,
            trucks: typeof u.trucks === 'number' ? u.trucks : 0,
            inputBuffer: u.inputBuffer || {},
            outputBuffer: u.outputBuffer || {},
            level: u.level || 1,
            isAutomated: !!u.isAutomated,
            isProducing: !!u.isProducing,
            progress: u.progress || 0,
          }));

          return { 
            ...parsed, 
            user,
            dataPoints: typeof parsed.dataPoints === 'number' ? parsed.dataPoints : 60,
            resources: mergedResources,
            productionUnits: sanitizedUnits,
            lastUpdate: parsed.lastUpdate || Date.now(),
            storageLimits: { ...getInitialState(null).storageLimits, ...(parsed.storageLimits || {}) },
            storageLevels: { ...getInitialState(null).storageLevels, ...(parsed.storageLevels || {}) },
            totalTrucks: typeof parsed.totalTrucks === 'number' ? parsed.totalTrucks : 2,
            availableTrucks: typeof parsed.availableTrucks === 'number' ? parsed.availableTrucks : 2,
            unlockedTechs: parsed.unlockedTechs || [],
            orderBook: parsed.orderBook || [],
            tradeHistory: parsed.tradeHistory || [],
            money: typeof parsed.money === 'number' ? parsed.money : INITIAL_MONEY,
            totalProfit: typeof parsed.totalProfit === 'number' ? parsed.totalProfit : 0,
            netFlow: {} as Record<ResourceType, number>,
            campaign: parsed.campaign || getInitialState(null).campaign,
            heatLevel: typeof parsed.heatLevel === 'number' ? parsed.heatLevel : 0,
            maxHeat: typeof parsed.maxHeat === 'number' ? parsed.maxHeat : MAX_HEAT,
            heatDissipationRate: typeof parsed.heatDissipationRate === 'number' ? parsed.heatDissipationRate : BASE_HEAT_DISSIPATION,
            population: typeof parsed.population === 'number' ? parsed.population : INITIAL_POPULATION,
            populationHappiness: typeof parsed.populationHappiness === 'number' ? parsed.populationHappiness : 100,
            populationGrowthRate: typeof parsed.populationGrowthRate === 'number' ? parsed.populationGrowthRate : 1,
            populationEfficiency: typeof parsed.populationEfficiency === 'number' ? parsed.populationEfficiency : 1.0,
            buildings: parsed.buildings || [],
            maintenanceItems: parsed.maintenanceItems || {},
          };
        } catch (e) {
          console.error('Failed to parse save', e);
        }
      }
    }
    return getInitialState(user);
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Save to localStorage
  useEffect(() => {
    if (state.user) {
      localStorage.setItem(STORAGE_KEY_PREFIX + state.user.username, JSON.stringify(state));
    }
  }, [state]);

  const reportTrade = useCallback(async (type: ResourceType, action: 'buy' | 'sell', amount: number) => {
    try {
      const res = await fetch('/api/market/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, action, amount }),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    } catch (e) {
      console.error('Failed to report trade', e);
    }
  }, []);

  const fetchMarket = useCallback(async () => {
    try {
      const res = await fetch('/api/market');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      const { market, orderBook: globalOrderBook, tradeHistory: globalTradeHistory } = data;
      
      // Filter orders for current player (by username or ownerId, or include all if not logged in)
      const playerOrders = globalOrderBook?.filter((o: any) => 
        !o.username || o.username === prev.user?.username || o.ownerId === 'player' || o.ownerId === prev.user?.username
      ) || [];

      setState(prev => ({
        ...prev,
        market,
        orderBook: playerOrders,
        tradeHistory: globalTradeHistory || []
      }));
    } catch (e) {
      console.error('Failed to fetch market', e);
    }
  }, []);

  const createOrder = useCallback(async (resource: ResourceType, type: 'buy' | 'sell', amount: number, price: number, isAutomation: boolean = false) => {
    const token = stateRef.current.user?.token;
    if (!token) {
      if (!isAutomation) toast.error('You must be logged in to trade');
      return;
    }

    const currentState = stateRef.current;
    if (type === 'buy') {
      if (currentState.money < amount * price) {
        if (!isAutomation) toast.error('Not enough money to place this order');
        return;
      }
      
      // Calculate pending buy orders for this resource
      const pendingBuyAmount = currentState.orderBook
        .filter(o => o.type === 'buy' && o.resource === resource)
        .reduce((sum, o) => sum + o.amount, 0);
        
      if ((currentState.resources[resource] || 0) + pendingBuyAmount + amount > (currentState.storageLimits[resource] || 0)) {
        if (!isAutomation) toast.error(`Not enough storage space for ${resource}`);
        return;
      }
    } else {
      if ((currentState.resources[resource] || 0) < amount) {
        if (!isAutomation) toast.error(`Not enough ${resource} to place this order`);
        return;
      }
    }

    // Optimistically update state to prevent multiple orders bypassing limits
    const tempOrderId = 'temp-' + Date.now();
    const tempOrder: Order = {
      id: tempOrderId,
      type,
      resource,
      amount,
      price,
      ownerId: currentState.user.username,
      timestamp: Date.now()
    };

    setState(prev => {
      let newMoney = prev.money;
      let newResources = { ...prev.resources };

      if (type === 'buy') {
        newMoney -= amount * price;
      } else {
        newResources[resource] -= amount;
      }

      return {
        ...prev,
        money: newMoney,
        resources: newResources,
        orderBook: [tempOrder, ...prev.orderBook]
      };
    });

    try {
      const res = await fetch('/api/market/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ resource, type, amount, price })
      });

      if (!res.ok) {
        const err = await res.json();
        if (!isAutomation) toast.error(err.error || 'Failed to place order');
        // Revert optimistic update
        setState(prev => {
          let newMoney = prev.money;
          let newResources = { ...prev.resources };

          if (type === 'buy') {
            newMoney += amount * price;
          } else {
            newResources[resource] += amount;
          }

          return {
            ...prev,
            money: newMoney,
            resources: newResources,
            orderBook: prev.orderBook.filter(o => o.id !== tempOrderId)
          };
        });
        return;
      }

      const { order } = await res.json();
      
      setState(prev => {
        return {
          ...prev,
          orderBook: [order, ...prev.orderBook.filter(o => o.id !== tempOrderId)]
        };
      });

      if (!isAutomation) toast.success(`${type.toUpperCase()} order placed for ${amount} ${resource} at $${price}`);
    } catch (e) {
      console.error('Failed to create order', e);
      if (!isAutomation) toast.error('Network error');
      // Revert optimistic update
      setState(prev => {
        let newMoney = prev.money;
        let newResources = { ...prev.resources };

        if (type === 'buy') {
          newMoney += amount * price;
        } else {
          newResources[resource] += amount;
        }

        return {
          ...prev,
          money: newMoney,
          resources: newResources,
          orderBook: prev.orderBook.filter(o => o.id !== tempOrderId)
        };
      });
    }
  }, []);

  const cancelOrder = useCallback(async (orderId: string) => {
    const token = stateRef.current.user?.token;
    if (!token) return;

    try {
      const res = await fetch(`/api/market/order/${orderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to cancel order');
        return;
      }

      const { order } = await res.json();

      setState(prev => {
        let newMoney = prev.money;
        let newResources = { ...prev.resources };

        if (order.type === 'buy') {
          newMoney += order.amount * order.price;
        } else {
          const currentAmount = newResources[order.resource as ResourceType] || 0;
          const limit = prev.storageLimits[order.resource as ResourceType] || 0;
          newResources[order.resource as ResourceType] = Math.min(limit, currentAmount + order.amount);
        }

        return {
          ...prev,
          money: newMoney,
          resources: newResources,
          orderBook: prev.orderBook.filter(o => o.id !== orderId)
        };
      });

      toast.success('Order cancelled');
    } catch (e) {
      console.error('Failed to cancel order', e);
    }
  }, []);

  const startProduction = useCallback((unitId: string) => {
    setState(prev => {
      const unit = prev.productionUnits.find(u => u.id === unitId);
      if (!unit || unit.isProducing) return prev;

      // Check inputs from inputBuffer
      const canProduce = unit.input.every(input => input.type === 'energy' || (unit.inputBuffer[input.type] || 0) >= input.amount);
      if (!canProduce) return prev;

      // Check storage for output (outputBuffer)
      // We don't strictly limit outputBuffer, but maybe we should?
      // Let's say outputBuffer has a limit of 20x output amount
      const outputBufferLimit = unit.output.amount * 20;
      if ((unit.outputBuffer[unit.output.type] || 0) + unit.output.amount > outputBufferLimit) {
        return prev;
      }

      // Calculate efficiency based on energy + population
      const energyInput = unit.input.find(i => i.type === 'energy');
      let currentEfficiency = 1.0;
      let energyConsumed = 0;
      if (energyInput && energyInput.amount > 0) {
        const availableEnergy = Math.min(energyInput.amount, unit.inputBuffer['energy'] || 0);
        energyConsumed = availableEnergy;
        const ratio = availableEnergy / energyInput.amount;
        if (ratio >= 1.0) currentEfficiency = 1.0;
        else if (ratio >= 0.8) currentEfficiency = 0.9 + (ratio - 0.8) * 0.5;
        else if (ratio >= 0.5) currentEfficiency = 0.6 + (ratio - 0.5) * 1.0;
        else currentEfficiency = 0.2 + ratio * 0.8;
      }
      
      // Apply population efficiency bonus/penalty
      const popEfficiency = prev.populationEfficiency || 1.0;
      currentEfficiency *= popEfficiency;

      const newUnits = prev.productionUnits.map(u => {
        if (u.id === unitId) {
          const newInputBuffer = { ...u.inputBuffer };
          u.input.forEach(input => {
            if (input.type === 'energy') {
              newInputBuffer[input.type] = (newInputBuffer[input.type] || 0) - energyConsumed;
            } else {
              newInputBuffer[input.type] = (newInputBuffer[input.type] || 0) - input.amount;
            }
          });
          return { ...u, isProducing: true, progress: 0, lastStarted: Date.now(), inputBuffer: newInputBuffer, currentEfficiency };
        }
        return u;
      });

      return { ...prev, productionUnits: newUnits };
    });
  }, []);

  const executeAutomation = useCallback(() => {
    const currentState = stateRef.current;
    currentState.automationRules.forEach(rule => {
      if (!rule.isEnabled) return;

      const { conditions, action } = rule;
      
      const allConditionsMet = conditions.every(condition => {
        if (condition.isMarketCondition) {
          const marketItem = currentState.market[condition.resource];
          if (!marketItem) return false;
          if (condition.operator === '<') return marketItem.price < condition.value;
          if (condition.operator === '>') return marketItem.price > condition.value;
          if (condition.operator === '==') return marketItem.price === condition.value;
          return false;
        } else {
          const resourceValue = condition.resource === 'money' ? currentState.money : currentState.resources[condition.resource];
          if (condition.operator === '<') return resourceValue < condition.value;
          if (condition.operator === '>') return resourceValue > condition.value;
          if (condition.operator === '==') return resourceValue === condition.value;
          return false;
        }
      });

      if (allConditionsMet) {
        if (action.type === 'buy') {
          createOrder(action.resource, 'buy', action.amount, currentState.market[action.resource]?.price || 10, true);
        } else if (action.type === 'sell') {
          createOrder(action.resource, 'sell', action.amount, currentState.market[action.resource]?.price || 10, true);
        } else if (action.type === 'produce') {
          startProduction(action.resource); // resource here is unitId
        }
      }
    });
  }, [createOrder, startProduction]);

  const syncUserTrades = useCallback(async () => {
    const token = stateRef.current.user?.token;
    if (!token) return;

    try {
      const res = await fetch('/api/market/user-trades', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const userTrades = await res.json();

      setState(prev => {
        let newMoney = prev.money;
        let newResources = { ...prev.resources };
        let newTotalProfit = prev.totalProfit;
        const processedTradeIds = new Set(prev.tradeHistory.map(t => t.id));
        const newTradeHistory = [...prev.tradeHistory];
        let changed = false;

        userTrades.forEach((trade: any) => {
          if (!processedTradeIds.has(trade.id)) {
            changed = true;
            if (trade.buyer === prev.user?.username) {
              // Buyer: We already deducted orderPrice * amount. 
              // Trade happened at tradePrice. 
              // Refund = (orderPrice - tradePrice) * amount
              // But wait, we don't know orderPrice here easily.
              // Let's assume for now the server matches at tradePrice and we just give the resources.
              // To be accurate, we'd need the order details.
              // For now, let's just add resources.
              const currentAmount = newResources[trade.resource as ResourceType] || 0;
              const limit = prev.storageLimits[trade.resource as ResourceType] || 0;
              newResources[trade.resource as ResourceType] = Math.min(limit, currentAmount + trade.amount);
              // If tradePrice < orderPrice, we should refund. 
              // But let's keep it simple: the server matched it.
            } else if (trade.seller === prev.user?.username) {
              // Seller: We already removed resources. Add money.
              const revenue = trade.amount * trade.price;
              newMoney += revenue;
              newTotalProfit += revenue;
            }
            newTradeHistory.unshift(trade);
          }
        });

        if (!changed) return prev;
        if (newTradeHistory.length > HISTORY_LIMIT) newTradeHistory.length = HISTORY_LIMIT;

        return {
          ...prev,
          money: newMoney,
          resources: newResources,
          totalProfit: newTotalProfit,
          tradeHistory: newTradeHistory
        };
      });
    } catch (e) {
      console.error('Failed to sync user trades', e);
    }
  }, []);

  const upgradeUnit = useCallback((unitId: string) => {
    setState(prev => {
      const unit = prev.productionUnits.find(u => u.id === unitId);
      if (!unit || (Number(prev.money) || 0) < (Number(unit.upgradeCost) || 0)) return prev;

      const newUnits = prev.productionUnits.map(u => {
        if (u.id === unitId) {
          const newLevel = (Number(u.level) || 1) + 1;
          const scaleFactor = newLevel / (Number(u.level) || 1);
          return {
            ...u,
            level: newLevel,
            output: { ...u.output, amount: Math.ceil((Number(u.output.amount) || 1) * scaleFactor) },
            input: u.input.map(i => ({ ...i, amount: Math.ceil((Number(i.amount) || 1) * scaleFactor) })),
            upgradeCost: Math.floor((Number(u.upgradeCost) || 100) * 1.5),
          };
        }
        return u;
      });

      return {
        ...prev,
        money: (Number(prev.money) || 0) - (Number(unit.upgradeCost) || 0),
        productionUnits: newUnits,
      };
    });
  }, []);

  const upgradeStorage = useCallback((type: ResourceType) => {
    setState(prev => {
      const level = Number(prev.storageLevels[type]) || 1;
      const cost = STORAGE_UPGRADE_COST * level;
      if ((Number(prev.money) || 0) < cost) return prev;

      return {
        ...prev,
        money: (Number(prev.money) || 0) - cost,
        storageLevels: { ...prev.storageLevels, [type]: level + 1 },
        storageLimits: { ...prev.storageLimits, [type]: (Number(prev.storageLimits[type]) || 100) * 2 },
      };
    });
  }, []);

  const upgradeMaxCompanies = useCallback(() => {
    setState(prev => {
      const cost = 1000 * (Number(prev.maxCompanies) || 1);
      if ((Number(prev.money) || 0) < cost) return prev;
      return { ...prev, money: (Number(prev.money) || 0) - cost, maxCompanies: (Number(prev.maxCompanies) || 1) + 1 };
    });
  }, []);

  const upgradeMaxAutomations = useCallback(() => {
    setState(prev => {
      const cost = 500 * (Number(prev.maxAutomations) || 1);
      if ((Number(prev.money) || 0) < cost) return prev;
      return { ...prev, money: (Number(prev.money) || 0) - cost, maxAutomations: (Number(prev.maxAutomations) || 1) + 1 };
    });
  }, []);

  const assignTruck = useCallback((unitId: string, type: TruckType) => {
    setState(prev => {
      if (prev.availableTrucks <= 0) return prev;
      const unit = prev.productionUnits.find(u => u.id === unitId);
      if (!unit) return prev;
      
      const newUnits = prev.productionUnits.map(u => 
        u.id === unitId ? { ...u, trucks: (u.trucks || 0) + 1 } : u
      );
      return { ...prev, availableTrucks: prev.availableTrucks - 1, productionUnits: newUnits };
    });
  }, []);

  const removeTruck = useCallback((unitId: string) => {
    setState(prev => {
      const unit = prev.productionUnits.find(u => u.id === unitId);
      if (!unit || (unit.trucks || 0) <= 0) return prev;
      
      const newUnits = prev.productionUnits.map(u => 
        u.id === unitId ? { ...u, trucks: Math.max(0, (u.trucks || 0) - 1) } : u
      );
      return { ...prev, availableTrucks: Math.min(prev.totalTrucks, prev.availableTrucks + 1), productionUnits: newUnits };
    });
  }, []);

  const buyTruck = useCallback(() => {
    setState(prev => {
      const cost = 2000; // Fixed cost for trucks
      if ((Number(prev.money) || 0) < cost) return prev;
      return { ...prev, money: (Number(prev.money) || 0) - cost, totalTrucks: (Number(prev.totalTrucks) || 1) + 1, availableTrucks: (Number(prev.availableTrucks) || 0) + 1 };
    });
  }, []);

  // ===== BUILDING SYSTEM =====
  const buildBuilding = useCallback((type: BuildingType) => {
    const buildingConfig = BUILDINGS[type];
    if (!buildingConfig) {
      toast.error('Invalid building type');
      return;
    }

    setState(prev => {
      if ((Number(prev.money) || 0) < buildingConfig.baseCost) {
        toast.error('Not enough money to build this');
        return prev;
      }

      const newBuilding = {
        id: `building-${Date.now()}`,
        type,
        name: buildingConfig.name,
        level: 1,
        populationCapacity: buildingConfig.populationCapacity,
        happinessBonus: buildingConfig.happinessBonus,
        resourceConsumption: { ...buildingConfig.resourceConsumption },
        cost: buildingConfig.baseCost,
        upgradeCost: buildingConfig.baseCost * buildingConfig.costMultiplier,
      };

      return {
        ...prev,
        money: (Number(prev.money) || 0) - buildingConfig.baseCost,
        buildings: [...prev.buildings, newBuilding],
      };
    });
  }, []);

  const upgradeBuilding = useCallback((buildingId: string) => {
    setState(prev => {
      const building = prev.buildings.find(b => b.id === buildingId);
      if (!building) return prev;

      const buildingConfig = BUILDINGS[building.type];
      const upgradeCost = buildingConfig.baseCost * Math.pow(buildingConfig.costMultiplier, building.level);

      if ((Number(prev.money) || 0) < upgradeCost) {
        toast.error('Not enough money to upgrade');
        return prev;
      }

      const newBuildings = prev.buildings.map(b => {
        if (b.id === buildingId) {
          return {
            ...b,
            level: b.level + 1,
            populationCapacity: buildingConfig.populationCapacity * (1 + b.level * 0.2),
            happinessBonus: buildingConfig.happinessBonus * (1 + b.level * 0.1),
            upgradeCost: buildingConfig.baseCost * Math.pow(buildingConfig.costMultiplier, b.level + 1),
          };
        }
        return b;
      });

      return {
        ...prev,
        money: (Number(prev.money) || 0) - upgradeCost,
        buildings: newBuildings,
      };
    });
  }, []);

  const demolishBuilding = useCallback((buildingId: string) => {
    setState(prev => {
      const building = prev.buildings.find(b => b.id === buildingId);
      if (!building) return prev;

      // Refund 50% of base cost
      const refund = BUILDINGS[building.type].baseCost * 0.5;

      return {
        ...prev,
        money: (Number(prev.money) || 0) + refund,
        buildings: prev.buildings.filter(b => b.id !== buildingId),
      };
    });
  }, []);

  // Main Tick
  useEffect(() => {
    const processTick = (prev: GameState, now: number): GameState => {
      const newResources = { ...prev.resources };
      let notification = undefined;

      // Calculate net flow
      const newNetFlow: Record<ResourceType, number> = {} as Record<ResourceType, number>;
      Object.keys(prev.resources).forEach(r => newNetFlow[r as ResourceType] = 0);

      prev.productionUnits.forEach(unit => {
        if (unit.isProducing) {
          unit.input.forEach(input => {
            newNetFlow[input.type] = (newNetFlow[input.type] || 0) - (Number(input.amount) || 0) / ((Number(unit.duration) || 1) / (unit.currentEfficiency || 1));
          });
          newNetFlow[unit.output.type] = (newNetFlow[unit.output.type] || 0) + (Number(unit.output.amount) || 0) / ((Number(unit.duration) || 1) / (unit.currentEfficiency || 1));
        }
      });

      // Process Logistics
      const unitsWithLogistics = prev.productionUnits.map(unit => {
        const hasSpeedTech = prev.unlockedTechs.includes('tech_truck_speed');
        const hasCapacityTech = prev.unlockedTechs.includes('tech_truck_capacity');
        const truckMultiplier = (hasCapacityTech ? 2 : 1) * (hasSpeedTech ? 1.5 : 1);
        
        const updatedUnit = { ...unit, inputBuffer: { ...unit.inputBuffer }, outputBuffer: { ...unit.outputBuffer } };
        let remainingTruckCapacity = (Number(unit.trucks) || 0) * truckMultiplier; // 1 truck = 1 item per tick (base)
        
        // 1. Move from Output Buffer to Global Storage
        if (remainingTruckCapacity > 0 && updatedUnit.outputBuffer[updatedUnit.output.type]) {
          const amountToMove = Math.min(remainingTruckCapacity, Number(updatedUnit.outputBuffer[updatedUnit.output.type]) || 0);
          const limit = Number(prev.storageLimits[updatedUnit.output.type]);
          const availableStorage = (isNaN(limit) || limit === 0 || prev.storageLimits[updatedUnit.output.type] === null) ? 1000000000 : limit - (Number(newResources[updatedUnit.output.type]) || 0);
          const actualMoved = Math.max(0, Math.min(amountToMove, availableStorage));
          
          if (actualMoved > 0) {
            updatedUnit.outputBuffer[updatedUnit.output.type] = (Number(updatedUnit.outputBuffer[updatedUnit.output.type]) || 0) - actualMoved;
            newResources[updatedUnit.output.type] = (Number(newResources[updatedUnit.output.type]) || 0) + actualMoved;
            remainingTruckCapacity -= actualMoved;
          }
        }

        // 2. Move from Global Storage to Input Buffer
        if (remainingTruckCapacity > 0) {
          updatedUnit.input.forEach(input => {
            if (remainingTruckCapacity <= 0) return;
            
            const currentBuffer = Number(updatedUnit.inputBuffer[input.type]) || 0;
            const needed = (Number(input.amount) || 0) * 10 - currentBuffer; // Keep a buffer of 10x production cost
            if (needed > 0) {
              const availableGlobal = Number(newResources[input.type]) || 0;
              const amountToMove = Math.max(0, Math.min(remainingTruckCapacity, needed, availableGlobal));
              if (amountToMove > 0) {
                updatedUnit.inputBuffer[input.type] = currentBuffer + amountToMove;
                newResources[input.type] = (Number(newResources[input.type]) || 0) - amountToMove;
                remainingTruckCapacity -= amountToMove;
              }
            }
          });
        }

        return updatedUnit;
      });

      const newUnits = unitsWithLogistics.map(unit => {
        // Check storage limit (outputBuffer)
        const outputBufferLimit = unit.output.amount * 20;
        const isStorageFull = (unit.outputBuffer[unit.output.type] || 0) + unit.output.amount > outputBufferLimit;
        
        if (isStorageFull && unit.isProducing && !unit.isPaused) {
          return { ...unit, isPaused: true, isProducing: false, progress: 0 };
        }
        
        if (!isStorageFull && unit.isPaused) {
          return { ...unit, isPaused: false, isProducing: true, lastStarted: now };
        }

        if (!unit.isProducing || unit.isPaused) return unit;

        const elapsed = (now - (unit.lastStarted || now)) / 1000;
        const actualDuration = unit.duration / (unit.currentEfficiency || 1);
        const progress = Math.min(100, (elapsed / actualDuration) * 100);

        if (progress >= 100) {
          return { ...unit, isProducing: false, progress: 0 };
        }

        return { ...unit, progress };
      });

      const completedUnits = unitsWithLogistics.filter((u) => 
        u.isProducing && !u.isPaused && (now - (u.lastStarted || now)) / 1000 >= (u.duration / (u.currentEfficiency || 1))
      );

      completedUnits.forEach(unit => {
        const outputBufferLimit = unit.output.amount * 20;
        if ((unit.outputBuffer[unit.output.type] || 0) + unit.output.amount <= outputBufferLimit) {
          const u = newUnits.find(nu => nu.id === unit.id);
          if (u) {
            u.outputBuffer[unit.output.type] = (u.outputBuffer[unit.output.type] || 0) + unit.output.amount;
          }
        } else {
          notification = `Production of ${unit.output.type} paused: Output Buffer full! Assign trucks!`;
        }
      });

      const newProfitHistory = [...prev.profitHistory, prev.money];
      if (newProfitHistory.length > HISTORY_LIMIT) newProfitHistory.shift();

      let nextState = {
        ...prev,
        resources: newResources,
        productionUnits: newUnits,
        lastUpdate: now,
        notification,
        netFlow: newNetFlow,
        profitHistory: newProfitHistory,
      };

      // ===== HEAT SYSTEM =====
      // Heat is generated by certain production processes
      // It decays passively at 10 units per tick
      const HEAT_DECAY_RATE = 10;
      
      // Generate heat from production (high-tier industrial processes)
      let heatGenerated = 0;
      nextState.productionUnits.forEach(unit => {
        if (unit.isProducing) {
          // Steel Mill generates 100 heat
          if (unit.id === 'steel_mill') heatGenerated += 100;
          // Foundry generates 20 heat
          if (unit.id === 'foundry') heatGenerated += 20;
          // Power Plant generates 50 heat
          if (unit.id === 'power_plant') heatGenerated += 50;
          // Electronics Factory generates 30 heat
          if (unit.id === 'electronics_factory') heatGenerated += 30;
          // Laboratory generates some heat
          if (unit.id === 'laboratory') heatGenerated += 20;
        }
      });
      
      const heatDecay = Math.min(nextState.heatLevel, HEAT_DECAY_RATE);
      nextState.heatLevel = Math.max(0, Math.min(nextState.maxHeat, nextState.heatLevel - heatDecay + heatGenerated));

      // ===== POPULATION SYSTEM =====
      // 1. Calculate total population capacity from buildings
      const totalPopulationCapacity = nextState.buildings.reduce((sum, b) => sum + (BUILDINGS[b.type]?.populationCapacity || 0), 0);
      const baseCapacity = 50; // Base capacity without buildings
      
      // 2. Calculate total needs based on population
      const foodNeeded = Math.ceil(nextState.population * FOOD_CONSUMPTION_RATE);
      const comfortNeeded = Math.ceil(nextState.population * COMFORT_CONSUMPTION_RATE);
      const medicalNeeded = Math.ceil(nextState.population * MEDICAL_CONSUMPTION_RATE);
      const energyNeeded = Math.ceil(nextState.population * ENERGY_CONSUMPTION_RATE);
      
      // 3. Check if needs are met
      const hasFood = (nextState.resources['food_ration'] || 0) >= foodNeeded;
      const hasComfort = (nextState.resources['comfort_item'] || 0) >= comfortNeeded;
      const hasMedical = (nextState.resources['medical_supply'] || 0) >= medicalNeeded;
      const hasEnergy = (nextState.resources['energy'] || 0) >= energyNeeded;
      const needsMet = hasFood && hasComfort && hasMedical && hasEnergy;
      
      // 4. Calculate satisfaction ratios (0 to 1)
      const foodRatio = Math.min(1, (nextState.resources['food_ration'] || 0) / Math.max(1, foodNeeded));
      const comfortRatio = Math.min(1, (nextState.resources['comfort_item'] || 0) / Math.max(1, comfortNeeded));
      const medicalRatio = Math.min(1, (nextState.resources['medical_supply'] || 0) / Math.max(1, medicalNeeded));
      
      // Calculate base satisfaction from resource adequacy
      const baseSatisfaction = (foodRatio + comfortRatio + medicalRatio) / 3;
      
      // Factor in population size - larger populations are harder to keep happy
      // Using logarithmic scale: 10 pop = easy, 100 pop = moderate, 1000 pop = hardest
      const populationDifficulty = Math.min(0.7, Math.log10(nextState.population + 10) / Math.log10(1010));
      
      // Add building happiness bonus to target (fixed values)
      const buildingHappinessBonus = nextState.buildings.reduce((sum, b) => sum + (BUILDINGS[b.type]?.happinessBonus || 0), 0);

      // Target happiness: more population = harder to maintain high happiness
      // At 10 pop with full supplies: ~100% happiness
      // At 100 pop with just enough: ~50% happiness
      // At 1000 pop with just enough: ~30% happiness
      const targetHappiness = Math.min(100, baseSatisfaction * 100 * (1 - populationDifficulty) + buildingHappinessBonus);
      
      // Smooth transition toward target happiness
      if (nextState.populationHappiness < targetHappiness) {
        nextState.populationHappiness = Math.min(targetHappiness, nextState.populationHappiness + HAPPINESS_RECOVERY);
      } else {
        nextState.populationHappiness = Math.max(targetHappiness, nextState.populationHappiness - HAPPINESS_DECAY);
      }
      
      // 5. Consume resources (SINK - keeps market alive!)
      if (hasFood) {
        nextState.resources['food_ration'] = (nextState.resources['food_ration'] || 0) - foodNeeded;
      }
      if (hasComfort) {
        nextState.resources['comfort_item'] = (nextState.resources['comfort_item'] || 0) - comfortNeeded;
      }
      if (hasMedical) {
        nextState.resources['medical_supply'] = (nextState.resources['medical_supply'] || 0) - medicalNeeded;
      }
      
      // 6. Population growth - infinite based on building capacity
      const maxPopulation = baseCapacity + totalPopulationCapacity;
      if (needsMet && nextState.populationHappiness > 70 && nextState.population < maxPopulation) {
        // Growth rate slows as approaching capacity
        const spaceRemaining = maxPopulation - nextState.population;
        const growthFactor = Math.min(1, spaceRemaining / 50); // Slower growth as fills up
        nextState.population = Math.min(maxPopulation, nextState.population + BASE_POPULATION_GROWTH * growthFactor);
      } else if (!hasFood) {
        // Population decays without food
        nextState.population = Math.max(0, nextState.population - POPULATION_DECAY);
      }
      
      // 6. Calculate efficiency bonus/penalty (affects all production)
      let populationEfficiency = 1.0;
      if (needsMet && nextState.populationHappiness > 70) {
        populationEfficiency = 1.0 + POPULATION_EFFICIENCY_BONUS; // +10% production
      } else if (nextState.populationHappiness < HAPPINESS_CRITICAL_THRESHOLD) {
        populationEfficiency = 1.0 - POPULATION_EFFICIENCY_PENALTY; // -30% production
      }
      
      // 7. Generate tax income (credits from population)
      const taxRate = BASE_TAX_RATE + (Math.max(0, nextState.populationHappiness - 70) * HAPPINESS_TAX_BONUS);
      const taxIncome = Math.floor(nextState.population * taxRate);
      nextState.money += taxIncome;
      
      // Store efficiency for production units to use
      nextState.populationEfficiency = populationEfficiency;

      // Handle Automation (Simplified for simulation)
      nextState.automationRules.forEach(rule => {
        // Skip if not enabled OR if paused
        if (!rule.isEnabled || rule.isPaused) return;
        
        const { conditions, action } = rule;
        const allConditionsMet = conditions.every(condition => {
          if (condition.isMarketCondition) {
            const marketItem = nextState.market[condition.resource];
            if (!marketItem) return false;
            if (condition.operator === '<') return marketItem.price < condition.value;
            if (condition.operator === '>') return marketItem.price > condition.value;
            if (condition.operator === '==') return marketItem.price === condition.value;
            return false;
          } else {
            const resourceValue = condition.resource === 'money' ? nextState.money : nextState.resources[condition.resource];
            if (condition.operator === '<') return resourceValue < condition.value;
            if (condition.operator === '>') return resourceValue > condition.value;
            if (condition.operator === '==') return resourceValue === condition.value;
            return false;
          }
        });

        if (allConditionsMet) {
          if (action.type === 'produce') {
            const unitId = action.resource;
            const unit = nextState.productionUnits.find(u => u.id === unitId);
            if (unit && !unit.isProducing) {
              const canProduce = unit.input.every(input => {
                if (input.type === 'energy') return true;
                const inputAmount = unit.inputBuffer[input.type] || 0;
                return inputAmount >= input.amount;
              });
              const outputBufferLimit = unit.output.amount * 20;
              const currentOutput = unit.outputBuffer[unit.output.type] || 0;
              const hasSpace = currentOutput + unit.output.amount <= outputBufferLimit;
              
              const resourceLimit = nextState.storageLimits[unit.output.type] || 1;
              const resourceAmount = nextState.resources[unit.output.type] || 0;
              const hasStorageSpace = resourceAmount < resourceLimit;

              if (canProduce && hasSpace && hasStorageSpace) {
                const energyInput = unit.input.find(i => i.type === 'energy');
                let currentEfficiency = 1.0;
                let energyConsumed = 0;
                if (energyInput && energyInput.amount > 0) {
                  const availableEnergy = Math.min(energyInput.amount, unit.inputBuffer['energy'] || 0);
                  energyConsumed = availableEnergy;
                  const ratio = availableEnergy / energyInput.amount;
                  if (ratio >= 1.0) currentEfficiency = 1.0;
                  else if (ratio >= 0.8) currentEfficiency = 0.9 + (ratio - 0.8) * 0.5;
                  else if (ratio >= 0.5) currentEfficiency = 0.6 + (ratio - 0.5) * 1.0;
                  else currentEfficiency = 0.2 + ratio * 0.8;
                }

                nextState.productionUnits = nextState.productionUnits.map(u => {
                  if (u.id === unitId) {
                    const newInputBuffer = { ...u.inputBuffer };
                    u.input.forEach(input => {
                      if (input.type === 'energy') {
                        newInputBuffer[input.type] = Math.max(0, (newInputBuffer[input.type] || 0) - energyConsumed);
                      } else {
                        newInputBuffer[input.type] = Math.max(0, (newInputBuffer[input.type] || 0) - input.amount);
                      }
                    });
                    return { ...u, isProducing: true, progress: 0, lastStarted: now, inputBuffer: newInputBuffer, currentEfficiency };
                  }
                  return u;
                });
              }
            }
          }
          // Buy/Sell are skipped in offline simulation to avoid complex market logic and fetch calls
        }
      });

      // Auto-start for automated units
      nextState.productionUnits.forEach(unit => {
        if (unit.isAutomated && !unit.isProducing) {
          const canProduce = unit.input.every(input => input.type === 'energy' || (unit.inputBuffer[input.type] || 0) >= input.amount);
          const outputBufferLimit = unit.output.amount * 20;
          const hasSpace = (unit.outputBuffer[unit.output.type] || 0) + unit.output.amount <= outputBufferLimit;
          
          if (canProduce && hasSpace) {
            // Also check main storage for auto-start
            const resourceLimit = nextState.storageLimits[unit.output.type] || 1;
            const resourceAmount = nextState.resources[unit.output.type] || 0;
            const hasStorageSpace = resourceAmount < resourceLimit;
            
            if (!hasStorageSpace) return; // Don't start if storage full
            
            const energyInput = unit.input.find(i => i.type === 'energy');
            let currentEfficiency = 1.0;
            let energyConsumed = 0;
            if (energyInput && energyInput.amount > 0) {
              const availableEnergy = Math.min(energyInput.amount, unit.inputBuffer['energy'] || 0);
              energyConsumed = availableEnergy;
              const ratio = availableEnergy / energyInput.amount;
              if (ratio >= 1.0) currentEfficiency = 1.0;
              else if (ratio >= 0.8) currentEfficiency = 0.9 + (ratio - 0.8) * 0.5;
              else if (ratio >= 0.5) currentEfficiency = 0.6 + (ratio - 0.5) * 1.0;
              else currentEfficiency = 0.2 + ratio * 0.8;
            }

            nextState.productionUnits = nextState.productionUnits.map(u => {
              if (u.id === unit.id) {
                const newInputBuffer = { ...u.inputBuffer };
                u.input.forEach(input => {
                  if (input.type === 'energy') {
                    newInputBuffer[input.type] = Math.max(0, (newInputBuffer[input.type] || 0) - energyConsumed);
                  } else {
                    newInputBuffer[input.type] = Math.max(0, (newInputBuffer[input.type] || 0) - input.amount);
                  }
                });
                return { ...u, isProducing: true, progress: 0, lastStarted: now, inputBuffer: newInputBuffer, currentEfficiency };
              }
              return u;
            });
          }
        }
      });

      return nextState;
    };

    // Offline Progress Simulation
    const idleTime = Date.now() - (stateRef.current.lastUpdate || Date.now());
    if (idleTime > 5000) { // More than 5 seconds away
      const ticks = Math.floor(idleTime / 1000);
      const maxTicks = 100000; // Cap at ~27 hours
      const actualTicks = Math.min(ticks, maxTicks);
      
      if (actualTicks > 0) {
        console.log(`Simulating ${actualTicks} offline ticks...`);
        let simulatedState = stateRef.current;
        let simulatedNow = stateRef.current.lastUpdate || Date.now();
        
        // Simulate in chunks to avoid blocking the main thread too long if ticks are very high
        // But for 100k ticks, a simple loop is usually fine in JS if the logic is not too heavy
        for (let i = 0; i < actualTicks; i++) {
          simulatedNow += 1000;
          simulatedState = processTick(simulatedState, simulatedNow);
        }
        setState(simulatedState);
      }
    }

    const interval = setInterval(() => {
      setState(prev => processTick(prev, Date.now()));

      // Clear notification after a short delay
      setTimeout(() => {
        setState(prev => ({ ...prev, notification: undefined }));
      }, 500);

      executeAutomation();
    }, TICK_RATE);

    return () => clearInterval(interval);
  }, [executeAutomation]);


  // Market Tick
  useEffect(() => {
    fetchMarket();
    const interval = setInterval(() => {
      fetchMarket();
      syncUserTrades();
    }, MARKET_TICK_RATE);
    return () => clearInterval(interval);
  }, [fetchMarket, syncUserTrades]);

  const login = async (username: string, password: string, isRegister: boolean) => {
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Auth failed');
    }
    const user = await res.json();
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    
    // Load user-specific save
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + user.username);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Merge with initial state to ensure all new fields exist
        const initialState = getInitialState(user);
        setState({ 
          ...initialState, 
          ...parsed, 
          user,
          dataPoints: typeof parsed.dataPoints === 'number' ? parsed.dataPoints : 60,
          heatLevel: typeof parsed.heatLevel === 'number' ? parsed.heatLevel : 0,
          maxHeat: typeof parsed.maxHeat === 'number' ? parsed.maxHeat : 1000,
          population: typeof parsed.population === 'number' ? parsed.population : 10,
          populationHappiness: typeof parsed.populationHappiness === 'number' ? parsed.populationHappiness : 100,
        });
      } catch (e) {
        setState(getInitialState(user));
      }
    } else {
      setState(getInitialState(user));
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Failed to logout', e);
    }
    localStorage.removeItem(CURRENT_USER_KEY);
    setState(getInitialState(null));
  };

  return {
    state,
    startProduction,
    createOrder,
    cancelOrder,
    upgradeUnit,
    upgradeStorage,
    upgradeMaxCompanies,
    upgradeMaxAutomations,
    assignTruck,
    removeTruck,
    buyTruck,
    addAutomationRule: (rule: Omit<AutomationRule, 'id'>) => {
      setState(prev => {
        if (prev.automationRules.filter(r => r.isEnabled).length >= prev.maxAutomations) {
          return prev;
        }
        return {
          ...prev,
          automationRules: [...prev.automationRules, { ...rule, id: Math.random().toString(36).substr(2, 9) }]
        };
      });
    },
    createCompany: (unit: ProductionUnit) => {
      setState(prev => {
        if (prev.productionUnits.length >= prev.maxCompanies) {
          return { ...prev, notification: 'Max companies reached!' };
        }
        if (prev.money < unit.upgradeCost) {
          return { ...prev, notification: `Not enough money! Need ${unit.upgradeCost}` };
        }
        return {
          ...prev,
          money: prev.money - unit.upgradeCost,
          productionUnits: [...prev.productionUnits, { ...unit, id: Math.random().toString(36).substr(2, 9), inputBuffer: {}, outputBuffer: {}, trucks: 0 }]
        };
      });
    },
    deleteCompany: (id: string) => {
      setState(prev => {
        const unit = prev.productionUnits.find(u => u.id === id);
        if (!unit) return prev;
        
        const returnedTrucks = unit.trucks;
        const newResources = { ...prev.resources };
        
        // Return input buffer resources
        Object.entries(unit.inputBuffer).forEach(([type, amount]) => {
          if (amount) {
            newResources[type as ResourceType] = Math.min(
              prev.storageLimits[type as ResourceType],
              (newResources[type as ResourceType] || 0) + amount
            );
          }
        });
        
        // Return output buffer resources
        Object.entries(unit.outputBuffer).forEach(([type, amount]) => {
          if (amount) {
            newResources[type as ResourceType] = Math.min(
              prev.storageLimits[type as ResourceType],
              (newResources[type as ResourceType] || 0) + amount
            );
          }
        });

        return {
          ...prev,
          resources: newResources,
          availableTrucks: prev.availableTrucks + returnedTrucks,
          productionUnits: prev.productionUnits.filter(u => u.id !== id)
        };
      });
    },
    toggleAutomationRule: (id: string) => {
      setState(prev => ({
        ...prev,
        automationRules: prev.automationRules.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r)
      }));
    },
    deleteAutomationRule: (id: string) => {
      setState(prev => ({
        ...prev,
        automationRules: prev.automationRules.filter(r => r.id !== id)
      }));
    },
    editAutomationRule: (rule: AutomationRule) => {
      setState(prev => ({
        ...prev,
        automationRules: prev.automationRules.map(r => r.id === rule.id ? rule : r)
      }));
    },
    toggleUnitAutomation: (unitId: string) => {
      setState(prev => ({
        ...prev,
        productionUnits: prev.productionUnits.map(u => u.id === unitId ? { ...u, isAutomated: !u.isAutomated } : u)
      }));
    },
    unlockTech: (techId: string, cost: number) => {
      setState(prev => {
        // Use Data Points instead of Research Data
        if (prev.dataPoints < cost || prev.unlockedTechs.includes(techId)) return prev;
        return {
          ...prev,
          dataPoints: prev.dataPoints - cost,
          unlockedTechs: [...prev.unlockedTechs, techId]
        };
      });
    },
    // Building System
    buildBuilding,
    upgradeBuilding,
    demolishBuilding,
    login,
    logout,
  };
}
