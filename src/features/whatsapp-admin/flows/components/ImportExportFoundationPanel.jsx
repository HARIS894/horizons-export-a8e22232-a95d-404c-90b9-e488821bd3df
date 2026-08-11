import React, { useMemo } from 'react';
import { Download, Mail, ShieldCheck, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { importEntityOptions } from '../../automation/data/importExportSchemas';
import { validateImportRows } from '../../automation/validation/importExportValidation';

const statusTone = {
  Accepted: 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200',
  Warning: 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-900 dark:text-amber-200',
  Rejected: 'border-rose-300 bg-rose-500/10 text-rose-700 dark:border-rose-900 dark:text-rose-200',
};

const ImportExportFoundationPanel = ({
  selectedEntity,
  onEntityChange,
  importPayload,
  exportJobs,
  providerSnapshots,
  schema,
}) => {
  const validation = useMemo(
    () => validateImportRows(schema, importPayload?.rows || [], importPayload?.uploadedColumns || []),
    [importPayload, schema],
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr),420px]">
      <div className="space-y-5">
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">Import / Export Foundation</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Schema-driven admin pipeline</h3>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">Download the official schema, map uploaded columns, validate records, detect duplicates, preview accepted and rejected rows, then route exports through secure expiring download links.</p>
            </div>
            <div className="min-w-[220px]">
              <select value={selectedEntity} onChange={(event) => onEntityChange(event.target.value)} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition-colors focus:border-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100">
                {importEntityOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-4">
            {[
              { label: 'Accepted', value: validation.accepted },
              { label: 'Warnings', value: validation.warnings },
              { label: 'Rejected', value: validation.rejected },
              { label: 'Duplicates', value: validation.duplicates },
            ].map((item) => (
              <div key={item.label} className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[320px,minmax(0,1fr)]">
            <div className="rounded-[24px] border border-slate-200/70 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/30">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Official Column Template</p>
                <Button type="button" variant="outline" className="rounded-full"><Download className="mr-2 h-4 w-4" />Download Template</Button>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{schema?.sampleFileName}</p>
              <div className="mt-4 space-y-2">
                {(schema?.columns || []).map((column) => (
                  <div key={column.key} className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/40">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{column.key}</p>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{column.required ? 'Required' : column.type}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200/70 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-950/30">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Validation Preview</p>
                <Button type="button" variant="outline" className="rounded-full"><Upload className="mr-2 h-4 w-4" />Upload Mock File</Button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {(validation.missingColumns || []).map((column) => (
                  <span key={column} className="rounded-full border border-rose-300 bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-rose-700 dark:border-rose-900 dark:text-rose-200">Missing: {column}</span>
                ))}
                {(validation.unknownColumns || []).map((column) => (
                  <span key={column} className="rounded-full border border-amber-300 bg-amber-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-700 dark:border-amber-900 dark:text-amber-200">Unknown: {column}</span>
                ))}
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead>
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      <th className="px-3 py-2">Row</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Issues</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {validation.rowResults.map((row) => (
                      <tr key={row.id}>
                        <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300">{row.index}</td>
                        <td className="px-3 py-3"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusTone[row.status]}`}>{row.status}</span></td>
                        <td className="px-3 py-3 text-sm text-slate-700 dark:text-slate-300">{[...row.errors, ...row.warnings].join(' | ') || 'No issues'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button type="button" variant="outline" className="rounded-full">Confirm Import</Button>
                <Button type="button" variant="outline" className="rounded-full">Download Rejected Rows</Button>
                <Button type="button" variant="outline" className="rounded-full">Download Error Report</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-700 dark:text-emerald-200">Provider Mapping Contracts</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Google Sheets, Calendar, and Razorpay adapters</h3>
            </div>
            <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            {providerSnapshots.map((snapshot) => (
              <div key={snapshot.id} className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">{snapshot.provider}</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{snapshot.direction}</p>
                <div className="mt-3 space-y-2">
                  {snapshot.selectors.map((item) => (
                    <div key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">{item}</div>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-6 text-slate-600 dark:text-slate-300">{snapshot.duplicateHandling}</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Last sync: {snapshot.lastSync}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-violet-700 dark:text-violet-200">Email Export Workflow</p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Secure delivery states</h3>
            </div>
            <Mail className="h-5 w-5 text-violet-600 dark:text-violet-300" />
          </div>
          <div className="mt-4 space-y-3">
            {exportJobs.map((job) => (
              <div key={job.id} className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{job.entity} • {job.format}</p>
                  <span className="rounded-full border border-slate-300 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600 dark:border-slate-700 dark:text-slate-300">{job.state}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{job.email}</p>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{job.deliveryMode}</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Expires: {job.expiresAt}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-700 dark:text-cyan-200">Import Flow</p>
          <div className="mt-4 space-y-2">
            {['Download Template', 'Fill Excel/CSV', 'Upload', 'Column Mapping', 'Validation', 'Preview', 'Duplicate Detection', 'Confirm Import', 'Import Result'].map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/40">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">{index + 1}</div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportExportFoundationPanel;