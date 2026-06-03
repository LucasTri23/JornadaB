-- ═══════════════════════════════════════════
-- Bible Daily — Schema completo do Supabase
-- Cole no SQL Editor do seu projeto Supabase
-- ═══════════════════════════════════════════

-- ── Perfil do usuário ──────────────────────
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  streak int default 0,
  best_streak int default 0,
  last_read_at timestamptz,
  font_size int default 18,
  translation text default 'ARC',
  bible_onboarding_done boolean default false,
  ministry_onboarding_done boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Progresso de leitura ───────────────────
create table if not exists public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  book_id int not null,
  chapter int not null,
  read_count int default 1,
  read_at timestamptz default now(),
  unique(user_id, book_id, chapter)
);

-- ── Anotações ──────────────────────────────
create table if not exists public.user_notes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  book_id int,
  chapter int,
  verse int,
  title text,
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Planos de leitura ─────────────────────
create table if not exists public.user_reading_plans (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  plan_id int not null,
  plan_name text,
  start_date date default current_date,
  current_day int default 1,
  total_days int,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ── Perfil ministerial ────────────────────
create table if not exists public.ministry_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique not null,
  report_name text,
  congregation text,
  publisher_type text default 'PUBLISHER',
  default_report_contact text,
  include_observation boolean default false,
  remind_to_register boolean default true,
  use_return_visits boolean default true,
  use_bible_studies boolean default true,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Registros diários de ministério ──────
create table if not exists public.ministry_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  entry_date date not null,
  activity_type text not null,
  minutes int not null,
  is_credit boolean default false,
  credit_type text,
  notes text,
  created_at timestamptz default now()
);

-- ── Configurações mensais do ministério ──
create table if not exists public.ministry_month_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  month int not null,
  year int not null,
  service_year text,
  publisher_type_for_month text,
  monthly_goal_minutes int,
  is_special_month boolean default false,
  participated_in_ministry boolean default false,
  notes text,
  created_at timestamptz default now(),
  unique(user_id, month, year)
);

-- ── Revisitas ─────────────────────────────
create table if not exists public.return_visits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  phone text,
  address_reference text,
  first_conversation_date date,
  subject_discussed text,
  scripture_used text,
  material_left text,
  next_visit_date date,
  status text default 'PENDING',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Estudos bíblicos (ministério) ────────
create table if not exists public.ministry_bible_studies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  phone text,
  address_reference text,
  usual_day_time text,
  publication text,
  current_lesson text,
  current_paragraph text,
  doubts text,
  next_points text,
  last_study_date date,
  next_study_date date,
  status text default 'ACTIVE',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ── Sessões de estudo ─────────────────────
create table if not exists public.study_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  bible_study_id uuid references public.ministry_bible_studies(id) on delete cascade not null,
  session_date date not null,
  minutes int not null,
  lesson_studied text,
  paragraph_studied text,
  doubts text,
  notes text,
  created_at timestamptz default now()
);

-- ── Relatórios mensais ────────────────────
create table if not exists public.monthly_reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  month int not null,
  year int not null,
  publisher_type text,
  ministry_minutes int default 0,
  credit_minutes int default 0,
  bible_studies_count int default 0,
  participated_in_ministry boolean default false,
  generated_text text,
  created_at timestamptz default now(),
  unique(user_id, month, year)
);

-- ═══════════════════════════════════════════
-- RLS (Row Level Security) — dados privados
-- ═══════════════════════════════════════════
alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.user_notes enable row level security;
alter table public.user_reading_plans enable row level security;
alter table public.ministry_profiles enable row level security;
alter table public.ministry_entries enable row level security;
alter table public.ministry_month_settings enable row level security;
alter table public.return_visits enable row level security;
alter table public.ministry_bible_studies enable row level security;
alter table public.study_sessions enable row level security;
alter table public.monthly_reports enable row level security;

-- Políticas: cada usuário vê e modifica só seus dados
create policy "own_profile" on public.profiles for all using (auth.uid() = id);
create policy "own_progress" on public.user_progress for all using (auth.uid() = user_id);
create policy "own_notes" on public.user_notes for all using (auth.uid() = user_id);
create policy "own_plans" on public.user_reading_plans for all using (auth.uid() = user_id);
create policy "own_ministry_profile" on public.ministry_profiles for all using (auth.uid() = user_id);
create policy "own_ministry_entries" on public.ministry_entries for all using (auth.uid() = user_id);
create policy "own_month_settings" on public.ministry_month_settings for all using (auth.uid() = user_id);
create policy "own_return_visits" on public.return_visits for all using (auth.uid() = user_id);
create policy "own_bible_studies" on public.ministry_bible_studies for all using (auth.uid() = user_id);
create policy "own_study_sessions" on public.study_sessions for all using (auth.uid() = user_id);
create policy "own_reports" on public.monthly_reports for all using (auth.uid() = user_id);

-- Auto-criar perfil ao cadastrar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
