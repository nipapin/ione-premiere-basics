ALTER TABLE odin_affiliate_partners ADD COLUMN earnings_scope text NOT NULL DEFAULT 'links'
 CHECK (earnings_scope IN ('links', 'links_and_direct', 'all'));
UPDATE odin_affiliate_partners SET earnings_scope='links_and_direct' WHERE lower(btrim(name)) IN ('tymon', 'тимон');
UPDATE odin_affiliate_partners SET earnings_scope='all' WHERE lower(btrim(name)) IN ('developer', 'developers');
INSERT INTO odin_affiliate_partners(name,earnings_scope)
 SELECT 'Developer','all' WHERE NOT EXISTS (SELECT 1 FROM odin_affiliate_partners WHERE lower(btrim(name)) IN ('developer', 'developers'));
