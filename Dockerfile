# Satu kontainer: FastAPI menyajikan API + build frontend (satu domain, tanpa CORS).
# Build:  docker build -t jelajahgaris .
# Jalan:  docker run -p 8000:8000 -v jg-data:/app/backend/data \
#           -e ENV=production -e JWT_SECRET=<acak≥32> jelajahgaris
# Data SQLite ada di volume /app/backend/data — WAJIB volume persisten (DEPLOYMENT_GUIDE §1).

# ---- Tahap 1: build frontend ----
FROM node:20-alpine AS web
WORKDIR /web
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci --ignore-scripts
COPY frontend/ ./
RUN npm run build

# ---- Tahap 2: runtime Python ----
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 \
    ENV=production STATIC_DIR=/app/frontend/dist PORT=8000
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ ./
COPY --from=web /web/dist /app/frontend/dist
RUN useradd --create-home appuser && mkdir -p data exports && chown -R appuser /app
USER appuser
EXPOSE 8000
CMD ["sh", "start.sh"]
