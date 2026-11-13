'use client';

import React, { useRef } from 'react';
import { useScrollSpy } from '@/lib/useScrollSpy';
import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import { 
  Newspaper, Calendar, Image as ImageIcon, BookOpen, 
  ArrowRight, ArrowUpRight, Sparkles, MapPin, ExternalLink, Download
} from 'lucide-react';
import { newsItems as fallbackNewsItems } from '@/data/news';
import { useLiveList } from '@/lib/live';
import { cubeEvents, lifeAtCubeImages } from '@/data/media';
import GalleryGrid from '@/components/media/GalleryGrid';

export default function CompleteMediaExperience() {
  // Live CMS news: published items only, updates instantly on admin changes.
  const newsItems = useLiveList<any>('/api/public/news', fallbackNewsItems as any[]);

  const navAnchors = [
    { id: 'news', label: 'News' },
    { id: 'events', label: 'Events' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'life-at-cube', label: 'Life at CUBE' },
  ];

  // Highlight follows scrolling; tapping a pill still jumps to its section.
  const anchorBarRef = useRef<HTMLDivElement>(null);
  const [activeMediaTab, setActiveMediaTab] = useScrollSpy(navAnchors.map((a) => a.id), anchorBarRef);

  const scrollTo = (id: string) => {
    setActiveMediaTab(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sampleEvents = cubeEvents;

  // Photos from the original homepage's Media section (they carry no captions).

  return (
    <div className="bg-[#FFFFFF] text-[#24272B] min-h-screen">
      <PageHeader
        badge="Media"
        title="Media"
        description="News, events, gallery and life at CUBE."
        breadcrumbs={[{ label: 'Media' }]}
      />

      {/* Sticky Apple Glass Anchor Navigation Bar */}
      <section className="sticky top-[var(--nav-offset,84px)] transition-[top] duration-500 z-40 bg-white/85 backdrop-blur-2xl border-y border-[#BDD7E8]/70 py-3.5 px-4 sm:px-6 shadow-xs">
        <div ref={anchorBarRef} className="relative max-w-7xl mx-auto flex items-center justify-start gap-2 overflow-x-auto scrollbar-none no-scrollbar py-1">
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            {navAnchors.map((item) => (
              <button
                key={item.id}
                type="button"
                data-anchor={item.id}
                aria-current={activeMediaTab === item.id ? 'true' : undefined}
                onClick={() => scrollTo(item.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 whitespace-nowrap ${
                  activeMediaTab === item.id
                    ? 'bg-[#070E5C] text-white shadow-xs'
                    : 'bg-white/60 text-[#24272B] hover:bg-[#EAF2F8] hover:text-[#070E5C] border border-[#BDD7E8]/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 1. NEWS & ANNOUNCEMENTS */}
      <section id="news" className="py-20 sm:py-24 bg-gradient-to-b from-[#FFFFFF] to-[#F6FAFD] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-white px-3.5 py-1 rounded-full border border-[#BDD7E8]">
                News
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#070E5C] mt-2">
                News
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="rounded-3xl bg-white cube-glass border border-[#BDD7E8] p-6 shadow-2xs hover:shadow-md hover:border-[#8EBCE0] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#747B83] mb-3">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#EAF2F8] text-[#070E5C] border border-[#BDD7E8]">
                      {item.category || 'News'}
                    </span>
                    <span>{item.date}</span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-[#070E5C] leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-[#24272B]/80 mt-2 line-clamp-3 leading-relaxed">
                    {item.summary || item.content}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                  <span className="text-[#D99A42] font-semibold">CUBE</span>
                  <Link href={`/media/news/${(item as any).slug || item.id}`} className="font-bold text-[#070E5C] hover:underline flex items-center gap-1">
                    <span>Read More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. TECHNICAL EVENTS & WORKSHOPS */}
      <section id="events" className="py-20 sm:py-24 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-[#EAF2F8] px-3.5 py-1 rounded-full border border-[#BDD7E8]">
              Events
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#070E5C] mt-2">
              Events
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sampleEvents.map((evt, idx) => (
              <div key={idx} className="rounded-3xl bg-[#F6FAFD] cube-glass border border-[#BDD7E8] p-6 shadow-2xs flex flex-col justify-between">
                <div>
                  <div className="relative h-48 w-full rounded-2xl overflow-hidden mb-4 border border-white ring-1 ring-[#BDD7E8]">
                    <Image src={evt.image} alt={evt.title} fill className="object-cover" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D99A42]">{evt.category}{evt.date ? <> &bull; {evt.date}</> : null}</span>
                  <h3 className="font-serif font-bold text-base text-[#070E5C] mt-1 leading-snug">{evt.title}</h3>
                  {evt.location && (
                    <p className="text-xs text-[#747B83] mt-2 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#D99A42]" />
                      <span>{evt.location}</span>
                    </p>
                  )}
                  <p className="text-xs text-[#24272B]/80 mt-3 line-clamp-3 leading-relaxed">{evt.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. PHOTO GALLERY */}
      <section id="gallery" className="py-20 sm:py-24 bg-gradient-to-b from-[#FFFFFF] to-[#F6FAFD] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-[#EAF2F8] px-3.5 py-1 rounded-full border border-[#BDD7E8]">
              Gallery
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#070E5C] mt-2">
              Gallery
            </h2>
          </div>

          <GalleryGrid limit={6} />

          <div className="mt-12 text-center">
            <Link
              href="/media/gallery"
              className="inline-flex items-center px-8 py-3.5 rounded-full text-xs font-semibold text-[#070E5C] bg-white border border-[#BBD6EA] hover:bg-[#D99A42] hover:text-[#24272B] shadow-sm transition-all"
            >
              <span>View Full Gallery</span>
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. LIFE AT CUBE */}
      <section id="life-at-cube" className="py-20 sm:py-24 bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-[#EAF2F8] px-3.5 py-1 rounded-full border border-[#BDD7E8]">
              Workplace Culture
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#070E5C] mt-2">
              Life at CUBE
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {lifeAtCubeImages.map((src) => (
              <div key={src} className="group rounded-3xl overflow-hidden border border-[#BDD7E8] bg-white cube-glass shadow-2xs hover:shadow-md transition-all">
                <div className="relative h-60 w-full overflow-hidden">
                  <Image
                    src={src}
                    alt="Life at CUBE"
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
