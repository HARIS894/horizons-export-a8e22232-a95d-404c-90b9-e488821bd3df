import { buildWhatsAppUrl, siteContact } from '@/config/siteConfig';

const INQUIRY_STORAGE_KEY = 'instantcare_inquiries';
const INQUIRY_DRAFT_KEY = 'instantcare_inquiry_draft';
const INQUIRY_OPEN_EVENT = 'instantcare:open-inquiry';
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024;
const MAX_TOTAL_UPLOAD_BYTES = 6 * 1024 * 1024;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const formatCurrency = (value) => value || 'Not specified';
const safeValue = (value) => value?.toString().trim() || 'Not provided';

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
  reader.readAsDataURL(file);
});

const normalizeFiles = async (files, category) => Promise.all(
  files.map(async (file) => ({
    id: `${category}-${Date.now()}-${file.name}`,
    category,
    name: file.name,
    type: file.type || 'application/octet-stream',
    size: file.size,
    uploadedAt: new Date().toISOString(),
    dataUrl: await readFileAsDataUrl(file),
  })),
);

const buildInquirySummaryLines = (inquiry) => [
  `Name: ${safeValue(inquiry.name)}`,
  `Country: ${safeValue(inquiry.country)}`,
  `Phone: ${safeValue(inquiry.phone)}`,
  `WhatsApp: ${safeValue(inquiry.whatsapp)}`,
  `Email: ${safeValue(inquiry.email)}`,
  `City: ${safeValue(inquiry.city)}`,
  `PIN Code: ${safeValue(inquiry.pincode)}`,
  `Current Location: ${safeValue(inquiry.currentLocation)}`,
  `GPS Coordinates: ${inquiry.gpsLocation?.latitude && inquiry.gpsLocation?.longitude ? `${inquiry.gpsLocation.latitude}, ${inquiry.gpsLocation.longitude}` : 'Not captured'}`,
  `Patient Name: ${safeValue(inquiry.patientName)}`,
  `Patient Age: ${safeValue(inquiry.patientAge)}`,
  `Gender: ${safeValue(inquiry.gender)}`,
  `Medical Condition: ${safeValue(inquiry.medicalCondition)}`,
  `Preferred Service: ${safeValue(inquiry.preferredService)}`,
  `Preferred Language: ${safeValue(inquiry.preferredLanguage)}`,
  `Budget: ${formatCurrency(inquiry.budget)}`,
  `Preferred Date: ${safeValue(inquiry.preferredDate)}`,
  `Preferred Time: ${safeValue(inquiry.preferredTime)}`,
  `Hospital Name: ${safeValue(inquiry.hospitalName)}`,
  `Doctor Name: ${safeValue(inquiry.doctorName)}`,
  `Additional Notes: ${safeValue(inquiry.additionalNotes)}`,
  `Attachments: ${inquiry.attachments.length ? inquiry.attachments.map((file) => `${file.name} (${file.category})`).join(', ') : 'None'}`,
];

const buildInquiryIntegrationPayload = (values, attachments) => ({
  source: values.source || 'website-inquiry',
  submittedAt: new Date().toISOString(),
  contact: {
    fullName: values.name,
    country: values.country,
    mobileNumber: values.phone,
    whatsappNumber: values.whatsapp,
    email: values.email,
    preferredLanguage: values.preferredLanguage,
    city: values.city,
    pincode: values.pincode,
  },
  patient: {
    name: values.patientName,
    age: Number(values.patientAge),
    gender: values.gender,
    medicalCondition: values.medicalCondition,
    hospitalName: values.hospitalName || null,
    doctorName: values.doctorName || null,
  },
  serviceRequest: {
    serviceRequired: values.preferredService,
    preferredDate: values.preferredDate,
    preferredTime: values.preferredTime,
    budget: values.budget || null,
    additionalNotes: values.additionalNotes || null,
  },
  location: {
    manualAddress: values.currentLocation,
    coordinates: values.gpsLocation || null,
  },
  uploads: attachments.map((file) => ({
    id: file.id,
    category: file.category,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
    uploadedAt: file.uploadedAt,
  })),
});

export const inquiryBudgetOptions = [
  'Under INR 10,000',
  'INR 10,000 - 25,000',
  'INR 25,000 - 50,000',
  'INR 50,000 - 1,00,000',
  'Above INR 1,00,000',
  'Need guidance',
];

