import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WEBHOOK_STATUS_META } from '../types/integrationTypes';

const WebhookRegistryTable = ({ hooks, onAction }) => (
  <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
        <thead className="bg-slate-50/90 dark:bg-slate-900/70">
          <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            <th className="px-4 py-3">Provider</th>
            <th className="px-4 py-3">Endpoint</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Last Received</th>
            <th className="px-4 py-3">Last Successful</th>
            <th className="px-4 py-3">Last Failed</th>
            <th className="px-4 py-3">Failure Count</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
          {hooks.map((hook) => {
            const statusClassName = WEBHOOK_STATUS_META[hook.status] || WEBHOOK_STATUS_META.UNKNOWN;

            return (
              <tr key={hook.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/45">
                <td className="px-4 py-3 text-sm font-medium text-slate-950 dark:text-white">{hook.provider}</td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{hook.endpoint}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline" className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${statusClassName}`}>
                    {hook.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{hook.lastReceived}</td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{hook.lastSuccessful}</td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{hook.lastFailed}</td>
                <td className="px-4 py-3 text-sm text-slate-700 dark:text-slate-300">{hook.failureCount}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    {['View', 'Test', 'Disable', 'Enable', 'Rotate secret'].map((action) => (
                      <Button key={action} type="button" variant="outline" size="sm" className="rounded-full" onClick={() => onAction(action, hook)}>
                        {action}
                      </Button>
                    ))}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default WebhookRegistryTable;