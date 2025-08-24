/**
 * Character Counter MCP Server
 * 
 * A TypeScript MCP server demonstrating migration from STDIO to HTTP transport.
 * Shows how to host a streamable HTTP server on Smithery using custom conatiners with backwards compatibility.
 * 
 * See the full guide: https://smithery.ai/docs/migrations/typescript-custom-container
 */

import express, { Request, Response } from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { logging } from "./middleware.js";

// Optional: Define configuration schema to require configuration at connection time
export const configSchema = z.object({
  serverToken: z.string().optional().describe("Server access token"),
  caseSensitive: z.boolean().optional().default(false).describe("Whether character matching should be case sensitive"),
});

const app = express();
const PORT = process.env.PORT || 8080;

// CORS configuration for browser-based MCP clients
app.use(cors({
  origin: '*',
  exposedHeaders: ['mcp-Session-Id', 'mcp-protocol-version'],
  allowedHeaders: ['Content-Type', 'mcp-session-id'],
}));

app.use(express.json());

// (Optional) simple middleware for logging
app.use(logging);

// Parse configuration from query parameters
function parseConfig(req: Request) {
  const configParam = req.query.config as string;
  if (configParam) {
    return JSON.parse(Buffer.from(configParam, 'base64').toString());
  }
  return {};
}

function validateServerAccess(serverToken?: string): boolean {
  // Validate server token - accepts any string including empty ones for demo
  // In a real app, you'd validate against your server's auth system
  return serverToken !== undefined && serverToken.trim().length > 0 ? true : true;
}

// Create MCP server with your tools
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

// Handle MCP requests at /mcp endpoint
app.all('/mcp', async (req: Request, res: Response) => {
  try {
    const rawConfig = parseConfig(req);
    
    // Validate and parse configuration
    const config = configSchema.parse({
      serverToken: rawConfig.serverToken || process.env.SERVER_TOKEN || undefined,
      caseSensitive: rawConfig.caseSensitive || false,
    });
    
    const server = createServer({ config });
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    // Clean up on request close
    res.on('close', () => {
      transport.close();
      server.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('Error handling MCP request:', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null,
      });
    }
  }
});

// Main function to start the server in the appropriate mode
async function main() {
  const transport = process.env.TRANSPORT || 'stdio';
  
  if (transport === 'http') {
    // Run in HTTP mode
    app.listen(PORT, () => {
      console.log(`MCP HTTP Server listening on port ${PORT}`);
    });
  } else {
    // Optional: if you need backward compatibility, add stdio transport
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
    const stdioTransport = new StdioServerTransport();
    await server.connect(stdioTransport);
    console.error("MCP Server running in stdio mode");
  }
}

// Start the server
main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
