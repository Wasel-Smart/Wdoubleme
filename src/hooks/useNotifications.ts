import { useEffect, useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '../services/notifications';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  action_url?: string;
}

type RawNotification = Notification & {
  is_read?: boolean;
};

function normalizeNotification(item: RawNotification): Notification {
  return {
    ...item,
    read: typeof item.read === 'boolean' ? item.read : Boolean(item.is_read),
    priority: item.priority ?? 'medium',
  };
}

export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(() => (
    typeof navigator === 'undefined' ? true : navigator.onLine
  ));

  const {
    data: notifications = [],
    isLoading: loading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];

      try {
        const response = await notificationsAPI.getNotifications();
        const items = Array.isArray(response.notifications) ? response.notifications : [];
        return items.map((item: RawNotification) => normalizeNotification(item));
      } catch {
        return [];
      }
    },
    enabled: !!user,
    staleTime: 30 * 1000,
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: false,
    retry: false,
  });

  const unreadCount = notifications.filter((n: Notification) => !n.read).length;
  const connectionStatus: 'online' | 'offline' | 'syncing' =
    !isOnline ? 'offline' : isFetching ? 'syncing' : 'online';

  useEffect(() => {
    if (!user) return;
    // Notifications polling active
  }, [user]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      queryClient.setQueryData(['notifications', user?.id], (old: Notification[] = []) => {
        return old.map((n) => (n.id === notificationId ? { ...n, read: true } : n));
      });

      await notificationsAPI.markAsRead(notificationId);
    } catch (err) {
      console.error('Failed to mark as read:', err);
      toast.error('Failed to update notification');
      refetch();
    }
  }, [user?.id, queryClient, refetch]);

  const markAllAsRead = useCallback(async () => {
    try {
      const unread = notifications.filter((n: Notification) => !n.read);
      if (unread.length === 0) return;

      queryClient.setQueryData(['notifications', user?.id], (old: Notification[] = []) => {
        return old.map((n) => ({ ...n, read: true }));
      });

      await Promise.all(unread.map((n: Notification) => notificationsAPI.markAsRead(n.id)));
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      refetch();
    }
  }, [notifications, user?.id, queryClient, refetch]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    queryClient.setQueryData(['notifications', user?.id], (old: Notification[] = []) => {
      return old.filter((n) => n.id !== notificationId);
    });
    toast.success('Notification removed');
  }, [user?.id, queryClient]);

  const createNotification = useCallback(async (data: any) => {
    if (!user) return;

    try {
      await notificationsAPI.createNotification(data);
      queryClient.invalidateQueries({ queryKey: ['notifications', user.id] });
    } catch (e) {
      console.error(e);
      toast.error('Failed to send notification');
    }
  }, [user, queryClient]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    createNotification,
    refresh: () => refetch(),
    connectionStatus,
  };
}
