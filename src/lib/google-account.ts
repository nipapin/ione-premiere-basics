import "server-only";

import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";
import type { TokenPayload } from "google-auth-library";
import { pool } from "@/app/database/pool";
import { enqueueCinecomEvent, saveReferralAttribution } from "@/lib/cinecom";
import { GoogleAuthError } from "@/lib/google-oauth";
import type { ReferralAttribution } from "@/lib/referral-attribution";

type GoogleUser = { user_id: string; email: string; name: string; google_id: string | null };

export async function findOrCreateGoogleUser(profile: TokenPayload, attribution: ReferralAttribution | null) {
  const email = profile.email?.trim().toLowerCase();
  if (!profile.sub || !email || profile.email_verified !== true) throw new GoogleAuthError("google_email");

  const db = await pool.connect();
  try {
    await db.query("BEGIN");
    // Serialize Google attempts for the same identity or email in a fixed order.
    for (const key of [`google:${profile.sub}`, `email:${email}`].sort()) {
      await db.query("SELECT pg_advisory_xact_lock(hashtext($1))", [key]);
    }
    let user = (await db.query<GoogleUser>(
      "SELECT user_id, email, name, google_id FROM users WHERE google_id=$1 FOR UPDATE", [profile.sub]
    )).rows[0];
    let created = false;

    if (!user) {
      const existing = await db.query<GoogleUser>(
        "SELECT user_id, email, name, google_id FROM users WHERE LOWER(email)=$1 LIMIT 2 FOR UPDATE", [email]
      );
      if (existing.rows.length > 1) throw new GoogleAuthError("google_account");
      user = existing.rows[0];
      if (!user) {
        // A Google-only signup has no predictable password; password reset remains available.
        const password = await bcrypt.hash(randomBytes(32).toString("hex"), 10);
        const inserted = await db.query<GoogleUser>(
          `INSERT INTO users(email,password,name,lastname,emailconfirmed,google_id)
           VALUES($1,$2,$3,$4,true,$5) ON CONFLICT DO NOTHING RETURNING user_id,email,name,google_id`,
          [email, password, profile.given_name || profile.name || email.split("@")[0], profile.family_name || "", profile.sub]
        );
        user = inserted.rows[0];
        created = !!user;
        if (!user) {
          // A password signup may have inserted the same email during this request.
          const concurrent = await db.query<GoogleUser>(
            "SELECT user_id,email,name,google_id FROM users WHERE LOWER(email)=$1 LIMIT 2 FOR UPDATE", [email]
          );
          if (concurrent.rows.length !== 1) throw new GoogleAuthError("google_account");
          user = concurrent.rows[0];
        }
      }
      if (user.google_id && user.google_id !== profile.sub) throw new GoogleAuthError("google_account");
      if (!created) {
        await db.query("UPDATE users SET google_id=$1,emailconfirmed=true,confirmtoken=NULL WHERE user_id=$2", [profile.sub, user.user_id]);
      }
    }

    const saved = await saveReferralAttribution(db, user.user_id, attribution);
    if (created && saved?.referral === "cinecom") {
      await enqueueCinecomEvent(db, { key: `free:${user.user_id}`, user, type: "free_plan_started", plan: "free", cid: saved.cid });
    }
    await db.query("COMMIT");
    return user;
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally { db.release(); }
}
