import { useState, useEffect, useCallback, useRef } from 'react';
import { ResourceType, GameState, User, Contract, MarketOrder, TradeHistory } from './types';
import { toast } from 'sonner';

const STORAGE_KEY_PREFIX = 'marketpunk_';

const initialMarket: Record<ResourceType, any> = {
  energy: { resourceType: 'energy', stockGlobal: 1000, stockLocal: 100, price: 100, demand: 50, supply: 50, volatility: 0.1, trend: 0, lastPrices: [] },
  water: { resourceType: 'water', stockGlobal: 1000, stockLocal: 100, price: 100, demand: 50, supply: 50, volatility: 0.1, trend: 0, lastPrices: [] },
  food: { resourceType: 'food', stockGlobal: 1000, stockLocal: 100, price: 100, demand: 50, supply: 50, volatility: 0.1, trend: 0, lastPrices: [] },
  minerals: { resourceType: 'minerals', stockGlobal: 1000, stockLocal: 100, price: 100, demand: 50, supply: 50, volatility: 0.1, trend: 0, lastPrices: [] },
  tech: { resourceType: 'tech', stockGlobal: 1000, stockLocal: 100, price: 100, demand: 50, supply: 50, volatility: 0.1, trend: 0, lastPrices: [] },
  luxury: { resourceType: 'luxury', stockGlobal: 1000, stockLocal: 100, price: 100, demand: 50, supply: 50, volatility: 0.1, trend: 0, lastPrices: [] },
};

export function useGameLoop() {
  const [state, setState] = useState<GameState>({
    user: null,
    market: initialMarket,
    orderBook: [],
    tradeHistory: [],
    contracts: [],
    inventory: { energy: 100, water: 100, food: 100, minerals: 100, tech: 100, luxury: 100 },
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const fetchMarket = useCallback(async () => {
    try {
      const res = await fetch('/api/market');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();
      setState(prev => ({
        ...prev,
        market: data.market,
        orderBook: data.orderBook || [],
        tradeHistory: data.tradeHistory || []
      }));
    } catch (e) {
      console.error('Failed to fetch market', e);
    }
  }, []);

  const fetchContracts = useCallback(async () => {
    try {
      const res = await fetch('/api/market/contracts');
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const contracts = await res.json();
      setState(prev => ({ ...prev, contracts }));
    } catch (e) {
      console.error('Failed to fetch contracts', e);
    }
  }, []);

  const acceptContract = useCallback(async (contractId: string) => {
    const token = stateRef.current.user?.token;
    if (!token) {
      toast.error('You must be logged in to accept contracts');
      return;
    }

    try {
      const res = await fetch(`/api/market/contracts/${contractId}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to accept contract');
        return;
      }

      const data = await res.json();
      toast.success('Contract accepted!');
      fetchContracts();
      if (data.payment > 0) {
        setState(prev => ({ ...prev, user: prev.user ? { ...prev.user, money: prev.user.money + data.payment } : null }));
      }
    } catch (e) {
      console.error('Failed to accept contract', e);
    }
  }, [fetchContracts]);

  const deliverContract = useCallback(async (contractId: string, amount: number) => {
    const token = stateRef.current.user?.token;
    if (!token) {
      toast.error('You must be logged in to deliver contracts');
      return;
    }

    const contract = stateRef.current.contracts.find(c => c.id === contractId);
    if (!contract) return;

    // Cap amount to remaining needed
    const remainingNeeded = contract.totalAmount - contract.deliveredAmount;
    const actualAmount = Math.min(amount, remainingNeeded);

    if (actualAmount <= 0) {
      toast.error('Contract already fulfilled or invalid amount');
      return;
    }

    try {
      const res = await fetch(`/api/market/contracts/${contractId}/deliver`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: actualAmount })
      });

      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Failed to deliver contract');
        return;
      }

      const data = await res.json();
      toast.success(`Delivered ${actualAmount} units!`);
      fetchContracts();
      if (data.payment > 0) {
        setState(prev => ({ ...prev, user: prev.user ? { ...prev.user, money: prev.user.money + data.payment } : null }));
      }
    } catch (e) {
      console.error('Failed to deliver contract', e);
    }
  }, [fetchContracts]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchMarket();
      fetchContracts();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchMarket, fetchContracts]);

  return {
    state,
    setState,
    acceptContract,
    deliverContract,
  };
}
