# Smithery Cookbook

The Smithery Cookbook provides code examples and guides designed to help developers build MCP (Model Context Protocol) servers and clients, offering copy-able code snippets that you can easily integrate into your own projects.

## Prerequisites

To make the most of the examples in this cookbook, you'll need:

- **Smithery CLI**: Install with `npm install -g @smithery/cli` to access the interactive playground and development tools
- **Programming language runtimes** for the examples you want to explore (Python 3.12+, Node.js 18+, etc.)
- Basic understanding of the [Model Context Protocol (MCP)](https://modelcontextprotocol.io/docs/getting-started/intro)

## Quick Start

1. **Clone this repository:**
   ```bash
   git clone https://github.com/smithery-ai/smithery-cookbook.git
   cd smithery-cookbook
   ```

2. **Choose an example and follow its README:**
   ```bash
   cd servers/python/quickstart
   # Follow the README.md instructions
   ```

3. **Test with Smithery Playground:**
   ```bash
   npx @smithery/cli playground --port 8080
   ```
   
   *Note: Replace `8080` with the port your server is running on*

4. **Deploy to Smithery (optional):**
   Ready to share your MCP server? [Deploy it here](https://smithery.ai/new) to host it on Smithery's platform.

## Table of Recipes

### Python Servers
- **[FastMCP Quickstart](servers/python/quickstart/)** - Basic server with greeting tool
- **[FastMCP Advanced](servers/python/server_with_session_config/)** - Server with session configuration
- **[Migrate STDIO to HTTP](servers/python/migrate_stdio_to_http/)** - Server with custom Docker container

### TypeScript Servers
- **[TypeScript Quickstart](servers/typescript/quickstart/)** - Simple server with character counting tool
- **[TypeScript Session Config](servers/typescript/server_with_session_config/)** - Server with session configuration
- **[Migrate STDIO to HTTP - Smithery CLI](servers/typescript/migrate_stdio_to_http/server_with_smithery_cli/)** - Server using Smithery CLI
- **[Migrate STDIO to HTTP - Custom Container](servers/typescript/migrate_stdio_to_http/server_with_custom_container/)** - Server with custom Docker container

## Development Workflow

Build and distribute your MCP servers with Smithery:

1. **Build** your MCP server using the language and framework of your choice
2. **Test** interactively with `npx @smithery/cli playground`
3. **Debug** with real-time request/response inspection
4. **Deploy** to Smithery's hosted platform - [Deploy here](https://smithery.ai/new)
5. **Distribute** your server gets its own page at `smithery.ai/server/{name}` for others to discover and use

## Explore Further

Looking for more resources to enhance your MCP development experience?

- [Smithery Documentation](https://docs.smithery.ai) - Complete guides and API reference
- [Deploy Your MCP Server](https://smithery.ai/new) - Host your server on Smithery's platform
- [Model Context Protocol Specification](https://modelcontextprotocol.io/docs/getting-started/intro) - Official MCP documentation
- [Smithery Discord Community](https://discord.gg/sKd9uycgH9) - Get help and share your projects

If you have ideas for new examples or guides, share them on the [issues page](https://github.com/smithery-ai/smithery-cookbook/issues).

## License

MIT License
