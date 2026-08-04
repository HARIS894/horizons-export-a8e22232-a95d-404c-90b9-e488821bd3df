import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Activity, ClipboardList, FileHeart, ShieldCheck, Users } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { buildHealthcarePortalViewModel, getHealthcarePortalData } from '@/data/healthcarePortalData';
import {
  DailyCareReportSection,
  FamilyUpdatesSection,
  GlassPanel,
  HospitalCoordinationSection,
  InsuranceSection,
  PatientProfileSection,
  PatientSwitcher,
  PortalShell,
  TimelineSection,
  WidgetGrid,
} from '@/components/portal/HealthcarePortalSections';

const crmTabs = [
  { key: 'profile', label: 'Patient Profile', icon: Users },
  { key: 'timeline', label: 'Timeline', icon: Activity },
  { key: 'daily-report', label: 'Daily Care Report', icon: ClipboardList },
  { key: 'family-updates', label: 'Family Updates', icon: FileHeart },
  { key: 'coordination', label: 'Hospital Coordination', icon: ShieldCheck },
  { key: 'insurance', label: 'Insurance', icon: ShieldCheck },
];

const HealthcareCrmPortalPage = () => {
  const { toast } = useToast();
  const portal = useMemo(() => buildHealthcarePortalViewModel(getHealthcarePortalData()), []);
  const [activePatientId, setActivePatientId] = useState(portal.patientProfiles[0]?.id || null);

  const activePatient = portal.patientsById[activePatientId];
  const timeline = portal.getPatientTimeline(activePatientId);
  const report = portal.getPatientDailyReport(activePatientId);
  const updates = portal.getPatientFamilyUpdates(activePatientId);
  const coordination = portal.getPatientCoordination(activePatientId);
  const insuranceCase = portal.getPatientInsuranceCase(activePatientId);

  const handleAction = (title, description) => toast({ title, description });

  return (
    <>
      <Helmet>
        <title>Healthcare CRM Portal - InstantCare</title>
        <meta name="description" content="Backend-ready healthcare CRM portal for patient profiles, timelines, daily reports, family updates, hospital coordination and insurance workflows." />
      </Helmet>
      <Navbar />
      <PortalShell
        eyebrow="InstantCare Healthcare CRM"
        title="Clinical operations and family coordination"
        description="A separate, reusable CRM architecture for patient intelligence, care updates, hospital coordination and family communication. Existing dashboards remain untouched."
        footerMeta={[
          <div key="backend" className="rounded-[24px] border border-white/70 bg-white/70 px-4 py-4 dark:border-white/10 dark:bg-slate-950/45"><p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Backend readiness</p><p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">Prepared for Supabase data tables</p></div>,
          <div key="owner" className="rounded-[24px] border border-white/70 bg-white/70 px-4 py-4 dark:border-white/10 dark:bg-slate-950/45"><p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Command lead</p><p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{portal.organization.commandLead}</p></div>,
        ]}
      >
        <WidgetGrid widgets={portal.dashboardWidgets} formatCurrency={portal.formatCurrency} />

        <GlassPanel>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Patient Selector</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Reusable patient context</h2>
            </div>
            <PatientSwitcher patients={portal.patientProfiles} activePatientId={activePatientId} onChange={setActivePatientId} />
          </div>
        </GlassPanel>

        <Tabs defaultValue="profile" className="space-y-6">
          <div className="overflow-x-auto pb-1">
            <TabsList className="h-auto min-w-max gap-2 rounded-full bg-white/70 p-2 backdrop-blur dark:bg-slate-900/60">
              {crmTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.key} value={tab.key} className="rounded-full px-4 py-2.5 data-[state=active]:bg-slate-950 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-950">
                    <Icon className="mr-2 h-4 w-4" /> {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <TabsContent value="profile">
            <PatientProfileSection patient={activePatient} />
          </TabsContent>
          <TabsContent value="timeline">
            <TimelineSection events={timeline} />
          </TabsContent>
          <TabsContent value="daily-report">
            <DailyCareReportSection report={report} />
          </TabsContent>
          <TabsContent value="family-updates">
            <FamilyUpdatesSection updates={updates} />
          </TabsContent>
          <TabsContent value="coordination">
            <HospitalCoordinationSection coordination={coordination} />
          </TabsContent>
          <TabsContent value="insurance">
            <InsuranceSection insuranceCase={insuranceCase} />
          </TabsContent>
        </Tabs>

        <GlassPanel>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Supabase Preparation</p>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">Each module is separated by domain object: patient profile, timeline event, daily care report, family update, hospital coordination, insurance case and widgets.</p>
            </div>
            <Button type="button" variant="outline" className="rounded-full" onClick={() => handleAction('Schema adapter ready', 'This UI is prepared for Supabase tables and edge functions without changing presentation components.')}>Review Data Contract</Button>
          </div>
        </GlassPanel>
      </PortalShell>
      <Footer />
    </>
  );
};

export default HealthcareCrmPortalPage;