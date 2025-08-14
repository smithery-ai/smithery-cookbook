import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import createServer, { configSchema } from "./index.js";

// HTTP server for MCP over SSE
async function startHttpServer() {
  // Check if API key is provided
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

  // Create SSE transport for HTTP
  const transport = new SSEServerTransport("/message", server);
  
  // Start HTTP server
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  const host = process.env.HOST || "localhost";
  
  await transport.start();
  console.log(`MCP server running on http://${host}:${port}/message`);
}

// Start the HTTP server
startHttpServer().catch((error) => {
  console.error("HTTP server error:", error);
  process.exit(1);
});
