import { useState } from 'react';
import { RESOURCES, PRODUCTION_RECIPES } from '../constants';
import { ResourceType } from '../types';
import { Search, Star, ChevronDown, ChevronUp } from 'lucide-react';

type TierFilter = 'all' | 1 | 2 | 3 | 4 | 5;

interface ResourceGridProps {
  resources: Record<ResourceType, number>;
  storageLimits: Record<ResourceType, number>;
  storageLevels: Record<ResourceType, number>;
  favorites?: ResourceType[];
  onToggleFavorite?: (type: ResourceType) => void;
  onUpgradeStorage?: (type: ResourceType) => void;
  title?: string;
}

const TIER_COLORS: Record<number, string> = {
  1: '#84cc16', // lime
  2: '#3b82f6', // blue
  3: '#a855f7', // purple
  4: '#f59e0b', // amber
  5: '#ef4444', // red
};

const TIER_NAMES: Record<number, string> = {
  1: 'Raw Materials',
  2: 'Basic Processing',
  3: 'Industrial',
  4: 'Components',
  5: 'Final Products',
};

function getTier(resourceType: string): number {
  const tierMap: Record<string, number> = {
    wood: 1, stone: 1, iron: 1, coal: 1, copper_ore: 1, sand: 1, water: 1,
    limestone: 1, crude_oil: 1, clay: 1, lead: 1, sulfur: 1, gold: 1, uranium: 1, thorium: 1,
    lumber: 2, stone_block: 2, iron_ingot: 2, copper_ingot: 2, coal_brick: 2,
    glass_sheet: 2, purified_water: 2, quicklime: 2, charcoal: 2, crude_oil_extract: 2,
    slag: 2, sawdust: 2, wood_plank: 2,
    steel: 3, steel_sheet: 3, steel_pipe: 3, copper_wire: 3, plastic: 3, rubber: 3,
    cement: 3, brick: 3, aluminum_ingot: 3, chemical_resin: 3, fuel_oil: 3,
    sulfuric_acid: 3, lead_ingot: 3, graphite: 3,
    gear: 4, bearing: 4, electric_motor: 4, magnetic_steel: 4, integrated_circuit: 4,
    pcb: 4, pipe_assembly: 4, gearbox: 4, control_unit: 4, battery: 4,
    solar_cell: 4, heat_exchanger: 4, lubricant: 4, coolant: 4, spare_parts: 4, gold_filament: 4,
    factory_machine: 5, basic_electronics: 5, advanced_electronics: 5, food_ration: 5,
    medical_supply: 5, comfort_item: 5, building_block: 5, steel_frame: 5, reinforced_glass: 5,
    basic_fuel_rod: 5, vehicle: 5, transport_truck: 5, basic_tool_set: 5, advanced_tool_set: 5,
  };
  return tierMap[resourceType] || 2;
}

