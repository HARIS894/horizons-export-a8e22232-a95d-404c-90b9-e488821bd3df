import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TemplateStatusBadge from './TemplateStatusBadge';
import { TEMPLATE_SOURCE_META } from '../types/templateTypes';

const TemplateDetailPanel = ({ template, onDuplicate, onUseTemplate, onConnectToFlow, onToggleEnabled, onPreview }) => {
  if (!template) {
    return null;
  }

  const sourceMeta = TEMPLATE_SOURCE_META[template.source] || TEMPLATE_SOURCE_META.LOCAL;

  return (
    <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/40">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-violet-700 dark:text-violet-200">Template Detail</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{template.name}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <TemplateStatusBadge status={template.localStatus || template.status} />
          <TemplateStatusBadge status={template.metaStatus} kind="meta" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="outline" className={`rounded-full px-3 py-1 text-[11px] ${sourceMeta.className}`}>
          {sourceMeta.label}
        </Badge>
        {(template.tags || []).map((tag) => (
          <Badge key={tag} variant="outline" className="rounded-full border-slate-300 px-3 py-1 text-[11px] text-slate-600 dark:border-slate-700 dark:text-slate-300">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Internal Category</p>
          <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{template.internalCategory || template.category}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Meta Category</p>
          <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{template.metaCategory || template.category}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Language</p>
          <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{template.language}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Healthcare Use Case</p>
          <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{template.healthcareUseCase}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Created</p>
          <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{template.createdAt}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Updated</p>
          <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{template.updatedAt}</p>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-slate-200/70 bg-white/60 p-5 dark:border-slate-800 dark:bg-slate-950/25">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Purpose</p>
        <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-slate-200">{template.purpose}</p>
      </div>

      <div className="mt-6 rounded-[24px] border border-slate-200/70 bg-white/60 p-5 dark:border-slate-800 dark:bg-slate-950/25">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-slate-950 dark:text-white">Meta status placeholder</p>
          <Badge variant="outline" className="rounded-full border-slate-300 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:text-slate-300">
            Placeholder only
          </Badge>
        </div>
        <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{template.metaStatusLabel || template.metaStatus}</p>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Submission behavior is intentionally not connected in this phase.
        </p>
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-slate-950 dark:text-white">Variables</p>
        <div className="mt-3 space-y-3">
          {(template.variables || []).map((variable, index) => {
            const entry = typeof variable === 'string'
              ? { id: `legacy-var-${index}`, token: `{{${index + 1}}}`, name: variable, sampleValue: '', description: '' }
              : variable;

            return (
              <div key={entry.id} className="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{entry.token} - {entry.name}</p>
                  {entry.sampleValue ? (
                    <Badge variant="outline" className="rounded-full border-cyan-300 bg-cyan-500/10 px-2.5 py-0.5 text-[10px] text-cyan-700 dark:border-cyan-900 dark:text-cyan-200">
                      Sample: {entry.sampleValue}
                    </Badge>
                  ) : null}
                </div>
                {entry.description ? <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">{entry.description}</p> : null}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-slate-950 dark:text-white">Buttons</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {(template.buttons || []).length ? template.buttons.map((button, index) => (
            <Badge key={`${button.type}-${index}`} variant="outline" className="rounded-full border-emerald-300 bg-emerald-500/10 px-3 py-1 text-[11px] text-emerald-700 dark:border-emerald-900 dark:text-emerald-200">
              {button.type}: {button.label}
            </Badge>
          )) : <p className="text-sm text-slate-500 dark:text-slate-400">No buttons configured.</p>}
        </div>
      </div>

      <div className="mt-6 grid gap-2 sm:grid-cols-2">
        <Button type="button" variant="outline" className="rounded-full" onClick={() => onPreview?.(template)}>Preview</Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={() => onDuplicate?.(template)}>Duplicate</Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={() => onUseTemplate?.(template)}>Use Template</Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={() => onConnectToFlow?.(template)}>Connect to Flow</Button>
        <Button type="button" variant="outline" className="rounded-full sm:col-span-2" onClick={() => onToggleEnabled?.(template)}>
          {template.localStatus === 'DISABLED' ? 'Enable Template' : 'Disable Template'}
        </Button>
      </div>

      <div className="mt-6">
        <p className="text-sm font-semibold text-slate-950 dark:text-white">Action history placeholder</p>
        <div className="mt-3 space-y-2">
          {(template.approvalHistory || []).map((entry, index) => (
            <div key={`${entry.label}-${index}`} className="rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300">
              <p className="font-medium text-slate-900 dark:text-white">{entry.label}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{entry.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateDetailPanel;