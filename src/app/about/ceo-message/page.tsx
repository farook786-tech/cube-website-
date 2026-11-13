import React from 'react';
import Image from 'next/image';
import PageHeader from '@/components/common/PageHeader';
import { Quote } from 'lucide-react';
import { aboutContent } from '@/data/about';

export const metadata = {
  title: 'CEO Message | CUBE IIT Madras',
  description: 'Address from the Chief Executive Officer, CUBE (IIT Madras & Govt of Tamil Nadu).',
};

export default function CEOMessagePage() {
  return (
    <div>
      <PageHeader
        badge="Executive Address"
        title="CEO Message"
        description="L. Padmanaban, (Major General [Retired]) CEO"
        breadcrumbs={[
          { label: 'About CUBE', href: '/about' },
          { label: 'CEO Message' },
        ]}
      />

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
            {/* CEO Profile Card */}
            <div className="md:col-span-4 p-6 rounded-3xl bg-slate-50 border border-slate-200 shadow-cube text-center">
              <div className="relative h-44 w-44 mx-auto rounded-2xl overflow-hidden mb-4 border-2 border-teal-500 shadow-md">
                <Image
                  src="/images/leadership/ceo_padmanaban.jpg"
                  alt="L. Padmanaban, CEO, CUBE"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-lg font-bold text-navy-950 font-display">
                L. PADMANABAN
              </h3>
              <p className="text-xs text-teal-700 font-bold mt-0.5">
                (Major General [Retired]) CEO
              </p>
              <div className="mt-4 pt-4 border-t border-slate-200 text-[11px] text-slate-500">
                Centre for Urbanization, Buildings &amp; Environment
              </div>
            </div>

            {/* Message Body */}
            <div className="md:col-span-8 space-y-6">
              <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl w-fit">
                <Quote className="w-8 h-8" />
              </div>

              <div className="space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
                {aboutContent.ceoMessage.map((p, idx) => (
                  <p key={idx}>{p}</p>
                ))}
              </div>

              <div className="pt-6 border-t border-slate-200">
                <div className="font-bold text-navy-950 text-base">L. PADMANABAN</div>
                <div className="text-xs text-teal-700 font-semibold">(Major General [Retired]) CEO</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

