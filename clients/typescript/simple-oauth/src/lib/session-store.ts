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