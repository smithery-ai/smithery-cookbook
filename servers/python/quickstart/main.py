import os
import uvicorn
from mcp.server.fastmcp import FastMCP
from starlette.middleware.cors import CORSMiddleware

mcp = FastMCP(name="Say Hello")

@mcp.tool()
def greet(name: str) -> str:
    """Greet a user by name."""
    return f"Hello, {name}!"

if __name__ == "__main__":
    # Get the Starlette app and add CORS middleware
    app = mcp.streamable_http_app()
    
    # Add CORS middleware with proper header exposure for MCP session management
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure this more restrictively in production
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["mcp-session-id", "mcp-protocol-version"],  # Allow client to read session ID
        max_age=86400,
    )

    # Use PORT environment variable
    port = int(os.environ.get("PORT", 8081))

    # Run the MCP server with HTTP transport using uvicorn
    uvicorn.run(
        app,
        host="0.0.0.0",  # Listen on all interfaces for containerized deployment
        port=port,
        log_level="debug"
    )