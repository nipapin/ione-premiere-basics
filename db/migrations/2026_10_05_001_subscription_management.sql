-- Existing PayPro rows retain their original fields and entitlement dates.
ALTER TABLE subscriptions
  ADD COLUMN management_source text NOT NULL DEFAULT 'paypro' CHECK (management_source IN ('paypro', 'manual')),
  ADD COLUMN management_disabled boolean NOT NULL DEFAULT false,
  ADD COLUMN management_billing_state text NOT NULL DEFAULT 'none',
  ADD COLUMN management_billing_action text,
  ADD COLUMN management_issue_key uuid UNIQUE,
  ADD COLUMN management_operation_id uuid,
  ADD COLUMN management_operation_started_at timestamptz;

-- Production uses explicit integer IDs without a default. Reserve a separate
-- sequence for new rows and initialize it beyond the existing IDs.
CREATE SEQUENCE odin_managed_subscription_id;
SELECT setval('odin_managed_subscription_id', GREATEST(COALESCE(MAX(id), 0), 1), COALESCE(MAX(id), 0) >= 1) FROM subscriptions;
ALTER SEQUENCE odin_managed_subscription_id OWNED BY subscriptions.id;
ALTER TABLE subscriptions ALTER COLUMN id SET DEFAULT nextval('odin_managed_subscription_id');
