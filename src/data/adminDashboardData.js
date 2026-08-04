import adminDashboardData from '@/data/adminDashboardData.json';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const compactNumberFormatter = new Intl.NumberFormat('en-IN', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const enquiryStages = ['New', 'Contacted', 'Follow Up', 'Converted', 'Closed'];
const appointmentStages = ['Scheduled', 'Reschedule', 'Cancel', 'Follow Up'];
const staffRoles = ['Nurse', 'Doctor', 'Physiotherapist', 'Caregiver', 'Coordinator', 'Driver'];

const isToday = (value) => {
  const targetDate = new Date(value);
  const today = new Date();
  return targetDate.toDateString() === today.toDateString();
};

const sum = (items, selector) => items.reduce((total, item) => total + selector(item), 0);

export const adminDashboardTabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'patients', label: 'Patients' },
  { key: 'enquiries', label: 'Enquiries' },
  { key: 'staff', label: 'Staff' },
  { key: 'hospitals', label: 'Hospitals' },
  { key: 'appointments', label: 'Appointments' },
  { key: 'insurance', label: 'Insurance & TPA' },
  { key: 'billing', label: 'Billing' },
  { key: 'whatsapp', label: 'WhatsApp Centre' },
  { key: 'reports', label: 'Reports' },
  { key: 'settings', label: 'Settings' },
];

export const getAdminDashboardData = () => adminDashboardData;

export const buildAdminDashboardViewModel = (data = adminDashboardData) => {
  const totalRevenue = sum(data.billing.payments, (item) => item.amount);
  const activeServices = new Set(data.patients.map((patient) => patient.serviceLine)).size;
  const pendingEnquiries = data.enquiries.filter((item) => ['New', 'Contacted', 'Follow Up'].includes(item.status)).length;
  const emergencyCases = data.patients.filter((patient) => ['High', 'Critical'].includes(patient.riskLevel)).length;
  const todaysVisits = data.appointments.filter((appointment) => isToday(appointment.scheduledAt)).length;
  const overviewMetrics = [
    {
      key: 'totalPatients',
      label: 'Total Patients',
      value: `${data.patients.length}`,
      detail: 'Patients under active coordination',
      tone: 'cyan',
      trend: '+8.4% this month',
    },
    {
      key: 'activeServices',
      label: 'Active Services',
      value: `${activeServices}`,
      detail: 'Service lines currently deployed',
      tone: 'violet',
      trend: '3 cities live today',
    },
    {
      key: 'pendingEnquiries',
      label: 'Pending Enquiries',
      value: `${pendingEnquiries}`,
      detail: 'Awaiting action or follow-up',
      tone: 'amber',
      trend: '2 priority escalations',
    },
    {
      key: 'todaysVisits',
      label: "Today's Visits",
      value: `${todaysVisits}`,
      detail: 'Doctor and home visits scheduled',
      tone: 'sky',
      trend: '1 home ICU review due',
    },
    {
      key: 'revenue',
      label: 'Revenue',
      value: compactNumberFormatter.format(totalRevenue),
      detail: 'Collected across channels',
      tone: 'emerald',
      trend: currencyFormatter.format(totalRevenue),
    },
    {
      key: 'emergencyCases',
      label: 'Emergency Cases',
      value: `${emergencyCases}`,
      detail: 'High-risk care pathways active',
      tone: 'rose',
      trend: 'Rapid response always-on',
    },
  ];

  const enquirySummary = enquiryStages.map((status) => ({
    status,
    count: data.enquiries.filter((item) => item.status === status).length,
  }));

  const staffSummary = staffRoles.map((role) => ({
    role,
    count: data.staff.filter((member) => member.role === role).length,
  }));

  const billingSummary = {
    invoices: data.billing.invoices.length,
    paidAmount: sum(data.billing.invoices.filter((invoice) => invoice.status === 'Paid'), (invoice) => invoice.amount),
    pendingAmount: sum(data.billing.pendingBills, (bill) => bill.amount),
    refundAmount: sum(data.billing.refunds, (refund) => refund.amount),
  };

  return {
    ...data,
    enquiryStages,
    appointmentStages,
    staffRoles,
    overviewMetrics,
    enquirySummary,
    staffSummary,
    billingSummary,
    formatCurrency: (value) => currencyFormatter.format(value),
    formatCompactNumber: (value) => compactNumberFormatter.format(value),
  };
};