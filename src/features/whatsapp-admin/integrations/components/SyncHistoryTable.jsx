import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SYNC_STATUS_META } from '../types/integrationTypes';

const SyncHistoryTable = ({ jobs, onOpenDetails }) => (
  <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
    <Table>
      <TableHeader>
        <TableRow className="bg-slate-50/90 dark:bg-slate-900/70">
          <TableHead>Integration</TableHead>
          <TableHead>Entity</TableHead>
          <TableHead>Direction</TableHead>
          <TableHead>Started</TableHead>
          <TableHead>Completed</TableHead>
          <TableHead>Records</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Error Count</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {jobs.map((job) => {
          const statusClassName = SYNC_STATUS_META[job.status] || SYNC_STATUS_META['Needs Attention'];
          return (
            <TableRow key={job.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/45">
              <TableCell>{job.integration}</TableCell>
              <TableCell>{job.entity}</TableCell>
              <TableCell>{job.direction}</TableCell>
              <TableCell>{job.startedAt}</TableCell>
              <TableCell>{job.completedAt}</TableCell>
              <TableCell>{job.records}</TableCell>
              <TableCell>
                <Badge variant="outline" className={`rounded-full px-2 py-0 text-[10px] uppercase tracking-[0.14em] ${statusClassName}`}>
                  {job.status}
                </Badge>
              </TableCell>
              <TableCell>{job.errorCount}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => onOpenDetails(job)}>
                    View Details
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => onOpenDetails(job)}>
                    Retry
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  </div>
);

export default SyncHistoryTable;
