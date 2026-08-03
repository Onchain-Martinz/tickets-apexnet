begin;

do $$
declare
  v_new_admin_before public.profiles%rowtype;
  v_old_admin_before public.profiles%rowtype;
begin
  select profile.*
  into v_new_admin_before
  from public.profiles profile
  join auth.users auth_user on auth_user.id = profile.id
  where lower(auth_user.email) = 'martinzkizitto@gmail.com'
    and auth_user.email_confirmed_at is not null;

  if not found then
    raise exception 'verified_production_admin_not_found';
  end if;

  update public.profiles
  set role = 'admin', account_status = 'active'
  where id = v_new_admin_before.id;

  insert into public.audit_logs (
    action, entity_type, entity_id, before_data, after_data, metadata
  )
  select
    'admin.production_migrated',
    'profile',
    profile.id,
    to_jsonb(v_new_admin_before),
    to_jsonb(profile),
    jsonb_build_object('reason', 'production_admin_migration')
  from public.profiles profile
  where profile.id = v_new_admin_before.id;

  select profile.*
  into v_old_admin_before
  from public.profiles profile
  join auth.users auth_user on auth_user.id = profile.id
  where lower(auth_user.email) = 'hinatalabs.co@gmail.com';

  if found and v_old_admin_before.id <> v_new_admin_before.id then
    update public.profiles
    set role = 'student'
    where id = v_old_admin_before.id and role = 'admin';

    insert into public.audit_logs (
      action, entity_type, entity_id, before_data, after_data, metadata
    )
    select
      'admin.seed_demoted',
      'profile',
      profile.id,
      to_jsonb(v_old_admin_before),
      to_jsonb(profile),
      jsonb_build_object('reason', 'production_admin_migration')
    from public.profiles profile
    where profile.id = v_old_admin_before.id;
  end if;
end;
$$;

commit;
