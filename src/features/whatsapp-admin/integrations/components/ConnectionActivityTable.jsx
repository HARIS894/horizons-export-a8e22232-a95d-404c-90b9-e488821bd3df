import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ACTIVITY_STATUS_META } from '../types/integrationTypes';

const ConnectionActivityTable = ({ entries, onViewEntry }) => (
  <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50/90 dark:bg-slate-900/70">
          <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            <th className="px-4 py-3">Timestamp</th>
            <th className="px-4 py-3">Provider</th>
            <th className="px-4 py-3">Action</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Duration</th>
            <th className="px-4 py-3">Error</th>
            <th className="px-4 py-3">Request/Event ID</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {entries.map((entry) => {
            const statusClassName = ACTIVITY_STATUS_META[entry.status] || ACTIVITY_STATUS_META.INFO;

            return (
              <tr key={entry.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/45">
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{entry.timestamp}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-950 dark:text-white">{entry.provider}</td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{entry.action}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${statusClassName}`}>
                    {entry.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{entry.duration}</td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{entry.error}</td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{entry.requestId}</td>
                <td className="px-4 py-3 text-right">
                  <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => onViewEntry(entry)}>
                    View
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default ConnectionActivityTable;