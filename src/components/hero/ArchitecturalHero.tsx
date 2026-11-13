'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowUpRight, ShieldCheck, Sparkles, Building2, 
  Layers, ChevronRight, Play, Compass, Award, ExternalLink
} from 'lucide-react';
import { GlassPanel, GlassButton } from '@/components/common/AppleLiquidGlass';

interface HeroSlide {
  id: number;
  image: string;
  category: string;
  title: string;
  italicWord: string;
  subtitle: string;
  description: string;
  projectHref: string;
  projectName: string;
  location: string;
}

// Slides from the original CUBE homepage project slider (https://cubeiitm.org/):
// vertical, tagline and project title as published there.
const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    image: '/images/hero/slides_cpcl-arc.jpg',
    category: "Building & Construction",
    title: "Empowering Urban Housing, Enhancing Quality of",
    italicWord: "Life",
    subtitle: '',
    description: "Project Management Consultancy for Construction of Affordable Rental (Urban) Housing Complex (ARHC), Manali, Chennai, Tamil Nadu.",
    projectHref: '/projects',
    projectName: "Project Management Consultancy for Construction of Affordable Rental (Urban) Housing Complex (ARHC), Manali, Chennai, Tamil Nadu.",
    location: "Manali, Chennai, Tamil Nadu",
  },
  {
    id: 2,
    image: '/images/hero/slides_iit-tirupathi.jpg',
    category: "Building & Construction",
    title: "Empowering Excellence Through Third Party Quality",
    italicWord: "Assurance",
    subtitle: '',
    description: "Third Party Quality Assurance (TPQA) Service for Construction of Permanent Campus for Indian Institute of Technology Tirupati, Andhra Pradesh.",
    projectHref: '/projects',
    projectName: "Third Party Quality Assurance (TPQA) Service for Construction of Permanent Campus for Indian Institute of Technology Tirupati, Andhra Pradesh.",
    location: "Tirupati, Andhra Pradesh",
  },
  {
    id: 3,
    image: '/images/hero/slides_design-engineering-consultancy.jpg',
    category: "Building & Construction",
    title: "Housing for All, Building a Brighter",
    italicWord: "Future",
    subtitle: '',
    description: "Design, Engineering & Consultancy Services for Reconstruction of more than forty Housing for All schemes across Tamil Nadu under Pradhan Mantri Awas Yojana.",
    projectHref: '/projects',
    projectName: "Design, Engineering & Consultancy Services for Reconstruction of more than forty Housing for All schemes across Tamil Nadu under Pradhan Mantri Awas Yojana.",
    location: "Tamil Nadu",
  },
  {
    id: 4,
    image: '/images/hero/slides_revaluation.jpg',
    category: "Building & Construction",
    title: "Mapping Stability, Charting Vulnerability, Unlocking",
    italicWord: "Potential.",
    subtitle: '',
    description: "Re-evaluation of Structural Vulnerability, Destress Mapping & Residual Life Assessment of thirty-three dilapidated tenements across Chennai.",
    projectHref: '/projects',
    projectName: "Re-evaluation of Structural Vulnerability, Destress Mapping & Residual Life Assessment of thirty-three dilapidated tenements across Chennai.",
    location: "Chennai",
  },
  {
    id: 5,
    image: '/images/hero/slides_building-training-team.jpg',
    category: "Building & Construction",
    title: "Advancing Construction Solutions and Engineering",
    italicWord: "Excellence",
    subtitle: '',
    description: "Capacity Building Training Program in Best Construction Practices for High Rise Buildings for Engineers.",
    projectHref: '/projects',
    projectName: "Capacity Building Training Program in Best Construction Practices for High Rise Buildings for Engineers.",
    location: "",
  },
  {
    id: 6,
    image: '/images/hero/slides_ashiana.jpg',
    category: "Environment & Sustainability",
    title: "Unlocking the Potential of Surface Water Management with Technological",
    italicWord: "Ingenuity",
    subtitle: '',
    description: "Surface Water Management and Flood Inundation Study for the Ashiana Subham - Senior Living",
    projectHref: '/projects',
    projectName: "Surface Water Management and Flood Inundation Study for the Ashiana Subham - Senior Living",
    location: "",
  },
  {
    id: 7,
    image: '/images/hero/slides_07-cat.jpg',
    category: "Environment & Sustainability",
    title: "Transforming Water Landscapes: Reshaping Hydrological",
    italicWord: "Balance",
    subtitle: '',
    description: "Feasibility Study on Identification of Alternate Location for Parayan Kuttai Water Body & Surface Water Optimization Plan for Caterpillar India Private Limited, Thiruvallur",
    projectHref: '/projects',
    projectName: "Feasibility Study on Identification of Alternate Location for Parayan Kuttai Water Body & Surface Water Optimization Plan for Caterpillar India Private Limited, Thiruvallur",
    location: "Thiruvallur",
  },
  {
    id: 8,
    image: '/images/hero/slides_mahindra.jpg',
    category: "Environment & Sustainability",
    title: "Nature's Engineering at Work: Conserving Water, Nurturing",
    italicWord: "Life",
    subtitle: '',
    description: "Feasibility Study on the Relocation of Two Waterbodies within the Origins - Mahindra World City, Ponneri, Tamil Nadu",
    projectHref: '/projects',
    projectName: "Feasibility Study on the Relocation of Two Waterbodies within the Origins - Mahindra World City, Ponneri, Tamil Nadu",
    location: "Ponneri, Tamil Nadu",
  },
  {
    id: 9,
    image: '/images/hero/slides_slide2.jpg',
    category: "Environment & Sustainability",
    title: "Charting a Sustainable Course: Integrating Inundation Studies into Ecological Campus",
    italicWord: "Development",
    subtitle: '',
    description: "Surface Water Management Plan for IIT Jammu Campus",
    projectHref: '/projects',
    projectName: "Surface Water Management Plan for IIT Jammu Campus",
    location: "IIT Jammu",
  },
  {
    id: 10,
    image: '/images/hero/slides_niche.jpg',
    category: "Urban Planning & Transportation",
    title: "Designing with Nature, Building for",
    italicWord: "Sustainability",
    subtitle: '',
    description: "NICHE Industrial Park, SIPCOT Irungattukottai",
    projectHref: '/projects',
    projectName: "NICHE Industrial Park, SIPCOT Irungattukottai",
    location: "SIPCOT Irungattukottai",
  },
  {
    id: 11,
    image: '/images/hero/slides_slide3.jpg',
    category: "Urban Planning & Transportation",
    title: "Honoring Legacy, Sustaining Cultural",
    italicWord: "Treasures",
    subtitle: '',
    description: "Engineering, Structural Assessment and Mitigation Strategies for Protection and Development of Naida Caves, Diu",
    projectHref: '/projects',
    projectName: "Engineering, Structural Assessment and Mitigation Strategies for Protection and Development of Naida Caves, Diu",
    location: "Diu",
  },
];

