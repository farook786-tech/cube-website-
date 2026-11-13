'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Briefcase, Plus, Search, CheckCircle2, Loader2, MapPin,
  Edit3, Archive, ArchiveRestore, X, Clock, Calendar,
  FileText, Download, User, Mail, Phone, ExternalLink, Eye
} from 'lucide-react';
import { createCareerAction, updateCareerAction, archiveCareerAction, markApplicationReviewedAction } from '@/app/admin/actions/cms';
import CareersPageEditor from './CareersPageEditor';
import ApplicationViewer from './ApplicationViewer';
import { DEFAULT_EMPLOYMENT_TYPES, EXTRA_CAREER_DEPARTMENTS } from '@/lib/careers-page';
import type { CareersPageContent } from '@/lib/careers-page';
import ComboSelect from '@/components/admin/ComboSelect';
import { useRouter } from 'next/navigation';

export default function CareersManagerClient({
  initialCareers,
  initialApplications = [],
  initialPageContent,
  departmentOptions = EXTRA_CAREER_DEPARTMENTS,
  employmentTypeOptions = DEFAULT_EMPLOYMENT_TYPES,
}: {
  initialCareers: any[];
  initialApplications?: any[];
  initialPageContent: CareersPageContent;
  departmentOptions?: string[];
  employmentTypeOptions?: string[];
}) {
  const router = useRouter();
  const [careersList, setCareersList] = useState(initialCareers);
  useEffect(() => { setCareersList(initialCareers); }, [initialCareers]);
  const [applicationsList, setApplicationsList] = useState(initialApplications);
  useEffect(() => { setApplicationsList(initialApplications); }, [initialApplications]);

  const [activeAdminTab, setActiveAdminTab] = useState<'positions' | 'applications' | 'page'>('positions');
  const [viewingApp, setViewingApp] = useState<any | null>(null);
  const closeViewer = useCallback(() => setViewingApp(null), []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Archive Remark Modal State
  const [archiveModalTarget, setArchiveModalTarget] = useState<any | null>(null);
  const [archiveRemark, setArchiveRemark] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Building & Construction Vertical');
  const [employmentType, setEmploymentType] = useState('Full-Time');
  const [experience, setExperience] = useState('');
  const [location, setLocation] = useState('IIT Madras Research Park, Chennai');
  const [description, setDescription] = useState('');
  const [closingDate, setClosingDate] = useState('');
  const [applicationEmail, setApplicationEmail] = useState('office@cubeiitm.org');
  const [qualifications, setQualifications] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingJob(null);
    setTitle('');
    setDepartment('Building & Construction Vertical');
    setEmploymentType('Full-Time');
    setExperience('');
    setLocation('IIT Madras Research Park, Chennai');
    setDescription('');
    setClosingDate('');
    setApplicationEmail('office@cubeiitm.org');
    setQualifications('');
    setIsPublished(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (job: any) => {
    setEditingJob(job);
    setTitle(job.title || '');
    setDepartment(job.department || 'Building & Construction Vertical');
    setEmploymentType(job.employmentType || 'Full-Time');
    setExperience(job.experience || '');
    setLocation(job.location || 'IIT Madras Research Park, Chennai');
    setDescription(job.description || '');
    setClosingDate(job.closingDate || '');
    setApplicationEmail(job.applicationEmail || 'office@cubeiitm.org');
    setQualifications(
      Array.isArray(job.qualifications) ? job.qualifications.join('\n') : (job.qualifications || '')
    );
    setIsPublished(job.status !== 'draft' && job.isActive !== false);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title,
      department,
      employmentType,
      experience,
      location,
      description,
      closingDate,
      applicationEmail,
      qualifications: qualifications.split('\n').map((q) => q.trim()).filter(Boolean),
      isActive: isPublished,
      status: isPublished ? 'published' : 'draft',
    };

    setFormError(null);
    try {
      if (editingJob) {
        const res = await updateCareerAction(editingJob.id, payload);
        if (res.success && res.career) {
          setCareersList(careersList.map((c) => (c.id === editingJob.id ? { ...c, ...res.career } : c)));
          setIsModalOpen(false);
          router.refresh();
        } else {
          setFormError((res as any).error || 'Could not save this position.');
        }
      } else {
        const res = await createCareerAction(payload);
        if (res.success && res.career) {
          setCareersList([res.career, ...careersList]);
          setIsModalOpen(false);
          router.refresh();
        }
      }
    } catch (err: any) {
      setFormError(err?.message || 'Could not save this position.');
    } finally {
      setLoading(false);
    }
  };

  const handleArchiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archiveModalTarget) return;
    setLoading(true);

    const res = await archiveCareerAction(archiveModalTarget.id, archiveRemark);
    if (res.success) {
      // Remove from active list immediately
      setCareersList(careersList.filter((c) => c.id !== archiveModalTarget.id));
      setArchiveModalTarget(null);
      setArchiveRemark('');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-200">
              Recruitment CMS
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500 font-medium">Careers &amp; Institutional Openings</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-[#24272B] mt-1">
            Hiring Opportunities &amp; Talent Network
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setActiveAdminTab('positions')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeAdminTab === 'positions' ? 'bg-white text-[#070E5C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Openings ({careersList.filter((j) => j.status !== 'archived').length})
            </button>
            <button
              onClick={() => setActiveAdminTab('applications')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeAdminTab === 'applications' ? 'bg-white text-[#070E5C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Applicant Resumes ({applicationsList.length})
            </button>
            <button
              onClick={() => setActiveAdminTab('page')}
              className={`px-3.5 py-1.5 rounded-lg transition ${
                activeAdminTab === 'page' ? 'bg-white text-[#070E5C] shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Page Content
            </button>
          </div>

          {activeAdminTab === 'positions' && (
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 rounded-xl bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BBD6EA] font-bold text-xs flex items-center space-x-2 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>Post Open Position</span>
            </button>
          )}
        </div>
      </div>

      {activeAdminTab === 'page' ? (
        <CareersPageEditor initialContent={initialPageContent} />
      ) : activeAdminTab === 'applications' ? (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-base font-bold text-[#070E5C] mb-4 flex items-center justify-between">
              <span>Candidate CV Submissions ({applicationsList.length})</span>
              <span className="text-xs font-normal text-slate-500">Live Talent Bank</span>
            </h2>

            {applicationsList.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                No candidate resumes have been submitted yet via the public careers portal.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {applicationsList.map((app) => (
                  <div key={app.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 px-2 rounded-xl transition">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#24272B]">{app.fullName}</span>
                        {app.status === 'new' && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#D99A42] text-white">New</span>
                        )}
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EAF2F8] text-[#070E5C] border border-[#BDD7E8]">
                          {app.domain || 'Engineering'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <a href={`mailto:${app.email}`} className="text-teal-700 hover:underline">{app.email}</a>
                        </span>
                        {app.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{app.phone}</span>
                          </span>
                        )}
                        <span>Experience: <strong className="text-slate-700">{app.experience || 'Not specified'}</strong></span>
                        <span>Role: <strong className="text-slate-700">{app.jobTitle || 'Talent Pool'}</strong></span>
                      </div>

                      {app.coverLetter && (
                        <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-200/60 mt-2 max-w-3xl">
                          &ldquo;{app.coverLetter}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setViewingApp(app);
                          if (app.status === 'new') {
                            setApplicationsList((list: any[]) => list.map((x) => (x.id === app.id ? { ...x, status: 'reviewed' } : x)));
                            markApplicationReviewedAction(app.id).catch(() => {});
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-[#070E5C] text-white hover:bg-[#D99A42] text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      {app.resumeUrl ? (
                        <a
                          href={app.resumeUrl}
                          className="px-3.5 py-1.5 rounded-lg bg-[#EAF2F8] text-[#070E5C] hover:bg-[#D99A42] hover:text-white border border-[#BDD7E8] text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download CV</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No CV attached</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {careersList
          .filter((job) => job.status !== 'archived')
          .map((job) => (
            <div
              key={job.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {job.department}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    {job.status === 'draft' || job.isActive === false ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        Hidden
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Live
                      </span>
                    )}
                    {/* Edit button */}
                    <button
                      onClick={() => openEditModal(job)}
                      className="p-1.5 rounded-lg bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BBD6EA] transition text-xs"
                      title="Edit job opening details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {/* Archive button */}
                    <button
                      onClick={() => {
                        setArchiveModalTarget(job);
                        setArchiveRemark('');
                      }}
                      className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition text-xs"
                      title="Archive job position"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold font-display text-[#24272B] mt-1">{job.title}</h3>
                <p className="text-xs text-slate-500 mt-1 flex items-center">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-[#070E5C]" />
                  {job.location} &bull; {job.experience}
                </p>
                <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">{job.description}</p>
                {Array.isArray(job.qualifications) && job.qualifications.length > 0 && (
                  <p className="text-[11px] text-slate-400 mt-2">{job.qualifications.length} qualification(s) listed</p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Deadline: {job.closingDate || 'Open Until Filled'}</span>
                <span className="font-semibold text-[#070E5C]">{job.applicationEmail}</span>
              </div>
            </div>
          ))}
      </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-xl font-bold font-display text-[#24272B]">
                  {editingJob ? 'Edit Hiring Position' : 'Post Institutional Job Opening'}
                </h2>
                <p className="text-xs text-slate-500">
                  Update role responsibilities, experience criteria, and closing deadlines.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Position Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Structural QA/QC Engineer (TPQA)"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#070E5C]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Department Vertical</label>
                  <ComboSelect
                    value={department}
                    onChange={setDepartment}
                    options={departmentOptions}
                    placeholder="Select or type a vertical"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Employment Type</label>
                  <ComboSelect
                    value={employmentType}
                    onChange={setEmploymentType}
                    options={employmentTypeOptions}
                    placeholder="Select or type a type"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Required Experience</label>
                  <input
                    type="text"
                    required
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 5+ Years in High-Rise Structures"
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={closingDate}
                    onChange={(e) => setClosingDate(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="IIT Madras Research Park, Chennai"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Job Description &amp; Responsibilities *</label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key mandates, structural inspection, testing requirements..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Qualifications &amp; Requirements</label>
                <textarea
                  rows={4}
                  value={qualifications}
                  onChange={(e) => setQualifications(e.target.value)}
                  placeholder={'One per line, e.g.\nM.Tech in Structural Engineering\nProficiency in ETABS / STAAD.Pro'}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
                <p className="text-[10px] text-slate-400 mt-1">Each line becomes a bullet point in the job details popup.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Application Email</label>
                  <input
                    type="email"
                    value={applicationEmail}
                    onChange={(e) => setApplicationEmail(e.target.value)}
                    placeholder="office@cubeiitm.org"
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Visibility</label>
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPublished}
                      onChange={(e) => setIsPublished(e.target.checked)}
                    />
                    <span>{isPublished ? 'Live on careers page' : 'Hidden (draft)'}</span>
                  </label>
                </div>
              </div>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">{formError}</div>
              )}

              <div className="flex justify-end space-x-3 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-[#070E5C] hover:bg-[#D99A42] text-white text-xs font-bold rounded-xl transition"
                >
                  {loading ? 'Saving...' : editingJob ? 'Update Position' : 'Post Opening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Application detail + CV preview */}
      <ApplicationViewer app={viewingApp} onClose={closeViewer} />

      {/* Archive Remark Modal */}
      {archiveModalTarget && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-800">
                  <Archive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Archive Job Opening</h3>
                  <p className="text-[11px] text-slate-400">Save audit remark before archiving</p>
                </div>
              </div>
              <button onClick={() => setArchiveModalTarget(null)} className="p-1 rounded-full text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleArchiveSubmit} className="space-y-3.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                <span className="font-semibold line-clamp-1">{archiveModalTarget.title}</span> will be safely removed from public career listings into the Central Archive Vault.
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reason / Remark for Archiving <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Candidate selected and offer accepted / recruitment window expired."
                  value={archiveRemark}
                  onChange={(e) => setArchiveRemark(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-200 outline-none"
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
                  className="px-4 py-1.5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs"
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
