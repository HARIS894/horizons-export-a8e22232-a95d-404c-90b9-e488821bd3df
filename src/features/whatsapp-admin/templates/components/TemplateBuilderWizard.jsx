import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, GripVertical, Plus, Sparkles, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import TemplateStatusBadge from './TemplateStatusBadge';
import { TEMPLATE_BUTTON_TYPES } from '../types/templateTypes';

const blockMeta = {
  header: {
    title: 'Header / Media',
    description: 'Choose whether this Meta header slot uses text, image, video, or document content.',
  },
  body: {
    title: 'Body',
    description: 'Write the core WhatsApp template body and keep variable tokens sequential.',
  },
  variables: {
    title: 'Variables',
    description: 'Map sample values for every placeholder token used in the body.',
  },
  buttons: {
    title: 'Buttons',
    description: 'Add up to 3 CTA buttons while keeping values Meta-compatible.',
  },
  footer: {
    title: 'Footer',
    description: 'Optional footer text shown beneath the message body.',
  },
};

const FieldMessage = ({ message }) => {
  if (!message) {
    return null;
  }

  return <p className="mt-1 text-xs text-rose-600 dark:text-rose-300">{message}</p>;
};

const NativeSelect = ({ value, onChange, options }) => (
  <select
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className="mt-2 h-11 w-full appearance-none rounded-2xl border border-slate-200 bg-white px-4 pr-10 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
  >
    {options.map((option) => (
      <option key={option} value={option}>
        {option}
      </option>
    ))}
  </select>
);

