import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const NativeSelect = ({ value, onChange, options }) => (
  <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
    {options.map((option) => {
      const nextValue = typeof option === 'string' ? option : option.value;
      const nextLabel = typeof option === 'string' ? option : option.label;
      return <option key={nextValue} value={nextValue}>{nextLabel}</option>;
    })}
  </select>
);

const TriggerWizardPanel = ({ steps, draft, events, flows, onChange, onStepChange, onSave }) => {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-violet-700 dark:text-violet-200">Trigger Wizard</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Create trigger to flow routing</h3>
        </div>
        <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.18em]">Step {draft.currentStep} of {steps.length}</Badge>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {steps.map((step, index) => (
          <button key={step} type="button" onClick={() => onStepChange(index + 1)} className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] ${draft.currentStep === index + 1 ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300'}`}>
            {step}
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-4">
        <Input value={draft.triggerCode} onChange={(event) => onChange('triggerCode', event.target.value)} placeholder="Trigger Code" className="h-11 rounded-2xl" />
        <Input value={draft.name} onChange={(event) => onChange('name', event.target.value)} placeholder="Trigger name" className="h-11 rounded-2xl" />
        <NativeSelect value={draft.event} onChange={(value) => onChange('event', value)} options={events} />
        <NativeSelect value={draft.flowCode} onChange={(value) => onChange('flowCode', value)} options={flows.map((flow) => ({ value: flow.flowCode, label: `${flow.flowCode} • ${flow.name}` }))} />
        <Input value={draft.conditions?.[0]?.value || ''} onChange={(event) => onChange('conditionValue', event.target.value)} placeholder="Example condition value" className="h-11 rounded-2xl" />
        <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-200">
          {draft.reviewSummary}
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <Button type="button" variant="outline" className="rounded-full" onClick={() => onStepChange(Math.max(1, draft.currentStep - 1))}>Previous</Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={() => onStepChange(Math.min(steps.length, draft.currentStep + 1))}>Next</Button>
        <Button type="button" className="rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" onClick={onSave}>Save Trigger Draft</Button>
      </div>
    </div>
  );
};

export default TriggerWizardPanel;