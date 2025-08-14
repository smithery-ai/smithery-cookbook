import json
import base64
from urllib.parse import parse_qs, unquote
from typing import Optional


def extract_config_from_query(query_string: str) -> Optional[str]:
    """Extract and decode API key from Smithery config parameter."""
    if not query_string:
        return None
    
    params = parse_qs(query_string)
    if 'config' not in params:
        return None
    
    try:
        config_b64 = unquote(params['config'][0])
        config_json = base64.b64decode(config_b64).decode('utf-8')
        config = json.loads(config_json)
        return config.get('apiKey')
    except Exception as e:
        print(f"Error parsing config: {e}")
        return None


class SmitheryConfigMiddleware:
    """Middleware to extract API key from Smithery's base64-encoded config parameter."""
    
    def __init__(self, app, api_key_setter):
        self.app = app
        self.api_key_setter = api_key_setter

    async def __call__(self, scope, receive, send):
        if scope.get('type') == 'http' and scope.get('path') in ['/mcp', '/mcp/']:
            query_string = scope.get('query_string', b'').decode('utf-8')
            if api_key := extract_config_from_query(query_string):
                self.api_key_setter(api_key)
                print(f"API key configured: {api_key[:10]}...")
        
        await self.app(scope, receive, send)


class MCPPathRedirect:
    """Middleware to handle /mcp path routing for MCP protocol."""
    
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope.get('type') == 'http' and scope.get('path') == '/mcp':
            scope['path'] = '/mcp/'
            scope['raw_path'] = b'/mcp/'
        await self.app(scope, receive, send)