const TemplateBuilderWizard = ({
  draft,
  setDraft,
  headerTypes,
  categories,
  languages,
  metaCategories,
  assessment,
  unsavedChanges,
  onSaveDraft,
  onMarkReady,
  onRunQualityCheck,
  onCloneDraft,
  onResetDraft,
  onDeleteDraft,
  showAiQuality,
  componentOrder,
  onMoveComponent,
  onRemoveComponent,
  activeSourceLabel,
}) => {
  const [draggingKey, setDraggingKey] = useState(null);
  const errors = assessment.fieldErrors;
  const lifecycleStatus = draft.localStatus || assessment.lifecycleStatus;
  const header = draft.header || { type: draft.headerType || 'None', content: draft.headerContent || '' };

  const updateField = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const updateHeaderField = (key, value) => {
    setDraft((current) => ({
      ...current,
      header: {
        ...(current.header || { type: current.headerType || 'None', content: current.headerContent || '' }),
        [key]: value,
      },
      ...(key === 'type' ? { headerType: value } : { headerContent: value }),
    }));
  };

  const updateTags = (value) => {
    setDraft((current) => ({
      ...current,
      tags: value.split(',').map((item) => item.trim()).filter(Boolean),
    }));
  };

  const updateButton = (buttonId, key, value) => {
    setDraft((current) => ({
      ...current,
      buttons: (current.buttons || []).map((button) => (button.id === buttonId ? { ...button, [key]: value } : button)),
    }));
  };

  const addButton = () => {
    setDraft((current) => ({
      ...current,
      buttons: [...(current.buttons || []), { id: `btn-${(current.buttons || []).length + 1}`, type: TEMPLATE_BUTTON_TYPES[0], label: '', value: '' }],
    }));
  };

  const removeButton = (buttonId) => {
    setDraft((current) => ({
      ...current,
      buttons: (current.buttons || []).filter((button) => button.id !== buttonId),
    }));
  };

  const updateVariable = (variableId, key, value) => {
    setDraft((current) => ({
      ...current,
      variables: (current.variables || []).map((variable) => (variable.id === variableId ? { ...variable, [key]: value } : variable)),
    }));
  };

  const addVariable = () => {
    setDraft((current) => {
      const nextIndex = (current.variables || []).length + 1;
      const nextToken = `{{${nextIndex}}}`;

      return {
        ...current,
        body: current.body && current.body.includes(nextToken) ? current.body : `${current.body || ''}${current.body ? ' ' : ''}${nextToken}`,
        variables: [
          ...(current.variables || []),
          {
            id: `var-${nextIndex}`,
            token: nextToken,
            name: `Variable ${nextIndex}`,
            sampleValue: '',
            description: '',
          },
        ],
      };
    });
  };

  const removeVariable = (variableId) => {
    setDraft((current) => ({
      ...current,
      variables: (current.variables || []).filter((variable) => variable.id !== variableId),
    }));
  };

  const handleDrop = (targetKey) => {
    if (draggingKey && draggingKey !== targetKey) {
      onMoveComponent?.(draggingKey, targetKey);
    }
    setDraggingKey(null);
  };

  const renderComponentEditor = (key) => {
    if (key === 'header') {
      return (
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-950 dark:text-white">Header type</label>
            <NativeSelect value={header.type} onChange={(value) => updateHeaderField('type', value)} options={headerTypes} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-950 dark:text-white">Header content</label>
            <Input value={header.content} onChange={(event) => updateHeaderField('content', event.target.value)} placeholder={header.type === 'Text' ? 'Header text' : 'Media URL or reference'} className="mt-2 h-11 rounded-2xl" />
            <FieldMessage message={errors.headerContent} />
          </div>
        </div>
      );
    }

    if (key === 'body') {
      return (
        <div>
          <div className="flex items-center justify-between gap-3">
            <label className="text-sm font-medium text-slate-950 dark:text-white">Message body</label>
            <span className="text-xs text-slate-500 dark:text-slate-400">{(draft.body || '').length} characters</span>
          </div>
          <Textarea value={draft.body} onChange={(event) => updateField('body', event.target.value)} placeholder="Hello {{1}}, your scheduled service is confirmed for {{2}}." className="mt-2 min-h-[220px] rounded-2xl" />
          <FieldMessage message={errors.body} />
        </div>
      );
    }

    if (key === 'variables') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Variable mapping</p>
            <Button type="button" variant="outline" className="rounded-full" onClick={addVariable}>
              <Plus className="mr-2 h-4 w-4" />
              Add Variable
            </Button>
          </div>
          {(draft.variables || []).length ? (
            <div className="space-y-4">
              {(draft.variables || []).map((variable) => (
                <div key={variable.id} className="rounded-2xl border border-slate-200/70 bg-white p-4 dark:border-slate-800 dark:bg-slate-950/40">
                  <div className="grid gap-4 lg:grid-cols-[130px_1fr_1fr_auto]">
                    <div>
                      <label className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Token</label>
                      <Input value={variable.token} readOnly className="mt-2 h-11 rounded-2xl" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Variable Name</label>
                      <Input value={variable.name} onChange={(event) => updateVariable(variable.id, 'name', event.target.value)} className="mt-2 h-11 rounded-2xl" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Sample Value</label>
                      <Input value={variable.sampleValue} onChange={(event) => updateVariable(variable.id, 'sampleValue', event.target.value)} className="mt-2 h-11 rounded-2xl" />
                    </div>
                    <div className="flex items-end">
                      <Button type="button" variant="outline" className="h-11 rounded-full" onClick={() => removeVariable(variable.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3">
                    <label className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Description</label>
                    <Input value={variable.description} onChange={(event) => updateVariable(variable.id, 'description', event.target.value)} className="mt-2 h-11 rounded-2xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50/70 px-5 py-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
              No variables added yet. Add placeholders once the body contains sequential tokens like {'{{1}}'}, {'{{2}}'}, and {'{{3}}'}.
            </div>
          )}
          <FieldMessage message={errors.variables} />
        </div>
      );
    }

    if (key === 'buttons') {
      return (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Buttons</p>
            <Button type="button" variant="outline" className="rounded-full" onClick={addButton}>
              <Plus className="mr-2 h-4 w-4" />
              Add Button
            </Button>
          </div>
          {(draft.buttons || []).length ? (
            (draft.buttons || []).map((button) => (
              <div key={button.id} className="rounded-[24px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="grid gap-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
                  <div>
                    <label className="text-sm font-medium text-slate-950 dark:text-white">Button type</label>
                    <NativeSelect value={button.type} onChange={(value) => updateButton(button.id, 'type', value)} options={TEMPLATE_BUTTON_TYPES} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-950 dark:text-white">Label</label>
                    <Input value={button.label} onChange={(event) => updateButton(button.id, 'label', event.target.value)} placeholder="Button label" className="mt-2 h-11 rounded-2xl" />
                    <FieldMessage message={errors[`button-${button.id}-label`]} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-950 dark:text-white">Destination / value</label>
                    <Input value={button.value} onChange={(event) => updateButton(button.id, 'value', event.target.value)} placeholder="URL, phone number, or CTA value" className="mt-2 h-11 rounded-2xl" />
                    <FieldMessage message={errors[`button-${button.id}-value`]} />
                  </div>
                  <div className="flex items-end">
                    <Button type="button" variant="outline" className="h-11 rounded-full" onClick={() => removeButton(button.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50/70 px-5 py-6 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
              No buttons configured yet. Add up to 3 CTAs only when the template purpose genuinely needs them.
            </div>
          )}
        </div>
      );
    }

    if (key === 'footer') {
      return (
        <div>
          <label className="text-sm font-medium text-slate-950 dark:text-white">Footer</label>
          <Input value={draft.footer} onChange={(event) => updateField('footer', event.target.value)} placeholder="Footer text is optional" className="mt-2 h-11 rounded-2xl" />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Keep footer operational and avoid claims, guarantees, or clinical promises.</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6 rounded-[28px] border border-white/70 bg-white/85 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-700 dark:text-emerald-200">Create Template</p>
          <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Template canvas editor</h3>
          <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">
            The canvas keeps the underlying draft structured while letting admins add, remove, and reorder supported template sections with native browser drag interactions.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-full border-slate-300 px-3 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-600 dark:border-slate-700 dark:text-slate-300">{activeSourceLabel}</Badge>
          <TemplateStatusBadge status={lifecycleStatus} />
        </div>
      </div>

      <div className="sticky top-20 z-10 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-slate-200/70 bg-white/90 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${unsavedChanges ? 'bg-amber-500/10 text-amber-700 dark:text-amber-200' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-200'}`}>
            {unsavedChanges ? 'Unsaved changes' : 'Saved locally'}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Preview only. Meta approval is not implied anywhere in this builder.</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="rounded-full" onClick={onSaveDraft}>Save Draft</Button>
          <Button type="button" variant="outline" className="rounded-full" onClick={onCloneDraft}>Clone</Button>
          <Button type="button" variant="outline" className="rounded-full" onClick={onResetDraft}>Reset Draft</Button>
          <Button type="button" className="rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" onClick={onMarkReady}>
            Prepare for Meta Submission
          </Button>
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-200/70 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-slate-950 dark:text-white">Template name</label>
            <Input value={draft.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Appointment Reminder India" className="mt-2 h-11 rounded-2xl" />
            <FieldMessage message={errors.name} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-950 dark:text-white">Internal name</label>
            <Input value={draft.internalName} onChange={(event) => updateField('internalName', event.target.value)} placeholder="appointment_reminder_india" className="mt-2 h-11 rounded-2xl" />
            <FieldMessage message={errors.internalName} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-950 dark:text-white">Language</label>
            <NativeSelect value={draft.language} onChange={(value) => updateField('language', value)} options={languages} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-950 dark:text-white">Meta category</label>
            <NativeSelect value={draft.metaCategory} onChange={(value) => updateField('metaCategory', value)} options={metaCategories} />
            <FieldMessage message={errors.metaCategory} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-950 dark:text-white">Internal category</label>
            <NativeSelect value={draft.internalCategory} onChange={(value) => updateField('internalCategory', value)} options={categories} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-950 dark:text-white">Healthcare use case</label>
            <Input value={draft.healthcareUseCase} onChange={(event) => updateField('healthcareUseCase', event.target.value)} placeholder="Appointment reminder" className="mt-2 h-11 rounded-2xl" />
          </div>
          <div className="xl:col-span-3">
            <label className="text-sm font-medium text-slate-950 dark:text-white">Purpose</label>
            <Textarea value={draft.purpose} onChange={(event) => updateField('purpose', event.target.value)} placeholder="Describe what this template is intended to communicate." className="mt-2 min-h-[100px] rounded-2xl" />
          </div>
          <div className="xl:col-span-3">
            <label className="text-sm font-medium text-slate-950 dark:text-white">Internal tags</label>
            <Input value={(draft.tags || []).join(', ')} onChange={(event) => updateTags(event.target.value)} placeholder="appointments, reminder, family" className="mt-2 h-11 rounded-2xl" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Template canvas</p>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Drag cards to reorder the visible template structure. Removing a card clears that part of the current local draft.</p>
          </div>
          <Button type="button" variant="outline" className="rounded-full" onClick={onRunQualityCheck}>
            <Sparkles className="mr-2 h-4 w-4" />
            Run AI Quality Check
          </Button>
        </div>

        {componentOrder.length ? componentOrder.map((key) => (
          <section
            key={key}
            draggable
            onDragStart={() => setDraggingKey(key)}
            onDragEnd={() => setDraggingKey(null)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(key)}
            className={`rounded-[24px] border p-5 transition-colors ${draggingKey === key ? 'border-emerald-400 bg-emerald-50/70 dark:border-emerald-700 dark:bg-emerald-950/20' : 'border-slate-200/70 bg-white/80 dark:border-slate-800 dark:bg-slate-950/35'}`}
          >
            <div className="mb-4 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <button type="button" className="mt-0.5 inline-flex h-10 w-10 cursor-grab items-center justify-center rounded-2xl border border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <GripVertical className="h-4 w-4" />
                </button>
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{blockMeta[key]?.title}</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{blockMeta[key]?.description}</p>
                </div>
              </div>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => onRemoveComponent?.(key)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Remove
              </Button>
            </div>
            {renderComponentEditor(key)}
          </section>
        )) : (
          <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
            <p className="text-lg font-semibold text-slate-950 dark:text-white">No active template components</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Use the left palette to add body, variables, buttons, or a header/media slot back into the canvas.</p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-start gap-3 rounded-[24px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
        {assessment.blockingIssues.length ? <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-600 dark:text-amber-300" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600 dark:text-emerald-300" />}
        <div>
          <p className="text-sm font-semibold text-slate-950 dark:text-white">Validation feedback</p>
          {assessment.blockingIssues.length ? (
            <ul className="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
              {assessment.blockingIssues.map((message) => <li key={message}>{message}</li>)}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Client-side validation passes. This draft appears ready for a later provider-backed submission phase.</p>
          )}
        </div>
      </div>

      {showAiQuality ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Object.entries(assessment.qualityChecks).map(([key, value]) => (
            <div key={key} className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{key.replace(/([A-Z])/g, ' $1')}</p>
              <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{value}</p>
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="rounded-full" onClick={onSaveDraft}>Save Draft</Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={onCloneDraft}>Clone</Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={onResetDraft}>Reset Draft</Button>
        <Button type="button" variant="outline" className="rounded-full" onClick={onDeleteDraft}>Delete Draft</Button>
      </div>
    </div>
  );
};

export default TemplateBuilderWizard;