export const inquiryLanguageOptions = [
  'English',
  'Hindi',
  'Marathi',
  'Gujarati',
  'Tamil',
  'Telugu',
  'Kannada',
  'Malayalam',
  'Punjabi',
];

export const inquiryGenderOptions = [
  'Male',
  'Female',
  'Other',
  'Prefer not to say',
];

export const inquiryInitialValues = {
  name: '',
  country: '',
  phone: '',
  whatsapp: '',
  email: '',
  patientName: '',
  patientAge: '',
  gender: '',
  city: '',
  pincode: '',
  currentLocation: '',
  gpsLocation: null,
  preferredLanguage: 'English',
  preferredService: '',
  medicalCondition: '',
  budget: '',
  hospitalName: '',
  doctorName: '',
  preferredDate: '',
  preferredTime: '',
  medicalReports: [],
  additionalNotes: '',
  privacyAccepted: false,
};

export const requestOpenInquiry = (detail = {}) => {
  window.dispatchEvent(new CustomEvent(INQUIRY_OPEN_EVENT, { detail }));
};

export const onOpenInquiryRequest = (handler) => {
  const listener = (event) => handler(event.detail || {});
  window.addEventListener(INQUIRY_OPEN_EVENT, listener);
  return () => window.removeEventListener(INQUIRY_OPEN_EVENT, listener);
};

export const inquiryStorage = {
  key: INQUIRY_STORAGE_KEY,
  draftKey: INQUIRY_DRAFT_KEY,
  getAll() {
    return JSON.parse(localStorage.getItem(INQUIRY_STORAGE_KEY) || '[]');
  },
  saveDraft(data) {
    localStorage.setItem(INQUIRY_DRAFT_KEY, JSON.stringify(data));
  },
  loadDraft() {
    return JSON.parse(localStorage.getItem(INQUIRY_DRAFT_KEY) || 'null');
  },
  clearDraft() {
    localStorage.removeItem(INQUIRY_DRAFT_KEY);
  },
  save(inquiry) {
    const existing = inquiryStorage.getAll();
    const updated = [inquiry, ...existing];
    localStorage.setItem(INQUIRY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },
  updateStatus(id, status) {
    const updated = inquiryStorage.getAll().map((inquiry) => (
      inquiry.id === id ? { ...inquiry, status, updatedAt: new Date().toISOString() } : inquiry
    ));
    localStorage.setItem(INQUIRY_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },
};

export const validateInquiryFiles = ({ medicalReports }) => {
  const combinedFiles = [...medicalReports];
  const totalSize = combinedFiles.reduce((sum, file) => sum + file.size, 0);

  if (combinedFiles.some((file) => file.size > MAX_FILE_SIZE_BYTES)) {
    return 'Each uploaded file must be 2 MB or smaller.';
  }

  if (totalSize > MAX_TOTAL_UPLOAD_BYTES) {
    return 'Total uploads must be 6 MB or smaller.';
  }

  return null;
};

export const buildInquiryEmailLink = (inquiry) => {
  const subject = `New InstantCare enquiry for ${safeValue(inquiry.patientName)}`;
  const body = [
    'New InstantCare website enquiry',
    '',
    ...buildInquirySummaryLines(inquiry),
    '',
    'Note: Uploaded files are stored in the admin dashboard for review.',
  ].join('\n');

  return `mailto:${siteContact.supportEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

export const buildInquiryWhatsappMessage = (inquiry) => [
  'Hello InstantCare, I would like to submit a professional care enquiry.',
  '',
  ...buildInquirySummaryLines(inquiry),
  '',
  'Please contact me with the next steps.',
].join('\n');

export const buildInquiryWhatsappLink = (inquiry) => buildWhatsAppUrl(buildInquiryWhatsappMessage(inquiry));

export const submitInquiry = async (values) => {
  await delay(700);

  const medicalReports = await normalizeFiles(values.medicalReports || [], 'medical-report');
  const integrationPayload = buildInquiryIntegrationPayload(values, medicalReports);
  const inquiry = {
    id: `INQ-${Date.now()}`,
    status: 'new',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: values.source || 'website-contact',
    ...values,
    attachments: medicalReports,
    payloadVersion: '2026-08-04',
    integrationPayload,
  };

  delete inquiry.medicalReports;

  inquiryStorage.save(inquiry);

  return {
    success: true,
    inquiry,
    emailLink: buildInquiryEmailLink(inquiry),
    whatsappLink: buildInquiryWhatsappLink(inquiry),
  };
};

export { buildInquiryIntegrationPayload };