# Python MCP Server with FastMCP

A simple Python MCP server built using FastMCP to demonstrate hosting on Smithery with custom docker containers.

This server is designed to run both locally (STDIO transport) and remotely via Smithery (HTTP transport).

## Prerequisites

- Python 3.12 or higher
- uv package manager

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
   API_KEY=your-api-key uv run python main.py
   ```

3. **Configuration:**
   Smithery allows users to pass session-level configuration to MCP servers. Smithery passes this as base64-encoded JSON in the `config` query parameter. This server parses this configuration for each session:
   
   ```python
   # How the server extracts configuration from query parameters
   class SmitheryConfigMiddleware:
       async def __call__(self, scope, receive, send):
           query = scope.get('query_string', b'').decode()
           if 'config=' in query:
               config_b64 = unquote(parse_qs(query)['config'][0])
               config = json.loads(base64.b64decode(config_b64))
               if api_key := config.get('apiKey'):
                   self.set_api_key(api_key)
   # Example extracted config: { "apiKey": "your-api-key-here" }
   ```

   For local testing, you can manually pass configuration via the query parameter.

4. **Deploy your own version:**
   To deploy your own MCP server:
   - Connect your repository at [https://smithery.ai/new](https://smithery.ai/new)

## Project Structure

- `main.py` - Main FastAPI server with MCP HTTP transport
- `middleware/__init__.py` - Custom middleware for CORS, config extraction and MCP path redirection
- `pyproject.toml` - Python dependencies and project configuration
- `smithery.yaml` - Smithery deployment configuration
- `Dockerfile` - Dockerfile to host server in Smithery

## Some Features:

- **CORS**: Pre-configured CORS headers for browser-based MCP clients
- **Smithery Session Configuration**: handles base64-encoded JSON configuration passed via query parameters
- **MCP Path Redirection**: Custom middleware redirects `/mcp` to `/mcp/` for proper routing
- **Server Transport**: Can run with both STDIO and HTTP transports using `TRANSPORT` env variable
