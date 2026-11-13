'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

interface StripItem {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  category: string;
  link: string;
}

// Projects shown on the original CUBE homepage (https://cubeiitm.org/), with their original titles.
const STRIP_ITEMS: StripItem[] = [
  {
    id: 's1',
    title: "Third Party Quality Assurance (TPQA) Service for Construction of Permanent Campus for Indian Institute of Technology Tirupati, Andhra Pradesh.",
    subtitle: '',
    image: '/images/hero/slides_iit-tirupathi.jpg',
    category: "Building and Construction",
    link: '/projects/iit-tirupathi',
  },
  {
    id: 's2',
    title: "Re-evaluation of Structural Vulnerability, Destress Mapping & Residual Life Assessment of thirty-three dilapidated tenements across Chennai.",
    subtitle: '',
    image: '/images/hero/slides_revaluation.jpg',
    category: "Building and Construction",
    link: '/projects',
  },
  {
    id: 's3',
    title: "Feasibility Study on Identification of Alternate Location for Parayan Kuttai Water Body & Surface Water Optimization Plan for Caterpillar India Private Limited, Thiruvallur",
    subtitle: '',
    image: '/images/hero/slides_07-cat.jpg',
    category: "Environment & Sustainability",
    link: '/projects',
  },
  {
    id: 's4',
    title: "NICHE Industrial Park, SIPCOT Irungattukottai",
    subtitle: '',
    image: '/images/hero/slides_niche.jpg',
    category: "Urban Planning & Transportation",
    link: '/projects/upt2',
  },
  {
    id: 's5',
    title: "Feasibility Study on the Relocation of Two Waterbodies within the Origins - Mahindra World City, Ponneri, Tamil Nadu",
    subtitle: '',
    image: '/images/hero/slides_mahindra.jpg',
    category: "Environment & Sustainability",
    link: '/projects',
  },
];

export default function CinematicImageStrip() {
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate items for continuous smooth CSS marquee loop
  const duplicatedItems = [...STRIP_ITEMS, ...STRIP_ITEMS];

  return (
    <section className="py-20 bg-[#F7F7F4] border-y border-[#E5E7EB] overflow-hidden select-none">
      {/* Section Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest text-[#D99A42] font-bold">
              Our Projects
            </span>
            <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#24272B] tracking-tight">
              Projects
            </h2>
          </div>
        </div>
      </div>

      {/* CONTINUOUS SMOOTH AUTOPLAY MOVING CAROUSEL TRACK */}
      <div 
        className="relative w-full overflow-hidden py-4"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <motion.div
          animate={isPaused ? {} : { x: ['0%', '-50%'] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 28,
              ease: 'linear',
            },
          }}
          className="flex space-x-6 w-max"
        >
          {duplicatedItems.map((item, idx) => (
            <motion.div
              key={`${item.id}-${idx}`}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="w-[300px] sm:w-[380px] lg:w-[420px] shrink-0 group rounded-3xl overflow-hidden bg-white border border-[#E5E7EB] shadow-md hover:shadow-2xl transition-all"
            >
              {/* The whole card opens the project (previously only the small arrow did). */}
              <Link
                href={item.link}
                aria-label={item.title}
                tabIndex={idx >= STRIP_ITEMS.length ? -1 : undefined}
                aria-hidden={idx >= STRIP_ITEMS.length ? true : undefined}
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#070E5C] rounded-3xl"
              >
              {/* Image Box */}
              <div className="relative h-[230px] sm:h-[260px] w-full overflow-hidden">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                
                {/* Category Pill */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/95 text-[#24272B] shadow-sm backdrop-blur-sm">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Content Bottom */}
              <div className="p-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-serif text-lg font-medium text-[#24272B] group-hover:text-[#070E5C] transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  {item.subtitle && (
                    <p className="text-xs text-[#747B83] mt-1 line-clamp-1">
                      {item.subtitle}
                    </p>
                  )}
                </div>

                <span
                  aria-hidden
                  className="p-2.5 rounded-full bg-[#EAF2F8] text-[#070E5C] group-hover:bg-[#070E5C] group-hover:text-[#D99A42] transition-all shrink-0 mt-0.5 shadow-sm"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
