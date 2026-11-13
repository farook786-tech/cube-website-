'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  KeyRound, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Users, Server, LogOut, Loader2, UserCircle2, Globe,
} from 'lucide-react';
import { useCmsUpdates } from '@/lib/live';
import { revokeOtherSessionsAction } from '@/app/admin/actions/auth';
import ChangePasswordForm from './ChangePasswordForm';

interface Status {
  account: { email: string; fullName: string; role: string; lastSignIn: string | null; lastSignInIp: string | null; currentSignIn: string | null };
  checks: { id: string; label: string; status: 'ok' | 'warning' | 'critical'; detail: string }[];
  users: { name: string; email: string; role: string; active: boolean; lastSignIn: string | null }[];
  system: {
    appVersion: string;
    storage: string;
    dataFileSize: number;
    lastSavedAt: string | null;
    uptimeSeconds: number;
    nodeVersion: string;
    serverTime: string;
    liveUpdates: string;
    publishing: string;
    lastPublishedAt: string | null;
    content: Record<string, number>;
  };
}

const ROLE: Record<string, string> = { super_admin: 'Super admin', admin: 'Admin', editor: 'Editor', viewer: 'Viewer' };
const STORAGE: Record<string, string> = {
  file: 'JSON file on this server (data-store/)',
  supabase: 'Supabase PostgreSQL',
  published: 'Read-only published copy',
};
const PUBLISHING: Record<string, string> = {
  disabled: 'Not used (website and admin share one server)',
  idle: 'Up to date',
  pending: 'Changes waiting to publish',
  publishing: 'Publishing…',
  published: 'Published',
  failed: 'Last publish failed',
  blocked: 'Paused: live site has newer content',
};

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

function ago(iso: string | null, now: number) {
  if (!iso) return '—';
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return `${Math.floor(s / 86400)} d ago`;
}

function duration(sec: number) {
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return d ? `${d} d ${h} h` : h ? `${h} h ${m} min` : `${m} min`;
}

const card = 'bg-white p-6 rounded-2xl border border-slate-200 shadow-sm';
const h2 = 'text-sm font-bold text-[#24272B] flex items-center mb-4';

