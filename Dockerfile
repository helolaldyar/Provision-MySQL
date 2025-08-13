# --- Build frontend (React) ---
FROM node:18-alpine AS frontend
WORKDIR /app
# copy frontend
COPY hr-system /app/hr-system
WORKDIR /app/hr-system
# install & build (use ci if package-lock exists; fallback to install)
RUN npm install &&     npm run build

# --- Backend image ---
FROM python:3.11-slim AS backend
WORKDIR /app

# System deps (for building some pip wheels)
RUN apt-get update && apt-get install -y --no-install-recommends gcc build-essential && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY hr-backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy backend code
COPY hr-backend /app/hr-backend

# Copy frontend build into Flask static dir
COPY --from=frontend /app/hr-system/build /app/hr-backend/src/static

# Runtime env
ENV PYTHONUNBUFFERED=1

# Expose port (Railway provides $PORT)
EXPOSE 8000

# Start backend (Flask via gunicorn)
WORKDIR /app/hr-backend/src
CMD ["gunicorn", "main:app", "--bind", "0.0.0.0:${PORT}", "--workers", "2", "--timeout", "120"]