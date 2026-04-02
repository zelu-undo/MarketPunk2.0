import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "marketpunk-secret-key";
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) 
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  : null;

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

let marketState: any = {
  wood: { price: 10, demand: 100, supply: 100, history: [] },
  stone: { price: 15, demand: 100, supply: 100, history: [] },
  iron: { price: 25, demand: 100, supply: 100, history: [] },
  planks: { price: 40, demand: 100, supply: 100, history: [] },
  iron_bars: { price: 120, demand: 100, supply: 100, history: [] },
  energy: { price: 5, demand: 100, supply: 100, history: [] },
  concrete: { price: 150, demand: 100, supply: 100, history: [] },
  steel: { price: 300, demand: 100, supply: 100, history: [] },
  electronics: { price: 500, demand: 100, supply: 100, history: [] },
};

// Initialize market from Supabase if keys are present
async function initMarket() {
  if (supabase) {
    const { data, error } = await supabase.from('market_state').select('*');
    if (data && data.length > 0) {
      data.forEach(item => {
        marketState[item.resource_type] = {
          price: item.price,
          demand: item.demand,
          supply: item.supply,
          history: item.history || []
        };
      });
    }
  }
}
initMarket();

// Initialize history
Object.keys(marketState).forEach(key => {
  for (let i = 0; i < 20; i++) {
    marketState[key].history.push({ price: marketState[key].price, timestamp: Date.now() - (20 - i) * 1000 });
  }
});

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
  console.log(`Login attempt: ${username}`);

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${username}@marketpunk.local`,
      password: password
    });
    if (error) {
      console.log(`Login failed for ${username}: ${error.message}`);
      return res.status(401).json({ message: error.message });
    }
    activeUsers++;
    const token = jwt.sign({ username, id: data.user.id }, JWT_SECRET);
    res.json({ username, token });
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
  res.json({
    market: marketState,
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
    if (amount <= 0 || price <= 0) return res.status(400).json({ error: "Invalid amount or price" });

    const order = {
      id: Math.random().toString(36).substr(2, 9),
      username: decoded.username,
      type: type, // 'buy' or 'sell'
      resource: resource,
      amount,
      price,
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

app.get("/api/leaderboard", async (req, res) => {
  try {
    // Get real users from Supabase
    let users: any[] = [];
    if (supabase) {
      const { data } = await supabase.from('users').select('username, money, total_profit');
      if (data) users = data;
    }

    // Generate bot stats - update their profits based on their strategy success
    const botStats = BOTS.map(bot => {
      // Bots gain profits over time based on their level and strategy
      const baseProfit = bot.level * 100 + Math.random() * bot.level * 50;
      const strategyBonus = bot.strategy === 'sell_high' ? 1.2 : bot.strategy === 'buy_low' ? 1.1 : 1.0;
      const realisticProfit = Math.floor(baseProfit * strategyBonus);
      
      return {
        username: bot.name,
        money: bot.money,
        total_profit: realisticProfit
      };
    });

    const allPlayers = [...users, ...botStats];
    
    // Sort by total profit (or money as fallback)
    allPlayers.sort((a, b) => (b.total_profit || b.money || 0) - (a.total_profit || a.money || 0));

    // If no users, just use bots
    const finalPlayers = users.length > 0 ? allPlayers : botStats;

    res.json(finalPlayers.slice(0, 50));
  } catch (e) {
    // Fallback to just bots with realistic profits
    const botStats = BOTS.map(bot => {
      const baseProfit = bot.level * 100 + Math.random() * bot.level * 50;
      const strategyBonus = bot.strategy === 'sell_high' ? 1.2 : bot.strategy === 'buy_low' ? 1.1 : 1.0;
      const realisticProfit = Math.floor(baseProfit * strategyBonus);
      
      return {
        username: bot.name,
        money: bot.money,
        total_profit: realisticProfit
      };
    }).sort((a, b) => (b.total_profit || b.money || 0) - (a.total_profit || a.money || 0));
    
    res.json(botStats.slice(0, 50));
  }
});

// Market Simulation & Bots
interface Bot {
  name: string;
  strategy: string;
  target: string;
  money: number;
  total_profit: number;
  level: number;
  resources: Record<string, number>;
  internalState?: {
    lastAction: number;
    riskTolerance: number;
    lastPrice: Record<string, number>;
    inventory: Record<string, number>;
    needsResources: string[];
  };
}

const BOTS: Bot[] = [
  { name: "BotMiner1", strategy: "buy_low", target: "energy", money: 250000, total_profit: 0, level: 35, resources: {} },
  { name: "BotLumber2", strategy: "sell_high", target: "wood", money: 150000, total_profit: 0, level: 25, resources: {} },
  { name: "BotTrader3", strategy: "random", target: "planks", money: 300000, total_profit: 0, level: 40, resources: {} },
  { name: "BotIron4", strategy: "buy_low", target: "iron", money: 200000, total_profit: 0, level: 30, resources: {} },
  { name: "BotFoundry5", strategy: "sell_high", target: "iron_bars", money: 400000, total_profit: 0, level: 45, resources: {} },
  { name: "BotStone6", strategy: "sell_high", target: "stone", money: 180000, total_profit: 0, level: 28, resources: {} },
  { name: "BotBuilder7", strategy: "buy_low", target: "concrete", money: 500000, total_profit: 0, level: 50, resources: {} },
  { name: "BotSteel8", strategy: "random", target: "steel", money: 600000, total_profit: 0, level: 55, resources: {} },
  { name: "BotTech9", strategy: "sell_high", target: "electronics", money: 800000, total_profit: 0, level: 60, resources: {} },
  { name: "BotEnergy10", strategy: "sell_high", target: "energy", money: 350000, total_profit: 0, level: 42, resources: {} },
];

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
        const tradePrice = (bestBuy.price + bestSell.price) / 2;
        const tradeAmount = Math.min(bestBuy.amount, bestSell.amount);

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

        // Update bot stats if they are involved
        const buyerBot = BOTS.find(b => b.name === bestBuy.username);
        if (buyerBot) {
          buyerBot.money -= tradeAmount * tradePrice;
          buyerBot.resources[resource] = (buyerBot.resources[resource] || 0) + tradeAmount;
        }
        
        const sellerBot = BOTS.find(b => b.name === bestSell.username);
        if (sellerBot) {
          sellerBot.money += tradeAmount * tradePrice;
          sellerBot.total_profit += tradeAmount * tradePrice;
        }

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

  // 2. Bot actions - Realistic human-like behavior
  const now = Date.now();
  
  BOTS.forEach(bot => {
    // Initialize bot's internal state if not exists
    if (!bot.internalState) {
      bot.internalState = {
        lastAction: 0,
        riskTolerance: 0.5 + Math.random() * 0.4,
        lastPrice: {},
        inventory: {},
        needsResources: ['energy', 'food_ration', 'wood']
      };
    }
    
    const state = bot.internalState;
    
    // 1. REALISTIC PRODUCTION - Not all bots produce every tick
    if (now - state.lastAction > 2000) {
      const productionMultiplier = state.riskTolerance * (0.7 + Math.random() * 0.6);
      const productionAmount = Math.floor(bot.level * 5 * productionMultiplier);
      
      // Some bots hold inventory instead of selling immediately
      const holdPercentage = 0.2 + Math.random() * 0.3;
      const sellAmount = Math.floor(productionAmount * (1 - holdPercentage));
      const holdAmount = productionAmount - sellAmount;
      
      bot.resources[bot.target] = (bot.resources[bot.target] || 0) + holdAmount;
      
      if (sellAmount > 0) {
        const item = marketState[bot.target];
        let priceMultiplier;
        
        if (bot.strategy === 'sell_high') {
          priceMultiplier = Math.random() < 0.3 ? 1.1 + Math.random() * 0.3 : 0.95 + Math.random() * 0.1;
        } else if (bot.strategy === 'buy_low') {
          priceMultiplier = 0.8 + Math.random() * 0.15;
        } else {
          priceMultiplier = 0.9 + Math.random() * 0.2;
        }
        
        const sellPrice = item.price * priceMultiplier;
        
        globalOrderBook.push({
          id: 'bot-' + Math.random().toString(36).substr(2, 5),
          username: bot.name,
          type: 'sell',
          resource: bot.target,
          amount: sellAmount,
          price: parseFloat(sellPrice.toFixed(2)),
          timestamp: now
        });
      }
    }

    // 2. HUMAN-LIKE UPGRADE BEHAVIOR
    const upgradeCost = bot.level * 5000;
    const moneyRatio = bot.money / (upgradeCost * 3);
    
    if (moneyRatio > 1 && Math.random() < 0.3) {
      bot.money -= upgradeCost;
      bot.level++;
    }

    // 3. VARIABLE MARKET ACTIVITY
    const activityChance = 0.25 + (Math.sin(now / 60000) * 0.15);
    const isActive = Math.random() < activityChance;
    
    if (isActive && bot.money > 3000) {
      const type = bot.target;
      const item = marketState[type];
      
      if (!state.lastPrice[type]) state.lastPrice[type] = item.price;
      const priceChange = (item.price - state.lastPrice[type]) / state.lastPrice[type];
      state.lastPrice[type] = item.price;

      let willBuy = true;
      if (priceChange > 0.1 && Math.random() < 0.4) {
        willBuy = false;
      }
      
      if (willBuy) {
        const resources = Object.keys(marketState);
        const buyTarget = state.needsResources[Math.floor(Math.random() * state.needsResources.length)] || 
                         resources[Math.floor(Math.random() * resources.length)];
        const buyItem = marketState[buyTarget];
        
        let priceBias;
        if (bot.strategy === 'sell_high') priceBias = 1.02;
        else if (bot.strategy === 'buy_low') priceBias = 0.98;
        else priceBias = 0.95 + Math.random() * 0.1;
        
        const buyPrice = buyItem.price * priceBias;
        
        const spendPercent = 0.05 + Math.random() * 0.15;
        const spendAmount = bot.money * spendPercent;
        const buyAmount = Math.floor(Math.min(spendAmount / buyPrice, buyItem.supply));
        
        if (buyAmount > 0) {
          globalOrderBook.push({
            id: 'bot-' + Math.random().toString(36).substr(2, 5),
            username: bot.name,
            type: 'buy',
            resource: buyTarget,
            amount: buyAmount,
            price: parseFloat(buyPrice.toFixed(2)),
            timestamp: now
          });
          
          state.inventory[buyTarget] = (state.inventory[buyTarget] || 0) + buyAmount;
          
          if (Math.random() < 0.1) {
            const neededIdx = Math.floor(Math.random() * state.needsResources.length);
            if (state.inventory[state.needsResources[neededIdx]] > 10) {
              state.needsResources.splice(neededIdx, 1);
              state.needsResources.push(resources[Math.floor(Math.random() * resources.length)]);
            }
          }
        }
      }
      
      state.lastAction = now;
    }
    
    // 4. OCCASIONAL MISTAKES
    if (Math.random() < 0.02 && bot.money > 10000) {
      const item = marketState[bot.target];
      globalOrderBook.push({
        id: 'bot-' + Math.random().toString(36).substr(2, 5),
        username: bot.name,
        type: 'sell',
        resource: bot.target,
        amount: Math.floor(Math.random() * 50) + 10,
        price: item.price * 0.5,
        timestamp: now
      });
    }
    
    // 5. Track profits for leaderboard
    bot.total_profit = (bot.total_profit || 0) + Math.floor(Math.random() * bot.level * 10);
  });

  // Cleanup old bot orders to prevent book bloat
  if (globalOrderBook.length > 500) {
    globalOrderBook = globalOrderBook.filter(o => !o.username.startsWith('Bot') || (Date.now() - o.timestamp < 60000));
  }

  // Sync to Supabase periodically
  if (supabase) {
    Object.keys(marketState).forEach(async type => {
      try {
        const item = marketState[type];
        await supabase.from('market_state').upsert({
          resource_type: type,
          price: item.price,
          demand: item.demand,
          supply: item.supply,
          history: item.history
        });
      } catch (err) {
        console.error(`Failed to sync ${type} to Supabase:`, err);
      }
    });
  }
}, 1000);

// Export for Vercel serverless
export default app;

// Serve static files and SPA fallback (must be last)
const distPath = process.env.VERCEL 
  ? path.join(process.cwd(), "dist") 
  : path.join(__dirname, "dist");
app.use(express.static(distPath));

app.get("*", (req, res) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ error: "API route not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});
