import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * Audit trail: enrichment + tamper evidence.
 *
 * Every admin action already adds an entry to `store.auditLogs` (newest first).
 * When the store is saved, entries that are new since the last save are
 * "sealed" here:
 *   - classified (category, severity, plain-English summary),
 *   - stamped with the request's IP address and browser (when available),
 *   - linked into a SHA-256 hash chain: each entry stores the hash of the
 *     previous entry and its own hash. Editing or deleting any sealed entry
 *     breaks the chain, which `verifyAuditChain` detects and the Security &
 *     Audit Logs page reports.
 */

export type AuditCategory = 'Authentication' | 'Security' | 'Content' | 'Enquiries' | 'Publishing' | 'System';
export type AuditSeverity = 'info' | 'notice' | 'warning' | 'critical';

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  resourceType?: string;
  resourceId?: string;
  userId?: string;
  userEmail?: string;
  details?: string;
  category?: AuditCategory;
  severity?: AuditSeverity;
  outcome?: 'success' | 'failure';
  summary?: string;
  ip?: string;
  userAgent?: string;
  legacy?: boolean;
  alg?: string;
  kid?: string;
  prevHash?: string;
  hash?: string;
  [key: string]: unknown;
}

const GENESIS = '0'.repeat(64);

const HUMAN: Record<string, string> = {
  ADMIN_LOGIN: 'Signed in to the admin',
  ADMIN_LOGIN_FAILED: 'Failed sign-in attempt',
  ADMIN_LOGIN_BLOCKED: 'Sign-in blocked after too many failed attempts',
  ADMIN_LOGOUT: 'Signed out',
  ADMIN_PASSWORD_CHANGED: 'Changed account password',
  ADMIN_PASSWORD_CHANGE_FAILED: 'Failed password change (wrong current password)',
  ADMIN_SESSIONS_REVOKED: 'Signed out all other devices',
  ACCESS_DENIED: 'Tried an action without permission',
  AUDIT_EXPORTED: 'Exported the audit log',
  AUDIT_CHECKPOINT_DOWNLOADED: 'Downloaded an audit checkpoint',
  AUDIT_CHECKPOINT_VERIFIED: 'Verified an audit checkpoint',
  AUDIT_CHECKPOINT_FAILED: 'Audit checkpoint did NOT match (history changed)',
  PUBLISH_LIVE: 'Published content to the live website',
  PUBLISH_LIVE_OVERRIDE: 'Published with "Publish anyway" (replaced newer live content)',
};

