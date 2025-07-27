FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Copy dependency files
COPY pyproject.toml uv.lock* ./

# Install uv for fast dependency management
RUN pip install uv

# Install dependencies
RUN uv sync --frozen

# Copy source code
COPY . .

# Expose port (Smithery will set PORT env var)
EXPOSE 8080

# Run the server
CMD ["uv", "run", "python", "main.py"] 