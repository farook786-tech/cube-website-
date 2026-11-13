'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, Calendar, ArrowUpRight, Maximize2 } from 'lucide-react';
import { useCmsUpdates } from '@/lib/live';
import { newsItems as fallbackNews } from '@/data/news';
import { projects as allProjects } from '@/data/projects';
import { mediaGalleryImages, lifeAtCubeImages } from '@/data/media';

/**
 * One gallery for the Media page and /media/gallery.
 * Every photo opens a viewer that shows the real content behind it:
 *  - News photos: the news story (live from the admin).
 *  - Press clippings from the original homepage "Media" section: the CUBE
 *    project the coverage is about, with that project's original description.
 *  - Life at CUBE and admin gallery photos: the photo with its admin caption.
 */
export interface GalleryEntry {
  id: string;
  src: string;
  category: string;
  title: string;
  date?: string;
  paragraphs: string[];
  link?: { href: string; label: string };
}

// Press clippings (public/images/media/news/news_newsN.jpg) and the project each
// one reports on. Headlines quoted are printed in the clippings themselves.
const PRESS: { n: number; slug: string; title?: string }[] = [
  { n: 1, slug: 'capacity-building-training-program' },
  { n: 2, slug: 'kp-park', title: 'CUBE engaged to assess quality at K.P. Park tenements' },
  { n: 3, slug: 'kp-park', title: 'CUBE engaged to assess quality at K.P. Park tenements' },
  { n: 4, slug: 'kp-park', title: 'CUBE engaged to assess quality at K.P. Park tenements' },
  { n: 5, slug: 'kp-park', title: 'CUBE engaged to assess quality at K.P. Park tenements' },
  { n: 6, slug: 'kp-park', title: 'CUBE engaged to assess quality at K.P. Park tenements' },
  { n: 7, slug: 'upt8' },
  { n: 8, slug: 'kp-park', title: 'CUBE engaged to assess quality at K.P. Park tenements' },
  { n: 9, slug: 'kp-park', title: 'CUBE engaged to assess quality at K.P. Park tenements' },
  { n: 10, slug: 'kp-park', title: 'CUBE engaged to assess quality at K.P. Park tenements' },
];

// Admin gallery categories that are asset-library images (portraits, banners),
// not gallery photos.
const NON_GALLERY = /leader|team|institutional|hero|showcase/i;

const paragraphsOf = (text: unknown): string[] =>
  String(text || '')
    .split(/\n\s*\n/)
    .map((s) => s.trim())
    .filter(Boolean);

