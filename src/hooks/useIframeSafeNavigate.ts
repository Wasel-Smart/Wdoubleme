/**
 * useIframeSafeNavigate — Production shim
 *
 * All iframe-specific logic has been removed.
 * This is now a transparent passthrough to React Router's standard useNavigate().
 *
 * All 50+ call sites across the codebase continue to work unchanged.
 * The function signature is identical to useNavigate().
 */

export { useNavigate as useIframeSafeNavigate, useNavigate } from 'react-router';

export { useNavigate as default } from 'react-router';

/** Kept for any code that imported the helper directly. Always returns false in production. */
export function isInsideIframe(): boolean {
  return false;
}
