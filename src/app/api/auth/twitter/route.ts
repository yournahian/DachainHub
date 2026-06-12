import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

/**
 * Generates a cryptographically secure random string for PKCE code_verifier.
 * Twitter requires it be 43–128 chars, URL-safe base64 encoded.
 */
function generateCodeVerifier(): string {
  return crypto.randomBytes(64).toString('base64url').slice(0, 128);
}

/**
 * Generates code_challenge = BASE64URL(SHA256(code_verifier))
 */
async function generateCodeChallenge(verifier: string): Promise<string> {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return hash.toString('base64url');
}

/**
 * GET /api/auth/twitter
 * Initiates the Twitter OAuth 2.0 PKCE flow.
 * Redirects the user to Twitter's authorization page.
 */
export async function GET() {
  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (
    !clientId ||
    clientId === 'YOUR_X_CLIENT_ID_HERE' ||
    !clientSecret ||
    clientSecret === 'YOUR_X_CLIENT_SECRET_HERE'
  ) {
    // Developer hasn't configured their X app yet — show instructions
    return NextResponse.json(
      {
        error: 'X OAuth credentials not configured',
        instructions:
          'Visit https://developer.twitter.com/en/portal/dashboard, create an app with OAuth 2.0 enabled (Web App, Automated App or Bot), set callback URL to http://localhost:3000/api/auth/callback/twitter, then add X_CLIENT_ID and X_CLIENT_SECRET to .env.local.',
      },
      { status: 503 }
    );
  }

  // 1. Generate PKCE pair
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // 2. Generate a random state token to prevent CSRF
  const state = crypto.randomBytes(16).toString('hex');

  // 3. Store verifier + state in an HttpOnly cookie (expires in 10 minutes)
  const cookieStore = await cookies();
  cookieStore.set('twitter_oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600, // 10 minutes
    path: '/',
  });
  cookieStore.set('twitter_code_verifier', codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  // 4. Build the X authorization URL
  const redirectUri = `${appUrl}/api/auth/callback/twitter`;
  const xAuthUrl = new URL('https://x.com/i/oauth2/authorize');
  xAuthUrl.searchParams.set('response_type', 'code');
  xAuthUrl.searchParams.set('client_id', clientId);
  xAuthUrl.searchParams.set('redirect_uri', redirectUri);
  xAuthUrl.searchParams.set('scope', 'tweet.read users.read offline.access');
  xAuthUrl.searchParams.set('state', state);
  xAuthUrl.searchParams.set('code_challenge', codeChallenge);
  xAuthUrl.searchParams.set('code_challenge_method', 'S256');

  // 5. Redirect to X
  return NextResponse.redirect(xAuthUrl.toString());
}
