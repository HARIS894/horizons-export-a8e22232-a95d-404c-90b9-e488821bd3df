import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { contactExportContract } from '../contracts/contactWorkspaceContracts';

const ExportContactsDialog = ({ open, onOpenChange, filteredCount, patientCount, onConfirmExport }) => {
  const [selectedExports, setSelectedExports] = useState(['Export CSV', 'Export contacts']);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Export Workspace</DialogTitle>
          <DialogDescription>
            Filters-aware export summary for the Contacts workspace. Live Google Sheets export remains intentionally inactive in this phase.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-4">
            {contactExportContract.supportedExports.map((option) => {
              const checked = selectedExports.includes(option);
              const disabled = option === 'Google Sheets Placeholder';
              return (
                <label key={option} className="flex items-center gap-3 rounded-[22px] border border-slate-200/80 bg-white/90 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/35">
                  <Checkbox checked={checked} disabled={disabled} onCheckedChange={(value) => {
                    setSelectedExports((current) => value ? [...current, option] : current.filter((item) => item !== option));
                  }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-950 dark:text-white">{option}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {disabled ? 'Placeholder only. Real Sheets export will be added through Integrations.' : 'Mock export action for this filtered workspace state.'}
                    </p>
                  </div>
                  {disabled ? <Badge variant="outline" className="rounded-full border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-900 dark:text-amber-200">Later</Badge> : null}
                </label>
              );
            })}
          </div>

          <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/45">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Export Summary</p>
            <div className="mt-4 space-y-3">
              <div className="rounded-[20px] border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/35">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Filtered contacts</p>
                <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{filteredCount}</p>
              </div>
              <div className="rounded-[20px] border border-slate-200/80 bg-white/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/35">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Patients in scope</p>
                <p className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{patientCount}</p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => onConfirmExport(selectedExports)}>
            Run mock export
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportContactsDialog;
