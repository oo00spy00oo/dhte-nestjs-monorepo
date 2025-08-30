FROM node:24-alpine AS builder

ARG SERVICE_NAME

USER root

WORKDIR /app

RUN npm install -g pnpm

COPY dist/apps/$SERVICE_NAME .

RUN pnpm install --production

# Final stage
FROM node:24-alpine

RUN apk update && apk add --no-cache dumb-init ffmpeg libvpx-dev

WORKDIR /app

COPY --from=builder /app .
COPY --from=builder /usr/local/bin/pnpm /usr/local/bin/

ENV HOST=0.0.0.0
ENV PORT=3000
ENV UV_THREADPOOL_SIZE=16

EXPOSE 3000

ENTRYPOINT ["dumb-init", "--" ]
CMD [ "node", "--max-old-space-size=4096", "--optimize-for-size", "--gc-interval=100", "--max-semi-space-size=128", "main.js" ]
