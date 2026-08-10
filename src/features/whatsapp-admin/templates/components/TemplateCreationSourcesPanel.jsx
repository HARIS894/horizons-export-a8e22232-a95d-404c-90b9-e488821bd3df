import React, { useMemo, useState } from 'react';
import { BadgeCheck, CopyPlus, FilePlus2, Layers3, LibraryBig, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const sourceCards = [
  { key: 'scratch', title: 'Start from Scratch', description: 'Begin with a clean local draft and guided validation.', icon: FilePlus2 },
  { key: 'starter', title: 'Healthcare Template Library', description: 'Use a starter structure for common healthcare workflows.', icon: LibraryBig },
  { key: 'ai', title: 'AI Assisted Creation', description: 'Generate three AI draft options for human review.', icon: Sparkles },
  { key: 'approved', title: 'Previously Approved Template', description: 'Create a new local draft from an approved structure.', icon: BadgeCheck },
  { key: 'custom', title: 'Other / Custom Template', description: 'Create a flexible operational template for a new workflow.', icon: Layers3 },
];

const TemplateCreationSourcesPanel = ({
  starterTemplates,
  approvedTemplates,
  aiPrompt,
  onAiPromptChange,
  aiSuggestions,
  onCreateFromScratch,
  onUseStarter,
  onUseApprovedTemplate,
  onDuplicateTemplate,
  onUseAiDraft,
  onRegenerateAi,
}) => {
  const [approvedSearch, setApprovedSearch] = useState('');
  const [approvedCategory, setApprovedCategory] = useState('All');
  const [approvedLanguage, setApprovedLanguage] = useState('All');

  const approvedCategories = useMemo(() => ['All', ...new Set(approvedTemplates.map((template) => template.internalCategory))], [approvedTemplates]);
  const approvedLanguages = useMemo(() => ['All', ...new Set(approvedTemplates.map((template) => template.language))], [approvedTemplates]);
  const filteredApprovedTemplates = useMemo(() => {
    const search = approvedSearch.trim().toLowerCase();
    return approvedTemplates.filter((template) => {
      const matchesSearch = !search || [template.name, template.purpose, template.internalCategory, template.language].some((value) => String(value || '').toLowerCase().includes(search));
      const matchesCategory = approvedCategory === 'All' || template.internalCategory === approvedCategory;
      const matchesLanguage = approvedLanguage === 'All' || template.language === approvedLanguage;
      return matchesSearch && matchesCategory && matchesLanguage;
    });
  }, [approvedCategory, approvedLanguage, approvedSearch, approvedTemplates]);

  return (
    <div className="space-y-6 rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-teal-700 dark:text-teal-200">Fast Creation Model</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Choose a starting point</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Template Library to Guided Builder to Variables to Buttons to Preview to Validation to Meta Readiness to Human Review.
          </p>
        </div>
        <Button type="button" variant="outline" className="rounded-full" onClick={onCreateFromScratch}>
          <FilePlus2 className="mr-2 h-4 w-4" />
          Create Template
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {sourceCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="rounded-[24px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm dark:bg-slate-950">
                <Icon className="h-5 w-5 text-slate-700 dark:text-slate-200" />
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">{card.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{card.description}</p>
              <Button type="button" variant="outline" className="mt-4 rounded-full" onClick={onCreateFromScratch}>
                {card.key === 'approved' ? 'Open Approved Templates' : card.key === 'ai' ? 'Use AI Assistant' : card.key === 'starter' ? 'Browse Library' : 'Start Now'}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 2xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Starter library</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Starter Template. Meta approval required before WhatsApp production use.</p>
            </div>
            <Badge variant="outline" className="rounded-full border-teal-300 bg-teal-500/10 px-3 py-1 text-[10px] text-teal-700 dark:border-teal-900 dark:text-teal-200">
              LOCAL STARTER
            </Badge>
          </div>
          <div className="grid gap-3 lg:grid-cols-2">
            {starterTemplates.map((template) => (
              <button
                key={template.id}
                type="button"
                onClick={() => onUseStarter(template)}
                className="rounded-[24px] border border-slate-200/70 bg-white p-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700 dark:hover:bg-slate-900/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">{template.name}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{template.internalCategory} • {template.metaCategory}</p>
                  </div>
                  <Badge variant="outline" className="rounded-full border-slate-300 px-2 py-0 text-[10px] text-slate-600 dark:border-slate-700 dark:text-slate-300">
                    {template.language}
                  </Badge>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{template.purpose}</p>
                <p className="mt-3 text-xs font-medium text-amber-700 dark:text-amber-200">Meta approval required before WhatsApp production use.</p>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[24px] border border-violet-200/80 bg-violet-500/5 p-4 dark:border-violet-900/40 dark:bg-violet-950/20">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Create with AI</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">AI outputs are drafts only and require human review.</p>
              </div>
              <Badge variant="outline" className="rounded-full border-violet-300 bg-violet-500/10 px-3 py-1 text-[10px] text-violet-700 dark:border-violet-900 dark:text-violet-200">
                AI DRAFT
              </Badge>
            </div>
            <Input value={aiPrompt} onChange={(event) => onAiPromptChange(event.target.value)} placeholder="What do you want to communicate?" className="mt-4 h-11 rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" className="rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" onClick={onRegenerateAi}>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Options
              </Button>
              <Button type="button" variant="outline" className="rounded-full">Make More Professional</Button>
              <Button type="button" variant="outline" className="rounded-full">Make More Concise</Button>
              <Button type="button" variant="outline" className="rounded-full">Add Variables</Button>
            </div>
            <div className="mt-4 space-y-3">
              {aiSuggestions.map((option) => (
                <div key={option.id} className="rounded-[22px] border border-white/70 bg-white/75 p-4 dark:border-white/10 dark:bg-slate-950/35">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-white">{option.title}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{option.description}</p>
                    </div>
                    <Badge variant="outline" className="rounded-full border-violet-300 bg-violet-500/10 px-3 py-1 text-[10px] text-violet-700 dark:border-violet-900 dark:text-violet-200">
                      Option
                    </Badge>
                  </div>
                  <ul className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <li>AI suggestion - review before saving/submitting.</li>
                    {option.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button type="button" variant="outline" className="rounded-full" onClick={() => onUseAiDraft(option)}>
                      Use Draft
                    </Button>
                    <Button type="button" variant="outline" className="rounded-full">Edit</Button>
                    <Button type="button" variant="outline" className="rounded-full" onClick={onRegenerateAi}>Regenerate</Button>
                    <Button type="button" variant="outline" className="rounded-full">Check Quality</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Previously approved templates</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Use an approved structure as the starting point for a new local draft.</p>
              </div>
              <Badge variant="outline" className="rounded-full border-emerald-300 bg-emerald-500/10 px-3 py-1 text-[10px] text-emerald-700 dark:border-emerald-900 dark:text-emerald-200">
                META APPROVED
              </Badge>
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              <Input value={approvedSearch} onChange={(event) => setApprovedSearch(event.target.value)} placeholder="Search approved templates" className="h-11 rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" />
              <select value={approvedCategory} onChange={(event) => setApprovedCategory(event.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950">
                {approvedCategories.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
              <select value={approvedLanguage} onChange={(event) => setApprovedLanguage(event.target.value)} className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm dark:border-slate-800 dark:bg-slate-950">
                {approvedLanguages.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            <div className="mt-3 space-y-3">
              {filteredApprovedTemplates.map((template) => (
                <div key={template.id} className="rounded-[22px] border border-slate-200/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-white">{template.name}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{template.metaCategory} • {template.language}</p>
                    </div>
                    <button type="button" onClick={() => onDuplicateTemplate(template)} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                      <CopyPlus className="h-3.5 w-3.5" />
                      Create Variation
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button type="button" variant="outline" className="rounded-full">View</Button>
                    <Button type="button" variant="outline" className="rounded-full" onClick={() => onUseApprovedTemplate(template)}>Use as Starting Point</Button>
                    <Button type="button" variant="outline" className="rounded-full" onClick={() => onDuplicateTemplate(template)}>Duplicate</Button>
                    <Button type="button" variant="outline" className="rounded-full">Connect to Flow</Button>
                  </div>
                </div>
              ))}
              {!filteredApprovedTemplates.length ? <p className="text-sm text-slate-500 dark:text-slate-400">No approved templates match the current search or filters.</p> : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateCreationSourcesPanel;