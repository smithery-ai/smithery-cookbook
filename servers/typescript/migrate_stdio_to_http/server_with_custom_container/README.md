# TypeScript MCP Server with Custom Container

A simple typescript MCP server to demonstrate hosting on Smithery with custom docker containers. 

This server is designed to run both locally (with STDIO transport) and remotely via Smithery (HTTP transport).

## Prerequisites

- Node.js 18 or higher
- npm package manager

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```
   
   You should see the message:
   ```
   MCP HTTP Server listening on port 8000
   ```

3. **Configuration:**
   This server is built to handle Smithery's session configuration. When deployed on Smithery, user configuration is automatically passed as base64-encoded JSON in the `config` query parameter. The server parses this configuration for each session:
   
   ```javascript
   // How the server extracts configuration from query parameters
   function parseConfig(req) {
     const configParam = req.query.config; // Base64-encoded JSON from Smithery
     if (configParam) {
       return JSON.parse(Buffer.from(configParam, 'base64').toString());
     }
     return {};
   }
   // Example extracted config: { apiKey: "your-api-key-here" }
   ```

   For local testing, you can manually pass configuration via the query parameter.

4. **Deploy your own version:**
   To deploy your own MCP server:
   - Connect your repository at [https://smithery.ai/new](https://smithery.ai/new)

## Project Structure

- `src/index.ts` - Main Express server with MCP HTTP transport
- `package.json` - Node.js dependencies and scripts
- `smithery.yaml` - Smithery deployment configuration
- `Dockerfile` - Dockerfile to host server in Smithery

## Things to Note:

- **CORS**: Pre-configured CORS headers for browser-based MCP clients
- **Smithery Session Configuration**: handles base64-encoded JSON configuration passed via query parameters
- **Request Logging Middleware**: Custom middleware for debugging HTTP requests and responses
- **Server Transport**: Can run with both STDIO and HTTP transports using `TRANSPORT` env variable