import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

// Cache M2M token in memory (short-lived process)
let cachedToken: { token: string; expiresAt: number } | null = null;

async function getM2MToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const domain = process.env.AUTH0_ISSUER_BASE_URL!.replace('https://', '');
  const res = await fetch(`https://${domain}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.AUTH0_M2M_CLIENT_ID,
      client_secret: process.env.AUTH0_M2M_CLIENT_SECRET,
      audience: `https://${domain}/api/v2/`,
      grant_type: 'client_credentials',
    }),
  });

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };
  return data.access_token;
}

export const GET = withApiAuthRequired(async function myAccountProxy() {
  try {
    const session = await getSession();
    if (!session?.user?.sub) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const m2mToken = await getM2MToken();
    const domain = process.env.AUTH0_ISSUER_BASE_URL!.replace('https://', '');
    const email = session.user.email;

    if (!email) {
      return NextResponse.json([]);
    }

    // Fetch primary user with identities + app_metadata
    const userId = encodeURIComponent(session.user.sub);
    const response = await fetch(
      `https://${domain}/api/v2/users/${userId}?fields=identities,user_id,email,app_metadata`,
      { headers: { Authorization: `Bearer ${m2mToken}` } }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Management API error:', response.status, err);
      return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }

    const user = await response.json();
    const connections: any[] = [];
    const seen = new Set<string>();

    // Add native Auth0 identities
    for (const id of user.identities || []) {
      const key = `${id.connection}|${id.user_id}`;
      if (!seen.has(key)) {
        seen.add(key);
        connections.push({
          connection: id.connection,
          provider: id.provider,
          created_at: new Date().toISOString(),
          user_id: id.user_id,
        });
      }
    }

    // Add GitHub from app_metadata if connected via direct OAuth
    const meta = user.app_metadata;
    if (meta?.github_connected && !seen.has(`github|${meta.github_user_id}`)) {
      connections.push({
        connection: 'github',
        provider: 'github',
        created_at: meta.github_connected_at || new Date().toISOString(),
        user_id: meta.github_user_id,
      });
    }

    return NextResponse.json(connections);
  } catch (error) {
    console.error('Failed to fetch connected accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connected accounts' },
      { status: 500 }
    );
  }
});
