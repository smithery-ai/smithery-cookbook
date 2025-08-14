# TypeScript MCP Server with Smithery CLI

A simple TypeScript MCP server to demonstrate hosting on Smithery using the Smithery CLI.

This server is designed to run both locally (STDIO transport) and remotely via Smithery (HTTP transport).

## Prerequisites

- Node.js 18 or higher
- npm package manager

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

   **HTTP Mode:**
   ```bash
   npm run dev
   ```
   
   The `npm run dev` command will automatically launch the Smithery Playground in your browser where you can:
   - Interact with your MCP server in real-time
   - Test the `count_characters` tool with different inputs
   - See the complete request/response flow
   - Debug and iterate on your MCP tools quickly

3. **Configuration:**
   Smithery allows users to pass session-level configuration to MCP servers. Smithery passes this as base64-encoded JSON in the `config` query parameter. The server parses this configuration for each session:
   
   ```typescript
   // How the server extracts configuration
   export const configSchema = z.object({
     apiKey: z.string().describe("Your API key"), // for demonstration
   });
   
   export default function createServer({
     config,
   }: {
     config: z.infer<typeof configSchema>;
   }) {
     // Server uses the config.apiKey for validation
   }
   // Example extracted config: { apiKey: "your-api-key-here" }
   ```

   For local testing, you need to provide the API_KEY environment variable for STDIO mode.

4. **Deploy your own version:**
   To deploy your own MCP server:
   - Connect your repository at [https://smithery.ai/new](https://smithery.ai/new)

## Project Structure

- `src/index.ts` - Main server implementation with MCP tools and session configuration
- `package.json` - Node.js dependencies and scripts
- `smithery.yaml` - Smithery deployment configuration

## Things to Note:

- **Smithery CLI**: Uses `@smithery/cli` for HTTP transport and development playground
- **Smithery Session Configuration**: handles user configuration passed via the Smithery platform
- **Server Transport**: Can run with both STDIO and HTTP transports using different npm scripts
