import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, ChevronRight, MessageCircleMore, Phone, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { buildWhatsAppUrl, siteContact } from '@/config/siteConfig';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5 },
};

const SectionShell = ({ id, eyebrow, title, description, badge, children, className = '' }) => (
  <section id={id} className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
    <motion.div
      {...fadeUp}
      className={`mx-auto max-w-7xl rounded-[2rem] border border-white/12 bg-white/8 p-6 shadow-[0_30px_80px_rgba(2,8,23,0.18)] backdrop-blur-xl sm:p-8 lg:p-10 ${className}`}
    >
      {(eyebrow || title || description || badge) && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#A78BFA]">{eyebrow}</p>}
            {title && <h2 className="mt-3 font-['Poppins'] text-3xl font-semibold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]">{title}</h2>}
            {description && <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">{description}</p>}
          </div>
          {badge ? <div className="inline-flex w-fit rounded-full border border-white/12 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-slate-200">{badge}</div> : null}
        </div>
      )}
      <div className="mt-8">{children}</div>
    </motion.div>
  </section>
);

const PrimaryActions = ({ onOpenConsultation, whatsappMessage, className = '' }) => (
  <div className={`flex flex-col gap-3 sm:flex-row sm:flex-wrap ${className}`}>
    <Button asChild className="rounded-full bg-[#8B5CF6] px-6 py-6 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(139,92,246,0.32)] hover:bg-[#7C3AED]">
      <Link to="/book">
        Book Private Assessment <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
    <Button asChild variant="outline" className="rounded-full border-white/15 bg-white/10 px-6 py-6 text-sm font-semibold text-white hover:bg-white/15 hover:text-white">
      <a href={siteContact.phoneHref}>
        <Phone className="mr-2 h-4 w-4" /> Speak to Concierge
      </a>
    </Button>
    <Button type="button" variant="outline" onClick={onOpenConsultation} className="rounded-full border-white/15 bg-white/10 px-6 py-6 text-sm font-semibold text-white hover:bg-white/15 hover:text-white">
      <MessageCircleMore className="mr-2 h-4 w-4" /> Plan a Consultation
    </Button>
    <Button asChild variant="ghost" className="rounded-full px-4 py-6 text-sm font-semibold text-[#C4B5FD] hover:bg-transparent hover:text-white">
      <a href={buildWhatsAppUrl(whatsappMessage)} target="_blank" rel="noreferrer">
        WhatsApp Priority Desk <ChevronRight className="ml-1 h-4 w-4" />
      </a>
    </Button>
  </div>
);

const MetricGrid = ({ items }) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {items.map((item) => (
      <div key={item.label} className="rounded-[1.5rem] border border-white/12 bg-white/10 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="text-2xl font-semibold text-white sm:text-3xl">{item.value}</div>
        <p className="mt-2 text-sm font-medium text-slate-300">{item.label}</p>
        {item.detail ? <p className="mt-3 text-xs uppercase tracking-[0.24em] text-slate-400">{item.detail}</p> : null}
      </div>
    ))}
  </div>
);

const AudienceGrid = ({ items }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
    {items.map((item, index) => {
      const Icon = item.icon;
      return (
        <motion.article
          key={item.title}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, delay: index * 0.04 }}
          className="rounded-[1.5rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.08))] p-5 backdrop-blur"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#A78BFA] to-[#22D3EE] text-slate-950 shadow-[0_10px_30px_rgba(34,211,238,0.18)]">
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-white">{item.title}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
        </motion.article>
      );
    })}
  </div>
);

const HighlightGrid = ({ items, linkPrefix }) => (
  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
    {items.map((item, index) => {
      const Icon = item.icon;
      const content = (
        <>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#A78BFA] to-[#22D3EE] text-slate-950">
            <Icon className="h-5 w-5" />
          </div>
          {item.eyebrow ? <p className="mt-5 text-xs font-semibold uppercase tracking-[0.28em] text-[#C4B5FD]">{item.eyebrow}</p> : null}
          <h3 className="mt-2 text-xl font-semibold text-white">{item.title}</h3>
          <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
          {item.points?.length ? (
            <ul className="mt-5 space-y-2">
              {item.points.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm text-slate-200">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#22D3EE]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {item.link ? (
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">
              Explore {item.linkLabel || 'service'} <ChevronRight className="h-4 w-4" />
            </span>
          ) : null}
        </>
      );

      return item.link ? (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, delay: index * 0.04 }}
        >
          <Link to={`${linkPrefix}${item.link}`} className="block rounded-[1.6rem] border border-white/12 bg-white/8 p-6 shadow-[0_16px_45px_rgba(15,23,42,0.12)] backdrop-blur transition hover:-translate-y-1 hover:border-[#A78BFA]/40">
            {content}
          </Link>
        </motion.div>
      ) : (
        <motion.article
          key={item.title}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.45, delay: index * 0.04 }}
          className="rounded-[1.6rem] border border-white/12 bg-white/8 p-6 shadow-[0_16px_45px_rgba(15,23,42,0.12)] backdrop-blur"
        >
          {content}
        </motion.article>
      );
    })}
  </div>
);

const JourneyTimeline = ({ items }) => (
  <div className="grid gap-4 lg:grid-cols-2">
    {items.map((item, index) => (
      <motion.div
        key={item.title}
        initial={{ opacity: 0, x: index % 2 === 0 ? -18 : 18 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.45 }}
        className="rounded-[1.5rem] border border-white/12 bg-white/10 p-5 backdrop-blur"
      >
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-sm font-semibold text-slate-950">{index + 1}</div>
          <div>
            <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-300">{item.description}</p>
          </div>
        </div>
      </motion.div>
    ))}
  </div>
);

const QuickAnswerCards = ({ items }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {items.map((item) => (
      <article key={item.question} className="rounded-[1.5rem] border border-white/12 bg-white/10 p-5 backdrop-blur">
        <p className="text-base font-semibold text-white">{item.question}</p>
        <p className="mt-3 text-sm leading-7 text-slate-300">{item.answer}</p>
      </article>
    ))}
  </div>
);

const TestimonialGrid = ({ items }) => (
  <div className="grid gap-5 lg:grid-cols-2">
    {items.map((item) => (
      <motion.blockquote
        key={item.name}
        {...fadeUp}
        className="rounded-[1.6rem] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.08))] p-6 backdrop-blur"
      >
        <div className="inline-flex rounded-full border border-[#A78BFA]/30 bg-[#A78BFA]/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-[#DDD6FE]">
          {item.role}
        </div>
        <p className="mt-5 text-lg leading-8 text-white">“{item.quote}”</p>
        <footer className="mt-5 text-sm font-semibold text-slate-200">{item.name}</footer>
      </motion.blockquote>
    ))}
  </div>
);

const CoverageStrip = ({ items }) => (
  <div className="flex flex-wrap gap-3">
    {items.map((item) => (
      <div key={item} className="rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-medium text-slate-200">
        {item}
      </div>
    ))}
  </div>
);

const SpotlightLink = ({ to, title, description }) => (
  <Link to={to} className="group inline-flex items-center gap-2 text-sm font-semibold text-[#C4B5FD] transition hover:text-white">
    <Sparkles className="h-4 w-4" />
    <span>{title}</span>
    <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
    {description ? <span className="hidden text-slate-400 lg:inline">{description}</span> : null}
  </Link>
);

export {
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
};