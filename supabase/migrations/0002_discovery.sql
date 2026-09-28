create table if not exists public.discovery_sources(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  source_type text not null,
  base_url text,
  allowed_for_discovery boolean not null default false,
  provenance_required boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.discovery_jobs(
  id uuid primary key default gen_random_uuid(),
  country_id uuid references public.countries(id),
  country_iso2 text not null,
  target_count integer not null default 0 check(target_count>=0),
  source_id uuid references public.discovery_sources(id),
  status text not null default 'queued',
  found_count integer not null default 0,
  accepted_count integer not null default 0,
  rejected_count integer not null default 0,
  error_message text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.contact_import_batches(
  id uuid primary key default gen_random_uuid(),
  filename text,
  source_type text not null default 'user_import',
  total_rows integer not null default 0,
  accepted_rows integer not null default 0,
  rejected_rows integer not null default 0,
  duplicate_rows integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.discovery_sources enable row level security;
alter table public.discovery_jobs enable row level security;
alter table public.contact_import_batches enable row level security;

create policy "admin discovery sources" on public.discovery_sources for all to authenticated using ((select auth.jwt()->'app_metadata'->>'role')='admin') with check ((select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "admin discovery jobs" on public.discovery_jobs for all to authenticated using ((select auth.jwt()->'app_metadata'->>'role')='admin') with check ((select auth.jwt()->'app_metadata'->>'role')='admin');
create policy "admin import batches" on public.contact_import_batches for all to authenticated using ((select auth.jwt()->'app_metadata'->>'role')='admin') with check ((select auth.jwt()->'app_metadata'->>'role')='admin');

alter table public.countries drop constraint if exists countries_iso2_key;
create unique index if not exists countries_iso2_unique_idx on public.countries(iso2);
