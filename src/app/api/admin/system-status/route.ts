import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { getCMSStore, resolveAdminSession } from '@/lib/db/store';
import { getCMSBackend } from '@/lib/db/backend';
import { AuditEntry, auditKeyInfo, verifyAuditTrail } from '@/lib/audit';
import { auditArchiveDir } from '@/lib/audit-query';
import { autoPublishEnabled, getPublishStatus } from '@/lib/publish';
import pkg from '../../../../../package.json';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Check = { id: string; label: string; status: 'ok' | 'warning' | 'critical'; detail: string };

// bcrypt is slow on purpose: remember the result per password hash.
const defaultPasswordCache = new Map<string, boolean>();
async function usesDefaultPassword(hash: string) {
  const def = process.env.DEFAULT_ADMIN_PASSWORD;
  if (!def || !hash) return false;
  if (!defaultPasswordCache.has(hash)) defaultPasswordCache.set(hash, await bcrypt.compare(def, hash));
  return defaultPasswordCache.get(hash)!;
}

/**
 * Live status for the CMS Settings page: the signed-in account, security
 * checks, admin accounts and system health. Polled every few seconds.
 * No secrets or password hashes are returned.
 */
export async function GET(req: NextRequest) {
  const session = await resolveAdminSession(req.cookies.get('cube_admin_session')?.value);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const store = await getCMSStore();
  const logs = (store.auditLogs || []) as AuditEntry[];
  const me = store.users.find((u) => u.id === session.userId);
  const lastLoginOf = (userId: string) => logs.find((l) => l.action === 'ADMIN_LOGIN' && l.userId === userId);
  const myLogins = logs.filter((l) => l.action === 'ADMIN_LOGIN' && l.userId === session.userId);

  // ---- security checks
  const DAY = 86_400_000;
  const now = Date.now();
  const failed24h = logs.filter(
    (l) => (l.action === 'ADMIN_LOGIN_FAILED' || l.action === 'ADMIN_LOGIN_BLOCKED') && now - new Date(l.timestamp).getTime() <= DAY
  ).length;
  const secret = process.env.ADMIN_JWT_SECRET || '';
  const proto = (req.headers.get('x-forwarded-proto') || req.nextUrl.protocol.replace(':', '')).split(',')[0].trim();
  const host = req.nextUrl.hostname;
  const isLocal = host === 'localhost' || host === '127.0.0.1';
  const integrity = verifyAuditTrail(logs, auditArchiveDir());
  const auditKey = auditKeyInfo();
  const defaultPw = me ? await usesDefaultPassword(me.passwordHash) : false;
  const superAdmins = store.users.filter((u) => u.role === 'super_admin' && u.isActive).length;

  const checks: Check[] = [
    {
      id: 'password',
      label: 'Your password',
      status: defaultPw ? 'critical' : 'ok',
      detail: defaultPw
        ? 'You are still using the initial password from the setup file. Change it below.'
        : 'Changed from the initial setup password.',
    },
    {
      id: 'https',
      label: 'Encrypted connection (HTTPS)',
      status: proto === 'https' ? 'ok' : isLocal ? 'warning' : 'critical',
      detail:
        proto === 'https'
          ? 'Admin traffic and the sign-in cookie are encrypted.'
          : isLocal
            ? 'Not encrypted because the admin is opened on this computer (localhost). The CUBE server must use HTTPS.'
            : 'The admin is opened over plain HTTP. Serve it over HTTPS before using it on a network.',
    },
    {
      id: 'secret',
      label: 'Session signing key',
      status: secret.length >= 32 ? 'ok' : 'critical',
      detail: secret.length >= 32 ? `Set (${secret.length} characters).` : 'ADMIN_JWT_SECRET is missing or shorter than 32 characters.',
    },
    {
      id: 'sessions',
      label: 'Sign-in sessions',
      status: 'ok',
      detail: 'Expire after 8 hours or when the browser closes; HTTP-only cookie; signing out revokes the session on the server.',
    },
    {
      id: 'ratelimit',
      label: 'Brute-force protection',
      status: failed24h >= 10 ? 'warning' : 'ok',
      detail: `Sign-in is locked for 15 minutes after 5 wrong passwords. ${failed24h} failed sign-in attempt(s) in the last 24 hours.`,
    },
    {
      id: 'audit',
      label: 'Audit log integrity',
      status: integrity.ok ? 'ok' : 'critical',
      detail: integrity.ok
        ? `${integrity.checked} entries verified (signed hash chain)${integrity.archive ? `; append-only archive matches (${integrity.archive.entries} entries)` : ''}.`
        : integrity.reason === 'key'
          ? 'Entries were signed with a different AUDIT_LOG_KEY. Restore the original key in the .env file.'
          : `The log was changed outside the admin (entry ${integrity.brokenAt}).`,
    },
    {
      id: 'auditkey',
      label: 'Audit signing key',
      status: auditKey.configured && auditKey.source === 'AUDIT_LOG_KEY' ? 'ok' : 'warning',
      detail:
        auditKey.configured && auditKey.source === 'AUDIT_LOG_KEY'
          ? `AUDIT_LOG_KEY is set (key id ${auditKey.kid}). Keep a copy with the server backups; never change it.`
          : 'Set a dedicated AUDIT_LOG_KEY in the .env file so audit signatures do not depend on the sign-in key.',
    },
    {
      id: 'owners',
      label: 'Super admin accounts',
      status: superAdmins >= 1 ? 'ok' : 'critical',
      detail: `${superAdmins} active super admin account(s).`,
    },
  ];

  // ---- system
  const dataFile = path.join(process.cwd(), 'data-store', 'cube_cms_store.json');
  let fileSize = 0;
  let savedAt: string | null = null;
  try {
    const st = fs.statSync(dataFile);
    fileSize = st.size;
    savedAt = st.mtime.toISOString();
  } catch {}
  const publish = getPublishStatus();
  const count = (k: keyof typeof store) =>
    Array.isArray(store[k]) ? (store[k] as any[]).filter((x) => x?.status !== 'archived').length : 0;

  return NextResponse.json(
    {
      account: {
        email: session.email,
        fullName: session.fullName,
        role: session.role,
        lastSignIn: myLogins[1]?.timestamp || null, // [0] is this session's sign-in
        lastSignInIp: myLogins[1]?.ip || null,
        currentSignIn: myLogins[0]?.timestamp || null,
      },
      checks,
      users: store.users.map((u) => ({
        name: u.fullName,
        email: u.email,
        role: u.role,
        active: u.isActive,
        lastSignIn: lastLoginOf(u.id)?.timestamp || null,
      })),
      system: {
        appVersion: (pkg as { version?: string }).version || '',
        storage: getCMSBackend(),
        dataFileSize: fileSize,
        lastSavedAt: savedAt,
        uptimeSeconds: Math.round(process.uptime()),
        nodeVersion: process.version,
        serverTime: new Date().toISOString(),
        liveUpdates: 'Server-Sent Events (about 1 second)',
        publishing: autoPublishEnabled() ? publish.state : 'disabled',
        lastPublishedAt: publish.lastPublishedAt || null,
        content: {
          projects: count('projects'),
          news: count('news'),
          team: count('teamMembers'),
          tenders: count('tenders'),
          careers: count('careers'),
          enquiries: (store.enquiries || []).length,
          applications: (store.jobApplications || []).length,
        },
      },
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
