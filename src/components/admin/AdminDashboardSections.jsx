import React from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  BellRing,
  BriefcaseMedical,
  Building2,
  CalendarDays,
  ChevronRight,
  Globe2,
  HeartPulse,
  Hospital,
  MessageSquareMore,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  Users2,
  WalletCards,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

const toneClasses = {
  cyan: 'from-cyan-500/20 to-sky-500/10 text-cyan-950 ring-cyan-500/20 dark:text-cyan-100',
  violet: 'from-violet-500/20 to-fuchsia-500/10 text-violet-950 ring-violet-500/20 dark:text-violet-100',
  amber: 'from-amber-500/20 to-orange-500/10 text-amber-950 ring-amber-500/20 dark:text-amber-100',
  sky: 'from-sky-500/20 to-blue-500/10 text-sky-950 ring-sky-500/20 dark:text-sky-100',
  emerald: 'from-emerald-500/20 to-teal-500/10 text-emerald-950 ring-emerald-500/20 dark:text-emerald-100',
  rose: 'from-rose-500/20 to-pink-500/10 text-rose-950 ring-rose-500/20 dark:text-rose-100',
};

const statusClasses = {
  New: 'bg-sky-500/15 text-sky-700 dark:text-sky-200',
  Contacted: 'bg-violet-500/15 text-violet-700 dark:text-violet-200',
  'Follow Up': 'bg-amber-500/15 text-amber-700 dark:text-amber-200',
  Converted: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200',
  Closed: 'bg-slate-500/15 text-slate-700 dark:text-slate-200',
  Scheduled: 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-200',
  Reschedule: 'bg-orange-500/15 text-orange-700 dark:text-orange-200',
  Cancel: 'bg-rose-500/15 text-rose-700 dark:text-rose-200',
  Paid: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200',
  Pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-200',
  Refund: 'bg-fuchsia-500/15 text-fuchsia-700 dark:text-fuchsia-200',
  High: 'bg-rose-500/15 text-rose-700 dark:text-rose-200',
  Critical: 'bg-rose-600/15 text-rose-700 dark:text-rose-200',
  Medium: 'bg-amber-500/15 text-amber-700 dark:text-amber-200',
  Low: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200',
};

const iconMap = {
  totalPatients: Users2,
  activeServices: BriefcaseMedical,
  pendingEnquiries: BellRing,
  todaysVisits: CalendarDays,
  revenue: WalletCards,
  emergencyCases: HeartPulse,
};

const initials = (name) => name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();

const GlassPanel = ({ className, children }) => (
  <div className={cn('rounded-[28px] border border-white/60 bg-white/65 p-5 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/55 dark:shadow-[0_20px_80px_rgba(2,6,23,0.5)]', className)}>
    {children}
  </div>
);

