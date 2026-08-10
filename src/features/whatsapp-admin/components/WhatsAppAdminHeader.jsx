import React from 'react';
import { Bell, ChevronRight, Laptop, Menu, Moon, Search, Sun, UserCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Laptop,
};

const WhatsAppAdminHeader = ({ title, description, breadcrumb, onOpenSidebar, themeMode, onThemeModeChange, headerSearch }) => {
  const { currentUser, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85">
      <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <button type="button" onClick={onOpenSidebar} className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-300 xl:hidden">
                <Menu className="h-4 w-4" />
              </button>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                {breadcrumb.map((item, index) => (
                  <React.Fragment key={item}>
                    {index ? <ChevronRight className="h-3.5 w-3.5" /> : null}
                    <span className={index === breadcrumb.length - 1 ? 'font-semibold text-slate-900 dark:text-white' : ''}>{item}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300">{description}</p>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(260px,360px)_auto_auto_auto] lg:items-center">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={headerSearch?.value ?? ''}
                onChange={(event) => headerSearch?.onChange?.(event.target.value)}
                placeholder={headerSearch?.placeholder || 'Search templates, integrations, flows, or reports'}
                className="h-11 rounded-2xl border-slate-200 bg-white pl-10 dark:border-slate-800 dark:bg-slate-900"
                readOnly={!headerSearch?.onChange}
              />
            </div>

            <div className="inline-flex h-11 items-center rounded-2xl border border-slate-200 bg-white px-2 dark:border-slate-800 dark:bg-slate-900">
              {['light', 'dark', 'system'].map((option) => {
                const Icon = themeIcons[option];

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => onThemeModeChange?.(option)}
                    className={`inline-flex h-8 items-center gap-2 rounded-xl px-3 text-xs font-semibold uppercase tracking-[0.18em] ${themeMode === option ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {option}
                  </button>
                );
              })}
            </div>

            <button type="button" className="inline-flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              <Bell className="h-4 w-4" />
              Notifications
              <Badge variant="outline" className="rounded-full border-slate-300 px-2 py-0 text-[10px] dark:border-slate-700">2</Badge>
            </button>

            <details className="relative">
              <summary className="flex h-11 cursor-pointer list-none items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
                <UserCircle2 className="h-8 w-8 text-slate-500 dark:text-slate-300" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">InstantCare Admin</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{currentUser?.email || 'admin@instantcare.com'}</p>
                </div>
              </summary>
              <div className="absolute right-0 z-30 mt-2 w-64 rounded-[22px] border border-slate-200 bg-white p-3 shadow-[0_20px_60px_rgba(15,23,42,0.12)] dark:border-slate-800 dark:bg-slate-950">
                <div className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                  <div className="rounded-2xl border border-slate-200 px-3 py-2 dark:border-slate-800">Profile</div>
                  <div className="rounded-2xl border border-slate-200 px-3 py-2 dark:border-slate-800">Account</div>
                  <div className="rounded-2xl border border-slate-200 px-3 py-2 dark:border-slate-800">Activity</div>
                  <button type="button" onClick={logout} className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-left dark:border-slate-800">
                    Logout
                  </button>
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
};

export default WhatsAppAdminHeader;