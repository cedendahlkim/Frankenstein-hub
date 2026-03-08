import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  login: handleLogin({
    authorizationParams: {
      audience: process.env.AUTH0_AUDIENCE,
      scope: 'openid profile email offline_access read:me:connected_accounts create:me:connected_accounts invoke:analyst invoke:creativist invoke:critic publish:article',
    },
  }),
});
