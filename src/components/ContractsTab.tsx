import React from 'react';
import { Contract } from '../types';
import { Package, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

interface ContractsTabProps {
  activeContracts: Contract[];
  availableContracts: Contract[];
  onAccept: (id: string) => void;
  onDeliver: (id: string, amount: number) => void;
}

export function ContractsTab({ activeContracts, availableContracts, onAccept, onDeliver }: ContractsTabProps) {
  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-emerald-500" />
          Active Contracts
        </h2>
        <div className="space-y-4">
          {activeContracts.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-4">No active contracts</p>
          ) : (
            activeContracts.map(contract => (
              <div key={contract.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold capitalize">{contract.resource} Supply</h4>
                  <span className="text-sm font-mono font-bold text-emerald-400">${contract.totalValue.toLocaleString()}</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${(contract.deliveredAmount / contract.totalAmount) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-wider">
                  <span>{contract.deliveredAmount} / {contract.totalAmount} units</span>
                  <span>{Math.round((contract.deliveredAmount / contract.totalAmount) * 100)}%</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Available Contracts
        </h2>
        <div className="space-y-3">
          {availableContracts.map(contract => (
            <div key={contract.id} className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 transition-all">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 capitalize">{contract.resource}</span>
                <span className="text-sm font-mono font-bold text-blue-400">${contract.totalValue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-end">
                <div className="text-xs text-zinc-400">
                  <p>{contract.totalAmount} units required</p>
                </div>
                <button 
                  onClick={() => onAccept(contract.id)}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-zinc-700 transition-all"
                >
                  Accept
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
