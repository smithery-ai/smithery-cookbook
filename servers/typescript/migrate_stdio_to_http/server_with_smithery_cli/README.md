# TypeScript MCP Server with Smithery CLI

A simple Typescript MCP server built using the official [MCP Typescript SDK](https://github.com/modelcontextprotocol/typescript-sdk) and [smithery/cli](https://github.com/smithery-ai/cli). This example demonstrates how you can host streamable HTTP servers on Smithery using smithery/cli, with STDIO support for backwards compatibility.

See the complete guide: https://smithery.ai/docs/migrations/typescript-with-smithery-cli

**[Try it live on Smithery](https://smithery.ai/server/@smithery-ai/cookbook-ts-smithery-cli)**

## Features:

- **Smithery CLI**: Uses `@smithery/cli` for compiling your server and launching interactive playground
- **Smithery Session Configuration**: handles user's session configuration passed via Smithery
- **HTTP Transport**: Can run with both STDIO and HTTP transports using TRANSPORT env variable

## Prerequisites

- Node.js 22 or higher
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

   **HTTP Mode (automatically launches Smithery playground for interactive testing):**
   ```bash
   npm run dev
   ```

   <img src="../../../../public/smithery_playground.png" alt="Smithery Playground" width="800">

   **Optional - STDIO Mode:**
   If you prefer to run in STDIO mode, you can use:
   ```bash
   API_KEY=your-api-key npm run start:stdio
   ```

3. **Deploy your own version:**
   To deploy your own MCP server:
   - Connect your repository at [https://smithery.ai/new](https://smithery.ai/new)
