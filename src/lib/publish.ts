import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';

/**
 * Publishing from the LOCAL admin to the LIVE website.
 *
 * The admin runs on a local computer (JSON file store). The public website runs
 * on Vercel, read-only, from `src/content/published-store.json`. After every
 * admin save this module:
 *   1. builds a PUBLIC-ONLY snapshot (published content only: no admin
 *      accounts, enquiries, job applications, archived/draft items or
 *      internal archive remarks; the GitHub repository is public),
 *   2. waits a few seconds so several quick edits go out together,
 *   3. commits ONLY the snapshot + the uploaded images it references, and
 *      pushes to GitHub `main`, which makes Vercel rebuild the live site.
 *
 * Nothing else in the working tree is ever committed.
 *
 * Overwrite protection: each computer records (in data-store/, never in Git)
 * which version of the live content it last published. If GitHub has a
 * different version, someone else published since; this computer then stops
 * and asks for confirmation ("Publish anyway") instead of silently replacing
 * the live site with its own, possibly older, copy.
 */

const ROOT = process.cwd();
export const SNAPSHOT_REL = 'src/content/published-store.json';
const SNAPSHOT_FILE = path.join(ROOT, SNAPSHOT_REL);
const UPLOADS_DIR = path.join(ROOT, 'public', 'uploads');
const PUBLISH_RECORD = path.join(ROOT, 'data-store', '.publish-record.json');
const PUBLISH_DELAY_MS = 15_000;
const LIVE_BRANCH = 'main';

const PUBLIC_COLLECTIONS = [
  'news', 'projects', 'verticals', 'announcements', 'careers', 'tenders',
  'celServices', 'teamMembers', 'clients', 'gallery', 'heroSlides',
] as const;
const HIDDEN_STATUSES = new Set(['archived', 'archive', 'draft']);
const PRIVATE_FIELDS = ['archiveRemark', 'archivedAt'];

export type PublishState = 'disabled' | 'idle' | 'pending' | 'publishing' | 'published' | 'failed' | 'blocked';

export interface PublishStatus {
  state: PublishState;
  lastPublishedAt?: string;
  lastCommit?: string;
  error?: string;
  pendingSince?: string;
}

/** Public-only copy of the store (safe for a public GitHub repository). */
export function buildPublicSnapshot(store: Record<string, any>) {
  const out: Record<string, any> = { users: [], auditLogs: [], enquiries: [], jobApplications: [] };
  for (const key of PUBLIC_COLLECTIONS) {
    const list = Array.isArray(store[key]) ? store[key] : [];
    out[key] = list
      .filter((item: any) => !HIDDEN_STATUSES.has(String(item?.status ?? '').toLowerCase()))
      .map((item: any) => {
        const copy = { ...item };
        for (const field of PRIVATE_FIELDS) delete copy[field];
        return copy;
      });
  }
  if (store.careersPage && typeof store.careersPage === 'object') out.careersPage = store.careersPage;
  return out;
}

/**
 * Opt-in. Only for the interim setup where the admin runs on a local computer
 * and the public site is a separate read-only deployment (Vercel). On the
 * production server the website and admin are one app sharing one data store,
 * so nothing needs publishing: leave PUBLISH_TO_GITHUB unset there.
 */
export function autoPublishEnabled(): boolean {
  return !process.env.VERCEL && process.env.PUBLISH_TO_GITHUB === 'true';
}

const g = globalThis as unknown as {
  __cubePublish?: {
    status: PublishStatus;
    timer: NodeJS.Timeout | null;
    latest: Record<string, any> | null;
    running: boolean;
    rerun: boolean;
  };
};
const state = (g.__cubePublish ??= {
  status: { state: autoPublishEnabled() ? 'idle' : 'disabled' },
  timer: null,
  latest: null,
  running: false,
  rerun: false,
});

export function getPublishStatus(): PublishStatus {
  return { ...state.status };
}

function readCurrentSnapshotJson(): string | null {
  try {
    return JSON.stringify(JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8')).store);
  } catch {
    return null;
  }
}

/** Called after every admin save (file mode). Debounced. */
export function schedulePublish(store: Record<string, any>) {
  if (!autoPublishEnabled()) return;
  state.latest = store;
  const next = JSON.stringify(buildPublicSnapshot(store));
  // Saves that don't touch public content (logins, enquiries, ...) do nothing.
  if (next === readCurrentSnapshotJson() && state.status.state !== 'failed') return;
  // Waiting for the admin to confirm "Publish anyway": keep the latest content, don't auto-publish.
  if (state.status.state === 'blocked') return;
  if (state.status.state !== 'pending') {
    state.status = { ...state.status, state: 'pending', pendingSince: new Date().toISOString(), error: undefined };
  }
  if (state.timer) clearTimeout(state.timer);
  state.timer = setTimeout(() => {
    state.timer = null;
    void publishNow();
  }, PUBLISH_DELAY_MS);
}

function git(args: string[]): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    execFile('git', args, { cwd: ROOT, timeout: 120_000, windowsHide: true }, (error, stdout, stderr) => {
      if (error) reject(Object.assign(error, { stdout, stderr }));
      else resolve({ stdout: String(stdout), stderr: String(stderr) });
    });
  });
}

/** Version (Git blob id) of the live content this computer last published. */
function readPublishRecord(): { blob?: string; publishedAt?: string } {
  try {
    return JSON.parse(fs.readFileSync(PUBLISH_RECORD, 'utf8'));
  } catch {
    return {};
  }
}

