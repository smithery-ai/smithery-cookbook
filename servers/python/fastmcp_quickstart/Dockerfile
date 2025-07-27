FROM ghcr.io/astral-sh/uv:python3.12-alpine

# Set working directory
WORKDIR /app

# Disable virtual environment creation to install system-wide
ENV UV_SYSTEM_PYTHON=1

# Copy dependency files first for better caching
COPY pyproject.toml uv.lock ./

# Install dependencies system-wide to avoid runtime venv creation
RUN uv sync --frozen --no-cache

# Copy application code
COPY . .

# Set port to 8080 as required by Smithery proxy
ENV PORT=8080
EXPOSE 8080

# Run Python directly instead of through uv to avoid runtime setup
CMD ["python", "main.py"] 