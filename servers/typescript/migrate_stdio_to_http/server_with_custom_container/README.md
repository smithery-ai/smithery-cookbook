# TypeScript Custom MCP Server with Express

A simple example of an MCP server implemented using the official MCP TypeScript SDK. This server is designed to run on both locally (with STDIO transport) and hosted on Smithery (HTTP transport and custom container).

## About the server

This server provides a `count_characters` tool that counts occurrences of a specific character in text. 

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
   The server expects configuration to be passed as base64-encoded JSON in the `config` query parameter:
   ```javascript
   const config = { apiKey: "your-api-key-here" };
   const configParam = Buffer.from(JSON.stringify(config)).toString('base64');
   // Use configParam in your MCP client configuration
   ```

4. **Deploy your own version:**
   To deploy your own MCP server:
   - Push your code to GitHub (make sure to include the `smithery.yaml`)
   - Connect your repository at [https://smithery.ai/new](https://smithery.ai/new)

## Project Structure

- `src/index.ts` - Main Express server with MCP HTTP transport
- `package.json` - Node.js dependencies and scripts
- `smithery.yaml` - Smithery deployment configuration
- `Dockerfile` - Dockerfile to host server in Smithery

## Key Features

- **HTTP Transport**: Uses Express.js for HTTP-based MCP communication
- **CORS Support**: Pre-configured CORS headers for browser-based MCP clients, including proper session ID handling
- **Configuration Parsing**: Supports base64-encoded JSON configuration via query parameters for secure config passing
- **Request Logging Middleware**: Custom middleware for debugging HTTP requests and responses
- **Dual Transport Support**: Can run with both STDIO (local development) and HTTP (production deployment) transports