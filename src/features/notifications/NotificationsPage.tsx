/**
 * NotificationsPage - Full notification center
 * Shows all user notifications with real-time updates
 */

import { NotificationCenter } from '../../components/NotificationCenter';
import { useLanguage } from '../../contexts/LanguageContext';
import { WaselColors } from '../../styles/wasel-design-system';

const C = WaselColors;

export function NotificationsPage() {
  const { dir } = useLanguage();
  
  return (
    <div
      className="min-h-screen px-4 py-8"
      style={{ background: C.bg }}
      dir={dir}
    >
      <div className="max-w-4xl mx-auto">
        <NotificationCenter />
      </div>
    </div>
  );
}
