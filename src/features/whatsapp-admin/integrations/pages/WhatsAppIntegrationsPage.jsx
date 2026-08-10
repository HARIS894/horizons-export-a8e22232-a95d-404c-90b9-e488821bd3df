import React from 'react';
import { ArrowRight, CalendarRange, CircleAlert, FileSpreadsheet, Globe, KeyRound, Link2, PlayCircle, ScrollText, ShieldCheck, Sparkles, Webhook } from 'lucide-react';
import WhatsAppAdminLayout from '../../layout/WhatsAppAdminLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { integrationAdapterContract, providerSecurityNotes } from '../contracts/integrationAdapters';
import { integrationCatalog, sheetsFieldMappings, triggerArchitecture } from '../data/integrationCatalog';

const iconById = {
  'google-sheets': FileSpreadsheet,
  'google-calendar': CalendarRange,
  'google-apps-script': Sparkles,
  'excel-vba': ScrollText,
  'whatsapp-meta': Globe,
  webhooks: Webhook,
  'rest-api': KeyRound,
};

const WhatsAppIntegrationsPage = () => {
  return (
    <WhatsAppAdminLayout>
      <div className="space-y-6">
        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_420px]">
          <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="outline" className="rounded-full border-sky-300 bg-sky-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-sky-700 dark:border-sky-900 dark:text-sky-200">
                Integration Marketplace
              </Badge>
              <Badge variant="outline" className="rounded-full border-amber-300 bg-amber-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-amber-700 dark:border-amber-900 dark:text-amber-200">
                Demo / Not Connected
              </Badge>
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Central control center for future enterprise integrations</h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
              Configure adapter contracts, field mappings, event flows, and verification rules for Google Sheets, Calendar, Apps Script, Excel / VBA, Meta, webhooks, and REST API access. No live OAuth, provider mutations, or secret handling are implemented in this phase.
            </p>
          </div>

          <div className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-slate-800 dark:bg-slate-950/55">
            <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">Connection Status</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {['Connected', 'Not Connected', 'Needs Attention', 'Error', 'Syncing'].map((status) => (
                <div key={status} className="rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/50">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{status}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {status === 'Not Connected' ? 'Used in this demo phase until a verified backend connection exists.' : 'Reserved for future verified provider health.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">Available Integrations</p>
              <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Marketplace cards</h3>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">Every card stays in demo mode until a backend-verified provider connection exists. Configure, documentation, and test actions are UI-only placeholders for the integration phase.</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {integrationCatalog.map((integration) => {
              const Icon = iconById[integration.id] || Link2;

              return (
                <article key={integration.id} className="rounded-[24px] border border-slate-200/80 bg-slate-50/80 p-5 dark:border-slate-800 dark:bg-slate-900/45">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-700 shadow-sm dark:bg-slate-950 dark:text-slate-200">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="rounded-full border-slate-300 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-600 dark:border-slate-700 dark:text-slate-300">
                      {integration.category}
                    </Badge>
                  </div>
                  <h4 className="mt-4 text-lg font-semibold text-slate-950 dark:text-white">{integration.name}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{integration.description}</p>
                  <div className="mt-4 rounded-2xl border border-amber-300 bg-amber-500/10 px-3 py-2 text-xs font-medium text-amber-700 dark:border-amber-900 dark:text-amber-200">
                    {integration.status}
                  </div>
                  <ul className="mt-4 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                    {integration.capabilities.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                  <div className="mt-5 grid gap-2">
                    <Button type="button" variant="outline" className="justify-start rounded-2xl">Configure</Button>
                    <Button type="button" variant="outline" className="justify-start rounded-2xl">View Documentation</Button>
                    <Button type="button" variant="outline" className="justify-start rounded-2xl">Test Connection</Button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">Google Sheets Mapping</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">Future field mapping workspace</h3>
                </div>
                <Badge variant="outline" className="rounded-full border-sky-300 bg-sky-500/10 px-3 py-1 text-[10px] uppercase tracking-[0.16em] text-sky-700 dark:border-sky-900 dark:text-sky-200">
                  Preview Mapping
                </Badge>
              </div>
              <div className="mt-5 overflow-hidden rounded-[22px] border border-slate-200 dark:border-slate-800">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead className="bg-slate-50 dark:bg-slate-900/70">
                    <tr className="text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                      <th className="px-4 py-3">InstantCare Field</th>
                      <th className="px-4 py-3">Google Sheet Column</th>
                      <th className="px-4 py-3">Module</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {sheetsFieldMappings.map((mapping) => (
                      <tr key={mapping.field}>
                        <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">{mapping.field}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{mapping.column}</td>
                        <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{mapping.module}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button type="button" variant="outline" className="rounded-2xl">Validate Mapping</Button>
                <Button type="button" variant="outline" className="rounded-2xl">Sync Test</Button>
                <Button type="button" variant="outline" className="rounded-2xl">Save Mapping</Button>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
              <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-slate-500 dark:text-slate-400">Automation Architecture</p>
              <div className="mt-5 grid gap-4 md:grid-cols-3">
                {triggerArchitecture.map((stage) => (
                  <div key={stage.label} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/45">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">{stage.label}</p>
                      <ArrowRight className="h-4 w-4 text-slate-400" />
                    </div>
                    <ul className="mt-4 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                      {stage.items.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-300" />
                <p className="text-lg font-semibold text-slate-950 dark:text-white">Adapter Contract</p>
              </div>
              <div className="mt-4 space-y-3">
                {Object.entries(integrationAdapterContract).map(([key, value]) => (
                  <div key={key} className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/45">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{key}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
              <div className="flex items-center gap-3">
                <CircleAlert className="h-5 w-5 text-amber-600 dark:text-amber-300" />
                <p className="text-lg font-semibold text-slate-950 dark:text-white">Integration Security</p>
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                {providerSecurityNotes.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/55">
              <div className="flex items-center justify-between gap-3">
                <p className="text-lg font-semibold text-slate-950 dark:text-white">Execution placeholders</p>
                <PlayCircle className="h-5 w-5 text-slate-400" />
              </div>
              <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/45">Calendar selection and reminder rules</div>
                <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/45">Apps Script URL, trigger, frequency, execution audit</div>
                <div className="rounded-[20px] border border-slate-200 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/45">Excel import/export, CSV sync, scheduled desktop process</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </WhatsAppAdminLayout>
  );
};

export default WhatsAppIntegrationsPage;