export function ResourceGrid({ resources, storageLimits, storageLevels, favorites = [], onToggleFavorite, title }: ResourceGridProps) {
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [search, setSearch] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [expandedTier, setExpandedTier] = useState<number | null>(null);

  const allFavorites = favorites.length > 0 
    ? favorites 
    : Object.keys(resources).filter(r => (resources[r as number] > 0));

  const filteredResources = Object.entries(RESOURCES).filter(([type]) => {
    if (type === 'money' || type === 'research') return false;
    if (showFavoritesOnly && !allFavorites.includes(type)) return false;
    if (search && !type.toLowerCase().includes(search.toLowerCase()) && 
        !RESOURCES[type as ResourceType]?.label?.toLowerCase().includes(search.toLowerCase())) return false;
    if (tierFilter !== 'all' && getTier(type) !== tierFilter) return false;
    return true;
  });

  const groupedByTier = filteredResources.reduce((acc, [type, info]) => {
    const tier = getTier(type);
    if (!acc[tier]) acc[tier] = [];
    acc[tier].push([type, info]);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-bold">{title}</h3>}
      
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search resources..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-sm focus:outline-none focus:border-zinc-700"
          />
        </div>
        
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm ${
            showFavoritesOnly ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' : 'bg-zinc-900 border border-zinc-800'
          }`}
        >
          <Star className={`w-4 h-4 ${showFavoritesOnly ? 'fill-amber-500' : ''}`} />
          Favorites
        </button>
      </div>

      <div className="flex gap-1 flex-wrap">
        <button
          onClick={() => setTierFilter('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
            tierFilter === 'all' ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
          }`}
        >
          All
        </button>
        {[1, 2, 3, 4, 5].map(tier => (
          <button
            key={tier}
            onClick={() => setTierFilter(tier as TierFilter)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
              tierFilter === tier ? 'text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
            style={{ backgroundColor: tierFilter === tier ? TIER_COLORS[tier] : undefined }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: TIER_COLORS[tier] }} />
            T{tier}
          </button>
        ))}
      </div>

      {tierFilter === 'all' ? (
        <div className="space-y-4">
          {Object.entries(groupedByTier).sort(([a], [b]) => Number(a) - Number(b)).map(([tier, items]) => (
            <div key={tier} className="border border-zinc-800 rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedTier(expandedTier === Number(tier) ? null : Number(tier))}
                className="w-full flex items-center justify-between p-3 bg-zinc-900/50 hover:bg-zinc-900 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: TIER_COLORS[Number(tier)] }} />
                  <span className="font-medium text-sm">{TIER_NAMES[Number(tier)]}</span>
                  <span className="text-xs text-zinc-500">({items.length})</span>
                </div>
                {expandedTier === Number(tier) ? (
                  <ChevronUp className="w-4 h-4 text-zinc-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-zinc-500" />
                )}
              </button>
              {expandedTier === Number(tier) && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-3">
                  {items.map(([type, info]) => {
                    const amount = Number(resources[type as ResourceType]) || 0;
                    const limit = Number(storageLimits[type as ResourceType]) || 1;
                    return (
                      <div key={type} className={`p-2 rounded-lg border ${amount > 0 ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-950 border-zinc-900'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium truncate" style={{ color: info.color }}>{info.label}</span>
                          <div className="flex items-center gap-1">
                            {onUpgradeStorage && (
                              <button 
                                onClick={() => onUpgradeStorage(type as ResourceType)} 
                                className="text-zinc-600 hover:text-blue-500 text-[10px]"
                                title="Upgrade storage"
                              >
                                ⬆
                              </button>
                            )}
                            {onToggleFavorite && (
                              <button onClick={() => onToggleFavorite(type as ResourceType)} className="text-zinc-600 hover:text-amber-500">
                                <Star className={`w-3 h-3 ${allFavorites.includes(type) ? 'fill-amber-500 text-amber-500' : ''}`} />
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="text-lg font-bold">{amount.toLocaleString()}</div>
                        <div className="text-xs text-zinc-500">/ {limit.toLocaleString()}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {filteredResources.map(([type, info]) => {
            const amount = Number(resources[type as ResourceType]) || 0;
            const limit = Number(storageLimits[type as ResourceType]) || 1;
            return (
              <div key={type} className={`p-2 rounded-lg border ${amount > 0 ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-950 border-zinc-900'}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium truncate" style={{ color: info.color }}>{info.label}</span>
                  <div className="flex items-center gap-1">
                    {onUpgradeStorage && (
                      <button 
                        onClick={() => onUpgradeStorage(type as ResourceType)} 
                        className="text-zinc-600 hover:text-blue-500 text-[10px]"
                        title="Upgrade storage"
                      >
                        ⬆
                      </button>
                    )}
                    {onToggleFavorite && (
                      <button onClick={() => onToggleFavorite(type as ResourceType)} className="text-zinc-600 hover:text-amber-500">
                        <Star className={`w-3 h-3 ${allFavorites.includes(type) ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
                <div className="text-lg font-bold">{amount.toLocaleString()}</div>
                <div className="text-xs text-zinc-500">/ {limit.toLocaleString()}</div>
              </div>
            );
          })}
        </div>
      )}

      {filteredResources.length === 0 && (
        <div className="text-center py-8 text-zinc-500">No resources found. Try a different search or filter.</div>
      )}
    </div>
  );
}
