import { Tick, ContractType } from './deriv-api';

export interface AISignal {
  type: ContractType;
  confidence: number;
  reason: string;
  timestamp: number;
}

export class AIEngine {
  private tickHistory: Tick[] = [];
  private maxHistory = 100;

  addTick(tick: Tick): AISignal | null {
    this.tickHistory.push(tick);
    if (this.tickHistory.length > this.maxHistory) {
      this.tickHistory.shift();
    }

    if (this.tickHistory.length < 20) return null;

    return this.analyze();
  }

  private analyze(): AISignal | null {
    const lastDigits = this.tickHistory.map(t => t.digit);
    const recentDigits = lastDigits.slice(-10);
    
    // 1. Digit Frequency
    const frequencies: Record<number, number> = {};
    lastDigits.forEach(d => {
      frequencies[d] = (frequencies[d] || 0) + 1;
    });

    // 2. Pattern: Consecutive Digits
    let consecutiveCount = 1;
    const lastDigit = lastDigits[lastDigits.length - 1];
    for (let i = lastDigits.length - 2; i >= 0; i--) {
      if (lastDigits[i] === lastDigit) consecutiveCount++;
      else break;
    }

    // 3. Simple Momentum (last 5 ticks)
    const recentQuotes = this.tickHistory.slice(-5).map(t => t.quote);
    const isUpward = recentQuotes[4] > recentQuotes[0];

    // logic for signals
    // Matches: High confidence if a digit hasn't appeared for a while or appeared exactly X times
    // Over 4.5: High confidence if last digits are mostly > 5
    // Under 7.6: High confidence if last digits are mostly < 7

    const overCount = recentDigits.filter(d => d > 4).length;
    const underCount = recentDigits.filter(d => d < 7).length;

    let signal: AISignal | null = null;

    if (overCount >= 8) {
      signal = {
        type: 'DIGITOVER',
        confidence: Math.min(60 + (overCount * 4), 98),
        reason: `Strong upward digit momentum detected. ${overCount}/10 recent digits were over 4.`,
        timestamp: Date.now()
      };
    } else if (underCount >= 8) {
      signal = {
        type: 'DIGITUNDER',
        confidence: Math.min(60 + (underCount * 4), 98),
        reason: `Strong downward digit momentum detected. ${underCount}/10 recent digits were under 7.`,
        timestamp: Date.now()
      };
    } else if (consecutiveCount >= 2) {
      signal = {
        type: 'MATCHES',
        confidence: 40 + (consecutiveCount * 10),
        reason: `Detected consecutive digit pattern (${lastDigit}). Statistical probability of repetition increasing.`,
        timestamp: Date.now()
      };
    }

    return signal;
  }

  getDigitFrequency() {
    const counts = new Array(10).fill(0);
    this.tickHistory.forEach(t => counts[t.digit]++);
    return counts.map((count, digit) => ({
      digit,
      percentage: (count / this.tickHistory.length) * 100
    }));
  }
}
