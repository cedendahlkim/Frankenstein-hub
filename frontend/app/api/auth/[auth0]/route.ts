import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

export const GET = handleAuth({
  login: async (req: NextRequest) => {
    const url = new URL(req.url);
    const connection = url.searchParams.get('connection');
    const returnTo = url.searchParams.get('returnTo') || '/dashboard';

    return handleLogin(req as any, {
      authorizationParams: {
        audience: process.env.AUTH0_AUDIENCE,
        scope: 'openid profile email offline_access invoke:analyst invoke:creativist invoke:critic publish:article',
        ...(connection ? { connection, prompt: 'login' } : {}),
      },
      returnTo,
    } as any);
  },
});
