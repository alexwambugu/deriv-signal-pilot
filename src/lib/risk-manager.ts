export interface RiskSettings {
  minConfidence: number;
  stake: number;
  dailyLossLimit: number;
  dailyProfitTarget: number;
  maxConsecutiveLosses: number;
  cooldownSeconds: number;
  autoTrade: boolean;
}

export interface TradingStats {
  totalTrades: number;
  wins: number;
  losses: number;
  todayProfit: number;
  consecutiveLosses: number;
  lastTradeTime: number;
}

export class RiskManager {
  static canTrade(signal: { confidence: number }, settings: RiskSettings, stats: TradingStats): { allowed: boolean; reason?: string } {
    if (!settings.autoTrade) return { allowed: false, reason: 'Auto-trade is OFF' };

    if (signal.confidence < settings.minConfidence) {
      return { allowed: false, reason: `Confidence (${signal.confidence}%) below threshold (${settings.minConfidence}%)` };
    }

    if (stats.todayProfit <= -settings.dailyLossLimit) {
      return { allowed: false, reason: 'Daily loss limit reached' };
    }

    if (stats.todayProfit >= settings.dailyProfitTarget) {
      return { allowed: false, reason: 'Daily profit target reached' };
    }

    if (stats.consecutiveLosses >= settings.maxConsecutiveLosses) {
      return { allowed: false, reason: 'Max consecutive losses reached. Bot paused.' };
    }

    const now = Date.now();
    const secondsSinceLastTrade = (now - stats.lastTradeTime) / 1000;
    if (secondsSinceLastTrade < settings.cooldownSeconds) {
      return { allowed: false, reason: `Cooldown active (${Math.ceil(settings.cooldownSeconds - secondsSinceLastTrade)}s left)` };
    }

    return { allowed: true };
  }
}