function words(action: string) {
  const s = action.toLowerCase().replace(/_/g, ' ');
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function classifyAudit(e: AuditEntry): Pick<AuditEntry, 'category' | 'severity' | 'outcome' | 'summary'> {
  const a = String(e.action || '').toUpperCase();
  let category: AuditCategory = 'Content';
  if (a.startsWith('ADMIN_LOGIN') || a === 'ADMIN_LOGOUT') category = 'Authentication';
  else if (a.includes('PASSWORD') || a.includes('SESSION') || a.includes('ACCESS') || a.includes('AUDIT')) category = 'Security';
  else if (a.includes('ENQUIR') || a.includes('APPLICATION') || a.includes('CONTACT')) category = 'Enquiries';
  else if (a.includes('PUBLISH')) category = 'Publishing';
  else if (e.userEmail === 'system' || a.startsWith('SYNC_')) category = 'System';

  const failure = /FAILED|BLOCKED|DENIED/.test(a);
  let severity: AuditSeverity = 'info';
  if (a === 'ADMIN_LOGIN_BLOCKED' || a === 'ACCESS_DENIED' || a === 'AUDIT_CHECKPOINT_FAILED') severity = 'critical';
  else if (failure || a.includes('OVERRIDE')) severity = 'warning';
  else if (category === 'Security' || /DELETE|ARCHIVE|RESTORE|DEACTIVATE/.test(a)) severity = 'notice';

  const target = e.resourceType && e.resourceType !== 'auth' ? ` (${e.resourceType}${e.resourceId ? `: ${e.resourceId}` : ''})` : '';
  const summary = HUMAN[a] || `${words(a)}${target}`;
  return { category, severity, outcome: failure ? 'failure' : 'success', summary };
}

// ---------------------------------------------------------------------------
// Tamper evidence
//
// 1. Signed hash chain. Each entry stores the previous entry's hash and its own
//    HMAC-SHA256, keyed with AUDIT_LOG_KEY (set in the server's .env file, never
//    stored with the data). Editing, deleting or re-ordering entries breaks the
//    chain, and without the key the chain cannot be recomputed to hide it.
//    `kid` identifies the key, so a changed key is reported as such rather than
//    as tampering.
// 2. Append-only archive (file storage). Every sealed entry is also appended to
//    data-store/audit-trail/audit-YYYY-MM.jsonl. These files are only ever
//    appended to, are never trimmed (the admin view keeps the newest 5,000), and
//    every entry in the admin log must match its archived copy.
// 3. Checkpoints. A checkpoint (latest entry id + hash) can be downloaded and
//    kept off the server. Checking it later shows whether history up to that
//    point has been rewritten.
// ---------------------------------------------------------------------------

const ALG = 'hmac-sha256';

interface AuditKey {
  key: Buffer;
  kid: string;
  source: 'AUDIT_LOG_KEY' | 'derived';
}

let cachedKey: AuditKey | null | undefined;
function auditKey(): AuditKey | null {
  if (cachedKey !== undefined) return cachedKey;
  const configured = process.env.AUDIT_LOG_KEY;
  const jwt = process.env.ADMIN_JWT_SECRET;
  let key: Buffer | null = null;
  let source: AuditKey['source'] = 'AUDIT_LOG_KEY';
  if (configured && configured.length >= 32) key = Buffer.from(configured, 'utf8');
  else if (jwt && jwt.length >= 32) {
    key = crypto.createHmac('sha256', jwt).update('cube-audit-log-key').digest();
    source = 'derived';
  }
  cachedKey = key
    ? { key, source, kid: crypto.createHmac('sha256', key).update('cube-audit-key-id').digest('hex').slice(0, 12) }
    : null;
  return cachedKey;
}

export function auditKeyInfo(): { configured: true; source: AuditKey['source']; kid: string } | { configured: false } {
  const k = auditKey();
  return k ? { configured: true, source: k.source, kid: k.kid } : { configured: false };
}

/** Fields covered by the hash (fixed order so the hash is reproducible). */
function canonical(e: AuditEntry, signed: boolean) {
  const base = [
    e.id, e.timestamp, e.action, e.resourceType ?? '', e.resourceId ?? '', e.userId ?? '', e.userEmail ?? '',
    e.details ?? '', e.category ?? '', e.severity ?? '', e.outcome ?? '', e.summary ?? '', e.ip ?? '',
    e.userAgent ?? '', e.prevHash ?? '',
  ];
  return JSON.stringify(signed ? [...base, e.legacy ? 1 : 0, e.alg ?? '', e.kid ?? ''] : base);
}

/** Expected hash of an entry, or null when it was signed with a different key. */
function hashOf(e: AuditEntry): string | null {
  if (e.alg === ALG) {
    const k = auditKey();
    if (!k || e.kid !== k.kid) return null;
    return crypto.createHmac('sha256', k.key).update(canonical(e, true)).digest('hex');
  }
  return crypto.createHash('sha256').update(canonical(e, false)).digest('hex');
}

function sign(e: AuditEntry, prev: string) {
  const k = auditKey();
  e.prevHash = prev;
  if (k) {
    e.alg = ALG;
    e.kid = k.kid;
  }
  e.hash = hashOf(e) as string;
  return e.hash;
}

function clip(v: string | null | undefined, n: number) {
  return v ? v.slice(0, n) : undefined;
}

/** IP address and browser of the current request (empty outside a request). */
export async function requestMeta(): Promise<{ ip?: string; userAgent?: string }> {
  try {
    const { headers } = await import('next/headers');
    const h = await headers();
    const ip = h.get('x-forwarded-for')?.split(',')[0]?.trim() || h.get('x-real-ip') || undefined;
    return { ip: clip(ip, 64), userAgent: clip(h.get('user-agent'), 200) };
  } catch {
    return {};
  }
}

// ---------------- chain verification ----------------

export interface ChainResult {
  ok: boolean;
  checked: number;
  brokenAt?: string;
  reason?: 'modified' | 'link' | 'downgrade' | 'key' | 'archive';
}

/** Verify a newest-first list of entries, oldest to newest. */
function verifyList(logs: AuditEntry[]): ChainResult {
  const sealed = (logs || []).filter((l) => l && l.hash);
  const anySigned = sealed.some((l) => l.alg === ALG);
  let checked = 0;
  for (let i = sealed.length - 1; i >= 0; i--) {
    const e = sealed[i];
    // Once entries are signed, an unsigned entry means someone replaced it.
    if (anySigned && e.alg !== ALG) return { ok: false, checked, brokenAt: e.id, reason: 'downgrade' };
    const expected = hashOf(e);
    if (expected === null) return { ok: false, checked, brokenAt: e.id, reason: 'key' };
    if (expected !== e.hash) return { ok: false, checked, brokenAt: e.id, reason: 'modified' };
    const older = sealed[i + 1];
    if (older && e.prevHash !== older.hash) return { ok: false, checked, brokenAt: e.id, reason: 'link' };
    checked++;
  }
  return { ok: true, checked };
}

export function verifyAuditChain(logs: AuditEntry[]): ChainResult {
  return verifyList(logs);
}

// ---------------- append-only archive ----------------

function archiveFiles(dir: string) {
  try {
    return fs.readdirSync(dir).filter((f) => /^audit-\d{4}-\d{2}\.jsonl$/.test(f)).sort();
  } catch {
    return [];
  }
}

function appendToArchive(dir: string, entriesOldestFirst: AuditEntry[]) {
  if (!entriesOldestFirst.length) return;
  fs.mkdirSync(dir, { recursive: true });
  const byMonth = new Map<string, string[]>();
  for (const e of entriesOldestFirst) {
    const month = String(e.timestamp || '').slice(0, 7) || new Date().toISOString().slice(0, 7);
    if (!byMonth.has(month)) byMonth.set(month, []);
    byMonth.get(month)!.push(JSON.stringify(e));
  }
  for (const [month, lines] of byMonth) {
    fs.appendFileSync(path.join(dir, `audit-${month}.jsonl`), lines.join('\n') + '\n', 'utf8');
  }
}

/** Order entries newest-first by following prevHash links (falls back to time order). */
function orderByChain(entries: AuditEntry[]): AuditEntry[] {
  const byPrev = new Map<string, AuditEntry>();
  for (const e of entries) if (e.prevHash) byPrev.set(e.prevHash, e);
  const hashes = new Set(entries.map((e) => e.hash));
  const roots = entries.filter((e) => !e.prevHash || !hashes.has(e.prevHash));
  if (roots.length !== 1) return entries;
  const out: AuditEntry[] = [];
  let cur: AuditEntry | undefined = roots[0];
  const seen = new Set<string>();
  while (cur && !seen.has(String(cur.hash))) {
    out.push(cur);
    seen.add(String(cur.hash));
    cur = byPrev.get(String(cur.hash));
  }
  return out.length === entries.length ? out.reverse() : entries;
}

let archiveCache: { sig: string; entries: AuditEntry[] } | null = null;
/** All archived entries, newest first (cached until the files change). */
export function readArchive(dir: string): AuditEntry[] {
  const files = archiveFiles(dir);
  const sig = files
    .map((f) => {
      try {
        const st = fs.statSync(path.join(dir, f));
        return `${f}:${st.size}:${st.mtimeMs}`;
      } catch {
        return f;
      }
    })
    .join('|');
  if (archiveCache && archiveCache.sig === sig) return archiveCache.entries;
  const entries: AuditEntry[] = [];
  for (const f of files) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8');
    for (const line of text.split('\n')) {
      if (!line.trim()) continue;
      try {
        entries.push(JSON.parse(line));
      } catch {
        entries.push({ id: `corrupt-line-in-${f}`, timestamp: '', action: 'CORRUPT', hash: 'corrupt' });
      }
    }
  }
  entries.sort((a, b) => String(b.timestamp).localeCompare(String(a.timestamp)));
  const ordered = orderByChain(entries);
  archiveCache = { sig, entries: ordered };
  return ordered;
}

