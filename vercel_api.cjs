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
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

let supabase = null;
if (SUPABASE_URL && SUPABASE_SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
  console.log('Supabase connected!');
}

// Market state
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

const globalOrderBook = [];
const globalTradeHistory = [];

// Routes
app.get('/api/market', (req, res) => {
  res.json({ market: marketState, orderBook: globalOrderBook, tradeHistory: globalTradeHistory.slice(0, 50) });
});

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  if (username.length < 3) {
    return res.status(400).json({ message: "Username must be at least 3 characters" });
  }
  if (password.length < 3) {
    return res.status(400).json({ message: "Password must be at least 3 characters" });
  }
  
  // Store in Supabase table
  if (supabase) {
    try {
      // Check if exists
      const { data: existing } = await supabase
        .from('user_credentials')
        .select('username')
        .eq('username', username)
        .single();
      
      if (existing) {
        return res.status(400).json({ message: "User already exists" });
      }
      
      // Hash password and save
      const hashed = bcrypt.hashSync(password, 10);
      await supabase.from('user_credentials').insert({
        username,
        password_hash: hashed
      });
      
      console.log('Created user in Supabase:', username);
    } catch (e) {
      console.log('Supabase error:', e.message);
      return res.status(500).json({ message: "Database error" });
    }
  }
  
  const token = jwt.sign({ username, created: Date.now() }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ username, token, money: 1000 });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  let passwordHash = null;
  
  // Get from Supabase
  if (supabase) {
    try {
      const { data: user } = await supabase
        .from('user_credentials')
        .select('password_hash')
        .eq('username', username)
        .single();
      
      if (user) {
        passwordHash = user.password_hash;
      }
    } catch (e) {
      console.log('Supabase lookup:', e.message);
    }
  }
  
  // Verify
  if (!passwordHash || !bcrypt.compareSync(password, passwordHash)) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  
  const token = jwt.sign({ username, created: Date.now() }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ username, money: 1000, token });
});

// Serve static files
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

module.exports = app;