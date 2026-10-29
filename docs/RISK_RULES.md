# Risk assessment rules (Module 2)

This is a simple RULE-BASED score. It is NOT a machine-learning model.
The numbers below are demo choices. They are not tested on real incident data,
and no accuracy is claimed.

Code: packages/shared/src/safety/risk.ts  Tests: risk.test.ts

## Score (0 to 100, capped)

| Rule | Points |
|---|---|
| Inside a safe / caution / restricted / emergency zone | 0 / 30 / 60 / 90 |
| Near (outside, within alertDistanceMeters) a caution / restricted / emergency zone | 15 / 35 / 55 |
| Near bonus: closer to the edge, up to +10 (10 x (1 - distance / alertDistance), rounded) | 0 to 10 |
| Each extra non-safe zone at the same spot | +5 (max +10) |
| Inactive zone | 0 (ignored, but listed in the reasons) |
| No zone | 0 |

The most serious zone is the main one. Order: emergency, restricted, caution, safe.
Safe zones never give a "near" match.

## Level

- 60 or more: high
- 25 to 59: medium
- below 25: low

## Output (RiskAssessment)

`{ level, score, factors: [{ code, label, points, reason }], assessedAt }`
Every factor has a plain-language reason.

## Limits

- Uses only zone data and the position. It does not know about crowds, time of day, weather or past incidents.
- GPS from a browser can be wrong by tens of meters or more.
- Sample zones are fictional. This is not official safety information.