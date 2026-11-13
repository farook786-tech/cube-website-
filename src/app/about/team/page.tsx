'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import PageHeader from '@/components/common/PageHeader';
import { Search, Plus, Minus, Users, Briefcase, Building2, Trees, Navigation as NavigationIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { teamMembers as fallbackTeamMembers } from '@/data/team';
import { useLiveList } from '@/lib/live';

interface DepartmentSection {
  id: string;
  title: string;
  icon: any;
  defaultOpen: boolean;
  accent: string;
}

const DEPARTMENTS: DepartmentSection[] = [
  {
    id: 'Building & Construction',
    title: 'Building & Construction',
    icon: Building2,
    defaultOpen: true,
    accent: 'border-l-4 border-l-[#D7A00F]',
  },
  {
    id: 'Environment & Sustainability',
    title: 'Environment & Sustainability',
    icon: Trees,
    defaultOpen: false,
    accent: 'border-l-4 border-l-[#008080]',
  },
  {
    id: 'Urban Planning & Transportation',
    title: 'Urban Planning & Transportation',
    icon: NavigationIcon,
    defaultOpen: false,
    accent: 'border-l-4 border-l-[#070E5C]',
  },
  {
    id: 'Admin',
    title: 'Admin',
    icon: Briefcase,
    defaultOpen: false,
    accent: 'border-l-4 border-l-slate-600',
  },
];

export default function TeamPage() {
  // Live CMS data (published members only); updates instantly on admin changes.
  const teamList = useLiveList<any>('/api/public/team', fallbackTeamMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'Building & Construction': true,
    'Environment & Sustainability': false,
    'Urban Planning & Transportation': false,
    'Admin': false,
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    DEPARTMENTS.forEach((d) => (allOpen[d.id] = true));
    setOpenSections(allOpen);
  };

  const collapseAll = () => {
    const allClosed: Record<string, boolean> = {};
    DEPARTMENTS.forEach((d) => (allClosed[d.id] = false));
    setOpenSections(allClosed);
  };

  // Group active team members by department
  const filteredAndGrouped = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    const grouped: Record<string, any[]> = {
      'Building & Construction': [],
      'Environment & Sustainability': [],
      'Urban Planning & Transportation': [],
      'Admin': [],
    };

    // Filter out any archived records strictly, and keep board / advisory /
    // leadership entries (served by the same feed) off the staff list.
    const activeMembers = teamList.filter(
      (m) => m.status !== 'archived' && !['leadership', 'board', 'advisory'].includes(m.category),
    );

    activeMembers.forEach((member) => {
      // If search query active, check match
      if (query) {
        const matchName = (member.name || '').toLowerCase().includes(query);
        const matchDesig = (member.designation || '').toLowerCase().includes(query);
        if (!matchName && !matchDesig) return;
      }

      const dept = member.department || member.category || 'Building & Construction';
      if (grouped[dept]) {
        grouped[dept].push(member);
      } else {
        grouped['Building & Construction'].push(member);
      }
    });

    return grouped;
  }, [teamList, searchQuery]);

  const totalMatches = Object.values(filteredAndGrouped).reduce((acc, curr) => acc + curr.length, 0);

  return (
    <div className="bg-[#FAF9F5] min-h-screen">
      <PageHeader
        badge="About CUBE"
        title="Our Team"
        description="Centre for Urbanization, Buildings & Environment (CUBE)"
        breadcrumbs={[
          { label: 'About CUBE', href: '/about' },
          { label: 'Our Team' },
        ]}
      />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Top Controls: Search & Expand/Collapse */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            {/* Search Filter Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search team member by name or role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-[#070E5C] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-semibold"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-500">
              <span>
                Showing <b>{totalMatches}</b> members
              </span>
              <div className="flex items-center space-x-1 border-l border-slate-200 pl-3">
                <button
                  onClick={expandAll}
                  className="px-2.5 py-1 rounded-lg hover:bg-slate-100 text-slate-600 font-medium transition"
                >
                  Expand All
                </button>
                <span>&bull;</span>
                <button
                  onClick={collapseAll}
                  className="px-2.5 py-1 rounded-lg hover:bg-slate-100 text-slate-600 font-medium transition"
                >
                  Collapse All
                </button>
              </div>
            </div>
          </div>

          {/* Department Accordions */}
          <div className="space-y-6">
            {DEPARTMENTS.map((dept) => {
              const membersInDept = filteredAndGrouped[dept.id] || [];
              const isOpen = searchQuery.trim() ? true : !!openSections[dept.id];
              const DeptIcon = dept.icon;

              return (
                <div
                  key={dept.id}
                  className={`bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-300 ${dept.accent}`}
                >
                  {/* Accordion Header */}
                  <button
                    onClick={() => toggleSection(dept.id)}
                    className="w-full py-4 px-6 flex items-center justify-between bg-white hover:bg-slate-50/80 transition-colors text-left select-none group"
                    aria-expanded={isOpen}
                  >
                    <div className="flex items-center space-x-3.5">
                      <div className="p-2 rounded-xl bg-[#EAF2F8] text-[#070E5C] group-hover:scale-105 transition-transform">
                        <DeptIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-base sm:text-lg font-bold text-[#24272B] font-display">
                          {dept.title}
                        </h2>
                        <p className="text-xs text-slate-400 font-medium">
                          {membersInDept.length} Member{membersInDept.length === 1 ? '' : 's'}
                        </p>
                      </div>
                    </div>

                    {/* Expand/Collapse Indicator matching the original website screenshot */}
                    <div className="h-8 w-8 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-[#EAF2F8] group-hover:text-[#070E5C] flex items-center justify-center transition-colors">
                      {isOpen ? (
                        <Minus className="w-4 h-4 stroke-[2.5]" />
                      ) : (
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                      )}
                    </div>
                  </button>

                  {/* Accordion Content */}
                  {isOpen && (
                    <div className="p-6 pt-2 border-t border-slate-100">
                      {membersInDept.length === 0 ? (
                        <div className="py-8 text-center text-xs text-slate-400">
                          No team members match the search query in this vertical.
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 pt-4">
                          {membersInDept.map((member, idx) => (
                            <div
                              key={member.name + idx}
                              className="p-4 rounded-2xl bg-[#FAFAFA] border border-slate-200/70 hover:border-[#070E5C]/30 hover:bg-white hover:shadow-md transition-all flex flex-col items-center text-center group"
                            >
                              {/* Circular Avatar matching original website */}
                              <div className="relative h-24 w-24 rounded-full overflow-hidden mb-3 border-2 border-slate-200 group-hover:border-[#070E5C] shadow-sm transition-all bg-white shrink-0">
                                <Image
                                  src={member.image || '/images/team/team_unknown.png'}
                                  alt={member.name}
                                  fill
                                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>
                              <h3 className="text-xs sm:text-sm font-bold text-[#24272B] font-display line-clamp-1 mt-1">
                                {member.name}
                              </h3>
                              <p className="text-[11px] text-[#070E5C] font-semibold mt-1 line-clamp-2">
                                {member.designation}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>
    </div>
  );
}
