'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Building2, Leaf, Cpu, Compass, ArrowUpRight, ShieldCheck, 
  FlaskConical, CheckCircle2, Award, Users, ChevronRight, 
  Sparkles, ExternalLink, FileText, Calendar, MapPin
} from 'lucide-react';
import ArchitecturalHero from '@/components/hero/ArchitecturalHero';
import CinematicImageStrip from '@/components/home/CinematicImageStrip';
import Interactive3DAbout from '@/components/home/Interactive3DAbout';
import VerticalFlipCard from '@/components/cards/VerticalFlipCard';
import ProjectCard from '@/components/cards/ProjectCard';
import CELCard from '@/components/cards/CELCard';
import Vertical3DTeamCarousel from '@/components/cards/Vertical3DTeamCarousel';
import Interactive3DClients from '@/components/home/Interactive3DClients';

import { verticals as fallbackVerticals } from '@/data/verticals';
import { CMS_UPDATED_EVENT } from '@/lib/live';
import { projects as fallbackProjects } from '@/data/projects';
import { celOverview } from '@/data/cel';
import { boardMembers as fallbackBoardMembers, executiveLeadership } from '@/data/leadership';

const fallbackCeo = executiveLeadership.find((l) => (l.role || '').toUpperCase().includes('CEO'));
const fallbackLeadershipList: any[] = fallbackCeo
  ? [{ ...fallbackCeo, category: 'CEO' }, ...fallbackBoardMembers]
  : fallbackBoardMembers;
import { newsItems as fallbackNewsItems } from '@/data/news';
import { clients as fallbackClients } from '@/data/clients';

