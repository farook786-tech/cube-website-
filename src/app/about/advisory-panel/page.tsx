import React from 'react';
import Image from 'next/image';
import PageHeader from '@/components/common/PageHeader';
import { Award, BookOpen } from 'lucide-react';
import { getPublishedTeamMembers } from '@/lib/db/queries';
import { advisoryPanel as advisoryReference } from '@/data/leadership';

// Department headings from the original IIT Advisory Panel page, by member name.
const ADVISORY_DEPARTMENTS: Record<string, string> = Object.fromEntries(
  advisoryReference.map((m) => [m.name, m.department || '']),
);

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'IIT Advisory Panel | CUBE',
  description: 'IIT Advisory Panel of CUBE – Centre for Urbanization, Buildings & Environment.',
};

export default async function AdvisoryPanelPage() {
  const team = await getPublishedTeamMembers();
  const advisory = team
    .filter((m: any) => m.category === 'advisory')
    .map((m: any) => ({
      ...m,
      role: m.designation || m.role || '',
      department: m.department || ADVISORY_DEPARTMENTS[m.name] || 'IIT Madras',
    }));
  // CMS is the source of truth: archived members must not reappear via a fallback.
  const advisoryPanel = advisory;

  return (
    <div>
      <PageHeader
        badge="About CUBE"
        title="IIT Advisory Panel"
        description="Centre for Urbanization, Buildings & Environment (CUBE)"
        breadcrumbs={[
          { label: 'About CUBE', href: '/about' },
          { label: 'IIT Advisory Panel' },
        ]}
      />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {advisoryPanel.map((member, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm hover:shadow-cube hover:border-teal-300 transition-all flex flex-col items-center text-center group"
              >
                <div className="relative h-28 w-28 rounded-full overflow-hidden mb-4 border-2 border-slate-200 group-hover:border-teal-500 shadow-sm transition-all">
                  <Image
                    src={member.image || '/images/leadership/about_leader.jpg'}
                    alt={member.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-sm font-bold text-navy-950 font-display line-clamp-1">
                  {member.name}
                </h3>
                <p className="text-xs text-teal-700 font-medium mt-1 line-clamp-2">
                  {member.role}
                </p>
                <p className="text-[10px] text-slate-500 mt-1 line-clamp-1">
                  {member.department}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

