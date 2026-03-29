/**
 * validation.tsx — Input validation helpers for the Wasel Hono server
 *
 * Provides composable validators that return a typed result or
 * a 400 JSON response so route handlers stay clean.
 */

// ── Primitive Validators ────────────────────────────────────────────────────

export function isValidEmail(v: unknown): v is string {
  return typeof v === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function isNonEmptyString(v: unknown, maxLength = 500): v is string {
  return typeof v === "string" && v.trim().length > 0 && v.length <= maxLength;
}

export function isPositiveNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v) && v > 0;
}

export function isNonNegativeInt(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v >= 0;
}

export function isValidUUID(v: unknown): v is string {
  return typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

// ── Pagination ──────────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

/**
 * Parse and clamp pagination query params.
 * Defaults: page = 1, limit = 20, maxLimit = 50
 */
export function parsePagination(
  rawPage?: string | null,
  rawLimit?: string | null,
  maxLimit = 50,
): PaginationParams {
  const page = Math.max(1, parseInt(rawPage || "1", 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, parseInt(rawLimit || "20", 10) || 20));
  return { page, limit, offset: (page - 1) * limit };
}

// ── Sanitisation ────────────────────────────────────────────────────────────

/** Trim + lowercase for emails */
export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Trim and cap length */
export function sanitiseString(str: string, maxLength = 500): string {
  return str.trim().slice(0, maxLength);
}

/** Strip control characters and limit length for chat messages */
export function sanitiseMessage(str: string, maxLength = 2000): string {
  // deno-lint-ignore no-control-regex
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, "").trim().slice(0, maxLength);
}

// ── Status Enums ────────────────────────────────────────────────────────────

const BOOKING_STATUSES = new Set(["pending", "accepted", "rejected", "cancelled", "completed"]);
const TRIP_STATUSES = new Set(["published", "in_progress", "completed", "cancelled"]);
const DRIVER_STATUSES = new Set(["online", "offline", "busy"]);

export function isValidBookingStatus(v: unknown): v is string {
  return typeof v === "string" && BOOKING_STATUSES.has(v);
}

export function isValidTripStatus(v: unknown): v is string {
  return typeof v === "string" && TRIP_STATUSES.has(v);
}

export function isValidDriverStatus(v: unknown): v is string {
  return typeof v === "string" && DRIVER_STATUSES.has(v);
}

// ── Composite Validators ────────────────────────────────────────────────────

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Run a list of field checks and return all errors at once.
 *
 * Example:
 *   const errors = validate(
 *     ["email", body.email, isValidEmail, "A valid email is required"],
 *     ["password", body.password, v => isNonEmptyString(v, 128), "Password is required"],
 *   );
 *   if (errors.length) return c.json({ error: "Validation failed", details: errors }, 400);
 */
export function validate(
  ...rules: Array<[field: string, value: unknown, check: (v: unknown) => boolean, message: string]>
): ValidationError[] {
  const errors: ValidationError[] = [];
  for (const [field, value, check, message] of rules) {
    if (!check(value)) {
      errors.push({ field, message });
    }
  }
  return errors;
}
