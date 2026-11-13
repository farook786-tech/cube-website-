'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, CheckCircle2, FlaskConical, Sparkles, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CELService } from '@/types';

// The five service categories listed on the original CEL website (cube-el.org).
const CEL_SERVICE_CATEGORIES = [
  'Analysis & Testing',
  'Inspection & Audit',
  'Consultancy & Advisory',
  'Research & Development',
  'Capacity Building & Training',
];

interface CELCardProps {
  service: CELService;
}

export default function CELCard({ service }: CELCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // 3D Tilt State
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const getImageForService = (category: string) => {
    switch (category) {
      case 'Water':
        return '/images/cel/about_cel.jpg';
      case 'Wastewater':
        return '/images/cel/about_cel1.jpg';
      case 'Solid Waste':
        return '/images/cel/about_cel2.jpg';
      default:
        return '/images/cel/about_cel.jpg';
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rX = ((y - centerY) / centerY) * -8;
    const rY = ((x - centerX) / centerX) * 8;

    setRotateX(rX);
    setRotateY(rY);
  };

  // Service-specific details (if an admin adds them). The original CEL site
  // lists the testing areas by name only, so cards without their own details
  // show the CEL site's general service text in the slide-up panel instead.
  const hasDetails = Boolean(
    service.description ||
      (service.parameters && service.parameters.length > 0) ||
      (service.equipment && service.equipment.length > 0)
  );

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsExpanded(false);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onPointerEnter={(e) => e.pointerType === 'mouse' && setIsExpanded(true)}
      onClick={() => setIsExpanded(!isExpanded)}
      style={{ perspective: 1000 }}
      className={`w-full ${hasDetails ? 'h-[470px]' : 'h-[420px]'} select-none group relative cursor-pointer`}
      tabIndex={0}
      role="region"
      aria-label={`${service.title} CEL interactive 3D card`}
    >
      <motion.div
        animate={{
          rotateX,
          rotateY,
          scale: isExpanded ? 1.02 : 1,
        }}
        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
        style={{
          transformStyle: 'flat',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
        }}
        className="relative w-full h-full rounded-3xl overflow-hidden bg-white cube-glass border border-[#BDD7E8] shadow-[0_12px_36px_rgba(7,14,92,0.06)] hover:border-[#5B9BD5] transition-colors duration-300 flex flex-col justify-between"
      >
        {/* TOP CINEMATIC IMAGE WITH 3D ZOOM DEPTH */}
        <div className="relative h-60 w-full overflow-hidden bg-slate-100 shrink-0">
          <motion.div
            animate={{ scale: isExpanded ? 1.08 : 1 }}
            transition={{ duration: 0.6 }}
            className="relative w-full h-full"
          >
            <Image
              src={getImageForService(service.category)}
              alt={service.title}
              fill
              className="object-cover"
            />
          </motion.div>

          {/* Soft atmospheric overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

          {/* Floating Badges */}
          <div className="absolute top-3.5 left-3.5 right-3.5 flex justify-between items-center z-10">
            <span className="text-[10px] font-bold tracking-wider uppercase px-3 py-1 bg-white/95 text-[#070E5C] rounded-full shadow-sm backdrop-blur-sm border border-[#BBD6EA]">
              {service.category}
            </span>
          </div>

          {/* Dynamic 3D Drawer Pill */}
          <div className="absolute bottom-3 right-3 z-10 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/95 text-[#070E5C] text-[11px] shadow-sm backdrop-blur-sm border border-[#BBD6EA]">
            <Sparkles className="w-3 h-3 text-[#D99A42]" />
            <span className="text-[10px] font-semibold">
              {isExpanded ? 'Details' : (<><span className="hidden [@media(hover:hover)]:inline">Hover to Expand</span><span className="[@media(hover:hover)]:hidden">Tap to Expand</span></>)}
            </span>
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-[#D99A42]" />
            ) : (
              <ChevronUp className="w-3 h-3 text-[#D99A42]" />
            )}
          </div>
        </div>

        {/* CARD BODY CONTENT */}
        <div className="p-6 flex-1 flex flex-col justify-between bg-white relative z-10">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#D99A42] uppercase tracking-wider block">
              CUBE Environmental Laboratory (CEL)
            </span>
            <h3 className="font-serif text-lg font-bold text-[#070E5C] leading-snug line-clamp-2">
              {service.title}
            </h3>
            {service.description && (
              <p className="text-xs text-[#24272B]/85 mt-2 line-clamp-3 leading-relaxed font-sans font-normal">
                {service.description}
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs font-semibold text-[#070E5C]">
            <span>View details</span>
            <ArrowUpRight className="w-4 h-4 text-[#D99A42] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </div>

        {/* 3D ELEVATING SLIDE-UP SPECIFICATIONS DRAWER OVERLAY */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="absolute inset-x-0 bottom-0 top-16 bg-gradient-to-b from-white/95 via-white/98 to-[#F7F7F4] backdrop-blur-md p-6 flex flex-col justify-between z-20 border-t border-[#BBD6EA] shadow-2xl rounded-b-3xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
                  <div className="flex items-center space-x-1.5">
                    <FlaskConical className="w-3.5 h-3.5 text-[#070E5C]" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#070E5C]">
                      CEL Services
                    </span>
                  </div>
                  <span className="h-2 w-2 rounded-full bg-[#D99A42] animate-pulse" />
                </div>

                <h4 className="font-serif text-base font-semibold text-[#070E5C] mt-2.5 line-clamp-1">
                  {service.title}
                </h4>

                {service.description && (
                  <p className="text-xs text-[#747B83] mt-1.5 leading-relaxed line-clamp-2">
                    {service.description}
                  </p>
                )}

                {service.parameters && service.parameters.length > 0 && (
                  <div className="mt-3.5 space-y-2">
                    <div className="text-[10px] font-bold text-[#24272B] uppercase tracking-wider">
                      Tested Parameters:
                    </div>
                    <div className="space-y-1.5">
                      {service.parameters.slice(0, 3).map((pt, idx) => (
                        <div key={idx} className="flex items-start text-xs text-[#24272B]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#070E5C] mr-2 shrink-0 mt-0.5" />
                          <span className="line-clamp-1 font-medium">{pt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {service.equipment && service.equipment.length > 0 && (
                  <div className="mt-2.5 text-[11px] text-[#747B83]">
                    <span className="font-semibold text-[#24272B]">Key Instruments: </span>
                    <span>{service.equipment.slice(0, 2).join(', ')}</span>
                  </div>
                )}

                {!hasDetails && (
                  <>
                    {/* Wording from the original CEL website (cube-el.org) */}
                    <p className="text-[11px] text-[#747B83] mt-1.5 leading-snug">
                      CEL&rsquo;s exhaustive line up of Analysis and Testing services range from basic parameters like pH, turbidity to advanced parameters like COD &amp; trace heavy metals.
                    </p>
                    <div className="mt-2.5 space-y-1">
                      <div className="text-[10px] font-bold text-[#24272B] uppercase tracking-wider">
                        Our Services:
                      </div>
                      {CEL_SERVICE_CATEGORIES.map((item) => (
                        <div key={item} className="flex items-start text-[11px] text-[#24272B]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#070E5C] mr-2 shrink-0 mt-px" />
                          <span className="font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="pt-3 border-t border-[#E5E7EB]">
                <Link
                  href="/cel#enquiry"
                  className="w-full flex items-center justify-center py-2.5 px-4 rounded-full text-xs font-semibold text-[#070E5C] bg-[#EAF2F8] border border-[#BBD6EA] hover:bg-[#D99A42] hover:text-white transition-all shadow-sm group/btn"
                >
                  <span>Book A Test Now</span>
                  <ArrowUpRight className="w-4 h-4 ml-1.5 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
