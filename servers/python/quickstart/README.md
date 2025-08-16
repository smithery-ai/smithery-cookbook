# FastMCP Quickstart for Smithery

A simple example of creating an MCP server using FastMCP and Python, designed to work with Smithery.

## What This Does

This server provides a single tool called `greet` that takes a name and returns a friendly greeting message. You'll test it using the Smithery Playground for interactive development.

## Prerequisites

- Python 3.12 or higher
- [uv](https://docs.astral.sh/uv/) package manager
- Node.js and npx (for Smithery CLI and playground)

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
   The server will start on `http://localhost:8000`
   
   You should see output like:
   ```
INFO:     Started server process [50043]
INFO:     Waiting for application startup.
[08/16/25 16:51:39] INFO     StreamableHTTP session manager started
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
   ```

4. **Launch Smithery Playground:**
   In a new terminal, launch the interactive Smithery playground:
   ```bash
   npx -y @smithery/cli playground --port 8000
   ```
   
   This will open a web interface where you can:
   - Interact with your MCP server in real-time
   - Test the `greet` tool with different inputs
   - See the complete request/response flow
   - Debug and iterate on your MCP tools quickly

   <img src="../../../public/smithery_playground.png" alt="Smithery Playground" width="800">

5. **Deploy to Smithery:**
   To deploy your MCP server:
   - Push your code to GitHub (make sure to include the `smithery.yaml` and `Dockerfile`)
   - Connect your repository at [https://smithery.ai/new](https://smithery.ai/new)

Your server will be available over HTTP and ready to use with any MCP-compatible client!

## Stopping the Server

Press `Ctrl+C` in the terminal to stop the server.
