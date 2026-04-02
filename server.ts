import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";
import { EconomicController } from "./src/systems/ecs.ts";
import { RESOURCES } from "./src/constants.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "marketpunk-secret-key";
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// Debug log
console.log('SUPABASE_URL:', SUPABASE_URL ? 'set' : 'not set');
console.log('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'not set');

const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

if (!supabase) {
  console.log('WARNING: Supabase not configured, using in-memory storage');
}

/**
 * Supabase SQL Schema:
 * 
 * CREATE TABLE market_state (
 *   resource_type TEXT PRIMARY KEY,
 *   price FLOAT8 NOT NULL,
 *   demand FLOAT8 NOT NULL,
 *   supply FLOAT8 NOT NULL,
 *   history JSONB DEFAULT '[]'::jsonb,
 *   updated_at TIMESTAMPTZ DEFAULT NOW()
 * );
 * 
 * -- Enable RLS
 * ALTER TABLE market_state ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Public Read" ON market_state FOR SELECT USING (true);
 */

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// In-memory store for demo (synced with Supabase if configured)
let activeUsers = 0;
const users: any[] = []; // In-memory user store for demo
let globalOrderBook: any[] = [];
let globalTradeHistory: any[] = [];
let staticSyncCounter = 0; // Counter for periodic sync to Supabase

// Initialize marketState with ALL resources from constants
let marketState: any = {};
Object.keys(RESOURCES).forEach(res => {
  marketState[res] = { price: 10, demand: 100, supply: 100, history: [] };
});

// Set some initial prices for common resources
if (marketState.wood) marketState.wood.price = 10;
if (marketState.stone) marketState.stone.price = 15;
if (marketState.iron) marketState.iron.price = 25;
if (marketState.planks) marketState.planks.price = 40;
if (marketState.iron_bars) marketState.iron_bars.price = 120;
if (marketState.energy) marketState.energy.price = 5;
if (marketState.concrete) marketState.concrete.price = 150;
if (marketState.steel) marketState.steel.price = 300;
if (marketState.electronics) marketState.electronics.price = 500;

// Initialize market from Supabase if keys are present
let ecs: EconomicController = new EconomicController(Object.keys(RESOURCES));

async function initMarket() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('market_state').select('*');
      if (error) {
        console.error('Error loading market from Supabase:', error);
      } else if (data && data.length > 0) {
        data.forEach(item => {
          marketState[item.id] = {
            price: item.price,
            demand: item.demand,
            supply: item.supply,
            history: item.history || [],
            base_price: item.base_price,
            volatility: item.volatility
          };
        });
        console.log('Market state loaded from Supabase:', Object.keys(marketState));
        
        // Recreate ECS with loaded market state
        ecs = new EconomicController(Object.keys(marketState) as any[]);
      } else {
        console.log('No market state in Supabase, using defaults');
      }
    } catch (err) {
      console.error('Failed to init market:', err);
    }
  }
}
initMarket();

