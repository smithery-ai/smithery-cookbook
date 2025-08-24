import json
import base64
from urllib.parse import parse_qs, unquote

class SmitheryConfigMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        if scope.get('type') == 'http':
            query = scope.get('query_string', b'').decode()
            
            if 'config=' in query:
                try:
                    config_b64 = unquote(parse_qs(query)['config'][0])
                    config = json.loads(base64.b64decode(config_b64))
                    
                    # Inject full config into request scope for per-request access
                    scope['smithery_config'] = config
                except Exception as e:
                    print(f"SmitheryConfigMiddleware: Error parsing config: {e}")
                    scope['smithery_config'] = {}
            else:
                scope['smithery_config'] = {}
        
        await self.app(scope, receive, send)
