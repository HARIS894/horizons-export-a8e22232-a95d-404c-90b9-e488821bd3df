import React, { useMemo, useState } from 'react';
import { ArrowRightLeft, Link2, Search, ShieldCheck, Webhook } from 'lucide-react';
import WhatsAppAdminLayout from '../../layout/WhatsAppAdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { adapterCatalog, integrationAdapterContract, providerSecurityNotes } from '../contracts/integrationAdapters';
import {
  crossModuleConnectionMap,
  integrationConnectionContractFields,
  integrationWorkspaceContracts,
  paymentEventContractFields,
  templateHandoffRules,
  webhookContractFields,
} from '../contracts/integrationWorkspaceContracts';
import {
  connectionActivityLog,
  googleConnectionFoundation,
  integrationConnections,
  razorpayFoundation,
  templateHandoffFoundation,
  webhookRegistry,
} from '../data/integrationMockData';
import ConnectionActivityTable from '../components/ConnectionActivityTable';
import IntegrationCatalogGrid from '../components/IntegrationCatalogGrid';
import IntegrationDetailsDrawer from '../components/IntegrationDetailsDrawer';
import IntegrationSummaryCards from '../components/IntegrationSummaryCards';
import WebhookRegistryTable from '../components/WebhookRegistryTable';
import {
  ACTIVITY_STATUS_META,
  INTEGRATION_CATEGORY_OPTIONS,
  INTEGRATION_VIEW_FILTERS,
} from '../types/integrationTypes';
import {
  countGrantedPermissions,
  matchesIntegrationCategory,
  matchesIntegrationSearch,
  matchesIntegrationView,
  summarizeIntegrationConnections,
} from '../validation/integrationValidation';

const SectionCard = ({ title, subtitle, action, children }) => (
  <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45 lg:p-6">
    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">{title}</p>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">{subtitle}</p>
      </div>
      {action || null}
    </div>
    <div className="mt-5">{children}</div>
  </section>
);

const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-[160px_minmax(0,1fr)] gap-3 border-b border-slate-200/70 py-3 last:border-b-0 dark:border-slate-800/80">
    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    <p className="text-sm text-slate-900 dark:text-white">{value}</p>
  </div>
);

