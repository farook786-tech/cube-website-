'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ImageUploadField from '@/components/admin/ImageUploadField';
import { 
  FolderKanban, Plus, Search, Filter, CheckCircle2, 
  Archive, ArchiveRestore, Eye, Edit3, ArrowRight, ExternalLink, Loader2, X 
} from 'lucide-react';
import { createProjectAction, updateProjectAction, archiveProjectAction } from '@/app/admin/actions/cms';
import { useRouter } from 'next/navigation';

export default function ProjectsManagerClient({ initialProjects }: { initialProjects: any[] }) {
  const router = useRouter();
  const [projectList, setProjectList] = useState<any[]>(initialProjects);
  useEffect(() => { setProjectList(initialProjects); }, [initialProjects]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  // Archive Remark Modal State
  const [archiveModalTarget, setArchiveModalTarget] = useState<any | null>(null);
  const [archiveRemark, setArchiveRemark] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Building & Construction');
  const [client, setClient] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [heroImage, setHeroImage] = useState('/images/hero/slides_iit-tirupathi.jpg');
  const [featured, setFeatured] = useState(false);

  const openAddModal = () => {
    setEditingProject(null);
    setTitle('');
    setCategory('Building & Construction');
    setClient('');
    setLocation('');
    setDescription('');
    setHeroImage('/images/hero/slides_iit-tirupathi.jpg');
    setFeatured(false);
    setIsModalOpen(true);
  };

  const openEditModal = (proj: any) => {
    setEditingProject(proj);
    setTitle(proj.title || '');
    setCategory(proj.category || 'Building & Construction');
    setClient(proj.client || '');
    setLocation(proj.location || '');
    setDescription(proj.description || '');
    setHeroImage(proj.heroImage || '/images/hero/slides_iit-tirupathi.jpg');
    setFeatured(!!proj.featured);
    setIsModalOpen(true);
  };

  const filtered = projectList.filter((p) => {
    // Exclude archived projects from active grid
    if (p.status === 'archived') return false;

    const matchesSearch =
      (p.title && p.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (p.client && p.client.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      title,
      category,
      client,
      location,
      description,
      heroImage: heroImage || '/images/hero/slides_iit-tirupathi.jpg',
      featured,
      status: 'published',
    };

    if (editingProject) {
      const res = await updateProjectAction(editingProject.id || editingProject.slug, payload);
      if (res.success && res.project) {
        setProjectList(
          projectList.map((p) =>
            (p.id && p.id === editingProject.id) || p.slug === editingProject.slug
              ? { ...p, ...res.project }
              : p
          )
        );
        setIsModalOpen(false);
        router.refresh();
      }
    } else {
      const res = await createProjectAction(payload);
      if (res.success && res.project) {
        setProjectList([res.project, ...projectList]);
        setIsModalOpen(false);
        router.refresh();
      }
    }
    setLoading(false);
  };

  const handleArchiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!archiveModalTarget) return;
    setLoading(true);

    const res = await archiveProjectAction(archiveModalTarget.id || archiveModalTarget.slug, archiveRemark);
    if (res.success) {
      // Remove from active list immediately
      setProjectList(projectList.filter((p) => (p.id || p.slug) !== (archiveModalTarget.id || archiveModalTarget.slug)));
      setArchiveModalTarget(null);
      setArchiveRemark('');
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
              Portfolio CMS
            </span>
            <span className="text-xs text-slate-400">&bull;</span>
            <span className="text-xs text-slate-500 font-medium">Full Edit &amp; Safe Archiving</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-[#24272B] mt-1">
            Projects &amp; Infrastructure Engineering Portfolio
          </h1>
        </div>

        <button
          onClick={openAddModal}
          className="px-4 py-2.5 rounded-xl bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BBD6EA] font-bold text-xs flex items-center space-x-2 shadow-sm transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search projects or clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-[#070E5C]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg p-2 focus:outline-none focus:border-[#070E5C] bg-white font-medium"
          >
            <option value="All">All Verticals (4)</option>
            <option value="Building & Construction">Building &amp; Construction</option>
            <option value="Environment & Sustainability">Environment &amp; Sustainability</option>
            <option value="Smart Cities">Smart Cities</option>
            <option value="Urban Planning & Transportation">Urban Planning &amp; Transportation</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Project &amp; Client</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Key Badge</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filtered.map((proj) => (
                <tr key={proj.slug || proj.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 max-w-sm line-clamp-1">
                      {proj.title}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      Client: {proj.client || '—'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-semibold">
                      {proj.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{proj.location || '—'}</td>
                  <td className="py-3 px-4">
                    {proj.featured ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        Featured
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">Standard</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                      {proj.status || 'Published'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                    {/* View Live */}
                    <Link
                      href={`/projects/${proj.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#070E5C] hover:bg-[#EAF2F8] inline-block"
                      title="View Live Page"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>

                    {/* Edit Project */}
                    <button
                      onClick={() => openEditModal(proj)}
                      className="p-1.5 rounded-lg bg-[#EAF2F8] hover:bg-[#D99A42] text-[#070E5C] hover:text-white border border-[#BBD6EA] inline-block transition"
                      title="Edit Project Details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Archive Project */}
                    <button
                      onClick={() => {
                        setArchiveModalTarget(proj);
                        setArchiveRemark('');
                      }}
                      className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 inline-block transition"
                      title="Archive Project"
                    >
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-xl font-bold font-display text-[#24272B]">
                  {editingProject ? 'Edit Infrastructure Project' : 'Add Landmark Infrastructure Project'}
                </h2>
                <p className="text-xs text-slate-500">
                  Published projects appear instantly in public portfolio listings and category filters.
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:bg-slate-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Proof Checking of 15-Storey Precast Residential Complex"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#070E5C]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Vertical / Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#070E5C] bg-white font-medium"
                  >
                    <option value="Building & Construction">Building &amp; Construction</option>
                    <option value="Environment & Sustainability">Environment &amp; Sustainability</option>
                    <option value="Smart Cities">Smart Cities</option>
                    <option value="Urban Planning & Transportation">Urban Planning &amp; Transportation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Chennai, Tamil Nadu"
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#070E5C]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Client / Authority Name *
                </label>
                <input
                  type="text"
                  required
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="e.g. Tamil Nadu Urban Habitat Development Board (TNUHDB)"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#070E5C]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Project Overview &amp; Mandate Summary *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed engineering summary, scope of mandate, structural proof checking, etc..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:border-[#070E5C]"
                />
              </div>

              <ImageUploadField
                label="Hero Image"
                value={heroImage}
                onChange={setHeroImage}
                labelClassName="block text-xs font-bold text-slate-700 uppercase mb-1"
              />

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="featured_proj"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="featured_proj" className="text-xs font-medium text-slate-700">
                  Mark as Featured Landmark Project on Homepage
                </label>
              </div>

              <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-[#070E5C] hover:bg-[#D99A42] text-white font-bold text-xs flex items-center space-x-2 shadow-sm transition disabled:opacity-50"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProject ? 'Update Project' : 'Save & Publish Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                  <h3 className="text-sm font-bold text-slate-800">Archive Project</h3>
                  <p className="text-[11px] text-slate-400">Save audit remark before archiving</p>
                </div>
              </div>
              <button onClick={() => setArchiveModalTarget(null)} className="p-1 rounded-full text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleArchiveSubmit} className="space-y-3.5">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-600">
                <span className="font-semibold line-clamp-1">{archiveModalTarget.title}</span> will be safely removed from public portfolio into Central Archive Vault.
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Reason / Remark for Archiving <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Project mandate concluded / replaced with updated DPR version."
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
