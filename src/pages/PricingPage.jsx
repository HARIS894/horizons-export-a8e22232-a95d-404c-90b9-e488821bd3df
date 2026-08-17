import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, BadgeCheck, Building2, CreditCard, Landmark, ShieldCheck, Sparkles, Wallet } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PricingFaq from '@/components/pricing/PricingFaq';
import PricingHero from '@/components/pricing/PricingHero';
import PricingTierCard from '@/components/pricing/PricingTierCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { buildWhatsAppUrl, siteContact } from '@/config/siteConfig';
import { getFAQSchema } from '@/utils/seoUtils';

const razorpayPaymentLink = 'https://razorpay.me/@instantcarehomenursingservice';

const pricingTiers = [
  {
    name: 'Bronze',
    monthlyPrice: 'Rs. 2,499',
    annualPrice: 'Rs. 24,990',
    description: 'For essential primary care guidance and dependable virtual healthcare support.',
    features: [
      'Basic primary care coordination',
      'Basic telemedicine access',
      'Medication reminders and care summaries',
      'Standard weekday support response',
    ],
  },
  {
    name: 'Silver',
    monthlyPrice: 'Rs. 5,499',
    annualPrice: 'Rs. 54,990',
    description: 'For families managing routine care needs with added specialist support.',
    features: [
      'Family basic care management',
      'Basic telemedicine access for household members',
      'Basic specialist consult coordination',
      'Preventive wellness check planning',
    ],
  },
  {
    name: 'Gold',
    monthlyPrice: 'Rs. 9,900',
    annualPrice: 'Rs. 99,000',
    description: 'For families that need faster access, higher continuity, and broader virtual coverage.',
    features: [
      'Priority booking for consultations and follow-ups',
      'Unlimited telemedicine access',
      'Standard specialist care coordination',
      'Dedicated support for recurring care journeys',
    ],
    featured: true,
  },
  {
    name: 'Platinum',
    monthlyPrice: 'Rs. 16,900',
    annualPrice: 'Rs. 1,69,000',
    description: 'For comprehensive healthcare navigation across diagnostics, specialists, and premium access networks.',
    features: [
      'Comprehensive care coordination',
      'Diagnostic coverage planning and scheduling',
      'Direct access to premium care networks',
      'High-touch concierge support for complex cases',
    ],
  },
];

const faqItems = [
  {
    question: 'Can I change plans anytime?',
    answer: 'Yes. You can upgrade or adjust your plan as your family’s care needs change. Billing adjustments are applied from the next cycle.',
  },
  {
    question: 'Is my health insurance accepted?',
    answer: 'We support insurance documentation and coordination for many cases. Final acceptance depends on your insurer, TPA rules, provider network, and treatment type.',
  },
  {
    question: 'Which payment methods does InstantCare accept?',
    answer: 'InstantCare can accept Razorpay-based digital payments, UPI, major debit and credit cards, net banking, NEFT, RTGS, IMPS, and direct bank transfer based on the service workflow.',
  },
  {
    question: 'What happens if a wrong or excess payment is credited?',
    answer: 'If any extra or incorrect payment is credited, the settlement review can be initiated immediately after verification and processed without unnecessary delay according to the billing record.',
  },
];

const trustHighlights = [
  {
    title: 'Human support, not generic plans',
    description: 'Every pricing tier is mapped to real care journeys like elder care, telemedicine follow-up, family coordination, and specialist access.',
    icon: Sparkles,
  },
  {
    title: 'Healthcare-first payment flexibility',
    description: 'Razorpay, UPI, NEFT, RTGS, IMPS, cards, and bank transfers can be aligned to the service and billing workflow.',
    icon: Wallet,
  },
  {
    title: 'Transparent billing and settlement',
    description: 'Invoice review, payment confirmation, and wrong-credit settlement support are designed to move fast and stay documented.',
    icon: ShieldCheck,
  },
];

const paymentOptions = [
  {
    name: 'Razorpay',
    detail: 'Supports direct payments through the InstantCare Razorpay.me link for cards, net banking, wallets, and digital collection flows.',
    icon: CreditCard,
  },
  {
    name: 'UPI and QR Payments',
    detail: 'Fast mobile-first payments for families in India who want instant confirmation.',
    icon: Wallet,
  },
  {
    name: 'NEFT / RTGS / IMPS',
    detail: 'Suitable for scheduled plan payments, family office transfers, and hospital-linked billing.',
    icon: Landmark,
  },
  {
    name: 'Insurance and Documentation Support',
    detail: 'Where applicable, the team can help with invoices and support documents for reimbursement workflows.',
    icon: Building2,
  },
];

