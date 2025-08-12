# Railway Dockerfile for HR Portal backend
FROM python:3.11-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends gcc build-essential && rm -rf /var/lib/apt/lists/*
COPY hr-backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt
COPY hr-backend /app/hr-backend
ENV PYTHONUNBUFFERED=1
EXPOSE 8000
WORKDIR /app/hr-backend/src
CMD ["gunicorn", "main:app", "--bind", "0.0.0.0:${PORT}", "--workers", "2", "--timeout", "120"]
