import { Router, Request, Response } from 'express';
import { performanceMonitor, getMemoryUsage, getCPUUsage } from '../../lib/performance';
import { cache } from '../../lib/cache';

const router = Router();

// GET /api/performance/metrics - Get performance metrics
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const report = performanceMonitor.getPerformanceReport();
    const memoryUsage = getMemoryUsage();
    const cpuUsage = getCPUUsage();
    const cacheStats = cache.getStats();

    res.json({
      performance: {
        ...report,
        memoryUsage,
        cpuUsage,
        cacheStats
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/performance/health - Get system health status
router.get('/health', async (req: Request, res: Response) => {
  try {
    const memoryUsage = getMemoryUsage();
    const cpuUsage = getCPUUsage();
    const recentMetrics = performanceMonitor.getRecentMetrics(5);
    
    // Calculate health score based on various factors
    let healthScore = 100;
    
    // Memory usage penalty
    if (memoryUsage.heapUsed > 500) { // More than 500MB
      healthScore -= 20;
    }
    
    // CPU usage penalty (if we had real-time CPU monitoring)
    if (cpuUsage.uptime < 60) { // System just started
      healthScore -= 10;
    }
    
    // Response time penalty
    const avgResponseTime = recentMetrics.length > 0 
      ? recentMetrics.reduce((sum, metric) => sum + metric.duration, 0) / recentMetrics.length
      : 0;
    
    if (avgResponseTime > 1000) { // More than 1 second
      healthScore -= 30;
    } else if (avgResponseTime > 500) { // More than 500ms
      healthScore -= 15;
    }
    
    const status = healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'critical';
    
    res.json({
      status,
      healthScore,
      metrics: {
        memoryUsage,
        cpuUsage,
        avgResponseTime,
        recentOperations: recentMetrics.length
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking system health:', error);
    res.status(500).json({ 
      status: 'error',
      error: 'Internal server error' 
    });
  }
});

// POST /api/performance/clear-cache - Clear application cache
router.post('/clear-cache', async (req: Request, res: Response) => {
  try {
    cache.clear();
    
    res.json({
      message: 'Cache cleared successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/performance/slow-queries - Get slowest queries
router.get('/slow-queries', async (req: Request, res: Response) => {
  try {
    const slowestOperations = performanceMonitor.getSlowestOperations(20);
    
    res.json({
      slowestOperations,
      count: slowestOperations.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching slow queries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/performance/operations/:operation - Get metrics for specific operation
router.get('/operations/:operation', async (req: Request, res: Response) => {
  try {
    const { operation } = req.params;
    const metrics = performanceMonitor.getMetrics(operation);
    const avgDuration = performanceMonitor.getAverageDuration(operation);
    
    res.json({
      operation,
      metrics,
      averageDuration: avgDuration,
      count: metrics.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching operation metrics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
