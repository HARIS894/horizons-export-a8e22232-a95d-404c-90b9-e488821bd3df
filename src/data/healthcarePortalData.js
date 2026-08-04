import portalData from '@/data/healthcarePortalData.json';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const timelineTypes = [
  'Admission',
  'Doctor Visit',
  'Hospital Transfer',
  'Nurse Visit',
  'Medicine Given',
  'Vitals Updated',
  'Physiotherapy',
  'Lab Reports',
  'Billing',
  'Insurance',
  'Discharge',
  'Home Visit',
  'Emergency',
];

const familyChannels = ['WhatsApp', 'Email', 'Video Update', 'Voice Note', 'PDF Report', 'Daily Summary', 'Weekly Summary'];

const formatCurrency = (value) => currencyFormatter.format(value || 0);

export const getHealthcarePortalData = () => portalData;

export const buildHealthcarePortalViewModel = (data = portalData) => {
  const patientsById = Object.fromEntries(data.patientProfiles.map((patient) => [patient.id, patient]));

  return {
    ...data,
    timelineTypes,
    familyChannels,
    patientsById,
    formatCurrency,
    getPatientTimeline: (patientId) => data.timelineEvents.filter((event) => event.patientId === patientId).sort((left, right) => new Date(right.time) - new Date(left.time)),
    getPatientDailyReport: (patientId) => data.dailyCareReports.find((report) => report.patientId === patientId) || null,
    getPatientFamilyUpdates: (patientId) => data.familyUpdates.filter((update) => update.patientId === patientId).sort((left, right) => new Date(right.sentAt) - new Date(left.sentAt)),
    getPatientCoordination: (patientId) => data.hospitalCoordination.find((item) => item.patientId === patientId) || null,
    getPatientInsuranceCase: (patientId) => data.insuranceCases.find((item) => item.patientId === patientId) || null,
    liveTimeline: data.timelineEvents.filter((event) => event.patientId === data.nriDashboard.liveTimelinePatientId).sort((left, right) => new Date(right.time) - new Date(left.time)),
  };
};