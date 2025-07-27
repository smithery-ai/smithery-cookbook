# my_server.py
import uvicorn
from fastmcp import FastMCP
from starlette.middleware.cors import CORSMiddleware

mcp = FastMCP(name="MyServer")

@mcp.tool
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
        expose_headers=["mcp-session-id"],  # Allow client to read session ID
        max_age=86400,
    )

    # Run the MCP server with HTTP transport using uvicorn
    uvicorn.run(
        app,
        host="127.0.0.1",
        port=8080,
        log_level="info"
    )