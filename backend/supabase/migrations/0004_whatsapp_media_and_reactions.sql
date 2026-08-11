alter table if exists public.whatsapp_logs
  add column if not exists message_type text not null default 'text',
  add column if not exists media_type text,
  add column if not exists media_id text,
  add column if not exists mime_type text,
  add column if not exists file_name text,
  add column if not exists caption text,
  add column if not exists reaction_emoji text,
  add column if not exists reaction_target_message_id text,
  add column if not exists media_size_bytes bigint;

create index if not exists idx_whatsapp_logs_media_id on public.whatsapp_logs(media_id);
create index if not exists idx_whatsapp_logs_reaction_target on public.whatsapp_logs(reaction_target_message_id);