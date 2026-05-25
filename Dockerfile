# syntax=docker/dockerfile:1

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

ARG VITE_PUBLIC_SERVER_URL=https://recipes-api.suolumi.fr/api/v1
ENV VITE_PUBLIC_SERVER_URL=${VITE_PUBLIC_SERVER_URL}
RUN [ -f .env ] || echo "PUBLIC_SERVER_URL=${VITE_PUBLIC_SERVER_URL}" > .env

COPY . .
RUN [ -f .env ] || echo "PUBLIC_SERVER_URL=${VITE_PUBLIC_SERVER_URL}" > .env
RUN npm run build
RUN npm prune --omit=dev

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "build"]
