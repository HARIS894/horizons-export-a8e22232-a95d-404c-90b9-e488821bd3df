import React from 'react';
import {
  BarChart3,
  FileStack,
  FolderKanban,
  MessageSquareText,
  ShieldCheck,
  Users,
  Workflow,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import WhatsAppAdminLayout from '../layout/WhatsAppAdminLayout';

const modules = [
  {
    title: 'Inbox',
    description: 'Future workspace for conversation review, assignment, escalation, and response workflows.',
    icon: MessageSquareText,
    tone: 'from-emerald-500/15 to-emerald-500/5 text-emerald-700 dark:text-emerald-200',
  },
  {
    title: 'Templates',
    description: 'Planned module for draft management, preview, variables, buttons, submission, and approval sync.',
    icon: FileStack,
    tone: 'from-sky-500/15 to-sky-500/5 text-sky-700 dark:text-sky-200',
  },
  {
    title: 'Flow Builder',
    description: 'Visual orchestration surface for future nodes, branches, conditions, versions, and publishing workflows.',
    icon: Workflow,
    tone: 'from-violet-500/15 to-violet-500/5 text-violet-700 dark:text-violet-200',
  },
  {
    title: 'Teams & Agents',
    description: 'Operational shell for team ownership, conversation assignment, agent visibility, and role-aware collaboration.',
    icon: Users,
    tone: 'from-amber-500/15 to-amber-500/5 text-amber-700 dark:text-amber-200',
  },
  {
    title: 'Media',
    description: 'Reserved area for future media asset catalogs, message attachments, and reusable content assets.',
    icon: FolderKanban,
    tone: 'from-cyan-500/15 to-cyan-500/5 text-cyan-700 dark:text-cyan-200',
  },
  {
    title: 'Exports',
    description: 'Planned delivery center for conversation exports and later CSV, Excel, and PDF workflows.',
    icon: ShieldCheck,
    tone: 'from-rose-500/15 to-rose-500/5 text-rose-700 dark:text-rose-200',
  },
  {
    title: 'Analytics',
    description: 'Executive reporting shell for throughput, activity, template performance, and operational insights.',
    icon: BarChart3,
    tone: 'from-slate-500/15 to-slate-500/5 text-slate-700 dark:text-slate-200',
  },
];

const WhatsAppAdminPlatformPage = () => {
  return (
    <WhatsAppAdminLayout>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/40 sm:p-7">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="rounded-full border-emerald-300 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-emerald-700 dark:border-emerald-900 dark:text-emerald-200">
              New Platform Module
            </Badge>
            <Badge variant="outline" className="rounded-full border-slate-300 bg-transparent px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-600 dark:border-slate-700 dark:text-slate-300">
              Not connected to routes
            </Badge>
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            Premium shell for the future WhatsApp operations suite
          </h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
            This isolated frontend shell defines the look and layout of a future WhatsApp Admin Platform without touching the live admin dashboard, existing inbox, routing, authentication, or backend behavior.
          </p>
        </div>

        <div className="rounded-[28px] border border-emerald-100/80 bg-[linear-gradient(180deg,rgba(236,253,245,0.9),rgba(255,255,255,0.92))] p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] dark:border-emerald-900/30 dark:bg-[linear-gradient(180deg,rgba(5,46,37,0.72),rgba(15,23,42,0.82))] sm:p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-emerald-700 dark:text-emerald-200">
            Platform Status
          </p>
          <div className="mt-4 rounded-[24px] border border-white/70 bg-white/75 p-5 dark:border-white/10 dark:bg-slate-950/35">
            <p className="text-lg font-semibold text-slate-950 dark:text-white">Phase 1A shell only</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              Layout, navigation placeholders, and module cards are present. No real routes, APIs, Meta integration, Supabase access, or WhatsApp logic are connected in this phase.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;
          return (
            <article
              key={module.title}
              className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur transition-transform hover:-translate-y-1 dark:border-white/10 dark:bg-slate-950/40"
            >
              <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${module.tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="mt-5 flex items-center gap-3">
                <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{module.title}</h3>
                <Badge variant="outline" className="rounded-full border-slate-300 px-2.5 py-0 text-[10px] uppercase tracking-[0.18em] text-slate-500 dark:border-slate-700 dark:text-slate-300">
                  Module
                </Badge>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{module.description}</p>
            </article>
          );
        })}
      </section>
    </WhatsAppAdminLayout>
  );
};

export default WhatsAppAdminPlatformPage;