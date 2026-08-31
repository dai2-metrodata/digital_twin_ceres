# Stage 1: Build the React app
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production — nginx + Node.js API
FROM node:20-alpine

RUN apk add --no-cache nginx supervisor

# Copy built React app to nginx html dir
RUN mkdir -p /usr/share/nginx/html
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/http.d/default.conf

# Setup Node.js API server
WORKDIR /api
COPY server/package.json ./
RUN npm install --production
COPY server/ ./

# Supervisor config to run both nginx and node
RUN mkdir -p /etc/supervisor.d
COPY supervisord.conf /etc/supervisord.conf

EXPOSE 8000

CMD ["supervisord", "-c", "/etc/supervisord.conf"]
