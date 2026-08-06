import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, BadgeCheck, CalendarDays, Globe2, HeartPulse, MessageCircleMore, Phone, ShieldCheck, Sparkles, Stethoscope, Users2, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import ServiceCard from '@/components/services/ServiceCard';
import { buildWhatsAppUrl, siteContact } from '@/config/siteConfig';
import { serviceCatalog } from '@/data/serviceCatalog';

const categoryOrder = ['General Homecare', 'Hospital Management', 'Insurance & TPA', 'Healthcare Management', 'NRI Family Services', 'End of Life Services', 'Home Management', 'Training'];
const categoryIcons = {
  'General Homecare': HeartPulse,
  'Hospital Management': Stethoscope,
  'Insurance & TPA': ShieldCheck,
  'Healthcare Management': Activity,
  'NRI Family Services': Globe2,
  'End of Life Services': BadgeCheck,
  'Home Management': Activity,
  Training: Users2,
};

const categoryDescriptions = {
  'General Homecare': 'Clinical home support for seniors, recovery journeys, bedside care, ICU transitions and routine nursing needs.',
  'Hospital Management': 'Admission, discharge, diagnostics, escorting and hospital-side coordination for families who need an expert operating layer.',
  'Insurance & TPA': 'Claim workflows, cashless approvals, billing review and documentation support when care and paperwork happen together.',
  'Healthcare Management': 'Dedicated care managers, long-term monitoring, doctor coordination and family communication for complex care journeys.',
  'NRI Family Services': 'On-ground healthcare representation in India for families living abroad who need visibility, trust and rapid action.',
  'End of Life Services': 'Compassion-led support for palliative, final journey, documentation and family logistics during the most sensitive moments.',
  'Home Management': 'Non-clinical but critical support layers that keep day-to-day recovery and home-based care more stable.',
  Training: 'Caregiver training, family enablement and preparedness programmes that strengthen home recovery and caregiving quality.',
};

