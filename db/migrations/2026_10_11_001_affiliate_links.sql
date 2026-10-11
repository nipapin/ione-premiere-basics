CREATE TABLE odin_affiliate_links (
  code text PRIMARY KEY CHECK (char_length(code) BETWEEN 1 AND 200),
  label text NOT NULL CHECK (char_length(label) BETWEEN 1 AND 80),
  owner_user_id uuid REFERENCES users(user_id) ON DELETE SET NULL,
  created_by uuid REFERENCES users(user_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT NOW()
);
CREATE INDEX odin_affiliate_links_owner ON odin_affiliate_links(owner_user_id);

-- Reserve existing attribution codes without changing any sales or guessing owners.
INSERT INTO odin_affiliate_links (code, label)
SELECT code, left(code, 80) FROM (
  SELECT unnest(ARRAY['cinecom', 'premierebasics', 'aftereffectsbasics']) AS code
  UNION SELECT affilate FROM subscriptions WHERE affilate IS NOT NULL AND affilate <> ''
  UNION SELECT affilate FROM payments WHERE affilate IS NOT NULL AND affilate <> ''
) AS historical_codes;

CREATE INDEX IF NOT EXISTS odin_subscriptions_affilate ON subscriptions(affilate);
CREATE INDEX IF NOT EXISTS odin_payments_affilate ON payments(affilate);
