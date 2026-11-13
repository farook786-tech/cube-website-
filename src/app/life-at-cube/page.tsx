import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import { lifeAtCubeImages } from '@/data/media';

export const metadata = {
  title: 'Life at CUBE | CUBE IIT Madras',
  description: 'Life at the Centre for Urbanization, Buildings & Environment (CUBE).',
};

export default function LifeAtCubePage() {
  // Photos from the "Life at CUBE" section of the original CUBE homepage (uncaptioned).
  const highlights = lifeAtCubeImages.map((image) => ({ image }));

  return (
    <div>
      <PageHeader
        badge="Workplace & Culture"
        title="Life at CUBE"
        description="Centre for Urbanization, Buildings & Environment (CUBE), IIT Madras Research Park, Chennai."
        breadcrumbs={[{ label: 'Life at CUBE' }]}
      />

      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {highlights.map((h, i) => (
              <div key={i} className="rounded-3xl bg-slate-50 border border-slate-200 overflow-hidden shadow-sm hover:shadow-cube transition-all flex flex-col justify-between">
                <div className="relative h-64 w-full bg-slate-900">
                  <Image
                    src={h.image}
                    alt="Life at CUBE"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join the Team CTA */}
      <section className="py-16 bg-[#EAF2F8] text-[#070E5C] border border-[#BBD6EA] text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-display font-bold">
            Careers
          </h2>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/careers"
              className="px-6 py-3 rounded-xl text-xs font-bold text-navy-950 bg-teal-400 hover:bg-teal-300 transition"
            >
              <span>View Career Openings</span>
            </Link>
            <Link
              href="/about/team"
              className="px-6 py-3 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 transition"
            >
              <span>Meet the Team</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
