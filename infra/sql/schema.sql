-- Minimal Postgres schema for MVP

create table if not exists app_user (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text,
  name text,
  plan text not null default 'FREE',
  stripe_customer_id text,
  two_factor_secret text,
  two_factor_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists transfer (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  owner_id uuid not null references app_user(id),
  expires_at timestamptz not null,
  max_downloads int,
  password_hash text,
  total_size_bytes bigint not null,
  status text not null default 'ACTIVE',
  created_at timestamptz not null default now()
);

create table if not exists file_object (
  id uuid primary key default gen_random_uuid(),
  transfer_id uuid not null references transfer(id) on delete cascade,
  b2_key text not null,
  name text not null,
  size_bytes bigint not null,
  content_type text,
  checksum_sha256 text,
  created_at timestamptz not null default now()
);

create table if not exists recipient (
  id uuid primary key default gen_random_uuid(),
  transfer_id uuid not null references transfer(id) on delete cascade,
  email text not null,
  sent_at timestamptz,
  opened_at timestamptz,
  downloaded_at timestamptz
);

create table if not exists transfer_event (
  id uuid primary key default gen_random_uuid(),
  transfer_id uuid not null references transfer(id) on delete cascade,
  type text not null,
  ip inet,
  user_agent text,
  country text,
  created_at timestamptz not null default now(),
  meta jsonb
);

create index if not exists idx_transfer_owner_created on transfer(owner_id, created_at desc);
create index if not exists idx_file_transfer on file_object(transfer_id);
create index if not exists idx_recipient_transfer on recipient(transfer_id);
create index if not exists idx_event_transfer_created on transfer_event(transfer_id, created_at desc);
