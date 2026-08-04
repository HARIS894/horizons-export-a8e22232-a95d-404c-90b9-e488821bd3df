import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const ServiceCard = ({ service, icon: Icon, variant = 'default' }) => {
  const isCompact = variant === 'compact';

  return (
    <article className={`rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(15,23,42,0.08)] ${isCompact ? 'p-5' : 'p-6'}`}>
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-[#7C3AED] ${isCompact ? 'h-11 w-11' : ''}`}>
        <Icon className={isCompact ? 'h-5 w-5' : 'h-6 w-6'} />
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#7C3AED]">{service.category}</p>
      <h3 className={`mt-3 font-semibold text-slate-900 ${isCompact ? 'text-lg' : 'text-xl'}`}>{service.title}</h3>
      <p className={`mt-3 text-sm leading-7 text-slate-600 ${isCompact ? 'line-clamp-3' : ''}`}>{service.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">{service.heroBadge}</span>
        {service.benefits?.[0] ? <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-[#7C3AED]">{service.benefits[0]}</span> : null}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <Link to={`/services/${service.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-[#7C3AED]">
          Explore service <ArrowRight className="h-4 w-4" />
        </Link>
        <span className="text-xs uppercase tracking-[0.22em] text-slate-400">AEO ready</span>
      </div>
    </article>
  );
};

export default ServiceCard;