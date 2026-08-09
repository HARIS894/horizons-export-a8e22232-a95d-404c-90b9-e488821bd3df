create table if not exists public.whatsapp_contacts (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone_number text not null unique,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.whatsapp_conversations (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references public.whatsapp_contacts(id) on delete set null,
  phone_number text not null unique,
  status text not null default 'open',
  unread_count integer not null default 0,
  last_message_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table if exists public.whatsapp_logs
  add column if not exists contact_id uuid references public.whatsapp_contacts(id) on delete set null,
  add column if not exists conversation_id uuid references public.whatsapp_conversations(id) on delete set null;

with normalized_logs as (
  select
    logs.id,
    regexp_replace(
      regexp_replace(coalesce(logs.recipient_phone, ''), '\D', '', 'g'),
      '^00',
      ''
    ) as normalized_phone
  from public.whatsapp_logs as logs
)
update public.whatsapp_logs as logs
set recipient_phone = normalized_logs.normalized_phone
from normalized_logs
where logs.id = normalized_logs.id
  and normalized_logs.normalized_phone ~ '^\d{8,15}$'
  and logs.recipient_phone is distinct from normalized_logs.normalized_phone;

insert into public.whatsapp_contacts (name, phone_number, notes)
select distinct logs.recipient_phone, logs.recipient_phone, null
from public.whatsapp_logs as logs
where coalesce(logs.recipient_phone, '') ~ '^\d{8,15}$'
on conflict (phone_number) do nothing;

insert into public.whatsapp_conversations (contact_id, phone_number, status, unread_count, last_message_at)
select
  contacts.id,
  logs.recipient_phone,
  'open',
  0,
  max(logs.created_at)
from public.whatsapp_logs as logs
join public.whatsapp_contacts as contacts
  on contacts.phone_number = logs.recipient_phone
where coalesce(logs.recipient_phone, '') ~ '^\d{8,15}$'
group by contacts.id, logs.recipient_phone
on conflict (phone_number) do update
set
  contact_id = excluded.contact_id,
  last_message_at = excluded.last_message_at;

update public.whatsapp_logs as logs
set
  contact_id = contacts.id,
  conversation_id = conversations.id
from public.whatsapp_contacts as contacts
join public.whatsapp_conversations as conversations
  on conversations.phone_number = contacts.phone_number
where logs.recipient_phone = contacts.phone_number
  and (logs.contact_id is null or logs.conversation_id is null);

create index if not exists idx_whatsapp_contacts_phone_number on public.whatsapp_contacts(phone_number);
create index if not exists idx_whatsapp_conversations_contact_id on public.whatsapp_conversations(contact_id);
create index if not exists idx_whatsapp_conversations_last_message_at on public.whatsapp_conversations(last_message_at desc);
create index if not exists idx_whatsapp_logs_contact_id on public.whatsapp_logs(contact_id);
create index if not exists idx_whatsapp_logs_conversation_id on public.whatsapp_logs(conversation_id);

create or replace trigger set_whatsapp_contacts_updated_at
before update on public.whatsapp_contacts
for each row execute function public.set_updated_at();

create or replace trigger set_whatsapp_conversations_updated_at
before update on public.whatsapp_conversations
for each row execute function public.set_updated_at();