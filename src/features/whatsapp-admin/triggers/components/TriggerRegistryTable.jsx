import React from 'react';
import { Button } from '@/components/ui/button';

const statusTone = {
  ACTIVE: 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200',
  PAUSED: 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-900 dark:text-amber-200',
  DRAFT: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
  ERROR: 'border-rose-300 bg-rose-500/10 text-rose-700 dark:border-rose-900 dark:text-rose-200',
};

const TriggerRegistryTable = ({ triggers, selectedTriggerId, onSelectTrigger, onCreateTrigger, onViewExecutionLogs }) => {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">Trigger Registry</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Event to Flow routing</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">Prepare backend-ready trigger definitions with stable Trigger Codes and Flow Codes. Real trigger execution remains inactive in this phase.</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="rounded-full" onClick={onViewExecutionLogs}>Execution Logs</Button>
          <Button type="button" className="rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" onClick={onCreateTrigger}>Create Trigger</Button>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-[24px] border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950/40">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50/90 dark:bg-slate-900/80">
            <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              <th className="px-4 py-3">Trigger</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Event</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Connected Flow</th>
              <th className="px-4 py-3">Condition</th>
              <th className="px-4 py-3">Last Execution</th>
              <th className="px-4 py-3">Execution Count</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {triggers.map((trigger) => (
              <tr key={trigger.id} onClick={() => onSelectTrigger(trigger.id)} className={`cursor-pointer transition-colors ${selectedTriggerId === trigger.id ? 'bg-cyan-500/10 dark:bg-cyan-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'}`}>
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-950 dark:text-white">{trigger.name}</p>
                </td>
                <td className="px-4 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">{trigger.triggerCode}</td>
                <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{trigger.event}</td>
                <td className="px-4 py-4"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusTone[trigger.status]}`}>{trigger.status}</span></td>
                <td className="px-4 py-4">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{trigger.flowCode}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{trigger.flowName}</p>
                </td>
                <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{trigger.conditionSummary || 'No conditions'}</td>
                <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{trigger.lastExecution}</td>
                <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{trigger.executionCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TriggerRegistryTable;