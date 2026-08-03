# RED TEAM REPORT — Radiant Academy

**Date:** 2026-08-03
**Target:** Radiant Academy (Vite/React + Supabase) — production project `kaoxcbqhuwhtadpgccjp`
**Authorization:** Owner-authorized engagement (your app, your credentials)
**Method:** Public REST API only; read-only where possible; minimal writes via throwaway accounts; full cleanup verified (0 artifacts remaining)

---

## 1. Executive Summary

Radiant Academy is **critically vulnerable to full admin account takeover by any self-registered user**, and exposes **staff PII anonymously**. Both were **CONFIRMED live** against the production Supabase backend.

Root cause: broken Row-Level Security. The `users` table's self-service INSERT/UPDATE policies permit setting arbitrary `role` values, which flips the `is_admin()` gate used by every other policy. The frontend `ProtectedRoute` guards are cosmetic — they only gate rendering, not API access.

---

## 2. Scope & Assumptions

- Target: Radiant Academy production Supabase (`kaoxcbqhuwhtadpgccjp`)
- Out of scope: DoS, data destruction, third parties (Stripe, Vercel)
- All test artifacts removed and verified: **0 remaining**

## 3. Attack Surface

- Supabase REST API (`/rest/v1/*`, `/auth/v1/*`) — public
- 10 Edge Functions (payment, payroll, notifications, reports) — JWT-gated
- 50 tables, ~100 RLS policies, ~30 SECURITY DEFINER functions
- 4 public storage buckets (avatars, courses, documents, resources)
- Vite SPA on Vercel

## 4. Threat Model

| Profile                | Objective                                   | Likelihood × Impact |
| ---------------------- | ------------------------------------------- | ------------------- |
| Random internet user   | PII harvesting, account escalation          | HIGH × CRITICAL     |
| Parent/student (legit) | See other families' data, impersonate staff | HIGH × HIGH         |
| Teacher                | Read all financials (policy allows)         | MED × MED           |

## 5. Attack Paths (validated)

```
Anonymous ──▶ SELECT users (role=teacher) ──▶ staff emails/PII        [CONFIRMED]
Anonymous ──▶ signup ──▶ INSERT users role=admin ──▶ is_admin()=true
         ──▶ SELECT all users / payments / invoices / audit_logs     [CONFIRMED]
Anonymous ──▶ signup ──▶ RPC get_dashboard_stats ──▶ business KPIs    [CONFIRMED]
```

---

## 6. Confirmed Findings

### CRITICAL-1 — Privilege escalation to admin via `users` self-insert policy

- **Severity:** CRITICAL | **Confidence:** HIGH | **Affected:** `users` table RLS
- **Vector:** `POST /rest/v1/users` with own `id`, `role:"admin"`, `status:"active"`
- **Policy flaw:** `users_insert_self` → `with_check: (auth.uid() = id)` — **no role whitelist**, no BEFORE trigger
- **Live evidence:** fresh throwaway auth user (no existing row) inserted `role=admin`; `is_admin()` RPC returned **`true`**; full PII dump of all 34 users + audit_logs retrieved
- **MITRE:** TA0004 (Privilege Escalation) — T1098 (Account Manipulation)
- **Fix:** `with_check: (auth.uid() = id AND role IN ('student','parent') AND status='pending')` + BEFORE trigger blocking role/status changes; or drop self-insert entirely and route through `register_user` RPC

### CRITICAL-2 — `users_update_own` also allows role change

- **Severity:** CRITICAL | **Confidence:** HIGH (policy-level)
- Same missing role check on UPDATE. Any user with an existing row can `PATCH role=admin`.
- **Fix:** role-change guard on UPDATE policy + trigger

### HIGH-1 — Anonymous PII disclosure of staff accounts

