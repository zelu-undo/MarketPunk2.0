import React from 'react';
import { ResourceState } from '../types';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface ResourceGridProps {
  resources: ResourceState[];
}

export function ResourceGrid({ resources }: ResourceGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {resources.map((resource) => (
        <div 
          key={resource.resourceType}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold capitalize text-zinc-100">{resource.resourceType}</h3>
              <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">Resource Node</p>
            </div>
            <div className={cn(
              "px-2 py-1 rounded text-xs font-bold flex items-center gap-1",
              resource.trend >= 0 ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
            )}>
              {resource.trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(resource.trend).toFixed(1)}%
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Current Price</p>
              <p className="text-xl font-mono font-bold text-blue-400">${resource.price}</p>
            </div>
            <div className="bg-zinc-950/50 p-3 rounded-xl border border-zinc-800/50">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Global Stock</p>
              <p className="text-xl font-mono font-bold text-zinc-100">{resource.stockGlobal.toLocaleString()}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
