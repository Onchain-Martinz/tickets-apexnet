begin;

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
declare
  v_acquired integer;
begin
  insert into app_private.payment_events (
    event_key, event_type, merchant_reference, provider_reference,
    signature_valid, raw_payload
  ) values (
    p_event_key, p_event_type, p_merchant_reference, p_provider_reference,
    p_signature_valid, p_raw_payload
  )
  on conflict (event_key) do update
  set
    event_type = excluded.event_type,
    merchant_reference = excluded.merchant_reference,
    provider_reference = excluded.provider_reference,
    signature_valid = excluded.signature_valid,
    raw_payload = excluded.raw_payload,
    received_at = now(),
    processed_at = null,
    processing_error = null
  where app_private.payment_events.processing_error is not null
    or (
      app_private.payment_events.processed_at is null
      and app_private.payment_events.received_at < now() - interval '5 minutes'
    );

  get diagnostics v_acquired = row_count;
  return v_acquired = 1;
end;
$$;

revoke execute on function public.record_payment_event(text, text, text, text, boolean, jsonb)
  from public, anon, authenticated;
grant execute on function public.record_payment_event(text, text, text, text, boolean, jsonb)
  to service_role;

commit;
