# Performance And Availability Checklist

Status date: 2026-03-30

## Achieved In This Pass

- [x] Centralized React Query defaults are now used at the app root in `src/App.tsx`.
- [x] App startup now initializes error monitoring, web vitals, long-task detection, backend warm-up, and recurring health checks in `src/App.tsx`.
- [x] Runtime availability state is now tracked in one place with a subscribe-able snapshot model in `src/services/core.ts`.
- [x] Online and offline changes now sync into React Query and trigger a fresh backend health probe in `src/App.tsx`.
- [x] The UI now exposes degraded-mode and offline-state feedback with a retry action in `src/components/system/AvailabilityBanner.tsx`.
- [x] Route shell now surfaces the availability banner for all app pages in `src/layouts/WaselRoot.tsx`.
- [x] Bus booking metadata remains forwarded and the bus route fetch path now matches the current trips API contract in `src/services/bus.ts`.
- [x] Sentry and web-vitals startup paths are now idempotent to reduce duplicate initialization in `src/utils/monitoring.ts` and `src/utils/performance.ts`.

## Improved But Not Fully Achieved

- [x] Availability messaging is now visible to users instead of being hidden in logs only.
- [x] Fallback mode is now explicit and retryable from the UI.
- [x] Startup performance posture is stronger because monitoring and health work now happen once at the root instead of being fragmented.

## Still Blocked By Broader Codebase Issues

- [ ] Repo-wide `npm run type-check` is still failing across many unrelated files outside this pass.
- [ ] Repo-wide `npm run build` cannot be considered production-green until those TypeScript errors are resolved.
- [ ] No live uptime, synthetic monitoring, or load-testing evidence exists yet for a true 9/10 or 10/10 availability claim.
- [ ] Several flows still rely partly on local or demo fallback behavior rather than fully backend-backed resilience.

## Verification Checklist

- [x] Implemented root startup coordinator.
- [x] Implemented shared availability store and polling.
- [x] Implemented visible availability banner and manual retry.
- [x] Rechecked touched files with targeted type-check filtering.
- [ ] Full repo type-check clean.
- [ ] Full production build clean.
