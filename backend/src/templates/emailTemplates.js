const brandName = 'InstantCare';
const supportEmail = 'support@instantcare.in';

const formatDateTime = (value) => {
  if (!value) {
    return 'To be confirmed';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const renderLayout = ({ subject, preheader, heading, intro, sections, outro }) => {
  const sectionHtml = sections
    .map(
      (section) => `
        <tr>
          <td style="padding: 0 32px 20px;">
            <div style="border: 1px solid #dbe5ea; border-radius: 18px; padding: 20px 22px; background: #f8fbfc;">
              <div style="font-size: 13px; letter-spacing: 0.08em; text-transform: uppercase; color: #5d7884; margin-bottom: 10px; font-weight: 700;">${escapeHtml(section.label)}</div>
              <div style="font-size: 15px; line-height: 1.7; color: #15323d; white-space: pre-line;">${escapeHtml(section.value)}</div>
            </div>
          </td>
        </tr>`,
    )
    .join('');

  const html = `
    <!doctype html>
    <html>
      <body style="margin:0;padding:0;background:#eef5f7;font-family:Arial,sans-serif;color:#15323d;">
        <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef5f7;padding:24px 12px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:680px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 50px rgba(14,42,54,0.12);">
                <tr>
                  <td style="padding:32px;background:linear-gradient(135deg,#0f5b6e,#1d8f7a);color:#ffffff;">
                    <div style="font-size:13px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.82;font-weight:700;">${brandName}</div>
                    <div style="font-size:30px;line-height:1.2;font-weight:700;margin-top:14px;">${escapeHtml(heading)}</div>
                    <div style="font-size:15px;line-height:1.7;max-width:520px;margin-top:12px;color:rgba(255,255,255,0.92);">${escapeHtml(intro)}</div>
                  </td>
                </tr>
                ${sectionHtml}
                <tr>
                  <td style="padding:4px 32px 32px;font-size:14px;line-height:1.7;color:#45606b;">${escapeHtml(outro)}</td>
                </tr>
                <tr>
                  <td style="padding:22px 32px;background:#f1f7f8;font-size:13px;line-height:1.7;color:#5d7884;">
                    Need assistance? Reply to this email or contact ${escapeHtml(supportEmail)}.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>`;

  const text = [
    subject,
    '',
    heading,
    intro,
    '',
    ...sections.flatMap((section) => [`${section.label}: ${section.value}`, '']),
    outro,
    '',
    `Need assistance? Contact ${supportEmail}.`,
  ].join('\n');

  return { html, text };
};

const defaultAdminRecipient = 'support@instantcare.in';

export const supportedEmailTemplateTypes = [
  'new-enquiry',
  'admin-notification',
  'client-confirmation',
  'appointment-confirmation',
  'invoice-email',
  'daily-report-email',
  'email-otp',
];

const templates = {
  'new-enquiry': (data) => {
    const subject = `New enquiry from ${data.fullName || data.patientName || 'Website visitor'}`;
    const sections = [
      { label: 'Contact', value: `${data.fullName || 'N/A'}\n${data.email || 'No email provided'}\n${data.mobileNumber || data.phone || 'No mobile number'}\nWhatsApp: ${data.whatsappNumber || 'Not shared'}` },
      { label: 'Care Request', value: `${data.serviceRequired || 'General support'}\nCondition: ${data.medicalCondition || 'Not specified'}\nPreferred language: ${data.preferredLanguage || 'Not specified'}` },
      { label: 'Patient Details', value: `${data.patientName || 'Not shared'}\nAge: ${data.patientAge || 'N/A'}\nGender: ${data.gender || 'N/A'}\nCity: ${data.city || 'N/A'}` },
      { label: 'Schedule', value: `${data.preferredDate || 'Flexible'} ${data.preferredTime || ''}`.trim() || 'Flexible' },
    ];

    return {
      subject,
      to: data.to || defaultAdminRecipient,
      preheader: 'A new patient enquiry has been submitted to InstantCare.',
      ...renderLayout({
        subject,
        preheader: 'A new patient enquiry has been submitted to InstantCare.',
        heading: 'New Enquiry Received',
        intro: 'A new healthcare enquiry is ready for triage and follow-up by the InstantCare team.',
        sections,
        outro: data.additionalNotes || 'Please review the request and coordinate the next action promptly.',
      }),
    };
  },
  'admin-notification': (data) => {
    const subject = data.subject || 'InstantCare admin notification';
    return {
      subject,
      to: data.to || defaultAdminRecipient,
      preheader: data.preheader || 'An operational update requires admin visibility.',
      ...renderLayout({
        subject,
        preheader: data.preheader || 'An operational update requires admin visibility.',
        heading: data.heading || 'Administrative Alert',
        intro: data.intro || 'An operational event has been generated inside InstantCare.',
        sections: data.sections || [{ label: 'Message', value: data.message || 'No message provided.' }],
        outro: data.outro || 'Review this alert in the admin dashboard and take action if needed.',
      }),
    };
  },
  'client-confirmation': (data) => {
    const subject = data.subject || 'We received your InstantCare request';
    return {
      subject,
      to: data.to || data.email,
      preheader: 'Your healthcare enquiry has been received by InstantCare.',
      ...renderLayout({
        subject,
        preheader: 'Your healthcare enquiry has been received by InstantCare.',
        heading: `Hello ${data.fullName || data.patientName || 'there'},`,
        intro: 'Your request has been received. Our care coordination team will review the details and contact you shortly.',
        sections: [
          { label: 'Service Requested', value: data.serviceRequired || 'General healthcare support' },
          { label: 'Reference', value: data.reference || 'Pending assignment' },
          { label: 'Preferred Contact', value: data.mobileNumber || data.phone || data.whatsappNumber || 'We will use your submitted contact details.' },
        ],
        outro: 'If you need urgent help, reply to this email and our team will prioritize your request.',
      }),
    };
  },
  'appointment-confirmation': (data) => {
    const subject = data.subject || 'Your InstantCare appointment is confirmed';
    return {
      subject,
      to: data.to || data.email,
      preheader: 'Appointment details from InstantCare.',
      ...renderLayout({
        subject,
        preheader: 'Appointment details from InstantCare.',
        heading: 'Appointment Confirmed',
        intro: 'Your appointment has been scheduled successfully. Please review the details below.',
        sections: [
          { label: 'Patient', value: data.patientName || data.fullName || 'Not specified' },
          { label: 'Date & Time', value: formatDateTime(data.scheduledAt || data.scheduled_start) },
          { label: 'Clinician', value: data.doctorName || data.nurseName || 'To be assigned' },
          { label: 'Location', value: data.hospitalName || data.location || 'To be confirmed' },
          { label: 'Service', value: data.serviceName || data.serviceRequired || 'Care appointment' },
        ],
        outro: data.notes || 'If you need to reschedule, contact the InstantCare team as early as possible.',
      }),
    };
  },
  'invoice-email': (data) => {
    const subject = data.subject || `Invoice ${data.invoiceNumber || ''}`.trim();
    return {
      subject,
      to: data.to || data.email,
      preheader: 'A new invoice has been issued by InstantCare.',
      ...renderLayout({
        subject,
        preheader: 'A new invoice has been issued by InstantCare.',
        heading: 'Invoice Ready',
        intro: 'Your invoice has been generated. Please review the billing details below.',
        sections: [
          { label: 'Invoice Number', value: data.invoiceNumber || 'Pending' },
          { label: 'Patient', value: data.patientName || 'Not specified' },
          { label: 'Amount Due', value: `${data.currencyCode || 'INR'} ${data.totalAmount || data.amount || '0.00'}` },
          { label: 'Due Date', value: data.dueDate || 'Not specified' },
        ],
        outro: data.paymentInstructions || 'Reply to this email if you need help with billing or documentation.',
      }),
    };
  },
  'daily-report-email': (data) => {
    const subject = data.subject || `Daily Care Report${data.patientName ? ` for ${data.patientName}` : ''}`;
    return {
      subject,
      to: data.to || data.email,
      preheader: 'A new daily care report is available from InstantCare.',
      ...renderLayout({
        subject,
        preheader: 'A new daily care report is available from InstantCare.',
        heading: 'Daily Care Report',
        intro: 'The latest patient care summary is ready for review.',
        sections: [
          { label: 'Patient', value: data.patientName || 'Not specified' },
          { label: 'Report Date', value: data.reportDate || new Date().toISOString().slice(0, 10) },
          { label: 'Vitals Summary', value: data.vitalsSummary || 'No vitals summary attached.' },
          { label: 'Care Notes', value: data.dailyNotes || data.summary || 'No care notes provided.' },
        ],
        outro: data.outro || 'Reply to this email if the family needs clarification or an escalation call.',
      }),
    };
  },
  'email-otp': (data) => {
    const subject = data.subject || 'Your InstantCare verification code';
    return {
      subject,
      to: data.to || data.email,
      preheader: 'Use this verification code to continue your InstantCare request.',
      ...renderLayout({
        subject,
        preheader: 'Use this verification code to continue your InstantCare request.',
        heading: 'Verification Code',
        intro: 'Use the one-time password below to verify your identity and continue securely.',
        sections: [
          { label: 'One-Time Password', value: data.otp || 'Not available' },
          { label: 'Expires In', value: data.expiresIn || '15 minutes' },
          { label: 'Purpose', value: data.purpose || 'Account verification' },
        ],
        outro: 'If you did not request this code, please ignore this email and contact support if needed.',
      }),
    };
  },
};

export const renderEmailTemplate = (templateType, templateData = {}) => {
  const template = templates[templateType];
  if (!template) {
    throw new Error(`Unsupported email template type: ${templateType}`);
  }

  return template(templateData);
};