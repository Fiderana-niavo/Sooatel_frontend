# syntax=docker/dockerfile:1

# --- Stage 1: Build SPA ---
FROM node:22-slim AS build
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

# Copy application sources
COPY . .

# Set API base path: default to /api for same-origin proxy through Nginx
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Build production SPA assets
RUN npx vite build

# --- Stage 2: Serve SPA with Nginx ---
FROM nginx:1.27-alpine AS runtime

# Copy custom Nginx configuration and compiled web assets
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
