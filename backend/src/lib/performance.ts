import { performance } from 'perf_hooks';

export interface PerformanceMetrics {
  operation: string;
  duration: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 1000; // Keep only last 1000 metrics

  startTimer(operation: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.recordMetric({
        operation,
        duration,
        timestamp: new Date()
      });
    };
  }

  recordMetric(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only the last maxMetrics entries
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(operation?: string): PerformanceMetrics[] {
    if (operation) {
      return this.metrics.filter(m => m.operation === operation);
    }
    return [...this.metrics];
  }

  getAverageDuration(operation: string): number {
    const operationMetrics = this.getMetrics(operation);
    if (operationMetrics.length === 0) return 0;
    
    const totalDuration = operationMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    return totalDuration / operationMetrics.length;
  }

  getSlowestOperations(limit: number = 10): PerformanceMetrics[] {
    return [...this.metrics]
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  getRecentMetrics(minutes: number = 5): PerformanceMetrics[] {
    const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
    return this.metrics.filter(metric => metric.timestamp > cutoffTime);
  }

  clearMetrics(): void {
    this.metrics = [];
  }

  getPerformanceReport(): {
    totalOperations: number;
    averageDuration: number;
    slowestOperations: PerformanceMetrics[];
    recentMetrics: PerformanceMetrics[];
  } {
    const recentMetrics = this.getRecentMetrics(5);
    const totalDuration = recentMetrics.reduce((sum, metric) => sum + metric.duration, 0);
    
    return {
      totalOperations: recentMetrics.length,
      averageDuration: recentMetrics.length > 0 ? totalDuration / recentMetrics.length : 0,
      slowestOperations: this.getSlowestOperations(5),
      recentMetrics: recentMetrics.slice(-10) // Last 10 operations
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Decorator for automatic performance monitoring
export function monitorPerformance(operationName: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const endTimer = performanceMonitor.startTimer(operationName);
      try {
        const result = await method.apply(this, args);
        return result;
      } finally {
        endTimer();
      }
    };

    return descriptor;
  };
}

// Middleware for Express routes
export function performanceMiddleware(req: any, res: any, next: any) {
  const operation = `${req.method} ${req.path}`;
  const endTimer = performanceMonitor.startTimer(operation);
  
  res.on('finish', () => {
    endTimer();
  });
  
  next();
}

// Database query optimization helpers
export class QueryOptimizer {
  static async optimizeQuery<T>(
    queryFn: () => Promise<T>,
    operation: string,
    options: {
      cache?: boolean;
      timeout?: number;
      retries?: number;
    } = {}
  ): Promise<T> {
    const endTimer = performanceMonitor.startTimer(`db_${operation}`);
    
    try {
      const result = await queryFn();
      endTimer();
      return result;
    } catch (error) {
      endTimer();
      throw error;
    }
  }

  static async batchQueries<T>(
    queries: Array<() => Promise<T>>,
    operation: string
  ): Promise<T[]> {
    const endTimer = performanceMonitor.startTimer(`batch_${operation}`);
    
    try {
      const results = await Promise.all(queries.map(query => query()));
      endTimer();
      return results;
    } catch (error) {
      endTimer();
      throw error;
    }
  }
}

// Memory usage monitoring
export function getMemoryUsage(): {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
  arrayBuffers: number;
} {
  const usage = process.memoryUsage();
  return {
    rss: Math.round(usage.rss / 1024 / 1024), // MB
    heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
    heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
    external: Math.round(usage.external / 1024 / 1024), // MB
    arrayBuffers: Math.round(usage.arrayBuffers / 1024 / 1024) // MB
  };
}

// CPU usage monitoring
export function getCPUUsage(): {
  cpuUsage: NodeJS.CpuUsage;
  uptime: number;
} {
  return {
    cpuUsage: process.cpuUsage(),
    uptime: process.uptime()
  };
}
