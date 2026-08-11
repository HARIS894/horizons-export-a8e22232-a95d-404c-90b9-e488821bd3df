import React from 'react';
import { Badge } from '@/components/ui/badge';

const statusTone = {
  SUCCESS: 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200',
  FAILED: 'border-rose-300 bg-rose-500/10 text-rose-700 dark:border-rose-900 dark:text-rose-200',
  SKIPPED: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
  WAITING: 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-900 dark:text-amber-200',
  RUNNING: 'border-sky-300 bg-sky-500/10 text-sky-700 dark:border-sky-900 dark:text-sky-200',
  PAUSED: 'border-violet-300 bg-violet-500/10 text-violet-700 dark:border-violet-900 dark:text-violet-200',
};

const FlowExecutionLogsPanel = ({ entries, selectedExecutionId, onSelectExecution }) => {
  const selectedEntry = entries.find((entry) => entry.id === selectedExecutionId) || entries[0] || null;

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr),380px]">
      <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">Execution Logs</p>
            <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Flow Runtime History</h3>
          </div>
          <Badge variant="outline" className="rounded-full px-3 py-1 text-[11px]">Mock backend-ready logs</Badge>
        </div>

        <div className="mt-5 overflow-x-auto rounded-[24px] border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950/40">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50/90 dark:bg-slate-900/80">
              <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3">Flow</th>
                <th className="px-4 py-3">Trigger</th>
                <th className="px-4 py-3">Patient/Contact</th>
                <th className="px-4 py-3">Started</th>
                <th className="px-4 py-3">Completed</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Failed Node</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {entries.map((entry) => (
                <tr key={entry.id} onClick={() => onSelectExecution(entry.id)} className={`cursor-pointer transition-colors ${selectedExecutionId === entry.id ? 'bg-cyan-500/10 dark:bg-cyan-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-900/40'}`}>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-slate-950 dark:text-white">{entry.flowCode}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{entry.flowName}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{entry.triggerCode}</td>
                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{entry.entity}</td>
                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{entry.startedAt}</td>
                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{entry.completedAt}</td>
                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{entry.duration}</td>
                  <td className="px-4 py-4"><span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusTone[entry.status]}`}>{entry.status}</span></td>
                  <td className="px-4 py-4 text-sm text-slate-700 dark:text-slate-300">{entry.failedNode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-violet-700 dark:text-violet-200">Execution Detail</p>
        {selectedEntry ? (
          <div className="mt-4 space-y-4">
            <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">{selectedEntry.flowName}</p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Trigger: {selectedEntry.triggerCode} • Entity: {selectedEntry.entity}</p>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Execution: {selectedEntry.executionId} • Current Node: {selectedEntry.currentNodeId || 'n/a'} • Failed Node: {selectedEntry.failedNodeId || 'n/a'}</p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{selectedEntry.error || 'Execution completed without blocking errors.'}</p>
            </div>
            <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Metadata</p>
              <pre className="mt-3 overflow-auto text-xs leading-6 text-slate-600 dark:text-slate-300">{JSON.stringify(selectedEntry.metadata || {}, null, 2)}</pre>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Node Execution</p>
              <div className="mt-3 space-y-2">
                {selectedEntry.nodes.map((node) => (
                  <div key={node.id} className="rounded-2xl border border-slate-200/70 bg-white/60 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/30">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{node.label}</p>
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusTone[node.status]}`}>{node.status}</span>
                    </div>
                    {(Object.keys(node.input || {}).length || Object.keys(node.output || {}).length || node.error) ? (
                      <pre className="mt-3 overflow-auto text-xs leading-6 text-slate-600 dark:text-slate-300">{JSON.stringify({ input: node.input, output: node.output, error: node.error }, null, 2)}</pre>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default FlowExecutionLogsPanel;