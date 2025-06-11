## Dockerfile for Express + WebSocket mTLS server

# Use a lightweight Node.js runtime
FROM node:22-alpine

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Set working directory
WORKDIR /usr/src/app

# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy the application source code
COPY . .

# Create logs directory and set permissions
RUN mkdir -p /var/log/iot && chown -R appuser:appgroup /var/log/iot

# Switch to non-root user
USER appuser

# Set environment defaults
ENV NODE_ENV=production
ENV PORT=8443

# Expose the mTLS WebSocket port
EXPOSE 8443

# Start the server
CMD ["node", "index.js"]