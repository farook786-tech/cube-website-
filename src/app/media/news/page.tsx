import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PageHeader from '@/components/common/PageHeader';
import { getPublishedNews } from '@/lib/db/queries';
import { Newspaper, Calendar, User, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'News | CUBE IIT Madras',
  description: 'News from the Centre for Urbanization, Buildings & Environment (CUBE).',
};

export const dynamic = 'force-dynamic';

export default async function NewsPage() {
  const newsList = await getPublishedNews();

  return (
    <div className="bg-[#FFFFFF] min-h-screen">
      <PageHeader
        badge="Media"
        title="News"
        description="News from the Centre for Urbanization, Buildings & Environment (CUBE)."
        breadcrumbs={[{ label: 'Media' }, { label: 'News' }]}
      />

      <section className="py-12 sm:py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsList.map((item) => (
              <article
                key={item.id}
                className="group rounded-2xl bg-white cube-glass border border-[#E5E7EB] overflow-hidden shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-48 w-full bg-[#F7F7F4] overflow-hidden">
                    <Image
                      src={item.image || '/images/hero/slides_building-training-team.jpg'}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/95 text-[#070E5C] border border-[#BBD6EA] shadow-2xs backdrop-blur-md">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center text-xs text-[#747B83] space-x-3 mb-2.5">
                      <span className="flex items-center">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-[#070E5C]" />
                        {item.date}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center">
                        <User className="w-3.5 h-3.5 mr-1 text-[#747B83]" />
                        {item.author || 'CUBE'}
                      </span>
                    </div>

                    <h2 className="text-base font-serif font-bold text-[#24272B] group-hover:text-[#070E5C] transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h2>

                    <p className="text-xs text-[#6B7280] mt-2 line-clamp-3 leading-relaxed">
                      {item.excerpt}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <div className="pt-4 border-t border-[#E5E7EB] flex items-center justify-between">
                    <Link
                      href={`/media/news/${item.slug || item.id}`}
                      className="text-xs font-semibold text-[#070E5C] group-hover:text-[#D99A42] group-hover:translate-x-0.5 transition-all flex items-center"
                    >
                      <span>Read More</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
