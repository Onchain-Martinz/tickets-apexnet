-- Party Ticketing Migration: Transition from exam platform to single-event party ticketing

begin;

-- 1. Adapt public.payments for guest party checkout
alter table public.payments alter column user_id drop not null;
alter table public.payments alter column premium_plan_id drop not null;

-- Drop obsolete exam-specific pending index if it exists
drop index if exists public.payments_one_pending_per_user_plan;

-- Add party ticket fields to public.payments
alter table public.payments
  add column if not exists buyer_name text not null default '',
  add column if not exists buyer_department text not null default '',
  add column if not exists ticket_number text unique,
  add column if not exists organizer_proceeds_minor bigint not null default 710000;

-- Indexes for ticketing lookups and admin dashboard
create index if not exists payments_ticket_number_idx on public.payments (ticket_number);
create index if not exists payments_status_created_idx on public.payments (status, created_at desc);

-- 2. Update finalize_verified_payment RPC to fulfill party tickets without exam side-effects
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
  v_ticket_num text;
begin
  select * into v_payment from public.payments where id = p_payment_id for update;
  if not found then raise exception 'payment_not_found'; end if;
  if v_payment.status = 'successful' then return v_payment; end if;
  if v_payment.status <> 'pending' then raise exception 'payment_not_pending'; end if;

  -- Generate human-readable unique ticket number if not already present
  v_ticket_num := coalesce(
    v_payment.ticket_number,
    'TKT-' || upper(substring(replace(v_payment.id::text, '-', ''), 1, 8))
  );

  update public.payments
  set
    status = 'successful',
    provider_reference = p_provider_reference,
    ticket_number = v_ticket_num,
    verified_at = now(),
    failed_at = null
  where id = p_payment_id
  returning * into v_payment;

  -- Log verification in audit trail
  insert into public.audit_logs (action, entity_type, entity_id, after_data, metadata)
  values (
    'ticket.verified',
    'payment',
    v_payment.id,
    to_jsonb(v_payment),
    jsonb_build_object('provider_verification', p_verification_payload)
  );

  return v_payment;
end;
$$;

-- 3. Simple Organizer Overview RPC
create or replace function public.get_organizer_overview(p_actor_user_id uuid)
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
      'successful_tickets', (select count(*) from public.payments where status = 'successful'),
      'total_customer_payments_minor', (
        select coalesce(sum(amount_minor), 0) from public.payments where status = 'successful'
      ),
      'organizer_payout_minor', (
        select coalesce(sum(organizer_proceeds_minor), 0) from public.payments where status = 'successful'
      ),
      'pending_tickets', (select count(*) from public.payments where status = 'pending')
    ) else null end;
$$;

revoke execute on function public.finalize_verified_payment(uuid, text, jsonb) from public, anon, authenticated;
grant execute on function public.finalize_verified_payment(uuid, text, jsonb) to service_role;

revoke execute on function public.get_organizer_overview(uuid) from public, anon, authenticated;
grant execute on function public.get_organizer_overview(uuid) to service_role;

commit;
