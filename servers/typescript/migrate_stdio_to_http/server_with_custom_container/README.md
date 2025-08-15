# TypeScript MCP Server with Custom Container

A simple TypeScript MCP server built using the official [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk) to demonstrate hosting on Smithery with custom docker containers.

This server is designed to run both locally (STDIO transport) and remotely via Smithery (HTTP transport).

## Features:

- **CORS**: Pre-configured CORS headers for browser-based MCP clients
- **Smithery Session Configuration**: handles base64-encoded JSON configuration passed via query parameters
- **Request Logging Middleware**: Custom middleware for debugging HTTP requests and responses
- **Server Transport**: Can run with both STDIO and HTTP transports using `TRANSPORT` env variable

## Prerequisites

- Node.js 22 or higher
- npm package manager

## Project Structure

- `src/index.ts` - Main Express server with MCP HTTP transport
- `package.json` - Node.js dependencies and scripts
- `smithery.yaml` - Smithery deployment configuration
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

   **STDIO Mode (default):**
   ```bash
   npm run start:stdio
   ```

3. **Test interactively:**
   Once your server is running in HTTP mode, you can test it interactively using the Smithery playground:
   ```bash
   npx @smithery/cli playground --port 8080
   ```

   <img src="../../../../public/smithery_playground.png" alt="Smithery Playground" width="800">

4. **Deploy your own version:**
   To deploy your own MCP server:
   - Connect your repository at [https://smithery.ai/new](https://smithery.ai/new)