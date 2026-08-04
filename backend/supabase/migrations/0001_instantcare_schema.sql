create extension if not exists pgcrypto;
create extension if not exists citext;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_status') then
    create type public.user_status as enum ('active', 'invited', 'suspended', 'archived');
  end if;

  if not exists (select 1 from pg_type where typname = 'gender_type') then
    create type public.gender_type as enum ('male', 'female', 'other', 'prefer_not_to_say');
  end if;

  if not exists (select 1 from pg_type where typname = 'staff_status') then
    create type public.staff_status as enum ('active', 'inactive', 'on_leave', 'terminated');
  end if;

  if not exists (select 1 from pg_type where typname = 'appointment_status') then
    create type public.appointment_status as enum ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show');
  end if;

  if not exists (select 1 from pg_type where typname = 'invoice_status') then
    create type public.invoice_status as enum ('draft', 'issued', 'partially_paid', 'paid', 'overdue', 'void');
  end if;

  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum ('pending', 'completed', 'failed', 'refunded', 'cancelled');
  end if;

  if not exists (select 1 from pg_type where typname = 'insurance_status') then
    create type public.insurance_status as enum ('active', 'pending_approval', 'approved', 'rejected', 'expired', 'closed');
  end if;

  if not exists (select 1 from pg_type where typname = 'timeline_actor_type') then
    create type public.timeline_actor_type as enum ('system', 'user', 'staff', 'doctor', 'nurse', 'family');
  end if;

  if not exists (select 1 from pg_type where typname = 'notification_channel') then
    create type public.notification_channel as enum ('in_app', 'email', 'whatsapp', 'sms');
  end if;

  if not exists (select 1 from pg_type where typname = 'notification_status') then
    create type public.notification_status as enum ('queued', 'scheduled', 'sent', 'delivered', 'read', 'failed');
  end if;

  if not exists (select 1 from pg_type where typname = 'library_status') then
    create type public.library_status as enum ('draft', 'published', 'archived');
  end if;
