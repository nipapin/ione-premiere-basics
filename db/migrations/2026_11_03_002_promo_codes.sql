CREATE TABLE odin_promo_codes (
 id uuid PRIMARY KEY,
 code text NOT NULL UNIQUE CHECK (code ~ '^[A-Z0-9]{3,32}$'),
 name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
 percentage integer NOT NULL CHECK (percentage BETWEEN 1 AND 99),
 product_ids integer[] NOT NULL CHECK (cardinality(product_ids) BETWEEN 1 AND 3 AND product_ids <@ ARRAY[111867,113886,113887]),
 valid_from timestamptz,
 valid_till timestamptz,
 created_by uuid REFERENCES users(user_id) ON DELETE SET NULL,
 created_by_email text NOT NULL,
 provider_status text NOT NULL CHECK (provider_status IN ('creating','created','failed','unknown')),
 provider_coupon_id bigint UNIQUE,
 error_code text,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK (valid_from IS NULL OR valid_till IS NULL OR valid_from < valid_till),
 CHECK ((provider_status='created') = (provider_coupon_id IS NOT NULL))
);
CREATE INDEX odin_promo_codes_date ON odin_promo_codes(created_at DESC,id);