function toTitleCase(s: string) {
  // Some original project titles are in capitals; keep them readable.
  return s === s.toUpperCase() ? s.toLowerCase().replace(/(^|\s|\()([a-z])/g, (m) => m.toUpperCase()) : s;
}

function newsEntries(list: any[]): GalleryEntry[] {
  return list
    .filter((n) => n && n.image)
    .map((n) => ({
      id: `news-${n.id}`,
      src: n.image,
      category: 'News',
      title: n.title,
      date: n.date || '',
      paragraphs: Array.isArray(n.content) && n.content.length ? n.content : paragraphsOf(n.summary),
      link: { href: `/media/news/${n.slug || n.id}`, label: 'Read the full news' },
    }));
}

function pressEntries(): GalleryEntry[] {
  return PRESS.map(({ n, slug, title }) => {
    const p: any = allProjects.find((x: any) => x.slug === slug);
    const src = mediaGalleryImages[n - 1];
    return {
      id: `press-${n}`,
      src,
      category: 'In the Media',
      title: title || (p ? toTitleCase(p.title) : 'CUBE in the media'),
      date: p?.startDate || '',
      paragraphs: p ? paragraphsOf(p.description) : [],
      link: p ? { href: `/projects/${p.slug}`, label: 'View the project' } : undefined,
    };
  }).filter((e) => e.src);
}

function lifeEntries(): GalleryEntry[] {
  return lifeAtCubeImages.map((src, i) => ({
    id: `life-${i}`,
    src,
    category: 'Life at CUBE',
    title: 'Life at CUBE',
    paragraphs: [],
    link: { href: '/life-at-cube', label: 'Life at CUBE' },
  }));
}

function adminEntries(list: any[]): GalleryEntry[] {
  return list
    .filter((g) => g && g.imageUrl && !NON_GALLERY.test(String(g.category || '')))
    .map((g) => ({
      id: `gal-${g.id}`,
      src: g.imageUrl,
      category: /lab|cel/i.test(g.category || '') ? 'Laboratory' : /project/i.test(g.category || '') ? 'Projects' : 'Gallery',
      title: g.title || 'CUBE',
      paragraphs: paragraphsOf(g.description),
    }));
}

export default function GalleryGrid({
  limit,
  showFilters = false,
}: {
  /** Show only the first N photos (e.g. 6 = two full rows on the Media page). */
  limit?: number;
  showFilters?: boolean;
}) {
  const [news, setNews] = useState<any[]>(fallbackNews as any[]);
  const [adminGallery, setAdminGallery] = useState<any[]>([]);
  const [category, setCategory] = useState('All');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [n, g] = await Promise.all([
        fetch('/api/public/news', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
        fetch('/api/public/gallery', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
      ]);
      if (Array.isArray(n)) setNews(n);
      if (Array.isArray(g)) setAdminGallery(g);
    } catch {
      // keep the built-in content
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);
  useCmsUpdates(load);

  const all = useMemo(
    () => [...newsEntries(news), ...pressEntries(), ...lifeEntries(), ...adminEntries(adminGallery)],
    [news, adminGallery]
  );
  const categories = useMemo(() => ['All', ...Array.from(new Set(all.map((e) => e.category)))], [all]);
  const filtered = category === 'All' ? all : all.filter((e) => e.category === category);
  const visible = limit ? filtered.slice(0, limit) : filtered;

  const close = useCallback(() => setOpenIndex(null), []);
  const next = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i + 1) % visible.length)),
    [visible.length]
  );
  const prev = useCallback(
    () => setOpenIndex((i) => (i === null ? i : (i - 1 + visible.length) % visible.length)),
    [visible.length]
  );

  useEffect(() => {
    if (openIndex !== null && openIndex >= visible.length) setOpenIndex(null);
  }, [openIndex, visible.length]);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [openIndex, close, next, prev]);

  const touchX = useRef<number | null>(null);
  const active = openIndex !== null ? visible[openIndex] : null;

  return (
    <>
      {showFilters && (
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                category === c
                  ? 'bg-[#EAF2F8] text-[#070E5C] border border-[#BBD6EA] shadow-sm'
                  : 'bg-[#F7F7F4] text-[#747B83] hover:text-[#24272B] hover:bg-[#EAF2F8]'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {visible.map((item, idx) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setOpenIndex(idx)}
            aria-label={`Open: ${item.title}`}
            className="group text-left rounded-3xl overflow-hidden border border-[#BDD7E8] bg-white cube-glass shadow-2xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D99A42]"
          >
            <div className="relative h-60 w-full overflow-hidden bg-[#EAF2F8]">
              <Image
                src={item.src}
                alt={item.title}
                fill
                sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070E5C]/85 via-[#070E5C]/15 to-transparent" />
              <span className="absolute top-3.5 left-3.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/90 text-[#070E5C] border border-white/80 backdrop-blur-md">
                {item.category}
              </span>
              <span className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-white/90 text-[#070E5C] opacity-0 group-hover:opacity-100 transition-opacity">
                <Maximize2 className="w-3.5 h-3.5" />
              </span>
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                {item.date && (
                  <span className="flex items-center gap-1 text-[11px] text-white/80 mb-1">
                    <Calendar className="w-3 h-3 text-[#D99A42]" />
                    {item.date}
                  </span>
                )}
                <h3 className="text-sm font-semibold leading-snug line-clamp-2">{item.title}</h3>
              </div>
            </div>
          </button>
        ))}
      </div>

      {active &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={active.title}
            className="fixed inset-0 z-[70] bg-[#050A2E]/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
            onClick={(e) => e.target === e.currentTarget && close()}
            onTouchStart={(e) => {
              touchX.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              if (touchX.current === null) return;
              const dx = e.changedTouches[0].clientX - touchX.current;
              if (Math.abs(dx) > 60) (dx < 0 ? next : prev)();
              touchX.current = null;
            }}
          >
            <div className="relative w-full max-w-6xl max-h-[92vh] bg-white rounded-3xl overflow-hidden shadow-2xl flex flex-col lg:flex-row">
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-white/90 text-[#070E5C] hover:bg-white shadow-md"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Photo */}
              <div className="relative w-full lg:w-[58%] h-[38vh] sm:h-[45vh] lg:h-auto lg:min-h-[70vh] bg-[#0B1240] shrink-0">
                <Image src={active.src} alt={active.title} fill sizes="(min-width:1024px) 60vw, 100vw" className="object-contain" />
                {visible.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={prev}
                      aria-label="Previous"
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/85 text-[#070E5C] hover:bg-white shadow-md"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={next}
                      aria-label="Next"
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/85 text-[#070E5C] hover:bg-white shadow-md"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 sm:p-8 flex flex-col">
                <span className="self-start text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#EAF2F8] text-[#070E5C] border border-[#BDD7E8]">
                  {active.category}
                </span>
                {active.date && (
                  <span className="mt-4 flex items-center gap-1.5 text-xs text-[#747B83]">
                    <Calendar className="w-3.5 h-3.5 text-[#D99A42]" />
                    {active.date}
                  </span>
                )}
                <h3 className="mt-2 font-serif text-xl sm:text-2xl text-[#070E5C] leading-snug pr-8">{active.title}</h3>
                <div className="mt-4 space-y-3">
                  {active.paragraphs.map((para, i) => (
                    <p key={i} className="text-sm text-[#4A5568] leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
                <div className="mt-auto pt-6 flex items-center justify-between gap-3">
                  {active.link ? (
                    <Link
                      href={active.link.href}
                      onClick={close}
                      className="inline-flex items-center px-5 py-2.5 rounded-full text-xs font-semibold text-[#070E5C] bg-[#EAF2F8] border border-[#BBD6EA] hover:bg-[#D99A42] hover:text-white transition-all"
                    >
                      <span>{active.link.label}</span>
                      <ArrowUpRight className="w-4 h-4 ml-1.5" />
                    </Link>
                  ) : (
                    <span />
                  )}
                  <span className="text-[11px] font-semibold text-[#D99A42]">
                    {(openIndex ?? 0) + 1} / {visible.length}
                  </span>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
