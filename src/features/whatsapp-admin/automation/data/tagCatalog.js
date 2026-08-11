export const automationTagCatalog = [
  { id: 'tag-appointment', label: 'Appointment', group: 'Operations' },
  { id: 'tag-reminder', label: 'Reminder', group: 'Operations' },
  { id: 'tag-payment', label: 'Payment', group: 'Finance' },
  { id: 'tag-nurse', label: 'Nurse', group: 'Care Team' },
  { id: 'tag-doctor', label: 'Doctor', group: 'Care Team' },
  { id: 'tag-patient', label: 'Patient', group: 'People' },
  { id: 'tag-nri', label: 'NRI', group: 'People' },
  { id: 'tag-elderly-care', label: 'Elderly Care', group: 'Programs' },
  { id: 'tag-cancer-care', label: 'Cancer Care', group: 'Programs' },
  { id: 'tag-insurance', label: 'Insurance', group: 'Finance' },
  { id: 'tag-discharge', label: 'Discharge', group: 'Clinical Ops' },
  { id: 'tag-follow-up', label: 'Follow-up', group: 'Clinical Ops' },
  { id: 'tag-urgent', label: 'Urgent', group: 'Priority' },
];

export const automationTagLabels = automationTagCatalog.map((tag) => tag.label);

export const findAutomationTags = (query) => {
  const searchTerm = String(query || '').trim().toLowerCase();
  if (!searchTerm) {
    return automationTagCatalog;
  }

  return automationTagCatalog.filter((tag) => `${tag.label} ${tag.group}`.toLowerCase().includes(searchTerm));
};