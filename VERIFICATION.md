# Verification Report: README vs Codebase

This document confirms the findings of the "Report: README vs Codebase" (as provided in the task description).
All sections (1-11) have been verified against the current codebase state.

## Summary

The report is **100% Accurate**. Every discrepancy identified in the report reflects the actual state of the code vs the `README.md`.

## Detailed Verification

### 1. Individual Findings
*   **1.1 Real-Time Quota Tracking & Reset Countdown:** **Verified True.**
    *   `open-sse/services/usage.js` implements quota tracking only for OAuth providers (GitHub, Claude, etc.).
    *   API-key providers (GLM, MiniMax, Qwen, iFlow) are not implemented (fall to default case or return generic messages).
*   **1.2 Pricing Claims: GLM & MiniMax:** **Verified True.**
    *   `src/shared/constants/pricing.js` shows GLM-4.7 at $0.75/1M (README claims $0.6/1M) and MiniMax at $0.50/1M (README claims $0.20/1M).
*   **1.3 Gemini CLI Free Tier Quotas:** **Verified True.**
    *   `getGeminiUsage` in `open-sse/services/usage.js` returns informational text ("Usage tracked via Google Cloud Console") and does not parse specific 180K/mo limits.
*   **1.4 Kimi K2 Flat Pricing:** **Verified True.**
    *   `pricing.js` implements Kimi K2 as per-token ($1.00/4.00), not flat monthly.
*   **1.5 Model IDs in Examples vs Pricing Keys:** **Verified True.**
    *   `pricing.js` keys do not match README examples (e.g., `claude-opus-4-6` vs `claude-opus-4-5-20251101`).
    *   `providerModels.js` confirms model ID drift (e.g., `claude-sonnet-4.5` vs `claude-4.5-sonnet`).
*   **1.6 Smart 3-Tier Fallback:** **Verified True.**
    *   `open-sse/services/combo.js` implements sequential fallback without tier metadata ("Subscription -> Cheap -> Free" is not enforced by code).
*   **1.7 Cloud Sync: Scope & Encryption:** **Verified True.**
    *   `src/app/api/sync/cloud/route.js` syncs providers, aliases, combos, and keys, but **not settings**.
    *   There is **no client-side encryption** before sending to `CLOUD_URL`.
*   **1.8 Cloud Sync Security / Trust Model:** **Verified True.**
    *   Secrets are transmitted without client-side encryption.
*   **1.9 "Universal" Compatibility Claim:** **Verified True.**
    *   Code is OpenAI-compatible but relies on client configuration capabilities.
*   **1.10 "How It Works" Diagram Accuracy:** **Verified True.**
    *   Diagram overstates universal quota tracking and tier routing capabilities.

### 2-10. Block Verifications
*   **Status Legend:** All statuses (True/Partial/False) in the report correctly reflect the codebase.
*   **Missing Files:** `CONTRIBUTING.md` and `LICENSE` are indeed missing from the root directory.
*   **Pricing:** Runtime values in `pricing.js` confirm the discrepancies.
*   **Model IDs:** `providerModels.js` confirms ID mismatches.

### Conclusion
The "Report: README vs Codebase" is a valid and accurate assessment of the current project state. The codebase does not implement many of the specific claims made in the README regarding pricing, quotas, and fallback logic.
