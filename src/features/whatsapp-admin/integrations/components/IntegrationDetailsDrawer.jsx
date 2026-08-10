import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  CONNECTION_STATUS_META,
  HEALTH_STATUS_META,
  PROVIDER_PERMISSION_STATUSES,
  WEBHOOK_STATUS_META,
} from '../types/integrationTypes';

const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-[150px_minmax(0,1fr)] gap-3 border-b border-slate-200/70 py-3 last:border-b-0 dark:border-slate-800/80">
    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    <p className="text-sm text-slate-900 dark:text-white">{value}</p>
  </div>
);

const permissionLabel = {
  GRANTED: 'Granted',
  PENDING_BACKEND: 'Pending backend confirmation',
  NOT_GRANTED: 'Not granted',
};

const IntegrationDetailsDrawer = ({ open, onOpenChange, integration, onAction }) => {
  if (!integration) {
    return null;
  }

  const statusClassName = CONNECTION_STATUS_META[integration.status] || CONNECTION_STATUS_META.DISCONNECTED;
  const healthClassName = HEALTH_STATUS_META[integration.health] || HEALTH_STATUS_META.UNKNOWN;
  const webhookClassName = WEBHOOK_STATUS_META[integration.webhookStatus] || WEBHOOK_STATUS_META.UNKNOWN;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto border-l border-slate-200 bg-slate-100/95 px-0 dark:border-slate-800 dark:bg-slate-950/95 sm:max-w-[760px]">
        <div className="px-6 pb-8 pt-5">
          <SheetHeader className="text-left">
            <div className="flex flex-wrap items-center gap-3">
              <SheetTitle className="text-2xl font-semibold text-slate-950 dark:text-white">{integration.displayName}</SheetTitle>
              <Badge variant="outline" className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${statusClassName}`}>{integration.status}</Badge>
              <Badge variant="outline" className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${healthClassName}`}>{integration.health}</Badge>
            </div>
            <SheetDescription>
              Backend-first connection details. The browser never stores secrets and never invents provider success states.
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-950/35">
              <DetailRow label="Provider" value={integration.provider} />
              <DetailRow label="Account" value={integration.accountLabel} />
              <DetailRow label="External Account ID" value={integration.externalAccountId} />
              <DetailRow label="Connected At" value={integration.connectedAt || 'Not connected'} />
              <DetailRow label="Last Checked" value={integration.lastCheckedAt} />
              <DetailRow label="Last Sync" value={integration.lastSyncAt} />
              <DetailRow label="Webhook Status" value={integration.webhookStatus} />
              <DetailRow label="Error Code" value={integration.errorCode || 'None'} />
              <DetailRow label="Error Message" value={integration.errorMessage || 'None'} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-950/35">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">Permissions / Scopes</p>
                  <Badge variant="outline" className="rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em]">Backend verified only</Badge>
                </div>
                <div className="mt-4 space-y-3">
                  {(integration.permissions || []).map((permission) => (
                    <div key={permission.label} className="rounded-[18px] border border-slate-200/80 bg-slate-50/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/45">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-950 dark:text-white">{permission.label}</p>
                        <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${permission.status === PROVIDER_PERMISSION_STATUSES.GRANTED ? 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200' : permission.status === PROVIDER_PERMISSION_STATUSES.NOT_GRANTED ? 'border-rose-300 bg-rose-500/10 text-rose-700 dark:border-rose-900 dark:text-rose-200' : 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'}`}>
                          {permissionLabel[permission.status]}
                        </span>
                      </div>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{permission.source}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-950/35">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">Webhook / Handoff</p>
                  <Badge variant="outline" className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${webhookClassName}`}>{integration.webhookStatus}</Badge>
                </div>
                <div className="mt-4 space-y-3">
                  {(integration.metadata?.useInFlow || []).length ? integration.metadata.useInFlow.map((item) => (
                    <div key={item.label} className="rounded-[18px] border border-slate-200/80 bg-slate-50/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/45">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-950 dark:text-white">Use in Flow</p>
                        <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]">{item.kind}</Badge>
                      </div>
                      <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{item.label}</p>
                    </div>
                  )) : (
                    <div className="rounded-[18px] border border-dashed border-slate-300 bg-slate-50/80 px-3 py-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/45 dark:text-slate-400">
                      No flow handoff contract is exposed for this provider in Phase 3A.
                    </div>
                  )}
                  {integration.metadata?.templateGuardrail ? (
                    <div className="rounded-[18px] border border-cyan-200 bg-cyan-50/80 px-3 py-3 dark:border-cyan-900/40 dark:bg-cyan-950/20">
                      <p className="text-sm font-medium text-cyan-900 dark:text-cyan-100">Template handoff guardrail</p>
                      <p className="mt-2 text-sm text-cyan-800 dark:text-cyan-200">{integration.metadata.templateGuardrail}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-950/35">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Capabilities</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(integration.metadata?.capabilities || []).map((capability) => (
                  <Badge key={capability} variant="outline" className="rounded-full border-slate-300 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-600 dark:border-slate-700 dark:text-slate-300">
                    {capability}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" className="rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" onClick={() => onAction('Connect', integration)}>
                Connect
              </Button>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => onAction('Test Connection', integration)}>
                Test Connection
              </Button>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => onAction('Reauthenticate', integration)}>
                Reauthenticate
              </Button>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => onAction('Disconnect', integration)}>
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default IntegrationDetailsDrawer;