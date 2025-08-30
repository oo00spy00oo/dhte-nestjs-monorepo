import { Logger } from '@nestjs/common';
import Joi from 'joi';
import _ from 'lodash';

import { CONFIG_CONSTANTS, SERVICE_CONFIG_DEFINITIONS } from './config-constants';
import { AppConfig, ConfigProcessorOptions } from './config-types';

export class ConfigProcessor {
  private readonly logger = new Logger(CONFIG_CONSTANTS.LOGGER_CONTEXT);

  processConfiguration(config: AppConfig): AppConfig {
    this.logger.log('Processing configuration...');

    // Process all service configurations
    Object.entries(SERVICE_CONFIG_DEFINITIONS).forEach(([serviceName, definition]) => {
      try {
        this.processServiceConfig(config, definition);
        this.logger.debug(`Successfully processed ${serviceName} configuration`);
      } catch (error) {
        this.logger.error(`Failed to process ${serviceName} configuration: ${error}`);
        throw error;
      }
    });

    return config;
  }

  processEnvironmentConfig(config: Record<string, unknown>): Record<string, unknown> {
    this.logger.log('Processing environment configuration...');

    // Process all service configurations for environment variables
    Object.entries(SERVICE_CONFIG_DEFINITIONS).forEach(([serviceName, definition]) => {
      if (definition.envVarPath) {
        try {
          this.processServiceConfigForEnv(config, definition);
          this.logger.debug(`Successfully processed ${serviceName} environment configuration`);
        } catch (error) {
          this.logger.error(`Failed to process ${serviceName} environment configuration: ${error}`);
          throw error;
        }
      }
    });

    return config;
  }

  private processServiceConfig(
    config: AppConfig,
    definition: (typeof SERVICE_CONFIG_DEFINITIONS)[keyof typeof SERVICE_CONFIG_DEFINITIONS],
  ): void {
    this.processConfigPath({
      config,
      configPath: definition.configPath,
      envVars: this.getEnvVarsFromDefinition(definition),
      replacements: this.getReplacementsFromDefinition(definition),
    });
  }

  private processServiceConfigForEnv(
    config: Record<string, unknown>,
    definition: (typeof SERVICE_CONFIG_DEFINITIONS)[keyof typeof SERVICE_CONFIG_DEFINITIONS],
  ): void {
    if (!definition.envVarPath) return;

    this.processConfigPath({
      config,
      configPath: definition.envVarPath,
      envVars: this.getEnvVarsFromDefinition(definition),
      replacements: this.getReplacementsFromDefinition(definition),
    });
  }

  private processConfigPath(options: ConfigProcessorOptions): void {
    const { config, configPath, envVars, replacements } = options;

    if (!_.get(config, configPath)) {
      this.logger.debug(`Config path ${configPath} not found, skipping processing`);
      return;
    }

    // Validate environment variables
    this.validateEnvironmentVariables(envVars);

    // Replace placeholders in the configuration value
    let configValue = _.get(config, configPath);
    if (replacements && typeof configValue === 'string') {
      configValue = this.replacePlaceholders(configValue, replacements);
    }

    _.set(config, configPath, configValue);
  }

  private validateEnvironmentVariables(envVars: Record<string, string>): void {
    const schema = Joi.object(
      Object.fromEntries(Object.keys(envVars).map((key) => [key, Joi.string().required()])),
    );

    const { error } = schema.validate(envVars);
    if (error) {
      throw new Error(`Environment variables validation failed: ${error.message}`);
    }
  }

  private replacePlaceholders(value: string, replacements: Record<string, string>): string {
    let result = value;

    Object.entries(replacements).forEach(([placeholder, envVarName]) => {
      const envValue = process.env[envVarName];
      if (envValue) {
        result = result.replace(new RegExp(_.escapeRegExp(placeholder), 'g'), envValue);
      }
    });

    return result;
  }

  private getEnvVarsFromDefinition(
    definition: (typeof SERVICE_CONFIG_DEFINITIONS)[keyof typeof SERVICE_CONFIG_DEFINITIONS],
  ): Record<string, string> {
    const envVars: Record<string, string> = {};

    definition.requiredEnvVars.forEach((envVarName: string) => {
      const value = process.env[envVarName];
      if (value !== undefined) {
        envVars[envVarName] = value;
      }
    });

    return envVars;
  }

  private getReplacementsFromDefinition(
    definition: (typeof SERVICE_CONFIG_DEFINITIONS)[keyof typeof SERVICE_CONFIG_DEFINITIONS],
  ): Record<string, string> {
    return definition.replacements;
  }

  /**
   * Flattens a nested configuration object to environment variable style
   * Example: { database: { mongo: { uri: 'value' } } } becomes { DATABASE_MONGO_URI: 'value' }
   */
  flattenObjectToEnvStyle(
    obj: Record<string, unknown>,
    parentKey = '',
    result: Record<string, unknown> = {},
  ): Record<string, unknown> {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const snakeKey = this.camelToSnakeCase(key);
        const newKey = parentKey ? `${parentKey}_${snakeKey}` : snakeKey;
        const value = obj[key];

        if (this.isNestedObject(value)) {
          this.flattenObjectToEnvStyle(value as Record<string, unknown>, newKey, result);
        } else {
          result[newKey.toUpperCase()] = value;
        }
      }
    }
    return result;
  }

  private camelToSnakeCase(str: string): string {
    return str.replace(/([A-Z])/g, '_$1').toLowerCase();
  }

  private isNestedObject(value: unknown): boolean {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }
}

export const configProcessor = new ConfigProcessor();
