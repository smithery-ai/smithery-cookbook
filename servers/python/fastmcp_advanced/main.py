import os
import uvicorn
import json
import base64
from urllib.parse import parse_qs
from fastmcp import FastMCP
from starlette.middleware.cors import CORSMiddleware
from typing import Optional

# Initialize MCP server with name displayed in Smithery
mcp = FastMCP(name="Text Utils")

# Store API key from Smithery config
current_api_key: Optional[str] = None

def validate_api_key(api_key: Optional[str]) -> bool:
    """Validate API key - accepts any non-empty string for demo."""
    if not api_key:
        return False
    return len(api_key.strip()) > 0

# MCP Tools - all require valid API key
@mcp.tool
def uppercase(text: str) -> str:
    """Convert text to uppercase."""
    if not validate_api_key(current_api_key):
        raise ValueError("API key required! Please configure any API key in Smithery.")
    
    return text.upper()

@mcp.tool
def word_count(text: str) -> str:
    """Count the number of words in the text."""
    if not validate_api_key(current_api_key):
        raise ValueError("API key required! Please configure any API key in Smithery.")
    
    words = len(text.split())
    return f"Word count: {words}"

@mcp.tool
def count_character(text: str, character: str) -> str:
    """Count occurrences of a specific character in the text."""
    if not validate_api_key(current_api_key):
        raise ValueError("API key required! Please configure any API key in Smithery.")
    
    if len(character) != 1:
        return "Please provide exactly one character to count."
    
    count = text.lower().count(character.lower())
    return f"The character '{character}' appears {count} times in '{text}'"

@mcp.tool
def reverse_text(text: str) -> str:
    """Reverse the given text."""
    if not validate_api_key(current_api_key):
        raise ValueError("API key required! Please configure any API key in Smithery.")
    
    return text[::-1]

# Extract API key from Smithery's base64-encoded config parameter
class SmitheryConfigMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        global current_api_key
        
        if scope.get('type') == 'http' and scope.get('path') == '/mcp':
            query_string = scope.get('query_string', b'').decode('utf-8')
            if query_string:
                params = parse_qs(query_string)
                if 'config' in params:
                    try:
                        # Decode base64 config from Smithery
                        config_b64 = params['config'][0]
                        config_json = base64.b64decode(config_b64).decode('utf-8')
                        config = json.loads(config_json)
                        
                        # Extract API key matching smithery.yaml schema
                        if 'apiKey' in config:
                            current_api_key = config['apiKey']
                            print(f"API key configured: {current_api_key[:10]}...")
                    except (json.JSONDecodeError, Exception, IndexError, KeyError) as e:
                        print(f"Error parsing config: {e}")
                        current_api_key = None
        
        await self.app(scope, receive, send)

# Handle /mcp path routing for MCP protocol
class MCPPathRedirect:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        # Redirect /mcp to /mcp/ for proper routing
        if scope.get('type') == 'http' and scope.get('path') == '/mcp':
            scope['path'] = '/mcp/'
            scope['raw_path'] = b'/mcp/'
        await self.app(scope, receive, send)

if __name__ == "__main__":
    # Setup Starlette app with CORS for cross-origin requests
    app = mcp.streamable_http_app()
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["mcp-session-id"],
        max_age=86400,
    )

    # Apply custom middleware stack
    app = SmitheryConfigMiddleware(app)
    app = MCPPathRedirect(app)

    # Use Smithery-required PORT environment variable
    port = int(os.environ.get("PORT", 8080))

    print("Text Utils MCP Server starting...")
    print(f"Listening on port {port}")
    print("Example: count_character('strawberry', 'r') -> counts r's!")

    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info") 