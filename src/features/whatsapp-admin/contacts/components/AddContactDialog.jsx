import React, { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createEmptyContactDraft, COMMUNICATION_OPTIONS, CONTACT_TYPE_OPTIONS, RELATIONSHIP_OPTIONS } from '../types/contactTypes';

const fieldClassName = 'h-11 rounded-2xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950';

const StepField = ({ label, children, error }) => (
  <label className="space-y-2">
    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</span>
    {children}
    {error ? <p className="text-xs text-rose-600 dark:text-rose-300">{error}</p> : null}
  </label>
);

const AddContactDialog = ({ open, onOpenChange, onSave, validateDraft }) => {
  const [draft, setDraft] = useState(createEmptyContactDraft());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) {
      setDraft(createEmptyContactDraft());
      setErrors({});
    }
  }, [open]);

  const updateDraft = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = () => {
    const nextErrors = validateDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }

    onSave(draft);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Add Contact</DialogTitle>
          <DialogDescription>
            Local contact capture form for the WhatsApp Admin Platform. Validation is explicit and no backend submission occurs in this phase.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 md:grid-cols-2">
          <StepField label="Full Name" error={errors.fullName}>
            <Input value={draft.fullName} onChange={(event) => updateDraft('fullName', event.target.value)} className={fieldClassName} />
          </StepField>
          <StepField label="Relationship">
            <select value={draft.relationship} onChange={(event) => updateDraft('relationship', event.target.value)} className={`${fieldClassName} w-full px-3 text-sm`}>
              {RELATIONSHIP_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </StepField>

          <StepField label="Country Code" error={errors.countryCode}>
            <Input value={draft.countryCode} onChange={(event) => updateDraft('countryCode', event.target.value)} className={fieldClassName} />
          </StepField>
          <StepField label="Phone" error={errors.phone}>
            <Input value={draft.phone} onChange={(event) => updateDraft('phone', event.target.value)} className={fieldClassName} />
          </StepField>

          <StepField label="WhatsApp Number" error={errors.whatsappNumber}>
            <Input value={draft.whatsappNumber} onChange={(event) => updateDraft('whatsappNumber', event.target.value)} className={fieldClassName} />
          </StepField>
          <StepField label="Email" error={errors.email}>
            <Input value={draft.email} onChange={(event) => updateDraft('email', event.target.value)} className={fieldClassName} />
          </StepField>

          <StepField label="Contact Type">
            <select value={draft.contactType} onChange={(event) => updateDraft('contactType', event.target.value)} className={`${fieldClassName} w-full px-3 text-sm`}>
              {CONTACT_TYPE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </StepField>
          <StepField label="Preferred Communication">
            <select value={draft.preferredCommunication} onChange={(event) => updateDraft('preferredCommunication', event.target.value)} className={`${fieldClassName} w-full px-3 text-sm`}>
              {COMMUNICATION_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </StepField>

          <StepField label="City">
            <Input value={draft.city} onChange={(event) => updateDraft('city', event.target.value)} className={fieldClassName} />
          </StepField>
          <StepField label="Pincode" error={errors.pincode}>
            <Input value={draft.pincode} onChange={(event) => updateDraft('pincode', event.target.value)} className={fieldClassName} />
          </StepField>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <StepField label="Notes">
            <Textarea value={draft.notes} onChange={(event) => updateDraft('notes', event.target.value)} className="min-h-[120px] rounded-[22px] border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950" />
          </StepField>

          <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/45">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Contact Flags</p>
            <label className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/35">
              <Checkbox checked={draft.isNriFamily} onCheckedChange={(value) => updateDraft('isNriFamily', Boolean(value))} />
              <span className="text-sm text-slate-700 dark:text-slate-200">NRI / Family indicator</span>
            </label>
            <label className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/35">
              <Checkbox checked={draft.convertToPatient} onCheckedChange={(value) => updateDraft('convertToPatient', Boolean(value))} />
              <span className="text-sm text-slate-700 dark:text-slate-200">Launch patient conversion after save</span>
            </label>
            {errors.duplicate ? (
              <div className="mt-3 rounded-2xl border border-amber-300 bg-amber-500/10 px-3 py-3 text-xs leading-5 text-amber-700 dark:border-amber-900 dark:text-amber-200">
                {errors.duplicate}
              </div>
            ) : null}
            <Badge variant="outline" className="mt-4 rounded-full border-slate-300 bg-transparent px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-600 dark:border-slate-700 dark:text-slate-300">
              Local only
            </Badge>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={handleSubmit}>
            Save contact
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddContactDialog;
