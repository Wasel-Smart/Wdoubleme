/**
 * Live Chat Component
 * Real-time messaging interface for driver-passenger communication
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  MapPin, 
  Phone, 
  X,
} from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { liveChatService } from '../services/liveChat';
import type { ChatMessage } from '../services/liveChat';
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
  currentUserId,
  onClose,
}: LiveChatProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize chat
  useEffect(() => {
    let mounted = true;
    let unsubscribeMessages = () => {};
    let unsubscribeTyping = () => {};

    const init = async () => {
      try {
        // Load message history
        const history = await liveChatService.getChatHistory(tripId);
        if (mounted) {
          setMessages(history);
          setIsConnected(true);
        }

        unsubscribeMessages = liveChatService.subscribeToMessages(tripId, (message) => {
          if (!mounted) return;
          setMessages((prev) => [...prev, message]);

          if (message.sender_id === recipientId) {
            void liveChatService.markAsRead(tripId, currentUserId);
          }
        });

        unsubscribeTyping = liveChatService.subscribeToTyping(tripId, (typing, userId) => {
          if (mounted && userId === recipientId) {
            setIsTyping(typing);
          }
        });
      } catch (error) {
        console.error('[LiveChat] Initialization error:', error);
        toast.error(t('chat.connection_error'));
      }
    };

    init();

    // Cleanup
    return () => {
      mounted = false;
      unsubscribeMessages();
      unsubscribeTyping();
    };
  }, [tripId, currentUserId, recipientId, t]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);

    // Send typing indicator
    void liveChatService.sendTypingIndicator(tripId, currentUserId, true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 2 seconds
    typingTimeoutRef.current = setTimeout(() => {
      void liveChatService.sendTypingIndicator(tripId, currentUserId, false);
    }, 2000);
  }, [tripId, currentUserId]);

  // Send message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isSending) return;

    setIsSending(true);

    try {
      const message = await liveChatService.sendMessage(
        tripId,
        currentUserId,
        recipientId,
        inputValue.trim()
      );

      if (!message) {
        throw new Error('Message was not created');
      }

      setMessages((prev) => [...prev, message]);
      setInputValue('');
      void liveChatService.sendTypingIndicator(tripId, currentUserId, false);
      
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
  }, [currentUserId, inputValue, tripId, recipientId, isSending, t]);

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
            currentUserId,
            recipientId,
            {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }
          );
          if (!message) {
            throw new Error('Location message was not created');
          }
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
  }, [currentUserId, tripId, recipientId, t]);

  // Format timestamp
  const formatTime = (timestamp: string) => {
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
                    {message.message_type === 'text' && (
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {message.message}
                      </p>
                    )}
                    
                    {message.message_type === 'image' && message.media_url && (
                      <div className="space-y-2">
                        <img
                          src={message.media_url}
                          alt="Shared image"
                          className="rounded-lg max-w-full"
                        />
                        {message.message !== '[Image]' && (
                          <p className="text-sm">{message.message}</p>
                        )}
                      </div>
                    )}
                    
                    {message.message_type === 'location' && message.location && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4" />
                          <span>{t('chat.location_shared')}</span>
                        </div>
                        <a
                          href={`https://www.google.com/maps?q=${message.location.lat},${message.location.lng}`}
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
                      {formatTime(message.created_at)}
                    </span>
                    {isOwn && message.is_read && (
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
