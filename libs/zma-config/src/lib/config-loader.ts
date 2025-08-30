import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { Logger } from '@nestjs/common';
import axios from 'axios';
import { Effect, Schedule, pipe } from 'effect';
import * as yaml from 'js-yaml';

import { CONFIG_CONSTANTS } from './config-constants';
import { AppConfig, ConfigLoaderOptions } from './config-types';

export class ConfigLoader {
  private readonly logger = new Logger(CONFIG_CONSTANTS.LOGGER_CONTEXT);

  async loadConfiguration(options: ConfigLoaderOptions = {}): Promise<AppConfig> {
    const {
      configFileName = CONFIG_CONSTANTS.YAML_CONFIG_FILENAME,
      configServerUrl = process.env['CONFIG_SERVER_URL'],
      serviceName = process.env['SERVICE_NAME'],
      nodeEnv = process.env['NODE_ENV'],
      configSource,
    } = options;

    this.logger.log('Config loading...');

    const configContent = await this.getConfigurationContent({
      configFileName,
      configServerUrl,
      serviceName,
      nodeEnv,
      configSource,
    });

    const config = yaml.load(configContent) as AppConfig;

    if (!config) {
      throw new Error('Failed to parse configuration content');
    }

    return config;
  }

  private async getConfigurationContent(options: {
    configFileName: string;
    configServerUrl?: string;
    serviceName?: string;
    nodeEnv?: string;
    configSource?: 'file' | 'url';
  }): Promise<string> {
    const { configFileName, configServerUrl, serviceName, nodeEnv, configSource } = options;

    // Check for explicit CONFIG_SOURCE from options or environment variable
    const sourceToUse = configSource || process.env['CONFIG_SOURCE'];

    if (sourceToUse === 'file') {
      this.logger.log('Config source: file (explicit CONFIG_SOURCE=file)');
      return this.loadFromFile(configFileName);
    }

    if (sourceToUse === 'url') {
      this.logger.log('Config source: url (explicit CONFIG_SOURCE=url)');
      if (!configServerUrl || !serviceName || !nodeEnv) {
        throw new Error(
          'CONFIG_SERVER_URL, SERVICE_NAME, and NODE_ENV must be set when CONFIG_SOURCE=url',
        );
      }
      return this.loadFromConfigServer(configServerUrl, serviceName, nodeEnv);
    }

    // Fallback to original behavior if CONFIG_SOURCE is not set
    if (nodeEnv === CONFIG_CONSTANTS.DEVELOPMENT_ENV) {
      this.logger.log('Config source: file (default for development environment)');
      return this.loadFromFile(configFileName);
    }

    if (!configServerUrl || !serviceName || !nodeEnv) {
      throw new Error(
        'CONFIG_SERVER_URL, SERVICE_NAME, and NODE_ENV must be set for non-development environments',
      );
    }

    this.logger.log('Config source: url (default for non-development environment)');
    return this.loadFromConfigServer(configServerUrl, serviceName, nodeEnv);
  }

  private loadFromFile(configFileName: string): string {
    try {
      const filePath = join(__dirname, configFileName);
      const content = readFileSync(filePath, 'utf8');
      this.logger.log(`Config loaded from source: ${configFileName}`);
      return content;
    } catch (error) {
      this.logger.error(`Failed to load config file ${configFileName}: ${error}`);
      throw new Error(`Failed to load configuration file: ${configFileName}`);
    }
  }

  private async loadFromConfigServer(
    configServerUrl: string,
    serviceName: string,
    nodeEnv: string,
  ): Promise<string> {
    const configUrl = `${configServerUrl}/${serviceName}-${nodeEnv}.yaml`;
    this.logger.log(`Config URL: ${configUrl}`);

    const fetchConfig = Effect.tryPromise({
      try: () =>
        axios.get<string>(configUrl, {
          timeout: 10000, // 10 second timeout
          headers: {
            Accept: 'application/x-yaml, text/yaml, */*',
          },
        }),
      catch: (error) => {
        const errorMessage = axios.isAxiosError(error)
          ? `HTTP ${error.response?.status}: ${error.message}`
          : String(error);
        return new Error(`Failed to load config from ${configUrl}: ${errorMessage}`);
      },
    });

    const retrySchedule = Schedule.exponential('1 seconds').pipe(
      Schedule.intersect(Schedule.recurs(2)), // Retry 2 times (total 3 attempts)
      Schedule.tapOutput(([, attempt]) =>
        Effect.sync(() =>
          this.logger.warn(`Retrying config load from ${configUrl}, attempt ${attempt + 1}`),
        ),
      ),
    );

    const program = pipe(
      fetchConfig,
      Effect.map(({ data }) => {
        this.logger.log(`Config loaded from source: ${configUrl}`);
        this.logger.debug('Config value', data);
        return data;
      }),
      Effect.retry(retrySchedule),
      Effect.catchAll((error) =>
        Effect.fail(
          new Error(
            `Failed to load configuration from config server after 3 attempts: ${error.message}`,
          ),
        ),
      ),
      Effect.tapError((error) =>
        Effect.sync(() => {
          this.logger.error(
            `Failed to load config from ${configUrl} after 3 attempts: ${error.message}`,
          );
        }),
      ),
    );

    return Effect.runPromise(program);
  }
}

export const configLoader = new ConfigLoader();
