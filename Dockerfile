# syntax=docker/dockerfile:1

# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

ARG VITE_PUBLIC_SERVER_URL=https://recipes-api.suolumi.fr/api/v1
ENV VITE_PUBLIC_SERVER_URL=${VITE_PUBLIC_SERVER_URL}

# Ensure .env exists with PUBLIC_SERVER_URL for SvelteKit static env import
RUN [ -f .env ] || echo "PUBLIC_SERVER_URL=${VITE_PUBLIC_SERVER_URL}" > .env

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
COPY static /usr/share/nginx/html

# Remove default nginx config and use a minimal one for SPA routing
RUN rm /etc/nginx/conf.d/default.conf
RUN printf "server {\n    listen 80;\n    server_name _;\n    root /usr/share/nginx/html;\n    location / {\n        try_files \$uri \$uri/ /index.html;\n    }\n}\n" > /etc/nginx/conf.d/svelte.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]