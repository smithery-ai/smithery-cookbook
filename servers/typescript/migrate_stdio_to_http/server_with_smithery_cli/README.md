# TypeScript MCP Server with Smithery CLI

A simple Typescript MCP server built using the official [MCP Typescript SDK](https://github.com/modelcontextprotocol/typescript-sdk) and [smithery/cli](https://github.com/smithery-ai/cli). This server demonstrates how you can host streamable HTTP servers on Smithery, with STDIO support for backwards compatibility.

## Features:

- **Smithery CLI**: Uses `@smithery/cli` for HTTP transport and development playground
- **Smithery Session Configuration**: handles user configuration passed via the Smithery platform
- **Server Transport**: Can run with both STDIO and HTTP transports using different npm scripts

## Prerequisites

- Node.js 18 or higher
- npm package manager

## Project Structure

- `src/index.ts` - Main server implementation with MCP tools and session configuration
- `package.json` - Node.js dependencies and scripts
- `smithery.yaml` - Smithery deployment configuration

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**

   **STDIO Mode (default):**
   ```bash
   API_KEY=your-api-key npm run start:stdio
   ```

   **HTTP Mode (automatically launches Smithery playground for interactive testing):**
   ```bash
   npm run dev
   ```

   <img src="../../../../public/smithery_playground.png" alt="Smithery Playground" width="800">

3. **Deploy your own version:**
   To deploy your own MCP server:
   - Connect your repository at [https://smithery.ai/new](https://smithery.ai/new)
