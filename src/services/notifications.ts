import { API_URL, fetchWithRetry, getAuthDetails } from './core';
import {
  createDirectNotification,
  getDirectNotifications,
  markDirectNotificationAsRead,
} from './directSupabase';

const LOCAL_NOTIFICATION_KEY = 'wasel-local-notifications';

type StoredNotification = {
  id: string;
  title: string;
  message: string;
  type: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  action_url?: string;
  user_id: string;
  is_read?: boolean;
  read?: boolean;
  created_at: string;
  source?: 'local' | 'server';
};

function canUseEdgeApi(): boolean {
  return Boolean(API_URL);
}

function readLocalNotifications(): StoredNotification[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(LOCAL_NOTIFICATION_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocalNotifications(items: StoredNotification[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_NOTIFICATION_KEY, JSON.stringify(items.slice(0, 100)));
}

function normalizeNotification(item: StoredNotification): StoredNotification {
  return {
    ...item,
    read: typeof item.read === 'boolean' ? item.read : Boolean(item.is_read),
    is_read: typeof item.is_read === 'boolean' ? item.is_read : Boolean(item.read),
    priority: item.priority ?? 'medium',
  };
}

function sortNotifications(items: StoredNotification[]): StoredNotification[] {
  return [...items].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

function mergeNotifications(
  localNotifications: StoredNotification[],
  serverNotifications: StoredNotification[],
): StoredNotification[] {
  const merged = new Map<string, StoredNotification>();

  for (const item of [...serverNotifications, ...localNotifications]) {
    const normalized = normalizeNotification(item);
    const existing = merged.get(normalized.id);

    if (!existing) {
      merged.set(normalized.id, normalized);
      continue;
    }

    merged.set(normalized.id, {
      ...existing,
      ...normalized,
      read: existing.read || normalized.read,
      is_read: existing.is_read || normalized.is_read,
    });
  }

  return sortNotifications(Array.from(merged.values()));
}

function markLocalNotificationAsRead(notificationId: string): void {
  const localNotifications = readLocalNotifications();
  writeLocalNotifications(
    localNotifications.map((item) => (
      item.id === notificationId
        ? { ...item, is_read: true, read: true }
        : item
    )),
  );
}

export const notificationsAPI = {
  async getNotifications() {
    const localNotifications = readLocalNotifications();
    let token: string | null = null;
    let userId: string | null = null;

    try {
      const auth = await getAuthDetails();
      token = auth.token;
      userId = auth.userId;
    } catch {
      return { notifications: sortNotifications(localNotifications.map(normalizeNotification)) };
    }

    if (!token || !userId) {
      return { notifications: sortNotifications(localNotifications.map(normalizeNotification)) };
    }

    if (!canUseEdgeApi()) {
      try {
        const serverNotifications = await getDirectNotifications(userId);
        return {
          notifications: mergeNotifications(localNotifications, serverNotifications as StoredNotification[]),
        };
      } catch {
        return { notifications: sortNotifications(localNotifications.map(normalizeNotification)) };
      }
    }

    try {
      const response = await fetchWithRetry(
        `${API_URL}/notifications`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }

      const data = await response.json();
      const serverNotifications = Array.isArray(data?.notifications) ? data.notifications : [];
      return {
        notifications: mergeNotifications(localNotifications, serverNotifications),
      };
    } catch {
      try {
        const serverNotifications = await getDirectNotifications(userId);
        return {
          notifications: mergeNotifications(localNotifications, serverNotifications as StoredNotification[]),
        };
      } catch {
        return { notifications: sortNotifications(localNotifications.map(normalizeNotification)) };
      }
    }
  },

  async markAsRead(notificationId: string) {
    markLocalNotificationAsRead(notificationId);

    let token: string | null = null;
    let userId: string | null = null;
    try {
      const auth = await getAuthDetails();
      token = auth.token;
      userId = auth.userId;
    } catch {
      return { success: true, source: 'local' };
    }

    if (!token || !userId) return { success: true, source: 'local' };

    if (!canUseEdgeApi()) {
      try {
        await markDirectNotificationAsRead(notificationId, userId);
        return { success: true, source: 'server' };
      } catch {
        return { success: false, source: 'server' };
      }
    }

    try {
      const response = await fetchWithRetry(
        `${API_URL}/notifications/${notificationId}/read`,
        {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) return { success: false, source: 'server' };
      return await response.json();
    } catch {
      try {
        await markDirectNotificationAsRead(notificationId, userId);
        return { success: true, source: 'server' };
      } catch {
        return { success: false, source: 'server' };
      }
    }
  },

  async createNotification(data: {
    title: string;
    message: string;
    type: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    action_url?: string;
  }) {
    const localNotifications = readLocalNotifications();
    let token: string | null = null;
    let userId: string | null = null;

    try {
      const auth = await getAuthDetails();
      token = auth.token;
      userId = auth.userId;
    } catch {
      writeLocalNotifications(sortNotifications([{
        id: `local-${Date.now()}`,
        title: data.title,
        message: data.message,
        type: data.type,
        priority: data.priority ?? 'medium',
        action_url: data.action_url,
        user_id: 'local',
        is_read: false,
        read: false,
        created_at: new Date().toISOString(),
        source: 'local',
      }, ...localNotifications]));
      return { success: true, source: 'local' };
    }

    const localDraft: StoredNotification = {
      id: `local-${Date.now()}`,
      title: data.title,
      message: data.message,
      type: data.type,
      priority: data.priority ?? 'medium',
      action_url: data.action_url,
      user_id: userId ?? 'local',
      is_read: false,
      read: false,
      created_at: new Date().toISOString(),
      source: 'local',
    };

    if (!token || !userId) {
      writeLocalNotifications(sortNotifications([localDraft, ...localNotifications]));
      return { success: true, source: 'local' };
    }

    if (!canUseEdgeApi()) {
      try {
        const created = await createDirectNotification({
          userId,
          title: data.title,
          message: data.message,
          type: data.type,
          priority: data.priority,
          action_url: data.action_url,
        });

        writeLocalNotifications(sortNotifications([
          {
            ...localDraft,
            id: String(created?.id ?? localDraft.id),
            source: 'server',
          },
          ...localNotifications,
        ]));

        return { success: true, source: 'server' };
      } catch {
        writeLocalNotifications(sortNotifications([localDraft, ...localNotifications]));
        return { success: false, source: 'local' };
      }
    }

    try {
      const response = await fetchWithRetry(
        `${API_URL}/notifications/send-push`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId, ...data, body: data.message }),
        },
      );

      if (!response.ok) {
        writeLocalNotifications(sortNotifications([localDraft, ...localNotifications]));
        return { success: false, source: 'local' };
      }

      const server = await response.json().catch(() => ({}));
      writeLocalNotifications(sortNotifications([
        {
          ...localDraft,
          id: String(server?.notification?.id ?? localDraft.id),
          source: 'server',
        },
        ...localNotifications,
      ]));

      return { success: true, source: 'server' };
    } catch {
      try {
        const created = await createDirectNotification({
          userId,
          title: data.title,
          message: data.message,
          type: data.type,
          priority: data.priority,
          action_url: data.action_url,
        });

        writeLocalNotifications(sortNotifications([
          {
            ...localDraft,
            id: String(created?.id ?? localDraft.id),
            source: 'server',
          },
          ...localNotifications,
        ]));

        return { success: true, source: 'server' };
      } catch {
        writeLocalNotifications(sortNotifications([localDraft, ...localNotifications]));
        return { success: false, source: 'local' };
      }
    }
  },
};
