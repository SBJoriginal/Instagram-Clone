# Stage 1: Build
FROM node:20-slim AS build
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (ignore prepare scripts like husky)
RUN npm install --production=false --ignore-scripts

# Copy source code
COPY . .

# Inject environment variables
ARG GOOGLE_CLIENT_ID
ARG SENTRY_DSN
RUN sed -i "s|GOOGLE_CLIENT_ID_PLACEHOLDER|$GOOGLE_CLIENT_ID|g" src/environments/environment.ts && \
    sed -i "s|GOOGLE_CLIENT_ID_PLACEHOLDER|$GOOGLE_CLIENT_ID|g" src/environments/environment.development.ts && \
    sed -i "s|SENTRY_DSN_PLACEHOLDER|$SENTRY_DSN|g" src/environments/environment.ts && \
    sed -i "s|SENTRY_DSN_PLACEHOLDER|$SENTRY_DSN|g" src/environments/environment.development.ts

# Build the application
RUN npm run build

# Stage 2: Runtime with nginx
FROM nginx:alpine AS runtime
WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy built Angular app from build stage
COPY --from=build /app/dist/frontend/browser ./

# Copy custom nginx configuration
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