const PanelHeader = ({ eyebrow, title, description, action }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
    <div>
      {eyebrow ? <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">{eyebrow}</p> : null}
      <h2 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{title}</h2>
      {description ? <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">{description}</p> : null}
    </div>
    {action}
  </div>
);

const StatusBadge = ({ value, className }) => (
  <span className={cn('inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold', statusClasses[value] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200', className)}>
    {value}
  </span>
);

const MetricCard = ({ metric }) => {
  const Icon = iconMap[metric.key] || Activity;
  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <GlassPanel className={cn('relative overflow-hidden bg-gradient-to-br ring-1', toneClasses[metric.tone])}>
        <div className="absolute inset-x-0 top-0 h-px bg-white/70 dark:bg-white/10" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{metric.label}</p>
            <p className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">{metric.value}</p>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{metric.detail}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/75 text-slate-900 shadow-sm dark:bg-slate-950/60 dark:text-white">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-950/50 dark:text-slate-200">
          <Sparkles className="h-3.5 w-3.5" /> {metric.trend}
        </p>
      </GlassPanel>
    </motion.div>
  );
};

const LineChart = ({ data, metricKey, stroke }) => {
  const values = data.map((item) => item[metricKey]);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values.map((value, index) => {
    const x = (index / Math.max(values.length - 1, 1)) * 100;
    const y = 84 - (((value - min) / Math.max(max - min, 1)) * 64 + 8);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 100 90" className="h-52 w-full overflow-visible">
      <defs>
        <linearGradient id={`area-${metricKey}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={`M 0 90 L ${points.replaceAll(' ', ' L ')} L 100 90 Z`} fill={`url(#area-${metricKey})`} />
      <polyline fill="none" stroke={stroke} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" points={points} />
      {data.map((item, index) => {
        const [x, y] = points.split(' ')[index].split(',');
        return <circle key={`${metricKey}-${item.label}`} cx={x} cy={y} r="2.5" fill={stroke} />;
      })}
    </svg>
  );
};

const OverviewSection = ({ dashboard, onAction }) => (
  <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {dashboard.overviewMetrics.map((metric) => <MetricCard key={metric.key} metric={metric} />)}
    </div>

    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
      <GlassPanel className="p-6">
        <PanelHeader
          eyebrow="Operations Pulse"
          title="Care demand and revenue trend"
          description="A live overview of care demand, revenue trends and coordination activity."
          action={<Button type="button" variant="outline" className="rounded-full border-white/60 bg-white/60 dark:border-white/10 dark:bg-slate-950/40" onClick={() => onAction('Export options', 'Snapshot export options will appear here.')}>Export Snapshot</Button>}
        />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <LineChart data={dashboard.performanceSeries} metricKey="revenue" stroke="#14b8a6" />
            <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-slate-500 dark:text-slate-400">
              {dashboard.performanceSeries.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200/70 bg-white/60 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/40">
                  <p className="font-semibold text-slate-900 dark:text-white">{item.label}</p>
                  <p>{dashboard.formatCurrency(item.revenue)}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <GlassPanel className="bg-slate-950/95 text-white dark:bg-slate-950/70">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Control Tower</p>
              <p className="mt-4 text-2xl font-semibold">{dashboard.organization.responsePromise}</p>
              <p className="mt-2 text-sm text-slate-300">Coordinator on duty: {dashboard.organization.coordinatorOnDuty}</p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-slate-300">Continuity Score</p>
                  <p className="mt-2 text-xl font-semibold">{dashboard.organization.careContinuityScore}%</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs text-slate-300">Timezone</p>
                  <p className="mt-2 text-xl font-semibold">{dashboard.organization.timezone}</p>
                </div>
              </div>
            </GlassPanel>
            <GlassPanel>
              <p className="text-sm font-semibold text-slate-950 dark:text-white">Enquiry pipeline</p>
              <div className="mt-4 space-y-4">
                {dashboard.enquirySummary.map((item) => (
                  <div key={item.status}>
                    <div className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-200">
                      <span>{item.status}</span>
                      <span className="font-semibold">{item.count}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
                      <div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" style={{ width: `${Math.max((item.count / Math.max(dashboard.enquiries.length, 1)) * 100, 12)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel className="p-6">
        <PanelHeader eyebrow="High Touch Cases" title="Priority patient spotlight" description="Critical care and recovery cases with clear ownership across nursing, doctor review and coordination." />
        <div className="mt-6 space-y-4">
          {dashboard.patients.map((patient) => (
            <div key={patient.id} className="rounded-[24px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border border-white/70 shadow-sm">
                    <AvatarFallback>{initials(patient.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">{patient.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{patient.serviceLine}</p>
                  </div>
                </div>
                <StatusBadge value={patient.riskLevel} />
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">{patient.condition}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">Nurse: {patient.assignedNurse}</span>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">Doctor: {patient.assignedDoctor}</span>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  </div>
);

const PatientsSection = ({ patients, activePatientId, onPatientChange }) => {
  const activePatient = patients.find((patient) => patient.id === activePatientId) || patients[0];
  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <GlassPanel>
        <PanelHeader eyebrow="Patient Management" title="Profiles and care ownership" description="Profiles include medical history, reports, care plans and assigned teams." />
        <div className="mt-6 space-y-3">
          {patients.map((patient) => (
            <button key={patient.id} type="button" onClick={() => onPatientChange(patient.id)} className={cn('w-full rounded-[22px] border px-4 py-4 text-left transition', activePatient.id === patient.id ? 'border-slate-900 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950' : 'border-slate-200/80 bg-white/70 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/30')}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{patient.name}</p>
                  <p className={cn('text-sm', activePatient.id === patient.id ? 'text-white/70 dark:text-slate-600' : 'text-slate-500 dark:text-slate-400')}>{patient.serviceLine}</p>
                </div>
                <ChevronRight className="h-4 w-4" />
              </div>
            </button>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950 dark:text-white">{activePatient.name}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{activePatient.age} years, {activePatient.gender}, {activePatient.city}</p>
          </div>
          <StatusBadge value={activePatient.riskLevel} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Medical History</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {activePatient.medicalHistory.map((item) => <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">{item}</span>)}
            </div>
          </div>
          <div className="rounded-[24px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Assigned Team</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
              <p>Nurse: {activePatient.assignedNurse}</p>
              <p>Doctor: {activePatient.assignedDoctor}</p>
              <p>Coordinator: {activePatient.assignedCoordinator}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Reports</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
              {activePatient.reports.map((report) => <p key={report}>{report}</p>)}
            </div>
          </div>
          <div className="rounded-[24px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Care Plan</p>
            <div className="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
              {activePatient.carePlan.map((item) => <p key={item}>{item}</p>)}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[24px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Daily Updates</p>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-200">
              {activePatient.dailyUpdates.map((item) => <p key={item}>{item}</p>)}
            </div>
          </div>
          <div className="rounded-[24px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Timeline</p>
            <div className="mt-3 h-64 space-y-4 overflow-y-auto pr-4">
              {activePatient.timeline.map((item) => (
                <div key={`${item.date}-${item.title}`} className="relative pl-6">
                  <div className="absolute left-0 top-2 h-3 w-3 rounded-full bg-gradient-to-r from-cyan-500 to-violet-500" />
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">{item.date}</p>
                  <p className="mt-1 font-medium text-slate-900 dark:text-white">{item.title}</p>
                  <p className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-300">{item.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
};

const EnquiriesSection = ({ dashboard, activeStage, onStageChange, onAction }) => {
  const filtered = activeStage === 'All' ? dashboard.enquiries : dashboard.enquiries.filter((item) => item.status === activeStage);
  return (
    <GlassPanel className="space-y-6">
      <PanelHeader eyebrow="Enquiry Management" title="Pipeline visibility with conversion stages" description="Track enquiries through each follow-up stage: New, Contacted, Follow Up, Converted and Closed." />
      <div className="flex flex-wrap gap-2">
        {['All', ...dashboard.enquiryStages].map((stage) => (
          <button key={stage} type="button" onClick={() => onStageChange(stage)} className={cn('rounded-full px-4 py-2 text-sm font-semibold transition', activeStage === stage ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-white/70 text-slate-700 ring-1 ring-slate-200 hover:bg-white dark:bg-slate-950/40 dark:text-slate-200 dark:ring-slate-800')}>
            {stage}
          </button>
        ))}
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-slate-200/70 dark:border-slate-800">
            <TableHead>Enquiry</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Service</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Next Step</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((item) => (
            <TableRow key={item.id} className="border-slate-200/70 dark:border-slate-800">
              <TableCell>
                <p className="font-semibold text-slate-950 dark:text-white">{item.id}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(item.createdAt).toLocaleString()}</p>
              </TableCell>
              <TableCell>
                <p className="font-medium text-slate-900 dark:text-white">{item.patientName}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{item.city}</p>
              </TableCell>
              <TableCell className="text-slate-700 dark:text-slate-200">{item.serviceRequired}</TableCell>
              <TableCell><StatusBadge value={item.status} /></TableCell>
              <TableCell><StatusBadge value={item.priority} /></TableCell>
              <TableCell className="text-slate-700 dark:text-slate-200">{item.nextStep}</TableCell>
              <TableCell className="text-right">
                <Button type="button" variant="ghost" className="rounded-full" onClick={() => onAction('Enquiry detail ready', `${item.patientName} is in ${item.status} stage with next step: ${item.nextStep}`)}>Open</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </GlassPanel>
  );
};

const StaffSection = ({ dashboard, activeRole, onRoleChange }) => {
  const roster = activeRole === 'All' ? dashboard.staff : dashboard.staff.filter((member) => member.role === activeRole);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {dashboard.staffSummary.map((item) => (
          <GlassPanel key={item.role} className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{item.role}s</p>
              <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{item.count}</p>
            </div>
            <div className="rounded-2xl bg-slate-950/90 p-3 text-white dark:bg-white dark:text-slate-950">
              <UserRound className="h-5 w-5" />
            </div>
          </GlassPanel>
        ))}
      </div>
      <GlassPanel className="space-y-6">
        <PanelHeader eyebrow="Staff Management" title="Role-based roster and profile depth" description="View roster details for nurses, doctors, physiotherapists, caregivers, coordinators and drivers." />
        <div className="flex flex-wrap gap-2">
          {['All', ...dashboard.staffRoles].map((role) => (
            <button key={role} type="button" onClick={() => onRoleChange(role)} className={cn('rounded-full px-4 py-2 text-sm font-semibold transition', activeRole === role ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950' : 'bg-white/70 text-slate-700 ring-1 ring-slate-200 hover:bg-white dark:bg-slate-950/40 dark:text-slate-200 dark:ring-slate-800')}>
              {role}
            </button>
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {roster.map((member) => (
            <div key={member.id} className="rounded-[24px] border border-slate-200/70 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-950/40">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border border-white/70 shadow-sm">
                    <AvatarFallback>{initials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-slate-950 dark:text-white">{member.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{member.role} • {member.city}</p>
                  </div>
                </div>
                <StatusBadge value={member.availability} className="bg-emerald-500/12 text-emerald-700 dark:text-emerald-200" />
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 text-sm text-slate-700 dark:text-slate-200">
                <p><span className="font-semibold">Experience:</span> {member.experience}</p>
                <p><span className="font-semibold">Rating:</span> {member.rating}/5</p>
                <p className="sm:col-span-2"><span className="font-semibold">Languages:</span> {member.languages.join(', ')}</p>
                <p className="sm:col-span-2"><span className="font-semibold">Skills:</span> {member.skills.join(', ')}</p>
                <p className="sm:col-span-2"><span className="font-semibold">Documents:</span> {member.documents.join(', ')}</p>
                <p className="sm:col-span-2"><span className="font-semibold">Training:</span> {member.training.join(', ')}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
};

const HospitalsSection = ({ hospitals }) => (
  <div className="grid gap-4 xl:grid-cols-3">
    {hospitals.map((hospitalItem) => (
      <GlassPanel key={hospitalItem.id}>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-950 p-3 text-white dark:bg-white dark:text-slate-950">
            <Hospital className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-slate-950 dark:text-white">{hospitalItem.name}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{hospitalItem.city}</p>
          </div>
        </div>
        <div className="mt-5 space-y-4 text-sm text-slate-700 dark:text-slate-200">
          <div>
            <p className="font-semibold text-slate-950 dark:text-white">Departments</p>
            <p className="mt-1 leading-7">{hospitalItem.departments.join(', ')}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-950 dark:text-white">Doctors</p>
            <p className="mt-1 leading-7">{hospitalItem.doctors.join(', ')}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-950 dark:text-white">TPA Supported</p>
            <p className="mt-1 leading-7">{hospitalItem.tpaSupported.join(', ')}</p>
          </div>
        </div>
      </GlassPanel>
    ))}
  </div>
);

const AppointmentsSection = ({ appointments, onAction }) => (
  <GlassPanel>
    <PanelHeader eyebrow="Doctor Appointment" title="Schedule, reschedule, cancel and follow-up" description="Manage scheduling, rescheduling, cancellations and follow-up for doctor visits." />
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="rounded-[24px] border border-slate-200/70 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-950 dark:text-white">{appointment.patientName}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{appointment.doctorName} • {appointment.department}</p>
            </div>
            <StatusBadge value={appointment.status} />
          </div>
          <div className="mt-4 grid gap-2 text-sm text-slate-700 dark:text-slate-200">
            <p>Visit type: {appointment.visitType}</p>
            <p>Scheduled at: {new Date(appointment.scheduledAt).toLocaleString()}</p>
            <p>Follow up required: {appointment.followUpRequired ? 'Yes' : 'No'}</p>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {['Schedule', 'Reschedule', 'Cancel', 'Follow Up'].map((action) => (
              <Button key={action} type="button" variant="outline" className="rounded-full border-white/60 bg-white/70 dark:border-white/10 dark:bg-slate-950/40" onClick={() => onAction(`${action} appointment`, `${action} options for ${appointment.patientName} are available here.`)}>{action}</Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  </GlassPanel>
);

const InsuranceSection = ({ providers }) => (
  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
    {providers.map((provider) => (
      <GlassPanel key={provider.name}>
        <p className="font-semibold text-slate-950 dark:text-white">{provider.name}</p>
        <p className="mt-2 text-sm leading-7 text-slate-600 dark:text-slate-300">{provider.coverage}</p>
        <p className="mt-4 text-2xl font-semibold text-slate-950 dark:text-white">{provider.activeCases}</p>
        <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Active cases</p>
      </GlassPanel>
    ))}
  </div>
);

const BillingSection = ({ dashboard, onAction }) => (
  <div className="space-y-6">
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <GlassPanel><p className="text-sm text-slate-500 dark:text-slate-400">Invoices</p><p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{dashboard.billingSummary.invoices}</p></GlassPanel>
      <GlassPanel><p className="text-sm text-slate-500 dark:text-slate-400">Payments</p><p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{dashboard.formatCurrency(dashboard.billingSummary.paidAmount)}</p></GlassPanel>
      <GlassPanel><p className="text-sm text-slate-500 dark:text-slate-400">Pending Bills</p><p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{dashboard.formatCurrency(dashboard.billingSummary.pendingAmount)}</p></GlassPanel>
      <GlassPanel><p className="text-sm text-slate-500 dark:text-slate-400">Refunds</p><p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{dashboard.formatCurrency(dashboard.billingSummary.refundAmount)}</p></GlassPanel>
    </div>
    <GlassPanel>
      <PanelHeader eyebrow="Billing" title="Invoices, payments, pending bills and refunds" description="Review billing activity, outstanding balances and payment status in one place." />
      <Table>
        <TableHeader>
          <TableRow className="border-slate-200/70 dark:border-slate-800">
            <TableHead>Invoice</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dashboard.billing.invoices.map((invoice) => (
            <TableRow key={invoice.id} className="border-slate-200/70 dark:border-slate-800">
              <TableCell className="font-semibold text-slate-950 dark:text-white">{invoice.id}</TableCell>
              <TableCell className="text-slate-700 dark:text-slate-200">{invoice.patientName}</TableCell>
              <TableCell className="text-slate-700 dark:text-slate-200">{dashboard.formatCurrency(invoice.amount)}</TableCell>
              <TableCell><StatusBadge value={invoice.status} /></TableCell>
              <TableCell className="text-slate-700 dark:text-slate-200">{invoice.dueDate}</TableCell>
              <TableCell className="text-right"><Button type="button" variant="ghost" className="rounded-full" onClick={() => onAction('Invoice details', `Review ${invoice.id} for billing information and status.`)}>Inspect</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </GlassPanel>
  </div>
);

const WhatsAppSection = ({ whatsappCentre, onAction }) => (
  <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
    <GlassPanel>
      <PanelHeader eyebrow="WhatsApp Centre" title="Broadcasts and templates" description="Manage broadcasts, patient updates and family updates from one communication hub." />
      <div className="mt-6 space-y-4">
        {whatsappCentre.broadcasts.map((item) => (
          <div key={item.title} className="rounded-[24px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-950 dark:text-white">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.audience}</p>
              </div>
              <StatusBadge value={item.status} className="bg-cyan-500/15 text-cyan-700 dark:text-cyan-200" />
            </div>
          </div>
        ))}
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="rounded-full" onClick={() => onAction('Broadcast options', 'Use this area to send updates to selected recipients.')}>Broadcast</Button>
          <Button type="button" variant="outline" className="rounded-full" onClick={() => onAction('Message templates', 'Review saved message formats for common updates.')}>Templates</Button>
        </div>
      </div>
    </GlassPanel>
    <GlassPanel>
      <PanelHeader eyebrow="Update Streams" title="Patient and family communication" description="Two distinct update lanes reflect clinical and family-facing messaging needs." />
      <div className="mt-6 grid gap-4">
        <div className="rounded-[24px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <p className="font-semibold text-slate-950 dark:text-white">Patient Updates</p>
          <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-200">
            {whatsappCentre.patientUpdates.map((item) => <p key={item}>{item}</p>)}
          </div>
        </div>
        <div className="rounded-[24px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <p className="font-semibold text-slate-950 dark:text-white">Family Updates</p>
          <div className="mt-3 space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-200">
            {whatsappCentre.familyUpdates.map((item) => <p key={item}>{item}</p>)}
          </div>
        </div>
        <div className="rounded-[24px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <p className="font-semibold text-slate-950 dark:text-white">Templates</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {whatsappCentre.templates.map((item) => <span key={item.name} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">{item.name} • {item.type}</span>)}
          </div>
        </div>
      </div>
    </GlassPanel>
  </div>
);

const ReportsSection = ({ dashboard }) => (
  <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
    <GlassPanel>
      <PanelHeader eyebrow="Reports" title="Daily, weekly, monthly and yearly visibility" description="Track performance across daily, weekly, monthly and yearly reporting periods." />
      <div className="mt-6 grid gap-4">
        <div className="rounded-[24px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Daily</p>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">Adherence {dashboard.reports.daily.adherence}%</p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">Response time {dashboard.reports.daily.responseTimeMinutes} min</p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">Satisfaction {dashboard.reports.daily.satisfaction}/5</p>
        </div>
        <div className="rounded-[24px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Weekly</p>
          <p className="mt-3 text-sm text-slate-700 dark:text-slate-200">New admissions {dashboard.reports.weekly.newAdmissions}</p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">Doctor reviews {dashboard.reports.weekly.doctorReviews}</p>
          <p className="mt-1 text-sm text-slate-700 dark:text-slate-200">Closed enquiries {dashboard.reports.weekly.closedEnquiries}</p>
        </div>
      </div>
    </GlassPanel>
    <GlassPanel>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="text-sm font-semibold text-slate-950 dark:text-white">Monthly Revenue</p>
          <div className="mt-4 h-52 space-y-4">
            {dashboard.reports.monthly.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-sm text-slate-700 dark:text-slate-200">
                  <span>{item.label}</span>
                  <span>{dashboard.formatCurrency(item.revenue)}</span>
                </div>
                <div className="h-3 rounded-full bg-slate-200 dark:bg-slate-800">
                  <div className="h-3 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500" style={{ width: `${(item.revenue / Math.max(...dashboard.reports.monthly.map((entry) => entry.revenue))) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-950 dark:text-white">Yearly Patient Growth</p>
          <div className="mt-4 space-y-4">
            {dashboard.reports.yearly.map((item) => (
              <div key={item.label} className="rounded-[20px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900 dark:text-white">{item.label}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-300">{item.patients} patients</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </GlassPanel>
  </div>
);

const SettingsSection = ({ settings, onAction }) => (
  <div className="grid gap-6 xl:grid-cols-3">
    <GlassPanel>
      <p className="text-sm font-semibold text-slate-950 dark:text-white">Notifications</p>
      <div className="mt-4 space-y-4">
        {settings.notifications.map((item) => (
          <div key={item.name} className="flex items-center justify-between gap-3 rounded-[20px] border border-slate-200/70 bg-white/70 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
            <span className="text-sm text-slate-700 dark:text-slate-200">{item.name}</span>
            <StatusBadge value={item.enabled ? 'Enabled' : 'Disabled'} className={item.enabled ? 'bg-emerald-500/12 text-emerald-700 dark:text-emerald-200' : 'bg-slate-500/12 text-slate-700 dark:text-slate-200'} />
          </div>
        ))}
      </div>
    </GlassPanel>
    <GlassPanel>
      <p className="text-sm font-semibold text-slate-950 dark:text-white">Automations</p>
      <div className="mt-4 space-y-4">
        {settings.automations.map((item) => (
          <div key={item.name} className="rounded-[20px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.status}</p>
          </div>
        ))}
      </div>
    </GlassPanel>
    <GlassPanel>
      <p className="text-sm font-semibold text-slate-950 dark:text-white">Platform Settings</p>
      <div className="mt-4 space-y-3 text-sm leading-7 text-slate-700 dark:text-slate-200">
        {settings.integrations.map((item) => <p key={item}>{item}</p>)}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {settings.roles.map((role) => <span key={role} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">{role}</span>)}
      </div>
      <Button type="button" variant="outline" className="mt-5 rounded-full" onClick={() => onAction('Settings overview', 'Review communication, access and operational preferences here.')}>Review Settings</Button>
    </GlassPanel>
  </div>
);

const SummaryStrip = ({ dashboard }) => {
  const items = [
    { icon: Globe2, label: 'Coverage city', value: dashboard.organization.city },
    { icon: Stethoscope, label: 'Care coordinator', value: dashboard.organization.coordinatorOnDuty },
    { icon: ShieldCheck, label: 'Continuity score', value: `${dashboard.organization.careContinuityScore}%` },
    { icon: Building2, label: 'Hospital partners', value: `${dashboard.hospitals.length}` },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <GlassPanel key={item.label} className="flex items-center gap-4">
            <div className="rounded-2xl bg-slate-950 p-3 text-white dark:bg-white dark:text-slate-950">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">{item.label}</p>
              <p className="mt-2 font-semibold text-slate-950 dark:text-white">{item.value}</p>
            </div>
          </GlassPanel>
        );
      })}
    </div>
  );
};

const HospitalsAndInsuranceOverview = ({ dashboard }) => (
  <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
    <GlassPanel>
      <PanelHeader eyebrow="Hospital Management" title="Hospital network and TPA coverage" description="Departments, doctors and TPA support are surfaced together for fast coordination during admissions and planned care." />
      <div className="mt-6 space-y-4">
        {dashboard.hospitals.map((item) => (
          <div key={item.id} className="rounded-[24px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="font-semibold text-slate-950 dark:text-white">{item.name}</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.departments.join(', ')}</p>
          </div>
        ))}
      </div>
    </GlassPanel>
    <GlassPanel>
      <PanelHeader eyebrow="Insurance & TPA" title="Live provider mix" description="Cashless and reimbursement support is modeled as provider cards with active case counts." />
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {dashboard.insuranceProviders.map((provider) => (
          <div key={provider.name} className="rounded-[24px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
            <p className="font-semibold text-slate-950 dark:text-white">{provider.name}</p>
            <p className="mt-1 text-sm leading-7 text-slate-600 dark:text-slate-300">{provider.coverage}</p>
            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">{provider.activeCases} active cases</p>
          </div>
        ))}
      </div>
    </GlassPanel>
  </div>
);

const CommunicationsAndReportsOverview = ({ dashboard }) => (
  <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
    <GlassPanel>
      <PanelHeader eyebrow="WhatsApp Centre" title="Message operations" description="Broadcast readiness, templates and family-facing updates in one responsive panel." />
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-[24px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white"><MessageSquareMore className="h-4 w-4" /> Templates</div>
          <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{dashboard.whatsappCentre.templates.length}</p>
        </div>
        <div className="rounded-[24px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white"><PhoneCall className="h-4 w-4" /> Broadcasts</div>
          <p className="mt-3 text-3xl font-semibold text-slate-950 dark:text-white">{dashboard.whatsappCentre.broadcasts.length}</p>
        </div>
      </div>
    </GlassPanel>
    <GlassPanel>
      <PanelHeader eyebrow="Reports" title="Daily to yearly KPI readiness" description="Reporting surfaces are already segmented for operational, revenue and patient growth metrics." />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40"><p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Daily</p><p className="mt-3 font-semibold text-slate-950 dark:text-white">{dashboard.reports.daily.adherence}% adherence</p></div>
        <div className="rounded-[24px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40"><p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Weekly</p><p className="mt-3 font-semibold text-slate-950 dark:text-white">{dashboard.reports.weekly.doctorReviews} doctor reviews</p></div>
        <div className="rounded-[24px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40"><p className="text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">Yearly</p><p className="mt-3 font-semibold text-slate-950 dark:text-white">{dashboard.reports.yearly.at(-1)?.patients} patients</p></div>
      </div>
    </GlassPanel>
  </div>
);

export {
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
  StatusBadge,
  SummaryStrip,
  StaffSection,
  WhatsAppSection,
};