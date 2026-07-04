import React from 'react';
import { TrendingUp, TrendingDown, Target, Zap, ShieldAlert, Activity } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ElementType;
  color: string;
}

export const StatCard = ({ title, value, subValue, icon: Icon, color }: StatCardProps) => (
  <div className="bg-card p-5 rounded-2xl border border-border shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
        <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
    <div>
      <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight">{value}</span>
        {subValue && <span className="text-xs text-muted-foreground">{subValue}</span>}
      </div>
    </div>
  </div>
);

export const DashboardStats = ({ stats, balance }: { stats: any, balance: number }) => {
  const winRate = stats.totalTrades > 0 ? ((stats.wins / stats.totalTrades) * 100).toFixed(1) : '0';
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <StatCard 
        title="Balance" 
        value={`$${balance.toFixed(2)}`} 
        icon={Activity} 
        color="bg-primary" 
      />
      <StatCard 
        title="Today P/L" 
        value={`${stats.todayProfit >= 0 ? '+' : ''}$${stats.todayProfit.toFixed(2)}`} 
        icon={stats.todayProfit >= 0 ? TrendingUp : TrendingDown} 
        color={stats.todayProfit >= 0 ? "bg-green-500" : "bg-red-500"} 
      />
      <StatCard 
        title="Win Rate" 
        value={`${winRate}%`} 
        subValue={`${stats.wins}W / ${stats.losses}L`}
        icon={Target} 
        color="bg-blue-500" 
      />
      <StatCard 
        title="Total Trades" 
        value={stats.totalTrades} 
        icon={Zap} 
        color="bg-amber-500" 
      />
      <StatCard 
        title="Consec. Loss" 
        value={stats.consecutiveLosses} 
        icon={ShieldAlert} 
        color="bg-purple-500" 
      />
      <StatCard 
        title="Status" 
        value={stats.isRunning ? "RUNNING" : "STOPPED"} 
        icon={Activity} 
        color={stats.isRunning ? "bg-green-500" : "bg-slate-500"} 
      />
    </div>
  );
};
