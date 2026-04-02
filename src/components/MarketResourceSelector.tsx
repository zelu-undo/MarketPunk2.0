import React from 'react';
import { ResourceType } from '../types';
import { RESOURCES_CONFIG } from '../config/resources';
import { cn } from '../lib/utils';

interface MarketResourceSelectorProps {
  selected: ResourceType | 'all';
  onSelect: (type: ResourceType | 'all') => void;
}

export function MarketResourceSelector({ selected, onSelect }: MarketResourceSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <button
        onClick={() => onSelect('all')}
        className={cn(
          "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
          selected === 'all' 
            ? "bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20" 
            : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
        )}
      >
        All
      </button>
      {(Object.keys(RESOURCES_CONFIG) as ResourceType[]).map((type) => (
        <button
          key={type}
          onClick={() => onSelect(type)}
          className={cn(
            "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border",
            selected === type 
              ? "bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20" 
              : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
          )}
        >
          {RESOURCES_CONFIG[type].name}
        </button>
      ))}
    </div>
  );
}
