import React, { useEffect, useMemo, useState } from 'react';
import WhatsAppAdminLayout from '../../layout/WhatsAppAdminLayout';
import TemplateBuilderWizard from '../components/TemplateBuilderWizard';
import TemplateCreationSourcesPanel from '../components/TemplateCreationSourcesPanel';
import TemplateDetailPanel from '../components/TemplateDetailPanel';
import TemplateListPanel from '../components/TemplateListPanel';
import TemplateMetaReadinessPanel from '../components/TemplateMetaReadinessPanel';
import TemplatePreview from '../components/TemplatePreview';
import {
  createEmptyTemplateDraft,
  createDraftFromStarter,
  createDraftFromTemplate,
  duplicateTemplateDraft,
  generateAiDraftOptions,
  mockTemplates,
  starterTemplates,
  templateCategories,
  templateFilters,
  templateHeaderTypes,
  templateLanguages,
  templateMetaCategories,
} from '../data/templateMockData';
import { getDraftLifecycleStatus, validateTemplateDraft } from '../data/templateValidation';
import { META_TEMPLATE_STATUSES, TEMPLATE_SORT_OPTIONS, TEMPLATE_SOURCE_TYPES, TEMPLATE_STATUSES } from '../types/templateTypes';

const sortTemplates = (templates, sortValue) => {
  const items = [...templates];

  if (sortValue === 'name-asc') {
    return items.sort((left, right) => left.name.localeCompare(right.name));
  }

  if (sortValue === 'status') {
    return items.sort((left, right) => String(left.localStatus || left.status).localeCompare(String(right.localStatus || right.status)));
  }

  if (sortValue === 'created-desc') {
    return items.sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
  }

  if (sortValue === 'updated-desc') {
    return items.sort((left, right) => String(right.updatedAt).localeCompare(String(left.updatedAt)));
  }

  return items;
};

const matchesTab = (template, tab) => {
  if (tab === 'All') {
    return true;
  }

  if (tab === 'Drafts') {
    return [TEMPLATE_STATUSES.DRAFT, TEMPLATE_STATUSES.VALIDATING].includes(template.localStatus || template.status);
  }

  if (tab === 'Ready') {
    return (template.localStatus || template.status) === TEMPLATE_STATUSES.READY_TO_SUBMIT;
  }

  if (tab === 'Pending') {
    return [TEMPLATE_STATUSES.SUBMITTED, TEMPLATE_STATUSES.PENDING].includes(template.localStatus || template.status)
      || template.metaStatus === META_TEMPLATE_STATUSES.PENDING;
  }

  if (tab === 'Approved') {
    return template.metaStatus === META_TEMPLATE_STATUSES.APPROVED;
  }

  if (tab === 'Rejected') {
    return template.metaStatus === META_TEMPLATE_STATUSES.REJECTED;
  }

  if (tab === 'Paused') {
    return (template.localStatus || template.status) === TEMPLATE_STATUSES.PAUSED || template.metaStatus === META_TEMPLATE_STATUSES.PAUSED;
  }

  if (tab === 'Archived') {
    return (template.localStatus || template.status) === TEMPLATE_STATUSES.ARCHIVED;
  }

  return true;
};

const matchesStatusFilter = (template, statusFilter) => {
  if (statusFilter === 'All') {
    return true;
  }

  if (statusFilter === 'Ready') {
    return (template.localStatus || template.status) === TEMPLATE_STATUSES.READY_TO_SUBMIT;
  }

  const status = String(template.localStatus || template.status || '').toUpperCase();
  const metaStatus = String(template.metaStatus || '').toUpperCase();
  return status.includes(statusFilter.toUpperCase()) || metaStatus.includes(statusFilter.toUpperCase());
};

const matchesProviderStatusFilter = (template, providerStatusFilter) => {
  if (providerStatusFilter === 'All') {
    return true;
  }

  if (providerStatusFilter === 'Not submitted') {
    return template.metaStatus === META_TEMPLATE_STATUSES.NOT_SUBMITTED;
  }

  if (providerStatusFilter === 'Unknown') {
    return !template.metaStatus || template.metaStatus === META_TEMPLATE_STATUSES.UNKNOWN;
  }

  return String(template.metaStatus || '').toUpperCase() === providerStatusFilter.toUpperCase();
};

const matchesFavoritesFilter = (template, favoritesFilter) => {
  if (favoritesFilter === 'All') {
    return true;
  }

  return favoritesFilter === 'Favorites' ? Boolean(template.favorite) : !template.favorite;
};

