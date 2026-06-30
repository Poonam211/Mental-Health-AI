# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy package files and install dependencies
COPY frontend/package*.json ./
RUN npm ci

# Copy frontend source and build
COPY frontend/ ./
ENV VITE_API_URL=/api
RUN npm run build

# Stage 2: Run the FastAPI backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies (build-essential needed for any compiled python packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install python packages
COPY requirements.txt .
# Ensure aiofiles is installed for FastAPI static file serving
RUN echo "aiofiles" >> requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend, ML models, datasets, and source modules
COPY backend/ ./backend/
COPY models/ ./models/
COPY data/ ./data/
COPY src/ ./src/

# Copy built frontend assets from Stage 1
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Expose default port
EXPOSE 8000

# Set environment variables
ENV ENV=production
ENV PORT=8000

# Start Uvicorn ASGI server
CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
