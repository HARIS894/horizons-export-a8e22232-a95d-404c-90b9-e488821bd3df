import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  MessageSquareText,
  Paperclip,
  Phone,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  SendHorizontal,
  SmilePlus,
  X,
} from 'lucide-react';
import { instantcareApi } from '@/api/instantcareApi';
import { GlassPanel } from '@/components/admin/AdminDashboardSections';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const CONVERSATION_PAGE_SIZE = 50;
const MESSAGE_PAGE_SIZE = 25;
const QUICK_EMOJIS = ['🙂', '🙏', '👍', '❤️', '📞', '✅'];
const QUICK_REACTIONS = ['👍', '❤️', '🙏', '👀'];
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const DEFAULT_MESSAGING_MODE = 'manual';

const normalizeMessagingMode = (value) => (String(value || '').trim().toLowerCase() === 'automation' ? 'automation' : DEFAULT_MESSAGING_MODE);

const getLogTimestamp = (log) => log?.created_at || log?.createdAt || log?.updated_at || log?.updatedAt || null;

const formatConversationTime = (value) => {
  if (!value) {
    return 'Just now';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Just now';
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

  if (log?.message_type === 'image') {
    return log?.caption || 'Image';
  }

  if (log?.message_type === 'document') {
    return log?.file_name || log?.caption || 'Document';
  }

  if (log?.message_type === 'reaction') {
    return log?.reaction_emoji ? `Reacted with ${log.reaction_emoji}` : 'Reaction';
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

const getFriendlyError = (error, fallback) => {
  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

const getMessageKindLabel = (log) => {
  if (log?.message_type === 'image') {
    return 'Image';
  }

  if (log?.message_type === 'document') {
    return 'Document';
  }

  if (log?.message_type === 'reaction') {
    return 'Reaction';
  }

  if (log?.message_kind === 'template') {
    return 'Template';
  }

  if (log?.message_kind === 'inbound' || log?.direction === 'inbound') {
    return 'Inbound';
  }

  return 'Free-form';
};

const formatWindowDeadline = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const emptyClientForm = {
  name: '',
  phoneNumber: '',
  notes: '',
};

const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(new Error('Unable to read the selected file.'));
  reader.readAsDataURL(file);
});

const getAttachmentType = (file) => (String(file?.type || '').toLowerCase().startsWith('image/') ? 'image' : 'document');

const getFileNameFromDisposition = (value) => {
  const match = String(value || '').match(/filename="?([^";]+)"?/i);
  return match?.[1] || '';
};

const MessageBubble = ({ log, mediaEntry, onRetry, onDownloadMedia, onReaction, reactingKey, retryingId }) => {
  const isInbound = log?.direction === 'inbound';
  const canRetry = !isInbound && Boolean(log?.can_retry);
  const isMedia = log?.message_type === 'image' || log?.message_type === 'document';
  const canReact = isInbound && Boolean(log?.provider_message_id) && log?.message_type !== 'reaction';

  return (
    <div className={cn('flex', isInbound ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'max-w-[85%] rounded-[22px] border px-4 py-3 shadow-sm',
          isInbound
            ? 'border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-100'
            : 'border-cyan-200 bg-cyan-500/10 text-slate-900 dark:border-cyan-900 dark:bg-cyan-500/15 dark:text-slate-100',
        )}
      >
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
          <span>{isInbound ? 'Customer' : 'InstantCare'}</span>
          <Badge variant="outline" className="rounded-full border-slate-300 bg-transparent px-2 py-0 text-[10px] font-medium text-slate-500 dark:border-slate-700 dark:text-slate-300">
            {getMessageKindLabel(log)}
          </Badge>
          {log?.status ? <Badge variant="outline" className="rounded-full border-slate-300 bg-transparent px-2 py-0 text-[10px] font-medium capitalize text-slate-500 dark:border-slate-700 dark:text-slate-300">{log.status}</Badge> : null}
        </div>
        {log?.message_type === 'image' ? (
          <div className="mt-3 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60">
            {mediaEntry?.status === 'ready' ? (
              <img src={mediaEntry.url} alt={log?.caption || 'WhatsApp attachment'} className="max-h-72 w-full object-cover" />
            ) : mediaEntry?.status === 'error' ? (
              <div className="flex items-center gap-2 px-4 py-5 text-sm text-red-600 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                Unable to load image preview
              </div>
            ) : (
              <div className="flex items-center gap-2 px-4 py-5 text-sm text-slate-500 dark:text-slate-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading image preview...
              </div>
            )}
          </div>
        ) : null}
        {log?.message_type === 'document' ? (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-2xl bg-slate-200/80 p-2 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{log?.file_name || 'Document'}</p>
                <p className="truncate text-xs text-slate-500 dark:text-slate-400">{log?.mime_type || 'File attachment'}</p>
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => onDownloadMedia(log)}>
              <Download className="mr-1 h-3.5 w-3.5" />
              Download
            </Button>
          </div>
        ) : null}
        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{getPreviewText(log)}</p>
        {isMedia && log?.message_type === 'image' && mediaEntry?.status === 'ready' ? (
          <Button type="button" variant="ghost" size="sm" className="mt-2 h-7 rounded-full px-2 text-xs" onClick={() => onDownloadMedia(log)}>
            <Download className="mr-1 h-3.5 w-3.5" />
            Download image
          </Button>
        ) : null}
        {log?.delivery_failure_reason ? (
          <div className="mt-3 rounded-2xl border border-red-200 bg-red-50/80 px-3 py-2 text-xs leading-5 text-red-700 dark:border-red-900/60 dark:bg-red-950/20 dark:text-red-200">
            <p>{log.delivery_failure_reason}</p>
            {log?.retry_block_reason ? <p className="mt-1 text-red-600 dark:text-red-300">{log.retry_block_reason}</p> : null}
          </div>
        ) : null}
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>{formatConversationTime(getLogTimestamp(log))}</span>
          <div className="flex items-center gap-2">
            {canReact ? QUICK_REACTIONS.map((emoji) => {
              const reactionId = `${log.id}:${emoji}`;
              return (
                <Button
                  key={reactionId}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 rounded-full px-2 text-xs"
                  disabled={reactingKey === reactionId}
                  onClick={() => onReaction(log.id, emoji)}
                >
                  {reactingKey === reactionId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : emoji}
                </Button>
              );
            }) : null}
            {canRetry ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 rounded-full px-2 text-xs"
                disabled={retryingId === log.id}
                onClick={() => onRetry(log.id)}
              >
                {retryingId === log.id ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="mr-1 h-3.5 w-3.5" />}
                Retry
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

const ConversationListItem = ({ conversation, isActive, onSelect }) => {
  const unreadCount = Number(conversation?.unread_count || 0);
  const serviceWindowOpen = Boolean(conversation?.can_send_freeform);

  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.id)}
      className={cn(
        'w-full rounded-[22px] border p-4 text-left transition-colors',
        isActive
          ? 'border-cyan-300 bg-cyan-500/10 dark:border-cyan-800 dark:bg-cyan-500/10'
          : 'border-slate-200/80 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700 dark:hover:bg-slate-950/60',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-950 dark:text-white">{conversation.display_name}</p>
          <p className="mt-1 truncate text-xs text-slate-400 dark:text-slate-500">{conversation.phone_number}</p>
          <p className="mt-2 truncate text-sm text-slate-500 dark:text-slate-400">{conversation.last_message_preview || 'No messages yet'}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">{formatConversationTime(conversation.last_message_at)}</p>
          {conversation.latest_log?.direction === 'inbound' ? (
            <Badge variant="outline" className="mt-2 rounded-full border-cyan-300 bg-cyan-500/10 px-2 py-0 text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-700 dark:border-cyan-800 dark:text-cyan-200">
              Incoming
            </Badge>
          ) : null}
          <Badge
            variant="outline"
            className={cn(
              'mt-2 rounded-full px-2 py-0 text-[10px] font-medium uppercase tracking-[0.18em]',
              serviceWindowOpen
                ? 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200'
                : 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-900 dark:text-amber-200',
            )}
          >
            {serviceWindowOpen ? '24h open' : 'Template required'}
          </Badge>
          {unreadCount > 0 ? (
            <Badge className="mt-2 rounded-full bg-rose-500 px-2 py-0 text-[10px] font-medium text-white hover:bg-rose-500">
              {unreadCount} new
            </Badge>
          ) : null}
        </div>
      </div>
    </button>
  );
};

const WhatsAppInbox = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search.trim());
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
  const [sendingMedia, setSendingMedia] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [retryingId, setRetryingId] = useState('');
  const [reactingKey, setReactingKey] = useState('');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [clientForm, setClientForm] = useState(emptyClientForm);
  const [savingClient, setSavingClient] = useState(false);
  const [updatingMessagingMode, setUpdatingMessagingMode] = useState(false);
  const [showEmojiTray, setShowEmojiTray] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [attachmentError, setAttachmentError] = useState('');
  const [mediaByLogId, setMediaByLogId] = useState({});
  const fileInputRef = useRef(null);
  const conversationsRef = useRef([]);
  const selectedConversationIdRef = useRef('');

  const orderedMessages = useMemo(() => sortLogsAscending(messages), [messages]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId;
  }, [selectedConversationId]);

  useEffect(() => {
    let cancelled = false;

    const loadMedia = async () => {
      const mediaLogs = orderedMessages.filter((log) => log?.media_id && !mediaByLogId[log.id]);
      if (!mediaLogs.length) {
        return;
      }

      mediaLogs.forEach((log) => {
        setMediaByLogId((current) => ({
          ...current,
          [log.id]: { status: 'loading' },
        }));
      });

      for (const log of mediaLogs) {
        try {
          const result = await instantcareApi.downloadWhatsappLogMedia(log.id);
          if (cancelled) {
            return;
          }

          const url = URL.createObjectURL(result.blob);
          setMediaByLogId((current) => ({
            ...current,
            [log.id]: {
              status: 'ready',
              url,
              contentType: result.contentType,
              fileName: getFileNameFromDisposition(result.disposition) || log.file_name || 'attachment',
            },
          }));
        } catch (error) {
          if (cancelled) {
            return;
          }

          setMediaByLogId((current) => ({
            ...current,
            [log.id]: {
              status: 'error',
              error: getFriendlyError(error, 'Unable to load attachment.'),
            },
          }));
        }
      }
    };

    loadMedia();

    return () => {
      cancelled = true;
    };
  }, [mediaByLogId, orderedMessages]);

  useEffect(() => {
    return () => {
      Object.values(mediaByLogId).forEach((entry) => {
        if (entry?.url) {
          URL.revokeObjectURL(entry.url);
        }
      });
    };
  }, [mediaByLogId]);

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
      mergedConversations.forEach((item) => {
        uniqueById.set(item.id, item);
      });
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
        nextItems.forEach((item) => {
          uniqueById.set(item.id, item);
        });
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

  const hasMoreConversationLogs = conversationPage * (conversationMeta.limit || CONVERSATION_PAGE_SIZE) < (conversationMeta.total || 0);
  const hasMoreMessages = messagePage * (messageMeta.limit || MESSAGE_PAGE_SIZE) < (messageMeta.total || 0);
  const serviceWindowOpen = Boolean(selectedConversation?.can_send_freeform);
  const templateAvailable = Boolean(selectedConversation?.can_send_template);
  const serviceWindowExpiresAt = formatWindowDeadline(selectedConversation?.customer_service_window?.expiresAt);
  const selectedConversationMode = normalizeMessagingMode(selectedConversation?.messaging_mode);

  const applyConversationUpdate = useCallback((conversationId, updater) => {
    setConversations((current) => current.map((item) => (item.id === conversationId ? updater(item) : item)));
    setSelectedConversation((current) => (current?.id === conversationId ? updater(current) : current));
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadConversationList({ page: 1, append: false }),
      selectedConversationId ? loadConversationMessages(selectedConversationId, { page: 1, append: false }) : Promise.resolve(),
    ]);
  };

  const handleMessagingModeChange = async (nextMode) => {
    if (!selectedConversation?.id) {
      return;
    }

    const normalizedMode = normalizeMessagingMode(nextMode);
    if (normalizedMode === selectedConversationMode) {
      return;
    }

    setUpdatingMessagingMode(true);
    try {
      const result = await instantcareApi.updateWhatsappConversationMode(selectedConversation.id, normalizedMode);
      const updatedConversation = result?.conversation || { id: selectedConversation.id, messaging_mode: normalizedMode };
      const resolvedMode = normalizeMessagingMode(updatedConversation.messaging_mode);

      applyConversationUpdate(selectedConversation.id, (conversation) => ({
        ...conversation,
        messaging_mode: resolvedMode,
      }));

      toast({
        title: 'Conversation mode updated',
        description: resolvedMode === 'manual'
          ? 'Inbound messages will continue to appear here without sending the default auto-reply.'
          : 'This conversation now uses the existing inbound auto-reply path.',
      });
    } catch (error) {
      toast({
        title: 'Unable to update conversation mode',
        description: getFriendlyError(error, 'Please try again in a moment.'),
        variant: 'destructive',
      });
    } finally {
      setUpdatingMessagingMode(false);
    }
  };

  const handleSend = async () => {
    const trimmedReply = reply.trim();

    if (!selectedConversation?.phone_number || !trimmedReply) {
      return;
    }

    if (!serviceWindowOpen) {
      toast({
        title: 'Template required',
        description: templateAvailable
          ? 'This conversation is outside the 24-hour service window. Send an approved WhatsApp template first.'
          : 'This conversation is outside the 24-hour service window and no approved WhatsApp template is configured yet.',
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
        title: 'Reply sent',
        description: 'WhatsApp reply has been queued through the existing send flow.',
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

  const handleAttachmentPick = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      setAttachment(null);
      setAttachmentError('Selected file exceeds the 8 MB upload limit.');
      event.target.value = '';
      return;
    }

    try {
      const fileData = await toBase64(file);
      setAttachment({
        fileName: file.name,
        mimeType: file.type || 'application/octet-stream',
        fileData,
        size: file.size,
        type: getAttachmentType(file),
      });
      setAttachmentError('');
    } catch (error) {
      setAttachment(null);
      setAttachmentError(getFriendlyError(error, 'Unable to read the selected file.'));
    } finally {
      event.target.value = '';
    }
  };

  const clearAttachment = () => {
    setAttachment(null);
    setAttachmentError('');
  };

  const handleSendMedia = async () => {
    if (!selectedConversation?.phone_number || !attachment) {
      return;
    }

    if (!serviceWindowOpen) {
      handleTemplateAction();
      return;
    }

    setSendingMedia(true);
    try {
      await instantcareApi.sendWhatsappMediaMessage({
        to: selectedConversation.phone_number,
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
        fileData: attachment.fileData,
        caption: reply.trim(),
      });
      setReply('');
      clearAttachment();
      await Promise.all([
        loadConversationList({ page: 1, append: false }),
        loadConversationMessages(selectedConversationId, { page: 1, append: false }),
      ]);
      toast({
        title: 'Attachment sent',
        description: 'The message was sent through the live WhatsApp inbox media route.',
      });
    } catch (error) {
      toast({
        title: 'Unable to send attachment',
        description: getFriendlyError(error, 'Please try another file or retry in a moment.'),
        variant: 'destructive',
      });
    } finally {
      setSendingMedia(false);
    }
  };

  const handleTemplateAction = () => {
    toast({
      title: templateAvailable ? 'Template send unavailable' : 'No approved template configured',
      description: templateAvailable
        ? 'An approved template exists in the conversation state, but this inbox does not yet have a configured outbound template picker.'
        : 'Free-form replies are blocked outside the 24-hour service window until a real Meta-approved template is configured for this workspace.',
      variant: 'destructive',
    });
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

  const handleReaction = async (logId, emoji) => {
    const reactionId = `${logId}:${emoji}`;
    setReactingKey(reactionId);
    try {
      await instantcareApi.reactToWhatsappLog(logId, emoji);
      await Promise.all([
        loadConversationList({ page: 1, append: false }),
        selectedConversationId ? loadConversationMessages(selectedConversationId, { page: 1, append: false }) : Promise.resolve(),
      ]);
      toast({
        title: 'Reaction sent',
        description: 'The reaction was sent through the live WhatsApp inbox.',
      });
    } catch (error) {
      toast({
        title: 'Unable to send reaction',
        description: getFriendlyError(error, 'Please try again in a moment.'),
        variant: 'destructive',
      });
    } finally {
      setReactingKey('');
    }
  };

  const handleDownloadMedia = async (log) => {
    try {
      const entry = mediaByLogId[log.id] || await instantcareApi.downloadWhatsappLogMedia(log.id).then((result) => ({
        blob: result.blob,
        fileName: getFileNameFromDisposition(result.disposition) || log.file_name || 'attachment',
      }));

      const blob = entry.blob || await fetch(entry.url).then((response) => response.blob());
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = entry.fileName || log.file_name || 'attachment';
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        title: 'Unable to download attachment',
        description: getFriendlyError(error, 'Please try again in a moment.'),
        variant: 'destructive',
      });
    }
  };

  const handleClientFieldChange = (field, value) => {
    setClientForm((current) => ({ ...current, [field]: value }));
  };

  const handleCreateClient = async () => {
    setSavingClient(true);
    try {
      const result = await instantcareApi.createWhatsappContact(clientForm);
      setIsAddClientOpen(false);
      setClientForm(emptyClientForm);
      await loadConversationList({ page: 1, append: false, keepSelection: false });
      if (result?.conversation?.id) {
        setSelectedConversationId(result.conversation.id);
      }
      toast({
        title: 'Client saved',
        description: 'The contact is available in the WhatsApp inbox and ready for messaging.',
      });
    } catch (error) {
      toast({
        title: 'Unable to save client',
        description: getFriendlyError(error, 'Please check the WhatsApp number and try again.'),
        variant: 'destructive',
      });
    } finally {
      setSavingClient(false);
    }
  };

  return (
    <GlassPanel>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-400">Live Inbox</p>
          <h3 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-white">WhatsApp Business Inbox</h3>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Review customer messages, open a conversation, reply through the existing WhatsApp send API, and retry failed outbound messages without changing the current Meta integration.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="outline" className="rounded-full" onClick={() => setIsAddClientOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Client
          </Button>
          <Button type="button" variant="outline" className="rounded-full" onClick={handleRefresh} disabled={refreshing || conversationLoading || messageLoading}>
            {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh inbox
          </Button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp,application/pdf,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleAttachmentPick}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_300px]">
        <div className="rounded-[28px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by client, notes, or phone"
              className="h-11 rounded-full border-slate-200 bg-white pl-10 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            <span>Conversations</span>
            <span>{conversations.length}</span>
          </div>

          {conversationError ? (
            <div className="mt-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{conversationError}</p>
              </div>
            </div>
          ) : null}

          <div className="mt-4 max-h-[620px] space-y-3 overflow-y-auto pr-1">
            {conversationLoading && !conversations.length ? (
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading recent conversations...
                </div>
              </div>
            ) : null}

            {!conversationLoading && !conversations.length ? (
              <div className="rounded-[22px] border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
                No WhatsApp conversations found for the current filters.
              </div>
            ) : null}

            {conversations.map((conversation) => (
              <ConversationListItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === selectedConversationId}
                onSelect={setSelectedConversationId}
              />
            ))}
          </div>

          {hasMoreConversationLogs ? (
            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full rounded-full"
              disabled={conversationLoading}
              onClick={() => loadConversationList({ page: conversationPage + 1, append: true })}
            >
              {conversationLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Load more recent logs
            </Button>
          ) : null}
        </div>

        <div className="rounded-[28px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          {selectedConversation ? (
            <>
              <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Selected Customer</p>
                    <h4 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{selectedConversation.display_name}</h4>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Badge
                        variant="outline"
                        className={cn(
                          'rounded-full px-3 py-1 uppercase tracking-[0.18em]',
                          serviceWindowOpen
                            ? 'border-emerald-300 bg-emerald-500/10 text-emerald-700 dark:border-emerald-900 dark:text-emerald-200'
                            : 'border-amber-300 bg-amber-500/10 text-amber-700 dark:border-amber-900 dark:text-amber-200',
                        )}
                      >
                        {serviceWindowOpen ? 'Free-form allowed' : 'Template required'}
                      </Badge>
                      {!serviceWindowOpen && serviceWindowExpiresAt ? (
                        <span>Last customer window ended {serviceWindowExpiresAt}</span>
                      ) : null}
                    </div>
                    {selectedConversation.contact?.notes ? (
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">{selectedConversation.contact.notes}</p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">Conversation Mode</span>
                      <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 dark:border-slate-700 dark:bg-slate-950/70">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={cn(
                            'rounded-full px-4',
                            selectedConversationMode === 'manual' ? 'bg-cyan-600 text-white hover:bg-cyan-700 hover:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
                          )}
                          disabled={updatingMessagingMode}
                          onClick={() => handleMessagingModeChange('manual')}
                        >
                          {updatingMessagingMode && selectedConversationMode !== 'manual' ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                          Manual
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={cn(
                            'rounded-full px-4',
                            selectedConversationMode === 'automation' ? 'bg-cyan-600 text-white hover:bg-cyan-700 hover:text-white' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
                          )}
                          disabled={updatingMessagingMode}
                          onClick={() => handleMessagingModeChange('automation')}
                        >
                          {updatingMessagingMode && selectedConversationMode !== 'automation' ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : null}
                          Automation
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">
                      <Phone className="h-3.5 w-3.5" />
                      {selectedConversation.phone_number}
                    </span>
                    {selectedConversation.latest_log?.status ? (
                      <Badge variant="outline" className="rounded-full border-slate-300 bg-transparent px-3 py-1 capitalize dark:border-slate-700">
                        {selectedConversation.latest_log.status}
                      </Badge>
                    ) : null}
                  </div>
                </div>
              </div>

              {messageError ? (
                <div className="mt-4 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    <p>{messageError}</p>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 flex max-h-[540px] flex-col gap-4 overflow-y-auto pr-1">
                {hasMoreMessages ? (
                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      disabled={messageLoading}
                      onClick={() => loadConversationMessages(selectedConversationId, { page: messagePage + 1, append: true })}
                    >
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
                  <MessageBubble
                    key={log.id}
                    log={log}
                    mediaEntry={mediaByLogId[log.id]}
                    onRetry={handleRetry}
                    onDownloadMedia={handleDownloadMedia}
                    onReaction={handleReaction}
                    reactingKey={reactingKey}
                    retryingId={retryingId}
                  />
                ))}
              </div>

              <div className="mt-5 border-t border-slate-200/80 pt-4 dark:border-slate-800">
                <label className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  Reply to customer
                </label>
                {!serviceWindowOpen ? (
                  <div className="mt-3 rounded-[22px] border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/70 dark:bg-amber-950/20 dark:text-amber-200">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">Free-form replies are blocked outside WhatsApp's 24-hour customer-service window.</p>
                        <p className="mt-1 text-amber-700 dark:text-amber-300">
                          {templateAvailable
                            ? 'Send an approved template first to reopen the conversation.'
                            : 'No approved Meta template is configured for this workspace yet.'}
                        </p>
                      </div>
                      <Button type="button" variant="outline" className="rounded-full border-amber-300 bg-transparent text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:text-amber-200 dark:hover:bg-amber-950/40" onClick={handleTemplateAction}>
                        Send template
                      </Button>
                    </div>
                  </div>
                ) : null}
                {showEmojiTray ? (
                  <div className="mt-3 flex flex-wrap gap-2 rounded-[22px] border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
                    {QUICK_EMOJIS.map((emoji) => (
                      <Button key={emoji} type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setReply((current) => `${current}${emoji}`)}>
                        {emoji}
                      </Button>
                    ))}
                  </div>
                ) : null}
                <Textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder={serviceWindowOpen ? 'Type your WhatsApp reply or add a caption for an attachment' : 'An approved template must be sent before a free-form reply is allowed'}
                  className="mt-3 min-h-[120px] rounded-[22px] border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
                  disabled={!serviceWindowOpen}
                />
                {attachment ? (
                  <div className="mt-3 flex items-center justify-between gap-3 rounded-[22px] border border-cyan-200 bg-cyan-50/70 px-4 py-3 dark:border-cyan-900/60 dark:bg-cyan-950/20">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="rounded-2xl bg-cyan-100 p-2 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-200">
                        {attachment.type === 'image' ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{attachment.fileName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{Math.max(1, Math.round(attachment.size / 1024))} KB</p>
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={clearAttachment}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null}
                {attachmentError ? (
                  <div className="mt-3 rounded-[20px] border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-200">
                    {attachmentError}
                  </div>
                ) : null}
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {serviceWindowOpen
                      ? 'Text replies continue to use the existing authenticated WhatsApp inbox endpoint. Attachments and reactions use adjacent live inbox routes.'
                      : 'The inbox will reject free-form sends here until the customer reopens the conversation or an approved template is configured.'}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" variant="outline" className="rounded-full" disabled={!serviceWindowOpen} onClick={() => setShowEmojiTray((current) => !current)}>
                      <SmilePlus className="mr-2 h-4 w-4" />
                      Emoji
                    </Button>
                    <Button type="button" variant="outline" className="rounded-full" disabled={!serviceWindowOpen || sendingMedia} onClick={() => fileInputRef.current?.click()}>
                      <Paperclip className="mr-2 h-4 w-4" />
                      Attach
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="rounded-full"
                      disabled={sendingMedia || !attachment || !selectedConversation?.phone_number || !serviceWindowOpen}
                      onClick={handleSendMedia}
                    >
                      {sendingMedia ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
                      Send file
                    </Button>
                    <Button
                      type="button"
                      className="rounded-full bg-cyan-600 text-white hover:bg-cyan-700"
                      disabled={sending || !reply.trim() || !selectedConversation?.phone_number || !serviceWindowOpen}
                      onClick={handleSend}
                    >
                      {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SendHorizontal className="mr-2 h-4 w-4" />}
                      Send reply
                    </Button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 px-6 text-center dark:border-slate-700 dark:bg-slate-950/40">
              <MessageSquareText className="h-10 w-10 text-slate-400" />
              <h4 className="mt-4 text-xl font-semibold text-slate-950 dark:text-white">Select a conversation</h4>
              <p className="mt-2 max-w-md text-sm leading-7 text-slate-500 dark:text-slate-400">
                Choose a customer from the left panel to read the conversation, send a reply through the existing WhatsApp API, or retry an older failed outbound message.
              </p>
            </div>
          )}
        </div>

        <div className="rounded-[28px] border border-slate-200/70 bg-white/70 p-5 dark:border-slate-800 dark:bg-slate-950/40">
          {selectedConversation ? (
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500 dark:text-slate-400">Customer Context</p>
                <h4 className="mt-2 text-lg font-semibold text-slate-950 dark:text-white">Conversation details</h4>
              </div>
              <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Contact</p>
                <p className="mt-2 text-base font-semibold text-slate-950 dark:text-slate-100">{selectedConversation.display_name}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{selectedConversation.phone_number}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Service window</p>
                  <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">{serviceWindowOpen ? 'Open for free-form replies' : 'Closed until customer replies'}</p>
                  {serviceWindowExpiresAt ? <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Most recent deadline: {serviceWindowExpiresAt}</p> : null}
                </div>
                <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Message summary</p>
                  <p className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">{orderedMessages.length} messages loaded</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{orderedMessages.filter((log) => log.direction === 'inbound').length} inbound, {orderedMessages.filter((log) => log.direction !== 'inbound').length} outbound</p>
                </div>
              </div>
              <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Notes</p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {selectedConversation.contact?.notes || 'No contact notes have been saved for this client yet.'}
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-900/60">
                <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Attachment policy</p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  Supported files: images, PDF, Word, Excel, and plain text up to 8 MB. Media is fetched server-side through the live WhatsApp backend.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[320px] items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-slate-50/70 px-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-400">
              Select a conversation to view contact context, attachment support, and reply window status.
            </div>
          )}
        </div>
      </div>

      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Client</DialogTitle>
            <DialogDescription>
              Save a WhatsApp contact once, prevent duplicates by normalized number, and make the conversation available immediately in the inbox.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Client name</Label>
              <Input id="client-name" value={clientForm.name} onChange={(event) => handleClientFieldChange('name', event.target.value)} placeholder="Enter client name" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-phone">WhatsApp number</Label>
              <Input id="client-phone" value={clientForm.phoneNumber} onChange={(event) => handleClientFieldChange('phoneNumber', event.target.value)} placeholder="e.g. +919876543210" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-notes">Notes</Label>
              <Textarea id="client-notes" value={clientForm.notes} onChange={(event) => handleClientFieldChange('notes', event.target.value)} placeholder="Optional care notes or contact context" className="min-h-[110px]" />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsAddClientOpen(false)} disabled={savingClient}>
              Cancel
            </Button>
            <Button type="button" className="bg-cyan-600 text-white hover:bg-cyan-700" onClick={handleCreateClient} disabled={savingClient}>
              {savingClient ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Save client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </GlassPanel>
  );
};

export default WhatsAppInbox;