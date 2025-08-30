# ZMA Configuration Library - Complete Guide

A modular, type-safe configuration management library for NestJS applications that supports YAML files, environment variables, and remote configuration servers.

## 🚀 Features

- **Modular Architecture**: Separated into focused modules for better maintainability
- **Type Safety**: Full TypeScript support with proper type definitions
- **Multi-Source Configuration**: Load from YAML files, environment variables, or remote config servers
- **Environment-Specific**: Different configurations for development, staging, and production
- **Validation**: Built-in validation for required environment variables
- **Service Integration**: Pre-configured support for MongoDB, NATS, Elasticsearch, and Meilisearch
- **Flexible Processing**: Template variable replacement and configuration transformation
- **Error Handling**: Comprehensive error handling with fallback mechanisms

## 📦 Installation

```bash
npm install @zma-nestjs-monorepo/zma-config
```

## 🏗️ Architecture

The library is organized into several focused modules:

```
zma-config/
├── config-types.ts          # Type definitions
├── config-constants.ts      # Constants and service definitions
├── config-loader.ts         # Configuration loading from files/servers
├── config-processor.ts      # Configuration processing and validation
├── environment-processor.ts # Environment variable handling
└── zma-config.lib.ts       # Main orchestration layer
```

### Core Modules

1. **ConfigLoader**: Handles loading configuration from YAML files or remote servers
2. **ConfigProcessor**: Processes configuration, handles template variables, and validates settings
3. **EnvironmentProcessor**: Manages environment variables and type conversions
4. **Main Library**: Orchestrates all modules and provides high-level API

## 🔧 Basic Usage

### Loading Configuration

```typescript
import { configuration } from '@zma-nestjs-monorepo/zma-config';

// Load configuration with default settings
const config = await configuration();

// Access configuration values
console.log('MongoDB URI:', config.database?.mongo?.uri);
console.log('NATS URI:', config.nats?.uri);
```

### Custom Configuration Options

```typescript
import { configuration } from '@zma-nestjs-monorepo/zma-config';

const config = await configuration({
  configFileName: 'my-app.yaml',
  configServerUrl: 'https://config.example.com',
  serviceName: 'my-service',
  nodeEnv: 'production'
});
```

### Environment Variable Processing

```typescript
import { parseConfig, getEnvironmentVariables } from '@zma-nestjs-monorepo/zma-config';

// Parse configuration from environment variables
const envConfig = parseConfig();

// Get typed environment variables
const typedEnvVars = getEnvironmentVariables();
console.log('Node Environment:', typedEnvVars.NODE_ENV);
```

### Loading Configuration into Environment

```typescript
import { loadConfigurationIntoEnv } from '@zma-nestjs-monorepo/zma-config';

// Load YAML config and flatten into environment variables
const flattenedConfig = await loadConfigurationIntoEnv();

// Now accessible via process.env
console.log('From env:', process.env.DATABASE_MONGO_URI);
```

## 🔧 Advanced Usage

### Direct Module Access

```typescript
import {
  configLoader,
  configProcessor,
  environmentProcessor
} from '@zma-nestjs-monorepo/zma-config';

// Use config loader directly
const rawConfig = await configLoader.loadConfiguration({
  nodeEnv: 'development'
});

// Process configuration manually
const processedConfig = configProcessor.processConfiguration(rawConfig);

// Handle environment variables
const envConfig = environmentProcessor.parseEnvironmentConfig();
```

### Configuration Validation

```typescript
import { validateRequiredEnvironmentVariables } from '@zma-nestjs-monorepo/zma-config';

const requiredVars = [
  'DATABASE_MONGO_HOST',
  'DATABASE_MONGO_USERNAME',
  'DATABASE_MONGO_PASSWORD'
];

try {
  validateRequiredEnvironmentVariables(requiredVars);
  console.log('All required variables are present');
} catch (error) {
  console.error('Missing required environment variables:', error);
}
```

## 🔧 Configuration Structure

### YAML Configuration Format

```yaml
database:
  mongo:
    uri: "mongodb://${username}:${password}@${host}:27017/myapp"

nats:
  uri: "nats://${hosts}"

elasticsearch:
  node: "https://${hosts}"
  apiKey: "${apiKey}"

meilisearch:
  apiKey: "${apiKey}"

# Custom application settings
app:
  name: "My Application"
  version: "1.0.0"
  features:
    - feature1
    - feature2
```

### Environment Variables

The library automatically processes these environment variables:

#### Core Configuration
- `NODE_ENV`: Environment (development, staging, production)
- `CONFIG_SERVER_URL`: Remote configuration server URL
- `SERVICE_NAME`: Service name for remote config
- `CONFIG_SOURCE`: Explicitly control configuration source ('file' or 'url')

