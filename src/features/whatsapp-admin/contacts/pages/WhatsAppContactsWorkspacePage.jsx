import React, { useMemo, useState } from 'react';
import { Download, FileSpreadsheet, Plus, RefreshCw, Search, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import WhatsAppAdminLayout from '../../layout/WhatsAppAdminLayout';
import { contactExportContract, patientOnboardingContract } from '../contracts/contactWorkspaceContracts';
import { mockContacts, mockStaffOptions } from '../data/contactMockData';
import { BULK_ACTION_OPTIONS, CONTACT_FILTERS } from '../types/contactTypes';
import { createContactFromDraft, validateContactDraft } from '../validation/contactValidation';
import ContactDetailDrawer from '../components/ContactDetailDrawer';
import ContactsTable from '../components/ContactsTable';
import AddContactDialog from '../components/AddContactDialog';
import ImportContactsDialog from '../components/ImportContactsDialog';
import ExportContactsDialog from '../components/ExportContactsDialog';
import PatientOnboardingWizard from '../../patients/components/PatientOnboardingWizard';
import PatientProfileDrawer from '../../patients/components/PatientProfileDrawer';
import { mockPatientProfiles } from '../../patients/data/patientMockData';

const matchesFilter = (contact, filterKey) => {
  if (filterKey === 'all') {
    return true;
  }
  if (filterKey === 'active') {
    return contact.whatsappStatus === 'active';
  }
  if (filterKey === 'patient') {
    return contact.contactType === 'Patient';
  }
  if (filterKey === 'family-member') {
    return contact.contactType === 'Family Member';
  }
  if (filterKey === 'nri-family') {
    return contact.contactType === 'NRI Family' || contact.isNriFamily;
  }
  if (filterKey === 'unassigned') {
    return !contact.assignedStaffId;
  }
  if (filterKey === 'recently-added') {
    const createdAt = new Date(contact.createdAt || 0).getTime();
    return Date.now() - createdAt <= 7 * 24 * 60 * 60 * 1000;
  }

  return true;
};

const formatDate = (value) => {
  if (!value) {
    return 'No activity';
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

const SummaryCard = ({ label, value, caption }) => (
  <div className="rounded-[24px] border border-slate-200/80 bg-white/90 px-4 py-4 shadow-[0_12px_32px_rgba(15,23,42,0.05)] dark:border-slate-800 dark:bg-slate-950/35">
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-3 text-2xl font-semibold text-slate-950 dark:text-white">{value}</p>
    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{caption}</p>
  </div>
);

const WhatsAppContactsWorkspacePage = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState(mockContacts);
  const [patients, setPatients] = useState(mockPatientProfiles);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingContactId, setOnboardingContactId] = useState('');
  const [patientProfileOpen, setPatientProfileOpen] = useState(false);
  const [patientProfileId, setPatientProfileId] = useState('');

  const selectedContact = useMemo(() => contacts.find((contact) => contact.id === selectedContactId) || null, [contacts, selectedContactId]);
  const onboardingContact = useMemo(() => contacts.find((contact) => contact.id === onboardingContactId) || null, [contacts, onboardingContactId]);
  const selectedPatientProfile = useMemo(() => patients.find((patient) => patient.id === patientProfileId) || null, [patientProfileId, patients]);

  const filteredContacts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return contacts.filter((contact) => {
      const matchesSearch = !normalizedSearch || [
        contact.fullName,
        contact.phone,
        contact.whatsappNumber,
        contact.email,
        contact.city,
        contact.contactType,
        contact.source,
      ].some((value) => String(value || '').toLowerCase().includes(normalizedSearch));

      return matchesSearch && matchesFilter(contact, activeFilter);
    });
  }, [activeFilter, contacts, search]);

  const getAssignedStaffName = (staffId) => mockStaffOptions.find((staff) => staff.id === staffId)?.name || 'Unassigned';

  const handleToggleOne = (contactId) => {
    setSelectedIds((current) => current.includes(contactId) ? current.filter((id) => id !== contactId) : [...current, contactId]);
  };

  const handleToggleAll = () => {
    setSelectedIds((current) => {
      const allVisibleIds = filteredContacts.map((contact) => contact.id);
      const allSelected = allVisibleIds.every((id) => current.includes(id));
      return allSelected ? current.filter((id) => !allVisibleIds.includes(id)) : [...new Set([...current, ...allVisibleIds])];
    });
  };

  const handleOpenContact = (contactId) => {
    setSelectedContactId(contactId);
    setDetailOpen(true);
  };

  const handleSaveContact = (draft) => {
    const nextContact = createContactFromDraft(draft, contacts);
    setContacts((current) => [nextContact, ...current]);
    setAddOpen(false);
    setSelectedContactId(nextContact.id);
    setDetailOpen(true);
    toast({
      title: 'Contact saved locally',
      description: 'The new contact was added to the Contacts workspace without calling a backend.',
    });

    if (draft.convertToPatient) {
      setOnboardingContactId(nextContact.id);
      setOnboardingOpen(true);
    }
  };

  const handleBulkAction = (action) => {
    toast({
      title: `${action} is mocked`,
      description: `${selectedIds.length || filteredContacts.length} records remain local-only in Phase 2B.`,
    });
  };

  const handleImportConfirm = (summary) => {
    setImportOpen(false);
    toast({
      title: 'Import preview confirmed',
      description: `${summary.accepted} rows accepted and ${summary.rejected} rows rejected in local preview mode.`,
    });
  };

  const handleExportConfirm = (selectedExports) => {
    setExportOpen(false);
    toast({
      title: 'Mock export prepared',
      description: `${selectedExports.join(', ')} prepared from the current filtered workspace state.`,
    });
  };

  const handleOpenOnboarding = (contactId) => {
    setOnboardingContactId(contactId);
    setOnboardingOpen(true);
  };

  const handleCompleteOnboarding = (profile) => {
    const isExisting = patients.some((patient) => patient.contactId === profile.contactId);
    const nextPatientId = isExisting ? patients.find((patient) => patient.contactId === profile.contactId)?.id || profile.id : profile.id;
    const nextProfile = { ...profile, id: nextPatientId };

    setPatients((current) => {
      const remaining = current.filter((patient) => patient.contactId !== profile.contactId);
      return [nextProfile, ...remaining];
    });
    setContacts((current) => current.map((contact) => {
      if (contact.id !== profile.contactId) {
        return contact;
      }

      return {
        ...contact,
        patientStatus: String(profile.onboardingStatus || 'Draft').toLowerCase().replace(/\s+/g, '-'),
        patientConnection: {
          patientId: nextProfile.id,
          patientName: nextProfile.patientName,
          onboardingStatus: nextProfile.onboardingStatus,
        },
      };
    }));
    setOnboardingOpen(false);
    setPatientProfileId(nextProfile.id);
    setPatientProfileOpen(true);
    toast({
      title: 'Patient onboarding saved locally',
      description: 'The patient profile foundation is now available in the workspace.',
    });
  };

  const summary = {
    contacts: filteredContacts.length,
    activeWhatsapp: contacts.filter((contact) => contact.whatsappStatus === 'active').length,
    patients: contacts.filter((contact) => contact.patientConnection?.patientId).length,
    unassigned: contacts.filter((contact) => !contact.assignedStaffId).length,
  };

  return (
    <WhatsAppAdminLayout>
      <div className="space-y-6">
        <section className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45 lg:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full border-emerald-300 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-emerald-700 dark:border-emerald-900 dark:text-emerald-200">
                  Contacts Workspace
                </Badge>
                <Badge variant="outline" className="rounded-full border-slate-300 bg-transparent px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  Local adapters and onboarding contracts
                </Badge>
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Contacts + Patient Onboarding</h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                Enterprise workspace for contact operations, onboarding preparation, and patient activation planning. Import, export, sync, and onboarding remain local/mock in this phase with stable adapter contracts for future integrations.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" className="rounded-full bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => setAddOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Contact
              </Button>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setImportOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => setExportOpen(true)}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button type="button" variant="outline" className="rounded-full" onClick={() => toast({ title: 'Sync is mocked', description: 'Live Google Sheets and provider sync will be added through Integrations later.' })}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Sync
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 xl:grid-cols-4">
            <SummaryCard label="Contacts" value={summary.contacts} caption="Filtered workspace records" />
            <SummaryCard label="Active WhatsApp" value={summary.activeWhatsapp} caption="Warm operational contacts" />
            <SummaryCard label="Patient Links" value={summary.patients} caption="Contacts with patient foundation" />
            <SummaryCard label="Unassigned" value={summary.unassigned} caption="Ready for routing or onboarding" />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="relative w-full xl:max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search contacts" className="h-11 rounded-full border-slate-200 bg-white pl-10 dark:border-slate-700 dark:bg-slate-950" />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {CONTACT_FILTERS.map((filter) => (
                    <button key={filter.key} type="button" onClick={() => setActiveFilter(filter.key)} className={activeFilter === filter.key ? 'whitespace-nowrap rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white dark:bg-white dark:text-slate-950' : 'whitespace-nowrap rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'}>
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>

              {selectedIds.length ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-sky-200 bg-sky-50/80 px-4 py-3 dark:border-sky-900/50 dark:bg-sky-950/20">
                  <p className="text-sm font-medium text-sky-900 dark:text-sky-100">{selectedIds.length} contacts selected</p>
                  <div className="flex flex-wrap gap-2">
                    {BULK_ACTION_OPTIONS.map((action) => (
                      <Button key={action} type="button" variant="outline" className="rounded-full border-sky-300 bg-white/80 text-sky-700 dark:border-sky-800 dark:bg-sky-950/30 dark:text-sky-200" onClick={() => handleBulkAction(action)}>
                        {action}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <ContactsTable
              contacts={filteredContacts}
              selectedIds={selectedIds}
              onToggleAll={handleToggleAll}
              onToggleOne={handleToggleOne}
              onOpenContact={handleOpenContact}
              getAssignedStaffName={getAssignedStaffName}
            />
          </div>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                <p className="text-lg font-semibold text-slate-950 dark:text-white">Import Contract</p>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">{contactExportContract.purpose}</p>
              <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">{patientOnboardingContract.purpose}</p>
            </div>

            <div className="rounded-[28px] border border-white/70 bg-white/90 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
              <p className="text-lg font-semibold text-slate-950 dark:text-white">Operational Snapshot</p>
              <div className="mt-4 space-y-3">
                {contacts.slice(0, 3).map((contact) => (
                  <div key={contact.id} className="rounded-[20px] border border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/40">
                    <p className="text-sm font-medium text-slate-950 dark:text-white">{contact.fullName}</p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{contact.contactType} • {formatDate(contact.lastInteraction)}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>
      </div>

      <AddContactDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSave={handleSaveContact}
        validateDraft={(draft) => validateContactDraft(draft, contacts)}
      />

      <ImportContactsDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onConfirmImport={handleImportConfirm}
      />

      <ExportContactsDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        filteredCount={filteredContacts.length}
        patientCount={patients.length}
        onConfirmExport={handleExportConfirm}
      />

      <ContactDetailDrawer
        open={detailOpen}
        onOpenChange={setDetailOpen}
        contact={selectedContact}
        assignedStaffName={selectedContact ? getAssignedStaffName(selectedContact.assignedStaffId) : 'Unassigned'}
        onConvertToPatient={() => {
          if (selectedContact) {
            handleOpenOnboarding(selectedContact.id);
          }
        }}
        onOpenPatientProfile={() => {
          if (selectedContact?.patientConnection?.patientId) {
            setPatientProfileId(selectedContact.patientConnection.patientId);
            setPatientProfileOpen(true);
          }
        }}
      />

      <PatientOnboardingWizard
        open={onboardingOpen}
        onOpenChange={setOnboardingOpen}
        contact={onboardingContact}
        initialPatient={patients.find((patient) => patient.contactId === onboardingContactId) || null}
        onComplete={handleCompleteOnboarding}
      />

      <PatientProfileDrawer
        open={patientProfileOpen}
        onOpenChange={setPatientProfileOpen}
        patient={selectedPatientProfile}
        onOpenOnboarding={(contactId) => handleOpenOnboarding(contactId)}
      />
    </WhatsAppAdminLayout>
  );
};

export default WhatsAppContactsWorkspacePage;
