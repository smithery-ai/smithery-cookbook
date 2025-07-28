# MCP OAuth Client Setup Guide

This Next.js application demonstrates how to implement OAuth authentication for Model Context Protocol (MCP) servers. The implementation provides a complete reference for connecting to MCP servers that require OAuth authorization.

## Architecture Overview

The application consists of three main components:

1. **Frontend UI** (`page.tsx`) - React interface for server connection and tool interaction
2. **API Endpoints** - Next.js API routes handling OAuth flow and MCP operations
3. **Core Libraries** - OAuth client implementation and session management

## Frontend Component (`page.tsx`)

The main React component provides the user interface for:

### Key Functions:

- **`handleConnect()`** (lines 28-109): Initiates connection to MCP server
  - Posts to `/api/connect` with server URL and callback URL
  - Handles OAuth redirect by opening popup window
  - Listens for OAuth completion messages from popup
  - Completes authentication via `/api/finish-auth`

- **`loadTools()`** (lines 111-127): Fetches available tools from connected server
  - Calls `/api/tools` with session ID
  - Updates UI with available tools list

- **`handleCallTool()`** (lines 129-168): Executes selected tool with arguments
  - Posts to `/api/call-tool` with tool name, arguments, and session ID
  - Displays tool execution results

- **`handleDisconnect()`** (lines 170-188): Cleanly disconnects from server
  - Calls `/api/disconnect` to cleanup server session
  - Resets local state

### UI States:
- **Not Connected**: Server URL input and Connect button
- **Connected**: Tool list, tool execution interface, and Disconnect button
- **Loading**: Disabled controls during operations
- **Error Display**: Red error banner for user feedback

## API Endpoints

### `/api/connect` (POST)
**Purpose**: Initiates MCP server connection and OAuth flow

**Input**: 
```json
{
  "serverUrl": "https://server.example.com/mcp",
  "callbackUrl": "https://client.example.com/api/auth/callback"
}
```

**Responses**:
- **Success (200)**: `{ "success": true, "sessionId": "abc123" }` - Direct connection without OAuth
- **OAuth Required (401)**: `{ "requiresAuth": true, "authUrl": "https://...", "sessionId": "abc123" }` - OAuth flow needed
- **Error (400/500)**: `{ "error": "Error message" }`

**Flow**:
1. Creates new session ID and MCPOAuthClient instance
2. Attempts direct connection to server
3. If OAuth required, captures authorization URL and returns it
4. Stores client in session store for later use

### `/api/auth/callback` (GET)
**Purpose**: OAuth callback endpoint that handles authorization responses

**Query Parameters**:
- `code`: Authorization code from OAuth provider
- `error`: Error message if authorization failed

**Response**: HTML page with JavaScript that:
- On success: Posts message to parent window with auth code, closes popup
- On error: Posts error message to parent window, closes popup
- Fallback: Redirects to main app with code/error parameters

**Implementation Details**:
- Returns HTML with embedded JavaScript for popup communication
- Uses `window.opener.postMessage()` to communicate with parent window
- Handles both success and error scenarios

### `/api/finish-auth` (POST)
**Purpose**: Completes OAuth flow using authorization code

**Input**:
```json
{
  "authCode": "authorization_code_from_oauth",
  "sessionId": "session_id_from_connect"
}
```

**Responses**:
- **Success (200)**: `{ "success": true }`
- **Error (400/500)**: `{ "error": "Error message" }`

**Flow**:
1. Retrieves stored client from session store
2. Calls `client.finishAuth(authCode)` to exchange code for tokens
3. Establishes authenticated connection to MCP server

### `/api/tools` (GET)
**Purpose**: Lists available tools from connected MCP server

**Query Parameters**:
- `sessionId`: Session identifier

**Responses**:
- **Success (200)**: `{ "tools": [{ "name": "tool_name", "description": "..." }] }`
- **Error (400/500)**: `{ "error": "Error message" }`

