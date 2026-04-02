const express = require('express');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

console.log('Loading server...');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "marketpunk-secret-key";

// In-memory storage (no external deps)
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
app.get('/api/market', (req, res) => {
  console.log('GET /api/market');
  res.json({ market: marketState, orderBook: globalOrderBook, tradeHistory: globalTradeHistory.slice(0, 50) });
});

app.post('/api/auth/register', (req, res) => {
  console.log('POST /api/auth/register');
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: "User already exists" });
  }
  const hashed = bcrypt.hashSync(password, 10);
  users.push({ username, password: hashed });
  const token = jwt.sign({ username }, JWT_SECRET);
  res.json({ username, token, money: 1000 });
});

app.post('/api/auth/login', (req, res) => {
  console.log('POST /api/auth/login');
  const { username, password } = req.body;
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