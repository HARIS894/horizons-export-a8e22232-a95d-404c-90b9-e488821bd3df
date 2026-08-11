import React from 'react';
import { ArrowLeft, CheckCircle2, CopyPlus, Eye, FlaskConical, PauseCircle, PlayCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const actions = [
  { key: 'save', label: 'Save', icon: Save },
  { key: 'saveAs', label: 'Save As', icon: CopyPlus },
  { key: 'validate', label: 'Validate', icon: CheckCircle2 },
  { key: 'preview', label: 'Preview', icon: Eye },
  { key: 'test', label: 'Test', icon: FlaskConical },
  { key: 'publish', label: 'Publish', icon: PlayCircle },
  { key: 'pause', label: 'Pause', icon: PauseCircle },
];

const FlowBuilderToolbar = ({ flow, onAction, onBack, onNameChange, notice, validation }) => {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700 dark:text-cyan-200">Flow Workspace</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <Button type="button" variant="outline" className="rounded-full" onClick={onBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Input value={flow.name} onChange={(event) => onNameChange(event.target.value)} className="h-11 max-w-[340px] rounded-2xl border-slate-200 text-lg font-semibold dark:border-slate-800" />
            <span className="rounded-full border border-cyan-300 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:border-cyan-900 dark:text-cyan-200">{flow.flowCode}</span>
            <span className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-slate-700 dark:text-slate-300">{flow.status}</span>
            <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${validation?.severity === 'ERROR' ? 'border-rose-300 bg-rose-500/10 text-rose-700 dark:border-rose-900 dark:text-rose-200' : validation?.severity === 'WARNING' ? 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-900 dark:text-amber-200' : 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200'}`}>
              {validation?.severity || 'PASS'}
            </span>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">{flow.description}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{notice}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button key={action.key} type="button" variant={action.key === 'publish' ? 'default' : 'outline'} className="rounded-full" onClick={() => onAction(action.key)} disabled={action.key === 'publish' && !validation?.canPublish}>
                <Icon className="mr-2 h-4 w-4" />
                {action.label}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FlowBuilderToolbar;