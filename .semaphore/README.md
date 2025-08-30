# Semaphore CI Pipeline Documentation

## Overview

This repository uses an optimized Semaphore CI pipeline designed for a NestJS monorepo with Nx workspace. The pipeline includes build optimization, security scanning, and deployment automation for 20+ microservices.

## Pipeline Structure

### Main Pipeline (`semaphore.yml`)

The primary pipeline consists of 7 stages:

1. **Checkout & Setup** - Git operations and environment preparation
2. **Install Dependencies** - Package installation with caching
3. **Affected Projects Detection** - Nx-based change detection
4. **Code Quality & Testing** - Parallel lint, test, and type checking
5. **Build** - Compile affected projects
6. **Package & Deployment** - Docker builds and GraphQL schema publishing (main branch only)
7. **Security Scanning** - Container security analysis (main branch only)
8. **Code Quality Analysis** - SonarQube analysis (main branch only)

### PR Security Pipeline (`pr-security.yml`)

Dedicated pipeline for pull request security scanning:

1. **PR Security Setup** - Environment preparation for PRs
2. **PR Dependency Install** - Package installation
3. **PR Affected Detection** - Change detection for PRs
4. **PR Code Security Scan** - Static analysis and dependency auditing
5. **PR Container Security Preview** - Quick container security checks
6. **PR Security Report** - Comprehensive security reporting

## Key Optimizations

### Performance Improvements

- **Parallel Execution**: Lint, test, and type-check run in parallel with `--parallel=3`
- **Nx Cloud Integration**: Distributed task execution and caching
- **Smart Caching**: Aggressive caching of dependencies and build artifacts
- **Affected-Only Builds**: Only processes changed applications

### Security Enhancements

- **Multi-layer Security**: Trivy, Deepfence Secret Scanner, and Yara Hunter
- **PR Security Scanning**: Early security feedback in pull requests
- **Externalized Secrets**: Telegram tokens moved to Semaphore secrets
- **Proper Error Handling**: Real failures instead of masked errors

### Reliability Improvements

- **Artifact-based State Sharing**: Replaces fragile `/tmp` file sharing
- **Proper Exit Codes**: Fails fast on real errors
- **Conditional Execution**: Smart skipping when no changes detected
- **Retry Logic**: Built-in resilience for flaky operations

## Configuration

### Required Secrets

Configure these secrets in your Semaphore project:

#### Docker Registry

```
DOCKER_USERNAME=<registry-username>
DOCKER_PASSWORD=<registry-password>
```

#### ZMA Hive

```
HIVE_TOKEN=<graphql-hive-token>
```

#### Sonar Token

```
SONAR_TOKEN=<sonarqube-token>
```

#### Security Notifications

```
TELEGRAM_BOT_TOKEN=<telegram-bot-token>
TELEGRAM_CHAT_ID=<telegram-chat-id>
TELEGRAM_TRIVY_THREAD_ID=<thread-id-for-trivy>
TELEGRAM_SECRET_THREAD_ID=<thread-id-for-secrets>
TELEGRAM_MALWARE_THREAD_ID=<thread-id-for-malware>
```

### Environment Variables

#### Global Configuration

- `SEMAPHORE_GIT_DEPTH=50` - Git history depth
- `NX_CLOUD_ACCESS_TOKEN` - Nx Cloud authentication
- `HIVE_TARGET=passion-tech/zma/development` - GraphQL Hive target

## Usage

### Branch-based Execution

#### Main Branch

- Runs complete pipeline including packaging and security scanning
- Builds and pushes Docker images
- Publishes GraphQL schemas to Hive
- Performs comprehensive security analysis
- Runs SonarQube code quality analysis

#### Pull Requests

- Runs code quality and testing only
- Optionally runs PR security pipeline for security-focused PRs
- Skips packaging and deployment steps

#### Feature Branches

- Runs basic validation (lint, test, build)
- Skips security scanning and deployment

### Affected Projects

