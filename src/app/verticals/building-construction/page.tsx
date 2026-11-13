import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import ProjectCard from '@/components/cards/ProjectCard';
import { CheckCircle2, ArrowRight, Wrench } from 'lucide-react';
import { verticals } from '@/data/verticals';
import { getPublishedProjects } from '@/lib/db/queries';

// Always render with live CMS data (archived projects disappear instantly).
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Building & Construction Vertical | CUBE IIT Madras',
  description: 'The B&C vertical at CUBE: Design & Engineering, Project Management Consultancy, Quality Assurance Services, Advanced Construction Technologies, and Training & Research.',
};

export default async function BuildingConstructionPage() {
  const projects = await getPublishedProjects();
  const vertical = verticals.find((v) => v.id === 'building-construction')!;
  const verticalProjects = projects.filter((p: any) => p.category === 'Building & Construction');

  return (
    <div>
      <PageHeader
        badge="Core Vertical"
        title={vertical.title}
        description={vertical.description}
        breadcrumbs={[
          { label: 'Verticals' },
          { label: 'Building & Construction' },
        ]}
      />

      {/* Overview & Key Services */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Building &amp; Construction
              </span>
              <h2 className="text-3xl font-display font-extrabold text-navy-950">
                {vertical.title}
              </h2>
              {vertical.longDescription.split('\n\n').map((para, i) => (
                <p key={i} className="text-sm sm:text-base text-slate-700 leading-relaxed">
                  {para}
                </p>
              ))}

              {/* Capabilities checklist */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {vertical.capabilities.map((cap, i) => (
                  <div key={i} className="flex items-center text-xs font-semibold text-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-cube border border-slate-200">
              <Image
                src={vertical.heroImage}
                alt="Building & Construction CUBE"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Key Services Grid */}
          <div className="mt-12">
            <h3 className="text-2xl font-bold font-display text-navy-950 mb-8 text-center">
              Expertise
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vertical.keyServices.map((srv, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-all">
                  <h4 className="text-base font-bold text-navy-950 mb-2 flex items-center">
                    <Wrench className="w-4 h-4 text-blue-600 mr-2" />
                    {srv.title}
                  </h4>
                  {srv.description && (
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {srv.description}
                    </p>
                  )}
                  {srv.groups?.map((grp) => (
                    <div key={grp.heading} className="mt-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1.5">{grp.heading}</p>
                      <ul className="space-y-1">
                        {grp.items.map((item) => (
                          <li key={item} className="flex items-start text-xs sm:text-sm text-slate-600 leading-relaxed">
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Real Projects Grid */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Our Projects
            </span>
            <h2 className="text-3xl font-display font-extrabold text-navy-950 mt-3">
              Building &amp; Construction Projects ({verticalProjects.length})
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
                href="/projects?category=Building%20%26%20Construction"
                className="inline-flex items-center px-8 py-3.5 rounded-full text-xs font-semibold text-[#070E5C] bg-white border border-[#BBD6EA] hover:bg-[#D99A42] hover:text-[#24272B] shadow-sm transition-all"
              >
                <span>View More Projects</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-b from-[#FFFFFF] via-[#F6FAFD] to-[#EAF2F8] border-t border-[#BDD7E8]/60 text-[#24272B] text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-display font-bold">
            Connect with the Building &amp; Construction Vertical
          </h2>
          <div className="mt-6">
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#D99A42] hover:bg-[#C77B60] shadow-md transition"
            >
              <span>Connect with Building Division</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

