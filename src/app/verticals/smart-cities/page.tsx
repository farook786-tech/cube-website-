import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { verticals } from '@/data/verticals';

export const metadata = {
  title: 'Smart Cities Vertical | CUBE IIT Madras',
  description: 'The SMART vertical at CUBE develops solutions that are holistic socio culturally, technologically and environmentally, employing design thinking & analytics for urban development.',
};

export default function SmartCitiesPage() {
  const vertical = verticals.find((v) => v.id === 'smart-cities')!;

  return (
    <div>
      <PageHeader
        badge="Core Vertical"
        title={vertical.title}
        description={vertical.description}
        breadcrumbs={[
          { label: 'Verticals' },
          { label: 'Smart Cities' },
        ]}
      />

      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
                Smart Cities
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
                    <CheckCircle2 className="w-4 h-4 text-cyan-600 mr-2 flex-shrink-0" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>
              )}
            </div>

            <div className="lg:col-span-5 relative h-80 sm:h-96 rounded-3xl overflow-hidden shadow-cube border border-slate-200">
              <Image
                src={vertical.heroImage}
                alt="Smart Cities CUBE"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-b from-[#FFFFFF] via-[#F6FAFD] to-[#EAF2F8] border-t border-[#BDD7E8]/60 text-[#24272B] text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-display font-bold">
            Connect with the Smart Cities Vertical
          </h2>
          <div className="mt-6">
            <Link
              href="/contact"
              className="inline-flex items-center px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#D99A42] hover:bg-[#C77B60] shadow-md transition"
            >
              <span>Connect with Smart Cities Team</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

