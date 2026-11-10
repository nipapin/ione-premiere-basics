-- Existing users already have users.created_at; keep their actual registration day.
ALTER TABLE subscriptions
  ADD COLUMN ai_billing_anchor timestamptz,
  ADD COLUMN ai_last_paid_at timestamptz,
  ADD COLUMN ai_paid_until timestamptz,
  ADD COLUMN ai_paid_order_id bigint,
  ADD COLUMN ai_billing_confirmed boolean NOT NULL DEFAULT false,
  ADD COLUMN access_revoked_at timestamptz;

-- Retain existing paid access during the transition; new rows require a confirmed charge.
UPDATE subscriptions SET ai_billing_confirmed=true
WHERE management_source='manual'
  OR (NOT is_trial AND NOT is_test AND product_id IN (111867,113886,113887));

UPDATE subscriptions SET ai_billing_anchor=NOW(), ai_last_paid_at=NOW()
WHERE management_source='manual';

-- Seed from authenticated historical order data. The backfill command resolves missing
-- provider dates and paid-through dates before deploying the new account API.
UPDATE subscriptions s SET
  ai_billing_anchor=history.first_paid_at,
  ai_last_paid_at=history.last_paid_at,
  ai_paid_order_id=history.last_order_id
FROM (
  SELECT s.id, MIN(p.paid_at) AS first_paid_at,
    (array_agg(p.paid_at ORDER BY p.paid_at DESC,p.order_id DESC))[1] AS last_paid_at,
    (array_agg(p.order_id ORDER BY p.paid_at DESC,p.order_id DESC))[1] AS last_order_id
  FROM subscriptions s JOIN odin_sales p
    ON (p.subscription_id=s.subscription_id OR (s.product_id=113887 AND p.order_id=s.order_id)) AND p.product_id=s.product_id
  WHERE NOT s.is_test AND s.management_source='paypro'
    AND p.status IN ('processed','partiallyrefunded','chargebackwon','orderchargebackiswon')
    AND p.gross_amount>p.refunded_amount
  GROUP BY s.id
) history WHERE history.id=s.id;

-- Historical chargebacks were previously mapped to active. Revoke those orders too.
UPDATE subscriptions s SET access_revoked_at=NOW(),status='cancelled',next_charge_date=''
WHERE NOT s.is_test AND s.management_source='paypro' AND EXISTS (
  SELECT 1 FROM odin_sales p
  WHERE (p.subscription_id=s.subscription_id OR (s.product_id=113887 AND p.order_id=s.order_id))
    AND p.status IN ('refunded','chargeback','chargedback')
    AND (s.ai_last_paid_at IS NULL OR p.paid_at>=s.ai_last_paid_at)
);
