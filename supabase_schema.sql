-- MarketPunk Supabase Schema

-- 1. Users Table (handled by Supabase Auth, but we can have a profile table)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Game State Table
CREATE TABLE IF NOT EXISTS public.game_states (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  money DOUBLE PRECISION DEFAULT 1000,
  resources JSONB DEFAULT '{}'::jsonb,
  storage_limits JSONB DEFAULT '{}'::jsonb,
  storage_levels JSONB DEFAULT '{}'::jsonb,
  production_units JSONB DEFAULT '[]'::jsonb,
  automation_rules JSONB DEFAULT '[]'::jsonb,
  unlocked_techs JSONB DEFAULT '[]'::jsonb,
  order_book JSONB DEFAULT '[]'::jsonb,
  max_companies INTEGER DEFAULT 5,
  max_automations INTEGER DEFAULT 5,
  total_profit DOUBLE PRECISION DEFAULT 0,
  total_trucks INTEGER DEFAULT 5,
  available_trucks INTEGER DEFAULT 5,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Market State Table
CREATE TABLE IF NOT EXISTS public.market_state (
  id TEXT PRIMARY KEY, -- resource type
  price DOUBLE PRECISION NOT NULL,
  history JSONB DEFAULT '[]'::jsonb,
  volatility DOUBLE PRECISION DEFAULT 0.05,
  base_price DOUBLE PRECISION NOT NULL,
  demand DOUBLE PRECISION DEFAULT 100,
  supply DOUBLE PRECISION DEFAULT 100,
  last_update TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Trade History Table
CREATE TABLE IF NOT EXISTS public.trade_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE,
  type TEXT CHECK (type IN ('buy', 'sell')),
  resource TEXT NOT NULL,
  amount DOUBLE PRECISION NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  is_order BOOLEAN DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS Policies

-- Profiles: Users can read all profiles, but only update their own
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Game States: Users can only see and update their own state
ALTER TABLE public.game_states ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own game state." ON public.game_states FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own game state." ON public.game_states FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own game state." ON public.game_states FOR UPDATE USING (auth.uid() = user_id);

-- Market State: Everyone can read, only service role (server) can update
ALTER TABLE public.market_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Market state is viewable by everyone." ON public.market_state FOR SELECT USING (true);

-- Trade History: Users can only see their own history
ALTER TABLE public.trade_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own trade history." ON public.trade_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trade history." ON public.trade_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions and Triggers

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.raw_user_meta_data->>'username');
  
  INSERT INTO public.game_states (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
