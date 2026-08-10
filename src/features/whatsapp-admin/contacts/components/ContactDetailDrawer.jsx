import React from 'react';
import { ExternalLink, MessageSquareText, Phone, UserRound } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CONTACT_PATIENT_STATUS_META, WHATSAPP_STATUS_META } from '../types/contactTypes';

const Section = ({ title, children }) => (
  <section className="rounded-[24px] border border-slate-200/80 bg-white/85 p-4 dark:border-slate-800 dark:bg-slate-950/35">
    <p className="text-sm font-semibold text-slate-950 dark:text-white">{title}</p>
    <div className="mt-4">{children}</div>
  </section>
);

const DetailRow = ({ label, value }) => (
  <div className="grid grid-cols-[130px_minmax(0,1fr)] gap-3 py-2 text-sm">
    <p className="text-slate-500 dark:text-slate-400">{label}</p>
    <p className="break-words text-slate-900 dark:text-white">{value || 'Unavailable'}</p>
  </div>
);

const ContactDetailDrawer = ({ open, onOpenChange, contact, assignedStaffName, onConvertToPatient, onOpenPatientProfile }) => {
  if (!contact) {
    return null;
  }

  const initials = contact.fullName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const whatsappMeta = WHATSAPP_STATUS_META[contact.whatsappStatus] || WHATSAPP_STATUS_META.dormant;
  const patientMeta = CONTACT_PATIENT_STATUS_META[contact.patientStatus] || CONTACT_PATIENT_STATUS_META['not-linked'];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto border-l border-slate-200 bg-slate-100/95 px-0 dark:border-slate-800 dark:bg-slate-950/95 sm:max-w-[640px]">
        <div className="px-6 pb-6 pt-5">
          <SheetHeader className="text-left">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                <AvatarFallback className="rounded-2xl bg-emerald-600 text-lg font-semibold text-white">{initials}</AvatarFallback>
              </Avatar>
              <div>
                <SheetTitle className="text-2xl font-semibold text-slate-950 dark:text-white">{contact.fullName}</SheetTitle>
                <SheetDescription className="mt-2">Operational contact profile for the WhatsApp Admin Platform. All edits stay local in Phase 2B.</SheetDescription>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant="outline" className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${whatsappMeta.className}`}>
                    {whatsappMeta.label}
                  </Badge>
                  <Badge variant="outline" className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.16em] ${patientMeta.className}`}>
                    {patientMeta.label}
                  </Badge>
                </div>
              </div>
            </div>
          </SheetHeader>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={onConvertToPatient}>
              Convert to Patient
            </Button>
            <Button type="button" variant="outline" className="rounded-full" onClick={onOpenPatientProfile} disabled={!contact.patientConnection?.patientId}>
              View patient profile
            </Button>
            <Button type="button" variant="outline" className="rounded-full">
              Edit
            </Button>
          </div>

          <div className="mt-6 space-y-4">
            <Section title="Contact Information">
              <DetailRow label="Phone" value={contact.phone} />
              <DetailRow label="WhatsApp" value={contact.whatsappNumber} />
              <DetailRow label="Email" value={contact.email} />
              <DetailRow label="City" value={contact.city} />
              <DetailRow label="Pincode" value={contact.pincode} />
              <div className="mt-3 flex flex-wrap gap-2">
                <a href={`https://wa.me/${contact.whatsappNumber}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-700 dark:border-emerald-900 dark:text-emerald-200">
                  <MessageSquareText className="h-4 w-4" />
                  WhatsApp shortcut
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                  <Phone className="h-4 w-4" />
                  {contact.preferredCommunication}
                </span>
              </div>
            </Section>

            <Section title="Relationship & Family / NRI">
              <DetailRow label="Relationship" value={contact.relationship} />
              <DetailRow label="Contact Type" value={contact.contactType} />
              <DetailRow label="NRI / Family" value={contact.isNriFamily ? contact.nriCountry || 'Yes' : 'No'} />
              <DetailRow label="Source" value={contact.source} />
            </Section>

            <Section title="Patient Connection">
              <DetailRow label="Patient" value={contact.patientConnection?.patientName || 'Not linked'} />
              <DetailRow label="Onboarding Status" value={contact.patientConnection?.onboardingStatus || 'Not started'} />
            </Section>

            <Section title="Assigned Staff">
              <DetailRow label="Current Owner" value={assignedStaffName || 'Unassigned'} />
              <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                <UserRound className="h-4 w-4" />
                Local assignment visuals only
              </div>
            </Section>

            <Section title="Recent Activity">
              <div className="space-y-3">
                {contact.recentActivity?.length ? contact.recentActivity.map((activity) => (
                  <div key={activity.id} className="rounded-2xl border border-slate-200/70 bg-slate-50/70 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/40">
                    <p className="text-sm text-slate-900 dark:text-white">{activity.label}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
                    No recent activity yet.
                  </div>
                )}
              </div>
            </Section>

            <Section title="Notes">
              <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">{contact.notes || 'No notes recorded yet.'}</p>
            </Section>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ContactDetailDrawer;
