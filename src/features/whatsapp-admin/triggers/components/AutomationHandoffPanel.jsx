import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { automationHandoffContracts, flowExecutionContracts, integrationAdapterContracts } from '../../automation/contracts/automationContracts';

const AutomationHandoffPanel = ({ states, selectedTrigger }) => {
  return (
    <div className="space-y-5">
      <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-violet-700 dark:text-violet-200">Manual Chat + Automation Handoff</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Inbox-safe coordination states</h3>
          </div>
          <ShieldAlert className="h-5 w-5 text-violet-600 dark:text-violet-300" />
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{automationHandoffContracts.inboxCompatibility} {automationHandoffContracts.conflictPrevention}</p>

        <div className="mt-4 space-y-3">
          {states.map((state) => (
            <div key={state.id} className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">{state.conversation}</p>
                <span className="rounded-full border border-slate-300 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-slate-700 dark:text-slate-300">{state.state}</span>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{state.detail}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700 dark:text-cyan-200">Backend Execution Engine</p>
        <div className="mt-4 grid gap-3">
          {Object.entries(flowExecutionContracts).map(([key, value]) => (
            <div key={key} className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <p className="text-sm font-semibold capitalize text-slate-950 dark:text-white">{key}</p>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-700 dark:text-emerald-200">Provider Adapter Methods</p>
        <div className="mt-4 grid gap-3">
          {Object.entries(integrationAdapterContracts).map(([provider, methods]) => (
            <div key={provider} className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">{provider}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {methods.map((method) => (
                  <span key={method} className="rounded-full border border-slate-300 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-slate-700 dark:text-slate-300">{method}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
        {selectedTrigger ? <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">Selected trigger: {selectedTrigger.triggerCode} -> {selectedTrigger.flowCode}</p> : null}
      </div>
    </div>
  );
};

export default AutomationHandoffPanel;