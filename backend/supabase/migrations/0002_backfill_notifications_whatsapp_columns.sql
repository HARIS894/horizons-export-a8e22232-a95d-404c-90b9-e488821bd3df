do $$
begin
  if not exists (select 1 from pg_type where typname = 'notification_channel') then
    create type public.notification_channel as enum ('in_app', 'email', 'whatsapp', 'sms');
  end if;

  if not exists (select 1 from pg_type where typname = 'notification_status') then
    create type public.notification_status as enum ('queued', 'scheduled', 'sent', 'delivered', 'read', 'failed');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

alter table if exists public.notifications
  add column if not exists recipient_user_id uuid,
  add column if not exists patient_id uuid,
  add column if not exists appointment_id uuid,
  add column if not exists channel public.notification_channel not null default 'whatsapp',
  add column if not exists status public.notification_status not null default 'queued',
  add column if not exists subject text,
  add column if not exists message text,
  add column if not exists scheduled_for timestamptz,
  add column if not exists sent_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists read_at timestamptz,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists external_reference text,
  add column if not exists updated_at timestamptz not null default timezone('utc', now());

update public.notifications
set channel = coalesce(channel, 'whatsapp'::public.notification_channel),
    status = coalesce(status, 'queued'::public.notification_status),
    metadata = coalesce(metadata, '{}'::jsonb),
    updated_at = coalesce(updated_at, created_at, timezone('utc', now()))
where channel is null
   or status is null
   or metadata is null
   or updated_at is null;

alter table if exists public.notifications
  alter column channel set default 'whatsapp',
  alter column channel set not null,
  alter column status set default 'queued',
  alter column status set not null,
  alter column metadata set default '{}'::jsonb,
  alter column metadata set not null,
  alter column updated_at set default timezone('utc', now()),
  alter column updated_at set not null;

alter table if exists public.whatsapp_logs
  add column if not exists sent_at timestamptz,
  add column if not exists delivered_at timestamptz,
  add column if not exists read_at timestamptz;

create or replace trigger set_notifications_updated_at
before update on public.notifications
for each row execute function public.set_updated_at();

create or replace trigger set_whatsapp_logs_updated_at
before update on public.whatsapp_logs
for each row execute function public.set_updated_at();