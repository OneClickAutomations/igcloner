-- ════════════════════════════════════════════════════════════
-- SETTINGS & INTEGRATIONS CENTER — FOUNDATION MIGRATION
-- ════════════════════════════════════════════════════════════

-- ── Profile extended fields ──────────────────────────────────
alter table profiles add column if not exists workspace_name text;
alter table profiles add column if not exists timezone text default 'America/New_York';
alter table profiles add column if not exists country text;
alter table profiles add column if not exists language text default 'en';
alter table profiles add column if not exists last_login_at timestamptz;
-- avatar_url already exists in the profiles table

-- ── Third-party API keys — encrypted at rest ─────────────────
create table if not exists user_api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  provider text not null check (provider in (
    'upload_post', 'elevenlabs', 'openai', 'anthropic', 'nano_banana', 'apify'
  )),
  encrypted_key text not null,
  key_last_four text,
  status text not null default 'unvalidated' check (status in (
    'unvalidated', 'valid', 'invalid', 'expired', 'rate_limited'
  )),
  last_validated_at timestamptz,
  last_validation_error text,
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, provider)
);
alter table user_api_keys enable row level security;

-- Users can see their own key status — never the encrypted_key column.
-- All writes must go through service-role server functions.
create policy "Users view own key metadata" on user_api_keys
  for select using (auth.uid() = user_id);

-- ── User preferences ─────────────────────────────────────────
create table if not exists user_preferences (
  user_id uuid references profiles(id) on delete cascade primary key,
  theme text default 'system' check (theme in ('light', 'dark', 'system')),
  default_reel_style text,
  default_voice_id text,
  default_caption_style text,
  default_platform text,
  default_language text default 'en',
  updated_at timestamptz default now()
);
alter table user_preferences enable row level security;
create policy "Users manage own preferences" on user_preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Publishing defaults per user ─────────────────────────────
create table if not exists publishing_settings (
  user_id uuid references profiles(id) on delete cascade primary key,
  default_platforms text[] default '{}',
  default_scheduling_mode text default 'manual' check (
    default_scheduling_mode in ('manual', 'auto_optimal_time')
  ),
  caption_preference text default 'platform_adapted' check (
    caption_preference in ('platform_adapted', 'identical_everywhere')
  ),
  hashtag_preference text default 'ai_suggested' check (
    hashtag_preference in ('ai_suggested', 'manual_only', 'none')
  ),
  default_cta text,
  default_post_times jsonb default '[]',
  auto_publish_enabled boolean default false,
  updated_at timestamptz default now()
);
alter table publishing_settings enable row level security;
create policy "Users manage own publishing settings" on publishing_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Reusable caption / hashtag templates ─────────────────────
create table if not exists publishing_templates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  caption_template text,
  hashtag_set text[],
  platforms text[],
  created_at timestamptz default now()
);
alter table publishing_templates enable row level security;
create policy "Users manage own templates" on publishing_templates
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ── Affiliate link click tracking ────────────────────────────
create table if not exists affiliate_link_clicks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete set null,
  provider text not null,
  source_location text,
  clicked_at timestamptz default now()
);
alter table affiliate_link_clicks enable row level security;
create policy "Authenticated users insert own clicks" on affiliate_link_clicks
  for insert with check (auth.uid() = user_id);
create policy "Users view own clicks" on affiliate_link_clicks
  for select using (auth.uid() = user_id);

-- ── updated_at triggers ──────────────────────────────────────
create or replace function update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$ begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_user_api_keys_updated_at'
  ) then
    create trigger set_user_api_keys_updated_at
      before update on user_api_keys
      for each row execute function update_updated_at_column();
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_user_preferences_updated_at'
  ) then
    create trigger set_user_preferences_updated_at
      before update on user_preferences
      for each row execute function update_updated_at_column();
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_trigger where tgname = 'set_publishing_settings_updated_at'
  ) then
    create trigger set_publishing_settings_updated_at
      before update on publishing_settings
      for each row execute function update_updated_at_column();
  end if;
end $$;