#### Database Configuration
- `DATABASE_MONGO_HOST`: MongoDB host
- `DATABASE_MONGO_USERNAME`: MongoDB username
- `DATABASE_MONGO_PASSWORD`: MongoDB password
- `DATABASE_MONGO_URI`: Complete MongoDB connection string

#### Message Broker Configuration
- `NATS_SERVERS`: NATS server addresses
- `NATS_URI`: Complete NATS connection string

#### Search Engine Configuration
- `ELASTICSEARCH_NODE`: Elasticsearch node URL
- `ELASTICSEARCH_API_KEY`: Elasticsearch API key

#### Search Service Configuration
- `MEILISEARCH_API_KEY`: Meilisearch API key

## 🎛️ Environment-Specific Loading

### Development Environment

In development, the library loads configuration from local YAML files:

```typescript
// Automatically loads from ./application.yaml
const config = await configuration();
```

### Production Environment

In production, configuration is loaded from a remote config server:

```bash
export CONFIG_SERVER_URL="https://config.example.com"
export SERVICE_NAME="my-service"
export NODE_ENV="production"
```

```typescript
// Loads from: https://config.example.com/my-service-production.yaml
const config = await configuration();
```

### Explicit Configuration Source Control

You can explicitly control the configuration source using the `CONFIG_SOURCE` environment variable, which overrides the default behavior:

```bash
# Force loading from file regardless of NODE_ENV
export CONFIG_SOURCE="file"

# Force loading from URL regardless of NODE_ENV
export CONFIG_SOURCE="url"
export CONFIG_SERVER_URL="https://config.example.com"
export SERVICE_NAME="my-service"
```

```typescript
// You can also specify the source programmatically
const config = await configuration({
  configSource: 'file' // or 'url'
});
```

### Configuration Source Priority

The library determines the configuration source in the following order:

1. **Explicit `configSource` option** in function call
2. **`CONFIG_SOURCE` environment variable** ('file' or 'url')
3. **Default behavior** based on `NODE_ENV`:
   - `development` → file
   - All other environments → url

## 🔧 Service Integration

### Pre-configured Services

The library includes pre-configured support for common services:

1. **MongoDB**: Database connection with authentication
2. **NATS**: Message broker for microservices communication
3. **Elasticsearch**: Search and analytics engine
4. **Meilisearch**: Fast, typo-tolerant search engine

### Adding New Services

To add support for a new service, update the constants:

```typescript
// In config-constants.ts
export const SERVICE_CONFIG_DEFINITIONS = {
  // ... existing services
  MY_NEW_SERVICE: {
    configPath: 'myService.connectionString',
    envVarPath: 'MY_SERVICE_CONNECTION_STRING',
    requiredEnvVars: ['MY_SERVICE_HOST', 'MY_SERVICE_PORT'],
    replacements: {
      '${host}': 'MY_SERVICE_HOST',
      '${port}': 'MY_SERVICE_PORT',
    },
  },
} as const;
```

## 🔧 Template Variables

The library supports template variable replacement in configuration values:

### Supported Placeholders

- `${host}` - Database/service host
- `${hosts}` - Multiple hosts (comma-separated)
- `${username}` - Database username
- `${password}` - Database password
- `${apiKey}` - API key for services

### Example Usage

```yaml
# YAML Configuration
database:
  mongo:
    uri: "mongodb://${username}:${password}@${host}:27017/myapp"
```

```bash
# Environment Variables
export DATABASE_MONGO_HOST="localhost"
export DATABASE_MONGO_USERNAME="admin"
export DATABASE_MONGO_PASSWORD="[REDACTED]"
```

Result: `mongodb://admin:[REDACTED]@localhost:27017/myapp`

## 🔧 Error Handling

### Configuration Loading Errors

```typescript
import { configuration } from '@zma-nestjs-monorepo/zma-config';

try {
  const config = await configuration();
} catch (error) {
  if (error.message.includes('CONFIG_SERVER_URL')) {
    console.error('Config server not accessible');
    // Implement fallback logic
  }
}
```

### Environment Variable Validation

```typescript
import { validateRequiredEnvironmentVariables } from '@zma-nestjs-monorepo/zma-config';

try {
  validateRequiredEnvironmentVariables(['DATABASE_HOST']);
} catch (error) {
  console.error('Missing required environment variables:', error.message);
}
```

## 🔧 Best Practices

### 1. Use Type-Safe Configuration

```typescript
import { AppConfig } from '@zma-nestjs-monorepo/zma-config';

function useConfig(config: AppConfig) {
  // TypeScript will provide autocompletion and type checking
  if (config.database?.mongo?.uri) {
    // Safe to use
    connectToMongoDB(config.database.mongo.uri);
  }
}
```

### 2. Validate Configuration Early

