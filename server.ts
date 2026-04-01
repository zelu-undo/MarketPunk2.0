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

    // Generate bot stats based on trade history
    const botStats = BOTS.map(bot => ({
      username: bot.name,
      money: bot.money,
      total_profit: bot.total_profit
    }));

    const allPlayers = [...users, ...botStats];
    
    // Sort by total profit
    allPlayers.sort((a, b) => (b.total_profit || 0) - (a.total_profit || 0));

    res.json(allPlayers.slice(0, 50)); // Top 50
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
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

  // 2. Bot actions (Bots place orders instead of instant supply/demand)
  BOTS.forEach(bot => {
    // 1. Simulate Production
    const productionAmount = bot.level * 5; // Increased production
    bot.resources[bot.target] = (bot.resources[bot.target] || 0) + productionAmount;

    // 2. Upgrade Logic
    const upgradeCost = bot.level * 5000;
    if (bot.money > upgradeCost * 2) {
      bot.money -= upgradeCost;
      bot.level++;
    }

    // 3. Market Actions
    // Activity factor (increased to 40%)
    if (Math.random() < 0.4) {
      const type = bot.target;
      const item = marketState[type];
      
      // Sell produced resources
      if (bot.resources[type] > 0) {
        const sellAmount = bot.resources[type];
        // Price around market price to ensure matches (0.9 to 1.1 of current market price)
        const sellPrice = item.price * (0.9 + Math.random() * 0.2);
        
        globalOrderBook.push({
          id: 'bot-' + Math.random().toString(36).substr(2, 5),
          username: bot.name,
          type: 'sell',
          resource: type,
          amount: sellAmount,
          price: parseFloat(sellPrice.toFixed(2)),
          timestamp: Date.now()
        });
        bot.resources[type] = 0; // Assume they put all on market
      }

      // Buy inputs (ALL bots buy things to keep economy moving)
      if (bot.money > 5000) {
        const resources = Object.keys(marketState);
        // Pick a random resource that they DON'T produce
        const buyTargets = resources.filter(r => r !== type);
        const buyTarget = buyTargets[Math.floor(Math.random() * buyTargets.length)];
        const buyItem = marketState[buyTarget];
        
        // Buy price around market price (0.95 to 1.05) to cross spread and match with sellers
        const buyPrice = buyItem.price * (0.95 + Math.random() * 0.1);
        
        // Spend 10% to 20% of their money
        const spendAmount = bot.money * (0.1 + Math.random() * 0.1);
        const buyAmount = Math.floor(spendAmount / buyPrice);
        
        if (buyAmount > 0) {
          globalOrderBook.push({
            id: 'bot-' + Math.random().toString(36).substr(2, 5),
            username: bot.name,
            type: 'buy',
            resource: buyTarget,
            amount: buyAmount,
            price: parseFloat(buyPrice.toFixed(2)),
            timestamp: Date.now()
          });
        }
      }
    }
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

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Use a middleware to ensure API routes are handled before Vite
    app.use((req, res, next) => {
      if (req.url.startsWith('/api')) {
        return next();
      }
      vite.middlewares(req, res, next);
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      // Only serve index.html for non-API routes
      if (req.url.startsWith('/api')) {
        return res.status(404).json({ error: "API route not found" });
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
