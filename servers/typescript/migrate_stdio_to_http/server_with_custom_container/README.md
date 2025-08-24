# TypeScript MCP Server with Custom Container

A simple TypeScript MCP server built using the official [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk), Express, and custom Docker container. This example demonstrates how you can host HTTP servers on Smithery using custom containers, with STDIO support for backwards compatibility.

See the complete guide: https://smithery.ai/docs/migrations/typescript-custom-container

**[Try it live on Smithery](https://smithery.ai/server/@smithery-ai/cookbook-ts-custom-container)**

## Features:

- **CORS**: CORS headers for browser-based MCP clients
- **Smithery Session Configuration**: handles user's session configuration passed via Smithery ([learn more](https://smithery.ai/docs/build/session-config))
- **Request Logging Middleware**: Custom middleware for debugging HTTP requests and responses
- **Server Transport**: Can run with both STDIO and HTTP transports using `TRANSPORT` env variable

## Prerequisites

- Node.js 22 or higher
- npm package manager

## Project Structure

- `src/index.ts` - Main Express server with MCP HTTP transport
- `package.json` - Node.js dependencies and scripts
- `smithery.yaml` - Smithery deployment and session configuration
- `Dockerfile` - Dockerfile to host server in Smithery

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**

   **HTTP Mode:**
   ```bash
   npm run dev
   ```
   This will start the server on port 8081.

3. **Test interactively:**
   Once your server is running in HTTP mode, you can test it interactively using the Smithery playground:
   ```bash
   npx -y @smithery/cli playground --port 8081
   ```

   <img src="../../../../public/smithery_playground.png" alt="Smithery Playground" width="800">

4. **Deploy your own version:**
   To deploy your own MCP server:
   - Connect your repository at [https://smithery.ai/new](https://smithery.ai/new)