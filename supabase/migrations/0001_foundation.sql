create extension if not exists pgcrypto;
create table if not exists public.countries(id uuid primary key default gen_random_uuid(),iso2 text unique not null,name text not null,region text,active boolean not null default true,created_at timestamptz not null default now());
create table if not exists public.organizations(id uuid primary key default gen_random_uuid(),name text not null,country_id uuid references public.countries(id),website_url text,industry text,source_url text,source_type text,source_discovered_at timestamptz,created_at timestamptz not null default now());
create table if not exists public.contacts(id uuid primary key default gen_random_uuid(),organization_id uuid references public.organizations(id),country_id uuid references public.countries(id),full_name text,role_title text,email text,contact_type text not null default 'organization',source_url text,source_type text,discovery_method text,discovered_at timestamptz,verification_status text not null default 'unverified',suppression_status text not null default 'clear',created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create unique index if not exists contacts_email_lower_idx on public.contacts(lower(email)) where email is not null;
create table if not exists public.campaigns(id uuid primary key default gen_random_uuid(),name text not null,status text not null default 'draft',target_count integer not null default 0,created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.campaign_contacts(id uuid primary key default gen_random_uuid(),campaign_id uuid not null references public.campaigns(id) on delete cascade,contact_id uuid not null references public.contacts(id) on delete cascade,status text not null default 'candidate',variant text,assigned_at timestamptz not null default now(),unique(campaign_id,contact_id));
create table if not exists public.suppression_list(id uuid primary key default gen_random_uuid(),email text not null,reason text not null,source text,created_at timestamptz not null default now());
create unique index if not exists suppression_email_lower_idx on public.suppression_list(lower(email));
create table if not exists public.email_events(id uuid primary key default gen_random_uuid(),campaign_id uuid references public.campaigns(id),contact_id uuid references public.contacts(id),event_type text not null,event_at timestamptz not null default now(),provider_event_id text,payload jsonb);
create table if not exists public.audit_log(id uuid primary key default gen_random_uuid(),actor_id uuid,action text not null,entity_type text,entity_id uuid,metadata jsonb,created_at timestamptz not null default now());

alter table public.countries enable row level security;
alter table public.organizations enable row level security;
alter table public.contacts enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_contacts enable row level security;
alter table public.suppression_list enable row level security;
alter table public.email_events enable row level security;
alter table public.audit_log enable row level security;

create or replace function public.set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
drop trigger if exists contacts_updated_at on public.contacts; create trigger contacts_updated_at before update on public.contacts for each row execute function public.set_updated_at();
drop trigger if exists campaigns_updated_at on public.campaigns; create trigger campaigns_updated_at before update on public.campaigns for each row execute function public.set_updated_at();