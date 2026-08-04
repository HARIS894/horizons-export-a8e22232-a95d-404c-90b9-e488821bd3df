import React from 'react';
import { AlertTriangle, ArrowRight, BookOpenCheck, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const KnowledgeCategoryCard = ({ library, icon: Icon, to }) => (
  <Link to={to} className="group flex h-full flex-col rounded-[1.75rem] border border-purple-100 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(124,58,237,0.12)]">
    <div className="mb-5 flex items-center justify-between">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] text-white shadow-lg shadow-purple-100">
        <Icon className="h-7 w-7" strokeWidth={1.7} />
      </div>
      <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#7C3AED]">{library.badge}</span>
    </div>
    <h3 className="text-xl font-bold text-gray-900">{library.title}</h3>
    <p className="mt-3 flex-grow text-sm leading-7 text-gray-600">{library.heroText}</p>
    <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#7C3AED] transition-colors group-hover:gap-3">
      Explore library <ArrowRight className="h-4 w-4" />
    </div>
  </Link>
);

const KnowledgeArticleCard = ({ article, to }) => (
  <Link to={to} className="block rounded-[1.6rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_22px_55px_rgba(15,23,42,0.08)]">
    <div className="flex items-center justify-between gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#A78BFA] text-white">
        <BookOpenCheck className="h-6 w-6" />
      </div>
      <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#7C3AED]">{article.heroBadge}</span>
    </div>
    <h3 className="mt-5 text-xl font-semibold text-slate-900">{article.title}</h3>
    <p className="mt-3 text-sm leading-7 text-slate-600">{article.excerpt}</p>
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm leading-7 text-slate-700">{article.quickAnswer}</div>
    <div className="mt-5 flex items-center justify-between text-sm font-semibold text-[#7C3AED]">
      <span>Read article</span>
      <ArrowRight className="h-4 w-4" />
    </div>
  </Link>
);

const KnowledgeTableOfContents = ({ items }) => (
  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)] lg:sticky lg:top-28">
    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">Table of Contents</p>
    <nav className="mt-5 space-y-3" aria-label="Article table of contents">
      {items.map((item) => (
        <a key={item.id} href={`#${item.id}`} className="block rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-purple-50 hover:text-[#7C3AED]">
          {item.title}
        </a>
      ))}
    </nav>
  </div>
);

const KnowledgeSectionCard = ({ id, eyebrow, title, items, variant = 'list' }) => (
  <section id={id} className="rounded-[1.5rem] border border-slate-200 bg-white p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)] scroll-mt-28">
    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7C3AED]">{eyebrow}</p>
    <h2 className="mt-3 text-2xl font-bold text-slate-900">{title}</h2>
    {variant === 'paragraph' ? (
      <p className="mt-6 text-sm leading-8 text-slate-700">{items}</p>
    ) : (
      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-500" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    )}
  </section>
);

const EmergencySignsCard = ({ items }) => (
  <section id="emergency-signs" className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-8 shadow-[0_16px_40px_rgba(15,23,42,0.05)] scroll-mt-28">
    <div className="flex items-center gap-3">
      <AlertTriangle className="h-6 w-6 text-amber-600" />
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">Emergency Signs</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-900">When families should seek urgent medical help</h2>
      </div>
    </div>
    <div className="mt-6 space-y-3">
      {items.map((item) => (
        <div key={item} className="rounded-2xl border border-amber-200 bg-white p-4 text-sm leading-7 text-slate-700">
          {item}
        </div>
      ))}
    </div>
  </section>
);

const ArticleCTA = ({ cta, onWhatsappHref }) => (
  <section className="rounded-[2rem] bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] p-8 text-white shadow-[0_20px_70px_rgba(124,58,237,0.24)] sm:p-10">
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-100">{cta.eyebrow}</p>
        <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{cta.title}</h2>
        <p className="mt-4 max-w-2xl text-lg text-purple-50">{cta.description}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild className="rounded-full bg-white px-7 py-5 text-base font-semibold text-[#7C3AED] hover:bg-slate-100">
          <Link to="/book">Book Consultation</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full border-white/40 bg-transparent px-7 py-5 text-base font-semibold text-white hover:bg-white/10 hover:text-white">
          <a href={onWhatsappHref} target="_blank" rel="noreferrer">WhatsApp Enquiry</a>
        </Button>
      </div>
    </div>
  </section>
);

export {
  ArticleCTA,
  EmergencySignsCard,
  KnowledgeArticleCard,
  KnowledgeCategoryCard,
  KnowledgeSectionCard,
  KnowledgeTableOfContents,
};