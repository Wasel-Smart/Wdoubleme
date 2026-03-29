/**
 * Feature: Profile
 * Barrel exports for the profile feature module.
 */
export { UserProfile } from './UserProfile';
export { UserProfile as EnhancedUserProfile } from './UserProfile';

export { Settings } from '../../components/Settings';
export { Favorites } from '../../components/Favorites';
export { Messages } from '../../components/Messages';
export { DataExport } from '../../components/DataExport';
export { NotificationCenter } from '../../components/NotificationCenter';

// ─── NEW: PRIVACY FEATURES ────────────────────────────────────────────────────
export { PrivacySettings } from './PrivacySettings';