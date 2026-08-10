export const contactImportContract = {
  purpose: 'Maps external contact rows into a stable local contact draft before any live provider integration exists.',
  acceptedSources: ['Google Sheets', 'CSV Upload', 'Spreadsheet Import'],
  stableFields: ['fullName', 'phone', 'whatsappNumber', 'email', 'relationship', 'contactType', 'city', 'pincode', 'preferredCommunication', 'notes'],
  duplicateStrategy: 'preview-only',
  liveIntegrationStatus: 'Future integration via the Integrations module',
};

export const contactExportContract = {
  purpose: 'Generates export-ready contact or patient rows from filtered local workspace state.',
  supportedExports: ['CSV', 'Contacts Export', 'Patients Export', 'Google Sheets Placeholder'],
  liveIntegrationStatus: 'Google Sheets export remains intentionally inactive in Phase 2B',
};

export const patientOnboardingContract = {
  purpose: 'Captures patient onboarding state from a contact without requiring backend writes in this phase.',
  completionStates: ['Draft', 'Pending Review', 'Active', 'On Hold', 'Completed'],
  mutationMode: 'local-only',
};
