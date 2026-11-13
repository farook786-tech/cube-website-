import React from 'react';
import Image from 'next/image';
import PageHeader from '@/components/common/PageHeader';
import { Building2, ShieldCheck, Handshake } from 'lucide-react';
import { clients } from '@/data/clients';
import { clientLogoAlt } from '@/lib/content';
import { partners } from '@/data/partners';

export const metadata = {
  title: 'Our Clients | CUBE IIT Madras',
  description: 'Clients of CUBE – Centre for Urbanization, Buildings & Environment.',
};

export default function ClientsPage() {
  return (
    <div>
      <PageHeader
        badge="About CUBE"
        title="Our Clients"
        description="Centre for Urbanization, Buildings & Environment (CUBE)"
        breadcrumbs={[
          { label: 'About CUBE', href: '/about' },
          { label: 'Our Clients' },
        ]}
      />

      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Our Clients
            </span>
            <h2 className="text-3xl font-display font-extrabold text-navy-950 mt-3">
              Our Clients
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {clients.map((client, idx) => (
              <div
                key={idx}
                className="h-28 p-4 bg-slate-50 hover:bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-cube hover:border-teal-300 transition-all flex flex-col items-center justify-center text-center group"
              >
                <div className="relative h-14 w-full">
                  <Image
                    src={client.logo}
                    alt={clientLogoAlt(client.name)}
                    fill
                    className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Partners
            </span>
            <h2 className="text-3xl font-display font-extrabold text-navy-950 mt-3">
              Partners
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {partners.map((partner, idx) => (
              <div
                key={idx}
                className="h-28 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-cube hover:border-teal-300 transition-all flex flex-col items-center justify-center text-center group"
              >
                <div className="relative h-14 w-full">
                  <Image
                    src={partner.logo}
                    alt={partner.name}
                    fill
                    className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
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

