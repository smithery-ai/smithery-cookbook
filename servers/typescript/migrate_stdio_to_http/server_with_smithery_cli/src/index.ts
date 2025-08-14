import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Optional: Define session configuration for server
// Learn more: https://smithery.ai/docs/build/session-config
export const configSchema = z.object({
  apiKey: z.string().describe("Your API key"), // for demonstration
});

export default function createServer({
  config,
}: {
  config: z.infer<typeof configSchema>;
}) {
  const server = new McpServer({
    name: "Say Hello",
    version: "1.0.0",
  });

  server.registerTool( "greet", {
    title: "Greet Someone",
    description: "Greet someone by name",
    inputSchema: {
      name: z.string().describe("Name to greet")
    },
  },
    async ({ name }) => {
      // Verify API key is provided
      if (!config.apiKey) {
        throw new Error("API key is required");
      }
      
      return {
        content: [
          { 
            type: "text", 
            text: `Hello, ${name}!` 
          }
        ],
      };
    }
  );

  return server.server;
}

// Optional: if you need backward compatibility, start the server with stdio transport by default
// You can publish this to npm for users to run this locally
async function main() {
  // Check if API key is provided
  const apiKey = process.env.API_KEY || "";
  
  // Create server with configuration
  const server = createServer({
    config: {
      apiKey,
    },
  });

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// By default the server with stdio transport
main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});