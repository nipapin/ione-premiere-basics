CREATE TABLE odin_referral_visits (
  code text NOT NULL REFERENCES odin_affiliate_links(code),
  visit_id uuid NOT NULL,
  visited_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (code, visit_id)
);
CREATE INDEX odin_referral_visits_date ON odin_referral_visits(code, visited_at);