- **Severity:** HIGH | **Confidence:** HIGH
- `users_public_read_teachers` → `qual: role = 'teacher'`, applies to `public` role (no auth)
- **Live evidence:** anon `GET /rest/v1/users?role=eq.teacher` returned 8 records with real personal emails (e.g. `me15151idz@gmail.com`)
- **MITRE:** TA0009 (Collection) — T1119/T1530
- **Fix:** scope to `authenticated`; expose only curated public profile fields (never email/phone)

### HIGH-3 — SECURITY DEFINER stats RPC callable by anyone authenticated

- **Severity:** HIGH | **Confidence:** HIGH
- `get_dashboard_stats` is SECURITY DEFINER with **no role check inside**; advisor-flagged executable by `authenticated`
- **Live evidence:** brand-new user with **no `users` row at all** called the RPC → returned student count, course count, revenue, unpaid invoices, enrollment KPIs
- **Fix:** add `IF NOT is_admin() THEN RAISE EXCEPTION` at top; keep `search_path` pinned

### MED-1 — Teachers can read ALL students' payments/invoices

- Policies `payments_teacher_select`, `invoices_teacher_select`, `rfid_scans_teacher_read`, `students_teacher_read` → `qual: is_teacher()` without ownership scoping. Any teacher reads every family's financial data.

### MED-2 — Anon-executable SECURITY DEFINER helpers (11 functions)

- `is_admin`, `is_parent`, `is_staff`, `is_student`, `is_teacher`, `is_assistant`, `is_student_enrolled_in`, `is_teacher_of_course` executable by `anon` via `/rest/v1/rpc/*`. Low direct impact (boolean only) but violates least privilege.

### LOW — Miscellaneous

- Leaked-password protection disabled in Auth (advisor WARN)
- `btree_gist`, `pg_net` extensions in `public` schema (should move to `extensions`)
- Mutable `search_path` on `time_to_minutes`, `notify_parent_on_attendance`, `notify_parent_on_attendance_record`
- 3 functions/triggers lack pinned `search_path`

---

## 7. Unverified Hypotheses

- Default credentials on seeded demo accounts (seed SQL not found in repo; password guesses failed — likely randomized)
- Storage buckets may allow overwrite via public bucket + guessable paths (not tested — low priority)

## 8. MITRE ATT&CK Coverage

- TA0004 T1098 (priv-esc via self-insert)
- TA0009 T1530 (anon PII)
- TA0007 T1083 (discovery via REST)
- TA0002 (initial access via open signup)

## 9. Detection Gaps

- No MFA on staff accounts
- Signup grants sessions without meaningful confirmation enforcement on API path
- `audit_logs` readable by fake admins (evidence can be deleted)
- No anomaly alerting on role changes

## 10. Risk Ranking

| #   | Finding                       | Severity |
| --- | ----------------------------- | -------- |
| 1   | users self-insert → admin     | CRITICAL |
| 2   | users self-update → admin     | CRITICAL |
| 3   | anon teacher PII              | HIGH     |
| 4   | stats RPC unauth              | HIGH     |
| 5   | teacher reads all financials  | MEDIUM   |
| 6   | anon SECURITY DEFINER helpers | MEDIUM   |
| 7   | misc hardening                | LOW      |

## 11. Evidence Summary

- Throwaway users `redteam-escalation@test.dz`, `redteam-stats@test.dz` — **both deleted; audit artifacts verified 0**
- Live HTTP evidence captured during session:
  - `is_admin()` → `true` after self-insert as admin
  - Anon teacher record dump (8 records)
  - `get_dashboard_stats` KPIs from non-admin account

## 12. Remediation Priorities (this week)

1. **Block self-role-set** on `users` INSERT/UPDATE (policy + trigger) — closes CRITICAL-1/2
2. **`get_dashboard_stats` role check** — closes HIGH-3
3. **Scope `users_public_read_teachers` to authenticated + strip email** — closes HIGH-1
4. Scope teacher policies to own courses (MED-1); revoke anon EXECUTE on 11 helpers (MED-2)

## 13. Recommended Retesting

