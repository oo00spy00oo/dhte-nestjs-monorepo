# zma-middlewares

This library was generated with [Nx](https://nx.dev).

## Building

Run `nx build zma-middlewares` to build the library.

## Running unit tests

Run `nx test zma-middlewares` to execute the unit tests via [Jest](https://jestjs.io).

```ts
import { ExecutionContext } from '@nestjs/common';
import { UseInterceptors } from '@nestjs/graphql';
import { CacheInterceptor, CacheResponse } from './cache.interceptor';

/**
 * Example usage patterns for the flexible CacheInterceptor
 */

/**
 * 1. Basic caching with default TTL (60 seconds) and prefix
 */
@UseInterceptors(CacheInterceptor)
@CacheResponse()
async basicCachedMethod() {
  // Will use default TTL (60s) and prefix ('cache:')
}

/**
 * 2. Custom TTL and prefix
 */
@UseInterceptors(CacheInterceptor)
@CacheResponse({
  ttl: 300, // 5 minutes
  keyPrefix: 'long-cache:'
})
async longCachedMethod() {
  // Cached for 5 minutes with custom prefix
}

/**
 * 3. Custom key generator with prefix
 */
@UseInterceptors(CacheInterceptor)
@CacheResponse({
  ttl: 180, // 3 minutes
  keyPrefix: 'user-service:',
  keyGenerator: (args, context: ExecutionContext) => {
    const userId = args[0];
    const filters = args[1];
    return `user-service:bookings:${userId}:${JSON.stringify(filters)}`;
  },
})
async getUserBookings(userId: string, filters: any) {
  // Custom cache key with service prefix
}

/**
 * 4. Conditional caching
 */
@UseInterceptors(CacheInterceptor)
@CacheResponse({
  ttl: 120,
  condition: (args, context: ExecutionContext) => {
    const status = args[0];
    // Only cache completed bookings (they don't change)
    return status === 'COMPLETED';
  },
})
async getBookingByStatus(status: string) {
  // Only caches when status is 'COMPLETED'
}

/**
 * 5. Complex cache configuration
 */
@UseInterceptors(CacheInterceptor)
@CacheResponse({
  ttl: 60,
  keyGenerator: (args, context: ExecutionContext) => {
    const bookingId = args[0];
    const includeSensitive = args[1];
    // Different cache keys for sensitive vs non-sensitive data
    return `booking:${bookingId}:sensitive:${includeSensitive}`;
  },
  condition: (args, context: ExecutionContext) => {
    const includeSensitive = args[1];
    // Don't cache sensitive data
    return !includeSensitive;
  },
})
async getBookingDetails(bookingId: string, includeSensitive: boolean) {
  // Complex caching logic
}

/**
 * 6. Short-lived cache for frequently changing data
 */
@UseInterceptors(CacheInterceptor)
@CacheResponse({
  ttl: 10, // 10 seconds - very short for real-time data
  keyGenerator: (args) => {
    const driverId = args[0];
    return `driver-location:${driverId}`;
  },
})
async getDriverLocation(driverId: string) {
  // Short cache for location data
}
```
