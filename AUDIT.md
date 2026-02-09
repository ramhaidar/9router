# Audit Report: README vs Codebase

This document outlines discrepancies identified between the project's documentation (`README.md`) and the actual implementation in the codebase.

## 1. Quota Tracking & Reset Logic

*   **Statement in README.md**:
    *   "Real-Time Quota Tracking... Live token count + reset countdown"
    *   "Reset countdown (5-hour, daily, weekly)"
    *   "Maximize subscription value - Track quota, use every bit before reset"
*   **Actual Fact in Code**:
    *   The codebase (`src/sse/services/auth.js`, `open-sse/services/accountFallback.js`) implements **reactive rate limiting** using exponential backoff (e.g., wait 1s, 2s, 4s... up to 2 minutes) when a provider returns a 429 error.
    *   There is **no logic** found for proactive quota tracking (e.g., counting requests against a limit like "1000 per day").
    *   There is **no logic** for specific time-based resets (5-hour, weekly). The "reset" is simply the backoff timer expiring.
*   **Proposed Fix (Missing Feature)**:
    *   Implement a stateful quota tracking system in `src/lib/usageDb.js` or `src/lib/localDb.js`.
    *   Add configuration fields to Provider Nodes to define quota limits (e.g., `limit: 1000`, `resetPeriod: "daily"`).
    *   Update the `getProviderCredentials` logic to check this local counter before attempting a request.
    *   Implement a background task or check-on-access logic to reset counters when the period expires.

## 2. Model Pricing

*   **Statement in README.md**:
    *   "GLM ($0.6/1M)"
    *   "MiniMax M2.1 ($0.2/1M)"
*   **Actual Fact in Code** (`src/shared/constants/pricing.js`):
    *   **GLM-4.7**: Input `$0.75`/1M, Output `$3.00`/1M (significantly higher).
    *   **MiniMax-M2.1**: Input `$0.50`/1M, Output `$2.00`/1M.
    *   The default pricing in the code is much higher than the "cheap" rates advertised in the README.
*   **Proposed Fix**:
    *   Update `src/shared/constants/pricing.js` to reflect the current actual API costs from the providers.
    *   Once confirmed, update `README.md` to match these validated prices so users have accurate cost expectations.

## 3. Model Naming & Availability

*   **Statement in README.md**:
    *   References simplified model IDs like `cc/claude-opus-4-6`, `cx/gpt-5.2-codex`, `if/kimi-k2-thinking`.
*   **Actual Fact in Code**:
    *   `src/shared/constants/pricing.js` and internal mapping logic often use specific, versioned IDs (e.g., `claude-opus-4-5-20251101`, `gpt-5.1-codex-max`).
    *   While `src/sse/services/model.js` has some resolution logic, using the exact strings from the README without manual aliasing may fail or result in missing pricing data (defaulting to zero or fallback pricing).
*   **Proposed Fix**:
    *   Standardize model IDs. Either update `pricing.js` to use the simplified "marketing" names as primary keys, or update `README.md` to list the exact technical model IDs required for the configuration to work out-of-the-box.
    *   Ensure the `ALIAS_TO_PROVIDER_ID` map in `src/sse/services/model.js` covers all prefixes used in the README (`cc`, `cx`, `if`, etc.).

## 4. "Smart 3-Tier Fallback"

*   **Statement in README.md**:
    *   "Smart 3-Tier Fallback... Auto-route: Subscription → Cheap → Free"
*   **Actual Fact in Code**:
    *   The system uses a generic **"Combo"** mechanism (`src/sse/services/combo.js`).
    *   While users *can* configure a combo to act as a 3-tier fallback, there is no specific "Tier" logic in the code. It is simply a linear list of models to try in sequence. The "Smart" aspect is purely user configuration, not system logic.
*   **Proposed Fix**:
    *   Update `README.md` to clarify that this is a **configuration pattern** achieved using Combos, rather than a hard-coded system feature.
    *   Alternatively, add a "Strategy" field to Combos in the code to explicitly support "Tiered" behavior (e.g., attempting all "Tier 1" providers before moving to "Tier 2").
