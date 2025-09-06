# Character Counter MCP Server - Python Quickstart

A simple example of creating an MCP server using FastMCP and Python, designed to work with Smithery.

## What This Does

This server provides a character counter tool called `count_character` that counts how many times a specific character appears in a given text. You'll test it using the Smithery Playground for interactive development.

## Prerequisites

- Python 3.12 or higher
- A Python package manager ([uv](https://docs.astral.sh/uv/) recommended, but pip, poetry, etc. also work)
- Node.js and npx (optional, for Smithery Playground)

## Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/smithery-ai/smithery-cookbook.git
   cd smithery-cookbook/servers/python/quickstart
   ```

2. **Install dependencies:**
   
   **With uv (recommended):**
   ```bash
   uv sync
   ```
   
   **With poetry:**
   ```bash
   poetry install
   ```
   
   **With pip:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the server:**
   
   You have two options:
   
   **Option A: Just run the server**
   ```bash
   # With uv
   uv run smithery dev
   # or use the shorter script alias:
   uv run dev
   
   # With poetry
   poetry run smithery dev
   # or use the shorter script alias:
   poetry run dev
   
   # With pip (after installing dependencies)
   smithery dev
   ```
   This starts the MCP server on `http://localhost:8081` and keeps it running.
   
   **Option B: Run server + open playground (recommended for testing)**
   ```bash
   # With uv
   uv run smithery playground
   # or use the shorter script alias:
   uv run playground
   
   # With poetry
   poetry run smithery playground
   # or use the shorter script alias:
   poetry run playground
   
   # With pip (after installing dependencies)
   smithery playground
   ```
   This starts the MCP server AND automatically opens the Smithery Playground in your browser where you can:
   - Interact with your MCP server in real-time
   - Test the `count_character` tool with different text and characters
   - See the complete request/response flow
   - Debug and iterate on your MCP tools quickly

## Testing the Character Counter

Try asking: **"How many r's are in strawberry?"**

4. **Deploy to Smithery:**
   To deploy your MCP server:
   - Push your code to GitHub (make sure to include the `smithery.yaml`)
   - Connect your repository at [https://smithery.ai/new](https://smithery.ai/new)

Your server will be available over HTTP and ready to use with any MCP-compatible client!

## Stopping the Server

Press `Ctrl+C` in the terminal to stop the server.
