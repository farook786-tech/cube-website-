'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, CheckCircle2, Loader2, FileText, Download } from 'lucide-react';
import { submitEnquiryAction } from '@/app/actions/enquiries';

interface DocumentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentTitle: string;
  documentAuthor?: string;
}

export default function DocumentRequestModal({
  isOpen,
  onClose,
  documentTitle,
  documentAuthor,
}: DocumentRequestModalProps) {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    purpose: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await submitEnquiryAction({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      organization: formData.organization,
      category: 'Technical Document Request',
      subject: `Document Request: ${documentTitle}`,
      message: `Request for Technical Document: "${documentTitle}"${documentAuthor ? ` by ${documentAuthor}` : ''}.\n\nPurpose / Project Details: ${formData.purpose || 'Official institutional enquiry'}`,
      sourcePage: '/media#publications',
    });

    if (res.success) {
      setSubmitted(true);
      setLoading(false);
    } else {
      setErrorMsg(res.error || 'Failed to submit document request.');
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setSubmitted(false);
    setLoading(false);
    setErrorMsg(null);
    setFormData({ name: '', email: '', phone: '', organization: '', purpose: '' });
    onClose();
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/60"
      onClick={resetAndClose}
    >
      <div 
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={resetAndClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-serif text-[#070E5C] mb-2">
              Request Received Successfully
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto mb-6">
              Thank you for your interest in <span className="font-semibold text-[#070E5C]">&ldquo;{documentTitle}&rdquo;</span>. Our technical research desk will dispatch the document copy to your registered official email address.
            </p>
            <button
              onClick={resetAndClose}
              className="px-6 py-2.5 rounded-full bg-[#070E5C] text-white text-xs font-semibold hover:bg-[#070E5C]/90 transition cursor-pointer"
            >
              Done
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4 pr-8">
              <div className="w-10 h-10 rounded-2xl bg-[#EAF2F8] border border-[#BDD7E8] text-[#070E5C] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-[#D99A42]" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D99A42]">Official Request</span>
                <h3 className="font-serif font-bold text-lg text-[#070E5C] leading-tight">Request Technical Document</h3>
              </div>
            </div>

            <div className="bg-[#F6FAFD] cube-glass p-3.5 rounded-2xl border border-[#BDD7E8]/70 mb-5 text-xs">
              <p className="font-semibold text-[#070E5C] line-clamp-2">{documentTitle}</p>
              {documentAuthor && (
                <p className="text-[11px] text-slate-500 mt-1">{documentAuthor}</p>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 text-xs rounded-xl bg-red-50 text-red-700 border border-red-200">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Your Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#070E5C] focus:ring-1 focus:ring-[#070E5C]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Official Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="name@dept.gov.in"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#070E5C] focus:ring-1 focus:ring-[#070E5C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Phone / Mobile <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#070E5C] focus:ring-1 focus:ring-[#070E5C]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Organization / Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                    placeholder="CMDA / GCC / Dept / Firm"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#070E5C] focus:ring-1 focus:ring-[#070E5C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Purpose / Intended Application (Optional)
                </label>
                <textarea
                  rows={2}
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="e.g., Reference for urban drainage DPR, academic research, quality audit study..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#070E5C] focus:ring-1 focus:ring-[#070E5C] resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={resetAndClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#070E5C] text-white text-xs font-semibold hover:bg-[#070E5C]/90 transition flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
