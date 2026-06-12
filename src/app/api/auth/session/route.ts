import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'dac_showcase_secret';

/**
 * Verifies the HMAC signature of a session cookie and returns the payload.
 * Returns null if the signature is invalid or the cookie is tampered.
 */
function verifySession(token: string): object | null {
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
 * GET /api/auth/session
 * Returns the current authenticated builder session (from the signed cookie).
 * If no valid session exists, returns { builder: null }.
 */
export async function GET() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('dac_builder_session')?.value;

  if (!sessionCookie) {
    return NextResponse.json({ builder: null });
  }

  const session = verifySession(sessionCookie);
  if (!session) {
    // Cookie was tampered with — clear it
    const response = NextResponse.json({ builder: null });
    response.cookies.delete('dac_builder_session');
    return response;
  }

  return NextResponse.json({ builder: session });
}
