import React from 'react';
import { ArrowLeft, CalendarDays, CreditCard, Download, ExternalLink, FileText, HeartPulse, MapPin, MessageSquareText, MoreHorizontal, Phone, ShieldCheck, Stethoscope, Users2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PAYMENT_STATUS_META, PATIENT_STATUS_META } from '../types/patientTypes';

const formatDateTime = (value) => {
  if (!value) {
    return 'Unavailable';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const SummaryCard = ({ icon: Icon, label, value }) => (
  <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/45">
    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
      <Icon className="h-4 w-4" />
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em]">{label}</p>
    </div>
    <p className="mt-3 text-sm font-medium text-slate-950 dark:text-white">{value || 'Unavailable'}</p>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="grid grid-cols-[150px_minmax(0,1fr)] gap-3 border-b border-slate-200/70 py-3 last:border-b-0 dark:border-slate-800/80">
    <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    <p className="text-sm text-slate-900 dark:text-white">{value || 'Unavailable'}</p>
  </div>
);

const DetailPanel = ({ title, children }) => (
  <div className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-950/35">
    <p className="text-sm font-semibold text-slate-950 dark:text-white">{title}</p>
    <div className="mt-3">{children}</div>
  </div>
);

const TimelineList = ({ items }) => (
  <div className="space-y-3">
    {items.length ? items.map((item) => (
      <div key={item.id || `${item.label}-${item.time}`} className="rounded-[20px] border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-slate-950 dark:text-white">{item.label || item.name || item.type}</p>
            {'amount' in item ? <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.amount}</p> : null}
          </div>
          <Badge variant="outline" className="rounded-full border-slate-300 bg-transparent px-2 py-0 text-[10px] uppercase tracking-[0.16em] text-slate-600 dark:border-slate-700 dark:text-slate-300">
            {item.status || item.type || 'Record'}
          </Badge>
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{item.time || item.date || item.dateTime || item.uploadDate || 'Pending'}</p>
      </div>
    )) : (
      <div className="rounded-[20px] border border-dashed border-slate-300 bg-slate-50/70 px-4 py-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
        No records available.
      </div>
    )}
  </div>
);

