import React, { useMemo, useState } from 'react';
import { Search, ShieldCheck, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import WhatsAppAdminLayout from '../../layout/WhatsAppAdminLayout';
import { mockContacts } from '../../contacts/data/contactMockData';
import { mockPatientProfiles } from '../data/patientMockData';
import PatientProfileDrawer from '../components/PatientProfileDrawer';
import PatientOnboardingWizard from '../components/PatientOnboardingWizard';
import { PATIENT_STATUS_META, PATIENT_WORKSPACE_FILTERS, PAYMENT_STATUS_META, PAYMENT_STATUS_OPTIONS } from '../types/patientTypes';

const summaryCardClassName = 'rounded-[24px] border border-slate-200/80 bg-white/90 px-4 py-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-950/35';

const formatDateTime = (value) => {
  if (!value) {
    return 'Unavailable';
  }

  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  }

  return value;
};

const patientMatchesPrimaryFilter = (patient, filterKey) => {
  const normalized = String(patient.onboardingStatus || '').toLowerCase().replace(/\s+/g, '-');
  if (filterKey === 'all') {
    return true;
  }
  return normalized === filterKey;
};

const hasTodayAppointment = (patient) => {
  const appointmentLabel = String(patient.nextAppointment || '').toLowerCase();
  if (!appointmentLabel || appointmentLabel.includes('not scheduled') || appointmentLabel.includes('no upcoming')) {
    return false;
  }

  const today = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short' }).format(new Date()).toLowerCase();
  return appointmentLabel.includes(today);
};

const AvatarPill = ({ name }) => {
  const initials = String(name || '').split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 font-semibold text-white">{initials}</div>;
};

const SummaryCard = ({ label, value, caption }) => (
  <div className={summaryCardClassName}>
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{caption}</p>
  </div>
);

const FilterSelect = ({ value, onChange, options, placeholder }) => (
  <select value={value} onChange={(event) => onChange(event.target.value)} className="h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white">
    {options.map((option) => (
      <option key={option.value} value={option.value}>
        {option.label}
      </option>
    ))}
  </select>
);

const WhatsAppPatientsWorkspacePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patients, setPatients] = useState(mockPatientProfiles);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [assignedNurseFilter, setAssignedNurseFilter] = useState('all');
  const [assignedDoctorFilter, setAssignedDoctorFilter] = useState('all');
  const [serviceTypeFilter, setServiceTypeFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [nextAppointmentFilter, setNextAppointmentFilter] = useState('all');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingContactId, setOnboardingContactId] = useState('');

  const selectedPatient = useMemo(() => patients.find((patient) => patient.id === selectedPatientId) || null, [patients, selectedPatientId]);
  const selectedContact = useMemo(() => mockContacts.find((contact) => contact.id === selectedPatient?.contactId) || null, [selectedPatient]);
  const onboardingContact = useMemo(() => mockContacts.find((contact) => contact.id === onboardingContactId) || selectedContact || null, [onboardingContactId, selectedContact]);

  const assignedNurseOptions = useMemo(() => [...new Set(patients.map((patient) => patient.assignedNurse).filter(Boolean))], [patients]);
  const assignedDoctorOptions = useMemo(() => [...new Set(patients.map((patient) => patient.doctor).filter(Boolean))], [patients]);
  const serviceTypeOptions = useMemo(() => [...new Set(patients.map((patient) => patient.serviceType).filter(Boolean))], [patients]);

  const filteredPatients = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return patients.filter((patient) => {
      const matchesSearch = !normalizedSearch || [
        patient.patientName,
        patient.phone,
        patient.whatsappNumber,
        patient.serviceType,
        patient.doctor,
        patient.assignedNurse,
        patient.patientExternalId,
      ].some((value) => String(value || '').toLowerCase().includes(normalizedSearch));

      const matchesPrimary = patientMatchesPrimaryFilter(patient, activeFilter);
      const matchesNurse = assignedNurseFilter === 'all' || patient.assignedNurse === assignedNurseFilter;
      const matchesDoctor = assignedDoctorFilter === 'all' || patient.doctor === assignedDoctorFilter;
      const matchesService = serviceTypeFilter === 'all' || patient.serviceType === serviceTypeFilter;
      const matchesPayment = paymentStatusFilter === 'all' || patient.paymentStatus === paymentStatusFilter;
      const hasAppointment = !String(patient.nextAppointment || '').toLowerCase().includes('not scheduled') && !String(patient.nextAppointment || '').toLowerCase().includes('no upcoming');
      const matchesAppointment = nextAppointmentFilter === 'all'
        || (nextAppointmentFilter === 'today' && hasTodayAppointment(patient))
        || (nextAppointmentFilter === 'scheduled' && hasAppointment)
        || (nextAppointmentFilter === 'none' && !hasAppointment);

      return matchesSearch && matchesPrimary && matchesNurse && matchesDoctor && matchesService && matchesPayment && matchesAppointment;
    });
  }, [activeFilter, assignedDoctorFilter, assignedNurseFilter, nextAppointmentFilter, patients, paymentStatusFilter, search, serviceTypeFilter]);

  const summary = useMemo(() => ({
    total: filteredPatients.length,
    active: patients.filter((patient) => patient.onboardingStatus === 'Active').length,
    pending: patients.filter((patient) => patient.onboardingStatus === 'Pending Review').length,
    todayAppointments: patients.filter((patient) => hasTodayAppointment(patient)).length,
    outstandingPayments: patients.filter((patient) => patient.paymentStatus !== 'Paid').length,
  }), [filteredPatients.length, patients]);

  const openProfile = (patientId) => {
    setSelectedPatientId(patientId);
    setProfileOpen(true);
  };

  const openOnboarding = (contactId, patientId = '') => {
    setOnboardingContactId(contactId);
    if (patientId) {
      setSelectedPatientId(patientId);
    }
    setOnboardingOpen(true);
  };

  const handleOnboardingComplete = (profile) => {
    const existingPatient = patients.find((patient) => patient.contactId === profile.contactId);
    const nextProfile = {
      ...profile,
      id: existingPatient?.id || profile.id,
    };

    setPatients((current) => [nextProfile, ...current.filter((patient) => patient.contactId !== profile.contactId)]);
    setOnboardingOpen(false);
    setSelectedPatientId(nextProfile.id);
    setProfileOpen(true);
    toast({
      title: 'Patient updated locally',
      description: 'The dedicated Patients workspace has refreshed this patient profile foundation.',
    });
  };

  return (
    <WhatsAppAdminLayout>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45 lg:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full border-emerald-300 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-emerald-700 dark:border-emerald-900 dark:text-emerald-200">
                  Patients Workspace
                </Badge>
                <Badge variant="outline" className="rounded-full border-slate-300 bg-transparent px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  Contact to Patient relationship visible
                </Badge>
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Patient Operations Workspace</h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                Dedicated healthcare operations workspace for patient status, care services, appointments, payments, and staff coordination. All records remain local/mock in this phase while preserving real navigation paths to Contacts and Inbox.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => openOnboarding(mockContacts[0]?.id || '')}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Start Onboarding
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 xl:grid-cols-5">
            <SummaryCard label="Total Patients" value={summary.total} caption="Filtered workspace view" />
            <SummaryCard label="Active Patients" value={summary.active} caption="Currently in active care" />
            <SummaryCard label="Pending Review" value={summary.pending} caption="Awaiting clinical or ops review" />
            <SummaryCard label="Today's Appointments" value={summary.todayAppointments} caption="Operational appointments due today" />
            <SummaryCard label="Outstanding Payments" value={summary.outstandingPayments} caption="Patients with pending finance follow-up" />
          </div>
        </section>

        <section className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative w-full xl:max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search patients" className="h-11 rounded-full border-slate-200 bg-white pl-10 dark:border-slate-700 dark:bg-slate-950" />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {PATIENT_WORKSPACE_FILTERS.map((filter) => (
                  <button key={filter.key} type="button" onClick={() => setActiveFilter(filter.key)} className={activeFilter === filter.key ? 'whitespace-nowrap rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white dark:bg-white dark:text-slate-950' : 'whitespace-nowrap rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}>
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <FilterSelect
                value={assignedNurseFilter}
                onChange={setAssignedNurseFilter}
                placeholder="Assigned Nurse"
                options={[
                  { value: 'all', label: 'Assigned Nurse' },
                  ...assignedNurseOptions.map((option) => ({ value: option, label: option })),
                ]}
              />

              <FilterSelect
                value={assignedDoctorFilter}
                onChange={setAssignedDoctorFilter}
                placeholder="Assigned Doctor"
                options={[
                  { value: 'all', label: 'Assigned Doctor' },
                  ...assignedDoctorOptions.map((option) => ({ value: option, label: option })),
                ]}
              />

              <FilterSelect
                value={serviceTypeFilter}
                onChange={setServiceTypeFilter}
                placeholder="Service Type"
                options={[
                  { value: 'all', label: 'Service Type' },
                  ...serviceTypeOptions.map((option) => ({ value: option, label: option })),
                ]}
              />

              <FilterSelect
                value={paymentStatusFilter}
                onChange={setPaymentStatusFilter}
                placeholder="Payment Status"
                options={PAYMENT_STATUS_OPTIONS.map((option) => ({ value: option.toLowerCase() === 'all' ? 'all' : option, label: option }))}
              />

              <FilterSelect
                value={nextAppointmentFilter}
                onChange={setNextAppointmentFilter}
                placeholder="Next Appointment"
                options={[
                  { value: 'all', label: 'Next Appointment' },
                  { value: 'today', label: 'Today' },
                  { value: 'scheduled', label: 'Scheduled' },
                  { value: 'none', label: 'No Appointment' },
                ]}
              />
            </div>
          </div>
        </section>

        <div className="overflow-hidden rounded-[28px] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/90 dark:bg-slate-900/70">
                <TableHead>Patient</TableHead>
                <TableHead>Age / Gender</TableHead>
                <TableHead>Phone / WhatsApp</TableHead>
                <TableHead>Care Service</TableHead>
                <TableHead>Assigned Nurse</TableHead>
                <TableHead>Assigned Doctor</TableHead>
                <TableHead>Next Appointment</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead>Patient Status</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.length ? filteredPatients.map((patient) => {
                const statusClassName = PATIENT_STATUS_META[patient.onboardingStatus] || PATIENT_STATUS_META.Draft;
                const paymentClassName = PAYMENT_STATUS_META[patient.paymentStatus] || PAYMENT_STATUS_META.Pending;
                const lastActivity = patient.activityTimeline?.[0]?.time || formatDateTime(patient.lastWhatsAppInteraction);

                return (
                  <TableRow key={patient.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-900/45">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <AvatarPill name={patient.patientName} />
                        <div>
                          <p className="font-medium text-slate-950 dark:text-white">{patient.patientName}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{patient.patientExternalId || patient.id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{`${patient.age || 'NA'} / ${patient.gender || 'NA'}`}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm text-slate-900 dark:text-white">{patient.phone}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{patient.whatsappNumber || patient.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>{patient.serviceType}</TableCell>
                    <TableCell>{patient.assignedNurse || 'Unassigned'}</TableCell>
                    <TableCell>{patient.doctor || 'Unassigned'}</TableCell>
                    <TableCell>{patient.nextAppointment}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`rounded-full px-2 py-0 text-[10px] uppercase tracking-[0.14em] ${paymentClassName}`}>
                        {patient.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`rounded-full px-2 py-0 text-[10px] uppercase tracking-[0.14em] ${statusClassName}`}>
                        {patient.onboardingStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{lastActivity}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => openProfile(patient.id)}>
                          Open Profile
                        </Button>
                        <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => navigate('/admin/whatsapp-platform/inbox')}>
                          WhatsApp
                        </Button>
                        <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => openOnboarding(patient.contactId, patient.id)}>
                          Edit
                        </Button>
                        <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => toast({ title: 'Assign Staff is mocked', description: 'Assignment will remain local until a dedicated patient staffing API exists.' })}>
                          Assign Staff
                        </Button>
                        <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => openOnboarding(patient.contactId, patient.id)}>
                          Start Onboarding
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={() => openProfile(patient.id)}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={11}>
                    <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
                      No patients match the current search and filter combination.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <PatientProfileDrawer
          open={profileOpen}
          onOpenChange={setProfileOpen}
          patient={selectedPatient}
          contact={selectedContact}
          onOpenOnboarding={(contactId) => openOnboarding(contactId, selectedPatient?.id || '')}
          onOpenContact={() => navigate('/admin/whatsapp-platform/contacts')}
          onOpenWhatsApp={() => navigate('/admin/whatsapp-platform/inbox')}
          onBackToContacts={() => navigate('/admin/whatsapp-platform/contacts')}
        />

        <PatientOnboardingWizard
          open={onboardingOpen}
          onOpenChange={setOnboardingOpen}
          contact={onboardingContact}
          initialPatient={patients.find((patient) => patient.contactId === onboardingContactId) || null}
          onComplete={handleOnboardingComplete}
        />
      </div>
    </WhatsAppAdminLayout>
  );
};

export default WhatsAppPatientsWorkspacePage;