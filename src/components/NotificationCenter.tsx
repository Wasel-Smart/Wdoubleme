import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { useNotifications } from '../hooks/useNotifications';
import { useLanguage } from '../contexts/LanguageContext';
import { useIframeSafeNavigate } from '../hooks/useIframeSafeNavigate';
import {
  Bell,
  BellOff,
  Car,
  MessageSquare,
  CreditCard,
  Star,
  AlertTriangle,
  CheckCircle,
  Clock,
  Check,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function NotificationCenter() {
  const nav = useIframeSafeNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    connectionStatus,
    markAsRead,
    markAllAsRead,
    refresh,
  } = useNotifications();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const labels = {
    title: isRTL ? 'الإشعارات' : 'Notifications',
    new: isRTL ? 'جديد' : 'new',
    all: isRTL ? 'الكل' : 'All',
    unread: isRTL ? 'غير المقروءة' : 'Unread',
    online: isRTL ? 'متصل' : 'Online',
    offline: isRTL ? 'غير متصل' : 'Offline',
    syncing: isRTL ? 'مزامنة' : 'Syncing',
    markAllRead: isRTL ? 'تعيين الكل كمقروء' : 'Mark all read',
    view: isRTL ? 'عرض' : 'View',
    markRead: isRTL ? 'تعيين كمقروء' : 'Mark read',
    urgent: isRTL ? 'عاجل' : 'Urgent',
    high: isRTL ? 'مرتفع' : 'High',
    noNotifications: isRTL ? 'لا توجد إشعارات' : 'No notifications',
    caughtUp: isRTL ? 'أنت على اطلاع بكل شيء!' : "You're all caught up!",
    noItemsYet: isRTL ? 'ليس لديك أي إشعارات بعد' : "You don't have any notifications yet",
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'trip_request':
      case 'booking_request':
      case 'trip_accepted':
      case 'booking_accepted':
      case 'trip_rejected':
      case 'trip_cancelled':
      case 'driver_arrived':
      case 'trip_started':
      case 'trip_completed':
        return Car;
      case 'message':
      case 'new_message':
        return MessageSquare;
      case 'payment_received':
      case 'payment_sent':
      case 'wallet_topup':
        return CreditCard;
      case 'rating_reminder':
        return Star;
      case 'verification_approved':
      case 'verification_rejected':
        return CheckCircle;
      case 'safety_alert':
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'trip_accepted':
      case 'booking_accepted':
      case 'verification_approved':
      case 'payment_received':
      case 'wallet_topup':
        return 'text-green-600';
      case 'trip_rejected':
      case 'trip_cancelled':
      case 'verification_rejected':
        return 'text-red-600';
      case 'safety_alert':
        return 'text-amber-600';
      default:
        return 'text-primary';
    }
  };

  const filteredNotifications =
    filter === 'unread'
      ? notifications.filter((notification) => !notification.read)
      : notifications;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return isRTL ? 'الآن' : 'Just now';
    if (diffMins < 60) return isRTL ? `منذ ${diffMins} دقيقة` : `${diffMins}m ago`;
    if (diffHours < 24) return isRTL ? `منذ ${diffHours} ساعة` : `${diffHours}h ago`;
    if (diffDays < 7) return isRTL ? `منذ ${diffDays} يوم` : `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleOpenAction = async (url: string) => {
    if (url.startsWith('/')) {
      await nav(url);
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading && notifications.length === 0) {
    return (
      <div className="flex justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Bell className="size-6 text-primary" />
          <h1>{labels.title}</h1>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <Badge className="bg-accent text-accent-foreground">
                {unreadCount} {labels.new}
              </Badge>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {connectionStatus === 'online' && (
            <Badge variant="outline" className="gap-1">
              <Wifi className="size-3 text-green-600" />
              <span className="text-green-600">{labels.online}</span>
            </Badge>
          )}
          {connectionStatus === 'offline' && (
            <Badge variant="outline" className="gap-1 animate-pulse">
              <WifiOff className="size-3 text-red-600" />
              <span className="text-red-600">{labels.offline}</span>
            </Badge>
          )}
          {connectionStatus === 'syncing' && (
            <Badge variant="outline" className="gap-1">
              <RefreshCw className="size-3 animate-spin text-blue-600" />
              <span className="text-blue-600">{labels.syncing}</span>
            </Badge>
          )}

          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={markAllAsRead}
              className="gap-2"
            >
              <CheckCheck className="size-4" />
              {labels.markAllRead}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => refresh()}
            disabled={connectionStatus === 'offline'}
            aria-label={labels.syncing}
          >
            <RefreshCw className={`size-4 ${connectionStatus === 'syncing' ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
          className="gap-2"
        >
          {labels.all}
          <Badge variant="secondary" className="ml-1">{notifications.length}</Badge>
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          onClick={() => setFilter('unread')}
          className="gap-2"
        >
          {labels.unread}
          {unreadCount > 0 && (
            <Badge variant="secondary" className="ml-1">{unreadCount}</Badge>
          )}
        </Button>
      </div>

      <Card>
        <ScrollArea className="h-[600px]">
          {filteredNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-12 text-center"
            >
              <BellOff className="mx-auto mb-4 size-12 text-muted-foreground" />
              <h3 className="text-muted-foreground">{labels.noNotifications}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {filter === 'unread' ? labels.caughtUp : labels.noItemsYet}
              </p>
            </motion.div>
          ) : (
            <div className="divide-y">
              <AnimatePresence>
                {filteredNotifications.map((notification, index) => {
                  const Icon = getNotificationIcon(notification.type);
                  const iconColor = getNotificationColor(notification.type);

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                      className={`cursor-pointer p-4 transition-colors hover:bg-muted/50 ${
                        !notification.read ? 'border-l-4 border-l-primary bg-muted/30' : ''
                      }`}
                      whileHover={{ scale: 1.01 }}
                    >
                      <div className="flex gap-4">
                        <motion.div
                          className={`size-10 flex-shrink-0 rounded-full bg-muted flex items-center justify-center ${iconColor}`}
                          whileHover={{ rotate: 15 }}
                          transition={{ type: 'spring', stiffness: 300 }}
                        >
                          <Icon className="size-5" />
                        </motion.div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-start justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-semibold">{notification.title}</p>
                              {!notification.read && (
                                <motion.div
                                  className="size-2 rounded-full bg-primary"
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                />
                              )}
                              {notification.priority === 'urgent' && (
                                <Badge variant="destructive" className="text-xs">{labels.urgent}</Badge>
                              )}
                              {notification.priority === 'high' && (
                                <Badge variant="outline" className="border-orange-500 text-xs text-orange-600">
                                  {labels.high}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <p className="mb-2 text-sm text-muted-foreground">
                            {notification.message}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="size-3" />
                              {formatTime(notification.created_at)}
                            </div>

                            <div className="flex items-center gap-2">
                              {notification.action_url && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleOpenAction(notification.action_url!)}
                                >
                                  {labels.view}
                                </Button>
                              )}
                              {!notification.read && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => markAsRead(notification.id)}
                                >
                                  <Check className="mr-1 size-4" />
                                  {labels.markRead}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </Card>
    </div>
  );
}
