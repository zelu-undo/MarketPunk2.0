import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { 
  DollarSign, 
  Settings, 
  TrendingUp, 
  TrendingDown,
  Factory, 
  ShoppingCart, 
  Zap, 
  Trees, 
  Mountain, 
  Hammer, 
  Layout, 
  Box,
  Plus,
  Trash2,
  Play,
  Pause,
  ChevronRight,
  AlertCircle,
  ArrowUpCircle,
  Database,
  User as UserIcon,
  LogOut,
  Info,
  ArrowRight,
  FlaskConical,
  Building,
  Anvil,
  Cpu,
  Minus,
  History,
  Truck
} from 'lucide-react';
import { useGameLoop } from './useGameLoop';
import { ResourceType, ProductionUnit, MarketItem, AutomationRule, Action, Operator, AutomationCondition, Order, TradeRecord } from './types';
import { INITIAL_PRODUCTION_UNITS, RESOURCES, STORAGE_UPGRADE_COST, TECHNOLOGIES, BUILDINGS } from './constants';

function Shop({ money, unlockedTechs, onOpenModal }: { money: number, unlockedTechs: string[], onOpenModal: (unit: ProductionUnit) => void }) {
  const availableUnits = INITIAL_PRODUCTION_UNITS.filter(unit => {
    const requiredTech = TECHNOLOGIES.find(tech => tech.unlocks.includes(unit.id));
    return !requiredTech || unlockedTechs.includes(requiredTech.id);
  });

  return (
    <div className="space-y-8">
      <div className="bg-purple-500/10 border border-purple-500/20 p-5 rounded-3xl flex gap-4">
        <FlaskConical className="w-6 h-6 text-purple-500 shrink-0" />
        <div className="space-y-1">
          <h4 className="text-xs font-bold text-purple-500 uppercase tracking-widest">Research Required</h4>
          <p className="text-xs text-purple-200/70 leading-relaxed">
            Unlock more advanced production units in the Research tab.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {availableUnits.map((unit) => (
        <div key={unit.id} className="bg-white/5 border border-white/5 rounded-3xl p-6">
          <h3 className="font-bold text-lg mb-2">{unit.name}</h3>
          <p className="text-xs text-zinc-500 mb-4">Energy cost: {unit.energyPerTick}/sec</p>
          <button 
            onClick={() => onOpenModal(unit)}
            disabled={money < unit.upgradeCost}
            className="w-full py-3 bg-emerald-500 text-black rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all disabled:opacity-30"
          >
            Buy for {unit.upgradeCost}
          </button>
        </div>
      ))}
      </div>
    </div>
  );
}

import { cn, formatCurrency, formatNumber } from './lib/utils';
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer,
  YAxis,
  XAxis,
  Tooltip as RechartsTooltip
} from 'recharts';

type Tab = 'dashboard' | 'production' | 'market' | 'automation' | 'shop' | 'logistics' | 'research' | 'leaderboard' | 'buildings';