const ServicesPage = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    service: '',
    notes: '',
  });
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Services');

  const normalizedQuery = query.trim().toLowerCase();

  const filteredServices = useMemo(() => {
    return serviceCatalog.filter((service) => {
      const matchesCategory = activeCategory === 'All Services' || service.category === activeCategory;
      const haystack = [
        service.title,
        service.category,
        service.description,
        ...(service.benefits || []),
        ...(service.aeoQuestions || []).map((item) => `${item.question} ${item.answer}`),
      ].join(' ').toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, normalizedQuery]);

  const groupedServices = useMemo(() => {
    return categoryOrder
      .map((category) => ({
        category,
        services: filteredServices.filter((service) => service.category === category),
      }))
      .filter((group) => group.services.length > 0);
  }, [filteredServices]);

  const featuredServices = useMemo(() => serviceCatalog.slice(0, 6), []);

  const serviceCountByCategory = useMemo(() => {
    return categoryOrder.reduce((accumulator, category) => {
      accumulator[category] = serviceCatalog.filter((service) => service.category === category).length;
      return accumulator;
    }, {});
  }, []);

  const schemaGraph = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          name: 'InstantCare Healthcare Service Ecosystem',
          description: 'A premium service ecosystem covering more than 50 healthcare, homecare, NRI, insurance, palliative and coordination services.',
          url: `${siteContact.primaryDomain}/services`,
        },
        {
          '@type': 'ItemList',
          name: 'Healthcare services',
          numberOfItems: serviceCatalog.length,
          itemListElement: serviceCatalog.map((service, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${siteContact.primaryDomain}/services/${service.slug}`,
            name: service.title,
          })),
        },
      ],
    };
  }, []);

  const handleFormSubmit = (event) => {
    event.preventDefault();
    const subject = `InstantCare Service Enquiry for ${form.service || 'Healthcare Coordination'}`;
    const body = `Patient Name: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\nPreferred Service: ${form.service}\nNotes: ${form.notes}`;
    window.location.href = `mailto:${siteContact.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(buildWhatsAppUrl(`Hello InstantCare, I would like to discuss ${form.service || 'your services'}.\n\nName: ${form.name}\nPhone: ${form.phone}\nEmail: ${form.email}\nNotes: ${form.notes}`), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8faff_0%,_#ffffff_100%)] text-slate-900">
      <Helmet>
        <title>Premium Healthcare Management Services | InstantCare</title>
        <meta name="description" content="Explore InstantCare’s premium healthcare management services for NRI families, elderly parents, cancer patients, stroke recovery, chronic care and complete care coordination." />
        <meta name="keywords" content="healthcare management, care coordination, NRI healthcare, home nursing, ICU home care, palliative care, hospital coordination" />
        <link rel="canonical" href={`${siteContact.primaryDomain}/services`} />
        <meta property="og:title" content="Complete Healthcare Service Ecosystem | InstantCare" />
        <meta property="og:description" content="Browse 50+ healthcare services across home nursing, hospital management, NRI care, insurance assistance, palliative care and more." />
        <meta property="og:url" content={`${siteContact.primaryDomain}/services`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(schemaGraph)}</script>
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-20">
        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl rounded-[2.5rem] border border-slate-200/80 bg-white/85 p-8 shadow-[0_25px_80px_rgba(15,23,42,0.08)] backdrop-blur lg:p-14">
            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/20 bg-purple-50 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">
                  <Sparkles className="h-4 w-4" /> Premium Healthcare Management
                </div>
                <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl">
                  Complete healthcare lifecycle management, from prevention to end-of-life support.
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                  InstantCare is India’s premium healthcare management and care coordination company for NRI families, elderly parents living alone, cancer patients, stroke recovery journeys, ICU transitions and families needing complete reassurance.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-2xl font-bold text-slate-900">{serviceCatalog.length}+</p>
                    <p className="mt-1 text-sm text-slate-600">Healthcare services</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-2xl font-bold text-slate-900">8</p>
                    <p className="mt-1 text-sm text-slate-600">Care categories across the lifecycle</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-2xl font-bold text-slate-900">1</p>
                    <p className="mt-1 text-sm text-slate-600">Comprehensive service guidance</p>
                  </div>
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to="/book">
                    <Button className="rounded-full bg-[#7C3AED] px-7 py-5 text-base font-semibold text-white hover:bg-[#6D28D9]">
                      Book Assessment
                    </Button>
                  </Link>
                  <a href={buildWhatsAppUrl('Hello InstantCare, I would like to discuss your healthcare management services.')} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="rounded-full border-[#7C3AED]/20 bg-white px-7 py-5 text-base font-semibold text-[#7C3AED] hover:bg-purple-50">
                      <Phone className="mr-2 h-4 w-4" /> WhatsApp Now
                    </Button>
                  </a>
                </div>
              </div>

              <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="rounded-[2rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_20px_70px_rgba(15,23,42,0.15)]">
                <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.3em] text-purple-200">
                  <Zap className="h-4 w-4" /> Premium Care Coordination
                </div>
                <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <p className="font-semibold text-white">Serving Families Since 2021</p>
                    <p className="mt-1">Healthcare network across India and the UAE with a dedicated advisor assigned to every case.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <p className="font-semibold text-white">50+ Healthcare Solutions</p>
                    <p className="mt-1">From specialist home support to hospital coordination, insurance guidance and end-of-life services.</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                    <p className="font-semibold text-white">24×7 Support</p>
                    <p className="mt-1">Emergency support, advisor guidance, and care follow-up whenever your family needs it most.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
            {[
              ['Serving Since 2021', 'Trusted healthcare management experience'],
              ['India & UAE Network', 'Cross-border support for families abroad'],
              ['24/7 Care Coordination', 'Fast advisor access and urgency support'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_12px_35px_rgba(15,23,42,0.04)]">
                <p className="text-lg font-semibold text-slate-900">{title}</p>
                <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Featured Services</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">Premium support for each stage of the healthcare journey</h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">Each service page gives families a clear overview of benefits, process, eligibility, timeline, FAQs, related services and enquiry options.</p>
              </div>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              {featuredServices.map((service) => (
                <motion.div key={service.slug} whileHover={{ y: -4, scale: 1.01 }}>
                  <ServiceCard service={service} icon={HeartPulse} />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Service Ecosystem</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">Find the right service across the entire 50+ healthcare catalog</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">Search by diagnosis, support type or family need. Every result opens a detailed service page with an overview, benefits, process, eligibility, timeline, FAQs, related services and enquiry options.</p>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">{filteredServices.length} services visible</div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search cancer care, stroke recovery, hospital coordination, NRI support..."
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0"
              />
              <div className="flex flex-wrap gap-2">
                {['All Services', ...categoryOrder].map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${activeCategory === category ? 'bg-[#7C3AED] text-white' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                  >
                    {category}
                    {category !== 'All Services' ? ` (${serviceCountByCategory[category] || 0})` : ` (${serviceCatalog.length})`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-8">
            {groupedServices.map((group) => {
              const Icon = categoryIcons[group.category] || Sparkles;
              return (
                <div key={group.category} className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-[#7C3AED]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold text-slate-900">{group.category}</h3>
                        <p className="text-sm text-slate-600">{categoryDescriptions[group.category] || 'Premium care management and coordination options for every stage.'}</p>
                      </div>
                    </div>
                    <div className="rounded-full bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">{group.services.length} services</div>
                  </div>

                  <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {group.services.map((service) => (
                      <ServiceCard key={service.slug} service={service} icon={Icon} variant="compact" />
                    ))}
                  </div>
                </div>
              );
            })}

            {groupedServices.length === 0 && (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
                <p className="text-2xl font-semibold text-slate-900">No services matched your filters</p>
                <p className="mt-3 text-sm leading-7 text-slate-600">Try a broader category or search phrase such as home nursing, palliative care, ICU, claim support or NRI family services.</p>
              </div>
            )}
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-[#7C3AED] to-[#38BDF8] p-8 text-white shadow-[0_20px_70px_rgba(124,58,237,0.22)]">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-100">Need Help Choosing?</p>
              <h3 className="mt-3 text-3xl font-semibold">A dedicated healthcare advisor helps you select the right support.</h3>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={buildWhatsAppUrl('Hello InstantCare, I need help choosing the right healthcare service.')} target="_blank" rel="noreferrer" className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#7C3AED]">WhatsApp</a>
                <Link to="/book" className="rounded-full border border-white/40 px-5 py-3 text-sm font-semibold text-white">Book Assessment</Link>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Living Abroad?</p>
              <h3 className="mt-3 text-3xl font-semibold text-slate-900">We manage care in India while you focus on work and family.</h3>
              <p className="mt-4 text-sm leading-7 text-slate-600">InstantCare provides cross-border coordination, hospital representation, family updates and medical follow-up so distance never compromises care quality.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/services/parents-care-management" className="rounded-full bg-[#7C3AED] px-6 py-3 text-sm font-semibold text-white hover:bg-[#6D28D9]">Book Free Consultation</Link>
                <a href={siteContact.phoneHref} className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700">Call Advisor</a>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Raise Enquiry</p>
                <h3 className="mt-3 text-3xl font-semibold text-slate-900">A premium enquiry form for your care plan.</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">Share your care urgency, service preference and medical context. We will respond within 30 minutes for non-emergency requests and coordinate the next step with complete discretion.</p>
                <div className="mt-6 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-green-500" /> 100% Confidential</div>
                  <div className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-green-500" /> No Obligation</div>
                  <div className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-green-500" /> Dedicated Healthcare Advisor</div>
                </div>
              </div>

              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleFormSubmit}>
                <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0" placeholder="Patient Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
                <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0" placeholder="Phone Number" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
                <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0" placeholder="Preferred Service" value={form.service} onChange={(event) => setForm({ ...form, service: event.target.value })} />
                <textarea rows="4" className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0" placeholder="Tell us about the medical need, urgency and what support you require." value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
                <div className="md:col-span-2 flex flex-wrap gap-3">
                  <Button type="submit" className="rounded-full bg-[#7C3AED] px-6 py-3 text-sm font-semibold text-white hover:bg-[#6D28D9]">
                    <MessageCircleMore className="mr-2 inline h-4 w-4" /> Send Enquiry
                  </Button>
                  <Link to="/book" className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700">
                    <CalendarDays className="mr-2 inline h-4 w-4" /> Book Assessment
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ServicesPage;