const NativeSelect = ({ value, onChange, options }) => (
  <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const ActivityBadge = ({ value }) => {
  const className = ACTIVITY_STATUS_META[value] || ACTIVITY_STATUS_META.INFO;
  return (
    <Badge variant="outline" className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${className}`}>
      {value}
    </Badge>
  );
};

const WhatsAppIntegrationsPage = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [viewFilter, setViewFilter] = useState('overview');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [activeFoundationTab, setActiveFoundationTab] = useState('google-workspace');
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [detailsDrawerOpen, setDetailsDrawerOpen] = useState(false);

  const filteredIntegrations = useMemo(() => integrationConnections.filter((integration) => {
    const matchesSearch = matchesIntegrationSearch(integration, search);
    const matchesStatus = matchesIntegrationView(integration, viewFilter);
    const matchesCategory = matchesIntegrationCategory(integration, categoryFilter);
    return matchesSearch && matchesStatus && matchesCategory;
  }), [categoryFilter, search, viewFilter]);

  const overviewCards = useMemo(() => summarizeIntegrationConnections(integrationConnections), []);

  const permissionRows = useMemo(() => integrationConnections.map((integration) => ({
    id: integration.id,
    provider: integration.displayName,
    granted: countGrantedPermissions(integration),
    total: (integration.permissions || []).length,
    permissions: integration.permissions || [],
  })), []);

  const handleAction = (title, integration, description) => {
    toast({
      title: `${title} is backend-gated`,
      description: `${integration.displayName}: ${description}`,
    });
  };

  const openIntegrationDetails = (integration) => {
    setSelectedIntegration(integration);
    setDetailsDrawerOpen(true);
  };

  return (
    <WhatsAppAdminLayout>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45 lg:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full border-sky-300 bg-sky-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-sky-700 dark:border-sky-900 dark:text-sky-200">
                  Integration Control Center
                </Badge>
                <Badge variant="outline" className="rounded-full border-emerald-300 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-emerald-700 dark:border-emerald-900 dark:text-emerald-200">
                  Phase 3A backend-first foundation
                </Badge>
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Enterprise integration command layer</h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                Backend-first visibility for WhatsApp Cloud API, Google Workspace, Razorpay, Email, Webhooks, and future AI providers. This control center never claims a provider is connected unless that status is verified by the backend.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => toast({ title: 'Backend verification required', description: 'Bulk provider testing will remain disabled until safe backend status endpoints exist.' })}>
                Test All Connections
              </Button>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => toast({ title: 'Connection export withheld', description: 'Sensitive integration details remain server-owned and are not exportable from the browser.' })}>
                Export Control Summary
              </Button>
            </div>
          </div>

          <div className="mt-5">
            <IntegrationSummaryCards items={overviewCards} />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
          <SectionCard
            title="Integration Registry"
            subtitle="Search, filter, and inspect provider cards without inventing connected states, granted scopes, or webhook health."
            action={<Badge variant="outline" className="rounded-full border-cyan-300 bg-cyan-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-cyan-700 dark:border-cyan-900 dark:text-cyan-200">Backend verified only</Badge>}
          >
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="relative w-full xl:max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search integrations" className="h-11 rounded-full border-slate-200 bg-white pl-10 dark:border-slate-700 dark:bg-slate-950" />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {INTEGRATION_VIEW_FILTERS.map((filter) => (
                    <button key={filter.key} type="button" onClick={() => setViewFilter(filter.key)} className={viewFilter === filter.key ? 'whitespace-nowrap rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white dark:bg-white dark:text-slate-950' : 'whitespace-nowrap rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}>
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <NativeSelect value={categoryFilter} onChange={setCategoryFilter} options={INTEGRATION_CATEGORY_OPTIONS.map((option) => ({ value: option, label: option }))} />
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/45 dark:text-slate-300">
                  Providers in scope: {integrationConnections.length}
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900/45 dark:text-slate-300">
                  Results shown: {filteredIntegrations.length}
                </div>
              </div>

              {filteredIntegrations.length ? (
                <IntegrationCatalogGrid
                  integrations={filteredIntegrations}
                  onConnect={(integration) => handleAction('Connect', integration, 'A backend-owned OAuth or credential handshake must be introduced first.')}
                  onManage={openIntegrationDetails}
                  onTestConnection={(integration) => handleAction('Test Connection', integration, 'The browser cannot validate providers directly; a safe backend probe is required.')}
                  onDisconnect={(integration) => handleAction('Disconnect', integration, 'Disconnection must be performed by the backend to revoke remote trust safely.')}
                />
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
                  No integrations match the current search and filter combination.
                </div>
              )}
            </div>
          </SectionCard>

          <div className="space-y-4">
            <SectionCard title="Recent Activity" subtitle="Latest backend-gated review events across provider setup, webhook contracts, and verification blockers.">
              <div className="space-y-3">
                {connectionActivityLog.slice(0, 4).map((item) => (
                  <div key={item.id} className="rounded-[20px] border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/40">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-950 dark:text-white">{item.provider}</p>
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.action}</p>
                      </div>
                      <ActivityBadge value={item.status} />
                    </div>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{item.timestamp}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Control Rules" subtitle="The page-level guardrails that keep this workspace honest and production-safe.">
              <div className="space-y-3">
                <div className="rounded-[20px] border border-cyan-200 bg-cyan-50/80 px-4 py-4 dark:border-cyan-900/40 dark:bg-cyan-950/20">
                  <div className="flex items-center gap-2 text-cyan-800 dark:text-cyan-200">
                    <ShieldCheck className="h-4 w-4" />
                    <p className="text-sm font-medium">No fake connected states</p>
                  </div>
                  <p className="mt-2 text-xs text-cyan-700 dark:text-cyan-200">If the backend has not verified a provider, the UI must keep it disconnected, disabled, or pending.</p>
                </div>
                <div className="rounded-[20px] border border-emerald-200 bg-emerald-50/80 px-4 py-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                    <Webhook className="h-4 w-4" />
                    <p className="text-sm font-medium">Webhook secrets stay backend-only</p>
                  </div>
                  <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-200">This surface can show endpoint health and rotation policies, but never raw secret material.</p>
                </div>
                <div className="rounded-[20px] border border-amber-200 bg-amber-50/80 px-4 py-4 dark:border-amber-900/40 dark:bg-amber-950/20">
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                    <ShieldCheck className="h-4 w-4" />
                    <p className="text-sm font-medium">Production WhatsApp behavior untouched</p>
                  </div>
                  <p className="mt-2 text-xs text-amber-700 dark:text-amber-200">This phase adds only an isolated admin foundation and does not change inbox, send, auth, webhook, env, or credentials behavior.</p>
                </div>
              </div>
            </SectionCard>
          </div>
        </section>

        <SectionCard title="Provider Foundations" subtitle="Provider-specific contract surfaces for Google Workspace, Razorpay, and template handoff controls. These are backend-first blueprints, not live connectors.">
          <Tabs value={activeFoundationTab} onValueChange={setActiveFoundationTab} className="space-y-5">
            <div className="overflow-x-auto pb-1">
              <TabsList className="h-auto min-w-max gap-2 rounded-full bg-slate-100/80 p-1.5 dark:bg-slate-900/80">
                <TabsTrigger value="google-workspace" className="rounded-full px-4 py-2 data-[state=active]:bg-slate-950 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-950">Google Workspace</TabsTrigger>
                <TabsTrigger value="razorpay" className="rounded-full px-4 py-2 data-[state=active]:bg-slate-950 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-950">Razorpay</TabsTrigger>
                <TabsTrigger value="template-handoff" className="rounded-full px-4 py-2 data-[state=active]:bg-slate-950 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-950">Template Handoff</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="google-workspace" className="mt-0 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-4">
                <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-950/35">
                  <p className="text-lg font-semibold text-slate-950 dark:text-white">Google OAuth foundation</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">A single backend-owned Google connect flow should power Sheets, Calendar, and Apps Script while keeping browser state free of tokens.</p>
                  <div className="mt-4 space-y-3">
                    {googleConnectionFoundation.oauthFlow.map((item, index) => (
                      <div key={item} className="flex items-center gap-3 rounded-[18px] border border-slate-200/80 bg-slate-50/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/45">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white dark:bg-white dark:text-slate-950">{index + 1}</div>
                        <p className="text-sm text-slate-700 dark:text-slate-200">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-950/35">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">Sheets capabilities</p>
                    <div className="mt-3 space-y-2">
                      {googleConnectionFoundation.sheetsCapabilities.map((item) => (
                        <div key={item} className="rounded-[18px] border border-slate-200/80 bg-slate-50/80 px-3 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/45 dark:text-slate-200">{item}</div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-950/35">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">Calendar capabilities</p>
                    <div className="mt-3 space-y-2">
                      {googleConnectionFoundation.calendarCapabilities.map((item) => (
                        <div key={item} className="rounded-[18px] border border-slate-200/80 bg-slate-50/80 px-3 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/45 dark:text-slate-200">{item}</div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-950/35">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">Apps Script capabilities</p>
                    <div className="mt-3 space-y-2">
                      {googleConnectionFoundation.appsScriptCapabilities.map((item) => (
                        <div key={item} className="rounded-[18px] border border-slate-200/80 bg-slate-50/80 px-3 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/45 dark:text-slate-200">{item}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-950/35">
                  <DetailRow label="Connect Action" value={googleConnectionFoundation.connectLabel} />
                  <DetailRow label="Security Model" value="Backend-owned OAuth tokens only" />
                  <DetailRow label="Sheets" value="Spreadsheet and worksheet selection, read/write/append/update, mapping" />
                  <DetailRow label="Calendar" value="Calendar selection, read/create/update events, sync status" />
                  <DetailRow label="Apps Script" value="Deployment selection, logs, and trigger review" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="razorpay" className="mt-0 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="space-y-4">
                <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-950/35">
                  <p className="text-lg font-semibold text-slate-950 dark:text-white">Razorpay connection foundation</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Connection state, key status, and webhook health are backend-owned. The browser only displays safe metadata and contract expectations.</p>
                  <div className="mt-4">
                    <DetailRow label="Account Status" value={razorpayFoundation.accountStatus} />
                    <DetailRow label="Key Status" value={razorpayFoundation.keyStatus} />
                    <DetailRow label="Webhook Status" value={razorpayFoundation.webhookStatus} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {razorpayFoundation.connectionLogs.map((module) => (
                      <Badge key={module} variant="outline" className="rounded-full border-slate-300 bg-transparent px-2 py-0 text-[10px] uppercase tracking-[0.14em] text-slate-600 dark:border-slate-700 dark:text-slate-300">
                        {module}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
                  {razorpayFoundation.paymentEventFields.map((card) => (
                    <div key={card.label} className="rounded-[24px] border border-slate-200/80 bg-white/90 px-4 py-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-950/35">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Payment Event</p>
                      <p className="mt-3 text-sm font-semibold text-slate-950 dark:text-white">{card}</p>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Future backend event contract</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-950/35">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Payment source-of-truth</p>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{integrationConnections.find((item) => item.id === 'razorpay')?.metadata?.sourceOfTruth}</p>
                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">Internal reference example: {integrationConnections.find((item) => item.id === 'razorpay')?.metadata?.internalReferenceExample}</p>
              </div>
            </TabsContent>

            <TabsContent value="template-handoff" className="mt-0 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-950/35">
                <p className="text-lg font-semibold text-slate-950 dark:text-white">Template handoff rules</p>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Only provider-approved templates may be marked usable for production WhatsApp messaging. This phase adds metadata, not send behavior changes.</p>
                <div className="mt-4 space-y-3">
                  <div className="rounded-[18px] border border-slate-200/80 bg-slate-50/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/45">
                    <p className="text-sm font-medium text-slate-950 dark:text-white">Supported Targets</p>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{templateHandoffFoundation.supportedTargets.join(' • ')}</p>
                  </div>
                  <div className="rounded-[18px] border border-cyan-200 bg-cyan-50/80 px-3 py-3 dark:border-cyan-900/40 dark:bg-cyan-950/20">
                    <p className="text-sm font-medium text-cyan-900 dark:text-cyan-100">Rule</p>
                    <p className="mt-2 text-sm text-cyan-800 dark:text-cyan-200">{templateHandoffFoundation.rule}</p>
                  </div>
                  <div className="rounded-[18px] border border-slate-200/80 bg-slate-50/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/45">
                    <p className="text-sm font-medium text-slate-950 dark:text-white">Phase note</p>
                    <p className="mt-2 text-sm text-slate-700 dark:text-slate-300">{templateHandoffFoundation.note}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-950/35">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Contract summary</p>
                <div className="mt-3">
                  <DetailRow label="Allowed targets" value={templateHandoffRules.allowedTargets.join(', ')} />
                  <DetailRow label="Production guardrail" value={templateHandoffRules.productionGuardrail} />
                  <DetailRow label="Backend source" value={templateHandoffRules.backendSourceOfTruth} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </SectionCard>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <SectionCard title="Webhook Center" subtitle="Central backend-first registry for provider endpoints, delivery health, and future enable/disable or secret rotation actions.">
            <WebhookRegistryTable hooks={webhookRegistry} onAction={(action, hook) => toast({ title: `${action} remains backend-managed`, description: `${hook.provider}: webhook secrets and delivery controls are not performed from the browser.` })} />
          </SectionCard>

          <div className="space-y-4">
            <SectionCard title="Adapter Contracts" subtitle="Future adapters must match these explicit frontend expectations before any live connector is approved.">
              <div className="space-y-3">
                {Object.entries(integrationAdapterContract).map(([key, value]) => (
                  <div key={key} className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/45">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{key}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{value}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Adapter Catalog" subtitle="Explicit future adapter boundaries for backend-controlled provider integrations.">
              <div className="space-y-3">
                {Object.entries(adapterCatalog).map(([adapterName, methods]) => (
                  <div key={adapterName} className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/45">
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">{adapterName}</p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{methods.join(' • ')}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>
        </section>

        <SectionCard title="Connection Activity" subtitle="Backend-facing connection and webhook review events with request IDs and safe diagnostics only.">
          <ConnectionActivityTable entries={connectionActivityLog} onViewEntry={(entry) => toast({ title: entry.action, description: `${entry.provider}: ${entry.error}` })} />
        </SectionCard>

        <SectionCard title="Permission Center" subtitle="Provider permissions remain visible but unresolved until backend verification confirms scopes or capability grants.">
          <div className="grid gap-4 lg:grid-cols-2">
            {permissionRows.map((row) => (
              <div key={row.id} className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-950/35">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-950 dark:text-white">{row.provider}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{row.granted} granted / {row.total} total</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => openIntegrationDetails(integrationConnections.find((item) => item.id === row.id))}>
                    Review
                  </Button>
                </div>
                <div className="mt-4 space-y-2">
                  {row.permissions.map((permission) => (
                    <div key={permission.label} className="rounded-[18px] border border-slate-200/80 bg-slate-50/80 px-3 py-3 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900/45 dark:text-slate-200">
                      <div className="flex items-center justify-between gap-3">
                        <span>{permission.label}</span>
                        <Badge variant="outline" className="rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em]">{permission.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <SectionCard title="Cross-Module Connections" subtitle="How staged integrations will later connect operationally across the WhatsApp Admin Platform.">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {crossModuleConnectionMap.map((item) => (
                <div key={`${item.source}-${item.target}`} className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/45">
                  <div className="flex items-center gap-2 text-slate-950 dark:text-white">
                    <Link2 className="h-4 w-4" />
                    <p className="text-sm font-semibold">{item.source}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                    <span>{item.source}</span>
                    <ArrowRightLeft className="h-3 w-3" />
                    <span>{item.target}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.purpose}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          <div className="space-y-4">
            <SectionCard title="Security" subtitle="Rules that must stay intact while this workspace remains local-only.">
              <div className="space-y-3">
                {providerSecurityNotes.map((item) => (
                  <div key={item} className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:bg-slate-900/45 dark:text-slate-300">
                    {item}
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Workspace Contracts" subtitle="Explicit UI contracts that keep this control center adapter-driven and isolated from real provider traffic.">
              <div className="space-y-3">
                {Object.entries(integrationWorkspaceContracts).map(([key, value]) => (
                  <div key={key} className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/45">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{key}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{value}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Contract Fields" subtitle="Stable field-level expectations for backend connection, webhook, and payment-event payloads.">
              <div className="space-y-3">
                <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/45">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">IntegrationConnection</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{integrationConnectionContractFields.join(' • ')}</p>
                </div>
                <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/45">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Webhook Contract</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{webhookContractFields.join(' • ')}</p>
                </div>
                <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/45">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">PaymentEvent</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{paymentEventContractFields.join(' • ')}</p>
                </div>
              </div>
            </SectionCard>
          </div>
        </section>

        <IntegrationDetailsDrawer open={detailsDrawerOpen} onOpenChange={setDetailsDrawerOpen} integration={selectedIntegration} onAction={(action, integration) => handleAction(action, integration, 'This control remains a safe frontend placeholder until backend implementation exists.')} />
      </div>
    </WhatsAppAdminLayout>
  );
};

export default WhatsAppIntegrationsPage;