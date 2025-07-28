# MCP OAuth Client Example

This project is an example of a Next.js application that acts as an OAuth 2.0 client for the Model Context Protocol (MCP).

## Integration Guide

You can integrate the MCP OAuth client functionality into your own Next.js application without cloning this repository. Follow the steps below.

### 1. Dependencies

First, install the necessary dependencies:

```bash
npm install @modelcontextprotocol/sdk
```

### 2. Create Library Files

Next, create the following files in your `src/lib` directory.

#### `src/lib/session-store.ts`

This file contains a simple in-memory session store. For production applications, you should use a more robust solution like Redis or a database.

```typescript
import { MCPOAuthClient } from './oauth-client';

// Simple in-memory session store for demo purposes
// In production, use Redis, database, or proper session management
class SessionStore {
  private clients = new Map<string, MCPOAuthClient>();
  
  setClient(sessionId: string, client: MCPOAuthClient) {
    this.clients.set(sessionId, client);
  }
  
  getClient(sessionId: string): MCPOAuthClient | null {
    return this.clients.get(sessionId) || null;
  }
  
  removeClient(sessionId: string) {
    const client = this.clients.get(sessionId);
    if (client) {
      client.disconnect();
      this.clients.delete(sessionId);
    }
  }
  
  generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }
}

export const sessionStore = new SessionStore();
```

#### `src/lib/oauth-client.ts`

This file contains the core logic for the MCP OAuth client.

```typescript
import { URL } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { OAuthClientInformation, OAuthClientInformationFull, OAuthClientMetadata, OAuthTokens } from '@modelcontextprotocol/sdk/shared/auth.js';
import {
  CallToolRequest,
  ListToolsRequest,
  CallToolResultSchema,
  ListToolsResultSchema,
  ListToolsResult,
  CallToolResult
} from '@modelcontextprotocol/sdk/types.js';
import { OAuthClientProvider, UnauthorizedError } from '@modelcontextprotocol/sdk/client/auth.js';

class InMemoryOAuthClientProvider implements OAuthClientProvider {
  private _clientInformation?: OAuthClientInformationFull;
  private _tokens?: OAuthTokens;
  private _codeVerifier?: string;

  constructor(
    private readonly _redirectUrl: string | URL,
    private readonly _clientMetadata: OAuthClientMetadata,
    onRedirect?: (url: URL) => void
  ) {
    this._onRedirect = onRedirect || ((url) => {
      console.log(`Redirect to: ${url.toString()}`);
    });
  }

  private _onRedirect: (url: URL) => void;

  get redirectUrl(): string | URL {
    return this._redirectUrl;
  }

  get clientMetadata(): OAuthClientMetadata {
    return this._clientMetadata;
  }

  clientInformation(): OAuthClientInformation | undefined {
    return this._clientInformation;
  }

  saveClientInformation(clientInformation: OAuthClientInformationFull): void {
    this._clientInformation = clientInformation;
  }

  tokens(): OAuthTokens | undefined {
    return this._tokens;
  }

  saveTokens(tokens: OAuthTokens): void {
    this._tokens = tokens;
  }

  redirectToAuthorization(authorizationUrl: URL): void {
    this._onRedirect(authorizationUrl);
  }

  saveCodeVerifier(codeVerifier: string): void {
    this._codeVerifier = codeVerifier;
  }

  codeVerifier(): string {
    if (!this._codeVerifier) {
      throw new Error('No code verifier saved');
    }
    return this._codeVerifier;
  }
}

export class MCPOAuthClient {
  private client: Client | null = null;
  private oauthProvider: InMemoryOAuthClientProvider | null = null;

  constructor(
    private serverUrl: string,
    private callbackUrl: string,
    private onRedirect: (url: string) => void
  ) {}

  async connect(): Promise<void> {
    const clientMetadata: OAuthClientMetadata = {
      client_name: 'Next.js MCP OAuth Client',
      redirect_uris: [this.callbackUrl],
      grant_types: ['authorization_code', 'refresh_token'],
      response_types: ['code'],
      token_endpoint_auth_method: 'client_secret_post',
      scope: 'mcp:tools'
    };

    this.oauthProvider = new InMemoryOAuthClientProvider(
      this.callbackUrl,
      clientMetadata,
      (redirectUrl: URL) => {
        this.onRedirect(redirectUrl.toString());
      }
    );

    this.client = new Client({
      name: 'nextjs-oauth-client',
      version: '1.0.0',
    }, { capabilities: {} });

    await this.attemptConnection();
  }

  private async attemptConnection(): Promise<void> {
    if (!this.client || !this.oauthProvider) {
      throw new Error('Client not initialized');
    }

    const baseUrl = new URL(this.serverUrl);
    const transport = new StreamableHTTPClientTransport(baseUrl, {
      authProvider: this.oauthProvider
    });

    try {
      await this.client.connect(transport);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw new Error('OAuth authorization required');
      } else {
        throw error;
      }
    }
  }

  async finishAuth(authCode: string): Promise<void> {
    if (!this.client || !this.oauthProvider) {
      throw new Error('Client not initialized');
    }

    const baseUrl = new URL(this.serverUrl);
    const transport = new StreamableHTTPClientTransport(baseUrl, {
      authProvider: this.oauthProvider
    });

    await transport.finishAuth(authCode);
    await this.client.connect(transport);
  }

  async listTools(): Promise<ListToolsResult> {
    if (!this.client) {
      throw new Error('Not connected to server');
    }

    const request: ListToolsRequest = {
      method: 'tools/list',
      params: {},
    };

    return await this.client.request(request, ListToolsResultSchema);
  }

  async callTool(toolName: string, toolArgs: Record<string, unknown>): Promise<CallToolResult> {
    if (!this.client) {
      throw new Error('Not connected to server');
    }

    const request: CallToolRequest = {
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: toolArgs,
      },
    };

    return await this.client.request(request, CallToolResultSchema);
  }

  disconnect(): void {
    this.client = null;
    this.oauthProvider = null;
  }
}
```

