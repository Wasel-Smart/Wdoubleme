/**
 * Unit tests — src/utils/security.ts
 * Covers: password strength, rate limiting, input sanitisation, email/phone validation.
 * 2FA and CSP are integration-level concerns and tested separately.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkPasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
  checkRateLimit,
  resetRateLimit,
  sanitizeInput,
  validateEmail,
  validatePhone,
  validateURL,
} from '@/utils/security';

// ── Password Strength ─────────────────────────────────────────────────────────

describe('checkPasswordStrength', () => {
  it('scores a strong password highly', () => {
    const result = checkPasswordStrength('Wasel@Secure99!');
    expect(result.score).toBeGreaterThanOrEqual(3);
    expect(result.isValid).toBe(true);
    expect(result.feedback).toHaveLength(0);
  });

  it('scores a weak password low', () => {
    const result = checkPasswordStrength('pass');
    expect(result.score).toBe(0);
    expect(result.isValid).toBe(false);
    expect(result.feedback.length).toBeGreaterThan(0);
  });

  it('penalises common patterns', () => {
    const before = checkPasswordStrength('Secure@123').score;
    const after = checkPasswordStrength('password123').score;
    expect(after).toBeLessThanOrEqual(before);
  });

  it('penalises repeated characters', () => {
    const result = checkPasswordStrength('aaaaaaA1!');
    expect(result.feedback).toContain('Avoid repeating characters');
  });

  it('rewards length ≥ 12', () => {
    const short = checkPasswordStrength('Wasel@1x');
    const long = checkPasswordStrength('Wasel@1xLongPass');
    expect(long.score).toBeGreaterThanOrEqual(short.score);
  });
});

describe('getPasswordStrengthLabel', () => {
  it('maps all scores to labels', () => {
    expect(getPasswordStrengthLabel(0)).toBe('Very Weak');
    expect(getPasswordStrengthLabel(1)).toBe('Weak');
    expect(getPasswordStrengthLabel(2)).toBe('Fair');
    expect(getPasswordStrengthLabel(3)).toBe('Strong');
    expect(getPasswordStrengthLabel(4)).toBe('Very Strong');
  });

  it('returns Very Weak for out-of-range score', () => {
    expect(getPasswordStrengthLabel(99)).toBe('Very Weak');
  });
});

describe('getPasswordStrengthColor', () => {
  it('returns a hex colour for each score', () => {
    for (let i = 0; i <= 4; i++) {
      expect(getPasswordStrengthColor(i)).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});

// ── Rate Limiting ─────────────────────────────────────────────────────────────

describe('checkRateLimit', () => {
  const KEY = 'test-rl-key';

  beforeEach(() => resetRateLimit(KEY));

  it('allows requests within limit', () => {
    expect(checkRateLimit(KEY, { maxRequests: 5, windowMs: 60000 })).toBe(true);
    expect(checkRateLimit(KEY, { maxRequests: 5, windowMs: 60000 })).toBe(true);
  });

  it('blocks requests beyond the limit', () => {
    const cfg = { maxRequests: 3, windowMs: 60000 };
    checkRateLimit(KEY, cfg);
    checkRateLimit(KEY, cfg);
    checkRateLimit(KEY, cfg);
    // 4th request exceeds limit
    expect(checkRateLimit(KEY, cfg)).toBe(false);
  });

  it('resets cleanly', () => {
    const cfg = { maxRequests: 1, windowMs: 60000 };
    checkRateLimit(KEY, cfg);
    checkRateLimit(KEY, cfg); // now blocked
    resetRateLimit(KEY);
    expect(checkRateLimit(KEY, cfg)).toBe(true); // fresh window
  });
});

// ── Sanitisation ──────────────────────────────────────────────────────────────

describe('sanitizeInput', () => {
  it('strips HTML tags', () => {
    const result = sanitizeInput('<script>alert("xss")</script>hello');
    expect(result).not.toContain('<script>');
    expect(result).toContain('hello');
  });

  it('escapes angle brackets', () => {
    expect(sanitizeInput('<b>bold</b>')).toContain('&lt;');
    expect(sanitizeInput('<b>bold</b>')).toContain('&gt;');
  });

  it('passes plain text through unchanged (modulo escaping)', () => {
    const plain = 'Hello World';
    expect(sanitizeInput(plain)).toBe(plain);
  });
});

// ── Validators ────────────────────────────────────────────────────────────────

describe('validateEmail', () => {
  it('accepts valid emails', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('user+tag@wasel.jo')).toBe(true);
  });

  it('rejects invalid emails', () => {
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('@no-local.com')).toBe(false);
    expect(validateEmail('no-at-sign')).toBe(false);
  });
});

describe('validatePhone', () => {
  it('accepts valid E.164 phone numbers', () => {
    expect(validatePhone('+962791234567')).toBe(true);
    expect(validatePhone('+12125551234')).toBe(true);
  });

  it('rejects local format without country code', () => {
    expect(validatePhone('0791234567')).toBe(false);
    expect(validatePhone('791234567')).toBe(false);
  });

  it('rejects numbers with non-digit chars', () => {
    expect(validatePhone('+962-79-123-4567')).toBe(false);
  });
});

describe('validateURL', () => {
  it('accepts valid URLs', () => {
    expect(validateURL('https://wasel14.online')).toBe(true);
    expect(validateURL('https://supabase.co/storage/v1/object')).toBe(true);
  });

  it('rejects strings without a scheme', () => {
    expect(validateURL('wasel14.online')).toBe(false);
    expect(validateURL('not a url')).toBe(false);
  });
});
