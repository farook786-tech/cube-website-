'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Building2, Leaf, Cpu, Compass, MapPin, 
  Mail, Phone, Clock, ArrowUpRight, ShieldCheck,
  Linkedin, Twitter, Facebook
} from 'lucide-react';
import { contactInfo } from '@/data/contact';
import { verticals } from '@/data/verticals';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#FFFFFF] text-[#24272B] border-t border-[#E5E7EB]">
      {/* Top Pre-Footer Minimal Institutional Banner */}
      <div className="bg-[#EAF2F8]/70 border-b border-[#E5E7EB] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white cube-glass rounded-2xl text-[#070E5C] border border-[#BDD7E8] shadow-sm shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#D99A42]" />
              </div>
              <div>
                <h4 className="font-serif text-base font-medium text-[#24272B]">Centre of Excellence</h4>
                <p className="text-xs text-[#747B83] mt-0.5 leading-relaxed">
                  Raised by IIT Madras and the Government of Tamil Nadu.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white cube-glass rounded-2xl text-[#070E5C] border border-[#BDD7E8] shadow-sm shrink-0">
                <Building2 className="w-5 h-5 text-[#D99A42]" />
              </div>
              <div>
                <h4 className="font-serif text-base font-medium text-[#24272B]">Applied Technology &amp; Consultancy</h4>
                <p className="text-xs text-[#747B83] mt-0.5 leading-relaxed">
                  An Applied Technology, Consultancy, Advisory and Research Centre.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="p-3 bg-white cube-glass rounded-2xl text-[#070E5C] border border-[#BDD7E8] shadow-sm shrink-0">
                <Leaf className="w-5 h-5 text-[#D99A42]" />
              </div>
              <div>
                <h4 className="font-serif text-base font-medium text-[#24272B]">CUBE Environmental Laboratory (CEL)</h4>
                <p className="text-xs text-[#747B83] mt-0.5 leading-relaxed">
                  Analytical, testing and consultancy services across water, wastewater and solid waste domains.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Light Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12">
          
          {/* Col 1: Identity & Official Emblem (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-block">
              <div className="relative h-14 w-64">
                <Image
                  src="/images/branding/cube-live-logo.png"
                  alt="CUBE - Centre for Urbanization, Buildings & Environment"
                  fill
                  className="object-contain object-left"
                />
              </div>
            </Link>

            <p className="text-xs text-[#747B83] leading-relaxed max-w-sm">
              Centre for Urbanization, Buildings &amp; Environment (CUBE) has been raised by IIT Madras and the Government of Tamil Nadu as an Applied Technology, Consultancy, Advisory and Research Centre.
            </p>

            <div className="pt-2">
              <div className="text-[11px] uppercase tracking-wider font-bold text-[#24272B] mb-3">
                Follow Us
              </div>
              <div className="flex items-center space-x-2">
                <a
                  href={contactInfo.socialLinks.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-full bg-[#EAF2F8]/70 hover:bg-[#EAF2F8] text-[#24272B] hover:text-[#070E5C] transition-colors border border-[#E5E7EB]"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href={contactInfo.socialLinks.twitter}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-full bg-[#EAF2F8]/70 hover:bg-[#EAF2F8] text-[#24272B] hover:text-[#070E5C] transition-colors border border-[#E5E7EB]"
                  aria-label="Twitter"
                >
                  <Twitter className="w-4 h-4" />
                </a>
                <a
                  href={contactInfo.socialLinks.facebook}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2.5 rounded-full bg-[#EAF2F8]/70 hover:bg-[#EAF2F8] text-[#24272B] hover:text-[#070E5C] transition-colors border border-[#E5E7EB]"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Core Verticals (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-serif text-base font-semibold text-[#24272B]">
              Verticals
            </h4>
            <ul className="space-y-2.5 text-xs text-[#747B83]">
              <li>
                <Link href="/verticals/building-construction" className="hover:text-[#070E5C] transition-colors flex items-center gap-1.5">
                  <span className="text-[#D99A42]">&rsaquo;</span> Building &amp; Construction
                </Link>
              </li>
              <li>
                <Link href="/verticals/environment-sustainability" className="hover:text-[#070E5C] transition-colors flex items-center gap-1.5">
                  <span className="text-[#D99A42]">&rsaquo;</span> Environment &amp; Sustainability
                </Link>
              </li>
              <li>
                <Link href="/verticals/smart-cities" className="hover:text-[#070E5C] transition-colors flex items-center gap-1.5">
                  <span className="text-[#D99A42]">&rsaquo;</span> Smart Cities
                </Link>
              </li>
              <li>
                <Link href="/verticals/urban-planning-transportation" className="hover:text-[#070E5C] transition-colors flex items-center gap-1.5">
                  <span className="text-[#D99A42]">&rsaquo;</span> Urban Planning &amp; Transportation
                </Link>
              </li>
              <li>
                <Link href="/cel" className="hover:text-[#070E5C] transition-colors flex items-center gap-1.5">
                  <span className="text-[#D99A42]">&rsaquo;</span> CEL
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: About & Governance (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="font-serif text-base font-semibold text-[#24272B]">
              About
            </h4>
            <ul className="space-y-2.5 text-xs text-[#747B83]">
              <li>
                <Link href="/about" className="hover:text-[#070E5C] transition-colors">
                  About CUBE
                </Link>
              </li>
              <li>
                <Link href="/about/vision-mission" className="hover:text-[#070E5C] transition-colors">
                  Vision &amp; Mission
                </Link>
              </li>
              <li>
                <Link href="/about/chairman-message" className="hover:text-[#070E5C] transition-colors">
                  Chairman Message
                </Link>
              </li>
              <li>
                <Link href="/about#governing-board" className="hover:text-[#070E5C] transition-colors">
                  Board Members
                </Link>
              </li>
              <li>
                <Link href="/about/advisory-panel" className="hover:text-[#070E5C] transition-colors">
                  IIT Advisory Panel
                </Link>
              </li>
              <li>
                <Link href="/about/team" className="hover:text-[#070E5C] transition-colors">
                  Our Team
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Institutional Contact (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-serif text-base font-semibold text-[#24272B]">
              Contact Us
            </h4>
            
            <div className="space-y-3 text-xs text-[#747B83]">
              <div className="flex items-start space-x-2.5">
                <MapPin className="w-4 h-4 text-[#D99A42] shrink-0 mt-0.5" />
                <span>
                  {contactInfo.address}
                </span>
              </div>

              <div className="flex items-center space-x-2.5">
                <Mail className="w-4 h-4 text-[#D99A42] shrink-0" />
                <a href={`mailto:${contactInfo.email}`} className="text-[#24272B] font-medium hover:text-[#070E5C] transition-colors">
                  {contactInfo.email}
                </a>
              </div>

              <div className="flex items-center space-x-2.5">
                <Phone className="w-4 h-4 text-[#D99A42] shrink-0" />
                <a href={contactInfo.phoneHref} className="text-[#24272B] font-medium hover:text-[#070E5C] transition-colors">
                  {contactInfo.phone}
                </a>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/contact"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#EAF2F8] text-[#070E5C] border border-[#BBD6EA] hover:bg-[#D99A42] hover:text-[#24272B] text-xs font-semibold transition-all shadow-sm"
              >
                <span>Get in Touch</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Sub-Footer Legal & Attribution */}
      <div className="border-t border-[#E5E7EB] bg-[#EAF2F8]/70 py-6 text-xs text-[#747B83]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            &copy; {currentYear} Centre for Urbanization, Buildings &amp; Environment (CUBE). All rights reserved.
            <span className="block sm:inline sm:ml-2 text-[11px] text-[#747B83]/70">
              IIT Madras &amp; Government of Tamil Nadu.
            </span>
          </div>

          <div className="flex items-center space-x-6 text-[11px]">
            <Link href="/tenders" className="hover:text-[#070E5C] transition-colors">
              Tenders
            </Link>
            <span>&bull;</span>
            <Link href="/careers" className="hover:text-[#070E5C] transition-colors">
              Careers
            </Link>
            <span>&bull;</span>
            <Link href="/media" className="hover:text-[#070E5C] transition-colors">
              Media
            </Link>
            <span>&bull;</span>
            <Link href="/contact" className="hover:text-[#070E5C] transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
