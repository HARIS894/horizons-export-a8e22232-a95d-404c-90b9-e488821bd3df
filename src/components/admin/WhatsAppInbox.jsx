import React, { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Loader2,
  MessageSquareText,
  Phone,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  SendHorizontal,
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

const getFriendlyError = (error, fallback) => {
  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

const emptyClientForm = {
  name: '',
  phoneNumber: '',
  notes: '',
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
  const unreadCount = Number(conversation?.unread_count || 0);

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
  const [refreshing, setRefreshing] = useState(false);
  const [retryingId, setRetryingId] = useState('');
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [clientForm, setClientForm] = useState(emptyClientForm);
  const [savingClient, setSavingClient] = useState(false);
  const conversationsRef = useRef([]);
  const selectedConversationIdRef = useRef('');

  const orderedMessages = useMemo(() => sortLogsAscending(messages), [messages]);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadConversationList({ page: 1, append: false }),
      selectedConversationId ? loadConversationMessages(selectedConversationId, { page: 1, append: false }) : Promise.resolve(),
    ]);
  };

  const handleSend = async () => {
    const trimmedReply = reply.trim();

    if (!selectedConversation?.phone_number || !trimmedReply) {
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

      <div className="mt-6 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
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
                    {selectedConversation.contact?.notes ? (
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">{selectedConversation.contact.notes}</p>
                    ) : null}
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
                    disabled={sending || !reply.trim() || !selectedConversation?.phone_number}
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