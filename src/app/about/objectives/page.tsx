import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import { CheckCircle2, Target } from 'lucide-react';
import { aboutContent } from '@/data/about';

export const metadata = {
  title: 'Objectives | CUBE IIT Madras',
  description: 'Objectives of CUBE – Centre for Urbanization, Buildings & Environment.',
};

export default function ObjectivesPage() {
  return (
    <div>
      <PageHeader
        badge="About CUBE"
        title="Objectives"
        description="Centre for Urbanization, Buildings & Environment (CUBE)"
        breadcrumbs={[
          { label: 'About CUBE', href: '/about' },
          { label: 'Objectives' },
        ]}
      />

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {aboutContent.objectives.map((obj, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 shadow-sm hover:shadow-cube hover:border-teal-300 transition-all flex items-start space-x-4"
              >
                <div className="h-8 w-8 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {(i + 1).toString().padStart(2, '0')}
                </div>
                <div>
                  <p className="text-sm sm:text-base text-slate-800 font-medium leading-relaxed">
                    {obj}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

