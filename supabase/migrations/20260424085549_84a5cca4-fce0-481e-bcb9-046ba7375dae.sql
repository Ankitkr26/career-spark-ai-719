
-- ============ ENUMS ============
create type public.app_role as enum ('admin', 'student');

-- ============ PROFILES ============
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  headline text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

create policy "Profiles viewable by authenticated"
  on public.profiles for select to authenticated using (true);
create policy "Users update own profile"
  on public.profiles for update to authenticated using (auth.uid() = id);
create policy "Users insert own profile"
  on public.profiles for insert to authenticated with check (auth.uid() = id);

-- ============ USER ROLES ============
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.user_roles where user_id = _user_id and role = _role
  )
$$;

create policy "Users see own roles"
  on public.user_roles for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage roles"
  on public.user_roles for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

-- ============ AUTO-CREATE PROFILE + DEFAULT ROLE ============
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  insert into public.user_roles (user_id, role) values (new.id, 'student');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ updated_at helper ============
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- ============ RESUMES ============
create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_path text not null,
  raw_text text,
  skills text[] default '{}',
  education jsonb default '[]'::jsonb,
  experience jsonb default '[]'::jsonb,
  ats_score int,
  missing_skills text[] default '{}',
  suggestions text[] default '{}',
  summary text,
  status text not null default 'pending', -- pending | analyzing | analyzed | failed
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.resumes enable row level security;
create index resumes_user_id_idx on public.resumes(user_id);

create policy "Students view own resumes"
  on public.resumes for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "Students insert own resumes"
  on public.resumes for insert to authenticated with check (auth.uid() = user_id);
create policy "Students update own resumes"
  on public.resumes for update to authenticated using (auth.uid() = user_id);
create policy "Students delete own resumes"
  on public.resumes for delete to authenticated using (auth.uid() = user_id);

create trigger resumes_updated_at before update on public.resumes
  for each row execute function public.set_updated_at();

-- ============ JOBS ============
create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  location text,
  job_type text default 'Full-time',
  description text not null,
  required_skills text[] default '{}',
  experience_level text default 'Entry',
  salary_range text,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.jobs enable row level security;

create policy "Authenticated view active jobs"
  on public.jobs for select to authenticated
  using (is_active or public.has_role(auth.uid(), 'admin'));
create policy "Admins manage jobs"
  on public.jobs for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create trigger jobs_updated_at before update on public.jobs
  for each row execute function public.set_updated_at();

-- ============ APPLICATIONS / MATCHES ============
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  resume_id uuid references public.resumes(id) on delete set null,
  match_score int,
  matched_skills text[] default '{}',
  missing_skills text[] default '{}',
  status text not null default 'saved', -- saved | applied
  notes text,
  created_at timestamptz not null default now()
);
alter table public.applications enable row level security;
create index applications_user_idx on public.applications(user_id);
create index applications_job_idx on public.applications(job_id);

create policy "Users view own applications"
  on public.applications for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "Users insert own applications"
  on public.applications for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own applications"
  on public.applications for update to authenticated using (auth.uid() = user_id);
create policy "Users delete own applications"
  on public.applications for delete to authenticated using (auth.uid() = user_id);

-- ============ MOCK INTERVIEWS ============
create table public.mock_interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_target text not null,
  questions jsonb not null default '[]'::jsonb, -- [{question, answer, feedback, score}]
  overall_score int,
  overall_feedback text,
  status text not null default 'in_progress', -- in_progress | completed
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.mock_interviews enable row level security;
create index mock_interviews_user_idx on public.mock_interviews(user_id);

create policy "Users access own interviews"
  on public.mock_interviews for select to authenticated
  using (auth.uid() = user_id or public.has_role(auth.uid(), 'admin'));
create policy "Users insert own interviews"
  on public.mock_interviews for insert to authenticated with check (auth.uid() = user_id);
create policy "Users update own interviews"
  on public.mock_interviews for update to authenticated using (auth.uid() = user_id);

create trigger mock_interviews_updated_at before update on public.mock_interviews
  for each row execute function public.set_updated_at();

-- ============ STORAGE BUCKET FOR RESUMES ============
insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

create policy "Users upload to own resume folder"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
create policy "Users read own resumes"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'resumes'
    and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role(auth.uid(), 'admin'))
  );
create policy "Users delete own resumes"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'resumes'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
