# Wasel — Database Migrations

This folder contains all Supabase SQL migrations for the Wasel platform.

## ⚠️ Important Rules

1. **Never edit an existing migration file** — once applied, a migration is immutable.
2. **Always create a new file** for schema changes, using the timestamp naming convention below.
3. **Test migrations locally** against a Supabase dev project before running on production.
4. **Migrations run in filename order** (lexicographic / timestamp ascending).

---

## Naming Convention

```
YYYYMMDDHHMMSS_short_description.sql
```

Example: `20260401120000_add_driver_rating_column.sql`

---

## Applied Migration Sequence

| # | File | Description | Status |
|---|------|-------------|--------|
| 01 | `20260210_complete_schema.sql` | Initial complete schema — all core tables | ✅ Applied |
| 02 | `20260223000000_production_schema.sql` | Production hardening, RLS policies | ✅ Applied |
| 03 | `20260224_additional_tables.sql` | Package tracking, wallet transactions | ✅ Applied |
| 04 | `20260224_postgis_functions.sql` | PostGIS spatial functions for route matching | ✅ Applied |
| 05 | `20260224_wasel_complete_schema.sql` | Consolidated schema snapshot (reference) | ✅ Applied |
| 06 | `20260224000000_production_backend_schema.sql` | Backend service layer tables | ✅ Applied |
| 07 | `20260224000001_backup_configuration.sql` | Backup schedules and retention config | ✅ Applied |
| 08 | `20260302_regionalization_schema.sql` | Region/corridor/zone tables | ✅ Applied |
| 09 | `20260310_security_performance_fixes.sql` | Index optimisations, auth security fixes | ✅ Applied |
| 10 | `20260320000000_w_mobility_platform_complete.sql` | Mobility OS, Raje3, corporate accounts | ✅ Applied |
| 11 | `20260327090000_production_operating_model.sql` | Operating model: pricing, surges, SLAs | ✅ Applied |

---

## Overlapping Files (Known / Resolved)

Several files from `20260224` share the same date prefix. This happened because multiple
schema areas were developed in parallel. All have been applied. Future migrations **must**
use full `YYYYMMDDHHMMSS` timestamps (including hours/minutes/seconds) to avoid collisions.

---

## How to Apply a New Migration

```bash
# Using Supabase CLI
supabase db push

# Or manually via psql
psql "$SUPABASE_DB_URL" -f migrations/20260401120000_my_change.sql
```

---

## Reference Schema Files

| File | Purpose |
|------|---------|
| `schema.sql` | Full current schema snapshot — for reference only, not run as a migration |
| `ai_schema.sql` | AI / intelligence layer tables — applied as part of migration 10 |

---

## Rollback Policy

Supabase does not support automatic rollbacks. Before any destructive migration (DROP, ALTER):

1. Take a manual backup via Supabase dashboard → Database → Backups
2. Write a compensating migration that undoes the change
3. Name it `YYYYMMDDHHMMSS_rollback_description.sql` and keep it ready
