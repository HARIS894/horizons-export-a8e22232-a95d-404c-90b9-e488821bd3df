const supportPhone = '+91 support via InstantCare';

const compactText = (lines) => lines.filter(Boolean).join('\n');

export const supportedWhatsappTemplateTypes = [
  'new-enquiry',
  'appointment-reminder',
  'medicine-reminder',
  'daily-update',
  'emergency-alert',
  'invoice',
  'payment-reminder',
  'family-update',
  'nri-update',
];

const templates = {
  'new-enquiry': (data) => ({
    preview: `New enquiry: ${data.fullName || data.patientName || 'Lead'} - ${data.serviceRequired || 'Healthcare support'}`,
    body: compactText([
      '*InstantCare New Enquiry*',
      `Name: ${data.fullName || 'N/A'}`,
      `Phone: ${data.mobileNumber || data.phone || 'N/A'}`,
      `Service: ${data.serviceRequired || 'N/A'}`,
      `Condition: ${data.medicalCondition || 'Not specified'}`,
      `City: ${data.city || 'N/A'}`,
      data.additionalNotes ? `Notes: ${data.additionalNotes}` : '',
    ]),
  }),
  'appointment-reminder': (data) => ({
    preview: `Appointment reminder for ${data.patientName || data.fullName || 'patient'}`,
    body: compactText([
      `Hello ${data.fullName || data.patientName || ''},`,
      'This is a reminder from InstantCare about your upcoming appointment.',
      `Patient: ${data.patientName || data.fullName || 'N/A'}`,
      `Date: ${data.appointmentDate || data.scheduledDate || 'N/A'}`,
      `Time: ${data.appointmentTime || data.scheduledTime || 'N/A'}`,
      `Hospital/Location: ${data.hospitalName || data.location || 'To be confirmed'}`,
      `Doctor: ${data.doctorName || 'To be assigned'}`,
      'Reply if you need support or rescheduling assistance.',
    ]),
  }),
  'medicine-reminder': (data) => ({
    preview: `Medicine reminder for ${data.patientName || 'patient'}`,
    body: compactText([
      `Hello ${data.fullName || data.patientName || ''},`,
      'This is your InstantCare medicine reminder.',
      `Patient: ${data.patientName || 'N/A'}`,
      `Medicine: ${data.medicineName || 'N/A'}`,
      `Dosage: ${data.dosage || 'N/A'}`,
      `Time: ${data.reminderTime || 'N/A'}`,
      data.instructions ? `Instructions: ${data.instructions}` : '',
    ]),
  }),
  'daily-update': (data) => ({
    preview: `Daily update for ${data.patientName || 'patient'}`,
    body: compactText([
      `*InstantCare Daily Update*`,
      `Patient: ${data.patientName || 'N/A'}`,
      `Date: ${data.reportDate || new Date().toISOString().slice(0, 10)}`,
      `Vitals: ${data.vitalsSummary || 'No vitals summary shared.'}`,
      `Notes: ${data.summary || data.dailyNotes || 'No additional notes.'}`,
      'Reply if you want a detailed callback from our care team.',
    ]),
  }),
  'emergency-alert': (data) => ({
    preview: `Emergency alert for ${data.patientName || 'patient'}`,
    body: compactText([
      '*InstantCare Emergency Alert*',
      `Patient: ${data.patientName || 'N/A'}`,
      `Alert: ${data.alertMessage || data.summary || 'Immediate assistance needed.'}`,
      `Location: ${data.location || data.hospitalName || 'N/A'}`,
      `Coordinator: ${data.coordinatorName || 'InstantCare Team'}`,
      `Contact: ${data.coordinatorPhone || data.mobileNumber || 'Support will call shortly.'}`,
    ]),
  }),
  invoice: (data) => ({
    preview: `Invoice ${data.invoiceNumber || ''}`.trim(),
    body: compactText([
      `Hello ${data.fullName || data.patientName || ''},`,
      'Your InstantCare invoice is ready.',
      `Invoice: ${data.invoiceNumber || 'N/A'}`,
      `Amount: ${data.currencyCode || 'INR'} ${data.totalAmount || data.amount || '0.00'}`,
      `Due Date: ${data.dueDate || 'N/A'}`,
      data.paymentLink ? `Payment Link: ${data.paymentLink}` : '',
      'Reply if you need invoice assistance or documents.',
    ]),
  }),
  'payment-reminder': (data) => ({
    preview: `Payment reminder for invoice ${data.invoiceNumber || ''}`.trim(),
    body: compactText([
      `Hello ${data.fullName || data.patientName || ''},`,
      'This is a payment reminder from InstantCare.',
      `Invoice: ${data.invoiceNumber || 'N/A'}`,
      `Outstanding Amount: ${data.currencyCode || 'INR'} ${data.balanceDueAmount || data.amount || '0.00'}`,
      `Due Date: ${data.dueDate || 'N/A'}`,
      data.paymentLink ? `Payment Link: ${data.paymentLink}` : '',
    ]),
  }),
  'family-update': (data) => ({
    preview: `Family update for ${data.patientName || 'patient'}`,
    body: compactText([
      '*InstantCare Family Update*',
      `Patient: ${data.patientName || 'N/A'}`,
      `Status: ${data.statusSummary || 'Stable and under care.'}`,
      `Update: ${data.summary || data.dailyNotes || 'No additional notes.'}`,
      `Hospital: ${data.hospitalName || 'N/A'}`,
      `Coordinator: ${data.coordinatorName || 'InstantCare Team'}`,
    ]),
  }),
  'nri-update': (data) => ({
    preview: `NRI update for ${data.patientName || 'patient'}`,
    body: compactText([
      '*InstantCare NRI Family Update*',
      `Patient: ${data.patientName || 'N/A'}`,
      `Current Status: ${data.statusSummary || 'Stable and monitored.'}`,
      `Clinical Summary: ${data.summary || 'No additional summary.'}`,
      `Next Step: ${data.nextStep || 'Coordinator follow-up pending.'}`,
      `Support: ${data.supportEmail || 'support@instantcare.in'}`,
    ]),
  }),
};

export const renderWhatsappTemplate = (templateType, templateData = {}) => {
  const template = templates[templateType];
  if (!template) {
    throw new Error(`Unsupported WhatsApp template type: ${templateType}`);
  }

  const rendered = template(templateData);
  return {
    ...rendered,
    supportPhone,
  };
};