import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import WhatsAppAdminHeader from '../components/WhatsAppAdminHeader';
import WhatsAppAdminSidebar from '../components/WhatsAppAdminSidebar';

const routeMeta = {
  '/admin/whatsapp-platform': {
    title: 'Overview',
    description: 'Enterprise command center for operations, integrations, business workflows, and admin governance.',
    breadcrumb: ['WhatsApp Admin', 'Overview'],
  },
  '/admin/whatsapp-platform/templates': {
    title: 'Templates',
    description: 'Manage healthcare template drafts, AI-assisted creation, preview, lifecycle, and readiness workflows.',
    breadcrumb: ['WhatsApp Admin', 'Templates'],
  },
  '/admin/whatsapp-platform/integrations': {
    title: 'Integration Hub',
    description: 'Prepare Google, Excel, Meta, webhook, and API integrations without activating live provider connections.',
    breadcrumb: ['WhatsApp Admin', 'Integrations'],
  },
};

const getInitialThemeMode = () => {
  if (typeof window === 'undefined') {
    return 'system';
  }

  return window.localStorage.getItem('instantcare-whatsapp-admin-theme') || 'system';
};

const WhatsAppAdminLayout = ({ children, headerSearch }) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(getInitialThemeMode);
  const [systemDark, setSystemDark] = useState(false);
  const currentMeta = routeMeta[location.pathname] || routeMeta['/admin/whatsapp-platform'];

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemTheme = () => setSystemDark(mediaQuery.matches);
    updateSystemTheme();

    const listener = () => updateSystemTheme();
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem('instantcare-whatsapp-admin-theme', themeMode);
  }, [themeMode]);

  const resolvedTheme = themeMode === 'system' ? (systemDark ? 'dark' : 'light') : themeMode;

  return (
    <div className={resolvedTheme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen overflow-hidden bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.08),transparent_20%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(8,145,178,0.16),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(5,150,105,0.12),transparent_20%)]" />

        <div className="relative flex min-h-screen">
          <WhatsAppAdminSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            currentPath={location.pathname}
          />

          <div className="flex min-h-screen min-w-0 flex-1 flex-col xl:pl-[256px]">
            <WhatsAppAdminHeader
              title={currentMeta.title}
              description={currentMeta.description}
              breadcrumb={currentMeta.breadcrumb}
              onOpenSidebar={() => setIsSidebarOpen(true)}
              themeMode={themeMode}
              onThemeModeChange={setThemeMode}
              headerSearch={headerSearch}
            />

            <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 pb-6 pt-4 sm:px-6 lg:px-8">
              <div className="mx-auto w-full max-w-[1680px]">{children}</div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppAdminLayout;