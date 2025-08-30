/* eslint-disable @typescript-eslint/no-explicit-any */
import { Logger } from '@nestjs/common';

import { CONFIG_CONSTANTS } from './config-constants';
import { configLoader } from './config-loader';
import { configProcessor } from './config-processor';
import { AppConfig, ConfigLoaderOptions, FlattenedConfig } from './config-types';
import { environmentProcessor } from './environment-processor';

const logger = new Logger(CONFIG_CONSTANTS.LOGGER_CONTEXT);

/**
 * Main configuration function that loads and processes configuration from YAML files or config server
 * @param options Optional configuration loader options
 * @returns Processed application configuration
 */
export const configuration = async (options?: ConfigLoaderOptions): Promise<AppConfig> => {
  try {
    logger.log('Starting configuration loading process...');

    // Load raw configuration
    const rawConfig = await configLoader.loadConfiguration(options);

    // Process configuration (handle placeholders, environment variables, etc.)
    const processedConfig = configProcessor.processConfiguration(rawConfig);

    logger.log('Configuration loading completed successfully');
    return processedConfig;
  } catch (error) {
    logger.error(
      `Configuration loading failed: ${error}`,
      error instanceof Error ? error.stack : undefined,
    );
    throw error;
  }
};

/**
 * Parses configuration from environment variables
 * Handles JSON arrays and processes service-specific configurations
 * @returns Parsed configuration object
 */
export const parseConfig = (): Record<string, any> => {
  try {
    logger.log('Starting environment configuration parsing...');

    const config = environmentProcessor.parseEnvironmentConfig();

    logger.log('Environment configuration parsing completed successfully');
    return config;
  } catch (error) {
    logger.error(
      `Environment configuration parsing failed: ${error}`,
      error instanceof Error ? error.stack : undefined,
    );
    throw error;
  }
};

/**
 * Loads YAML configuration and flattens it into environment variables
 * @param options Optional configuration loader options
 * @returns Flattened configuration object
 */
export const loadConfigurationIntoEnv = async (
  options?: ConfigLoaderOptions,
): Promise<FlattenedConfig> => {
  try {
    logger.log('Starting configuration load into environment...');

    // Load and process configuration
    const config = await configuration(options);

    // Flatten and load into environment
    const flattenedConfig = await environmentProcessor.loadConfigurationIntoEnv(config);

    logger.log('Configuration successfully loaded into environment variables');
    return flattenedConfig;
  } catch (error) {
    logger.error(
      `Loading configuration into environment failed: ${error}`,
      error instanceof Error ? error.stack : undefined,
    );
    throw error;
  }
};

/**
 * Utility function to flatten nested objects to environment variable style
 * @param obj Object to flatten
 * @param parentKey Parent key for nested properties
 * @param result Result accumulator
 * @returns Flattened object with uppercase keys
 */
export const flattenObjectToEnvStyle = (
  obj: Record<string, any>,
  parentKey = '',
  result: Record<string, any> = {},
): Record<string, any> => {
  return configProcessor.flattenObjectToEnvStyle(obj, parentKey, result);
};

/**
 * Gets typed environment variables
 * @returns Typed environment variables object
 */
export const getEnvironmentVariables = () => {
  return environmentProcessor.getTypedEnvironmentVariables();
};

/**
 * Validates that required environment variables are present
 * @param requiredVars Array of required environment variable names
 * @throws Error if any required variables are missing
 */
export const validateRequiredEnvironmentVariables = (requiredVars: string[]): void => {
  environmentProcessor.validateRequiredEnvironmentVariables(requiredVars);
};

// Export instances for direct access if needed
export { configLoader, configProcessor, environmentProcessor };

// Export types and constants
export * from './config-constants';
export * from './config-types';
