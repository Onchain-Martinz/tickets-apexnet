create extension if not exists pgcrypto with schema extensions;

create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

create or replace function app_private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.cohorts (
  id uuid primary key default extensions.gen_random_uuid(),
  department text not null,
  level text not null check (level in ('100-level', '200-level')),
  academic_session text not null,
  semester text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (department, level, academic_session, semester)
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text not null default '',
  avatar_url text,
  department text not null default 'Psychology',
  cohort_id uuid references public.cohorts(id),
  role text not null default 'student' check (role in ('student', 'course_rep', 'admin')),
  account_status text not null default 'active' check (account_status in ('active', 'suspended')),
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.free_exam_allocations (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  course_slug text not null,
  course_code_snapshot text not null,
  course_title_snapshot text not null,
  level_snapshot text not null check (level_snapshot in ('100-level', '200-level')),
  academic_session text not null,
  semester text not null,
  assignment_position smallint not null check (assignment_position in (1, 2)),
  eligibility_anchor_at timestamptz not null,
  next_sitting_at_snapshot timestamptz not null,
  assigned_at timestamptz not null default now(),
  unique (user_id, cohort_id, assignment_position),
  unique (user_id, cohort_id, course_slug)
);

create table public.premium_plans (
  id uuid primary key default extensions.gen_random_uuid(),
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  name text not null,
  amount_minor bigint not null check (amount_minor > 0),
  currency char(3) not null check (currency = upper(currency)),
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index premium_plans_one_active_per_cohort
  on public.premium_plans (cohort_id)
  where status = 'active';

create table public.payments (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  premium_plan_id uuid not null references public.premium_plans(id),
  provider text not null default 'kora' check (provider = 'kora'),
  merchant_reference text not null unique,
  provider_reference text unique,
  amount_minor bigint not null check (amount_minor > 0),
  currency char(3) not null check (currency = upper(currency)),
  status text not null default 'pending' check (status in ('pending', 'successful', 'failed', 'refunded')),
  checkout_url text,
  initiated_at timestamptz not null default now(),
  verified_at timestamptz,
  failed_at timestamptz,
  refunded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table app_private.payment_events (
  id uuid primary key default extensions.gen_random_uuid(),
  event_key text not null unique,
  event_type text not null,
  merchant_reference text,
  provider_reference text,
  signature_valid boolean not null,
  raw_payload jsonb not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  processing_error text
);

create unique index payments_one_pending_per_user_plan
  on public.payments (user_id, premium_plan_id)
  where status = 'pending';

create table public.premium_entitlements (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  source text not null check (source in ('payment', 'course_rep', 'admin')),
  payment_id uuid references public.payments(id),
  granted_by uuid references auth.users(id),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  revocation_reason text,
  check ((source = 'payment' and payment_id is not null) or source <> 'payment')
);

create unique index premium_entitlements_one_active_per_cohort
  on public.premium_entitlements (user_id, cohort_id)
  where revoked_at is null;

create table public.course_rep_assignments (
  id uuid primary key default extensions.gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cohort_id uuid not null references public.cohorts(id) on delete cascade,
  commission_bps integer not null default 5000 check (commission_bps between 0 and 10000),
  status text not null default 'active' check (status in ('active', 'inactive')),
  assigned_by uuid not null references auth.users(id),
  assigned_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index course_rep_one_active_per_cohort
  on public.course_rep_assignments (cohort_id)
  where status = 'active';

create unique index course_rep_one_active_assignment_per_user
  on public.course_rep_assignments (user_id)
  where status = 'active';

create table public.commissions (
  id uuid primary key default extensions.gen_random_uuid(),
  course_rep_assignment_id uuid not null references public.course_rep_assignments(id),
  buyer_user_id uuid not null references auth.users(id),
  payment_id uuid not null unique references public.payments(id),
  sale_amount_minor bigint not null check (sale_amount_minor > 0),
  commission_bps integer not null check (commission_bps between 0 and 10000),
  commission_amount_minor bigint not null check (commission_amount_minor >= 0),
  status text not null default 'pending' check (status in ('pending', 'paid', 'reversed')),
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  reversed_at timestamptz,
  reversal_reason text
);

create table public.audit_logs (
  id uuid primary key default extensions.gen_random_uuid(),
  actor_user_id uuid references auth.users(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index profiles_cohort_id_idx on public.profiles (cohort_id);
create index profiles_role_status_idx on public.profiles (role, account_status);
create index free_exam_allocations_user_idx on public.free_exam_allocations (user_id, cohort_id);
create index payments_user_status_idx on public.payments (user_id, status);
create index payments_plan_status_idx on public.payments (premium_plan_id, status);
create index premium_entitlements_user_idx on public.premium_entitlements (user_id, cohort_id, revoked_at);
create index course_rep_assignments_user_idx on public.course_rep_assignments (user_id, status);
create index commissions_rep_status_idx on public.commissions (course_rep_assignment_id, status);
create index commissions_buyer_idx on public.commissions (buyer_user_id);
create index audit_logs_entity_idx on public.audit_logs (entity_type, entity_id, created_at desc);

create trigger cohorts_set_updated_at before update on public.cohorts
for each row execute function app_private.set_updated_at();
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function app_private.set_updated_at();
create trigger premium_plans_set_updated_at before update on public.premium_plans
for each row execute function app_private.set_updated_at();
create trigger payments_set_updated_at before update on public.payments
for each row execute function app_private.set_updated_at();
create trigger course_rep_assignments_set_updated_at before update on public.course_rep_assignments
for each row execute function app_private.set_updated_at();

create or replace function app_private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, avatar_url, created_at, updated_at)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture'),
    new.created_at,
    now()
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function app_private.handle_new_user();

insert into public.profiles (id, full_name, email, avatar_url, created_at, updated_at)
select
  user_row.id,
  coalesce(user_row.raw_user_meta_data ->> 'full_name', user_row.raw_user_meta_data ->> 'name', ''),
  coalesce(user_row.email, ''),
  coalesce(user_row.raw_user_meta_data ->> 'avatar_url', user_row.raw_user_meta_data ->> 'picture'),
  user_row.created_at,
  now()
from auth.users user_row
on conflict (id) do nothing;

alter table public.cohorts enable row level security;
alter table public.profiles enable row level security;
alter table public.free_exam_allocations enable row level security;
alter table public.premium_plans enable row level security;
alter table public.payments enable row level security;
alter table public.premium_entitlements enable row level security;
alter table public.course_rep_assignments enable row level security;
alter table public.commissions enable row level security;
alter table public.audit_logs enable row level security;

create policy "active cohorts are public"
on public.cohorts for select to anon, authenticated
using (status = 'active');

create policy "active premium plans are public"
on public.premium_plans for select to anon, authenticated
using (status = 'active');

create policy "users read own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create policy "users read own free allocations"
on public.free_exam_allocations for select to authenticated
using ((select auth.uid()) = user_id);

create policy "users read own payments"
on public.payments for select to authenticated
using ((select auth.uid()) = user_id);

create policy "users read own entitlements"
on public.premium_entitlements for select to authenticated
using ((select auth.uid()) = user_id);

create policy "reps read own assignments"
on public.course_rep_assignments for select to authenticated
using ((select auth.uid()) = user_id);

create policy "reps read own commissions"
on public.commissions for select to authenticated
using (
  exists (
    select 1
    from public.course_rep_assignments assignment
    where assignment.id = commissions.course_rep_assignment_id
      and assignment.user_id = (select auth.uid())
  )
);

revoke all on all tables in schema public from anon, authenticated;
grant select on public.cohorts, public.premium_plans to anon, authenticated;
grant select on public.profiles, public.free_exam_allocations, public.payments,
  public.premium_entitlements, public.course_rep_assignments, public.commissions
  to authenticated;

create or replace function public.complete_onboarding(
  p_user_id uuid,
  p_cohort_id uuid,
  p_allocations jsonb
)
returns setof public.free_exam_allocations
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles%rowtype;
  v_cohort public.cohorts%rowtype;
  v_anchor timestamptz;
  v_count integer;
begin
  select * into v_profile from public.profiles where id = p_user_id for update;
  if not found then raise exception 'profile_not_found'; end if;

  if v_profile.onboarding_completed_at is not null then
    return query
      select * from public.free_exam_allocations
      where user_id = p_user_id and cohort_id = v_profile.cohort_id
      order by assignment_position;
    return;
  end if;

  select * into v_cohort from public.cohorts
  where id = p_cohort_id and status = 'active';
  if not found then raise exception 'active_cohort_not_found'; end if;
  if v_cohort.department <> 'Psychology' then raise exception 'invalid_department'; end if;

  select created_at into v_anchor from auth.users where id = p_user_id;
  if v_anchor is null then raise exception 'auth_user_not_found'; end if;

  if jsonb_typeof(p_allocations) <> 'array' then raise exception 'invalid_allocations'; end if;
  v_count := jsonb_array_length(p_allocations);
  if v_count > 2 then raise exception 'too_many_allocations'; end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_allocations) as item(
      course_slug text,
      course_code text,
      course_title text,
      level text,
      academic_session text,
      semester text,
      assignment_position smallint,
      next_sitting_at timestamptz
    )
    where item.course_slug is null
      or item.course_code is null
      or item.course_title is null
      or item.level <> v_cohort.level
      or item.academic_session <> v_cohort.academic_session
      or item.semester <> v_cohort.semester
      or item.assignment_position not in (1, 2)
      or item.next_sitting_at <= v_anchor
  ) then raise exception 'invalid_allocation_snapshot'; end if;

  if (
    select count(distinct item.course_slug)
    from jsonb_to_recordset(p_allocations) as item(course_slug text)
  ) <> v_count then raise exception 'duplicate_allocation_course'; end if;

  if (
    select count(distinct item.assignment_position)
    from jsonb_to_recordset(p_allocations) as item(assignment_position smallint)
  ) <> v_count then raise exception 'duplicate_allocation_position'; end if;

  insert into public.free_exam_allocations (
    user_id, cohort_id, course_slug, course_code_snapshot, course_title_snapshot,
    level_snapshot, academic_session, semester, assignment_position,
    eligibility_anchor_at, next_sitting_at_snapshot
  )
  select
    p_user_id, p_cohort_id, item.course_slug, item.course_code, item.course_title,
    item.level, item.academic_session, item.semester, item.assignment_position,
    v_anchor, item.next_sitting_at
  from jsonb_to_recordset(p_allocations) as item(
    course_slug text,
    course_code text,
    course_title text,
    level text,
    academic_session text,
    semester text,
    assignment_position smallint,
    next_sitting_at timestamptz
  );

  update public.profiles
  set cohort_id = p_cohort_id, onboarding_completed_at = now()
  where id = p_user_id;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, after_data)
  values (p_user_id, 'onboarding.completed', 'profile', p_user_id,
    jsonb_build_object('cohort_id', p_cohort_id, 'allocation_count', v_count, 'anchor', v_anchor));

  return query
    select * from public.free_exam_allocations
    where user_id = p_user_id and cohort_id = p_cohort_id
    order by assignment_position;
end;
$$;

create or replace function public.finalize_verified_payment(
  p_payment_id uuid,
  p_provider_reference text,
  p_verification_payload jsonb
)
returns public.payments
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_payment public.payments%rowtype;
  v_cohort_id uuid;
  v_assignment public.course_rep_assignments%rowtype;
begin
  select * into v_payment from public.payments where id = p_payment_id for update;
  if not found then raise exception 'payment_not_found'; end if;
  if v_payment.status = 'successful' then return v_payment; end if;
  if v_payment.status <> 'pending' then raise exception 'payment_not_pending'; end if;

  update public.payments
  set status = 'successful', provider_reference = p_provider_reference,
      verified_at = now(), failed_at = null
  where id = p_payment_id
  returning * into v_payment;

  select cohort_id into v_cohort_id from public.premium_plans where id = v_payment.premium_plan_id;

  insert into public.premium_entitlements (user_id, cohort_id, source, payment_id)
  values (v_payment.user_id, v_cohort_id, 'payment', v_payment.id)
  on conflict (user_id, cohort_id) where revoked_at is null do nothing;

  select * into v_assignment
  from public.course_rep_assignments
  where cohort_id = v_cohort_id and status = 'active'
  for update;

  if found then
    insert into public.commissions (
      course_rep_assignment_id, buyer_user_id, payment_id, sale_amount_minor,
      commission_bps, commission_amount_minor
    ) values (
      v_assignment.id, v_payment.user_id, v_payment.id, v_payment.amount_minor,
      v_assignment.commission_bps,
      (v_payment.amount_minor * v_assignment.commission_bps / 10000)::bigint
    ) on conflict (payment_id) do nothing;
  end if;

  insert into public.audit_logs (action, entity_type, entity_id, after_data, metadata)
  values ('payment.verified', 'payment', v_payment.id, to_jsonb(v_payment),
    jsonb_build_object('provider_verification', p_verification_payload));

  return v_payment;
end;
$$;

create or replace function public.record_payment_event(
  p_event_key text,
  p_event_type text,
  p_merchant_reference text,
  p_provider_reference text,
  p_signature_valid boolean,
  p_raw_payload jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare v_inserted integer;
begin
  insert into app_private.payment_events (
    event_key, event_type, merchant_reference, provider_reference,
    signature_valid, raw_payload
  ) values (
    p_event_key, p_event_type, p_merchant_reference, p_provider_reference,
    p_signature_valid, p_raw_payload
  ) on conflict (event_key) do nothing;
  get diagnostics v_inserted = row_count;
  return v_inserted = 1;
end;
$$;

create or replace function public.finish_payment_event(
  p_event_key text,
  p_processing_error text default null
)
returns void
language sql
security definer
set search_path = ''
as $$
  update app_private.payment_events
  set processed_at = now(), processing_error = p_processing_error
  where event_key = p_event_key;
$$;

create or replace function public.assign_course_rep(
  p_actor_user_id uuid,
  p_user_id uuid,
  p_cohort_id uuid,
  p_commission_bps integer default 5000
)
returns public.course_rep_assignments
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assignment public.course_rep_assignments%rowtype;
begin
  if not exists (
    select 1 from public.profiles
    where id = p_actor_user_id and role = 'admin' and account_status = 'active'
  ) then raise exception 'admin_required'; end if;
  if p_commission_bps < 0 or p_commission_bps > 10000 then raise exception 'invalid_commission'; end if;
  if not exists (
    select 1 from public.profiles
    where id = p_user_id and cohort_id = p_cohort_id and account_status = 'active'
  ) then raise exception 'user_must_belong_to_active_cohort'; end if;
  if exists (
    select 1 from public.course_rep_assignments
    where cohort_id = p_cohort_id and status = 'active'
  ) then raise exception 'cohort_already_has_active_rep'; end if;

  insert into public.course_rep_assignments (
    user_id, cohort_id, commission_bps, assigned_by
  ) values (p_user_id, p_cohort_id, p_commission_bps, p_actor_user_id)
  returning * into v_assignment;

  update public.profiles
  set role = case when role = 'admin' then 'admin' else 'course_rep' end
  where id = p_user_id;

  insert into public.premium_entitlements (user_id, cohort_id, source, granted_by)
  values (p_user_id, p_cohort_id, 'course_rep', p_actor_user_id)
  on conflict (user_id, cohort_id) where revoked_at is null do nothing;

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, after_data)
  values (p_actor_user_id, 'course_rep.assigned', 'course_rep_assignment', v_assignment.id,
    to_jsonb(v_assignment));
  return v_assignment;
end;
$$;

create or replace function public.remove_course_rep(
  p_actor_user_id uuid,
  p_assignment_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_assignment public.course_rep_assignments%rowtype;
begin
  if not exists (
    select 1 from public.profiles
    where id = p_actor_user_id and role = 'admin' and account_status = 'active'
  ) then raise exception 'admin_required'; end if;
  if nullif(trim(p_reason), '') is null then raise exception 'reason_required'; end if;

  select * into v_assignment from public.course_rep_assignments
  where id = p_assignment_id for update;
  if not found then raise exception 'assignment_not_found'; end if;

  update public.course_rep_assignments
  set status = 'inactive', ended_at = now()
  where id = p_assignment_id;
  update public.premium_entitlements
  set revoked_at = now(), revocation_reason = p_reason
  where user_id = v_assignment.user_id and cohort_id = v_assignment.cohort_id
    and source = 'course_rep' and revoked_at is null;
  update public.profiles
  set role = 'student'
  where id = v_assignment.user_id and role = 'course_rep';

  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, before_data, metadata)
  values (p_actor_user_id, 'course_rep.removed', 'course_rep_assignment', p_assignment_id,
    to_jsonb(v_assignment), jsonb_build_object('reason', p_reason));
end;
$$;

create or replace function public.admin_set_account_status(
  p_actor_user_id uuid,
  p_user_id uuid,
  p_status text,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare v_before public.profiles%rowtype;
begin
  if not exists (select 1 from public.profiles where id = p_actor_user_id and role = 'admin' and account_status = 'active')
    then raise exception 'admin_required'; end if;
  if p_status not in ('active', 'suspended') then raise exception 'invalid_status'; end if;
  if nullif(trim(p_reason), '') is null then raise exception 'reason_required'; end if;
  select * into v_before from public.profiles where id = p_user_id for update;
  update public.profiles set account_status = p_status where id = p_user_id;
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, before_data, after_data, metadata)
  select p_actor_user_id, 'account.status_changed', 'profile', p_user_id, to_jsonb(v_before), to_jsonb(p), jsonb_build_object('reason', p_reason)
  from public.profiles p where p.id = p_user_id;
end;
$$;

create or replace function public.admin_promote_user(
  p_actor_user_id uuid,
  p_user_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare v_before public.profiles%rowtype;
begin
  if not exists (select 1 from public.profiles where id = p_actor_user_id and role = 'admin' and account_status = 'active')
    then raise exception 'admin_required'; end if;
  if nullif(trim(p_reason), '') is null then raise exception 'reason_required'; end if;
  select * into v_before from public.profiles where id = p_user_id for update;
  if not found then raise exception 'profile_not_found'; end if;
  update public.profiles set role = 'admin' where id = p_user_id;
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, before_data, after_data, metadata)
  select p_actor_user_id, 'admin.promoted', 'profile', p_user_id, to_jsonb(v_before), to_jsonb(p), jsonb_build_object('reason', p_reason)
  from public.profiles p where p.id = p_user_id;
end;
$$;

create or replace function public.admin_correct_level(
  p_actor_user_id uuid,
  p_user_id uuid,
  p_cohort_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare v_before public.profiles%rowtype;
begin
  if not exists (select 1 from public.profiles where id = p_actor_user_id and role = 'admin' and account_status = 'active')
    then raise exception 'admin_required'; end if;
  if nullif(trim(p_reason), '') is null then raise exception 'reason_required'; end if;
  if not exists (select 1 from public.cohorts where id = p_cohort_id and status = 'active')
    then raise exception 'active_cohort_not_found'; end if;
  select * into v_before from public.profiles where id = p_user_id for update;
  update public.profiles set cohort_id = p_cohort_id where id = p_user_id;
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, before_data, after_data, metadata)
  select p_actor_user_id, 'profile.level_corrected', 'profile', p_user_id, to_jsonb(v_before), to_jsonb(p), jsonb_build_object('reason', p_reason)
  from public.profiles p where p.id = p_user_id;
end;
$$;

create or replace function public.admin_replace_free_allocations(
  p_actor_user_id uuid,
  p_user_id uuid,
  p_cohort_id uuid,
  p_reason text,
  p_allocations jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_before jsonb;
  v_anchor timestamptz;
  v_cohort public.cohorts%rowtype;
begin
  if not exists (select 1 from public.profiles where id = p_actor_user_id and role = 'admin' and account_status = 'active')
    then raise exception 'admin_required'; end if;
  if nullif(trim(p_reason), '') is null then raise exception 'reason_required'; end if;
  select * into v_cohort from public.cohorts where id = p_cohort_id and status = 'active';
  if not found then raise exception 'active_cohort_not_found'; end if;
  select created_at into v_anchor from auth.users where id = p_user_id;
  if jsonb_typeof(p_allocations) <> 'array' or jsonb_array_length(p_allocations) > 2
    then raise exception 'invalid_allocations'; end if;
  select coalesce(jsonb_agg(to_jsonb(a) order by assignment_position), '[]'::jsonb)
    into v_before from public.free_exam_allocations a where user_id = p_user_id;
  delete from public.free_exam_allocations where user_id = p_user_id;
  insert into public.free_exam_allocations (
    user_id, cohort_id, course_slug, course_code_snapshot, course_title_snapshot,
    level_snapshot, academic_session, semester, assignment_position,
    eligibility_anchor_at, next_sitting_at_snapshot
  )
  select p_user_id, p_cohort_id, item.course_slug, item.course_code, item.course_title,
    v_cohort.level, v_cohort.academic_session, v_cohort.semester,
    item.assignment_position, v_anchor, item.next_sitting_at
  from jsonb_to_recordset(p_allocations) as item(
    course_slug text, course_code text, course_title text,
    assignment_position smallint, next_sitting_at timestamptz
  );
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, before_data, after_data, metadata)
  values (
    p_actor_user_id,
    'free_allocations.corrected',
    'profile',
    p_user_id,
    v_before,
    (select coalesce(jsonb_agg(to_jsonb(a) order by assignment_position), '[]'::jsonb)
      from public.free_exam_allocations a where a.user_id = p_user_id),
    jsonb_build_object('reason', p_reason)
  );
end;
$$;

create or replace function public.admin_set_manual_entitlement(
  p_actor_user_id uuid,
  p_user_id uuid,
  p_cohort_id uuid,
  p_grant boolean,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.profiles where id = p_actor_user_id and role = 'admin' and account_status = 'active')
    then raise exception 'admin_required'; end if;
  if nullif(trim(p_reason), '') is null then raise exception 'reason_required'; end if;
  if p_grant then
    insert into public.premium_entitlements (user_id, cohort_id, source, granted_by)
    values (p_user_id, p_cohort_id, 'admin', p_actor_user_id)
    on conflict (user_id, cohort_id) where revoked_at is null do nothing;
  else
    update public.premium_entitlements
    set revoked_at = now(), revocation_reason = p_reason
    where user_id = p_user_id and cohort_id = p_cohort_id and source = 'admin' and revoked_at is null;
  end if;
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  values (p_actor_user_id, case when p_grant then 'entitlement.granted' else 'entitlement.revoked' end,
    'profile', p_user_id, jsonb_build_object('cohort_id', p_cohort_id, 'reason', p_reason));
end;
$$;

create or replace function public.admin_set_commission_status(
  p_actor_user_id uuid,
  p_commission_id uuid,
  p_status text,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare v_before public.commissions%rowtype;
begin
  if not exists (select 1 from public.profiles where id = p_actor_user_id and role = 'admin' and account_status = 'active')
    then raise exception 'admin_required'; end if;
  if p_status not in ('paid', 'reversed') then raise exception 'invalid_commission_status'; end if;
  if p_status = 'reversed' and nullif(trim(p_reason), '') is null then raise exception 'reason_required'; end if;
  select * into v_before from public.commissions where id = p_commission_id for update;
  if not found then raise exception 'commission_not_found'; end if;
  update public.commissions set status = p_status,
    paid_at = case when p_status = 'paid' then now() else paid_at end,
    reversed_at = case when p_status = 'reversed' then now() else reversed_at end,
    reversal_reason = case when p_status = 'reversed' then p_reason else reversal_reason end
  where id = p_commission_id;
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, before_data, metadata)
  values (p_actor_user_id, 'commission.' || p_status, 'commission', p_commission_id,
    to_jsonb(v_before), jsonb_build_object('reason', p_reason));
end;
$$;

create or replace function public.bootstrap_initial_admin(p_email text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare v_user_id uuid;
begin
  select id into v_user_id from auth.users where lower(email) = lower(trim(p_email)) and email_confirmed_at is not null;
  if v_user_id is null then raise exception 'verified_user_not_found'; end if;
  update public.profiles set role = 'admin', account_status = 'active' where id = v_user_id;
  insert into public.audit_logs (actor_user_id, action, entity_type, entity_id, metadata)
  values (v_user_id, 'admin.bootstrap', 'profile', v_user_id, jsonb_build_object('email', lower(trim(p_email))));
  return v_user_id;
end;
$$;

create or replace function public.get_my_rep_sales()
returns table (
  commission_id uuid,
  buyer_full_name text,
  buyer_email_masked text,
  purchase_date timestamptz,
  sale_amount_minor bigint,
  commission_amount_minor bigint,
  commission_status text
)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id,
    p.full_name,
    case
      when position('@' in p.email) > 1
      then left(p.email, 1) || '***@' || split_part(p.email, '@', 2)
      else 'hidden'
    end,
    pay.verified_at,
    c.sale_amount_minor,
    c.commission_amount_minor,
    c.status
  from public.commissions c
  join public.course_rep_assignments a on a.id = c.course_rep_assignment_id
  join public.profiles p on p.id = c.buyer_user_id
  join public.payments pay on pay.id = c.payment_id
  where a.user_id = auth.uid()
  order by pay.verified_at desc;
$$;

create or replace function public.get_admin_overview(p_actor_user_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when exists (
      select 1 from public.profiles
      where id = p_actor_user_id and role = 'admin' and account_status = 'active'
    ) then jsonb_build_object(
      'total_users', (select count(*) from public.profiles),
      'level_100_users', (
        select count(*) from public.profiles p join public.cohorts c on c.id = p.cohort_id
        where c.level = '100-level'
      ),
      'level_200_users', (
        select count(*) from public.profiles p join public.cohorts c on c.id = p.cohort_id
        where c.level = '200-level'
      ),
      'premium_users', (
        select count(distinct user_id) from public.premium_entitlements where revoked_at is null
      ),
      'verified_revenue_minor', (
        select coalesce(sum(amount_minor), 0) from public.payments where status = 'successful'
      ),
      'pending_payments', (select count(*) from public.payments where status = 'pending'),
      'active_course_reps', (select count(*) from public.course_rep_assignments where status = 'active'),
      'pending_commission_minor', (
        select coalesce(sum(commission_amount_minor), 0) from public.commissions where status = 'pending'
      ),
      'paid_commission_minor', (
        select coalesce(sum(commission_amount_minor), 0) from public.commissions where status = 'paid'
      )
    ) else null end;
$$;

revoke execute on function public.complete_onboarding(uuid, uuid, jsonb) from public, anon, authenticated;
revoke execute on function public.finalize_verified_payment(uuid, text, jsonb) from public, anon, authenticated;
revoke execute on function public.record_payment_event(text, text, text, text, boolean, jsonb) from public, anon, authenticated;
revoke execute on function public.finish_payment_event(text, text) from public, anon, authenticated;
revoke execute on function public.assign_course_rep(uuid, uuid, uuid, integer) from public, anon, authenticated;
revoke execute on function public.remove_course_rep(uuid, uuid, text) from public, anon, authenticated;
revoke execute on function public.admin_set_account_status(uuid, uuid, text, text) from public, anon, authenticated;
revoke execute on function public.admin_promote_user(uuid, uuid, text) from public, anon, authenticated;
revoke execute on function public.admin_correct_level(uuid, uuid, uuid, text) from public, anon, authenticated;
revoke execute on function public.admin_replace_free_allocations(uuid, uuid, uuid, text, jsonb) from public, anon, authenticated;
revoke execute on function public.admin_set_manual_entitlement(uuid, uuid, uuid, boolean, text) from public, anon, authenticated;
revoke execute on function public.admin_set_commission_status(uuid, uuid, text, text) from public, anon, authenticated;
revoke execute on function public.bootstrap_initial_admin(text) from public, anon, authenticated;
grant execute on function public.complete_onboarding(uuid, uuid, jsonb) to service_role;
grant execute on function public.finalize_verified_payment(uuid, text, jsonb) to service_role;
grant execute on function public.record_payment_event(text, text, text, text, boolean, jsonb) to service_role;
grant execute on function public.finish_payment_event(text, text) to service_role;
grant execute on function public.assign_course_rep(uuid, uuid, uuid, integer) to service_role;
grant execute on function public.remove_course_rep(uuid, uuid, text) to service_role;
grant execute on function public.admin_set_account_status(uuid, uuid, text, text) to service_role;
grant execute on function public.admin_promote_user(uuid, uuid, text) to service_role;
grant execute on function public.admin_correct_level(uuid, uuid, uuid, text) to service_role;
grant execute on function public.admin_replace_free_allocations(uuid, uuid, uuid, text, jsonb) to service_role;
grant execute on function public.admin_set_manual_entitlement(uuid, uuid, uuid, boolean, text) to service_role;
grant execute on function public.admin_set_commission_status(uuid, uuid, text, text) to service_role;
grant execute on function public.bootstrap_initial_admin(text) to service_role;
revoke execute on function public.get_my_rep_sales() from public, anon;
grant execute on function public.get_my_rep_sales() to authenticated;
revoke execute on function public.get_admin_overview(uuid) from public, anon, authenticated;
grant execute on function public.get_admin_overview(uuid) to service_role;

insert into public.cohorts (id, department, level, academic_session, semester)
values
  ('10000000-0000-4000-8000-000000000001', 'Psychology', '100-level', '2025/2026', 'Second Semester'),
  ('20000000-0000-4000-8000-000000000002', 'Psychology', '200-level', '2025/2026', 'Second Semester')
on conflict (department, level, academic_session, semester) do nothing;

insert into public.premium_plans (id, cohort_id, name, amount_minor, currency)
values
  ('10000000-0000-4000-8000-000000000101', '10000000-0000-4000-8000-000000000001', 'Premium Semester Access', 100000, 'NGN'),
  ('20000000-0000-4000-8000-000000000102', '20000000-0000-4000-8000-000000000002', 'Premium Semester Access', 100000, 'NGN')
on conflict do nothing;
