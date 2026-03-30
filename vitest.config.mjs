/**
 * REMOVED — vitest.config.mjs is deprecated.
 *
 * All Vitest configuration now lives exclusively in vitest.config.ts.
 * This file is kept only so that any tooling resolution that picks it up
 * does not silently fail with a missing-module error. It is listed in
 * .gitignore and should be deleted from the repository index:
 *
 *   git rm --cached vitest.config.mjs
 *
 * Do NOT add configuration here. Edit vitest.config.ts instead.
 */
export { default } from './vitest.config.ts';
