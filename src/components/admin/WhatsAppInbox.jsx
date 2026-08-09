import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Loader2,
  MessageSquareText,
  Phone,
  RefreshCw,
  RotateCcw,
  Search,
  SendHorizontal,
} from 'lucide-react';
import { instantcareApi } from '@/api/instantcareApi';
import { GlassPanel } from '@/components/admin/AdminDashboardSections';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const CONVERSATION_LOG_PAGE_SIZE = 80;
const MESSAGE_PAGE_SIZE = 25;

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

const buildConversationSummaries = (logs) => {
  const grouped = new Map();

  logs.forEach((log) => {
    const phone = String(log?.recipient_phone || '').trim();
    if (!phone) {
      return;
    }

    const timestamp = getLogTimestamp(log);
    const existing = grouped.get(phone);

    if (!existing) {
      grouped.set(phone, {
        phone,
        latestLog: log,
        lastMessageAt: timestamp,
        lastMessagePreview: getPreviewText(log),
        latestDirection: log?.direction || 'outbound',
        latestStatus: log?.status || null,
      });
      return;
    }

    const existingTime = new Date(existing.lastMessageAt || 0).getTime();
    const currentTime = new Date(timestamp || 0).getTime();

    if (currentTime >= existingTime) {
      grouped.set(phone, {
        ...existing,
        latestLog: log,
        lastMessageAt: timestamp,
        lastMessagePreview: getPreviewText(log),
        latestDirection: log?.direction || existing.latestDirection,
        latestStatus: log?.status || existing.latestStatus,
      });
    }
  });

  return [...grouped.values()].sort((left, right) => {
    const leftTime = new Date(left.lastMessageAt || 0).getTime();
    const rightTime = new Date(right.lastMessageAt || 0).getTime();
    return rightTime - leftTime;
  });
};

const getFriendlyError = (error, fallback) => {
  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

const MessageBubble = ({ log, onRetry, retryingId }) => {
  const isInbound = log?.direction === 'inbound';
  const canRetry = !isInbound && ['failed', 'queued'].includes(log?.status);

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
          {log?.status ? <Badge variant="outline" className="rounded-full border-slate-300 bg-transparent px-2 py-0 text-[10px] font-medium capitalize text-slate-500 dark:border-slate-700 dark:text-slate-300">{log.status}</Badge> : null}
        </div>
        <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{getPreviewText(log)}</p>
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <span>{formatConversationTime(getLogTimestamp(log))}</span>
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
  );
};

