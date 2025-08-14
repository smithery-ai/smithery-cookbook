import express, { Request, Response } from "express";
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

// Create MCP server with your tools
function createServer(config: any) {
  const server = new McpServer({
    name: "example-server",
    version: "1.0.0",
  });

  // Add greet tool
  server.tool("greet", "Greet someone by name", {
    name: z.string().describe("Name to greet")
  }, async ({ name }) => {
    // Verify API key is provided
    if (!config.apiKey) {
      throw new Error("API key is required");
    }
    
    // Use config.apiKey for authentication/API calls
    return { content: [{ type: "text", text: `Hello, ${name}! (authenticated with ${config.apiKey.substring(0, 8)}...)` }] };
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
