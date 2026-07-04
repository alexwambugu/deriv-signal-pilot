import { toast } from 'sonner';

export type ContractType = 'MATCHES' | 'DIGITOVER' | 'DIGITUNDER';

export interface Tick {
  epoch: number;
  quote: number;
  digit: number;
}

export interface TradeResult {
  id: string;
  type: ContractType;
  stake: number;
  payout: number;
  profit: number;
  status: 'WON' | 'LOST' | 'PENDING';
  timestamp: number;
}

class DerivAPI {
  private socket: WebSocket | null = null;
  private token: string | null = null;
  private onTickCallback: ((tick: Tick) => void) | null = null;
  private onBalanceCallback: ((balance: number) => void) | null = null;
  private isConnected: boolean = false;
  private reconnectTimeout: any = null;

  connect(token: string) {
    this.token = token;
    this.socket = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');

    this.socket.onopen = () => {
      this.isConnected = true;
      console.log('Deriv WebSocket connected');
      this.authenticate();
    };

    this.socket.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      this.handleMessage(data);
    };

    this.socket.onclose = () => {
      this.isConnected = false;
      console.log('Deriv WebSocket disconnected');
      this.attemptReconnect();
    };

    this.socket.onerror = (err) => {
      console.error('Deriv WebSocket error:', err);
      toast.error('Connection error. Retrying...');
    };
  }

  private authenticate() {
    if (!this.socket || !this.token) return;
    this.socket.send(JSON.stringify({ authorize: this.token }));
  }

  private attemptReconnect() {
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.reconnectTimeout = setTimeout(() => {
      if (this.token) this.connect(this.token);
    }, 5000);
  }

  subscribeTicks(symbol: string = 'R_100', callback: (tick: Tick) => void) {
    this.onTickCallback = callback;
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({ ticks: symbol }));
    }
  }

  subscribeBalance(callback: (balance: number) => void) {
    this.onBalanceCallback = callback;
    if (this.socket && this.isConnected) {
      this.socket.send(JSON.stringify({ balance: 1, subscribe: 1 }));
    }
  }

  async placeTrade(type: ContractType, stake: number, barrier: number = 4): Promise<boolean> {
    if (!this.socket || !this.isConnected) {
      toast.error('API not connected');
      return false;
    }

    const symbol = 'R_100';
    const contractType = this.getDerivContractType(type);
    
    // In a real implementation, we would send a 'buy' or 'proposal' request
    // For this example, we simulate the trade flow as per Deriv API docs
    // but keep it simplified for the UI demonstration.
    console.log(`Placing ${type} trade with stake ${stake}`);
    
    // Simulating API call response
    return true;
  }

  private getDerivContractType(type: ContractType): string {
    switch (type) {
      case 'MATCHES': return 'DIGITMATCH';
      case 'DIGITOVER': return 'DIGITOVER';
      case 'DIGITUNDER': return 'DIGITUNDER';
      default: return 'DIGITMATCH';
    }
  }

  private handleMessage(data: any) {
    if (data.error) {
      toast.error(data.error.message);
      return;
    }

    if (data.msg_type === 'authorize') {
      toast.success('Authenticated successfully');
      this.subscribeBalance(() => {}); // Initial balance sub
      this.subscribeTicks('R_100', () => {}); // Initial tick sub
    }

    if (data.msg_type === 'tick' && this.onTickCallback) {
      const quote = data.tick.quote;
      const digit = parseInt(quote.toString().split('').pop() || '0');
      this.onTickCallback({
        epoch: data.tick.epoch,
        quote: quote,
        digit: digit
      });
    }

    if (data.msg_type === 'balance' && this.onBalanceCallback) {
      this.onBalanceCallback(data.balance.balance);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    this.isConnected = false;
  }
}

export const derivApi = new DerivAPI();
