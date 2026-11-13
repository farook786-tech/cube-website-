'use server';

import { cookies, headers } from 'next/headers';
import bcrypt from 'bcryptjs';
import {
  getCMSStore,
  saveCMSStore,
  signAdminToken,
  verifyAdminToken,
  resolveAdminSession,
  revokeAdminSessions,
  AdminSession,
} from '@/lib/db/store';
import { clearRateLimit, consumeRateLimit } from '@/lib/rate-limit';

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Record a security event (failed / blocked sign-in, wrong current password).
 * Blocked attempts are recorded once per key per window so a flood of
 * requests cannot fill the log.
 */
const blockedLogged = new Map<string, number>();
async function logSecurityEvent(action: string, email: string, userId?: string, details?: string) {
  if (action === 'ADMIN_LOGIN_BLOCKED') {
    const last = blockedLogged.get(email.toLowerCase()) || 0;
    if (Date.now() - last < WINDOW_MS) return;
    blockedLogged.set(email.toLowerCase(), Date.now());
  }
  try {
    const store = await getCMSStore();
    store.auditLogs.unshift({
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      userId: userId || '',
      userEmail: email.slice(0, 120),
      action,
      resourceType: 'auth',
      resourceId: userId || '',
      details,
      timestamp: new Date().toISOString(),
    });
    await saveCMSStore(store);
  } catch {
    // never block sign-in because the log could not be written
  }
}

// Used to equalize timing when the email does not exist.
const DUMMY_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8D7Qb1s6N5pQn8wXq0cJ5hVQ8G1pW';

async function getClientKey(email: string): Promise<string> {
  const headerStore = await headers();
  const forwarded = headerStore.get('x-forwarded-for');
  const ip =
    forwarded?.split(',')[0]?.trim() ||
    headerStore.get('x-real-ip') ||
    'unknown';
  return `${ip}:${email.toLowerCase()}`;
}

/**
 * Cookie options for the admin session: a browser-session cookie (no maxAge),
 * HTTP-only, SameSite=Lax. The token inside expires after 8h regardless.
 *
 * `secure` follows the connection the browser actually used. Browsers refuse
 * to store Secure cookies over plain http (except on localhost), so forcing it
 * whenever NODE_ENV=production made sign-in fail silently when the site was
 * opened from another device on the network (http://<ip>:<port>). On any real
 * deployment the site is served over HTTPS, so the cookie is Secure there.
 * Set ADMIN_COOKIE_SECURE=true to force it regardless.
 */
async function sessionCookieOptions() {
  const h = await headers();
  const forwardedProto = h.get('x-forwarded-proto')?.split(',')[0]?.trim().toLowerCase();
  const origin = (h.get('origin') || '').toLowerCase();
  const viaHttps = forwardedProto === 'https' || origin.startsWith('https://');
  return {
    httpOnly: true,
    secure: process.env.ADMIN_COOKIE_SECURE === 'true' || viaHttps,
    sameSite: 'lax' as const,
    path: '/',
  };
}

export async function loginAdminAction(formData: FormData) {
  const email = (formData.get('email') as string | null)?.trim() || '';
  const password = (formData.get('password') as string | null) || '';

  if (!email || !password) {
    return { success: false, error: 'Email and password are required' };
  }

  const rateKey = await getClientKey(email);
  const { allowed, retryAfterMs } = await consumeRateLimit(rateKey, MAX_ATTEMPTS, WINDOW_MS);
  if (!allowed) {
    const minutes = Math.ceil(retryAfterMs / 60000);
    await logSecurityEvent('ADMIN_LOGIN_BLOCKED', email, undefined, `${MAX_ATTEMPTS} failed attempts within 15 minutes`);
    return {
      success: false,
      error: `Too many failed attempts. Try again in ${minutes} minute(s).`,
    };
  }

  const store = await getCMSStore();
  const user = store.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );

  if (!user || !user.isActive) {
    // Perform a dummy comparison so response timing does not reveal account existence.
    await bcrypt.compare(password, DUMMY_HASH);
    await logSecurityEvent('ADMIN_LOGIN_FAILED', email, undefined, user ? 'Account is disabled' : 'Unknown account');
    return { success: false, error: 'Invalid institutional administrator credentials' };
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    await logSecurityEvent('ADMIN_LOGIN_FAILED', user.email, user.id, 'Wrong password');
    return { success: false, error: 'Invalid institutional administrator credentials' };
  }

  await clearRateLimit(rateKey);

  const session: AdminSession = {
    userId: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
  };

  const token = signAdminToken(session, user.sessionVersion ?? 0);

  // Secure HTTP-only *browser-session* cookie (no maxAge): it is discarded when
  // the browser closes, and the token inside expires after 8 hours regardless.
  (await cookies()).set('cube_admin_session', token, await sessionCookieOptions());

  // Log Audit. Re-read the store: the copy loaded before the awaits above may
  // be stale, and saving it would overwrite changes made in the meantime.
  const freshStore = await getCMSStore();
  freshStore.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: user.id,
    userEmail: user.email,
    action: 'ADMIN_LOGIN',
    resourceType: 'auth',
    resourceId: user.id,
    timestamp: new Date().toISOString(),
  });
  await saveCMSStore(freshStore);

  return { success: true };
}

