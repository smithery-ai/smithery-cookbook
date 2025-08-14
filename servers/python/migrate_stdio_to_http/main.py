import os
import uvicorn
from mcp.server.fastmcp import FastMCP
from starlette.middleware.cors import CORSMiddleware
from typing import Optional
from middleware import SmitheryConfigMiddleware

# Initialize MCP server with name displayed in Smithery
mcp = FastMCP(name="Character Counter")

def handle_config(config: dict):
    """Handle configuration from Smithery - extract what we need."""
    global current_api_key
    if api_key := config.get('apiKey'):
        current_api_key = api_key
    # Could handle other config fields here like debug etc.

# Store API key from Smithery config
current_api_key: Optional[str] = None

def validate_api_key(api_key: Optional[str]) -> bool:
    """Validate API key - accepts any non-empty string for demo."""
    if not api_key:
        return False
    return len(api_key.strip()) > 0

# MCP Tool - requires valid API key
@mcp.tool()
def count_characters(text: str, character: str) -> str:
    """Count occurrences of a specific character in text"""
    if not validate_api_key(current_api_key):
        raise ValueError("API key required! Please configure any API key in Smithery.")
    
    # Count occurrences of the specific character (case insensitive)
    count = text.lower().count(character.lower())
    
    return f'The character "{character}" appears {count} times in the text.'

def main():
    transport_mode = os.getenv("TRANSPORT", "stdio")
    
    if transport_mode == "http":
        # HTTP mode with config extraction from URL parameters
        print("Character Counter MCP Server starting in HTTP mode...")
        
        # Setup Starlette app with CORS for cross-origin requests
        app = mcp.streamable_http_app()
        
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["GET", "POST", "OPTIONS"],
            allow_headers=["*"],
            expose_headers=["mcp-session-id", "mcp-protocol-version"],
            max_age=86400,
        )

        # Apply custom middleware for config extraction
        app = SmitheryConfigMiddleware(app, handle_config)

        # Use Smithery-required PORT environment variable
        port = int(os.environ.get("PORT", 8080))
        print(f"Listening on port {port}")

        uvicorn.run(app, host="0.0.0.0", port=port, log_level="debug")
    
    else:
        # Stdio mode - get API key from environment variable
        print("Character Counter MCP Server starting in stdio mode...")
        
        api_key = os.getenv("API_KEY")
        if not api_key:
            raise ValueError("API_KEY environment variable is required for stdio mode")
        
        # Set the global API key for stdio mode
        handle_config({"apiKey": api_key})
        
        # Run with stdio transport (default)
        mcp.run()

if __name__ == "__main__":
    main()