const ConversationListItem = ({ conversation, isActive, onSelect }) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(conversation.phone)}
      className={cn(
        'w-full rounded-[22px] border p-4 text-left transition-colors',
        isActive
          ? 'border-cyan-300 bg-cyan-500/10 dark:border-cyan-800 dark:bg-cyan-500/10'
          : 'border-slate-200/80 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700 dark:hover:bg-slate-950/60',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-950 dark:text-white">{conversation.phone}</p>
          <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{conversation.lastMessagePreview}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">{formatConversationTime(conversation.lastMessageAt)}</p>
          {conversation.latestDirection === 'inbound' ? (
            <Badge variant="outline" className="mt-2 rounded-full border-cyan-300 bg-cyan-500/10 px-2 py-0 text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-700 dark:border-cyan-800 dark:text-cyan-200">
              Incoming
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
  const [conversationLogs, setConversationLogs] = useState([]);
  const [conversationPage, setConversationPage] = useState(1);
  const [conversationMeta, setConversationMeta] = useState({ page: 1, limit: CONVERSATION_LOG_PAGE_SIZE, total: 0 });
  const [conversationLoading, setConversationLoading] = useState(false);
  const [conversationError, setConversationError] = useState('');
  const [selectedPhone, setSelectedPhone] = useState('');
  const [messages, setMessages] = useState([]);
  const [messagePage, setMessagePage] = useState(1);
  const [messageMeta, setMessageMeta] = useState({ page: 1, limit: MESSAGE_PAGE_SIZE, total: 0 });
  const [messageLoading, setMessageLoading] = useState(false);
  const [messageError, setMessageError] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [retryingId, setRetryingId] = useState('');
  const conversationLogsRef = useRef([]);
  const selectedPhoneRef = useRef('');

  const conversations = useMemo(() => buildConversationSummaries(conversationLogs), [conversationLogs]);
  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.phone === selectedPhone) || null,
    [conversations, selectedPhone],
  );
  const orderedMessages = useMemo(() => sortLogsAscending(messages), [messages]);

  useEffect(() => {
    conversationLogsRef.current = conversationLogs;
  }, [conversationLogs]);

  useEffect(() => {
    selectedPhoneRef.current = selectedPhone;
  }, [selectedPhone]);

  const loadConversationList = useCallback(async ({ page = 1, append = false, keepSelection = true } = {}) => {
    if (!append) {
      setConversationLoading(true);
      setConversationError('');
    }

    try {
      const result = await instantcareApi.listWhatsappLogs({
        page,
        limit: CONVERSATION_LOG_PAGE_SIZE,
        sortBy: 'created_at',
        sortOrder: 'desc',
        ...(deferredSearch ? { search: deferredSearch } : {}),
      });

      setConversationPage(page);
      setConversationMeta(result.meta || { page, limit: CONVERSATION_LOG_PAGE_SIZE, total: 0 });
      const mergedLogs = append ? [...conversationLogsRef.current, ...result.items] : result.items;
      const uniqueById = new Map();
      mergedLogs.forEach((item) => {
        uniqueById.set(item.id, item);
      });
      const nextLogs = [...uniqueById.values()];

      setConversationLogs(nextLogs);

      const nextConversations = buildConversationSummaries(nextLogs);
      if (!keepSelection || !nextConversations.some((conversation) => conversation.phone === selectedPhoneRef.current)) {
        setSelectedPhone(nextConversations[0]?.phone || '');
      }
    } catch (error) {
      setConversationError(getFriendlyError(error, 'Unable to load WhatsApp conversations right now.'));
    } finally {
      setConversationLoading(false);
      setRefreshing(false);
    }
  }, [deferredSearch]);

  const loadConversationMessages = useCallback(async (phone, { page = 1, append = false } = {}) => {
    if (!phone) {
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
      const result = await instantcareApi.listWhatsappLogs({
        page,
        limit: MESSAGE_PAGE_SIZE,
        sortBy: 'created_at',
        sortOrder: 'desc',
        recipientPhone: phone,
      });

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
    if (!selectedPhone) {
      setMessages([]);
      return;
    }

    loadConversationMessages(selectedPhone, { page: 1, append: false });
  }, [loadConversationMessages, selectedPhone]);

  const hasMoreConversationLogs = conversationPage * (conversationMeta.limit || CONVERSATION_LOG_PAGE_SIZE) < (conversationMeta.total || 0);
  const hasMoreMessages = messagePage * (messageMeta.limit || MESSAGE_PAGE_SIZE) < (messageMeta.total || 0);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadConversationList({ page: 1, append: false }),
      selectedPhone ? loadConversationMessages(selectedPhone, { page: 1, append: false }) : Promise.resolve(),
    ]);
  };

  const handleSend = async () => {
    const trimmedReply = reply.trim();

    if (!selectedPhone || !trimmedReply) {
      return;
    }

    setSending(true);
    try {
      await instantcareApi.sendWhatsappMessage({
        to: selectedPhone,
        message: trimmedReply,
      });
      setReply('');
      await Promise.all([
        loadConversationList({ page: 1, append: false }),
        loadConversationMessages(selectedPhone, { page: 1, append: false }),
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

  const handleRetry = async (logId) => {
    setRetryingId(logId);
    try {
      await instantcareApi.retryWhatsappLog(logId);
      await Promise.all([
        loadConversationList({ page: 1, append: false }),
        selectedPhone ? loadConversationMessages(selectedPhone, { page: 1, append: false }) : Promise.resolve(),
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
        <Button type="button" variant="outline" className="rounded-full" onClick={handleRefresh} disabled={refreshing || conversationLoading || messageLoading}>
          {refreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Refresh inbox
        </Button>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded-[28px] border border-slate-200/70 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/40">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by phone number"
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
                key={conversation.phone}
                conversation={conversation}
                isActive={conversation.phone === selectedPhone}
                onSelect={setSelectedPhone}
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
                    <h4 className="mt-2 text-xl font-semibold text-slate-950 dark:text-white">{selectedConversation.phone}</h4>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 dark:border-slate-700">
                      <Phone className="h-3.5 w-3.5" />
                      {selectedConversation.phone}
                    </span>
                    {selectedConversation.latestStatus ? (
                      <Badge variant="outline" className="rounded-full border-slate-300 bg-transparent px-3 py-1 capitalize dark:border-slate-700">
                        {selectedConversation.latestStatus}
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
                      onClick={() => loadConversationMessages(selectedPhone, { page: messagePage + 1, append: true })}
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
                  <MessageBubble key={log.id} log={log} onRetry={handleRetry} retryingId={retryingId} />
                ))}
              </div>

              <div className="mt-5 border-t border-slate-200/80 pt-4 dark:border-slate-800">
                <label className="text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  Reply to customer
                </label>
                <Textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder="Type your WhatsApp reply here"
                  className="mt-3 min-h-[120px] rounded-[22px] border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
                />
                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    This sends through the existing authenticated WhatsApp inbox endpoint.
                  </p>
                  <Button
                    type="button"
                    className="rounded-full bg-cyan-600 text-white hover:bg-cyan-700"
                    disabled={sending || !reply.trim() || !selectedPhone}
                    onClick={handleSend}
                  >
                    {sending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <SendHorizontal className="mr-2 h-4 w-4" />}
                    Send reply
                  </Button>
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
      </div>
    </GlassPanel>
  );
};

export default WhatsAppInbox;