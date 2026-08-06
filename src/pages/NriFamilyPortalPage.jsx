import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { HeartPulse, Mail, PhoneCall } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { buildHealthcarePortalViewModel, getHealthcarePortalData } from '@/data/healthcarePortalData';
import {
  GlassPanel,
  NriDashboardSection,
  PatientSwitcher,
  PortalShell,
} from '@/components/portal/HealthcarePortalSections';

const NriFamilyPortalPage = () => {
  const { toast } = useToast();
  const portal = useMemo(() => buildHealthcarePortalViewModel(getHealthcarePortalData()), []);
  const [activePatientId, setActivePatientId] = useState(portal.nriDashboard.liveTimelinePatientId);

  const patient = portal.patientsById[activePatientId];
  const timeline = portal.getPatientTimeline(activePatientId);
  const updates = portal.getPatientFamilyUpdates(activePatientId);

  const handleAction = (title, description) => toast({ title, description });

  return (
    <>
      <Helmet>
        <title>NRI Family Portal - InstantCare</title>
        <meta name="description" content="Premium NRI family portal for health score, live updates, visits, reports, payments, emergency access and care advisor support." />
      </Helmet>
      <Navbar />
      <PortalShell
        eyebrow="InstantCare NRI Family Portal"
        title="Live care visibility for families abroad"
        description="A premium family portal for staying updated on care, visits, reports, payments and support from abroad."
        footerMeta={[
          <div key="advisor" className="rounded-[24px] border border-white/70 bg-white/70 px-4 py-4 dark:border-white/10 dark:bg-slate-950/45"><p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Healthcare advisor</p><p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{portal.nriDashboard.healthcareAdvisor.name}</p></div>,
          <div key="support" className="rounded-[24px] border border-white/70 bg-white/70 px-4 py-4 dark:border-white/10 dark:bg-slate-950/45"><p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Support desk</p><p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{portal.organization.supportEmail}</p></div>,
        ]}
      >
        <GlassPanel>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Family Context</p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Track a loved one in one place</h2>
            </div>
            <PatientSwitcher patients={portal.patientProfiles} activePatientId={activePatientId} onChange={setActivePatientId} />
          </div>
        </GlassPanel>

        <NriDashboardSection portal={portal} patient={patient} events={timeline} updates={updates} onAction={handleAction} />

        <GlassPanel>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white"><HeartPulse className="h-4 w-4" /> Emergency Contact</div>
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">{portal.nriDashboard.emergencyContact.name}</p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">{portal.nriDashboard.emergencyContact.phone}</p>
            </div>
            <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white"><Mail className="h-4 w-4" /> Daily Family Reach</div>
              <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">Receive updates by WhatsApp, email, video call, voice note and PDF reports.</p>
            </div>
            <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white"><PhoneCall className="h-4 w-4" /> Family Support</div>
              <Button type="button" variant="outline" className="mt-3 rounded-full" onClick={() => handleAction('Support contact', 'Use this area to request a callback or family support update.')}>Request Call Back</Button>
            </div>
          </div>
        </GlassPanel>
      </PortalShell>
      <Footer />
    </>
  );
};

export default NriFamilyPortalPage;