const WhatsAppTemplatesFoundationPage = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [templates, setTemplates] = useState(mockTemplates);
  const [filters, setFilters] = useState({
    search: '',
    category: 'All',
    language: 'All',
    status: 'All',
    providerStatus: 'All',
    healthcare: 'All',
    aiAssisted: 'All',
    favorites: 'All',
    updated: 'All Time',
    sort: 'updated-desc',
  });
  const [selectedTemplateId, setSelectedTemplateId] = useState(mockTemplates[0]?.id || '');
  const [draft, setDraft] = useState(createEmptyTemplateDraft);
  const [savedSnapshot, setSavedSnapshot] = useState(() => JSON.stringify(createEmptyTemplateDraft()));
  const [workspaceNotice, setWorkspaceNotice] = useState('Start from a Healthcare starter, create from scratch, or use AI.');
  const [aiPrompt, setAiPrompt] = useState('Create an appointment reminder for a patient scheduled tomorrow.');
  const [aiRefreshKey, setAiRefreshKey] = useState(0);
  const [previewMode, setPreviewMode] = useState('sample');
  const [showAiQuality, setShowAiQuality] = useState(false);
  const assessment = useMemo(() => validateTemplateDraft(draft), [draft]);
  const lifecycleStatus = useMemo(() => getDraftLifecycleStatus(assessment, draft.localStatus), [assessment, draft.localStatus]);
  const approvedTemplates = useMemo(() => templates.filter((template) => template.metaStatus === META_TEMPLATE_STATUSES.APPROVED), [templates]);
  const aiSuggestions = useMemo(() => generateAiDraftOptions(aiPrompt), [aiPrompt, aiRefreshKey]);
  const unsavedChanges = useMemo(() => JSON.stringify(draft) !== savedSnapshot, [draft, savedSnapshot]);

  const filteredTemplates = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();
    const matches = templates.filter((template) => {
      const matchesSearch = !searchTerm || [
        template.name,
        template.purpose,
        template.internalCategory,
        template.language,
        template.body,
        template.healthcareUseCase,
        (template.tags || []).join(' '),
      ].some((value) => String(value || '').toLowerCase().includes(searchTerm));

      const matchesCategory = filters.category === 'All' || template.internalCategory === filters.category;
      const matchesLanguage = filters.language === 'All' || template.language === filters.language;
      const matchesProviderStatus = matchesProviderStatusFilter(template, filters.providerStatus);
      const matchesHealthcare = filters.healthcare === 'All' || (filters.healthcare === 'Healthcare Only' ? template.isHealthcareSafe : !template.isHealthcareSafe);
      const matchesAiAssisted = filters.aiAssisted === 'All' || (filters.aiAssisted === 'AI Assisted' ? template.source === TEMPLATE_SOURCE_TYPES.AI : template.source !== TEMPLATE_SOURCE_TYPES.AI);
      const matchesFavorites = matchesFavoritesFilter(template, filters.favorites);

      return matchesSearch
        && matchesCategory
        && matchesLanguage
        && matchesProviderStatus
        && matchesHealthcare
        && matchesAiAssisted
        && matchesFavorites
        && matchesTab(template, activeTab)
        && matchesStatusFilter(template, filters.status);
    });

    return sortTemplates(matches, filters.sort);
  }, [activeTab, filters, templates]);

  const selectedTemplate = useMemo(
    () => templates.find((item) => item.id === selectedTemplateId) || filteredTemplates[0] || null,
    [filteredTemplates, selectedTemplateId, templates],
  );

  useEffect(() => {
    if (!filteredTemplates.length) {
      return;
    }

    const selectedStillVisible = filteredTemplates.some((template) => template.id === selectedTemplateId);
    if (!selectedTemplateId || !selectedStillVisible) {
      setSelectedTemplateId(filteredTemplates[0].id);
    }
  }, [filteredTemplates, selectedTemplateId]);

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const updateTemplateCollection = (templateId, updater) => {
    setTemplates((current) => current.map((template) => (template.id === templateId ? updater(template) : template)));
  };

  const applyDraft = (nextDraft, notice) => {
    const preparedDraft = {
      ...nextDraft,
      localStatus: getDraftLifecycleStatus(validateTemplateDraft(nextDraft), nextDraft.localStatus),
    };
    setDraft(preparedDraft);
    setSavedSnapshot(JSON.stringify(preparedDraft));
    setShowAiQuality(false);
    setWorkspaceNotice(notice);
  };

  const handleSaveDraft = () => {
    const nextDraft = {
      ...draft,
      localStatus: getDraftLifecycleStatus(assessment, draft.localStatus),
      updatedAt: 'Now',
    };
    setDraft(nextDraft);
    setSavedSnapshot(JSON.stringify(nextDraft));
    setWorkspaceNotice('Draft saved locally inside the isolated Templates module.');
  };

  const handleMarkReady = () => {
    if (!assessment.readyForMetaReview) {
      setShowAiQuality(true);
      setWorkspaceNotice('Resolve blocking issues before marking the template ready for Meta review.');
      return;
    }

    const nextDraft = {
      ...draft,
      localStatus: TEMPLATE_STATUSES.READY_TO_SUBMIT,
      updatedAt: 'Now',
    };
    setDraft(nextDraft);
    setSavedSnapshot(JSON.stringify(nextDraft));
    setWorkspaceNotice('Template marked as ready for Meta review. Actual Meta submission remains disabled in this phase.');
  };

  const handleCreateFromScratch = () => applyDraft(createEmptyTemplateDraft(), 'New local draft started from scratch.');

  const handleUseStarter = (template) => applyDraft(createDraftFromStarter(template), `Loaded starter: ${template.name}.`);

  const handleUseApprovedTemplate = (template) => applyDraft(createDraftFromTemplate(template, {
    id: `approved-seed-${template.id}`,
    localStatus: TEMPLATE_STATUSES.DRAFT,
    metaStatus: META_TEMPLATE_STATUSES.NOT_SUBMITTED,
    metaStatusLabel: 'Not submitted to Meta',
    source: TEMPLATE_SOURCE_TYPES.META_APPROVED,
    approvalHistory: [{ label: 'New draft created from a previously approved template.', time: 'Now', type: 'info' }],
    createdAt: 'Now',
    updatedAt: 'Now',
  }), 'New local draft created from a previously approved template.');

  const handleDuplicateTemplate = (template) => applyDraft(duplicateTemplateDraft(template), 'New draft created from existing template.');

  const handleEditTemplate = (template) => applyDraft(createDraftFromTemplate(template, {
    updatedAt: 'Now',
  }), `Loaded ${template.name} for local editing.`);

  const handlePreviewTemplate = (template) => {
    setSelectedTemplateId(template.id);
    setWorkspaceNotice(`Previewing ${template.name} in the workspace.`);
  };

  const handleToggleFavorite = (template) => {
    updateTemplateCollection(template.id, (current) => ({
      ...current,
      favorite: !current.favorite,
      updatedAt: 'Now',
    }));
    setWorkspaceNotice(`${template.name} ${template.favorite ? 'removed from' : 'added to'} favorites.`);
  };

  const handleToggleEnabled = (template) => {
    const nextStatus = template.localStatus === TEMPLATE_STATUSES.DISABLED ? TEMPLATE_STATUSES.DRAFT : TEMPLATE_STATUSES.DISABLED;
    updateTemplateCollection(template.id, (current) => ({
      ...current,
      localStatus: nextStatus,
      status: nextStatus,
      updatedAt: 'Now',
    }));
    if (selectedTemplateId === template.id) {
      setDraft((current) => ({
        ...current,
        localStatus: nextStatus,
        status: nextStatus,
      }));
    }
    setWorkspaceNotice(`${template.name} ${nextStatus === TEMPLATE_STATUSES.DISABLED ? 'disabled' : 'enabled'} locally.`);
  };

  const handleArchiveTemplate = (template) => {
    updateTemplateCollection(template.id, (current) => ({
      ...current,
      localStatus: TEMPLATE_STATUSES.ARCHIVED,
      status: TEMPLATE_STATUSES.ARCHIVED,
      updatedAt: 'Now',
    }));
    setWorkspaceNotice(`${template.name} archived locally for reuse history.`);
  };

  const handleDeleteTemplate = (template) => {
    setTemplates((current) => current.filter((item) => item.id !== template.id));
    if (selectedTemplateId === template.id) {
      setSelectedTemplateId('');
    }
    setWorkspaceNotice(`${template.name} removed from the local template library view.`);
  };

  const handleUseTemplate = (template) => applyDraft(createDraftFromTemplate(template, {
    id: `draft-use-${template.id}`,
    localStatus: TEMPLATE_STATUSES.DRAFT,
    metaStatus: META_TEMPLATE_STATUSES.NOT_SUBMITTED,
    metaStatusLabel: 'Not submitted to Meta',
    createdAt: 'Now',
    updatedAt: 'Now',
  }), `Loaded ${template.name} as a new working draft.`);

  const handleConnectToFlow = (template) => {
    setSelectedTemplateId(template.id);
    setWorkspaceNotice(`Connect to Flow is a local placeholder for ${template.name}. Real flow linkage remains out of scope in this phase.`);
  };

  const handleUseAiDraft = (option) => applyDraft(option.draft, `AI draft applied: ${option.title}. Human review is still required.`);

  const handleRegenerateAi = () => {
    setAiRefreshKey((current) => current + 1);
    setWorkspaceNotice('AI draft options refreshed for admin review.');
  };

  const handleCloneCurrentDraft = () => applyDraft(createDraftFromTemplate(draft, {
    id: `draft-clone-${Date.now()}`,
    name: draft.name ? `${draft.name} Copy` : 'Untitled Template Copy',
    internalName: draft.internalName ? `${draft.internalName}_copy` : 'untitled_template_copy',
    source: TEMPLATE_SOURCE_TYPES.DUPLICATED,
    createdAt: 'Now',
    updatedAt: 'Now',
  }), 'Current draft cloned locally.');

  const handleResetDraft = () => applyDraft(createEmptyTemplateDraft(), 'Draft reset to a clean local template.');

  const handleDeleteCurrentDraft = () => applyDraft(createEmptyTemplateDraft(), 'Current draft cleared from the builder.');

  const computedDraft = {
    ...draft,
    localStatus: lifecycleStatus,
  };

  return (
    <WhatsAppAdminLayout
      headerSearch={{
        value: filters.search,
        onChange: (value) => updateFilter('search', value),
        placeholder: 'Search templates, categories, languages, or use cases',
      }}
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="rounded-[24px] border border-amber-300 bg-amber-500/10 px-4 py-4 text-sm leading-7 text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200 xl:flex-1">
            {workspaceNotice} Meta submission remains disabled in this phase. Local validation checks readiness only and does not imply approval.
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleUseAiDraft.bind(null, aiSuggestions[0])} className="inline-flex h-11 items-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              AI Create
            </button>
            <button type="button" onClick={handleCreateFromScratch} className="inline-flex h-11 items-center rounded-2xl bg-slate-950 px-4 text-sm font-medium text-white shadow-sm dark:bg-white dark:text-slate-950">
              Create Template
            </button>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            <div>
              <TemplateListPanel
                activeTab={activeTab}
                onTabChange={setActiveTab}
                filters={filters}
                onFilterChange={updateFilter}
                filterOptions={{
                  ...templateFilters,
                  sort: TEMPLATE_SORT_OPTIONS,
                }}
                templates={filteredTemplates}
                selectedTemplateId={selectedTemplate?.id || ''}
                onSelectTemplate={setSelectedTemplateId}
                onCreateTemplate={handleCreateFromScratch}
                onDuplicateTemplate={handleDuplicateTemplate}
                onEditTemplate={handleEditTemplate}
                onPreviewTemplate={handlePreviewTemplate}
                onToggleFavorite={handleToggleFavorite}
                onToggleEnabled={handleToggleEnabled}
                onArchiveTemplate={handleArchiveTemplate}
                onDeleteDraft={handleDeleteTemplate}
                onUseTemplate={handleUseTemplate}
                onConnectToFlow={handleConnectToFlow}
              />
            </div>

            <div className="space-y-6">
              <TemplateCreationSourcesPanel
                starterTemplates={starterTemplates}
                approvedTemplates={approvedTemplates}
                aiPrompt={aiPrompt}
                onAiPromptChange={setAiPrompt}
                aiSuggestions={aiSuggestions}
                onCreateFromScratch={handleCreateFromScratch}
                onUseStarter={handleUseStarter}
                onUseApprovedTemplate={handleUseApprovedTemplate}
                onDuplicateTemplate={handleDuplicateTemplate}
                onUseAiDraft={handleUseAiDraft}
                onRegenerateAi={handleRegenerateAi}
              />

              <TemplateBuilderWizard
                draft={computedDraft}
                setDraft={setDraft}
                headerTypes={templateHeaderTypes}
                categories={templateCategories}
                languages={templateLanguages}
                metaCategories={templateMetaCategories}
                assessment={assessment}
                previewMode={previewMode}
                onPreviewModeChange={setPreviewMode}
                unsavedChanges={unsavedChanges}
                onSaveDraft={handleSaveDraft}
                onMarkReady={handleMarkReady}
                onRunQualityCheck={() => setShowAiQuality(true)}
                onCloneDraft={handleCloneCurrentDraft}
                onResetDraft={handleResetDraft}
                onDeleteDraft={handleDeleteCurrentDraft}
                showAiQuality={showAiQuality}
              />
            </div>
          </div>

          <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
            <TemplatePreview
              draft={computedDraft}
              readinessLabel={assessment.readinessLabel}
              previewMode={previewMode}
              onPreviewModeChange={setPreviewMode}
            />
            <TemplateMetaReadinessPanel
              draft={computedDraft}
              assessment={assessment}
              showAiQuality={showAiQuality}
              onRunQualityCheck={() => setShowAiQuality(true)}
            />
            <TemplateDetailPanel
              template={selectedTemplate}
              onDuplicate={handleDuplicateTemplate}
              onUseTemplate={handleUseTemplate}
              onConnectToFlow={handleConnectToFlow}
              onToggleEnabled={handleToggleEnabled}
              onPreview={handlePreviewTemplate}
            />
          </div>
        </div>
      </div>
    </WhatsAppAdminLayout>
  );
};

export default WhatsAppTemplatesFoundationPage;