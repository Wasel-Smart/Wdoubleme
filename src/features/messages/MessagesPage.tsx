/**
 * MessagesPage - In-app messaging
 * Chat with drivers and passengers
 */

import { useState } from 'react';
import { motion } from 'motion/react';
import {
  MessageCircle, Send, Search, Phone, MoreVertical,
  CheckCheck, Clock, Image, Paperclip, Smile,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { WaselColors } from '../../styles/wasel-design-system';

const C = WaselColors;

interface Message {
  id: string;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
  read: boolean;
}

interface Chat {
  id: string;
  name: string;
  nameAr: string;
  avatar: string;
  lastMessage: string;
  lastMessageAr: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

const MOCK_CHATS: Chat[] = [
  {
    id: '1',
    name: 'Ahmad - Driver',
    nameAr: 'أحمد - سائق',
    avatar: '👨',
    lastMessage: 'I will arrive in 5 minutes',
    lastMessageAr: 'سأصل خلال 5 دقائق',
    timestamp: '2 min ago',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    name: 'Sara - Passenger',
    nameAr: 'سارة - راكبة',
    avatar: '👩',
    lastMessage: 'Thank you for the ride!',
    lastMessageAr: 'شكراً على الرحلة!',
    timestamp: '1 hour ago',
    unread: 0,
    online: false,
  },
  {
    id: '3',
    name: 'Khalid - Driver',
    nameAr: 'خالد - سائق',
    avatar: '👨‍💼',
    lastMessage: 'Package delivered successfully',
    lastMessageAr: 'تم توصيل الطرد بنجاح',
    timestamp: '2 hours ago',
    unread: 0,
    online: true,
  },
];

const MOCK_MESSAGES: Message[] = [
  {
    id: '1',
    text: 'Hi! I booked a seat for tomorrow',
    sender: 'me',
    timestamp: '10:30 AM',
    read: true,
  },
  {
    id: '2',
    text: 'Great! Looking forward to it',
    sender: 'them',
    timestamp: '10:32 AM',
    read: true,
  },
  {
    id: '3',
    text: 'What time should I be ready?',
    sender: 'me',
    timestamp: '10:35 AM',
    read: true,
  },
  {
    id: '4',
    text: 'I will pick you up at 8:00 AM',
    sender: 'them',
    timestamp: '10:36 AM',
    read: true,
  },
  {
    id: '5',
    text: 'Perfect, see you tomorrow!',
    sender: 'me',
    timestamp: '10:37 AM',
    read: true,
  },
];

export function MessagesPage() {
  const { language, dir } = useLanguage();
  const isAr = language === 'ar';

  const [chats] = useState<Chat[]>(MOCK_CHATS);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(MOCK_CHATS[0]);
  const [messages] = useState<Message[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.nameAr.includes(searchQuery)
  );

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // In production, send message via API
    alert(isAr ? `رسالة: ${newMessage}` : `Message: ${newMessage}`);
    setNewMessage('');
  };

  return (
    <div
      className="h-screen flex"
      style={{ background: C.bg }}
      dir={dir}
    >
      {/* Chats List */}
      <div
        className="w-full md:w-96 flex flex-col border-r"
        style={{ borderColor: 'rgba(255,255,255,0.1)' }}
      >
        {/* Header */}
        <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <MessageCircle className="w-6 h-6" style={{ color: C.cyan }} />
            {isAr ? 'الرسائل' : 'Messages'}
          </h1>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث في الرسائل...' : 'Search messages...'}
              className="w-full pl-10 pr-4 py-2 rounded-xl text-white placeholder:text-slate-500 text-sm"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            />
          </div>
        </div>

        {/* Chats */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <motion.div
              key={chat.id}
              whileHover={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 cursor-pointer border-b ${
                selectedChat?.id === chat.id ? 'bg-white/5' : ''
              }`}
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="text-4xl">{chat.avatar}</div>
                  {chat.online && (
                    <div
                      className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                      style={{
                        background: C.green,
                        borderColor: C.bg,
                      }}
                    />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-white truncate">
                      {isAr ? chat.nameAr : chat.name}
                    </h3>
                    <span className="text-xs text-slate-500 ml-2">
                      {chat.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400 truncate">
                      {isAr ? chat.lastMessageAr : chat.lastMessage}
                    </p>
                    {chat.unread > 0 && (
                      <div
                        className="ml-2 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: C.cyan }}
                      >
                        {chat.unread}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Chat View */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div
            className="p-4 flex items-center justify-between border-b"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="text-4xl">{selectedChat.avatar}</div>
                {selectedChat.online && (
                  <div
                    className="absolute bottom-0 right-0 w-3 h-3 rounded-full border-2"
                    style={{
                      background: C.green,
                      borderColor: C.bg,
                    }}
                  />
                )}
              </div>
              <div>
                <h2 className="font-bold text-white">
                  {isAr ? selectedChat.nameAr : selectedChat.name}
                </h2>
                <p className="text-xs text-slate-400">
                  {selectedChat.online
                    ? (isAr ? 'متصل' : 'Online')
                    : (isAr ? 'غير متصل' : 'Offline')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <Phone className="w-5 h-5 text-slate-400" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <MoreVertical className="w-5 h-5 text-slate-400" />
              </motion.button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md px-4 py-2 rounded-2xl ${
                    message.sender === 'me'
                      ? 'rounded-tr-sm'
                      : 'rounded-tl-sm'
                  }`}
                  style={{
                    background:
                      message.sender === 'me'
                        ? C.cyan
                        : 'rgba(255,255,255,0.05)',
                  }}
                >
                  <p className={`text-sm ${message.sender === 'me' ? 'text-white' : 'text-slate-200'}`}>
                    {message.text}
                  </p>
                  <div
                    className={`flex items-center justify-end gap-1 mt-1 text-xs ${
                      message.sender === 'me' ? 'text-white/70' : 'text-slate-500'
                    }`}
                  >
                    <span>{message.timestamp}</span>
                    {message.sender === 'me' && (
                      message.read ? (
                        <CheckCheck className="w-3 h-3" />
                      ) : (
                        <Clock className="w-3 h-3" />
                      )
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div
            className="p-4 border-t"
            style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          >
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <Paperclip className="w-5 h-5 text-slate-400" />
              </motion.button>

              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={isAr ? 'اكتب رسالة...' : 'Type a message...'}
                className="flex-1 px-4 py-3 rounded-xl text-white placeholder:text-slate-500"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <Smile className="w-5 h-5 text-slate-400" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-3 rounded-xl"
                style={{
                  background: newMessage.trim() ? C.cyan : 'rgba(255,255,255,0.05)',
                  opacity: newMessage.trim() ? 1 : 0.5,
                }}
              >
                <Send className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-600" />
            <h3 className="text-xl font-bold text-white mb-2">
              {isAr ? 'اختر محادثة' : 'Select a Chat'}
            </h3>
            <p className="text-slate-400">
              {isAr
                ? 'اختر محادثة من القائمة للبدء بالمحادثة'
                : 'Select a chat from the list to start messaging'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
