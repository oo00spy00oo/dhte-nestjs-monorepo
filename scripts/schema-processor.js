const { execSync } = require('child_process');
const fsSync = require('fs');
const fs = require('fs/promises');
const path = require('path');

const { buildClientSchema, printSchema, getIntrospectionQuery } = require('graphql');

const hiveToken = process.env.HIVE_TOKEN;

const EXCLUDE_SERVICES = ['zma-sample', 'zma-signaling'];

// Using to retry failed services
const RETRY_SERVICES = [];

// Map of schema URLs for each service
const SCHEMA_URL_MAP = {
  'larva-course': 'http://localhost:3001',
  'zma-auth': 'http://localhost:3002',
  'zma-dictionary': 'http://localhost:3003',
  'zma-fns': 'http://localhost:3004',
  'zma-storage': 'http://localhost:3005',
  'zma-upload': 'http://localhost:3006',
  'zma-user': 'http://localhost:3007',
  'zma-meeting': 'http://localhost:3008',
  'zma-notification': 'http://localhost:3009',
  // Add more services and their URLs here
};

const DELAY_BETWEEN_FETCHES = 1000; // 1 second
const DELAY_BETWEEN_PUBLISHES = 3000; // 3 seconds

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Gets the service names from the apps folder
 */
function getServiceNames() {
  const appsPath = path.join(process.cwd(), 'apps');
  if (!fsSync.existsSync(appsPath)) {
    console.error('Apps directory not found');
    return [];
  }

  if (RETRY_SERVICES.length > 0) {
    return RETRY_SERVICES;
  }

  return fsSync
    .readdirSync(appsPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name)
    .filter((name) => !EXCLUDE_SERVICES.includes(name));
}

/**
 * Fetch introspection from service
 */
async function fetchIntrospection(serviceName) {
  const schemaUrl = SCHEMA_URL_MAP[serviceName];
  if (!schemaUrl) {
    throw new Error(`No schema URL found for service: ${serviceName}`);
  }

  const response = await fetch(`${schemaUrl}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: getIntrospectionQuery() }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to fetch introspection for ${serviceName}: ${response.status} ${response.statusText}. Body: ${errorBody}`,
    );
  }

  return response.json();
}

/**
 * Save schema to file
 */
async function saveSchemaToFile(serviceName, schema) {
  const sdl = `# ------------------------------------------------------
# THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
# ------------------------------------------------------

${printSchema(schema)}`;

  const dirPath = path.join(process.cwd(), 'graphqls', serviceName);
  await fs.mkdir(dirPath, { recursive: true });
  console.log(`Directory created or already exists: ${dirPath}`);

  const schemaPath = path.join(dirPath, 'schema.gql');
  await fs.writeFile(schemaPath, sdl);
  console.log(`Schema written to file: ${schemaPath}`);
}

/**
 * Phase 1: Fetches the GraphQL schema from the API and converts it to SDL
 */
async function fetchSchemaToFile() {
  const serviceNames = getServiceNames();

  if (serviceNames.length === 0) {
    console.error('No services found in apps directory');
    return { processedServices: [], failedServices: [] };
  }

  const processedServices = [];
  const failedServices = [];

  for (const serviceName of serviceNames) {
    try {
      console.log(`Processing service: ${serviceName}`);

      // Fetch the introspection result
      const result = await fetchIntrospection(serviceName);

      if (result?.data) {
        // Build the schema from the introspection result
        const schema = buildClientSchema(result.data);

        // Save schema to file
        await saveSchemaToFile(serviceName, schema);

        console.log(`Schema for ${serviceName} saved to file successfully`);
        processedServices.push(serviceName);

        await delay(DELAY_BETWEEN_FETCHES);
      } else {
        console.error(`Invalid introspection result for service: ${serviceName}`);
        failedServices.push({ serviceName, reason: 'Invalid introspection result' });
      }
    } catch (error) {
      console.error(`Error processing ${serviceName}:`, error.message);
      failedServices.push({ serviceName, reason: error.message });
    }
  }

  return { processedServices, failedServices };
}

/**
 * Run Hive publish command
 */
function publishToHive(serviceName) {
  const cmd = [
    `pnpm hive schema:publish "graphqls/${serviceName}/schema.gql"`,
    `--registry.accessToken "${hiveToken}"`,
    `--service "${serviceName}"`,
    `--url "${SCHEMA_URL_MAP[serviceName]}/graphql"`,
  ].join(' ');

  execSync(cmd, { stdio: 'inherit' });
}

/**
 * Phase 2: Publish schema to Hive
 */
async function publishSchemaToHive(services) {
  if (!services?.length) {
    console.log('No services to publish to Hive');
    return { successfulPublishes: [], failedPublishes: [] };
  }

  const successfulPublishes = [];
  const failedPublishes = [];

  for (const serviceName of services) {
    try {
      console.log(`Publishing schema for ${serviceName} to Hive...`);

      publishToHive(serviceName);

      console.log(`Schema for ${serviceName} published successfully to Hive`);
      successfulPublishes.push(serviceName);

      // Add a delay between services
      console.log(
        `Waiting ${DELAY_BETWEEN_PUBLISHES / 1000} seconds before processing the next service...`,
      );
      await delay(DELAY_BETWEEN_PUBLISHES);
    } catch (publishError) {
      console.error(`Failed to publish schema for ${serviceName} to Hive:`, publishError);
      failedPublishes.push({ serviceName, reason: publishError.toString() });
    }
  }

  return { successfulPublishes, failedPublishes };
}

/**
 * Print report for failed operations
 */
function printFailureReport(failures, title) {
  if (failures.length === 0) return;

  console.log(`\n===== ${title} =====`);
  failures.forEach(({ serviceName, reason }) => {
    console.log(`- ${serviceName}: ${reason}`);
  });
  console.log('='.repeat(title.length + 12) + '\n');
}

/**
 * Execute the functions in sequence
 */
async function main() {
  console.log('Phase 1: Fetching schemas to files...');
  const { processedServices, failedServices } = await fetchSchemaToFile();

  printFailureReport(failedServices, 'FAILED SCHEMA FETCHES');

  console.log('Phase 2: Publishing schemas to Hive...');
  const { successfulPublishes, failedPublishes } = await publishSchemaToHive(processedServices);

  printFailureReport(failedPublishes, 'FAILED SCHEMA PUBLISHES');

  // Final summary
  const totalServices = getServiceNames().length;
  console.log('\n===== EXECUTION SUMMARY =====');
  console.log(`Total services found: ${totalServices} 🔍`);
  console.log(`Successfully processed schemas: ${processedServices.length} ✅`);
  console.log(`Failed to fetch schemas: ${failedServices.length} ❌`);
  if (failedServices.length > 0) {
    console.log('Failed services:');
    failedServices.forEach(({ serviceName }) => {
      console.log(`  - ${serviceName}`);
    });
  }
  console.log(`Successfully published to Hive: ${successfulPublishes.length} 🐝`);
  console.log(`Failed to publish to Hive: ${failedPublishes.length} 🚫`);
  console.log('============================\n');
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
