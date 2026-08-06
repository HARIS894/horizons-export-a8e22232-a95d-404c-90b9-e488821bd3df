import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  Droplets,
  FileHeart,
  HeartPulse,
  Mail,
  MoonStar,
  PhoneCall,
  Pill,
  ShieldCheck,
  Sparkles,
  Users,
  Video,
  Wallet,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

const toneClasses = {
  cyan: 'from-cyan-500/20 to-sky-500/10 text-cyan-950 ring-cyan-500/20 dark:text-cyan-100',
  violet: 'from-violet-500/20 to-fuchsia-500/10 text-violet-950 ring-violet-500/20 dark:text-violet-100',
  amber: 'from-amber-500/20 to-orange-500/10 text-amber-950 ring-amber-500/20 dark:text-amber-100',
  sky: 'from-sky-500/20 to-blue-500/10 text-sky-950 ring-sky-500/20 dark:text-sky-100',
  emerald: 'from-emerald-500/20 to-teal-500/10 text-emerald-950 ring-emerald-500/20 dark:text-emerald-100',
  rose: 'from-rose-500/20 to-pink-500/10 text-rose-950 ring-rose-500/20 dark:text-rose-100',
};

const timelineTone = {
  Admission: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-200',
  'Doctor Visit': 'bg-violet-500/15 text-violet-700 dark:text-violet-200',
  'Hospital Transfer': 'bg-sky-500/15 text-sky-700 dark:text-sky-200',
  'Nurse Visit': 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200',
  'Medicine Given': 'bg-amber-500/15 text-amber-700 dark:text-amber-200',
  'Vitals Updated': 'bg-blue-500/15 text-blue-700 dark:text-blue-200',
  Physiotherapy: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-200',
  'Lab Reports': 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-200',
  Billing: 'bg-slate-500/15 text-slate-700 dark:text-slate-200',
  Insurance: 'bg-teal-500/15 text-teal-700 dark:text-teal-200',
  Discharge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200',
  'Home Visit': 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-200',
  Emergency: 'bg-rose-500/15 text-rose-700 dark:text-rose-200',
};

const reportMetricIcons = {
  temperature: Activity,
  bp: HeartPulse,
  sugar: Droplets,
  pulse: HeartPulse,
  oxygen: ShieldCheck,
  weight: Activity,
  food: Sparkles,
  waterIntake: Droplets,
  medicine: Pill,
  exercise: Activity,
  sleep: MoonStar,
  painScale: AlertTriangle,
  mood: Sparkles,
};

const initials = (name) => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

const GlassPanel = ({ className, children }) => (
  <div className={cn('rounded-[28px] border border-white/60 bg-white/65 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/55 dark:shadow-[0_20px_80px_rgba(2,6,23,0.5)]', className)}>
    {children}
  </div>
);

const SectionHeader = ({ eyebrow, title, description, action }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">{eyebrow}</p> : null}
      <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">{title}</h2>
      {description ? <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">{description}</p> : null}
    </div>
    {action}
  </div>
);

const StatusBadge = ({ value, className }) => (
  <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', timelineTone[value] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200', className)}>{value}</span>
);

const WidgetGrid = ({ widgets, formatCurrency }) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
    {widgets.map((widget) => (
      <motion.div key={widget.key} whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
        <GlassPanel className={cn('bg-gradient-to-br ring-1', toneClasses[widget.tone])}>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{widget.label}</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950 dark:text-white">{widget.key === 'revenue' ? formatCurrency(widget.value) : widget.key === 'staffAvailability' ? `${widget.value}%` : widget.value}</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{widget.trend}</p>
        </GlassPanel>
      </motion.div>
    ))}
  </div>
);

