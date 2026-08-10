import React, { useEffect, useMemo, useState } from 'react';
import { PanelRightClose, PanelRightOpen, Sparkles, X } from 'lucide-react';
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
import {
  META_TEMPLATE_STATUSES,
  TEMPLATE_COMPONENT_KEYS,
  TEMPLATE_COMPONENT_LIBRARY,
  TEMPLATE_SORT_OPTIONS,
  TEMPLATE_SOURCE_TYPES,
  TEMPLATE_STATUSES,
} from '../types/templateTypes';

const libraryViews = [
  { key: 'all', label: 'All Templates' },
  { key: 'approved', label: 'Approved' },
  { key: 'pending', label: 'Pending Review' },
  { key: 'drafts', label: 'Drafts' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'healthcare', label: 'Healthcare' },
  { key: 'favorites', label: 'Favorites' },
];

const creationSourceLabels = {
  scratch: 'Start from Scratch',
  starter: 'Healthcare Starter',
  clone: 'Clone Existing',
  approved: 'Approved Template',
  ai: 'AI Create',
  edit: 'Edit Existing',
  library: 'Clone from Library',
};

const normalizeComponentOrder = (draft) => {
  const base = Array.isArray(draft.componentOrder) ? draft.componentOrder.filter(Boolean) : [];
  const fallback = [
    (draft.header?.type && draft.header.type !== 'None') || String(draft.header?.content || '').trim() ? TEMPLATE_COMPONENT_KEYS.HEADER : null,
    draft.body !== undefined ? TEMPLATE_COMPONENT_KEYS.BODY : null,
    Array.isArray(draft.variables) && draft.variables.length ? TEMPLATE_COMPONENT_KEYS.VARIABLES : null,
    Array.isArray(draft.buttons) && draft.buttons.length ? TEMPLATE_COMPONENT_KEYS.BUTTONS : null,
    String(draft.footer || '').trim() ? TEMPLATE_COMPONENT_KEYS.FOOTER : null,
  ].filter(Boolean);

  const order = [...new Set((base.length ? base : fallback).filter(Boolean))];
  return order.length ? order : [TEMPLATE_COMPONENT_KEYS.BODY];
};

const createDraftVariable = (index) => ({
  id: `var-${index}`,
  token: `{{${index}}}`,
  name: `Variable ${index}`,
  sampleValue: '',
  description: '',
});

const createDraftButton = (index) => ({
  id: `btn-${index}`,
  type: 'Quick Reply',
  label: '',
  value: '',
});

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

const matchesLibraryView = (template, libraryView) => {
  if (libraryView === 'all') {
    return true;
  }

  if (libraryView === 'approved') {
    return template.metaStatus === META_TEMPLATE_STATUSES.APPROVED;
  }

  if (libraryView === 'pending') {
    return [TEMPLATE_STATUSES.SUBMITTED, TEMPLATE_STATUSES.PENDING].includes(template.localStatus || template.status)
      || template.metaStatus === META_TEMPLATE_STATUSES.PENDING;
  }

  if (libraryView === 'drafts') {
    return [TEMPLATE_STATUSES.DRAFT, TEMPLATE_STATUSES.VALIDATING].includes(template.localStatus || template.status);
  }

  if (libraryView === 'rejected') {
    return template.metaStatus === META_TEMPLATE_STATUSES.REJECTED;
  }

  if (libraryView === 'healthcare') {
    return Boolean(template.isHealthcareSafe);
  }

  if (libraryView === 'favorites') {
    return Boolean(template.favorite);
  }

  return true;
};

