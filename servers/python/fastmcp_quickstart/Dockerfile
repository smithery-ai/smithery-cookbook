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

# Set port to 8080 as required by Smithery proxy
ENV PORT=8080
EXPOSE 8080

# Run the server
CMD ["uv", "run", "python", "main.py"] 