import React from 'react';
import PageHeader from '@/components/common/PageHeader';
import { ShieldCheck, HeartHandshake, Leaf, Sparkles, Award, BookOpen } from 'lucide-react';
import { aboutContent } from '@/data/about';

export const metadata = {
  title: 'Core Values | CUBE IIT Madras',
  description: 'Core values of CUBE – Leadership, Excellence, Harmony, Intrepid, Innovation and Decisive.',
};

export default function CoreValuesPage() {
  const icons = [ShieldCheck, HeartHandshake, Leaf, Sparkles, Award, BookOpen];

  return (
    <div>
      <PageHeader
        badge="About CUBE"
        title="Core Values"
        description="Centre for Urbanization, Buildings & Environment (CUBE)"
        breadcrumbs={[
          { label: 'About CUBE', href: '/about' },
          { label: 'Core Values' },
        ]}
      />

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aboutContent.coreValues.map((val, i) => {
              const Icon = icons[i % icons.length];
              return (
                <div
                  key={i}
                  className="p-8 rounded-3xl bg-slate-50 border border-slate-200 shadow-sm hover:shadow-cube hover:border-teal-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl w-fit mb-4 border border-teal-200">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold font-display text-navy-950">
                      {val.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-3 leading-relaxed">
                      {val.description}
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-200/80 text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                    Core Value {(i + 1).toString().padStart(2, '0')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