function writePublishRecord(blob: string) {
  try {
    fs.mkdirSync(path.dirname(PUBLISH_RECORD), { recursive: true });
    fs.writeFileSync(PUBLISH_RECORD, JSON.stringify({ blob, publishedAt: new Date().toISOString() }, null, 2), 'utf8');
  } catch {
    // not fatal: the next publish will just ask for confirmation
  }
}

async function liveSnapshotBlob(): Promise<string | null> {
  await git(['fetch', 'origin', LIVE_BRANCH]);
  try {
    return (await git(['rev-parse', `origin/${LIVE_BRANCH}:${SNAPSHOT_REL}`])).stdout.trim() || null;
  } catch {
    return null; // no snapshot on GitHub yet
  }
}

function referencedUploads(json: string): string[] {
  const names = new Set<string>();
  for (const m of json.matchAll(/\/uploads\/([A-Za-z0-9][A-Za-z0-9_.-]{0,200})/g)) names.add(m[1]);
  return [...names]
    .filter((n) => fs.existsSync(path.join(UPLOADS_DIR, n)))
    .map((n) => `public/uploads/${n}`);
}

/** Write the snapshot, commit only the published files, push to GitHub. */
export async function publishNow(
  store?: Record<string, any>,
  options: { force?: boolean } = {}
): Promise<PublishStatus> {
  if (!autoPublishEnabled()) return getPublishStatus();
  if (store) state.latest = store;
  if (!state.latest) {
    state.status = { ...state.status, state: 'failed', error: 'Nothing to publish yet.' };
    return getPublishStatus();
  }
  if (state.running) {
    state.rerun = true;
    return getPublishStatus();
  }
  if (state.timer) {
    clearTimeout(state.timer);
    state.timer = null;
  }

  state.running = true;
  state.status = { ...state.status, state: 'publishing', error: undefined };
  try {
    const branch = (await git(['rev-parse', '--abbrev-ref', 'HEAD'])).stdout.trim();
    if (branch !== LIVE_BRANCH) {
      throw new Error(`The project is on branch "${branch}". Switch to "${LIVE_BRANCH}" to publish.`);
    }

    // Overwrite protection (see the note at the top of this file).
    const liveBlob = await liveSnapshotBlob();
    const record = readPublishRecord();
    if (!options.force && liveBlob && liveBlob !== record.blob) {
      state.status = {
        ...state.status,
        state: 'blocked',
        error: record.blob
          ? 'The live site has content that was published from another computer after this computer last published. Publishing was paused so it is not overwritten. Check the live site, then choose "Publish anyway" to replace it with the content on this computer.'
          : 'This computer has not published with overwrite protection yet. Check that the live site does not have newer content from another computer, then choose "Publish anyway" once.',
      };
      return getPublishStatus();
    }

    const snapshot = buildPublicSnapshot(state.latest);
    const json = JSON.stringify(snapshot);
    if (json !== readCurrentSnapshotJson()) {
      fs.mkdirSync(path.dirname(SNAPSHOT_FILE), { recursive: true });
      fs.writeFileSync(
        SNAPSHOT_FILE,
        JSON.stringify({ publishedAt: new Date().toISOString(), store: snapshot }, null, 1) + '\n',
        'utf8'
      );
    }

    const paths = [SNAPSHOT_REL, ...referencedUploads(json)];
    await git(['add', '-f', '--', ...paths]);
    try {
      await git(['commit', '--only', '-m', `Publish website content from admin (${new Date().toLocaleString('en-IN')})`, '--', ...paths]);
    } catch (e: any) {
      // "nothing to commit" just means the live site already has this content.
      if (!/nothing to commit|no changes added/i.test(`${e.stdout}${e.stderr}`)) throw e;
    }

    try {
      await git(['push', 'origin', `HEAD:${LIVE_BRANCH}`]);
    } catch {
      // GitHub has newer commits (e.g. code pushed from elsewhere): rebase once, retry.
      try {
        await git(['pull', '--rebase', '--autostash', 'origin', LIVE_BRANCH]);
      } catch (e: any) {
        await git(['rebase', '--abort']).catch(() => {});
        throw new Error(`Could not merge newer GitHub changes automatically. ${String(e.stderr || e.message).trim().slice(0, 300)}`);
      }
      await git(['push', 'origin', `HEAD:${LIVE_BRANCH}`]);
    }

    const commit = (await git(['rev-parse', '--short', 'HEAD'])).stdout.trim();
    writePublishRecord((await git(['rev-parse', `HEAD:${SNAPSHOT_REL}`])).stdout.trim());

    // Audit trail entry (lazy import: store.ts imports this module).
    try {
      const { getCMSStore, saveCMSStore } = await import('@/lib/db/store');
      const store = await getCMSStore();
      store.auditLogs.unshift({
        id: `log_${Date.now()}`,
        userId: 'system',
        userEmail: 'system',
        action: options.force ? 'PUBLISH_LIVE_OVERRIDE' : 'PUBLISH_LIVE',
        resourceType: 'website',
        resourceId: commit,
        details: options.force ? 'Published with "Publish anyway" (replaced newer live content)' : undefined,
        timestamp: new Date().toISOString(),
      });
      await saveCMSStore(store);
    } catch {}
    state.status = { state: 'published', lastPublishedAt: new Date().toISOString(), lastCommit: commit };
  } catch (e: any) {
    state.status = {
      ...state.status,
      state: 'failed',
      error: String(e?.message || e).replace(/\s+/g, ' ').slice(0, 400),
    };
  } finally {
    state.running = false;
  }

  if (state.rerun) {
    state.rerun = false;
    return publishNow(undefined, options);
  }
  return getPublishStatus();
}
