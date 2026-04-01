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
  ArrowUp,
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
import { ResourceType, ProductionUnit, MarketItem, AutomationRule, Action, Operator, AutomationCondition, Order, TradeRecord, TruckType, BuildingType } from './types';
import { INITIAL_PRODUCTION_UNITS, RESOURCES, STORAGE_UPGRADE_COST, TECHNOLOGIES, BUILDINGS } from './constants';
import { ResourceGrid } from './components/ResourceGrid';
import { MarketWithSearch } from './components/MarketWithSearch';

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
  const [favorites, setFavorites] = useState<ResourceType[]>([]);
  const toggleFavorite = (type: ResourceType) => {
    setFavorites(prev => prev.includes(type) ? prev.filter(f => f !== type) : [...prev, type]);
  };
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
                <Dashboard state={state} onUpgradeStorage={upgradeStorage} onUpgradeMaxCompanies={upgradeMaxCompanies} onUpgradeMaxAutomations={upgradeMaxAutomations} favorites={favorites} onToggleFavorite={toggleFavorite} />
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
                maxCompanies={state.maxCompanies}
                onStart={startProduction} 
                onToggleAuto={toggleUnitAutomation}
                onUpgrade={upgradeUnit}
                onCreate={createCompany}
                onDelete={deleteCompany}
                onUpgradeMaxCompanies={upgradeMaxCompanies}
              />
            )}
            {activeTab === 'automation' && (
              <Automation 
                rules={state.automationRules} 
                maxAutomations={state.maxAutomations}
                money={state.money}
                onAdd={addAutomationRule} 
                onEdit={editAutomationRule}
                onToggle={toggleAutomationRule} 
                onDelete={deleteAutomationRule}
                onUpgradeMaxAutomations={upgradeMaxAutomations}
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
                storageLevels={state.storageLevels}
                money={state.money}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onUpgradeStorage={upgradeStorage}
                orderBook={state.orderBook}
                onCreateOrder={createOrder}
                onCancelOrder={cancelOrder}
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

function Dashboard({ state, onUpgradeStorage, onUpgradeMaxCompanies, onUpgradeMaxAutomations, favorites, onToggleFavorite }: { state: any, onUpgradeStorage: any, onUpgradeMaxCompanies: any, onUpgradeMaxAutomations: any, favorites?: ResourceType[], onToggleFavorite?: (type: ResourceType) => void }) {
  return (
    <div className="space-y-8">
      <ResourceGrid
        resources={state.resources}
        storageLimits={state.storageLimits}
        storageLevels={state.storageLevels}
        favorites={favorites}
        onToggleFavorite={onToggleFavorite}
        onUpgradeStorage={onUpgradeStorage}
        title="Resources"
      />
    </div>
  );
}

function Production({ units, resources, storageLimits, money, maxCompanies, onStart, onToggleAuto, onUpgrade, onCreate, onDelete, onUpgradeMaxCompanies }: { units: ProductionUnit[], resources: any, storageLimits: any, money: number, maxCompanies: number, onStart: any, onToggleAuto: any, onUpgrade: any, onCreate: any, onDelete: any, onUpgradeMaxCompanies: any }) {
  const upgradeCost = 1000 * maxCompanies;
  return (
    <div className="space-y-6">
      {/* Production Slots & Upgrade */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Factory className="w-5 h-5 text-green-500" />
          </div>
          <div>
            <div className="font-medium">Production Slots</div>
            <div className="text-sm text-zinc-400">{units.length} / {maxCompanies} used</div>
          </div>
        </div>
        <button
          onClick={onUpgradeMaxCompanies}
          disabled={money < upgradeCost}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg text-sm font-medium transition-colors"
        >
          <ArrowUp className="w-4 h-4" />
          +1 Slot (${upgradeCost.toLocaleString()})
        </button>
      </div>

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

function Automation({ rules, maxAutomations, money, onAdd, onEdit, onToggle, onDelete, onUpgradeMaxAutomations }: { rules: AutomationRule[], maxAutomations: number, money: number, onAdd: any, onEdit: any, onToggle: any, onDelete: any, onUpgradeMaxAutomations: any }) {
  const [showForm, setShowForm] = useState(false);
  const [newRule, setNewRule] = useState({ conditions: [] as AutomationCondition[], action: { type: 'produce' as Action, resource: 'logger' as ResourceType, amount: 1 } });
  
  const upgradeCost = 500 * maxAutomations;
  
  return (
    <div className="space-y-6">
      {/* Automation Slots & Upgrade */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <Settings className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Automation Slots</h3>
            <p className="text-xs text-zinc-500">{rules.filter(r => r.isEnabled).length} / {maxAutomations} active</p>
          </div>
        </div>
        <button 
          onClick={onUpgradeMaxAutomations}
          disabled={money < upgradeCost}
          className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-xl text-sm font-bold hover:bg-purple-500/30 disabled:opacity-30"
        >
          Upgrade ({upgradeCost})
        </button>
      </div>
      
      {/* Add Rule Button */}
      <button
        onClick={() => setShowForm(!showForm)}
        className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-sm font-bold hover:bg-white/10"
      >
        + Add Automation Rule
      </button>
      
      {/* Rule Form */}
      {showForm && (
        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 space-y-4">
          <h4 className="font-bold">New Automation Rule</h4>
          <div className="grid grid-cols-2 gap-4">
            <select 
              className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2 text-sm"
              onChange={(e) => setNewRule({ ...newRule, action: { ...newRule.action, type: e.target.value as Action } })}
            >
              <option value="produce">Produce</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
            <select 
              className="bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2 text-sm"
              onChange={(e) => setNewRule({ ...newRule, action: { ...newRule.action, resource: e.target.value as ResourceType } })}
            >
              {INITIAL_PRODUCTION_UNITS.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => { onAdd({ ...newRule, isEnabled: true, isPaused: false }); setShowForm(false); }}
            className="w-full py-3 bg-emerald-500 text-black rounded-xl font-bold"
          >
            Create Rule
          </button>
        </div>
      )}
      
      {/* Rules List */}
      <div className="space-y-3">
        {rules.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 bg-white/5 rounded-2xl border border-white/5">
            No automation rules yet. Create one to automate your production!
          </div>
        ) : (
          rules.map(rule => (
            <div key={rule.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button onClick={() => onToggle(rule.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center ${rule.isEnabled ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>
                  <Settings className="w-5 h-5" />
                </button>
                <div>
                  <div className="font-bold text-sm">{rule.action.type.toUpperCase()} {rule.action.resource}</div>
                  <div className="text-xs text-zinc-500">{rule.conditions.length} conditions</div>
                </div>
              </div>
              <button onClick={() => onDelete(rule.id)} className="p-2 hover:bg-red-500/10 rounded-xl text-zinc-500 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Logistics({ units, totalTrucks, availableTrucks, money, onAssign, onRemove, onBuy, unlockedTechs }: { units: ProductionUnit[], totalTrucks: number, availableTrucks: number, money: number, onAssign: any, onRemove: any, onBuy: any, unlockedTechs: string[] }) {
  const truckTypes = [
    { id: 'basic', name: 'Basic Truck', capacity: 10, speed: 1, cost: 500 },
    { id: 'fast', name: 'Fast Truck', capacity: 5, speed: 2, cost: 1500 },
    { id: 'heavy', name: 'Heavy Truck', capacity: 25, speed: 0.5, cost: 2500 },
  ];
  
  return (
    <div className="space-y-6">
      {/* Truck Status */}
      <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">Fleet Status</h3>
          <div className="text-2xl font-mono font-bold text-emerald-400">{availableTrucks} / {totalTrucks}</div>
        </div>
        <div className="flex gap-2">
          {truckTypes.map(truck => (
            <button
              key={truck.id}
              onClick={() => onBuy(truck.id as TruckType)}
              disabled={money < truck.cost}
              className="flex-1 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 disabled:opacity-30"
            >
              Buy {truck.name} ({truck.cost})
            </button>
          ))}
        </div>
      </div>
      
      {/* Unit Trucks */}
      <div className="space-y-3">
        {units.map(unit => (
          <div key={unit.id} className="bg-white/5 border border-white/5 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold">{unit.name}</h4>
              <div className="flex items-center gap-2">
                <button onClick={() => onRemove(unit.id)} disabled={unit.trucks <= 0} className="w-8 h-8 bg-red-500/10 rounded-lg text-red-500 hover:bg-red-500/20 disabled:opacity-30">-</button>
                <span className="w-8 text-center font-mono">{unit.trucks}</span>
                <button onClick={() => onAssign(unit.id)} disabled={availableTrucks <= 0} className="w-8 h-8 bg-emerald-500/10 rounded-lg text-emerald-500 hover:bg-emerald-500/20 disabled:opacity-30">+</button>
              </div>
            </div>
            <div className="text-xs text-zinc-500">
              Input Buffer: {Object.entries(unit.inputBuffer).filter(([_, v]) => v).map(([k, v]) => `${k}: ${v}`).join(', ') || 'Empty'}
            </div>
            <div className="text-xs text-zinc-500">
              Output Buffer: {unit.outputBuffer[unit.output.type] || 0} / {unit.output.amount * 20}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Research({ dataPoints, unlockedTechs, onUnlock }: { dataPoints: number, unlockedTechs: string[], onUnlock: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <FlaskConical className="w-8 h-8 text-purple-500" />
          <div>
            <h3 className="font-bold text-lg">Data Points</h3>
            <p className="text-2xl font-mono font-bold text-purple-400">{dataPoints}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TECHNOLOGIES.map(tech => {
          const isUnlocked = unlockedTechs.includes(tech.id);
          const canAfford = dataPoints >= tech.cost;
          
          return (
            <div key={tech.id} className={`bg-white/5 border rounded-2xl p-4 ${isUnlocked ? 'border-emerald-500/30' : 'border-white/5'}`}>
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold">{tech.name}</h4>
                {isUnlocked && <span className="text-xs bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded">Unlocked</span>}
              </div>
              <p className="text-xs text-zinc-500 mb-4">{tech.description}</p>
              {!isUnlocked && (
                <button
                  onClick={() => onUnlock(tech.id, tech.cost)}
                  disabled={!canAfford}
                  className="w-full py-2 bg-purple-500 text-black rounded-xl text-xs font-bold hover:bg-purple-400 disabled:opacity-30"
                >
                  Research ({tech.cost} DP)
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BuildingsTab({ state, onBuild, onUpgrade, onDemolish, money }: { state: any, onBuild: any, onUpgrade: any, onDemolish: any, money: number }) {
  const buildingTypes: BuildingType[] = ['house', 'apartment', 'luxury_housing', 'hospital', 'warehouse', 'research_lab'];
  
  return (
    <div className="space-y-6">
      {/* Building Types */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {buildingTypes.map(type => {
          const building = BUILDINGS[type];
          const canAfford = money >= building.baseCost;
          const count = state.buildings?.filter((b: Building) => b.type === type).length || 0;
          
          return (
            <div key={type} className="bg-white/5 border border-white/5 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Building className="w-5 h-5 text-amber-500" />
                <h4 className="font-bold text-sm">{building.name}</h4>
              </div>
              <p className="text-xs text-zinc-500 mb-2">{building.description}</p>
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-3">
                <span>Count: {count}</span>
                <span>Cap: +{building.populationCapacity}</span>
              </div>
              <button
                onClick={() => onBuild(type)}
                disabled={!canAfford}
                className="w-full py-2 bg-amber-500/20 text-amber-400 rounded-xl text-xs font-bold hover:bg-amber-500/30 disabled:opacity-30"
              >
                Build ({building.baseCost})
              </button>
            </div>
          );
        })}
      </div>
      
      {/* Built Buildings */}
      <div className="space-y-3">
        <h3 className="font-bold text-lg">Your Buildings</h3>
        {(!state.buildings || state.buildings.length === 0) ? (
          <div className="text-center py-8 text-zinc-500 bg-white/5 rounded-2xl border border-white/5">
            No buildings yet. Build some to grow your population!
          </div>
        ) : (
          state.buildings.map((building: Building) => (
            <div key={building.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Building className="w-6 h-6 text-amber-500" />
                <div>
                  <h4 className="font-bold">{BUILDINGS[building.type]?.name}</h4>
                  <p className="text-xs text-zinc-500">Level {building.level}</p>
                </div>
              </div>
              <button onClick={() => onDemolish(building.id)} className="p-2 hover:bg-red-500/10 rounded-xl text-zinc-500 hover:text-red-500">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Market({ market, resources, storageLimits, money, storageLevels, favorites, onToggleFavorite, onUpgradeStorage, orderBook, onCreateOrder, onCancelOrder }: { market: Record<ResourceType, MarketItem>, resources: any, storageLimits: any, money: number, storageLevels?: any, favorites?: ResourceType[], onToggleFavorite?: (type: ResourceType) => void, onUpgradeStorage?: (type: ResourceType) => void, orderBook?: Order[], onCreateOrder?: any, onCancelOrder?: any }) {
  return (
    <div className="space-y-8">
      {/* Market with Search & Order Book - only this in Market tab */}
      {orderBook && onCreateOrder && (
        <MarketWithSearch
          market={market}
          resources={resources}
          storageLimits={storageLimits}
          money={money}
          storageLevels={storageLevels}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          onUpgradeStorage={onUpgradeStorage}
          orderBook={orderBook}
          onCreateOrder={onCreateOrder}
          onCancelOrder={onCancelOrder}
        />
      )}
    </div>
  );
}
