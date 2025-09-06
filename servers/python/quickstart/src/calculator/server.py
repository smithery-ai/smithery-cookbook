from mcp.server.fastmcp import FastMCP
from smithery.decorators import smithery 

@smithery.server()
def create_server():
    server = FastMCP(name="Calculator")

    @server.tool()
    def add(a: float, b: float) -> float:
        """Add two numbers together."""
        return a + b

    return server