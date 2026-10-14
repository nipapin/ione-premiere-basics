CREATE TABLE odin_affiliate_report_viewers (
 user_id uuid PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
 created_at timestamptz NOT NULL DEFAULT now()
);
