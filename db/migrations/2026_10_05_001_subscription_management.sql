-- Existing PayPro rows retain their original fields and entitlement dates.
ALTER TABLE subscriptions
  ADD COLUMN management_source text NOT NULL DEFAULT 'paypro' CHECK (management_source IN ('paypro', 'manual')),
  ADD COLUMN management_disabled boolean NOT NULL DEFAULT false,
  ADD COLUMN management_billing_state text NOT NULL DEFAULT 'none',
  ADD COLUMN management_billing_action text,
  ADD COLUMN management_issue_key uuid UNIQUE,
  ADD COLUMN management_operation_id uuid,
  ADD COLUMN management_operation_started_at timestamptz;

-- Support legacy IDs, serial defaults and production identity columns.
CREATE SEQUENCE odin_managed_subscription_id;
SELECT setval('odin_managed_subscription_id', GREATEST(COALESCE(MAX(id), 0), 1), COALESCE(MAX(id), 0) >= 1) FROM subscriptions;
DO $$
DECLARE
  generated_sequence text;
  latest bigint;
  current_value bigint;
  was_called boolean;
BEGIN
  generated_sequence := pg_get_serial_sequence('subscriptions', 'id');
  IF generated_sequence IS NOT NULL THEN
    SELECT COALESCE(MAX(id), 0) INTO latest FROM subscriptions;
    EXECUTE format('SELECT last_value, is_called FROM %s', generated_sequence) INTO current_value, was_called;
    PERFORM setval(generated_sequence::regclass, GREATEST(latest, current_value, 1), latest > 0 OR was_called);
  ELSE
    ALTER SEQUENCE odin_managed_subscription_id OWNED BY subscriptions.id;
    ALTER TABLE subscriptions ALTER COLUMN id SET DEFAULT nextval('odin_managed_subscription_id');
  END IF;
END;
$$;