export default function HomePage() {
  const [activeProjectTab, setActiveProjectTab] = useState<string>('All');
  const [projectList, setProjectList] = useState<any[]>(fallbackProjects);
  const [verticalList, setVerticalList] = useState<any[]>(fallbackVerticals);
  const [celServiceList, setCelServiceList] = useState<any[]>(celOverview.testingServices);
  const [boardList, setBoardList] = useState<any[]>(fallbackLeadershipList);
  const [clientList, setClientList] = useState<any[]>(fallbackClients);
  const [newsList, setNewsList] = useState<any[]>(fallbackNewsItems);

  useEffect(() => {
    let active = true;

    const getJson = async (url: string) => {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        return res.ok ? await res.json() : null;
      } catch {
        return null;
      }
    };

    const load = async () => {
      const [projectsData, verticalsData, celData, teamData, clientsData, newsData] =
        await Promise.all([
          getJson('/api/public/projects'),
          getJson('/api/public/verticals'),
          getJson('/api/public/cel'),
          getJson('/api/public/team'),
          getJson('/api/public/clients'),
          getJson('/api/public/news'),
        ]);

      if (!active) return;

      if (Array.isArray(projectsData)) {
        setProjectList(projectsData);
      }
      if (Array.isArray(verticalsData)) {
        setVerticalList(verticalsData);
      }
      if (Array.isArray(celData)) {
        setCelServiceList(celData);
      }
      if (Array.isArray(teamData)) {
        const board = teamData
          .filter((member: any) => member.category === 'board')
          .map((member: any) => ({
            ...member,
            role: member.designation || member.role || '',
            organization: member.organization || member.department || 'IIT Madras',
          }));
        const leadership = teamData
          .filter((member: any) => member.category === 'leadership')
          .map((member: any) => ({
            ...member,
            role: member.designation || member.role || '',
            organization: member.organization || member.department || 'IIT Madras',
          }));
        const ceo = leadership.find((l: any) => (l.role || '').toUpperCase().includes('CEO'));
        const leaders = ceo
          ? [{ ...ceo, category: 'CEO' }, ...board]
          : board.length > 0
          ? board
          : leadership;
        setBoardList(leaders);
      }
      if (Array.isArray(clientsData)) {
        setClientList(
          clientsData.map((client: any) => ({
            ...client,
            category: client.category || 'Public Sector',
            logo: client.logo || client.logoUrl || '',
          }))
        );
      }
      if (Array.isArray(newsData)) {
        setNewsList(
          newsData.map((item: any) => ({
            ...item,
            summary: item.summary || item.excerpt || '',
          }))
        );
      }
    };

    load();
    // Refetch instantly whenever an admin saves content (see LiveSync).
    window.addEventListener(CMS_UPDATED_EVENT, load);
    window.addEventListener('focus', load);

    return () => {
      active = false;
      window.removeEventListener(CMS_UPDATED_EVENT, load);
      window.removeEventListener('focus', load);
    };
  }, []);

  const filteredProjects = activeProjectTab === 'All'
    ? projectList.filter(p => p.featured && p.status !== 'archived').slice(0, 3)
    : projectList.filter(p => p.category === activeProjectTab && p.status !== 'archived').slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen bg-[#FFFFFF] text-[#24272B]">
      
      {/* 1. ASYMMETRICAL EDITORIAL ARCHITECTURAL HERO */}
      <ArchitecturalHero />

      {/* 2. CINEMATIC IMAGE SEQUENCE STRIP (Video 3 Inspiration) */}
      <CinematicImageStrip />

      {/* 3. ABOUT CUBE – INTERACTIVE 3D ARCHITECTURAL SPREAD */}
      <Interactive3DAbout />

      {/* 4. FOUR VERTICALS – INTERACTIVE ARCHITECTURAL CARDS */}
      <section className="py-24 bg-[#F7F7F4] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#D99A42] font-bold">
                What We Do
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#24272B] tracking-tight">
                Verticals
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#747B83] max-w-md">
              CUBE extends its services under four verticals, namely, Building &amp; Construction, Environment &amp; Sustainability, Smart Cities and Urban Planning &amp; Transportation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {verticalList.map((vertical) => (
              <VerticalFlipCard key={vertical.id} vertical={vertical} />
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/verticals"
              className="inline-flex items-center px-6 py-3 rounded-full text-xs font-semibold text-[#070E5C] bg-white hover:bg-[#EAF2F8] border border-[#E5E7EB] shadow-sm transition-all"
            >
              <span>Explore All Verticals</span>
              <ArrowUpRight className="w-3.5 h-3.5 ml-2 text-[#D99A42]" />
            </Link>
          </div>

        </div>
      </section>

      {/* 5. FEATURED PROJECTS – EDITORIAL PORTFOLIO */}
      <section className="py-24 bg-[#FFFFFF] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#D99A42] font-bold">
                Projects
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#24272B] tracking-tight mt-1">
                Featured Projects
              </h2>
            </div>

            {/* Filter Tabs in Architectural Pill Style */}
            <div className="flex flex-wrap gap-2">
              {['All', 'Building & Construction', 'Environment & Sustainability', 'Urban Planning & Transportation'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveProjectTab(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                    activeProjectTab === cat
                      ? 'bg-[#EAF2F8] text-[#070E5C] border border-[#BBD6EA] shadow-sm'
                      : 'bg-[#F7F7F4] text-[#747B83] hover:text-[#24272B] hover:bg-[#EAF2F8]'
                  }`}
                >
                  {cat === 'Building & Construction' ? 'Buildings' : cat === 'Environment & Sustainability' ? 'Environment' : cat === 'Urban Planning & Transportation' ? 'Transport' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Project Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.slug} project={project} />
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/projects"
              className="inline-flex items-center px-8 py-3.5 rounded-full text-xs font-semibold text-[#070E5C] bg-[#EAF2F8] border border-[#BBD6EA] hover:bg-[#D99A42] hover:text-[#24272B] shadow-sm transition-all"
            >
              <span>View More Projects</span>
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

        </div>
      </section>


      {/* 6. CUBE ENVIRONMENTAL LABORATORY (CEL) - LIGHT SOPHISTICATED EDITORIAL */}
      <section className="py-24 bg-[#EAF2F8] border-b border-[#BBD6EA] text-[#24272B] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-16">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#070E5C]">
                <FlaskConical className="w-4 h-4 text-[#D99A42]" />
                <span>About CEL</span>
              </div>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#070E5C] tracking-tight">
                CUBE Environmental Laboratory (CEL)
              </h2>
              <p className="text-xs sm:text-sm text-[#747B83] leading-relaxed max-w-3xl">
                CEL is an environmental testing laboratory equipped with state-of-the-art equipment, offering a wide range of analytical, testing and consultancy services across water, wastewater and solid waste domains.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3">
              <Link
                href="/cel"
                className="px-6 py-3.5 rounded-full text-xs font-semibold text-[#070E5C] bg-[#EAF2F8] border border-[#BBD6EA] hover:bg-[#D99A42] hover:text-[#24272B] transition-all text-center shadow-sm flex items-center justify-center gap-2"
              >
                <span>Explore CEL</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/cel#enquiry"
                className="px-6 py-3.5 rounded-full text-xs font-semibold text-[#070E5C] bg-white hover:bg-[#F7F7F4] border border-[#BBD6EA] transition-all text-center"
              >
                CEL Enquiry
              </Link>
            </div>
          </div>

          {/* CEL Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {celServiceList.slice(0, 4).map((service) => (
              <CELCard key={service.id} service={service} />
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/cel"
              className="inline-flex items-center px-8 py-3.5 rounded-full text-xs font-semibold text-[#070E5C] bg-white border border-[#BBD6EA] hover:bg-[#D99A42] hover:text-[#24272B] shadow-sm transition-all"
            >
              <span>View More CEL Services</span>
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

        </div>
      </section>


      {/* 7. LIFE AT CUBE & PROFESSIONAL ENVIRONMENT */}
      <section className="py-24 bg-[#FFFFFF] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#D99A42] font-bold">
                Workplace &amp; Culture
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#24272B] tracking-tight">
                Life at CUBE
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-3xl overflow-hidden bg-white cube-glass border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all group">
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src="/images/life-at-cube/about_life.jpg"
                  alt="Life at CUBE"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden bg-white cube-glass border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all group">
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src="/images/life-at-cube/about_life1.jpg"
                  alt="Life at CUBE"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>

            <div className="rounded-3xl overflow-hidden bg-white cube-glass border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all group">
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src="/images/life-at-cube/about_life2.jpg"
                  alt="Life at CUBE"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/life-at-cube"
              className="inline-flex items-center text-xs font-semibold text-[#070E5C] hover:text-[#D99A42] transition-colors"
            >
              <span>View Life at CUBE &rarr;</span>
            </Link>
          </div>

        </div>
      </section>

      {/* 8. LEADERSHIP & DISTINGUISHED GOVERNANCE (Vertical 3D Cylindrical Carousel) */}
      <Vertical3DTeamCarousel 
        members={boardList} 
        title="Leadership"
        subtitle="Board Members of CUBE"
        tagline="Leadership"
        ctaText="View Board Members"
        ctaHref="/about#governing-board"
      />

      {/* 9. CLIENTS & INSTITUTIONAL PARTNERS (Interactive 3D Depth) */}

      <Interactive3DClients clients={clientList} />

      {/* 10. LATEST NEWS & MEDIA DISPATCHES */}
      <section className="py-24 bg-[#F7F7F4] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14 gap-6">
            <div>
              <span className="text-xs uppercase tracking-widest text-[#D99A42] font-bold">
                Media
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#24272B] tracking-tight mt-1">
                News
              </h2>
            </div>
            <Link
              href="/media/news"
              className="text-xs font-semibold text-[#070E5C] hover:text-[#D99A42] flex items-center transition-colors"
            >
              <span>View All News &rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {newsList.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="rounded-3xl bg-white cube-glass border border-[#E5E7EB] shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div>
                  <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
                    <Image
                      src={item.image || '/images/media/news/images_news1.jpg'}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white/95 text-[#070E5C] shadow-sm">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    {item.date && (
                      <div className="flex items-center text-[11px] text-[#747B83] mb-2 font-mono">
                        <Calendar className="w-3.5 h-3.5 mr-1 text-[#D99A42]" />
                        <span>{item.date}</span>
                      </div>
                    )}
                    <h3 className="font-serif text-base font-medium text-[#24272B] line-clamp-2 leading-snug group-hover:text-[#070E5C] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#747B83] mt-2 line-clamp-2 leading-relaxed">
                      {item.summary}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <Link
                    href={`/media/news/${item.slug || item.id}`}
                    className="text-xs font-semibold text-[#070E5C] hover:text-[#D99A42] flex items-center gap-1 transition-colors"
                  >
                    <span>Read More</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/media/news"
              className="inline-flex items-center px-8 py-3.5 rounded-full text-xs font-semibold text-[#070E5C] bg-white border border-[#BBD6EA] hover:bg-[#D99A42] hover:text-[#24272B] shadow-sm transition-all"
            >
              <span>View More News</span>
              <ArrowUpRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

        </div>
      </section>

      {/* 11. COLLABORATION & CONTACT CALL-TO-ACTION (Light Architectural Banner) */}
      <section className="py-24 bg-gradient-to-br from-[#EAF2F8] via-[#F7F7F4] to-[#DCEAF4] text-[#24272B] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-3xl mx-auto">
          
          <div className="relative h-28 w-28 sm:h-32 sm:w-32 mx-auto mb-6 flex items-center justify-center">
            <Image
              src="/images/branding/cube-primary-logo.png"
              alt="CUBE logo"
              fill
              className="object-contain drop-shadow-md transition-transform duration-300 hover:scale-105"
            />
          </div>

          <h2 className="font-serif text-3xl sm:text-5xl font-light text-[#070E5C] tracking-tight">
            Let&apos;s Get in Touch
          </h2>
          

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/contact"
              className="px-8 py-3.5 rounded-full text-xs font-semibold text-[#070E5C] bg-[#EAF2F8] border border-[#BBD6EA] hover:bg-[#D99A42] hover:text-[#24272B] shadow-sm transition-all flex items-center gap-2"
            >
              <span>Contact Us</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            <Link
              href="/cel"
              className="px-8 py-3.5 rounded-full text-xs font-semibold text-[#070E5C] bg-white hover:bg-[#F7F7F4] border border-[#BBD6EA] shadow-sm transition-all"
            >
              CEL
            </Link>
          </div>

        </div>
      </section>

    </div>
  );
}
