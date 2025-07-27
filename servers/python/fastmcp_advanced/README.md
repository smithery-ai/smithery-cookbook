# Text Utils MCP Server

A simple MCP server that provides text processing utilities with API key authentication. Perfect for learning MCP server development with Smithery!

## Features

- **Text Processing**: Basic text manipulation tools
- **API Key Authentication**: Demonstrates Smithery configuration patterns
- **Tool Discovery**: List available tools without authentication
- **Simple & Clean**: Minimal code focused on core concepts

## Available Tools

1. **`uppercase(text)`** - Convert text to uppercase
2. **`word_count(text)`** - Count words in text
3. **`count_character(text, character)`** - Count specific character occurrences
4. **`reverse_text(text)`** - Reverse the text
5. **`list_tools()`** - Discover available tools (no API key required)

## Quick Start

### Local Development

```bash
# Install dependencies
uv sync

# Run the server
python main.py
```

The server starts on `http://localhost:8080` with the MCP endpoint at `/mcp`.

### Example Usage

Once you configure any API key in Smithery, try these examples:

```python
# The classic test case!
count_character("strawberry", "r")  # Returns: "The character 'r' appears 3 times in 'strawberry'"

# Other examples
uppercase("hello world")           # Returns: "HELLO WORLD"
word_count("The quick brown fox")  # Returns: "Word count: 4"
reverse_text("hello")             # Returns: "olleh"
```

## API Key Authentication

This server demonstrates Smithery's configuration patterns:

- **Discovery Mode**: `list_tools()` works without authentication
- **Validation**: Any non-empty API key is accepted (demo purposes)
- **Configuration**: API key passed via Smithery as query parameter
- **Error Handling**: Clear messages when API key is missing

### How It Works

1. User configures API key in Smithery UI
2. Smithery passes configuration as: `/mcp?apiKey=your-key`
3. `SmitheryConfigMiddleware` extracts and stores the API key
4. Tools validate the stored API key when invoked

## Deployment on Smithery

1. Push your code (including `smithery.yaml` and `Dockerfile`) to GitHub
2. Connect your GitHub to Smithery
3. Navigate to the Deployments tab
4. Click Deploy to build and host your server

The `smithery.yaml` includes proper configuration schema for API key validation.

## Perfect for Learning

- **Minimal Code**: ~80 lines focused on essentials
- **Clear Examples**: The classic "count r's in strawberry" test case
- **Practical Tools**: Real text processing utilities
- **API Key Patterns**: Production-ready authentication flow

Great starting point for building your own MCP servers with authentication! 