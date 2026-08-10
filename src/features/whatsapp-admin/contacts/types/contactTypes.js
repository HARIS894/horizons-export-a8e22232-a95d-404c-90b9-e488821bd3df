export const CONTACT_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'patient', label: 'Patient' },
  { key: 'family-member', label: 'Family Member' },
  { key: 'nri-family', label: 'NRI Family' },
  { key: 'unassigned', label: 'Unassigned' },
  { key: 'recently-added', label: 'Recently Added' },
];

export const CONTACT_TYPE_OPTIONS = [
  'Patient',
  'Family Member',
  'NRI Family',
  'Care Coordinator',
  'Referral Partner',
];

export const RELATIONSHIP_OPTIONS = [
  'Self',
  'Daughter',
  'Son',
  'Spouse',
  'Brother',
  'Sister',
  'Grandchild',
  'Case Manager',
  'Other',
];

export const COMMUNICATION_OPTIONS = [
  'WhatsApp',
  'Phone',
  'Email',
  'WhatsApp + Phone',
  'WhatsApp + Email',
];

export const CONTACT_SOURCE_OPTIONS = [
  'WhatsApp Inquiry',
  'Website Form',
  'Referral',
  'Hospital Desk',
  'Google Sheets Import',
  'Manual Entry',
];

export const WHATSAPP_STATUS_META = {
  active: {
    label: 'Connected',
    className: 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200',
  },
  warm: {
    label: 'Warm Lead',
    className: 'border-cyan-300 bg-cyan-500/10 text-cyan-700 dark:border-cyan-900 dark:text-cyan-200',
  },
  dormant: {
    label: 'Dormant',
    className: 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-900 dark:text-amber-200',
  },
  blocked: {
    label: 'Attention',
    className: 'border-rose-300 bg-rose-500/10 text-rose-700 dark:border-rose-900 dark:text-rose-200',
  },
};

export const CONTACT_PATIENT_STATUS_META = {
  'not-linked': {
    label: 'Not Linked',
    className: 'border-slate-300 bg-transparent text-slate-600 dark:border-slate-700 dark:text-slate-300',
  },
  draft: {
    label: 'Draft',
    className: 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-900 dark:text-amber-200',
  },
  'pending-review': {
    label: 'Pending Review',
    className: 'border-sky-300 bg-sky-500/10 text-sky-700 dark:border-sky-900 dark:text-sky-200',
  },
  active: {
    label: 'Active Patient',
    className: 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200',
  },
  'on-hold': {
    label: 'On Hold',
    className: 'border-violet-300 bg-violet-500/10 text-violet-700 dark:border-violet-900 dark:text-violet-200',
  },
  completed: {
    label: 'Completed',
    className: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
  },
};

export const BULK_ACTION_OPTIONS = [
  'Assign staff',
  'Add tag',
  'Export selection',
  'Start onboarding',
];

export const createEmptyContactDraft = () => ({
  fullName: '',
  countryCode: '+91',
  phone: '',
  whatsappNumber: '',
  email: '',
  relationship: 'Self',
  contactType: 'Patient',
  isNriFamily: false,
  city: '',
  pincode: '',
  preferredCommunication: 'WhatsApp',
  notes: '',
  convertToPatient: false,
});
