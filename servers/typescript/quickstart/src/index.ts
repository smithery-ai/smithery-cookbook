import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// Optional: Define configuration schema to require configuration at connection time
export const configSchema = z.object({
  apiKey: z.string().describe("Your API key"),
  debug: z.boolean().default(false).describe("Enable debug logging"),
});

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
      // Verify API key is provided
      if (!config.apiKey) {
        throw new Error("API key is required");
      }
      
      // Count occurrences of the specific character (case insensitive)
      const count = text.toLowerCase().split(character.toLowerCase()).length - 1;

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

  server.registerPrompt( "count_characters", {
    title: "Count Characters",
    description: "Count occurrences of a specific character in text",
    argsSchema: {
      text: z.string().describe("The text to search in"),
      character: z.string().describe("The character to count (single character)"),
    },
  },
    ({ text, character }) => {
      return {
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text: `Count how many times the character "${character}" appears in this text: "${text}"`
            }
          }
        ]
      };
    }
  );

  return server.server;
}

// Optional: if you need backward compatibility, start the server with stdio transport by default
async function main() {
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

  // Start receiving messages on stdin and sending messages on stdout
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

// By default the server with stdio transport
main().catch((error) => {
  console.error("Server error:", error);
  process.exit(1);
});