const express = require('express');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

console.log('Loading server...');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.SUPABASE_JWT_SECRET || process.env.JWT_SECRET || "marketpunk-secret-key";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY || "";

console.log('SUPABASE_URL:', SUPABASE_URL ? 'set' : 'not set');
console.log('SUPABASE_SERVICE_KEY:', SUPABASE_SERVICE_KEY ? 'set' : 'not set');

let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  console.log('Supabase connected!');
}

// In-memory storage (fallback)
const marketState = {
  wood: { price: 100, demand: 50, supply: 50 },
  stone: { price: 100, demand: 50, supply: 50 },
  iron: { price: 100, demand: 50, supply: 50 },
  planks: { price: 100, demand: 50, supply: 50 },
  iron_bars: { price: 100, demand: 50, supply: 50 },
  energy: { price: 100, demand: 50, supply: 50 },
  concrete: { price: 100, demand: 50, supply: 50 },
  steel: { price: 100, demand: 50, supply: 50 },
  electronics: { price: 100, demand: 50, supply: 50 },
};

const users = [];
const globalOrderBook = [];
const globalTradeHistory = [];

// Routes
app.get('/api/market', async (req, res) => {
  console.log('GET /api/market');
  
  // Try to load from Supabase
  if (supabase) {
    try {
      const { data } = await supabase.from('market_state').select('*');
      if (data && data.length > 0) {
        data.forEach(item => {
          marketState[item.id] = {
            price: item.price,
            demand: item.demand,
            supply: item.supply
          };
        });
      }
    } catch (e) {
      console.error('Market load error:', e.message);
    }
  }
  
  res.json({ market: marketState, orderBook: globalOrderBook, tradeHistory: globalTradeHistory.slice(0, 50) });
});

app.post('/api/auth/register', async (req, res) => {
  console.log('POST /api/auth/register');
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  
  if (supabase) {
    try {
      const { data: existing } = await supabase.from('profiles').select('username').eq('username', username).single();
      if (existing) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      const hashed = bcrypt.hashSync(password, 10);
      const { data, error } = await supabase.from('profiles').insert({
        username,
        password: hashed,
        money: 1000
      }).select();
      
      if (error) {
        console.error('Register error:', error);
        return res.status(500).json({ message: error.message });
      }
      
      const token = jwt.sign({ username }, JWT_SECRET);
      return res.json({ username, token, money: 1000 });
    } catch (e) {
      console.error('Register error:', e.message);
      return res.status(500).json({ message: e.message });
    }
  }
  
  // Fallback: in-memory
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: "User already exists" });
  }
  const hashed = bcrypt.hashSync(password, 10);
  users.push({ username, password: hashed });
  const token = jwt.sign({ username }, JWT_SECRET);
  res.json({ username, token, money: 1000 });
});

app.post('/api/auth/login', async (req, res) => {
  console.log('POST /api/auth/login');
  const { username, password } = req.body;
  
  if (supabase) {
    try {
      const { data: profile, error } = await supabase.from('profiles').select('*').eq('username', username).single();
      
      if (error || !profile) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      if (!bcrypt.compareSync(password, profile.password)) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const token = jwt.sign({ username, id: profile.id }, JWT_SECRET);
      return res.json({ username, money: profile.money || 1000, token });
    } catch (e) {
      console.error('Login error:', e.message);
      return res.status(500).json({ message: e.message });
    }
  }
  
  // Fallback: in-memory
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const token = jwt.sign({ username }, JWT_SECRET);
  res.json({ username, money: 1000, token });
});

// Serve static files
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

module.exports = app;