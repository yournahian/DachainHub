import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'dac_showcase_secret';

/**
 * Signs a session payload so it cannot be forged by the client.
 * Uses HMAC-SHA256.
 */
function signSession(payload: object): string {
  const json = JSON.stringify(payload);
  const encoded = Buffer.from(json).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

interface TwitterTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
}

interface TwitterUserResponse {
  data: {
    id: string;
    name: string;
    username: string;
    profile_image_url: string;
  };
}

/**
 * GET /api/auth/callback/twitter
 * Twitter redirects here after the user authorizes (or denies) the app.
 * Exchanges the `code` for an access_token, fetches the user profile,
 * then sets a signed session cookie and redirects back to /builder.
 */
export async function GET(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const clientId = process.env.X_CLIENT_ID;
  const clientSecret = process.env.X_CLIENT_SECRET;

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const returnedState = searchParams.get('state');
  const errorParam = searchParams.get('error');

  // User denied the auth request
  if (errorParam) {
    return NextResponse.redirect(
      `${appUrl}/builder?auth_error=${encodeURIComponent('Authorization was cancelled or denied.')}`
    );
  }

  if (!code || !returnedState) {
    return NextResponse.redirect(
      `${appUrl}/builder?auth_error=${encodeURIComponent('Missing code or state parameter from Twitter.')}`
    );
  }

  // Retrieve stored CSRF state + code verifier from cookies
  const cookieStore = await cookies();
  const storedState = cookieStore.get('twitter_oauth_state')?.value;
  const codeVerifier = cookieStore.get('twitter_code_verifier')?.value;

  // Clean up OAuth cookies immediately
  cookieStore.delete('twitter_oauth_state');
  cookieStore.delete('twitter_code_verifier');

  // Validate CSRF state
  if (!storedState || storedState !== returnedState) {
    return NextResponse.redirect(
      `${appUrl}/builder?auth_error=${encodeURIComponent('State mismatch — possible CSRF attack. Please try again.')}`
    );
  }

  if (!codeVerifier) {
    return NextResponse.redirect(
      `${appUrl}/builder?auth_error=${encodeURIComponent('Session expired. Please try signing in again.')}`
    );
  }

  if (!clientId) {
    return NextResponse.redirect(
      `${appUrl}/builder?auth_error=${encodeURIComponent('X OAuth is not configured on this server (missing Client ID).')}`
    );
  }

  // Exchange authorization code for access token
  const redirectUri = `${appUrl}/api/auth/callback/twitter`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  
  const bodyParams: Record<string, string> = {
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
    code,
  };

  if (clientSecret && clientSecret !== 'YOUR_X_CLIENT_SECRET_HERE') {
    // Web App (Confidential Client) uses Basic Authentication header
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    headers['Authorization'] = `Basic ${credentials}`;
  } else {
    // Native App (Public Client) sends client_id in the body
    bodyParams['client_id'] = clientId;
  }

  const tokenRes = await fetch('https://api.twitter.com/2/oauth2/token', {
    method: 'POST',
    headers,
    body: new URLSearchParams(bodyParams).toString(),
  });

  if (!tokenRes.ok) {
    const errText = await tokenRes.text();
    console.error('[Twitter OAuth] Token exchange failed:', errText);
    return NextResponse.redirect(
      `${appUrl}/builder?auth_error=${encodeURIComponent('Failed to exchange code for token. Please try again.')}`
    );
  }

  const tokenData: TwitterTokenResponse = await tokenRes.json();

  // Fetch the authenticated user's profile from Twitter API v2
  const userRes = await fetch(
    'https://api.twitter.com/2/users/me?user.fields=id,name,username,profile_image_url',
    {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    }
  );

  if (!userRes.ok) {
    const errText = await userRes.text();
    console.error('[Twitter OAuth] User profile fetch failed:', errText);
    return NextResponse.redirect(
      `${appUrl}/builder?auth_error=${encodeURIComponent('Could not fetch your Twitter profile. Please try again.')}`
    );
  }

  const userData: TwitterUserResponse = await userRes.json();
  const { id, name, username, profile_image_url } = userData.data;

  // Build the verified builder session payload
  const builderSession = {
    id: `twitter_${id}`,
    name,
    handle: `@${username}`,
    avatarUrl:
      profile_image_url?.replace('_normal', '_400x400') || // get bigger image
      `https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`,
    xHandle: `@${username}`,
    bio: 'Verified via X OAuth.',
    discordUsername: '', // Will be entered separately after login
    email: '',
    githubUsername: '',
  };

  // Sign and set the session cookie (7 day expiry)
  const signedSession = signSession(builderSession);
  const response = NextResponse.redirect(`${appUrl}/builder?auth_success=1`);
  response.cookies.set('dac_builder_session', signedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  });

  return response;
}
