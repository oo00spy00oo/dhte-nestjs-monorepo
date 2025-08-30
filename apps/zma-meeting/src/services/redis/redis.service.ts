import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType, SetOptions } from 'redis';

import { appConfiguration } from '../../configuration';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;
  private readonly appConfig: ReturnType<typeof appConfiguration>;

  constructor(private readonly configService: ConfigService) {
    this.appConfig = appConfiguration(this.configService);
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
}
