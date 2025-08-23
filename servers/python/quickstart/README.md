# FastMCP Quickstart for Smithery

A simple example of creating an MCP server using FastMCP and Python, designed to work with Smithery.

## What This Does

This server provides a single tool called `greet` that takes a name and returns a friendly greeting message. You'll test it using the Smithery Playground for interactive development.

## Prerequisites

- Python 3.12 or higher
- [uv](https://docs.astral.sh/uv/) package manager
- Node.js and npx (optional, for Smithery CLI and playground)

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/smithery-ai/smithery-cookbook.git
   cd smithery-cookbook/servers/python/quickstart
   ```

2. **Install Smithery CLI (optional, for playground testing):**
   ```bash
   npm install -g @smithery/cli
   ```

3. **Install dependencies:**
   ```bash
   uv sync
   ```

4. **Run the server:**
   ```bash
   uv run python main.py
   ```

5. **Test it's working:**
   The server will start on `http://localhost:8081`

6. **Launch Smithery Playground:**
   In a new terminal, launch the interactive Smithery playground:
   ```bash
   smithery playground --port 8081
   ```
   
   This will open a web interface where you can:
   - Interact with your MCP server in real-time
   - Test the `greet` tool with different inputs
   - See the complete request/response flow
   - Debug and iterate on your MCP tools quickly

7. **Add Smithery session configuration (optional):**
   
   This step has three parts to add session-based configuration handling:
   - Part A: Add config validation function
   - Part B: Update the tool to use config validation
   - Part C: Test with configuration
   
   *Skip to step 8 if you don't need session configuration.*

8. **Deploy to Smithery:**
   To deploy your MCP server:
   - Push your code to GitHub (make sure to include the `smithery.yaml` and `Dockerfile`)
   - Connect your repository at [https://smithery.ai/new](https://smithery.ai/new)

Your server will be available over HTTP and ready to use with any MCP-compatible client!

## Stopping the Server

Press `Ctrl+C` in the terminal to stop the server.
