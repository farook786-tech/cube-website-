'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import PageHeader from '@/components/common/PageHeader';
import CELCard from '@/components/cards/CELCard';
import { CheckCircle2, Send, Loader2 } from 'lucide-react';
import { celOverview } from '@/data/cel';
import { submitEnquiryAction } from '@/app/actions/enquiries';
import { useLiveList } from '@/lib/live';

export default function CELPage() {
  // Live CMS data: updates instantly when an admin edits/archives a service.
  const testingServices = useLiveList<any>('/api/public/cel', celOverview.testingServices);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    matrix: '',
    sampleCount: '',
    parametersNeeded: '',
  });

  const [formSubmitted, setFormSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const message = `CEL Laboratory Testing Request:
Matrix: ${formData.matrix}
Estimated Samples: ${formData.sampleCount}
Parameters / Notes: ${formData.parametersNeeded || 'Standard Matrix Parameters'}`;

    const res = await submitEnquiryAction({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      organization: formData.organization,
      category: 'CEL Laboratory Testing',
      subject: `CEL Sample Testing: ${formData.matrix} from ${formData.name}`,
      message,
      sourcePage: '/cel',
    });

    if (res.success) {
      setFormSubmitted(true);
      setLoading(false);
    } else {
      setErrorMsg(res.error || 'Failed to submit laboratory enquiry.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F4F5F8] min-h-screen">
      <PageHeader
        badge="CUBE Environment Lab"
        title="CUBE Environmental Laboratory (CEL)"
        description={celOverview.description}
        breadcrumbs={[{ label: 'CEL Laboratory' }]}
      />

      {/* Overview Section */}
      <section className="py-20 bg-white border-b border-[#C4CAD8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-[#D7A00F] px-3 py-1 rounded-full shadow-sm">
                IIT Madras Research Park Facility
              </span>
              <h2 className="text-3xl font-display font-extrabold text-[#070E5C]">
                {celOverview.subtitle}
              </h2>
              {celOverview.aboutParagraphs.map((para, i) => (
                <p key={i} className="text-sm sm:text-base text-slate-700 leading-relaxed font-normal">
                  {para}
                </p>
              ))}

              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#D7A00F]">
                  Our Services:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {celOverview.serviceCategories.map((fac, i) => (
                    <div key={i} className="flex items-center text-xs font-semibold text-slate-800 bg-[#F4F5F8] p-2.5 rounded-xl border border-[#C4CAD8]">
                      <CheckCircle2 className="w-4 h-4 text-[#D7A00F] mr-2 flex-shrink-0" />
                      <span>{fac}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 relative h-96 rounded-3xl overflow-hidden shadow-cube border border-[#C4CAD8]">
              <Image
                src="/images/cel/about_cel.jpg"
                alt="CUBE Environmental Laboratory"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testing Services Cards */}
      <section className="py-20 bg-[#F4F5F8] border-b border-[#C4CAD8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-[#D7A00F] px-3 py-1 rounded-full shadow-sm">
              Our Services
            </span>
            <h2 className="text-3xl font-display font-extrabold text-[#070E5C] mt-3">
              CEL Services
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              {celOverview.servicesSummary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testingServices.map((service) => (
              <CELCard key={service.id} service={service} />
            ))}
          </div>
        </div>
      </section>

      {/* Laboratory Real-Time Booking Form */}
      <section id="enquiry" className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-[#F4F5F8] border border-[#C4CAD8] shadow-cube">
            <div className="text-center max-w-xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-wider text-[#070E5C] bg-[#D7A00F] px-3 py-1 rounded-full shadow-sm">
                Book A Test
              </span>
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-[#070E5C] mt-2">
                Laboratory Test Enquiry &amp; Booking
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2">
                Submit your sample details and the CEL team will get in touch. You can also reach CEL at {celOverview.phone} or {celOverview.email}.
              </p>
            </div>

            {formSubmitted ? (
              <div className="p-8 rounded-2xl bg-white border border-[#D7A00F] text-center space-y-3 shadow-md">
                <CheckCircle2 className="w-12 h-12 text-[#D7A00F] mx-auto" />
                <h3 className="text-lg font-bold text-[#070E5C] font-display">
                  CEL Testing Enquiry Received
                </h3>
                <p className="text-xs text-slate-700 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{formData.name}</strong>. A laboratory coordinator from CUBE Environmental Laboratory will review your testing scope for <strong>{formData.matrix}</strong> and contact you at <strong>{formData.email}</strong>.
                </p>
                <button
                  onClick={() => {
                    setFormSubmitted(false);
                    setFormData({
                      name: '',
                      email: '',
                      phone: '',
                      organization: '',
                      matrix: 'Water Quality Testing',
                      sampleCount: '1-5',
                      parametersNeeded: '',
                    });
                  }}
                  className="mt-4 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#EAF2F8] text-[#070E5C] border border-[#BBD6EA] hover:bg-[#D7A00F] hover:text-[#070E5C] transition shadow-md"
                >
                  Submit Another Sample Scope
                </button>
              </div>
            ) : (
              <form onSubmit={handleEnquirySubmit} className="space-y-5">
                {errorMsg && (
                  <div className="p-3 bg-red-100 text-red-800 text-xs rounded-xl font-medium border border-red-200">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-[#070E5C] block mb-1">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Your Full Name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C4CAD8] text-xs focus:outline-none focus:border-[#D7A00F] transition shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#070E5C] block mb-1">
                      Official Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="name@organization.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C4CAD8] text-xs focus:outline-none focus:border-[#D7A00F] transition shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#070E5C] block mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 Contact Number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C4CAD8] text-xs focus:outline-none focus:border-[#D7A00F] transition shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#070E5C] block mb-1">
                      Organization / University
                    </label>
                    <input
                      type="text"
                      placeholder="Organization name"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C4CAD8] text-xs focus:outline-none focus:border-[#D7A00F] transition shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="text-xs font-bold text-[#070E5C] block mb-1">
                      Sample Matrix / Category *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.matrix}
                      onChange={(e) => setFormData({ ...formData, matrix: e.target.value })}
                      placeholder="e.g. Water, Waste Water, Soil, Solid Waste..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C4CAD8] text-xs focus:outline-none focus:border-[#D7A00F] transition shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#070E5C] block mb-1">
                      Estimated Sample Volume *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.sampleCount}
                      onChange={(e) => setFormData({ ...formData, sampleCount: e.target.value })}
                      placeholder="Type volume manually (e.g. 5 Samples, 20 Samples, 50 Litres...)"
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C4CAD8] text-xs focus:outline-none focus:border-[#D7A00F] transition shadow-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#070E5C] block mb-1">
                    Specific Parameters / Project Notes
                  </label>
                  <textarea
                    rows={4}
                    placeholder="List the parameters you need tested and the project location..."
                    value={formData.parametersNeeded}
                    onChange={(e) => setFormData({ ...formData, parametersNeeded: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#C4CAD8] text-xs focus:outline-none focus:border-[#D7A00F] transition shadow-sm"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3 rounded-xl text-xs font-bold text-[#070E5C] bg-[#D7A00F] hover:bg-[#BF8C0B] transition shadow-cube-glow flex items-center justify-center disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        <span>Logging Laboratory Scope...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        <span>Dispatch Laboratory Enquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
