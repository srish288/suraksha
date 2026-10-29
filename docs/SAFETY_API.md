# Safety API (Module 2)

## GET /api/zones
- Public (no login).
- Returns `{ items: Zone[] }` (see `Zone` in packages/shared/src/types.ts).
- By default only active zones are returned.
- Extra query (added by safety module): `?includeInactive=true` returns inactive zones too.
- - `?lat=..&lng=..` (both required together) adds `current: { zone, risk }`.
  - `zone` is the most serious active zone the point is inside or near, or null.
  - `risk` is a rule-based RiskAssessment (see docs/RISK_RULES.md). It includes `assessedAt`.
- Errors use the shared format: `{ error: { code, message, details? } }`.

Zone levels: safe, caution, restricted, emergency.
Sample zones have `isSample: true` and are FICTIONAL, not official safety information.