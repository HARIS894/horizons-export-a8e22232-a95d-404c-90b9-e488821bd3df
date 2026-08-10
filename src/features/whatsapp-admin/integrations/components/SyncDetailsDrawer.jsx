import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { SYNC_STATUS_META } from '../types/integrationTypes';

const InfoRow = ({ label, value }) => (
  <div className="grid grid-cols-[150px_minmax(0,1fr)] gap-3 border-b border-slate-200/70 py-3 last:border-b-0 dark:border-slate-800/80">
    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    <p className="text-sm text-slate-900 dark:text-white">{value}</p>
  </div>
);

const SyncDetailsDrawer = ({ open, onOpenChange, job }) => {
  if (!job) {
    return null;
  }

  const statusClassName = SYNC_STATUS_META[job.status] || SYNC_STATUS_META['Needs Attention'];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto border-l border-slate-200 bg-slate-100/95 px-0 dark:border-slate-800 dark:bg-slate-950/95 sm:max-w-[720px]">
        <div className="px-6 pb-6 pt-5">
          <SheetHeader className="text-left">
            <div className="flex flex-wrap items-center gap-3">
              <SheetTitle className="text-2xl font-semibold text-slate-950 dark:text-white">{job.integration} Sync Details</SheetTitle>
              <Badge variant="outline" className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${statusClassName}`}>
                {job.status}
              </Badge>
            </div>
            <SheetDescription>
              Operation audit snapshot for the Integration Control Center. Retry remains a UI placeholder in this phase.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 rounded-[24px] border border-slate-200/80 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-950/35">
            <InfoRow label="Operation" value={job.operation} />
            <InfoRow label="Integration" value={job.integration} />
            <InfoRow label="Entity" value={job.entity} />
            <InfoRow label="Direction" value={job.direction} />
            <InfoRow label="Started" value={job.startedAt} />
            <InfoRow label="Completed" value={job.completedAt} />
            <InfoRow label="Records Processed" value={String(job.records)} />
            <InfoRow label="Successful Records" value={String(job.successfulRecords)} />
            <InfoRow label="Failed Records" value={String(job.failedRecords)} />
            <InfoRow label="Error Count" value={String(job.errorCount)} />
            <InfoRow label="Error Summary" value={job.errorSummary} />
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="button" variant="outline" className="rounded-full">
              Retry Placeholder
            </Button>
            <Button type="button" variant="outline" className="rounded-full">
              Export Log Placeholder
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SyncDetailsDrawer;
