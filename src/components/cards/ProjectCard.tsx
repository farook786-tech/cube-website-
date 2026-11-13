'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Building2, CheckCircle2, ExternalLink, ArrowUpRight } from 'lucide-react';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const projectHref = `/projects/${project.slug || (project as any).id || ''}`;
  return (
    <Link
      href={projectHref}
      className="group rounded-3xl cube-gradient-card hover:-translate-y-2 transition-all duration-500 flex flex-col justify-between overflow-hidden relative cursor-pointer"
    >
      <div>
        {/* Project Thumbnail Image with Apple-style Fluid Zoom */}
        <div className="relative h-60 w-full overflow-hidden bg-slate-100">
          <Image
            src={project.heroImage || '/images/about/about_about.jpg'}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

          {/* Frosted Glass Category Pill */}
          <div className="absolute top-3.5 left-3.5 z-10">
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border border-white/80 bg-white/80 text-[#070E5C] backdrop-blur-xl shadow-xs">
              {project.category}
            </span>
          </div>

          {project.featured && (
            <div className="absolute top-3.5 right-3.5 z-10">
              <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-[#D99A42] text-white shadow-xs">
                Key Project
              </span>
            </div>
          )}

          {/* Subtle Hover Action Badge */}
          <div className="absolute bottom-3.5 right-3.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center space-x-1 px-3 py-1 rounded-full bg-white/90 text-[#070E5C] text-xs font-semibold backdrop-blur-md shadow-xs border border-white/80">
            <span>View Project</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#D99A42]" />
          </div>
        </div>

        {/* Content Body with Architectural Light Refinement */}
        <div className="p-6">
          <h3 className="text-base sm:text-lg font-bold font-serif text-[#24272B] group-hover:text-[#070E5C] transition-colors line-clamp-2 leading-snug">
            {project.title}
          </h3>

          <p className="text-xs text-[#747B83] mt-2.5 line-clamp-2 leading-relaxed font-sans">
            {project.description || (project.client ? `Client: ${project.client}` : '')}
          </p>

          {project.scopeOfWork && project.scopeOfWork.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[#E5E7EB]/70 space-y-1.5">
              <div className="text-[10px] font-bold text-[#D99A42] uppercase tracking-wider">
                Scope:
              </div>
              {project.scopeOfWork.slice(0, 2).map((item, i) => (
                <div key={i} className="flex items-start text-xs text-[#4A5568]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D99A42] mr-1.5 shrink-0 mt-0.5" />
                  <span className="line-clamp-1">{item}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer Pill Action */}
      <div className="p-6 pt-0 flex items-center justify-between text-xs text-[#747B83] border-t border-transparent group-hover:border-[#E5E7EB]/50 transition-colors">
        <span className="text-[11px] font-medium text-[#747B83]">
          {project.location || project.client || ''}
        </span>
        <div className="flex items-center space-x-1 font-semibold text-[#070E5C] group-hover:text-[#D99A42] transition-colors">
          <span>Overview</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
