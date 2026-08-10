export const PATIENT_ONBOARDING_STATUSES = ['Draft', 'Pending Review', 'Active', 'On Hold', 'Completed'];

export const PATIENT_WORKSPACE_FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'pending-review', label: 'Pending Review' },
  { key: 'on-hold', label: 'On Hold' },
  { key: 'completed', label: 'Completed' },
];

export const PAYMENT_STATUS_OPTIONS = ['All', 'Paid', 'Partially Paid', 'Pending'];

export const PATIENT_STATUS_META = {
  Draft: 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-900 dark:text-amber-200',
  'Pending Review': 'border-sky-300 bg-sky-500/10 text-sky-700 dark:border-sky-900 dark:text-sky-200',
  Active: 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200',
  'On Hold': 'border-violet-300 bg-violet-500/10 text-violet-700 dark:border-violet-900 dark:text-violet-200',
  Completed: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
};

export const PAYMENT_STATUS_META = {
  Paid: 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200',
  'Partially Paid': 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-900 dark:text-amber-200',
  Pending: 'border-rose-300 bg-rose-500/10 text-rose-700 dark:border-rose-900 dark:text-rose-200',
};

export const PATIENT_ONBOARDING_STEPS = [
  { key: 'contact', label: 'Contact' },
  { key: 'details', label: 'Patient Details' },
  { key: 'healthcare', label: 'Healthcare Information' },
  { key: 'family', label: 'Family / NRI Contact' },
  { key: 'services', label: 'Services' },
  { key: 'staff', label: 'Assigned Staff' },
  { key: 'documents', label: 'Documents' },
  { key: 'review', label: 'Review' },
];

export const PATIENT_GENDER_OPTIONS = ['Female', 'Male', 'Other'];
export const PATIENT_SERVICE_OPTIONS = ['Post-Hospital Care', 'ICU at Home', 'Nurse at Home', 'Physiotherapy', 'Doctor Visit', 'Elder Care'];
export const PATIENT_SCHEDULE_OPTIONS = ['Daily', 'Alternate Days', 'Weekly', 'Custom'];
export const PATIENT_DOCUMENT_OPTIONS = ['Discharge Summary', 'Prescription', 'Investigation Report', 'Consent Form', 'Insurance Copy'];

export const createEmptyPatientDraft = (contact = null) => ({
  contactId: contact?.id || '',
  onboardingStatus: 'Draft',
  patientName: contact?.patientConnection?.patientName || contact?.fullName || '',
  patientExternalId: '',
  dob: '',
  age: '',
  gender: 'Female',
  phone: contact?.phone || '',
  whatsappNumber: contact?.whatsappNumber || contact?.phone || '',
  address: '',
  city: contact?.city || '',
  pincode: contact?.pincode || '',
  emergencyContact: '',
  emergencyPhone: '',
  familyContact: contact?.fullName || '',
  familyPhone: contact?.whatsappNumber || contact?.phone || '',
  familyLocation: contact?.isNriFamily ? contact?.nriCountry || '' : contact?.city || '',
  medicalNotes: '',
  careRequirements: '',
  doctor: '',
  assignedNurse: '',
  serviceType: 'Post-Hospital Care',
  preferredVisitSchedule: 'Daily',
  documents: [],
  paymentStatus: 'Pending',
  totalBilled: 'Rs 0',
  paidAmount: 'Rs 0',
  outstandingPayment: 'Rs 0',
  invoiceStatus: 'Draft',
  nextAppointment: 'Not scheduled',
  lastWhatsAppInteraction: contact?.lastInteraction || '',
  importantNotes: '',
  allergies: '',
  medications: '',
  diagnosisNotes: '',
  emergencyInformation: '',
});
