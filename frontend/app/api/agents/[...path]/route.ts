import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8081';

async function proxyToBackend(req: NextRequest) {
  const session = await getAccessToken();
  if (!session?.accessToken) {
    console.error('[agents proxy] No access token');
    return NextResponse.json({ error: 'No access token' }, { status: 401 });
  }

  // Decode JWT payload to see scopes
  const parts = session.accessToken.split('.');
  if (parts.length === 3) {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    console.log('[agents proxy] Token scopes:', payload.scope);
    console.log('[agents proxy] Token aud:', payload.aud);
  }

  // Extract the path after /api/agents/
  const url = new URL(req.url);
  const agentPath = url.pathname.replace('/api/agents/', '');
  const backendUrl = `${BACKEND_URL}/agents/${agentPath}`;
  console.log('[agents proxy]', req.method, backendUrl);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${session.accessToken}`,
    'Content-Type': 'application/json',
  };

  const body = req.method !== 'GET' ? await req.text() : undefined;

  const backendRes = await fetch(backendUrl, {
    method: req.method,
    headers,
    body,
  });

  const data = await backendRes.text();
  console.log('[agents proxy] Backend response:', backendRes.status, data.substring(0, 200));

  return new NextResponse(data, {
    status: backendRes.status,
    headers: { 'Content-Type': backendRes.headers.get('Content-Type') || 'application/json' },
  });
}

export const GET = withApiAuthRequired(proxyToBackend as any);
export const POST = withApiAuthRequired(proxyToBackend as any);
