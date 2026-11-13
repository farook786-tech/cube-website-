import { NextRequest, NextResponse } from 'next/server';
import { getCMSStore } from '@/lib/db/store';
import { AuditEntry, verifyAuditTrail } from '@/lib/audit';
import { applyFilters, auditArchiveDir, authorizeAudit, normalized, readFilters } from '@/lib/audit-query';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Paged, filtered audit log + summary figures + integrity check. */
export async function GET(req: NextRequest) {
  const auth = await authorizeAudit(req);
  if (auth.error) return auth.error;

  const store = await getCMSStore();
  const all = normalized((store.auditLogs || []) as AuditEntry[]);
  const filters = readFilters(req);
  const filtered = applyFilters(all, filters);

  const p = req.nextUrl.searchParams;
  const offset = Math.max(0, Number(p.get('offset')) || 0);
  const limit = Math.min(200, Math.max(1, Number(p.get('limit')) || 50));

  const now = Date.now();
  const DAY = 86_400_000;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const since = (ms: number) => all.filter((l) => now - new Date(l.timestamp).getTime() <= ms);

  const stats = {
    total: all.length,
    today: all.filter((l) => new Date(l.timestamp).getTime() >= startOfToday.getTime()).length,
    failedSignIns24h: since(DAY).filter((l) => l.action === 'ADMIN_LOGIN_FAILED' || l.action === 'ADMIN_LOGIN_BLOCKED').length,
    securityAlerts7d: since(7 * DAY).filter((l) => l.severity === 'warning' || l.severity === 'critical').length,
    lastEventAt: all[0]?.timestamp || null,
  };

  return NextResponse.json(
    {
      items: filtered.slice(offset, offset + limit),
      filteredTotal: filtered.length,
      offset,
      limit,
      stats,
      actors: Array.from(new Set(all.map((l) => l.userEmail).filter(Boolean))).sort(),
      integrity: verifyAuditTrail((store.auditLogs || []) as AuditEntry[], auditArchiveDir()),
      retention: 5000,
      generatedAt: new Date().toISOString(),
    },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
