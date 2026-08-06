import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQSection from '@/components/FAQSection';
import { Button } from '@/components/ui/button';
import {
  AudienceGrid,
  CoverageStrip,
  HighlightGrid,
  JourneyTimeline,
  MetricGrid,
  PrimaryActions,
  QuickAnswerCards,
  SectionShell,
  SpotlightLink,
  TestimonialGrid,
} from '@/components/home/PremiumHomeSections';
import { buildWhatsAppUrl, siteContact } from '@/config/siteConfig';
import { serviceCatalogBySlug } from '@/data/serviceCatalog';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Bed,
  BookOpenCheck,
  Brain,
  Building2,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  FileText,
  HeartPulse,
  Home,
  Hospital,
  MapPin,
  MessageCircleMore,
  Monitor,
  Phone,
  Pill,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
  Video,
  UserRoundCheck,
} from 'lucide-react';

const HomePage = () => {
  const ogImage = 'https://horizons-cdn.hostinger.com/a8e22232-a95d-404c-90b9-e488821bd3df/e5cc0df1efbb4be6faf5d180e168f0cb.jpg';
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    city: '',
    patientNeed: '',
    serviceInterest: '',
    medicalCondition: '',
    phone: '',
    email: '',
    emergency: 'No',
    relation: '',
    preferredTime: '',
    notes: '',
  });

  const heroMetrics = [
    { value: '24/7', label: 'International concierge response', detail: 'for urgent family decisions' },
    { value: 'NRI', label: 'Remote care coordination for families abroad', detail: 'updates, calls, records' },
    { value: '10+', label: 'High-dependency patient pathways', detail: 'oncology, ICU, neuro, palliative' },
    { value: 'White-Glove', label: 'Clinical, family and logistics coordination', detail: 'under one point of contact' },
  ];

  const audiences = [
    {
      title: 'NRI Families',
      description: 'A trusted India-based healthcare desk for parents, hospital admissions, medical decisions and daily updates while you live abroad.',
      icon: Building2,
    },
    {
      title: 'Senior Citizens',
      description: 'Dignified routines, medication oversight, mobility assistance, monitoring and companionship for elders who need dependable continuity.',
      icon: Home,
    },
    {
      title: 'Family Caregivers',
      description: 'A calm operating model for families handling discharge, chronic care, end-of-life planning or multiple doctors at once.',
      icon: Users,
    },
    {
      title: 'Corporate Employees',
      description: 'Premium healthcare coordination for professionals balancing demanding jobs while caring for parents or spouses in another city.',
      icon: CircleDollarSign,
    },
    {
      title: 'High-Dependency Patients',
      description: 'Cancer care, ICU transitions, stroke rehabilitation, dementia care, palliative support and bedridden care under one premium pathway.',
      icon: Activity,
    },
  ];

  const careModels = [
    {
      title: 'Executive Parent Care',
      eyebrow: 'For NRIs and busy professionals',
      description: 'A dedicated care manager runs appointments, home visits, billing coordination and family reporting so distance does not reduce control.',
      points: ['Daily summaries and urgent escalation', 'Family WhatsApp, call and video updates', 'Coordination across home, hospital and diagnostics'],
      icon: Video,
      link: 'parents-care-management',
      linkLabel: 'NRI care pathway',
    },
    {
      title: 'Recovery & Neuro Rehab',
      eyebrow: 'For stroke, surgery and ICU discharge',
      description: 'A premium rehabilitation stack with nursing oversight, medication scheduling, physiotherapy coordination and mobility-focused follow-up.',
      points: ['Discharge-to-home transition planning', 'Neurology and rehabilitation alignment', 'Progress notes for family and clinicians'],
      icon: Brain,
      link: 'stroke-rehabilitation',
      linkLabel: 'recovery service',
    },
    {
      title: 'Oncology & Comfort Care',
      eyebrow: 'For cancer, dementia and palliative needs',
      description: 'A calm, highly supported care model for symptom-led journeys, medication plans, family preparation and compassionate comfort management.',
      points: ['Multi-specialist coordination', 'Comfort, dignity and pain-awareness planning', 'Structured family briefings with rapid response access'],
      icon: HeartPulse,
      link: 'palliative-care',
      linkLabel: 'comfort care service',
    },
  ];

  const coordinationLayers = [
    {
      title: 'Clinical Command',
      eyebrow: 'Nursing, doctors and follow-ups',
      description: 'We align nurses, physicians, diagnostics and discharge instructions so care remains medically coherent.',
      points: ['Home nursing and bedside assistance', 'Doctor visits and treatment follow-up', 'Vitals, medicines and symptom coordination'],
      icon: Stethoscope,
    },
    {
      title: 'Family Communication',
      eyebrow: 'Reassurance without guesswork',
      description: 'NRIs and families receive concise updates, documented next steps and the context needed for confident decisions.',
      points: ['WhatsApp, calls and video briefing options', 'Medical records and summary sharing', 'Escalation communication for urgent changes'],
      icon: Monitor,
    },
    {
      title: 'Operations & Logistics',
      eyebrow: 'The invisible workload we absorb',
      description: 'Appointments, transport, billing, equipment, insurance and staffing are coordinated behind the scenes.',
      points: ['Diagnostics and appointment scheduling', 'Insurance, bills and hospital liaison', 'Equipment, staffing and home setup'],
      icon: ClipboardList,
    },
  ];

  const journeySteps = [
    { title: 'Private Intake', description: 'We understand the diagnosis, location, family structure, urgency and emotional context before recommending anything.' },
    { title: 'Clinical Planning', description: 'A premium care pathway is created for oncology, ICU transition, rehab, dementia, palliative support or senior home care.' },
    { title: 'Team Assembly', description: 'Nurses, attendants, physiotherapy, doctors, diagnostics and hospital coordinators are aligned to one plan.' },
    { title: 'Live Family Updates', description: 'Families receive a clear operating rhythm for reports, calls, medicines, appointments and urgent developments.' },
    { title: 'Outcome Monitoring', description: 'We track progress, escalate when needed and evolve the plan as the patient stabilises, recovers or needs more support.' },
    { title: 'Long-Term Continuity', description: 'When required, we continue with recurring review cycles, preventive monitoring and family decision support.' },
  ];

  const premiumServiceSlugs = useMemo(() => [
    'home-nursing',
    'dedicated-care-manager',
    'icu-home-care',
    'stroke-rehabilitation',
    'elder-care',
    'parents-care-management',
    'doctor-at-home',
    'palliative-care',
  ], []);

  const featuredServices = useMemo(() => {
    return premiumServiceSlugs.map((slug) => serviceCatalogBySlug[slug]).filter(Boolean).map((service, index) => ({
      title: service.title,
      description: service.description,
      eyebrow: service.category,
      icon: [HeartPulse, ShieldCheck, Activity, Brain, Home, Building2, Stethoscope, Sparkles][index] || Activity,
      link: service.slug,
      points: service.benefits?.slice(0, 3) || [],
    }));
  }, [premiumServiceSlugs]);

  const qualitySignals = [
    {
      title: 'Cancer & High-Acuity Care',
      eyebrow: 'Oncology, ICU, neuro and palliative',
      description: 'Families handling medically fragile patients need more than staffing. They need oversight, coordination and clarity.',
      points: ['Symptom-aware home support', 'Discharge and escalation planning', 'Family decision guidance'],
      icon: AlertTriangle,
    },
    {
      title: 'Senior Living at Home',
      eyebrow: 'Dementia, bedridden and daily support',
      description: 'We create sustainable home routines with dignity, monitoring and a premium communication layer for family members.',
      points: ['Medication, safety and comfort routines', 'Cognitive and mobility-sensitive support', 'Daily reporting and reassurance'],
      icon: Bed,
    },
    {
      title: 'Corporate Family Support',
      eyebrow: 'For leaders balancing work and care',
      description: 'Busy professionals can delegate the logistics and oversight while staying informed at the right moments.',
      points: ['Single point of accountability', 'Premium reporting rhythm', 'Reduced personal coordination load'],
      icon: CalendarClock,
    },
    {
      title: 'Financial & Admin Relief',
      eyebrow: 'Hospital, diagnostics and claims',
      description: 'Billing, approvals, diagnostics and visit planning are handled in a way that feels organised and executive-ready.',
      points: ['Hospital representation support', 'Insurance and documentation help', 'Appointment and transport coordination'],
      icon: CircleDollarSign,
    },
  ];

  const quickAnswers = [
    { question: 'Can you manage care for parents while I live abroad?', answer: 'Yes. We coordinate on-ground care in India while giving NRIs structured updates, calls and decision support.' },
    { question: 'Do you support cancer, ICU or stroke recovery at home?', answer: 'Yes. InstantCare builds high-dependency pathways for oncology, ICU discharge, rehab and comfort-led care.' },
    { question: 'How fast can a family speak to someone?', answer: 'Urgent requests are prioritised immediately and families can call or message the concierge desk 24/7.' },
    { question: 'What makes this premium instead of standard agency care?', answer: 'You get one coordinated operating model across staff, doctors, logistics, family communication and follow-up.' },
  ];

  const faqItems = [
    { question: 'What is included in a premium home healthcare plan?', answer: 'A typical plan includes care management, home nursing, doctor coordination, daily communication, reports, medication follow-up and escalation support.' },
    { question: 'Can you help if I live abroad and my parents are in India?', answer: 'Yes. NRI families use InstantCare for hospital coordination, home support, medical updates and one accountable local point of contact.' },
    { question: 'Do you support cancer care, ICU discharge and stroke recovery?', answer: 'Yes. These are core use cases and we align staffing, rehab, symptom support, appointments and family communication around them.' },
    { question: 'Can this work for dementia, palliative care or bedridden patients?', answer: 'Yes. We support long-term routines, comfort-focused pathways, medication planning, safety monitoring and calm family updates.' },
    { question: 'Is the homepage information enough to start?', answer: 'Yes. Families can begin with a private assessment, then we recommend the most suitable next step and service pathway.' },
    { question: 'How quickly can support be arranged?', answer: 'Urgent cases are triaged quickly. Standard consultations can usually begin the same day depending on location and care complexity.' },
  ];

  const testimonials = [
    { quote: 'We were in Toronto managing my mother’s stroke recovery in Mumbai. InstantCare gave us one clear command centre instead of ten fragmented vendors.', name: 'Anita K.', role: 'NRI Family | Canada' },
    { quote: 'The oncology support felt discreet, precise and deeply humane. The coordination quality was closer to a private concierge than a standard home-care service.', name: 'Raghav M.', role: 'Cancer Care Family | Dubai' },
    { quote: 'My father is bedridden and cognitively fragile. The structure, reporting and staffing continuity changed the emotional atmosphere of our whole family.', name: 'Meera S.', role: 'Senior Care Family | Singapore' },
    { quote: 'I lead a demanding corporate role in Bangalore while my parents live elsewhere. InstantCare reduced the invisible burden I was carrying every day.', name: 'Nitin A.', role: 'Corporate Caregiver | India' },
  ];

  const cities = ['Mumbai', 'Delhi NCR', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune', 'Ahmedabad', 'Kolkata', 'Lucknow', 'Surat'];

  const pageSchemas = [
    {
      '@context': 'https://schema.org',
      '@type': 'MedicalOrganization',
      name: 'InstantCare',
      url: siteContact.primaryDomain,
      telephone: siteContact.phoneDisplay,
      email: siteContact.email,
      areaServed: 'India',
      availableLanguage: ['English', 'Hindi'],
      description: 'Premium home healthcare, healthcare concierge and family coordination for NRIs, seniors, families and high-dependency patients in India.',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Premium Home Healthcare and Medical Concierge in India',
      url: `${siteContact.primaryDomain}/`,
      description: 'Luxury home healthcare coordination for NRIs, senior citizens, families, corporate employees and patients needing oncology, ICU, stroke, dementia or palliative support in India.',
      audience: {
        '@type': 'Audience',
        audienceType: 'NRI families, senior citizens, family caregivers, corporate professionals, cancer and ICU patients',
      },
    },
  ];

  const handleConsultationSubmit = (event) => {
    event.preventDefault();
    const message = [
      'Hello InstantCare, I would like to request a premium healthcare consultation.',
      '',
      `Name: ${formData.name || 'Not provided'}`,
      `Country: ${formData.country || 'Not provided'}`,
      `City in India: ${formData.city || 'Not provided'}`,
      `Service Interest: ${formData.serviceInterest || 'Not provided'}`,
      `Patient Need: ${formData.patientNeed || 'Not provided'}`,
      `Medical Condition: ${formData.medicalCondition || 'Not provided'}`,
      `Phone: ${formData.phone || 'Not provided'}`,
      `Email: ${formData.email || 'Not provided'}`,
      `Emergency: ${formData.emergency || 'No'}`,
      `Relation: ${formData.relation || 'Not provided'}`,
      `Preferred Call Time: ${formData.preferredTime || 'Not provided'}`,
      `Notes: ${formData.notes || 'Not provided'}`,
    ].join('\n');

    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
    setIsConsultationOpen(false);
    setFormData({
      name: '',
      country: '',
      city: '',
      patientNeed: '',
      serviceInterest: '',
      medicalCondition: '',
      phone: '',
      email: '',
      emergency: 'No',
      relation: '',
      preferredTime: '',
      notes: '',
    });
  };

  return (
    <div className="min-h-screen bg-[#04111f] font-sans text-slate-900">
      <Helmet>
        <title>Premium Home Healthcare in India for NRIs, Seniors and Families | InstantCare</title>
        <meta name="description" content="Luxury home healthcare and medical concierge support in India for NRI families, senior citizens, corporate employees and patients needing cancer care, ICU transition, stroke recovery, dementia or palliative support." />
        <meta name="keywords" content="premium home healthcare India, NRI parent care India, luxury elder care India, cancer care at home India, ICU patient care India, stroke recovery at home India, dementia care India, palliative care at home India, bedside patient care India, corporate caregiver support India" />
        <link rel="canonical" href={`${siteContact.primaryDomain}/`} />
        <meta property="og:title" content="Premium Home Healthcare in India for NRIs, Seniors and Families | InstantCare" />
        <meta property="og:description" content="A premium international-standard healthcare website for NRI families, seniors, corporate employees and high-dependency patients in India." />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={`${siteContact.primaryDomain}/`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Premium Home Healthcare in India for NRIs, Seniors and Families | InstantCare" />
        <meta name="twitter:description" content="Luxury home healthcare and medical concierge support for cancer, ICU, stroke, dementia, palliative and senior care journeys in India." />
        <meta name="twitter:image" content={ogImage} />
        {pageSchemas.map((schema, index) => (
          <script key={index} type="application/ld+json">{JSON.stringify(schema)}</script>
        ))}
      </Helmet>

      <Navbar />
      <main className="overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(139,92,246,0.28),transparent_28%),radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_22%),linear-gradient(180deg,#04111f_0%,#071a2d_38%,#08131f_100%)] pt-24 sm:pt-28 lg:pt-32">
        <section className="relative px-4 pb-14 pt-8 sm:px-6 lg:px-8 lg:pb-20 lg:pt-12">
          <div className="absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_58%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-[#DDD6FE] backdrop-blur">
                <Sparkles className="h-4 w-4" /> International-standard healthcare concierge
              </div>
              <h1 className="mt-6 font-['Poppins'] text-4xl font-semibold leading-[1.02] tracking-[-0.03em] text-white sm:text-5xl lg:text-[4.5rem]">
                Premium home healthcare in India for families who cannot afford uncertainty.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                InstantCare serves NRIs, senior citizens, family caregivers, corporate employees and medically fragile patients with private coordination across cancer care, ICU transitions, stroke recovery, dementia support, palliative care and bedside home care.
              </p>
              <div className="mt-8">
                <PrimaryActions
                  onOpenConsultation={() => setIsConsultationOpen(true)}
                  whatsappMessage="Hello InstantCare, I need premium healthcare support for my family in India."
                />
              </div>
              <div className="mt-10">
                <MetricGrid items={heroMetrics} />
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="rounded-[2rem] border border-white/12 bg-white/10 p-4 shadow-[0_30px_80px_rgba(2,8,23,0.22)] backdrop-blur-xl">
              <div className="rounded-[1.7rem] border border-white/12 bg-[linear-gradient(160deg,rgba(255,255,255,0.94),rgba(240,249,255,0.78))] p-6 text-slate-900 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7C3AED]">Private assessment desk</p>
                    <h2 className="mt-3 font-['Poppins'] text-2xl font-semibold leading-tight text-slate-950 sm:text-3xl">One premium care operating model across home, hospital and family communication.</h2>
                  </div>
                  <div className="rounded-2xl bg-slate-950 p-3 text-white shadow-[0_15px_35px_rgba(15,23,42,0.18)]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {[
                    { label: 'Audience', value: 'NRIs, elders, corporates' },
                    { label: 'Clinical Focus', value: 'Cancer, ICU, stroke, dementia' },
                    { label: 'Service Layer', value: 'Nurses, doctors, rehab, reports' },
                    { label: 'Response Mode', value: 'Phone, WhatsApp, video, updates' },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.35rem] border border-slate-200 bg-white/90 p-4 shadow-[0_10px_25px_rgba(15,23,42,0.06)]">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{item.label}</p>
                      <p className="mt-2 text-sm font-semibold text-slate-900">{item.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 rounded-[1.5rem] bg-slate-950 p-5 text-white shadow-[0_20px_40px_rgba(15,23,42,0.14)]">
                  <div className="flex items-center gap-3 text-sm font-semibold text-slate-100">
                    <Video className="h-4 w-4 text-[#22D3EE]" /> Video and family update rhythm available
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">From first assessment to long-term oversight, families receive a clear, premium cadence of updates instead of fragmented communication.</p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <SpotlightLink to="/services/parents-care-management" title="NRI care" />
                    <SpotlightLink to="/services/dedicated-care-manager" title="Care manager" />
                    <SpotlightLink to="/healthcare-library" title="Healthcare library" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <SectionShell
          eyebrow="Who We Serve"
          title="A premium international healthcare service for the people carrying the most pressure."
          description="Every pathway is designed to reduce medical, logistical and emotional overload for the people making critical care decisions."
          badge="Mobile-first and family-led"
        >
          <AudienceGrid items={audiences} />
        </SectionShell>

        <SectionShell
          eyebrow="Premium Care Models"
          title="Luxury healthcare pathways for complex family situations, not generic one-size-fits-all staffing."
          description="Each pathway is designed for a distinct care burden, whether the family is abroad, managing rehabilitation or navigating medically fragile home care."
          badge="Tailored care pathways"
        >
          <HighlightGrid items={careModels} linkPrefix="/services/" />
        </SectionShell>

        <SectionShell
          eyebrow="Service Spotlight"
          title="A services ecosystem that connects care teams, specialists and family communication."
          description="Explore services that support every stage of care, from urgent coordination to long-term recovery and family updates."
          badge="Featured services"
        >
          <HighlightGrid items={featuredServices} linkPrefix="/services/" />
        </SectionShell>

        <SectionShell
          eyebrow="How It Works"
          title="From private assessment to long-term continuity, every step is structured to feel calm, premium and precise."
          description="Families do not have to assemble the care system themselves. We absorb the coordination load and keep every stakeholder aligned."
          badge="Accessible and guided"
        >
          <JourneyTimeline items={journeySteps} />
          <div className="mt-8">
            <PrimaryActions
              onOpenConsultation={() => setIsConsultationOpen(true)}
              whatsappMessage="Hello InstantCare, I want to understand the premium care journey for my family."
            />
          </div>
        </SectionShell>

        <SectionShell
          eyebrow="Why It Feels Premium"
          title="The difference is not just staffing. It is the quality of oversight, communication and operating discipline around the patient."
          description="The highest-stress care journeys become safer and more manageable when one system owns the details."
          badge="Glassmorphism experience"
        >
          <HighlightGrid items={coordinationLayers} />
          <div className="mt-10">
            <HighlightGrid items={qualitySignals} />
          </div>
        </SectionShell>

        <SectionShell
          eyebrow="AEO Quick Answers"
          title="Direct answers for the questions families ask most before they choose care."
          description="This section is designed for fast comprehension, answer-engine visibility and confident first-contact decisions."
          badge="Short-answer optimized"
        >
          <QuickAnswerCards items={quickAnswers} />
          <div className="mt-8 rounded-[1.6rem] border border-white/12 bg-white/10 p-6 backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#C4B5FD]">Knowledge support</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Explore trusted articles for families managing critical, senior and long-term care in India.</h3>
              </div>
              <Button asChild className="rounded-full bg-white px-6 py-6 text-sm font-semibold text-slate-950 hover:bg-slate-100">
                <Link to="/healthcare-library">
                  Visit Healthcare Library <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </SectionShell>

        <SectionShell
          eyebrow="Proof and Presence"
          title="Families trust premium healthcare experiences that combine emotional intelligence with disciplined execution."
          description="The care promise has to hold across cities, across time zones and across clinically difficult situations."
          badge="Coverage across major care corridors"
        >
          <TestimonialGrid items={testimonials} />
          <div className="mt-10 rounded-[1.6rem] border border-white/12 bg-white/10 p-6 backdrop-blur">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#C4B5FD]">Coverage</p>
                <h3 className="mt-2 text-2xl font-semibold text-white">Active care coordination across India’s most requested metropolitan and family-care corridors.</h3>
              </div>
              <Button asChild variant="outline" className="rounded-full border-white/15 bg-white/10 px-6 py-6 text-sm font-semibold text-white hover:bg-white/15 hover:text-white">
                <Link to="/services">
                  Explore All Services <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-6">
              <CoverageStrip items={cities} />
            </div>
          </div>
        </SectionShell>

        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-white/12 bg-[linear-gradient(135deg,rgba(139,92,246,0.28),rgba(34,211,238,0.14))] p-6 shadow-[0_30px_80px_rgba(2,8,23,0.18)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#E9D5FF]">FAQ and Next Step</p>
                <h2 className="mt-3 font-['Poppins'] text-3xl font-semibold tracking-tight text-white sm:text-4xl">Everything families need to decide faster, with less confusion.</h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">This final section closes the loop with direct answers, private consultation access and a single way to start the relationship.</p>
                <div className="mt-8">
                  <PrimaryActions
                    onOpenConsultation={() => setIsConsultationOpen(true)}
                    whatsappMessage="Hello InstantCare, I would like to begin a premium assessment for my family."
                  />
                </div>
              </div>
              <FAQSection
                items={faqItems}
                title="Frequently asked questions"
                description="Short, trustworthy answers for NRI families, seniors, caregivers and high-dependency home care decisions."
                showSearch={false}
                className="border-white/15 bg-white text-slate-900 shadow-[0_20px_60px_rgba(2,8,23,0.16)]"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <AnimatePresence>
        {isConsultationOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/75 px-4 py-6 backdrop-blur-sm">
            <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }} role="dialog" aria-modal="true" aria-labelledby="premium-consultation-title" className="w-full max-w-4xl rounded-[2rem] border border-white/15 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] p-6 shadow-[0_25px_80px_rgba(15,23,42,0.24)] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#7C3AED]">Private Consultation</p>
                  <h2 id="premium-consultation-title" className="mt-2 font-['Poppins'] text-2xl font-semibold text-slate-900 sm:text-3xl">Start a premium healthcare assessment</h2>
                  <p className="mt-2 text-sm leading-7 text-slate-600">Share the patient context once. We format it for the concierge team and open a ready-to-send WhatsApp request.</p>
                </div>
                <button type="button" aria-label="Close consultation form" onClick={() => setIsConsultationOpen(false)} className="rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600">
                  Close
                </button>
              </div>

              <form onSubmit={handleConsultationSubmit} className="mt-8 grid gap-4 md:grid-cols-2">
                {[
                  ['name', 'Name'],
                  ['country', 'Country'],
                  ['city', 'City in India'],
                  ['serviceInterest', 'Service Interest'],
                  ['patientNeed', 'Patient Need'],
                  ['medicalCondition', 'Medical Condition'],
                  ['phone', 'Phone'],
                  ['email', 'Email'],
                  ['relation', 'Relation'],
                  ['preferredTime', 'Preferred Call Time'],
                ].map(([key, label]) => (
                  <label key={key} className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    <span>{label}</span>
                    <input
                      required={['name', 'phone', 'patientNeed'].includes(key)}
                      value={formData[key]}
                      onChange={(event) => setFormData({ ...formData, [key]: event.target.value })}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0"
                    />
                  </label>
                ))}
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 md:col-span-2">
                  <span>Emergency?</span>
                  <select value={formData.emergency} onChange={(event) => setFormData({ ...formData, emergency: event.target.value })} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0">
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 md:col-span-2">
                  <span>Notes</span>
                  <textarea value={formData.notes} onChange={(event) => setFormData({ ...formData, notes: event.target.value })} rows="4" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none ring-0" />
                </label>
                <div className="md:col-span-2 flex flex-wrap gap-3">
                  <Button type="submit" className="rounded-full bg-[#7C3AED] px-6 py-4 text-sm font-semibold text-white hover:bg-[#6D28D9]">
                    <MessageCircleMore className="mr-2 h-4 w-4" /> Send to WhatsApp
                  </Button>
                  <Button asChild type="button" variant="outline" className="rounded-full border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    <a href={siteContact.phoneHref}>
                      <Phone className="mr-2 h-4 w-4" /> Call Instead
                    </a>
                  </Button>
                  <Button type="button" variant="outline" className="rounded-full border-slate-200 bg-white px-6 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50" onClick={() => setIsConsultationOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePage;