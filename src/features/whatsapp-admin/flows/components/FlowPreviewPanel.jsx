import React from 'react';
import { Badge } from '@/components/ui/badge';

const FlowPreviewPanel = ({ flow, scenarios, selectedScenarioId, onSelectScenario }) => {
  const selectedScenario = scenarios.find((scenario) => scenario.id === selectedScenarioId) || scenarios[0] || null;

  return (
    <div className="grid gap-5 xl:grid-cols-[320px,minmax(0,1fr)]">
      <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">Preview Scenarios</p>
        <div className="mt-4 space-y-3">
          {scenarios.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              onClick={() => onSelectScenario(scenario.id)}
              className={`w-full rounded-[22px] border px-4 py-4 text-left transition-colors ${selectedScenarioId === scenario.id ? 'border-cyan-300 bg-cyan-500/10 text-cyan-900 dark:border-cyan-900 dark:text-cyan-100' : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/45 dark:text-slate-200 dark:hover:border-slate-700'}`}
            >
              <p className="text-sm font-semibold">{scenario.name}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] opacity-80">{scenario.triggerLabel}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700 dark:text-cyan-200">Flow Preview</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{flow.name}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Simulation only. No real WhatsApp messages, emails, webhooks, or provider calls are executed.</p>
            </div>
            <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">{flow.flowCode}</Badge>
          </div>

          {selectedScenario ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">{selectedScenario.name}</p>
                <div className="mt-4 space-y-3">
                  {selectedScenario.steps.map((step, index) => (
                    <div key={`${selectedScenario.id}-${step}`} className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/30">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">{index + 1}</div>
                      <p className="text-sm text-slate-700 dark:text-slate-200">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[22px] border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Preview Result</p>
                <p className="mt-2 text-sm leading-6 text-amber-800 dark:text-amber-200">{selectedScenario.result}</p>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-violet-700 dark:text-violet-200">Templates Used</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(flow.templatesUsed || []).map((templateCode) => (
              <Badge key={templateCode} variant="outline" className="rounded-full border-violet-300 bg-violet-500/10 px-3 py-1 text-[11px] text-violet-700 dark:border-violet-900 dark:text-violet-200">
                {templateCode}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlowPreviewPanel;