CREATE TABLE odin_affiliate_partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  user_id uuid REFERENCES users(user_id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE odin_affiliate_partner_links (
  partner_id uuid NOT NULL REFERENCES odin_affiliate_partners(id) ON DELETE CASCADE,
  code text NOT NULL REFERENCES odin_affiliate_links(code),
  PRIMARY KEY (partner_id, code)
);
CREATE INDEX odin_affiliate_partners_user ON odin_affiliate_partners(user_id);

-- Historical ownership is assigned explicitly in the admin UI.
-- Account access is not inferred from names or email addresses.
INSERT INTO odin_affiliate_partners(name) VALUES ('Tymon'), ('Jordy');

CREATE TABLE odin_sales (
  order_id bigint NOT NULL,
  order_item_id bigint NOT NULL,
  product_id bigint NOT NULL,
  subscription_id bigint,
  buyer_key text NOT NULL,
  buyer_label text NOT NULL,
  plan text NOT NULL,
  referral text,
  paid_at timestamptz NOT NULL,
  status text NOT NULL,
  quantity integer NOT NULL,
  currency text NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  gross_amount numeric(18,2) NOT NULL CHECK (gross_amount >= 0),
  refunded_amount numeric(18,2) NOT NULL CHECK (refunded_amount >= 0),
  balance_currency text CHECK (balance_currency ~ '^[A-Z]{3}$'),
  balance_gross_amount numeric(18,2),
  balance_refunded_amount numeric(18,2),
  fee_amount numeric(18,2),
  net_amount numeric(18,2),
  source text NOT NULL CHECK (source IN ('paypro_api','paypro_webhook')),
  observed_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (order_id, order_item_id)
);
CREATE INDEX odin_sales_referral_date ON odin_sales(referral, paid_at);
CREATE INDEX odin_sales_date ON odin_sales(paid_at);
