import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModuleOptions, MongooseOptionsFactory } from '@nestjs/mongoose';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  createMongooseOptions(): MongooseModuleOptions {
    return {
      uri: this.configService.get<string>('DATABASE_MONGO_URI'),
      // Add optimized connection pool settings
      connectionFactory: (connection) => {
        connection.on('connected', () => {
          Logger.log('MongoDB connected', 'ZMA');
        });
        return connection;
      },
      maxPoolSize: this.configService.get<number>('DATABASE_MONGO_MAX_POOL_SIZE', 100), // Adjust based on workload
      minPoolSize: this.configService.get<number>('DATABASE_MONGO_MIN_POOL_SIZE', 10),
      serverSelectionTimeoutMS: this.configService.get<number>(
        'DATABASE_MONGO_SERVER_SELECTION_TIMEOUT_MS',
        5000,
      ),
      socketTimeoutMS: this.configService.get<number>('DATABASE_MONGO_SOCKET_TIMEOUT_MS', 45000),
      autoSelectFamily: this.configService.get<boolean>('DATABASE_MONGO_AUTO_SELECT_FAMILY', true),
    };
  }
}