```typescript
import { configuration, validateRequiredEnvironmentVariables } from '@zma-nestjs-monorepo/zma-config';

async function initializeApp() {
  // Validate required variables first
  validateRequiredEnvironmentVariables([
    'DATABASE_MONGO_HOST',
    'DATABASE_MONGO_USERNAME',
    'DATABASE_MONGO_PASSWORD'
  ]);

  // Then load configuration
  const config = await configuration();

  return config;
}
```

### 3. Use Environment-Specific Configurations

```typescript
const config = await configuration({
  nodeEnv: process.env.NODE_ENV || 'development',
  serviceName: process.env.SERVICE_NAME || 'default-service',
  configSource: process.env.CONFIG_SOURCE as 'file' | 'url'
});
```

### 4. Handle Configuration Gracefully

```typescript
import { configuration, parseConfig } from '@zma-nestjs-monorepo/zma-config';

async function loadConfigWithFallback() {
  try {
    // Try loading from config server/files
    return await configuration();
  } catch (error) {
    console.warn('Primary config failed, falling back to environment variables');
    // Fallback to environment variables
    return parseConfig();
  }
}
```

## 🧪 Testing

### Mocking Configuration

```typescript
import { jest } from '@jest/globals';
import { configLoader } from '@zma-nestjs-monorepo/zma-config';

// Mock the config loader
jest.spyOn(configLoader, 'loadConfiguration').mockResolvedValue({
  database: {
    mongo: {
      uri: 'mongodb://[USERNAME]:[PASSWORD]@localhost:27017/test'
    }
  }
});
```

### Testing with Environment Variables

```typescript
describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should load configuration from environment variables', () => {
    process.env.DATABASE_MONGO_HOST = 'testhost';
    process.env.DATABASE_MONGO_USERNAME = 'testuser';
    process.env.DATABASE_MONGO_PASSWORD = '[REDACTED]';

    const config = parseConfig();

    expect(config.DATABASE_MONGO_HOST).toBe('testhost');
  });
});
```

## 🔧 Migration from Legacy Code

### Before (Legacy)

```typescript
// Old monolithic approach
const getConfigurationContent = async () => {
  // ... lots of mixed logic
};

const processConfigPath = ({ config, configPath, envVars, replacements }) => {
  // ... inline processing
};
```

### After (Refactored)

```typescript
// New modular approach
import {
  configuration,
  configLoader,
  configProcessor
} from '@zma-nestjs-monorepo/zma-config';

const config = await configuration();
```

### Migration Steps

1. Replace direct calls to `getConfigurationContent()` with `configuration()`
2. Replace `processConfigPath()` usage with the built-in processing
3. Update imports to use the new modular exports
4. Add type annotations using the provided TypeScript interfaces
5. Update error handling to use the new error types

## 📚 API Reference

### Main Functions

#### `configuration(options?: ConfigLoaderOptions): Promise<AppConfig>`
Loads and processes configuration from YAML files or config servers.

#### `parseConfig(): Record<string, unknown>`
Parses configuration from environment variables.

#### `loadConfigurationIntoEnv(options?: ConfigLoaderOptions): Promise<FlattenedConfig>`
Loads configuration and flattens it into environment variables.

#### `getEnvironmentVariables(): EnvironmentVariables`
Gets typed environment variables.

#### `validateRequiredEnvironmentVariables(requiredVars: string[]): void`
Validates that required environment variables are present.

### Types

#### `AppConfig`
Main configuration interface with optional service configurations.

#### `EnvironmentVariables`
Typed interface for environment variables.

#### `ConfigLoaderOptions`
Options for configuration loading.

#### `FlattenedConfig`
Flattened configuration for environment variables.

## 🐛 Troubleshooting

### Common Issues

#### 1. "Failed to load config file"
- Ensure `application.yaml` exists in the correct directory
- Check file permissions and path

#### 2. "Environment variables validation failed"
- Verify all required environment variables are set
- Check variable names for typos

#### 3. "Failed to load configuration from config server"
- Verify `CONFIG_SERVER_URL` is accessible
- Check network connectivity
- Ensure service name matches server expectations

#### 4. "Missing required environment variables"
- Set all required variables before starting the application
- Use `.env` files for development

#### 5. Configuration source conflicts
- When `CONFIG_SOURCE=url` but missing `CONFIG_SERVER_URL` or `SERVICE_NAME`
- Set all required variables for URL-based configuration
- Or use `CONFIG_SOURCE=file` to force file-based loading

### Debug Mode

Enable debug logging by setting the log level:

```typescript
import { Logger } from '@nestjs/common';

// Set log level to debug
Logger.overrideLogger(['log', 'debug', 'error', 'warn']);
```

## 🤝 Contributing

1. Follow the modular architecture
2. Add comprehensive tests for new features
3. Update type definitions for new configuration options
4. Document any new environment variables
5. Maintain backward compatibility

## 📄 License

This library is part of the ZMA NestJS Monorepo project.