export default function App() {
  const { 
    state, 
    startProduction, 
    upgradeUnit,
    upgradeStorage,
    upgradeMaxCompanies,
    upgradeMaxAutomations,
    createCompany,
    deleteCompany,
    addAutomationRule, 
    toggleAutomationRule, 
    deleteAutomationRule,
    editAutomationRule,
    toggleUnitAutomation,
    unlockTech,
    createOrder,
    cancelOrder,
    assignTruck,
    removeTruck,
    buyTruck,
    login,
    logout,
    buildBuilding,
    upgradeBuilding,
    demolishBuilding
  } = useGameLoop();

  useEffect(() => {
    if (state.notification) {
      toast.error(state.notification);
    }
  }, [state.notification]);

  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isMarketOpen, setIsMarketOpen] = useState(false);
  const [companyModal, setCompanyModal] = useState<{ isOpen: boolean, unit: ProductionUnit | null }>({ isOpen: false, unit: null });
  const [companyName, setCompanyName] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === 'leaderboard') {
      fetch('/api/leaderboard')
        .then(res => res.json())
        .then(data => setLeaderboard(data))
        .catch(err => console.error('Failed to fetch leaderboard:', err));
    }
  }, [activeTab]);
  const handleCreateCompany = () => {
    if (companyModal.unit) {
      createCompany({ ...companyModal.unit, name: companyName.trim() || companyModal.unit.name });
      setCompanyModal({ isOpen: false, unit: null });
      setCompanyName('');
    }
  };

  const profitPerMinute = useMemo(() => {
    const elapsedMinutes = (Date.now() - state.lastUpdate) / 60000;
    return state.totalProfit / Math.max(1, elapsedMinutes);
  }, [state.totalProfit, state.lastUpdate]);

  if (!state.user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 flex items-center justify-center p-4">
        <Toaster theme="dark" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] mb-4">
              <TrendingUp className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-3xl font-bold tracking-tighter bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              MarketPunk
            </h1>
            <p className="text-zinc-500 text-sm mt-2">The automated industrial revolution.</p>
          </div>

          <div className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1.5 block">Username</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 transition-all"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1.5 block">Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-emerald-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>
            <button 
              onClick={async () => {
                setError(null);
                try {
                  await login(username, password, authMode === 'register');
                } catch (e) {
                  setError(e instanceof Error ? e.message : 'Auth failed');
                }
              }}
              className="w-full bg-emerald-500 text-black py-4 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-emerald-400 active:scale-[0.98] transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)]"
            >
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
            <button 
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="w-full text-zinc-500 text-xs font-medium hover:text-zinc-300 transition-colors"
            >
              {authMode === 'login' ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans selection:bg-emerald-500/30">
      <Toaster theme="dark" />
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <TrendingUp className="w-5 h-5 text-black" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              MarketPunk
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Balance</span>
              <span className="text-xl font-mono font-bold text-emerald-400">
                {formatCurrency(state.money)}
              </span>
            </div>
            <div className="h-8 w-px bg-white/10 hidden sm:block" />
            {/* Data Points Display */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Data Points</span>
              <span className="text-lg font-mono font-bold text-purple-400">
                {state.dataPoints || 60}
              </span>
            </div>
            <div className="h-8 w-px bg-white/10 hidden sm:block" />
            {/* Heat Display */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Heat</span>
              <span className={cn(
                "text-lg font-mono font-bold",
                state.heatLevel > 800 ? "text-red-500" : state.heatLevel > 500 ? "text-orange-400" : "text-cyan-400"
              )}>
                {state.heatLevel || 0}/{state.maxHeat || 1000}
              </span>
            </div>
            <div className="h-8 w-px bg-white/10 hidden sm:block" />
            {/* Population Display */}
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">Population</span>
              <span className={cn(
                "text-lg font-mono font-bold",
                state.populationHappiness < 50 ? "text-red-500" : state.populationHappiness < 70 ? "text-orange-400" : "text-emerald-400"
              )}>
                {Math.floor(state.population || 10)}
              </span>
            </div>
            <div className="h-8 w-px bg-white/10 hidden sm:block" />
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMarketOpen(!isMarketOpen)}
                className="px-4 py-2 bg-white/5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white/10"
              >
                Market
              </button>
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold">{state.user.username}</span>
                <button onClick={logout} className="text-[10px] text-red-500 hover:text-red-400 uppercase font-bold tracking-widest flex items-center gap-1">
                  <LogOut className="w-3 h-3" /> Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 pb-24">
        {/* Navigation */}
        <nav className="flex gap-1 p-1 bg-white/5 rounded-xl mb-8 w-fit overflow-x-auto no-scrollbar">
          {(['dashboard', 'production', 'market', 'automation', 'shop', 'logistics', 'research', 'leaderboard', 'buildings'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 capitalize whitespace-nowrap",
                activeTab === tab 
                  ? "bg-white/10 text-white shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
              )}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'dashboard' && (
              <>
                <Dashboard state={state} onUpgradeStorage={upgradeStorage} onUpgradeMaxCompanies={upgradeMaxCompanies} onUpgradeMaxAutomations={upgradeMaxAutomations} />
                <div className="mt-8 bg-white/5 border border-white/5 rounded-2xl p-6">
                  <h2 className="text-xl font-bold mb-4">Performance</h2>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={state.profitHistory.map((p, i) => ({ profit: p, time: i }))}>
                        <XAxis dataKey="time" hide />
                        <YAxis hide />
                        <RechartsTooltip contentStyle={{ backgroundColor: '#18181b', border: 'none' }} />
                        <Area type="monotone" dataKey="profit" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}
            {activeTab === 'production' && (
              <Production 
                units={state.productionUnits} 
                resources={state.resources} 
                storageLimits={state.storageLimits}
                money={state.money}
                onStart={startProduction} 
                onToggleAuto={toggleUnitAutomation}
                onUpgrade={upgradeUnit}
                onCreate={createCompany}
                onDelete={deleteCompany}
              />
            )}
            {activeTab === 'automation' && (
              <Automation 
                rules={state.automationRules} 
                onAdd={addAutomationRule} 
                onEdit={editAutomationRule}
                onToggle={toggleAutomationRule} 
                onDelete={deleteAutomationRule}
              />
            )}
            {activeTab === 'shop' && (
              <Shop money={state.money} unlockedTechs={state.unlockedTechs} onOpenModal={(unit) => setCompanyModal({ isOpen: true, unit })} />
            )}
            {activeTab === 'logistics' && (
              <Logistics 
                units={state.productionUnits} 
                totalTrucks={state.totalTrucks}
                availableTrucks={state.availableTrucks}
                money={state.money}
                onAssign={assignTruck}
                onRemove={removeTruck}
                onBuy={buyTruck}
                unlockedTechs={state.unlockedTechs}
              />
            )}
            {activeTab === 'research' && (
              <Research 
                dataPoints={state.dataPoints || 60}
                unlockedTechs={state.unlockedTechs}
                onUnlock={unlockTech}
              />
            )}
            {activeTab === 'market' && (
              <Market 
                market={state.market} 
                resources={state.resources} 
                storageLimits={state.storageLimits}
                money={state.money}
              />
            )}
            {activeTab === 'leaderboard' && (
              <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-6">Global Leaderboard</h2>
                <div className="space-y-4">
                  <div className="flex justify-between text-xs text-zinc-500 uppercase tracking-widest font-bold px-4">
                    <span className="w-16">Rank</span>
                    <span className="flex-1">Player</span>
                    <span className="w-32 text-right">Profit</span>
                  </div>
                  {leaderboard.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500">Loading leaderboard...</div>
                  ) : (
                    leaderboard.map((player, index) => (
                      <div key={player.username} className={`flex justify-between items-center p-4 rounded-xl border ${player.username === state.user?.username ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5'}`}>
                        <span className="w-16 font-mono text-zinc-400">#{index + 1}</span>
                        <span className="flex-1 font-bold flex items-center gap-2">
                          {player.username}
                          {player.username.startsWith('Bot') && <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">BOT</span>}
                        </span>
                        <span className="w-32 text-right font-mono text-emerald-400">${Math.floor(player.total_profit || 0).toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
            {activeTab === 'buildings' && (
              <BuildingsTab 
                state={state}
                onBuild={buildBuilding}
                onUpgrade={upgradeBuilding}
                onDemolish={demolishBuilding}
                money={state.money}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Market Side Panel */}
      <AnimatePresence>
        {isMarketOpen && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed top-0 right-0 h-full w-[400px] bg-[#0a0a0a] border-l border-white/10 p-6 z-50 overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Market Terminal</h2>
              <button onClick={() => setIsMarketOpen(false)} className="text-zinc-500 hover:text-white">Close</button>
            </div>
            <MarketOrders 
                orderBook={state.orderBook}
                resources={state.resources}
                onCancelOrder={cancelOrder}
                onCreateOrder={createOrder}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Company Creation Modal */}
      <AnimatePresence>
        {companyModal.isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          >
            <motion.div 
              initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-zinc-900 border border-white/10 p-8 rounded-3xl w-full max-w-md"
            >
              <h2 className="text-2xl font-bold mb-6">Create {companyModal.unit?.name}</h2>
              <input 
                type="text" 
                placeholder="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 mb-6 text-white"
              />
              <div className="flex gap-4">
                <button 
                  onClick={() => setCompanyModal({ isOpen: false, unit: null })}
                  className="flex-1 py-3 bg-zinc-800 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-zinc-700"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateCompany}
                  className="flex-1 py-3 bg-emerald-500 text-black rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-400"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer / Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md py-2 px-4 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
          <div className="flex gap-4">
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> System: Online</span>
            <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Market: Active</span>
          </div>
          <div className="flex gap-4">
             <span className="text-cyan-400">Profit: +{formatCurrency(profitPerMinute)}/min</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Dashboard({ state, onUpgradeStorage, onUpgradeMaxCompanies, onUpgradeMaxAutomations }: { state: any, onUpgradeStorage: any, onUpgradeMaxCompanies: any, onUpgradeMaxAutomations: any }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Resource Overview */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(RESOURCES).map(([type, info]) => {
            if (type === 'money' || type === 'research') return null;
            const amount = Number(state.resources[type as ResourceType]) || 0;
            const limit = Number(state.storageLimits[type as ResourceType]) || 1;
            const level = Number(state.storageLevels[type as ResourceType]) || 1;
            const netFlow = Number(state.netFlow[type as ResourceType]) || 0;
            const Icon = getIcon(info.icon);
            const percentage = Math.min(100, (amount / limit) * 100);
            const barColor = percentage > 90 ? '#ef4444' : percentage > 70 ? '#f59e0b' : info.color;
            const upgradeCost = STORAGE_UPGRADE_COST * level;
            
            return (
              <div key={type} className="group relative bg-white/5 border border-white/5 p-5 rounded-2xl flex flex-col gap-4 hover:bg-white/[0.07] transition-all">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5"><Icon size={16} color={info.color} /></div>
                    <span className="text-sm font-medium text-zinc-300">{info.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-xs font-mono ${netFlow >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {netFlow >= 0 ? '+' : ''}{netFlow.toFixed(1)}/sec
                    </div>
                    <div className="relative group/info">
                      <Info className="w-4 h-4 text-zinc-500 cursor-help" />
                      <div className="absolute bottom-full right-0 mb-2 w-48 bg-zinc-900 border border-white/10 p-2 rounded-lg text-[10px] text-zinc-400 leading-relaxed shadow-xl pointer-events-none z-50 opacity-0 group-hover/info:opacity-100 transition-opacity">
                        {info.description}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${info.color}20`, color: info.color }}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{info.label}</span>
                      <span className={cn("text-xs font-mono font-bold", percentage > 90 ? "text-red-500" : percentage > 70 ? "text-amber-500" : "")}>
                        {formatNumber(amount)} / {formatNumber(limit)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="h-full transition-all duration-500" 
                        style={{ width: `${percentage}%`, backgroundColor: barColor }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Storage Lvl {level}</span>
                  <button 
                    onClick={() => onUpgradeStorage(type)}
                    disabled={state.money < upgradeCost}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-30"
                  >
                    <ArrowUpCircle className="w-3 h-3" /> Upgrade ({formatCurrency(upgradeCost)})
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats / Alerts */}
        <div className="space-y-6">
          <div className="bg-white/5 border border-white/5 p-6 rounded-3xl">
            <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-6 flex items-center gap-2">
              <Database className="w-4 h-4" /> Global Statistics
            </h3>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-400">Total Profit</span>
                <span className="text-lg font-mono font-bold text-emerald-400">{formatCurrency(state.totalProfit)}</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-500 uppercase font-bold">Companies</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-cyan-400">
                      {state.productionUnits.length} / {state.maxCompanies}
                    </span>
                    <button 
                      onClick={onUpgradeMaxCompanies} 
                      className="text-emerald-400 hover:text-emerald-300"
                      title={`Upgrade cost: ${formatCurrency(1000 * state.maxCompanies)}`}
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-zinc-500 uppercase font-bold">Automations</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-purple-400">
                      {state.automationRules.filter((r: any) => r.isEnabled).length} / {state.maxAutomations}
                    </span>
                    <button 
                      onClick={onUpgradeMaxAutomations} 
                      className="text-emerald-400 hover:text-emerald-300"
                      title={`Upgrade cost: ${formatCurrency(500 * state.maxAutomations)}`}
                    >
                      <ArrowUpCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trade History */}
          <div className="bg-white/5 border border-white/5 p-6 rounded-3xl">
            <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-6 flex items-center gap-2">
              <History className="w-4 h-4" /> Recent Trades
            </h3>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {state.tradeHistory && state.tradeHistory.length > 0 ? (
                state.tradeHistory.map((trade: any) => (
                  <div key={trade.id} className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold uppercase",
                        trade.type === 'buy' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {trade.type === 'buy' ? 'BUY' : 'SELL'}
                      </div>
                      <div>
                        <div className="text-xs font-bold">{RESOURCES[trade.resource as ResourceType]?.label || trade.resource}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          {trade.amount} units @ {formatCurrency(trade.price)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn(
                        "text-xs font-mono font-bold",
                        trade.type === 'buy' ? "text-red-400" : "text-emerald-400"
                      )}>
                        {trade.type === 'buy' ? '-' : '+'}{formatCurrency(trade.amount * trade.price)}
                      </div>
                      <div className="text-[10px] text-zinc-600">
                        {new Date(trade.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-zinc-600 text-xs uppercase tracking-widest font-bold">
                  No trade history
                </div>
              )}
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-3xl flex gap-4">
            <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest">Market Alert</h4>
              <p className="text-xs text-amber-200/70 leading-relaxed">
                Bots are actively trading. Prices are fluctuating based on global supply and demand.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Production({ units, resources, storageLimits, money, onStart, onToggleAuto, onUpgrade, onCreate, onDelete }: { units: ProductionUnit[], resources: any, storageLimits: any, money: number, onStart: any, onToggleAuto: any, onUpgrade: any, onCreate: any, onDelete: any }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit) => {
        const canAfford = unit.input.every(input => (Number(unit.inputBuffer[input.type]) || 0) >= (Number(input.amount) || 0));
        const hasGlobalResources = unit.input.every(input => (Number(resources[input.type]) || 0) >= (Number(input.amount) || 0));
        const outputBufferLimit = (Number(unit.output.amount) || 0) * 10;
        const hasStorage = (Number(unit.outputBuffer[unit.output.type]) || 0) + (Number(unit.output.amount) || 0) <= outputBufferLimit;
        const Icon = unit.id === 'sawmill' ? Trees : unit.id === 'mine' ? Mountain : Hammer;

        return (
          <div key={unit.id} className="bg-white/5 border border-white/5 rounded-3xl overflow-hidden flex flex-col group hover:border-white/10 transition-all relative">
            <button 
              onClick={() => onDelete(unit.id)}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-red-500 transition-colors z-10"
              title="Delete Production Unit"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-6 pr-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-zinc-400 group-hover:text-emerald-400 transition-colors">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{unit.name}</h3>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Industrial Lvl {unit.level}</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={() => onToggleAuto(unit.id)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all",
                    unit.isAutomated 
                      ? "bg-purple-500/10 border-purple-500/30 text-purple-400" 
                      : "bg-white/5 border-white/10 text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {unit.isAutomated ? 'Auto On' : 'Manual'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Input</div>
                  <div className="space-y-1">
                    {unit.input.map(input => (
                      <div key={input.type} className="flex justify-between text-xs font-mono">
                        <span className="text-zinc-400">{RESOURCES[input.type]?.label || input.type}</span>
                        <span className={(Number(unit.inputBuffer[input.type]) || 0) >= (Number(input.amount) || 0) ? "text-zinc-200" : "text-red-500"}>
                          {input.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-2">Output</div>
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-zinc-400">{RESOURCES[unit.output.type]?.label || unit.output.type}</span>
                    <span className="text-emerald-400">+{unit.output.amount}</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                  <span>{unit.isProducing ? `Processing... ${unit.currentEfficiency && unit.currentEfficiency < 1 ? `(${(unit.currentEfficiency * 100).toFixed(0)}% Eff)` : ''}` : 'Ready'}</span>
                  <span>{Math.round(unit.progress)}%</span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${unit.progress}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
              </div>

              <button 
                onClick={() => onUpgrade(unit.id)}
                disabled={money < unit.upgradeCost}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-30"
              >
                <ArrowUpCircle className="w-4 h-4" /> Upgrade Unit ({formatCurrency(unit.upgradeCost)})
              </button>
            </div>

            <button
              onClick={() => onStart(unit.id)}
              disabled={unit.isProducing || !canAfford || unit.isAutomated || !hasStorage}
              className={cn(
                "w-full py-5 text-sm font-bold uppercase tracking-widest transition-all",
                unit.isProducing 
                  ? "bg-white/5 text-zinc-500 cursor-not-allowed" 
                  : !canAfford 
                    ? "bg-red-500/10 text-red-500/50 cursor-not-allowed"
                    : !hasStorage
                      ? "bg-amber-500/10 text-amber-500/50 cursor-not-allowed"
                      : "bg-emerald-500 text-black hover:bg-emerald-400 active:scale-[0.98]"
              )}
            >
              {unit.isProducing ? 'Producing...' : !canAfford ? (hasGlobalResources ? 'Assign Trucks' : 'Low Resources') : !hasStorage ? 'Buffer Full' : 'Start Cycle'}
            </button>
          </div>
        );
      })}
      </div>
    </div>
  );
}

function MarketOrders({ orderBook, resources, onCancelOrder, onCreateOrder }: { orderBook: Order[], resources: any, onCancelOrder: any, onCreateOrder: any }) {
  return (
    <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
      <h2 className="text-xl font-bold mb-6">Market Orders</h2>
      
      <div className="space-y-8">
        {/* Create Order Form */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-zinc-400">Create Order</h3>
          <div className="grid grid-cols-2 gap-4">
            <select 
              id="orderType"
              className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500/50"
            >
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
            <select 
              id="orderResource"
              className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500/50"
            >
              {Object.entries(RESOURCES).map(([type, info]) => (
                type !== 'money' && type !== 'research' && <option key={type} value={type}>{info.label}</option>
              ))}
            </select>
          </div>
          <input 
            id="orderAmount"
            type="number"
            placeholder="Amount"
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500/50"
          />
          <input 
            id="orderPrice"
            type="number"
            placeholder="Price"
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500/50"
          />
          <button 
            onClick={() => {
              const type = (document.getElementById('orderType') as HTMLSelectElement).value as 'buy' | 'sell';
              const resource = (document.getElementById('orderResource') as HTMLSelectElement).value as ResourceType;
              const amountInput = (document.getElementById('orderAmount') as HTMLInputElement).value;
              const priceInput = (document.getElementById('orderPrice') as HTMLInputElement).value;
              
              const amount = parseInt(amountInput);
              const price = parseInt(priceInput);

              if (isNaN(amount) || amount <= 0) {
                toast.error("Please enter a valid amount");
                return;
              }
              if (isNaN(price) || price <= 0) {
                toast.error("Please enter a valid price");
                return;
              }

              onCreateOrder(resource, type, amount, price);
              
              // Clear inputs
              (document.getElementById('orderAmount') as HTMLInputElement).value = '';
              (document.getElementById('orderPrice') as HTMLInputElement).value = '';
            }}
            className="w-full py-3 bg-emerald-500 text-black rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all"
          >
            Create Order
          </button>
        </div>

        {/* Active Orders List */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-zinc-400">Active Orders</h3>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">{orderBook.length} Orders</span>
          </div>
          {orderBook.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-sm bg-black/10 rounded-2xl border border-dashed border-white/5">No active orders.</div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {orderBook.map(order => (
                <div key={order.id} className={cn(
                  "flex justify-between items-center rounded-2xl p-4 border transition-all",
                  order.type === 'buy' ? "bg-emerald-500/5 border-emerald-500/20" : "bg-orange-500/5 border-orange-500/20"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center",
                      order.type === 'buy' ? "bg-emerald-500/20 text-emerald-500" : "bg-orange-500/20 text-orange-500"
                    )}>
                      {order.type === 'buy' ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-widest",
                          order.type === 'buy' ? "bg-emerald-500 text-black" : "bg-orange-500 text-black"
                        )}>
                          {order.type}
                        </span>
                        <span className="text-sm font-bold">{order.amount} {RESOURCES[order.resource]?.label || order.resource}</span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        <span className="font-mono">Price: {formatCurrency(order.price)}</span>
                        <span className="mx-2 opacity-30">|</span>
                        <span className="font-mono">Total: {formatCurrency(order.price * order.amount)}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => onCancelOrder(order.id)}
                    className="p-2 rounded-xl hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-all group"
                    title="Cancel Order"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Market({ market, resources, storageLimits, money }: { market: Record<ResourceType, MarketItem>, resources: any, storageLimits: any, money: number }) {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {Object.entries(market).map(([type, item]) => {
          if (type === 'money' || type === 'research') return null;
          const info = RESOURCES[type as ResourceType];
          if (!info) return null; // Skip if resource info is missing
          const Icon = getIcon(info.icon);
          const currentPrice = item.price;
          const prevPrice = item.history[item.history.length - 2]?.price || currentPrice;
          const isUp = currentPrice >= prevPrice;
          const hasStorage = resources[type as ResourceType] < storageLimits[type as ResourceType];

          return (
            <div key={type} className="bg-white/5 border border-white/5 rounded-3xl p-6 flex flex-col gap-8 hover:border-white/10 transition-all">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${info.color}20`, color: info.color }}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl">{info.label}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-mono font-bold">{formatCurrency(currentPrice)}</span>
                      <div className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
                        isUp ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                      )}>
                        {isUp ? '▲' : '▼'} {Math.abs(((currentPrice - prevPrice) / prevPrice) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        <TrendingUp className="w-3 h-3 text-emerald-500" /> Demand: {item.demand.toFixed(0)}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                        <TrendingDown className="w-3 h-3 text-red-500" /> Supply: {item.supply.toFixed(0)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="h-20 w-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={item.history}>
                      <defs>
                        <linearGradient id={`color-${type}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity={0.3}/>
                          <stop offset="95%" stopColor={isUp ? "#10b981" : "#ef4444"} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke={isUp ? "#10b981" : "#ef4444"} 
                        fillOpacity={1} 
                        fill={`url(#color-${type})`} 
                        strokeWidth={2} 
                        isAnimationActive={false}
                      />
                      <RechartsTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-zinc-900 border border-white/10 p-2 rounded-lg text-[10px] font-mono">
                                {formatCurrency(payload[0].value as number)}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                    <span>Inventory</span>
                    <span>{formatNumber(resources[type as ResourceType])}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold text-center py-2 bg-white/5 rounded-xl border border-white/5">
                    Use Order Book to Trade
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                    <span>Storage Space</span>
                    <span>{formatNumber(storageLimits[type as ResourceType] - resources[type as ResourceType])}</span>
                  </div>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold text-center py-2 bg-white/5 rounded-xl border border-white/5">
                    Dynamic Pricing
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Automation({ rules, onAdd, onEdit, onToggle, onDelete }: { rules: AutomationRule[], onAdd: any, onEdit: any, onToggle: any, onDelete: any }) {
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [conditions, setConditions] = useState<AutomationCondition[]>([
    { resource: 'money', operator: '>', value: 1000 }
  ]);
  const [action, setAction] = useState({ type: 'buy' as Action, resource: 'wood' as ResourceType, amount: 10 });

  useEffect(() => {
    if (editingRule) {
      setConditions(editingRule.conditions);
      setAction(editingRule.action);
    } else {
      setConditions([{ resource: 'money', operator: '>', value: 1000 }]);
      setAction({ type: 'buy', resource: 'wood', amount: 10 });
    }
  }, [editingRule]);

  const addCondition = () => {
    setConditions([...conditions, { resource: 'wood', operator: '<', value: 50 }]);
  };

  const removeCondition = (index: number) => {
    if (conditions.length > 1) {
      setConditions(conditions.filter((_, i) => i !== index));
    }
  };

  const updateCondition = (index: number, field: keyof AutomationCondition, value: any) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    setConditions(newConditions);
  };

  const handleSave = () => {
    if (editingRule) {
      onEdit({ ...editingRule, conditions, action });
      setEditingRule(null);
    } else {
      onAdd({ conditions, action, isEnabled: true });
    }
    setConditions([{ resource: 'money', operator: '>', value: 1000 }]);
    setAction({ type: 'buy', resource: 'wood', amount: 10 });
  };

  return (
    <div className="space-y-8">
      {/* Add Rule Form */}
      <div className="bg-white/5 border border-white/5 rounded-3xl p-8">
        <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold mb-8 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Advanced Automation Logic
        </h3>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Conditions (ALL must be met)</div>
            {conditions.map((condition, idx) => (
              <div key={idx} className="flex flex-wrap items-center gap-3">
                <span className="text-zinc-500 text-sm font-medium w-6">{idx === 0 ? 'IF' : 'AND'}</span>
                <select 
                  className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500/50"
                  value={condition.resource}
                  onChange={(e) => updateCondition(idx, 'resource', e.target.value as ResourceType)}
                >
                  {Object.entries(RESOURCES).map(([type, info]) => (
                    <option key={type} value={type}>{info.label}</option>
                  ))}
                </select>
                <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-bold uppercase">
                  <input 
                    type="checkbox" 
                    checked={!!condition.isMarketCondition}
                    onChange={(e) => updateCondition(idx, 'isMarketCondition', e.target.checked)}
                  />
                  Market Price
                </div>
                <select 
                  className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500/50"
                  value={condition.operator}
                  onChange={(e) => updateCondition(idx, 'operator', e.target.value as Operator)}
                >
                  <option value=">">{'>'}</option>
                  <option value="<">{'<'}</option>
                  <option value="==">{'='}</option>
                </select>
                <input 
                  type="number" 
                  className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2 text-sm w-28 outline-none focus:border-emerald-500/50"
                  value={condition.value}
                  onChange={(e) => updateCondition(idx, 'value', parseInt(e.target.value) || 0)}
                />
                {conditions.length > 1 && (
                  <button onClick={() => removeCondition(idx)} className="p-2 text-zinc-500 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button 
              onClick={addCondition}
              className="flex items-center gap-2 text-xs text-emerald-500 font-bold uppercase tracking-widest hover:text-emerald-400 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Condition
            </button>
          </div>

          <div className="h-px bg-white/5" />

          <div className="space-y-4">
            <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Action</div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-zinc-500 text-sm font-medium w-6">THEN</span>
              <select 
                className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500/50"
                value={action.type}
                onChange={(e) => setAction({ ...action, type: e.target.value as Action })}
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
              <input 
                type="number" 
                className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2 text-sm w-28 outline-none focus:border-emerald-500/50"
                value={action.amount}
                onChange={(e) => setAction({ ...action, amount: parseInt(e.target.value) || 0 })}
              />
              <select 
                className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2 text-sm outline-none focus:border-emerald-500/50"
                value={action.resource}
                onChange={(e) => setAction({ ...action, resource: e.target.value as ResourceType })}
              >
                {Object.entries(RESOURCES).map(([type, info]) => (
                  type !== 'money' && <option key={type} value={type}>{info.label}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            onClick={handleSave}
            className="w-full bg-emerald-500 text-black py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all shadow-[0_10px_20px_rgba(16,185,129,0.1)]"
          >
            {editingRule ? 'Update Automation Rule' : 'Deploy Automation Rule'}
          </button>
          {editingRule && (
            <button 
              onClick={() => setEditingRule(null)}
              className="w-full bg-white/5 text-zinc-500 py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        <h3 className="text-xs uppercase tracking-widest text-zinc-500 font-bold">Operational Rules</h3>
        {rules.length === 0 ? (
          <div className="bg-white/5 border border-dashed border-white/10 rounded-3xl p-16 text-center">
            <Settings className="w-10 h-10 text-zinc-800 mx-auto mb-4" />
            <p className="text-zinc-500 text-sm">No automation rules active. Your company is running manually.</p>
          </div>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="bg-white/5 border border-white/5 rounded-2xl p-5 flex items-center justify-between group hover:border-white/10 transition-all">
              <div className="flex items-center gap-5">
                <div className={cn(
                  "w-2.5 h-2.5 rounded-full",
                  rule.isEnabled ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" : "bg-zinc-800"
                )} />
                <div className="text-sm leading-relaxed">
                  <span className="text-zinc-500">IF</span>{' '}
                  {rule.conditions.map((c, i) => (
                    <span key={i}>
                      {i > 0 && <span className="text-zinc-500 mx-1">AND</span>}
                      <span className="font-mono text-zinc-200">
                        {c.isMarketCondition ? `${RESOURCES[c.resource]?.label || c.resource} Price` : (RESOURCES[c.resource]?.label || c.resource)}{' '}
                        {c.operator} {c.value}
                      </span>
                    </span>
                  ))}
                  <span className="text-zinc-500 mx-2">THEN</span>
                  <span className="font-mono text-emerald-400 capitalize">
                    {rule.action.type} {rule.action.amount > 0 ? rule.action.amount : ''} {
                      rule.action.type === 'produce' 
                        ? (INITIAL_PRODUCTION_UNITS.find(u => u.id === rule.action.resource)?.name || rule.action.resource)
                        : (RESOURCES[rule.action.resource]?.label || rule.action.resource)
                    }
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => setEditingRule(rule)}
                  className="p-2.5 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => onToggle(rule.id)}
                  className="p-2.5 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-all"
                >
                  {rule.isEnabled ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => onDelete(rule.id)}
                  className="p-2.5 rounded-xl hover:bg-red-500/10 text-zinc-500 hover:text-red-500 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Logistics({ units, totalTrucks, availableTrucks, money, onAssign, onRemove, onBuy, unlockedTechs }: { units: ProductionUnit[], totalTrucks: number, availableTrucks: number, money: number, onAssign: any, onRemove: any, onBuy: any, unlockedTechs: string[] }) {
  const truckCost = 2000;
  const hasSpeedTech = unlockedTechs.includes('tech_truck_speed');
  const hasCapacityTech = unlockedTechs.includes('tech_truck_capacity');
  const speed = hasSpeedTech ? "High (1.5x)" : "Standard";
  const capacity = hasCapacityTech ? "Double (2x)" : "Standard";
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/5 border border-white/5 rounded-3xl p-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Logistics Fleet</h2>
          <p className="text-zinc-500 text-sm">Manage transport trucks to move resources between factories and storage.</p>
          <div className="flex gap-4 mt-4">
            <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mr-2">Speed:</span>
              <span className={cn("text-xs font-mono font-bold", hasSpeedTech ? "text-cyan-400" : "text-zinc-400")}>{speed}</span>
            </div>
            <div className="bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mr-2">Capacity:</span>
              <span className={cn("text-xs font-mono font-bold", hasCapacityTech ? "text-purple-400" : "text-zinc-400")}>{capacity}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Available Trucks</div>
            <div className="text-3xl font-mono font-bold text-emerald-400">{availableTrucks} <span className="text-zinc-500 text-lg">/ {totalTrucks}</span></div>
          </div>
          <button 
            onClick={onBuy}
            disabled={money < truckCost}
            className="px-6 py-3 bg-emerald-500 text-black rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-emerald-400 transition-all disabled:opacity-30"
          >
            Buy Truck ({formatCurrency(truckCost)})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {units.map((unit) => (
          <div key={unit.id} className="bg-white/5 border border-white/5 rounded-3xl p-6 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-bold text-lg">{unit.name}</h3>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Assigned Trucks: {unit.trucks}</div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onRemove(unit.id)}
                  disabled={unit.trucks <= 0}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
                >
                  -
                </button>
                <button 
                  onClick={() => onAssign(unit.id)}
                  disabled={availableTrucks <= 0}
                  className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 hover:bg-emerald-500/20 disabled:opacity-30 transition-all"
                >
                  +
                </button>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Input Buffer</div>
                <div className="space-y-2">
                  {unit.input.map(input => (
                    <div key={input.type} className="flex justify-between items-center bg-black/20 rounded-lg p-2">
                      <span className="text-xs font-medium text-zinc-300">{RESOURCES[input.type]?.label || input.type}</span>
                      <span className="text-xs font-mono text-zinc-500">{formatNumber(unit.inputBuffer[input.type] || 0)} / {input.amount * 5}</span>
                    </div>
                  ))}
                  {unit.input.length === 0 && <div className="text-xs text-zinc-600 italic">No inputs required</div>}
                </div>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Output Buffer</div>
                <div className="flex justify-between items-center bg-black/20 rounded-lg p-2">
                  <span className="text-xs font-medium text-zinc-300">{RESOURCES[unit.output.type]?.label || unit.output.type}</span>
                  <span className="text-xs font-mono text-zinc-500">{formatNumber(unit.outputBuffer[unit.output.type] || 0)} / {unit.output.amount * 10}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function getIcon(name: string) {
  const icons: Record<string, any> = {
    DollarSign, Zap, Trees, Mountain, Hammer, Layout, Box, FlaskConical, Building, Anvil, Cpu, Truck
  };
  return icons[name] || DollarSign;
}


function Research({ dataPoints, unlockedTechs, onUnlock }: { dataPoints: number, unlockedTechs: string[], onUnlock: any }) {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-white/5 border border-white/5 rounded-3xl p-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Research & Development</h2>
          <p className="text-zinc-500 text-sm">Unlock new technologies to expand your production capabilities.</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Data Points</div>
          <div className="text-3xl font-mono font-bold text-[#a855f7]">{formatNumber(dataPoints)}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TECHNOLOGIES.map((tech) => {
          const isUnlocked = unlockedTechs.includes(tech.id);
          const canUnlock = tech.requirements.every(req => unlockedTechs.includes(req));
          const Icon = getIcon(tech.icon);

          return (
            <div 
              key={tech.id} 
              className={cn(
                "bg-white/5 border rounded-3xl p-6 flex flex-col gap-6 transition-all",
                isUnlocked ? "border-[#a855f7]/50 shadow-[0_0_30px_rgba(168,85,247,0.1)]" : "border-white/5",
                !isUnlocked && !canUnlock ? "opacity-50 grayscale" : ""
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center",
                  isUnlocked ? "bg-[#a855f7]/20 text-[#a855f7]" : "bg-white/10 text-zinc-400"
                )}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{tech.name}</h3>
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">
                    {isUnlocked ? 'Unlocked' : canUnlock ? 'Available' : 'Locked'}
                  </div>
                </div>
              </div>

              <p className="text-sm text-zinc-400 flex-1">{tech.description}</p>

              {tech.requirements.length > 0 && (
                <div className="space-y-2">
                  <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Requires</div>
                  <div className="flex flex-wrap gap-2">
                    {tech.requirements.map(req => {
                      const reqTech = TECHNOLOGIES.find(t => t.id === req);
                      const reqUnlocked = unlockedTechs.includes(req);
                      return (
                        <span key={req} className={cn(
                          "text-[10px] px-2 py-1 rounded-md font-bold uppercase tracking-widest",
                          reqUnlocked ? "bg-[#a855f7]/10 text-[#a855f7]" : "bg-red-500/10 text-red-500"
                        )}>
                          {reqTech?.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              <button
                onClick={() => onUnlock(tech.id, tech.cost)}
                disabled={isUnlocked || !canUnlock || dataPoints < tech.cost}
                className={cn(
                  "w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all",
                  isUnlocked 
                    ? "bg-white/5 text-zinc-500 cursor-not-allowed" 
                    : !canUnlock 
                      ? "bg-white/5 text-zinc-500 cursor-not-allowed"
                      : dataPoints < tech.cost
                        ? "bg-red-500/10 text-red-500/50 cursor-not-allowed"
                        : "bg-[#a855f7] text-white hover:bg-[#9333ea] active:scale-[0.98] shadow-[0_10px_20px_rgba(168,85,247,0.2)]"
                )}
              >
                {isUnlocked ? 'Researched' : `Research (${formatNumber(tech.cost)} DP)`}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Buildings Tab Component
function BuildingsTab({ state, onBuild, onUpgrade, onDemolish, money }: {
  state: any,
  onBuild: (type: string) => void,
  onUpgrade: (id: string) => void,
  onDemolish: (id: string) => void,
  money: number
}) {
  const buildingTypes = Object.keys(BUILDINGS) as any[];
  
  // Calculate total population capacity from buildings
  const totalPopulation = state.buildings.reduce((sum: number, b: any) => sum + (b.populationCapacity || 0), 0);
  const totalHappiness = state.buildings.reduce((sum: number, b: any) => sum + (b.happinessBonus || 0), 0);
  
  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Total Buildings</div>
          <div className="text-3xl font-mono font-bold text-emerald-400">{state.buildings.length}</div>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Population Capacity</div>
          <div className="text-3xl font-mono font-bold text-cyan-400">{totalPopulation}</div>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Happiness Bonus</div>
          <div className="text-3xl font-mono font-bold text-purple-400">+{totalHappiness}%</div>
        </div>
        <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
          <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2">Current Population</div>
          <div className="text-3xl font-mono font-bold text-amber-400">{Math.floor(state.population || 0)}</div>
        </div>
      </div>

      {/* Build New Building */}
      <div className="bg-white/5 border border-white/5 rounded-3xl p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Building className="w-5 h-5 text-emerald-400" />
          Construct Building
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {buildingTypes.map((type) => {
            const building = BUILDINGS[type];
            return (
              <button
                key={type}
                onClick={() => onBuild(type)}
                disabled={money < building.baseCost}
                className="bg-black/20 border border-white/10 rounded-2xl p-4 hover:border-emerald-500/30 hover:bg-emerald-500/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-left"
              >
                <div className="text-sm font-bold text-zinc-200 mb-1">{building.name}</div>
                <div className="text-xs text-zinc-500 mb-2">Pop: +{building.populationCapacity}</div>
                <div className="text-xs text-emerald-400 font-mono">{formatCurrency(building.baseCost)}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Existing Buildings */}
      {state.buildings.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.buildings.map((building: any) => {
            const config = BUILDINGS[building.type];
            return (
              <div key={building.id} className="bg-white/5 border border-white/5 rounded-3xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-lg">{building.name}</h4>
                    <div className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">Level {building.level}</div>
                  </div>
                  <button
                    onClick={() => onDemolish(building.id)}
                    className="p-2 text-zinc-500 hover:text-red-500 transition-colors"
                    title="Demolish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Population Capacity</span>
                    <span className="text-cyan-400 font-mono">+{Math.floor(building.populationCapacity)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Happiness Bonus</span>
                    <span className="text-purple-400 font-mono">+{Math.floor(building.happinessBonus)}%</span>
                  </div>
                </div>

                <button
                  onClick={() => onUpgrade(building.id)}
                  disabled={money < building.upgradeCost}
                  className="w-full py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-emerald-500/20 disabled:opacity-30 transition-all"
                >
                  Upgrade ({formatCurrency(building.upgradeCost)})
                </button>
              </div>
            );
          })}
        </div>
      )}

      {state.buildings.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          <Building className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No buildings constructed yet.</p>
          <p className="text-xs mt-2">Build houses to increase your population!</p>
        </div>
      )}
    </div>
  );
}
