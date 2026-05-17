# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Backend (serves built frontend)
FROM node:20-alpine
RUN apk add --no-cache openssl
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci --omit=dev
COPY backend/ ./
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist
RUN chmod +x /app/backend/entrypoint.sh

EXPOSE 3001 3443
ENTRYPOINT ["/app/backend/entrypoint.sh"]
