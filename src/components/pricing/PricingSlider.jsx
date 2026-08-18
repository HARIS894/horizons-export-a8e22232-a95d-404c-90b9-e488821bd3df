import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, ClipboardCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildWhatsAppUrl } from '@/config/siteConfig';

const overviewRows = [
  ['Professional Nurse Visit', '₹2,000 / visit onwards'],
  ['Patient Caregiver', '12 Hours ₹1,200 / day · 24 Hours ₹2,200 / day'],
  ['Dedicated Nursing', '12 Hours ₹2,000 / day · 24 Hours Custom Plan'],
  ['Elder Care', 'Custom Care Plan'], ['Cancer Care', 'Custom Care Plan'], ['Bedridden & Recovery Care', 'Custom Care Plan'],
  ['360° Home & Patient Management', 'Custom Monthly Plan'], ['NRI Platinum', '₹1,54,000 / month onwards'],
];
const overviewSlide = { id: 'all-pricing', tabLabel: 'All Pricing', label: 'All Care Options', title: 'Find the Right Support for Your Family', description: 'Compare the starting point for each service, then let our care team understand the requirement and confirm a suitable plan.', ctaLabel: 'Find My Care Option', ctaIcon: ClipboardCheck, whatsappMessage: 'Hello InstantCare Team, I would like help finding the right care option for my family. Please contact me to discuss availability and pricing.', note: 'Prices shown are starting points, not final quotations. Final pricing is confirmed after understanding the care requirement, location and availability.', overviewRows };
const tabLabels = { 'nurse-visits': 'Nurse Visit', 'patient-care': 'Patient Care', 'dedicated-nursing': 'Nursing Care', 'elder-care': 'Elder Care', 'cancer-care': 'Cancer Care', 'recovery-care': 'Recovery Care' };

