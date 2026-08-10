export const TEMPLATE_STATUSES = {
  DRAFT: 'DRAFT',
  VALIDATING: 'VALIDATING',
  READY_TO_SUBMIT: 'READY_TO_SUBMIT',
  SUBMITTED: 'SUBMITTED',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PAUSED: 'PAUSED',
  ARCHIVED: 'ARCHIVED',
  DISABLED: 'DISABLED',
};

export const META_TEMPLATE_STATUSES = {
  NOT_SUBMITTED: 'NOT_SUBMITTED',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PAUSED: 'PAUSED',
  DISABLED: 'DISABLED',
  UNKNOWN: 'UNKNOWN',
};

export const TEMPLATE_INTERNAL_CATEGORIES = [
  'Healthcare',
  'Appointments',
  'Nursing',
  'Insurance',
  'TPA',
  'Care Coordination',
  'AI Assisted',
  'Other',
];

export const TEMPLATE_META_CATEGORIES = ['UTILITY', 'MARKETING', 'AUTHENTICATION'];

export const TEMPLATE_CATEGORIES = ['Marketing', 'Utility', 'Authentication'];

export const TEMPLATE_LANGUAGES = ['English (India)', 'Hindi', 'Tamil', 'Telugu', 'Malayalam'];

export const TEMPLATE_HEADER_TYPES = ['None', 'Text', 'Image', 'Video', 'Document'];

export const TEMPLATE_BUTTON_TYPES = ['Quick Reply', 'Website CTA', 'Phone CTA'];

export const TEMPLATE_LIBRARY_TABS = ['All', 'Drafts', 'Ready', 'Pending', 'Approved', 'Rejected', 'Paused', 'Archived'];

export const TEMPLATE_THEME_OPTIONS = ['light', 'dark', 'system'];

export const TEMPLATE_SOURCE_TYPES = {
  LOCAL: 'LOCAL',
  STARTER: 'STARTER',
  AI: 'AI',
  DUPLICATED: 'DUPLICATED',
  META_APPROVED: 'META_APPROVED',
};

export const TEMPLATE_SORT_OPTIONS = [
  { value: 'updated-desc', label: 'Recently Updated' },
  { value: 'created-desc', label: 'Recently Created' },
  { value: 'name-asc', label: 'Name' },
  { value: 'status', label: 'Status' },
];

export const TEMPLATE_STATUS_META = {
  [TEMPLATE_STATUSES.DRAFT]: {
    label: 'Draft',
    shortLabel: 'Draft',
    className: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
    description: 'Work in progress and not yet ready for submission.',
  },
  [TEMPLATE_STATUSES.VALIDATING]: {
    label: 'Validating',
    shortLabel: 'Validating',
    className: 'border-blue-300 bg-blue-500/10 text-blue-700 dark:border-blue-900 dark:text-blue-200',
    description: 'Draft is undergoing local readiness checks.',
  },
  [TEMPLATE_STATUSES.READY_TO_SUBMIT]: {
    label: 'Ready for Meta Review',
    shortLabel: 'Ready',
    className: 'border-cyan-300 bg-cyan-500/10 text-cyan-700 dark:border-cyan-900 dark:text-cyan-200',
    description: 'Locally ready, but not yet submitted to Meta.',
  },
  [TEMPLATE_STATUSES.SUBMITTED]: {
    label: 'Submitted',
    shortLabel: 'Submitted',
    className: 'border-sky-300 bg-sky-500/10 text-sky-700 dark:border-sky-900 dark:text-sky-200',
    description: 'Submitted through the future provider workflow.',
  },
  [TEMPLATE_STATUSES.PENDING]: {
    label: 'Pending',
    shortLabel: 'Pending',
    className: 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-900 dark:text-amber-200',
    description: 'Awaiting Meta review or provider sync.',
  },
  [TEMPLATE_STATUSES.APPROVED]: {
    label: 'Approved',
    shortLabel: 'Approved',
    className: 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200',
    description: 'Template is active and ready for future flow usage.',
  },
  [TEMPLATE_STATUSES.REJECTED]: {
    label: 'Rejected',
    shortLabel: 'Rejected',
    className: 'border-rose-300 bg-rose-500/10 text-rose-700 dark:border-rose-900 dark:text-rose-200',
    description: 'Template needs revision before resubmission.',
  },
  [TEMPLATE_STATUSES.PAUSED]: {
    label: 'Paused',
    shortLabel: 'Paused',
    className: 'border-orange-300 bg-orange-500/10 text-orange-700 dark:border-orange-900 dark:text-orange-200',
    description: 'Temporarily paused for operational reasons.',
  },
  [TEMPLATE_STATUSES.ARCHIVED]: {
    label: 'Archived',
    shortLabel: 'Archived',
    className: 'border-stone-300 bg-stone-500/10 text-stone-700 dark:border-stone-800 dark:text-stone-200',
    description: 'Retained for history and reuse, but inactive for editing flow.',
  },
  [TEMPLATE_STATUSES.DISABLED]: {
    label: 'Disabled',
    shortLabel: 'Disabled',
    className: 'border-slate-400 bg-slate-200 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
    description: 'Inactive and unavailable for future flow usage.',
  },
};

export const META_STATUS_META = {
  [META_TEMPLATE_STATUSES.NOT_SUBMITTED]: {
    label: 'Not Submitted',
    className: 'border-slate-300 bg-transparent text-slate-600 dark:border-slate-700 dark:text-slate-300',
  },
  [META_TEMPLATE_STATUSES.PENDING]: {
    label: 'Pending Meta Review',
    className: 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-900 dark:text-amber-200',
  },
  [META_TEMPLATE_STATUSES.APPROVED]: {
    label: 'Approved by Meta',
    className: 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200',
  },
  [META_TEMPLATE_STATUSES.REJECTED]: {
    label: 'Rejected by Meta',
    className: 'border-rose-300 bg-rose-500/10 text-rose-700 dark:border-rose-900 dark:text-rose-200',
  },
  [META_TEMPLATE_STATUSES.PAUSED]: {
    label: 'Paused by Meta',
    className: 'border-orange-300 bg-orange-500/10 text-orange-700 dark:border-orange-900 dark:text-orange-200',
  },
  [META_TEMPLATE_STATUSES.DISABLED]: {
    label: 'Disabled by Meta',
    className: 'border-slate-400 bg-slate-200 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300',
  },
  [META_TEMPLATE_STATUSES.UNKNOWN]: {
    label: 'Unknown Provider Status',
    className: 'border-stone-300 bg-stone-500/10 text-stone-700 dark:border-stone-800 dark:text-stone-200',
  },
};

export const TEMPLATE_SOURCE_META = {
  [TEMPLATE_SOURCE_TYPES.LOCAL]: { label: 'Local Draft', className: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200' },
  [TEMPLATE_SOURCE_TYPES.STARTER]: { label: 'Starter', className: 'border-teal-300 bg-teal-500/10 text-teal-700 dark:border-teal-900 dark:text-teal-200' },
  [TEMPLATE_SOURCE_TYPES.AI]: { label: 'AI Draft', className: 'border-violet-300 bg-violet-500/10 text-violet-700 dark:border-violet-900 dark:text-violet-200' },
  [TEMPLATE_SOURCE_TYPES.DUPLICATED]: { label: 'Duplicated', className: 'border-blue-300 bg-blue-500/10 text-blue-700 dark:border-blue-900 dark:text-blue-200' },
  [TEMPLATE_SOURCE_TYPES.META_APPROVED]: { label: 'Previously Approved', className: 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200' },
};