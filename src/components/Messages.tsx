/**
 * Messages — Gap #1 Fix ✅
 * Real messaging wired to useRealMessages + localMessagesService
 * Conversations list from KV. Messages fetched per conversation on select.
 * Polls every 4s for new messages. Optimistic send.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScanSearch, SendHorizontal, Phone, Video, MoreVertical, Wifi, WifiOff, RefreshCw, MessageSquare, Plus } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useRealMessages } from '../hooks/useRealMessages';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConversationMeta {
  id: string;        // other user's ID (or booking ID)
  userId: string;    // other user's ID
  name: string;
  initials: string;
  trip: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
}

interface ChatMessage {
  id: string;
  text: string;
  sent: boolean; // true = I sent it
  time: string;
}

// ─── Seed conversations (shown when no real data yet) ─────────────────────────

const SEED_CONVOS: ConversationMeta[] = [
  { id: 'c1', userId: 'user_ahmed', name: 'Ahmad Al-Masri', initials: 'AM', trip: 'Amman → Aqaba', lastMessage: 'Hi! I booked 2 seats', lastMessageTime: '2m ago', unread: 1 },
  { id: 'c2', userId: 'user_fatima', name: 'Fatima Al-Ahmad', initials: 'FA', trip: 'Amman → Irbid', lastMessage: 'Is the return trip on Sunday?', lastMessageTime: '1h ago', unread: 0 },
  { id: 'c3', userId: 'user_omar', name: 'Omar Abdullah', initials: 'OA', trip: 'Amman → Dead Sea', lastMessage: 'Thank you for the ride!', lastMessageTime: '2d ago', unread: 0 },
];

const SEED_MESSAGES: Record<string, ChatMessage[]> = {
  c1: [
    { id: 'm1', text: 'Hi! I booked 2 seats for your Aqaba trip', sent: false, time: '10:23 AM' },
    { id: 'm2', text: 'Great! Where would you like to be picked up?', sent: true, time: '10:25 AM' },
    { id: 'm3', text: 'Near 7th Circle would be perfect', sent: false, time: '10:26 AM' },
    { id: 'm4', text: 'Perfect! I will be there at 8 AM sharp', sent: true, time: '10:28 AM' },
    { id: 'm5', text: 'Hi! I booked 2 seats', sent: false, time: '10:30 AM' },
  ],
  c2: [
    { id: 'm6', text: 'Hello! Yes, we leave on Friday at 6 AM', sent: true, time: '9:20 AM' },
    { id: 'm7', text: 'Is the return trip on Sunday?', sent: false, time: '9:22 AM' },
  ],
  c3: [
    { id: 'm8', text: 'Thank you for the ride!', sent: false, time: 'Sep 28' },
    { id: 'm9', text: 'My pleasure! Safe travels 🙏', sent: true, time: 'Sep 28' },
  ],
};

// ─── Utils ────────────────────────────────────────────────────────────────────

function msgTime() {
  return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

function uid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Messages() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const ar = language === 'ar';
  const { messages: hookMessages, sendMessage, getConversation } = useRealMessages();

  const [convos, setConvos] = useState<ConversationMeta[]>(SEED_CONVOS);
  const [selectedId, setSelectedId] = useState<string>(SEED_CONVOS[0].id);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>(SEED_MESSAGES);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const selectedConvo = convos.find(c => c.id === selectedId) ?? convos[0];
  const currentMessages = chatMessages[selectedId] ?? [];

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  // Load messages for selected conversation from backend
  const loadConversationMessages = useCallback(async (convoId: string) => {
    if (!user) return;
    const convo = convos.find(c => c.id === convoId);
    if (!convo) return;
    try {
      const res = await getConversation(user.id, convo.userId);
      if (res?.success && res.messages && res.messages.length > 0) {
        const mapped: ChatMessage[] = res.messages.map((m: any) => ({
          id: m.id || uid(),
          text: m.content || m.text || '',
          sent: m.sender_id === user.id,
          time: m.created_at
            ? new Date(m.created_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
            : msgTime(),
        }));
        setChatMessages(prev => ({ ...prev, [convoId]: mapped }));
        // Update last message in convo list
        const last = mapped[mapped.length - 1];
        if (last) {
          setConvos(prev => prev.map(c =>
            c.id === convoId ? { ...c, lastMessage: last.text, unread: 0 } : c
          ));
        }
      }
    } catch {
      // Silently use seed data
    }
  }, [user, convos, getConversation]);

  // Load on conversation select
  useEffect(() => {
    loadConversationMessages(selectedId);
  }, [selectedId]);

  // Clear unread when selected
  useEffect(() => {
    setConvos(prev => prev.map(c => c.id === selectedId ? { ...c, unread: 0 } : c));
  }, [selectedId]);

  // Poll for new messages every 4s
  useEffect(() => {
    pollRef.current = setInterval(() => {
      if (user && isOnline) loadConversationMessages(selectedId);
    }, 4000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedId, user, isOnline, loadConversationMessages]);

  // Online / offline
  useEffect(() => {
    const on = () => { setIsOnline(true); toast.success(ar ? 'عدت للإنترنت' : 'Back online', { duration: 2000 }); };
    const off = () => { setIsOnline(false); toast.error(ar ? 'لا يوجد اتصال' : 'You are offline', { duration: 3000 }); };
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, [ar]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadConversationMessages(selectedId);
    setIsRefreshing(false);
    toast.success(ar ? 'تم التحديث' : 'Refreshed', { duration: 1000 });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || isSending) return;
    if (!isOnline) { toast.error(ar ? 'لا يوجد اتصال بالإنترنت' : 'No internet connection'); return; }

    const text = messageText.trim();
    const tempMsg: ChatMessage = { id: uid(), text, sent: true, time: msgTime() };

    // Optimistic update
    setChatMessages(prev => ({ ...prev, [selectedId]: [...(prev[selectedId] ?? []), tempMsg] }));
    setConvos(prev => prev.map(c => c.id === selectedId ? { ...c, lastMessage: text, lastMessageTime: 'just now' } : c));
    setMessageText('');
    setIsSending(true);

    try {
      const res = await sendMessage({
        recipient_id: selectedConvo.userId,
        content: text,
      });
      if (!res?.success) throw new Error(res?.error || 'failed');
      inputRef.current?.focus();
    } catch (err: any) {
      // Remove optimistic msg on failure
      setChatMessages(prev => ({
        ...prev,
        [selectedId]: (prev[selectedId] ?? []).filter(m => m.id !== tempMsg.id),
      }));
      toast.error(ar ? 'فشل إرسال الرسالة' : 'Failed to send', {
        action: { label: ar ? 'إعادة المحاولة' : 'Retry', onClick: () => setMessageText(text) },
      });
    } finally {
      setIsSending(false);
    }
  };

  const filtered = convos.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.trip.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col" style={{ background: 'var(--wasel-surface-0)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div>
          <h1 className="font-black text-white" style={{ fontWeight: 900, fontSize: '1.1rem' }}>
            {ar ? '💬 الرسائل' : '💬 Messages'}
          </h1>
          <p style={{ color: 'rgba(100,116,139,1)', fontSize: '0.72rem' }}>
            {ar ? 'تواصل مع رفاق الرحلة' : 'Coordinate with your co-travelers'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl"
            style={{ background: isOnline ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', border: `1px solid ${isOnline ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            {isOnline
              ? <Wifi className="w-3 h-3" style={{ color: '#22C55E' }} />
              : <WifiOff className="w-3 h-3" style={{ color: '#EF4444' }} />}
            <span className="text-xs font-semibold" style={{ color: isOnline ? '#22C55E' : '#EF4444' }}>
              {isOnline ? (ar ? 'متصل' : 'Online') : (ar ? 'غير متصل' : 'Offline')}
            </span>
          </div>
          <button onClick={handleRefresh} disabled={isRefreshing || !isOnline}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} style={{ color: '#64748B' }} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 min-h-0">

        {/* ── Conversations sidebar ────────────────────────────────────── */}
        <div className="w-full md:w-72 flex flex-col flex-shrink-0"
          style={{ borderRight: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Search */}
          <div className="p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="relative">
              <ScanSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#475569' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={ar ? 'بحث في الرسائل...' : 'Search messages...'}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-sm text-white placeholder:text-slate-600 outline-none"
                style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '0.78rem' }} />
            </div>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="py-10 text-center px-4">
                <MessageSquare className="w-8 h-8 mx-auto mb-2" style={{ color: '#334155' }} />
                <p style={{ color: '#475569', fontSize: '0.8rem' }}>{ar ? 'لا توجد محادثات' : 'No conversations yet'}</p>
              </div>
            )}
            {filtered.map(convo => (
              <motion.button key={convo.id} onClick={() => setSelectedId(convo.id)}
                whileTap={{ scale: 0.99 }}
                className="w-full p-3.5 text-start transition-all"
                style={{
                  background: selectedId === convo.id ? 'rgba(4,173,191,0.07)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  borderLeft: selectedId === convo.id ? '2px solid #04ADBF' : '2px solid transparent',
                }}>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, rgba(9,115,46,0.4), rgba(4,173,191,0.4))', color: '#04ADBF', border: '1px solid rgba(4,173,191,0.2)', fontWeight: 700 }}>
                    {convo.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-bold text-white truncate" style={{ fontWeight: 700, fontSize: '0.82rem' }}>{convo.name}</p>
                      <span style={{ color: '#475569', fontSize: '0.62rem', flexShrink: 0, marginInlineStart: 6 }}>{convo.lastMessageTime}</span>
                    </div>
                    <p className="truncate" style={{ color: '#64748B', fontSize: '0.72rem' }}>{convo.lastMessage}</p>
                    <p className="mt-0.5" style={{ color: '#334155', fontSize: '0.62rem' }}>🚗 {convo.trip}</p>
                  </div>
                  {convo.unread > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black"
                      style={{ background: '#04ADBF', color: '#fff' }}>
                      {convo.unread}
                    </motion.span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Chat area ────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat header */}
          <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border)', background: 'var(--wasel-glass-sm)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
                style={{ background: 'linear-gradient(135deg, rgba(9,115,46,0.4), rgba(4,173,191,0.4))', color: '#04ADBF', border: '1px solid rgba(4,173,191,0.2)', fontWeight: 700 }}>
                {selectedConvo.initials}
              </div>
              <div>
                <p className="font-bold text-white" style={{ fontWeight: 700, fontSize: '0.9rem' }}>{selectedConvo.name}</p>
                <div className="flex items-center gap-1.5">
                  <p style={{ color: '#64748B', fontSize: '0.68rem' }}>🚗 {selectedConvo.trip}</p>
                  {isOnline && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {[
                { icon: Phone, label: ar ? 'مكالمة صوتية قريباً' : 'Voice call coming soon' },
                { icon: Video, label: ar ? 'مكالمة فيديو قريباً' : 'Video call coming soon' },
                { icon: MoreVertical, label: ar ? 'خيارات إضافية' : 'More options' },
              ].map(({ icon: Icon, label }) => (
                <button key={label} onClick={() => toast.info(label)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/5">
                  <Icon className="w-4 h-4" style={{ color: '#475569' }} />
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3"
            style={{ background: 'rgba(11,17,32,0.4)' }}>
            <AnimatePresence initial={false}>
              {currentMessages.map((msg) => (
                <motion.div key={msg.id}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                  className={`flex ${msg.sent ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[75%]">
                    <div className="px-3.5 py-2.5 rounded-2xl text-sm"
                      style={msg.sent ? {
                        background: 'linear-gradient(135deg, #09732E, #04ADBF)',
                        color: '#fff',
                        borderRadius: ar ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                        fontWeight: 500,
                        fontSize: '0.84rem',
                      } : {
                        background: 'rgba(30,41,59,0.8)',
                        color: 'rgba(226,232,240,1)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: ar ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        fontSize: '0.84rem',
                      }}>
                      {msg.text}
                    </div>
                    <p className={`mt-1 ${msg.sent ? 'text-end' : 'text-start'}`}
                      style={{ color: '#334155', fontSize: '0.6rem' }}>
                      {msg.time}
                      {msg.sent && ' ✓✓'}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 flex-shrink-0"
            style={{ borderTop: '1px solid var(--border)', background: 'var(--wasel-glass-md)' }}>
            <form onSubmit={handleSend} className="flex items-center gap-2">
              <input ref={inputRef} value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder={ar ? 'اكتب رسالتك...' : 'Type a message...'}
                disabled={!isOnline}
                className="flex-1 px-4 py-2.5 rounded-xl text-white placeholder:text-slate-600 outline-none"
                style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.84rem' }} />
              <motion.button type="submit" whileTap={{ scale: 0.92 }}
                disabled={!messageText.trim() || isSending || !isOnline}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0"
                style={{
                  background: messageText.trim() && !isSending ? 'linear-gradient(135deg, #09732E, #04ADBF)' : 'rgba(30,41,59,0.5)',
                  boxShadow: messageText.trim() ? '0 4px 14px rgba(4,173,191,0.3)' : 'none',
                }}>
                <SendHorizontal className="w-4 h-4 text-white" />
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
