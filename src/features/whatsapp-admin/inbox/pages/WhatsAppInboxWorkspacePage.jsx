import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Link2,
  Loader2,
  MessageSquareText,
  Paperclip,
  Phone,
  RefreshCw,
  RotateCcw,
  Search,
  SendHorizontal,
  ShieldAlert,
  Sparkles,
  UserRound,
  Users,
  XCircle,
} from 'lucide-react';
import { instantcareApi } from '@/api/instantcareApi';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import WhatsAppAdminLayout from '../../layout/WhatsAppAdminLayout';
import { mockTemplates } from '../../templates/data/templateMockData';
import {
  META_STATUS_META,
  META_TEMPLATE_STATUSES,
  TEMPLATE_STATUS_META,
  TEMPLATE_STATUSES,
} from '../../templates/types/templateTypes';

const CONVERSATION_PAGE_SIZE = 50;
const MESSAGE_PAGE_SIZE = 25;
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'assigned', label: 'Assigned to Me' },
  { key: 'unassigned', label: 'Unassigned' },
  { key: 'priority', label: 'Priority' },
  { key: 'waiting', label: 'Waiting' },
  { key: 'closed', label: 'Closed' },
];
const COMPOSER_TABS = [
  { key: 'message', label: 'Message' },
  { key: 'template', label: 'Template' },
  { key: 'attachment', label: 'Attachment' },
  { key: 'note', label: 'Internal Note' },
  { key: 'flow', label: 'Flow' },
];
const TEMPLATE_STATUS_FILTERS = ['All', 'Approved', 'Pending', 'Draft', 'Rejected', 'Paused', 'Disabled'];

