import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const NativeSelect = ({ value, onChange, options }) => (
  <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
    {options.map((option) => (
      <option key={option} value={option}>{option}</option>
    ))}
  </select>
);

const FlowTestRunnerPanel = ({ selectedInputType, onSelectInputType, payloads, result, onRunTest }) => {
  const payload = payloads[selectedInputType] || {};

  return (
    <div className="grid gap-5 xl:grid-cols-[340px,minmax(0,1fr)]">
      <div className="space-y-5">
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">Test Input</p>
          <div className="mt-4 space-y-4">
            <NativeSelect value={selectedInputType} onChange={onSelectInputType} options={Object.keys(payloads)} />
            <pre className="overflow-auto rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 text-xs leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">{JSON.stringify(payload, null, 2)}</pre>
            <Button type="button" className="w-full rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" onClick={onRunTest}>
              Run Test Simulation
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-700 dark:text-emerald-200">Test Result</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Simulated Execution</h3>
          </div>
          {result ? <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">{result.status}</Badge> : null}
        </div>

        {result ? (
          <div className="mt-5 space-y-4">
            {result.steps.map((step, index) => (
              <div key={`${step.label}-${index}`} className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{step.label}</p>
                  <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em]">{step.outcome}</Badge>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{step.detail}</p>
              </div>
            ))}
            <div className="rounded-[22px] border border-cyan-200 bg-cyan-50/80 p-4 dark:border-cyan-900/40 dark:bg-cyan-950/20">
              <p className="text-sm font-semibold text-cyan-900 dark:text-cyan-100">Final Result</p>
              <p className="mt-2 text-sm leading-6 text-cyan-800 dark:text-cyan-200">{result.finalResult}</p>
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-[22px] border border-dashed border-slate-300 bg-slate-50/70 px-5 py-12 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
            Choose a mock input and run a local simulation. No external calls are executed here.
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowTestRunnerPanel;