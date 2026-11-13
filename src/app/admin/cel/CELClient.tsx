'use client';

import React, { useEffect, useState } from 'react';
import { 
  FlaskConical, Plus, CheckCircle2, Archive, ArchiveRestore, X, 
  Settings2, RefreshCw, Edit3, Loader2 
} from 'lucide-react';
import { 
  addCELServiceAction, 
  updateCELServiceAction, 
  deleteCELServiceAction 
} from '@/app/admin/actions/cms';
import { useRouter } from 'next/navigation';

interface CELService {
  id: string;
  category: string;
  title: string;
  description: string;
  parameters: string[];
  status?: string;
  archiveRemark?: string;
  archivedAt?: string;
}

interface CELClientProps {
  initialServices: CELService[];
}

export default function CELClient({ initialServices }: CELClientProps) {
  const router = useRouter();
  const [services, setServices] = useState<CELService[]>(initialServices);
  useEffect(() => { setServices(initialServices); }, [initialServices]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<CELService | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [category, setCategory] = useState('WATER');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [parametersText, setParametersText] = useState('');

  // Archive Remark Modal State
  const [archiveModalTarget, setArchiveModalTarget] = useState<CELService | null>(null);
  const [archiveRemark, setArchiveRemark] = useState('');

  const openAddModal = () => {
    setEditingService(null);
    setCategory('WATER');
    setTitle('');
    setDescription('');
    setParametersText('');
    setIsModalOpen(true);
  };

  const openEditModal = (service: CELService) => {
    setEditingService(service);
    setCategory(service.category?.toUpperCase() || 'WATER');
    setTitle(service.title || '');
    setDescription(service.description || '');
    setParametersText(service.parameters ? service.parameters.join('\n') : '');
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter the service name.');
      return;
    }

    const parameters = parametersText
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    // Only what the admin typed: no placeholder parameters are added.
    const paramsPayload = parameters;

    setLoading(true);
    try {
      if (editingService) {
        // Update existing CEL parameter
        const res = await updateCELServiceAction(editingService.id, {
          category,
          title,
          description,
          parameters: paramsPayload,
        });

        if (res.success && res.service) {
          setServices(
            services.map((s) => (s.id === editingService.id ? { ...s, ...res.service } : s))
          );
          setIsModalOpen(false);
          router.refresh();
        } else {
          alert(res.error || 'Failed to update service');
        }
      } else {
        // Add new CEL parameter
        const res = await addCELServiceAction({
          category,
          title,
          description,
          parameters: paramsPayload,
        });

        if (res.success && res.service) {
          setServices([...services, res.service]);
          setIsModalOpen(false);
          router.refresh();
        }
      }
    } catch (err: any) {
      alert(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archiveModalTarget) return;
    setLoading(true);
    try {
      const res = await deleteCELServiceAction(archiveModalTarget.id, archiveRemark);
      if (res.success) {
        setServices(
          services.map((s: any) =>
            s.id === archiveModalTarget.id
              ? { ...s, status: 'archived', archiveRemark, archivedAt: new Date().toISOString() }
              : s
          )
        );
        setArchiveModalTarget(null);
        setArchiveRemark('');
        router.refresh();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to archive service');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: string) => {
    if (!confirm('Restore this testing service to published status?')) return;
    setLoading(true);
    try {
      const res = await deleteCELServiceAction(id);
      if (res.success) {
        setServices(
          services.map((s: any) => (s.id === id ? { ...s, status: 'published', archiveRemark: undefined } : s))
        );
        router.refresh();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to restore');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveClick = (service: CELService) => {
    if ((service as any).status === 'archived') {
      handleRestore(service.id);
    } else {
      setArchiveModalTarget(service);
      setArchiveRemark('');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header bar */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-[#EAF2F8] px-2.5 py-0.5 rounded border border-[#BBD6EA]">
              Laboratory CMS
            </span>
            <span className="text-xs text-slate-300">&bull;</span>
            <span className="text-xs text-[#6B7280] font-medium">IIT Madras Research Park Facility</span>
          </div>
          <h1 className="text-2xl font-serif text-[#24272B] mt-1">
            CUBE Environmental Laboratory (CEL) Services
          </h1>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-full bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BBD6EA] font-semibold text-xs flex items-center space-x-2 shadow-2xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testing Parameter</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((service) => (
          <div 
            key={service.id} 
            className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs flex flex-col justify-between group hover:shadow-md transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EAF2F8] text-[#070E5C] border border-[#BBD6EA]">
                  {service.category}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    (service as any).status === 'archived'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  }`}>
                    {(service as any).status === 'archived' ? 'Archived' : 'Active'}
                  </span>
                  
                  {/* Edit Option */}
                  <button
                    onClick={() => openEditModal(service)}
                    className="p-1 rounded-lg hover:bg-[#EAF2F8] text-[#070E5C] hover:text-[#070E5C] transition"
                    title="Edit Laboratory Service & Parameters"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Archive Option */}
                  <button
                    onClick={() => handleArchiveClick(service)}
                    className="p-1 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-700 transition"
                    title={(service as any).status === 'archived' ? 'Restore Service' : 'Archive with Remark'}
                  >
                    {(service as any).status === 'archived' ? (
                      <ArchiveRestore className="w-3.5 h-3.5" />
                    ) : (
                      <Archive className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <h3 className="text-base font-serif font-bold text-[#24272B]">{service.title}</h3>
              <p className="text-xs text-[#6B7280] mt-2 leading-relaxed">{service.description}</p>

              {service.parameters && service.parameters.length > 0 && (
                <div className="mt-4 pt-3 border-t border-[#E5E7EB] space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Tested Parameters:
                  </div>
                  {service.parameters.map((p: string, i: number) => (
                    <div key={i} className="flex items-center text-xs text-[#4A5568]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#070E5C] mr-1.5 shrink-0" />
                      <span className="truncate">{p}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Archive Remark Preview */}
              {(service as any).archiveRemark && ['archived', 'Archive'].includes((service as any).status) && (
                <div className="mt-4 p-2.5 rounded-xl bg-amber-50/60 border border-amber-200 text-[11px] text-amber-900">
                  <span className="font-bold text-[10px] uppercase text-amber-800 tracking-wider flex items-center gap-1">
                    <Archive className="w-3 h-3" /> Archive Remark
                  </span>
                  <p className="italic mt-0.5">&quot;{(service as any).archiveRemark}&quot;</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#E5E7EB] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
              <div>
                <h2 className="text-lg font-serif text-[#24272B]">
                  {editingService ? 'Edit CEL Testing Service & Parameters' : 'Add CEL Testing Service / Parameter'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Synchronizes with public CEL laboratory testing matrices in real time.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Testing Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#BBD6EA] outline-none bg-white text-xs"
                >
                  <option value="WATER">WATER QUALITY</option>
                  <option value="WASTEWATER">WASTEWATER &amp; EFFLUENT</option>
                  <option value="SOLID WASTE">SOLID &amp; HAZARDOUS WASTE</option>
                  <option value="SPECIALIZED">SPECIALIZED INSTRUMENTATION</option>
                  <option value="AIR QUALITY">AIR &amp; EMISSIONS</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Service Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Heavy Metal Trace Analysis"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#BBD6EA] outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Description <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Shown on the card. Leave empty to show the general CEL service text."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] focus:ring-2 focus:ring-[#BBD6EA] outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Parameters List (One parameter per line)
                </label>
                <textarea
                  rows={4}
                  placeholder={`pH, Turbidity, TDS\nBiological Oxygen Demand (BOD)\nTotal Heavy Metals (Pb, Cd, Cr)`}
                  value={parametersText}
                  onChange={(e) => setParametersText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E7EB] font-mono text-[11px] focus:ring-2 focus:ring-[#BBD6EA] outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E5E7EB]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[#E5E7EB] text-[#4A5568] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-full bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BBD6EA] font-semibold shadow-2xs transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingService ? 'Update Service' : 'Save Parameter'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Remark Modal */}
      {archiveModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-800">
                  <Archive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Archive Laboratory Service</h3>
                  <p className="text-[11px] text-slate-400">Save audit remark before archiving</p>
                </div>
              </div>
              <button
                onClick={() => setArchiveModalTarget(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleArchiveSubmit} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                <span className="font-semibold line-clamp-1">{archiveModalTarget.title}</span> will be safely hidden from public laboratory testing menus without data loss.
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reason / Remark for Archiving <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Equipment undergoing annual calibration / testing protocol temporarily paused."
                  value={archiveRemark}
                  onChange={(e) => setArchiveRemark(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-200 outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setArchiveModalTarget(null)}
                  className="px-3.5 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs transition"
                >
                  {loading ? 'Archiving...' : 'Save Remark & Archive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
