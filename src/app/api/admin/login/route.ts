import { NextRequest, NextResponse } from 'next/server';
import { createAdminSession, ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE } from '@/lib/auth';

// Single-admin password check (this store has exactly one owner) - the
// password lives only in an env var, never in the database or client bundle.
export async function POST(req: NextRequest) {
  const { password } = (await req.json()) as { password?: string };
  const expected = process.env.ADMIN_PASSWORD;

  if (!expected) {
    return NextResponse.json({ error: 'Admin login is not configured' }, { status: 500 });
  }
  if (!password || password !== expected) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const token = await createAdminSession();
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
}
