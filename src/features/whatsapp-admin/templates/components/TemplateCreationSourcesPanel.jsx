import React, { useEffect, useMemo, useState } from 'react';
import { BadgeCheck, CopyPlus, FilePlus2, LibraryBig, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const sourceCards = [
  { key: 'scratch', title: 'Start from Scratch', description: 'Begin with a clean local draft and guided validation.', icon: FilePlus2 },
  { key: 'starter', title: 'Healthcare Template Library', description: 'Use a starter structure for common healthcare workflows.', icon: LibraryBig },
  { key: 'ai', title: 'AI Assisted Creation', description: 'Generate three AI draft options for human review.', icon: Sparkles },
  { key: 'approved', title: 'Previously Approved Template', description: 'Create a new local draft from an approved structure.', icon: BadgeCheck },
  { key: 'clone', title: 'Clone Existing', description: 'Start from any template in your current library and create a safe variation.', icon: CopyPlus },
];

const TemplateCreationSourcesPanel = ({
  starterTemplates,
  approvedTemplates,
  templates = [],
  aiPrompt,
  onAiPromptChange,
  aiSuggestions,
  onCreateFromScratch,
  onUseStarter,
  onUseApprovedTemplate,
  onUseExistingTemplate,
  onUseAiDraft,
  onRegenerateAi,
  preferredSource = 'scratch',
  onPreferredSourceChange,
}) => {
  const [activeSource, setActiveSource] = useState(preferredSource);
  const [starterSearch, setStarterSearch] = useState('');
  const [approvedSearch, setApprovedSearch] = useState('');
  const [cloneSearch, setCloneSearch] = useState('');

  useEffect(() => {
    setActiveSource(preferredSource);
  }, [preferredSource]);

  const updateSource = (key) => {
    setActiveSource(key);
    onPreferredSourceChange?.(key);
  };

  const filteredStarterTemplates = useMemo(() => {
    const search = starterSearch.trim().toLowerCase();
    return starterTemplates.filter((template) => {
      return !search || [template.name, template.purpose, template.internalCategory, template.language].some((value) => String(value || '').toLowerCase().includes(search));
    });
  }, [starterSearch, starterTemplates]);

  const filteredApprovedTemplates = useMemo(() => {
    const search = approvedSearch.trim().toLowerCase();
    return approvedTemplates.filter((template) => {
      return !search || [template.name, template.purpose, template.internalCategory, template.language].some((value) => String(value || '').toLowerCase().includes(search));
    });
  }, [approvedSearch, approvedTemplates]);

  const filteredTemplateLibrary = useMemo(() => {
    const search = cloneSearch.trim().toLowerCase();
    return templates.filter((template) => {
      return !search || [template.name, template.purpose, template.internalCategory, template.language].some((value) => String(value || '').toLowerCase().includes(search));
    });
  }, [cloneSearch, templates]);

  return (
    <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-teal-700 dark:text-teal-200">Template Source</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Choose a starting point</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Pick a source once, then move into the desktop builder with a persistent preview and compact readiness inspector.
          </p>
        </div>
        <Badge variant="outline" className="rounded-full border-slate-300 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-600 dark:border-slate-700 dark:text-slate-300">
          Compact source step
        </Badge>
      </div>

      <div className="mt-5 grid gap-3 lg:grid-cols-5">
        {sourceCards.map((card) => {
          const Icon = card.icon;
          const isActive = activeSource === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => updateSource(card.key)}
              className={`rounded-[24px] border p-4 text-left transition-colors ${isActive ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-slate-200/70 bg-slate-50/80 text-slate-950 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/40 dark:text-white dark:hover:border-slate-700'}`}
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${isActive ? 'bg-white/15 text-white dark:bg-slate-950/10 dark:text-slate-950' : 'bg-white shadow-sm dark:bg-slate-950'}`}>
                <Icon className="h-5 w-5 text-slate-700 dark:text-slate-200" />
              </div>
              <p className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">{card.title}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{card.description}</p>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
        {activeSource === 'scratch' ? (
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Start from a blank Meta-compatible draft</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Open the builder with an empty template shell, then add header, buttons, footer, and variable mapping as needed.</p>
            </div>
            <Button type="button" className="rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" onClick={onCreateFromScratch}>
              <FilePlus2 className="mr-2 h-4 w-4" />
              Start from Scratch
            </Button>
          </div>
        ) : null}

        {activeSource === 'starter' ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Healthcare starters</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Use a healthcare-safe starter and transition straight into the builder.</p>
              </div>
              <Input value={starterSearch} onChange={(event) => setStarterSearch(event.target.value)} placeholder="Search starter templates" className="h-11 w-full rounded-2xl border-slate-200 bg-white lg:max-w-xs dark:border-slate-800 dark:bg-slate-950" />
            </div>
            <div className="grid gap-3 xl:grid-cols-2">
              {filteredStarterTemplates.map((template) => (
                <button key={template.id} type="button" onClick={() => onUseStarter(template)} className="rounded-[22px] border border-slate-200/70 bg-white p-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700 dark:hover:bg-slate-900/60">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-white">{template.name}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{template.internalCategory} • {template.metaCategory}</p>
                    </div>
                    <Badge variant="outline" className="rounded-full border-slate-300 px-2 py-0 text-[10px] text-slate-600 dark:border-slate-700 dark:text-slate-300">{template.language}</Badge>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{template.purpose}</p>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {activeSource === 'clone' ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Clone from existing library</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Create a new working variation from any draft already in the local template library.</p>
              </div>
              <Input value={cloneSearch} onChange={(event) => setCloneSearch(event.target.value)} placeholder="Search existing templates" className="h-11 w-full rounded-2xl border-slate-200 bg-white lg:max-w-xs dark:border-slate-800 dark:bg-slate-950" />
            </div>
            <div className="space-y-3">
              {filteredTemplateLibrary.map((template) => (
                <div key={template.id} className="flex flex-col gap-3 rounded-[22px] border border-slate-200/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">{template.name}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{template.purpose}</p>
                  </div>
                  <Button type="button" variant="outline" className="rounded-full" onClick={() => onUseExistingTemplate(template)}>
                    <CopyPlus className="mr-2 h-4 w-4" />
                    Clone Draft
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeSource === 'approved' ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Approved templates</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Start from a Meta-approved structure without implying that the new variation is approved.</p>
              </div>
              <Input value={approvedSearch} onChange={(event) => setApprovedSearch(event.target.value)} placeholder="Search approved templates" className="h-11 w-full rounded-2xl border-slate-200 bg-white lg:max-w-xs dark:border-slate-800 dark:bg-slate-950" />
            </div>
            <div className="space-y-3">
              {filteredApprovedTemplates.map((template) => (
                <div key={template.id} className="flex flex-col gap-3 rounded-[22px] border border-slate-200/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">{template.name}</p>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{template.purpose}</p>
                  </div>
                  <Button type="button" variant="outline" className="rounded-full" onClick={() => onUseApprovedTemplate(template)}>
                    <BadgeCheck className="mr-2 h-4 w-4" />
                    Use Approved Structure
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeSource === 'ai' ? (
          <div className="space-y-4">
            <div className="rounded-[22px] border border-violet-200/80 bg-violet-500/5 p-4 dark:border-violet-900/40 dark:bg-violet-950/20">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">AI draft options</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">AI remains advisory only. Human review and local readiness checks still apply.</p>
                </div>
                <Badge variant="outline" className="rounded-full border-violet-300 bg-violet-500/10 px-3 py-1 text-[10px] text-violet-700 dark:border-violet-900 dark:text-violet-200">AI Draft</Badge>
              </div>
              <Input value={aiPrompt} onChange={(event) => onAiPromptChange(event.target.value)} placeholder="What do you want to communicate?" className="mt-4 h-11 rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950" />
              <div className="mt-3 flex flex-wrap gap-2">
                <Button type="button" className="rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" onClick={onRegenerateAi}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Options
                </Button>
              </div>
            </div>
            <div className="grid gap-3 xl:grid-cols-3">
              {aiSuggestions.map((option) => (
                <div key={option.id} className="rounded-[22px] border border-white/70 bg-white/75 p-4 dark:border-white/10 dark:bg-slate-950/35">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-950 dark:text-white">{option.title}</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{option.description}</p>
                    </div>
                    <Badge variant="outline" className="rounded-full border-violet-300 bg-violet-500/10 px-3 py-1 text-[10px] text-violet-700 dark:border-violet-900 dark:text-violet-200">Option</Badge>
                  </div>
                  <ul className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <li>AI suggestion - review before saving or future submission.</li>
                    {option.warnings.map((warning) => (
                      <li key={warning}>{warning}</li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    <Button type="button" variant="outline" className="rounded-full" onClick={() => onUseAiDraft(option)}>
                      Use Draft
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TemplateCreationSourcesPanel;