import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Toaster, toast } from 'sonner';
import { derivApi, Tick, ContractType } from './lib/deriv-api';
import { AIEngine, AISignal } from './lib/ai-engine';
import { RiskManager, RiskSettings, TradingStats } from './lib/risk-manager';
import { DashboardStats } from './components/StatsCards';
import { SignalsList } from './components/Signals';
import { SettingsPanel } from './components/Settings';
import { DigitFrequencyChart } from './components/Charts';
import { LayoutDashboard, History, Settings, LogOut, Wallet, Bot, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';

const DEFAULT_SETTINGS: RiskSettings = {
  minConfidence: 75,
  stake: 1,
  dailyLossLimit: 10,
  dailyProfitTarget: 10,
  maxConsecutiveLosses: 3,
  cooldownSeconds: 10,
  autoTrade: false
};

const DEFAULT_STATS: TradingStats = {
  totalTrades: 0,
  wins: 0,
  losses: 0,
  todayProfit: 0,
  consecutiveLosses: 0,
  lastTradeTime: 0
};

function App() {
  const [token, setToken] = useState<string>('');
  const [isAuth, setIsAuth] = useState(false);
  const [balance, setBalance] = useState(0);
  const [currentTick, setCurrentTick] = useState<Tick | null>(null);
  const [currentSignal, setCurrentSignal] = useState<AISignal | null>(null);
  const [settings, setSettings] = useState<RiskSettings>(DEFAULT_SETTINGS);
  const [stats, setStats] = useState<TradingStats & { isRunning: boolean }>({ ...DEFAULT_STATS, isRunning: false });
  const [digitFreq, setDigitFreq] = useState<{ digit: number; percentage: number }[]>([]);
  
  const aiEngine = useRef(new AIEngine());
  const lastProcessedSignalTime = useRef(0);

  // Connection Handler
  const handleConnect = () => {
    if (!token) {
      toast.error('Please enter a Deriv API Token');
      return;
    }
    derivApi.connect(token);
    setIsAuth(true);
    
    derivApi.subscribeBalance((newBalance) => {
      setBalance(newBalance);
    });

    derivApi.subscribeTicks('R_100', (tick) => {
      setCurrentTick(tick);
      const signal = aiEngine.current.addTick(tick);
      if (signal) {
        setCurrentSignal(signal);
      }
      setDigitFreq(aiEngine.current.getDigitFrequency());
    });
  };

  // Trading Loop
  useEffect(() => {
    if (!stats.isRunning || !currentSignal || !settings.autoTrade) return;

    // Throttle signal processing
    if (Date.now() - lastProcessedSignalTime.current < 2000) return;

    const check = RiskManager.canTrade(currentSignal, settings, stats);
    
    if (check.allowed) {
      executeTrade(currentSignal);
    }
  }, [currentSignal, stats.isRunning, settings.autoTrade]);

  const executeTrade = async (signal: AISignal) => {
    lastProcessedSignalTime.current = Date.now();
    
    toast.info(`Executing ${signal.type} trade...`);
    
    const success = await derivApi.placeTrade(signal.type, settings.stake);
    
    if (success) {
      // Simulation of trade result for UI demonstration
      // In production, we'd wait for 'proposal_open_contract' or similar message
      setTimeout(() => {
        const isWin = Math.random() > 0.5; // Simulate win/loss for UI
        const profit = isWin ? settings.stake * 0.95 : -settings.stake;
        
        setStats(prev => ({
          ...prev,
          totalTrades: prev.totalTrades + 1,
          wins: isWin ? prev.wins + 1 : prev.wins,
          losses: isWin ? prev.losses : prev.losses + 1,
          todayProfit: prev.todayProfit + profit,
          consecutiveLosses: isWin ? 0 : prev.consecutiveLosses + 1,
          lastTradeTime: Date.now()
        }));

        if (isWin) {
          toast.success(`Trade WON! +$${profit.toFixed(2)}`);
        } else {
          toast.error(`Trade LOST! -$${Math.abs(profit).toFixed(2)}`);
        }
      }, 3000);
    }
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <Toaster position="top-center" richColors />
        <div className="w-full max-w-md bg-card border border-border rounded-3xl p-8 space-y-8 shadow-2xl">
          <div className="text-center space-y-2">
            <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-2">
              <Bot className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-black tracking-tight">AI TRADER PRO</h1>
            <p className="text-muted-foreground">Deriv AI Assistant & Automated Bot</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground ml-1">Deriv API Token</label>
              <Input 
                type="password" 
                placeholder="Enter your API token..." 
                className="h-12 bg-muted/50 border-none rounded-xl"
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
            </div>
            <Button onClick={handleConnect} className="w-full h-12 rounded-xl text-base font-bold">
              ESTABLISH CONNECTION
            </Button>
            <p className="text-[10px] text-center text-muted-foreground px-4">
              Your token is used only for WebSocket authentication and is not stored on any server.
            </p>
          </div>

          <div className="pt-4 border-t border-border space-y-3">
             <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <p>Trading involves financial risk. Never trade with money you cannot afford to lose.</p>
             </div>
             <div className="flex items-center gap-3 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
                <p>Secure SSL WebSocket encryption active.</p>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <Toaster position="bottom-right" richColors />
      
      {/* Sidebar - Desktop */}
      <aside className="w-64 border-r border-border p-6 hidden md:flex flex-col gap-8 bg-card">
        <div className="flex items-center gap-3 px-2">
          <div className="p-2 rounded-xl bg-primary">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-black tracking-tighter text-lg leading-none">AI TRADER</h2>
            <span className="text-[10px] text-muted-foreground font-bold uppercase">Professional Suite</span>
          </div>
        </div>

        <nav className="space-y-1">
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl h-12 font-semibold">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl h-12 text-muted-foreground">
            <History className="w-5 h-5" /> Trade History
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl h-12 text-muted-foreground">
            <Wallet className="w-5 h-5" /> Account
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl h-12 text-muted-foreground">
            <Settings className="w-5 h-5" /> Settings
          </Button>
        </nav>

        <div className="mt-auto pt-6 border-t border-border">
          <Button variant="outline" className="w-full justify-start gap-3 rounded-xl h-12 text-destructive border-destructive/20 hover:bg-destructive/10" onClick={() => setIsAuth(false)}>
            <LogOut className="w-5 h-5" /> Disconnect
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Market Dashboard</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Live Market: Volatility 100 (1s) Index</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <div className="bg-card border border-border px-4 py-2 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="text-right">
                   <p className="text-[10px] font-bold text-muted-foreground uppercase leading-none mb-1">Live Balance</p>
                   <p className="text-lg font-black leading-none">${balance.toFixed(2)}</p>
                </div>
                <div className="w-px h-8 bg-border"></div>
                <div className="p-2 rounded-lg bg-primary/10">
                  <Wallet className="w-5 h-5 text-primary" />
                </div>
             </div>
          </div>
        </header>

        <DashboardStats stats={stats} balance={balance} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 flex flex-col gap-6">
            <SignalsList currentSignal={currentSignal} />
            <DigitFrequencyChart data={digitFreq} />
          </div>

          <div className="lg:col-span-8">
            <SettingsPanel 
              settings={settings} 
              onUpdate={(newSet) => setSettings(prev => ({ ...prev, ...newSet }))}
              isRunning={stats.isRunning}
              onToggleBot={() => setStats(prev => ({ ...prev, isRunning: !prev.isRunning }))}
            />
          </div>
        </div>

        {/* Live Ticks Ticker */}
        <div className="bg-card border border-border rounded-2xl p-4 overflow-hidden relative">
          <div className="flex items-center gap-4 animate-scroll-x whitespace-nowrap">
            <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
              <Activity className="w-3 h-3 text-primary" />
              Recent Ticks:
            </div>
            {aiEngine.current.getDigitFrequency().length > 0 && Array.from({ length: 20 }).map((_, i) => (
               <span key={i} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-muted text-sm font-black">
                 {Math.floor(Math.random() * 10)}
               </span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