const settlementTerms = [
  'If any payment is credited in excess, duplicated by mistake, or sent to the wrong billing amount, InstantCare can initiate same-time settlement review as soon as the transaction is verified.',
  'Verified wrong-credit or excess-credit cases are handled without unnecessary delay and matched against invoice, patient name, and payment reference details.',
  'Final settlement timing can depend on banking rails, Razorpay processing, and compliance checks, but the internal action is designed to start immediately after confirmation.',
];

const answerEngineTopics = [
  {
    question: 'What is the best healthcare plan for parents at home?',
    answer: 'Gold is the strongest fit for most families who need priority booking, unlimited telemedicine, and steady specialist coordination for ongoing care at home.',
  },
  {
    question: 'Which InstantCare plan includes specialist support?',
    answer: 'Silver includes basic specialist consult coordination, while Gold and Platinum support more frequent and structured specialist care journeys.',
  },
  {
    question: 'Does InstantCare accept online and bank transfer payments?',
    answer: 'Yes. Digital payments, Razorpay flows, UPI, cards, and NEFT or other bank transfers can all be supported based on the case workflow.',
  },
];

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState('monthly');
  const { toast } = useToast();

  const productSchema = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'InstantCare Healthcare Pricing Plans',
    description: 'Transparent healthcare pricing across Bronze, Silver, Gold, and Platinum plans for home healthcare, family coordination, and telemedicine.',
    brand: 'InstantCare',
    url: `${siteContact.primaryDomain}/pricing`,
    offers: pricingTiers.map((tier) => ({
      '@type': 'Offer',
      priceCurrency: 'INR',
      name: tier.name,
      price: billingCycle === 'annual' ? tier.annualPrice.replace(/[^\d]/g, '') : tier.monthlyPrice.replace(/[^\d]/g, ''),
      availability: 'https://schema.org/InStock',
    })),
  }), [billingCycle]);

  const faqSchema = useMemo(() => getFAQSchema(faqItems), []);

  const handleChoosePlan = (tier) => {
    const message = `Hello InstantCare, I want the ${tier.name} healthcare plan on ${billingCycle} billing. Please share next steps for consultation, pricing confirmation, and payment options.`;

    toast({
      title: `${tier.name} plan selected`,
      description: `Opening a WhatsApp enquiry for the ${tier.name} ${billingCycle} plan so your team can continue with pricing and payment steps.`,
    });

    window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f7f5ff_0%,_#ffffff_24%,_#f8fafc_100%)] text-slate-900">
      <Helmet>
        <title>Healthcare Pricing Plans in India | InstantCare</title>
        <meta
          name="description"
          content="Compare InstantCare healthcare pricing plans in India for home healthcare, telemedicine, elder care, specialist coordination, and premium family support with transparent payment options."
        />
        <meta
          name="keywords"
          content="healthcare pricing India, home healthcare plans, elder care pricing, telemedicine plans India, healthcare packages for parents, InstantCare pricing, home nursing pricing, specialist care plans"
        />
        <link rel="canonical" href={`${siteContact.primaryDomain}/pricing`} />
        <meta property="og:title" content="Simple, Transparent Healthcare Plans in India | InstantCare" />
        <meta
          property="og:description"
          content="Compare Bronze, Silver, Gold, and Platinum healthcare plans for individuals and families needing home healthcare, telemedicine, specialist support, and coordinated care."
        />
        <meta property="og:url" content={`${siteContact.primaryDomain}/pricing`} />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <Navbar />

      <main className="pb-20 pt-24">
        <PricingHero billingCycle={billingCycle} onBillingChange={setBillingCycle} />

        <section className="px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-3">
            {trustHighlights.map((item) => {
              const Icon = item.icon;

              return (
                <article key={item.title} className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.05)]">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-[#7C3AED]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="mx-auto max-w-7xl">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#7C3AED]">Plans</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Four care tiers for every level of support
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                From routine virtual care to premium coordination, specialist support, diagnostics guidance, and elder care planning, each plan is designed to be clear and easy to compare.
              </p>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-4">
              {pricingTiers.map((tier) => (
                <PricingTierCard
                  key={tier.name}
                  tier={tier}
                  billingCycle={billingCycle}
                  onChoosePlan={handleChoosePlan}
                />
              ))}
            </div>

            <div className="mt-12 rounded-[2rem] border border-purple-100 bg-[linear-gradient(135deg,_rgba(124,58,237,0.07)_0%,_rgba(255,255,255,0.96)_100%)] p-6 sm:p-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7C3AED]">Next Step</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-950">Need help choosing the right plan for your family?</h3>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
                    Talk to InstantCare on WhatsApp or book an assessment so the team can recommend the right plan, care model, and payment path.
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <a href={buildWhatsAppUrl('Hello InstantCare, I want help selecting the right healthcare pricing plan for my family.')} target="_blank" rel="noreferrer">
                    <Button className="h-12 rounded-full bg-[#7C3AED] px-6 text-base font-semibold text-white hover:bg-[#6D28D9]">
                      WhatsApp Pricing Team
                    </Button>
                  </a>
                  <a href={razorpayPaymentLink} target="_blank" rel="noreferrer">
                    <Button variant="outline" className="h-12 rounded-full border-purple-200 bg-white px-6 text-base font-semibold text-[#7C3AED] hover:bg-purple-50">
                      Pay via Razorpay
                    </Button>
                  </a>
                  <Link to="/book">
                    <Button variant="outline" className="h-12 rounded-full border-purple-200 bg-white px-6 text-base font-semibold text-[#7C3AED] hover:bg-purple-50">
                      Book Assessment
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2.25rem] border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.06)] lg:p-12">
            <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#7C3AED]">Payments</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  All major healthcare payment modes accepted
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                  InstantCare can support digital collections, bank transfers, and billing documentation workflows so families can pay in the way that is most practical for them.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {['Razorpay', 'UPI', 'Debit Cards', 'Credit Cards', 'Net Banking', 'NEFT', 'RTGS', 'IMPS'].map((item) => (
                    <span key={item} className="rounded-full border border-purple-200 bg-purple-50 px-4 py-2 text-sm font-semibold text-[#6D28D9]">
                      {item}
                    </span>
                  ))}
                </div>
                <div className="mt-6 rounded-[1.5rem] border border-purple-100 bg-purple-50/70 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7C3AED]">Direct Payment Link</p>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    Families who are ready to proceed can pay directly through InstantCare's secure Razorpay link.
                  </p>
                  <a
                    href={razorpayPaymentLink}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#7C3AED] transition-colors hover:text-[#6D28D9]"
                  >
                    Open Razorpay payment link
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {paymentOptions.map((option) => {
                  const Icon = option.icon;

                  return (
                    <article key={option.name} className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5">
                      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#7C3AED] shadow-sm">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-slate-950">{option.name}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{option.detail}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-4 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl rounded-[2.25rem] bg-slate-950 p-8 text-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-purple-300">Settlement Terms</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Wrong credit or excess payment settlement support
                </h2>
                <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
                  If a payment is credited incorrectly or above the billed amount, the page now clearly states the settlement support policy for patients and families.
                </p>
              </div>

              <div className="space-y-4">
                {settlementTerms.map((term) => (
                  <div key={term} className="flex gap-4 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                    <BadgeCheck className="mt-1 h-5 w-5 shrink-0 text-purple-300" />
                    <p className="text-sm leading-7 text-slate-200">{term}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl rounded-[2.25rem] border border-slate-200 bg-white p-8 shadow-[0_18px_50px_rgba(15,23,42,0.05)] lg:p-12">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#7C3AED]">SEO and AEO</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Direct answers for common healthcare pricing searches
              </h2>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
                This section is written in a natural, human style so the page can perform better for search engines and answer engines around healthcare plan pricing, elder care packages, and accepted payment methods.
              </p>
            </div>

            <div className="mt-10 grid gap-4 lg:grid-cols-3">
              {answerEngineTopics.map((item) => (
                <article key={item.question} className="rounded-[1.75rem] border border-purple-100 bg-[linear-gradient(180deg,_#faf7ff_0%,_#ffffff_100%)] p-6">
                  <h3 className="text-lg font-semibold text-slate-950">{item.question}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
                </article>
              ))}
            </div>

            <div className="mt-8">
              <Link to="/contact" className="inline-flex items-center gap-2 text-sm font-semibold text-[#7C3AED] transition-colors hover:text-[#6D28D9]">
                Speak to InstantCare for custom enterprise, city-wise, or long-term family pricing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <PricingFaq items={faqItems} />
      </main>

      <Footer />
    </div>
  );
};

export default PricingPage;