import React from 'react';
import { Bot, CalendarRange, FileSpreadsheet, Mail, MessageSquareText, Sparkles, Wallet, Webhook } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CONNECTION_STATUS_META, HEALTH_STATUS_META, WEBHOOK_STATUS_META } from '../types/integrationTypes';
import { countGrantedPermissions, getConnectionActionState } from '../validation/integrationValidation';

const iconById = {
  'whatsapp-cloud-api': MessageSquareText,
  'google-sheets': FileSpreadsheet,
  'google-calendar': CalendarRange,
  'google-apps-script': Sparkles,
  razorpay: Wallet,
  email: Mail,
  webhooks: Webhook,
  'ai-provider': Bot,
};

const IntegrationCatalogGrid = ({ integrations, onManage, onTestConnection, onDisconnect, onConnect }) => (
  <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
    {integrations.map((integration) => {
      const Icon = iconById[integration.id] || FileSpreadsheet;
      const statusClassName = CONNECTION_STATUS_META[integration.status] || CONNECTION_STATUS_META.DISCONNECTED;
      const healthClassName = HEALTH_STATUS_META[integration.health] || HEALTH_STATUS_META.UNKNOWN;
      const webhookClassName = WEBHOOK_STATUS_META[integration.webhookStatus] || WEBHOOK_STATUS_META.UNKNOWN;
      const actionState = getConnectionActionState(integration);

      return (
        <article key={integration.id} className="rounded-[24px] border border-slate-200/80 bg-white/90 p-5 shadow-[0_18px_40px_rgba(15,23,42,0.06)] dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200">
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Badge variant="outline" className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${statusClassName}`}>
                {integration.status}
              </Badge>
              <Badge variant="outline" className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${healthClassName}`}>
                {integration.health}
              </Badge>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{integration.displayName}</h3>
              <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{integration.category}</p>
            </div>
            <Badge variant="outline" className="rounded-full border-slate-300 bg-transparent px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {integration.metadata?.environment || 'Backend first'}
            </Badge>
          </div>

          <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{integration.description}</p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] border border-slate-200/80 bg-slate-50/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/45">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Last Checked</p>
              <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">{integration.lastCheckedAt}</p>
            </div>
            <div className="rounded-[18px] border border-slate-200/80 bg-slate-50/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/45">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Last Sync</p>
              <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">{integration.lastSyncAt}</p>
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-[18px] border border-slate-200/80 bg-slate-50/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/45">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Webhook Status</p>
              <Badge variant="outline" className={`mt-2 rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${webhookClassName}`}>
                {integration.webhookStatus}
              </Badge>
            </div>
            <div className="rounded-[18px] border border-slate-200/80 bg-slate-50/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/45">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Permissions</p>
              <p className="mt-2 text-sm font-medium text-slate-950 dark:text-white">{countGrantedPermissions(integration)} granted / {(integration.permissions || []).length} total</p>
            </div>
          </div>

          <p className="mt-4 text-xs leading-6 text-slate-500 dark:text-slate-400">{integration.accountLabel}</p>
          <p className="mt-2 text-xs leading-6 text-slate-500 dark:text-slate-400">{actionState.helperText}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            {(integration.metadata?.capabilities || []).slice(0, 4).map((module) => (
              <Badge key={module} variant="outline" className="rounded-full border-slate-300 bg-transparent px-2 py-0 text-[10px] uppercase tracking-[0.14em] text-slate-600 dark:border-slate-700 dark:text-slate-300">
                {module}
              </Badge>
            ))}
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <Button type="button" variant="outline" className="justify-start rounded-2xl" onClick={() => onConnect(integration)}>
              {actionState.connectLabel}
            </Button>
            <Button type="button" variant="outline" className="justify-start rounded-2xl" onClick={() => onManage(integration)}>
              Manage
            </Button>
            <Button type="button" variant="outline" className="justify-start rounded-2xl" onClick={() => onTestConnection(integration)}>
              Test Connection
            </Button>
            <Button type="button" variant="outline" className="justify-start rounded-2xl" onClick={() => onDisconnect(integration)} disabled={!actionState.canDisconnect}>
              Disconnect
            </Button>
            <Button type="button" variant="outline" className="justify-start rounded-2xl sm:col-span-2" onClick={() => onManage(integration)}>
              View Details
            </Button>
          </div>
        </article>
      );
    })}
  </div>
);

export default IntegrationCatalogGrid;
