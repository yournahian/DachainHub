import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Clears the builder session cookie and logs out the user.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('dac_builder_session');
  return response;
}
