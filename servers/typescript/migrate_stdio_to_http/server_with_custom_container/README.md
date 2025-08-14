# TypeScript Custom MCP Server with Express

A custom example of creating an MCP (Model Context Protocol) server using TypeScript, Express.js, and HTTP transport, designed to work with Smithery.

## What This Does

This server provides a `count_characters` tool that counts occurrences of a specific character in text. Unlike the quickstart example, this implementation uses Express.js with HTTP transport, making it suitable for web-based deployments and custom server configurations.

## Prerequisites

- Node.js 18 or higher
- npm or yarn package manager

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Test the server:**
   The server will start on port 8000 (or PORT environment variable). You can test it by making MCP requests to:
   ```
   http://localhost:8000/mcp
   ```

4. **Configuration:**
   The server expects configuration to be passed as base64-encoded JSON in the `config` query parameter:
   ```javascript
   const config = { apiKey: "your-api-key-here" };
   const configParam = Buffer.from(JSON.stringify(config)).toString('base64');
   // Use configParam in your MCP client configuration
   ```

5. **Deploy your own version:**
   To deploy your own MCP server:
   - Push your code to GitHub (make sure to include the `smithery.yaml`)
   - Connect your repository at [https://smithery.ai/new](https://smithery.ai/new)

## Project Structure

- `src/index.ts` - Main Express server with MCP HTTP transport
- `package.json` - Node.js dependencies and scripts
- `smithery.yaml` - Smithery deployment configuration

## Available Tools

- **count_characters**: Counts how many times a specific character appears in the given text (case insensitive)

## Key Features

- **HTTP Transport**: Uses Express.js for HTTP-based MCP communication
- **CORS Support**: Configured for browser-based MCP clients
- **Configuration Parsing**: Supports base64-encoded configuration via query parameters
- **Error Handling**: Comprehensive error handling for MCP requests
- **Session Management**: Proper cleanup of MCP sessions and transports

## Development vs Production

For development, the server runs with CORS allowing all origins (`origin: '*'`). For production deployments, make sure to:

1. Configure CORS appropriately for your specific domain
2. Set up proper authentication and API key validation
3. Configure environment variables for production settings

## Stopping the Server

Press `Ctrl+C` in the terminal to stop the server.

## API Endpoint

The MCP server accepts requests at the `/mcp` endpoint and handles all MCP protocol communication through HTTP transport.
