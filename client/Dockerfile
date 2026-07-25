# Note: Vite builds environment variables (like VITE_API_BASE_URL) into the static bundle AT BUILD TIME.
# If this app needs to be deployed with different API URLs per environment, you must either:
# a) Rebuild this image per environment with different build arguments
# b) Inject a runtime configuration script into index.html via the entrypoint
# For now, relying on Ingress path routing (where API is always the relative path /api) solves this.

# Stage 1: Build the React application
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . ./
ENV VITE_API_BASE_URL=/api
RUN npm run build

# Stage 2: Serve the static files with Nginx
FROM nginx:1.27-alpine AS release
# Remove default Nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the built React app from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