const PricingSlider = ({ cards, completeCare, nriPlatinum }) => {
  const slides = [overviewSlide, ...cards.map((card) => ({ ...card, tabLabel: tabLabels[card.id] })),
    { id: 'complete-care', tabLabel: '360° Care', label: 'Complete Family Support', title: 'InstantCare 360°', description: 'One team and one point of coordination for patient care, healthcare appointments, home staff and everyday family responsibilities.', price: 'Custom Monthly Plan', features: [...completeCare.patientCare.slice(0, 5), ...completeCare.homeSupport.slice(0, 4)], ctaLabel: completeCare.primaryCtaLabel, ctaIcon: completeCare.primaryCtaIcon, whatsappMessage: completeCare.whatsappMessage, note: 'The plan is designed around the actual mix of patient, home, healthcare and family coordination required.' },
    { id: 'nri-platinum', tabLabel: 'NRI Platinum', label: 'Complete Family Care', title: nriPlatinum.title, description: nriPlatinum.description, price: nriPlatinum.price, features: nriPlatinum.features, ctaLabel: nriPlatinum.ctaLabel, ctaIcon: nriPlatinum.ctaIcon, whatsappMessage: nriPlatinum.whatsappMessage, note: nriPlatinum.trustStatement },
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const touchStart = useRef(null);
  const activeSlide = slides[activeIndex];
  const CtaIcon = activeSlide.ctaIcon;
  const selectSlide = (index) => { setDirection(index > activeIndex ? 1 : -1); setActiveIndex(index); };
  const move = (step) => { setDirection(step); setActiveIndex((activeIndex + step + slides.length) % slides.length); };
  const handleTouchEnd = (event) => { if (touchStart.current === null) return; const distance = event.changedTouches[0].clientX - touchStart.current; if (Math.abs(distance) > 55) move(distance > 0 ? -1 : 1); touchStart.current = null; };

  return (
    <section id="care-plans" className="overflow-hidden px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center"><p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#7C3AED]">Care Plans</p><h2 className="mt-3 text-3xl font-bold text-slate-950 sm:text-4xl">One clear care option at a time</h2><p className="mt-4 leading-7 text-slate-600">Choose a category to see its starting price, scope and next step. You never need to calculate a care bill yourself.</p></div>
        <div className="mt-10 rounded-[2rem] border border-purple-100 bg-white p-3 shadow-[0_28px_80px_rgba(76,29,149,0.10)] sm:p-5 lg:p-7">
          <div className="-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="tablist" aria-label="Pricing categories">
            {slides.map((slide, index) => <button key={slide.id} type="button" role="tab" aria-selected={index === activeIndex} onClick={() => selectSlide(index)} className={`min-h-11 shrink-0 snap-start rounded-full px-4 text-xs font-bold uppercase transition sm:text-sm ${index === activeIndex ? 'bg-[#7C3AED] text-white shadow-lg' : 'bg-purple-50 text-slate-700 hover:bg-purple-100'}`}>{slide.tabLabel}</button>)}
          </div>
          <div className="relative mt-2 overflow-hidden rounded-[1.6rem] bg-[linear-gradient(135deg,#f6f3ff_0%,#ffffff_55%,#eef6ff_100%)]" onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={handleTouchEnd}>
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.article key={activeSlide.id} custom={direction} initial={{ opacity: 0, x: direction > 0 ? 48 : -48 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: direction > 0 ? -48 : 48 }} transition={{ duration: 0.28, ease: 'easeOut' }} className="min-h-[560px] p-6 sm:p-9 lg:p-12">
                <div className="grid gap-9 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
                  <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-[#7C3AED]">{activeSlide.label || activeSlide.tabLabel}</p><h3 className="mt-4 text-3xl font-bold text-slate-950 sm:text-4xl">{activeSlide.title}</h3>{activeSlide.price ? <p className="mt-5 text-2xl font-bold text-[#6D28D9] sm:text-3xl">{activeSlide.price}</p> : null}
                    {activeSlide.priceRows ? <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">{activeSlide.priceRows.map((row) => <div key={row.label} className="rounded-xl border border-purple-100 bg-white p-4"><p className="text-xs font-bold uppercase text-slate-500">{row.label}</p><p className="mt-1 font-bold text-[#6D28D9]">{row.value}</p></div>)}</div> : null}
                    <p className="mt-5 leading-7 text-slate-600">{activeSlide.description}</p>{activeSlide.whoFor ? <p className="mt-4 leading-7 text-slate-700"><strong>Who it is for:</strong> {activeSlide.whoFor}</p> : null}<Button asChild className="mt-7 h-12 w-full rounded-full bg-[#7C3AED] px-6 text-base font-semibold text-white hover:bg-[#6D28D9] sm:w-auto"><a href={buildWhatsAppUrl(activeSlide.whatsappMessage)} target="_blank" rel="noreferrer"><CtaIcon className="mr-2 h-4 w-4" />{activeSlide.ctaLabel}</a></Button></div>
                  <div>{activeSlide.overviewRows ? <div className="grid gap-2">{activeSlide.overviewRows.map(([name, price]) => <div key={name} className="grid gap-1 rounded-xl border border-slate-200 bg-white/90 p-3 sm:grid-cols-[1fr_auto] sm:items-center"><span className="font-semibold text-slate-900">{name}</span><span className="text-sm font-bold text-[#6D28D9]">{price}</span></div>)}</div> : <><p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">What is included</p><ul className="mt-4 grid gap-3 sm:grid-cols-2">{activeSlide.features.map((feature) => <li key={feature} className="flex gap-3 rounded-xl border border-slate-200 bg-white/90 p-3 text-sm leading-6 text-slate-700"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{feature}</li>)}</ul></>}{activeSlide.note ? <p className="mt-5 rounded-xl border border-amber-100 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Pricing note:</strong> {activeSlide.note}</p> : null}</div>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>
          <div className="mt-4 flex items-center justify-between"><button type="button" onClick={() => move(-1)} className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:border-purple-200 hover:text-[#7C3AED]" aria-label="Previous pricing category"><ArrowLeft className="h-4 w-4" /><span className="hidden sm:inline">Previous</span></button><p className="text-sm font-semibold text-slate-500">{activeIndex + 1} / {slides.length}</p><button type="button" onClick={() => move(1)} className="inline-flex h-11 items-center gap-2 rounded-full border border-slate-200 px-4 text-sm font-semibold text-slate-700 hover:border-purple-200 hover:text-[#7C3AED]" aria-label="Next pricing category"><span className="hidden sm:inline">Next</span><ArrowRight className="h-4 w-4" /></button></div>
        </div>
      </div>
    </section>
  );
};

export default PricingSlider;
