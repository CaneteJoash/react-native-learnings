// A WebSocket client for an echo server that reconnects on close with
// exponential backoff. There is no `redirect: 'manual'` equivalent here:
// once the socket closes, the only move is to open a new one.

export type ConnectionStatus = 'connecting' | 'open' | 'reconnecting' | 'closed';

export type EchoClientOptions = {
  url: string;
  onMessage?: (data: string) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
  baseBackoffMs?: number;
  maxBackoffMs?: number;
};

export class EchoWebSocketClient {
  private options: EchoClientOptions;
  private socket: WebSocket | null = null;
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private closedByUser = false;

  constructor(options: EchoClientOptions) {
    this.options = options;
  }

  connect(): void {
    this.closedByUser = false;
    this.open();
  }

  send(data: string): void {
    this.socket?.send(data);
  }

  close(): void {
    this.closedByUser = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.socket?.close();
  }

  private open(): void {
    this.setStatus(this.reconnectAttempt === 0 ? 'connecting' : 'reconnecting');

    const socket = new WebSocket(this.options.url);
    this.socket = socket;

    socket.onopen = () => {
      this.reconnectAttempt = 0;
      this.setStatus('open');
    };

    socket.onmessage = (event: MessageEvent) => {
      this.options.onMessage?.(String(event.data));
    };

    socket.onclose = () => {
      this.setStatus('closed');
      if (!this.closedByUser) this.scheduleReconnect();
    };

    // onerror is followed by onclose for a failed connection; reconnect is
    // scheduled from onclose so it isn't scheduled twice.
    socket.onerror = () => {};
  }

  private scheduleReconnect(): void {
    const base = this.options.baseBackoffMs ?? 500;
    const max = this.options.maxBackoffMs ?? 15_000;
    const delay = Math.min(base * 2 ** this.reconnectAttempt, max);
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => this.open(), delay);
  }

  private setStatus(status: ConnectionStatus): void {
    this.options.onStatusChange?.(status);
  }
}
