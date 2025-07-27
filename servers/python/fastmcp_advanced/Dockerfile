FROM ghcr.io/astral-sh/uv:python3.12-alpine

WORKDIR /app

# Copy dependency files first for better caching
COPY pyproject.toml uv.lock ./

# Install dependencies with no cache for smaller image
RUN uv sync --frozen --no-cache

# Copy application code
COPY . .

# Set port to 8080 as required by Smithery proxy
ENV PORT=8080
EXPOSE 8080

# Run the application directly without uv wrapper
CMD ["uv", "run", "main.py"] 