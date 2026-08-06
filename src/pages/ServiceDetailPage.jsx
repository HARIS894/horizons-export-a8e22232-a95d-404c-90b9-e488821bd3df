import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Ambulance, ArrowRight, BadgeCheck, BookOpenCheck, CalendarDays, CheckCircle2, ClipboardList, Clock3, FileText, FlaskConical, HeartPulse, Home, MessageCircleMore, Phone, ShieldCheck, Sparkles, Stethoscope, UserRound } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import FAQSection from '@/components/FAQSection';
import ServiceCard from '@/components/services/ServiceCard';
import { Button } from '@/components/ui/button';
import { buildWhatsAppUrl, siteContact } from '@/config/siteConfig';
import { serviceCatalogBySlug } from '@/data/serviceCatalog';
import { getBreadcrumbSchema, getFAQSchema, getServiceSchema } from '@/utils/seoUtils';

const defaultEligibility = [
  'Patients who need structured home or care coordination support',
  'Families who can share current medical history and care priorities',
  'Cases where a personalised care plan and follow-up are appropriate',
];

const defaultDocuments = [
  'Patient photo ID',
  'Recent medical reports or discharge summary',
  'Prescription and current medication list',
];

const defaultPatientJourney = [
  'Initial assessment and care planning',
  'Service coordination and professional matching',
  'Ongoing monitoring with family updates',
  'Review, follow-up and next-step planning',
];

const defaultScenarios = [
  'A family wants dependable support for a parent recovering after discharge.',
  'An NRI family needs visibility and coordination for a loved one in India.',
  'A patient needs a medically structured home support plan with clear follow-up.',
];

const defaultWhyChoose = [
  'Dedicated healthcare coordination instead of one-off vendor booking',
  'Responsive communication with family reassurance built into the process',
  'Structured planning across home care, doctors, hospitals and follow-up',
  'Premium service standards with conversion-ready call, WhatsApp and enquiry actions',
];

const legacySlugAliases = {
  'nurse-at-home': 'home-nursing',
  'elder-care': 'elder-care',
  'patient-attendant': 'patient-attendant',
  'icu-at-home': 'icu-home-care',
  'doctor-at-home': 'doctor-at-home',
  'physiotherapy-at-home': 'home-physiotherapy',
  'palliative-care': 'palliative-care',
  'parents-care-management': 'parents-care-management',
};

const slugifyTitle = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const resolveRelatedService = (value) => {
  if (!value) return null;
  if (serviceCatalogBySlug[value]) return serviceCatalogBySlug[value];
  if (legacySlugAliases[value] && serviceCatalogBySlug[legacySlugAliases[value]]) {
    return serviceCatalogBySlug[legacySlugAliases[value]];
  }

  const normalized = slugifyTitle(value);
  if (serviceCatalogBySlug[normalized]) return serviceCatalogBySlug[normalized];

  return Object.values(serviceCatalogBySlug).find((service) => slugifyTitle(service.title) === normalized) || null;
};

const DetailPanel = ({ eyebrow, title, children, className = '' }) => (
  <div className={`rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)] ${className}`}>
    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">{eyebrow}</p>
    <h2 className="mt-3 text-2xl font-bold text-slate-900">{title}</h2>
    <div className="mt-6">{children}</div>
  </div>
);

const ServiceDetailPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    urgency: 'Standard',
    notes: '',
  });

  const serviceMap = {
    'nurse-at-home': {
      title: 'Nurse at Home',
      seoTitle: 'Nurse at Home | InstantCare Home Healthcare',
      description: 'Professional nurse visits for recovery, medication support, wound care and post-operative monitoring in the comfort of your home.',
      heroBadge: 'Trusted Nursing Support',
      heroTitle: 'Skilled nursing care delivered with compassion at home.',
      heroText: 'From medication management to post-surgery support, our nurses provide medical-grade assistance with calm, expertise and dignity.',
      benefits: ['Medication and injection support', 'Vital signs monitoring', 'Wound dressing and recovery guidance', 'Flexible day and night visits'],
      audience: ['Post-surgery patients', 'Elderly family members', 'Chronic care patients', 'Anyone needing short-term medical support'],
      process: ['Share your care needs', 'We match a qualified nurse', 'Care begins with a clinical plan', 'We track progress and update your family'],
      faq: [
        { question: 'Do you provide day and night nursing?', answer: 'Yes, we offer both 12-hour and 24-hour nursing options based on your care needs.' },
        { question: 'Can nurses assist with injections?', answer: 'Absolutely. Our nurses are trained to manage medication schedules, injections and routine observations safely.' },
        { question: 'How quickly can a nurse be assigned?', answer: 'We usually arrange visits quickly, depending on availability and urgency in your area.' }
      ],
      related: ['Elder Care', 'ICU at Home', 'Patient Attendant']
    },
    'elder-care': {
      title: 'Elder Care',
      seoTitle: 'Elder Care at Home | InstantCare',
      description: 'Compassionate senior support for mobility, hygiene, nutrition and companionship at home.',
      heroBadge: 'Elderly Care Excellence',
      heroTitle: 'Thoughtful care for seniors, designed around dignity and comfort.',
      heroText: 'Our caregivers provide day-to-day support so your loved ones can age gracefully and safely at home.',
      benefits: ['Daily living assistance', 'Mobility and fall prevention support', 'Medication reminders and companionship', 'Hygiene and nutrition care'],
      audience: ['Seniors living alone', 'Families managing daily care', 'Post-hospital recovery patients', 'Older adults needing dependable support'],
      process: ['Assess daily support needs', 'Match with a trained caregiver', 'Create a care routine', 'Maintain regular updates and comfort care'],
      faq: [
        { question: 'Is elder care suitable for dementia patients?', answer: 'Yes, we can support routines and companionship for seniors with memory-related conditions.' },
        { question: 'Can care be provided for a few hours only?', answer: 'Yes, we offer flexible care durations based on your family’s needs.' },
        { question: 'Do caregivers help with medicine reminders?', answer: 'Yes, they can help remind and monitor medication routines as part of a care plan.' }
      ],
      related: ['Nurse at Home', 'Patient Attendant', 'Palliative Care']
    },
    'patient-attendant': {
      title: 'Patient Attendant',
      seoTitle: 'Patient Attendant Services | InstantCare',
      description: 'Dedicated attendants for mobility, personal care, feeding and bedside support for recovering patients.',
      heroBadge: 'Personal Care Support',
      heroTitle: 'Reliable bedside assistance for recovery, comfort and daily care.',
      heroText: 'Our attendants deliver attentive support for bathing, repositioning, feeding and safe movement in your home.',
      benefits: ['Personal hygiene support', 'Position changing and comfort care', 'Feeding and mobility help', 'Calm companionship and supervision'],
      audience: ['Bedridden patients', 'Post-operative recovery', 'Home-based rehabilitation', 'Families needing short-term support'],
      process: ['Discuss patient requirements', 'Assign an experienced attendant', 'Begin care with a structured plan', 'Review progress and adjust support'],
      faq: [
        { question: 'Can attendant services be arranged for a few days?', answer: 'Yes, we offer flexible short-term and long-term support plans.' },
        { question: 'Do attendants help with transfers?', answer: 'Yes, attendants can support safe movement and basic transfers when appropriate.' },
        { question: 'Is this suitable after discharge?', answer: 'Absolutely. It is especially helpful for post-hospital recovery at home.' }
      ],
      related: ['Nurse at Home', 'Elder Care', 'Physiotherapy at Home']
    },
    'icu-at-home': {
      title: 'ICU at Home',
      seoTitle: 'ICU at Home | InstantCare',
      description: 'Critical care support at home with monitoring, equipment assistance and specialist coordination.',
      heroBadge: 'Critical Care at Home',
      heroTitle: 'Intensive, medically guided support when recovery needs continue at home.',
      heroText: 'We help families provide structured care for complex conditions without compromising on comfort or clinical oversight.',
      benefits: ['Advanced monitoring support', 'Equipment setup and supervision', 'Care coordination with doctors', 'Rapid escalation when needed'],
      audience: ['Post-ICU patients', 'Families managing severe recovery', 'Chronic critical care needs', 'High-dependency patients at home'],
      process: ['Review medical needs and equipment', 'Deploy a trained care team', 'Create a monitoring plan', 'Provide ongoing updates and support'],
      faq: [
        { question: 'Is ICU at Home safe for high-dependency patients?', answer: 'Yes, when supervised by trained professionals and coordinated with medical guidance.' },
        { question: 'Do you assist with equipment?', answer: 'We help arrange and manage the right care setup for home-based recovery.' },
        { question: 'Can this be arranged after hospital discharge?', answer: 'Yes, it is one of the most common uses for this service.' }
      ],
      related: ['Nurse at Home', 'Palliative Care', 'Doctor at Home']
    },
    'doctor-at-home': {
      title: 'Doctor at Home',
      seoTitle: 'Doctor at Home | InstantCare',
      description: 'In-home physician consultations for diagnosis, follow-up care and treatment guidance without travel.',
      heroBadge: 'Home Consultation Care',
      heroTitle: 'Clinical advice and care in the comfort of your own home.',
      heroText: 'Get medical assessment and treatment guidance from experienced professionals from the comfort of home.',
      benefits: ['Convenient home consults', 'Follow-up care and prescription support', 'Reduced travel stress', 'Better continuity for older adults'],
      audience: ['Elderly patients', 'Post-hospital recovery', 'New mothers', 'Patients with limited mobility'],
      process: ['Request a consultation', 'Doctor reviews condition and history', 'Treatment plan is shared', 'Follow-up care is coordinated if needed'],
      faq: [
        { question: 'Can a doctor visit be arranged urgently?', answer: 'Yes, urgent consultation requests are assessed based on availability and medical need.' },
        { question: 'Is this suitable for chronic conditions?', answer: 'Yes, follow-up visits help families maintain continuity in care.' },
        { question: 'Will the doctor provide prescriptions?', answer: 'Depending on the consultation, prescription support can be provided as appropriate.' }
      ],
      related: ['Nurse at Home', 'Lab Test at Home', 'Doctor at Home']
    },
    'physiotherapy-at-home': {
      title: 'Physiotherapy at Home',
      seoTitle: 'Physiotherapy at Home | InstantCare',
      description: 'Rehabilitation sessions at home for mobility, posture, strength and recovery after illness or injury.',
      heroBadge: 'Rehabilitation Support',
      heroTitle: 'Restore strength and mobility with guided physiotherapy at home.',
      heroText: 'Our physiotherapy plan helps patients recover steadily with personalised movement guidance and routine support.',
      benefits: ['Mobility and strength exercises', 'Post-operative rehabilitation', 'Joint and posture support', 'Home-based convenience'],
      audience: ['Post-surgery patients', 'Stroke recovery patients', 'Orthopaedic patients', 'Elderly individuals with movement limitations'],
      process: ['Review the condition and goals', 'Create a tailored therapy plan', 'Begin guided sessions at home', 'Track progress and adjust therapy'],
      faq: [
        { question: 'Can physiotherapy help after stroke?', answer: 'Yes, guided exercises can support strength, balance and coordination recovery.' },
        { question: 'Do I need equipment?', answer: 'We use simple equipment and bodyweight routines where suitable.' },
        { question: 'How often are sessions arranged?', answer: 'The plan depends on recovery goals and physician guidance.' }
      ],
      related: ['Nurse at Home', 'Stroke Care at Home', 'ICU at Home']
    },
    'lab-test-at-home': {
      title: 'Lab Test at Home',
      seoTitle: 'Lab Test at Home | InstantCare',
      description: 'Convenient diagnostics and home sample collection for timely, stress-free health testing.',
      heroBadge: 'Home Diagnostics',
      heroTitle: 'Accessible lab testing with comfort and convenience at home.',
      heroText: 'Schedule sample collection from home and receive organised support without the stress of a clinic visit.',
      benefits: ['Convenient sample collection', 'Reduced travel and wait time', 'Support for repeat testing', 'Clear coordination and reporting'],
      audience: ['Elderly patients', 'Busy families', 'Post-discharge follow-up', 'Individuals needing regular checkups'],
      process: ['Book a sample collection slot', 'A technician arrives at home', 'Samples are processed', 'Reports are shared with the family or doctor'],
      faq: [
        { question: 'Can this be arranged for elderly patients?', answer: 'Yes, this is ideal for seniors who prefer home-based diagnostics.' },
        { question: 'How quickly are reports shared?', answer: 'Reporting timelines depend on the type of test and partner labs.' },
        { question: 'Is this suitable for routine tests?', answer: 'Yes, many regular screening and follow-up tests can be arranged this way.' }
      ],
      related: ['Doctor at Home', 'Nurse at Home', 'Cancer Care at Home']
    },
    'injection-at-home': {
      title: 'Injection at Home',
      seoTitle: 'Injection at Home | InstantCare',
      description: 'Safe and professional administration of prescribed injections in your home environment.',
      heroBadge: 'Medication Administration',
      heroTitle: 'Skilled injection support for comfort, safety and continuity of treatment.',
      heroText: 'Our trained nursing team helps patients receive prescribed injections safely and with minimal disruption.',
      benefits: ['Medication adherence support', 'Reduced clinic visits', 'Comfortable home-based care', 'Careful observation after administration'],
      audience: ['Patients on daily injections', 'Post-operative recovery', 'Chronic care patients', 'Mobility-limited patients'],
      process: ['Confirm the prescribed injection plan', 'Assign a trained nurse', 'Administer as per medical guidance', 'Monitor and document the session'],
      faq: [
        { question: 'Is injection administration safe at home?', answer: 'Yes, it is performed by trained professionals using medical protocols and care planning.' },
        { question: 'Do you support all prescribed injections?', answer: 'We support services based on the prescription and medical instructions provided.' },
        { question: 'Can this be done for elderly patients?', answer: 'Yes, it is often a preferred option for seniors who prefer staying at home.' }
      ],
      related: ['Nurse at Home', 'Doctor at Home', 'Patient Attendant']
    },
    'ambulance-service': {
      title: 'Ambulance Service',
      seoTitle: 'Ambulance Service | InstantCare',
      description: 'Rapid and safe emergency transport for hospital visits, transfers and critical care movement.',
      heroBadge: 'Rapid Emergency Transport',
      heroTitle: 'Fast, professional ambulance support for emergencies and transfers.',
      heroText: 'Whether it is an urgent transfer or scheduled hospital movement, our ambulance service is built for safety and speed.',
      benefits: ['Emergency transport readiness', 'Trained support during transit', 'Safe movement for critical patients', 'Coordination with medical facilities'],
      audience: ['Emergency situations', 'Hospital transfers', 'High-risk patients', 'Families needing punctual transfer support'],
      process: ['Share the transport need', 'We prepare the right ambulance support', 'Transfer is coordinated with medical teams', 'Arrival and handover are managed safely'],
      faq: [
        { question: 'Do you provide emergency ambulance service?', answer: 'Yes, we can respond to urgent transport needs with trained support.' },
        { question: 'Can you coordinate hospital transfers?', answer: 'Yes, we coordinate with destination facilities to support smooth handover.' },
        { question: 'Is this available 24/7?', answer: 'Yes, emergency transport support is available around the clock.' }
      ],
      related: ['ICU at Home', 'Nurse at Home', 'Doctor at Home']
    },
    'palliative-care': {
      title: 'Palliative Care',
      seoTitle: 'Palliative Care at Home | InstantCare',
      description: 'Comfort-focused care for patients with advanced illness, supporting comfort, dignity and family reassurance.',
      heroBadge: 'Comfort-Focused Care',
      heroTitle: 'Compassionate palliative care that prioritises comfort and dignity.',
      heroText: 'We support patients and families with compassionate, medically guided care that reduces discomfort and eases emotional strain.',
      benefits: ['Pain and symptom support', 'Emotional and family support', 'Comfort-focused routines', 'Holistic care planning'],
      audience: ['Advanced illness patients', 'Families managing end-of-life care', 'Complex chronic conditions', 'Patients needing supportive care at home'],
      process: ['Assess comfort and medical needs', 'Create a tailored palliative plan', 'Deliver home-based support', 'Review comfort levels and family support'],
      faq: [
        { question: 'Is palliative care only for end-of-life support?', answer: 'It can be used to support comfort and quality of life through advanced illness stages.' },
        { question: 'Can families receive support too?', answer: 'Yes, we provide compassionate guidance and coordination for family caregivers.' },
        { question: 'Is this care available at home?', answer: 'Yes, we help provide comfort-focused support from home.' }
      ],
      related: ['Elder Care', 'ICU at Home', 'Final Journey']
    },
    'cancer-care-at-home': {
      title: 'Cancer Care at Home',
      seoTitle: 'Cancer Care at Home | InstantCare',
      description: 'Supportive care for cancer patients, balancing comfort, medication support and recovery planning at home.',
      heroBadge: 'Cancer Care Support',
      heroTitle: 'Personalised care that supports strength, comfort and reassurance during treatment.',
      heroText: 'We help families create a calm and supportive home environment during treatment and recovery.',
      benefits: ['Medication and symptom support', 'Home-based comfort care', 'Care coordination with medical teams', 'Emotional and practical support'],
      audience: ['Cancer patients during treatment', 'Recovering patients', 'Families needing extra support', 'Patients wanting home-based care'],
      process: ['Understand treatment needs', 'Build a home care plan', 'Provide dependable support and monitoring', 'Coordinate with the wider care team'],
      faq: [
        { question: 'Is this service suitable during chemotherapy?', answer: 'Yes, support can be arranged around treatment schedules and recovery needs.' },
        { question: 'Can this help families manage daily care?', answer: 'Yes, it is often used to ease the burden on family caregivers.' },
        { question: 'Do you coordinate with doctors?', answer: 'Yes, we can align care plans with medical guidance where appropriate.' }
      ],
      related: ['Nurse at Home', 'Palliative Care', 'Doctor at Home']
    },
    'stroke-care-at-home': {
      title: 'Stroke Care at Home',
      seoTitle: 'Stroke Care at Home | InstantCare',
      description: 'Rehabilitation and support plans for stroke recovery that focus on progress, mobility and confidence.',
      heroBadge: 'Recovery Care',
      heroTitle: 'Structured support to help stroke recovery continue safely at home.',
      heroText: 'Our care plans bring together mobility support, rehabilitation guidance and compassionate monitoring for recovery.',
      benefits: ['Mobility and speech encouragement', 'Medication and routine support', 'Physiotherapy coordination', 'Family education and reassurance'],
      audience: ['Stroke recovery patients', 'Families managing post-stroke care', 'Patients needing rehab support', 'Older adults recovering after stroke'],
      process: ['Assess current needs and recovery goals', 'Design a personalised care routine', 'Begin guided home support', 'Review progress regularly'],
      faq: [
        { question: 'Can stroke care be provided at home?', answer: 'Yes, home-based care can support recovery and day-to-day routines.' },
        { question: 'Do you support rehabilitation?', answer: 'Yes, care can be coordinated alongside therapy and exercise plans.' },
        { question: 'Can families receive guidance?', answer: 'Yes, we focus on practical support for families as well as the patient.' }
      ],
      related: ['Physiotherapy at Home', 'Nurse at Home', 'Elder Care']
    }
  };

  const routeSlug = slug || location.pathname.replace(/^\//, '');
  const catalogSlug = legacySlugAliases[routeSlug] || routeSlug;

  const normalizedService = useMemo(() => {
    const catalogService = serviceCatalogBySlug[catalogSlug];
    if (catalogService) {
      return {
        ...catalogService,
        seoTitle: catalogService.seoTitle,
        faq: catalogService.faq,
        related: catalogService.related,
        eligibility: catalogService.eligibility?.length ? catalogService.eligibility : defaultEligibility,
        documents: catalogService.documents?.length ? catalogService.documents : defaultDocuments,
        patientJourney: catalogService.patientJourney?.length ? catalogService.patientJourney : defaultPatientJourney,
        scenarios: catalogService.scenarios?.length ? catalogService.scenarios : defaultScenarios,
        whyChoose: catalogService.whyChoose?.length ? catalogService.whyChoose : defaultWhyChoose,
        aeoQuestions: catalogService.aeoQuestions,
        timeline: catalogService.timeline,
        canonicalPath: `/services/${catalogService.slug}`,
      };
    }

    const legacyService = serviceMap[routeSlug] || serviceMap['nurse-at-home'];
    return {
      ...legacyService,
      eligibility: defaultEligibility,
      documents: defaultDocuments,
      patientJourney: defaultPatientJourney,
      scenarios: defaultScenarios,
      whyChoose: defaultWhyChoose,
      aeoQuestions: [
        {
          question: `Is ${legacyService.title} available at home?`,
          answer: `${legacyService.title} is available through InstantCare with guided support, careful coordination and family communication throughout the care journey.`,
        },
        {
          question: `Who usually needs ${legacyService.title}?`,
          answer: `This service is often chosen by families managing recovery, senior care, chronic conditions or home-based medical support.`,
        },
      ],
      timeline: 'Emergency support prioritised immediately. Standard enquiries are typically reviewed within 30 minutes.',
      canonicalPath: routeSlug.startsWith('services/') ? `/${routeSlug}` : `/${routeSlug}`,
    };
  }, [catalogSlug, routeSlug]);

  const service = normalizedService;
  const relatedServices = useMemo(() => {
    const resolved = (service.related || []).map(resolveRelatedService).filter(Boolean);
    return resolved.slice(0, 3);
  }, [service.related]);

  const schemaGraph = useMemo(() => {
    return {
      '@context': 'https://schema.org',
      '@graph': [
        {
          ...getServiceSchema(service.title, service.description),
          url: `${siteContact.primaryDomain}${service.canonicalPath}`,
          provider: {
            '@type': 'Organization',
            name: 'InstantCare',
            url: siteContact.primaryDomain,
            telephone: siteContact.phoneDisplay,
            email: siteContact.supportEmail,
          },
          serviceType: service.title,
          category: service.category,
          audience: service.audience,
        },
        getFAQSchema(service.faq),
        getBreadcrumbSchema([
          { name: 'Home', path: '/' },
          { name: 'Services', path: '/services' },
          { name: service.title, path: service.canonicalPath },
        ]),
      ],
    };
  }, [service]);

  const handleEnquirySubmit = (event) => {
    event.preventDefault();

    const subject = `Enquiry for ${service.title}`;
    const message = [
      `Hello InstantCare, I would like to enquire about ${service.title}.`,
      '',
      `Name: ${form.name || 'Not provided'}`,
      `Phone: ${form.phone || 'Not provided'}`,
      `Email: ${form.email || 'Not provided'}`,
      `City/Location: ${form.location || 'Not provided'}`,
      `Urgency: ${form.urgency || 'Standard'}`,
      `Notes: ${form.notes || 'Not provided'}`,
    ].join('\n');

    window.location.href = `mailto:${siteContact.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
  };

  const iconMap = {
    'nurse-at-home': Home,
    'home-nursing': Home,
    'elder-care': ShieldCheck,
    'patient-attendant': UserRound,
    'icu-at-home': Activity,
    'icu-home-care': Activity,
    'doctor-at-home': Stethoscope,
    'physiotherapy-at-home': HeartPulse,
    'home-physiotherapy': HeartPulse,
    'lab-test-at-home': FlaskConical,
    'injection-at-home': BadgeCheck,
    'ambulance-service': Ambulance,
    'palliative-care': BookOpenCheck,
    'cancer-care-at-home': Sparkles,
    'cancer-home-care': Sparkles,
    'stroke-care-at-home': Activity,
    'stroke-rehabilitation': Activity,
    'parents-care-management': ShieldCheck,
  };

  const Icon = iconMap[catalogSlug] || iconMap[routeSlug] || Home;

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{service.seoTitle}</title>
        <meta name="description" content={service.description} />
        <meta name="keywords" content={`${service.title}, home healthcare, instant care, at home care`} />
        <link rel="canonical" href={`${siteContact.primaryDomain}${service.canonicalPath}`} />
        <meta property="og:title" content={service.seoTitle} />
        <meta property="og:description" content={service.description} />
        <meta property="og:url" content={`${siteContact.primaryDomain}${service.canonicalPath}`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(schemaGraph)}</script>
      </Helmet>

      <Navbar />

      <main className="pt-24 pb-20 sm:pt-28 lg:pt-32">
        <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-purple-100 bg-[linear-gradient(135deg,_rgba(124,58,237,0.08)_0%,_rgba(255,255,255,1)_100%)] p-8 shadow-[0_25px_80px_rgba(15,23,42,0.07)] sm:p-10 lg:p-14">
            <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#7C3AED]/20 bg-white/80 px-4 py-2 text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED] shadow-sm backdrop-blur">
                  <Sparkles className="h-4 w-4" />
                  {service.heroBadge}
                </div>
                <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
                  {service.heroTitle}
                </h1>
                <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-600">
                  {service.heroText}
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link to="/book">
                    <Button className="rounded-full bg-[#7C3AED] px-7 py-5 text-base font-semibold text-white shadow-[0_10px_25px_rgba(124,58,237,0.25)] hover:bg-[#6D28D9]">
                      Book This Service
                    </Button>
                  </Link>
                  <a href={buildWhatsAppUrl(`Hello InstantCare, I need help with ${service.title}.`)} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="rounded-full border-[#7C3AED]/20 bg-white px-7 py-5 text-base font-semibold text-[#7C3AED] hover:bg-purple-50">
                      <Phone className="mr-2 h-4 w-4" /> WhatsApp Now
                    </Button>
                  </a>
                </div>
              </div>

              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] text-white shadow-lg shadow-purple-100">
                  <Icon className="h-8 w-8" strokeWidth={1.7} />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-gray-900">{service.title}</h2>
                <p className="mt-3 text-sm leading-7 text-gray-600">{service.description}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-purple-50 p-4">
                    <p className="text-2xl font-bold text-[#7C3AED]">24/7</p>
                    <p className="mt-1 text-sm text-gray-600">Care availability</p>
                  </div>
                  <div className="rounded-2xl bg-green-50 p-4">
                    <p className="text-2xl font-bold text-green-700">Verified</p>
                    <p className="mt-1 text-sm text-gray-600">Professional support</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:col-span-2">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Overview</p>
              <h2 className="mt-3 text-2xl font-bold text-gray-900">What this service covers</h2>
              <p className="mt-4 max-w-4xl text-sm leading-8 text-slate-600">{service.description} InstantCare supports this with clear assessment, family communication, timeline guidance, documented next steps and continuity of care.</p>
            </div>

            <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Benefits</p>
              <h2 className="mt-3 text-2xl font-bold text-gray-900">Why families choose this service</h2>
              <div className="mt-6 space-y-3">
                {service.benefits.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    <span className="text-sm leading-7 text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Who Needs This</p>
              <h2 className="mt-3 text-2xl font-bold text-gray-900">Best suited for</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {service.audience.map((item) => (
                  <div key={item} className="rounded-2xl border border-purple-100 bg-purple-50/40 p-4 text-sm font-medium text-gray-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-gray-100 bg-slate-50 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.04)] sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Our Process</p>
            <h2 className="mt-3 text-2xl font-bold text-gray-900">How care begins and continues</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-4">
              {service.process.map((step, index) => (
                <div key={step} className="rounded-2xl border border-purple-100 bg-white p-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#7C3AED] text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-gray-700">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
            <DetailPanel eyebrow="Eligibility" title="Who this service is suitable for">
              <div className="space-y-3">
                {service.eligibility.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 text-sm leading-7 text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
                    {item}
                  </div>
                ))}
              </div>
            </DetailPanel>

            <DetailPanel eyebrow="Documents" title="Helpful information to keep ready">
              <div className="space-y-3">
                {service.documents.map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </DetailPanel>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[1.75rem] border border-slate-200 bg-slate-950 p-8 text-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-200">Timeline</p>
            <h2 className="mt-3 text-2xl font-bold">What response and coordination look like</h2>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-5 text-sm leading-8 text-slate-200">
              {service.timeline}
            </div>
          </div>
        </section>

        <section className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
            <DetailPanel eyebrow="Patient Journey" title="What families can expect next">
              <div className="space-y-3">
                {service.patientJourney.map((item, index) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#7C3AED] text-sm font-semibold text-white">{index + 1}</span>
                    {item}
                  </div>
                ))}
              </div>
            </DetailPanel>

            <DetailPanel eyebrow="Common Scenarios" title="How this service is typically used">
              <div className="space-y-3">
                {service.scenarios.map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </DetailPanel>
          </div>
        </section>

        <section className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <DetailPanel eyebrow="Why InstantCare" title="Why families choose our premium healthcare management model">
              <div className="grid gap-4 md:grid-cols-2">
                {service.whyChoose.map((item) => (
                  <div key={item} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </DetailPanel>
          </div>
        </section>

        <section className="px-4 py-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <FAQSection
              items={service.faq}
              title="Common questions about this service"
              description="Helpful answers for families planning home healthcare support."
            />
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <DetailPanel eyebrow="AEO Questions" title="Direct answers to the questions families ask most">
              <div className="space-y-4">
                {service.aeoQuestions.map((item) => (
                  <div key={item.question} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="font-semibold text-slate-900">{item.question}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.answer}</p>
                  </div>
                ))}
              </div>
            </DetailPanel>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Related Services</p>
                <h2 className="mt-2 text-2xl font-bold text-gray-900">Explore more ways we can support your care journey</h2>
              </div>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {relatedServices.length > 0 ? relatedServices.map((item) => (
                <ServiceCard key={item.slug} service={item} icon={Icon} variant="compact" />
              )) : (
                <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] md:col-span-3">
                  <p className="text-lg font-semibold text-gray-900">More premium services are available</p>
                  <p className="mt-3 text-sm leading-7 text-gray-600">Browse the full services catalogue to find hospital coordination, chronic care, NRI support, insurance assistance and specialist home services.</p>
                  <Link to="/services" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#7C3AED]">
                    Explore Services <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Raise Enquiry</p>
                <h3 className="mt-3 text-3xl font-semibold text-slate-900">Start a consultation for this service.</h3>
                <p className="mt-4 text-sm leading-7 text-slate-600">Share the patient need, urgency and contact details. Our team will review the enquiry and respond quickly.</p>
                <div className="mt-6 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-green-500" /> Confidential communication</div>
                  <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#7C3AED]" /> Fast response for urgent requests</div>
                  <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#7C3AED]" /> Clear care request details</div>
                </div>
              </div>

              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleEnquirySubmit}>
                <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0" placeholder="Patient or Family Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required />
                <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0" placeholder="Phone Number" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required />
                <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
                <input className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0" placeholder="City / Location" value={form.location} onChange={(event) => setForm({ ...form, location: event.target.value })} />
                <select className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0 md:col-span-2" value={form.urgency} onChange={(event) => setForm({ ...form, urgency: event.target.value })}>
                  <option value="Standard">Standard</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency">Emergency</option>
                </select>
                <textarea rows="4" className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-0 md:col-span-2" placeholder="Tell us about the medical need, timeline and any relevant reports or care history." value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} />
                <div className="md:col-span-2 flex flex-wrap gap-3">
                  <Button type="submit" className="rounded-full bg-[#7C3AED] px-6 py-3 text-sm font-semibold text-white hover:bg-[#6D28D9]">
                    <MessageCircleMore className="mr-2 h-4 w-4" /> Send Enquiry
                  </Button>
                  <a href={siteContact.phoneHref} className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700">
                    <CalendarDays className="mr-2 inline h-4 w-4" /> Call Advisor
                  </a>
                  <a href={buildWhatsAppUrl(`Hello InstantCare, I need help with ${service.title}.`)} target="_blank" rel="noreferrer" className="rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700">
                    <ClipboardList className="mr-2 inline h-4 w-4" /> WhatsApp
                  </a>
                </div>
              </form>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2rem] bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] p-8 text-white shadow-[0_20px_70px_rgba(124,58,237,0.24)] sm:p-10 lg:p-12">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-100">Ready to begin?</p>
                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Let’s create a care plan that fits your family.</h2>
                <p className="mt-4 max-w-2xl text-lg text-purple-50">From urgent support to long-term recovery, we’re here with premium, responsive healthcare guidance.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link to="/book">
                  <Button className="rounded-full bg-white px-7 py-5 text-base font-semibold text-[#7C3AED] hover:bg-slate-100">
                    Book Now
                  </Button>
                </Link>
                <a href={buildWhatsAppUrl(`Hello InstantCare, I would like to start care for ${service.title}.`)} target="_blank" rel="noreferrer">
                  <Button variant="outline" className="rounded-full border-white/40 bg-transparent px-7 py-5 text-base font-semibold text-white hover:bg-white/10">
                    <Phone className="mr-2 h-4 w-4" /> WhatsApp Us
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ServiceDetailPage;
