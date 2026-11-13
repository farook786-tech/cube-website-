'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useLiveList } from '@/lib/live';
import PageHeader from '@/components/common/PageHeader';
import ProjectCard from '@/components/cards/ProjectCard';
import { Search, Filter, Sparkles } from 'lucide-react';
import { projects as fallbackProjects } from '@/data/projects';

export default function ProjectsPage() {
  // Live CMS data: updates instantly when an admin edits/archives a project.
  const projectList = useLiveList<any>('/api/public/projects', fallbackProjects);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // "View More Projects" links from the vertical pages open a pre-filtered list.
  useEffect(() => {
    const cat = new URLSearchParams(window.location.search).get('category');
    if (cat && categories.includes(cat)) setSelectedCategory(cat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const categories = [
    'All',
    'Building & Construction',
    'Environment & Sustainability',
    'Urban Planning & Transportation',
  ];

  const filteredProjects = useMemo(() => {
    return projectList.filter((p) => {
      // Exclude archived projects strictly
      if (p.status === 'archived') return false;

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        !searchQuery.trim() ||
        (p.title && p.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (p.scopeOfWork && p.scopeOfWork.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [projectList, selectedCategory, searchQuery]);

  return (
    <div className="bg-[#FFFFFF] text-[#24272B] min-h-screen">
      <PageHeader
        badge="Projects"
        title="Projects"
        description="Building & Construction · Environment & Sustainability · Urban Planning & Transportation"
        breadcrumbs={[{ label: 'Projects' }]}
      />

      <section className="py-20 bg-gradient-to-b from-[#FFFFFF] via-[#F6FAFD] to-[#EAF2F8] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Apple Liquid Glass Filter and Search Bar */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white/80 cube-glass backdrop-blur-2xl border border-[#BDD7E8] shadow-[0_8px_24px_rgba(7,14,92,0.04)] flex flex-col md:flex-row md:items-center justify-between gap-5 mb-10">
            {/* Glass Category Filter Chips */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all ${
                    selectedCategory === cat
                      ? 'bg-[#EAF2F8] text-[#070E5C] border border-[#BDD7E8] font-bold shadow-xs scale-105'
                      : 'bg-white/60 text-[#747B83] hover:text-[#24272B] hover:bg-white border border-transparent'
                  }`}
                >
                  {cat === 'Building & Construction' ? 'Buildings' : cat === 'Environment & Sustainability' ? 'Environment' : cat === 'Urban Planning & Transportation' ? 'Transport' : cat}
                </button>
              ))}
            </div>

            {/* Search Input with Apple Frosted Glass Style */}
            <div className="relative min-w-[260px] sm:min-w-[300px]">
              <Search className="w-4 h-4 text-[#747B83] absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects, client, domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 text-xs rounded-full bg-white border border-[#BDD7E8] text-[#24272B] placeholder-[#747B83] focus:outline-none focus:border-[#070E5C] shadow-2xs transition-colors"
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-8 text-xs text-[#747B83] flex items-center justify-between">
            <div>
              Showing <span className="font-bold text-[#070E5C]">{filteredProjects.length}</span> verified infrastructure projects
            </div>
            {selectedCategory !== 'All' && (
              <span className="text-[11px] font-semibold text-[#D99A42]">
                Filtered by: {selectedCategory}
              </span>
            )}
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.slug || project.id} project={project} />
            ))}
          </div>

          {/* Empty State */}
          {filteredProjects.length === 0 && (
            <div className="text-center py-20 rounded-3xl bg-white cube-glass border border-[#BDD7E8] p-8">
              <p className="text-sm font-semibold text-[#24272B]">No projects match your search criteria.</p>
              <p className="text-xs text-[#747B83] mt-1">Try resetting the category filter or searching with a different keyword.</p>
              <button
                onClick={() => { setSelectedCategory('All'); setSearchQuery(''); }}
                className="mt-4 px-5 py-2 rounded-full text-xs font-semibold bg-[#EAF2F8] text-[#070E5C] border border-[#BDD7E8]"
              >
                Reset Filters
              </button>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}