end $$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email citext not null unique,
  password_hash text,
  phone text,
  full_name text not null,
  avatar_url text,
  preferred_language text,
  status public.user_status not null default 'active',
  last_login_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.auth_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  refresh_token_hash text not null,
  session_type text not null default 'refresh_token',
  role_slug text not null,
  user_agent text,
  ip_address text,
  expires_at timestamptz not null,
  last_used_at timestamptz,
  revoked_at timestamptz,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.email_otps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete cascade,
  email citext not null,
  otp_hash text not null,
  purpose text not null default 'forgot_password',
  role_slug text,
  expires_at timestamptz not null,
  verified_at timestamptz,
  consumed_at timestamptz,
  status text not null default 'pending',
  attempt_count integer not null default 0,
  max_attempts integer not null default 5,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  resource text not null,
  action text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (resource, action)
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (role_id, permission_id)
);

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  assigned_by_user_id uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, role_id)
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  admin_code text unique,
  is_super_admin boolean not null default false,
  dashboard_scope jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.hospitals (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  hospital_type text,
  email citext,
  phone text,
  emergency_phone text,
  address_line_1 text,
  address_line_2 text,
  city text not null,
  state text,
  country text default 'India',
  postal_code text,
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  accreditation text,
  departments jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users(id) on delete set null,
  manager_staff_id uuid references public.staff(id) on delete set null,
  hospital_id uuid references public.hospitals(id) on delete set null,
  employee_code text not null unique,
  full_name text not null,
  email citext unique,
  phone text,
  whatsapp_number text,
  city text,
  state text,
  department text,
  role_title text not null,
  status public.staff_status not null default 'active',
  availability text,
  joined_at date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid unique references public.staff(id) on delete set null,
  hospital_id uuid references public.hospitals(id) on delete set null,
  full_name text not null,
  email citext,
  phone text,
  speciality text not null,
  qualification text,
  license_number text unique,
  years_experience integer,
  consultation_modes jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.nurses (
  id uuid primary key default gen_random_uuid(),
  staff_id uuid unique references public.staff(id) on delete set null,
  hospital_id uuid references public.hospitals(id) on delete set null,
  full_name text not null,
  email citext,
  phone text,
  qualification text not null,
  registration_number text unique,
  specialization text,
  experience_years integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category text,
  description text,
  service_mode text,
  base_price numeric(12, 2),
  currency_code text not null default 'INR',
  duration_minutes integer,
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  country text,
  mobile_number text not null,
  whatsapp_number text,
  email citext,
  patient_name text,
  patient_age integer,
  gender public.gender_type,
  city text,
  postal_code text,
  manual_location text,
  current_latitude numeric(9, 6),
  current_longitude numeric(9, 6),
  preferred_language text,
  service_required text not null,
  medical_condition text,
  hospital_name text,
  doctor_name text,
  preferred_date date,
  preferred_time time,
  additional_notes text,
  source text not null default 'web',
  status text not null default 'new',
  priority text not null default 'normal',
  assigned_to_user_id uuid references public.users(id) on delete set null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  patient_code text not null unique,
  portal_user_id uuid references public.users(id) on delete set null,
  primary_doctor_id uuid references public.doctors(id) on delete set null,
  primary_nurse_id uuid references public.nurses(id) on delete set null,
  primary_hospital_id uuid references public.hospitals(id) on delete set null,
  care_coordinator_staff_id uuid references public.staff(id) on delete set null,
  first_name text not null,
  last_name text,
  full_name text generated always as (trim(concat_ws(' ', first_name, last_name))) stored,
  gender public.gender_type,
  date_of_birth date,
  blood_group text,
  email citext,
  phone text,
  whatsapp_number text,
  country text,
  city text,
  state text,
  postal_code text,
  address_line_1 text,
  address_line_2 text,
  current_latitude numeric(9, 6),
  current_longitude numeric(9, 6),
  preferred_language text,
  medical_condition text,
  allergies jsonb not null default '[]'::jsonb,
  medical_history jsonb not null default '[]'::jsonb,
  status text not null default 'active',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.patient_family (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  full_name text not null,
  relationship text not null,
  email citext,
  phone text,
  whatsapp_number text,
  country text,
  city text,
  receives_updates boolean not null default true,
  is_primary_contact boolean not null default false,
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tpa (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text unique,
  email citext,
  phone text,
  address_line_1 text,
  address_line_2 text,
  city text,
  state text,
  country text default 'India',
  postal_code text,
  contact_person_name text,
  contact_person_phone text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.insurance (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  hospital_id uuid references public.hospitals(id) on delete set null,
  tpa_id uuid references public.tpa(id) on delete set null,
  provider_name text not null,
  policy_number text not null,
  member_id text,
  claim_id text,
  coverage_type text,
  insured_amount numeric(12, 2),
  approval_amount numeric(12, 2),
  status public.insurance_status not null default 'active',
  valid_from date,
  valid_until date,
  documents jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (provider_name, policy_number)
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  service_id uuid references public.services(id) on delete set null,
  hospital_id uuid references public.hospitals(id) on delete set null,
  doctor_id uuid references public.doctors(id) on delete set null,
  nurse_id uuid references public.nurses(id) on delete set null,
  coordinator_staff_id uuid references public.staff(id) on delete set null,
  family_contact_id uuid references public.patient_family(id) on delete set null,
  appointment_type text,
  visit_type text,
  status public.appointment_status not null default 'scheduled',
  scheduled_start timestamptz not null,
  scheduled_end timestamptz,
  check_in_at timestamptz,
  completed_at timestamptz,
  location_text text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.invoices (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete restrict,
  appointment_id uuid references public.appointments(id) on delete set null,
  insurance_id uuid references public.insurance(id) on delete set null,
  invoice_number text not null unique,
  currency_code text not null default 'INR',
  subtotal_amount numeric(12, 2) not null default 0,
  discount_amount numeric(12, 2) not null default 0,
  tax_amount numeric(12, 2) not null default 0,
  total_amount numeric(12, 2) not null default 0,
  balance_due_amount numeric(12, 2) not null default 0,
  due_date date,
  status public.invoice_status not null default 'draft',
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  patient_id uuid not null references public.patients(id) on delete restrict,
  payment_reference text unique,
  payment_method text,
  amount numeric(12, 2) not null,
  currency_code text not null default 'INR',
  status public.payment_status not null default 'pending',
  paid_at timestamptz,
  gateway_name text,
  gateway_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.medical_reports (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  uploaded_by_user_id uuid references public.users(id) on delete set null,
  report_type text not null,
  report_title text not null,
  report_date date,
  file_name text,
  file_path text not null,
  storage_bucket text,
  mime_type text,
  file_size_bytes bigint,
  summary text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.vitals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  recorded_by_staff_id uuid references public.staff(id) on delete set null,
  recorded_at timestamptz not null default timezone('utc', now()),
  heart_rate integer,
  systolic_bp integer,
  diastolic_bp integer,
  temperature_c numeric(4, 1),
  oxygen_saturation integer,
  respiratory_rate integer,
  glucose_level numeric(6, 2),
  weight_kg numeric(6, 2),
  height_cm numeric(6, 2),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.daily_notes (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  author_user_id uuid references public.users(id) on delete set null,
  author_staff_id uuid references public.staff(id) on delete set null,
  note_date date not null default current_date,
  note_type text not null default 'care-update',
  content text not null,
  visibility text not null default 'internal',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.timeline (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  actor_user_id uuid references public.users(id) on delete set null,
  actor_staff_id uuid references public.staff(id) on delete set null,
  actor_type public.timeline_actor_type not null default 'system',
  event_type text not null,
  title text not null,
  description text,
  event_at timestamptz not null default timezone('utc', now()),
  related_table text,
  related_record_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_user_id uuid references public.users(id) on delete cascade,
  patient_id uuid references public.patients(id) on delete cascade,
  appointment_id uuid references public.appointments(id) on delete set null,
  channel public.notification_channel not null,
  status public.notification_status not null default 'queued',
  subject text,
  message text not null,
  scheduled_for timestamptz,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  external_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.whatsapp_logs (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid references public.notifications(id) on delete set null,
  patient_id uuid references public.patients(id) on delete set null,
  appointment_id uuid references public.appointments(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  recipient_user_id uuid references public.users(id) on delete set null,
  whatsapp_type text not null,
  phone_number_id text,
  recipient_phone text not null,
  template_name text,
  message_body text not null,
  status public.notification_status not null default 'queued',
  attempt_count integer not null default 0,
  max_attempts integer not null default 3,
  next_retry_at timestamptz,
  last_error text,
  provider_message_id text,
  idempotency_key text,
  direction text not null default 'outbound',
  webhook_payload jsonb not null default '{}'::jsonb,
  provider_response jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.email_logs (
  id uuid primary key default gen_random_uuid(),
  notification_id uuid references public.notifications(id) on delete set null,
  patient_id uuid references public.patients(id) on delete set null,
  appointment_id uuid references public.appointments(id) on delete set null,
  invoice_id uuid references public.invoices(id) on delete set null,
  recipient_user_id uuid references public.users(id) on delete set null,
  email_type text not null,
  from_email text,
  reply_to_email text,
  recipient_email citext not null,
  subject text not null,
  body_html text,
  body_text text,
  status public.notification_status not null default 'queued',
  attempt_count integer not null default 0,
  max_attempts integer not null default 3,
  next_retry_at timestamptz,
  last_error text,
  provider_message_id text,
  idempotency_key text,
  provider_response jsonb not null default '{}'::jsonb,
  sent_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.healthcare_library (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  audience text,
  status public.library_status not null default 'published',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  library_id uuid references public.healthcare_library(id) on delete cascade,
  parent_category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  sort_order integer not null default 0,
  status public.library_status not null default 'published',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (library_id, slug)
);

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  library_id uuid references public.healthcare_library(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  author_user_id uuid references public.users(id) on delete set null,
  title text not null,
  slug text not null unique,
  excerpt text,
  content_markdown text not null,
  content_html text,
  seo_title text,
  seo_description text,
  status public.library_status not null default 'draft',
  published_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  library_id uuid references public.healthcare_library(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  status public.library_status not null default 'published',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_auth_user_id on public.users(auth_user_id);
create index if not exists idx_auth_sessions_user_id on public.auth_sessions(user_id);
create index if not exists idx_auth_sessions_status_expires on public.auth_sessions(status, expires_at);
create index if not exists idx_email_otps_email_purpose on public.email_otps(email, purpose, status);
create index if not exists idx_staff_hospital_id on public.staff(hospital_id);
create index if not exists idx_staff_manager_staff_id on public.staff(manager_staff_id);
create index if not exists idx_doctors_hospital_id on public.doctors(hospital_id);
create index if not exists idx_nurses_hospital_id on public.nurses(hospital_id);
create index if not exists idx_enquiries_status_created_at on public.enquiries(status, created_at desc);
create index if not exists idx_enquiries_service_required on public.enquiries(service_required);
create index if not exists idx_enquiries_assigned_to_user_id on public.enquiries(assigned_to_user_id);
create index if not exists idx_patients_primary_hospital_id on public.patients(primary_hospital_id);
create index if not exists idx_patients_primary_doctor_id on public.patients(primary_doctor_id);
create index if not exists idx_patients_primary_nurse_id on public.patients(primary_nurse_id);
create index if not exists idx_patients_care_coordinator_staff_id on public.patients(care_coordinator_staff_id);
create index if not exists idx_patients_full_name on public.patients(full_name);
create index if not exists idx_patient_family_patient_id on public.patient_family(patient_id);
create index if not exists idx_patient_family_user_id on public.patient_family(user_id);
create index if not exists idx_insurance_patient_id on public.insurance(patient_id);
create index if not exists idx_insurance_tpa_id on public.insurance(tpa_id);
create index if not exists idx_appointments_patient_id on public.appointments(patient_id);
create index if not exists idx_appointments_doctor_id on public.appointments(doctor_id);
create index if not exists idx_appointments_nurse_id on public.appointments(nurse_id);
create index if not exists idx_appointments_hospital_id on public.appointments(hospital_id);
create index if not exists idx_appointments_service_id on public.appointments(service_id);
create index if not exists idx_appointments_status_start on public.appointments(status, scheduled_start desc);
create index if not exists idx_invoices_patient_id on public.invoices(patient_id);
create index if not exists idx_invoices_appointment_id on public.invoices(appointment_id);
create index if not exists idx_invoices_status_due_date on public.invoices(status, due_date);
create index if not exists idx_payments_invoice_id on public.payments(invoice_id);
create index if not exists idx_payments_patient_id on public.payments(patient_id);
create index if not exists idx_medical_reports_patient_id on public.medical_reports(patient_id);
create index if not exists idx_medical_reports_appointment_id on public.medical_reports(appointment_id);
create index if not exists idx_vitals_patient_recorded_at on public.vitals(patient_id, recorded_at desc);
create index if not exists idx_daily_notes_patient_note_date on public.daily_notes(patient_id, note_date desc);
create index if not exists idx_timeline_patient_event_at on public.timeline(patient_id, event_at desc);
create index if not exists idx_notifications_recipient_status on public.notifications(recipient_user_id, status, created_at desc);
create index if not exists idx_notifications_patient_id on public.notifications(patient_id);
create index if not exists idx_whatsapp_logs_notification_id on public.whatsapp_logs(notification_id);
create index if not exists idx_whatsapp_logs_status_retry on public.whatsapp_logs(status, next_retry_at, created_at desc);
create index if not exists idx_whatsapp_logs_patient_id on public.whatsapp_logs(patient_id);
create index if not exists idx_whatsapp_logs_appointment_id on public.whatsapp_logs(appointment_id);
create index if not exists idx_whatsapp_logs_invoice_id on public.whatsapp_logs(invoice_id);
create index if not exists idx_whatsapp_logs_provider_message_id on public.whatsapp_logs(provider_message_id);
create index if not exists idx_email_logs_notification_id on public.email_logs(notification_id);
create index if not exists idx_email_logs_status_retry on public.email_logs(status, next_retry_at, created_at desc);
create index if not exists idx_email_logs_patient_id on public.email_logs(patient_id);
create index if not exists idx_email_logs_appointment_id on public.email_logs(appointment_id);
create index if not exists idx_email_logs_invoice_id on public.email_logs(invoice_id);
create index if not exists idx_articles_category_id on public.articles(category_id);
create index if not exists idx_articles_status_published_at on public.articles(status, published_at desc);
create index if not exists idx_faqs_category_id on public.faqs(category_id);

create unique index if not exists idx_patient_family_primary_contact on public.patient_family(patient_id)
where is_primary_contact = true;

alter table public.users
  add constraint users_auth_user_fk
  foreign key (auth_user_id) references auth.users(id) on delete cascade;

create or replace trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create or replace trigger set_auth_sessions_updated_at
before update on public.auth_sessions
for each row execute function public.set_updated_at();

create or replace trigger set_email_otps_updated_at
before update on public.email_otps
for each row execute function public.set_updated_at();

create or replace trigger set_roles_updated_at
before update on public.roles
for each row execute function public.set_updated_at();

create or replace trigger set_permissions_updated_at
before update on public.permissions
for each row execute function public.set_updated_at();

create or replace trigger set_admin_users_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

create or replace trigger set_hospitals_updated_at
before update on public.hospitals
for each row execute function public.set_updated_at();

create or replace trigger set_staff_updated_at
before update on public.staff
for each row execute function public.set_updated_at();

create or replace trigger set_doctors_updated_at
before update on public.doctors
for each row execute function public.set_updated_at();

create or replace trigger set_nurses_updated_at
before update on public.nurses
for each row execute function public.set_updated_at();

create or replace trigger set_services_updated_at
before update on public.services
for each row execute function public.set_updated_at();

create or replace trigger set_enquiries_updated_at
before update on public.enquiries
for each row execute function public.set_updated_at();

create or replace trigger set_patients_updated_at
before update on public.patients
for each row execute function public.set_updated_at();

create or replace trigger set_patient_family_updated_at
before update on public.patient_family
for each row execute function public.set_updated_at();

create or replace trigger set_tpa_updated_at
before update on public.tpa
for each row execute function public.set_updated_at();

create or replace trigger set_insurance_updated_at
before update on public.insurance
for each row execute function public.set_updated_at();

create or replace trigger set_appointments_updated_at
before update on public.appointments
for each row execute function public.set_updated_at();

create or replace trigger set_invoices_updated_at
before update on public.invoices
for each row execute function public.set_updated_at();

create or replace trigger set_payments_updated_at
before update on public.payments
for each row execute function public.set_updated_at();

create or replace trigger set_medical_reports_updated_at
before update on public.medical_reports
for each row execute function public.set_updated_at();

create or replace trigger set_vitals_updated_at
before update on public.vitals
for each row execute function public.set_updated_at();

create or replace trigger set_daily_notes_updated_at
before update on public.daily_notes
for each row execute function public.set_updated_at();

create or replace trigger set_timeline_updated_at
before update on public.timeline
for each row execute function public.set_updated_at();

create or replace trigger set_notifications_updated_at
before update on public.notifications
for each row execute function public.set_updated_at();

create or replace trigger set_whatsapp_logs_updated_at
before update on public.whatsapp_logs
for each row execute function public.set_updated_at();

create or replace trigger set_email_logs_updated_at
before update on public.email_logs
for each row execute function public.set_updated_at();

create or replace trigger set_healthcare_library_updated_at
before update on public.healthcare_library
for each row execute function public.set_updated_at();

create or replace trigger set_categories_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

create or replace trigger set_articles_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

create or replace trigger set_faqs_updated_at
before update on public.faqs
for each row execute function public.set_updated_at();