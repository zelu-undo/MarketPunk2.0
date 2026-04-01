import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  DollarSign, Settings, TrendingUp, TrendingDown, Factory, ShoppingCart, Zap, 
  Trees, Mountain, Hammer, Layout, Box, Plus, Trash2, Play, Pause, ChevronRight,
  AlertCircle, ArrowUpCircle, ArrowUp, Database, User, LogOut, Info, ArrowRight,
  FlaskConical, Building, Anvil, Cpu, Minus, History, Truck, Search, Droplets,
  Waves, Flame, Circle, Heart, Leaf, Gauge, Cpu as Chip
} from 'lucide-react';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Icon mapping for RESOURCES
export const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  DollarSign, Settings, TrendingUp, TrendingDown, Factory, ShoppingCart, Zap,
  Trees, Mountain, Hammer, Layout, Box, Plus, Trash2, Play, Pause, ChevronRight,
  AlertCircle, ArrowUpCircle, ArrowUp, Database, User, LogOut, Info, ArrowRight,
  FlaskConical, Building, Anvil, Cpu, Minus, History, Truck, Search, Droplets,
  Waves, Flame, Circle, Heart, Leaf, Gauge, Chip
};

export function getIcon(iconName: string) {
  return iconMap[iconName] || Box;
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
