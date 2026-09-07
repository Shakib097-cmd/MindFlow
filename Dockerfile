# =========================================================================
# Google Cloud Run Multi-Stage Dockerfile for MindFlow AI
# =========================================================================

# --- Stage 1: Build & Bundle ---
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy source code and configuration
COPY . .

# Build Vite client assets and bundle server.ts -> dist/server.cjs
ENV NODE_ENV=production
RUN npm run build

# --- Stage 2: Production Runner ---
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application and static assets from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/firebase-applet-config.json ./firebase-applet-config.json

# Expose the Cloud Run container port
EXPOSE 3000

# Run container as non-root node user for hardened security
USER node

# Production container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT}/health || exit 1

# Start bundled production server
CMD ["node", "dist/server.cjs"]
