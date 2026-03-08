import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider;
  const validProviders = ['google-oauth2', 'github'];
  if (!validProviders.includes(provider)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }

  const baseUrl = process.env.AUTH0_BASE_URL || 'http://localhost:3000';

  // Redirect to Auth0 login with the specific social connection
  // Auth0 will link identities if the user is already logged in
  const loginUrl = new URL('/api/auth/login', baseUrl);
  loginUrl.searchParams.set('returnTo', '/dashboard');

  return NextResponse.redirect(loginUrl.toString());
}
