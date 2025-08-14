import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
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
      const debugInfo = config.debug ? ` (processed with API key ${config.apiKey.substring(0, 8)}...)` : "";

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