// Auth Routes
app.post("/api/auth/register", async (req, res) => {
  const { username, password } = req.body;
  
  if (supabase) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: `${username}@marketpunk.local`,
      password: password,
      email_confirm: true,
      user_metadata: { username }
    });
    if (error) {
      const message = error.message.includes("email address has already been registered") 
        ? "Username already taken" 
        : error.message;
      return res.status(400).json({ message });
    }
    const token = jwt.sign({ username, id: data.user.id }, JWT_SECRET);
    res.json({ username, token });
  } else {
    // Fallback for local demo
    if (users.find(u => u.username === username)) {
      return res.status(400).json({ message: "User already exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { id: Math.random().toString(36).substr(2, 9), username, password: hashedPassword };
    users.push(user);
    console.log(`User registered: ${username}`);
    const token = jwt.sign({ username, id: user.id }, JWT_SECRET);
    res.json({ username, token });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { username, password } = req.body;
  console.log(`Login attempt: ${username}, supabase: ${!!supabase}`);

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${username}@marketpunk.local`,
        password: password
      });
      if (error) {
        console.log(`Login failed for ${username}: ${error.message}`);
        return res.status(401).json({ message: error.message });
      }
      activeUsers++;
      
      // Buscar money do usuário no game_states
      let money = 1000; // Default
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .single();
      
      if (profile) {
        const { data: gameState } = await supabase
          .from('game_states')
          .select('money')
          .eq('user_id', profile.id)
          .single();
        
        if (gameState) {
          money = gameState.money;
        }
      }
      
      const token = jwt.sign({ username, id: data.user.id }, JWT_SECRET);
      res.json({ username, money, token });
    } catch (err: any) {
      console.error('Login error:', err.message);
      res.status(500).json({ message: "Server error: " + err.message });
    }
  } else {
    // Fallback for local demo
    const user = users.find(u => u.username === username);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      console.log(`Login failed for ${username}: Invalid credentials`);
      return res.status(401).json({ message: "Invalid username or password" });
    }
    console.log(`Login successful: ${username}`);
    activeUsers++;
    const token = jwt.sign({ username, id: user.id }, JWT_SECRET);
    res.json({ username, token });
  }
});

app.post("/api/auth/logout", (req, res) => {
  activeUsers = Math.max(0, activeUsers - 1);
  res.json({ success: true });
});

// Market Routes
app.get("/api/market", (req, res) => {
  // Merge ecs state into market state
  const enrichedMarketState: any = {};
  for (const [key, value] of Object.entries(marketState)) {
    const ecsState = ecs.resources.get(key as any);
    enrichedMarketState[key] = {
      ...value as any,
      ecsState: ecsState?.state || 'balanced'
    };
  }

  res.json({
    market: enrichedMarketState,
    orderBook: globalOrderBook,
    tradeHistory: globalTradeHistory.slice(0, 50)
  });
});

app.post("/api/market/order", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });
  
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const { resource, type, amount, price } = req.body;

    if (!marketState[resource]) return res.status(400).json({ error: "Invalid resource" });
    if (isNaN(amount) || isNaN(price) || amount <= 0 || price <= 0) return res.status(400).json({ error: "Invalid amount or price" });

    const order = {
      id: Math.random().toString(36).substr(2, 9),
      username: decoded.username,
      type: type, // 'buy' or 'sell'
      resource: resource,
      amount: Math.floor(amount),
      price: Math.round(price),
      timestamp: Date.now()
    };

    globalOrderBook.push(order);
    console.log(`Order placed by ${decoded.username}: ${type} ${amount} ${resource} @ ${price}`);
    res.json({ success: true, order });
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.delete("/api/market/order/:id", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const orderId = req.params.id;

    const orderIndex = globalOrderBook.findIndex(o => o.id === orderId && o.username === decoded.username);
    if (orderIndex === -1) return res.status(404).json({ error: "Order not found or unauthorized" });

    const removedOrder = globalOrderBook.splice(orderIndex, 1)[0];
    res.json({ success: true, order: removedOrder });
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.get("/api/market/user-trades", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const userTrades = globalTradeHistory.filter(t => t.buyer === decoded.username || t.seller === decoded.username);
    res.json(userTrades);
  } catch (e) {
    res.status(401).json({ message: "Invalid token" });
  }
});

app.get("/api/market/contracts", (req, res) => {
  const activeContracts = Array.from(ecs.contracts.values()).filter(c => c.status === 'active');
  res.json(activeContracts);
});

app.post("/api/market/contracts/:id/accept", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });
  
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const contractId = req.params.id;
    
    const contract = ecs.contracts.get(contractId);
    if (!contract) return res.status(404).json({ error: "Contract not found" });
    if (contract.status !== 'active') return res.status(400).json({ error: "Contract is not active" });
    if (contract.assignedPlayerId) return res.status(400).json({ error: "Contract already assigned" });
    
    // Check if player has too many contracts
    const playerContracts = Array.from(ecs.contracts.values()).filter(c => c.assignedPlayerId === decoded.username && (c.status === 'active' || c.status === 'completed'));
    if (playerContracts.length >= ecs.config.maxContractsPerPlayer) {
      return res.status(400).json({ error: "Maximum contracts reached" });
    }

    contract.assignedPlayerId = decoded.username;
    
    let payment = 0;
    if (contract.paymentType === 'upfront') {
      payment = contract.totalValue * 0.8; // 80% upfront
    }

    if (payment > 0 && supabase) {
      // Buscar o user_id pelo username na tabela profiles
      supabase.from('profiles')
        .select('id')
        .eq('username', decoded.username)
        .single()
        .then(({ data: profile }) => {
          if (profile) {
            supabase.from('game_states')
              .select('money')
              .eq('user_id', profile.id)
              .single()
              .then(({ data: gameState }) => {
                if (gameState) {
                  supabase.from('game_states')
                    .update({ money: gameState.money + payment })
                    .eq('user_id', profile.id)
                    .then(({ error }) => {
                      if (error) console.error('Failed to pay player upfront:', error);
                    });
                }
              });
          }
        });
    }

    res.json({ success: true, contract, payment });
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.post("/api/market/contracts/:id/deliver", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Unauthorized" });
  
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const contractId = req.params.id;
    const { amount } = req.body;
    
    const contract = ecs.contracts.get(contractId);
    if (!contract) return res.status(404).json({ error: "Contract not found" });
    if (contract.status !== 'active') return res.status(400).json({ error: "Contract is not active" });
    if (contract.assignedPlayerId !== decoded.username) return res.status(403).json({ error: "Contract not assigned to you" });
    
    if (amount <= 0) return res.status(400).json({ error: "Invalid amount" });

    const remainingNeeded = contract.totalAmount - contract.deliveredAmount;
    const actualAmount = Math.min(amount, remainingNeeded);
    
    if (actualAmount <= 0) return res.status(400).json({ error: "Contract already fulfilled or invalid amount" });

    // In a real implementation, we would deduct the resources from the player's inventory here.
    // For now, we just update the contract.
    contract.deliveredAmount += actualAmount;
    
    let payment = 0;
    if (contract.paymentType === 'per_delivery') {
      payment = actualAmount * contract.pricePerUnit;
    }

    if (contract.deliveredAmount >= contract.totalAmount) {
      contract.status = 'completed';
      if (contract.paymentType === 'completion') {
        payment = contract.totalValue * 1.15; // 15% bonus
      }
    }
    
    if (payment > 0 && supabase) {
      // Buscar o user_id pelo username na tabela profiles
      supabase.from('profiles')
        .select('id')
        .eq('username', decoded.username)
        .single()
        .then(({ data: profile }) => {
          if (profile) {
            supabase.from('game_states')
              .select('money')
              .eq('user_id', profile.id)
              .single()
              .then(({ data: gameState }) => {
                if (gameState) {
                  supabase.from('game_states')
                    .update({ money: gameState.money + payment })
                    .eq('user_id', profile.id)
                    .then(({ error }) => {
                      if (error) console.error('Failed to pay player:', error);
                    });
                }
              });
          }
        });
    }

    res.json({ success: true, contract, payment });
  } catch (e) {
    res.status(401).json({ error: "Invalid token" });
  }
});

app.get("/api/leaderboard", async (req, res) => {
  try {
    // Get real users from Supabase - join profiles with game_states
    let users: any[] = [];
    if (supabase) {
      const { data } = await supabase
        .from('profiles')
        .select('username, game_states(money, total_profit)')
        .order('game_states.total_profit', { ascending: false });
      
      if (data) {
        users = data.map(p => ({
          username: p.username,
          money: p.game_states?.money || 0,
          total_profit: p.game_states?.total_profit || 0
        }));
      }
    }

    // Generate NPC Contracts stats (or just ECS stats)
    const ecsStats = Array.from(ecs.contracts.values()).slice(0, 10).map(c => ({
      username: `Contract_${c.id.substring(0, 5)}`,
      money: c.totalValue,
      total_profit: c.deliveredAmount * c.pricePerUnit
    }));

    const allPlayers = [...users, ...ecsStats];
    
    // Sort by total profit (or money as fallback)
    allPlayers.sort((a, b) => (b.total_profit || b.money || 0) - (a.total_profit || a.money || 0));

    // If no users, just use ECS stats
    const finalPlayers = users.length > 0 ? allPlayers : ecsStats;

    res.json(finalPlayers.slice(0, 50));
  } catch (e) {
    res.json([]);
  }
});



setInterval(() => {
  // 1. Order Matching Engine
  const resources = Object.keys(marketState);
  resources.forEach(resource => {
    const buyOrders = globalOrderBook
      .filter(o => o.resource === resource && o.type === 'buy')
      .sort((a, b) => b.price - a.price || a.timestamp - b.timestamp);
    
    const sellOrders = globalOrderBook
      .filter(o => o.resource === resource && o.type === 'sell')
      .sort((a, b) => a.price - b.price || a.timestamp - b.timestamp);

    while (buyOrders.length > 0 && sellOrders.length > 0) {
      const bestBuy = buyOrders[0];
      const bestSell = sellOrders[0];

      if (bestBuy.price >= bestSell.price) {
        // Match found!
        const tradePrice = Math.round((bestBuy.price + bestSell.price) / 2);
        const tradeAmount = Math.max(1, Math.min(Math.floor(bestBuy.amount), Math.floor(bestSell.amount)));

        // Execute trade
        const trade = {
          id: Math.random().toString(36).substr(2, 9),
          resource,
          amount: tradeAmount,
          price: tradePrice,
          buyer: bestBuy.username,
          seller: bestSell.username,
          timestamp: Date.now()
        };

        globalTradeHistory.unshift(trade);
        if (globalTradeHistory.length > 500) globalTradeHistory.pop();

        // Update market price
        marketState[resource].price = tradePrice;
        marketState[resource].history.push({ price: tradePrice, timestamp: Date.now() });
        if (marketState[resource].history.length > 100) marketState[resource].history.shift();



        // Update orders
        bestBuy.amount -= tradeAmount;
        bestSell.amount -= tradeAmount;

        if (bestBuy.amount <= 0) {
          globalOrderBook = globalOrderBook.filter(o => o.id !== bestBuy.id);
          buyOrders.shift();
        }
        if (bestSell.amount <= 0) {
          globalOrderBook = globalOrderBook.filter(o => o.id !== bestSell.id);
          sellOrders.shift();
        }

        console.log(`TRADE: ${tradeAmount} ${resource} @ ${tradePrice} (${bestBuy.username} -> ${bestSell.username})`);
      } else {
        break;
      }
    }
  });

// ECS Tick - pass marketState, orderBook, and tradeHistory
ecs.tick(marketState, globalOrderBook, globalTradeHistory);

  // Process expired contracts
  const now = Date.now();
  for (const [id, contract] of ecs.contracts.entries()) {
    if (contract.status === 'expired' && contract.assignedPlayerId) {
      // Deduct penalty from player
      if (supabase && contract.penalty) {
        supabase.from('profiles')
          .select('id')
          .eq('username', contract.assignedPlayerId)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              supabase.from('game_states')
                .select('money')
                .eq('user_id', profile.id)
                .single()
                .then(({ data: gameState }) => {
                  if (gameState) {
                    supabase.from('game_states')
                      .update({ money: Math.max(0, gameState.money - contract.penalty) })
                      .eq('user_id', profile.id)
                      .then(({ error }) => {
                        if (error) console.error('Failed to deduct penalty:', error);
                      });
                  }
                });
            }
          });
      }
      contract.status = 'failed'; // Mark as failed so we don't process it again
    }
  }

  // Cleanup old NPC orders to prevent book bloat
  if (globalOrderBook.length > 500) {
    globalOrderBook = globalOrderBook.filter(o => !o.username.startsWith('NPC_') || (Date.now() - o.timestamp < 60000));
  }

  // Sync to Supabase periodically (every 10 seconds to avoid too many writes)
  staticSyncCounter++;
  if (staticSyncCounter >= 10 && supabase) {
    staticSyncCounter = 0;
    console.log('Starting Supabase sync...');
    
    // Sync market state
    (async () => {
      try {
        for (const type of Object.keys(marketState)) {
          const item = marketState[type];
          // Try insert first
          const { error } = await supabase.from('market_state').insert({
            id: type,
            price: item.price,
            demand: item.demand || 100,
            supply: item.supply || 100,
            history: item.history || [],
            base_price: item.base_price || item.price,
            volatility: item.volatility || 0.05,
            last_update: new Date().toISOString()
          });
          
          if (error) {
            if (error.code === '23505') {
              // Already exists, update instead
              await supabase.from('market_state').update({
                price: item.price,
                demand: item.demand || 100,
                supply: item.supply || 100,
                history: item.history || [],
                base_price: item.base_price || item.price,
                volatility: item.volatility || 0.05,
                last_update: new Date().toISOString()
              }).eq('id', type);
            } else {
              console.error(`Error syncing ${type}:`, error.message);
            }
          }
        }
        console.log('Market state synced to Supabase');
      } catch (err) {
        console.error('Failed to sync market state to Supabase:', err);
      }
    })();
  }
}, 1000);

// Export for Vercel serverless
export default app;

// Serve static files and SPA fallback (must be last)
const distPath = process.env.VERCEL 
  ? path.join(process.cwd(), "dist") 
  : path.join(__dirname, "dist");

if (process.env.VERCEL) {
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    if (req.url.startsWith('/api')) {
      return res.status(404).json({ error: "API route not found" });
    }
    res.sendFile(path.join(distPath, "index.html"));
  });
}

if (!process.env.VERCEL) {
  async function startServer() {
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        if (req.url.startsWith('/api')) {
          return res.status(404).json({ error: "API route not found" });
        }
        res.sendFile(path.join(distPath, "index.html"));
      });
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
    });
  }
  startServer();
}
