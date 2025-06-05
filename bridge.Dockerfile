# Dockerfile for MCP Universal Bridge
# This creates a containerized version of the MCP bridge for easy deployment

FROM node:22-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Build stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build TypeScript files
RUN npm run build

# Runtime stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 mcpbridge
RUN adduser --system --uid 1001 mcpbridge

# Copy built application
COPY --from=builder --chown=mcpbridge:mcpbridge /app/dist ./dist
COPY --from=builder --chown=mcpbridge:mcpbridge /app/scripts ./scripts
COPY --from=deps --chown=mcpbridge:mcpbridge /app/node_modules ./node_modules
COPY --chown=mcpbridge:mcpbridge package.json ./

# Install tsx for TypeScript execution
RUN npm install -g tsx

USER mcpbridge

# Default command runs the universal bridge
CMD ["tsx", "scripts/mcp-bridge.ts"]

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('Bridge is running')" || exit 1
