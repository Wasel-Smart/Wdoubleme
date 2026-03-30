/**
 * Security Headers & Configuration
 * Version: 1.1.0
 *
 * Implements security best practices:
 * - Content Security Policy (CSP) — env-aware (no unsafe-* in production)
 * - Rate Limiting
 * - Strong Password Requirements
 * - 2FA Support
 */

import { supabase } from '@/utils/supabase/client';
import { logger } from '@/utils/monitoring';
import { getConfig } from '@/utils/env';

// ── Detect environment ───────────────────────────────────────────────────────
const IS_DEV =
  typeof import.meta !== 'undefined' &&
  import.meta.env?.MODE === 'development';

// ── Content Security Policy ─────────────────────────────────────────────────
// unsafe-inline / unsafe-eval are ONLY included in development.
// Production uses strict CSP without these dangerous directives.
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    ...(IS_DEV ? ["'unsafe-inline'", "'unsafe-eval'"] : []),
    'https://cdn.jsdelivr.net',
    'https://unpkg.com',
    'https://js.stripe.com',
  ],
  'style-src': [
    "'self'",
    // unsafe-inline is required for Tailwind inline styles at runtime
    "'unsafe-inline'",
    'https://fonts.googleapis.com',
  ],
  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:',
    'https://*.supabase.co',
    'https://images.unsplash.com',
    'https://api.qrserver.com',
  ],
  'font-src': [
    "'self'",
    'data:',
    'https://fonts.gstatic.com',
  ],
  'connect-src': [
    "'self'",
    'https://*.supabase.co',
    'wss://*.supabase.co',
    'https://api.stripe.com',
    'https://api.unsplash.com',
    ...(IS_DEV ? ['ws://localhost:*', 'http://localhost:*'] : []),
  ],
  'frame-src': [
    "'self'",
    'https://js.stripe.com',
    'https://hooks.stripe.com',
  ],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'upgrade-insecure-requests': [],
};

export function getCSPHeader(): string {
  return Object.entries(CSP_DIRECTIVES)
    .map(([key, values]) => `${key} ${values.join(' ')}`.trim())
    .join('; ');
}

// ── Rate Limiting ────────────────────────────────────────────────────────────

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  config: RateLimitConfig = { maxRequests: 100, windowMs: 60000 }
): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return true;
  }

  record.count++;

  if (record.count > config.maxRequests) {
    logger.warning('Rate limit exceeded', { key, count: record.count, limit: config.maxRequests });
    return false;
  }

  return true;
}

export function resetRateLimit(key: string): void {
  rateLimitStore.delete(key);
}

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) rateLimitStore.delete(key);
  }
}, 5 * 60 * 1000);

// ── Password Strength ────────────────────────────────────────────────────────

export interface PasswordStrength {
  score: 0 | 1 | 2 | 3 | 4;
  feedback: string[];
  isValid: boolean;
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 8) {
    feedback.push('Password must be at least 8 characters');
  } else {
    score++;
  }
  if (password.length >= 12) score++;

  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password);

  if (!hasLowercase) feedback.push('Add lowercase letters');
  if (!hasUppercase) feedback.push('Add uppercase letters');
  if (!hasNumber) feedback.push('Add numbers');
  if (!hasSpecial) feedback.push('Add special characters');

  const diversityScore = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  score += Math.min(diversityScore - 1, 2);

  const commonPatterns = [/^123456/, /password/i, /qwerty/i, /admin/i, /letmein/i];
  if (commonPatterns.some(p => p.test(password))) {
    feedback.push('Avoid common patterns');
    score = Math.max(0, score - 1);
  }
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Avoid repeating characters');
    score = Math.max(0, score - 1);
  }

  const finalScore = Math.min(4, Math.max(0, score)) as 0 | 1 | 2 | 3 | 4;
  return { score: finalScore, feedback, isValid: finalScore >= 3 && password.length >= 8 };
}

export function getPasswordStrengthLabel(score: number): string {
  return ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'][score] ?? 'Very Weak';
}

export function getPasswordStrengthColor(score: number): string {
  return ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#10b981'][score] ?? '#ef4444';
}

// ── Two-Factor Authentication (2FA) ──────────────────────────────────────────

