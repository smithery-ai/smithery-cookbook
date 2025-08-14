import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export default function createServer() {
  const server = new McpServer({
    name: "Say hello",
    version: "1.0.0",
  });

  server.registerTool("greet", {
    title: "Greet",
    description: "Say hello to someone by name",
    inputSchema: {
      name: z.string().describe("The name of the person to greet"),
    },
  }, async ({ name }) => {
    return {
      content: [
        {
          type: "text",
          text: `Hello, ${name}! Nice to meet you!`
        }
      ],
    };
  });

  return server.server;
}