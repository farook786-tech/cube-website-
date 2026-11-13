'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageHeader from '@/components/common/PageHeader';
import ComboSelect from '@/components/admin/ComboSelect';
import {
  Briefcase, Send, CheckCircle2, Mail, MapPin,
  Upload, FileText, Sparkles, Building2, Users,
  Globe, Award, ChevronRight, Check, X, CalendarDays, Clock,
  GraduationCap, FlaskConical,
} from 'lucide-react';
import {
  CareersPageContent, CareerBenefitIcon, DEFAULT_CAREERS_PAGE,
} from '@/lib/careers-page';

const BENEFIT_ICONS: Record<CareerBenefitIcon, React.ElementType> = {
  award: Award,
  building: Building2,
  globe: Globe,
  briefcase: Briefcase,
  sparkles: Sparkles,
  users: Users,
  graduation: GraduationCap,
  flask: FlaskConical,
};

interface CareersHubProps {
  initialCareers: any[];
  content?: CareersPageContent;
}

const formatDate = (value?: string) => {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime())
    ? value
    : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const qualificationList = (job: any): string[] => {
  const q = job?.qualifications;
  if (Array.isArray(q)) return q.filter((x) => typeof x === 'string' && x.trim());
  if (typeof q === 'string') return q.split('\n').map((x) => x.trim()).filter(Boolean);
  return [];
};

