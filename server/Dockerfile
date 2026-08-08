# Stage 1: Install production dependencies only
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev

# Stage 2: Final release image
FROM node:20-alpine AS release
WORKDIR /app
ENV NODE_ENV=production

# Copy over production node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy the application source code with correct ownership
COPY --chown=node:node src/ ./src/
COPY --chown=node:node package.json ./

# Create logs directory and ensure the node user owns it so Winston can write to it
RUN mkdir -p logs && chown node:node logs

EXPOSE 5000

# Run as non-root user for security best practice
USER node

# Start the application
CMD ["node", "src/server.js"]
