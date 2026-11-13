'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/common/PageHeader';
import { 
  MapPin, Mail, Phone, Clock, Send, 
  CheckCircle2, ExternalLink, Loader2, Sparkles, Building2 
} from 'lucide-react';
import { contactInfo } from '@/data/contact';
import { submitEnquiryAction } from '@/app/actions/enquiries';
import { GlassPanel } from '@/components/common/AppleLiquidGlass';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    enquiryCategory: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await submitEnquiryAction({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      organization: formData.organization,
      category: formData.enquiryCategory,
      message: formData.message,
      sourcePage: '/contact',
    });

    if (res.success) {
      setSubmitted(true);
      setLoading(false);
    } else {
      setErrorMsg(res.error || 'Failed to send your message.');
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#FFFFFF] text-[#24272B] min-h-screen">
      <PageHeader
        badge="Contact Us"
        title="Contact Us"
        description="Centre for Urbanization, Buildings & Environment (CUBE), IIT Madras Research Park, Taramani, Chennai."
        breadcrumbs={[{ label: 'Contact Us' }]}
      />

      <section className="py-16 sm:py-20 bg-gradient-to-b from-[#FFFFFF] via-[#F6FAFD] to-[#EAF2F8] border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Left 5 Cols: Contact Coordinates & Google Map in Apple Liquid Glass */}
            <div className="lg:col-span-5 space-y-8">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#070E5C] bg-[#EAF2F8] border border-[#BDD7E8] px-3 py-1 rounded-full shadow-2xs">
                  Contact Us
                </span>
                <h2 className="font-serif text-3xl font-light text-[#24272B] tracking-tight mt-3">
                  Meet Us
                </h2>
              </div>

              {/* Coordinates List in Glass Panel */}
              <GlassPanel variant="card" className="p-6 sm:p-7 space-y-5 text-xs text-[#747B83]">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-[#D99A42] mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#24272B] block mb-0.5">Meet Us:</span>
                    <p className="leading-relaxed">
                      {contactInfo.addressLines.map((line) => (
                        <span key={line} className="block">{line}</span>
                      ))}
                    </p>
                    <a
                      href={contactInfo.googleMapsLiveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-semibold text-[#070E5C] hover:text-[#D99A42] mt-2 underline"
                    >
                      <span>Open in Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5 ml-1" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start pt-3 border-t border-[#E5E7EB]">
                  <Mail className="w-5 h-5 text-[#D99A42] mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#24272B] block mb-0.5">Drop a Mail:</span>
                    <a href={`mailto:${contactInfo.email}`} className="text-[#070E5C] hover:text-[#D99A42] font-semibold underline">
                      {contactInfo.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start pt-3 border-t border-[#E5E7EB]">
                  <Phone className="w-5 h-5 text-[#D99A42] mr-3 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-[#24272B] block mb-0.5">Let&apos;s Talk:</span>
                    <a href={contactInfo.phoneHref} className="text-[#070E5C] hover:text-[#D99A42] font-semibold underline">
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>
              </GlassPanel>

              {/* Google Maps Embed with Frosted Frame */}
              <div className="rounded-3xl overflow-hidden border border-[#BDD7E8] shadow-sm h-72 relative">
                <iframe
                  title="CUBE IIT Madras Research Park Location"
                  src={contactInfo.googleMapsEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <a
                  href={contactInfo.googleMapsLiveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[#070E5C] text-[11px] font-bold px-3 py-1.5 rounded-full shadow-sm border border-[#BDD7E8] flex items-center hover:bg-[#EAF2F8] transition"
                >
                  <span>Open in Maps</span>
                  <ExternalLink className="w-3 h-3 ml-1 text-[#D99A42]" />
                </a>
              </div>
            </div>

            {/* Right 7 Cols: Real-Time Technical Enquiry Form in Apple Liquid Glass */}
            <div className="lg:col-span-7">
              <GlassPanel variant="panel" className="p-8 sm:p-10 border border-[#BDD7E8]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#070E5C] bg-[#EAF2F8] border border-[#BDD7E8] px-3 py-1 rounded-full shadow-2xs">
                  Contact Form
                </span>
                <h2 className="font-serif text-3xl font-light text-[#24272B] tracking-tight mt-3 mb-2">
                  Let&apos;s Get in Touch
                </h2>
                <div className="mb-8" />

                {submitted ? (
                  <div className="p-8 rounded-3xl bg-white cube-glass border border-[#BDD7E8] text-center space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
                    <h3 className="text-xl font-bold font-serif text-[#24272B]">
                      Message Sent
                    </h3>
                    <p className="text-xs sm:text-sm text-[#747B83] leading-relaxed max-w-md mx-auto">
                      Thank you for contacting CUBE. We have received your message.
                    </p>
                    <button
                      onClick={() => setSubmitted(false)}
                      className="mt-4 px-6 py-2.5 rounded-full text-xs font-semibold bg-[#EAF2F8] text-[#070E5C] border border-[#BDD7E8]"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {errorMsg && (
                      <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-xs border border-red-200">
                        {errorMsg}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-[#24272B] mb-1.5">
                          Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#BDD7E8] text-xs text-[#24272B] focus:outline-none focus:border-[#070E5C] shadow-2xs"
                          placeholder="Name"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#24272B] mb-1.5">
                          Email *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#BDD7E8] text-xs text-[#24272B] focus:outline-none focus:border-[#070E5C] shadow-2xs"
                          placeholder="Email"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-[#24272B] mb-1.5">
                          Phone *
                        </label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#BDD7E8] text-xs text-[#24272B] focus:outline-none focus:border-[#070E5C] shadow-2xs"
                          placeholder="Phone"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#24272B] mb-1.5">
                          Organization
                        </label>
                        <input
                          type="text"
                          value={formData.organization}
                          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#BDD7E8] text-xs text-[#24272B] focus:outline-none focus:border-[#070E5C] shadow-2xs"
                          placeholder="Organization"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#24272B] mb-1.5">
                        Subject *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.enquiryCategory}
                        onChange={(e) => setFormData({ ...formData, enquiryCategory: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#BDD7E8] text-xs text-[#24272B] focus:outline-none focus:border-[#070E5C] shadow-2xs"
                        placeholder="Subject"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#24272B] mb-1.5">
                        Message *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-2xl bg-white border border-[#BDD7E8] text-xs text-[#24272B] focus:outline-none focus:border-[#070E5C] shadow-2xs"
                        placeholder="Enter Your Message"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-6 rounded-full text-xs font-semibold text-white bg-[#070E5C] hover:bg-[#D99A42] transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </GlassPanel>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