After fixes: replay the 4 validated attack paths with fresh throwaway accounts.

## 14. Overall Assessment

**CRITICAL posture.** Authorization is broken at the foundational RLS layer, and the app is live with real user data. Fixes are small, surgical policy changes — no re-architecture needed.

## 15. Remediation Status (2026-08-03)

### Applied — migration `fix_rls_privilege_escalation_and_data_exposure` (verified)

| #          | Fix                                                                                                                                                                                                                                                                                                                                                                                                                     | Result                                                          |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| CRITICAL-1 | `users_insert_self` recreated: `WITH CHECK (auth.uid() = id AND role IN ('student','parent'))`                                                                                                                                                                                                                                                                                                                          | self-insert as admin → **403 RLS (blocked)**                    |
| CRITICAL-2 | Trigger `trg_users_prevent_role_change` + SECURITY DEFINER `prevent_users_role_change()` (admin-only; others get `permission_denied`, hint "Vous ne pouvez pas modifier votre rôle ou statut")                                                                                                                                                                                                                          | UPDATE role/status → **400 (blocked)**                          |
| HIGH-3     | `get_dashboard_stats` recreated with `IF NOT (is_admin() OR is_assistant()) THEN RAISE EXCEPTION 'permission_denied'` — gate allows admin **or assistant** because the assistant dashboard calls it (12 stats)                                                                                                                                                                                                          | non-privileged RPC → **400 permission_denied (blocked)**        |
| MED-1      | Teacher policies recreated scoped to own students (`is_teacher() AND EXISTS course_enrollments JOIN courses WHERE c.teacher_id = auth.uid()`): `payments_teacher_select`, `invoices_teacher_select`, `rfid_scans_teacher_read`, `students_teacher_read`; added `users_teacher_select_students` (role='student' AND status='active' AND enrolled in own course) for nested reads in TeacherStudents/TeacherRevenue pages | teachers can no longer read other teachers' students/financials |
| MED-2      | Anon EXECUTE on helpers **retained by design** (see Accepted Residuals)                                                                                                                                                                                                                                                                                                                                                 | —                                                               |

### Applied — migration `harden_public_teacher_policy_and_trigger_function` (verified)

- `users_public_read_teachers` scoped to `role = 'teacher' AND status = 'active'` — the inactive `me15151idz@gmail.com` account no longer appears in anon listings; the 7 active teachers still resolve so the public directory/profile pages keep working.
- `REVOKE EXECUTE ... FROM PUBLIC, anon, authenticated` on `prevent_users_role_change()` (trigger-only function).

### Regression-tested (all pass)

- `register_user` signup → 204; self profile update (first_name/phone) → 204; status-change attempt → 400 blocked.
- Legit nested reads for teachers (TeacherStudentsPage/TeacherRevenuePage joins) and assistant dashboard stats unaffected.

### Accepted Residuals (documented, not fixed — fixing would create bugs)

- **HIGH-1 email/phone exposure**: the public TeachersPage/TeacherProfilePage (`useTeachers.ts`, `TeacherProfilePage.tsx:211-220`) deliberately render teacher email/phone for anonymous visitors. Scoping the policy to `authenticated` would break the public directory. Mitigation: now limited to active teachers; contact info is intentional product behavior.
- **MED-2 anon-executable helpers (`is_admin`, `is_staff`, ...)**: these are **auth-scoped** — for anon they always return `false` (`auth.uid()` is NULL), so they leak nothing. They cannot be revoked because RLS policies are evaluated with the caller's privileges: revoking anon EXECUTE would make every public-page query fail at policy evaluation.
- **LOW**: `btree_gist`/`pg_net` in `public` schema (moving them requires search_path surgery on functions that use them — higher regression risk than reward); leaked-password protection not enabled (Auth dashboard setting).

### Retesting instructions

Replay the 4 validated attack paths with fresh throwaway accounts — script kept at `/tmp/opencode/fix_test.py`.
