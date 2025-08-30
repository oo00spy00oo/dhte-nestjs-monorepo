import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType, SetOptions } from 'redis';

import { appConfiguration } from '../../configuration';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;

  constructor(
    @Inject('APP_CONFIG') private readonly appConfig: ReturnType<typeof appConfiguration>,
  ) {
    this.client = createClient({
      url: this.appConfig.redis.url,
    });
    this.client.on('error', (err) => this.logger.error('Redis/Dragonfly Client Error', err));
  }

  async onModuleInit(): Promise<void> {
    await this.client.connect();
  }

  async set<T>({
    key,
    value,
    options,
  }: {
    key: string;
    value: T;
    options?: SetOptions;
  }): Promise<boolean> {
    const data = JSON.stringify(value);
    const result = await this.client.set(key, data, options);
    return result === 'OK';
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return typeof data === 'string' ? (JSON.parse(data) as T) : null;
  }

  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }

  async eval({
    script,
    keys,
    args,
  }: {
    script: string;
    keys: string[];
    args: string[];
  }): Promise<number | string | null> {
    const result: unknown = await this.client.eval(script, { keys, arguments: args });

    // Handle null/undefined
    if (result === null || result === undefined) {
      return null;
    }

    // Convert bigint to number for compatibility
    if (typeof result === 'bigint') {
      return Number(result);
    }

    // Return only expected primitive types
    if (typeof result === 'string' || typeof result === 'number') {
      return result;
    }

    // Throw error for unexpected types to ensure type safety
    const resultType = Array.isArray(result) ? 'array' : typeof result;
    throw new Error(
      `Redis eval returned unexpected type: ${resultType}. ` +
        `Expected string, number, bigint, null, or undefined. ` +
        `Received: ${JSON.stringify(result)}`,
    );
  }
}
