import { StreamingProxy, SystemStats, HealthCheckResult } from '..';

export type RealTimeUpdate = 
  | {
      type: 'proxy_status';
      data: StreamingProxy;
      timestamp: Date;
    }
  | {
      type: 'stream_count';
      data: { proxyId: string; count: number };
      timestamp: Date;
    }
  | {
      type: 'health_check';
      data: HealthCheckResult;
      timestamp: Date;
    }
  | {
      type: 'system_stats';
      data: SystemStats;
      timestamp: Date;
    };
