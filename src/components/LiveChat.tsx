/**
 * Live Chat Component
 * Real-time messaging interface for driver-passenger communication
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Image as ImageIcon, 
  MapPin, 
  Phone, 
  X,
  MoreVertical,
  Paperclip
} from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { liveChatService, ChatMessage } from '../services/liveChat';
import { useTranslation } from './hooks/useTranslation';
import { toast } from 'sonner';

interface LiveChatProps {
  tripId: string;
  recipientId: string;
  recipientName: string;
  recipientAvatar?: string;
  recipientType: 'driver' | 'passenger';
  currentUserId: string;
  currentUserType: 'driver' | 'passenger';
  onClose?: () => void;
}

export function LiveChat({
  tripId,
  recipientId,
  recipientName,
  recipientAvatar,
  recipientType,
  currentUserId,
  currentUserType,
  onClose,
}: LiveChatProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize chat
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        // Initialize chat service
        await liveChatService.initialize(currentUserId, currentUserType);
        
        // Join trip room
        await liveChatService.joinTrip(tripId);
        
        // Load message history
        const history = await liveChatService.getMessageHistory(tripId);
        if (mounted) {
          setMessages(history);
          setIsConnected(true);
        }
      } catch (error) {
        console.error('[LiveChat] Initialization error:', error);
        toast.error(t('chat.connection_error'));
      }
    };

    init();

    // Subscribe to events
    const unsubMessage = liveChatService.on('message', (message: ChatMessage) => {
      if (message.trip_id === tripId && mounted) {
        setMessages((prev) => [...prev, message]);
        
        // Mark as read if it's from recipient
        if (message.sender_id === recipientId) {
          liveChatService.markAsRead(message.id);
        }
      }
    });

    const unsubTyping = liveChatService.on('typing', (indicator: any) => {
      if (indicator.trip_id === tripId && indicator.user_id === recipientId && mounted) {
        setIsTyping(indicator.is_typing);
      }
    });

    const unsubConnection = liveChatService.on('connection', (data: any) => {
      if (mounted) {
        setIsConnected(data.status === 'connected');
      }
    });

    // Cleanup
    return () => {
      mounted = false;
      unsubMessage();
      unsubTyping();
      unsubConnection();
      liveChatService.leaveTrip(tripId);
    };
  }, [tripId, currentUserId, currentUserType, recipientId, t]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    // Send typing indicator
    liveChatService.sendTyping(tripId, true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      liveChatService.sendTyping(tripId, false);
    }, 2000);
  }, [tripId]);

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isSending) return;

    setIsSending(true);

    try {
      const message = await liveChatService.sendMessage(
        tripId,
        inputValue.trim(),
        recipientId
      );

      setMessages((prev) => [...prev, message]);
      setInputValue('');
      liveChatService.sendTyping(tripId, false);
      
      // Clear typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('[LiveChat] Send error:', error);
      toast.error(t('chat.send_error'));
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  }, [inputValue, tripId, recipientId, isSending, t]);

  // Handle key press
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Send location
  const handleSendLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error(t('chat.location_not_supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const message = await liveChatService.sendLocation(
            tripId,
            {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            },
            recipientId
          );
          setMessages((prev) => [...prev, message]);
          toast.success(t('chat.location_sent'));
        } catch (error) {
          console.error('[LiveChat] Location send error:', error);
          toast.error(t('chat.send_error'));
        }
      },
      (error) => {
        console.error('[LiveChat] Geolocation error:', error);
        toast.error(t('chat.location_error'));
      }
    );
  }, [tripId, recipientId, t]);

  // Format timestamp
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={recipientAvatar} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {recipientName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-foreground dark:text-white">
                {recipientName}
              </h3>
              <div className="flex items-center gap-2">
                <Badge variant={isConnected ? 'default' : 'secondary'} className="text-xs">
                  {isConnected ? t('chat.online') : t('chat.offline')}
                </Badge>
                {isTyping && (
                  <span className="text-xs text-gray-500">{t('chat.typing')}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={() => window.open(`tel:${recipientId}`)}>
              <Phone className="h-5 w-5" />
            </Button>
            {onClose && (
              <Button size="icon" variant="ghost" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {messages.map((message) => {
            const isOwn = message.sender_id === currentUserId;
            
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isOwn
                        ? 'bg-primary text-white rounded-br-none'
                        : 'bg-card dark:bg-card text-foreground dark:text-white rounded-bl-none'
                    }`}
                  >
                    {message.type === 'text' && (
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.message}
                      </p>
                    )}
                    
                    {message.type === 'image' && message.metadata?.image_url && (
                      <div className="space-y-2">
                        <img
                          src={message.metadata.image_url}
                          alt="Shared image"
                          className="rounded-lg max-w-full"
                        />
                        {message.message !== '[Image]' && (
                          <p className="text-sm">{message.message}</p>
                        )}
                      </div>
                    )}
                    
                    {message.type === 'location' && message.metadata?.location && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4" />
                          <span>{t('chat.location_shared')}</span>
                        </div>
                        <a
                          href={`https://www.google.com/maps?q=${message.metadata.location.lat},${message.metadata.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs underline"
                        >
                          {t('chat.view_on_map')}
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div className={`flex items-center gap-1 mt-1 px-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-gray-500">
                      {formatTime(message.timestamp)}
                    </span>
                    {isOwn && message.read && (
                      <span className="text-xs text-green-600">{t('chat.read')}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSendLocation}
            disabled={!isConnected}
          >
            <MapPin className="h-5 w-5" />
          </Button>

          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={t('chat.type_message')}
              disabled={!isConnected || isSending}
              className="w-full px-4 py-2 pr-10 bg-muted dark:bg-muted rounded-full text-foreground dark:text-white placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !isConnected || isSending}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}