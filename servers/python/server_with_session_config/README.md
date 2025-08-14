# FastMCP Advanced for Smithery

A more advanced example of creating an MCP (Model Context Protocol) server using FastMCP with Python, featuring API key authentication and multiple text processing tools.

## What This Does

This server provides text processing utilities with API key authentication:
- **`uppercase(text)`** - Convert text to uppercase
- **`word_count(text)`** - Count words in text  
- **`count_character(text, character)`** - Count specific character occurrences
- **`reverse_text(text)`** - Reverse the text

## Prerequisites

- Python 3.12 or higher
- [uv](https://docs.astral.sh/uv/) package manager
- Node.js (for Smithery CLI and playground)

## Quick Start

1. **Install dependencies:**
   ```bash
   uv sync
   ```

2. **Run the server:**
   ```bash
   uv run python main.py
   ```

3. **Test it's working:**
   The server will start on `http://127.0.0.1:8080`
   
   You should see output like:
   ```
   INFO:     Started server process [12345]
   INFO:     Waiting for application startup.
   INFO:     Application startup complete.
   INFO:     Uvicorn running on http://127.0.0.1:8080 (Press CTRL+C to quit)
   ```

4. **Launch Smithery Playground:**
   In a new terminal, launch the interactive Smithery playground:
   ```bash
   npx -y @smithery/cli playground --port 8080
   ```
   
   This will open a web interface where you can:
   - Test the tools (configure any API key in the playground)
   - Try the classic: `count_character("strawberry", "r")` 
   - See the complete request/response flow
   - Debug and iterate on your MCP tools quickly

5. **Deploy to Smithery:**
   To deploy your MCP server:
   - Push your code to GitHub (make sure to include the `smithery.yaml` and `Dockerfile`)
   - Connect your repository at [https://smithery.ai/new](https://smithery.ai/new)
   - Configure an API key in Smithery UI for tool access

Your server will be available over HTTP and ready to use with any MCP-compatible client!

## Stopping the Server

Press `Ctrl+C` in the terminal to stop the server. 