# Chapter 1-3 Alignment Review

Source reviewed:

- `docs/specs/景區智慧閘機產品流程詳述企劃書20260407_James.docx`
- Reviewed scope: Chapter 1, 2, 3 only
- Ignored scope: Chapter 4 gate-machine interaction details (per request)

Reference plan compared:

- `docs/architecture/backend-design-plan.md`

## Key Mismatches Found and Corrections

1. Multi-park architecture wording mismatch
- Mismatch: earlier plan text could be interpreted as multi-instance backend.
- Spec requirement (Ch3.1/3.2): one backend platform, tenant isolation by Park ID.
- Correction: plan now explicitly defines single platform + tenant isolation model.

2. Account model across parks not explicit enough
- Mismatch: plan did not clearly state centralized account identity across parks.
- Spec requirement (Ch3.8.1): centralized user account management, park business data still isolated.
- Correction: added central-account + park-scoped commerce model.

3. Sales-cap rules incomplete
- Mismatch: plan had limits but lacked full composite-rule wording.
- Spec requirement (Ch2.8~2.11, Ch3.6): daily cap + period cap + smaller remaining rule + no oversell.
- Correction: added dedicated `sales-control` module and explicit atomic cap rules.

4. Guest-order behavior insufficiently explicit
- Mismatch: guest order persistence and limitations not strongly called out.
- Spec requirement (Ch2.3.4, Ch3.8.2): guest orders stored, no long-term account binding, no query/modify/refund self-service.
- Correction: added explicit guest business-rule section.

5. Verification result handling scope
- Mismatch: potential assumption of manual review path.
- Spec requirement (Ch2.6): store verification records/results, no manual review.
- Correction: plan now states verification result recording without manual-review queue.

6. Admin UI capability granularity
- Mismatch: plan covered admin broadly but not all Chapter 3 UI items in detail.
- Spec requirement (Ch3.11): parameter config, sales monitoring, order/ticket/user queries, analytics, permissions and logs.
- Correction: expanded admin API and capability scope.

## Noted Requirement Ambiguity in Source Spec

- Chapter 1 revision note says purchase quantity is limited to one ticket globally.
- Chapter 2.7 states single-ticket limit specifically for verification-required discount tickets.

Confirmed decision for implementation baseline:

- Keep current system rule as `max 1 ticket per order` globally (already used in existing project docs/UI).
- If business confirms relaxed rule later, parameterize quantity limits by ticket type and park config.

## Result

- `docs/architecture/backend-design-plan.md` has been updated to align with Chapter 1-3 requirements.
- Data-organization proposal is provided in:
- `docs/architecture/backend-data-organization.md`
