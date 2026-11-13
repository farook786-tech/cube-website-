import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import { Target, Compass, CheckCircle2, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { aboutContent } from '@/data/about';

export const metadata = {
  title: 'Vision & Mission | CUBE IIT Madras',
  description: 'Vision and mission of CUBE – Centre for Urbanization, Buildings & Environment (IIT Madras & Govt of Tamil Nadu).',
};

export default function VisionMissionPage() {
  return (
    <div className="bg-[#FFFFFF]">
      <PageHeader
        badge="Strategic Direction"
        title="Vision & Mission"
        description="Centre for Urbanization, Buildings & Environment (CUBE)"
        breadcrumbs={[
          { label: 'About CUBE', href: '/about' },
          { label: 'Vision & Mission' },
        ]}
      />

      <section className="py-20 bg-[#F7F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Vision Card (Architectural Light Palette) */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white cube-glass text-[#24272B] shadow-sm hover:shadow-xl border border-[#E5E7EB] transition-all flex flex-col justify-between">
              <div>
                <div className="p-3 bg-[#EAF2F8] text-[#070E5C] rounded-2xl w-fit mb-6 border border-[#BBD6EA]">
                  <Compass className="w-8 h-8 text-[#D99A42]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#D99A42]">
                  Our Vision
                </span>
                <p className="mt-6 text-sm sm:text-base text-[#747B83] leading-relaxed font-sans font-normal">
                  &ldquo;{aboutContent.vision}&rdquo;
                </p>
              </div>

            </div>

            {/* Mission Card (Architectural Light Sky Palette) */}
            <div className="p-8 sm:p-10 rounded-3xl bg-white cube-glass text-[#24272B] border border-[#E5E7EB] shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
              <div>
                <div className="p-3 bg-[#EAF2F8] text-[#070E5C] rounded-2xl w-fit mb-6 border border-[#BBD6EA]">
                  <Target className="w-8 h-8 text-[#D99A42]" />
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#D99A42]">
                  Our Mission
                </span>
                <ul className="mt-6 space-y-2 text-sm sm:text-base text-[#747B83] leading-relaxed font-sans font-normal list-disc pl-5">
                  {aboutContent.mission.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-[#E5E7EB]">
                <Link
                  href="/about/objectives"
                  className="inline-flex items-center text-xs font-semibold text-[#070E5C] hover:text-[#D99A42] transition-colors"
                >
                  <span>Objectives</span>
                  <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
