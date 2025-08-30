FROM docker.io/node:24-alpine AS builder

WORKDIR /app

RUN apk --no-cache add procps dumb-init curl && \
  npm install -g pnpm

COPY dist/apps/zma-sample .
RUN pnpm install --production && \
  chmod +x entrypoint.sh

FROM docker.io/node:24-alpine

RUN apk --no-cache add procps dumb-init

WORKDIR /app
COPY --from=builder /app .
COPY --from=builder /usr/local/bin/pnpm /usr/local/bin/

ENV HOST=0.0.0.0 \
  PORT=3000 \
  PIDUSAGE_USE_PS=true

EXPOSE 3000

USER node

# Running PM2 on Digital Ocean: https://www.digitalocean.com/community/questions/running-pm2-on-digital-ocean-app-platform
ENTRYPOINT ["./entrypoint.sh"]
