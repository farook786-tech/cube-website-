import { NextRequest, NextResponse } from 'next/server';
import { getCMSStore, saveCMSStore } from '@/lib/db/store';
import { AuditEntry, checkCheckpoint, makeCheckpoint } from '@/lib/audit';
import { auditArchiveDir, authorizeAudit } from '@/lib/audit-query';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function record(session: { userId: string; email: string }, action: string, details: string) {
  const store = await getCMSStore();
  store.auditLogs.unshift({
    id: `log_${Date.now()}`,
    userId: session.userId,
    userEmail: session.email,
    action,
    resourceType: 'audit-log',
    resourceId: 'checkpoint',
    details,
    timestamp: new Date().toISOString(),
  });
  await saveCMSStore(store);
}

/**
 * Download a checkpoint of the audit log (latest entry id + hash).
 * Keep it OFF the server (email it to yourself, store it with backups).
 */
export async function GET(req: NextRequest) {
  const auth = await authorizeAudit(req);
  if (auth.error) return auth.error;
  const store = await getCMSStore();
  const cp = makeCheckpoint((store.auditLogs || []) as AuditEntry[]);
  if (!cp) return NextResponse.json({ error: 'The audit log is empty.' }, { status: 404 });
  await record(auth.session!, 'AUDIT_CHECKPOINT_DOWNLOADED', `Checkpoint at ${cp.entryId}`);
  const stamp = cp.createdAt.slice(0, 16).replace(/[:T]/g, '-');
  return new NextResponse(JSON.stringify(cp, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="cube-audit-checkpoint-${stamp}.json"`,
      'Cache-Control': 'no-store',
    },
  });
}

/** Check a previously downloaded checkpoint against the current log. */
export async function POST(req: NextRequest) {
  const auth = await authorizeAudit(req);
  if (auth.error) return auth.error;
  const cp = await req.json().catch(() => null);
  const store = await getCMSStore();
  const res = checkCheckpoint(cp || {}, (store.auditLogs || []) as AuditEntry[], auditArchiveDir());
  if (res.result !== 'invalid') {
    await record(
      auth.session!,
      res.result === 'intact' ? 'AUDIT_CHECKPOINT_VERIFIED' : 'AUDIT_CHECKPOINT_FAILED',
      `Checkpoint ${String(cp?.entryId).slice(0, 60)}: ${res.result}`
    );
  }
  return NextResponse.json(res, { headers: { 'Cache-Control': 'no-store' } });
}
