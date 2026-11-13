'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ShieldCheck, ShieldAlert, Download, Search, RotateCcw, ChevronDown, ChevronRight,
  Activity, LogIn, AlertTriangle, Database, Loader2, Stamp, FileCheck2,
} from 'lucide-react';
import { useCmsUpdates } from '@/lib/live';

interface Entry {
  id: string;
  timestamp: string;
  action: string;
  summary?: string;
  category?: string;
  severity?: 'info' | 'notice' | 'warning' | 'critical';
  outcome?: string;
  userEmail?: string;
  resourceType?: string;
  resourceId?: string;
  details?: string;
  ip?: string;
  userAgent?: string;
  hash?: string;
  prevHash?: string;
  legacy?: boolean;
}

interface Payload {
  items: Entry[];
  filteredTotal: number;
  stats: { total: number; today: number; failedSignIns24h: number; securityAlerts7d: number; lastEventAt: string | null };
  actors: string[];
  integrity: {
    ok: boolean;
    checked: number;
    brokenAt?: string;
    reason?: 'modified' | 'link' | 'downgrade' | 'key' | 'archive';
    signed: boolean;
    keySource?: 'AUDIT_LOG_KEY' | 'derived';
    archive?: { entries: number; files: number; ok: boolean; oldest?: string };
    detailedSince?: string | null;
  };
  retention: number;
  generatedAt: string;
}

const CATEGORIES = ['Authentication', 'Security', 'Content', 'Enquiries', 'Publishing', 'System'];
const SEVERITIES = ['info', 'notice', 'warning', 'critical'];
const PAGE = 50;

const SEV_STYLE: Record<string, string> = {
  info: 'bg-slate-100 text-slate-700 border-slate-200',
  notice: 'bg-blue-50 text-blue-800 border-blue-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-300',
  critical: 'bg-red-50 text-red-700 border-red-300',
};
const CAT_STYLE: Record<string, string> = {
  Authentication: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  Security: 'text-rose-700 bg-rose-50 border-rose-200',
  Content: 'text-[#070E5C] bg-[#EAF2F8] border-[#BBD6EA]',
  Enquiries: 'text-teal-700 bg-teal-50 border-teal-200',
  Publishing: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  System: 'text-slate-600 bg-slate-100 border-slate-200',
};

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' });

