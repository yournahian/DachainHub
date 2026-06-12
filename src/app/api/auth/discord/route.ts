import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'dac_showcase_secret';

function signSession(payload: object): string {
  const json = JSON.stringify(payload);
  const encoded = Buffer.from(json).toString('base64url');
  const sig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(encoded)
    .digest('base64url');
  return `${encoded}.${sig}`;
}

function verifySession(token: string): Record<string, unknown> | null {
  try {
    const [encoded, sig] = token.split('.');
    if (!encoded || !sig) return null;
    const expectedSig = crypto
      .createHmac('sha256', SESSION_SECRET)
      .update(encoded)
      .digest('base64url');
    if (sig !== expectedSig) return null;
    const json = Buffer.from(encoded, 'base64url').toString('utf-8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * POST /api/auth/discord
 * Updates the current session to include the Discord username the builder entered.
 * The session must already have a valid Twitter login to call this.
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('dac_builder_session')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const session = verifySession(sessionCookie);
  if (!session) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
  }

  const body = await request.json();
  const discordUsername = (body.discordUsername || '').trim();
  const email = (body.email || '').trim();
  const githubUsername = (body.githubUsername || '').trim();

  // Update session with new profile fields
  const updatedSession = { 
    ...session, 
    discordUsername: discordUsername || (session.discordUsername as string) || '',
    email: email || (session.email as string) || '',
    githubUsername: githubUsername || (session.githubUsername as string) || '',
  };
  const signedSession = signSession(updatedSession);

  const response = NextResponse.json({ success: true, builder: updatedSession });
  response.cookies.set('dac_builder_session', signedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });

  return response;
}
