import { Lucia } from 'lucia';
import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite';
import db from './db';
import { cookies } from 'next/headers';

const adapter = new BetterSqlite3Adapter(db, {
  user: 'users',
  session: 'sessions',
});
const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV === 'production',
    },
  },
});

export async function createAuthSession(userId) {
  // For a given user it should create and store session (and set cookie)
  const session = await lucia.createSession(userId, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
}

export async function verifyAuth() {
  // retrieve the cookie
  const sessionCookie = cookies().get(lucia.sessionCookieName);

  // check for nulls
  if (!sessionCookie) {
    return {
      user: null,
      session: null,
    };
  }

  // cookie value
  const sessionId = sessionCookie.value;

  // check for nulls
  if (!sessionId) {
    return {
      user: null,
      session: null,
    };
  }

  const result = await lucia.validateSession(sessionId);

  try {
    // refresh so it stays active (not logged out)
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
    if (!result.session) {
      const sessionCookie = lucia.createBlankSessionCookie();
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }
  } catch {}
  return result;
}

export async function destroySession() {
  const { session } = await verifyAuth();
  if (!session) {
    // no session cookie
    return {
      error: 'Unauthorized!',
    };
  }
  // invalidate and destroy cookie (from database lucia)
  await lucia.invalidateSession(session.id);
  // clear cookie
  const sessionCookie = lucia.createBlankSessionCookie();
  cookies().set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );
}