function ago(iso: string | null, now: number) {
  if (!iso) return '—';
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

function browserName(ua?: string) {
  if (!ua) return '';
  const os = /Windows/.test(ua) ? 'Windows' : /Android/.test(ua) ? 'Android' : /iPhone|iPad/.test(ua) ? 'iOS' : /Mac OS/.test(ua) ? 'macOS' : /Linux/.test(ua) ? 'Linux' : '';
  const br = /Edg\//.test(ua) ? 'Edge' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Browser';
  return os ? `${br} on ${os}` : br;
}

export default function AuditLogsClient() {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('');
  const [actor, setActor] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [loading, setLoading] = useState(false);
  const seen = useRef<Set<string> | null>(null);
  const [fresh, setFresh] = useState<Set<string>>(new Set());
  const [cpResult, setCpResult] = useState<{ tone: 'ok' | 'bad' | 'warn'; text: string } | null>(null);
  const cpInput = useRef<HTMLInputElement>(null);

  // Verify a checkpoint file downloaded earlier (kept off the server).
  const verifyCheckpoint = async (file: File) => {
    setCpResult(null);
    try {
      const cp = JSON.parse(await file.text());
      const res = await fetch('/api/admin/audit-logs/checkpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cp),
      });
      const r = await res.json();
      const when = cp?.entryTime ? new Date(cp.entryTime).toLocaleString('en-IN') : 'the checkpoint';
      if (r.result === 'intact') setCpResult({ tone: 'ok', text: `Checkpoint matches: the audit history up to ${when} is unchanged.` });
      else if (r.result === 'rewritten') setCpResult({ tone: 'bad', text: `Checkpoint does NOT match: the audit history up to ${when} has been rewritten.` });
      else if (r.result === 'missing') setCpResult({ tone: 'bad', text: `The checkpoint's entry no longer exists: audit history up to ${when} has been deleted.` });
      else setCpResult({ tone: 'warn', text: 'That file is not a CUBE audit checkpoint.' });
    } catch {
      setCpResult({ tone: 'warn', text: 'That file is not a CUBE audit checkpoint.' });
    }
  };

  // Debounce the search box.
  useEffect(() => {
    const t = setTimeout(() => setQuery(q), 300);
    return () => clearTimeout(t);
  }, [q]);

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (query) p.set('q', query);
    if (category) p.set('category', category);
    if (severity) p.set('severity', severity);
    if (actor) p.set('actor', actor);
    if (from) p.set('from', from);
    if (to) p.set('to', to);
    return p;
  }, [query, category, severity, actor, from, to]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const p = new URLSearchParams(params);
      p.set('limit', String(limit));
      const res = await fetch(`/api/admin/audit-logs?${p}`, { cache: 'no-store' });
      if (!res.ok) {
        setError(res.status === 403 ? 'Only super admins and admins can view the audit log.' : 'Could not load the audit log.');
        return;
      }
      const json: Payload = await res.json();
      // Highlight entries that arrived since the previous refresh.
      if (seen.current) {
        const added = json.items.filter((i) => !seen.current!.has(i.id)).map((i) => i.id);
        if (added.length) {
          setFresh(new Set(added));
          setTimeout(() => setFresh(new Set()), 4000);
        }
      }
      seen.current = new Set(json.items.map((i) => i.id));
      setData(json);
      setError('');
    } catch {
      setError('Could not load the audit log.');
    } finally {
      setLoading(false);
    }
  }, [params, limit]);

  useEffect(() => {
    load();
  }, [load]);
  // Real time: refresh the moment anything is saved (live stream), with a slow fallback poll.
  useCmsUpdates(load);
  useEffect(() => {
    const t = setInterval(load, 15000);
    const c = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(t);
      clearInterval(c);
    };
  }, [load]);

  const reset = () => {
    setQ('');
    setCategory('');
    setSeverity('');
    setActor('');
    setFrom('');
    setTo('');
    setLimit(PAGE);
  };
  const filtersOn = Boolean(q || category || severity || actor || from || to);
  const detailedSince = data?.integrity.detailedSince
    ? new Date(data.integrity.detailedSince).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : '';
  const legacyNote = detailedSince ? `Not stored (before ${detailedSince})` : 'Not stored';

  const select =
    'px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs text-slate-700 focus:outline-none focus:border-[#070E5C]';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded border border-rose-200">
              Security
            </span>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              Live
              {data && <span className="text-slate-400 font-normal">· updated {ago(data.generatedAt, now)}</span>}
            </span>
          </div>
          <h1 className="text-2xl font-bold font-display text-[#24272B] mt-1">Security &amp; Audit Logs</h1>
          <p className="text-xs text-slate-500 mt-1">
            Every sign-in, failed attempt, content change and publish, with who, when, from where. New events appear instantly.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {data &&
            (data.integrity.ok ? (
              <span
                className="flex items-center text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200"
                title={`Each entry is signed (HMAC-SHA256 with the server's audit key) and linked to the previous one${
                  data.integrity.archive ? ', and must match its copy in the append-only archive' : ''
                }. Any edit or deletion outside the admin is detected.`}
              >
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                Integrity verified · {data.integrity.checked.toLocaleString('en-IN')} entries
                {data.integrity.archive && <span className="font-normal">&nbsp;· archive {data.integrity.archive.entries.toLocaleString('en-IN')}</span>}
              </span>
            ) : (
              <span className="flex items-center text-xs font-semibold text-red-700 bg-red-50 px-3 py-1.5 rounded-full border border-red-300">
                <ShieldAlert className="w-4 h-4 mr-1.5" />
                {data.integrity.reason === 'key'
                  ? 'Signed with a different audit key'
                  : data.integrity.reason === 'archive'
                    ? `Log and archive disagree at ${data.integrity.brokenAt}`
                    : `Integrity check failed at ${data.integrity.brokenAt}`}
              </span>
            ))}
          <a
            href="/api/admin/audit-logs/checkpoint"
            title="Download a checkpoint and keep it off the server. Verifying it later proves the history up to now was not rewritten."
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-[#BBD6EA] text-[#070E5C] bg-white hover:bg-[#EAF2F8]"
          >
            <Stamp className="w-3.5 h-3.5" />
            Checkpoint
          </a>
          <button
            type="button"
            onClick={() => cpInput.current?.click()}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-[#BBD6EA] text-[#070E5C] bg-white hover:bg-[#EAF2F8]"
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Verify checkpoint
          </button>
          <input
            ref={cpInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f) verifyCheckpoint(f);
            }}
          />
          <a
            href={`/api/admin/audit-logs/export?${params}`}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border border-[#BBD6EA] text-[#070E5C] bg-white hover:bg-[#EAF2F8]"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </a>
        </div>
      </div>

      {error && <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">{error}</div>}
      {cpResult && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold flex items-start justify-between gap-3 ${
            cpResult.tone === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : cpResult.tone === 'bad'
                ? 'bg-red-50 border-red-300 text-red-800'
                : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <span>{cpResult.text}</span>
          <button type="button" onClick={() => setCpResult(null)} className="opacity-60 hover:opacity-100">Close</button>
        </div>
      )}

      {/* Summary cards */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: <Activity className="w-4 h-4" />, label: 'Events today', value: data.stats.today, tone: 'text-[#070E5C]' },
            {
              icon: <LogIn className="w-4 h-4" />,
              label: 'Failed sign-ins (24 h)',
              value: data.stats.failedSignIns24h,
              tone: data.stats.failedSignIns24h ? 'text-amber-700' : 'text-[#070E5C]',
            },
            {
              icon: <AlertTriangle className="w-4 h-4" />,
              label: 'Security alerts (7 days)',
              value: data.stats.securityAlerts7d,
              tone: data.stats.securityAlerts7d ? 'text-red-700' : 'text-[#070E5C]',
            },
            {
              icon: <Database className="w-4 h-4" />,
              label: `Entries kept (max ${data.retention.toLocaleString('en-IN')})`,
              value: data.stats.total,
              tone: 'text-[#070E5C]',
            },
          ].map((c) => (
            <div key={c.label} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <span className="p-1.5 rounded-lg bg-slate-50 text-slate-600">{c.icon}</span>
                {c.label}
              </div>
              <div className={`text-2xl font-bold mt-2 ${c.tone}`}>{c.value.toLocaleString('en-IN')}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search event, user, IP, resource…"
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#070E5C]"
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={select} aria-label="Category">
          <option value="">All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select value={severity} onChange={(e) => setSeverity(e.target.value)} className={select} aria-label="Severity">
          <option value="">All severities</option>
          {SEVERITIES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
        <select value={actor} onChange={(e) => setActor(e.target.value)} className={select} aria-label="User">
          <option value="">All users</option>
          {data?.actors.map((a) => <option key={a}>{a}</option>)}
        </select>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className={select} aria-label="From date" />
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className={select} aria-label="To date" />
        {filtersOn && (
          <button type="button" onClick={reset} className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100">
            <RotateCcw className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 min-w-[860px]">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b">
              <tr>
                <th className="py-3 px-4 w-8" />
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">IP address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.items.map((l) => {
                const isOpen = open === l.id;
                return (
                  <React.Fragment key={l.id}>
                    <tr
                      onClick={() => setOpen(isOpen ? null : l.id)}
                      className={`cursor-pointer transition-colors duration-1000 ${fresh.has(l.id) ? 'bg-emerald-50' : 'hover:bg-slate-50'}`}
                    >
                      <td className="py-3 px-4 text-slate-400">
                        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="text-slate-800">{fmt(l.timestamp)}</div>
                        <div className="text-[10px] text-slate-400">{ago(l.timestamp, now)}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{l.summary || l.action}</div>
                        <div className="text-[10px] font-mono text-slate-400">{l.action}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${CAT_STYLE[l.category || 'System'] || CAT_STYLE.System}`}>
                          {l.category}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase ${SEV_STYLE[l.severity || 'info']}`}>
                          {l.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{l.userEmail || '—'}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">
                        {l.ip || (l.legacy ? <span className="font-sans text-slate-400">{legacyNote}</span> : '—')}
                      </td>
                    </tr>
                    {isOpen && (
                      <tr className="bg-slate-50/70">
                        <td />
                        <td colSpan={6} className="px-4 pb-4 pt-1">
                          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 text-[11px]">
                            {[
                              ['Resource', [l.resourceType, l.resourceId].filter(Boolean).join(' · ') || '—'],
                              ['Outcome', l.outcome || '—'],
                              ['Details', l.details || '—'],
                              ['Browser', browserName(l.userAgent) || (l.legacy ? legacyNote : '—')],
                              ['Entry ID', l.id],
                              ['Recorded', l.legacy ? `Before detailed logging began${detailedSince ? ` (${detailedSince})` : ''}: IP and browser were not stored` : 'With IP address and browser'],
                            ].map(([k, v]) => (
                              <div key={k}>
                                <dt className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">{k}</dt>
                                <dd className="text-slate-700 break-all">{v}</dd>
                              </div>
                            ))}
                            <div className="sm:col-span-2 lg:col-span-3">
                              <dt className="text-slate-400 uppercase tracking-wider text-[10px] font-semibold">Hash chain</dt>
                              <dd className="font-mono text-[10px] text-slate-500 break-all">
                                {l.hash ? <>this {l.hash.slice(0, 24)}… ← previous {l.prevHash?.slice(0, 24)}…</> : 'Not sealed yet'}
                              </dd>
                            </div>
                          </dl>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
              {data && data.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">No events match these filters.</td>
                </tr>
              )}
              {!data && !error && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    Loading audit log…
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 text-xs text-slate-500">
            <span>
              Showing {data.items.length.toLocaleString('en-IN')} of {data.filteredTotal.toLocaleString('en-IN')} events
            </span>
            {data.items.length < data.filteredTotal && (
              <button
                type="button"
                onClick={() => setLimit((l) => l + PAGE)}
                disabled={loading}
                className="px-4 py-1.5 rounded-full border border-[#BBD6EA] text-[#070E5C] font-semibold hover:bg-[#EAF2F8] disabled:opacity-50"
              >
                Load more
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
