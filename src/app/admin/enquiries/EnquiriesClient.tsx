'use client';

import React, { useEffect, useState } from 'react';
import { 
  Mail, MessageSquare, Phone, Building2, Calendar, 
  CheckCircle2, Archive, ArchiveRestore, ExternalLink, Filter, Search,
  Inbox, Sparkles, Send, RefreshCw, X
} from 'lucide-react';
import { markEnquiryAsReadAction, deleteEnquiryAction } from '@/app/actions/enquiries';

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone?: string;
  organization?: string;
  category: string;
  subject?: string;
  message: string;
  sourcePage?: string;
  isRead: boolean;
  timestamp: string;
  status?: string;
  archiveRemark?: string;
  archivedAt?: string;
}

interface EnquiriesClientProps {
  initialEnquiries: Enquiry[];
}

export default function EnquiriesClient({ initialEnquiries }: EnquiriesClientProps) {
  const [enquiries, setEnquiries] = useState<Enquiry[]>(initialEnquiries);
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(
    initialEnquiries.length > 0 ? initialEnquiries[0] : null
  );
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Keep the inbox in sync with server refreshes (new public form submissions).
  useEffect(() => {
    setEnquiries(initialEnquiries);
    setSelectedEnquiry((current) => {
      if (!current) return initialEnquiries[0] || null;
      return initialEnquiries.find((item) => item.id === current.id) || initialEnquiries[0] || null;
    });
  }, [initialEnquiries]);

  const filtered = enquiries.filter((e) => {
    const matchesFilter = filterCategory === 'ALL' || e.category === filterCategory;
    const matchesSearch =
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.organization && e.organization.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const unreadCount = enquiries.filter((e) => !e.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    setIsProcessing(true);
    await markEnquiryAsReadAction(id);
    setEnquiries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isRead: true } : e))
    );
    if (selectedEnquiry?.id === id) {
      setSelectedEnquiry((prev) => (prev ? { ...prev, isRead: true } : null));
    }
    setIsProcessing(false);
  };

  const [archiveModalTarget, setArchiveModalTarget] = useState<string | null>(null);
  const [archiveRemark, setArchiveRemark] = useState('');

  const handleArchiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archiveModalTarget) return;
    setIsProcessing(true);
    await deleteEnquiryAction(archiveModalTarget, archiveRemark);
    setEnquiries((prev) =>
      prev.map((item) =>
        item.id === archiveModalTarget
          ? { ...item, status: 'archived', archiveRemark, archivedAt: new Date().toISOString() }
          : item
      )
    );
    if (selectedEnquiry?.id === archiveModalTarget) {
      setSelectedEnquiry((prev) => (prev ? { ...prev, status: 'archived', archiveRemark } : null));
    }
    setArchiveModalTarget(null);
    setArchiveRemark('');
    setIsProcessing(false);
  };

  const handleRestore = async (id: string) => {
    if (!confirm('Restore this enquiry back to active status?')) return;
    setIsProcessing(true);
    await deleteEnquiryAction(id);
    setEnquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'active', archiveRemark: undefined } : item))
    );
    if (selectedEnquiry?.id === id) {
      setSelectedEnquiry((prev) => (prev ? { ...prev, status: 'active', archiveRemark: undefined } : null));
    }
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#EAF2F8] text-[#070E5C] border border-[#BBD6EA]">
              <Inbox className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-serif text-[#24272B]">
                Real-Time Enquiries &amp; Laboratory Booking Desk
              </h1>
              <p className="text-xs text-[#6B7280] mt-0.5">
                Live queries delivered from public portal forms directly to CUBE operations (
                <span className="font-semibold text-[#070E5C]">office@cubeiitm.org</span>)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full bg-[#EAF2F8] border border-[#BBD6EA] text-xs">
            <span className="text-[#4A5568]">Unread Queries:</span>{' '}
            <span className="font-bold text-[#070E5C] ml-1 bg-white border border-[#BBD6EA] px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          </div>
          <div className="px-4 py-2 rounded-full bg-[#F7F7F4] border border-[#E5E7EB] text-xs text-[#4A5568] font-semibold">
            Total: {enquiries.length}
          </div>
        </div>
      </div>

      {/* Main Workspace: List + Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filter & List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-2xs space-y-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, email, organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#E5E7EB] text-xs focus:ring-2 focus:ring-[#BBD6EA] outline-none"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {['ALL', 'Technical Enquiry', 'CEL Laboratory Test', 'CEL Testing Request'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors border ${
                    filterCategory === cat
                      ? 'bg-[#EAF2F8] text-[#070E5C] border-[#BBD6EA] font-semibold'
                      : 'bg-[#F7F7F4] text-[#4A5568] border-[#E5E7EB] hover:bg-white'
                  }`}
                >
                  {cat === 'ALL' ? 'All Messages' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Enquiry Cards */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filtered.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-dashed border-[#E5E7EB] text-center text-slate-500 text-xs">
                No inquiries matching criteria found.
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = selectedEnquiry?.id === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedEnquiry(item);
                      if (!item.isRead) {
                        handleMarkAsRead(item.id);
                      }
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#F7F7F4] border-[#BBD6EA] ring-2 ring-[#BBD6EA]/40 shadow-sm'
                        : 'bg-white border-[#E5E7EB] hover:border-[#BBD6EA]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#D99A42] shrink-0" />
                        )}
                        <h4 className="text-xs font-bold text-[#24272B] line-clamp-1">
                          {item.name}
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {new Date(item.timestamp).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#6B7280] mt-1 line-clamp-1">
                      {item.organization ? `${item.organization} • ` : ''}
                      {item.email}
                    </div>

                    <p className="text-xs text-[#4A5568] line-clamp-2 mt-2">
                      {item.message}
                    </p>

                    <div className="mt-3 flex items-center justify-between text-[10px]">
                      <span className="px-2 py-0.5 rounded-md bg-[#EAF2F8] text-[#070E5C] font-semibold border border-[#BBD6EA]">
                        {item.category}
                      </span>
                      {item.phone && item.phone !== 'N/A' && (
                        <span className="text-slate-400 font-mono">{item.phone}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Detailed Reader (7 cols) */}
        <div className="lg:col-span-7">
          {selectedEnquiry ? (
            <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-2xs p-6 space-y-6">
              {/* Header Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-[#E5E7EB]">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EAF2F8] text-[#070E5C] border border-[#BBD6EA]">
                    {selectedEnquiry.category}
                  </span>
                  <span className="text-xs text-slate-400">
                    Source: <code className="text-[#070E5C] font-semibold">{selectedEnquiry.sourcePage || '/contact'}</code>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {!selectedEnquiry.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(selectedEnquiry.id)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 text-xs font-medium rounded-full border border-emerald-300 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Read
                    </button>
                  )}
                  {selectedEnquiry.status === 'archived' ? (
                    <button
                      onClick={() => handleRestore(selectedEnquiry.id)}
                      disabled={isProcessing}
                      className="px-3 py-1.5 text-xs font-medium rounded-full border border-teal-300 text-teal-800 bg-teal-50 hover:bg-teal-100 transition-colors flex items-center gap-1.5"
                      title="Restore to Active"
                    >
                      <ArchiveRestore className="w-3.5 h-3.5" />
                      Restore Enquiry
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setArchiveModalTarget(selectedEnquiry.id);
                        setArchiveRemark('');
                      }}
                      disabled={isProcessing}
                      className="px-3 py-1.5 text-xs font-medium rounded-full border border-amber-300 text-amber-800 bg-amber-50 hover:bg-amber-100 transition-colors flex items-center gap-1.5"
                      title="Archive Enquiry Record"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      Archive Enquiry
                    </button>
                  )}
                </div>
              </div>

              {/* Sender Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#F7F7F4] p-4 rounded-xl border border-[#E5E7EB]">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Sender Name
                  </div>
                  <div className="text-sm font-semibold text-[#24272B] mt-0.5">
                    {selectedEnquiry.name}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Organization / Entity
                  </div>
                  <div className="text-sm font-semibold text-[#4A5568] mt-0.5">
                    {selectedEnquiry.organization || 'Individual Citizen / Client'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Email Address
                  </div>
                  <a
                    href={`mailto:${selectedEnquiry.email}?subject=RE: ${encodeURIComponent(selectedEnquiry.subject || selectedEnquiry.category)}&body=Dear ${encodeURIComponent(selectedEnquiry.name)},%0D%0A%0D%0AThank you for reaching out to CUBE (Centre for Urbanization, Buildings & Environment).`}
                    className="text-xs font-semibold text-[#070E5C] hover:text-[#D99A42] flex items-center gap-1 mt-0.5"
                  >
                    <Mail className="w-3.5 h-3.5 text-[#D99A42]" />
                    {selectedEnquiry.email}
                  </a>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                    Phone / Contact No
                  </div>
                  <div className="text-xs font-semibold text-[#4A5568] flex items-center gap-1 mt-0.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-[#D99A42]" />
                    {selectedEnquiry.phone || 'Not provided'}
                  </div>
                </div>
              </div>

              {/* Timestamp & Subject */}
              <div>
                <div className="text-[11px] text-slate-400">
                  Received on{' '}
                  <span className="font-semibold text-[#4A5568]">
                    {new Date(selectedEnquiry.timestamp).toLocaleString('en-IN', {
                      dateStyle: 'full',
                      timeStyle: 'medium',
                    })}
                  </span>
                </div>
                {selectedEnquiry.subject && (
                  <h3 className="text-base font-serif font-bold text-[#24272B] mt-2">
                    {selectedEnquiry.subject}
                  </h3>
                )}
              </div>

              {/* Optional Archive Remark Banner */}
              {selectedEnquiry.archiveRemark && ['archived', 'Archive'].includes(selectedEnquiry.status ?? '') && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <div className="font-bold flex items-center gap-1.5 uppercase text-[10px] tracking-wider text-amber-800">
                    <Archive className="w-3.5 h-3.5" />
                    Archive Remark
                  </div>
                  <p className="mt-1 font-medium italic">&quot;{selectedEnquiry.archiveRemark}&quot;</p>
                  {selectedEnquiry.archivedAt && (
                    <div className="text-[10px] text-amber-700 mt-1">
                      Archived on: {new Date(selectedEnquiry.archivedAt).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              )}

              {/* Message Body */}
              <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] min-h-[160px]">
                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                  Query Content / Specifications
                </div>
                <p className="text-sm text-[#24272B] leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedEnquiry.message}
                </p>
              </div>

              {/* Action Buttons: Reply directly to sender */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                <a
                  href={`mailto:${selectedEnquiry.email}?cc=office@cubeiitm.org&subject=Response: ${encodeURIComponent(selectedEnquiry.subject || selectedEnquiry.category)}&body=Dear ${encodeURIComponent(selectedEnquiry.name)},%0D%0A%0D%0AReferring to your inquiry submitted via CUBE portal:%0D%0A%0D%0A`}
                  className="px-5 py-2.5 rounded-full bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BBD6EA] font-semibold text-xs flex items-center gap-2 transition-all shadow-2xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Reply via Official CUBE Mail (office@cubeiitm.org)
                </a>

                <div className="text-[11px] text-slate-400">
                  Stored securely in CUBE persistent CMS datastore.
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-[#E5E7EB] p-12 text-center text-slate-400">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Select an inquiry from the list to view its complete specifications and respond.
            </div>
          )}
        </div>
      </div>

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
                  <h3 className="text-sm font-bold text-slate-800">Archive Enquiry Record</h3>
                  <p className="text-[11px] text-slate-400">Add an audit remark before archiving</p>
                </div>
              </div>
              <button
                onClick={() => setArchiveModalTarget(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleArchiveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reason / Remark for Archiving <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Completed resolution via phone call; client informed."
                  value={archiveRemark}
                  onChange={(e) => setArchiveRemark(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-200 outline-none text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setArchiveModalTarget(null)}
                  className="px-3 py-1.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs"
                >
                  {isProcessing ? 'Archiving...' : 'Save Remark & Archive'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
