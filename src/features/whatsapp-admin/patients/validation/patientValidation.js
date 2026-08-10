export const validatePatientDraftStep = (draft, stepKey) => {
  const errors = {};

  if (stepKey === 'contact') {
    if (!String(draft.contactId || '').trim()) {
      errors.contactId = 'A source contact must be selected.';
    }
  }

  if (stepKey === 'details') {
    if (!String(draft.patientName || '').trim()) {
      errors.patientName = 'Patient name is required.';
    }
    if (!String(draft.age || '').trim() && !String(draft.dob || '').trim()) {
      errors.age = 'Provide either age or date of birth.';
    }
    if (!String(draft.phone || '').trim()) {
      errors.phone = 'Patient phone is required.';
    }
  }

  if (stepKey === 'healthcare') {
    if (!String(draft.careRequirements || '').trim()) {
      errors.careRequirements = 'Care requirements are required.';
    }
    if (!String(draft.medicalNotes || '').trim()) {
      errors.medicalNotes = 'Medical notes are required.';
    }
  }

  if (stepKey === 'family') {
    if (!String(draft.familyContact || '').trim()) {
      errors.familyContact = 'Family or NRI contact is required.';
    }
    if (!String(draft.familyPhone || '').trim()) {
      errors.familyPhone = 'Family or NRI phone is required.';
    }
  }

  if (stepKey === 'services') {
    if (!String(draft.serviceType || '').trim()) {
      errors.serviceType = 'Service type is required.';
    }
  }

  if (stepKey === 'staff') {
    if (!String(draft.doctor || '').trim()) {
      errors.doctor = 'Assigned doctor is required.';
    }
  }

  if (stepKey === 'documents') {
    if (!Array.isArray(draft.documents) || !draft.documents.length) {
      errors.documents = 'Select at least one onboarding document.';
    }
  }

  return errors;
};

export const buildPatientProfileFromDraft = (draft, contact, selectedStaff = []) => ({
  id: `patient-${Date.now()}`,
  patientExternalId: draft.patientExternalId || `IC-PAT-${Date.now().toString().slice(-5)}`,
  contactId: contact.id,
  onboardingStatus: draft.onboardingStatus,
  patientName: draft.patientName,
  dob: draft.dob,
  age: draft.age,
  gender: draft.gender,
  phone: draft.phone,
  whatsappNumber: draft.whatsappNumber || draft.phone,
  address: draft.address,
  city: draft.city,
  pincode: draft.pincode,
  emergencyContact: draft.emergencyContact,
  emergencyPhone: draft.emergencyPhone,
  familyContact: draft.familyContact,
  familyPhone: draft.familyPhone,
  familyLocation: draft.familyLocation,
  medicalNotes: draft.medicalNotes,
  careRequirements: draft.careRequirements,
  importantNotes: draft.importantNotes || '',
  doctor: draft.doctor,
  assignedNurse: draft.assignedNurse,
  serviceType: draft.serviceType,
  preferredVisitSchedule: draft.preferredVisitSchedule,
  documents: draft.documents,
  paymentStatus: draft.paymentStatus || 'Pending',
  totalBilled: draft.totalBilled || 'Rs 0',
  paidAmount: draft.paidAmount || 'Rs 0',
  outstandingPayment: draft.outstandingPayment || 'Rs 0',
  invoiceStatus: draft.invoiceStatus || 'Draft',
  nextAppointment: draft.nextAppointment || 'Pending scheduling',
  lastWhatsAppInteraction: draft.lastWhatsAppInteraction || contact.lastInteraction,
  allergies: draft.allergies || '',
  medications: draft.medications || '',
  diagnosisNotes: draft.diagnosisNotes || '',
  emergencyInformation: draft.emergencyInformation || '',
  serviceStatus: draft.onboardingStatus,
  serviceStartDate: 'Pending activation',
  serviceEndDate: 'TBD',
  appointments: [draft.nextAppointment || 'Pending scheduling'],
  staff: selectedStaff,
  otherAssignedStaff: selectedStaff.slice(2),
  serviceHistory: [{
    id: `svc-${Date.now()}`,
    name: draft.serviceType,
    startDate: 'Pending activation',
    endDate: 'TBD',
    status: draft.onboardingStatus,
    nurse: draft.assignedNurse || 'Unassigned',
    doctor: draft.doctor || 'Unassigned',
  }],
  upcomingAppointments: draft.nextAppointment && draft.nextAppointment !== 'Pending scheduling'
    ? [{ id: `appt-${Date.now()}`, type: draft.serviceType, dateTime: draft.nextAppointment, staff: draft.doctor || draft.assignedNurse || 'Unassigned', status: 'Scheduled' }]
    : [],
  previousAppointments: [],
  documentsDetailed: (draft.documents || []).map((document, index) => ({
    id: `doc-${Date.now()}-${index}`,
    category: 'Onboarding',
    name: document,
    uploadDate: new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
    status: 'Captured locally',
  })),
  paymentHistory: [{
    id: `pay-${Date.now()}`,
    label: 'Onboarding financial snapshot',
    amount: draft.totalBilled || 'Rs 0',
    date: new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()),
    status: draft.paymentStatus || 'Pending',
  }],
  activityTimeline: [{
    id: `act-${Date.now()}`,
    type: 'onboarding',
    label: 'Patient onboarding completed locally in Phase 2B.1',
    time: new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date()),
  }],
  activity: ['Patient onboarding completed locally in Phase 2B'],
});