export default function CareersHub({ initialCareers, content = DEFAULT_CAREERS_PAGE }: CareersHubProps) {
  const c = content;
  const form = c.applicationForm;

  const [activeTab, setActiveTab] = useState<'openings' | 'portal'>('openings');

  // Application form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [experience, setExperience] = useState(form.experienceOptions[0] || '');
  const [domain, setDomain] = useState(form.domainOptions[0] || '');
  const [jobTitle, setJobTitle] = useState(form.defaultJobTitle);
  // Dropdown choices: the general talent pool + every live opening (newest first,
  // as published by admin). ComboSelect removes duplicates and allows typing.
  const positionOptions = [
    form.defaultJobTitle,
    ...initialCareers.map((job) => job?.title).filter((t): t is string => typeof t === 'string' && t.trim() !== ''),
  ];
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Job detail modal
  const [detailJob, setDetailJob] = useState<any | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!detailJob) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDetailJob(null);
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [detailJob]);

  const handleApplyClick = (job: any) => {
    setDetailJob(null);
    setJobTitle(job.title);
    setSubmitSuccess(false);
    setActiveTab('portal');
    window.scrollTo({ top: 600, behavior: 'smooth' });
  };

  const openPortal = () => {
    setJobTitle(form.defaultJobTitle);
    setActiveTab('portal');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        alert('Resume file size cannot exceed 10MB.');
        return;
      }
      setResumeFile(file);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) {
      setSubmitError('Please fill in your full name and email address.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    try {
      const fd = new FormData();
      fd.append('fullName', fullName);
      fd.append('email', email);
      fd.append('phone', phone);
      fd.append('experience', experience);
      fd.append('domain', domain);
      fd.append('jobTitle', jobTitle);
      fd.append('coverLetter', coverLetter);
      if (resumeFile) {
        fd.append('resume', resumeFile);
      }

      const res = await fetch('/api/public/careers/apply', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSubmitSuccess(true);
        setFullName('');
        setEmail('');
        setPhone('');
        setCoverLetter('');
        setResumeFile(null);
      } else {
        setSubmitError(data.error || 'Failed to submit application. Please try again.');
      }
    } catch (err) {
      setSubmitError(`Network error while uploading resume. Please email ${c.contactEmail} directly.`);
    } finally {
      setSubmitting(false);
    }
  };

  const detailEmail = detailJob?.applicationEmail || c.contactEmail;
  const detailQualifications = detailJob ? qualificationList(detailJob) : [];

  const modal = (
    <AnimatePresence>
      {detailJob && (
        <motion.div
          key="job-detail-overlay"
          className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-6 bg-[#070E5C]/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setDetailJob(null)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-detail-title"
            className="relative w-full sm:max-w-2xl max-h-[92vh] sm:max-h-[88vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white border border-[#BDD7E8] shadow-[0_30px_80px_rgba(7,14,92,0.25)] overflow-hidden"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative shrink-0 px-6 sm:px-8 pt-7 pb-5 bg-gradient-to-b from-[#EAF2F8] to-white border-b border-[#E5E7EB]">
              <button
                onClick={() => setDetailJob(null)}
                aria-label="Close job details"
                className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white/90 border border-[#BDD7E8] text-[#070E5C] hover:bg-[#070E5C] hover:text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex flex-wrap items-center gap-2 pr-10">
                {detailJob.department && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white text-[#070E5C] border border-[#BDD7E8]">
                    {detailJob.department}
                  </span>
                )}
                {detailJob.employmentType && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {detailJob.employmentType}
                  </span>
                )}
              </div>

              <h2 id="job-detail-title" className="mt-3 text-xl sm:text-2xl font-bold font-serif text-[#070E5C] leading-tight">
                {detailJob.title}
              </h2>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#747B83] font-medium">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#D99A42]" />
                  {detailJob.location || 'Chennai'}
                </span>
                {detailJob.experience && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#D99A42]" />
                    {detailJob.experience}
                  </span>
                )}
                {detailJob.closingDate && (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-[#D99A42]" />
                    {`Apply by ${formatDate(detailJob.closingDate)}`}
                  </span>
                )}
              </div>
            </div>

            {/* Body (scrolls) */}
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-6 sm:px-8 py-6 space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#070E5C] mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#D99A42]" />
                  Details
                </h3>
                <p className="text-sm text-[#24272B]/85 leading-relaxed whitespace-pre-line">
                  {detailJob.description}
                </p>
              </div>

              {detailQualifications.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#070E5C] mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4 text-[#D99A42]" />
                    Desirable Skills
                  </h3>
                  <ul className="space-y-2">
                    {detailQualifications.map((q, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-[#24272B]/85 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-600" />
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {c.jobDetail.howToApplySteps.length > 0 && (
                <div className="rounded-2xl bg-[#F6FAFD] cube-glass border border-[#BDD7E8] p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#070E5C] mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D99A42]" />
                    {c.jobDetail.howToApplyTitle}
                  </h3>
                  <ol className="space-y-2 text-xs text-[#24272B]/85 leading-relaxed list-decimal list-inside">
                    {c.jobDetail.howToApplySteps.map((step, i) => (
                      <li key={i}>{step}</li>
                    ))}
                  </ol>
                  <p className="mt-3 text-xs text-[#747B83]">
                    Questions? Write to{' '}
                    <a
                      href={`mailto:${detailEmail}`}
                      className="font-semibold text-[#070E5C] hover:text-[#D99A42] underline underline-offset-2"
                    >
                      {detailEmail}
                    </a>
                  </p>
                </div>
              )}
            </div>

            {/* Footer actions (always visible) */}
            <div className="shrink-0 px-6 sm:px-8 py-4 border-t border-[#E5E7EB] bg-white flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3">
              <a
                href={`mailto:${detailEmail}?subject=${encodeURIComponent(`Application: ${detailJob.title}`)}`}
                className="px-5 py-3 rounded-full bg-white border border-[#BDD7E8] text-[#070E5C] hover:bg-[#EAF2F8] text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Mail className="w-3.5 h-3.5 text-[#D99A42]" />
                Email Application
              </a>
              <button
                onClick={() => handleApplyClick(detailJob)}
                className="px-7 py-3 rounded-full bg-[#070E5C] hover:bg-[#D99A42] text-white text-xs font-bold tracking-wider uppercase transition shadow-md flex items-center justify-center gap-2 active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                Apply
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="bg-[#FFFFFF] text-[#24272B] min-h-screen">
      <PageHeader
        badge={c.header.badge}
        title={c.header.title}
        description={c.header.description}
        breadcrumbs={[{ label: 'Careers' }]}
      />

      {/* Interactive Hub Navigation Tabs */}
      <section className="py-8 bg-gradient-to-b from-[#FFFFFF] to-[#F6FAFD] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4">

            <div className="inline-flex flex-wrap p-1.5 rounded-full bg-white/80 backdrop-blur-xl border border-[#BDD7E8] shadow-xs">
              <button
                onClick={() => setActiveTab('openings')}
                className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'openings'
                    ? 'bg-[#070E5C] text-white shadow-md'
                    : 'text-[#24272B] hover:text-[#070E5C]'
                }`}
              >
                <Briefcase className="w-4 h-4 text-[#D99A42]" />
                <span>{c.tabs.openingsLabel} ({initialCareers.length})</span>
              </button>

              <button
                onClick={openPortal}
                className={`px-6 py-2.5 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 flex items-center gap-2 ${
                  activeTab === 'portal'
                    ? 'bg-[#070E5C] text-white shadow-md'
                    : 'text-[#24272B] hover:text-[#070E5C]'
                }`}
              >
                <Upload className="w-4 h-4 text-[#D99A42]" />
                <span>{c.tabs.portalLabel}</span>
              </button>
            </div>

            {c.contactEmail && (
              <div className="flex items-center gap-2 text-xs font-medium text-[#747B83]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>
                  {c.contactLabel}:{' '}
                  <a href={`mailto:${c.contactEmail}`} className="font-bold text-[#070E5C] hover:text-[#D99A42]">
                    {c.contactEmail}
                  </a>
                </span>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Main Section Content */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-[#F6FAFD] to-[#FFFFFF] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {activeTab === 'openings' ? (
            <div className="space-y-12">

              {/* Job Listings Grid */}
              {initialCareers.length === 0 ? (
                <div className="p-12 sm:p-16 rounded-3xl bg-white/90 backdrop-blur-2xl border border-[#BDD7E8] text-center shadow-sm max-w-3xl mx-auto">
                  <div className="h-16 w-16 mx-auto rounded-2xl bg-[#EAF2F8] border border-[#BDD7E8] text-[#070E5C] flex items-center justify-center mb-6">
                    <Briefcase className="w-8 h-8 text-[#D99A42]" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#747B83]">Careers</span>
                  <h3 className="text-2xl font-bold font-serif text-[#070E5C] mt-2">
                    {c.emptyState.title}
                  </h3>
                  {c.emptyState.description && (
                    <p className="mt-3 text-xs sm:text-sm text-[#747B83] max-w-lg mx-auto leading-relaxed">
                      {c.emptyState.description}
                    </p>
                  )}
                  <button
                    onClick={openPortal}
                    className="mt-6 px-6 py-3 rounded-full bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BDD7E8] text-xs font-bold transition shadow-xs"
                  >
                    {c.emptyState.buttonLabel} &rarr;
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {initialCareers.map((job) => (
                    <div
                      key={job.id}
                      role="button"
                      tabIndex={0}
                      aria-label={`View details for ${job.title}`}
                      onClick={() => setDetailJob(job)}
                      onKeyDown={(e) => {
                        if (e.target !== e.currentTarget) return;
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setDetailJob(job);
                        }
                      }}
                      className="group cursor-pointer rounded-3xl bg-white/95 backdrop-blur-2xl border border-[#BDD7E8] p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-[#8EBCE0] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#070E5C] transition-all flex flex-col justify-between"
                    >
                      <div>
                        {(job.department || job.employmentType) && (
                          <div className="flex items-center justify-between gap-2 mb-3">
                            {job.department && (
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#EAF2F8] text-[#070E5C] border border-[#BDD7E8]">
                                {job.department}
                              </span>
                            )}
                            {job.employmentType && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {job.employmentType}
                              </span>
                            )}
                          </div>
                        )}

                        <h3 className="text-lg font-bold font-serif text-[#070E5C] leading-snug">
                          {job.title}
                        </h3>

                        <p className="text-xs text-[#747B83] mt-2 flex items-center gap-1.5 font-medium">
                          <MapPin className="w-3.5 h-3.5 text-[#D99A42]" />
                          <span>{job.location || 'Chennai'}</span>
                        </p>

                        <p className="text-xs text-[#24272B]/80 mt-3 line-clamp-3 leading-relaxed">
                          {job.description}
                        </p>

                        <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#070E5C] group-hover:text-[#D99A42] transition-colors">
                          View full details
                          <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </div>

                      <div className="pt-5 mt-5 border-t border-[#E5E7EB] flex items-center justify-between gap-3">
                        <span className="text-[11px] text-[#747B83] line-clamp-1">{job.experience ? `Exp: ${job.experience}` : ''}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleApplyClick(job); }}
                          className="shrink-0 px-4 py-2 rounded-full bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BDD7E8] text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <Send className="w-3 h-3 text-[#D99A42]" />
                          <span>Apply</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Resume Upload Callout */}
              {c.talentCallout.heading && (
              <div className="rounded-3xl bg-gradient-to-r from-[#EAF2F8] via-white to-[#F6FAFD] border border-[#BDD7E8] p-8 sm:p-10 shadow-sm flex flex-col lg:flex-row items-center justify-between gap-8">
                <div className="max-w-2xl space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-white px-3 py-1 rounded-full border border-[#BDD7E8]">
                    {c.talentCallout.badge}
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#070E5C]">
                    {c.talentCallout.heading}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#747B83] leading-relaxed">
                    {c.talentCallout.description}
                  </p>
                </div>

                <button
                  onClick={openPortal}
                  className="px-8 py-3.5 rounded-full bg-[#070E5C] hover:bg-[#D99A42] text-white font-bold text-xs tracking-wider uppercase transition shadow-md whitespace-nowrap active:scale-95"
                >
                  {c.talentCallout.buttonLabel} &rarr;
                </button>
              </div>
              )}

            </div>
          ) : (

            /* CAREER PORTAL FORM */
            <div className="max-w-4xl mx-auto">

              <div className="rounded-3xl bg-white/95 cube-glass backdrop-blur-2xl border border-[#BDD7E8] p-8 sm:p-12 shadow-[0_20px_50px_rgba(7,14,92,0.06)] relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#BDD7E8] to-transparent opacity-90" />

                <div className="text-center max-w-2xl mx-auto mb-10">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-[#EAF2F8] px-3.5 py-1 rounded-full border border-[#BDD7E8]">
                    {form.badge}
                  </span>
                  <h2 className="text-3xl font-serif font-bold text-[#070E5C] mt-3">
                    {form.heading}
                  </h2>
                  <p className="text-xs sm:text-sm text-[#747B83] mt-2">
                    Applying for: <strong className="text-[#24272B]">{jobTitle}</strong>
                  </p>
                </div>

                {submitSuccess ? (
                  <div className="p-8 sm:p-12 rounded-2xl bg-[#EAF2F8] border border-[#BDD7E8] text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                      <Check className="w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-[#070E5C]">{form.successTitle}</h3>
                    <p className="text-xs sm:text-sm text-[#747B83] max-w-md mx-auto leading-relaxed">
                      {form.successMessage}
                    </p>
                    <button
                      onClick={() => { setSubmitSuccess(false); setActiveTab('openings'); }}
                      className="mt-4 px-6 py-2.5 rounded-full bg-[#070E5C] text-white text-xs font-bold hover:bg-[#D99A42] transition"
                    >
                      Back to Careers
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitApplication} className="space-y-6">
                    {submitError && (
                      <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                        {submitError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#24272B] mb-2">
                          Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Name"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#BDD7E8] text-xs text-[#24272B] focus:outline-none focus:ring-2 focus:ring-[#070E5C]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#24272B] mb-2">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#BDD7E8] text-xs text-[#24272B] focus:outline-none focus:ring-2 focus:ring-[#070E5C]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#24272B] mb-2">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Phone"
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#BDD7E8] text-xs text-[#24272B] focus:outline-none focus:ring-2 focus:ring-[#070E5C]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#24272B] mb-2">
                          Experience
                        </label>
                        <select
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#BDD7E8] text-xs text-[#24272B] focus:outline-none focus:ring-2 focus:ring-[#070E5C]"
                        >
                          {form.experienceOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#24272B] mb-2">
                          Area
                        </label>
                        <select
                          value={domain}
                          onChange={(e) => setDomain(e.target.value)}
                          className="w-full px-4 py-3 rounded-2xl bg-white border border-[#BDD7E8] text-xs text-[#24272B] focus:outline-none focus:ring-2 focus:ring-[#070E5C]"
                        >
                          {form.domainOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-[#24272B] mb-2">
                          Position
                        </label>
                        {/* All live openings (plus the general pool); candidates can also type their own. */}
                        <ComboSelect
                          value={jobTitle}
                          onChange={setJobTitle}
                          options={positionOptions}
                          placeholder="Select or type the position"
                          inputClassName="w-full px-4 py-3 pr-10 rounded-2xl bg-white border border-[#BDD7E8] text-xs text-[#24272B] focus:outline-none focus:ring-2 focus:ring-[#070E5C] cursor-pointer"
                        />
                      </div>

                    </div>

                    {/* Resume Upload Box */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#24272B] mb-2">
                        Resume (PDF or DOCX - Max 10MB) *
                      </label>
                      <div className="rounded-2xl border-2 border-dashed border-[#BDD7E8] p-6 text-center hover:bg-[#F6FAFD] transition cursor-pointer relative">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          required
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center">
                          <Upload className="w-8 h-8 text-[#D99A42] mb-2" />
                          <p className="text-xs font-bold text-[#070E5C]">
                            {resumeFile ? resumeFile.name : 'Click or Drag & Drop your Resume here'}
                          </p>
                          <p className="text-[10px] text-[#747B83] mt-1">
                            Supported formats: PDF, DOCX (up to 10MB)
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-[#24272B] mb-2">
                        Cover Note
                      </label>
                      <textarea
                        rows={4}
                        value={coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        placeholder={form.coverNotePlaceholder}
                        className="w-full px-4 py-3 rounded-2xl bg-white border border-[#BDD7E8] text-xs text-[#24272B] focus:outline-none focus:ring-2 focus:ring-[#070E5C]"
                      />
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setActiveTab('openings')}
                        className="text-xs font-semibold text-[#747B83] hover:text-[#070E5C]"
                      >
                        &larr; Back to Openings
                      </button>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-8 py-3.5 rounded-full bg-[#070E5C] hover:bg-[#D99A42] text-white text-xs font-bold tracking-wider uppercase transition shadow-md flex items-center gap-2 disabled:opacity-50"
                      >
                        {submitting ? 'Submitting Application...' : form.submitLabel}
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </form>
                )}

              </div>

            </div>

          )}

        </div>
      </section>

      {/* Career Benefits Showcase */}
      {c.benefits.items.length > 0 && (
        <section className="py-16 bg-[#FFFFFF]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h3 className="text-2xl font-serif font-bold text-[#070E5C]">
                {c.benefits.heading}
              </h3>
              <p className="text-xs sm:text-sm text-[#747B83] mt-2">
                {c.benefits.subheading}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {c.benefits.items.map((item, i) => {
                const Icon = BENEFIT_ICONS[item.icon] || Award;
                return (
                  <div key={i} className="p-6 rounded-3xl bg-[#F6FAFD] cube-glass border border-[#BDD7E8] text-center">
                    <Icon className="w-8 h-8 text-[#D99A42] mx-auto mb-3" />
                    <h4 className="font-serif font-bold text-[#070E5C] text-base">{item.title}</h4>
                    <p className="text-xs text-[#747B83] mt-2 leading-relaxed">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Rendered into <body> so no transformed ancestor can offset it */}
      {mounted && createPortal(modal, document.body)}
    </div>
  );
}
