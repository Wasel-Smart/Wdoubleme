/**
 * Keyboard Shortcuts Hook
 * Global keyboard shortcuts for power users
 */

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  cmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey : true;
        const cmdMatch = shortcut.cmd ? event.metaKey : true;
        const shiftMatch = shortcut.shift ? event.shiftKey : true;
        const altMatch = shortcut.alt ? event.altKey : true;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && cmdMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
          break;
        }
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);
}

// Predefined shortcuts
export const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: 'k',
    ctrl: true,
    cmd: true,
    description: 'Quick search',
    action: () => console.log('Open search'),
  },
  {
    key: 'b',
    ctrl: true,
    cmd: true,
    description: 'Book ride',
    action: () => { try { history.replaceState(null, '', '/app/book'); window.dispatchEvent(new PopStateEvent('popstate')); } catch { /* silently ignore */ } },
  },
  {
    key: 'm',
    ctrl: true,
    cmd: true,
    description: 'Messages',
    action: () => { try { history.replaceState(null, '', '/app/messages'); window.dispatchEvent(new PopStateEvent('popstate')); } catch { /* silently ignore */ } },
  },
  {
    key: 'h',
    ctrl: true,
    cmd: true,
    description: 'Home',
    action: () => { try { history.replaceState(null, '', '/app/dashboard'); window.dispatchEvent(new PopStateEvent('popstate')); } catch { /* silently ignore */ } },
  },
  {
    key: '/',
    ctrl: true,
    cmd: true,
    description: 'Help',
    action: () => { try { history.replaceState(null, '', '/app/help'); window.dispatchEvent(new PopStateEvent('popstate')); } catch { /* silently ignore */ } },
  },
  {
    key: 'Escape',
    description: 'Close modal',
    action: () => {
      const modal = document.querySelector('[role="dialog"]');
      if (modal) {
        const closeButton = modal.querySelector('[aria-label="Close"]');
        if (closeButton instanceof HTMLElement) {
          closeButton.click();
        }
      }
    },
  },
];