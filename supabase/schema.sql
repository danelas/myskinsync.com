-- MySkinSync subscribers. Run this in your Supabase project's SQL editor.
-- Inserts happen ONLY server-side via the service-role key (see app/api/subscribe),
-- so we keep RLS on with no public policies.

create table if not exists subscribers (
  id          uuid primary key default gen_random_uuid(),
  email       text not null,
  skin_type   text,
  concern     text,
  sensitive   text,
  budget      text,
  routine     jsonb,
  source      text default 'quiz',
  created_at  timestamptz not null default now()
);

-- One row per email; re-subscribing updates the latest routine (upsert).
create unique index if not exists subscribers_email_key on subscribers (email);

alter table subscribers enable row level security;
-- (No policies = no anon access. The server route uses the service-role key.)