The pipeline automatically detects affected projects using Nx:

```bash
# For PRs
pnpm nx show projects --affected --type=app --base="origin/main" --head="PR_SHA"

# For main branch commits
pnpm nx show projects --affected --type=app --base="PREVIOUS_SHA" --head="CURRENT_SHA"
```

Projects excluded from builds:

- `zma-sample` (development/testing project)

### Manual Triggers

To trigger specific pipeline behaviors:

#### Force Security Scan on PR

Add label `security-scan` to your PR to trigger the security pipeline.

#### Skip CI

Add `[skip ci]` to your commit message to skip the pipeline entirely.

## Monitoring and Notifications

### Telegram Integration

Security scan results are automatically sent to configured Telegram channels:

- **Trivy Results**: Container vulnerability reports
- **Secret Scanning**: Detected secrets and credentials
- **Malware Detection**: Suspicious file analysis

### Pipeline Artifacts

The following artifacts are generated:

- `$SEMAPHORE_GIT_SHA.env` - Git SHA and commit information
- `affected-projects.env` - List of affected projects
- `pr-security.env` - PR-specific environment variables
- `pr-affected.env` - PR affected projects

## Troubleshooting

### Common Issues

#### No Affected Projects Detected

```bash
# Check if base/head detection is correct
echo "Base SHA: $BASE_SHA"
echo "Head SHA: $HEAD_SHA"

# Manually check affected projects
pnpm nx show projects --affected --base="$BASE_SHA" --head="$HEAD_SHA"
```

#### Docker Build Failures

```bash
# Check Skaffold configuration
skaffold config list

# Verify Docker registry access
docker login registry.passiontech.dev
```

#### Cache Issues

```bash
# Clear Semaphore cache
cache clear

# Clear Nx cache
pnpm nx reset
```

### Performance Tuning

#### Parallel Job Optimization

Adjust parallel execution based on resource availability:

```yaml
# Increase for more powerful machines
- pnpm nx affected -t lint --parallel=5

# Decrease for resource-constrained environments
- pnpm nx affected -t lint --parallel=2
```

#### Cache Strategy

Optimize caching for your specific needs:

```yaml
# More aggressive caching
cache store pnpm-cache

# Selective caching
cache store node_modules-cache
cache store nx-cache
```

## Best Practices

### Commit Messages

- Use conventional commits for better change detection
- Include meaningful descriptions for security-related changes
- Reference issue numbers for traceability

### Branch Strategy

- Create feature branches from `main`
- Use descriptive branch names
- Keep PRs focused and small for faster CI execution

### Security Considerations

- Review security scan reports regularly
- Address HIGH and CRITICAL vulnerabilities promptly
- Keep dependencies updated
- Use semantic versioning for releases

## Pipeline Maintenance

### Regular Updates

- Update base images monthly
- Review and update security scanning tools quarterly
- Monitor pipeline performance and optimize as needed
- Update Nx and related tools regularly

### Monitoring

- Track pipeline execution times
- Monitor cache hit rates
- Review security scan results
- Monitor resource usage patterns

## Support

For pipeline issues or questions:

1. Check the Semaphore dashboard for detailed logs
2. Review this documentation for configuration guidance
3. Contact the DevOps team for infrastructure issues
4. Create issues in the repository for pipeline improvements

## Installing SonarQube Scanner CLI

```bash
# Download and install SonarQube Scanner CLI
export SONAR_SCANNER_VERSION=6.2.0.4584
export SONAR_SCANNER_HOME=$HOME/.sonar/sonar-scanner-$SONAR_SCANNER_VERSION-linux-x64
curl --create-dirs -sSLo $HOME/.sonar/sonar-scanner.zip https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-$SONAR_SCANNER_VERSION-linux-x64.zip
unzip -o $HOME/.sonar/sonar-scanner.zip -d $HOME/.sonar/
export PATH=$SONAR_SCANNER_HOME/bin:$PATH
```
