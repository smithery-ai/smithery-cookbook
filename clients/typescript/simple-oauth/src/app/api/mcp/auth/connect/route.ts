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