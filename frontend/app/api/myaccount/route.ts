import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export const GET = withApiAuthRequired(async function myAccountProxy(req: any) {
  try {
    const { accessToken } = await getAccessToken(req, new NextResponse());
    const auth0Domain = process.env.AUTH0_ISSUER_BASE_URL;

    const response = await fetch(`${auth0Domain}/me/v1/connected-accounts`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch connected accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch connected accounts' },
      { status: 500 }
    );
  }
});