const WhatsAppTemplatesFoundationPage = () => {
  const [workspaceMode, setWorkspaceMode] = useState('library');
  const [libraryView, setLibraryView] = useState('all');
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [creationSource, setCreationSource] = useState(null);
  const [sourcePickerView, setSourcePickerView] = useState('scratch');
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
        && matchesLibraryView(template, libraryView)
        && matchesTab(template, activeTab)
        && matchesStatusFilter(template, filters.status);
    });

    return sortTemplates(matches, filters.sort);
  }, [activeTab, filters, libraryView, templates]);

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

  const updateWorkingDraft = (updater, notice) => {
    setDraft((current) => {
      const nextDraft = typeof updater === 'function' ? updater(current) : updater;
      return {
        ...nextDraft,
        componentOrder: normalizeComponentOrder(nextDraft),
      };
    });

    if (notice) {
      setWorkspaceNotice(notice);
    }
  };

  const applyDraft = (nextDraft, notice) => {
    const preparedDraft = {
      ...nextDraft,
      componentOrder: normalizeComponentOrder(nextDraft),
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

  const handleCreateFromScratch = () => {
    setCreationSource('scratch');
    applyDraft(createEmptyTemplateDraft(), 'New local draft started from scratch.');
  };

  const openCreateWorkspace = (preferredSource = 'scratch') => {
    setWorkspaceMode('create');
    setCreationSource(null);
    setSourcePickerView(preferredSource);
    applyDraft(createEmptyTemplateDraft(), `Choose a source to start the ${preferredSource === 'ai' ? 'AI-assisted' : 'template'} workspace.`);
  };

  const handleUseStarter = (template) => {
    setCreationSource('starter');
    setWorkspaceMode('create');
    applyDraft(createDraftFromStarter(template), `Loaded starter: ${template.name}.`);
  };

  const handleUseApprovedTemplate = (template) => {
    setCreationSource('approved');
    setWorkspaceMode('create');
    applyDraft(createDraftFromTemplate(template, {
      id: `approved-seed-${template.id}`,
      localStatus: TEMPLATE_STATUSES.DRAFT,
      metaStatus: META_TEMPLATE_STATUSES.NOT_SUBMITTED,
      metaStatusLabel: 'Not submitted to Meta',
      source: TEMPLATE_SOURCE_TYPES.META_APPROVED,
      approvalHistory: [{ label: 'New draft created from a previously approved template.', time: 'Now', type: 'info' }],
      createdAt: 'Now',
      updatedAt: 'Now',
    }), 'New local draft created from a previously approved template.');
  };

  const handleDuplicateTemplate = (template) => {
    setCreationSource('clone');
    setWorkspaceMode('create');
    applyDraft(duplicateTemplateDraft(template), 'New draft created from existing template.');
  };

  const handleEditTemplate = (template) => {
    setCreationSource('edit');
    setWorkspaceMode('create');
    applyDraft(createDraftFromTemplate(template, {
      updatedAt: 'Now',
    }), `Loaded ${template.name} for local editing.`);
  };

  const handlePreviewTemplate = (template) => {
    setSelectedTemplateId(template.id);
    setIsDetailDrawerOpen(true);
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

  const handleUseTemplate = (template) => {
    setCreationSource('library');
    setWorkspaceMode('create');
    applyDraft(createDraftFromTemplate(template, {
      id: `draft-use-${template.id}`,
      localStatus: TEMPLATE_STATUSES.DRAFT,
      metaStatus: META_TEMPLATE_STATUSES.NOT_SUBMITTED,
      metaStatusLabel: 'Not submitted to Meta',
      createdAt: 'Now',
      updatedAt: 'Now',
    }), `Loaded ${template.name} as a new working draft.`);
  };

  const handleConnectToFlow = (template) => {
    setSelectedTemplateId(template.id);
    setIsDetailDrawerOpen(true);
    setWorkspaceNotice(`Connect to Flow is a local placeholder for ${template.name}. Real flow linkage remains out of scope in this phase.`);
  };

  const handleUseAiDraft = (option) => {
    setCreationSource('ai');
    setWorkspaceMode('create');
    applyDraft(option.draft, `AI draft applied: ${option.title}. Human review is still required.`);
  };

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

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplateId(templateId);
    setIsDetailDrawerOpen(true);
  };

  const exitCreateWorkspace = () => {
    setWorkspaceMode('library');
    setCreationSource(null);
  };

  const handleAddComponent = (componentKey) => {
    if (draft.componentOrder?.includes(componentKey)) {
      return;
    }

    updateWorkingDraft((current) => {
      const nextDraft = {
        ...current,
        componentOrder: [...normalizeComponentOrder(current), componentKey],
      };

      if (componentKey === TEMPLATE_COMPONENT_KEYS.HEADER) {
        nextDraft.header = { type: 'Text', content: current.header?.content || '' };
        nextDraft.headerType = 'Text';
        nextDraft.headerContent = current.header?.content || '';
      }

      if (componentKey === TEMPLATE_COMPONENT_KEYS.VARIABLES && !(current.variables || []).length) {
        nextDraft.variables = [createDraftVariable(1)];
      }

      if (componentKey === TEMPLATE_COMPONENT_KEYS.BUTTONS && !(current.buttons || []).length) {
        nextDraft.buttons = [createDraftButton(1)];
      }

      if (componentKey === TEMPLATE_COMPONENT_KEYS.FOOTER) {
        nextDraft.footer = current.footer || '';
      }

      return nextDraft;
    }, `${TEMPLATE_COMPONENT_LIBRARY.find((item) => item.key === componentKey)?.shortLabel || 'Component'} added to the template canvas.`);
  };

  const handleRemoveComponent = (componentKey) => {
    updateWorkingDraft((current) => {
      const nextDraft = {
        ...current,
        componentOrder: normalizeComponentOrder(current).filter((key) => key !== componentKey),
      };

      if (componentKey === TEMPLATE_COMPONENT_KEYS.HEADER) {
        nextDraft.header = { type: 'None', content: '' };
        nextDraft.headerType = 'None';
        nextDraft.headerContent = '';
      }

      if (componentKey === TEMPLATE_COMPONENT_KEYS.BODY) {
        nextDraft.body = '';
      }

      if (componentKey === TEMPLATE_COMPONENT_KEYS.VARIABLES) {
        nextDraft.variables = [];
      }

      if (componentKey === TEMPLATE_COMPONENT_KEYS.BUTTONS) {
        nextDraft.buttons = [];
      }

      if (componentKey === TEMPLATE_COMPONENT_KEYS.FOOTER) {
        nextDraft.footer = '';
      }

      return nextDraft;
    }, `${TEMPLATE_COMPONENT_LIBRARY.find((item) => item.key === componentKey)?.shortLabel || 'Component'} removed from the template canvas.`);
  };

  const handleMoveComponent = (fromKey, toKey) => {
    updateWorkingDraft((current) => {
      const order = [...normalizeComponentOrder(current)];
      const fromIndex = order.indexOf(fromKey);
      const toIndex = order.indexOf(toKey);

      if (fromIndex === -1 || toIndex === -1) {
        return current;
      }

      const [moved] = order.splice(fromIndex, 1);
      order.splice(toIndex, 0, moved);
      return {
        ...current,
        componentOrder: order,
      };
    }, 'Template canvas order updated.');
  };

  const computedDraft = {
    ...draft,
    componentOrder: normalizeComponentOrder(draft),
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
            <button type="button" onClick={() => openCreateWorkspace('ai')} className="inline-flex h-11 items-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Create
            </button>
            <button type="button" onClick={() => openCreateWorkspace('scratch')} className="inline-flex h-11 items-center rounded-2xl bg-slate-950 px-4 text-sm font-medium text-white shadow-sm dark:bg-white dark:text-slate-950">
              Create Template
            </button>
          </div>
        </div>

        {workspaceMode === 'library' ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              {libraryViews.map((view) => (
                <button
                  key={view.key}
                  type="button"
                  onClick={() => setLibraryView(view.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${libraryView === view.key ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}`}
                >
                  {view.label}
                </button>
              ))}
            </div>

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
                onSelectTemplate={handleSelectTemplate}
                onCreateTemplate={() => openCreateWorkspace('scratch')}
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
          </div>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[260px_minmax(0,1fr)_360px] 2xl:grid-cols-[280px_minmax(0,1fr)_400px]">
            <div className="space-y-6 xl:sticky xl:top-24 xl:self-start">
              <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Template Components</p>
                    <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Palette</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Add supported components and reorder them in the center canvas using native drag and drop.</p>
                  </div>
                  <button type="button" onClick={exitCreateWorkspace} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-300">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-5 space-y-3">
                  {TEMPLATE_COMPONENT_LIBRARY.map((component) => {
                    const isActive = computedDraft.componentOrder.includes(component.key);
                    return (
                      <button
                        key={component.key}
                        type="button"
                        disabled={!creationSource || isActive}
                        onClick={() => handleAddComponent(component.key)}
                        className={`w-full rounded-[22px] border px-4 py-4 text-left transition-colors ${isActive ? 'border-emerald-300 bg-emerald-500/10 text-emerald-800 dark:border-emerald-900 dark:text-emerald-200' : 'border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200 dark:hover:border-slate-700 dark:hover:bg-slate-900'}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-semibold">{component.label}</p>
                          <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">{isActive ? 'Added' : 'Add'}</span>
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{component.description}</p>
                      </button>
                    );
                  })}
                </div>
                <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50/80 p-4 text-xs leading-6 text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
                  {creationSource ? 'Cards can be added from this palette and reordered in the canvas. Removing a card clears that section from the local draft only.' : 'Choose a creation source first. The palette stays available after source selection and does not become the main workspace.'}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  <button type="button" onClick={() => openCreateWorkspace(sourcePickerView)} className="inline-flex h-10 items-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    Change Source
                  </button>
                  <button type="button" onClick={exitCreateWorkspace} className="inline-flex h-10 items-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
                    Back to Library
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {!creationSource ? (
                <TemplateCreationSourcesPanel
                  starterTemplates={starterTemplates}
                  approvedTemplates={approvedTemplates}
                  templates={templates}
                  aiPrompt={aiPrompt}
                  onAiPromptChange={setAiPrompt}
                  aiSuggestions={aiSuggestions}
                  onCreateFromScratch={handleCreateFromScratch}
                  onUseStarter={handleUseStarter}
                  onUseApprovedTemplate={handleUseApprovedTemplate}
                  onUseExistingTemplate={handleDuplicateTemplate}
                  onUseAiDraft={handleUseAiDraft}
                  onRegenerateAi={handleRegenerateAi}
                  preferredSource={sourcePickerView}
                  onPreferredSourceChange={setSourcePickerView}
                />
              ) : (
                <TemplateBuilderWizard
                  draft={computedDraft}
                  setDraft={setDraft}
                  headerTypes={templateHeaderTypes}
                  categories={templateCategories}
                  languages={templateLanguages}
                  metaCategories={templateMetaCategories}
                  assessment={assessment}
                  unsavedChanges={unsavedChanges}
                  onSaveDraft={handleSaveDraft}
                  onMarkReady={handleMarkReady}
                  onRunQualityCheck={() => setShowAiQuality(true)}
                  onCloneDraft={handleCloneCurrentDraft}
                  onResetDraft={handleResetDraft}
                  onDeleteDraft={handleDeleteCurrentDraft}
                  showAiQuality={showAiQuality}
                  componentOrder={computedDraft.componentOrder}
                  onMoveComponent={handleMoveComponent}
                  onRemoveComponent={handleRemoveComponent}
                  activeSourceLabel={creationSourceLabels[creationSource] || 'Template Source'}
                />
              )}
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
                compact
              />
            </div>
          </div>
        )}

        {workspaceMode === 'library' ? (
          <>
            <div className={`fixed inset-y-0 right-0 z-40 w-full max-w-[440px] transform border-l border-slate-200 bg-white/95 shadow-[-24px_0_80px_rgba(15,23,42,0.14)] backdrop-blur transition-transform dark:border-slate-800 dark:bg-slate-950/95 ${isDetailDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Template Details</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Inspect the selected template without leaving the library.</p>
                </div>
                <button type="button" onClick={() => setIsDetailDrawerOpen(false)} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-300">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="h-[calc(100vh-81px)] overflow-y-auto px-5 py-5">
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

            <button
              type="button"
              onClick={() => setIsDetailDrawerOpen((current) => !current)}
              className="fixed bottom-6 right-6 z-30 inline-flex h-12 items-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-medium text-white shadow-lg dark:bg-white dark:text-slate-950"
            >
              {isDetailDrawerOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
              {isDetailDrawerOpen ? 'Hide Details' : 'Show Details'}
            </button>
          </>
        ) : null}
      </div>
    </WhatsAppAdminLayout>
  );
};

export default WhatsAppTemplatesFoundationPage;