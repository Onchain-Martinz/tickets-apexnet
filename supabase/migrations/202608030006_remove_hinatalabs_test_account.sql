begin;

do $$
declare
  v_test_user_id uuid;
  v_admin_user_id uuid;
  v_payment_ids uuid[] := '{}'::uuid[];
  v_assignment_ids uuid[] := '{}'::uuid[];
  v_commission_ids uuid[] := '{}'::uuid[];
  v_payment_event_count integer := 0;
  v_allocation_count integer := 0;
  v_entitlement_count integer := 0;
begin
  select auth_user.id
  into v_admin_user_id
  from auth.users auth_user
  join public.profiles profile on profile.id = auth_user.id
  where lower(auth_user.email) = 'martinzkizitto@gmail.com'
    and auth_user.email_confirmed_at is not null
    and profile.role = 'admin'
    and profile.account_status = 'active';

  if v_admin_user_id is null then
    raise exception 'active_production_admin_not_found';
  end if;

  select auth_user.id
  into v_test_user_id
  from auth.users auth_user
  join public.profiles profile on profile.id = auth_user.id
  where lower(auth_user.email) = 'hinatalabs.co@gmail.com'
    and profile.role = 'student';

  if v_test_user_id is null then
    raise exception 'disposable_test_account_not_found';
  end if;

  if exists (
    select 1 from public.payments
    where user_id = v_test_user_id and status = 'pending'
  ) then
    raise exception 'test_account_has_pending_payment';
  end if;

  if exists (
    select 1 from public.premium_entitlements
    where granted_by = v_test_user_id and user_id <> v_test_user_id
  ) then
    raise exception 'test_account_has_shared_entitlement_dependency';
  end if;

  if exists (
    select 1
    from public.course_rep_assignments assignment
    where assignment.assigned_by = v_test_user_id
      and assignment.user_id <> v_admin_user_id
  ) then
    raise exception 'test_account_has_shared_rep_assignment_dependency';
  end if;

  if exists (
    select 1
    from public.commissions commission
    where commission.buyer_user_id = v_test_user_id
      or commission.payment_id in (
        select payment.id from public.payments payment
        where payment.user_id = v_test_user_id
      )
      or commission.course_rep_assignment_id in (
        select assignment.id from public.course_rep_assignments assignment
        where assignment.user_id = v_test_user_id
          or assignment.assigned_by = v_test_user_id
      )
  ) then
    raise exception 'test_account_has_commission_dependency';
  end if;

  select coalesce(array_agg(payment.id), '{}'::uuid[])
  into v_payment_ids
  from public.payments payment
  where payment.user_id = v_test_user_id;

  select coalesce(array_agg(assignment.id), '{}'::uuid[])
  into v_assignment_ids
  from public.course_rep_assignments assignment
  where assignment.user_id = v_test_user_id
    or assignment.assigned_by = v_test_user_id;

  select coalesce(array_agg(commission.id), '{}'::uuid[])
  into v_commission_ids
  from public.commissions commission
  where commission.buyer_user_id = v_test_user_id
    or commission.payment_id = any(v_payment_ids)
    or commission.course_rep_assignment_id = any(v_assignment_ids);

  select count(*) into v_payment_event_count
  from app_private.payment_events event
  where event.merchant_reference in (
      select payment.merchant_reference from public.payments payment
      where payment.id = any(v_payment_ids)
    )
    or event.provider_reference in (
      select payment.provider_reference from public.payments payment
      where payment.id = any(v_payment_ids) and payment.provider_reference is not null
    );

  select count(*) into v_allocation_count
  from public.free_exam_allocations
  where user_id = v_test_user_id;

  select count(*) into v_entitlement_count
  from public.premium_entitlements
  where user_id = v_test_user_id;

  delete from public.audit_logs
  where actor_user_id = v_test_user_id
    or entity_id = v_test_user_id
    or entity_id = any(v_payment_ids)
    or entity_id = any(v_assignment_ids)
    or entity_id = any(v_commission_ids);

  delete from app_private.payment_events event
  where event.merchant_reference in (
      select payment.merchant_reference from public.payments payment
      where payment.id = any(v_payment_ids)
    )
    or event.provider_reference in (
      select payment.provider_reference from public.payments payment
      where payment.id = any(v_payment_ids) and payment.provider_reference is not null
    );

  delete from public.commissions where id = any(v_commission_ids);
  delete from public.course_rep_assignments where id = any(v_assignment_ids);
  delete from public.premium_entitlements where user_id = v_test_user_id;
  delete from public.free_exam_allocations where user_id = v_test_user_id;
  delete from public.payments where id = any(v_payment_ids);
  delete from auth.users where id = v_test_user_id;

  if exists (
    select 1 from auth.users where id = v_test_user_id
  ) then
    raise exception 'test_account_deletion_failed';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = v_admin_user_id
      and role = 'admin'
      and account_status = 'active'
  ) then
    raise exception 'production_admin_changed_during_cleanup';
  end if;

  insert into public.audit_logs (
    actor_user_id, action, entity_type, metadata
  ) values (
    v_admin_user_id,
    'account.test_data_purged',
    'profile',
    jsonb_build_object(
      'target_email', 'hinatalabs.co@gmail.com',
      'payments_removed', cardinality(v_payment_ids),
      'entitlements_removed', v_entitlement_count,
      'free_allocations_removed', v_allocation_count,
      'rep_assignments_removed', cardinality(v_assignment_ids),
      'commissions_removed', cardinality(v_commission_ids),
      'payment_events_removed', v_payment_event_count
    )
  );
end;
$$;

commit;