### 3. Create API Routes

Create the following API routes in your `src/app/api/mcp` directory.

#### `src/app/api/mcp/auth/connect/route.ts`

This endpoint initiates the connection to the MCP server.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { MCPOAuthClient } from '@/lib/oauth-client';
import { sessionStore } from '@/lib/session-store';

interface ConnectRequestBody {
  serverUrl: string;
  callbackUrl: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ConnectRequestBody = await request.json();
    const { serverUrl, callbackUrl } = body;

    if (!serverUrl || !callbackUrl) {
      return NextResponse.json(
        { error: 'Server URL and callback URL are required' },
        { status: 400 }
      );
    }

    const sessionId = sessionStore.generateSessionId();
    let authUrl: string | null = null;

    const client = new MCPOAuthClient(
      serverUrl,
      callbackUrl,
      (redirectUrl: string) => {
        authUrl = redirectUrl;
      }
    );

    try {
      await client.connect();
      // If we get here, connection succeeded without OAuth
      sessionStore.setClient(sessionId, client);
      return NextResponse.json({ success: true, sessionId });
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === 'OAuth authorization required' && authUrl) {
          // Store client for later use
          sessionStore.setClient(sessionId, client);
          return NextResponse.json(
            { requiresAuth: true, authUrl, sessionId },
            { status: 401 }
          );
        } else {
          return NextResponse.json(
            { error: error.message || 'Unknown error' },
            { status: 500 }
          );
        }
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
```

#### `src/app/api/mcp/auth/callback/route.ts`

This is the OAuth callback endpoint.

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (code) {
    const html = `
      <html>
        <body>
          <h1>Authorization Successful!</h1>
          <p>You can close this window and return to the app.</p>
          <script>
            // Send the auth code to the parent window
            if (window.opener) {
              window.opener.postMessage({ type: 'oauth-success', code: '${code}' }, '*');
              window.close();
            } else {
              // Fallback: redirect to main app with code
              window.location.href = '/?code=${code}';
            }
          </script>
        </body>
      </html>
    `;
    
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } else if (error) {
    const html = `
      <html>
        <body>
          <h1>Authorization Failed</h1>
          <p>Error: ${error}</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'oauth-error', error: '${error}' }, '*');
              window.close();
            } else {
              // Fallback: redirect to main app with error
              window.location.href = '/?error=${error}';
            }
          </script>
        </body>
      </html>
    `;
    
    return new NextResponse(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  }

  return new NextResponse('Bad request', { status: 400 });
}
```

#### `src/app/api/mcp/auth/finish/route.ts`

This endpoint finalizes the OAuth flow.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sessionStore } from '@/lib/session-store';

interface FinishAuthRequestBody {
  authCode: string;
  sessionId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FinishAuthRequestBody = await request.json();
    const { authCode, sessionId } = body;

    if (!authCode || !sessionId) {
      return NextResponse.json(
        { error: 'Authorization code and session ID are required' },
        { status: 400 }
      );
    }

    const client = sessionStore.getClient(sessionId);
    
    if (!client) {
      return NextResponse.json(
        { error: 'No active OAuth session found' },
        { status: 400 }
      );
    }

    await client.finishAuth(authCode);
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
```

#### `src/app/api/mcp/auth/disconnect/route.ts`

This endpoint disconnects from the MCP server.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sessionStore } from '@/lib/session-store';

interface DisconnectRequestBody {
  sessionId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DisconnectRequestBody = await request.json();
    const { sessionId } = body;
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    sessionStore.removeClient(sessionId);
    
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
```

#### `src/app/api/mcp/tool/list/route.ts`

This endpoint lists the available tools on the MCP server.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sessionStore } from '@/lib/session-store';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    const client = sessionStore.getClient(sessionId);
    
    if (!client) {
      return NextResponse.json(
        { error: 'Not connected to server' },
        { status: 400 }
      );
    }

    const result = await client.listTools();
    
    return NextResponse.json({ tools: result.tools || [] });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
```

#### `src/app/api/mcp/tool/call/route.ts`

This endpoint calls a tool on the MCP server.

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { sessionStore } from '@/lib/session-store';

interface CallToolRequestBody {
  toolName: string;
  toolArgs?: Record<string, unknown>;
  sessionId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CallToolRequestBody = await request.json();
    const { toolName, toolArgs, sessionId } = body;

    if (!toolName || !sessionId) {
      return NextResponse.json(
        { error: 'Tool name and session ID are required' },
        { status: 400 }
      );
    }

    const client = sessionStore.getClient(sessionId);
    
    if (!client) {
      return NextResponse.json(
        { error: 'Not connected to server' },
        { status: 400 }
      );
    }

    const result = await client.callTool(toolName, toolArgs || {});
    
    return NextResponse.json({ result });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
```

### 4. Usage

With these files in place, your Next.js application can now interact with an MCP server. You will need to build a UI to call these endpoints.

- **Connect:** `POST /api/mcp/auth/connect` with `serverUrl` and `callbackUrl` in the body. The `callbackUrl` should point to `/api/mcp/auth/callback`.
- **List Tools:** `GET /api/mcp/tool/list?sessionId=<sessionId>`
- **Call Tool:** `POST /api/mcp/tool/call` with `toolName`, `toolArgs`, and `sessionId` in the body.
- **Disconnect:** `POST /api/mcp/auth/disconnect` with `sessionId` in the body.
