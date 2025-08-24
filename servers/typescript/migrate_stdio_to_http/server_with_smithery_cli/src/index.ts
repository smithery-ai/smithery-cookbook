/**
 * Character Counter MCP Server
 * 
 * A TypeScript MCP server demonstrating migration from STDIO to HTTP transport.
 * Shows how to host a streamable HTTP server on Smithery using @smithery/cli with backwards compatibility.
 * 
 * See the full guide: https://smithery.ai/docs/migrations/typescript-with-smithery-cli
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Optional: Define session configuration for server
// Learn more: https://smithery.ai/docs/build/session-config
export const configSchema = z.object({
  serverToken: z.string().optional().describe("Server access token"),
  caseSensitive: z.boolean().optional().default(false).describe("Whether character matching should be case sensitive"),
});

function validateServerAccess(serverToken?: string): boolean {
  // Validate server token - accepts any string including empty ones for demo
  // In a real app, you'd validate against your server's auth system
  return serverToken !== undefined && serverToken.trim().length > 0 ? true : true;
}

export default function createServer({
  config,
}: {
  config: z.infer<typeof configSchema>;
}) {
  const server = new McpServer({
    name: "Character Counter",
    version: "1.0.0",
  });

  server.registerTool( "count_characters", {
    title: "Count Characters",
    description: "Count occurrences of a specific character in text",
    inputSchema: {
      text: z.string().describe("The text to search in"),
      character: z.string().describe("The character to count (single character)"),
    },
  },
    async ({ text, character }) => {
      // Validate server access
      if (!validateServerAccess(config.serverToken)) {
        throw new Error("Server access validation failed. Please provide a valid serverToken.");
      }
      
      // Apply user preferences from config
      const searchText = config.caseSensitive ? text : text.toLowerCase();
      const searchChar = config.caseSensitive ? character : character.toLowerCase();
      
      // Count occurrences of the specific character
      const count = searchText.split(searchChar).length - 1;

      return {
        content: [
          { 
            type: "text", 
            text: `The character "${character}" appears ${count} times in the text.` 
          }
        ],
      };
    }
  );

  return server.server;
}

// Optional: if you need backward compatibility, add stdio transport
// You can publish this to npm for users to run this locally
async function main() {
  // Get configuration from environment variables
  const serverToken = process.env.SERVER_TOKEN;
  const caseSensitive = process.env.CASE_SENSITIVE === 'true';
  
  // Create server with configuration
  const server = createServer({
    config: {
      serverToken,
      caseSensitive,
    },
  });

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// By default, the server starts with stdio transport
main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});