export async function logoutAdminAction() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get('cube_admin_session')?.value;
  if (cookie) {
    const session = verifyAdminToken(cookie);
    if (session) {
      // Revoke the token server-side so a copied cookie stops working too.
      await revokeAdminSessions(session.userId);
      const store = await getCMSStore();
      store.auditLogs.unshift({
        id: `log_${Date.now()}`,
        userId: session.userId,
        userEmail: session.email,
        action: 'ADMIN_LOGOUT',
        resourceType: 'auth',
        resourceId: session.userId,
        timestamp: new Date().toISOString(),
      });
      await saveCMSStore(store);
    }
  }

  cookieStore.delete('cube_admin_session');
  return { success: true };
}

export async function getCurrentAdmin(): Promise<AdminSession | null> {
  const cookie = (await cookies()).get('cube_admin_session')?.value;
  return await resolveAdminSession(cookie);
}

const MIN_PASSWORD_LENGTH = 12;

/**
 * Change the signed-in administrator's password.
 * - Requires the current password (rate limited like sign-in).
 * - Signs out every OTHER device by bumping sessionVersion, then re-issues this
 *   browser's cookie so the person making the change stays signed in.
 */
export async function changePasswordAction(formData: FormData) {
  const cookieStore = await cookies();
  const session = await resolveAdminSession(cookieStore.get('cube_admin_session')?.value);
  if (!session) {
    return { success: false, error: 'Your session has expired. Please sign in again.' };
  }

  const current = String(formData.get('currentPassword') || '');
  const next = String(formData.get('newPassword') || '');
  const confirm = String(formData.get('confirmPassword') || '');

  if (!current || !next || !confirm) {
    return { success: false, error: 'Please fill in all three password fields.' };
  }
  if (next.length < MIN_PASSWORD_LENGTH) {
    return { success: false, error: `The new password must be at least ${MIN_PASSWORD_LENGTH} characters.` };
  }
  if (next.length > 200) {
    return { success: false, error: 'The new password is too long.' };
  }
  if (next !== confirm) {
    return { success: false, error: 'The new password and its confirmation do not match.' };
  }
  if (next === current) {
    return { success: false, error: 'The new password must be different from the current one.' };
  }

  const rateKey = `password-change:${session.userId}`;
  const { allowed, retryAfterMs } = await consumeRateLimit(rateKey, MAX_ATTEMPTS, WINDOW_MS);
  if (!allowed) {
    return {
      success: false,
      error: `Too many incorrect attempts. Try again in ${Math.ceil(retryAfterMs / 60000)} minute(s).`,
    };
  }

  const user = (await getCMSStore()).users.find((u) => u.id === session.userId);
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) {
    await logSecurityEvent('ADMIN_PASSWORD_CHANGE_FAILED', session.email, session.userId, 'Wrong current password');
    return { success: false, error: 'The current password is incorrect.' };
  }
  await clearRateLimit(rateKey);

  const newHash = await bcrypt.hash(next, 12);

  // Re-read the store after hashing so changes made meanwhile are not
  // overwritten (the Supabase backend also merges concurrent saves).
  const store = await getCMSStore();
  const target = store.users.find((u) => u.id === session.userId);
  if (!target) return { success: false, error: 'Account not found.' };
  target.passwordHash = newHash;
  target.sessionVersion = (target.sessionVersion ?? 0) + 1;
  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: target.id,
    userEmail: target.email,
    action: 'ADMIN_PASSWORD_CHANGED',
    resourceType: 'auth',
    resourceId: target.id,
    timestamp: new Date().toISOString(),
  });
  await saveCMSStore(store);

  const token = signAdminToken(
    { userId: target.id, email: target.email, fullName: target.fullName, role: target.role },
    target.sessionVersion
  );
  cookieStore.set('cube_admin_session', token, await sessionCookieOptions());

  return { success: true };
}

/**
 * Sign out every other device for the signed-in administrator (e.g. after
 * using a shared computer). This browser stays signed in.
 */
export async function revokeOtherSessionsAction() {
  const cookieStore = await cookies();
  const session = await resolveAdminSession(cookieStore.get('cube_admin_session')?.value);
  if (!session) return { success: false, error: 'Your session has expired. Please sign in again.' };

  const store = await getCMSStore();
  const target = store.users.find((u) => u.id === session.userId);
  if (!target) return { success: false, error: 'Account not found.' };
  target.sessionVersion = (target.sessionVersion ?? 0) + 1;
  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: target.id,
    userEmail: target.email,
    action: 'ADMIN_SESSIONS_REVOKED',
    resourceType: 'auth',
    resourceId: target.id,
    timestamp: new Date().toISOString(),
  });
  await saveCMSStore(store);

  const token = signAdminToken(
    { userId: target.id, email: target.email, fullName: target.fullName, role: target.role },
    target.sessionVersion
  );
  cookieStore.set('cube_admin_session', token, await sessionCookieOptions());
  return { success: true };
}
