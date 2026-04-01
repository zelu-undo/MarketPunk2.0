# Game Documentation: Industrial Tycoon

## Overview
Industrial Tycoon is a resource management and production simulation game where players build and manage industrial units, trade resources, research new technologies, and automate their operations.

## Core Features

### 1. Resource Management
- **Resources:** Players manage a variety of resources including Money, Wood, Stone, Iron, Energy, Planks, Iron Bars, Concrete, Steel, Electronics, and Research Data.
- **Storage:** Each resource has a storage limit that can be upgraded.

### 2. Production Units
- Players can build and manage various industrial units (e.g., Logger, Quarry, Mine, Power Plant, Sawmill, Foundry, Concrete Mixer, Steel Mill, Electronics Factory, Laboratory).
- Units consume input resources and produce output resources over time.
- Units can be upgraded to improve efficiency (speed, output, input requirements).
- Units can be automated.

### 3. Logistics
- Trucks are used to move resources between production unit buffers and global storage.
- Players can assign trucks to specific production units to manage resource flow.

### 4. Market and Trading
- A real-time market allows players to buy and sell resources.
- Players can create buy/sell orders.
- A trade history is maintained to track transactions.

### 5. Research and Technology
- Players can use Research Data to unlock new technologies.
- Unlocking technologies provides access to new production units.

### 6. Automation
- Players can create automation rules based on resource levels or market prices to automatically buy, sell, or produce resources.

### 7. Upgrades
- Players can upgrade storage capacity, max companies (units), and max automations.
- Players can buy more trucks to improve logistics.

## Game Loop
- The game runs on a tick-based system (`TICK_RATE = 1000ms`).
- Market prices update periodically (`MARKET_TICK_RATE = 5000ms`).
- Production, logistics, and automation rules are processed in each tick.

## Supabase SQL Setup
When deploying to production with Supabase, run the following SQL:

```sql
-- Supabase SQL to set up the database
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT NOT NULL,
  token TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS game_state (
  user_id UUID REFERENCES users(id) PRIMARY KEY,
  money NUMERIC DEFAULT 1000,
  resources JSONB DEFAULT '{}',
  storage_limits JSONB DEFAULT '{}',
  storage_levels JSONB DEFAULT '{}',
  production_units JSONB DEFAULT '[]',
  market JSONB DEFAULT '{}',
  order_book JSONB DEFAULT '[]',
  trade_history JSONB DEFAULT '[]',
  automation_rules JSONB DEFAULT '[]',
  max_companies INTEGER DEFAULT 3,
  max_automations INTEGER DEFAULT 1,
  total_trucks INTEGER DEFAULT 2,
  available_trucks INTEGER DEFAULT 2,
  unlocked_techs JSONB DEFAULT '[]',
  last_update TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_profit NUMERIC DEFAULT 0
);
```