const getFriendlyError = (error, fallback) => {
  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

const normalizePhone = (value) => String(value || '').replace(/\D/g, '');

const getLogTimestamp = (log) => log?.created_at || log?.createdAt || log?.updated_at || log?.updatedAt || null;

const formatDateTime = (value, fallback = 'Unavailable') => {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const getPreviewText = (log) => {
  const body = String(log?.message_body || '').trim();
  if (body) {
    return body;
  }

  if (log?.template_name) {
    return `[${log.template_name}]`;
  }

  return 'Message unavailable';
};

const sortLogsAscending = (logs) => {
  return [...logs].sort((left, right) => {
    const leftTime = new Date(getLogTimestamp(left) || 0).getTime();
    const rightTime = new Date(getLogTimestamp(right) || 0).getTime();
    return leftTime - rightTime;
  });
};

const getMessageKindLabel = (log) => {
  if (log?.message_kind === 'template') {
    return 'Template';
  }

  if (log?.message_kind === 'system' || (!log?.direction && !log?.message_body && !log?.template_name)) {
    return 'System';
  }

  if (log?.message_kind === 'inbound' || log?.direction === 'inbound') {
    return 'Inbound';
  }

  return 'Free-form';
};

const getConversationStatus = (conversation) => {
  const rawStatus = conversation?.status || conversation?.conversation_status || conversation?.latest_log?.status || 'open';
  return String(rawStatus || 'open').replace(/_/g, ' ');
};

const getPriorityValue = (conversation) => {
  const rawPriority = conversation?.priority || conversation?.priority_level || conversation?.metadata?.priority || '';
  return String(rawPriority || '').trim();
};

const getAssignmentLabel = (conversation) => {
  return conversation?.assigned_agent_name
    || conversation?.assignedTo?.name
    || conversation?.assignedTo?.full_name
    || conversation?.assigned_to_name
    || conversation?.owner_name
    || conversation?.assignee_name
    || '';
};

const getAssignmentIdentity = (conversation) => {
  return conversation?.assigned_agent_email
    || conversation?.assignedTo?.email
    || conversation?.assigned_to_email
    || conversation?.owner_email
    || getAssignmentLabel(conversation);
};

const getContactTags = (contact) => {
  if (Array.isArray(contact?.tags)) {
    return contact.tags.filter(Boolean);
  }

  if (Array.isArray(contact?.metadata?.tags)) {
    return contact.metadata.tags.filter(Boolean);
  }

  return [];
};

const getConversationServiceLabel = (conversation) => {
  return conversation?.service_name
    || conversation?.contact?.service_name
    || conversation?.contact?.metadata?.service
    || conversation?.latest_log?.metadata?.service
    || '';
};

const isWaitingConversation = (conversation) => {
  const status = String(conversation?.status || '').toLowerCase();
  if (status.includes('waiting')) {
    return true;
  }

  return false;
};

const isClosedConversation = (conversation) => {
  const status = String(conversation?.status || '').toLowerCase();
  return status.includes('closed');
};

const getStatusTone = (status) => {
  const normalized = String(status || '').toLowerCase();
  if (normalized.includes('failed') || normalized.includes('rejected')) {
    return 'border-rose-300 bg-rose-500/10 text-rose-700 dark:border-rose-900 dark:text-rose-200';
  }
  if (normalized.includes('read') || normalized.includes('delivered')) {
    return 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200';
  }
  if (normalized.includes('queued') || normalized.includes('pending') || normalized.includes('waiting')) {
    return 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-900 dark:text-amber-200';
  }
  if (normalized.includes('sent') || normalized.includes('open')) {
    return 'border-cyan-300 bg-cyan-500/10 text-cyan-700 dark:border-cyan-900 dark:text-cyan-200';
  }
  if (normalized.includes('closed')) {
    return 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200';
  }

  return 'border-slate-300 bg-transparent text-slate-600 dark:border-slate-700 dark:text-slate-300';
};

const getPriorityTone = (priority) => {
  const normalized = String(priority || '').toLowerCase();
  if (normalized.includes('high') || normalized.includes('urgent') || normalized.includes('critical')) {
    return 'border-rose-300 bg-rose-500/10 text-rose-700 dark:border-rose-900 dark:text-rose-200';
  }
  if (normalized.includes('medium')) {
    return 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-900 dark:text-amber-200';
  }

  return 'border-slate-300 bg-transparent text-slate-600 dark:border-slate-700 dark:text-slate-300';
};

const buildAgentOptions = (staff, currentUser) => {
  const seen = new Map();

  const pushAgent = (candidate, source = 'staff') => {
    if (!candidate) {
      return;
    }

    const id = candidate.id || candidate.userId || candidate.email || candidate.phone || candidate.name;
    const label = candidate.full_name || candidate.name || candidate.display_name || candidate.email || candidate.phone;
    if (!id || !label || seen.has(id)) {
      return;
    }

    const rawStatus = candidate.presence_status || candidate.presenceStatus || candidate.availability_status || candidate.availabilityStatus || '';
    const normalizedStatus = ['online', 'away', 'offline'].includes(String(rawStatus).toLowerCase()) ? String(rawStatus).toLowerCase() : '';

    seen.set(id, {
      id,
      label,
      email: candidate.email || '',
      role: candidate.role || candidate.designation || candidate.staff_role || 'Agent',
      status: normalizedStatus,
      source,
    });
  };

  (staff || []).forEach((member) => pushAgent(member, 'staff-api'));

  if (currentUser) {
    pushAgent({
      id: currentUser.id || currentUser.email || currentUser.name,
      full_name: currentUser.name || currentUser.full_name,
      email: currentUser.email,
      role: 'Current Admin',
    }, 'session');
  }

  return [...seen.values()];
};

const getAgentStatusMeta = (status) => {
  if (status === 'online') {
    return { label: 'Online', className: 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200' };
  }
  if (status === 'away') {
    return { label: 'Away', className: 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-900 dark:text-amber-200' };
  }
  if (status === 'offline') {
    return { label: 'Offline', className: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200' };
  }

  return { label: 'Status unavailable', className: 'border-slate-300 bg-transparent text-slate-600 dark:border-slate-700 dark:text-slate-300' };
};

const doesIdentityMatch = (assignmentIdentity, currentUser) => {
  const assignment = String(assignmentIdentity || '').trim().toLowerCase();
  const candidates = [currentUser?.email, currentUser?.name, currentUser?.full_name]
    .map((value) => String(value || '').trim().toLowerCase())
    .filter(Boolean);

  return Boolean(assignment && candidates.some((candidate) => candidate === assignment));
};

const matchesFilter = (conversation, filterKey, currentUser) => {
  if (filterKey === 'all') {
    return true;
  }

  if (filterKey === 'unread') {
    return Number(conversation?.unread_count || 0) > 0;
  }

  if (filterKey === 'assigned') {
    return doesIdentityMatch(getAssignmentIdentity(conversation), currentUser);
  }

  if (filterKey === 'unassigned') {
    return !getAssignmentLabel(conversation);
  }

  if (filterKey === 'priority') {
    return Boolean(getPriorityValue(conversation));
  }

  if (filterKey === 'waiting') {
    return isWaitingConversation(conversation);
  }

  if (filterKey === 'closed') {
    return isClosedConversation(conversation);
  }

  return true;
};

const isTemplateSendableByStatus = (template) => {
  return template.localStatus === TEMPLATE_STATUSES.APPROVED && template.metaStatus === META_TEMPLATE_STATUSES.APPROVED;
};

const matchPatientRecord = (conversation, patients) => {
  const phone = normalizePhone(conversation?.phone_number);
  const name = String(conversation?.display_name || '').trim().toLowerCase();

  return (patients || []).find((patient) => {
    const patientPhone = normalizePhone(patient?.phone || patient?.phoneNumber || patient?.contact_number || patient?.whatsapp_number);
    const patientName = String(patient?.name || patient?.full_name || '').trim().toLowerCase();
    return (phone && patientPhone && phone === patientPhone) || (name && patientName && name === patientName);
  }) || null;
};

const matchAppointmentRecord = (conversation, appointments) => {
  const phone = normalizePhone(conversation?.phone_number);
  const name = String(conversation?.display_name || '').trim().toLowerCase();

  return (appointments || []).find((appointment) => {
    const appointmentPhone = normalizePhone(
      appointment?.phone
      || appointment?.phoneNumber
      || appointment?.patient_phone
      || appointment?.contact_number,
    );
    const appointmentName = String(
      appointment?.patient_name
      || appointment?.patientName
      || appointment?.name
      || '',
    ).trim().toLowerCase();
    return (phone && appointmentPhone && phone === appointmentPhone) || (name && appointmentName && name === appointmentName);
  }) || null;
};

const matchBillingRecord = (conversation, billing) => {
  const phone = normalizePhone(conversation?.phone_number);
  const name = String(conversation?.display_name || '').trim().toLowerCase();

  return (billing || []).find((invoice) => {
    const invoicePhone = normalizePhone(
      invoice?.phone
      || invoice?.phoneNumber
      || invoice?.patient_phone
      || invoice?.contact_number,
    );
    const invoiceName = String(invoice?.patient_name || invoice?.name || '').trim().toLowerCase();
    return (phone && invoicePhone && phone === invoicePhone) || (name && invoiceName && name === invoiceName);
  }) || null;
};

const InfoRow = ({ label, value, className }) => (
  <div className={cn('rounded-2xl border border-slate-200/70 bg-slate-50/70 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/40', className)}>
    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
    <p className="mt-2 text-sm text-slate-900 dark:text-slate-100">{value || 'Unavailable'}</p>
  </div>
);

const MessageThreadItem = ({ log, onRetry, retryingId }) => {
  const label = getMessageKindLabel(log);
  const isSystem = label === 'System';
  const isInbound = !isSystem && (log?.direction === 'inbound' || log?.message_kind === 'inbound');
  const canRetry = !isInbound && !isSystem && Boolean(log?.can_retry);

  return (
    <div className={cn('flex', isSystem ? 'justify-center' : isInbound ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'max-w-[85%] rounded-[22px] border px-4 py-3 shadow-sm',
          isSystem
            ? 'border-slate-300 bg-slate-100/90 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
            : isInbound
              ? 'border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100'
              : 'border-cyan-200 bg-cyan-500/10 text-slate-900 dark:border-cyan-900 dark:bg-cyan-500/15 dark:text-slate-100',
        )}
      >
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
          <span>{isSystem ? 'System' : isInbound ? 'Customer' : 'InstantCare'}</span>
          <Badge variant="outline" className="rounded-full border-slate-300 bg-transparent px-2 py-0 text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:text-slate-300">
            {label}
          </Badge>
          {log?.status ? (
            <Badge variant="outline" className={cn('rounded-full px-2 py-0 text-[10px] font-medium capitalize', getStatusTone(log.status))}>
              {String(log.status).replace(/_/g, ' ')}
            </Badge>
          ) : null}
        </div>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{getPreviewText(log)}</p>
        {log?.delivery_failure_reason ? (
          <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50/80 px-3 py-2 text-xs leading-5 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/20 dark:text-rose-200">
            <p>{log.delivery_failure_reason}</p>
            {log?.retry_block_reason ? <p className="mt-1 text-rose-600 dark:text-rose-300">{log.retry_block_reason}</p> : null}
          </div>
        ) : null}
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>{formatDateTime(getLogTimestamp(log), 'Just now')}</span>
          {canRetry ? (
            <Button type="button" variant="ghost" size="sm" className="h-7 rounded-full px-2 text-xs" disabled={retryingId === log.id} onClick={() => onRetry(log.id)}>
              {retryingId === log.id ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="mr-1 h-3.5 w-3.5" />}
              Retry
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

const ConversationListItem = ({ conversation, isActive, onSelect }) => {
  const unreadCount = Number(conversation?.unread_count || 0);
  const serviceWindowOpen = Boolean(conversation?.can_send_freeform);
  const assignmentLabel = getAssignmentLabel(conversation);
  const priorityValue = getPriorityValue(conversation);
  const serviceLabel = getConversationServiceLabel(conversation);

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={cn(
        'w-full rounded-[22px] border px-4 py-4 text-left transition-colors',
        isActive
          ? 'border-emerald-400 bg-emerald-500/10 shadow-sm shadow-emerald-950/10 dark:border-emerald-700 dark:bg-emerald-950/20'
          : 'border-slate-200/80 bg-white/80 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700 dark:hover:bg-slate-950/60',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate font-semibold text-slate-950 dark:text-white">{conversation.display_name}</p>
            {assignmentLabel ? (
              <Badge variant="outline" className="rounded-full border-slate-300 bg-transparent px-2 py-0 text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:text-slate-300">
                Assigned
              </Badge>
            ) : (
              <Badge variant="outline" className="rounded-full border-slate-300 bg-transparent px-2 py-0 text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:text-slate-300">
                Unassigned
              </Badge>
            )}
            {priorityValue ? (
              <Badge variant="outline" className={cn('rounded-full px-2 py-0 text-[10px] font-medium capitalize', getPriorityTone(priorityValue))}>
                {priorityValue}
              </Badge>
            ) : null}
          </div>
          <p className="mt-1 truncate text-xs text-slate-400 dark:text-slate-500">{conversation.phone_number}</p>
          <p className="mt-2 truncate text-sm text-slate-500 dark:text-slate-400">{conversation.last_message_preview || 'No messages yet'}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={cn('rounded-full px-2 py-0 text-[10px] font-medium capitalize', getStatusTone(getConversationStatus(conversation)))}>
              {getConversationStatus(conversation)}
            </Badge>
            {serviceLabel ? (
              <Badge variant="outline" className="rounded-full border-slate-300 bg-transparent px-2 py-0 text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:text-slate-300">
                {serviceLabel}
              </Badge>
            ) : null}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">{formatDateTime(conversation.last_message_at, 'Just now')}</p>
          <Badge
            variant="outline"
            className={cn(
              'mt-2 rounded-full px-2 py-0 text-[10px] font-medium uppercase tracking-[0.18em]',
              serviceWindowOpen
                ? 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200'
                : 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-900 dark:text-amber-200',
            )}
          >
            {serviceWindowOpen ? '24h open' : 'Template only'}
          </Badge>
          {unreadCount > 0 ? (
            <Badge className="mt-2 rounded-full bg-rose-500 px-2 py-0 text-[10px] font-medium text-white hover:bg-rose-500">
              {unreadCount}
            </Badge>
          ) : null}
        </div>
      </div>
    </button>
  );
};

const InternalNoteCard = ({ note }) => (
  <div className="rounded-[22px] border border-violet-200 bg-violet-50/80 px-4 py-3 dark:border-violet-900/50 dark:bg-violet-950/20">
    <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-700 dark:text-violet-200">
      <span>Internal Note</span>
      <Badge variant="outline" className="rounded-full border-violet-300 bg-transparent px-2 py-0 text-[10px] font-medium text-violet-700 dark:border-violet-800 dark:text-violet-200">
        Local only
      </Badge>
    </div>
    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800 dark:text-slate-100">{note.body}</p>
    <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
      {note.author} · {formatDateTime(note.createdAt, 'Just now')}
    </p>
  </div>
);

const RightContextPanel = ({ conversation, contextSummary, agentOptions, selectedAgentId, onSelectedAgentIdChange, assignmentSupported }) => {
  const contact = conversation?.contact || {};
  const tags = getContactTags(contact);

  return (
    <div className="flex h-full min-h-0 flex-col rounded-[28px] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45">
      <div className="border-b border-slate-200/80 px-5 py-5 dark:border-slate-800">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Customer / Patient</p>
        <h3 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">Context</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Existing conversation data is shown directly. Future patient, payment, and agent actions remain gated until dedicated APIs are available.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Contact</p>
            <Badge variant="outline" className="rounded-full border-slate-300 px-2 py-0 text-[10px] uppercase tracking-[0.16em] text-slate-500 dark:border-slate-700 dark:text-slate-300">
              CONTACT
            </Badge>
          </div>
          <InfoRow label="Name" value={conversation?.display_name || 'Unavailable'} />
          <InfoRow label="Phone" value={conversation?.phone_number || 'Unavailable'} />
          <InfoRow label="Email" value={contact?.email || contact?.metadata?.email || 'Unavailable'} />
          <div className="rounded-2xl border border-slate-200/70 bg-slate-50/70 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Tags</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.length ? tags.map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-full border-slate-300 bg-transparent px-2 py-0 text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  {tag}
                </Badge>
              )) : <p className="text-sm text-slate-500 dark:text-slate-400">No tags linked</p>}
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-sm font-semibold text-slate-950 dark:text-white">Conversation</p>
          <InfoRow label="Status" value={getConversationStatus(conversation)} />
          <InfoRow label="Assigned Agent" value={getAssignmentLabel(conversation) || 'Unassigned'} />
          <InfoRow label="Created" value={formatDateTime(conversation?.created_at || conversation?.createdAt)} />
          <InfoRow label="Last Activity" value={formatDateTime(conversation?.last_message_at)} />
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Patient Context</p>
            {contextSummary.patient ? null : (
              <Button type="button" variant="outline" size="sm" className="rounded-full" disabled>
                Link patient
              </Button>
            )}
          </div>
          {contextSummary.patient ? (
            <div className="grid gap-3">
              <InfoRow label="Patient ID" value={contextSummary.patient.id || contextSummary.patient.patient_id || 'Unavailable'} />
              <InfoRow label="Service" value={contextSummary.service || 'Unavailable'} />
              <InfoRow label="Doctor" value={contextSummary.doctor || 'Unavailable'} />
              <InfoRow label="Nurse" value={contextSummary.nurse || 'Unavailable'} />
              <InfoRow label="Appointment" value={contextSummary.appointmentTime || 'Unavailable'} />
            </div>
          ) : (
            <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50/70 px-4 py-5 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
              <p className="font-medium text-slate-900 dark:text-white">Patient profile not linked</p>
              <p className="mt-2">Patient, doctor, nurse, and appointment details will appear here once this conversation is linked to the future patient module.</p>
            </div>
          )}
        </section>

        <section className="space-y-3">
          <p className="text-sm font-semibold text-slate-950 dark:text-white">Assigned Agent</p>
          <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/70 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/40">
            <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Available agents</label>
            <select value={selectedAgentId} onChange={(event) => onSelectedAgentIdChange(event.target.value)} className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
              <option value="">Select an agent</option>
              {agentOptions.map((agent) => (
                <option key={agent.id} value={agent.id}>{agent.label}</option>
              ))}
            </select>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button type="button" variant="outline" className="rounded-full" disabled={!assignmentSupported}>Assign</Button>
              <Button type="button" variant="outline" className="rounded-full" disabled={!assignmentSupported}>Reassign</Button>
              <Button type="button" variant="outline" className="rounded-full" disabled={!assignmentSupported}>Unassign</Button>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
              {assignmentSupported ? 'Assignment action is available through an existing API.' : 'Assignment controls are visible for planning, but remain disabled because no existing backend assignment API was found in this phase.'}
            </p>
          </div>
          <div className="space-y-2">
            {agentOptions.length ? agentOptions.map((agent) => {
              const statusMeta = getAgentStatusMeta(agent.status);
              return (
                <div key={agent.id} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/35">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-950 dark:text-white">{agent.label}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{agent.role}</p>
                  </div>
                  <Badge variant="outline" className={cn('rounded-full px-2 py-0 text-[10px] font-medium', statusMeta.className)}>
                    {statusMeta.label}
                  </Badge>
                </div>
              );
            }) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
                Staff data is unavailable for this session.
              </div>
            )}
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-sm font-semibold text-slate-950 dark:text-white">Payment</p>
          <InfoRow label="Payment Status" value={contextSummary.paymentStatus || 'Unavailable'} />
          <InfoRow label="Invoice Status" value={contextSummary.invoiceStatus || 'Unavailable'} />
        </section>

        <section className="space-y-3">
          <p className="text-sm font-semibold text-slate-950 dark:text-white">Activity</p>
          <div className="space-y-2">
            {(contextSummary.activity || []).length ? contextSummary.activity.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200/70 bg-white/80 px-3 py-3 dark:border-slate-800 dark:bg-slate-950/35">
                <p className="text-sm text-slate-900 dark:text-slate-100">{item.label}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{item.time}</p>
              </div>
            )) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
                No recent activity is available yet.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

const WhatsAppInboxWorkspacePage = () => {
  const { toast } = useToast();
  const { currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search.trim());
  const [activeFilter, setActiveFilter] = useState('all');
  const [conversations, setConversations] = useState([]);
  const [conversationPage, setConversationPage] = useState(1);
  const [conversationMeta, setConversationMeta] = useState({ page: 1, limit: CONVERSATION_PAGE_SIZE, total: 0 });
  const [conversationLoading, setConversationLoading] = useState(false);
  const [conversationError, setConversationError] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messagePage, setMessagePage] = useState(1);
  const [messageMeta, setMessageMeta] = useState({ page: 1, limit: MESSAGE_PAGE_SIZE, total: 0 });
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [retryingId, setRetryingId] = useState('');
  const [composerTab, setComposerTab] = useState('message');
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState('All');
  const [templateLanguage, setTemplateLanguage] = useState('All');
  const [templateStatus, setTemplateStatus] = useState('All');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [draftTemplateId, setDraftTemplateId] = useState('');
  const [internalNoteText, setInternalNoteText] = useState('');
  const [internalNotesByConversation, setInternalNotesByConversation] = useState({});
  const [mobileView, setMobileView] = useState('list');
  const [contextSheetOpen, setContextSheetOpen] = useState(false);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const conversationsRef = useRef([]);
  const selectedConversationIdRef = useRef('');

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  const loadConversationList = useCallback(async ({ page = 1, append = false, keepSelection = true } = {}) => {
    if (!append) {
      setConversationLoading(true);
      setConversationError('');
    }

    try {
      const result = await instantcareApi.listWhatsappConversations({
        page,
        limit: CONVERSATION_PAGE_SIZE,
        sortBy: 'last_message_at',
        sortOrder: 'desc',
        ...(deferredSearch ? { search: deferredSearch } : {}),
      });

      setConversationPage(page);
      setConversationMeta(result.meta || { page, limit: CONVERSATION_PAGE_SIZE, total: 0 });
      const mergedConversations = append ? [...conversationsRef.current, ...result.items] : result.items;
      const uniqueById = new Map();
      mergedConversations.forEach((item) => uniqueById.set(item.id, item));
      const nextConversations = [...uniqueById.values()];
      setConversations(nextConversations);

      if (!keepSelection || !nextConversations.some((conversation) => conversation.id === selectedConversationIdRef.current)) {
        setSelectedConversationId(nextConversations[0]?.id || '');
      }
    } catch (error) {
      setConversationError(getFriendlyError(error, 'Unable to load WhatsApp conversations right now.'));
    } finally {
      setConversationLoading(false);
      setRefreshing(false);
    }
  }, [deferredSearch]);

  const loadConversationMessages = useCallback(async (conversationId, { page = 1, append = false } = {}) => {
    if (!conversationId) {
      setSelectedConversation(null);
      setMessages([]);
      setMessagePage(1);
      setMessageMeta({ page: 1, limit: MESSAGE_PAGE_SIZE, total: 0 });
      return;
    }

    if (!append) {
      setMessageLoading(true);
      setMessageError('');
    }

    try {
      const result = await instantcareApi.getWhatsappConversationMessages(conversationId, {
        page,
        limit: MESSAGE_PAGE_SIZE,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });

      setSelectedConversation(result.conversation || null);
      setConversations((current) => current.map((item) => {
        if (item.id !== conversationId) {
          return item;
        }

        return {
          ...item,
          ...(result.conversation || {}),
          unread_count: 0,
        };
      }));
      setMessagePage(page);
      setMessageMeta(result.meta || { page, limit: MESSAGE_PAGE_SIZE, total: 0 });
      setMessages((current) => {
        const nextItems = append ? [...current, ...result.items] : result.items;
        const uniqueById = new Map();
        nextItems.forEach((item) => uniqueById.set(item.id, item));
        return [...uniqueById.values()];
      });
    } catch (error) {
      setMessageError(getFriendlyError(error, 'Unable to load this WhatsApp conversation right now.'));
    } finally {
      setMessageLoading(false);
    }
  }, []);

  useEffect(() => {
    setRefreshing(true);
    loadConversationList({ page: 1, append: false, keepSelection: false });
  }, [deferredSearch, loadConversationList]);

  useEffect(() => {
    if (!selectedConversationId) {
      setSelectedConversation(null);
      setMessages([]);
      return;
    }

    loadConversationMessages(selectedConversationId, { page: 1, append: false });
  }, [loadConversationMessages, selectedConversationId]);

  const agentOptions = useMemo(() => buildAgentOptions([], currentUser), [currentUser]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((conversation) => matchesFilter(conversation, activeFilter, currentUser));
  }, [activeFilter, conversations, currentUser]);

  useEffect(() => {
    if (!filteredConversations.some((conversation) => conversation.id === selectedConversationId)) {
      setSelectedConversationId(filteredConversations[0]?.id || '');
    }
  }, [filteredConversations, selectedConversationId]);

  useEffect(() => {
    if (selectedConversationId) {
      setMobileView('thread');
    }
  }, [selectedConversationId]);

  const orderedMessages = useMemo(() => sortLogsAscending(messages), [messages]);
  const hasMoreConversationLogs = conversationPage * (conversationMeta.limit || CONVERSATION_PAGE_SIZE) < (conversationMeta.total || 0);
  const hasMoreMessages = messagePage * (messageMeta.limit || MESSAGE_PAGE_SIZE) < (messageMeta.total || 0);
  const serviceWindowOpen = Boolean(selectedConversation?.can_send_freeform);
  const templateAvailable = Boolean(selectedConversation?.can_send_template);
  const serviceWindowExpiresAt = formatDateTime(selectedConversation?.customer_service_window?.expiresAt, null);
  const currentConversationNotes = internalNotesByConversation[selectedConversationId] || [];
  const selectedTemplate = useMemo(() => mockTemplates.find((template) => template.id === selectedTemplateId) || null, [selectedTemplateId]);
  const draftTemplate = useMemo(() => mockTemplates.find((template) => template.id === draftTemplateId) || null, [draftTemplateId]);
  const templatePickerSelection = selectedTemplate || draftTemplate;
  const assignmentSupported = false;
  const closeSupported = false;
  const prioritySupported = false;
  const attachmentSupported = false;

  const contextSummary = useMemo(() => {
    const patient = null;
    const appointment = null;
    const billing = null;
    const latestMessage = orderedMessages[orderedMessages.length - 1];
    const activity = [
      selectedConversation?.last_message_at ? { id: 'last-message', label: 'Last customer activity', time: formatDateTime(selectedConversation.last_message_at) } : null,
      selectedConversation?.customer_service_window?.expiresAt ? { id: 'window', label: 'Customer-service window updates', time: formatDateTime(selectedConversation.customer_service_window.expiresAt) } : null,
      latestMessage ? { id: 'latest-log', label: `${getMessageKindLabel(latestMessage)} message recorded`, time: formatDateTime(getLogTimestamp(latestMessage)) } : null,
    ].filter(Boolean);

    return {
      patient,
      service: getConversationServiceLabel(selectedConversation) || appointment?.service || appointment?.service_name || patient?.service || patient?.service_name || '',
      doctor: appointment?.doctor_name || appointment?.doctor || patient?.doctor_name || '',
      nurse: appointment?.nurse_name || appointment?.nurse || patient?.nurse_name || '',
      appointmentTime: formatDateTime(appointment?.scheduled_start || appointment?.date || appointment?.appointment_date, 'Unavailable'),
      paymentStatus: billing?.payment_status || billing?.status || '',
      invoiceStatus: billing?.invoice_status || billing?.invoiceStatus || '',
      activity,
    };
  }, [orderedMessages, selectedConversation]);

  const filteredTemplates = useMemo(() => {
    return mockTemplates.filter((template) => {
      const matchesSearch = !templateSearch.trim() || [template.name, template.purpose, template.internalCategory, template.language]
        .join(' ')
        .toLowerCase()
        .includes(templateSearch.trim().toLowerCase());

      const matchesCategory = templateCategory === 'All' || template.internalCategory === templateCategory;
      const matchesLanguage = templateLanguage === 'All' || template.language === templateLanguage;
      const localStatusLabel = TEMPLATE_STATUS_META[template.localStatus]?.shortLabel || TEMPLATE_STATUS_META[template.localStatus]?.label || template.localStatus;
      const matchesStatus = templateStatus === 'All' || localStatusLabel === templateStatus;

      return matchesSearch && matchesCategory && matchesLanguage && matchesStatus;
    });
  }, [templateCategory, templateLanguage, templateSearch, templateStatus]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadConversationList({ page: 1, append: false }),
      selectedConversationId ? loadConversationMessages(selectedConversationId, { page: 1, append: false }) : Promise.resolve(),
    ]);
  };

  const handleSelectConversation = (conversationId) => {
    setSelectedConversationId(conversationId);
    setContextSheetOpen(false);
  };

  const handleRetry = async (logId) => {
    setRetryingId(logId);
    try {
      await instantcareApi.retryWhatsappLog(logId);
      await Promise.all([
        loadConversationList({ page: 1, append: false }),
        selectedConversationId ? loadConversationMessages(selectedConversationId, { page: 1, append: false }) : Promise.resolve(),
      ]);
      toast({
        title: 'Retry started',
        description: 'The existing WhatsApp retry flow was triggered for this message.',
      });
    } catch (error) {
      toast({
        title: 'Retry failed',
        description: getFriendlyError(error, 'Unable to retry this WhatsApp message.'),
        variant: 'destructive',
      });
    } finally {
      setRetryingId('');
    }
  };

  const handleSendReply = async () => {
    const trimmedReply = reply.trim();

    if (!selectedConversation?.phone_number || !trimmedReply) {
      return;
    }

    if (!serviceWindowOpen) {
      toast({
        title: 'Template required',
        description: templateAvailable
          ? 'Free-form messaging is unavailable outside the active customer-service window. Use an approved template.'
          : 'Free-form messaging is unavailable outside the active customer-service window. No approved template is available through the current frontend API surface.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      await instantcareApi.sendWhatsappMessage({
        to: selectedConversation.phone_number,
        message: trimmedReply,
      });
      setReply('');
      await Promise.all([
        loadConversationList({ page: 1, append: false }),
        loadConversationMessages(selectedConversationId, { page: 1, append: false }),
      ]);
      toast({
        title: 'Reply queued',
        description: 'The existing free-form WhatsApp send flow has been reused successfully.',
      });
    } catch (error) {
      toast({
        title: 'Unable to send reply',
        description: getFriendlyError(error, 'Please try again in a moment.'),
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const handleAddInternalNote = () => {
    const body = internalNoteText.trim();
    if (!selectedConversationId || !body) {
      return;
    }

    const note = {
      id: `${selectedConversationId}-${Date.now()}`,
      body,
      author: currentUser?.name || currentUser?.email || 'Admin user',
      createdAt: new Date().toISOString(),
    };

    setInternalNotesByConversation((current) => ({
      ...current,
      [selectedConversationId]: [...(current[selectedConversationId] || []), note],
    }));
    setInternalNoteText('');
    toast({
      title: 'Internal note saved locally',
      description: 'This note remains UI-only in Phase 2 and is never sent to WhatsApp.',
    });
  };

  const selectedTemplateIsSendable = Boolean(templatePickerSelection && isTemplateSendableByStatus(templatePickerSelection));

  return (
    <WhatsAppAdminLayout>
      <section className="space-y-6">
        <div className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45 lg:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="rounded-full border-emerald-300 bg-emerald-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-emerald-700 dark:border-emerald-900 dark:text-emerald-200">
                  Inbox Workspace
                </Badge>
                <Badge variant="outline" className="rounded-full border-slate-300 bg-transparent px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  Reuses existing WhatsApp APIs
                </Badge>
              </div>
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">WhatsApp Inbox + Agent Workspace</h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                Production-focused conversation workspace for review, reply, retry, and customer context. Existing send, retry, message history, and 24-hour customer-service-window behavior remain unchanged and are reused directly.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" className="rounded-full" onClick={handleRefresh} disabled={refreshing || conversationLoading || messageLoading}>
                {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Refresh workspace
              </Button>
              <Button type="button" variant="outline" className="rounded-full xl:hidden" onClick={() => setContextSheetOpen(true)} disabled={!selectedConversation}>
                <Users className="mr-2 h-4 w-4" />
                Customer context
              </Button>
            </div>
          </div>

          <div className="mt-5 grid gap-3 xl:grid-cols-4">
            <InfoRow label="Conversations" value={String(filteredConversations.length)} className="bg-white/70 dark:bg-slate-950/35" />
            <InfoRow label="Unread" value={String(conversations.filter((item) => Number(item?.unread_count || 0) > 0).length)} className="bg-white/70 dark:bg-slate-950/35" />
            <InfoRow label="Free-form Window" value={serviceWindowOpen ? 'Active' : 'Template required'} className="bg-white/70 dark:bg-slate-950/35" />
            <InfoRow label="Agent Data" value={agentOptions.length ? `${agentOptions.length} available` : 'Unavailable'} className="bg-white/70 dark:bg-slate-950/35" />
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_340px] 2xl:grid-cols-[340px_minmax(0,1fr)_360px]">
          <div className={cn('min-h-[420px] min-w-0 flex-col rounded-[28px] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45 xl:h-[calc(100vh-13rem)]', mobileView === 'list' ? 'flex' : 'hidden', 'lg:flex')}>
            <div className="border-b border-slate-200/80 px-5 py-5 dark:border-slate-800">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500 dark:text-slate-400">Conversations</p>
              <div className="relative mt-3">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search conversations" className="h-11 rounded-full border-slate-200 bg-white pl-10 dark:border-slate-700 dark:bg-slate-950" />
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {FILTERS.map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={() => setActiveFilter(filter.key)}
                    className={cn(
                      'whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] transition-colors',
                      activeFilter === filter.key
                        ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800',
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
              {conversationError ? (
                <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{conversationError}</p>
                  </div>
                </div>
              ) : null}

              <div className="space-y-3">
                {conversationLoading && !conversations.length ? (
                  <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading recent conversations...
                    </div>
                  </div>
                ) : null}

                {!conversationLoading && !filteredConversations.length ? (
                  <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
                    No conversations found
                  </div>
                ) : null}

                {filteredConversations.map((conversation) => (
                  <ConversationListItem key={conversation.id} conversation={conversation} isActive={conversation.id === selectedConversationId} onSelect={handleSelectConversation} />
                ))}
              </div>
            </div>

            {hasMoreConversationLogs ? (
              <div className="border-t border-slate-200/80 px-4 py-4 dark:border-slate-800">
                <Button type="button" variant="outline" className="w-full rounded-full" disabled={conversationLoading} onClick={() => loadConversationList({ page: conversationPage + 1, append: true })}>
                  {conversationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Load more recent logs
                </Button>
              </div>
            ) : null}
          </div>

          <div className={cn('min-h-[520px] min-w-0 flex-col rounded-[28px] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur dark:border-white/10 dark:bg-slate-950/45 xl:h-[calc(100vh-13rem)]', mobileView === 'thread' ? 'flex' : 'hidden', 'lg:flex')}>
            {selectedConversation ? (
              <>
                <div className="border-b border-slate-200/80 px-5 py-5 dark:border-slate-800">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 lg:hidden">
                          <Button type="button" variant="ghost" size="sm" className="h-8 rounded-full px-2" onClick={() => setMobileView('list')}>
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back
                          </Button>
                        </div>
                        <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Conversation</p>
                        <h3 className="mt-2 truncate text-2xl font-semibold text-slate-950 dark:text-white">{selectedConversation.display_name}</h3>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{selectedConversation.phone_number}</p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline" className={cn('rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em]', getStatusTone(getConversationStatus(selectedConversation)))}>
                          {getConversationStatus(selectedConversation)}
                        </Badge>
                        <Badge variant="outline" className={cn('rounded-full px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em]', getPriorityTone(getPriorityValue(selectedConversation)))}>
                          {getPriorityValue(selectedConversation) || 'Priority not set'}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">
                        <Phone className="h-3.5 w-3.5" />
                        {selectedConversation.phone_number}
                      </span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">
                        <UserRound className="h-3.5 w-3.5" />
                        {getAssignmentLabel(selectedConversation) || 'Unassigned'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" className="rounded-full" disabled={!assignmentSupported}>Assign</Button>
                      <Button type="button" variant="outline" className="rounded-full" disabled={!assignmentSupported}>Reassign</Button>
                      <Button type="button" variant="outline" className="rounded-full" disabled={!prioritySupported}>Priority</Button>
                      <Button type="button" variant="outline" className="rounded-full" disabled={!closeSupported}>{isClosedConversation(selectedConversation) ? 'Reopen' : 'Close'}</Button>
                      <Button type="button" variant="outline" className="rounded-full" disabled>
                        More
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                  {messageError ? (
                    <div className="rounded-[20px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900/70 dark:bg-rose-950/30 dark:text-rose-200">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>{messageError}</p>
                      </div>
                    </div>
                  ) : null}

                  {!serviceWindowOpen ? (
                    <div className="mb-4 rounded-[24px] border border-amber-200 bg-amber-50/80 px-4 py-4 text-sm text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-200">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <p className="font-medium">Free-form messaging is unavailable outside the active customer-service window.</p>
                          <p className="mt-1 text-amber-700 dark:text-amber-300">
                            {templateAvailable
                              ? 'Use an approved template.'
                              : 'Use an approved template. Provider-approved template sending is not currently wired into this frontend workspace.'}
                          </p>
                          {serviceWindowExpiresAt ? <p className="mt-1 text-xs">Last active window ended {serviceWindowExpiresAt}</p> : null}
                        </div>
                        <Button type="button" variant="outline" className="rounded-full border-amber-300 bg-transparent text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-950/40" onClick={() => { setComposerTab('template'); setTemplateDialogOpen(true); }}>
                          Open template picker
                        </Button>
                      </div>
                    </div>
                  ) : null}

                  <div className="space-y-4">
                    {hasMoreMessages ? (
                      <div className="flex justify-center">
                        <Button type="button" variant="outline" className="rounded-full" disabled={messageLoading} onClick={() => loadConversationMessages(selectedConversationId, { page: messagePage + 1, append: true })}>
                          {messageLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Load older messages
                        </Button>
                      </div>
                    ) : null}

                    {messageLoading && !orderedMessages.length ? (
                      <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading conversation...
                        </div>
                      </div>
                    ) : null}

                    {!messageLoading && !orderedMessages.length ? (
                      <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
                        No messages are available for this conversation yet.
                      </div>
                    ) : null}

                    {orderedMessages.map((log) => (
                      <MessageThreadItem key={log.id} log={log} onRetry={handleRetry} retryingId={retryingId} />
                    ))}
                  </div>

                  <div className="mt-6 space-y-3 border-t border-slate-200/80 pt-5 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">Internal Notes</p>
                      <Badge variant="outline" className="rounded-full border-violet-300 bg-violet-500/10 px-2 py-0 text-[10px] uppercase tracking-[0.16em] text-violet-700 dark:border-violet-900 dark:text-violet-200">
                        UI-only
                      </Badge>
                    </div>
                    {currentConversationNotes.length ? currentConversationNotes.map((note) => <InternalNoteCard key={note.id} note={note} />) : (
                      <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50/70 px-4 py-5 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
                        No internal notes yet. Notes added here stay local to this workspace in Phase 2.
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-200/80 px-5 py-5 dark:border-slate-800">
                  <Tabs value={composerTab} onValueChange={setComposerTab} className="space-y-4">
                    <div className="overflow-x-auto pb-1">
                      <TabsList className="h-auto min-w-max gap-2 rounded-full bg-slate-100/80 p-1.5 dark:bg-slate-900/80">
                        {COMPOSER_TABS.map((tab) => (
                          <TabsTrigger key={tab.key} value={tab.key} className="rounded-full px-4 py-2 data-[state=active]:bg-slate-950 data-[state=active]:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-slate-950">
                            {tab.label}
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    <TabsContent value="message" className="mt-0 space-y-3">
                      <Textarea value={reply} onChange={(event) => setReply(event.target.value)} placeholder={serviceWindowOpen ? 'Type your WhatsApp reply here' : 'An approved template must be sent before a free-form reply is allowed'} className="min-h-[110px] rounded-[22px] border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950" disabled={!serviceWindowOpen} />
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {serviceWindowOpen
                            ? 'This sends a free-form reply through the existing authenticated WhatsApp inbox endpoint.'
                            : 'The current backend policy blocks free-form sends until the 24-hour window is active again or a provider-approved template is sent first.'}
                        </p>
                        <Button type="button" className="rounded-full bg-cyan-600 text-white hover:bg-cyan-700" disabled={sending || !reply.trim() || !selectedConversation?.phone_number || !serviceWindowOpen} onClick={handleSendReply}>
                          {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SendHorizontal className="mr-2 h-4 w-4" />}
                          Send reply
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="template" className="mt-0 space-y-4">
                      <div className="rounded-[22px] border border-slate-200/70 bg-slate-50/70 px-4 py-4 dark:border-slate-800 dark:bg-slate-900/40">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-950 dark:text-white">Template picker</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Browse the existing template model and select provider-approved templates for future send support.</p>
                          </div>
                          <Button type="button" variant="outline" className="rounded-full" onClick={() => setTemplateDialogOpen(true)}>
                            <FileText className="mr-2 h-4 w-4" />
                            Open templates
                          </Button>
                        </div>
                      </div>

                      {draftTemplate ? (
                        <div className="rounded-[22px] border border-slate-200/70 bg-white/80 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/35">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-950 dark:text-white">{draftTemplate.name}</p>
                              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{draftTemplate.purpose}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className={cn('rounded-full px-2 py-0 text-[10px] font-medium', TEMPLATE_STATUS_META[draftTemplate.localStatus]?.className || 'border-slate-300 text-slate-600')}>
                                {TEMPLATE_STATUS_META[draftTemplate.localStatus]?.shortLabel || draftTemplate.localStatus}
                              </Badge>
                              <Badge variant="outline" className={cn('rounded-full px-2 py-0 text-[10px] font-medium', META_STATUS_META[draftTemplate.metaStatus]?.className || 'border-slate-300 text-slate-600')}>
                                {META_STATUS_META[draftTemplate.metaStatus]?.label || 'Provider status unavailable'}
                              </Badge>
                            </div>
                          </div>
                          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">{draftTemplate.body}</p>
                          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Template selection is available. Sending remains disabled because this phase is restricted to existing frontend WhatsApp API functions only.</p>
                            <Button type="button" className="rounded-full bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" disabled>
                              Send template
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
                          No approved/sendable templates available
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="attachment" className="mt-0">
                      <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                          <Paperclip className="h-4 w-4" />
                          Attachment support is coming soon.
                        </div>
                        <p className="mt-2">No existing frontend or backend attachment flow was wired into this phase, so uploads remain intentionally disabled.</p>
                        <Button type="button" variant="outline" className="mt-4 rounded-full" disabled={!attachmentSupported}>Attach file</Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="note" className="mt-0 space-y-3">
                      <Textarea value={internalNoteText} onChange={(event) => setInternalNoteText(event.target.value)} placeholder="Follow up with patient's daughter tomorrow." className="min-h-[110px] rounded-[22px] border-violet-200 bg-violet-50/50 dark:border-violet-900/50 dark:bg-violet-950/10" />
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Internal notes are visually separate and remain local/UI-only in Phase 2. They are never sent to WhatsApp.</p>
                        <Button type="button" className="rounded-full bg-violet-600 text-white hover:bg-violet-700" disabled={!internalNoteText.trim()} onClick={handleAddInternalNote}>
                          Save internal note
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="flow" className="mt-0">
                      <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                          <Link2 className="h-4 w-4" />
                          Flow handoff is reserved for a future module.
                        </div>
                        <p className="mt-2">The workspace prepares a clean integration point, but does not implement Flow Builder, triggers, or automation execution in this phase.</p>
                        <Button type="button" variant="outline" className="mt-4 rounded-full" disabled>
                          Connect flow
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </>
            ) : (
              <div className="flex h-full min-h-[520px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 px-6 text-center dark:border-slate-700 dark:bg-slate-950/40">
                <MessageSquareText className="h-10 w-10 text-slate-400" />
                <h4 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">Select a conversation to start</h4>
                <p className="mt-2 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">
                  Choose a customer from the left panel to review the thread, reuse the existing send/retry behavior, and open customer context.
                </p>
              </div>
            )}
          </div>

          <div className="hidden min-h-[520px] min-w-0 xl:block xl:h-[calc(100vh-13rem)]">
            {selectedConversation ? (
              <RightContextPanel conversation={selectedConversation} contextSummary={contextSummary} agentOptions={agentOptions} selectedAgentId={selectedAgentId} onSelectedAgentIdChange={setSelectedAgentId} assignmentSupported={assignmentSupported} />
            ) : (
              <div className="flex h-full items-center justify-center rounded-[28px] border border-dashed border-slate-300 bg-slate-50/70 px-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
                Customer context appears here after a conversation is selected.
              </div>
            )}
          </div>
        </div>

        <Sheet open={contextSheetOpen} onOpenChange={setContextSheetOpen}>
          <SheetContent side="right" className="w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            <SheetHeader>
              <SheetTitle>Customer / Patient Context</SheetTitle>
              <SheetDescription>Tablet and mobile view of the right-side context rail.</SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              {selectedConversation ? (
                <RightContextPanel conversation={selectedConversation} contextSummary={contextSummary} agentOptions={agentOptions} selectedAgentId={selectedAgentId} onSelectedAgentIdChange={setSelectedAgentId} assignmentSupported={assignmentSupported} />
              ) : (
                <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
                  Select a conversation first.
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>

        <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
          <DialogContent className="max-w-5xl">
            <DialogHeader>
              <DialogTitle>Template Picker</DialogTitle>
              <DialogDescription>
                Search and review the existing template model. Provider-approved templates are selectable for workspace preview, but sending remains disabled until a frontend template send API is explicitly wired.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <Input value={templateSearch} onChange={(event) => setTemplateSearch(event.target.value)} placeholder="Search templates" className="xl:col-span-2" />
                  <select value={templateCategory} onChange={(event) => setTemplateCategory(event.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                    <option value="All">All categories</option>
                    {[...new Set(mockTemplates.map((template) => template.internalCategory).filter(Boolean))].map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                  <select value={templateLanguage} onChange={(event) => setTemplateLanguage(event.target.value)} className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                    <option value="All">All languages</option>
                    {[...new Set(mockTemplates.map((template) => template.language).filter(Boolean))].map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </div>
                <select value={templateStatus} onChange={(event) => setTemplateStatus(event.target.value)} className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100">
                  {TEMPLATE_STATUS_FILTERS.map((option) => <option key={option} value={option}>{option}</option>)}
                </select>

                <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {filteredTemplates.length ? filteredTemplates.map((template) => {
                    const isSelected = template.id === selectedTemplateId;
                    const providerStatusMeta = META_STATUS_META[template.metaStatus] || null;
                    const localStatusMeta = TEMPLATE_STATUS_META[template.localStatus] || null;
                    const isSendable = isTemplateSendableByStatus(template);

                    return (
                      <button key={template.id} type="button" onClick={() => setSelectedTemplateId(template.id)} className={cn('w-full rounded-[22px] border px-4 py-4 text-left transition-colors', isSelected ? 'border-emerald-400 bg-emerald-500/10 dark:border-emerald-700 dark:bg-emerald-950/20' : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/35 dark:hover:border-slate-700')}>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{template.name}</p>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{template.purpose}</p>
                          </div>
                          <Badge variant="outline" className={cn('rounded-full px-2 py-0 text-[10px] font-medium', isSendable ? 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200' : 'border-slate-300 bg-transparent text-slate-500 dark:border-slate-700 dark:text-slate-300')}>
                            {isSendable ? 'Sendable status' : 'Not sendable'}
                          </Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Badge variant="outline" className="rounded-full border-slate-300 bg-transparent px-2 py-0 text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">{template.internalCategory}</Badge>
                          <Badge variant="outline" className="rounded-full border-slate-300 bg-transparent px-2 py-0 text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">{template.language}</Badge>
                          <Badge variant="outline" className={cn('rounded-full px-2 py-0 text-[10px] font-medium', localStatusMeta?.className || 'border-slate-300 text-slate-600')}>{localStatusMeta?.shortLabel || template.localStatus}</Badge>
                          <Badge variant="outline" className={cn('rounded-full px-2 py-0 text-[10px] font-medium', providerStatusMeta?.className || 'border-slate-300 text-slate-600')}>{providerStatusMeta?.label || 'Provider status unavailable'}</Badge>
                        </div>
                        <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{template.body}</p>
                      </button>
                    );
                  }) : (
                    <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
                      No approved/sendable templates available
                    </div>
                  )}
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                {templatePickerSelection ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">{templatePickerSelection.name}</p>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{templatePickerSelection.purpose}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="rounded-full border-slate-300 bg-transparent px-2 py-0 text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">{templatePickerSelection.internalCategory}</Badge>
                      <Badge variant="outline" className="rounded-full border-slate-300 bg-transparent px-2 py-0 text-[10px] font-medium text-slate-600 dark:border-slate-700 dark:text-slate-300">{templatePickerSelection.language}</Badge>
                    </div>
                    <div className="rounded-[20px] border border-white/80 bg-white px-4 py-4 dark:border-white/10 dark:bg-slate-950/40">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Preview</p>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">{templatePickerSelection.body}</p>
                    </div>
                    <div className="rounded-[20px] border border-slate-200/80 bg-white px-4 py-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950/35 dark:text-slate-300">
                      <p className="font-medium text-slate-900 dark:text-white">Provider state</p>
                      <p className="mt-2">{META_STATUS_META[templatePickerSelection.metaStatus]?.label || 'Provider status unavailable'}</p>
                    </div>
                    <div className="rounded-[20px] border border-amber-200 bg-amber-50/80 px-4 py-4 text-sm text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-200">
                      Template sending stays disabled in Phase 2 because the existing frontend WhatsApp API client does not expose a send-template action in the authorized scope.
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[20px] border border-dashed border-slate-300 bg-white/80 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/35 dark:text-slate-400">
                    Select a template to preview it here.
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
              <Button type="button" variant="outline" disabled={!selectedTemplateIsSendable} onClick={() => {
                if (templatePickerSelection) {
                  setDraftTemplateId(templatePickerSelection.id);
                  setComposerTab('template');
                  setTemplateDialogOpen(false);
                }
              }}>
                Use selected template
              </Button>
              <Button type="button" className="bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200" disabled>
                Send template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </section>
    </WhatsAppAdminLayout>
  );
};

export default WhatsAppInboxWorkspacePage;