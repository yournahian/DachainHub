import { NextRequest, NextResponse } from 'next/server';
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

/**
 * POST /api/auth/mock-login
 * Development-only bypass endpoint to sign in as Alistair or Elena.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const builderId = body.builderId || 'dev_1';

    let builderSession;
    if (builderId === 'dev_2') {
      builderSession = {
        id: 'dev_2',
        name: 'Elena Rostova',
        handle: '@elena_r',
        avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=elena_r',
        bio: 'Post-quantum cryptography research lead.',
        xHandle: '@elena_r',
        discordUsername: 'elena_r',
        email: 'elena@dachain.tech',
        githubUsername: 'elena-r',
      };
    } else {
      builderSession = {
        id: 'dev_1',
        name: 'Alistair Vance',
        handle: '@alistair_v',
        avatarUrl: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=alistair_v',
        bio: 'DAC core AMM engineer.',
        xHandle: '@alistair_v',
        discordUsername: 'alistair_v',
        email: 'alistair@dachain.tech',
        githubUsername: 'alistair-v',
      };
    }

    const signedSession = signSession(builderSession);
    const response = NextResponse.json({ success: true, builder: builderSession });
    
    response.cookies.set('dac_builder_session', signedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[Mock Login] Failed:', error);
    return NextResponse.json({ error: 'Failed to mock login' }, { status: 500 });
  }
}
