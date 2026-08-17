import React from 'react';

const PricingHero = ({ billingCycle, onBillingChange }) => {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] border border-purple-100 bg-[linear-gradient(135deg,_rgba(245,243,255,0.96)_0%,_rgba(255,255,255,0.97)_50%,_rgba(238,242,255,0.94)_100%)] p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur lg:p-14">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-purple-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#7C3AED]">
              Healthcare Pricing
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
              Simple, Transparent Healthcare Plans
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Choose a healthcare plan for home care, telemedicine, specialist coordination, and family support without hidden pricing surprises.
            </p>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-500">
              Monthly billing gives flexibility for urgent needs. Annual billing is designed for long-term continuity, better value, and calmer family planning.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">Billing Options</p>
            <div
              className="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-100 p-1"
              role="tablist"
              aria-label="Billing frequency"
            >
              {[
                { value: 'monthly', label: 'Monthly' },
                { value: 'annual', label: 'Annual' },
              ].map((option) => {
                const isActive = billingCycle === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onBillingChange(option.value)}
                    className={`rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-[#7C3AED] shadow-[0_10px_25px_rgba(15,23,42,0.10)]'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-purple-100 bg-purple-50/80 p-5">
                <p className="text-sm font-semibold text-[#6D28D9]">Monthly Flexibility</p>
                <p className="mt-2 text-sm leading-7 text-emerald-900/80">
                  Best for immediate home healthcare needs, discharge transitions, or short-term family support.
                </p>
              </div>
              <div className="rounded-3xl border border-indigo-100 bg-indigo-50/80 p-5">
                <p className="text-sm font-semibold text-indigo-700">Annual Savings</p>
                <p className="mt-2 text-sm leading-7 text-indigo-950/80">
                  Save the equivalent of two months when you plan for continuity of care.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingHero;