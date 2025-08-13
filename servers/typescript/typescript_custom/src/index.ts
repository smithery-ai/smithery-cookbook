import express, { Request, Response } from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";

const app = express();
const PORT = process.env.PORT || 8000;

// CORS configuration for browser-based MCP clients
app.use(cors({
  origin: '*', // Configure appropriately for production
  exposedHeaders: ['Mcp-Session-Id'],
  allowedHeaders: ['Content-Type', 'mcp-session-id'],
}));

app.use(express.json());

// Parse configuration from query parameters
function parseConfig(req: Request) {
  const configParam = req.query.config as string;
  if (configParam) {
    return JSON.parse(Buffer.from(configParam, 'base64').toString());
  }
  return {};
}

// Create MCP server with your tools
function createServer(config: any) {
  const server = new McpServer({
    name: "character-counter-server",
    version: "1.0.0",
  });

  // Add character counter tool
  server.tool("count_characters", "Count occurrences of a specific character in text", {
    text: z.string().describe("The text to search in"),
    character: z.string().describe("The character to count (single character)")
  }, async ({ text, character }) => {
    // Verify API key is provided
    if (!config.apiKey) {
      throw new Error("API key is required");
    }
    
    // Count occurrences of the specific character (case insensitive)
    const count = text.toLowerCase().split(character.toLowerCase()).length - 1;
    
    return { 
      content: [{ 
        type: "text", 
        text: `The character "${character}" appears ${count} times in the text. (authenticated with ${config.apiKey.substring(0, 8)}...)` 
      }] 
    };
  });

  return server;
}

// Handle MCP requests at /mcp endpoint
app.all('/mcp', async (req: Request, res: Response) => {
  try {
    const config = parseConfig(req);
    const server = createServer(config);
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
