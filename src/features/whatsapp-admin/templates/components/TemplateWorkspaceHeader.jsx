import React from 'react';
import { Bell, CircleHelp, Laptop, LogOut, Moon, Sun, UserCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const themeIcons = {
  light: Sun,
  dark: Moon,
  system: Laptop,
};

const TemplateWorkspaceHeader = ({
  search,
  onSearchChange,
  themeMode,
  onThemeModeChange,
  adminProfile,
  onLogout,
}) => {
  return (
    <div className="sticky top-4 z-20 rounded-[28px] border border-white/70 bg-white/90 px-5 py-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/80">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,260px)_minmax(0,1fr)_auto] xl:items-center">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">Templates Control Center</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">Templates</h1>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
          <Input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search template name, purpose, category, language, or tags"
            className="h-11 rounded-2xl border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
          />
          <button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white">
            <CircleHelp className="h-4 w-4" />
            Help
          </button>
          <button type="button" className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:text-white">
            <Bell className="h-4 w-4" />
            Notifications
            <Badge variant="outline" className="rounded-full border-slate-300 px-2 py-0 text-[10px] text-slate-600 dark:border-slate-700 dark:text-slate-300">
              {adminProfile.notifications}
            </Badge>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-slate-800 dark:bg-slate-900">
            {['light', 'dark', 'system'].map((option) => {
              const Icon = themeIcons[option];

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onThemeModeChange(option)}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${themeMode === option ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {option}
                </button>
              );
            })}
          </div>

          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 dark:border-slate-800 dark:bg-slate-900">
              <UserCircle2 className="h-8 w-8 text-slate-500 dark:text-slate-300" />
              <div className="text-left">
                <p className="text-sm font-semibold text-slate-950 dark:text-white">{adminProfile.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{adminProfile.email}</p>
              </div>
              <Badge variant="outline" className="rounded-full border-indigo-300 bg-indigo-500/10 px-2.5 py-0.5 text-[10px] text-indigo-700 dark:border-indigo-900 dark:text-indigo-200">
                {adminProfile.role}
              </Badge>
            </summary>
            <div className="absolute right-0 z-20 mt-3 w-72 rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_24px_80px_rgba(15,23,42,0.16)] dark:border-slate-800 dark:bg-slate-950">
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Admin Experience</p>
              <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <div className="rounded-2xl border border-slate-200 px-3 py-2 dark:border-slate-800">Profile</div>
                <div className="rounded-2xl border border-slate-200 px-3 py-2 dark:border-slate-800">Current Session</div>
                <div className="rounded-2xl border border-slate-200 px-3 py-2 dark:border-slate-800">Role: {adminProfile.role}</div>
                <div className="rounded-2xl border border-slate-200 px-3 py-2 dark:border-slate-800">Activity</div>
                <button type="button" onClick={onLogout} className="flex w-full items-center justify-between rounded-2xl border border-slate-200 px-3 py-2 text-left text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-950 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:text-white">
                  Logout
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default TemplateWorkspaceHeader;