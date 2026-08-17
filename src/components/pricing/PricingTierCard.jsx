import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PricingTierCard = ({ tier, billingCycle, onChoosePlan }) => {
  const price = billingCycle === 'annual' ? tier.annualPrice : tier.monthlyPrice;
  const periodLabel = billingCycle === 'annual' ? '/year' : '/month';

  return (
    <article
      className={`relative flex h-full flex-col rounded-[2rem] border p-7 shadow-[0_20px_55px_rgba(15,23,42,0.07)] transition-transform duration-200 hover:-translate-y-1 ${
        tier.featured
          ? 'border-purple-300 bg-slate-950 text-white'
          : 'border-slate-200 bg-white text-slate-900'
      }`}
      aria-label={`${tier.name} healthcare plan`}
    >
      {tier.featured ? (
        <div className="absolute right-6 top-6 rounded-full bg-purple-300 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-950">
          Most Popular
        </div>
      ) : null}

      <div>
        <p className={`text-sm font-semibold uppercase tracking-[0.24em] ${tier.featured ? 'text-purple-300' : 'text-[#7C3AED]'}`}>
          {tier.name}
        </p>
        <p className={`mt-4 text-4xl font-bold tracking-tight ${tier.featured ? 'text-white' : 'text-slate-950'}`}>
          {price}
          <span className={`ml-2 text-base font-medium ${tier.featured ? 'text-slate-300' : 'text-slate-500'}`}>
            {periodLabel}
          </span>
        </p>
        <p className={`mt-4 text-sm leading-7 ${tier.featured ? 'text-slate-300' : 'text-slate-600'}`}>
          {tier.description}
        </p>
      </div>

      <ul className="mt-8 space-y-3" aria-label={`${tier.name} included features`}>
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${tier.featured ? 'text-purple-300' : 'text-[#7C3AED]'}`} />
            <span className={`text-sm leading-7 ${tier.featured ? 'text-slate-100' : 'text-slate-700'}`}>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-8 pt-4">
        <Button
          type="button"
          onClick={() => onChoosePlan(tier)}
          className={`h-12 w-full rounded-full px-6 text-base font-semibold transition-all duration-200 ${
            tier.featured
              ? 'bg-purple-300 text-slate-950 hover:bg-purple-200'
              : 'bg-[#7C3AED] text-white hover:bg-[#6D28D9]'
          }`}
        >
          Choose Plan
        </Button>
      </div>
    </article>
  );
};

export default PricingTierCard;