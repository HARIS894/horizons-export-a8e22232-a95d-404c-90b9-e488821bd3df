import React from 'react';
import { Badge } from '@/components/ui/badge';

const renderButtons = (buttons) => {
  return (buttons || []).filter((button) => button.label?.trim());
};

const hydrateBodyWithSamples = (draft) => {
  return String(draft.body || '').replace(/\{\{\d+\}\}/g, (token) => {
    const variable = (draft.variables || []).find((item) => item.token === token);
    return variable?.sampleValue || token;
  });
};

const TemplatePreview = ({ draft, readinessLabel, previewMode = 'sample', onPreviewModeChange = () => {} }) => {
  const activeButtons = renderButtons(draft.buttons);
  const header = draft.header || { type: draft.headerType || 'None', content: draft.headerContent || '' };
  const body = previewMode === 'sample' ? hydrateBodyWithSamples(draft) : (draft.body || 'Type your approved template body here...');

  return (
    <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-slate-950/45">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700 dark:text-emerald-200">Live Preview</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">WhatsApp-style message composition preview</p>
        </div>
        <Badge variant="outline" className="rounded-full border-slate-300 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:text-slate-300">
          {readinessLabel}
        </Badge>
      </div>

      <div className="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
        {[
          { key: 'customer', label: 'Preview as Customer' },
          { key: 'sample', label: 'Preview with Sample Data' },
        ].map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => onPreviewModeChange(option.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${previewMode === option.key ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-5 rounded-[24px] border border-emerald-100 bg-[linear-gradient(180deg,#ddf8eb_0%,#f7fbf8_100%)] p-4 dark:border-emerald-900/30 dark:bg-[linear-gradient(180deg,#06251c_0%,#0f172a_100%)]">
        <div className="ml-auto max-w-sm rounded-[24px] border border-emerald-200 bg-white px-4 py-3 text-slate-900 shadow-sm dark:border-emerald-900/30 dark:bg-slate-900 dark:text-slate-100">
          {header.type !== 'None' ? (
            <div className="mb-3 rounded-2xl bg-slate-100 px-3 py-2 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {header.type}: {header.content || 'Header placeholder'}
            </div>
          ) : null}
          <p className="text-sm font-semibold">{draft.name || 'template_name_placeholder'}</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6">{body}</p>
          {draft.footer ? <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">{draft.footer}</p> : null}

          {activeButtons.length ? (
            <div className="mt-4 space-y-2 border-t border-slate-200 pt-3 dark:border-slate-800">
              {activeButtons.map((button) => (
                <div key={button.id} className="rounded-xl bg-slate-50 px-3 py-2 text-center text-xs font-medium text-emerald-700 dark:bg-slate-800 dark:text-emerald-200">
                  {button.type}: {button.label}
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-4 rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-4 text-xs leading-6 text-slate-500 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-400">
        Preview uses fictional sample data only. Do not use real patient data in this isolated module.
      </div>
    </div>
  );
};

export default TemplatePreview;