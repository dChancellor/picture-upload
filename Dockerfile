# Multi-stage build for SvelteKit + Vite app
# Stage 1: install deps and build
FROM node:20-alpine AS build
WORKDIR /app

# Install build deps
COPY package.json package-lock.json* ./
COPY .npmrc ./

# Install dependencies
RUN apk add --no-cache python3 make g++ || true
RUN npm ci --omit=dev

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: production image
FROM node:20-alpine AS runtime
WORKDIR /app

# Install a lightweight production server - vite preview runs with node
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

# Copy built assets and static files
COPY --from=build /app/build ./build
COPY --from=build /app/static ./static
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/vite.config.js ./vite.config.js
COPY --from=build /app/svelte.config.js ./svelte.config.js

# Ensure uploads dir exists and is writable
RUN mkdir -p /app/static/uploads && chown -R node:node /app/static/uploads

# Use non-root user
USER node

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "start"]
