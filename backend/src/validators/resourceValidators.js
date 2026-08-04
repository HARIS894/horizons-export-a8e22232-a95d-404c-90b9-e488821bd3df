import { body } from 'express-validator';

const requiredString = (field, label) => body(field).trim().notEmpty().withMessage(`${label} is required.`);
const optionalString = (field) => body(field).optional().isString().trim();
const optionalArray = (field) => body(field).optional().isArray().withMessage(`${field} must be an array.`);
const optionalObject = (field) => body(field).optional().isObject().withMessage(`${field} must be an object.`);

export const resourceValidators = {
  patients: {
    create: [
      requiredString('personalDetails.fullName', 'Patient full name'),
      requiredString('personalDetails.phone', 'Patient phone'),
      optionalString('personalDetails.bloodGroup'),
      optionalArray('medicalHistory'),
      optionalArray('allergies'),
      optionalObject('insurance'),
      optionalObject('hospital'),
      optionalObject('doctor'),
      optionalObject('healthcareCoordinator'),
      optionalObject('assignedNurse'),
      optionalObject('assignedCaregiver'),
      optionalObject('assignedDriver'),
      optionalArray('timeline'),
      optionalArray('medicalReports'),
      optionalArray('photos'),
      optionalArray('consentForms'),
      optionalArray('familyMembers'),
    ],
    update: [optionalObject('personalDetails'), optionalArray('timeline'), optionalArray('medicalReports')],
  },
  enquiries: {
    create: [requiredString('fullName', 'Full name'), requiredString('phone', 'Phone'), requiredString('serviceRequired', 'Service required')],
    update: [optionalString('status'), optionalString('priority'), optionalString('assignedTo')],
  },
  services: {
    create: [requiredString('name', 'Service name'), requiredString('slug', 'Service slug')],
    update: [optionalString('name'), optionalString('slug'), optionalString('category')],
  },
  doctors: {
    create: [requiredString('fullName', 'Doctor name'), requiredString('speciality', 'Speciality')],
    update: [optionalString('fullName'), optionalString('speciality'), optionalString('city')],
  },
  nurses: {
    create: [requiredString('fullName', 'Nurse name'), requiredString('qualification', 'Qualification')],
    update: [optionalString('fullName'), optionalString('qualification'), optionalString('city')],
  },
  hospitals: {
    create: [requiredString('name', 'Hospital name'), requiredString('city', 'City')],
    update: [optionalString('name'), optionalString('city'), optionalArray('departments')],
  },
  appointments: {
    create: [requiredString('patientName', 'Patient name'), requiredString('doctorName', 'Doctor name'), requiredString('scheduledAt', 'Scheduled time')],
    update: [optionalString('status'), optionalString('scheduledAt'), optionalString('visitType')],
  },
  staff: {
    create: [requiredString('fullName', 'Staff name'), requiredString('role', 'Role')],
    update: [optionalString('fullName'), optionalString('role'), optionalString('availability')],
  },
  insurance: {
    create: [requiredString('provider', 'Insurance provider'), requiredString('policyNumber', 'Policy number')],
    update: [optionalString('claimStatus'), optionalString('approvalStatus'), optionalArray('documents')],
  },
  billing: {
    create: [requiredString('invoiceNumber', 'Invoice number'), body('amount').isNumeric().withMessage('Amount must be numeric.')],
    update: [optionalString('status'), body('amount').optional().isNumeric().withMessage('Amount must be numeric.')],
  },
  reports: {
    create: [requiredString('reportType', 'Report type'), requiredString('patientName', 'Patient name')],
    update: [optionalString('status'), optionalArray('attachments')],
  },
  healthLibrary: {
    create: [requiredString('title', 'Article title'), requiredString('slug', 'Article slug'), requiredString('category', 'Category')],
    update: [optionalString('title'), optionalString('slug'), optionalString('category')],
  },
  notifications: {
    create: [requiredString('channel', 'Channel'), requiredString('message', 'Message')],
    update: [optionalString('status'), optionalString('message')],
  },
};