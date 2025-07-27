FROM ghcr.io/astral-sh/uv:python3.12-alpine

WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-cache

# Copy application code
COPY . .

# Expose the port
EXPOSE 8080

# Run the application
CMD ["uv", "run", "main.py"] 