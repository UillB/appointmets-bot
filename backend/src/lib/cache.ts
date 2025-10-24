interface CacheItem<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}

export class MemoryCache {
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL: number;
  private readonly maxSize: number;

  constructor(defaultTTL: number = 300000, maxSize: number = 1000) { // 5 minutes default, 1000 items max
    this.defaultTTL = defaultTTL;
    this.maxSize = maxSize;
    
    // Clean up expired items every minute
    setInterval(() => this.cleanup(), 60000);
  }

  set<T>(key: string, value: T, ttl?: number): void {
    const now = Date.now();
    const expiresAt = now + (ttl || this.defaultTTL);
    
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }
    
    this.cache.set(key, {
      value,
      expiresAt,
      createdAt: now
    });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value as T;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    oldestItem: number;
    newestItem: number;
  } {
    const items = Array.from(this.cache.values());
    const now = Date.now();
    
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // Would need to track hits/misses
      oldestItem: items.length > 0 ? Math.min(...items.map(item => now - item.createdAt)) : 0,
      newestItem: items.length > 0 ? Math.max(...items.map(item => now - item.createdAt)) : 0
    };
  }
}

// Global cache instance
export const cache = new MemoryCache();

// Cache decorator for methods
export function cached(ttl?: number) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const cacheKeyPrefix = `${target.constructor.name}.${propertyName}`;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${cacheKeyPrefix}:${JSON.stringify(args)}`;
      
      // Try to get from cache first
      const cached = cache.get(cacheKey);
      if (cached !== null) {
        return cached;
      }
      
      // Execute method and cache result
      const result = await method.apply(this, args);
      cache.set(cacheKey, result, ttl);
      
      return result;
    };

    return descriptor;
  };
}

// Cache utilities for common operations
export class CacheUtils {
  static async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = cache.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    const value = await factory();
    cache.set(key, value, ttl);
    return value;
  }

  static async getOrSetSync<T>(
    key: string,
    factory: () => T,
    ttl?: number
  ): Promise<T> {
    const cached = cache.get<T>(key);
    if (cached !== null) {
      return cached;
    }
    
    const value = factory();
    cache.set(key, value, ttl);
    return value;
  }

  static invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of cache['cache'].keys()) {
      if (regex.test(key)) {
        cache.delete(key);
      }
    }
  }

  static invalidateOrganization(organizationId: number): void {
    this.invalidatePattern(`.*organizationId.*${organizationId}.*`);
  }

  static invalidateUser(userId: number): void {
    this.invalidatePattern(`.*userId.*${userId}.*`);
  }
}

// Database query result caching
export class DatabaseCache {
  private static readonly CACHE_PREFIX = 'db:';
  
  static async getCachedQuery<T>(
    queryKey: string,
    queryFn: () => Promise<T>,
    ttl: number = 300000 // 5 minutes
  ): Promise<T> {
    const cacheKey = `${this.CACHE_PREFIX}${queryKey}`;
    return CacheUtils.getOrSet(cacheKey, queryFn, ttl);
  }
  
  static invalidateQuery(queryKey: string): void {
    const cacheKey = `${this.CACHE_PREFIX}${queryKey}`;
    cache.delete(cacheKey);
  }
  
  static invalidateOrganizationQueries(organizationId: number): void {
    CacheUtils.invalidatePattern(`${this.CACHE_PREFIX}.*organizationId.*${organizationId}.*`);
  }
}
