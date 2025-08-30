import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RoleOutput } from '@zma-nestjs-monorepo/zma-types/outputs/rbac';
import Redis from 'ioredis';

@Injectable()
export class RbacService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RbacService.name);
  private readonly redisClient: Redis;
  private readonly keyPrefix = 'rbac';
  private readonly defaultTTL = 3600; // 1 hour in seconds

  constructor(private readonly appConfigService: ConfigService) {
    this.redisClient = new Redis({
      host: this.appConfigService.get('REDIS_RBAC_HOST'),
      port: this.appConfigService.get('REDIS_RBAC_PORT'),
      password: this.appConfigService.get('REDIS_RBAC_PASSWORD') || undefined,
      db: this.appConfigService.get('REDIS_RBAC_DB') || 0,
      lazyConnect: true,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.redisClient.connect();
      this.logger.log('Successfully connected to Redis');
    } catch (error) {
      this.logger.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.redisClient.quit();
      this.logger.log('Redis connection closed');
    } catch (error) {
      this.logger.error('Failed to close Redis connection:', error);
    }
  }

  /**
   * Get cached role
   */
  async getRole(roleId: string): Promise<RoleOutput | null> {
    try {
      const cacheKey = `${this.keyPrefix}:role:${roleId}`;
      const result = await this.redisClient.get(cacheKey);

      if (result) {
        this.logger.debug(`Cache hit for role: ${roleId}`);
        return JSON.parse(result) as RoleOutput;
      }

      this.logger.debug(`Cache miss for role: ${roleId}`);
      return null;
    } catch (error) {
      this.logger.error(`Failed to get role from cache for role ${roleId}:`, error);
      return null;
    }
  }

  /**
   * Get cached roles
   */
  async getRoles(roleIds: string[] | undefined): Promise<RoleOutput[]> {
    if (!roleIds) {
      return [];
    }
    try {
      const roles = [];
      for (const roleId of roleIds) {
        const role = await this.getRole(roleId);
        if (role) {
          roles.push(role);
        }
      }

      return roles;
    } catch (error) {
      this.logger.error(`Failed to get roles from cache for roles ${roleIds.join(',')}:`, error);
      return [];
    }
  }

  /**
   * Set cached role
   */
  async setRole(roleId: string, role: RoleOutput): Promise<void> {
    try {
      const cacheKey = `${this.keyPrefix}:role:${roleId}`;
      await this.redisClient.setex(cacheKey, this.defaultTTL, JSON.stringify(role));

      this.logger.debug(`Cached role: ${roleId}`);
    } catch (error) {
      this.logger.error(`Failed to cache role ${roleId}:`, error);
      throw error;
    }
  }

  async setUserRoles(userId: string, roles: RoleOutput[]): Promise<void> {
    try {
      const cacheKey = `${this.keyPrefix}:user:${userId}`;
      const roleIds = roles.map((role) => role.id);
      await this.redisClient.setex(cacheKey, this.defaultTTL, JSON.stringify(roleIds));
      for (const role of roles) {
        await this.setRole(role.id, role);
      }
    } catch (error) {
      this.logger.error(`Failed to cache user roles for user ${userId}:`, error);
      throw error;
    }
  }

  async getUserRoles(userId: string): Promise<RoleOutput[]> {
    try {
      const cacheKey = `${this.keyPrefix}:user:${userId}`;
      const result = await this.redisClient.get(cacheKey);
      const roleIds = result ? (JSON.parse(result) as string[]) : [];
      return this.getRoles(roleIds);
    } catch (error) {
      this.logger.error(`Failed to get user roles for user ${userId}:`, error);
      return [];
    }
  }

  /**
   * Clear all RBAC cache entries
   */
  async clearAllCache(): Promise<void> {
    try {
      const pattern = `${this.keyPrefix}:*`;
      const keys = await this.redisClient.keys(pattern);

      if (keys.length > 0) {
        await this.redisClient.del(...keys);
        this.logger.log(`Cleared ${keys.length} cache entries`);
      } else {
        this.logger.log('No cache entries found to clear');
      }
    } catch (error) {
      this.logger.error('Failed to clear all cache:', error);
    }
  }
}
