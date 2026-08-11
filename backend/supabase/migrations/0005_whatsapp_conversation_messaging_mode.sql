alter table if exists public.whatsapp_conversations
  add column if not exists messaging_mode text default 'manual';

update public.whatsapp_conversations
set messaging_mode = 'manual'
where messaging_mode is null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'whatsapp_conversations_messaging_mode_check'
  ) then
    alter table public.whatsapp_conversations
      add constraint whatsapp_conversations_messaging_mode_check
      check (messaging_mode is null or messaging_mode in ('manual', 'automation'));
  end if;
end
$$;