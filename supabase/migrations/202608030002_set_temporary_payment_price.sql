begin;

-- Temporary live checkout validation price. Replace with a later migration
-- setting amount_minor = 150000 before the intended production price launches.
update public.payments payment
set
  status = 'failed',
  failed_at = now()
from public.premium_plans plan
join public.cohorts cohort on cohort.id = plan.cohort_id
where payment.premium_plan_id = plan.id
  and payment.status = 'pending'
  and cohort.department = 'Psychology'
  and cohort.academic_session = '2025/2026'
  and cohort.semester = 'Second Semester';

update public.premium_plans plan
set
  amount_minor = 10000,
  updated_at = now()
from public.cohorts cohort
where cohort.id = plan.cohort_id
  and cohort.department = 'Psychology'
  and cohort.academic_session = '2025/2026'
  and cohort.semester = 'Second Semester'
  and plan.status = 'active';

commit;
