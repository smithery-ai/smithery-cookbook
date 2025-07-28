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