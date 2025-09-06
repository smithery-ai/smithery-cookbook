from mcp.server.fastmcp import FastMCP
from smithery.decorators import smithery

@smithery.server()
def create_server():
    """Create and return a FastMCP server instance."""
    
    server = FastMCP(name="Character Counter")

    @server.tool()
    def count_character(text: str, character: str) -> int:
        """Count how many times a specific character appears in the given text."""
        return text.count(character)

    # add prompts and resources

    return server