export default function ArchitecturalHero() {
  const [currentIdx, setCurrentIdx] = useState(0);
  const slide = HERO_SLIDES[currentIdx];
  const videoRef = useRef<HTMLVideoElement>(null);

  // Keep the background video looping forever. `loop` alone is not enough in
  // practice: browsers pause muted autoplay video in background tabs, in
  // power-saving mode, or block the first autoplay; some ignore `loop` on large
  // non-streaming files. Restart on end, resume when visible, and retry on the
  // first user interaction if autoplay was blocked.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const play = () => video.play().catch(() => {});
    const onEnded = () => {
      video.currentTime = 0;
      play();
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible' && video.paused) play();
    };
    // Only needed until playback has started once (autoplay blocked).
    const retryOnInteraction = () => {
      if (video.paused) play();
    };
    const stopRetrying = () => {
      window.removeEventListener('pointerdown', retryOnInteraction);
      window.removeEventListener('touchstart', retryOnInteraction);
      window.removeEventListener('scroll', retryOnInteraction);
    };
    video.addEventListener('ended', onEnded);
    video.addEventListener('playing', stopRetrying, { once: true });
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('pointerdown', retryOnInteraction, { passive: true });
    window.addEventListener('touchstart', retryOnInteraction, { passive: true });
    window.addEventListener('scroll', retryOnInteraction, { passive: true });
    play();
    return () => {
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('playing', stopRetrying);
      document.removeEventListener('visibilitychange', onVisible);
      stopRetrying();
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative w-full min-h-[92vh] lg:min-h-[96vh] bg-[#FFFFFF] pt-28 sm:pt-32 pb-16 flex flex-col justify-between overflow-hidden select-none">
      
      {/* Background Architectural Canvas with Looping Background Video & Apple Cinematic Vignette */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Looping Ambient Video */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          disablePictureInPicture
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-center filter contrast-[1.08] brightness-[0.96]"
        >
          <source src="/videos/cube-hero.mp4" type="video/mp4" />
        </video>

        {/* Apple VisionOS-style Frosted Glass Vignette: Darkens & tints smoothly so light blue & pure white fonts glow with 4K clarity */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-slate-950/80 via-slate-900/60 to-slate-950/40" />
        
        {/* Soft top blend */}
        <div className="absolute top-0 left-0 right-0 h-32 z-20 bg-gradient-to-b from-slate-950/85 via-slate-900/40 to-transparent" />
        
        {/* Short, subtle blend into the next section (was a 192px white fade) */}
        <div className="absolute bottom-0 left-0 right-0 h-14 z-20 bg-gradient-to-t from-[#F7F7F4] to-transparent" />

        {/* Ambient Cyan/Ice-Blue Refractive Glow for Apple Cinematic Look */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] z-10 bg-[#38bdf8]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] z-10 bg-[#60a5fa]/15 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* Top Institutional Metadata Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10 mb-4">
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs tracking-wider uppercase font-semibold text-white/80 border-b border-white/20 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8] shadow-[0_0_12px_#38bdf8] animate-pulse" />
            <span className="text-white font-bold tracking-wider">Centre for Urbanization, Buildings &amp; Environment</span>
            <span>&bull;</span>
            <span className="text-white/80">IIT Madras &amp; Govt of Tamil Nadu</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/projects"
              className="px-4 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/30 text-[11px] font-semibold tracking-wider transition-all shadow-sm backdrop-blur-md flex items-center gap-1.5 active:scale-95"
            >
              <span>View All Projects</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#38bdf8]" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Hero Spatial Stage: Clean Full-Width Editorial Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 z-10 flex flex-col justify-center py-6 sm:py-10">
        <div className="max-w-3xl space-y-6">
          
          {/* Category Pill & State Scheme Badge */}
          <div className="flex flex-wrap items-center gap-3">
            <motion.div
              key={`cat-${slide.id}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 border border-white/40 text-white text-xs font-semibold shadow-sm backdrop-blur-xl"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>{slide.category}</span>
            </motion.div>

            {slide.location && (
              <span className="text-[11px] font-medium text-white/90 px-3 py-1 rounded-full bg-white/10 border border-white/25 backdrop-blur-md">
                {slide.location}
              </span>
            )}
          </div>

          {/* Split-Text Animated Editorial Headline (Cormorant Garamond) */}
          <motion.div
            key={`headline-${slide.id}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-[4.5rem] font-light tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.5)] leading-[1.08]">
              {slide.title}{' '}
              <span className="italic font-normal text-[#7dd3fc] drop-shadow-[0_0_24px_rgba(56,189,248,0.4)] border-b-2 border-[#38bdf8] pb-0.5">
                {slide.italicWord}
              </span>
              {slide.subtitle ? <>{' '}{slide.subtitle}</> : null}
            </h1>
          </motion.div>

          {/* Sub-line Editorial Copy */}
          <p className="text-sm sm:text-base text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] max-w-2xl leading-relaxed font-sans font-normal">
            {slide.description}
          </p>

          {/* Interactive CTA Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/projects"
              className="px-7 py-3 rounded-full bg-white text-[#070E5C] font-semibold text-xs tracking-wider transition-all shadow-[0_4px_20px_rgba(255,255,255,0.35)] hover:bg-[#e0f2fe] hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Explore Our Projects</span>
              <ArrowUpRight className="w-4 h-4 text-[#0284c7]" />
            </Link>

          </div>

          {/* Slide Navigation Controls & Indicators */}
          <div className="flex items-center gap-4 pt-4">
            <div className="flex items-center space-x-2">
              {HERO_SLIDES.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => setCurrentIdx(idx)}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`transition-all duration-500 rounded-full cursor-pointer ${
                    currentIdx === idx 
                      ? 'w-8 h-2 bg-[#38bdf8] shadow-[0_0_12px_#38bdf8]' 
                      : 'w-2 h-2 bg-white/40 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-white/80 tracking-widest uppercase">
              {String(currentIdx + 1).padStart(2, '0')} / {String(HERO_SLIDES.length).padStart(2, '0')}
            </span>
          </div>

        </div>
      </div>

    </section>
  );
}
