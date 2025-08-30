export interface DatabaseConfig {
  mongo: {
    uri: string;
  };
}

export interface NatsConfig {
  uri: string;
}

export interface ElasticsearchConfig {
  node: string;
  apiKey: string;
}

export interface MeilisearchConfig {
  apiKey: string;
}

export interface AppConfig {
  database?: DatabaseConfig;
  nats?: NatsConfig;
  elasticsearch?: ElasticsearchConfig;
  meilisearch?: MeilisearchConfig;
  [key: string]: unknown;
}

export interface EnvironmentVariables {
  NODE_ENV?: string;
  CONFIG_SERVER_URL?: string;
  SERVICE_NAME?: string;
  CONFIG_SOURCE?: 'file' | 'url';
  DATABASE_MONGO_HOST?: string;
  DATABASE_MONGO_USERNAME?: string;
  DATABASE_MONGO_PASSWORD?: string;
  DATABASE_MONGO_URI?: string;
  NATS_SERVERS?: string;
  NATS_URI?: string;
  ELASTICSEARCH_NODE?: string;
  ELASTICSEARCH_API_KEY?: string;
  MEILISEARCH_API_KEY?: string;
}

export interface ConfigProcessorOptions {
  config: Record<string, unknown>;
  configPath: string;
  envVars: Record<string, string>;
  replacements?: Record<string, string>;
}

export interface ServiceConfigDefinition {
  configPath: string;
  envVarPath?: string;
  requiredEnvVars: readonly string[];
  replacements: Record<string, string>;
}

export interface ConfigLoaderOptions {
  configFileName?: string;
  configServerUrl?: string;
  serviceName?: string;
  nodeEnv?: string;
  configSource?: 'file' | 'url';
}

export type FlattenedConfig = Record<string, string | number | boolean | unknown[]>;
