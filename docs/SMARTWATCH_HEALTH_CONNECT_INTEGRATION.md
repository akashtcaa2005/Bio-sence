# BioSence Smartwatch and Health Connect Integration

## Status

**Design proposal — not yet implemented.** This document specifies the safe integration path for importing real smartwatch measurements into BioSence. Saving this plan does not connect a watch or ingest health data.

## Goal

Allow a user to consent to importing supported health measurements from a compatible Android health-data source, review imported data, and use it in BioSence's dashboard and analytics.

## Recommended integration path

BioSence currently has a React + TypeScript + Vite web frontend and Supabase integration. A browser-only web app cannot directly read Android Health Connect records. Implement an Android companion app (or a native Android wrapper with a Health Connect integration) that:

1. Explains requested data types and why each is needed.
2. Requests only the Health Connect permissions required for selected metrics.
3. Reads records only after the user grants permission.
4. Normalizes records and preserves source, units, measurement times, and available metadata.
5. Sends records to an authenticated BioSence ingestion endpoint using the signed-in user's session.
6. Allows the user to disconnect the source and revoke permissions.

Use **Android Health Connect** for Android-local health records. Do not build new integrations on legacy Google Fit APIs. Health Connect data availability depends on the watch, companion app, sync settings, Android version, permissions, and record types exposed by the source.

For Fitbit devices, consider a separate Fitbit Web API OAuth integration only if the selected device and required data types are supported. Do not assume Fitbit, Samsung Health, and Health Connect expose identical metrics.

## Candidate measurements

| Measurement | Suggested storage unit | Availability / caution |
|---|---|---|
| Heart rate | beats/minute (bpm) | Common; timestamps and sampling frequency vary |
| Resting heart rate | bpm | May be summarized by the source rather than exposed as raw samples |
| Heart-rate variability | milliseconds (ms) | Not available from every watch/source; preserve metric definition when known |
| Oxygen saturation (SpO₂) | percent (%) | Device- and source-dependent; spot readings may be sparse |
| Respiratory rate | breaths/minute | Device- and source-dependent |
| Skin temperature | °C | Trend/skin temperature, not core body temperature |
| Steps | count | Usually cumulative or aggregated; avoid double-counting overlapping sources |
| Distance | meters | Often estimated |
| Active energy | kilocalories (kcal) | Estimated and source-dependent |
| Exercise sessions | source-defined type + start/end | Activity taxonomy differs by source |
| Sleep | start/end time + stage where available | Sleep stages are estimates and may be absent |
| Weight | kilograms (kg) | Usually requires a scale or manual entry |
| Body-fat percentage | percent (%) | Optional and often an estimate from a separate device |
| Blood pressure | mmHg | Do not assume a smartwatch can provide it; typically import from a validated cuff/device |
| Blood glucose | mmol/L or mg/dL with explicit unit | Requires a compatible glucose meter/CGM; never infer it from a watch |
| ECG | waveform/structured record if supported | Not a generic continuous metric; model, region, source, and permissions matter |

Only persist values actually supplied by an authorized source. Missing readings must remain missing; never fabricate, interpolate, or label synthetic data as real.

## Suggested data model

Create a dedicated health-measurements table or adapt the existing verified schema after reviewing all current migrations. Do not apply a migration until the actual production schema and existing RLS policies have been checked.

Candidate fields:

- `id`: UUID primary key
- `user_id`: UUID tied to the authenticated account
- `metric_type`: allowlisted metric identifier
- `value_numeric`: nullable numeric value
- `unit`: normalized unit
- `started_at` / `ended_at`: timestamps stored in UTC
- `source_provider`: e.g. Health Connect or Fitbit
- `source_device`: optional model/device label, if provided
- `source_record_id`: optional source identifier for deduplication
- `recorded_at`: ingestion timestamp
- `metadata`: restricted, validated JSON for source details that are genuinely needed

Use an idempotent deduplication key based on user, source, source record identifier (when available), metric, and measurement time. Do not store OAuth access/refresh tokens in browser storage or plaintext database fields.

## Security and privacy requirements

- Explicit, revocable consent per provider and data type.
- Request the minimum permissions required; do not request every permission by default.
- Require authentication and enforce row-level security so users can access only their own health records.
- Validate allowed metrics, units, numeric ranges, timestamps, payload size, and source identifiers server-side.
- Keep provider secrets and token refresh operations on a trusted backend.
- Audit connection, disconnection, and ingestion events without logging sensitive health payloads.
- Support deletion of imported records and provider disconnection.
- Never expose health readings to caregivers unless the user has explicitly authorized that caregiver and access policy permits it.
- Do not describe smartwatch readings or AI output as a diagnosis or medically accurate measurement without appropriate validation.

## Implementation plan

1. **Schema audit:** inspect existing health-reading tables, migrations, RLS policies, authentication, and alert flows before writing a new migration.
2. **Android bridge:** create a small Android companion app/module that checks Health Connect availability and obtains user-granted permissions.
3. **Read and normalize:** implement per-record-type readers, UTC timestamps, units, pagination/time windows, and deduplication.
4. **Authenticated ingestion:** add a backend endpoint or Supabase Edge Function that validates the user's JWT and every record; never trust a client-supplied user ID.
5. **Connection UI:** add a Devices/Health Data section showing connection status, granted data types, last successful sync, and disconnect/delete controls.
6. **Dashboard:** display only imported metrics that exist, label source and timestamp, and distinguish measured records from estimates.
7. **Evaluation:** test permission denial, revoked permissions, empty data, duplicate sync, timezone changes, malformed values, multi-user isolation, and provider disconnection.
8. **Pilot validation:** compare selected readings with suitable reference devices and document limitations before using them for risk alerts.

## Acceptance criteria

- No readings are imported before explicit user permission.
- Each record includes a timestamp, unit, source, and authenticated owner.
- Re-running sync does not duplicate records.
- Users cannot read or modify another user's records.
- Revoking permissions or disconnecting stops future imports.
- Unsupported metrics are clearly marked unavailable instead of being simulated.
- The dashboard distinguishes source measurements, estimates, and any synthetic demo data.
- Automated tests cover validation, deduplication, permissions, and access control.

## References

- Android Health Connect: https://developer.android.com/health-and-fitness/health-connect
- Health Connect data types: https://developer.android.com/health-and-fitness/health-connect/data-and-data-types
- Health Connect permissions: https://developer.android.com/health-and-fitness/health-connect/permissions
- Fitbit Web API: https://dev.fitbit.com/build/reference/web-api/
