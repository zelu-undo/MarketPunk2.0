import { useState, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import { ResourceType, MarketItem, Order } from '../types';
import { RESOURCES } from '../constants';
import { formatCurrency, formatNumber, getIcon } from '../lib/utils';

interface MarketWithSearchProps {
  market: Record<ResourceType, MarketItem>;
  resources: Record<ResourceType, number>;
  storageLimits: Record<ResourceType, number>;
  money: number;
  storageLevels?: Record<ResourceType, number>;
  favorites?: ResourceType[];
  onToggleFavorite?: (type: ResourceType) => void;
  onUpgradeStorage?: (type: ResourceType) => void;
  orderBook: Order[];
  onCreateOrder: (resource: ResourceType, type: 'buy' | 'sell', amount: number, price: number) => void;
  onCancelOrder?: (orderId: string) => void;
}

export function MarketWithSearch({ 
  market, 
  resources, 
  storageLimits, 
  money, 
  storageLevels, 
  favorites, 
  onToggleFavorite, 
  onUpgradeStorage,
  orderBook, 
  onCreateOrder, 
  onCancelOrder 
}: MarketWithSearchProps) {
  const [search, setSearch] = useState('');
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [orderAmount, setOrderAmount] = useState('');
  const [orderPrice, setOrderPrice] = useState('');

  // Filter resources based on search
  const filteredResources = useMemo(() => {
    if (!search.trim()) return [];
    const searchLower = search.toLowerCase();
    return Object.entries(RESOURCES)
      .filter(([type, info]) => {
        if (type === 'money' || type === 'research') return false;
        return info.label.toLowerCase().includes(searchLower) || type.toLowerCase().includes(searchLower);
      })
      .slice(0, 8);
  }, [search]);

  // Get orders for selected resource - sorted by price with FIFO for same price
  const selectedOrders = useMemo(() => {
    if (!selectedResource || !orderBook) return { bids: [], asks: [] };
    
    // Bids (buy orders): sorted highest price first, then FIFO by timestamp
    const bids = orderBook
      .filter(o => o.resource === selectedResource && o.type === 'buy')
      .sort((a, b) => b.price - a.price || a.timestamp - b.timestamp);
    
    // Asks (sell orders): sorted lowest price first, then FIFO by timestamp  
    const asks = orderBook
      .filter(o => o.resource === selectedResource && o.type === 'sell')
      .sort((a, b) => a.price - b.price || a.timestamp - b.timestamp);
    
    return { bids, asks };
  }, [selectedResource, orderBook]);

  // Calculate spread
  const spread = useMemo(() => {
    if (selectedOrders.bids.length === 0 || selectedOrders.asks.length === 0) return null;
    const bestBid = selectedOrders.bids[0].price;
    const bestAsk = selectedOrders.asks[0].price;
    return { 
      bestBid, 
      bestAsk, 
      value: bestAsk - bestBid, 
      percentage: bestAsk > 0 ? ((bestAsk - bestBid) / bestAsk) * 100 : 0 
    };
  }, [selectedOrders]);

  // Handle create order
  const handleCreateOrder = (type: 'buy' | 'sell') => {
    if (!selectedResource || !onCreateOrder) return;
    const amount = parseInt(orderAmount) || 0;
    const price = parseFloat(orderPrice) || 0;
    if (amount <= 0 || price <= 0) return;
    onCreateOrder(selectedResource, type, amount, price);
    setOrderAmount('');
    setOrderPrice('');
  };

  if (!selectedResource) {
    return (
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search resource..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-700"
            />
          </div>
          
          {/* Dropdown */}
          {showDropdown && filteredResources.length > 0 && (
            <div className="absolute z-50 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
              {filteredResources.map(([type, info]) => {
                const Icon = getIcon(info.icon);
                return (
                  <button
                    key={type}
                    onClick={() => { 
                      setSelectedResource(type as ResourceType); 
                      setSearch(info.label); 
                      setShowDropdown(false); 
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${info.color}20`, color: info.color }}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{info.label}</div>
                      <div className="text-xs text-zinc-500">Tier {info.tier} • {formatCurrency(market[type as ResourceType]?.price || 0)}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Hint when no resource selected */}
        <div className="text-center py-12 text-zinc-500">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>Search for a resource to view its order book</p>
        </div>
      </div>
    );
  }

  const info = RESOURCES[selectedResource];
  const Icon = getIcon(info.icon);
  const currentPrice = market[selectedResource]?.price || 0;
  const prevPrice = market[selectedResource]?.history[market[selectedResource].history.length - 2]?.price || currentPrice;
  const isUp = currentPrice >= prevPrice;
  const hasStorage = resources[selectedResource] < storageLimits[selectedResource];

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search resource..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowDropdown(true); }}
            onFocus={() => setShowDropdown(true)}
            className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-zinc-700"
          />
        </div>
        
        {/* Dropdown */}
        {showDropdown && filteredResources.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
            {filteredResources.map(([type, info]) => {
              const Icon = getIcon(info.icon);
              return (
                <button
                  key={type}
                  onClick={() => { 
                    setSelectedResource(type as ResourceType); 
                    setSearch(info.label); 
                    setShowDropdown(false); 
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${info.color}20`, color: info.color }}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">{info.label}</div>
                    <div className="text-xs text-zinc-500">Tier {info.tier} • {formatCurrency(market[type as ResourceType]?.price || 0)}</div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Book for Selected Resource */}
      <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${info.color}20`, color: info.color }}>
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{info.label}</h3>
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                Current Price: {formatCurrency(currentPrice)}
                <span className={`text-xs ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isUp ? '▲' : '▼'} {Math.abs(((currentPrice - prevPrice) / prevPrice) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setSelectedResource(null)}
            className="px-3 py-1.5 bg-zinc-800 text-zinc-400 rounded-lg text-sm hover:bg-zinc-700 transition-colors"
          >
            ← Back to search
          </button>
        </div>

        {/* Market Stats */}
        <div className="flex items-center gap-4 mb-6 text-xs">
          <div className="flex items-center gap-1 text-zinc-500 uppercase tracking-widest font-bold">
            <TrendingUp className="w-3 h-3 text-emerald-500" /> Demand: {market[selectedResource]?.demand.toFixed(0) || 0}
          </div>
          <div className="flex items-center gap-1 text-zinc-500 uppercase tracking-widest font-bold">
            <TrendingDown className="w-3 h-3 text-red-500" /> Supply: {market[selectedResource]?.supply.toFixed(0) || 0}
          </div>
          <div className="text-zinc-500 uppercase tracking-widest font-bold">
            Inventory: {formatNumber(resources[selectedResource])} / {formatNumber(storageLimits[selectedResource])}
          </div>
        </div>

        {/* Spread */}
        {spread && (
          <div className="mb-4 p-3 bg-zinc-900/50 rounded-lg flex items-center justify-between">
            <div className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Spread</div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-zinc-400">Best Bid: <span className="text-emerald-400 font-mono">{formatCurrency(spread.bestBid)}</span></span>
              <span className="text-sm text-zinc-400">Best Ask: <span className="text-red-400 font-mono">{formatCurrency(spread.bestAsk)}</span></span>
              <span className="text-sm font-mono">{formatCurrency(spread.value)} ({spread.percentage.toFixed(2)}%)</span>
            </div>
          </div>
        )}

        {/* Order Book Grid */}
        <div className="grid grid-cols-2 gap-6">
          {/* Bids (Buy Orders) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-widest">Bids (Buy)</h4>
              <span className="text-xs text-zinc-500">{selectedOrders.bids.length} orders</span>
            </div>
            <div className="space-y-1">
              {selectedOrders.bids.length === 0 ? (
                <div className="text-center py-4 text-zinc-500 text-sm">No buy orders</div>
              ) : (
                selectedOrders.bids.slice(0, 10).map((order) => {
                  const maxAmount = selectedOrders.bids.reduce((sum, o) => sum + o.amount, 0);
                  const percentage = maxAmount > 0 ? (order.amount / maxAmount) * 100 : 0;
                  return (
                    <div key={order.id} className="relative flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors">
                      <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-500/30 to-transparent rounded-l-lg" style={{ width: `${percentage}%`, maxWidth: '100%' }} />
                      <div className="relative flex items-center justify-between w-full">
                        <span className="text-sm font-mono text-emerald-400">{formatCurrency(order.price)}</span>
                        <span className="text-sm text-zinc-400">{order.amount}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Asks (Sell Orders) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-red-400 uppercase tracking-widest">Asks (Sell)</h4>
              <span className="text-xs text-zinc-500">{selectedOrders.asks.length} orders</span>
            </div>
            <div className="space-y-1">
              {selectedOrders.asks.length === 0 ? (
                <div className="text-center py-4 text-zinc-500 text-sm">No sell orders</div>
              ) : (
                selectedOrders.asks.slice(0, 10).map((order) => {
                  const maxAmount = selectedOrders.asks.reduce((sum, o) => sum + o.amount, 0);
                  const percentage = maxAmount > 0 ? (order.amount / maxAmount) * 100 : 0;
                  return (
                    <div key={order.id} className="relative flex items-center justify-between px-3 py-2 rounded-lg bg-red-500/5 hover:bg-red-500/10 transition-colors">
                      <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500/30 to-transparent rounded-l-lg" style={{ width: `${percentage}%`, maxWidth: '100%' }} />
                      <div className="relative flex items-center justify-between w-full">
                        <span className="text-sm font-mono text-red-400">{formatCurrency(order.price)}</span>
                        <span className="text-sm text-zinc-400">{order.amount}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Create Order Form */}
        <div className="mt-6 pt-6 border-t border-zinc-800">
          <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Place Order (2% fee)</h4>
          <div className="grid grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="Amount"
              value={orderAmount}
              onChange={(e) => setOrderAmount(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-zinc-700"
            />
            <input
              type="number"
              placeholder="Price"
              value={orderPrice}
              onChange={(e) => setOrderPrice(e.target.value)}
              className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-zinc-700"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleCreateOrder('buy')}
                disabled={!onCreateOrder || resources[selectedResource] < (parseInt(orderAmount) || 0)}
                className="flex-1 px-3 py-2 bg-emerald-500 text-black rounded-lg text-sm font-bold uppercase hover:bg-emerald-400 transition-colors disabled:opacity-30"
              >
                Buy
              </button>
              <button
                onClick={() => handleCreateOrder('sell')}
                disabled={!onCreateOrder || resources[selectedResource] < (parseInt(orderAmount) || 0)}
                className="flex-1 px-3 py-2 bg-red-500 text-black rounded-lg text-sm font-bold uppercase hover:bg-red-400 transition-colors disabled:opacity-30"
              >
                Sell
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}