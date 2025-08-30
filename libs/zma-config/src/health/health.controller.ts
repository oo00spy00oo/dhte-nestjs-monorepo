import { Controller, Get, Logger } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckResult,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { Public } from '@zma-nestjs-monorepo/zma-decorators';

import { healthCheckPerformanceMetrics } from './performance.health';

const MEMORY_HEAP = Number(process.env['MEMORY_HEAP']) || 6 * 1024 * 1024 * 1024;
const MEMORY_RSS = Number(process.env['MEMORY_RSS']) || 6 * 1024 * 1024 * 1024;

@Public()
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Get('ready')
  @HealthCheck()
  async readiness(): Promise<HealthCheckResult> {
    return this.health.check([]);
  }

  @Get('live')
  @HealthCheck()
  async liveness(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    const result = await this.health.check([
      () => this.memory.checkHeap('memory-heap', MEMORY_HEAP), // 4GB
      () => this.memory.checkRSS('memory-rss', MEMORY_RSS), // 4GB
      () => healthCheckPerformanceMetrics(),
    ]);

    const duration = Date.now() - startTime;
    this.logger.log(`Health check completed in ${duration}ms`);

    return result;
  }

  @Get('metrics')
  async getMetrics() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();

    return {
      timestamp: new Date().toISOString(),
      uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m ${Math.floor(uptime % 60)}s`,
      memory: {
        rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
        external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
    };
  }
}