// ---------------- sealing ----------------

/**
 * Seal new entries (newest-first array) before the store is written.
 * - first run: existing entries are sealed as `legacy` (no request details);
 * - entries sealed earlier with a plain hash are re-signed once with the key,
 *   but only if their chain is intact (a broken chain is left as evidence);
 * - with `archiveDir`, new entries are appended to the append-only archive.
 */
export async function sealAuditLogs(logs: AuditEntry[] | undefined, options: { archiveDir?: string } = {}) {
  if (!Array.isArray(logs) || logs.length === 0) return;
  const key = auditKey();
  const toArchive: AuditEntry[] = [];

  // One-time upgrade from plain SHA-256 to the signed chain.
  const firstSealedIdx = logs.findIndex((l) => l && l.hash);
  if (key && firstSealedIdx !== -1 && logs.some((l) => l.hash && l.alg !== ALG)) {
    if (verifyList(logs.slice(firstSealedIdx)).ok) {
      let prev = GENESIS;
      for (let i = logs.length - 1; i >= firstSealedIdx; i--) {
        if (logs[i].hash) prev = sign(logs[i], prev);
      }
    }
  }

  const firstSealed = logs.findIndex((l) => l && l.hash);
  const legacyRun = firstSealed === -1;
  const end = legacyRun ? logs.length : firstSealed; // [0, end) are unsealed
  if (end > 0) {
    const meta = legacyRun ? {} : await requestMeta();
    let prev = legacyRun ? GENESIS : String(logs[firstSealed].hash);
    for (let i = end - 1; i >= 0; i--) {
      const e = logs[i];
      if (!e.id) e.id = `log_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      if (!e.timestamp) e.timestamp = new Date().toISOString();
      Object.assign(e, classifyAudit(e));
      if (legacyRun) e.legacy = true;
      else {
        if (!e.ip && meta.ip) e.ip = meta.ip;
        if (!e.userAgent && meta.userAgent) e.userAgent = meta.userAgent;
      }
      prev = sign(e, prev);
      toArchive.push(e);
    }
  }

  if (options.archiveDir) {
    try {
      if (archiveFiles(options.archiveDir).length === 0) {
        // Start the archive with everything currently in the log.
        appendToArchive(options.archiveDir, logs.filter((l) => l.hash).slice().reverse());
      } else {
        appendToArchive(options.archiveDir, toArchive);
      }
    } catch {
      // The admin log is still written; the integrity check reports the gap.
    }
  }
}

// ---------------- full verification ----------------

export interface TrailStatus extends ChainResult {
  signed: boolean;
  keySource?: 'AUDIT_LOG_KEY' | 'derived';
  archive?: { entries: number; files: number; ok: boolean; oldest?: string };
  detailedSince?: string | null;
}

/** Verify the admin log, the archive's own chain, and that the two agree. */
export function verifyAuditTrail(logs: AuditEntry[], archiveDir?: string): TrailStatus {
  const key = auditKeyInfo();
  const base = verifyList(logs);
  const firstDetailed = [...(logs || [])].reverse().find((l) => l.hash && !l.legacy);
  const out: TrailStatus = {
    ...base,
    signed: (logs || []).some((l) => l.alg === ALG),
    keySource: key.configured ? key.source : undefined,
    detailedSince: firstDetailed?.timestamp || null,
  };
  if (!archiveDir || archiveFiles(archiveDir).length === 0) return out;

  const archived = readArchive(archiveDir);
  const archiveChain = verifyList(archived);
  const byId = new Map(archived.map((e) => [e.id, e.hash]));
  let mismatch: string | undefined;
  for (const e of logs || []) {
    if (e.hash && byId.get(e.id) !== e.hash) {
      mismatch = e.id;
      break;
    }
  }
  out.archive = {
    entries: archived.length,
    files: archiveFiles(archiveDir).length,
    ok: archiveChain.ok && !mismatch,
    oldest: archived[archived.length - 1]?.timestamp,
  };
  if (out.ok && !archiveChain.ok) Object.assign(out, { ok: false, brokenAt: archiveChain.brokenAt, reason: 'archive' });
  else if (out.ok && mismatch) Object.assign(out, { ok: false, brokenAt: mismatch, reason: 'archive' });
  return out;
}

// ---------------- checkpoints ----------------

export interface AuditCheckpoint {
  type: 'cube-audit-checkpoint';
  createdAt: string;
  entryId: string;
  entryTime: string;
  hash: string;
  entries: number;
  keyId?: string;
}

export function makeCheckpoint(logs: AuditEntry[]): AuditCheckpoint | null {
  const head = (logs || []).find((l) => l.hash);
  if (!head) return null;
  const key = auditKeyInfo();
  return {
    type: 'cube-audit-checkpoint',
    createdAt: new Date().toISOString(),
    entryId: head.id,
    entryTime: head.timestamp,
    hash: String(head.hash),
    entries: (logs || []).filter((l) => l.hash).length,
    keyId: key.configured ? key.kid : undefined,
  };
}

/**
 * Check a saved checkpoint against the current log + archive.
 * 'intact'    the entry still exists with the same hash: history up to it is unchanged;
 * 'rewritten' the entry exists but its hash changed: history was rewritten;
 * 'missing'   the entry no longer exists (deleted).
 */
export function checkCheckpoint(
  cp: Partial<AuditCheckpoint>,
  logs: AuditEntry[],
  archiveDir?: string
): { result: 'intact' | 'rewritten' | 'missing' | 'invalid'; entryTime?: string } {
  if (!cp || typeof cp.entryId !== 'string' || typeof cp.hash !== 'string') return { result: 'invalid' };
  const pool = [...(logs || []), ...(archiveDir ? readArchive(archiveDir) : [])];
  const found = pool.find((e) => e.id === cp.entryId);
  if (!found) return { result: 'missing' };
  return { result: found.hash === cp.hash ? 'intact' : 'rewritten', entryTime: found.timestamp };
}
