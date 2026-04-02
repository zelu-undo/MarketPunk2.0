import React, { useState, useMemo } from 'react';
import { ResourceType, GameState, Contract, MarketOrder } from '../types';
import { Search, TrendingUp, Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { MarketResourceSelector } from './MarketResourceSelector';
import { ResourceGrid } from './ResourceGrid';
import { ContractsTab } from './ContractsTab';

interface MarketWithSearchProps {
  state: GameState;
  acceptContract: (id: string) => void;
  deliverContract: (id: string, amount: number) => void;
}

export function MarketWithSearch({ state, acceptContract, deliverContract }: MarketWithSearchProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ResourceType | 'all'>('all');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [newOrder, setNewOrder] = useState({
    resource: 'energy' as ResourceType,
    type: 'buy' as 'buy' | 'sell',
    amount: 10,
    price: 100
  });

  const filteredResources = useMemo(() => {
    return Object.values(state.market).filter(r => {
      const matchesSearch = r.resourceType.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || r.resourceType === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [state.market, search, selectedCategory]);

  const activeContracts = useMemo(() => {
    return state.contracts.filter(c => c.status === 'active' && c.assignedPlayerId === state.user?.username);
  }, [state.contracts, state.user]);

  const availableContracts = useMemo(() => {
    return state.contracts.filter(c => c.status === 'active' && !c.assignedPlayerId);
  }, [state.contracts]);

  const handleCreateOrder = async () => {
    if (!state.user?.token) {
      toast.error('Please login to place orders');
      return;
    }

    try {
      const res = await fetch('/api/market/order', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${state.user.token}`
        },
        body: JSON.stringify({
          ...newOrder,
          amount: Math.floor(newOrder.amount),
          price: Math.round(newOrder.price)
        }),
      });

      if (res.ok) {
        toast.success('Order placed successfully');
        setShowOrderForm(false);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to place order');
      }
    } catch (e) {
      console.error('Order failed', e);
    }
  };

  return (
    <div className="space-y-8">
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>
        
        <MarketResourceSelector selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Resource List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Live Market
            </h2>
            <button 
              onClick={() => setShowOrderForm(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Order
            </button>
          </div>
          
          <ResourceGrid resources={filteredResources} />
        </div>

        {/* Contracts Panel */}
        <ContractsTab 
          activeContracts={activeContracts} 
          availableContracts={availableContracts} 
          onAccept={acceptContract} 
          onDeliver={deliverContract} 
        />
      </div>

      {/* Order Form Modal */}
      <AnimatePresence>
        {showOrderForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">New Market Order</h2>
                <button onClick={() => setShowOrderForm(false)} className="text-zinc-500 hover:text-zinc-100">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-950 rounded-xl border border-zinc-800">
                  <button 
                    onClick={() => setNewOrder(prev => ({ ...prev, type: 'buy' }))}
                    className={cn(
                      "py-2 rounded-lg text-sm font-bold transition-all",
                      newOrder.type === 'buy' ? "bg-blue-600 text-white" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    BUY
                  </button>
                  <button 
                    onClick={() => setNewOrder(prev => ({ ...prev, type: 'sell' }))}
                    className={cn(
                      "py-2 rounded-lg text-sm font-bold transition-all",
                      newOrder.type === 'sell' ? "bg-rose-600 text-white" : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    SELL
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Resource</label>
                    <select 
                      value={newOrder.resource}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, resource: e.target.value as ResourceType }))}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.keys(state.market).map(type => (
                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Amount</label>
                      <input 
                        type="number"
                        value={newOrder.amount}
                        onChange={(e) => setNewOrder(prev => ({ ...prev, amount: parseInt(e.target.value) }))}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        step="1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">Price</label>
                      <input 
                        type="number"
                        value={newOrder.price}
                        onChange={(e) => setNewOrder(prev => ({ ...prev, price: parseInt(e.target.value) }))}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="1"
                        step="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={handleCreateOrder}
                    className={cn(
                      "w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all",
                      newOrder.type === 'buy' ? "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20" : "bg-rose-600 hover:bg-rose-500 shadow-rose-500/20"
                    )}
                  >
                    Place {newOrder.type.toUpperCase()} Order
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
