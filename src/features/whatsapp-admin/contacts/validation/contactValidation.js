const normalizeDigits = (value) => String(value || '').replace(/\D/g, '');

export const validateContactDraft = (draft, contacts = []) => {
  const errors = {};
  const phone = normalizeDigits(draft.phone);
  const whatsappNumber = normalizeDigits(draft.whatsappNumber || draft.phone);

  if (!String(draft.fullName || '').trim()) {
    errors.fullName = 'Full name is required.';
  }

  if (!String(draft.countryCode || '').trim()) {
    errors.countryCode = 'Country code is required.';
  }

  if (phone.length < 10) {
    errors.phone = 'Phone number must contain at least 10 digits.';
  }

  if (whatsappNumber.length < 10) {
    errors.whatsappNumber = 'WhatsApp number must contain at least 10 digits.';
  }

  if (draft.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(draft.email))) {
    errors.email = 'Enter a valid email address.';
  }

  if (draft.pincode && !/^\d{5,6}$/.test(String(draft.pincode))) {
    errors.pincode = 'Pincode should be 5 to 6 digits.';
  }

  const duplicate = contacts.find((contact) => normalizeDigits(contact.phone) === phone || normalizeDigits(contact.whatsappNumber) === whatsappNumber);
  if (duplicate) {
    errors.duplicate = `${duplicate.fullName} already uses this phone or WhatsApp number.`;
  }

  return errors;
};

export const mapImportPreviewSummary = (rows) => {
  const accepted = rows.filter((row) => row.accepted).length;
  const rejected = rows.length - accepted;
  const duplicates = rows.filter((row) => row.duplicate).length;

  return {
    total: rows.length,
    accepted,
    rejected,
    duplicates,
  };
};

export const createContactFromDraft = (draft, contacts = []) => ({
  id: `contact-${Date.now()}`,
  fullName: String(draft.fullName || '').trim(),
  countryCode: draft.countryCode || '+91',
  phone: normalizeDigits(draft.phone),
  whatsappNumber: normalizeDigits(draft.whatsappNumber || draft.phone),
  email: String(draft.email || '').trim(),
  relationship: draft.relationship || 'Self',
  contactType: draft.contactType || 'Patient',
  isNriFamily: Boolean(draft.isNriFamily),
  nriCountry: draft.isNriFamily ? String(draft.nriCountry || 'International').trim() : '',
  city: String(draft.city || '').trim(),
  pincode: String(draft.pincode || '').trim(),
  preferredCommunication: draft.preferredCommunication || 'WhatsApp',
  notes: String(draft.notes || '').trim(),
  whatsappStatus: 'warm',
  patientStatus: draft.convertToPatient ? 'draft' : 'not-linked',
  assignedStaffId: '',
  lastInteraction: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  source: 'Manual Entry',
  tags: draft.isNriFamily ? ['NRI family'] : ['New contact'],
  recentActivity: [
    {
      id: `activity-${Date.now()}`,
      label: 'Contact created from Contacts workspace',
      time: new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', hour: 'numeric', minute: '2-digit' }).format(new Date()),
    },
  ],
  patientConnection: draft.convertToPatient
    ? {
        patientId: '',
        patientName: String(draft.fullName || '').trim(),
        onboardingStatus: 'Draft',
      }
    : null,
  duplicateAgainstCount: contacts.length,
});
