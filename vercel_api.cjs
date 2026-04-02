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
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

let supabase = null;
if (SUPABASE_URL && (SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY)) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY);
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
  
  // Create user in Supabase Auth (using username as fake email)
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: username + '@marketpunk.local',
        password: password,
        options: {
          data: { username: username },
          emailRedirectTo: 'https://market-punk2-0.vercel.app'
        }
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          return res.status(400).json({ message: "User already exists" });
        }
        console.log('Supabase signUp error:', error.message);
      }
      
      // If email confirmation needed, still create local token
      console.log('Created user:', username, 'needs confirmation:', data?.user?.email_confirmed_at ? 'no' : 'yes');
    } catch (e) {
      console.log('Supabase error:', e.message);
    }
  }
  
  // Always generate token (works even if Supabase needs email confirmation)
  const token = jwt.sign({ username, created: Date.now() }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ username, token, money: 1000 });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  // Always verify with local token approach
  // Try both Supabase Auth and local check
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: username + '@marketpunk.local',
        password: password
      });
      
      if (!error && data.user) {
        const token = jwt.sign({ username, id: data.user.id, created: Date.now() }, JWT_SECRET, { expiresIn: '30d' });
        return res.json({ username, money: 1000, token });
      }
    } catch (e) {
      // Continue to fallback
    }
  }
  
  // Fallback: check if registration happened in this session
  // For now, accept any valid login (Supabase will persist for next requests)
  // The Supabase Auth already verified - if we get here, there was an error
  return res.status(401).json({ message: "Invalid credentials. Try registering first." });
});

// Serve static files
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

module.exports = app;