export default function SettingsClient() {
  const [status, setStatus] = useState<Status | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number>(0);
  const [now, setNow] = useState(() => Date.now());
  const [revoking, setRevoking] = useState(false);
  const [revokeMsg, setRevokeMsg] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/system-status', { cache: 'no-store' });
      if (res.ok) {
        setStatus(await res.json());
        setUpdatedAt(Date.now());
      }
    } catch {}
  }, []);

  useEffect(() => {
    load();
    const poll = setInterval(load, 5000);
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearInterval(poll);
      clearInterval(clock);
    };
  }, [load]);
  useCmsUpdates(load);

  const revoke = async () => {
    if (!window.confirm('Sign out every other device where this account is signed in? This browser stays signed in.')) return;
    setRevoking(true);
    setRevokeMsg('');
    const res = await revokeOtherSessionsAction();
    setRevoking(false);
    setRevokeMsg(res.success ? 'All other devices have been signed out.' : res.error || 'Could not sign out other devices.');
    load();
  };

  const issues = status?.checks.filter((c) => c.status !== 'ok') || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className={`${card} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div>
          <h1 className="text-2xl font-bold font-display text-[#24272B]">CMS Settings</h1>
          <p className="text-xs text-slate-500 mt-1">Your account, security status, admin accounts and system health. This page updates automatically.</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 self-start sm:self-auto">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          Live · {updatedAt ? ago(new Date(updatedAt).toISOString(), now) : 'loading'}
        </span>
      </div>

      {!status && (
        <div className={`${card} text-xs text-slate-400 flex items-center`}>
          <Loader2 className="w-4 h-4 animate-spin mr-2" /> Loading settings…
        </div>
      )}

      {status && (
        <>
          {/* Security summary */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3 text-xs ${
              issues.some((i) => i.status === 'critical')
                ? 'bg-red-50 border-red-200 text-red-800'
                : issues.length
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {issues.length ? <ShieldAlert className="w-5 h-5 shrink-0" /> : <ShieldCheck className="w-5 h-5 shrink-0" />}
            <div>
              <div className="font-bold">
                {issues.length ? `${issues.length} security item(s) need attention` : 'All security checks passed'}
              </div>
              {issues.length > 0 && (
                <ul className="mt-1 space-y-0.5">
                  {issues.map((i) => (
                    <li key={i.id}>• {i.label}: {i.detail}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Account */}
          <div className={card}>
            <h2 className={h2}>
              <UserCircle2 className="w-4 h-4 text-[#070E5C] mr-2" /> Your Account
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs mb-6">
              {[
                ['Signed in as', status.account.email],
                ['Role', ROLE[status.account.role] || status.account.role],
                ['This sign-in', fmt(status.account.currentSignIn)],
                ['Previous sign-in', status.account.lastSignIn ? `${fmt(status.account.lastSignIn)}${status.account.lastSignInIp ? ` · ${status.account.lastSignInIp}` : ''}` : '—'],
              ].map(([k, v]) => (
                <div key={k} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">{k}</div>
                  <div className="font-semibold text-slate-800 mt-1 break-all">{v}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-bold text-slate-700 flex items-center mb-3">
                  <KeyRound className="w-3.5 h-3.5 mr-1.5 text-[#070E5C]" /> Change password
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">At least 12 characters. Changing it signs out every other device.</p>
                <ChangePasswordForm />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-700 flex items-center mb-3">
                  <LogOut className="w-3.5 h-3.5 mr-1.5 text-[#070E5C]" /> Sessions
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  Used the admin on a shared or lost device? Sign it out remotely. This browser stays signed in. Sessions also end
                  after 8 hours or when the browser closes.
                </p>
                <button
                  type="button"
                  onClick={revoke}
                  disabled={revoking}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#070E5C] hover:bg-[#D99A42] disabled:opacity-50"
                >
                  {revoking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
                  Sign out all other devices
                </button>
                {revokeMsg && <p className="text-[11px] text-emerald-700 mt-2">{revokeMsg}</p>}
              </div>
            </div>
          </div>

          {/* Security checks */}
          <div className={card}>
            <h2 className={h2}>
              <ShieldCheck className="w-4 h-4 text-[#070E5C] mr-2" /> Security Checks
            </h2>
            <ul className="divide-y divide-slate-100">
              {status.checks.map((c) => (
                <li key={c.id} className="py-3 flex items-start gap-3 text-xs">
                  {c.status === 'ok' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${c.status === 'critical' ? 'text-red-600' : 'text-amber-600'}`} />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800">{c.label}</div>
                    <div className="text-slate-500 mt-0.5">{c.detail}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      c.status === 'ok'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : c.status === 'critical'
                          ? 'bg-red-50 text-red-700 border-red-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {c.status === 'ok' ? 'OK' : c.status === 'critical' ? 'Action needed' : 'Check'}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Admin accounts */}
          <div className={card}>
            <h2 className={h2}>
              <Users className="w-4 h-4 text-[#070E5C] mr-2" /> Admin Accounts
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[520px]">
                <thead className="text-[10px] uppercase tracking-wider text-slate-400 border-b">
                  <tr>
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Email</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Last sign-in</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {status.users.map((u) => (
                    <tr key={u.email}>
                      <td className="py-2.5 pr-4 font-semibold text-slate-800">{u.name}</td>
                      <td className="py-2.5 pr-4 text-slate-600">{u.email}</td>
                      <td className="py-2.5 pr-4">{ROLE[u.role] || u.role}</td>
                      <td className="py-2.5 pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${u.active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {u.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="py-2.5 text-slate-600">{u.lastSignIn ? `${fmt(u.lastSignIn)} (${ago(u.lastSignIn, now)})` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* System */}
          <div className={card}>
            <h2 className={h2}>
              <Server className="w-4 h-4 text-[#070E5C] mr-2" /> System Status
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 text-xs">
              {[
                ['Content storage', STORAGE[status.system.storage] || status.system.storage],
                ['Data size', `${(status.system.dataFileSize / 1048576).toFixed(2)} MB`],
                ['Last saved', `${fmt(status.system.lastSavedAt)} (${ago(status.system.lastSavedAt, now)})`],
                ['Live updates', status.system.liveUpdates],
                ['Publishing to live site', PUBLISHING[status.system.publishing] || status.system.publishing],
                ['Last published', status.system.lastPublishedAt ? `${fmt(status.system.lastPublishedAt)}` : '—'],
                ['Server running for', duration(status.system.uptimeSeconds)],
                ['Server time', fmt(status.system.serverTime)],
                ['App version', `v${status.system.appVersion} · Node ${status.system.nodeVersion}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-2 border-b border-slate-100">
                  <span className="text-slate-500">{k}</span>
                  <span className="font-semibold text-slate-800 text-right">{v}</span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 mt-5">
              {Object.entries({
                Projects: status.system.content.projects,
                News: status.system.content.news,
                Team: status.system.content.team,
                Tenders: status.system.content.tenders,
                Jobs: status.system.content.careers,
                Enquiries: status.system.content.enquiries,
                Applications: status.system.content.applications,
              }).map(([k, v]) => (
                <div key={k} className="p-3 rounded-xl bg-[#F6FAFD] border border-[#BDD7E8] text-center">
                  <div className="text-lg font-bold text-[#070E5C]">{v}</div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{k}</div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-amber-700 mt-5 leading-relaxed">
              Back up the <code>data-store/</code> and <code>public/uploads/</code> folders regularly (the deployment kit
              includes a nightly backup script). Nothing is deleted from the admin; items are archived.
            </p>
          </div>

          {/* Identity */}
          <div className={card}>
            <h2 className={h2}>
              <Globe className="w-4 h-4 text-[#070E5C] mr-2" /> Organisation
            </h2>
            <div className="text-xs space-y-2">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Organisation</span>
                <span className="font-semibold text-slate-800 text-right">Centre for Urbanization, Buildings &amp; Environment (CUBE)</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Established by</span>
                <span className="font-semibold text-slate-800 text-right">IIT Madras &amp; Government of Tamil Nadu</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
