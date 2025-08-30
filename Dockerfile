# Multi-stage build for NestJS microservices
# Build stage
FROM docker.io/node:24-alpine AS builder

# Install system dependencies
# linux-headers required for native compilation of mediasoup and other packages
RUN apk --no-cache add \
    procps \
    dumb-init \
    curl \
    python3 \
    py3-pip \
    make \
    g++ \
    linux-headers \
    && npm install -g pnpm@latest

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY nx.json tsconfig.base.json ./

# Copy all source code and configs
COPY apps/ apps/
COPY libs/ libs/
COPY graphqls/ graphqls/

# Install dependencies
# Set environment variables for native compilation
ENV PYTHON=/usr/bin/python3
ENV NODE_OPTIONS="--max-old-space-size=4096"
#RUN pnpm install --frozen-lockfile
RUN pnpm install --unsafe-perm

# Build all applications
RUN pnpm nx run-many --target=build --all --parallel --verbose

# Production stage
FROM docker.io/node:24-alpine AS production

# Install runtime dependencies
RUN apk --no-cache add \
    procps \
    dumb-init \
    curl

WORKDIR /app

# Copy built applications and dependencies
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Copy i18n assets
COPY --from=builder /app/libs/zma-i18n/src/i18n ./dist/i18n

# Copy application.yaml files from all apps
COPY --from=builder /app/apps/*/application.yaml ./dist/apps/

# Set environment variables
ENV NODE_ENV=development \
    HOST=0.0.0.0 \
    PIDUSAGE_USE_PS=true

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Set permissions
RUN chown -R nestjs:nodejs /app
USER nestjs

# Expose common ports (will be overridden by specific services)
EXPOSE 3000 3001 3002 3003 3004 3005 4001 4002 4003 4004 4005

# Default command (will be overridden by docker-compose)
CMD ["node", "dist/apps/user-auth/main.js"]