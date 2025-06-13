// Real-time WebSocket Server for Dashboard and Analytics
// Provides live updates for monitoring, security events, and system metrics

export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
  channel?: string;
}

export interface ClientSubscription {
  id: string;
  channels: Set<string>;
  userId?: string;
  isAdmin: boolean;
  lastActivity: Date;
}

export class RealTimeServer {
  private clients: Map<string, ClientSubscription> = new Map();
  private metrics: Map<string, any> = new Map();
  private activityBuffer: any[] = [];
  private readonly MAX_ACTIVITY_BUFFER = 100;

  constructor(private port: number = 3001) {
    // Mock implementation for now
    console.log(`Real-time server initialized on port ${port}`);
  }

  // Mock methods for compatibility
  async start(): Promise<void> {
    console.log('Real-time server started (mock)');
  }

  async stop(): Promise<void> {
    console.log('Real-time server stopped (mock)');
  }

  pushActivity(activity: any): void {
    this.activityBuffer.push({
      ...activity,
      timestamp: new Date().toISOString()
    });

    if (this.activityBuffer.length > this.MAX_ACTIVITY_BUFFER) {
      this.activityBuffer = this.activityBuffer.slice(-this.MAX_ACTIVITY_BUFFER);
    }

    console.log('Activity pushed:', activity);
  }

  pushSecurityEvent(event: any): void {
    console.log('Security event pushed:', event);
    this.pushActivity({
      type: 'security',
      message: event.message || 'Security event occurred',
      severity: event.severity || 'medium',
      ...event
    });
  }

  updateMetric(key: string, value: any): void {
    this.metrics.set(key, value);
    console.log(`Metric updated: ${key} = ${value}`);
  }
}

// Singleton instance
let realtimeServer: RealTimeServer | null = null;

export function getRealTimeServer(): RealTimeServer {
  if (!realtimeServer) {
    realtimeServer = new RealTimeServer();
  }
  return realtimeServer;
}
