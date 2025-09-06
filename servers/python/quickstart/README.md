# Calculator MCP Server - Python Quickstart

A simple example of creating an MCP server using FastMCP and Python, designed to work with Smithery.

## What This Does

This server provides a calculator tool called `add` that takes two numbers and returns their sum. You'll test it using the Smithery Playground for interactive development.

## Prerequisites

- Python 3.12 or higher
- A Python package manager ([uv](https://docs.astral.sh/uv/) recommended, but pip, poetry, etc. also work)
- Node.js and npx (optional, for Smithery CLI and Playground

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
   
   **With pip:**
   ```bash
   pip install -r requirements.txt
   ```
   
   **With poetry:**
   ```bash
   poetry install
   ```

3. **Run the server:**
   
   You have two options:
   
   **Option A: Just run the server**
   ```bash
   # With uv
   uv run smithery dev
   
   # With pip/poetry (after installing dependencies)
   smithery dev
   ```
   This starts the MCP server on `http://localhost:8081` and keeps it running.
   
   **Option B: Run server + open playground (recommended for testing)**
   ```bash
   # With uv
   uv run smithery playground
   
   # With pip/poetry (after installing dependencies)
   smithery playground
   ```
   This starts the MCP server AND automatically opens the Smithery Playground in your browser where you can:
   - Interact with your MCP server in real-time
   - Test the `add` tool with different numbers
   - See the complete request/response flow
   - Debug and iterate on your MCP tools quickly

4. **Deploy to Smithery:**
   To deploy your MCP server:
   - Push your code to GitHub (make sure to include the `smithery.yaml`)
   - Connect your repository at [https://smithery.ai/new](https://smithery.ai/new)

Your server will be available over HTTP and ready to use with any MCP-compatible client!

## Stopping the Server

Press `Ctrl+C` in the terminal to stop the server.
