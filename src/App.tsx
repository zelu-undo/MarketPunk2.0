import React, { useState, useEffect } from 'react';
import { useGameLoop } from './useGameLoop';
import { MarketWithSearch } from './components/MarketWithSearch';
import { Toaster } from 'sonner';

export default function App() {
  const { state, setState, acceptContract, deliverContract } = useGameLoop();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const data = await res.json();
        // API returns { username, money, token } (not nested in user)
        const money = data.money ?? 1000;
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username);
        setState(prev => ({ ...prev, user: { username: data.username, money, token: data.token } }));
        setIsLoggedIn(true);
      } else {
        const err = await res.json();
        alert(err.error || 'Login failed');
      }
    } catch (e) {
      console.error('Login failed', e);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        alert('Registration successful! Please login.');
      } else {
        const err = await res.json();
        alert(err.error || 'Registration failed');
      }
    } catch (e) {
      console.error('Registration failed', e);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8 bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tighter">MarketPunk</h1>
            <p className="text-zinc-400 mt-2">The cyberpunk economic simulator</p>
          </div>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
              />
            </div>
            <div className="flex gap-4 pt-4">
              <button
                onClick={handleLogin}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2 rounded-lg transition-colors"
              >
                Login
              </button>
              <button
                onClick={handleRegister}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2 rounded-lg transition-colors"
              >
                Register
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <h1 className="text-xl font-bold tracking-tighter text-blue-500">MarketPunk</h1>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-400">
              <a href="#" className="text-zinc-100">Market</a>
              <a href="#" className="hover:text-zinc-100 transition-colors">Contracts</a>
              <a href="#" className="hover:text-zinc-100 transition-colors">Inventory</a>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-zinc-800 px-4 py-1.5 rounded-full border border-zinc-700 flex items-center gap-2">
              <span className="text-zinc-400 text-xs font-medium uppercase tracking-wider">Balance</span>
              <span className="font-mono text-blue-400 font-bold">${state.user?.money.toLocaleString()}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs">
              {state.user?.username[0].toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <MarketWithSearch 
          state={state} 
          acceptContract={acceptContract} 
          deliverContract={deliverContract} 
        />
      </main>
      
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
}
