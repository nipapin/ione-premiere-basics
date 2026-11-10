-- Explicit owner-approved Lifetime gifts can differ from the original PayPro SKU.
-- Keep payment provenance and the manual entitlement separate.
ALTER TABLE subscriptions ADD COLUMN management_lifetime_granted boolean NOT NULL DEFAULT false;
