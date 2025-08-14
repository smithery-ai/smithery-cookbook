# Python MCP Server with FastMCP

A simple Python MCP server built using FastMCP to demonstrate hosting on Smithery with custom docker containers.

This server is designed to run both locally (STDIO transport) and remotely via Smithery (HTTP transport).

## Features:

- **CORS**: CORS headers for browser-based MCP client compatibility
- **Smithery Session Configuration**: handles base64-encoded JSON configuration passed via query parameters
- **Server Transport**: Can run with both STDIO and HTTP transports using `TRANSPORT` env variable

## Prerequisites

- Python 3.12 or higher
- uv package manager

## Project Structure

- `main.py` - Main FastAPI server with MCP HTTP transport
- `middleware/__init__.py` - Custom middleware to extract config
- `pyproject.toml` - Python dependencies and project configuration
- `smithery.yaml` - Smithery deployment configuration
- `Dockerfile` - Dockerfile to host server in Smithery

## Quick Start

1. **Install dependencies:**
   ```bash
   uv sync
   ```
   
2. **Run the development server:**

   **HTTP Mode:**
   ```bash
   TRANSPORT=http uv run python main.py
   ```

   **STDIO Mode (default):**
   ```bash
   uv run python main.py
   ```

3. **Test interactively:**
   Once your server is running in HTTP mode, you can test it interactively using the Smithery playground:
   ```bash
   npx @smithery/cli playground --port 8080
   ```

4. **Deploy your own version:**
   To deploy your own MCP server:
   - Connect your repository at [https://smithery.ai/new](https://smithery.ai/new)