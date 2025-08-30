import { Logger } from '@nestjs/common';

import { CONFIG_CONSTANTS } from './config-constants';
import { configProcessor } from './config-processor';
import { EnvironmentVariables, FlattenedConfig } from './config-types';

export class EnvironmentProcessor {
  private readonly logger = new Logger(CONFIG_CONSTANTS.LOGGER_CONTEXT);

  /**
   * Parses environment variables, handling JSON arrays and processing configuration
   */
  parseEnvironmentConfig(): Record<string, unknown> {
    this.logger.log('Parsing environment configuration...');

    const config: Record<string, unknown> = {};

    // Parse environment variables, handling JSON arrays
    Object.entries(process.env).forEach(([key, value]) => {
      if (typeof value === 'string') {
        config[key] = this.parseEnvironmentValue(value);
      } else {
        config[key] = value;
      }
    });

    // Process the configuration through the config processor
    return configProcessor.processEnvironmentConfig(config);
  }

  /**
   * Loads configuration into environment variables
   */
  async loadConfigurationIntoEnv(config: Record<string, unknown>): Promise<FlattenedConfig> {
    this.logger.log('Loading configuration into environment variables...');

    const flatConfig = configProcessor.flattenObjectToEnvStyle(config);

    Object.entries(flatConfig).forEach(([key, value]) => {
      const stringValue = this.convertToEnvironmentValue(value);
      process.env[key] = stringValue;
      this.logger.debug(`Set environment variable: ${key}`);
    });

    return flatConfig as FlattenedConfig;
  }

  /**
   * Gets typed environment variables with defaults
   */
  getTypedEnvironmentVariables(): EnvironmentVariables {
    return {
      NODE_ENV: process.env['NODE_ENV'],
      CONFIG_SERVER_URL: process.env['CONFIG_SERVER_URL'],
      SERVICE_NAME: process.env['SERVICE_NAME'],
      CONFIG_SOURCE: process.env['CONFIG_SOURCE'] as 'file' | 'url' | undefined,
      DATABASE_MONGO_HOST: process.env['DATABASE_MONGO_HOST'],
      DATABASE_MONGO_USERNAME: process.env['DATABASE_MONGO_USERNAME'],
      DATABASE_MONGO_PASSWORD: process.env['DATABASE_MONGO_PASSWORD'],
      DATABASE_MONGO_URI: process.env['DATABASE_MONGO_URI'],
      NATS_SERVERS: process.env['NATS_SERVERS'],
      NATS_URI: process.env['NATS_URI'],
      ELASTICSEARCH_NODE: process.env['ELASTICSEARCH_NODE'],
      ELASTICSEARCH_API_KEY: process.env['ELASTICSEARCH_API_KEY'],
      MEILISEARCH_API_KEY: process.env['MEILISEARCH_API_KEY'],
    };
  }

  /**
   * Validates that required environment variables are present
   */
  validateRequiredEnvironmentVariables(requiredVars: string[]): void {
    const missing = requiredVars.filter((varName) => !process.env[varName]);

    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }

  /**
   * Parses a string environment value, handling JSON arrays
   */
  private parseEnvironmentValue(value: string): unknown {
    // Handle JSON arrays and objects
    if (this.isJsonValue(value)) {
      try {
        return JSON.parse(value);
      } catch {
        this.logger.warn(`Failed to parse JSON value for environment variable: ${value}`);
        return value;
      }
    }

    // Handle boolean strings
    if (value.toLowerCase() === 'true') return true;
    if (value.toLowerCase() === 'false') return false;

    // Handle numeric strings
    if (this.isNumericString(value)) {
      const numValue = Number(value);
      if (!isNaN(numValue)) return numValue;
    }

    return value;
  }

  /**
   * Converts a value to a string suitable for environment variables
   */
  private convertToEnvironmentValue(value: unknown): string {
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }

    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value);
    }

    return String(value);
  }

  /**
   * Checks if a string looks like JSON (starts with [ or {)
   */
  private isJsonValue(value: string): boolean {
    return value.trim().startsWith('[') || value.trim().startsWith('{');
  }

  /**
   * Checks if a string represents a number
   */
  private isNumericString(value: string): boolean {
    return /^-?\d+(?:\.\d+)?$/.test(value.trim());
  }
}

export const environmentProcessor = new EnvironmentProcessor();