const PatientProfileDrawer = ({ open, onOpenChange, patient, contact, onOpenOnboarding, onOpenContact, onOpenWhatsApp, onBackToContacts }) => {
  if (!patient) {
    return null;
  }

  const initials = patient.patientName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const statusClassName = PATIENT_STATUS_META[patient.onboardingStatus] || PATIENT_STATUS_META.Draft;
  const paymentClassName = PAYMENT_STATUS_META[patient.paymentStatus] || PAYMENT_STATUS_META.Pending;
  const summaryCards = [
    { icon: HeartPulse, label: 'Active Service', value: patient.serviceType },
    { icon: ShieldCheck, label: 'Assigned Nurse', value: patient.assignedNurse },
    { icon: Stethoscope, label: 'Assigned Doctor', value: patient.doctor },
    { icon: CalendarDays, label: 'Next Appointment', value: patient.nextAppointment },
    { icon: CreditCard, label: 'Payment Status', value: patient.paymentStatus },
    { icon: MessageSquareText, label: 'Recent WhatsApp', value: formatDateTime(patient.lastWhatsAppInteraction) },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto border-l border-slate-200 bg-slate-100/95 px-0 dark:border-slate-800 dark:bg-slate-950/95 sm:max-w-[900px]">
        <div className="px-6 pb-6 pt-5">
          <SheetHeader className="text-left">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="h-18 w-18 rounded-[28px] border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                  <AvatarFallback className="rounded-[28px] bg-emerald-600 text-xl font-semibold text-white">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <SheetTitle className="text-2xl font-semibold text-slate-950 dark:text-white">{patient.patientName}</SheetTitle>
                    <Badge variant="outline" className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${statusClassName}`}>
                      {patient.onboardingStatus}
                    </Badge>
                  </div>
                  <SheetDescription className="mt-2 max-w-2xl">
                    Dedicated patient operations profile for the WhatsApp Admin Platform. Contact and WhatsApp relationships are exposed without activating any live external integrations.
                  </SheetDescription>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline" className="rounded-full border-slate-300 bg-transparent px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-slate-600 dark:border-slate-700 dark:text-slate-300">
                      {patient.patientExternalId || patient.id}
                    </Badge>
                    <Badge variant="outline" className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.16em] ${paymentClassName}`}>
                      {patient.paymentStatus}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" className="rounded-full" onClick={() => onBackToContacts?.()}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Contacts
                </Button>
                <Button type="button" variant="outline" className="rounded-full" onClick={() => onOpenContact?.(patient.contactId)}>
                  Open Contact
                </Button>
                <Button type="button" variant="outline" className="rounded-full" onClick={() => onOpenWhatsApp?.(patient)}>
                  <MessageSquareText className="mr-2 h-4 w-4" />
                  WhatsApp
                </Button>
                <Button type="button" variant="outline" className="rounded-full" onClick={() => onOpenOnboarding?.(patient.contactId)}>
                  Edit
                </Button>
                <Button type="button" variant="outline" className="rounded-full">
                  <MoreHorizontal className="mr-2 h-4 w-4" />
                  More actions
                </Button>
              </div>
            </div>
          </SheetHeader>

          <div className="mt-6 grid gap-3 lg:grid-cols-3">
            {summaryCards.map((card) => <SummaryCard key={card.label} icon={card.icon} label={card.label} value={card.value} />)}
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              <Tabs defaultValue="overview" className="space-y-5">
                <div className="overflow-x-auto pb-1">
                  <TabsList className="h-auto min-w-max gap-2 rounded-full bg-slate-100/80 p-1.5 dark:bg-slate-900/80">
                    {['overview', 'healthcare', 'services', 'appointments', 'staff', 'documents', 'payments', 'activity'].map((tab) => (
                      <TabsTrigger key={tab} value={tab} className="rounded-full px-4 py-2 capitalize data-[state=active]:bg-slate-950 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-950">
                        {tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <TabsContent value="overview" className="mt-0 space-y-4">
                  <DetailPanel title="Patient Summary">
                    <InfoRow label="Patient ID" value={patient.patientExternalId || patient.id} />
                    <InfoRow label="Age / Gender" value={`${patient.age || 'NA'} / ${patient.gender || 'NA'}`} />
                    <InfoRow label="Phone" value={patient.phone} />
                    <InfoRow label="Location" value={patient.address || `${patient.city}, ${patient.pincode}`} />
                    <InfoRow label="Emergency Contact" value={`${patient.emergencyContact || 'NA'}${patient.emergencyPhone ? ` • ${patient.emergencyPhone}` : ''}`} />
                    <InfoRow label="Family / NRI Contact" value={`${patient.familyContact || 'NA'}${patient.familyPhone ? ` • ${patient.familyPhone}` : ''}`} />
                    <InfoRow label="Assigned Nurse" value={patient.assignedNurse} />
                    <InfoRow label="Assigned Doctor" value={patient.doctor} />
                    <InfoRow label="Active Service" value={patient.serviceType} />
                  </DetailPanel>

                  <DetailPanel title="Operational Summary">
                    <InfoRow label="Next Appointment" value={patient.nextAppointment} />
                    <InfoRow label="Payment Status" value={`${patient.paymentStatus} • ${patient.outstandingPayment}`} />
                    <InfoRow label="Recent WhatsApp Interaction" value={formatDateTime(patient.lastWhatsAppInteraction)} />
                    <InfoRow label="Important Notes" value={patient.importantNotes || 'No priority note recorded'} />
                    <InfoRow label="Care Requirements" value={patient.careRequirements} />
                  </DetailPanel>
                </TabsContent>

                <TabsContent value="healthcare" className="mt-0 space-y-4">
                  <DetailPanel title="Healthcare Information">
                    <InfoRow label="Medical Notes" value={patient.medicalNotes} />
                    <InfoRow label="Care Requirements" value={patient.careRequirements} />
                    <InfoRow label="Doctor" value={patient.doctor} />
                    <InfoRow label="Clinical Notes" value={patient.diagnosisNotes || 'Clinical notes placeholder'} />
                    <InfoRow label="Allergies" value={patient.allergies || 'No allergies recorded'} />
                    <InfoRow label="Medications" value={patient.medications || 'Medication placeholder'} />
                    <InfoRow label="Emergency Information" value={patient.emergencyInformation || 'Emergency escalation placeholder'} />
                  </DetailPanel>
                </TabsContent>

                <TabsContent value="services" className="mt-0 space-y-4">
                  <DetailPanel title="Service Summary">
                    <InfoRow label="Active Service" value={patient.serviceType} />
                    <InfoRow label="Service Status" value={patient.serviceStatus || patient.onboardingStatus} />
                    <InfoRow label="Service Start" value={patient.serviceStartDate || 'Pending'} />
                    <InfoRow label="Service End" value={patient.serviceEndDate || 'TBD'} />
                    <InfoRow label="Assigned Nurse" value={patient.assignedNurse} />
                    <InfoRow label="Assigned Doctor" value={patient.doctor} />
                  </DetailPanel>
                  <DetailPanel title="Service History">
                    <TimelineList items={patient.serviceHistory || []} />
                  </DetailPanel>
                </TabsContent>

                <TabsContent value="appointments" className="mt-0 grid gap-4 xl:grid-cols-2">
                  <DetailPanel title="Upcoming Appointments">
                    <TimelineList items={patient.upcomingAppointments || []} />
                  </DetailPanel>
                  <DetailPanel title="Previous Appointments">
                    <TimelineList items={patient.previousAppointments || []} />
                  </DetailPanel>
                </TabsContent>

                <TabsContent value="staff" className="mt-0 space-y-4">
                  <DetailPanel title="Primary Staff">
                    <InfoRow label="Assigned Nurse" value={patient.assignedNurse} />
                    <InfoRow label="Assigned Doctor" value={patient.doctor} />
                    <InfoRow label="Assignment Status" value={patient.onboardingStatus} />
                  </DetailPanel>
                  <DetailPanel title="Other Assigned Staff">
                    <TimelineList items={(patient.otherAssignedStaff || []).map((name, index) => ({ id: `${name}-${index}`, label: name, status: 'Assigned', time: 'Operational coverage' }))} />
                  </DetailPanel>
                </TabsContent>

                <TabsContent value="documents" className="mt-0 space-y-4">
                  <DetailPanel title="Documents">
                    <TimelineList items={(patient.documentsDetailed || []).map((document) => ({ ...document, label: `${document.category} • ${document.name}` }))} />
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button type="button" variant="outline" className="rounded-full" disabled>
                        <FileText className="mr-2 h-4 w-4" />
                        Preview placeholder
                      </Button>
                      <Button type="button" variant="outline" className="rounded-full" disabled>
                        <Download className="mr-2 h-4 w-4" />
                        Download placeholder
                      </Button>
                    </div>
                  </DetailPanel>
                </TabsContent>

                <TabsContent value="payments" className="mt-0 space-y-4">
                  <div className="grid gap-3 md:grid-cols-4">
                    <SummaryCard icon={CreditCard} label="Total Billed" value={patient.totalBilled} />
                    <SummaryCard icon={CreditCard} label="Paid" value={patient.paidAmount} />
                    <SummaryCard icon={CreditCard} label="Pending" value={patient.outstandingPayment} />
                    <SummaryCard icon={CreditCard} label="Invoice" value={patient.invoiceStatus} />
                  </div>
                  <DetailPanel title="Payment History">
                    <TimelineList items={patient.paymentHistory || []} />
                  </DetailPanel>
                  <div className="rounded-[24px] border border-amber-200 bg-amber-50/80 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
                    <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Payments integration coming from the Integrations module</p>
                    <p className="mt-2 text-xs leading-6 text-amber-800 dark:text-amber-200">Razorpay status, settlement details, and invoice sync remain placeholder-only in this phase.</p>
                  </div>
                </TabsContent>

                <TabsContent value="activity" className="mt-0">
                  <DetailPanel title="Operational Timeline">
                    <TimelineList items={patient.activityTimeline || []} />
                  </DetailPanel>
                </TabsContent>
              </Tabs>
            </div>

            <div className="space-y-4">
              <DetailPanel title="Relationship">
                <InfoRow label="Contact" value={contact?.fullName || 'Linked contact unavailable'} />
                <InfoRow label="Contact Phone" value={contact?.phone || patient.phone} />
                <InfoRow label="WhatsApp" value={patient.whatsappNumber || patient.phone} />
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button type="button" variant="outline" className="rounded-full" onClick={() => onOpenContact?.(patient.contactId)}>
                    Open Contact
                  </Button>
                  <Button type="button" variant="outline" className="rounded-full" onClick={() => onOpenWhatsApp?.(patient)}>
                    Open WhatsApp conversation
                  </Button>
                </div>
              </DetailPanel>

              <DetailPanel title="Quick Summary">
                <div className="space-y-3">
                  <div className="rounded-[20px] border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <p className="text-sm font-medium text-slate-950 dark:text-white">Location</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{patient.address || `${patient.city}, ${patient.pincode}`}</p>
                  </div>
                  <div className="rounded-[20px] border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                    <div className="flex items-center gap-2">
                      <Users2 className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <p className="text-sm font-medium text-slate-950 dark:text-white">Emergency & Family</p>
                    </div>
                    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{patient.emergencyContact || 'Unavailable'}{patient.emergencyPhone ? ` • ${patient.emergencyPhone}` : ''}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{patient.familyContact || 'No family contact'}{patient.familyPhone ? ` • ${patient.familyPhone}` : ''}</p>
                  </div>
                  <div className="rounded-[20px] border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/40">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <p className="text-sm font-medium text-slate-950 dark:text-white">Quick Actions</p>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href={`https://wa.me/${patient.whatsappNumber || patient.phone}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-900 dark:text-emerald-200">
                        <ExternalLink className="h-4 w-4" />
                        WhatsApp shortcut
                      </a>
                      <Button type="button" variant="outline" className="rounded-full" onClick={() => onOpenOnboarding?.(patient.contactId)}>
                        Update onboarding
                      </Button>
                    </div>
                  </div>
                </div>
              </DetailPanel>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default PatientProfileDrawer;
