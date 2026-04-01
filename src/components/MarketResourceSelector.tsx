import { useState, useRef, useEffect } from 'react';
import { RESOURCES } from '../constants';
import { ResourceType } from '../types';
import { X } from 'lucide-react';

interface SearchableSelectProps {
  value: string;
  onChange: (value: ResourceType) => void;
  placeholder?: string;
  exclude?: string[];
}

export function SearchableSelect({ value, onChange, placeholder = 'Select...', exclude = [] }: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredResources = Object.entries(RESOURCES).filter(([type, info]) => {
    if (type === 'money' || type === 'research') return false;
    if (exclude.includes(type)) return false;
    if (search.length >= 2 && !type.toLowerCase().includes(search.toLowerCase()) &&
        !info.label?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const selectedInfo = value ? RESOURCES[value as ResourceType] : null;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex">
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={selectedInfo?.label || placeholder}
          className="flex-1 bg-[#1a1a1a] border border-white/10 rounded-l-xl px-4 py-2 text-sm outline-none focus:border-emerald-500/50"
        />
        {selectedInfo && (
          <button
            onClick={() => {
              onChange('' as ResourceType);
              setSearch('');
            }}
            className="px-2 bg-zinc-800 border border-l-0 border-white/10 rounded-r-xl hover:bg-zinc-700"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && filteredResources.length > 0 && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl">
          {filteredResources.slice(0, 50).map(([type, info]) => (
            <button
              key={type}
              onClick={() => {
                onChange(type as ResourceType);
                setSearch('');
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-emerald-500/20 border-b border-white/5"
            >
              <span style={{ color: info.color }}>{info.label}</span>
            </button>
          ))}
          {filteredResources.length > 50 && (
            <div className="px-4 py-2 text-xs text-zinc-500">
              {filteredResources.length} more... (type to refine)
            </div>
          )}
        </div>
      )}
    </div>
  );
}