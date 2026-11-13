import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import ProjectCard from '@/components/cards/ProjectCard';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { verticals } from '@/data/verticals';
import { getPublishedProjects } from '@/lib/db/queries';

// Always render with live CMS data (archived projects disappear instantly).
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Urban Planning & Transportation | CUBE IIT Madras',
  description: 'The UPT vertical at CUBE focuses on the varied, multi sectoral and multidimensional aspects of urban issues and transportation planning.',
};

export default async function UrbanPlanningTransportationPage() {
  const projects = await getPublishedProjects();
  const vertical = verticals.find((v) => v.id === 'urban-planning-transportation')!;
  const verticalProjects = projects.filter((p: any) => p.category === 'Urban Planning & Transportation');

  return (
    <div>
      <PageHeader
        badge="Core Vertical"
        title={vertical.title}
        description={vertical.description}
        breadcrumbs={[
          { label: 'Verticals' },
          { label: 'Urban Planning & Transportation' },
        ]}
      />

      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                Urban Planning &amp; Transportation
              </span>
              <h2 className="text-3xl font-display font-extrabold text-navy-950">
                {vertical.title}
              </h2>
              {vertical.longDescription.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  {para}
                </p>
              ))}

              {vertical.capabilities.length > 0 && (
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vertical.capabilities.map((cap, i) => (
                  <div key={i} className="flex items-center text-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 mr-2 flex-shrink-0" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
              )}
            </div>

            <div className="lg:col-span-5 relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-cube border border-slate-200">
              <Image
                src={vertical.heroImage}
                alt="Urban Planning & Transportation CUBE"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Real Projects Grid */}
      {verticalProjects.length > 0 && (
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Our Projects
            </span>
            <h2 className="text-3xl font-display font-extrabold text-navy-950 mt-3">
              Urban Planning &amp; Transportation Projects ({verticalProjects.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {verticalProjects.slice(0, 6).map((proj) => (
              <ProjectCard key={proj.slug} project={proj} />
            ))}
          </div>

          {verticalProjects.length > 6 && (
            <div className="mt-12 text-center">
              <Link
                href="/projects?category=Urban%20Planning%20%26%20Transportation"
                className="inline-flex items-center px-8 py-3.5 rounded-full text-xs font-semibold text-[#070E5C] bg-white border border-[#BBD6EA] hover:bg-[#D99A42] hover:text-[#24272B] shadow-sm transition-all"
              >
                <span>View More Projects</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          )}
        </div>
      </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-gradient-to-b from-[#FFFFFF] via-[#F6FAFD] to-[#EAF2F8] border-t border-[#BDD7E8]/60 text-[#24272B] text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-display font-bold">
            Connect with the Urban Planning &amp; Transportation Vertical
          </h2>
          <div className="mt-6">
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#D99A42] hover:bg-[#C77B60] shadow-md transition"
            >
              <span>Connect with Urban Planning Team</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

