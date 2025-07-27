FROM ghcr.io/astral-sh/uv:python3.12-alpine

WORKDIR /app

# Copy dependency files first for better caching
COPY pyproject.toml uv.lock ./

# Install dependencies system-wide to avoid runtime venv creation
RUN uv sync --frozen --no-cache --system

# Copy application code
COPY . .

# Set port to 8080 as required by Smithery proxy
ENV PORT=8080
EXPOSE 8080

# Run Python directly instead of through uv to avoid runtime setup
CMD ["python", "main.py"] 