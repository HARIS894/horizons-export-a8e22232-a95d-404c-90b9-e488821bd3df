import React, { useMemo, useState } from 'react';
import { FileSpreadsheet, UploadCloud } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { contactImportContract } from '../contracts/contactWorkspaceContracts';
import { mockImportColumns, mockImportRows } from '../data/contactMockData';
import { mapImportPreviewSummary } from '../validation/contactValidation';

const targetFields = ['fullName', 'phone', 'whatsappNumber', 'email', 'city', 'pincode', 'relationship', 'notes'];

const defaultMapping = {
  Name: 'fullName',
  Phone: 'phone',
  WhatsApp: 'whatsappNumber',
  Email: 'email',
  City: 'city',
  Pincode: 'pincode',
  Relationship: 'relationship',
  Notes: 'notes',
};

const ImportContactsDialog = ({ open, onOpenChange, onConfirmImport }) => {
  const [source, setSource] = useState('Google Sheets');
  const [mapping, setMapping] = useState(defaultMapping);
  const summary = useMemo(() => mapImportPreviewSummary(mockImportRows), []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Import Contacts</DialogTitle>
          <DialogDescription>
            Production-style import flow with local preview only. Live Google Sheets connectivity will be added later via the Integrations module.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/45">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Import Source</p>
              <div className="mt-4 space-y-2">
                {contactImportContract.acceptedSources.map((option) => (
                  <button key={option} type="button" onClick={() => setSource(option)} className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left ${source === option ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-white text-slate-700 dark:bg-slate-950/35 dark:text-slate-200'}`}>
                    {option.includes('Google') ? <FileSpreadsheet className="h-4 w-4" /> : <UploadCloud className="h-4 w-4" />}
                    <span className="text-sm font-medium">{option}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
              <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Live sync is intentionally inactive</p>
              <p className="mt-2 text-xs leading-6 text-amber-800 dark:text-amber-200">Use this local preview to define column mapping, validation behavior, and duplicate rules before a real Sheets adapter is added.</p>
            </div>
          </div>

          <div className="space-y-5">
            <div className="grid gap-3 md:grid-cols-4">
              {[
                ['Rows detected', summary.total],
                ['Accepted', summary.accepted],
                ['Rejected', summary.rejected],
                ['Duplicates', summary.duplicates],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[22px] border border-slate-200/80 bg-white/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/35">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950/35">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">Column Mapping</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Map import columns into the stable local contact contract.</p>
                </div>
                <Badge variant="outline" className="rounded-full border-sky-300 bg-sky-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-sky-700 dark:border-sky-900 dark:text-sky-200">
                  {source}
                </Badge>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {mockImportColumns.map((column) => (
                  <label key={column} className="rounded-[20px] border border-slate-200/80 bg-slate-50/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/40">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{column}</span>
                    <select value={mapping[column]} onChange={(event) => setMapping((current) => ({ ...current, [column]: event.target.value }))} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                      {targetFields.map((field) => <option key={field} value={field}>{field}</option>)}
                    </select>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-white/70 bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:border-white/10 dark:bg-slate-950/35">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Spreadsheet Preview</p>
              <div className="mt-4 overflow-hidden rounded-[20px] border border-slate-200 dark:border-slate-800">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {mockImportColumns.map((column) => <TableHead key={column}>{column}</TableHead>)}
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockImportRows.map((row) => (
                      <TableRow key={row.id}>
                        {mockImportColumns.map((column) => <TableCell key={`${row.id}-${column}`}>{row.values[column]}</TableCell>)}
                        <TableCell>
                          <Badge variant="outline" className={row.accepted ? 'rounded-full border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200' : 'rounded-full border-rose-300 bg-rose-500/10 text-rose-700 dark:border-rose-900 dark:text-rose-200'}>
                            {row.accepted ? 'Accepted' : row.duplicate ? 'Duplicate' : 'Rejected'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <p className="text-sm text-slate-500 dark:text-slate-400">Import confirmation remains local. No provider sync or file persistence occurs yet.</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="rounded-full" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" className="rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" onClick={() => onConfirmImport(summary)}>
              Confirm import
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportContactsDialog;
