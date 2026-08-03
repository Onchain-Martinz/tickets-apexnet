begin;

update public.payments payment
set
  status = 'failed',
  failed_at = now()
from public.premium_plans plan
join public.cohorts cohort on cohort.id = plan.cohort_id
where payment.premium_plan_id = plan.id
  and payment.status = 'pending'
  and (payment.amount_minor <> 150000 or payment.currency <> 'NGN')
  and cohort.department = 'Psychology'
  and cohort.academic_session = '2025/2026'
  and cohort.semester = 'Second Semester';

update public.premium_plans plan
set
  name = 'Premium Platform Access',
  amount_minor = 150000,
  currency = 'NGN',
  updated_at = now()
from public.cohorts cohort
where cohort.id = plan.cohort_id
  and cohort.department = 'Psychology'
  and cohort.academic_session = '2025/2026'
  and cohort.semester = 'Second Semester'
  and plan.status = 'active';

do $$
begin
  if not exists (
    select 1
    from public.premium_plans plan
    join public.cohorts cohort on cohort.id = plan.cohort_id
    where cohort.department = 'Psychology'
      and cohort.academic_session = '2025/2026'
      and cohort.semester = 'Second Semester'
      and plan.status = 'active'
      and plan.amount_minor = 150000
      and plan.currency = 'NGN'
  ) then
    raise exception 'production_premium_plan_not_found';
  end if;
end;
$$;

commit;
