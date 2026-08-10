import React from 'react';

const IntegrationSummaryCards = ({ items }) => (
  <div className="grid gap-3 xl:grid-cols-5">
    {items.map((item) => (
      <div key={item.key} className="rounded-[24px] border border-slate-200/80 bg-white/90 px-4 py-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-950/35">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{item.label}</p>
        <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{item.value}</p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{item.caption}</p>
      </div>
    ))}
  </div>
);

export default IntegrationSummaryCards;
