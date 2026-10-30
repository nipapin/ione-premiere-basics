CREATE TABLE odin_referral_attributions (
  user_id uuid PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  referral text NOT NULL,
  cid text,
  attributed_at timestamptz NOT NULL
);

-- An opaque checkout ID carries a fixed attribution through PayPro, including
-- when browser cookies expire before a renewal or refund arrives.
CREATE TABLE odin_referral_checkouts (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  referral text NOT NULL,
  cid text,
  created_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE INDEX odin_referral_checkouts_user ON odin_referral_checkouts(user_id);

CREATE TABLE odin_referral_subscriptions (
  subscription_id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  referral text,
  cid text
);

CREATE TABLE odin_referral_orders (
  order_id text NOT NULL,
  order_item_id text NOT NULL,
  user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  referral text,
  cid text,
  refunded_cents bigint NOT NULL DEFAULT 0 CHECK (refunded_cents >= 0),
  PRIMARY KEY (order_id, order_item_id)
);

CREATE TABLE odin_cinecom_access (
  user_id uuid PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
  plan text NOT NULL CHECK (plan IN ('creator_monthly', 'creator_yearly')),
  currency text NOT NULL,
  cid text,
  active boolean NOT NULL DEFAULT true,
  generation integer NOT NULL DEFAULT 1,
  access_until timestamptz,
  checked_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE INDEX odin_cinecom_access_pending ON odin_cinecom_access(checked_at) WHERE active;

CREATE TABLE odin_cinecom_events (
  id uuid PRIMARY KEY,
  sequence bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  event_key text NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  -- Persist the exact signed bytes; retries keep both id and payload unchanged.
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  next_attempt_at timestamptz NOT NULL DEFAULT NOW(),
  attempts integer NOT NULL DEFAULT 0,
  delivered_at timestamptz,
  locked_until timestamptz,
  lock_token uuid,
  last_status integer
);
CREATE INDEX odin_cinecom_events_pending ON odin_cinecom_events(next_attempt_at, created_at) WHERE delivered_at IS NULL;
CREATE INDEX odin_cinecom_events_customer ON odin_cinecom_events(user_id, created_at) WHERE delivered_at IS NULL;

-- Baseline existing active referrals so their future expiry is reported, without
-- replaying historical starts or purchases. Legacy links did not collect cid.
SET LOCAL DateStyle = 'ISO, MDY';
DO $$
DECLARE
  referral_subscription record;
  access_end timestamptz;
BEGIN
  FOR referral_subscription IN
    SELECT s.*, (SELECT currency FROM odin_sales WHERE subscription_id::text=s.subscription_id::text ORDER BY paid_at DESC LIMIT 1) AS event_currency
    FROM subscriptions s
    WHERE s.affilate='cinecom' AND s.management_source <> 'manual' AND NOT s.is_trial
      AND NOT s.management_disabled AND s.product_id::text IN ('111867','113886')
  LOOP
    BEGIN
      access_end := (CASE WHEN referral_subscription.next_charge_date::text ~ '^\d{1,2}/\d{1,2}/\d{4}\+'
        THEN replace(referral_subscription.next_charge_date::text, '+', ' ')
        ELSE NULLIF(referral_subscription.next_charge_date::text, '') END)::timestamptz;
    EXCEPTION WHEN invalid_datetime_format OR datetime_field_overflow THEN
      CONTINUE;
    END;
    IF access_end IS NULL OR access_end <= NOW() THEN CONTINUE; END IF;
    INSERT INTO odin_cinecom_access(user_id,plan,currency,access_until)
      VALUES(referral_subscription.user_id,CASE WHEN referral_subscription.product_id::text='111867' THEN 'creator_monthly' ELSE 'creator_yearly' END,
        COALESCE(referral_subscription.event_currency,'USD'),access_end)
      ON CONFLICT(user_id) DO UPDATE SET access_until=GREATEST(odin_cinecom_access.access_until,EXCLUDED.access_until);
    INSERT INTO odin_referral_subscriptions(subscription_id,user_id,referral,cid)
      VALUES(referral_subscription.subscription_id::text,referral_subscription.user_id,'cinecom',NULL)
      ON CONFLICT(subscription_id) DO NOTHING;
  END LOOP;
END;
$$;
