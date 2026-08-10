import React from 'react';
import { AlertTriangle, CheckCircle2, Info, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import TemplateStatusBadge from './TemplateStatusBadge';

const TemplateMetaReadinessPanel = ({ draft, assessment, showAiQuality, onRunQualityCheck }) => {
  return (
    <div className="space-y-5 rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-700 dark:text-sky-200">Meta Readiness</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Category guidance, local validation, and later provider submission readiness.</p>
        </div>
        <TemplateStatusBadge status={draft.localStatus || draft.status} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Local Status</p>
          <div className="mt-2">
            <TemplateStatusBadge status={draft.localStatus || draft.status} />
          </div>
        </div>
        <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Meta Status</p>
          <div className="mt-2">
            <TemplateStatusBadge status={draft.metaStatus} kind="meta" />
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Category recommendation</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Advisory only. Meta determines the final classification and review outcome.</p>
          </div>
          <Badge variant="outline" className="rounded-full border-indigo-300 bg-indigo-500/10 px-3 py-1 text-[10px] text-indigo-700 dark:border-indigo-900 dark:text-indigo-200">
            {assessment.recommendedMetaCategory}
          </Badge>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-500/5 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/15">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-semibold">Pass</span>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {assessment.passes.length ? assessment.passes.map((item) => <li key={item}>{item}</li>) : <li>No pass signals yet.</li>}
          </ul>
        </div>
        <div className="rounded-[24px] border border-amber-200 bg-amber-500/5 p-4 dark:border-amber-900/30 dark:bg-amber-950/15">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-200">
            <Info className="h-4 w-4" />
            <span className="text-sm font-semibold">Warnings</span>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {assessment.warnings.length ? assessment.warnings.map((item) => <li key={item}>{item}</li>) : <li>No warnings detected.</li>}
          </ul>
        </div>
        <div className="rounded-[24px] border border-rose-200 bg-rose-500/5 p-4 dark:border-rose-900/30 dark:bg-rose-950/15">
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-200">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-semibold">Blocks</span>
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {assessment.blockingIssues.length ? assessment.blockingIssues.map((item) => <li key={item}>{item}</li>) : <li>No blocking issues.</li>}
          </ul>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-950 dark:text-white">AI Quality Check</p>
          <Button type="button" variant="outline" className="rounded-full" onClick={onRunQualityCheck}>
            <Sparkles className="mr-2 h-4 w-4" />
            Run AI Quality Check
          </Button>
        </div>
        {showAiQuality ? (
          <div className="mt-4 space-y-3">
            {Object.entries(assessment.qualityChecks).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
                <span className="text-sm text-slate-700 dark:text-slate-200">{key.replace(/([A-Z])/g, ' $1')}</span>
                <Badge variant="outline" className="rounded-full border-slate-300 px-2.5 py-0.5 text-[10px] text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  {value}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">Internal advisory only. This is not a Meta score and does not predict approval with certainty.</p>
        )}
      </div>

      <div className="rounded-[24px] border border-blue-200 bg-blue-500/5 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-200">
          <ShieldCheck className="h-4 w-4" />
          <p className="text-sm font-semibold">Meta Guidelines</p>
        </div>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          <li>Templates are reviewed by Meta.</li>
          <li>Template purpose should match the selected category.</li>
          <li>Approved templates should be used according to their approved purpose.</li>
          <li>Business-initiated messages outside the applicable customer-service window require approved templates.</li>
          <li>Free-form messaging is available during the applicable customer-service window.</li>
        </ul>
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-200">Meta is the final authority on template approval.</p>
      </div>
    </div>
  );
};

export default TemplateMetaReadinessPanel;