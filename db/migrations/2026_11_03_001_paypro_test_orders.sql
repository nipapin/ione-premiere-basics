-- Test access uses isolated local IDs and the existing no-billing management path.
ALTER TABLE subscriptions
 ADD COLUMN is_test boolean NOT NULL DEFAULT false,
 ADD COLUMN test_order_key text UNIQUE,
 ADD CONSTRAINT odin_test_order_no_billing CHECK
  (test_order_key IS NULL OR (is_test AND management_source='manual'));