const PatientSwitcher = ({ patients, activePatientId, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {patients.map((patient) => (
      <button key={patient.id} type="button" onClick={() => onChange(patient.id)} className={cn('rounded-full px-4 py-2 text-sm font-semibold transition', activePatientId === patient.id ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-white/70 text-slate-700 ring-1 ring-slate-200 hover:bg-white dark:bg-slate-950/40 dark:text-slate-200 dark:ring-slate-800')}>
        {patient.personalDetails.fullName}
      </button>
    ))}
  </div>
);

const PatientProfileSection = ({ patient }) => (
  <div className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
    <GlassPanel>
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 border border-white/70 shadow-sm">
          <AvatarFallback>{initials(patient.personalDetails.fullName)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-2xl font-semibold text-slate-950 dark:text-white">{patient.personalDetails.fullName}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{patient.personalDetails.age} years • {patient.personalDetails.gender} • {patient.personalDetails.city}</p>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{patient.status}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 text-sm text-slate-700 dark:text-slate-200">
        <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Personal Details</p>
          <p className="mt-3">Blood Group: {patient.personalDetails.bloodGroup}</p>
          <p>DOB: {patient.personalDetails.dob}</p>
          <p>Phone: {patient.personalDetails.phone}</p>
          <p>Address: {patient.personalDetails.address}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Emergency Contact</p>
          <p className="mt-3">{patient.emergencyContact.name} • {patient.emergencyContact.relationship}</p>
          <p>{patient.emergencyContact.phone}</p>
          <p>{patient.emergencyContact.country}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Assigned Team</p>
          <p className="mt-3">Doctor: {patient.doctor.name}</p>
          <p>Coordinator: {patient.healthcareCoordinator.name}</p>
          <p>Nurse: {patient.assignedNurse.name}</p>
          <p>Caregiver: {patient.assignedCaregiver.name}</p>
          <p>Driver: {patient.assignedDriver.name}</p>
        </div>
      </div>
    </GlassPanel>

    <div className="space-y-6">
      <GlassPanel>
        <SectionHeader eyebrow="Clinical Snapshot" title="History, insurance and hospital mapping" />
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="font-semibold text-slate-950 dark:text-white">Medical History</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {patient.medicalHistory.map((item) => <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">{item}</span>)}
            </div>
            <p className="mt-4 font-semibold text-slate-950 dark:text-white">Allergies</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {patient.allergies.map((item) => <span key={item} className="rounded-full bg-rose-100 px-3 py-1 text-xs text-rose-700 dark:bg-rose-500/12 dark:text-rose-200">{item}</span>)}
            </div>
          </div>
          <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40 text-sm text-slate-700 dark:text-slate-200">
            <p className="font-semibold text-slate-950 dark:text-white">Insurance</p>
            <p className="mt-3">Provider: {patient.insurance.provider}</p>
            <p>Policy: {patient.insurance.policyNumber}</p>
            <p>Coverage: {patient.insurance.coverageType}</p>
            <p>Status: {patient.insurance.claimStatus}</p>
            <p className="mt-4 font-semibold text-slate-950 dark:text-white">Hospital</p>
            <p className="mt-3">{patient.hospital.name}</p>
            <p>{patient.hospital.department}</p>
            <p>{patient.hospital.room}</p>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel>
        <SectionHeader eyebrow="Documents" title="Reports, photos, consent forms and family members" />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="font-semibold text-slate-950 dark:text-white">Medical Reports</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
              {patient.medicalReports.map((item) => <p key={item}>{item}</p>)}
            </div>
            <p className="mt-4 font-semibold text-slate-950 dark:text-white">Photos</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
              {patient.photos.map((item) => <p key={item}>{item}</p>)}
            </div>
            <p className="mt-4 font-semibold text-slate-950 dark:text-white">Consent Forms</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
              {patient.consentForms.map((item) => <p key={item}>{item}</p>)}
            </div>
          </div>
          <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="font-semibold text-slate-950 dark:text-white">Family Members</p>
            <div className="mt-3 space-y-3">
              {patient.familyMembers.map((member) => (
                <div key={`${member.name}-${member.relationship}`} className="rounded-2xl bg-slate-100/70 p-3 text-sm text-slate-700 dark:bg-slate-800/60 dark:text-slate-200">
                  <p className="font-medium">{member.name}</p>
                  <p>{member.relationship} • {member.location}</p>
                  <p>Preferred channel: {member.preferredChannel}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  </div>
);

const TimelineSection = ({ events, title = 'Patient Timeline', description = 'Everything from admission to emergency events is captured in one chronological view.' }) => (
  <GlassPanel>
    <SectionHeader eyebrow="Timeline" title={title} description={description} />
    <div className="mt-6 space-y-4">
      {events.map((event) => (
        <div key={event.id} className="relative rounded-[24px] border border-slate-200/70 bg-white/70 p-5 pl-6 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="absolute left-3 top-7 h-3 w-3 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" />
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge value={event.type} />
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">{new Date(event.time).toLocaleString()}</p>
              </div>
              <p className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">{event.title}</p>
              <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{event.summary}</p>
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{event.owner}</p>
          </div>
        </div>
      ))}
    </div>
  </GlassPanel>
);

const DailyCareReportSection = ({ report }) => {
  const metricEntries = [
    ['temperature', report.temperature],
    ['bp', report.bp],
    ['sugar', report.sugar],
    ['pulse', report.pulse],
    ['oxygen', report.oxygen],
    ['weight', report.weight],
    ['food', report.food],
    ['waterIntake', report.waterIntake],
    ['medicine', report.medicine],
    ['exercise', report.exercise],
    ['sleep', report.sleep],
    ['painScale', report.painScale],
    ['mood', report.mood],
  ];

  return (
    <GlassPanel>
      <SectionHeader eyebrow="Daily Care Report" title={`Care metrics for ${report.date}`} description="View vitals, intake, medicines, exercise, sleep and symptom notes in one daily summary." />
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metricEntries.map(([key, value]) => {
          const Icon = reportMetricIcons[key] || Activity;
          return (
            <div key={key} className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-950 p-2.5 text-white dark:bg-white dark:text-slate-950">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">{key}</p>
                  <p className="mt-1 text-sm font-medium text-slate-900 dark:text-white">{value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <p className="font-semibold text-slate-950 dark:text-white">Notes</p>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{report.notes}</p>
        </div>
        <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <p className="font-semibold text-slate-950 dark:text-white">Media Uploads</p>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">Images: {report.images.join(', ')}</p>
          <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">Videos: {report.videos.join(', ')}</p>
        </div>
      </div>
    </GlassPanel>
  );
};

const FamilyUpdatesSection = ({ updates }) => (
  <GlassPanel>
    <SectionHeader eyebrow="Family Updates" title="WhatsApp, email, voice, video and PDF summaries" description="Keep family members informed with clear updates across every communication channel." />
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      {updates.map((update) => (
        <div key={update.id} className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-950 dark:text-white">{update.title}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{update.recipient} • {new Date(update.sentAt).toLocaleString()}</p>
            </div>
            <StatusBadge value={update.channel} className="bg-slate-900/10 text-slate-700 dark:bg-white/10 dark:text-slate-200" />
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{update.content}</p>
        </div>
      ))}
    </div>
  </GlassPanel>
);

const HospitalCoordinationSection = ({ coordination }) => (
  <GlassPanel>
    <SectionHeader eyebrow="Hospital Coordination" title="Admission, discharge, TPA and room logistics" description="Track admission, discharge, insurance and room arrangements in one place." />
    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3 text-sm text-slate-700 dark:text-slate-200">
      {Object.entries({
        Admission: coordination.admission,
        Discharge: coordination.discharge,
        TPA: coordination.tpa,
        Insurance: coordination.insurance,
        Cashless: coordination.cashless,
        Billing: coordination.billing,
        Doctor: coordination.doctor,
        Room: coordination.room,
      }).map(([key, value]) => (
        <div key={key} className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">{key}</p>
          <p className="mt-3 font-medium text-slate-900 dark:text-white">{value}</p>
        </div>
      ))}
    </div>
    <div className="mt-6 rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
      <p className="font-semibold text-slate-950 dark:text-white">Reports</p>
      <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
        {coordination.reports.map((item) => <p key={item}>{item}</p>)}
      </div>
    </div>
  </GlassPanel>
);

const InsuranceSection = ({ insuranceCase }) => (
  <GlassPanel>
    <SectionHeader eyebrow="Insurance" title="Policy, claim and documents" description="Review policy, claim and document details for cashless and reimbursement support." />
    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3 text-sm text-slate-700 dark:text-slate-200">
      <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40"><p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Policy</p><p className="mt-3 font-medium text-slate-900 dark:text-white">{insuranceCase.policy}</p></div>
      <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40"><p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Claim</p><p className="mt-3 font-medium text-slate-900 dark:text-white">{insuranceCase.claim}</p></div>
      <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40"><p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Cashless</p><p className="mt-3 font-medium text-slate-900 dark:text-white">{insuranceCase.cashless}</p></div>
      <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40"><p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Approval</p><p className="mt-3 font-medium text-slate-900 dark:text-white">{insuranceCase.approval}</p></div>
      <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40"><p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Reimbursement</p><p className="mt-3 font-medium text-slate-900 dark:text-white">{insuranceCase.reimbursement}</p></div>
      <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40"><p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Documents</p><p className="mt-3 font-medium text-slate-900 dark:text-white">{insuranceCase.documents.join(', ')}</p></div>
    </div>
  </GlassPanel>
);

const NriDashboardSection = ({ portal, patient, events, updates, onAction }) => (
  <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <GlassPanel className="bg-gradient-to-br from-cyan-500/20 to-sky-500/10 ring-1 ring-cyan-500/20"><p className="text-sm text-slate-600 dark:text-slate-300">Parents Health Score</p><p className="mt-3 text-4xl font-semibold text-slate-950 dark:text-white">{portal.nriDashboard.parentsHealthScore}</p></GlassPanel>
      <GlassPanel className="bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 ring-1 ring-violet-500/20"><p className="text-sm text-slate-600 dark:text-slate-300">Upcoming Doctor Visit</p><p className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">{portal.nriDashboard.upcomingDoctorVisit}</p></GlassPanel>
      <GlassPanel className="bg-gradient-to-br from-emerald-500/20 to-teal-500/10 ring-1 ring-emerald-500/20"><p className="text-sm text-slate-600 dark:text-slate-300">Upcoming Nurse Visit</p><p className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">{portal.nriDashboard.upcomingNurseVisit}</p></GlassPanel>
      <GlassPanel className="bg-gradient-to-br from-amber-500/20 to-orange-500/10 ring-1 ring-amber-500/20"><p className="text-sm text-slate-600 dark:text-slate-300">Emergency Contact</p><p className="mt-3 text-lg font-semibold text-slate-950 dark:text-white">{portal.nriDashboard.emergencyContact.phone}</p></GlassPanel>
    </div>

    <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
      <GlassPanel>
        <SectionHeader eyebrow="NRI Dashboard" title="Family-facing live care visibility" description="This portal is shaped for long-distance family members to track health, visits, reports and payments without accessing internal CRM controls." />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="font-semibold text-slate-950 dark:text-white">Today's Update</p>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{portal.nriDashboard.todaysUpdate}</p>
            <p className="mt-4 text-sm font-medium text-slate-900 dark:text-white">Healthcare Advisor</p>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{portal.nriDashboard.healthcareAdvisor.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{portal.nriDashboard.healthcareAdvisor.designation}</p>
            <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{portal.nriDashboard.healthcareAdvisor.availability}</p>
          </div>
          <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="font-semibold text-slate-950 dark:text-white">Upcoming Payments</p>
            <div className="mt-3 space-y-3 text-sm text-slate-700 dark:text-slate-200">
              {portal.nriDashboard.upcomingPayments.map((payment) => (
                <div key={`${payment.label}-${payment.dueDate}`} className="rounded-2xl bg-slate-100/70 p-3 dark:bg-slate-800/60">
                  <p className="font-medium">{payment.label}</p>
                  <p>{portal.formatCurrency(payment.amount)} • Due {payment.dueDate}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button type="button" className="rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950" onClick={() => onAction('Video call launcher ready', portal.nriDashboard.videoCall.status)}><Video className="mr-2 h-4 w-4" /> One Click Video Call</Button>
          <Button type="button" variant="outline" className="rounded-full" onClick={() => onAction('Advisor escalation ready', `${portal.nriDashboard.healthcareAdvisor.name} can be wired to live consultations later.`)}><PhoneCall className="mr-2 h-4 w-4" /> Healthcare Advisor</Button>
        </div>
      </GlassPanel>

      <GlassPanel>
        <SectionHeader eyebrow="Family Records" title="Reports, invoices and live care feed" />
        <div className="mt-6 grid gap-4">
          <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="font-semibold text-slate-950 dark:text-white">Reports</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">{portal.nriDashboard.reports.map((item) => <p key={item}>{item}</p>)}</div>
          </div>
          <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="font-semibold text-slate-950 dark:text-white">Invoices</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">{portal.nriDashboard.invoices.map((item) => <p key={item}>{item}</p>)}</div>
          </div>
          <div className="rounded-[22px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="font-semibold text-slate-950 dark:text-white">Primary Family Contact</p>
            <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">{patient.emergencyContact.name} • {patient.emergencyContact.phone}</p>
          </div>
        </div>
      </GlassPanel>
    </div>

    <TimelineSection events={events} title="Live Timeline" description="Families can follow doctor visits, medicines, reports and emergencies in near real time once backend events are connected." />
    <FamilyUpdatesSection updates={updates} />
  </div>
);

const PortalShell = ({ eyebrow, title, description, children, footerMeta }) => (
  <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.16),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(139,92,246,0.18),_transparent_24%),linear-gradient(180deg,_#eef8ff_0%,_#f8fafc_48%,_#ffffff_100%)] px-4 pb-16 pt-24 dark:bg-[linear-gradient(180deg,_#020617_0%,_#0f172a_45%,_#111827_100%)] sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl space-y-6">
      <GlassPanel className="overflow-hidden p-0">
        <div className="relative overflow-hidden rounded-[28px] border border-white/60 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.22),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(167,139,250,0.22),_transparent_24%),linear-gradient(135deg,_rgba(255,255,255,0.84),_rgba(255,255,255,0.58))] p-6 dark:border-white/10 dark:bg-[linear-gradient(135deg,_rgba(15,23,42,0.85),_rgba(15,23,42,0.64))] sm:p-8">
          <div className="absolute -left-8 top-0 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl" />
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-violet-400/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-semibold uppercase tracking-[0.38em] text-slate-500 dark:text-slate-400">{eyebrow}</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-5xl">{title}</h1>
              <p className="mt-4 text-base leading-8 text-slate-600 dark:text-slate-300">{description}</p>
            </div>
            {footerMeta ? <div className="grid gap-3 sm:grid-cols-2">{footerMeta}</div> : null}
          </div>
        </div>
      </GlassPanel>
      {children}
    </div>
  </div>
);

export {
  DailyCareReportSection,
  FamilyUpdatesSection,
  GlassPanel,
  HospitalCoordinationSection,
  InsuranceSection,
  NriDashboardSection,
  PatientProfileSection,
  PatientSwitcher,
  PortalShell,
  SectionHeader,
  StatusBadge,
  TimelineSection,
  WidgetGrid,
};