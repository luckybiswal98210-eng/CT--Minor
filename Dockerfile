# ========================================================
# Cloud Container Deployment (IaaS / CaaS)
# Cloud-Based Online Complaint Management System
# ========================================================

FROM node:20-alpine

# Set working directory in container
WORKDIR /usr/src/app

# Install dependencies first (leverages Docker layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# Ensure storage directories exist
RUN mkdir -p uploads data

# Expose server port
EXPOSE 3000

# Container Healthcheck (Cloud Orchestration Probe)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Non-root user for security best practice
USER node

# Start command
CMD ["node", "server.js"]
