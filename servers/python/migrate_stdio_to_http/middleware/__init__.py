import json
import base64
from urllib.parse import parse_qs, unquote


class SmitheryConfigMiddleware:
    def __init__(self, app, set_api_key):
        self.app = app
        self.set_api_key = set_api_key

    async def __call__(self, scope, receive, send):
        if scope.get('type') == 'http' and scope.get('path') in ['/mcp', '/mcp/']:
            query = scope.get('query_string', b'').decode()
            if 'config=' in query:
                try:
                    config_b64 = unquote(parse_qs(query)['config'][0])
                    config = json.loads(base64.b64decode(config_b64))
                    if api_key := config.get('apiKey'):
                        self.set_api_key(api_key)
                except:
                    pass
        await self.app(scope, receive, send)


class MCPPathRedirect:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope.get('type') == 'http' and scope.get('path') == '/mcp':
            scope['path'] = '/mcp/'
            scope['raw_path'] = b'/mcp/'
        await self.app(scope, receive, send)
