import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import {
  Activity,
  Building2,
  CalendarDays,
  CreditCard,
  FileBarChart2,
  MessageSquareMore,
  Settings2,
  Stethoscope,
  Users2,
  Waypoints,
} from 'lucide-react';
import WhatsAppInbox from '@/components/admin/WhatsAppInbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { adminDashboardTabs, buildAdminDashboardViewModel, getAdminDashboardData } from '@/data/adminDashboardData';
import {
  AppointmentsSection,
  BillingSection,
  CommunicationsAndReportsOverview,
  EnquiriesSection,
  GlassPanel,
  HospitalsAndInsuranceOverview,
  HospitalsSection,
  InsuranceSection,
  OverviewSection,
  PatientsSection,
  ReportsSection,
  SettingsSection,
  SummaryStrip,
  StaffSection,
  WhatsAppSection,
} from '@/components/admin/AdminDashboardSections';

const tabIcons = {
  overview: Activity,
  patients: Users2,
  enquiries: Waypoints,
  staff: Stethoscope,
  hospitals: Building2,
  appointments: CalendarDays,
  insurance: FileBarChart2,
  billing: CreditCard,
  whatsapp: MessageSquareMore,
  reports: FileBarChart2,
  settings: Settings2,
};

const AdminDashboard = () => {
  const { toast } = useToast();
  const dashboard = useMemo(() => buildAdminDashboardViewModel(getAdminDashboardData()), []);
  const [activePatientId, setActivePatientId] = useState(dashboard.patients[0]?.id || null);
  const [activeEnquiryStage, setActiveEnquiryStage] = useState('All');
  const [activeStaffRole, setActiveStaffRole] = useState('All');

  const handleAction = (title, description) => {
    toast({ title, description });
  };

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - InstantCare</title>
        <meta
          name="description"
          content="Premium healthcare CRM dashboard for InstantCare with patients, enquiries, staff, hospitals, billing, insurance and reporting modules."
        />
      </Helmet>

      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(139,92,246,0.18),_transparent_24%),linear-gradient(180deg,_#eef8ff_0%,_#f8fafc_48%,_#ffffff_100%)] dark:bg-[linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#111827_100%)]">
        <div className="px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <GlassPanel className="overflow-hidden p-0">
                <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(167,139,250,0.22),_transparent_24%),linear-gradient(135deg,_rgba(255,255,255,0.8),_rgba(255,255,255,0.56))] p-6 dark:border-white/10 dark:bg-[linear-gradient(135deg,_rgba(15,23,42,0.85),_rgba(15,23,42,0.64))] sm:p-8">
                  <div className="absolute -left-8 top-0 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
                  <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-violet-400/20 blur-3xl" />
                  <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-slate-500 dark:text-slate-400">Premium Healthcare CRM</p>
                      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">Admin Dashboard</h1>
                      <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">
                        A professional command centre for patients, enquiries, staff, hospitals, appointments, insurance, billing, WhatsApp operations, reporting and settings.
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[24px] border border-white/70 bg-white/70 px-4 py-4 dark:border-white/10 dark:bg-slate-950/45">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Backend status</p>
                        <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">Dashboard data available</p>
                      </div>
                      <div className="rounded-[24px] border border-white/70 bg-white/70 px-4 py-4 dark:border-white/10 dark:bg-slate-950/45">
                        <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Dark mode ready</p>
                        <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">Glass panels and contrast-safe tokens</p>
                      </div>
                    </div>
                  </div>
                </div>
              </GlassPanel>

              <SummaryStrip dashboard={dashboard} />

              <Tabs defaultValue="whatsapp" className="space-y-6">
                <div className="overflow-x-auto pb-1">
                  <TabsList className="h-auto min-w-max gap-2 rounded-full bg-white/70 p-2 backdrop-blur dark:bg-slate-900/60">
                    {adminDashboardTabs.map((tab) => {
                      const Icon = tabIcons[tab.key] || Activity;
                      return (
                        <TabsTrigger
                          key={tab.key}
                          value={tab.key}
                          className="rounded-full px-4 py-2.5 data-[state=active]:bg-slate-950 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-950"
                        >
                          <Icon className="mr-2 h-4 w-4" /> {tab.label}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-6">
                  <OverviewSection dashboard={dashboard} onAction={handleAction} />
                  <HospitalsAndInsuranceOverview dashboard={dashboard} />
                  <CommunicationsAndReportsOverview dashboard={dashboard} />
                </TabsContent>

                <TabsContent value="patients">
                  <PatientsSection patients={dashboard.patients} activePatientId={activePatientId} onPatientChange={setActivePatientId} />
                </TabsContent>

                <TabsContent value="enquiries">
                  <EnquiriesSection dashboard={dashboard} activeStage={activeEnquiryStage} onStageChange={setActiveEnquiryStage} onAction={handleAction} />
                </TabsContent>

                <TabsContent value="staff">
                  <StaffSection dashboard={dashboard} activeRole={activeStaffRole} onRoleChange={setActiveStaffRole} />
                </TabsContent>

                <TabsContent value="hospitals">
                  <HospitalsSection hospitals={dashboard.hospitals} />
                </TabsContent>

                <TabsContent value="appointments">
                  <AppointmentsSection appointments={dashboard.appointments} onAction={handleAction} />
                </TabsContent>

                <TabsContent value="insurance">
                  <InsuranceSection providers={dashboard.insuranceProviders} />
                </TabsContent>

                <TabsContent value="billing">
                  <BillingSection dashboard={dashboard} onAction={handleAction} />
                </TabsContent>

                <TabsContent value="whatsapp">
                  <div className="space-y-6">
                    <WhatsAppSection whatsappCentre={dashboard.whatsappCentre} onAction={handleAction} />
                    <WhatsAppInbox />
                  </div>
                </TabsContent>

                <TabsContent value="reports">
                  <ReportsSection dashboard={dashboard} />
                </TabsContent>

                <TabsContent value="settings">
                  <SettingsSection settings={dashboard.settings} onAction={handleAction} />
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;