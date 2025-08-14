import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

// Session configuration for database access
// Learn more: https://smithery.ai/docs/build/session-config
export const configSchema = z.object({
  apiKey: z.string().describe("Database API key for authentication"),
});

// Dummy database to simulate real database operations
interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

const dummyDatabase: User[] = [
  { id: 1, name: "Alice Johnson", email: "alice@example.com", createdAt: "2024-01-15" },
  { id: 2, name: "Bob Smith", email: "bob@example.com", createdAt: "2024-01-20" },
  { id: 3, name: "Charlie Brown", email: "charlie@example.com", createdAt: "2024-02-01" },
];

export default function createServer({
  config,
}: {
  config: z.infer<typeof configSchema>;
}) {
  const server = new McpServer({
    name: "User Database API",
    version: "1.0.0",
  });

  server.registerTool("get_users", {
    title: "Get Users",
    description: "Retrieve all users from the database",
    inputSchema: {},
  }, async () => {
    // Verify API key is provided
    if (!config.apiKey) {
      throw new Error("Database API key is required for authentication");
    }

    return {
      content: [
        {
          type: "text",
          text: `Found ${dummyDatabase.length} users:\n${dummyDatabase.map(user => 
            `- ${user.name} (${user.email}) - Created: ${user.createdAt}`
          ).join('\n')}`
        }
      ],
    };
  });

  return server.server;
}