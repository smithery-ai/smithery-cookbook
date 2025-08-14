import express, { Request, Response } from "express";
import cors from "cors";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { logging } from "./middleware.js";

// Optional: Define configuration schema to require configuration at connection time
export const configSchema = z.object({
  apiKey: z.string().describe("Your API key"),
  debug: z.boolean().default(false).describe("Enable debug logging"),
});

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
export default function createServer({
  config,
}: {
  config: z.infer<typeof configSchema>;
}) {
  const server = new McpServer({
    name: "Say Hello",
    version: "1.0.0",
  });

  // Add greet tool
  server.registerTool("greet", {
    title: "Greet Someone",
    description: "Greet someone by name",
    inputSchema: {
      name: z.string().describe("Name to greet")
    },
  }, async ({ name }) => {
    // Verify API key is provided
    if (!config.apiKey) {
      throw new Error("API key is required");
    }
    
    // Use config.apiKey for authentication/API calls
    return { 
      content: [{ 
        type: "text", 
        text: `Hello, ${name}!` 
      }] 
    };
  });

  return server.server;
}

// Handle MCP requests at /mcp endpoint
app.all('/mcp', async (req: Request, res: Response) => {
  try {
    const rawConfig = parseConfig(req);
    
    // Validate and parse configuration
    const config = configSchema.parse({
      apiKey: rawConfig.apiKey || process.env.API_KEY,
      debug: rawConfig.debug || process.env.DEBUG === "true",
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
  const transport = process.env.TRANSPORT || 'http';
  
  if (transport === 'stdio') {
    // Run in stdio mode
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      throw new Error("API_KEY environment variable is required but not provided");
    }

    // Create server with configuration
    const server = createServer({
      config: {
        apiKey,
        debug: process.env.DEBUG === "true",
      },
    });

    // Start receiving messages on stdin and sending messages on stdout
    const stdioTransport = new StdioServerTransport();
    await server.connect(stdioTransport);
    console.error("MCP Server running in stdio mode");
  } else {
    // Run in HTTP mode (default)
    app.listen(PORT, () => {
      console.log(`MCP HTTP Server listening on port ${PORT}`);
    });
  }
}

// Start the server
main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});