**Flow**:
1. Retrieves client from session store
2. Calls MCP server's `tools/list` method
3. Returns array of available tools

### `/api/call-tool` (POST)
**Purpose**: Executes a specific tool on the MCP server

**Input**:
```json
{
  "toolName": "search_web",
  "toolArgs": { "query": "example search" },
  "sessionId": "session_id"
}
```

**Responses**:
- **Success (200)**: `{ "result": { /* tool execution result */ } }`
- **Error (400/500)**: `{ "error": "Error message" }`

**Flow**:
1. Retrieves client from session store
2. Calls MCP server's `tools/call` method with tool name and arguments
3. Returns tool execution result

### `/api/disconnect` (POST)
**Purpose**: Cleanly disconnects from MCP server and cleans up session

**Input**:
```json
{
  "sessionId": "session_id_to_disconnect"
}
```

**Responses**:
- **Success (200)**: `{ "success": true }`
- **Error (400/500)**: `{ "error": "Error message" }`

**Flow**:
1. Calls `sessionStore.removeClient()` which:
   - Retrieves client from store
   - Calls `client.disconnect()`
   - Removes client from store

## Core Libraries

### `oauth-client.ts`
Implements the `MCPOAuthClient` class with OAuth capabilities:

**Key Components**:
- **`InMemoryOAuthClientProvider`** (lines 14-69): Implements OAuth client provider interface
  - Stores client information, tokens, and code verifier in memory
  - Handles redirect to authorization URL via callback
  - Manages PKCE (Proof Key for Code Exchange) flow

- **`MCPOAuthClient`** (lines 71-175): Main client class
  - **`connect()`**: Initiates connection with OAuth metadata
  - **`finishAuth(authCode)`**: Completes OAuth flow with authorization code
  - **`listTools()`**: Calls MCP `tools/list` method
  - **`callTool(toolName, toolArgs)`**: Calls MCP `tools/call` method
  - **`disconnect()`**: Cleans up client connection

**OAuth Configuration**:
```javascript
const clientMetadata = {
  client_name: 'Next.js MCP OAuth Client',
  redirect_uris: [callbackUrl],
  grant_types: ['authorization_code', 'refresh_token'],
  response_types: ['code'],
  token_endpoint_auth_method: 'client_secret_post',
  scope: 'mcp:tools'
};
```

### `session-store.ts`
Simple in-memory session management:

**Features**:
- **`setClient(sessionId, client)`**: Stores client instance
- **`getClient(sessionId)`**: Retrieves client instance
- **`removeClient(sessionId)`**: Cleans up client and removes from store
- **`generateSessionId()`**: Creates unique session identifiers

**Note**: This is a demo implementation. Production systems should use Redis, database, or proper session management.

## Implementation Guide

To implement OAuth for MCP in your own application:

### 1. Set up OAuth Client Provider
Implement the `OAuthClientProvider` interface to handle:
- Client registration metadata
- Token storage and retrieval
- Authorization URL redirection
- PKCE code verifier management

### 2. Configure MCP Client
Create MCP client with OAuth-enabled transport:
```javascript
const transport = new StreamableHTTPClientTransport(serverUrl, {
  authProvider: oauthProvider
});
await client.connect(transport);
```

### 3. Handle OAuth Flow
- Catch `UnauthorizedError` during initial connection
- Redirect user to authorization URL
- Implement callback endpoint to receive authorization code
- Exchange code for tokens using `transport.finishAuth(code)`

### 4. Session Management
- Store client instances with unique session IDs
- Associate OAuth tokens with sessions
- Clean up sessions on disconnect

### 5. API Integration
Create endpoints for:
- Connection initiation (`/connect`)
- OAuth callback handling (`/auth/callback`)
- Authentication completion (`/finish-auth`)
- Tool operations (`/tools`, `/call-tool`)
- Session cleanup (`/disconnect`)

This implementation provides a complete, production-ready foundation for OAuth-enabled MCP client applications.