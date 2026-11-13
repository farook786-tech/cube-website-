'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, AlertTriangle, Clock, UploadCloud } from 'lucide-react';

type State = 'disabled' | 'idle' | 'pending' | 'publishing' | 'published' | 'failed' | 'blocked';
interface Status {
  state: State;
  lastPublishedAt?: string;
  lastCommit?: string;
  error?: string;
}

const time = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';

/**
 * Shows whether the live website has the latest admin changes. Saving in the
 * admin publishes automatically (~15 s later); Vercel then rebuilds the live
 * site, which takes about 1-2 minutes.
 */
export default function PublishStatus({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/publish', { cache: 'no-store' });
      if (res.ok) setStatus(await res.json());
    } catch {}
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [load]);

  const publish = async (force = false) => {
    if (
      force &&
      !window.confirm(
        'Replace the content on the live website with the content on this computer?\n\nOnly continue if this computer has the latest content. Anything published from another computer will be replaced.'
      )
    )
      return;
    setBusy(true);
    try {
      const res = await fetch('/api/admin/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force }),
      });
      if (res.ok) setStatus(await res.json());
    } finally {
      setBusy(false);
    }
  };

  if (!status || status.state === 'disabled') return null;

  const s = busy ? 'publishing' : status.state;
  const view: Record<State, { cls: string; icon: React.ReactNode; text: string }> = {
    disabled: { cls: '', icon: null, text: '' },
    idle: { cls: 'text-slate-700 bg-slate-50 border-slate-200', icon: <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />, text: 'Live site: no new changes' },
    pending: { cls: 'text-amber-800 bg-amber-50 border-amber-200', icon: <Clock className="w-3.5 h-3.5" />, text: 'Changes will publish in a few seconds' },
    publishing: { cls: 'text-blue-800 bg-blue-50 border-blue-200', icon: <Loader2 className="w-3.5 h-3.5 animate-spin" />, text: 'Publishing to live site…' },
    published: {
      cls: 'text-emerald-800 bg-emerald-50 border-emerald-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      text: `Published ${time(status.lastPublishedAt)} · live in ~2 min`,
    },
    failed: { cls: 'text-red-800 bg-red-50 border-red-200', icon: <AlertTriangle className="w-3.5 h-3.5" />, text: 'Publishing failed' },
    blocked: {
      cls: 'text-amber-900 bg-amber-50 border-amber-300',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      text: 'Publishing paused: live site has newer content',
    },
  };
  const v = view[s];

  return (
    <div className="flex items-center gap-2" role="status" aria-live="polite">
      <span
        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${v.cls}`}
        title={status.state === 'failed' || status.state === 'blocked' ? status.error : status.lastCommit ? `GitHub commit ${status.lastCommit}` : undefined}
      >
        {v.icon}
        {!compact && <span>{v.text}</span>}
      </span>
      {(s === 'failed' || s === 'idle' || s === 'pending') && (
        <button
          type="button"
          onClick={() => publish()}
          className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-[#BBD6EA] text-[#070E5C] hover:bg-[#EAF2F8] flex items-center gap-1.5"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>{s === 'failed' ? 'Retry' : 'Publish now'}</span>
        </button>
      )}
      {s === 'blocked' && (
        <button
          type="button"
          onClick={() => publish(true)}
          title={status.error}
          className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 flex items-center gap-1.5"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Publish anyway</span>
        </button>
      )}
      {status.state === 'failed' && status.error && !compact && (
        <span className="text-[11px] text-red-700 max-w-xs truncate" title={status.error}>
          {status.error}
        </span>
      )}
    </div>
  );
}
