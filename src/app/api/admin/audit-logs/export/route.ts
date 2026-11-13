import { NextRequest } from 'next/server';
import { getCMSStore, saveCMSStore } from '@/lib/db/store';
import { AuditEntry } from '@/lib/audit';
import { applyFilters, authorizeAudit, normalized, readFilters } from '@/lib/audit-query';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const COLUMNS: [string, (l: AuditEntry) => unknown][] = [
  ['Time (ISO, UTC)', (l) => l.timestamp],
  ['Event', (l) => l.summary],
  ['Action code', (l) => l.action],
  ['Category', (l) => l.category],
  ['Severity', (l) => l.severity],
  ['Outcome', (l) => l.outcome],
  ['User', (l) => l.userEmail],
  ['Resource type', (l) => l.resourceType],
  ['Resource', (l) => l.resourceId],
  ['Details', (l) => l.details],
  ['IP address', (l) => l.ip],
  ['Browser', (l) => l.userAgent],
  ['Entry ID', (l) => l.id],
  ['Hash', (l) => l.hash],
];

function cell(v: unknown) {
  let s = v == null ? '' : String(v);
  // Neutralise spreadsheet formulas (CSV injection).
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/** CSV download of the (filtered) audit log. The export itself is audited. */
export async function GET(req: NextRequest) {
  const auth = await authorizeAudit(req);
  if (auth.error) return auth.error;

  const store = await getCMSStore();
  const rows = applyFilters(normalized((store.auditLogs || []) as AuditEntry[]), readFilters(req));

  const csv = [
    COLUMNS.map(([h]) => cell(h)).join(','),
    ...rows.map((l) => COLUMNS.map(([, get]) => cell(get(l))).join(',')),
  ].join('\r\n');

  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: auth.session!.userId,
    userEmail: auth.session!.email,
    action: 'AUDIT_EXPORTED',
    resourceType: 'audit-log',
    resourceId: `${rows.length} entries`,
    timestamp: new Date().toISOString(),
  });
  await saveCMSStore(store);

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response('﻿' + csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="cube-audit-log-${stamp}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
