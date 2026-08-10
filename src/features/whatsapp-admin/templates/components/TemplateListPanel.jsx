import React from 'react';
import { ArrowUpDown, Archive, ArrowRightCircle, Copy, Eye, FolderKanban, MoreHorizontal, Pencil, Power, Send, Sparkles, Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import TemplateStatusBadge from './TemplateStatusBadge';
import { TEMPLATE_LIBRARY_TABS, TEMPLATE_SOURCE_META } from '../types/templateTypes';

const getMetaReadinessLabel = (template) => {
  const localStatus = template.localStatus || template.status;

  if (template.metaStatus === 'APPROVED') {
    return 'Approved';
  }

  if (template.metaStatus === 'REJECTED') {
    return 'Rejected';
  }

  if (template.metaStatus === 'PENDING' || localStatus === 'SUBMITTED' || localStatus === 'PENDING') {
    return 'Submitted';
  }

  if (localStatus === 'READY_TO_SUBMIT') {
    return 'Ready for Meta Review';
  }

  if (localStatus === 'DRAFT' || localStatus === 'VALIDATING') {
    return 'Needs Attention';
  }

  return 'Not Ready';
};

const NativeSelect = ({ value, onChange, options, placeholder, icon: Icon = null }) => (
  <div className="relative">
    {Icon ? <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" /> : null}
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`h-11 w-full appearance-none rounded-2xl border border-slate-200 bg-white pr-10 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 ${Icon ? 'pl-10' : 'pl-4'}`}
    >
      {placeholder ? <option value="">{placeholder}</option> : null}
      {options.map((option) => {
        const nextValue = typeof option === 'string' ? option : option.value;
        const nextLabel = typeof option === 'string' ? option : option.label;
        return (
          <option key={nextValue} value={nextValue}>
            {nextLabel}
          </option>
        );
      })}
    </select>
    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">v</span>
  </div>
);

const ActionChip = ({ icon: Icon, label, disabled = false, onClick }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={(event) => {
      event.stopPropagation();
      onClick?.();
    }}
    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:text-white"
  >
    <Icon className="h-3 w-3" />
    {label}
  </button>
);

const TemplateListPanel = ({
  activeTab,
  onTabChange,
  filters,
  onFilterChange,
  filterOptions,
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onCreateTemplate,
  onDuplicateTemplate,
  onEditTemplate,
  onPreviewTemplate,
  onToggleFavorite,
  onToggleEnabled,
  onArchiveTemplate,
  onDeleteDraft,
  onUseTemplate,
  onConnectToFlow,
}) => {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-sky-700 dark:text-sky-200">Templates Module</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">WhatsApp Templates</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Manage template drafts, validation readiness, provider-facing lifecycle states, and review placeholders without connecting Meta in this phase.
          </p>
        </div>
        <Button type="button" onClick={onCreateTemplate} className="rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
          Create Template
        </Button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {TEMPLATE_LIBRARY_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onTabChange(tab)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${activeTab === tab ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-3 xl:grid-cols-2 2xl:grid-cols-3">
        <Input
          value={filters.search}
          onChange={(event) => onFilterChange('search', event.target.value)}
          placeholder="Search name, purpose, category, language, or tags"
          className="h-11 rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
        />

        <NativeSelect value={filters.category} onChange={(value) => onFilterChange('category', value)} options={filterOptions.category} />

        <NativeSelect value={filters.language} onChange={(value) => onFilterChange('language', value)} options={filterOptions.language} />

        <NativeSelect value={filters.status} onChange={(value) => onFilterChange('status', value)} options={filterOptions.status} />

        <NativeSelect value={filters.providerStatus} onChange={(value) => onFilterChange('providerStatus', value)} options={filterOptions.providerStatus} />

        <NativeSelect value={filters.healthcare} onChange={(value) => onFilterChange('healthcare', value)} options={filterOptions.healthcare} />

        <NativeSelect value={filters.aiAssisted} onChange={(value) => onFilterChange('aiAssisted', value)} options={filterOptions.aiAssisted} />

        <NativeSelect value={filters.favorites} onChange={(value) => onFilterChange('favorites', value)} options={filterOptions.favorites} />

        <NativeSelect value={filters.sort} onChange={(value) => onFilterChange('sort', value)} options={filterOptions.sort} icon={ArrowUpDown} />
      </div>

      <div className="mt-6 overflow-hidden rounded-[24px] border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950/40">
        {!templates.length ? (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
            <p className="text-lg font-semibold text-slate-950 dark:text-white">No templates yet</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Start from a Healthcare starter, create from scratch, or use AI.</p>
            <Button type="button" onClick={onCreateTemplate} className="mt-4 rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
              Create Template
            </Button>
          </div>
        ) : null}
        {templates.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-slate-50/90 dark:bg-slate-900/80">
                <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                  <th className="px-4 py-3">Template</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Language</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Meta Readiness</th>
                  <th className="px-4 py-3">Last Updated</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {templates.map((template) => {
                  const isSelected = selectedTemplateId === template.id;
                  const sourceMeta = TEMPLATE_SOURCE_META[template.source] || TEMPLATE_SOURCE_META.LOCAL;

                  return (
                    <tr
                      key={template.id}
                      onClick={() => onSelectTemplate(template.id)}
                      className={`cursor-pointer align-top transition-colors ${isSelected ? 'bg-cyan-500/10 dark:bg-cyan-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'}`}
                    >
                      <td className="px-4 py-4">
                        <div className="min-w-[220px]">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-slate-950 dark:text-white">{template.name}</p>
                            <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${sourceMeta.className}`}>
                              {sourceMeta.label}
                            </span>
                            {template.favorite ? (
                              <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:border-amber-900 dark:text-amber-200">
                                <Star className="mr-1 h-3 w-3 fill-current" />
                                Favorite
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 max-w-md text-xs leading-5 text-slate-500 dark:text-slate-400">{template.purpose}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{template.internalCategory || template.category}</td>
                      <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{template.language}</td>
                      <td className="px-4 py-4">
                        <div className="space-y-2">
                          <TemplateStatusBadge status={template.localStatus || template.status} />
                          <TemplateStatusBadge status={template.metaStatus} kind="meta" />
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">{getMetaReadinessLabel(template)}</td>
                      <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{template.updatedAt}</td>
                      <td className="px-4 py-4">
                        <div className="flex max-w-[320px] flex-wrap gap-2">
                          <ActionChip icon={Eye} label="View" onClick={() => onPreviewTemplate?.(template)} />
                          <ActionChip icon={Pencil} label="Edit" onClick={() => onEditTemplate?.(template)} />
                          <ActionChip icon={Copy} label="Duplicate" onClick={() => onDuplicateTemplate?.(template)} />
                          <ActionChip icon={Star} label={template.favorite ? 'Unfavorite' : 'Favorite'} onClick={() => onToggleFavorite?.(template)} />
                          <ActionChip icon={Power} label={template.localStatus === 'DISABLED' ? 'Enable' : 'Disable'} onClick={() => onToggleEnabled?.(template)} />
                          <ActionChip icon={Archive} label="Archive" onClick={() => onArchiveTemplate?.(template)} />
                          <ActionChip icon={ArrowRightCircle} label="Use" onClick={() => onUseTemplate?.(template)} />
                          <ActionChip icon={FolderKanban} label="Flow" onClick={() => onConnectToFlow?.(template)} />
                          <ActionChip icon={Trash2} label="Delete" disabled={template.metaStatus === 'APPROVED'} onClick={() => onDeleteDraft?.(template)} />
                          <ActionChip icon={Send} label="Submit" disabled />
                          <ActionChip icon={Sparkles} label="AI" />
                          <ActionChip icon={MoreHorizontal} label="More" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default TemplateListPanel;