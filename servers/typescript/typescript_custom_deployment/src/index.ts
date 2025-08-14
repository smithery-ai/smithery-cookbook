import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import { logging } from "./middleware.js";

const app = express();
const PORT = process.env.PORT || 8000;

// CORS configuration for browser-based MCP clients
app.use(cors({
  origin: '*', // Configure appropriately for production
  exposedHeaders: ['Mcp-Session-Id'],
  allowedHeaders: ['Content-Type', 'mcp-session-id', 'mcp-protocol-version'],
}));

app.use(express.json());

// (Optional) simple middleware for logging
app.use(logging);

// Create MCP server with your tools
function createServer() {
  const server = new McpServer({
    name: "character-counter-server",
    version: "1.0.0",
  });

  // Add character counter tool
  server.tool("count_characters", "Count occurrences of a specific character in text", {
    text: z.string().describe("The text to search in"),
    character: z.string().describe("The character to count (single character)")
  }, async ({ text, character }) => {
    // Count occurrences of the specific character (case insensitive)
    const count = text.toLowerCase().split(character.toLowerCase()).length - 1;
    
    return { 
      content: [{ 
        type: "text", 
        text: `The character "${character}" appears ${count} times in the text.` 
      }] 
    };
  });

  return server;
}

// Handle MCP requests at /mcp endpoint
app.all('/mcp', async (req: Request, res: Response) => {
  try {
    const server = createServer();
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

app.listen(PORT, () => {
  console.log(`MCP HTTP Server listening on port ${PORT}`);
});
