import React from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CalendarRange,
  CircleDollarSign,
  Cpu,
  CreditCard,
  FileClock,
  FileText,
  FolderKanban,
  HandCoins,
  KeyRound,
  LayoutDashboard,
  Link2,
  MessageSquareText,
  Receipt,
  Rows3,
  ScrollText,
  Settings,
  ShieldCheck,
  Sheet,
  Sparkles,
  Stethoscope,
  Syringe,
  TimerReset,
  Users,
  UserSquare2,
  Wallet,
  Webhook,
  Workflow,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navigationGroups = [
  {
    label: 'Operations',
    items: [
      { label: 'Overview', icon: LayoutDashboard, to: '/admin/whatsapp-platform' },
      { label: 'Inbox', icon: MessageSquareText, badge: 'Next phase' },
      { label: 'Contacts', icon: UserSquare2, badge: 'Next phase' },
      { label: 'Templates', icon: FileText, to: '/admin/whatsapp-platform/templates' },
      { label: 'Flows', icon: Workflow, badge: 'Next phase' },
      { label: 'Campaigns', icon: BriefcaseBusiness, badge: 'Next phase' },
    ],
  },
  {
    label: 'Automation',
    items: [
      { label: 'Flow Builder', icon: Rows3, badge: 'Next phase' },
      { label: 'Triggers', icon: TimerReset, badge: 'Next phase' },
      { label: 'Schedules', icon: CalendarRange, badge: 'Next phase' },
      { label: 'Rules', icon: ShieldCheck, badge: 'Next phase' },
      { label: 'AI Automation', icon: Sparkles, badge: 'Next phase' },
    ],
  },
  {
    label: 'Integrations',
    items: [
      { label: 'Integration Hub', icon: Link2, to: '/admin/whatsapp-platform/integrations' },
      { label: 'Google Sheets', icon: Sheet, badge: 'Demo' },
      { label: 'Google Calendar', icon: CalendarRange, badge: 'Demo' },
      { label: 'Apps Script', icon: Cpu, badge: 'Demo' },
      { label: 'Excel / VBA', icon: ScrollText, badge: 'Demo' },
      { label: 'WhatsApp / Meta', icon: MessageSquareText, badge: 'Demo' },
      { label: 'Webhooks', icon: Webhook, badge: 'Demo' },
      { label: 'API Keys', icon: KeyRound, badge: 'Demo' },
    ],
  },
  {
    label: 'Business',
    items: [
      { label: 'Staff', icon: Users, badge: 'Next phase' },
      { label: 'Salary', icon: Wallet, badge: 'Next phase' },
      { label: 'Clients', icon: Building2, badge: 'Next phase' },
      { label: 'Payments', icon: HandCoins, badge: 'Next phase' },
      { label: 'Invoices', icon: Receipt, badge: 'Next phase' },
      { label: 'Expenses', icon: CreditCard, badge: 'Next phase' },
      { label: 'Reports', icon: FileClock, badge: 'Next phase' },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { label: 'Analytics', icon: BarChart3, badge: 'Next phase' },
      { label: 'Delivery', icon: Activity, badge: 'Next phase' },
      { label: 'Template Performance', icon: Stethoscope, badge: 'Next phase' },
      { label: 'Automation Performance', icon: Syringe, badge: 'Next phase' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Audit Logs', icon: ShieldCheck, badge: 'Next phase' },
      { label: 'Settings', icon: Settings, badge: 'Next phase' },
      { label: 'Admin Profile', icon: FolderKanban, badge: 'Next phase' },
    ],
  },
];

const NavItem = ({ item, currentPath, onNavigate }) => {
  const Icon = item.icon;
  const isActive = item.to && currentPath === item.to;
  const content = (
    <>
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-xl border', isActive ? 'border-white/15 bg-white/10 text-white dark:border-slate-300/20 dark:bg-slate-950/20' : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400')}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.label}</p>
      </div>
      {item.badge ? (
        <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em]', isActive ? 'bg-white/15 text-white dark:bg-slate-950/25' : 'bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400')}>
          {item.badge}
        </span>
      ) : null}
    </>
  );

  const className = cn(
    'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition-colors',
    isActive
      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/20'
      : item.to
        ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-200 dark:hover:bg-slate-900 dark:hover:text-white'
        : 'cursor-default text-slate-500 dark:text-slate-400',
  );

  if (item.to) {
    return (
      <Link to={item.to} onClick={onNavigate} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <div className={className}>
      {content}
    </div>
  );
};

const WhatsAppAdminSidebar = ({ isOpen, onClose, currentPath }) => {
  return (
    <>
      <div
        aria-hidden="true"
        className={cn('fixed inset-0 z-30 bg-slate-950/45 backdrop-blur-sm transition-opacity xl:hidden', isOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0')}
        onClick={onClose}
      />
      <aside className={cn('fixed inset-y-0 left-0 z-40 flex w-[256px] flex-col border-r border-slate-200 bg-white/95 shadow-[0_24px_80px_rgba(15,23,42,0.14)] backdrop-blur transition-transform dark:border-slate-800 dark:bg-slate-950/95', isOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0')}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-5 dark:border-slate-800 xl:justify-start">
          <div>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-950/20">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <h2 className="mt-3 text-lg font-semibold tracking-tight text-slate-950 dark:text-white">InstantCare Admin</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Premium WhatsApp operations workspace</p>
          </div>
          <button type="button" onClick={onClose} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 dark:border-slate-800 dark:text-slate-400 xl:hidden">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-6">
            {navigationGroups.map((group) => (
              <section key={group.label}>
                <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{group.label}</p>
                <div className="mt-2 space-y-1">
                  {group.items.map((item) => (
                    <NavItem key={item.label} item={item} currentPath={currentPath} onNavigate={onClose} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-200 px-4 py-4 dark:border-slate-800">
          <div className="rounded-[22px] border border-emerald-100 bg-emerald-50/80 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm dark:bg-emerald-900/40 dark:text-emerald-200">
                <Activity className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">Platform Mode</p>
                <p className="text-xs text-slate-600 dark:text-slate-300">Demo / Not Connected</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-600 dark:text-slate-300">
              Live provider integrations, Meta sync, Sheets sync, and automation execution remain intentionally inactive in this phase.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default WhatsAppAdminSidebar;