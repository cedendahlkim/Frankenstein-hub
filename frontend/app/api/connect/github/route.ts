import { NextRequest, NextResponse } from 'next/server';

const GITHUB_CLIENT_ID = 'Ov23liLAlFn3EhQu6BIO';
const GITHUB_CLIENT_SECRET = '7455b1c17059cba6c201a38c354561e64ead09ae';

async function getM2MToken(): Promise<string> {
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
  return data.access_token;
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const baseUrl = process.env.AUTH0_BASE_URL || 'http://localhost:3000';

  // Step 1: No code → redirect to GitHub OAuth with state containing user sub
  if (!code) {
    const sub = url.searchParams.get('sub');
    if (!sub) {
      return NextResponse.redirect(`${baseUrl}/api/auth/login?returnTo=/dashboard`);
    }

    // Encode primary user ID in state parameter
    const stateData = Buffer.from(
      JSON.stringify({ sub })
    ).toString('base64url');

    const redirectUri = `${baseUrl}/api/connect/github`;
    const githubAuthUrl =
      `https://github.com/login/oauth/authorize` +
      `?client_id=${GITHUB_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&scope=read:user,user:email,repo` +
      `&state=${stateData}`;
    return NextResponse.redirect(githubAuthUrl);
  }

  // Step 2: Callback from GitHub — decode state to get primary user ID
  let primarySub: string;
  try {
    const decoded = JSON.parse(
      Buffer.from(state || '', 'base64url').toString()
    );
    primarySub = decoded.sub;
    if (!primarySub) throw new Error('No sub in state');
  } catch {
    console.error('Invalid state parameter');
    return NextResponse.redirect(`${baseUrl}/dashboard?error=invalid_state`);
  }

  // Step 3: Exchange code for GitHub access token
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    console.error('GitHub token exchange failed:', tokenData);
    return NextResponse.redirect(`${baseUrl}/dashboard?error=github_token_failed`);
  }

  // Step 4: Get GitHub user profile + emails
  const [ghUserRes, ghEmailRes] = await Promise.all([
    fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    }),
    fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    }),
  ]);
  const ghUser = await ghUserRes.json();
  const ghEmails = await ghEmailRes.json();
  const primaryEmail =
    Array.isArray(ghEmails)
      ? ghEmails.find((e: any) => e.primary && e.verified)?.email
      : null;
  console.log(
    'GitHub user:',
    ghUser.login,
    ghUser.id,
    primaryEmail || ghUser.email
  );

  // Step 5: Store GitHub connection in user's app_metadata
  try {
    const m2mToken = await getM2MToken();
    const domain = process.env.AUTH0_ISSUER_BASE_URL!.replace('https://', '');
    const encodedPrimary = encodeURIComponent(primarySub);

    const patchRes = await fetch(
      `https://${domain}/api/v2/users/${encodedPrimary}`,
      {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${m2mToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          app_metadata: {
            github_connected: true,
            github_user_id: String(ghUser.id),
            github_login: ghUser.login,
            github_email: primaryEmail || ghUser.email,
            github_connected_at: new Date().toISOString(),
          },
        }),
      }
    );

    if (!patchRes.ok) {
      const err = await patchRes.text();
      console.error('Auth0 patch failed:', patchRes.status, err);
      return NextResponse.redirect(`${baseUrl}/dashboard?error=patch_failed`);
    }

    console.log(`Stored GitHub ${ghUser.login} in app_metadata for ${primarySub}`);
  } catch (err) {
    console.error('Patch error:', err);
    return NextResponse.redirect(`${baseUrl}/dashboard?error=patch_error`);
  }

  return NextResponse.redirect(`${baseUrl}/dashboard?connected=github`);
}
