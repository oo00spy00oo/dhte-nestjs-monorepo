import { HealthIndicatorResult } from '@nestjs/terminus';

export async function healthCheckPerformanceMetrics(): Promise<HealthIndicatorResult> {
  const eventLoopDelay = await measureEventLoopDelay();
  const isPerformant = eventLoopDelay < 100; // Less than 100ms is good

  return {
    performance: {
      status: isPerformant ? 'up' : 'down',
      eventLoopDelay: `${eventLoopDelay}ms`,
      ...(isPerformant ? {} : { message: 'High event loop delay detected' }),
    },
  };
}

async function measureEventLoopDelay(): Promise<number> {
  return new Promise((resolve) => {
    const start = process.hrtime.bigint();
    setImmediate(() => {
      const delay = Number(process.hrtime.bigint() - start) / 1000000; // Convert to ms
      resolve(Math.round(delay * 100) / 100); // Round to 2 decimal places
    });
  });
}