export interface TwoFactorSetup {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export function isTwoFactorAvailable(): boolean {
  return (
    getConfig().enableTwoFactorAuth &&
    typeof window !== 'undefined' &&
    typeof crypto !== 'undefined' &&
    typeof crypto.getRandomValues === 'function' &&
    typeof crypto.subtle !== 'undefined'
  );
}

export async function enable2FA(userId: string): Promise<TwoFactorSetup> {
  if (!isTwoFactorAvailable()) throw new Error('2FA is not enabled for this environment.');

  const secret = generateTOTPSecret();
  const qrCode = generateQRCode(secret, userId);
  const backupCodes = generateBackupCodes(10);

  await supabase
    .from('profiles')
    .update({ two_factor_enabled: true, two_factor_secret: secret, two_factor_backup_codes: backupCodes })
    .eq('id', userId);

  logger.info('2FA enabled', { userId });
  return { secret, qrCode, backupCodes };
}

export async function verify2FACode(userId: string, code: string): Promise<boolean> {
  if (!isTwoFactorAvailable()) return false;

  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('two_factor_secret, two_factor_backup_codes')
      .eq('id', userId)
      .single();

    if (!profile) return false;

    if (await verifyTOTPCode(profile.two_factor_secret, code)) return true;

    const backupCodes: string[] = profile.two_factor_backup_codes ?? [];
    const idx = backupCodes.indexOf(code);
    if (idx !== -1) {
      backupCodes.splice(idx, 1);
      await supabase.from('profiles').update({ two_factor_backup_codes: backupCodes }).eq('id', userId);
      return true;
    }

    return false;
  } catch (error) {
    logger.error('2FA verification failed', error, { userId });
    return false;
  }
}

export async function disable2FA(userId: string, code: string): Promise<boolean> {
  if (!isTwoFactorAvailable()) return false;
  if (!(await verify2FACode(userId, code))) return false;

  await supabase
    .from('profiles')
    .update({ two_factor_enabled: false, two_factor_secret: null, two_factor_backup_codes: null })
    .eq('id', userId);

  logger.info('2FA disabled', { userId });
  return true;
}

// ── TOTP helpers ─────────────────────────────────────────────────────────────

function generateTOTPSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

function generateQRCode(secret: string, userId: string): string {
  const issuer = 'Wasel';
  const label = `${issuer}:${userId}`;
  const url = `otpauth://totp/${encodeURIComponent(label)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}`;
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;
}

function generateBackupCodes(count: number): string[] {
  return Array.from({ length: count }, () => {
    const bytes = new Uint8Array(6);
    crypto.getRandomValues(bytes);
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase().slice(0, 8);
  });
}

async function verifyTOTPCode(secret: string, code: string): Promise<boolean> {
  const normalized = code.replace(/\s+/g, '');
  if (!/^\d{6}$/.test(normalized)) return false;

  const key = decodeBase32Secret(secret);
  const counter = Math.floor(Date.now() / 30000);

  for (let offset = -1; offset <= 1; offset++) {
    if ((await generateTOTPCode(key, counter + offset)) === normalized) return true;
  }
  return false;
}

function decodeBase32Secret(secret: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const normalized = secret.toUpperCase().replace(/=+$/, '');
  let bits = '';
  for (const char of normalized) {
    const value = alphabet.indexOf(char);
    if (value === -1) throw new Error('Invalid TOTP secret');
    bits += value.toString(2).padStart(5, '0');
  }
  const bytes: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.slice(i, i + 8), 2));
  }
  return new Uint8Array(bytes);
}

async function generateTOTPCode(secretKey: Uint8Array, counter: number): Promise<string> {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setUint32(0, Math.floor(counter / 0x100000000), false);
  view.setUint32(4, counter >>> 0, false);

  const cryptoKey = await crypto.subtle.importKey(
    'raw', secretKey.slice().buffer as ArrayBuffer,
    { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'],
  );
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', cryptoKey, buffer));
  const offset = sig[sig.length - 1] & 0x0f;
  const binary =
    ((sig[offset] & 0x7f) << 24) |
    ((sig[offset + 1] & 0xff) << 16) |
    ((sig[offset + 2] & 0xff) << 8) |
    (sig[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, '0');
}

// ── Security Headers for Netlify/Vercel ──────────────────────────────────────
export const SECURITY_HEADERS = `
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(self)
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  Content-Security-Policy: ${getCSPHeader()}
`;

// ── Input Sanitization ───────────────────────────────────────────────────────
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  return /^\+[1-9]\d{1,14}$/.test(phone);
}

export function validateURL(url: string): boolean {
  try { new URL(url); return true; } catch { return false; }
}

// ── Export ───────────────────────────────────────────────────────────────────
export const Security = {
  CSP_DIRECTIVES,
  getCSPHeader,
  checkRateLimit,
  resetRateLimit,
  checkPasswordStrength,
  getPasswordStrengthLabel,
  getPasswordStrengthColor,
  enable2FA,
  isTwoFactorAvailable,
  verify2FACode,
  disable2FA,
  sanitizeInput,
  validateEmail,
  validatePhone,
  validateURL,
};

export default Security;
