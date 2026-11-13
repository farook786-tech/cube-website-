import { NextRequest, NextResponse } from 'next/server';
import { resolveAdminSession, UserRole } from '@/lib/db/store';
import path from 'path';
import { getCMSBackend } from '@/lib/db/backend';
import { AuditEntry, classifyAudit } from '@/lib/audit';

/** Append-only archive folder (file storage only). */
export function auditArchiveDir(): string | undefined {
  return getCMSBackend() === 'file' ? path.join(process.cwd(), 'data-store', 'audit-trail') : undefined;
}

/** Audit logs are visible to super admins and admins only. */
export const AUDIT_ROLES: UserRole[] = ['super_admin', 'admin'];

export interface AuditFilters {
  q: string;
  category: string;
  severity: string;
  actor: string;
  from: string;
  to: string;
}

export function readFilters(req: NextRequest): AuditFilters {
  const p = req.nextUrl.searchParams;
  return {
    q: (p.get('q') || '').trim().toLowerCase().slice(0, 100),
    category: p.get('category') || '',
    severity: p.get('severity') || '',
    actor: p.get('actor') || '',
    from: p.get('from') || '',
    to: p.get('to') || '',
  };
}

/** Classify legacy entries on the fly so filters work for every row. */
export function normalized(logs: AuditEntry[]): AuditEntry[] {
  return logs.map((l) => (l.category ? l : { ...l, ...classifyAudit(l) }));
}

export function applyFilters(logs: AuditEntry[], f: AuditFilters): AuditEntry[] {
  const fromMs = f.from ? new Date(`${f.from}T00:00:00`).getTime() : 0;
  const toMs = f.to ? new Date(`${f.to}T23:59:59.999`).getTime() : Infinity;
  return logs.filter((l) => {
    if (f.category && l.category !== f.category) return false;
    if (f.severity && l.severity !== f.severity) return false;
    if (f.actor && l.userEmail !== f.actor) return false;
    const t = new Date(l.timestamp).getTime();
    if (t < fromMs || t > toMs) return false;
    if (f.q) {
      const hay = `${l.summary} ${l.action} ${l.userEmail} ${l.resourceType} ${l.resourceId} ${l.ip} ${l.details ?? ''}`.toLowerCase();
      if (!hay.includes(f.q)) return false;
    }
    return true;
  });
}

export async function authorizeAudit(req: NextRequest) {
  const session = await resolveAdminSession(req.cookies.get('cube_admin_session')?.value);
  if (!session) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  if (!AUDIT_ROLES.includes(session.role)) return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  return { session };
}
