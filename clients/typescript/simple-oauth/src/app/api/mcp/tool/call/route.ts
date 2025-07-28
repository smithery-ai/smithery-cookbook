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