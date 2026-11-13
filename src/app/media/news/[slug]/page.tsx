import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/common/PageHeader';
import { getNewsBySlug } from '@/lib/db/queries';
import { Calendar, User, ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  return {
    title: item ? `${item.title} | CUBE News` : 'News | CUBE',
    description: item?.excerpt || 'News from CUBE.',
  };
}

function toParagraphs(content: unknown): string[] {
  if (Array.isArray(content)) {
    return content.map((part) => String(part).trim()).filter(Boolean);
  }
  if (typeof content === 'string') {
    return content
      .split(/\n{2,}|\r?\n/)
      .map((part) => part.trim())
      .filter(Boolean);
  }
  return [];
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) notFound();

  const paragraphs = toParagraphs(item.content);

  return (
    <div className="bg-[#FFFFFF] min-h-screen">
      <PageHeader
        badge="News"
        title={item.title}
        description={item.excerpt}
        breadcrumbs={[{ label: 'Media', href: '/media' }, { label: 'News', href: '/media/news' }]}
      />

      <article className="py-12 sm:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/media/news"
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#070E5C] hover:text-[#D99A42] mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to all news
          </Link>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#747B83] mb-6">
            <span className="flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1 text-[#070E5C]" />
              {item.date}
            </span>
            <span className="flex items-center">
              <User className="w-3.5 h-3.5 mr-1" />
              {item.author || 'CUBE'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#EAF2F8] text-[#070E5C] font-semibold">
              {item.category}
            </span>
          </div>

          <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-[#F7F7F4] mb-8">
            <Image
              src={item.image || '/images/hero/slides_building-training-team.jpg'}
              alt={item.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#3F4650] font-sans">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)
            ) : (
              <p>{item.excerpt}</p>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}
