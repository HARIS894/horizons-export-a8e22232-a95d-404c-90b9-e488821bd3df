import React, { useEffect, useMemo, useState } from 'react';
import { ChevronRight, FileText, ShieldCheck, UploadCloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { mockStaffOptions } from '../../contacts/data/contactMockData';
import { buildPatientProfileFromDraft, validatePatientDraftStep } from '../validation/patientValidation';
import { createEmptyPatientDraft, PATIENT_DOCUMENT_OPTIONS, PATIENT_GENDER_OPTIONS, PATIENT_ONBOARDING_STATUSES, PATIENT_ONBOARDING_STEPS, PATIENT_SCHEDULE_OPTIONS, PATIENT_SERVICE_OPTIONS } from '../types/patientTypes';

const fieldClassName = 'h-11 rounded-2xl border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950';

const StepField = ({ label, children, error }) => (
  <label className="space-y-2">
    <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</span>
    {children}
    {error ? <p className="text-xs text-rose-600 dark:text-rose-300">{error}</p> : null}
  </label>
);

const PatientOnboardingWizard = ({ open, onOpenChange, contact, initialPatient, onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [draft, setDraft] = useState(createEmptyPatientDraft(contact));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setStepIndex(0);
    setErrors({});
    if (initialPatient) {
      setDraft(initialPatient);
      return;
    }

    setDraft(createEmptyPatientDraft(contact));
  }, [contact, initialPatient, open]);

  const currentStep = PATIENT_ONBOARDING_STEPS[stepIndex];

  const selectedStaff = useMemo(() => {
    return [draft.doctor, draft.assignedNurse].filter(Boolean);
  }, [draft.assignedNurse, draft.doctor]);

  const updateDraft = (key, value) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const nextStep = () => {
    const nextErrors = validatePatientDraftStep(draft, currentStep.key);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }

    setStepIndex((current) => Math.min(current + 1, PATIENT_ONBOARDING_STEPS.length - 1));
  };

  const previousStep = () => setStepIndex((current) => Math.max(current - 1, 0));

  const handleComplete = () => {
    const nextErrors = validatePatientDraftStep(draft, currentStep.key);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      return;
    }

    onComplete(buildPatientProfileFromDraft(draft, contact, selectedStaff));
  };

  const renderStep = () => {
    if (!contact) {
      return null;
    }

    switch (currentStep.key) {
      case 'contact':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <StepField label="Linked Contact" error={errors.contactId}>
              <Input value={contact.fullName} readOnly className={fieldClassName} />
            </StepField>
            <StepField label="Onboarding Status">
              <select value={draft.onboardingStatus} onChange={(event) => updateDraft('onboardingStatus', event.target.value)} className={cn(fieldClassName, 'w-full px-3 text-sm')}>
                {PATIENT_ONBOARDING_STATUSES.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </StepField>
            <StepField label="Contact Phone">
              <Input value={contact.phone} readOnly className={fieldClassName} />
            </StepField>
            <StepField label="Communication Notes">
              <Textarea value={contact.notes || ''} readOnly className="min-h-[110px] rounded-[22px] border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950" />
            </StepField>
          </div>
        );
      case 'details':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <StepField label="Patient Name" error={errors.patientName}>
              <Input value={draft.patientName} onChange={(event) => updateDraft('patientName', event.target.value)} className={fieldClassName} />
            </StepField>
            <StepField label="Phone" error={errors.phone}>
              <Input value={draft.phone} onChange={(event) => updateDraft('phone', event.target.value)} className={fieldClassName} />
            </StepField>
            <StepField label="Date of Birth">
              <Input type="date" value={draft.dob} onChange={(event) => updateDraft('dob', event.target.value)} className={fieldClassName} />
            </StepField>
            <StepField label="Age" error={errors.age}>
              <Input value={draft.age} onChange={(event) => updateDraft('age', event.target.value)} className={fieldClassName} />
            </StepField>
            <StepField label="Gender">
              <select value={draft.gender} onChange={(event) => updateDraft('gender', event.target.value)} className={cn(fieldClassName, 'w-full px-3 text-sm')}>
                {PATIENT_GENDER_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </StepField>
            <StepField label="Address">
              <Input value={draft.address} onChange={(event) => updateDraft('address', event.target.value)} className={fieldClassName} />
            </StepField>
            <StepField label="City">
              <Input value={draft.city} onChange={(event) => updateDraft('city', event.target.value)} className={fieldClassName} />
            </StepField>
            <StepField label="Pincode">
              <Input value={draft.pincode} onChange={(event) => updateDraft('pincode', event.target.value)} className={fieldClassName} />
            </StepField>
          </div>
        );
      case 'healthcare':
        return (
          <div className="space-y-4">
            <StepField label="Medical Notes" error={errors.medicalNotes}>
              <Textarea value={draft.medicalNotes} onChange={(event) => updateDraft('medicalNotes', event.target.value)} className="min-h-[120px] rounded-[22px] border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950" />
            </StepField>
            <StepField label="Care Requirements" error={errors.careRequirements}>
              <Textarea value={draft.careRequirements} onChange={(event) => updateDraft('careRequirements', event.target.value)} className="min-h-[120px] rounded-[22px] border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950" />
            </StepField>
          </div>
        );
      case 'family':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <StepField label="Emergency Contact">
              <Input value={draft.emergencyContact} onChange={(event) => updateDraft('emergencyContact', event.target.value)} className={fieldClassName} />
            </StepField>
            <StepField label="Emergency Phone">
              <Input value={draft.emergencyPhone} onChange={(event) => updateDraft('emergencyPhone', event.target.value)} className={fieldClassName} />
            </StepField>
            <StepField label="Family / NRI Contact" error={errors.familyContact}>
              <Input value={draft.familyContact} onChange={(event) => updateDraft('familyContact', event.target.value)} className={fieldClassName} />
            </StepField>
            <StepField label="Family / NRI Phone" error={errors.familyPhone}>
              <Input value={draft.familyPhone} onChange={(event) => updateDraft('familyPhone', event.target.value)} className={fieldClassName} />
            </StepField>
            <StepField label="Family / NRI Location">
              <Input value={draft.familyLocation} onChange={(event) => updateDraft('familyLocation', event.target.value)} className={fieldClassName} />
            </StepField>
          </div>
        );
      case 'services':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <StepField label="Service Type" error={errors.serviceType}>
              <select value={draft.serviceType} onChange={(event) => updateDraft('serviceType', event.target.value)} className={cn(fieldClassName, 'w-full px-3 text-sm')}>
                {PATIENT_SERVICE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </StepField>
            <StepField label="Preferred Visit Schedule">
              <select value={draft.preferredVisitSchedule} onChange={(event) => updateDraft('preferredVisitSchedule', event.target.value)} className={cn(fieldClassName, 'w-full px-3 text-sm')}>
                {PATIENT_SCHEDULE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </StepField>
          </div>
        );
      case 'staff':
        return (
          <div className="grid gap-4 md:grid-cols-2">
            <StepField label="Assigned Doctor" error={errors.doctor}>
              <select value={draft.doctor} onChange={(event) => updateDraft('doctor', event.target.value)} className={cn(fieldClassName, 'w-full px-3 text-sm')}>
                <option value="">Select doctor</option>
                {mockStaffOptions.map((option) => <option key={option.id} value={option.name}>{option.name}</option>)}
              </select>
            </StepField>
            <StepField label="Assigned Nurse">
              <select value={draft.assignedNurse} onChange={(event) => updateDraft('assignedNurse', event.target.value)} className={cn(fieldClassName, 'w-full px-3 text-sm')}>
                <option value="">Select nurse</option>
                {mockStaffOptions.map((option) => <option key={option.id} value={option.name}>{option.name}</option>)}
              </select>
            </StepField>
          </div>
        );
      case 'documents':
        return (
          <div className="space-y-4">
            <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 px-4 py-5 dark:border-slate-700 dark:bg-slate-900/40">
              <div className="flex items-center gap-3 text-slate-700 dark:text-slate-200">
                <UploadCloud className="h-5 w-5" />
                <div>
                  <p className="text-sm font-semibold">Documents stay local in Phase 2B</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Select placeholders for onboarding readiness. Real storage and uploads will be wired later.</p>
                </div>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {PATIENT_DOCUMENT_OPTIONS.map((document) => {
                const checked = draft.documents.includes(document);
                return (
                  <label key={document} className="flex items-center gap-3 rounded-[20px] border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/35">
                    <Checkbox checked={checked} onCheckedChange={(value) => updateDraft('documents', value ? [...draft.documents, document] : draft.documents.filter((item) => item !== document))} />
                    <span className="text-sm text-slate-700 dark:text-slate-200">{document}</span>
                  </label>
                );
              })}
            </div>
            {errors.documents ? <p className="text-xs text-rose-600 dark:text-rose-300">{errors.documents}</p> : null}
          </div>
        );
      case 'review':
        return (
          <div className="space-y-4">
            <div className="rounded-[24px] border border-emerald-200 bg-emerald-50/80 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/20">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-700 dark:text-emerald-200" />
                <div>
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Review before local activation</p>
                  <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">This creates a local patient profile foundation only. No backend mutation happens in this phase.</p>
                </div>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {[
                ['Patient', draft.patientName],
                ['Status', draft.onboardingStatus],
                ['Service', draft.serviceType],
                ['Doctor', draft.doctor],
                ['Nurse', draft.assignedNurse || 'Unassigned'],
                ['Schedule', draft.preferredVisitSchedule],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[20px] border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/35">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="mt-2 text-sm text-slate-900 dark:text-white">{value || 'Unavailable'}</p>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Patient Onboarding</DialogTitle>
          <DialogDescription>
            Multi-step onboarding foundation for patient activation. This workflow stays entirely local in Phase 2B.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/45">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Progress</p>
            <div className="mt-4 space-y-2">
              {PATIENT_ONBOARDING_STEPS.map((step, index) => (
                <button key={step.key} type="button" className={cn('flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left', index === stepIndex ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-white text-slate-700 dark:bg-slate-950/45 dark:text-slate-200')} onClick={() => setStepIndex(index)}>
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] opacity-75">Step {index + 1}</p>
                    <p className="mt-1 text-sm font-medium">{step.label}</p>
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </button>
              ))}
            </div>
            <div className="mt-4 rounded-[20px] border border-slate-200/80 bg-white/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/35">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Current Status</p>
              </div>
              <Badge variant="outline" className="mt-3 rounded-full border-emerald-300 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-emerald-700 dark:border-emerald-900 dark:text-emerald-200">
                {draft.onboardingStatus}
              </Badge>
            </div>
          </div>

          <div className="space-y-5">
            <div className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950/35">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{currentStep.label}</p>
                  <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{contact?.fullName || 'Contact not selected'}</h3>
                </div>
                <Badge variant="outline" className="rounded-full border-slate-300 bg-transparent px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  Local workflow
                </Badge>
              </div>
            </div>

            {renderStep()}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-between">
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="rounded-full" onClick={previousStep} disabled={stepIndex === 0}>
              Back
            </Button>
            <Button type="button" variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
          {stepIndex === PATIENT_ONBOARDING_STEPS.length - 1 ? (
            <Button type="button" className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={handleComplete}>
              Complete onboarding
            </Button>
          ) : (
            <Button type="button" className="rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" onClick={nextStep}>
              Continue
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PatientOnboardingWizard;
